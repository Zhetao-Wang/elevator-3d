import * as THREE from 'three';
import { BaseComponent } from './BaseComponent.js';

// 召唤盒组件（壁挂式）
export class CallBox extends BaseComponent {
    constructor(scene, materialLibrary) {
        super(scene, '召唤盒', 'callBox');
        this.materialLibrary = materialLibrary;

        this.currentMaterial = 'st-hairline';
        this.currentButtonModel = 'circle';
        this.currentButtonColor = 'white';
        this.currentDisplayModel = 'seg-white';

        this.callBoxGroup = null;
        this.displayMesh = null;
        this.texture = null;
        this.meshes = [];

        // 按钮配置
        this.buttonModels = {
            circle: { name: '圆形按钮', geometry: 'cylinder' },
            square: { name: '方形按钮', geometry: 'box' }
        };

        // 按钮颜色
        this.buttonColors = {
            white: { name: '白光', hex: 0xffffff, emissive: 0xffffff },
            red: { name: '红光', hex: 0xff3300, emissive: 0xff0000 },
            blue: { name: '蓝光', hex: 0x0088ff, emissive: 0x0088ff }
        };
    }

    create() {
        this.createCallBox();
        return this;
    }

    createCallBox() {
        // 清除旧召唤盒
        this.disposeMeshes();
        if (this.callBoxGroup) {
            this.scene.remove(this.callBoxGroup);
        }
        this.meshes = [];

        const material = this.materialLibrary.get(this.currentMaterial);
        if (!material) {
            console.warn(`[CallBox] 材质 ${this.currentMaterial} 不存在`);
            return;
        }

        this.callBoxGroup = new THREE.Group();
        this.callBoxGroup.name = 'CallBox';

        // 面板主体
        const panelWidth = 0.3;
        const panelHeight = 0.7;
        const panelDepth = 0.04;

        const panelGeo = new THREE.BoxGeometry(panelWidth, panelHeight, panelDepth);
        const panelMesh = new THREE.Mesh(panelGeo, material.clone());
        panelMesh.userData.componentRef = this;
        this.meshes.push(panelMesh);
        this.callBoxGroup.add(panelMesh);

        // 显示器区域（黑色玻璃）
        const glassGeo = new THREE.BoxGeometry(panelWidth - 0.06, 0.21, 0.01);
        const glassMat = new THREE.MeshPhysicalMaterial({
            color: 0x000000,
            metalness: 0.2,
            roughness: 0.05,
            clearcoat: 1.0
        });
        const glassMesh = new THREE.Mesh(glassGeo, glassMat);
        glassMesh.position.set(0, 0.15, panelDepth / 2 + 0.005);
        this.callBoxGroup.add(glassMesh);

        // 创建楼层显示
        this.createDisplay();

        // 按钮区域
        const btnColor = this.buttonColors[this.currentButtonColor];
        const btnYPositions = [-0.08, -0.22];

        btnYPositions.forEach((yPos, index) => {
            const btnGroup = new THREE.Group();

            if (this.currentButtonModel === 'circle') {
                // 圆形按钮
                const ringGeo = new THREE.TorusGeometry(0.06, 0.008, 16, 64);
                const ringMat = new THREE.MeshStandardMaterial({
                    color: 0xcccccc,
                    metalness: 1.0,
                    roughness: 0.2
                });
                const ring = new THREE.Mesh(ringGeo, ringMat);
                ring.position.z = panelDepth / 2 + 0.01;
                btnGroup.add(ring);

                // 按钮本体
                const btnGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.015, 32);
                const btnMat = new THREE.MeshStandardMaterial({
                    color: 0xcccccc,
                    metalness: 1.0,
                    roughness: 0.2
                });
                const btn = new THREE.Mesh(btnGeo, btnMat);
                btn.rotation.x = Math.PI / 2;
                btn.position.z = panelDepth / 2 + 0.008;
                btnGroup.add(btn);

                // 发光圈
                const glowGeo = new THREE.TorusGeometry(0.052, 0.005, 16, 64);
                const glowMat = new THREE.MeshStandardMaterial({
                    color: 0x111111,
                    emissive: btnColor.emissive,
                    emissiveIntensity: 0.8
                });
                const glow = new THREE.Mesh(glowGeo, glowMat);
                glow.position.z = panelDepth / 2 + 0.015;
                btnGroup.add(glow);
            } else {
                // 方形按钮
                const frameGeo = new THREE.BoxGeometry(0.12, 0.12, 0.01);
                const frameMat = new THREE.MeshStandardMaterial({
                    color: 0xcccccc,
                    metalness: 1.0,
                    roughness: 0.2
                });
                const frame = new THREE.Mesh(frameGeo, frameMat);
                frame.position.z = panelDepth / 2 + 0.005;
                btnGroup.add(frame);

                // 按钮本体
                const btnGeo = new THREE.BoxGeometry(0.09, 0.09, 0.012);
                const btnMat = new THREE.MeshStandardMaterial({
                    color: 0xcccccc,
                    metalness: 1.0,
                    roughness: 0.2
                });
                const btn = new THREE.Mesh(btnGeo, btnMat);
                btn.position.z = panelDepth / 2 + 0.006;
                btnGroup.add(btn);

                // 发光方块
                const glowGeo = new THREE.BoxGeometry(0.1, 0.1, 0.005);
                const glowMat = new THREE.MeshStandardMaterial({
                    color: 0x111111,
                    emissive: btnColor.emissive,
                    emissiveIntensity: 0.8
                });
                const glow = new THREE.Mesh(glowGeo, glowMat);
                glow.position.z = panelDepth / 2 + 0.012;
                btnGroup.add(glow);
            }

            btnGroup.position.y = yPos;
            this.callBoxGroup.add(btnGroup);
        });

        // 设置位置（门右侧墙壁）
        this.callBoxGroup.position.set(1.5, 0.3, 0.3);

        this.scene.add(this.callBoxGroup);
    }

    createDisplay() {
        const model = {
            bgColor: '#000000',
            textColor: this.currentDisplayModel === 'seg-white' ? '#ffffff' : '#ff0000'
        };

        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');

        // 背景
        ctx.fillStyle = model.bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 数字
        ctx.fillStyle = model.textColor;
        ctx.font = 'bold 40px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = model.textColor;
        ctx.shadowBlur = 8;
        ctx.fillText('01', canvas.width / 2, canvas.height / 2);

        if (this.texture) {
            this.texture.dispose();
        }
        this.texture = new THREE.CanvasTexture(canvas);

        const screenGeo = new THREE.PlaneGeometry(0.22, 0.11);
        const screenMat = new THREE.MeshBasicMaterial({
            map: this.texture,
            transparent: true
        });

        if (this.displayMesh) {
            this.callBoxGroup.remove(this.displayMesh);
        }

        this.displayMesh = new THREE.Mesh(screenGeo, screenMat);
        this.displayMesh.position.set(0, 0.15, 0.04);
        this.callBoxGroup.add(this.displayMesh);
    }

    // 应用材质
    applyMaterial(materialKey) {
        if (!this.materialLibrary.has(materialKey)) {
            console.warn(`[CallBox] 材质 ${materialKey} 不存在`);
            return;
        }
        this.currentMaterial = materialKey;
        this.createCallBox();
        this.dispatchEvent({ type: 'materialChanged', material: materialKey });
    }

    // 设置按钮型号
    setButtonModel(modelKey) {
        if (!this.buttonModels[modelKey]) {
            console.warn(`[CallBox] 按钮型号 ${modelKey} 不存在`);
            return;
        }
        this.currentButtonModel = modelKey;
        this.createCallBox();
        this.dispatchEvent({ type: 'buttonModelChanged', model: modelKey });
    }

    // 设置按钮颜色
    setButtonColor(colorKey) {
        if (!this.buttonColors[colorKey]) {
            console.warn(`[CallBox] 按钮颜色 ${colorKey} 不存在`);
            return;
        }
        this.currentButtonColor = colorKey;
        this.createCallBox();
        this.dispatchEvent({ type: 'buttonColorChanged', color: colorKey });
    }

    // 设置显示器型号
    setDisplayModel(modelKey) {
        const validModels = ['seg-white', 'dot-red'];
        if (!validModels.includes(modelKey)) {
            console.warn(`[CallBox] 显示器型号 ${modelKey} 不存在`);
            return;
        }
        this.currentDisplayModel = modelKey;
        this.createCallBox();
        this.dispatchEvent({ type: 'displayModelChanged', model: modelKey });
    }

    getConfigurableOptions() {
        return ['material', 'buttonModel', 'buttonColor', 'displayModel'];
    }

    getButtonModelOptions() {
        return Object.keys(this.buttonModels).map(key => ({
            key,
            name: this.buttonModels[key].name
        }));
    }

    getButtonColorOptions() {
        return Object.keys(this.buttonColors).map(key => ({
            key,
            name: this.buttonColors[key].name
        }));
    }

    getDisplayModelOptions() {
        return [
            { key: 'seg-white', name: '黑底白字段码' },
            { key: 'dot-red', name: '红色点阵' }
        ];
    }

    getConfig() {
        return {
            name: this.name,
            configKey: this.configKey,
            material: this.currentMaterial,
            buttonModel: this.currentButtonModel,
            buttonColor: this.currentButtonColor,
            displayModel: this.currentDisplayModel
        };
    }

    disposeMeshes() {
        this.meshes.forEach(mesh => {
            if (mesh.geometry) mesh.geometry.dispose();
            if (mesh.material) mesh.material.dispose();
        });
        this.meshes = [];
    }

    dispose() {
        this.disposeMeshes();
        if (this.callBoxGroup) {
            this.scene.remove(this.callBoxGroup);
            this.callBoxGroup = null;
        }
        if (this.texture) {
            this.texture.dispose();
            this.texture = null;
        }
        super.dispose();
    }
}

export default CallBox;
