/**
 * AI 指令處理模塊
 * 處理用戶自然語言指令並修改 3D 模型
 */

// 當前的模型數據
let currentModelData = [];

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    // 綁定按鈕事件和輸入事件
    const commandInput = document.getElementById('commandInput');
    const executeButton = document.getElementById('executeCommand');
    
    executeButton.addEventListener('click', () => processCommand());
    
    // 按 Enter 鍵也可以執行命令
    commandInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            processCommand();
        }
    });
});

// 將當前渲染的模型數據保存到全局變量
function updateCurrentModelData(data) {
    // 深拷貝數據，避免引用問題
    currentModelData = JSON.parse(JSON.stringify(data));
    console.log("已更新當前模型數據，元素數量:", currentModelData.length);
}

// 處理用戶命令
async function processCommand() {
    const commandInput = document.getElementById('commandInput');
    const command = commandInput.value.trim();
    
    if (!command) return;
    
    // 清空輸入框
    commandInput.value = '';
    
    // 添加到命令歷史
    addToCommandHistory('user', command);
    
    if (!currentModelData || currentModelData.length === 0) {
        addToCommandHistory('error', '沒有可用的模型數據。請先上傳一個平面圖或載入歷史記錄。');
        return;
    }
    
    try {
        // 顯示處理中提示
        addToCommandHistory('ai', '正在處理您的請求...');
        
        // 在送出 API 請求前，顯示當前模型數據
        console.log("送出的 JSON 數據:", JSON.stringify(currentModelData, null, 2));
        console.log(`準備處理指令: "${command}"，資料包含 ${currentModelData.length} 個物件`);
        
        // 使用 OpenAI API 處理命令
        const modifiedData = await processCommandWithAI(command, currentModelData);
        
        if (!modifiedData) {
            throw new Error('AI 處理失敗，無法修改模型');
        }
        
        // 更新顯示與數據
        addToCommandHistory('ai', '已根據您的指令修改模型');
        currentModelData = modifiedData;
        
        // 重新渲染模型
        create3DModel(modifiedData);
        
    } catch (error) {
        console.error('處理命令時出錯:', error);
        addToCommandHistory('error', `處理命令時出錯: ${error.message}`);
    }
}

// 使用 AI 處理命令
async function processCommandWithAI(command, modelData) {
    // 改為默認使用服務器端處理
    const useLocalProcessing = false; 
    
    if (useLocalProcessing) {
        return processCommandLocally(command, modelData);
    }
    
    try {
        // 在發送請求前記錄詳細資訊
        console.log(`正在送出 API 請求到 /process-command`);
        console.log(`指令內容: "${command}"`);
        console.log(`模型資料大小: ${JSON.stringify(modelData).length} 字元`);
        
        // 嘗試使用服務器端 AI 處理
        const response = await fetch('http://localhost:3000/process-command', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                command: command,
                modelData: modelData
            })
        }).catch(error => {
            console.log("服務器處理失敗，切換到本地處理:", error);
            // 如果服務器請求失敗，切換到本地處理
            return { ok: false };
        });
        
        if (!response.ok) {
            // 如果服務器端處理失敗，切換到本地處理
            console.log("服務器處理失敗，切換到本地處理");
            return processCommandLocally(command, modelData);
        }
        
        const result = await response.json();
        console.log("收到處理結果:", result);
        return result.modifiedData;
    } catch (error) {
        console.error('API 調用失敗，切換到本地處理:', error);
        // 如有錯誤，嘗試本地處理
        return processCommandLocally(command, modelData);
    }
}

// 本地處理命令的更強大實現
function processCommandLocally(command, modelData) {
    // 創建一個深拷貝以避免修改原始數據
    const data = JSON.parse(JSON.stringify(modelData));
    
    // 將命令轉換為小寫以便比較
    const cmd = command.toLowerCase();
    
    try {
        // 更全面的命令解析
        const hasCommand = analyzeCommand(cmd, data);
        
        if (hasCommand) {
            return data;
        }
        
        // 如果沒有匹配的命令，返回原始數據並顯示錯誤
        throw new Error('無法理解您的指令，請嘗試使用更簡單明確的語言，例如：「將柱子向左移動1米」或「增加牆壁高度0.5米」');
    } catch (error) {
        console.error('本地處理命令出錯:', error);
        throw error;
    }
}

// 統一的命令分析函數
function analyzeCommand(cmd, data) {
    // 跟踪是否有命令被成功處理
    let commandProcessed = false;
    
    // 識別移動對象的命令
    commandProcessed = processMovementCommand(cmd, data) || commandProcessed;
    
    // 識別調整尺寸的命令
    commandProcessed = processSizeCommand(cmd, data) || commandProcessed;
    
    // 識別添加/刪除對象的命令
    commandProcessed = processAddRemoveCommand(cmd, data) || commandProcessed;
    
    // 識別顏色調整命令
    commandProcessed = processColorCommand(cmd, data) || commandProcessed;
    
    return commandProcessed;
}

// 處理移動對象的指令
function processMovementCommand(cmd, data) {
    // 識別需要移動的對象類型
    let targetType = null;
    if (cmd.includes('柱子') || cmd.includes('支柱') || cmd.includes('柱')) targetType = 'column';
    else if (cmd.includes('牆') || cmd.includes('墻') || cmd.includes('墙') || cmd.includes('wall')) targetType = 'wall';
    else if (cmd.includes('門') || cmd.includes('门') || cmd.includes('door')) targetType = 'door';
    else if (cmd.includes('窗') || cmd.includes('window')) targetType = 'window';
    else if (cmd.includes('地板') || cmd.includes('floor')) targetType = 'floor';
    
    // 如果沒有明確的對象類型但包含移動相關詞彙，嘗試識別
    if (!targetType && (cmd.includes('移動') || cmd.includes('移') || cmd.includes('往') || 
                         cmd.includes('向') || cmd.includes('朝') || cmd.includes('跳') || 
                         cmd.includes('到'))) {
        // 檢查是否指定了某個對象的索引
        const indexMatch = cmd.match(/第(\d+)個/);
        if (indexMatch) {
            // 用戶指定了對象索引，尋找該對象
            const index = parseInt(indexMatch[1]) - 1; // 轉換為0基索引
            if (index >= 0 && index < data.length) {
                targetType = data[index].type; // 直接使用指定對象的類型
                
                // 提取方向和距離
                const result = extractDirectionAndDistance(cmd);
                if (result.direction && typeof result.distance === 'number') {
                    // 只應用到指定索引的對象
                    applyMovement(data[index], result.direction, result.distance);
                    return true;
                }
            }
        }
    }
    
    // 如果有明確的目標類型
    if (targetType) {
        // 提取方向和距離
        const result = extractDirectionAndDistance(cmd);
        if (result.direction && typeof result.distance === 'number') {
            // 計數修改的項目
            let modifiedCount = 0;
            
            // 應用到所有匹配的對象
            data.forEach(item => {
                if (item.type === targetType) {
                    applyMovement(item, result.direction, result.distance);
                    modifiedCount++;
                }
            });
            
            return modifiedCount > 0; // 如果有修改則返回 true
        }
    }
    
    return false; // 沒有處理任何移動命令
}

// 提取方向和距離
function extractDirectionAndDistance(cmd) {
    let direction = null;
    let distance = null;
    
    // 識別方向詞
    if (cmd.includes('左') || cmd.includes('向左') || cmd.includes('往左')) direction = 'left';
    else if (cmd.includes('右') || cmd.includes('向右') || cmd.includes('往右')) direction = 'right';
    else if (cmd.includes('前') || cmd.includes('向前') || cmd.includes('往前') || 
             cmd.includes('上') || cmd.includes('向上') || cmd.includes('往上')) direction = 'forward';
    else if (cmd.includes('後') || cmd.includes('向後') || cmd.includes('往後') || 
             cmd.includes('下') || cmd.includes('向下') || cmd.includes('往下')) direction = 'backward';
    else if (cmd.includes('東') || cmd.includes('东')) direction = 'right';
    else if (cmd.includes('西')) direction = 'left';
    else if (cmd.includes('南')) direction = 'backward';
    else if (cmd.includes('北')) direction = 'forward';
    
    // 提取數字
    const numberMatch = cmd.match(/(\d+(\.\d+)?)/);
    if (numberMatch) {
        distance = parseFloat(numberMatch[0]);
    }
    
    // 如果找到了數字但沒有方向，嘗試根據上下文推斷
    if (distance !== null && direction === null) {
        if (cmd.includes('x') || cmd.includes('X')) {
            direction = distance >= 0 ? 'right' : 'left';
        } else if (cmd.includes('z') || cmd.includes('Z')) {
            direction = distance >= 0 ? 'backward' : 'forward';
        } else if (cmd.includes('y') || cmd.includes('Y')) {
            // Y軸用於高度，這裡不處理
        }
    }
    
    return { direction, distance };
}

// 應用移動到指定物體
function applyMovement(item, direction, distance) {
    switch (direction) {
        case 'left':
            item.x = (item.x || 0) - distance;
            break;
        case 'right':
            item.x = (item.x || 0) + distance;
            break;
        case 'forward':
            item.z = (item.z || 0) - distance;
            break;
        case 'backward':
            item.z = (item.z || 0) + distance;
            break;
    }
}

// 處理調整尺寸的命令
function processSizeCommand(cmd, data) {
    // 識別需要調整尺寸的對象類型
    let targetType = null;
    if (cmd.includes('柱子') || cmd.includes('支柱') || cmd.includes('柱')) targetType = 'column';
    else if (cmd.includes('牆') || cmd.includes('墻') || cmd.includes('墙') || cmd.includes('wall')) targetType = 'wall';
    else if (cmd.includes('門') || cmd.includes('门') || cmd.includes('door')) targetType = 'door';
    else if (cmd.includes('窗') || cmd.includes('window')) targetType = 'window';
    else if (cmd.includes('地板') || cmd.includes('floor')) targetType = 'floor';
    
    // 如果沒有指定對象但有尺寸修改詞，嘗試處理
    if (!targetType && (cmd.includes('寬度') || cmd.includes('高度') || cmd.includes('深度') || 
                         cmd.includes('尺寸') || cmd.includes('大小'))) {
        // 檢查是否指定了某個對象的索引
        const indexMatch = cmd.match(/第(\d+)個/);
        if (indexMatch) {
            // 用戶指定了對象索引，尋找該對象
            const index = parseInt(indexMatch[1]) - 1; // 轉換為0基索引
            if (index >= 0 && index < data.length) {
                targetType = data[index].type; // 使用該對象的類型
                return processObjectSize(cmd, data[index]); // 只處理指定的對象
            }
        }
    }
    
    // 如果有目標類型，處理尺寸調整
    if (targetType) {
        let modifiedCount = 0;
        data.forEach(item => {
            if (item.type === targetType) {
                if (processObjectSize(cmd, item)) {
                    modifiedCount++;
                }
            }
        });
        
        return modifiedCount > 0;
    }
    
    return false;
}

// 處理單個對象的尺寸
function processObjectSize(cmd, item) {
    let modified = false;
    
    // 判斷是增加還是減少尺寸
    let isIncrease = true;
    if (cmd.includes('減') || cmd.includes('降低') || cmd.includes('縮小') || 
        cmd.includes('減少') || cmd.includes('縮短')) {
        isIncrease = false;
    }
    
    // 提取數字
    const numberMatch = cmd.match(/(\d+(\.\d+)?)/);
    let amount = 0;
    if (numberMatch) {
        amount = parseFloat(numberMatch[0]);
    } else {
        // 如果沒有明確的數字，使用默認值
        amount = 0.5;
    }
    
    // 根據命令調整不同的尺寸屬性
    if (cmd.includes('高') || cmd.includes('高度') || cmd.includes('height')) {
        item.height = (item.height || 1);
        item.height = isIncrease ? item.height + amount : Math.max(0.1, item.height - amount);
        modified = true;
    }
    
    if (cmd.includes('寬') || cmd.includes('寬度') || cmd.includes('width')) {
        item.width = (item.width || 1);
        item.width = isIncrease ? item.width + amount : Math.max(0.1, item.width - amount);
        modified = true;
    }
    
    if (cmd.includes('深') || cmd.includes('深度') || cmd.includes('depth')) {
        item.depth = (item.depth || 0.1);
        item.depth = isIncrease ? item.depth + amount : Math.max(0.05, item.depth - amount);
        modified = true;
    }
    
    // 如果是柱子且有 radius 屬性
    if (item.type === 'column' && item.radius !== undefined) {
        if (cmd.includes('半徑') || cmd.includes('直徑') || cmd.includes('粗') || 
            cmd.includes('radius') || cmd.includes('thickness')) {
            item.radius = (item.radius || 0.3);
            item.radius = isIncrease ? item.radius + amount/2 : Math.max(0.1, item.radius - amount/2);
            modified = true;
        }
    }
    
    return modified;
}

// 處理添加/刪除對象的命令
function processAddRemoveCommand(cmd, data) {
    // 識別添加命令
    if (cmd.includes('添加') || cmd.includes('加') || cmd.includes('新增') || 
        cmd.includes('放置') || cmd.includes('創建') || cmd.includes('建立') || 
        cmd.includes('add')) {
        
        // 識別添加的對象類型
        let newObjectType = null;
        if (cmd.includes('柱子') || cmd.includes('支柱') || cmd.includes('柱')) newObjectType = 'column';
        else if (cmd.includes('牆') || cmd.includes('墻') || cmd.includes('墙') || cmd.includes('wall')) newObjectType = 'wall';
        else if (cmd.includes('門') || cmd.includes('门') || cmd.includes('door')) newObjectType = 'door';
        else if (cmd.includes('窗') || cmd.includes('window')) newObjectType = 'window';
        
        if (newObjectType) {
            // 提取位置參數
            let x = 0, y = 0, z = 0;
            
            // 尋找 x 坐標
            const xMatch = cmd.match(/x\s*[=:：]\s*(-?\d+(\.\d+)?)/i) || 
                           cmd.match(/x\s+(-?\d+(\.\d+)?)/i) ||
                           cmd.match(/橫坐標[=:：]?\s*(-?\d+(\.\d+)?)/);
            
            // 尋找 z 坐標
            const zMatch = cmd.match(/z\s*[=:：]\s*(-?\d+(\.\d+)?)/i) || 
                           cmd.match(/z\s+(-?\d+(\.\d+)?)/i) ||
                           cmd.match(/縱坐標[=:：]?\s*(-?\d+(\.\d+)?)/);
            
            // 尋找 y 坐標 (高度)
            const yMatch = cmd.match(/y\s*[=:：]\s*(-?\d+(\.\d+)?)/i) || 
                           cmd.match(/y\s+(-?\d+(\.\d+)?)/i) || 
                           cmd.match(/高度[=:：]?\s*(-?\d+(\.\d+)?)/);
            
            if (xMatch) x = parseFloat(xMatch[1]);
            if (zMatch) z = parseFloat(zMatch[1]);
            if (yMatch) y = parseFloat(yMatch[1]);
            
            // 根據對象類型創建新物體
            const newObject = createNewObject(newObjectType, x, y, z, cmd);
            if (newObject) {
                data.push(newObject);
                return true;
            }
        }
    }
    
    // 識別刪除命令
    if (cmd.includes('刪除') || cmd.includes('删除') || cmd.includes('移除') || 
        cmd.includes('去掉') || cmd.includes('remove') || cmd.includes('delete')) {
        
        // 識別要刪除的對象類型
        let targetType = null;
        if (cmd.includes('柱子') || cmd.includes('支柱') || cmd.includes('柱')) targetType = 'column';
        else if (cmd.includes('牆') || cmd.includes('墻') || cmd.includes('墙') || cmd.includes('wall')) targetType = 'wall';
        else if (cmd.includes('門') || cmd.includes('门') || cmd.includes('door')) targetType = 'door';
        else if (cmd.includes('窗') || cmd.includes('window')) targetType = 'window';
        
        if (targetType) {
            // 檢查是否指定了特定索引
            const indexMatch = cmd.match(/第(\d+)個/);
            if (indexMatch) {
                const index = parseInt(indexMatch[1]) - 1;
                // 刪除特定索引的對象
                for (let i = 0; i < data.length; i++) {
                    if (data[i].type === targetType) {
                        if (index === 0) {  // 找到了要刪除的對象
                            data.splice(i, 1);
                            return true;
                        }
                        index--; // 遞減計數器，直到找到指定的第 n 個對象
                    }
                }
            } else {
                // 刪除所有指定類型的對象
                const originalLength = data.length;
                for (let i = data.length - 1; i >= 0; i--) {
                    if (data[i].type === targetType) {
                        data.splice(i, 1);
                    }
                }
                return data.length < originalLength;
            }
        }
    }
    
    return false;
}

// 創建新對象的輔助函數
function createNewObject(type, x, y, z, cmd) {
    // 提取尺寸信息
    const widthMatch = cmd.match(/寬度?[=:：]?\s*(\d+(\.\d+)?)/);
    const heightMatch = cmd.match(/高度?[=:：]?\s*(\d+(\.\d+)?)/);
    const depthMatch = cmd.match(/深度?[=:：]?\s*(\d+(\.\d+)?)/);
    
    let width = 1, height = 2, depth = 0.1;
    
    if (widthMatch) width = parseFloat(widthMatch[1]);
    if (heightMatch) height = parseFloat(heightMatch[1]);
    if (depthMatch) depth = parseFloat(depthMatch[1]);
    
    switch (type) {
        case 'wall':
            return {
                type: 'wall',
                x: x,
                y: y || height/2,
                z: z,
                width: width,
                height: height,
                depth: depth
            };
        case 'column':
            // 判斷是否是方形柱子
            const isSquare = cmd.includes('方形') || cmd.includes('square');
            if (isSquare) {
                return {
                    type: 'column',
                    shape: 'square',
                    x: x,
                    y: y || height/2,
                    z: z,
                    width: width,
                    depth: depth,
                    height: height
                };
            } else {
                const radiusMatch = cmd.match(/半徑[=:：]?\s*(\d+(\.\d+)?)/);
                let radius = radiusMatch ? parseFloat(radiusMatch[1]) : width/2;
                return {
                    type: 'column',
                    x: x,
                    y: y || height/2,
                    z: z,
                    radius: radius,
                    height: height
                };
            }
        case 'door':
            return {
                type: 'door',
                x: x,
                y: y || height/2,
                z: z,
                width: width,
                height: height,
                depth: 0.05
            };
        case 'window':
            return {
                type: 'window',
                x: x,
                y: y || height/2,
                z: z,
                width: width,
                height: height,
                depth: 0.05
            };
    }
    
    return null;
}

// 處理顏色命令
function processColorCommand(cmd, data) {
    // 檢查是否包含顏色相關詞彙
    const hasColorCommand = cmd.includes('顏色') || cmd.includes('颜色') || cmd.includes('color') || 
                           cmd.includes('紅') || cmd.includes('红') || cmd.includes('red') || 
                           cmd.includes('綠') || cmd.includes('绿') || cmd.includes('green') || 
                           cmd.includes('藍') || cmd.includes('蓝') || cmd.includes('blue') || 
                           cmd.includes('黃') || cmd.includes('黄') || cmd.includes('yellow') || 
                           cmd.includes('黑') || cmd.includes('black') || 
                           cmd.includes('白') || cmd.includes('white');
                           
    if (!hasColorCommand) return false;
    
    // 識別要更改的對象類型
    let targetType = null;
    if (cmd.includes('柱子') || cmd.includes('支柱') || cmd.includes('柱')) targetType = 'column';
    else if (cmd.includes('牆') || cmd.includes('墻') || cmd.includes('墙') || cmd.includes('wall')) targetType = 'wall';
    else if (cmd.includes('門') || cmd.includes('门') || cmd.includes('door')) targetType = 'door';
    else if (cmd.includes('窗') || cmd.includes('window')) targetType = 'window';
    else if (cmd.includes('地板') || cmd.includes('floor')) targetType = 'floor';
    
    // 識別顏色
    const color = identifyColor(cmd);
    if (!color) return false;
    
    // 如果指定了對象類型，則僅應用到該類型的對象
    if (targetType) {
        let modifiedCount = 0;
        data.forEach(item => {
            if (item.type === targetType) {
                item.color = color;
                modifiedCount++;
            }
        });
        return modifiedCount > 0;
    } else {
        // 如果沒有指定類型，查找特定索引
        const indexMatch = cmd.match(/第(\d+)個/);
        if (indexMatch) {
            const index = parseInt(indexMatch[1]) - 1; // 轉換為0基索引
            if (index >= 0 && index < data.length) {
                data[index].color = color;
                return true;
            }
        }
    }
    
    return false;
}

// 識別顏色的輔助函數
function identifyColor(cmd) {
    if (cmd.includes('紅') || cmd.includes('红') || cmd.includes('red')) return 0xff0000;
    if (cmd.includes('綠') || cmd.includes('绿') || cmd.includes('green')) return 0x00ff00;
    if (cmd.includes('藍') || cmd.includes('蓝') || cmd.includes('blue')) return 0x0000ff;
    if (cmd.includes('黃') || cmd.includes('黄') || cmd.includes('yellow')) return 0xffff00;
    if (cmd.includes('黑') || cmd.includes('black')) return 0x000000;
    if (cmd.includes('白') || cmd.includes('white')) return 0xffffff;
    if (cmd.includes('灰') || cmd.includes('grey') || cmd.includes('gray')) return 0x808080;
    if (cmd.includes('橙') || cmd.includes('orange')) return 0xffa500;
    if (cmd.includes('紫') || cmd.includes('purple')) return 0x800080;
    if (cmd.includes('棕') || cmd.includes('brown')) return 0xa52a2a;
    
    return null;
}

// 添加命令和響應到歷史記錄
function addToCommandHistory(type, message) {
    const commandHistory = document.getElementById('commandHistory');
    const entry = document.createElement('div');
    entry.className = 'command-entry';
    
    let messageClass = '';
    let prefix = '';
    
    switch (type) {
        case 'user':
            messageClass = 'user-command';
            prefix = '您: ';
            break;
        case 'ai':
            messageClass = 'ai-response';
            prefix = 'AI: ';
            break;
        case 'error':
            messageClass = 'error-message';
            prefix = '錯誤: ';
            break;
    }
    
    entry.innerHTML = `<div class="${messageClass}">${prefix}${message}</div>`;
    commandHistory.appendChild(entry);
    
    // 滾動到底部
    commandHistory.scrollTop = commandHistory.scrollHeight;
}
