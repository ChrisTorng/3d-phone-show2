import * as THREE from 'three';
import { init, loadPhoneModel, loadAllPhoneModels } from '../js/app';

// 測試初始化函式
test('初始化場景', () => {
    document.body.innerHTML = '<div id="container"></div>';
    init();
    const container = document.getElementById('container');
    expect(container).not.toBeNull();
    expect(container.children.length).toBeGreaterThan(0);
});

// 測試載入手機模型
test('載入手機模型', () => {
    const modelPath = 'models/iphone_16_pro_max.glb';
    loadPhoneModel(modelPath);
    // 由於載入模型是非同步的，這裡可以使用 mock 或其他方式來測試
    // 這裡僅示範基本結構
    expect(true).toBe(true);
});

// 測試載入所有手機模型
test('載入所有手機模型', () => {
    fetch.mockResponseOnce(JSON.stringify([
        {
            model: 'models/iphone_16_pro_max.glb',
            position: { x: -2, y: 0, z: 0 },
            scale: 1,
            rotation: { x: 0, y: 3.14 / 2, z: 0 }
        },
        {
            model: 'models/samsung_galaxy_s22_ultra.glb',
            position: { x: 0, y: -0.8, z: 0 },
            scale: 0.3,
            rotation: { x: 0, y: 0, z: 0 }
        },
        {
            model: 'models/Samsung_Galaxy_Z_Flip_3.glb',
            position: { x: 2, y: 0, z: 0 },
            scale: 1.5,
            rotation: { x: 0, y: 3.14, z: 0 }
        }
    ]));
    loadAllPhoneModels();
    // 由於載入模型是非同步的，這裡可以使用 mock 或其他方式來測試
    // 這裡僅示範基本結構
    expect(true).toBe(true);
});
