import * as THREE from 'three';
import { BaseComponent } from '../BaseComponent.js';

/**
 * 轿厢右前壁组件（带嵌入式操纵箱）
 */
export class CabinFrontRightWall extends BaseComponent {
    constructor(scene, materialLibrary) {
        super(scene, '右前壁', 'cabin.frontWall.right');
        this.materialLibrary = materialLibrary;
        this.meshes = [];
        this.currentMaterial = 'st-hairline';
        this.buttonColor = 'white';
        this.panelColor = 'dark'; // 面板颜色: dark, silver
        this.screenType = 'black'; // 屏幕类型: black, blue

        // 尺寸 - 门更窄(0.8m)，两侧壁板更宽(0.7m)
        this.width = 0.7;
        this.height = 2.4;
        this.wallThickness = 0.02;

        // 子部件引用
        this.panelMesh = null;
        this.screenMesh = null;
        this.buttonMeshes = [];
    }

    create() {
        this.mesh = this._createWallMesh();
        if (this.mesh) {
            this.addToScene();
            this.applyMaterial(this.currentMaterial);
            this._updateMeshesArray();
        }
    }

    _createWallMesh() {
        const group = new THREE.Group();

        // 主体壁板
        const panel = new THREE.Mesh(
            new THREE.BoxGeometry(this.width, this.height, this.wallThickness),
            null
        );
        panel.position.set(0, this.height / 2, 0);
        panel.userData.componentRef = this;
        panel.userData.partType = 'panel';
        group.add(panel);

        // 嵌入式的竖直操纵箱
        this._addControlPanel(group);

        // 位置：门右侧 - 门宽1.0m，右边缘在0.5，壁板紧邻门放置
        group.position.set(0.5 + this.width / 2, 0, -1.0);
        group.userData.componentRef = this;

        return group;
    }

    _addControlPanel(group) {
        const panelWidth = 0.14;
        const panelHeight = 1.0;
        const panelX = 0; // 居中
        const panelY = this.height / 2 + 0.1; // 偏上
        const panelZ = this.wallThickness / 2;

        // 操纵箱面板颜色
        const panelColors = {
            dark: 0x1a1a1a,
            silver: 0x888888
        };

        // 操纵箱面板（与墙面齐平或略微凹陷）
        const panel = new THREE.Mesh(
            new THREE.BoxGeometry(panelWidth, panelHeight, 0.005),
            new THREE.MeshStandardMaterial({
                color: panelColors[this.panelColor] || panelColors.dark,
                roughness: 0.3,
                metalness: 0.5
            })
        );
        panel.position.set(panelX, panelY, panelZ);
        panel.userData.componentRef = this;
        panel.userData.partType = 'controlPanel';
        panel.userData.isConfigurable = true;
        panel.userData.configName = '操纵箱面板';
        this.panelMesh = panel;
        group.add(panel);

        // 显示屏区域
        const screenWidth = 0.1;
        const screenHeight = 0.12;
        const screenY = panelY + panelHeight / 2 - screenHeight / 2 - 0.03;

        const screenColors = {
            black: 0x000000,
            blue: 0x001133
        };

        const screen = new THREE.Mesh(
            new THREE.PlaneGeometry(screenWidth, screenHeight),
            new THREE.MeshBasicMaterial({ color: screenColors[this.screenType] || screenColors.black })
        );
        screen.position.set(panelX, screenY, panelZ + 0.003);
        screen.userData.componentRef = this;
        screen.userData.partType = 'screen';
        screen.userData.isConfigurable = true;
        screen.userData.configName = '显示屏';
        this.screenMesh = screen;
        group.add(screen);

        // 楼层数字（白色）
        const floorNumber = new THREE.Mesh(
            new THREE.PlaneGeometry(0.06, 0.08),
            new THREE.MeshBasicMaterial({ color: 0xffffff })
        );
        floorNumber.position.set(panelX, screenY + 0.01, panelZ + 0.004);
        floorNumber.userData.componentRef = this;
        floorNumber.userData.partType = 'floorNumber';
        group.add(floorNumber);

        // 按钮 - 垂直排列成一列
        const buttonCount = 8;
        const buttonStartY = screenY - screenHeight / 2 - 0.04;
        const buttonSpacing = 0.09;

        this.buttonMeshes = [];
        for (let i = 0; i < buttonCount; i++) {
            const y = buttonStartY - i * buttonSpacing;
            this._createButton(group, panelX, y, panelZ);
        }

        // 底部功能按钮（开门、关门、报警）
        const funcY = buttonStartY - buttonCount * buttonSpacing - 0.03;
        const funcSpacing = 0.035;

        // 开门按钮
        this._createFunctionButton(group, panelX - funcSpacing, funcY, panelZ, 'open');
        // 关门按钮
        this._createFunctionButton(group, panelX, funcY, panelZ, 'close');
        // 报警按钮
        this._createFunctionButton(group, panelX + funcSpacing, funcY, panelZ, 'alarm');
    }

    _createButton(group, x, y, z) {
        // 按钮底座（金属环）
        const ring = new THREE.Mesh(
            new THREE.RingGeometry(0.018, 0.022, 32),
            new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.8, roughness: 0.3 })
        );
        ring.position.set(x, y, z + 0.002);
        ring.userData.componentRef = this;
        ring.userData.partType = 'buttonRing';
        group.add(ring);

        // 按钮本体
        const color = this.buttonColor === 'white' ? 0xffffff : 0xffaa00;
        const button = new THREE.Mesh(
            new THREE.CircleGeometry(0.016, 32),
            new THREE.MeshStandardMaterial({
                color: color,
                emissive: color,
                emissiveIntensity: 0.1
            })
        );
        button.position.set(x, y, z + 0.003);
        button.userData.componentRef = this;
        button.userData.partType = 'button';
        button.userData.isConfigurable = true;
        button.userData.configName = '按钮';
        this.buttonMeshes.push(button);
        group.add(button);
    }

    _createFunctionButton(group, x, y, z, type) {
        let color = 0xcccccc;
        if (type === 'alarm') color = 0xffcc00; // 黄色报警按钮

        const button = new THREE.Mesh(
            new THREE.CircleGeometry(0.014, 32),
            new THREE.MeshStandardMaterial({
                color: color,
                emissive: color,
                emissiveIntensity: 0.1
            })
        );
        button.position.set(x, y, z + 0.003);
        button.userData.componentRef = this;
        button.userData.partType = 'funcButton';
        button.userData.isConfigurable = true;
        button.userData.configName = type === 'alarm' ? '报警按钮' : (type === 'open' ? '开门按钮' : '关门按钮');
        this.buttonMeshes.push(button);
        group.add(button);
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

    setButtonColor(color) {
        this.buttonColor = color;
        this.removeFromScene();
        this.mesh = this._createWallMesh();
        this.addToScene();
        this.applyMaterial(this.currentMaterial);
        this._updateMeshesArray();
    }

    setPanelColor(color) {
        if (!['dark', 'silver'].includes(color)) return;
        this.panelColor = color;
        this.removeFromScene();
        this.mesh = this._createWallMesh();
        this.addToScene();
        this.applyMaterial(this.currentMaterial);
        this._updateMeshesArray();
    }

    setScreenType(type) {
        if (!['black', 'blue'].includes(type)) return;
        this.screenType = type;
        this.removeFromScene();
        this.mesh = this._createWallMesh();
        this.addToScene();
        this.applyMaterial(this.currentMaterial);
        this._updateMeshesArray();
    }

    _updateMeshesArray() {
        // 重新收集所有可配置的 meshes
        this.meshes = [];
        if (this.mesh) {
            this.mesh.traverse((child) => {
                if (child.isMesh && child.userData.componentRef === this) {
                    this.meshes.push(child);
                }
            });
        }
    }

    getConfigurableOptions() {
        return ['material', 'buttonColor', 'panelColor', 'screenType'];
    }

    getPanelColorOptions() {
        return [
            { key: 'dark', name: '黑色面板' },
            { key: 'silver', name: '银色面板' }
        ];
    }

    getScreenTypeOptions() {
        return [
            { key: 'black', name: '黑屏' },
            { key: 'blue', name: '蓝屏' }
        ];
    }

    getButtonColorOptions() {
        return [
            { key: 'white', name: '白色按钮' },
            { key: 'orange', name: '橙色按钮' }
        ];
    }

    getConfig() {
        return {
            name: this.name,
            configKey: this.configKey,
            material: this.currentMaterial,
            buttonColor: this.buttonColor,
            panelColor: this.panelColor,
            screenType: this.screenType
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
        this.panelMesh = null;
        this.screenMesh = null;
        this.buttonMeshes = [];
    }
}

export default CabinFrontRightWall;