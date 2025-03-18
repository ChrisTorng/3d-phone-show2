# 3D 手機展示平台

## 專案目的

這是一個互動式 3D 手機展示平台，使用 Three.js 建立。用戶可以通過滑鼠拖曳進行旋轉，滾輪進行縮放，並使用控制面板來調整手機顏色和視覺效果。

## 安裝步驟

1. 克隆此儲存庫：

```bash
$ git clone https://github.com/ChrisTorng/3d-phone-show2.git
```

2. 進入專案目錄：

```bash
$ cd 3d-phone-show2
```

3. 安裝相依套件：

```bash
$ pip install -r requirements.txt
```

4. 啟動 Flask 伺服器：

```bash
$ python index.py
```

5. 在瀏覽器中打開 `http://localhost:5000` 以查看 3D 手機展示平台。

## 使用方法

- 使用滑鼠拖曳進行旋轉。
- 使用滾輪進行縮放。
- 使用控制面板來調整手機顏色和視覺效果。

## 相依套件

- Flask
- Three.js
- RGBELoader
- OrbitControls
- EffectComposer
- RenderPass
- UnrealBloomPass
- BokehPass
- GLTFLoader
- GUI

## 版本控制

使用 Git 來進行版本控制。所有變更應提交到 Git 儲存庫，提交訊息應簡潔明瞭，並解釋變更的內容。

## 測試

所有功能應包含對應的單元測試。測試檔案應放置在 `tests/` 目錄中，使用 `pytest` 來執行測試。

## 文件

所有函式和類別應包含 docstring 來解釋其功能。專案應包含一個詳細的 `README.md` 文件，解釋專案的目的、安裝步驟和使用方法。

## 其他

- 確保程式碼沒有語法錯誤和警告。
- 使用 linters 來檢查程式碼品質，例如 `flake8` 或 `pylint`。
- 確保程式碼具有良好的可讀性和可維護性。