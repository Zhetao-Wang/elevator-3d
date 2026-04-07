import * as THREE from 'three';

/**
 * 3D组件抽象基类
 * 所有电梯门组件必须继承此类
 */
export class BaseComponent extends THREE.EventDispatcher {
    /**
     * @param {THREE.Scene} scene - Three.js场景实例
     * @param {string} name - 组件名称
     * @param {string} configKey - 配置数据中的键名
     */
    constructor(scene, name, configKey) {
        super();
        this.scene = scene;
        this.name = name;
        this.configKey = configKey;
        this.mesh = null;
        this.currentMaterial = null;
        this.isSelected = false;
    }

    /**
     * 创建组件的3D网格
     * 子类必须实现此方法
     * @abstract
     */
    createMesh() {
        throw new Error('子类必须实现 createMesh 方法');
    }

    /**
     * 应用材质到组件
     * @param {THREE.Material} material - Three.js材质实例
     */
    applyMaterial(material) {
        if (!this.mesh) {
            console.warn(`[${this.name}] 网格未创建，无法应用材质`);
            return;
        }

        this.currentMaterial = material;

        if (Array.isArray(this.mesh.material)) {
            this.mesh.material.forEach(mat => {
                if (mat) {
                    mat.dispose();
                }
            });
            this.mesh.material = this.mesh.material.map(() => material.clone());
        } else {
            if (this.mesh.material) {
                this.mesh.material.dispose();
            }
            this.mesh.material = material.clone();
        }

        this.dispatchEvent({ type: 'materialChanged', material: material });
    }

    /**
     * 点击事件处理
     * 触发 component:selected 事件供 EventBus 监听
     */
    onClick() {
        this.isSelected = true;

        const event = {
            type: 'component:selected',
            component: this,
            name: this.name,
            configKey: this.configKey
        };

        this.dispatchEvent(event);

        if (typeof window !== 'undefined' && window.EventBus) {
            window.EventBus.emit('component:selected', this);
        }
    }

    /**
     * 取消选中状态
     */
    deselect() {
        this.isSelected = false;
        this.dispatchEvent({ type: 'deselected' });
    }

    /**
     * 获取当前配置
     * @returns {Object} 组件配置对象
     */
    getConfig() {
        return {
            name: this.name,
            configKey: this.configKey,
            material: this.currentMaterial,
            isSelected: this.isSelected
        };
    }

    /**
     * 获取可配置项列表
     * 子类可以覆盖以返回特定配置项
     * @returns {string[]} 可配置项数组
     */
    getConfigurable() {
        return ['material'];
    }

    /**
     * 更新组件变换
     * @param {Object} transform - 变换参数
     * @param {THREE.Vector3} transform.position - 位置
     * @param {THREE.Euler} transform.rotation - 旋转
     * @param {THREE.Vector3} transform.scale - 缩放
     */
    setTransform({ position, rotation, scale } = {}) {
        if (!this.mesh) return;

        if (position) this.mesh.position.copy(position);
        if (rotation) this.mesh.rotation.copy(rotation);
        if (scale) this.mesh.scale.copy(scale);
    }

    /**
     * 添加到场景
     */
    addToScene() {
        if (this.mesh && this.scene) {
            this.scene.add(this.mesh);
        }
    }

    /**
     * 从场景移除
     */
    removeFromScene() {
        if (this.mesh && this.scene) {
            this.scene.remove(this.mesh);
        }
    }

    /**
     * 销毁组件，清理资源
     */
    dispose() {
        this.removeFromScene();

        if (this.mesh) {
            if (this.mesh.geometry) {
                this.mesh.geometry.dispose();
            }

            if (Array.isArray(this.mesh.material)) {
                this.mesh.material.forEach(mat => mat?.dispose());
            } else if (this.mesh.material) {
                this.mesh.material.dispose();
            }

            this.mesh = null;
        }

        this.currentMaterial = null;
    }
}

export default BaseComponent;
