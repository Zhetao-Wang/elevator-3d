import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

import { MaterialLibrary } from './materials/MaterialLibrary.js';
import { DoorFrame } from './components/DoorFrame.js';
import { InnerFrame } from './components/InnerFrame.js';
import { DoorLeaf } from './components/DoorLeaf.js';
import { FloorDisplay } from './components/FloorDisplay.js';

// EventBus 实现
class EventBus {
    constructor() {
        this.events = {};
    }

    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }

    off(event, callback) {
        if (!this.events[event]) return;
        this.events[event] = this.events[event].filter(cb => cb !== callback);
    }

    emit(event, data) {
        if (!this.events[event]) return;
        this.events[event].forEach(callback => callback(data));
    }
}

// 全局 EventBus
window.EventBus = new EventBus();

/**
 * 电梯门配置器主类
 */
export class DoorConfigurator {
    constructor(container) {
        this.container = container || document.body;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        this.materialLibrary = MaterialLibrary.getInstance();
        this.components = new Map();
        this.selectedComponent = null;

        this.configData = null;
    }

    /**
     * 初始化配置器
     */
    async initialize(configData) {
        this.configData = configData;

        // 初始化场景
        this._initScene();

        // 初始化材质库
        await this.materialLibrary.initialize(configData);

        // 创建组件
        this._createComponents();

        // 设置交互
        this._setupInteraction();

        // 开始渲染循环
        this._animate();

        // 监听窗口大小变化
        window.addEventListener('resize', () => this._onResize());

        console.log('DoorConfigurator 初始化完成');
        return this;
    }

    /**
     * 初始化 Three.js 场景
     */
    _initScene() {
        // 场景
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1a1a1a);

        // 相机
        this.camera = new THREE.PerspectiveCamera(
            45,
            this.container.clientWidth / this.container.clientHeight,
            0.1,
            100
        );
        this.camera.position.set(0, 1.5, 5);

        // 渲染器
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.toneMapping = THREE.LinearToneMapping;
        this.renderer.toneMappingExposure = 0.8;
        this.container.appendChild(this.renderer.domElement);

        // 控制器
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.target.set(0, 1, 0);

        // 环境贴图
        const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
        this.scene.environment = pmremGenerator.fromScene(
            new RoomEnvironment(),
            0.04
        ).texture;

        // 添加基础灯光
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 10, 7);
        this.scene.add(directionalLight);
    }

    /**
     * 创建所有组件
     */
    _createComponents() {
        // 大门套
        const doorFrame = new DoorFrame(this.scene, this.materialLibrary);
        doorFrame.create();
        this.components.set('doorFrame', doorFrame);

        // 小门套
        const innerFrame = new InnerFrame(this.scene, this.materialLibrary);
        innerFrame.create();
        this.components.set('innerFrame', innerFrame);

        // 层门
        const doorLeaf = new DoorLeaf(this.scene, this.materialLibrary);
        doorLeaf.create();
        this.components.set('doorLeaf', doorLeaf);

        // 楼层显示器
        const floorDisplay = new FloorDisplay(this.scene);
        floorDisplay.create();
        this.components.set('floorDisplay', floorDisplay);

        // 监听组件选择事件
        this.components.forEach((component, key) => {
            component.addEventListener('component:selected', (event) => {
                this._onComponentSelected(event.component);
            });
        });
    }

    /**
     * 设置交互
     */
    _setupInteraction() {
        this.renderer.domElement.addEventListener('click', (event) => {
            this._onClick(event);
        });

        this.renderer.domElement.addEventListener('mousemove', (event) => {
            this._onMouseMove(event);
        });
    }

    /**
     * 处理点击事件
     */
    _onClick(event) {
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);

        // 获取所有可点击的 mesh
        const meshes = [];
        this.components.forEach((component) => {
            if (component.meshes) {
                meshes.push(...component.meshes);
            }
        });

        const intersects = this.raycaster.intersectObjects(meshes);

        if (intersects.length > 0) {
            const mesh = intersects[0].object;
            const component = mesh.userData.componentRef;

            if (component) {
                // 取消之前的选中
                if (this.selectedComponent) {
                    this.selectedComponent.deselect();
                }

                // 选中新组件
                this.selectedComponent = component;
                component.onClick();
            }
        } else {
            // 点击空白处，取消选中
            if (this.selectedComponent) {
                this.selectedComponent.deselect();
                this.selectedComponent = null;
            }
        }
    }

    /**
     * 处理鼠标移动（用于光标样式）
     */
    _onMouseMove(event) {
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);

        const meshes = [];
        this.components.forEach((component) => {
            if (component.meshes) {
                meshes.push(...component.meshes);
            }
        });

        const intersects = this.raycaster.intersectObjects(meshes);
        this.renderer.domElement.style.cursor = intersects.length > 0 ? 'pointer' : 'default';
    }

    /**
     * 组件被选中时的处理
     */
    _onComponentSelected(component) {
        console.log('选中组件:', component.name);

        // 触发全局事件供 UI 面板监听
        window.EventBus.emit('component:selected', {
            component: component,
            configKey: component.configKey,
            configurable: component.getConfigurableOptions(),
            currentConfig: component.getConfig()
        });
    }

    /**
     * 应用材质到指定组件
     */
    applyMaterial(componentKey, materialKey) {
        const component = this.components.get(componentKey);
        if (component) {
            component.applyMaterial(materialKey);
        }
    }

    /**
     * 设置组件型号
     */
    setModel(componentKey, modelKey) {
        const component = this.components.get(componentKey);
        if (component && component.setModel) {
            component.setModel(modelKey);
        }
    }

    /**
     * 获取所有组件配置
     */
    getAllConfigs() {
        const configs = {};
        this.components.forEach((component, key) => {
            configs[key] = component.getConfig();
        });
        return configs;
    }

    /**
     * 渲染循环
     */
    _animate() {
        requestAnimationFrame(() => this._animate());
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    /**
     * 窗口大小变化处理
     */
    _onResize() {
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }

    /**
     * 销毁配置器
     */
    dispose() {
        // 销毁所有组件
        this.components.forEach((component) => {
            component.dispose();
        });
        this.components.clear();

        // 释放材质库资源
        this.materialLibrary.dispose();

        // 清理 Three.js 资源
        this.renderer.dispose();
        this.renderer.domElement.remove();

        window.removeEventListener('resize', () => this._onResize());
    }
}

export default DoorConfigurator;
