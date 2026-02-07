const express = require('express');
const multer = require('multer');
const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();

// 確保 uploads 目錄存在
const uploadDir = path.join(__dirname, 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

// 保存分析歷史記錄的目錄
const historyDir = path.join(__dirname, 'history');
// 確保歷史記錄目錄存在
fs.mkdirSync(historyDir, { recursive: true });

// 啟用 CORS
app.use(cors());

// 配置 multer
const upload = multer({ dest: uploadDir });

// 處理 JSON 和 URL 編碼的請求體
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 配置靜態文件服務
app.use(express.static(path.join(__dirname)));

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'YOUR_API_KEY_HERE',
});

// 明確定義 POST 路由
app.post('/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: '未提供文件' });
    }

    const filePath = req.file.path;
    
    try {
        // 確保文件存在
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: '無法讀取上傳的文件' });
        }

        console.log("開始處理圖片分析...");
        
        // 使用 OpenAI 的圖像識別 API
        const response = await openai.chat.completions.create({
            model: "gpt-4o", // 視覺模型
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: `分析這個平面圖並提供以下JSON格式資訊，包含所有牆壁、門窗和其他關鍵元素的位置與尺寸。

生成的 JSON 必須嚴格遵循以下格式規範：
1. 回覆必須是純JSON陣列，沒有其他文字
2. 每個元素必須具有有效的數值屬性（非字符串）
3. 所有維度值必須大於0
4. 座標以米為單位，原點(0,0,0)通常位於場景中心
5. 支援的元素類型如下：

地板 (floor):
{
  "type": "floor",
  "width": 數值,
  "height": 數值
}

牆壁 (wall):
{
  "type": "wall",
  "x": 數值,
  "y": 數值,
  "z": 數值,
  "width": 數值,
  "height": 數值,
  "depth": 數值
}

圓形柱子 (column):
{
  "type": "column",
  "x": 數值,
  "y": 數值,
  "z": 數值,
  "radius": 數值,
  "height": 數值
}

方形柱子 (column):
{
  "type": "column",
  "shape": "square",
  "x": 數值,
  "y": 數值,
  "z": 數值,
  "width": 數值,
  "depth": 數值,
  "height": 數值
}

門 (door):
{
  "type": "door",
  "x": 數值,
  "y": 數值,
  "z": 數值,
  "width": 數值,
  "height": 數值,
  "depth": 數值
}

窗 (window):
{
  "type": "window",
  "x": 數值,
  "y": 數值,
  "z": 數值,
  "width": 數值,
  "height": 數值,
  "depth": 數值
}` },
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:image/jpeg;base64,${fs.readFileSync(filePath).toString('base64')}`
                            }
                        }
                    ]
                }
            ],
            max_tokens: 4000,
        });

        console.log("收到 API 回應");
        
        let jsonString = response.choices[0].message.content;
        console.log("AI回應:", jsonString.substring(0, 200) + "..."); // 只打印前 200 個字符

        let json;
        try {
            // 嘗試直接解析
            json = JSON.parse(jsonString);
            console.log("成功直接解析 JSON");
        } catch (e) {
            console.log("直接解析失敗，嘗試提取 JSON 部分");
            // 嘗試尋找JSON部分
            try {
                const jsonMatch = jsonString.match(/```json\n([\s\S]*?)\n```/) || 
                                jsonString.match(/```\n([\s\S]*?)\n```/) ||
                                jsonString.match(/\[[\s\S]*\]/) ||
                                jsonString.match(/\{[\s\S]*\}/);
                
                if (jsonMatch) {
                    console.log("找到匹配的 JSON 部分");
                    const extractedJson = jsonMatch[1] || jsonMatch[0];
                    json = JSON.parse(extractedJson);
                    console.log("成功解析提取的 JSON");
                } else {
                    throw new Error("無法解析JSON格式");
                }
            } catch (innerError) {
                console.error("JSON解析錯誤:", innerError);
                console.error("原始回應:", jsonString);
                return res.status(500).json({ 
                    error: "無法解析AI回應為JSON格式",
                    rawResponse: jsonString
                });
            }
        }
        
        // 將結果保存為測試數據文件
        try {
            // 生成唯一文件名 (使用時間戳)
            const timestamp = new Date().getTime();
            const dateStr = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `analysis_${dateStr}.js`;
            const savePath = path.join(historyDir, filename);
            
            // 獲取上傳的圖片名稱 (如果存在)
            const originalFileName = req.file.originalname || "未知文件";
            
            // 使用標準化格式創建 JS 文件
            const fileContent = `// 分析結果 - ${originalFileName}\n` +
                `// 生成於 ${new Date().toLocaleString()}\n\n` +
                `const analysisData = ${JSON.stringify(json, null, 2)};\n\n` +
                `// 分析信息\n` +
                `const analysisInfo = {\n` +
                `  timestamp: ${timestamp},\n` +
                `  date: "${new Date().toLocaleString()}",\n` +
                `  filename: "${originalFileName}",\n` +
                `  modelCount: ${Array.isArray(json) ? json.length : 0}\n` +
                `};\n\n` +
                `// 渲染此數據\n` +
                `function renderAnalysis() {\n` +
                `  if (typeof create3DModel === "function") {\n` +
                `    console.log("渲染分析結果:", analysisInfo.date);\n` +
                `    create3DModel(analysisData);\n` +
                `    return true;\n` +
                `  } else {\n` +
                `    console.error("找不到 create3DModel 函數");\n` +
                `    return false;\n` +
                `  }\n` +
                `}\n`;
            
            // 使用 writeFileSync 確保文件完全寫入磁盤後再繼續
            fs.writeFileSync(savePath, fileContent);
            console.log(`分析結果已保存到 ${filename}`);
            
            // 等待更長時間，確保文件系統已完全處理
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // 在響應中添加文件信息
            json._savedFile = {
                filename: filename,
                path: `/history/${filename}`,
                timestamp: timestamp,
                date: new Date().toLocaleString()
            };
        } catch (saveError) {
            console.error("保存數據到文件時出錯:", saveError);
        }
        
        console.log("返回解析後的 JSON 數據");
        
        // 故意延遲響應，確保文件寫入已完成
        await new Promise(resolve => setTimeout(resolve, 200));
        
        res.json(json);
    } catch (error) {
        console.error('請求錯誤:', error);
        res.status(500).json({ 
            error: error.message,
            stack: error.stack
        });
    }
});

// 添加保存之前分析結果的路由
app.post('/save-result', express.json(), (req, res) => {
    try {
        const data = req.body;
        if (!data || !Array.isArray(data)) {
            return res.status(400).json({ error: '無效的數據格式' });
        }
        
        // 生成唯一文件名
        const timestamp = new Date().getTime();
        const filename = `saved_data_${timestamp}.js`;
        const savePath = path.join(__dirname, filename);
        
        // 使用與 test_data.js 相同的格式
        const fileContent = `// 保存於 ${new Date().toLocaleString()}\n\n` +
            `const savedData = ${JSON.stringify(data, null, 2)};\n\n` +
            `// 添加一個函數來使用這個數據進行渲染\n` +
            `function useSavedData() {\n` +
            `  console.log("使用保存的數據進行渲染");\n` +
            `  create3DModel(savedData);\n` +
            `  return false;\n` +
            `}\n`;
        
        fs.writeFileSync(savePath, fileContent);
        console.log(`數據已保存到 ${filename}`);
        
        res.json({ success: true, filename });
    } catch (error) {
        console.error('保存數據到文件時出錯:', error);
        res.status(500).json({ error: error.message });
    }
});

// 獲取所有歷史分析記錄
app.get('/history', (req, res) => {
    try {
        const files = fs.readdirSync(historyDir)
            .filter(file => file.endsWith('.js'))
            .map(file => {
                const fullPath = path.join(historyDir, file);
                const stats = fs.statSync(fullPath);
                
                // 嘗試從文件中提取時間戳
                let timestamp = stats.mtimeMs;
                let displayName = file;
                
                try {
                    const content = fs.readFileSync(fullPath, 'utf8');
                    const timeMatch = content.match(/timestamp: (\d+)/);
                    const nameMatch = content.match(/filename: "([^"]+)"/);
                    
                    if (timeMatch && timeMatch[1]) {
                        timestamp = parseInt(timeMatch[1]);
                    }
                    
                    if (nameMatch && nameMatch[1]) {
                        displayName = nameMatch[1] + ' - ' + 
                            new Date(timestamp).toLocaleString();
                    }
                } catch (err) {
                    console.error(`解析文件 ${file} 時出錯:`, err);
                }
                
                return {
                    filename: file,
                    path: `/history/${file}`,
                    timestamp: timestamp,
                    date: new Date(timestamp).toLocaleString(),
                    displayName: displayName
                };
            });
        
        // 按時間戳降序排序（最新的排在前面）
        files.sort((a, b) => b.timestamp - a.timestamp);
        
        res.json(files);
    } catch (error) {
        console.error('獲取歷史記錄時出錯:', error);
        res.status(500).json({ error: error.message });
    }
});

// 靜態服務歷史文件
app.use('/history', express.static(historyDir));

// 添加處理 AI 指令的路由
app.post('/process-command', express.json(), async (req, res) => {
    try {
        const { command, modelData } = req.body;
        
        if (!command || !modelData || !Array.isArray(modelData)) {
            return res.status(400).json({ error: '無效的請求參數' });
        }
        
        console.log(`處理 AI 指令: "${command}"`);
        
        // 在這裡可以直接調用 GPT-4o 來處理命令
        // 但為了簡單起見，我們先實現一個簡單的命令處理器
        
        // 創建一個深拷貝以避免修改原始數據
        let modifiedData = JSON.parse(JSON.stringify(modelData));
        
        // 將命令轉換為小寫以便比較
        const cmd = command.toLowerCase();
        
        // 嘗試呼叫 OpenAI API 來處理指令（高級實現）
        if (cmd.length > 0) {
            try {
                // 使用與之前相同的 OpenAI 配置
                const response = await openai.chat.completions.create({
                    model: "gpt-4o",
                    messages: [
                        {
                            role: "system",
                            content: `你是一個 3D 建築模型編輯助手。你需要根據用戶的自然語言指令，修改提供的 3D 模型 JSON 數據。
                            每個對象可能是地板(floor)、牆壁(wall)、柱子(column)、門(door)或窗(window)。
                            為了保持數據完整性，請返回完整的修改後數組。`
                        },
                        {
                            role: "user",
                            content: `根據以下指令修改 3D 模型數據：「${command}」
                            
                            當前模型數據為：
                            ${JSON.stringify(modelData, null, 2)}
                            
                            請只返回修改後的 JSON 數據陣列，不要包含任何其他說明或標記。確保所有數值都是有效的數字。`
                        }
                    ],
                    max_tokens: 4000,
                });
                
                const jsonString = response.choices[0].message.content;
                
                try {
                    // 嘗試解析 JSON
                    const parsedData = JSON.parse(jsonString);
                    if (Array.isArray(parsedData)) {
                        modifiedData = parsedData;
                    } else {
                        throw new Error('回應不是有效的陣列');
                    }
                } catch (parseError) {
                    console.error('解析 AI 回應時出錯:', parseError);
                    // 嘗試尋找 JSON 部分
                    const jsonMatch = jsonString.match(/\[\s*\{[\s\S]*\}\s*\]/);
                    if (jsonMatch) {
                        try {
                            const extractedJson = jsonMatch[0];
                            modifiedData = JSON.parse(extractedJson);
                        } catch (innerError) {
                            console.error('提取 JSON 時出錯:', innerError);
                            throw new Error('無法解析 AI 回應');
                        }
                    } else {
                        throw new Error('無法找到有效的 JSON 回應');
                    }
                }
            } catch (apiError) {
                console.error('呼叫 OpenAI API 時出錯:', apiError);
                throw new Error('AI 處理指令失敗');
            }
        }
        
        console.log("指令處理完成，修改了模型數據");
        res.json({ modifiedData });
        
    } catch (error) {
        console.error('處理命令出錯:', error);
        res.status(500).json({ error: error.message });
    }
});

// 添加一個新的端點用於提取歷史文件中的 analysisData
app.get('/api/history-data', async (req, res) => {
    try {
        const filePath = req.query.path;
        if (!filePath) {
            return res.status(400).json({ error: '缺少文件路徑參數' });
        }
        
        // 確保路徑是以 /history/ 開頭的，並進行安全檢查
        if (!filePath.startsWith('/history/') || filePath.includes('..')) {
            return res.status(403).json({ error: '無效的文件路徑' });
        }
        
        // 構建文件的完整路徑
        const fullPath = path.join(__dirname, filePath);
        
        // 確保文件存在
        if (!fs.existsSync(fullPath)) {
            return res.status(404).json({ error: '文件不存在' });
        }
        
        // 讀取文件內容
        const fileContent = fs.readFileSync(fullPath, 'utf8');
        
        // 提取 analysisData 部分
        const dataMatch = fileContent.match(/const\s+analysisData\s*=\s*(\[[\s\S]*?\]);/);
        if (!dataMatch || !dataMatch[1]) {
            return res.status(500).json({ error: '無法從文件中提取數據' });
        }
        
        // 嘗試解析 JSON
        let jsonData;
        try {
            // 首先移除可能的行內註釋
            const cleanJsonStr = dataMatch[1].replace(/\/\/.*$/gm, '');
            jsonData = JSON.parse(cleanJsonStr);
        } catch (jsonError) {
            return res.status(500).json({ 
                error: `JSON 解析錯誤: ${jsonError.message}`,
                rawData: dataMatch[1]
            });
        }
        
        // 返回解析後的 JSON 數據
        res.json(jsonData);
        
    } catch (error) {
        console.error('獲取歷史數據時出錯:', error);
        res.status(500).json({ error: error.message });
    }
});

// 啟動服務器
const PORT = process.env.PORT || 3000;  // 改為 3000 避免與 VS Code Live Server 衝突
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`請訪問: http://localhost:${PORT}`);
});
