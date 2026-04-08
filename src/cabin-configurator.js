import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

import { MaterialLibrary } from './materials/MaterialLibrary.js';
import {
    CabinCeiling,
    CabinFloor,
    CabinFrontLeftWall,
    CabinFrontRightWall,
    CabinDoor,
    CabinSideWall,
    CabinBackWall
} from './components/cabin/index.js';

/**
 * 轿厢配置器主类
 * 提供360度可旋转的轿厢内部视图
 */
export class CabinConfigurator {
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

        console.log('CabinConfigurator 初始化完成');
        return this;
    }

    /**
     * 初始化 Three.js 场景
     */
    _initScene() {
        // 场景
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1a1a1a);

        // 相机 - 设置在轿厢内部中央
        this.camera = new THREE.PerspectiveCamera(
            70,
            this.container.clientWidth / this.container.clientHeight,
            0.1,
            100
        );
        // 相机位置在轿厢中央
        this.camera.position.set(0, 1.4, 0);

        // 渲染器
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.toneMapping = THREE.LinearToneMapping;
        this.renderer.toneMappingExposure = 0.5;
        this.container.appendChild(this.renderer.domElement);

        // 控制器 - 360度旋转
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.target.set(0, 1.2, 0);

        // 限制在轿厢内
        this.controls.minDistance = 0.3;
        this.controls.maxDistance = 1.5;
        this.controls.minPolarAngle = Math.PI * 0.1;
        this.controls.maxPolarAngle = Math.PI * 0.9;
        this.controls.enablePan = false;

        // 环境贴图
        const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
        this.scene.environment = pmremGenerator.fromScene(
            new RoomEnvironment(),
            0.04
        ).texture;

        // 添加基础灯光
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.08);
        this.scene.add(ambientLight);

        // 吊顶灯光
        const ceilingLight = new THREE.PointLight(0xffffff, 0.4, 5);
        ceilingLight.position.set(0, 2.2, 0);
        this.scene.add(ceilingLight);

        // 补充灯光
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.3);
        directionalLight.position.set(2, 3, 2);
        this.scene.add(directionalLight);
    }

    /**
     * 创建所有组件
     */
    _createComponents() {
        // 地板
        const floor = new CabinFloor(this.scene, this.materialLibrary);
        floor.create();
        this.components.set('floor', floor);

        // 吊顶
        const ceiling = new CabinCeiling(this.scene, this.materialLibrary);
        ceiling.create();
        this.components.set('ceiling', ceiling);

        // 前壁 - 左壁板、右壁板（带操纵箱）、电梯门
        const frontLeftWall = new CabinFrontLeftWall(this.scene, this.materialLibrary);
        frontLeftWall.create();
        this.components.set('frontLeftWall', frontLeftWall);

        const frontRightWall = new CabinFrontRightWall(this.scene, this.materialLibrary);
        frontRightWall.create();
        this.components.set('frontRightWall', frontRightWall);


        const door = new CabinDoor(this.scene, this.materialLibrary);
        door.create();
        this.components.set('door', door);

        // 左侧壁 - 前中后三块
        const leftFrontWall = new CabinSideWall(this.scene, this.materialLibrary, 'left', 'front', '左侧前壁');
        leftFrontWall.create();
        this.components.set('leftFrontWall', leftFrontWall);

        const leftMiddleWall = new CabinSideWall(this.scene, this.materialLibrary, 'left', 'middle', '左侧中壁');
        leftMiddleWall.create();
        this.components.set('leftMiddleWall', leftMiddleWall);

        const leftRearWall = new CabinSideWall(this.scene, this.materialLibrary, 'left', 'rear', '左侧后壁');
        leftRearWall.create();
        this.components.set('leftRearWall', leftRearWall);

        // 右侧壁 - 前中后三块
        const rightFrontWall = new CabinSideWall(this.scene, this.materialLibrary, 'right', 'front', '右侧前壁');
        rightFrontWall.create();
        this.components.set('rightFrontWall', rightFrontWall);

        const rightMiddleWall = new CabinSideWall(this.scene, this.materialLibrary, 'right', 'middle', '右侧中壁');
        rightMiddleWall.create();
        this.components.set('rightMiddleWall', rightMiddleWall);

        const rightRearWall = new CabinSideWall(this.scene, this.materialLibrary, 'right', 'rear', '右侧后壁');
        rightRearWall.create();
        this.components.set('rightRearWall', rightRearWall);

        // 后壁 - 左中右三块
        const backLeftWall = new CabinBackWall(this.scene, this.materialLibrary, 'left', '后壁左侧');
        backLeftWall.create();
        this.components.set('backLeftWall', backLeftWall);

        const backCenterWall = new CabinBackWall(this.scene, this.materialLibrary, 'center', '后壁中间');
        backCenterWall.create();
        this.components.set('backCenterWall', backCenterWall);

        const backRightWall = new CabinBackWall(this.scene, this.materialLibrary, 'right', '后壁右侧');
        backRightWall.create();
        this.components.set('backRightWall', backRightWall);


        // 监听组件选择事件
        this.components.forEach((component, key) => {
            if (component.addEventListener) {
                component.addEventListener('component:selected', (event) => {
                    this._onComponentSelected(event.component);
                });
            }
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

        const intersects = this.raycaster.intersectObjects(meshes, true);

        if (intersects.length > 0) {
            // 找到第一个有 componentRef 的 mesh
            let targetMesh = intersects[0].object;
            while (targetMesh && !targetMesh.userData.componentRef && targetMesh.parent) {
                targetMesh = targetMesh.parent;
            }

            const component = targetMesh?.userData?.componentRef;

            if (component) {
                // 取消之前的选中
                if (this.selectedComponent && this.selectedComponent !== component) {
                    this.selectedComponent.deselect?.();
                }

                // 选中新组件
                this.selectedComponent = component;
                component.onClick?.();
            }
        } else {
            // 点击空白处，取消选中
            if (this.selectedComponent) {
                this.selectedComponent.deselect?.();
                this.selectedComponent = null;
            }
            window.EventBus.emit('component:deselected');
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

        const intersects = this.raycaster.intersectObjects(meshes, true);
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
            configurable: component.getConfigurableOptions?.() || [],
            currentConfig: component.getConfig?.()
        });
    }

    /**
     * 应用材质到指定组件
     * 侧壁按组同步：修改一个，同组全部变化
     */
    applyMaterial(componentKey, materialKey) {
        // 定义同步组（使用 components Map 中的 key）
        const sideWallSides = ['leftFrontWall', 'leftRearWall', 'rightFrontWall', 'rightRearWall'];
        const sideWallMiddles = ['leftMiddleWall', 'rightMiddleWall'];
        const backWallSides = ['backLeftWall', 'backRightWall'];
        const frontWallSides = ['frontLeftWall', 'frontRightWall'];

        // 根据组件的 configKey 判断属于哪个组
        // configKey 格式: cabin.sideWall.left.front, cabin.backWall.left, cabin.frontWall.left
        let targetGroup = null;

        // 先获取组件以检查其 configKey
        let targetComponent = this.components.get(componentKey);

        // 如果直接找不到，可能是通过 configKey 传入的，需要遍历查找
        if (!targetComponent) {
            for (const [key, comp] of this.components) {
                if (comp.configKey === componentKey) {
                    targetComponent = comp;
                    componentKey = key;
                    break;
                }
            }
        }

        // 根据 configKey 或 componentKey 判断分组
        if (targetComponent) {
            const ck = targetComponent.configKey || componentKey;

            // 侧壁两侧: 包含 sideWall 且是 front 或 rear
            if (ck.includes('sideWall') && (ck.includes('.front') || ck.includes('.rear'))) {
                targetGroup = sideWallSides;
            }
            // 侧壁中间: 包含 sideWall 且是 middle
            else if (ck.includes('sideWall') && ck.includes('.middle')) {
                targetGroup = sideWallMiddles;
            }
            // 后壁两侧: 包含 backWall 且是 left 或 right
            else if (ck.includes('backWall') && (ck.includes('.left') || ck.includes('.right'))) {
                targetGroup = backWallSides;
            }
            // 前壁两侧: 包含 frontWall 且是 left 或 right
            else if (ck.includes('frontWall') && (ck.includes('.left') || ck.includes('.right'))) {
                targetGroup = frontWallSides;
            }
        }

        // 如果属于某个同步组，应用材质到组内所有组件
        if (targetGroup) {
            targetGroup.forEach((key) => {
                const component = this.components.get(key);
                if (component && component.applyMaterial) {
                    component.applyMaterial(materialKey);
                }
            });
        } else {
            // 不属于任何组的组件，单独应用材质
            const component = this.components.get(componentKey) || targetComponent;
            if (component && component.applyMaterial) {
                component.applyMaterial(materialKey);
            }
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
     * 设置按钮颜色
     */
    setButtonColor(componentKey, colorKey) {
        const component = this.components.get(componentKey);
        if (component && component.setButtonColor) {
            component.setButtonColor(colorKey);
        }
    }

    /**
     * 设置操控箱面板颜色
     */
    setPanelColor(componentKey, colorKey) {
        const component = this.components.get(componentKey);
        if (component && component.setPanelColor) {
            component.setPanelColor(colorKey);
        }
    }

    /**
     * 设置屏幕类型
     */
    setScreenType(componentKey, typeKey) {
        const component = this.components.get(componentKey);
        if (component && component.setScreenType) {
            component.setScreenType(typeKey);
        }
    }

    /**
     * 获取所有组件配置
     */
    getAllConfigs() {
        const configs = {};
        this.components.forEach((component, key) => {
            if (component.getConfig) {
                configs[key] = component.getConfig();
            }
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
     * 显示配置器
     */
    show() {
        this.container.style.display = 'block';
        this._onResize();
    }

    /**
     * 隐藏配置器
     */
    hide() {
        this.container.style.display = 'none';
    }

    /**
     * 销毁配置器
     */
    dispose() {
        // 销毁所有组件
        this.components.forEach((component) => {
            if (component.dispose) {
                component.dispose();
            }
        });
        this.components.clear();

        // 清理 Three.js 资源
        this.renderer.dispose();
        this.renderer.domElement.remove();

        window.removeEventListener('resize', () => this._onResize());
    }
}

export default CabinConfigurator;
