import * as THREE from 'three';
import { BaseComponent } from './BaseComponent.js';

// 小门套组件（内部门套）
export class InnerFrame extends BaseComponent {
    constructor(scene, materialLibrary) {
        super(scene, '小门套', 'innerFrame');
        this.materialLibrary = materialLibrary;
        this.dimensions = {
            width: 1.9,
            height: 2.5,
            depth: 0.1,
            wallThickness: 0.06
        };
        this.currentMaterial = 'st-hairline';
        this.meshes = [];
    }

    create() {
        // 清除旧门套
        if (this.innerGroup) {
            this.disposeMeshes();
            this.scene.remove(this.innerGroup);
        }

        const { width, height, depth, wallThickness } = this.dimensions;

        // 创建内门套组
        this.innerGroup = new THREE.Group();
        this.innerGroup.name = 'InnerFrame';

        // 获取材质
        const material = this.materialLibrary.get(this.currentMaterial);
        if (!material) {
            console.warn(`[InnerFrame] 材质 ${this.currentMaterial} 不存在`);
            return this;
        }

        // 上门框
        const topGeo = new THREE.BoxGeometry(width, wallThickness, depth);
        const topMesh = new THREE.Mesh(topGeo, material.clone());
        topMesh.position.set(0, height / 2 - wallThickness / 2, 0);
        topMesh.userData.componentRef = this;
        this.meshes.push(topMesh);
        this.innerGroup.add(topMesh);

        // 左门框
        const sideHeight = height - wallThickness;
        const leftGeo = new THREE.BoxGeometry(wallThickness, sideHeight, depth);
        const leftMesh = new THREE.Mesh(leftGeo, material.clone());
        leftMesh.position.set(-width / 2 + wallThickness / 2, -wallThickness / 2, 0);
        leftMesh.userData.componentRef = this;
        this.meshes.push(leftMesh);
        this.innerGroup.add(leftMesh);

        // 右门框
        const rightGeo = new THREE.BoxGeometry(wallThickness, sideHeight, depth);
        const rightMesh = new THREE.Mesh(rightGeo, material.clone());
        rightMesh.position.set(width / 2 - wallThickness / 2, -wallThickness / 2, 0);
        rightMesh.userData.componentRef = this;
        this.meshes.push(rightMesh);
        this.innerGroup.add(rightMesh);

        // 添加到场景
        this.scene.add(this.innerGroup);

        return this;
    }

    // 应用材质（覆盖父类）
    applyMaterial(materialKey) {
        if (!this.materialLibrary.has(materialKey)) {
            console.warn(`[InnerFrame] 材质 ${materialKey} 不存在`);
            return;
        }
        this.currentMaterial = materialKey;
        this.create();
        this.dispatchEvent({ type: 'materialChanged', material: materialKey });
    }

    // 获取可配置项
    getConfigurableOptions() {
        return ['material'];
    }

    // 获取当前配置
    getConfig() {
        return {
            name: this.name,
            configKey: this.configKey,
            material: this.currentMaterial,
            dimensions: this.dimensions
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
        if (this.innerGroup) {
            this.scene.remove(this.innerGroup);
            this.innerGroup = null;
        }
        super.dispose();
    }
}

export default InnerFrame;
