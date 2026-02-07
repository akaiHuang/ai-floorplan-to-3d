/**
 * 歷史記錄管理模塊
 */

// 當前選中的歷史文件
let selectedHistoryFile = null;

// 當前加載的歷史腳本元素
let currentHistoryScript = null;

// 初始化歷史記錄
async function initHistoryList() {
    console.log("初始化歷史記錄列表...");
    await refreshHistoryList();
}

// 刷新歷史記錄列表
async function refreshHistoryList() {
    try {
        console.log("正在獲取歷史記錄...");
        
        // 等待一下確保文件系統操作已完成
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const response = await fetch('http://localhost:3000/history');
        if (!response.ok) {
            throw new Error(`獲取歷史記錄失敗: ${response.status} ${response.statusText}`);
        }
        
        const historyFiles = await response.json();
        const historyList = document.getElementById('historyList');
        
        // 清空列表
        historyList.innerHTML = '';
        
        if (historyFiles.length === 0) {
            historyList.innerHTML = '<div class="history-item" style="text-align: center; color: #999;">沒有歷史記錄</div>';
            document.getElementById('useSelectedButton').disabled = true;
            return;
        }
        
        // 填充歷史記錄列表
        historyFiles.forEach(fileInfo => {
            const item = document.createElement('div');
            item.className = 'history-item';
            item.dataset.filename = fileInfo.filename;
            item.dataset.path = fileInfo.path;
            
            const nameSpan = document.createElement('div');
            nameSpan.textContent = fileInfo.displayName || fileInfo.filename;
            
            const timeSpan = document.createElement('div');
            timeSpan.className = 'timestamp';
            timeSpan.textContent = fileInfo.date;
            
            item.appendChild(nameSpan);
            item.appendChild(timeSpan);
            
            item.addEventListener('click', () => selectHistoryFile(fileInfo));
            
            historyList.appendChild(item);
        });
        
        console.log(`獲取到 ${historyFiles.length} 條歷史記錄`);
        
        // 等待DOM更新完成
        await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
        console.error("刷新歷史記錄失敗:", error);
        document.getElementById('errorMessage').textContent = `獲取歷史記錄失敗: ${error.message}`;
        document.getElementById('errorMessage').style.display = 'block';
    }
}

// 選擇歷史文件
function selectHistoryFile(fileInfo) {
    console.log("選擇歷史文件:", fileInfo);
    
    // 取消之前的選擇
    const previousSelected = document.querySelector('.history-item.selected');
    if (previousSelected) {
        previousSelected.classList.remove('selected');
    }
    
    // 標記當前選中項
    const item = document.querySelector(`.history-item[data-filename="${fileInfo.filename}"]`);
    if (item) {
        item.classList.add('selected');
    }
    
    // 更新選中的文件
    selectedHistoryFile = fileInfo;
    
    // 啟用「使用選中的數據」按鈕
    document.getElementById('useSelectedButton').disabled = false;
}

// 修復 JSON 數據的函數 - 增強版，處理數學表達式和註釋
function repairJsonData(fileContent) {
    try {
        // 提取 analysisData 部分
        const dataMatch = fileContent.match(/const\s+analysisData\s*=\s*(\[[\s\S]*?\]);/);
        if (!dataMatch || !dataMatch[1]) {
            console.error("無法提取 analysisData");
            return null;
        }
        
        let jsonStr = dataMatch[1];
        
        // 預處理 JSON 字符串，移除註釋並處理數學表達式
        jsonStr = removeJsonComments(jsonStr); // 移除註釋
        jsonStr = evaluateMathExpressions(jsonStr); // 計算數學表達式
        
        // 嘗試解析修改後的 JSON
        let data;
        try {
            data = JSON.parse(jsonStr);
        } catch (e) {
            console.error("無法解析提取的 JSON 數據:", e);
            console.log("問題 JSON 字符串:", jsonStr.substring(0, 200) + "...");
            
            // 嘗試更進一步的修復
            const furtherCleanedStr = cleanupInvalidJson(jsonStr);
            try {
                data = JSON.parse(furtherCleanedStr);
                console.log("使用進一步清理後成功解析 JSON");
            } catch (furtherError) {
                console.error("進一步清理後仍然無法解析 JSON:", furtherError);
                return null;
            }
        }
        
        // 檢查是否真的需要修復
        let needsRepair = false;
        
        // 修復數據
        const fixedData = data.map(item => {
            if (!item) return item;
            
            // 創建新對象以避免修改原始參考
            const fixedItem = {...item};
            let itemFixed = false;
            
            // 修復數值為0或NaN的屬性
            if (fixedItem.width === 0 || isNaN(fixedItem.width)) {
                fixedItem.width = 1;
                itemFixed = true;
            }
            if (fixedItem.height === 0 || isNaN(fixedItem.height)) {
                fixedItem.height = 1;
                itemFixed = true;
            }
            if ((fixedItem.depth === 0 || isNaN(fixedItem.depth)) && fixedItem.depth !== undefined) {
                fixedItem.depth = 0.1;
                itemFixed = true;
            }
            
            // 修復坐標值
            ['x', 'y', 'z'].forEach(coord => {
                if (fixedItem[coord] !== undefined && isNaN(fixedItem[coord])) {
                    fixedItem[coord] = 0;
                    itemFixed = true;
                }
            });
            
            // 修復柱子問題
            if (fixedItem.type === "column") {
                if (!fixedItem.radius && fixedItem.width && !fixedItem.shape) {
                    // 如果沒有設置 shape 和 radius，但有 width，則添加 shape="square"
                    fixedItem.shape = "square";
                    itemFixed = true;
                }
                
                // 確保方形柱子有 depth
                if (fixedItem.shape === "square" && !fixedItem.depth) {
                    fixedItem.depth = fixedItem.width || 0.3;
                    itemFixed = true;
                }
            }
            
            if (itemFixed) {
                needsRepair = true;
            }
            
            return fixedItem;
        });
        
        // 如果沒有需要修復的項目，返回 null
        if (!needsRepair) {
            return null;
        }
        
        // 生成修復後的文件內容
        const restOfFile = fileContent.substring(fileContent.indexOf('];') + 2);
        const newFileContent = `const analysisData = ${JSON.stringify(fixedData, null, 2)};\n\n${restOfFile}`;
        
        return newFileContent;
    } catch (e) {
        console.error("修復數據時出錯:", e);
        return null;
    }
}

// 移除 JSON 字符串中的註釋 (不是標準 JSON 的一部分)
function removeJsonComments(jsonStr) {
    // 移除單行註釋 (// ...)
    let result = jsonStr.replace(/\/\/.*$/gm, '');
    
    // 移除多行註釋 (/* ... */)
    result = result.replace(/\/\*[\s\S]*?\*\//g, '');
    
    // 移除註釋後，確保沒有留下空行，可能導致 JSON.parse 失敗
    result = result.replace(/,\s*[\r\n]\s*\]/g, '\n]');
    
    return result;
}

// 清理無效的 JSON 結構
function cleanupInvalidJson(jsonStr) {
    // 1. 修復尾隨逗號，標準 JSON 不允許陣列或物件的最後一個元素後有逗號
    let result = jsonStr.replace(/,\s*(\]|\})/g, '$1');
    
    // 2. 確保屬性名稱是用雙引號包圍的
    result = result.replace(/(\s*)([a-zA-Z0-9_$]+)(\s*:)/g, '$1"$2"$3');
    
    // 3. 將單引號轉換為雙引號 (標準 JSON 只接受雙引號)
    result = result.replace(/'/g, '"');
    
    // 4. 修復缺少關閉引號的情況
    const lines = result.split('\n');
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const openQuotes = (line.match(/"/g) || []).length;
        if (openQuotes % 2 !== 0 && !line.includes('\\\"')) {
            // 找到了不成對的引號，嘗試修復這一行
            if (line.trim().startsWith('"') && !line.trim().endsWith('"') && !line.trim().endsWith('",')) {
                // 如果行開頭有引號但結尾沒有，添加引號
                lines[i] = line + '"';
            }
        }
    }
    result = lines.join('\n');
    
    return result;
}

// 將字符串中的數學表達式求值
function evaluateMathExpressions(jsonStr) {
    try {
        // 正則表達式匹配可能包含數學表達式的值，但要避免匹配註釋中的表達式
        // 例如 "x": 1.5 - 0.3, 或 "y": 2 * 1.25
        const mathExprRegex = /"([^"]+)":\s*(-?\d+(\.\d+)?)\s*([+\-*/])\s*(-?\d+(\.\d+)?)/g;
        
        // 替換所有匹配的數學表達式為計算結果
        const processedStr = jsonStr.replace(mathExprRegex, (match, key, n1, _, op, n2) => {
            try {
                const num1 = parseFloat(n1);
                const num2 = parseFloat(n2);
                let result;
                
                // 根據運算符計算結果
                switch (op) {
                    case '+': result = num1 + num2; break;
                    case '-': result = num1 - num2; break;
                    case '*': result = num1 * num2; break;
                    case '/': 
                        if (num2 === 0) {
                            result = 0; // 避免除以零錯誤
                            console.warn(`計算表達式時除以零: ${num1} / 0`);
                        } else {
                            result = num1 / num2; 
                        }
                        break;
                    default: result = NaN;
                }
                
                // 確保結果是有效數字
                if (isNaN(result) || !isFinite(result)) {
                    console.warn(`計算表達式 ${num1} ${op} ${num2} 結果無效`);
                    return `"${key}": ${num1}`; // 使用第一個數字作為備選
                }
                
                console.log(`計算表達式: ${num1} ${op} ${num2} = ${result}`);
                return `"${key}": ${result}`;
            } catch (e) {
                console.warn(`計算表達式時出錯: ${match}`, e);
                // 保持原始表達式不變，在最終解析時會失敗
                return match;
            }
        });
        
        return processedStr;
    } catch (e) {
        console.error("處理數學表達式時發生錯誤:", e);
        return jsonStr; // 如果處理失敗，返回原始字符串
    }
}

// 使用選中的歷史文件 (更新版本 - 使用 API 而非腳本加載)
async function useSelectedFile() {
    if (!selectedHistoryFile) {
        alert('請先選擇一個歷史記錄');
        return;
    }
    
    try {
        console.log(`正在加載歷史文件: ${selectedHistoryFile.path}`);
        document.getElementById('loadingMessage').style.display = 'block';
        
        // 移除之前加載的腳本（如果存在）
        if (currentHistoryScript) {
            document.body.removeChild(currentHistoryScript);
            currentHistoryScript = null;
        }
        
        // 直接使用備用方法加載歷史文件，跳過問題的API端點
        const response = await fetch(`http://localhost:3000${selectedHistoryFile.path}?t=${Date.now()}`);
        if (!response.ok) {
            throw new Error(`無法獲取文件: ${response.status} ${response.statusText}`);
        }
        
        const fileContent = await response.text();
        
        // 提取並處理數據
        const result = extractAndProcessData(fileContent);
        
        if (result.success && result.data) {
            document.getElementById('loadingMessage').style.display = 'none';
            create3DModel(result.data);
        } else {
            throw new Error(result.error || "無法提取數據");
        }
    } catch (error) {
        console.error("使用歷史文件失敗:", error);
        document.getElementById('loadingMessage').style.display = 'none'; 
        document.getElementById('errorMessage').textContent = `加載歷史記錄失敗: ${error.message}`;
        document.getElementById('errorMessage').style.display = 'block';
        
        // 嘗試最後的備用加載方法
        tryFallbackLoading();
    }
}

// 從檔案中提取並處理數據 - 增強版
function extractAndProcessData(fileContent) {
    try {
        // 提取 analysisData 部分
        const dataMatch = fileContent.match(/const\s+analysisData\s*=\s*(\[[\s\S]*?\]);/);
        if (!dataMatch || !dataMatch[1]) {
            return {
                success: false,
                error: "無法提取 analysisData",
                data: null
            };
        }
        
        let jsonStr = dataMatch[1];
        
        // 預處理 JSON 字符串
        jsonStr = removeJsonComments(jsonStr);
        jsonStr = evaluateMathExpressions(jsonStr);
        jsonStr = fixCommonJsonErrors(jsonStr);
        
        try {
            const data = JSON.parse(jsonStr);
            
            // 修復資料中可能的問題
            const fixedData = fixDataIssues(data);
            
            return {
                success: true,
                error: null,
                data: fixedData
            };
        } catch (e) {
            console.error("JSON 解析錯誤:", e);
            console.log("嘗試進一步修復 JSON");
            
            // 進一步修復 JSON
            const furtherFixedJson = deepFixJson(jsonStr);
            try {
                const data = JSON.parse(furtherFixedJson);
                const fixedData = fixDataIssues(data);
                
                return {
                    success: true,
                    error: null,
                    data: fixedData
                };
            } catch (deepError) {
                return {
                    success: false,
                    error: `即使進一步修復後仍無法解析 JSON: ${deepError.message}`,
                    data: null
                };
            }
        }
    } catch (e) {
        return {
            success: false,
            error: `提取數據時出錯: ${e.message}`,
            data: null
        };
    }
}

// 修復常見的 JSON 錯誤
function fixCommonJsonErrors(jsonStr) {
    let result = jsonStr;
    
    // 1. 修復尾隨逗號
    result = result.replace(/,(\s*[\]}])/g, '$1');
    
    // 2. 確保屬性名稱用雙引號包圍
    result = result.replace(/(\n\s*)([a-zA-Z0-9_$]+)(\s*:)/g, '$1"$2"$3');
    
    // 3. 將單引號轉換為雙引號
    result = result.replace(/'([^']*?)'/g, '"$1"');
    
    // 4. 修復缺少逗號的情況 (在 } 和 { 之間)
    result = result.replace(/}(\s*){/g, '},\n$1{');
    
    // 5. 修復無效的數值表示法
    result = result.replace(/:\s*\.(\d+)/g, ': 0.$1');
    
    return result;
}

// 深度修復 JSON 字符串
function deepFixJson(jsonStr) {
    // 先做基本修復
    let result = fixCommonJsonErrors(jsonStr);
    
    // 按行處理
    const lines = result.split('\n');
    const fixedLines = [];
    let inString = false;
    let openBraces = 0;
    let openBrackets = 0;
    
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        if (!line) continue;
        
        // 處理未閉合的引號
        const quoteCount = (line.match(/"/g) || []).length;
        if (quoteCount % 2 !== 0) {
            // 如果有未閉合的引號
            if (line.endsWith(',') || line.endsWith('{') || line.endsWith('[')) {
                line += '"';
            } else if (!line.endsWith('"')) {
                line += '",';
            }
        }
        
        // 檢查 JSON 對象屬性的格式
        if (line.match(/^[a-zA-Z0-9_$]+\s*:/) && !line.match(/^"[^"]*"\s*:/)) {
            line = line.replace(/^([a-zA-Z0-9_$]+)(\s*:)/, '"$1"$2');
        }
        
        // 確保對象鍵之間有逗號
        if (i > 0 && fixedLines.length > 0) {
            const prevLine = fixedLines[fixedLines.length - 1];
            if (prevLine.match(/:\s*[^,{[\s].*$/) && 
                !prevLine.endsWith(',') && 
                !prevLine.endsWith('{') && 
                !prevLine.endsWith('[') &&
                line.match(/^"[^"]*"\s*:/)) {
                fixedLines[fixedLines.length - 1] = prevLine + ',';
            }
        }
        
        fixedLines.push(line);
    }
    
    result = fixedLines.join('\n');
    
    // 修復數值問題
    result = result.replace(/:\s*([^",\s\]}]+)(\s*[,\]}])/g, (match, value, suffix) => {
        // 檢查值是否為有效的數字
        if (!isNaN(value) || value === "true" || value === "false" || value === "null") {
            return match;
        } else {
            // 不是有效的數字或布爾值，用引號包裹
            return `: "${value}"${suffix}`;
        }
    });
    
    return result;
}

// 修復數據中可能的問題
function fixDataIssues(data) {
    if (!Array.isArray(data)) return data;
    
    return data.map(item => {
        if (!item) return item;
        
        const fixedItem = {...item};
        
        // 修復可能為 NaN 或無效的數值
        ['width', 'height', 'depth', 'x', 'y', 'z', 'radius'].forEach(prop => {
            if (fixedItem[prop] !== undefined) {
                if (isNaN(fixedItem[prop]) || !isFinite(fixedItem[prop])) {
                    if (prop === 'depth') fixedItem[prop] = 0.1;
                    else if (prop === 'radius') fixedItem[prop] = 0.5;
                    else fixedItem[prop] = 1;
                } else if (fixedItem[prop] === 0) {
                    // 某些屬性不應為0
                    if (prop === 'width' || prop === 'height') {
                        fixedItem[prop] = 1;
                    } else if (prop === 'depth' && item.type !== 'plane') {
                        fixedItem[prop] = 0.1;
                    }
                }
            }
        });
        
        // 修復柱子問題
        if (fixedItem.type === "column") {
            if (!fixedItem.radius && fixedItem.width && !fixedItem.shape) {
                fixedItem.shape = "square";
            }
            
            if (fixedItem.shape === "square" && !fixedItem.depth) {
                fixedItem.depth = fixedItem.width || 0.3;
            }
        }
        
        return fixedItem;
    });
}

// 從 JS 文件提取 analysisData (使用增強提取函數)
function extractDataFromJsFile(fileContent) {
    return extractAndProcessData(fileContent);
}

// 腳本加載失敗時的備用加載方法
async function tryFallbackLoading() {
    try {
        console.log("嘗試直接獲取歷史文件的原始內容");
        const response = await fetch(`http://localhost:3000${selectedHistoryFile.path}?t=${Date.now()}`);
        
        if (!response.ok) {
            console.error("無法獲取原始內容");
            return false;
        }
        
        const fileContent = await response.text();
        
        // 嘗試提取 analysisData 部分
        const dataMatch = fileContent.match(/const\s+analysisData\s*=\s*(\[[\s\S]*?\]);/);
        
        if (!dataMatch || !dataMatch[1]) {
            console.error("無法提取 analysisData");
            return false;
        }
        
        // 嘗試修復並解析提取的 JSON
        const repairedJsonStr = removeJsonComments(dataMatch[1]);
        let parsedData;
        
        try {
            parsedData = JSON.parse(repairedJsonStr);
        } catch (parseError) {
            console.error("解析提取的 JSON 失敗:", parseError);
            return false;
        }
        
        // 使用解析後的數據直接渲染
        console.log("使用備用方法渲染歷史數據");
        create3DModel(parsedData);
        
        return true;
    } catch (error) {
        console.error("備用加載方法失敗:", error);
        return false;
    }
}

// 頁面加載完成時初始化歷史記