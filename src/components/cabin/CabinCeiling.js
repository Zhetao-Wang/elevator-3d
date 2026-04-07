import * as THREE from 'three';
import { BaseComponent } from '../BaseComponent.js';

/**
 * 轿厢吊顶组件
 * 支持型号切换（平顶、recessed灯吊顶、豪华吊顶）和材质切换
 */
export class CabinCeiling extends BaseComponent {
    constructor(scene, materialLibrary) {
        super(scene, '吊顶', 'cabin.ceiling');
        this.materialLibrary = materialLibrary;
        this.meshes = [];
        this.currentModel = 'flat';
        this.currentMaterial = 'st-hairline';
    }

    create() {
        this.mesh = this._createCeilingMesh();
        this.meshes = [this.mesh];
        this.addToScene();

        // 应用默认材质
        const material = this.materialLibrary.get(this.currentMaterial);
        if (material) {
            this.applyMaterial(material);
        }
    }

    _createCeilingMesh() {
        const group = new THREE.Group();

        // 基础吊顶平面 (2m x 2m)
        const baseGeometry = new THREE.BoxGeometry(2.0, 0.1, 2.0);
        const baseMesh = new THREE.Mesh(baseGeometry);
        baseMesh.position.set(0, 2.35, 0);
        baseMesh.userData.componentRef = this;
        baseMesh.userData.partType = 'base';
        group.add(baseMesh);

        // 根据型号添加不同细节
        if (this.currentModel === 'recessed') {
            // Recessed 灯槽
            const lightGeometry = new THREE.BoxGeometry(1.5, 0.05, 1.5);
            const lightMaterial = new THREE.MeshStandardMaterial({
                color: 0xffffff,
                emissive: 0xffffff,
                emissiveIntensity: 0.5
            });
            const lightMesh = new THREE.Mesh(lightGeometry, lightMaterial);
            lightMesh.position.set(0, 2.3, 0);
            lightMesh.userData.componentRef = this;
            lightMesh.userData.partType = 'light';
            group.add(lightMesh);
        } else if (this.currentModel === 'luxury') {
            // 豪华吊顶 - 多层设计
            const tier1Geometry = new THREE.BoxGeometry(1.8, 0.08, 1.8);
            const tier1Mesh = new THREE.Mesh(tier1Geometry);
            tier1Mesh.position.set(0, 2.3, 0);
            tier1Mesh.userData.componentRef = this;
            tier1Mesh.userData.partType = 'tier1';
            group.add(tier1Mesh);

            const tier2Geometry = new THREE.BoxGeometry(1.2, 0.08, 1.2);
            const tier2Mesh = new THREE.Mesh(tier2Geometry);
            tier2Mesh.position.set(0, 2.25, 0);
            tier2Mesh.userData.componentRef = this;
            tier2Mesh.userData.partType = 'tier2';
            group.add(tier2Mesh);

            // 中央灯光
            const centerLightGeometry = new THREE.BoxGeometry(0.8, 0.03, 0.8);
            const centerLightMaterial = new THREE.MeshStandardMaterial({
                color: 0xffffee,
                emissive: 0xffffee,
                emissiveIntensity: 0.6
            });
            const centerLightMesh = new THREE.Mesh(centerLightGeometry, centerLightMaterial);
            centerLightMesh.position.set(0, 2.2, 0);
            centerLightMesh.userData.componentRef = this;
            centerLightMesh.userData.partType = 'centerLight';
            group.add(centerLightMesh);
        }

        // 将 group 作为 mesh 属性存储
        const container = new THREE.Object3D();
        container.add(group);
        container.userData.componentRef = this;
        return container;
    }

    /**
     * 应用材质到吊顶
     */
    applyMaterial(materialKey) {
        const material = this.materialLibrary.get(materialKey);
        if (!material) return;

        this.currentMaterial = materialKey;

        // 遍历所有子mesh，除了灯光部分
        this.mesh.traverse((child) => {
            if (child.isMesh && child.userData.partType !== 'light' && child.userData.partType !== 'centerLight') {
                child.material = material.clone();
            }
        });
    }

    /**
     * 设置吊顶型号
     */
    setModel(modelKey) {
        this.currentModel = modelKey;
        this.removeFromScene();
        this.mesh = this._createCeilingMesh();
        this.meshes = [this.mesh];
        this.addToScene();

        // 重新应用材质
        const material = this.materialLibrary.get(this.currentMaterial);
        if (material) {
            this.applyMaterial(this.currentMaterial);
        }
    }

    /**
     * 获取可选型号列表
     */
    getModelOptions() {
        return [
            { key: 'flat', name: '平顶' },
            { key: 'recessed', name: ' recessed灯吊顶' },
            { key: 'luxury', name: '豪华吊顶' }
        ];
    }

    /**
     * 获取可配置项
     */
    getConfigurableOptions() {
        return ['model', 'material'];
    }

    /**
     * 获取当前配置
     */
    getConfig() {
        return {
            name: this.name,
            configKey: this.configKey,
            model: this.currentModel,
            material: this.currentMaterial
        };
    }

    dispose() {
        this.removeFromScene();
        this.meshes = [];
        this.mesh = null;
    }
}

export default CabinCeiling;
