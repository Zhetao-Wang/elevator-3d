import * as THREE from 'three';
import { BaseComponent } from '../BaseComponent.js';

/**
 * 轿厢后壁组件
 * 分为左侧、中间、右侧三块，每块可独立配置材质
 * 平整的薄片墙面
 */
export class CabinBackWall extends BaseComponent {
    constructor(scene, materialLibrary, position, name) {
        super(scene, name, `cabin.backWall.${position}`);
        this.materialLibrary = materialLibrary;
        this.position = position; // 'left' | 'center' | 'right'
        this.meshes = [];
        this.currentMaterial = 'st-hairline';

        // 尺寸
        this.wallHeight = 2.4;
        this.wallThickness = 0.02; // 薄片墙面
        this.sectionWidth = 2.0 / 3; // 后壁宽度分成3块
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
        const group = new THREE.Group();

        // 计算位置
        const xOffset = -1.0 + (this.position === 'left' ? 0 : this.position === 'center' ? 1 : 2) * this.sectionWidth;
        const xPos = xOffset + this.sectionWidth / 2;

        // 主体壁板 - 平整薄片
        const panel = new THREE.Mesh(
            new THREE.BoxGeometry(this.sectionWidth, this.wallHeight, this.wallThickness),
            null
        );
        panel.position.set(0, this.wallHeight / 2, 0);
        panel.userData.componentRef = this;
        panel.userData.partType = 'panel';
        group.add(panel);

        // 设置整体位置
        group.position.set(xPos, 0, 1.0); // 后壁在 z = 1.0
        group.userData.componentRef = this;

        return group;
    }

    applyMaterial(materialKey) {
        const material = this.materialLibrary.get(materialKey);
        if (!material) return;

        this.currentMaterial = materialKey;

        if (this.mesh) {
            this.mesh.traverse((child) => {
                if (child.isMesh && child.userData.partType === 'panel') {
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
            position: this.position,
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

export default CabinBackWall;
