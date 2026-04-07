import * as THREE from 'three';
import { BaseComponent } from './BaseComponent.js';

// 大门套组件
export class DoorFrame extends BaseComponent {
    constructor(scene, materialLibrary) {
        super(scene, '大门套', 'doorFrame');
        this.materialLibrary = materialLibrary;
        this.dimensions = {
            width: 2.2,
            height: 2.7,
            depth: 0.15,
            wallThickness: 0.08
        };
        this.currentMaterial = 'st-hairline';
        this.meshes = [];
    }

    create() {
        // 清除旧门框
        if (this.frameGroup) {
            this.disposeMeshes();
            this.scene.remove(this.frameGroup);
        }

        const { width, height, depth, wallThickness } = this.dimensions;

        // 创建门框组
        this.frameGroup = new THREE.Group();
        this.frameGroup.name = 'DoorFrame';

        // 获取材质
        const material = this.materialLibrary.get(this.currentMaterial);
        if (!material) {
            console.warn(`[DoorFrame] 材质 ${this.currentMaterial} 不存在`);
            return this;
        }

        // 创建门框四边（上、左、右、下）
        // 上门框
        const topGeo = new THREE.BoxGeometry(width, wallThickness, depth);
        const topMesh = new THREE.Mesh(topGeo, material.clone());
        topMesh.position.set(0, height / 2 - wallThickness / 2, 0);
        topMesh.userData.componentRef = this;
        this.meshes.push(topMesh);
        this.frameGroup.add(topMesh);

        // 下门槛
        const bottomGeo = new THREE.BoxGeometry(width, wallThickness, depth);
        const bottomMesh = new THREE.Mesh(bottomGeo, material.clone());
        bottomMesh.position.set(0, -height / 2 + wallThickness / 2, 0);
        bottomMesh.userData.componentRef = this;
        this.meshes.push(bottomMesh);
        this.frameGroup.add(bottomMesh);

        // 左边框
        const leftHeight = height - wallThickness * 2;
        const leftGeo = new THREE.BoxGeometry(wallThickness, leftHeight, depth);
        const leftMesh = new THREE.Mesh(leftGeo, material.clone());
        leftMesh.position.set(-width / 2 + wallThickness / 2, 0, 0);
        leftMesh.userData.componentRef = this;
        this.meshes.push(leftMesh);
        this.frameGroup.add(leftMesh);

        // 右边框
        const rightGeo = new THREE.BoxGeometry(wallThickness, leftHeight, depth);
        const rightMesh = new THREE.Mesh(rightGeo, material.clone());
        rightMesh.position.set(width / 2 - wallThickness / 2, 0, 0);
        rightMesh.userData.componentRef = this;
        this.meshes.push(rightMesh);
        this.frameGroup.add(rightMesh);

        // 添加装饰包边（外侧突出部分）
        const trimDepth = 0.02;
        const trimWidth = 0.05;

        // 上包边
        const topTrimGeo = new THREE.BoxGeometry(width + trimWidth * 2, trimWidth, depth + trimDepth);
        const topTrim = new THREE.Mesh(topTrimGeo, material.clone());
        topTrim.position.set(0, height / 2 + trimWidth / 2, trimDepth / 2);
        topTrim.userData.componentRef = this;
        this.meshes.push(topTrim);
        this.frameGroup.add(topTrim);

        // 左包边
        const leftTrimGeo = new THREE.BoxGeometry(trimWidth, height + trimWidth * 2, depth + trimDepth);
        const leftTrim = new THREE.Mesh(leftTrimGeo, material.clone());
        leftTrim.position.set(-width / 2 - trimWidth / 2, 0, trimDepth / 2);
        leftTrim.userData.componentRef = this;
        this.meshes.push(leftTrim);
        this.frameGroup.add(leftTrim);

        // 右包边
        const rightTrimGeo = new THREE.BoxGeometry(trimWidth, height + trimWidth * 2, depth + trimDepth);
        const rightTrim = new THREE.Mesh(rightTrimGeo, material.clone());
        rightTrim.position.set(width / 2 + trimWidth / 2, 0, trimDepth / 2);
        rightTrim.userData.componentRef = this;
        this.meshes.push(rightTrim);
        this.frameGroup.add(rightTrim);

        // 添加到场景
        this.scene.add(this.frameGroup);

        return this;
    }

    // 获取可配置项
    getConfigurableOptions() {
        return ['material'];
    }

    // 应用材质（覆盖父类）
    applyMaterial(materialKey) {
        if (!this.materialLibrary.has(materialKey)) {
            console.warn(`[DoorFrame] 材质 ${materialKey} 不存在`);
            return;
        }
        this.currentMaterial = materialKey;
        this.create(); // 重新创建以应用新材质
        this.dispatchEvent({ type: 'materialChanged', material: materialKey });
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
        if (this.frameGroup) {
            this.scene.remove(this.frameGroup);
            this.frameGroup = null;
        }
        super.dispose();
    }
}

export default DoorFrame;
