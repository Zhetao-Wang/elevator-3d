import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

// --- 1. 基础场景 ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a1a);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(2, 1.5, 4);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.toneMapping = THREE.LinearToneMapping;
renderer.toneMappingExposure = 0.8;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const pmremGenerator = new THREE.PMREMGenerator(renderer);
scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;

// --- 2. 召唤盒主体 ---
const elevatorBox = new THREE.Group();
scene.add(elevatorBox);

const metalMat = new THREE.MeshPhysicalMaterial({ color: 0xaaaaaa, metalness: 1.0, roughness: 0.3 });
const metalPart = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.8, 0.15), metalMat);
metalPart.position.set(0, -0.6, 0);
elevatorBox.add(metalPart);

const glassMat = new THREE.MeshPhysicalMaterial({ color: 0x000000, metalness: 0.2, roughness: 0.01, clearcoat: 1.0 });
const glassPart = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 0.15), glassMat);
glassPart.position.set(0, 0.9, 0);
elevatorBox.add(glassPart);

const buttonsGroup = new THREE.Group();
elevatorBox.add(buttonsGroup);

// 数字显示器组
const displayGroup = new THREE.Group();
elevatorBox.add(displayGroup);

// --- 3. 后期辉光设置 ---
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

// 降低 Bloom 强度，让颜色更自然
const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.15,  // 强度大幅降低
    0.3,   // 半径
    0.7    // 阈值提高，只有高亮部分发光
);
composer.addPass(bloomPass);

// ==========================================
// 4. 创建数字纹理
// ==========================================
function createNumberTexture(number, color, type = 'white-seg') {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    // 透明背景，不填充黑色

    if (type === 'white-seg') {
        // 段码屏风格 - 白色数字
        ctx.fillStyle = color === 'red' ? '#ff3333' : '#ffffff';
        ctx.font = 'bold 80px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 10;
        ctx.fillText(number.toString().padStart(2, '0'), canvas.width / 2, canvas.height / 2);
    } else {
        // 红色点阵风格 - 简化显示，直接用发光字体
        ctx.fillStyle = '#ff0000';
        ctx.font = 'bold 80px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = '#ff0000';
        ctx.shadowBlur = 15;
        ctx.fillText(number.toString().padStart(2, '0'), canvas.width / 2, canvas.height / 2);
    }

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}


let displayMesh = null;
let currentFloor = 1;

function updateDisplay() {
    const dispModel = document.getElementById('disp-model').value;
    const btnColor = document.getElementById('btn-color').value;

    // 根据按钮颜色决定数字颜色
    let color = 'white';
    if (btnColor === 'red') color = 'red';
    if (btnColor === 'blue') color = 'blue';

    if (displayMesh) {
        displayGroup.remove(displayMesh);
        displayMesh.geometry.dispose();
        displayMesh.material.map.dispose();
        displayMesh.material.dispose();
    }

    const texture = createNumberTexture(currentFloor, color, dispModel);
    // 启用纹理透明
    texture.needsUpdate = true;
    const displayGeo = new THREE.PlaneGeometry(0.8, 0.4);
    const displayMat = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 1.0,
        alphaTest: 0.1  // 剔除完全透明部分
    });

    displayMesh = new THREE.Mesh(displayGeo, displayMat);
    displayMesh.position.set(0, 0.9, 0.08);
    displayGroup.add(displayMesh);
}

// ==========================================
// 5. 配置更新逻辑
// ==========================================
window.updateModel = function() {
    const matVal = document.getElementById('mat-select').value;
    const btnVal = document.getElementById('btn-model').value;
    const colorVal = document.getElementById('btn-color').value;

    // 材质颜色更新
    if (matVal.includes('st-')) metalMat.color.setHex(0xaaaaaa);
    if (matVal.includes('ti-')) metalMat.color.setHex(0xc5a059);
    if (matVal.includes('bk-')) metalMat.color.setHex(0x222222);
    metalMat.roughness = matVal.includes('mirror') ? 0.05 : 0.35;

    // 颜色映射 - 使用更鲜明的颜色
    const colorMap = {
        'white': 0xffffff,
        'blue': 0x0088ff,
        'red': 0xff2200,
        'white-blue': 0x66aaff
    };
    const ledHex = colorMap[colorVal] || 0xffffff;

    // 清空按钮组
    while(buttonsGroup.children.length > 0) buttonsGroup.remove(buttonsGroup.children[0]);

    function createBtn(yPos) {
        const group = new THREE.Group();
        const bMat = new THREE.MeshPhysicalMaterial({ color: 0xcccccc, metalness: 1.0, roughness: 0.2 });

        // 发光材质 - 大幅降低发光强度
        const gMat = new THREE.MeshStandardMaterial({
            color: 0x111111,
            emissive: ledHex,
            emissiveIntensity: 0.8  // 大幅降低，避免过曝
        });

        const isSq = btnVal.includes('101') || btnVal.includes('111');
        // 给所有按钮都添加发光效果（不只是带-C的）
        if (!isSq) {
            // 圆形按钮
            group.add(new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.02, 16, 64), bMat));
            const c = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.04, 32), bMat);
            c.rotation.x = Math.PI / 2;
            group.add(c);
            // 发光圈
            const glow = new THREE.Mesh(new THREE.TorusGeometry(0.145, 0.012, 16, 64), gMat);
            glow.position.z = 0.025;
            group.add(glow);
        } else {
            // 方形按钮
            group.add(new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 0.04), bMat));
            const c = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.26, 0.06), bMat);
            c.position.z = 0.01;
            group.add(c);
            // 发光圈
            const glow = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.04), gMat);
            glow.position.z = 0.008;
            group.add(glow);
        }
        group.position.set(0, yPos, 0.08);
        return group;
    }

    buttonsGroup.add(createBtn(-0.35));
    buttonsGroup.add(createBtn(-1.0));

    // 更新数字显示
    updateDisplay();
};

// 数字固定显示 01 楼

window.updateModel();

// --- 6. 渲染循环 ---
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    composer.render();
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
});
