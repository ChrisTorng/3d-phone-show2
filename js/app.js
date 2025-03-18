import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';

// 全域變數
let camera, scene, renderer, controls;
let phone;
let composer;
let bloomPass, bokehPass;
let autoRotate = true;
let phoneColor = 0x000000;
let screenColor = 0x2196F3;
let envMap;
let gui;

// 初始化函式
function init() {
    // 建立場景
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);
    
    // 建立相機
    camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, 0, 5);

    // 建立渲染器
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.outputEncoding = THREE.sRGBEncoding;
    document.getElementById('container').appendChild(renderer.domElement);

    // 建立燈光
    setupLights();

    // 建立控制項
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 1;
    controls.maxDistance = 10;
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 1.0;

    // 檢測滑鼠拖曳和滾輪事件
    controls.addEventListener('start', function() {
        controls.autoRotate = false;
        const autoRotateController = gui.folders[1].controllers.find(controller => controller.property === 'autoRotate');
        if (autoRotateController) {
            autoRotateController.setValue(false);
        }
    });

    // 建立後處理效果
    setupPostProcessing();

    // 建立 GUI 控制面板
    setupGUI();

    // 處理視窗大小變更
    window.addEventListener('resize', onWindowResize);

    // 新增地板網格以增強 3D 空間感
    addFloor();

    // 載入環境貼圖
    loadEnvironmentMap();
}

// 載入環境貼圖
function loadEnvironmentMap() {
    new RGBELoader()
        .setPath('https://threejs.org/examples/textures/equirectangular/')
        .load('royal_esplanade_1k.hdr', function(texture) {
            texture.mapping = THREE.EquirectangularReflectionMapping;
            envMap = texture;
            scene.environment = texture;
            
            // 環境貼圖載入後建立手機模型
            createPhoneModel();
        });
}

// 建立燈光
function setupLights() {
    // 環境光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    // 主要方向光
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 20;
    directionalLight.shadow.bias = -0.0001;
    scene.add(directionalLight);

    // 輔助方向光
    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight2.position.set(-5, -5, -5);
    scene.add(directionalLight2);

    // 強調光
    const spotLight = new THREE.SpotLight(0xffffbb, 1);
    spotLight.position.set(0, 3, 0);
    spotLight.angle = Math.PI / 6;
    spotLight.penumbra = 0.2;
    spotLight.decay = 2;
    spotLight.distance = 50;
    spotLight.castShadow = true;
    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;
    scene.add(spotLight);
}

// 設定後處理效果
function setupPostProcessing() {
    composer = new EffectComposer(renderer);
    
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    // 發光效果
    bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        0.1,   // 強度
        0.4,   // 半徑
        0.85   // 閾值
    );
    composer.addPass(bloomPass);

    // 景深效果
    const bokehParams = {
        focus: 5.0,
        aperture: 0.0001,
        maxblur: 0.005
    };

    bokehPass = new BokehPass(scene, camera, bokehParams);
    bokehPass.enabled = false; // 預設關閉
    composer.addPass(bokehPass);
}

// 設定 GUI 控制面板
function setupGUI() {
    gui = new GUI();
    gui.domElement.style.marginTop = '50px';
    
    const phoneFolder = gui.addFolder('手機設定');
    
    // 手機顏色控制
    phoneFolder.addColor({ color: phoneColor }, 'color')
        .name('手機顏色')
        .onChange(function(color) {
            phoneColor = color;
            updatePhoneMaterials();
        });
    
    // 螢幕顏色控制
    phoneFolder.addColor({ color: screenColor }, 'color')
        .name('螢幕顏色')
        .onChange(function(color) {
            screenColor = color;
            updatePhoneMaterials();
        });
    
    const effectsFolder = gui.addFolder('效果設定');
    
    // 自動旋轉控制
    effectsFolder.add({ autoRotate }, 'autoRotate')
        .name('自動旋轉')
        .onChange(function(value) {
            controls.autoRotate = value;
        });
    
    // 發光效果控制
    effectsFolder.add({ bloom: bloomPass.enabled }, 'bloom')
        .name('發光效果')
        .onChange(function(value) {
            bloomPass.enabled = value;
        });

    // 發光強度控制
    effectsFolder.add({ strength: bloomPass.strength }, 'strength', 0, 3)
        .name('發光強度')
        .onChange(function(value) {
            bloomPass.strength = value;
        });
    
    // 景深效果控制
    effectsFolder.add({ bokeh: bokehPass.enabled }, 'bokeh')
        .name('景深效果')
        .onChange(function(value) {
            bokehPass.enabled = value;
        });

    phoneFolder.open();
    effectsFolder.open();
}

// 更新手機材質
function updatePhoneMaterials() {
    if (!phone) return;
    
    // 更新手機本體材質
    phone.material.color.set(phoneColor);
    
    // 更新螢幕材質
    const screen = phone.children.find(child => child.userData.isScreen);
    if (screen) {
        screen.material.color.set(screenColor);
        screen.material.emissive.set(screenColor);
    }
}

// 建立簡單的手機模型
function createPhoneModel() {
    // 確保環境貼圖已載入
    if (!envMap) {
        console.warn('環境貼圖尚未載入');
        return;
    }

    // 手機本體 - 一個長方體
    const phoneGeometry = new THREE.BoxGeometry(0.8, 1.6, 0.1);
    const phoneMaterial = new THREE.MeshPhysicalMaterial({ 
        color: phoneColor,
        metalness: 0.9,
        roughness: 0.2,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
        envMap: envMap,
        envMapIntensity: 1.0,
        reflectivity: 1.0
    });
    phone = new THREE.Mesh(phoneGeometry, phoneMaterial);
    phone.castShadow = true;
    phone.receiveShadow = true;
    scene.add(phone);

    // 手機圓角邊緣
    const edges = new THREE.EdgesGeometry(phoneGeometry);
    const edgeMaterial = new THREE.LineBasicMaterial({ 
        color: 0x888888,
        transparent: true,
        opacity: 0.3
    });
    const wireframe = new THREE.LineSegments(edges, edgeMaterial);
    phone.add(wireframe);

    // 手機邊框 - 略微大於手機本體的長方體，但厚度更薄
    const frameBevelRadius = 0.05;
    const frameGeometry = new THREE.BoxGeometry(0.84, 1.64, 0.12);
    const frameMaterial = new THREE.MeshPhysicalMaterial({ 
        color: 0xcccccc,
        metalness: 0.8,
        roughness: 0.2,
        clearcoat: 1.0,
        envMap: envMap,
        transparent: true,
        opacity: 0.3
    });
    const frame = new THREE.Mesh(frameGeometry, frameMaterial);
    frame.castShadow = true;
    frame.position.z = -0.01;
    phone.add(frame);

    // 螢幕 - 稍微在手機前方的長方體
    const screenGeometry = new THREE.BoxGeometry(0.75, 1.5, 0.01);
    const screenMaterial = new THREE.MeshPhysicalMaterial({ 
        color: screenColor,
        roughness: 0.1,
        metalness: 0.0,
        emissive: screenColor,
        emissiveIntensity: 0.5,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
        envMap: envMap,
        envMapIntensity: 1.0,
        transmission: 0.95,
        transparent: true
    });
    const screen = new THREE.Mesh(screenGeometry, screenMaterial);
    screen.position.z = 0.055;
    screen.castShadow = true;
    screen.receiveShadow = true;
    screen.userData.isScreen = true; // 標記螢幕物件以便後續更新
    phone.add(screen);

    // 相機鏡頭 - 小圓柱體
    const cameraGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.01, 16);
    const cameraMaterial = new THREE.MeshPhysicalMaterial({ 
        color: 0x111111, 
        metalness: 1.0,
        roughness: 0.1,
        envMap: envMap,
    });
    const phoneCam = new THREE.Mesh(cameraGeometry, cameraMaterial);
    phoneCam.position.set(0.2, 0.7, 0.06);
    phoneCam.rotation.x = Math.PI / 2;
    phoneCam.castShadow = true;
    phoneCam.receiveShadow = true;
    phone.add(phoneCam);

    // 鏡頭邊緣
    const cameraRingGeometry = new THREE.TorusGeometry(0.055, 0.01, 8, 24);
    const cameraRingMaterial = new THREE.MeshPhysicalMaterial({ 
        color: 0xdddddd, 
        metalness: 1.0,
        roughness: 0.1,
        envMap: envMap,
    });
    const cameraRing = new THREE.Mesh(cameraRingGeometry, cameraRingMaterial);
    cameraRing.position.set(0.2, 0.7, 0.065);
    cameraRing.rotation.x = Math.PI / 2;
    phone.add(cameraRing);

    // 按鈕 - 側邊的小長方體
    const buttonGeometry = new THREE.BoxGeometry(0.02, 0.1, 0.05);
    const buttonMaterial = new THREE.MeshPhysicalMaterial({ 
        color: 0x555555,
        metalness: 0.8,
        roughness: 0.2,
        envMap: envMap,
    });
    
    // 電源鍵
    const powerButton = new THREE.Mesh(buttonGeometry, buttonMaterial);
    powerButton.position.set(0.41, 0.3, 0);
    powerButton.castShadow = true;
    powerButton.receiveShadow = true;
    phone.add(powerButton);
    
    // 音量鍵
    const volUpButton = new THREE.Mesh(buttonGeometry, buttonMaterial);
    volUpButton.position.set(0.41, 0.5, 0);
    volUpButton.castShadow = true;
    volUpButton.receiveShadow = true;
    phone.add(volUpButton);
    
    const volDownButton = new THREE.Mesh(buttonGeometry, buttonMaterial);
    volDownButton.position.set(0.41, 0.65, 0);
    volDownButton.castShadow = true;
    volDownButton.receiveShadow = true;
    phone.add(volDownButton);
}

// 新增地板網格以增強 3D 空間感
function addFloor() {
    // 建立鏡面地板
    const floorGeometry = new THREE.CircleGeometry(7, 50);
    const floorMaterial = new THREE.MeshPhysicalMaterial({ 
        color: 0xffffff,
        metalness: 0.2,
        roughness: 0.1,
        envMap: envMap,
        reflectivity: 1.0,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.8;
    floor.receiveShadow = true;
    scene.add(floor);
    
    // 建立網格地板
    const gridHelper = new THREE.GridHelper(10, 20, 0x555555, 0x333333);
    gridHelper.position.y = -1.79;
    gridHelper.material.opacity = 0.3;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);
}

// 處理視窗大小變更
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
}

// 動畫循環函式
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    
    // 使用後處理器進行渲染
    composer.render();
}

// 使用 DOMContentLoaded 事件確保 DOM 與所有腳本都已載入完成
document.addEventListener('DOMContentLoaded', function() {
    init();
    animate();
});