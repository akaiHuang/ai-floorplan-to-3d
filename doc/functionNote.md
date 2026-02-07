# 3D 平面圖分析系統功能文件說明

本文件記錄專案中各文件的功能和關鍵點，方便未來優化和修改。

## 目錄結構

```
/Users/akaihuangm1/Desktop/0228AI/
├── server.js            主要服務器
├── server_gpt4o.js      GPT-4o 處理服務
├── start_servers.js     啟動所有服務器的腳本
├── script.js            前端主要 JavaScript 腳本
├── history.js           歷史記錄管理模塊 (前端)
├── fallback.js          備用功能模塊 (前端)
├── data_validator.js    數據驗證工具 (前端)
├── ai_command.js        AI 指令處理模塊 (前端)
├── json_fixer.js        JSON 修復工具 (前端)
├── repair_history_files.js 歷史文件修復工具
├── index.html           主頁面 HTML
└── history/             歷史記錄存放目錄
    └── temp.js          範例歷史數據
```


伺服器端檔案:
server.js - 主要的伺服器程式
server_gpt4o.js - GPT-4o 處理服務
start_servers.js - 啟動所有服務器的腳本
repair_history_files.js - 歷史文件修復工具

前端端檔案:
script.js - 主要的前端執行檔案
history.js - 歷史記錄管理模組 (在瀏覽器端運行，處理歷史數據的獲取與顯示)
fallback.js - 備用功能模組 (在瀏覽器端運行，當後端服務不可用時提供備用功能)
data_validator.js - 數據驗證工具 (在瀏覽器端運行，驗證 3D 模型數據格式)
ai_command.js - AI 指令處理模塊 (在瀏覽器端運行，處理用戶自然語言指令)
json_fixer.js - JSON 修復工具 (在瀏覽器端運行，修復不規範的 JSON 數據)
test_data.js - 測試用的 JSON 數據
gpt4o_connector.js - 與 GPT-4o 服務連接的前端模組


## 文件功能說明

### start_servers.js

**主要功能**：啟動所有需要的服務器

**關鍵函數/流程**：
- 使用 Node.js 的 child_process 模塊啟動主服務器 (server.js, 端口 3000)
- 等待 1 秒後啟動 GPT-4o 處理服務 (server_gpt4o.js, 端口 3001)
- 處理程序終止信號，確保所有子進程被正確終止

**使用方法**：`node start_servers.js`

**可能的優化點**：
- 增加服務狀態檢查功能，確保服務正常運行
- 添加自動重啟機制，當服務崩潰時自動重啟
- 加入日誌記錄功能，記錄服務啟動和關閉情況

### server.js

**主要功能**：提供主要 API 端點和文件服務

**關鍵函數/端點**：
- `/upload`: 接收圖片文件，調用 OpenAI API 分析平面圖，返回 JSON 格式的分析結果
- `/save-result`: 將分析結果保存為 JavaScript 文件
- `/history`: 獲取所有歷史分析記錄
- `/api/history-data`: 提取歷史文件中的 analysisData
- `/process-command`: 處理 AI 指令，修改模型數據

**使用的套件**：
- express: Web 框架
- multer: 處理文件上傳
- OpenAI: 與 OpenAI API 交互
- fs: 文件系統操作
- path: 路徑操作
- cors: 處理跨域請求

**可能的優化點**：
- 添加用戶認證和授權
- 實現更完善的錯誤處理和日誌記錄
- 優化大文件處理的性能
- 添加緩存機制以減少 API 調用
- 分離 OpenAI API 處理邏輯到專門的模塊

### server_gpt4o.js

**主要功能**：專門處理 GPT-4o 相關的 API 請求 (檔案內容為空，可能未完成或計劃後續實現)

**可能的優化點**：
- 完成此服務的實現，分擔主服務器的負載
- 添加重試機制和錯誤處理

### script.js

**主要功能**：前端主要 JavaScript 腳本，處理文件上傳、3D 模型渲染等功能

**關鍵函數**：
- `uploadFile()`: 上傳文件並發送到後端進行分析
- `create3DModel(data)`: 使用 THREE.js 創建和渲染 3D 模型
- `showAnalysisStatus()` / `hideAnalysisStatus()`: 管理分析狀態顯示
- `saveCurrentData(data)`: 將當前數據保存為文件

**可能的優化點**：
- 拆分代碼到更小的模塊以提高可維護性
- 優化 3D 渲染性能
- 添加更多用戶交互功能
- 實現更進階的 3D 操作和視圖控制
- 改進錯誤處理和用戶反饋

### history.js

**主要功能**：管理歷史記錄列表和歷史數據的加載

**運行環境**：前端 (瀏覽器)

**關鍵函數**：
- `refreshHistoryList()`: 從服務器獲取並顯示歷史記錄列表
- `selectHistoryFile(fileInfo)`: 選擇歷史文件
- `useSelectedFile()`: 使用選中的歷史文件數據
- `repairJsonData(fileContent)`: 修復 JSON 數據
- `removeJsonComments(jsonStr)`: 移除 JSON 字符串中的註釋
- `evaluateMathExpressions(jsonStr)`: 計算字符串中的數學表達式
- `extractAndProcessData(fileContent)`: 從檔案中提取並處理數據
- `fixCommonJsonErrors(jsonStr)`: 修復常見的 JSON 格式錯誤
- `deepFixJson(jsonStr)`: 深度修復複雜的 JSON 格式問題
- `fixDataIssues(data)`: 修復 3D 模型數據中的數值問題

**可能的優化點**：
- 添加分頁功能以處理大量歷史記錄
- 優化數據提取和解析算法
- 添加歷史記錄搜索和過濾功能
- 實現數據比較功能
- 將 JSON 修復功能抽離到獨立模塊

### fallback.js

**主要功能**：當無法連接到後端服務器時提供備用功能

**運行環境**：前端 (瀏覽器)

**關鍵函數**：
- `useStaticJson()`: 使用靜態 JSON 文件而不是調用 API，實現離線功能
- `checkServerStatus()`: 檢測服務器連接狀態

**運行流程**：
1. 在服務器連接失敗時觸發
2. 嘗試從本地或預設的模板載入數據
3. 直接使用 `<script>` 元素執行靜態 JavaScript 檔案
4. 從全局變量中獲取數據進行渲染

**可能的優化點**：
- 擴展離線功能範圍
- 添加本地存儲功能
- 實現更智能的重連機制
- 增加更多的離線模板選項

### data_validator.js

**主要功能**：驗證 3D 模型數據是否符合規格

**運行環境**：前端 (瀏覽器)

**關鍵函數**：
- `validateModelData(data)`: 驗證整個模型數據
- `validateFloor(item, index)`: 驗證地板數據
- `validateWall(item, index)`: 驗證牆壁數據
- `validateColumn(item, index)`: 驗證柱子數據
- `validateOpenings(item, index)`: 驗證門窗數據

**工作原理**：
1. 接收 JSON 格式的模型數據
2. 檢查每個元素的必要屬性和數值有效性
3. 針對不同類型的元素進行特定驗證
4. 輸出詳細的錯誤信息到控制台
5. 返回整體驗證結果

**可能的優化點**：
- 添加更完善的數據修復功能
- 實現更詳細的錯誤報告
- 擴展支持更多類型的模型元素
- 添加數據結構一致性檢查
- 增加用戶友好的錯誤提示機制

### ai_command.js

**主要功能**：處理用戶自然語言指令並修改 3D 模型

**運行環境**：前端 (瀏覽器)

**關鍵函數**：
- `updateCurrentModelData(data)`: 更新當前渲染的模型數據
- `processCommand()`: 處理用戶輸入的命令
- `processCommandWithAI(command, modelData)`: 使用 AI 處理命令
- `processCommandLocally(command, modelData)`: 本地處理簡單命令
- `analyzeCommand(cmd, data)`: 分析命令並執行對應操作
- `processMovementCommand(cmd, data)`: 處理移動物體的命令
- `processSizeCommand(cmd, data)`: 處理調整尺寸的命令
- `processAddRemoveCommand(cmd, data)`: 處理添加/刪除物體的命令
- `processColorCommand(cmd, data)`: 處理改變顏色的命令
- `addToCommandHistory(type, message)`: 添加命令響應到界面

**工作流程**：
1. 用戶輸入自然語言命令
2. 先嘗試通過 API 發送到服務器處理
3. 如果服務器處理失敗，回退到本地處理
4. 本地處理使用基於規則的命令解析
5. 根據分析結果修改 3D 模型數據
6. 使用修改後的數據重新渲染模型
7. 將整個交互過程記錄在命令歷史中

**可能的優化點**：
- 改進本地命令處理的準確性
- 添加更多命令類型支持
- 實現命令歷史的保存和恢復功能
- 增強服務器連接失敗時的重試機制
- 提供更友好的命令建議和自動完成功能

### repair_history_files.js

**主要功能**：檢查和修復所有歷史數據文件中的格式問題

**關鍵功能**：
- 遍歷 history 目錄中的所有 JS 文件
- 檢查和提取每個文件中的 analysisData
- 修復數值為 0 或無效的屬性
- 修復柱子的數據格式問題
- 將修復後的數據寫回文件

**使用方法**：`node repair_history_files.js`

**可能的優化點**：
- 添加備份機制，避免數據丟失
- 實現更智能的數據修復算法
- 添加批量處理選項

### index.html

**主要功能**：前端主頁面 HTML

**主要元素/區域**：
- 文件上傳表單
- 3D 模型顯示容器
- 歷史記錄面板
- AI 指令面板
- 分析狀態提示

**可能的優化點**：
- 改進響應式設計，適應不同設備
- 添加更多用戶幫助和指導
- 優化界面布局和交互體驗
- 實現主題切換功能

### history/temp.js

**主要功能**：範例歷史數據文件，包含一個簡單的模型數據示例

**數據結構**：
- 地板、牆壁、圓形柱子、方形柱子、門和窗的示例數據
- analysisInfo 包含時間戳、日期、文件名和模型計數
- renderAnalysis 函數用於渲染此數據

**可能的優化點**：
- 添加更多類型的示例數據
- 優化初始渲染性能

## 關鍵功能流程

### 平面圖上傳和分析流程
1. 用戶在前端選擇圖片文件並提交
2. `script.js` 中的 `uploadFile()` 函數將文件發送到後端
3. `server.js` 中的 `/upload` 端點接收文件並調用 OpenAI API 進行分析
4. 分析完成後，結果被保存為 JavaScript 文件並返回給前端
5. 前端使用 `create3DModel()` 函數渲染 3D 模型
6. 歷史記錄列表被更新，顯示新的分析結果

### 歷史數據加載流程
1. 用戶選擇歷史記錄列表中的一項
2. `history.js` 中的 `selectHistoryFile()` 標記所選項目
3. 用戶點擊「使用選中的數據」按鈕
4. `useSelectedFile()` 函數從服務器獲取數據
5. 如果主方法失敗，嘗試使用備用方法
6. 獲取到數據後，使用 `create3DModel()` 函數渲染 3D 模型

### AI 指令處理流程
1. 用戶輸入指令並提交
2. 前端將指令和當前模型數據發送到後端
3. `server.js` 中的 `/process-command` 端點處理指令並返回修改後的數據
4. 前端使用修改後的數據重新渲染 3D 模型

## 可擴展性和優化建議

### 前端優化
- 實現模塊化架構，提高代碼可維護性
- 使用前端框架 (如 Vue 或 React) 重構界面
- 添加更多用戶交互功能，如縮放、旋轉和模型編輯
- 實現模型數據的本地保存和加載
- 添加多語言支持

### 後端優化
- 實現完整的身份驗證和授權系統
- 優化文件存儲和管理方式
- 添加資料庫支持，不再依賴文件系統
- 實現更高效的 API 調用和數據處理邏輯
- 添加更完善的日誌和監控系統

### AI 功能擴展
- 實現更高級的 AI 平面圖理解功能
- 添加自然語言處理功能，支持更複雜的指令
- 實現 3D 模型的自動優化建議
- 添加多模型比較和融合功能

### 系統架構優化
- 實現服務器集群，提高系統穩定性和可用性
- 添加緩存層，減少 API 調用頻率
- 實現前後端完全分離的架構
- 使用容器化技術簡化部署和擴展

---

*最後更新時間: 2023-05-15*