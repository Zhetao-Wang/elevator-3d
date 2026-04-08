import * as THREE from 'three';
import { BaseComponent } from '../BaseComponent.js';

/**
 * 轿厢左前壁组件
 * 门左侧的竖直壁板
 */
export class CabinFrontLeftWall extends BaseComponent {
    constructor(scene, materialLibrary) {
        super(scene, '左前壁', 'cabin.frontWall.left');
        this.materialLibrary = materialLibrary;
        this.meshes = [];
        this.currentMaterial = 'st-hairline';

        // 尺寸 - 门更窄(0.8m)，两侧壁板更宽(0.7m)
        this.width = 0.7;
        this.height = 2.4;
        this.wallThickness = 0.02;
    }

    create() {
        this.mesh = this._createWallMesh();
        this.meshes = this.mesh ? [this.mesh] : [];
        if (this.mesh) {
            this.addToScene();
            this.applyMaterial(this.currentMaterial);
        }
    }

    _createWallMesh() {
        const geometry = new THREE.BoxGeometry(this.width, this.height, this.wallThickness);
        const mesh = new THREE.Mesh(geometry, null);

        // 位置：门左侧 - 门宽1.0m，左边缘在-0.5，壁板紧邻门放置
        mesh.position.set(-0.5 - this.width / 2, this.height / 2, -1.0);
        mesh.userData.componentRef = this;
        mesh.userData.partType = 'panel';

        return mesh;
    }

    applyMaterial(materialKey) {
        const material = this.materialLibrary.get(materialKey);
        if (!material) return;

        this.currentMaterial = materialKey;

        if (this.mesh) {
            this.mesh.material = material.clone();
        }
    }

    getConfigurableOptions() {
        return ['material'];
    }

    getConfig() {
        return {
            name: this.name,
            configKey: this.configKey,
            material: this.currentMaterial
        };
    }

    dispose() {
        this.removeFromScene();
        if (this.mesh) {
            if (this.mesh.geometry) this.mesh.geometry.dispose();
            if (this.mesh.material) this.mesh.material.dispose();
        }
        this.meshes = [];
        this.mesh = null;
    }
}

export default CabinFrontLeftWall;
