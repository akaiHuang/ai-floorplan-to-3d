/**
 * JSON 修復工具
 * 專門處理非標準 JSON 格式的修復和解析
 */

const jsonFixer = {
    // 主函數：嘗試修復和解析 JSON
    fixAndParseJson: function(jsonStr) {
        // 先應用基本修復
        let fixedJson = this.basicFix(jsonStr);
        
        try {
            // 嘗試解析
            return {
                success: true,
                data: JSON.parse(fixedJson),
                error: null
            };
        } catch (e) {
            console.log("基本修復後仍無法解析 JSON，嘗試高級修復");
            
            // 嘗試更深層次的修復
            fixedJson = this.advancedFix(jsonStr);
            
            try {
                return {
                    success: true,
                    data: JSON.parse(fixedJson),
                    error: null
                };
            } catch (deepError) {
                return {
                    success: false,
                    data: null,
                    error: `無法解析 JSON: ${deepError.message}`
                };
            }
        }
    },
    
    // 從 JS 文件中提取並處理 analysisData
    extractDataFromJsFile: function(fileContent) {
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
            
            // 獲取 JSON 字符串
            const jsonStr = dataMatch[1];
            
            // 使用修復和解析函數
            const result = this.fixAndParseJson(jsonStr);
            
            if (result.success) {
                // 如果解析成功，修復可能的數據問題
                result.data = this.fixDataValues(result.data);
            }
            
            return result;
            
        } catch (e) {
            return {
                success: false,
                error: `提取數據時出錯: ${e.message}`,
                data: null
            };
        }
    },
    
    // 基本的 JSON 修復
    basicFix: function(jsonStr) {
        let result = jsonStr;
        
        // 移除註釋
        result = result.replace(/\/\/.*$/gm, '');  // 移除單行註釋
        result = result.replace(/\/\*[\s\S]*?\*\//g, '');  // 移除多行註釋
        
        // 修復尾隨逗號
        result = result.replace(/,(\s*[\]}])/g, '$1');
        
        // 確保屬性名稱用雙引號包圍
        result = result.replace(/(\n\s*)([a-zA-Z0-9_$]+)(\s*:)/g, '$1"$2"$3');
        
        // 將單引號轉換為雙引號
        result = result.replace(/'([^']*?)'/g, '"$1"');
        
        return result;
    },
    
    // 高級 JSON 修復
    advancedFix: function(jsonStr) {
        // 先應用基本修復
        let result = this.basicFix(jsonStr);
        
        // 計算數學表達式
        result = this.evaluateMathExpressions(result);
        
        // 按行處理更複雜的問題
        const lines = result.split('\n');
        const fixedLines = [];
        
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].trim();
            if (!line) continue;
            
            // 處理未閉合的引號
            const quoteCount = (line.match(/"/g) || []).length;
            if (quoteCount % 2 !== 0 && !line.includes('\\\"')) {
                if (line.startsWith('"') && !line.endsWith('"') && !line.endsWith('",')) {
                    line += '"';
                }
            }
            
            // 處理無效的數值表示法
            line = line.replace(/:\s*\.(\d+)/g, ': 0.$1');
            
            // 確保數值前後有適當的標點符號
            line = line.replace(/([}])\s*([{])/g, '$1,$2');
            
            fixedLines.push(line);
        }
        
        result = fixedLines.join('\n');
        
        // 最終清理
        result = result.replace(/,\s*\]/g, '\n]');  // 移除陣列最後一個元素後的逗號
        result = result.replace(/,\s*\}/g, '\n}');  // 移除對象最後一個元素後的逗號
        
        return result;
    },
    
    // 計算字符串中的數學表達式
    evaluateMathExpressions: function(jsonStr) {
        return jsonStr.replace(/"([^"]+)":\s*(-?\d+(\.\d+)?)\s*([+\-*/])\s*(-?\d+(\.\d+)?)/g, 
            (match, key, n1, _, op, n2) => {
                try {
                    const num1 = parseFloat(n1);
                    const num2 = parseFloat(n2);
                    let result;
                    
                    // 計算結果
                    switch (op) {
                        case '+': result = num1 + num2; break;
                        case '-': result = num1 - num2; break;
                        case '*': result = num1 * num2; break;
                        case '/': 
                            if (num2 === 0) {
                                result = 0;
                                console.warn(`除以零: ${num1} / 0`);
                            } else {
                                result = num1 / num2; 
                            }
                            break;
                        default: result = NaN;
                    }
                    
                    if (isNaN(result) || !isFinite(result)) {
                        return `"${key}": ${num1}`;
                    }
                    
                    return `"${key}": ${result}`;
                } catch (e) {
                    return match;
                }
            }
        );
    },
    
    // 修復解析後的數據中可能的問題
    fixDataValues: function(data) {
        if (!Array.isArray(data)) return data;
        
        return data.map(item => {
            if (!item) return item;
            
            const fixedItem = {...item};
            
            // 修復數值屬性
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
            
            // 類型特定修復
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
};

// 在全局範圍內提供 jsonFixer 工具
window.jsonFixer = jsonFixer;
