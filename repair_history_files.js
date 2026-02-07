/**
 * 歷史文件修復工具
 * 用於檢查和修復所有歷史數據文件中的格式問題
 */

const fs = require('fs');
const path = require('path');

const historyDir = path.join(__dirname, 'history');

// 確保歷史目錄存在
if (!fs.existsSync(historyDir)) {
    console.error(`歷史目錄不存在: ${historyDir}`);
    process.exit(1);
}

// 獲取所有 JS 歷史文件
const historyFiles = fs.readdirSync(historyDir)
    .filter(file => file.endsWith('.js'));

console.log(`找到 ${historyFiles.length} 個歷史文件`);

let fixedCount = 0;
let errorCount = 0;

// 處理每個文件
historyFiles.forEach(filename => {
    const filePath = path.join(historyDir, filename);
    console.log(`檢查文件: ${filename}`);
    
    try {
        // 讀取文件內容
        let content = fs.readFileSync(filePath, 'utf8');
        
        // 提取 analysisData 部分
        const dataMatch = content.match(/const\s+analysisData\s*=\s*(\[[\s\S]*?\]);/);
        if (!dataMatch || !dataMatch[1]) {
            console.warn(`  無法提取 analysisData: ${filename}`);
            return;
        }
        
        let jsonStr = dataMatch[1];
        let data;
        
        try {
            data = JSON.parse(jsonStr);
        } catch (e) {
            console.error(`  JSON 解析錯誤: ${filename}`, e);
            errorCount++;
            return;
        }
        
        // 檢查是否需要修復
        let needsFix = false;
        
        // 修復數據
        const fixedData = data.map(item => {
            if (!item) return item;
            
            let itemNeedsFix = false;
            const fixedItem = {...item};
            
            // 修復數值為0或無效的屬性
            if (fixedItem.width === 0) {
                fixedItem.width = 1;
                itemNeedsFix = true;
            }
            if (fixedItem.height === 0) {
                fixedItem.height = 1;
                itemNeedsFix = true;
            }
            if (fixedItem.depth === 0) {
                fixedItem.depth = 0.1;
                itemNeedsFix = true;
            }
            
            // 修復柱子問題
            if (fixedItem.type === "column") {
                if (!fixedItem.radius && fixedItem.width) {
                    if (!fixedItem.shape) {
                        // 添加 shape="square" 屬性
                        fixedItem.shape = "square";
                        itemNeedsFix = true;
                    } else if (fixedItem.shape !== "square" && !fixedItem.radius) {
                        // 如果 shape 不是 square 但沒有 radius，則計算 radius
                        fixedItem.radius = fixedItem.width / 2;
                        delete fixedItem.width;
                        delete fixedItem.shape;
                        itemNeedsFix = true;
                    }
                }
                
                // 確保方形柱子有 depth
                if (fixedItem.shape === "square" && !fixedItem.depth) {
                    fixedItem.depth = fixedItem.width;
                    itemNeedsFix = true;
                }
            }
            
            if (itemNeedsFix) {
                needsFix = true;
            }
            
            return fixedItem;
        });
        
        // 如果需要修復，則寫入修復後的文件
        if (needsFix) {
            const newContent = content.replace(jsonStr, JSON.stringify(fixedData, null, 2));
            fs.writeFileSync(filePath, newContent);
            console.log(`  已修復: ${filename}`);
            fixedCount++;
        } else {
            console.log(`  無需修復: ${filename}`);
        }
    } catch (e) {
        console.error(`  處理文件時出錯: ${filename}`, e);
        errorCount++;
    }
});

console.log('\n修復摘要:');
console.log(`總文件數: ${historyFiles.length}`);
console.log(`已修復: ${fixedCount}`);
console.log(`錯誤: ${errorCount}`);
console.log(`無需修復: ${historyFiles.length - fixedCount - errorCount}`);

if (fixedCount > 0) {
    console.log('\n提示: 文件已修復，請重啟應用程序以加載修復後的文件。');
}
