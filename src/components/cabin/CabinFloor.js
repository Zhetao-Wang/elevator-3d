import * as THREE from 'three';
import { BaseComponent } from '../BaseComponent.js';

/**
 * 轿厢地板组件
 * 平整的地面
 */
export class CabinFloor extends BaseComponent {
    constructor(scene, materialLibrary) {
        super(scene, '地板', 'cabin.floor');
        this.materialLibrary = materialLibrary;
        this.meshes = [];
        this.currentMaterial = 'st-hairline';
    }

    create() {
        this.mesh = this._createFloorMesh();
        this.meshes = this.mesh ? [this.mesh] : [];
        if (this.mesh) {
            this.addToScene();
            this.applyMaterial(this.currentMaterial);
        }
    }

    _createFloorMesh() {
        // 平整的地板
        const geometry = new THREE.BoxGeometry(2.0, 0.02, 2.0);
        const mesh = new THREE.Mesh(geometry, null);
        mesh.position.set(0, 0.01, 0);
        mesh.userData.componentRef = this;
        mesh.userData.partType = 'floor';

        return mesh;
    }

    applyMaterial(materialKey) {
        const material = this.materialLibrary.get(materialKey);
        if (!material) return;

        this.currentMaterial = materialKey;

        if (this.mesh && this.mesh.userData.partType === 'floor') {
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

export default CabinFloor;
