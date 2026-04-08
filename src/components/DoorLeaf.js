import * as THREE from 'three';
import { BaseComponent } from './BaseComponent.js';

// 层门组件（双开门扇）- 静态展示
export class DoorLeaf extends BaseComponent {
    constructor(scene, materialLibrary) {
        super(scene, '层门', 'doorLeaf');
        this.materialLibrary = materialLibrary;

        // 型号配置
        this.models = {
            standard: {
                name: '标准型',
                width: 1.25,       // 与小门套内宽完全贴合
                height: 2.40,      // 高度略低于小门套
                doorWidth: 0.622,  // 单扇门宽度，左右无间隙
                doorHeight: 2.40,
                thickness: 0.04,
                gap: 0.006          // 很小的中间间隙
            }
        };

        this.currentModel = 'standard';
        this.currentMaterial = 'st-hairline';

        // 门扇组
        this.leftDoor = null;
        this.rightDoor = null;
        this.leftDoorGroup = null;
        this.rightDoorGroup = null;
        this.meshes = [];
    }

    create() {
        this.createDoors();
        return this;
    }

    createDoors() {
        // 清除旧门扇
        this.disposeMeshes();
        if (this.leftDoorGroup) {
            this.scene.remove(this.leftDoorGroup);
        }
        if (this.rightDoorGroup) {
            this.scene.remove(this.rightDoorGroup);
        }
        this.meshes = [];

        const model = this.models[this.currentModel];
        const material = this.materialLibrary.get(this.currentMaterial);
        if (!material) {
            console.warn(`[DoorLeaf] 材质 ${this.currentMaterial} 不存在`);
            return;
        }

        // 左门扇组
        this.leftDoorGroup = new THREE.Group();
        this.leftDoorGroup.name = 'LeftDoor';

        // 左门板
        const leftGeo = new THREE.BoxGeometry(model.doorWidth, model.doorHeight, model.thickness);
        this.leftDoor = new THREE.Mesh(leftGeo, material.clone());
        this.leftDoor.position.set(-model.doorWidth / 2, 0, 0);
        this.leftDoor.userData.componentRef = this;
        this.leftDoor.userData.isLeft = true;
        this.meshes.push(this.leftDoor);
        this.leftDoorGroup.add(this.leftDoor);

        // 左门装饰线（竖条）
        const decoGeo = new THREE.BoxGeometry(0.02, model.doorHeight * 0.8, 0.002);
        const leftDeco = new THREE.Mesh(decoGeo, material.clone());
        leftDeco.position.set(-0.1, 0, model.thickness / 2 + 0.001);
        this.leftDoor.add(leftDeco);

        // 右门扇组
        this.rightDoorGroup = new THREE.Group();
        this.rightDoorGroup.name = 'RightDoor';

        // 右门板
        const rightGeo = new THREE.BoxGeometry(model.doorWidth, model.doorHeight, model.thickness);
        this.rightDoor = new THREE.Mesh(rightGeo, material.clone());
        this.rightDoor.position.set(model.doorWidth / 2, 0, 0);
        this.rightDoor.userData.componentRef = this;
        this.rightDoor.userData.isRight = true;
        this.meshes.push(this.rightDoor);
        this.rightDoorGroup.add(this.rightDoor);

        // 右门装饰线
        const rightDeco = new THREE.Mesh(decoGeo, material.clone());
        rightDeco.position.set(0.1, 0, model.thickness / 2 + 0.001);
        this.rightDoor.add(rightDeco);

        // 设置位置（关闭状态）
        const halfGap = model.gap / 2;
        this.leftDoorGroup.position.set(-halfGap, -0.025, 0);
        this.rightDoorGroup.position.set(halfGap, -0.025, 0);

        // 设置位置 - 层门在小门套内，稍微靠后
        const doorZ = 0.06;
        this.leftDoorGroup.position.set(-halfGap, -0.025, doorZ);
        this.rightDoorGroup.position.set(halfGap, -0.025, doorZ);

        // 添加到场景
        this.scene.add(this.leftDoorGroup);
        this.scene.add(this.rightDoorGroup);
    }

    // 切换型号
    setModel(modelKey) {
        if (!this.models[modelKey]) {
            console.warn(`[DoorLeaf] 型号 ${modelKey} 不存在`);
            return;
        }
        this.currentModel = modelKey;
        this.createDoors();
        this.dispatchEvent({ type: 'modelChanged', model: modelKey });
    }

    // 应用材质（覆盖父类）
    applyMaterial(materialKey) {
        if (!this.materialLibrary.has(materialKey)) {
            console.warn(`[DoorLeaf] 材质 ${materialKey} 不存在`);
            return;
        }
        this.currentMaterial = materialKey;
        this.createDoors();
        this.dispatchEvent({ type: 'materialChanged', material: materialKey });
    }

    // 获取可配置项
    getConfigurableOptions() {
        return ['model', 'material'];
    }

    // 获取型号列表
    getModelOptions() {
        return Object.keys(this.models).map(key => ({
            key,
            name: this.models[key].name
        }));
    }

    // 获取当前配置
    getConfig() {
        return {
            name: this.name,
            configKey: this.configKey,
            model: this.currentModel,
            material: this.currentMaterial
        };
    }

    // 清理网格资源
    disposeMeshes() {
        this.meshes.forEach(mesh => {
            if (mesh.geometry) mesh.geometry.dispose();
            if (mesh.material) mesh.material.dispose();
        });
        this.meshes = [];
    }

    // 销毁
    dispose() {
        this.disposeMeshes();
        if (this.leftDoorGroup) {
            this.scene.remove(this.leftDoorGroup);
            this.leftDoorGroup = null;
        }
        if (this.rightDoorGroup) {
            this.scene.remove(this.rightDoorGroup);
            this.rightDoorGroup = null;
        }
        super.dispose();
    }
}

export default DoorLeaf;
