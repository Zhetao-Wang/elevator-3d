import * as THREE from 'three';
import { BaseComponent } from '../BaseComponent.js';

/**
 * 轿厢门组件
 * 双开中分电梯门
 */
export class CabinDoor extends BaseComponent {
    constructor(scene, materialLibrary) {
        super(scene, '电梯门', 'cabin.door');
        this.materialLibrary = materialLibrary;
        this.meshes = [];
        this.currentMaterial = 'st-hairline';

        // 尺寸 - 门宽1.6m，向外突出
        this.doorWidth = 1.6;
        this.doorHeight = 2.2;
        this.doorThickness = 0.02;
        this.singleDoorWidth = this.doorWidth / 2; // 每扇门宽度
        this.doorProjection = -0.20; // 门向外突出10cm（z轴负方向）
    }

    create() {
        this.mesh = this._createDoorMesh();
        this.meshes = this.mesh ? [this.mesh] : [];
        if (this.mesh) {
            this.addToScene();
            this.applyMaterial(this.currentMaterial);
        }
    }

    _createDoorMesh() {
        const group = new THREE.Group();

        // 左门扇
        const leftDoor = new THREE.Mesh(
            new THREE.BoxGeometry(this.singleDoorWidth - 0.002, this.doorHeight, this.doorThickness),
            null
        );
        leftDoor.position.set(-this.singleDoorWidth / 2, this.doorHeight / 2, 0);
        leftDoor.userData.componentRef = this;
        leftDoor.userData.partType = 'door';
        leftDoor.userData.side = 'left';
        group.add(leftDoor);

        // 右门扇
        const rightDoor = new THREE.Mesh(
            new THREE.BoxGeometry(this.singleDoorWidth - 0.002, this.doorHeight, this.doorThickness),
            null
        );
        rightDoor.position.set(this.singleDoorWidth / 2, this.doorHeight / 2, 0);
        rightDoor.userData.componentRef = this;
        rightDoor.userData.partType = 'door';
        rightDoor.userData.side = 'right';
        group.add(rightDoor);

        // 设置整体位置 - 门突出去
        group.position.set(0, 0, -1.0 + this.doorProjection);
        group.userData.componentRef = this;

        return group;
    }

    applyMaterial(materialKey) {
        const material = this.materialLibrary.get(materialKey);
        if (!material) return;

        this.currentMaterial = materialKey;

        if (this.mesh) {
            this.mesh.traverse((child) => {
                if (child.isMesh && child.userData.partType === 'door') {
                    child.material = material.clone();
                }
            });
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
            this.mesh.traverse((child) => {
                if (child.isMesh) {
                    if (child.geometry) child.geometry.dispose();
                    if (child.material) child.material.dispose();
                }
            });
        }
        this.meshes = [];
        this.mesh = null;
    }
}

export default CabinDoor;
