import * as THREE from 'three';
import { BaseComponent } from './BaseComponent.js';

// 楼层显示器组件
export class FloorDisplay extends BaseComponent {
    constructor(scene) {
        super(scene, '楼层显示器', 'floorDisplay');

        // 型号配置
        this.models = {
            'seg-white': {
                name: '4.3寸黑底白字段码',
                type: 'white-seg',
                size: '4.3寸',
                bgColor: '#000000',
                textColor: '#ffffff',
                width: 0.4,
                height: 0.2
            },
            'dot-red': {
                name: '4.3寸红色点阵',
                type: 'dot-red',
                size: '4.3寸',
                bgColor: '#000000',
                textColor: '#ff0000',
                width: 0.4,
                height: 0.2
            }
        };

        this.currentModel = 'seg-white';
        this.currentFloor = 1;

        this.displayGroup = null;
        this.screenMesh = null;
        this.texture = null;
        this.meshes = [];
    }

    create() {
        this.createDisplay();
        return this;
    }

    createDisplay() {
        // 清除旧显示器
        if (this.displayGroup) {
            this.scene.remove(this.displayGroup);
        }

        const model = this.models[this.currentModel];

        // 创建显示器组
        this.displayGroup = new THREE.Group();
        this.displayGroup.name = 'FloorDisplay';

        // 外壳材质
        const caseMaterial = new THREE.MeshStandardMaterial({
            color: 0x111111,
            metalness: 0.8,
            roughness: 0.2
        });

        // 外壳（略大于屏幕）
        const caseWidth = model.width + 0.04;
        const caseHeight = model.height + 0.04;
        const caseDepth = 0.03;

        const caseGeo = new THREE.BoxGeometry(caseWidth, caseHeight, caseDepth);
        const caseMesh = new THREE.Mesh(caseGeo, caseMaterial);
        caseMesh.userData.componentRef = this;
        this.meshes.push(caseMesh);
        this.displayGroup.add(caseMesh);

        // 创建屏幕纹理
        this.createDisplayTexture();

        // 屏幕
        const screenGeo = new THREE.PlaneGeometry(model.width, model.height);
        const screenMat = new THREE.MeshBasicMaterial({
            map: this.texture,
            transparent: true
        });
        this.screenMesh = new THREE.Mesh(screenGeo, screenMat);
        this.screenMesh.position.z = caseDepth / 2 + 0.001;
        this.displayGroup.add(this.screenMesh);

        // 设置位置（门楣上方，与门框留有空隙）
        this.displayGroup.position.set(0, 1.3, 0.08);

        // 添加到场景
        this.scene.add(this.displayGroup);
    }

    // 创建显示纹理
    createDisplayTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 128;

        this.updateCanvas(canvas);

        if (this.texture) {
            this.texture.dispose();
        }
        this.texture = new THREE.CanvasTexture(canvas);
    }

    // 更新画布内容
    updateCanvas(canvas) {
        const ctx = canvas.getContext('2d');
        const model = this.models[this.currentModel];

        // 背景
        ctx.fillStyle = model.bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 数字
        ctx.fillStyle = model.textColor;
        ctx.font = 'bold 80px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // 发光效果
        ctx.shadowColor = model.textColor;
        ctx.shadowBlur = 10;

        const floorText = this.currentFloor.toString().padStart(2, '0');
        ctx.fillText(floorText, canvas.width / 2, canvas.height / 2);

        // 重置阴影
        ctx.shadowBlur = 0;

        // 如果是点阵屏，添加点阵效果
        if (model.type === 'dot-red') {
            ctx.fillStyle = model.textColor;
            for (let i = 0; i < canvas.width; i += 4) {
                for (let j = 0; j < canvas.height; j += 4) {
                    if (Math.random() > 0.9) {
                        ctx.fillRect(i, j, 1, 1);
                    }
                }
            }
        }

        if (this.texture) {
            this.texture.needsUpdate = true;
        }
    }

    // 更新楼层显示
    setFloor(floor) {
        this.currentFloor = floor;
        if (this.screenMesh && this.screenMesh.material.map) {
            const canvas = this.screenMesh.material.map.image;
            this.updateCanvas(canvas);
        }
    }

    // 切换型号
    setModel(modelKey) {
        if (!this.models[modelKey]) {
            console.warn(`[FloorDisplay] 型号 ${modelKey} 不存在`);
            return;
        }
        this.currentModel = modelKey;
        this.createDisplay();
        this.dispatchEvent({ type: 'modelChanged', model: modelKey });
    }

    // 获取可配置项
    getConfigurableOptions() {
        return ['model'];
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
            floor: this.currentFloor
        };
    }

    // 销毁
    dispose() {
        if (this.displayGroup) {
            this.scene.remove(this.displayGroup);
            this.displayGroup = null;
        }
        if (this.texture) {
            this.texture.dispose();
            this.texture = null;
        }
        this.meshes.forEach(mesh => {
            if (mesh.geometry) mesh.geometry.dispose();
        });
        this.meshes = [];
        super.dispose();
    }
}

export default FloorDisplay;
