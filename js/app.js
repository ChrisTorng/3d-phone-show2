import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// 全域變數
let camera, scene, renderer, controls;
let phone;
let composer;
let bloomPass, bokehPass;
let autoRotate = true;
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

// 載入手機模型
function loadPhoneModel(modelPath) {
    const loader = new GLTFLoader();
    loader.load(modelPath, function(gltf) {
        phone = gltf.scene;
        phone.traverse(function(child) {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        scene.add(phone);
    }, undefined, function(error) {
        console.error('載入模型時發生錯誤:', error);
    });
}

// 載入手機模型並設定位置
function loadPhoneModelWithPosition(modelPath, position) {
    const loader = new GLTFLoader();
    loader.load(modelPath, function(gltf) {
        const phoneModel = gltf.scene;
        phoneModel.position.set(position.x, position.y, position.z);
        phoneModel.traverse(function(child) {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        scene.add(phoneModel);
    }, undefined, function(error) {
        console.error('載入模型時發生錯誤:', error);
    });
}

// 載入手機模型並設定位置和縮放比率
function loadPhoneModelWithPositionAndScale(modelPath, position, scale) {
    const loader = new GLTFLoader();
    loader.load(modelPath, function(gltf) {
        const phoneModel = gltf.scene;
        phoneModel.position.set(position.x, position.y, position.z);
        phoneModel.scale.set(scale, scale, scale);
        phoneModel.traverse(function(child) {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        scene.add(phoneModel);
    }, undefined, function(error) {
        console.error('載入模型時發生錯誤:', error);
    });
}

// 載入手機模型並設定位置、縮放比率和旋轉角度
function loadPhoneModelWithPositionScaleAndRotation(modelPath, position, scale, rotation) {
    const loader = new GLTFLoader();
    loader.load(modelPath, function(gltf) {
        const phoneModel = gltf.scene;
        phoneModel.position.set(position.x, position.y, position.z);
        phoneModel.scale.set(scale, scale, scale);
        phoneModel.rotation.set(rotation.x, rotation.y, rotation.z);
        phoneModel.traverse(function(child) {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        scene.add(phoneModel);
    }, undefined, function(error) {
        console.error('載入模型時發生錯誤:', error);
    });
}

// 修改 loadAllPhoneModels 函式以包含旋轉角度
function loadAllPhoneModels() {
    const models = [
        'models/iphone_16_pro_max.glb',
        'models/samsung_galaxy_s22_ultra.glb',
        'models/Samsung_Galaxy_Z_Flip_3.glb'
    ];

    const positions = [
        { x: -2, y: 0, z: 0 },
        { x: 0, y: -0.8, z: 0 },
        { x: 2, y: 0, z: 0 }
    ];

    const scales = [
        1, // iPhone 16 Pro Max
        0.3, // Samsung Galaxy S22 Ultra
        1.5 // Samsung Galaxy Z Flip 3
    ];

    const rotations = [
        { x: 0, y: Math.PI / 2, z: 0 }, // iPhone 16 Pro Max 右轉 90 度
        { x: 0, y: 0, z: 0 }, // Samsung Galaxy S22 Ultra
        { x: 0, y: Math.PI, z: 0 } // Samsung Galaxy Z Flip 3 旋轉 180 度
    ];

    models.forEach((model, index) => {
        loadPhoneModelWithPositionScaleAndRotation(model, positions[index], scales[index], rotations[index]);
    });
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
    // 載入全部手機模型
    loadAllPhoneModels();
});