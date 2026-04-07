import * as THREE from 'three';
import { BaseComponent } from '../BaseComponent.js';

/**
 * 轿厢墙壁组件
 * 用于前壁、侧前壁、侧中壁、侧后壁、后侧边、后中壁
 */
export class CabinWall extends BaseComponent {
    constructor(scene, materialLibrary, wallType, name) {
        super(scene, name, `cabin.walls.${wallType}`);
        this.materialLibrary = materialLibrary;
        this.wallType = wallType;
        this.meshes = [];
        this.currentMaterial = 'st-hairline';

        // 根据墙壁类型设置尺寸和位置
        this._setupWallDimensions();
    }

    _setupWallDimensions() {
        // 轿厢尺寸: 2m x 2m x 2.4m (宽 x 深 x 高)
        const cabinWidth = 2.0;
        const cabinDepth = 2.0;
        const cabinHeight = 2.4;
        const wallThickness = 0.05;

        switch (this.wallType) {
            case 'front':
                // 前壁 - 电梯门所在墙面
                this.dimensions = { width: cabinWidth, height: cabinHeight, depth: wallThickness };
                this.position = { x: 0, y: cabinHeight / 2, z: -cabinDepth / 2 };
                break;
            case 'sideFront':
                // 侧前壁 - 前门旁边的侧壁
                this.dimensions = { width: wallThickness, height: cabinHeight, depth: cabinDepth / 3 };
                this.position = { x: -cabinWidth / 2, y: cabinHeight / 2, z: -cabinDepth / 3 };
                break;
            case 'sideMiddle':
                // 侧中壁 - 侧壁中间镜面装饰
                this.dimensions = { width: wallThickness, height: cabinHeight * 0.8, depth: cabinDepth / 3 };
                this.position = { x: -cabinWidth / 2, y: cabinHeight / 2, z: 0 };
                break;
            case 'sideRear':
                // 侧后壁 - 侧壁后部
                this.dimensions = { width: wallThickness, height: cabinHeight, depth: cabinDepth / 3 };
                this.position = { x: -cabinWidth / 2, y: cabinHeight / 2, z: cabinDepth / 3 };
                break;
            case 'rearSide':
                // 后侧边 - 后壁两侧
                this.dimensions = { width: cabinWidth / 3, height: cabinHeight, depth: wallThickness };
                this.position = { x: -cabinWidth / 3, y: cabinHeight / 2, z: cabinDepth / 2 };
                break;
            case 'rearMiddle':
                // 后中壁 - 后壁中间镜面
                this.dimensions = { width: cabinWidth / 3, height: cabinHeight * 0.8, depth: wallThickness };
                this.position = { x: 0, y: cabinHeight / 2, z: cabinDepth / 2 };
                break;
            default:
                this.dimensions = { width: 1, height: 1, depth: 0.05 };
                this.position = { x: 0, y: 0, z: 0 };
        }
    }

    create() {
        this.mesh = this._createWallMesh();
        this.meshes = [this.mesh];
        this.addToScene();

        // 应用默认材质
        const material = this.materialLibrary.get(this.currentMaterial);
        if (material) {
            this.applyMaterial(material);
        }
    }

    _createWallMesh() {
        const geometry = new THREE.BoxGeometry(
            this.dimensions.width,
            this.dimensions.height,
            this.dimensions.depth
        );

        const mesh = new THREE.Mesh(geometry);
        mesh.position.set(this.position.x, this.position.y, this.position.z);
        mesh.userData.componentRef = this;

        return mesh;
    }

    /**
     * 应用材质到墙壁
     */
    applyMaterial(materialKey) {
        const material = this.materialLibrary.get(materialKey);
        if (!material) return;

        this.currentMaterial = materialKey;

        if (this.mesh) {
            this.mesh.material = material.clone();
        }
    }

    /**
     * 获取可配置项
     */
    getConfigurableOptions() {
        return ['material'];
    }

    /**
     * 获取当前配置
     */
    getConfig() {
        return {
            name: this.name,
            configKey: this.configKey,
            wallType: this.wallType,
            material: this.currentMaterial
        };
    }

    dispose() {
        this.removeFromScene();
        if (this.mesh) {
            if (this.mesh.geometry) {
                this.mesh.geometry.dispose();
            }
            if (this.mesh.material) {
                this.mesh.material.dispose();
            }
        }
        this.meshes = [];
        this.mesh = null;
    }
}

export default CabinWall;
