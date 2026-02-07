<div align="center">

# AI Floorplan to 3D

### Vision AI-Powered Architectural Floorplan to Interactive 3D World Converter

[![GPT-4o](https://img.shields.io/badge/GPT--4o-Vision_API-412991?style=for-the-badge&logo=openai&logoColor=white)](https://openai.com)
[![Three.js](https://img.shields.io/badge/Three.js-3D_Engine-000000?style=for-the-badge&logo=threedotjs&logoColor=white)](https://threejs.org)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

<br/>

**Upload a 2D architectural floorplan image and watch AI transform it into a fully interactive 3D environment. Then use natural language commands in Chinese or English to manipulate the scene in real time.**

*上傳 2D 建築平面圖，AI 自動分析房間佈局並生成可互動的 3D 環境。支援中英文自然語言指令即時操控 3D 場景。*

## 📋 Quick Summary

> 🏗️ **AI Floorplan to 3D** 是一套將 2D 建築平面圖自動轉換為可互動 3D 環境的全棧 AI 應用。使用者只需 📤 上傳一張平面圖影像，系統便透過 👁️ GPT-4o Vision API 進行多模態影像分析，自動辨識牆壁、門窗、柱子等建築元素的位置與尺寸，輸出結構化 JSON 數據。前端 🎮 Three.js 引擎即時將這些數據渲染為完整的 3D 建築模型，支援 OrbitControls 旋轉、縮放與平移操作。最大亮點是 🗣️ 中英文雙語自然語言指令系統——使用者可直接輸入「把牆壁高度增加到 3.5 米」等指令，AI 即時理解並修改 3D 場景。資料管線包含自研的 🔧 JSON 修復器與結構化驗證器，確保 AI 輸出穩定可靠。後端為 Node.js + Express，支援 📂 歷史版本追蹤與回溯。從「看圖 👀」到「建模 🏛️」到「語音指揮 🎙️」，實現全 AI 驅動的建築科技流程 🚀。

<br/>

```
  ┌─────────────┐         ┌──────────────┐         ┌──────────────┐         ┌──────────────┐
  │  2D Floor   │  POST   │   Express    │  API    │   GPT-4o     │  JSON   │   Three.js   │
  │  Plan Image │ ──────> │   Server     │ ──────> │   Vision     │ ──────> │   3D Scene   │
  │  (Upload)   │         │  (server.js) │         │   Analysis   │         │  (script.js) │
  └─────────────┘         └──────────────┘         └──────────────┘         └──────┬───────┘
                                                                                   │
                          ┌──────────────┐         ┌──────────────┐                │
                          │   History    │         │  NLP Command │  Natural       │
                          │   System     │ <────── │   Engine     │ <──────────────┘
                          │ (history.js) │  Save   │(ai_command.js)│  Language
                          └──────────────┘         └──────────────┘  Control
```

</div>

---

## ⭐ Highlights / 技術亮點

| Domain | Detail |
|--------|--------|
| **Vision AI Analysis** | GPT-4o Vision API 分析平面圖影像，自動辨識牆壁、門窗、柱子等建築元素的位置與尺寸 |
| **3D Generation** | Three.js 即時生成可互動 3D 建築模型，支援 OrbitControls 旋轉/縮放/平移 |
| **NLP Scene Control** | 中英文自然語言指令操控 3D 場景 -- 「將柱子往左移動 1 米」或「把牆壁高度增加 0.5 米」 |
| **Robust AI Parsing** | 多層級 JSON 修復管線 (json_fixer.js + data_validator.js)，確保 AI 輸出穩定可靠 |
| **History System** | 完整版本追蹤系統，自動保存每次分析結果，支援歷史回溯與比對 |
| **Full-Stack** | Express 後端 + Three.js 前端 + OpenAI API，完整全棧 AI 應用 |

---

## 🏗️ Architecture / 系統架構

### ⚙️ Core Pipeline / 核心流程

```
                         ┌─────────────────────────────────────┐
                         │          User Interface              │
                         │  ┌───────────┐   ┌───────────────┐  │
                         │  │  Upload    │   │  AI Command   │  │
                         │  │  Floorplan │   │  Input Box    │  │
                         │  └─────┬─────┘   └───────┬───────┘  │
                         └────────┼─────────────────┼──────────┘
                                  │                 │
                    ┌─────────────▼─────────────────▼──────────────┐
                    │            Express Server (server.js)         │
                    │                                               │
                    │  ┌─────────────┐      ┌───────────────────┐  │
                    │  │   Multer    │      │   AI Command      │  │
                    │  │   Upload    │      │   Proxy Route     │  │
                    │  └──────┬──────┘      └────────┬──────────┘  │
                    └─────────┼──────────────────────┼─────────────┘
                              │                      │
                    ┌─────────▼──────────────────────▼─────────────┐
                    │              OpenAI GPT-4o API                │
                    │                                               │
                    │  Image Analysis         Command Processing    │
                    │  平面圖 → JSON 元素       自然語言 → JSON 修改   │
                    └──────────┬─────────────────────┬─────────────┘
                               │                     │
                    ┌──────────▼─────────────────────▼─────────────┐
                    │           Data Validation Pipeline            │
                    │                                               │
                    │  json_fixer.js  →  data_validator.js          │
                    │  AI 輸出修復        結構化資料驗證                │
                    └──────────────────────┬───────────────────────┘
                                           │
                    ┌──────────────────────▼───────────────────────┐
                    │          Three.js 3D Renderer (script.js)    │
                    │                                               │
                    │  Walls / Doors / Windows / Columns / Floors  │
                    │  OrbitControls / Lighting / Materials         │
                    └──────────────────────────────────────────────┘
```

### 👁️ AI Floorplan Analysis / AI 平面圖解析

GPT-4o Vision 接收平面圖影像後，輸出結構化 JSON 描述每個建築元素：

```json
[
  { "type": "floor", "width": 12, "height": 8 },
  { "type": "wall", "x": -6, "y": 1.5, "z": 0, "width": 0.2, "height": 3, "depth": 8 },
  { "type": "door", "x": 2, "y": 1, "z": 4, "width": 1.2, "height": 2.1, "depth": 0.1 },
  { "type": "window", "x": 0, "y": 1.5, "z": -4, "width": 1.5, "height": 1.2, "depth": 0.1 }
]
```

所有座標以**公尺為單位**，原點 (0,0,0) 位於場景中心。

### 🗣️ NLP Command System / 自然語言指令系統

`ai_command.js` (633 lines) 提供完整的中英文自然語言 3D 場景操控：

```
User:  「把所有牆壁的高度增加到 3.5 米」
  ↓
AI Command Engine → GPT-4o processes command with current model context
  ↓
Modified JSON → Three.js re-renders scene in real time
```

支援操作包含：移動、縮放、旋轉、新增、刪除建築元素。

---

## 📁 Project Structure / 專案結構

```
ai-floorplan-to-3d/
├── server.js               # Express backend (474 lines) -- API routing, GPT-4o integration
├── script.js               # Three.js frontend (1115 lines) -- 3D rendering & scene management
├── ai_command.js           # NLP command engine (633 lines) -- natural language scene control
├── index.html              # Main application UI / 主應用介面
├── styles.css              # Application styling / 應用樣式
├── json_fixer.js           # AI output JSON repair / AI 輸出 JSON 修復工具
├── data_validator.js       # Structural data validation / 結構化資料驗證器
├── history.js              # History management system / 歷史記錄管理系統
├── fallback.js             # Fallback rendering logic / 降級渲染邏輯
├── gpt4o_connector.js      # GPT-4o API connector / GPT-4o API 連接器
├── start_servers.js        # Multi-server launcher / 多伺服器啟動器
├── repair_history_files.js # History file repair utility / 歷史檔案修復工具
├── sample_response.json    # Sample API response / API 回應範例
├── test.html               # Testing page / 測試頁面
├── test_data.js            # Test data fixtures / 測試資料
├── package.json            # Dependencies / 依賴配置
├── doc/                    # Documentation / 技術文件
└── history/                # Saved analysis history / 歷史分析記錄
```

---

## 🛠️ Tech Stack / 技術棧

| Layer | Technology |
|-------|-----------|
| **AI Vision** | OpenAI GPT-4o -- multimodal image understanding & architectural element extraction |
| **3D Engine** | Three.js r128 -- scene graph, OrbitControls, mesh generation, materials/lighting |
| **Backend** | Node.js + Express -- REST API, Multer file upload, CORS middleware |
| **NLP Processing** | GPT-4o -- bilingual (Chinese/English) natural language command interpretation |
| **Data Pipeline** | Custom JSON fixer + schema validator -- robust AI output parsing |
| **Frontend** | Vanilla HTML/CSS/JS -- zero framework overhead |

---

## 🧩 Key Components / 核心模組詳解

### 🖥️ Express Server (`server.js` -- 474 lines)

- **Image upload** via Multer with automatic directory management
- **GPT-4o Vision prompt engineering** -- 精心設計的提示詞，引導 AI 輸出精確的建築元素 JSON（含座標、尺寸、類型）
- **AI command proxy** -- 將前端自然語言指令轉發至 GPT-4o，附帶當前 3D 場景上下文
- **History persistence** -- 自動保存每次分析結果為 JS 檔案，含時間戳和元數據

### 🎮 Three.js Renderer (`script.js` -- 1115 lines)

- 完整的 3D 場景管理：camera, renderer, OrbitControls, lighting setup
- **Element factory** -- 根據 JSON 類型 (wall/door/window/column/floor) 自動生成對應 3D mesh
- **Material system** -- 不同建築元素使用不同材質和顏色
- **Dynamic re-rendering** -- 支援 NLP 指令修改後即時重繪

### 🗣️ NLP Command Engine (`ai_command.js` -- 633 lines)

- **Bilingual support** -- 中文和英文自然語言指令均可操控場景
- **Context-aware** -- 將當前場景完整 JSON 作為上下文傳給 GPT-4o
- **Command history** -- 聊天式介面記錄所有使用者指令和 AI 回應
- **Error recovery** -- 指令執行失敗時提供明確的錯誤訊息和建議

### 🔧 Data Validation Pipeline

```
AI Raw Output → json_fixer.js (basic + advanced repair) → JSON.parse → data_validator.js (schema check) → Three.js
                     │                                                          │
                     ├── Remove markdown code fences                            ├── Validate floor dimensions
                     ├── Fix trailing commas                                    ├── Validate wall coordinates
                     ├── Repair unquoted keys                                   ├── Validate door/window specs
                     └── Handle truncated output                                └── Type coercion & defaults
```

---

## 🏁 Getting Started / 開始使用

### 📋 Prerequisites / 前置需求

- Node.js 18+
- OpenAI API Key (需要 GPT-4o 模型權限)

### 📦 Installation & Run / 安裝與執行

```bash
# Clone the repository
git clone <repo-url>
cd ai-floorplan-to-3d

# Install dependencies
npm install

# Set your OpenAI API key
export OPENAI_API_KEY="your-api-key-here"

# Start the server
npm start
# Or: node server.js

# Open in browser
# http://localhost:3000
```

### 💡 Usage / 使用方式

1. **Upload Floorplan** -- 上傳建築平面圖影像（支援 JPG/PNG）
2. **Wait for Analysis** -- AI 分析平面圖並生成 3D 模型（約 10-30 秒）
3. **Explore 3D Scene** -- 滑鼠拖曳旋轉、滾輪縮放、右鍵平移
4. **NLP Commands** -- 在 AI 助手輸入框中用自然語言調整場景
5. **History** -- 從歷史面板載入先前的分析結果

---

## 🏷️ Category / 分類

> **AI Automation / AI 自動化**
>
> 本專案展示了 **Vision AI 到 3D 空間**的完整轉換流程 -- 從一張靜態平面圖影像，經過 GPT-4o 多模態理解，自動生成結構化建築數據，再即時渲染為可互動的 Three.js 3D 世界。結合自然語言控制系統，實現了從「看圖」到「建模」到「語音指揮」的全 AI 驅動建築科技流程。

---

<div align="center">

**Built with GPT-4o Vision, Three.js, and Node.js**

*用 GPT-4o 視覺 AI、Three.js 和 Node.js 打造的智慧建築 3D 生成器*

</div>
