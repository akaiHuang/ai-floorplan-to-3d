/**
 * 數據驗證工具 - 確保 3D 模型數據符合規格
 */

// 驗證模型數據
function validateModelData(data) {
    if (!Array.isArray(data)) {
        console.error("數據必須是陣列格式");
        return false;
    }
    
    let isValid = true;
    
    data.forEach((item, index) => {
        if (!item.type) {
            console.error(`第 ${index + 1} 項缺少 type 屬性`);
            isValid = false;
            return;
        }
        
        switch (item.type) {
            case 'floor':
                if (!validateFloor(item, index)) isValid = false;
                break;
            case 'wall':
                if (!validateWall(item, index)) isValid = false;
                break;
            case 'column':
                if (!validateColumn(item, index)) isValid = false;
                break;
            case 'door':
            case 'window':
                if (!validateOpenings(item, index)) isValid = false;
                break;
            default:
                console.warn(`第 ${index + 1} 項使用未知的 type: ${item.type}`);
        }
    });
    
    return isValid;
}

// 驗證地板數據
function validateFloor(item, index) {
    if (typeof item.width !== 'number' || isNaN(item.width) || item.width <= 0) {
        console.error(`第 ${index + 1} 項 (floor) 的 width 無效: ${item.width}`);
        return false;
    }
    
    if (typeof item.height !== 'number' || isNaN(item.height) || item.height <= 0) {
        console.error(`第 ${index + 1} 項 (floor) 的 height 無效: ${item.height}`);
        return false;
    }
    
    return true;
}

// 驗證牆壁數據
function validateWall(item, index) {
    if (typeof item.width !== 'number' || isNaN(item.width) || item.width <= 0) {
        console.error(`第 ${index + 1} 項 (wall) 的 width 無效: ${item.width}`);
        return false;
    }
    
    if (typeof item.height !== 'number' || isNaN(item.height) || item.height <= 0) {
        console.error(`第 ${index + 1} 項 (wall) 的 height 無效: ${item.height}`);
        return false;
    }
    
    // 檢查坐標是否為數字
    if (isNaN(Number(item.x)) || isNaN(Number(item.y)) || isNaN(Number(item.z))) {
        console.error(`第 ${index + 1} 項 (wall) 的坐標無效: x=${item.x}, y=${item.y}, z=${item.z}`);
        return false;
    }
    
    return true;
}

// 驗證柱子數據
function validateColumn(item, index) {
    // 檢查是否為方形柱子
    const isSquare = item.shape === 'square' || 
                     (item.width && item.depth && !item.radius);
    
    if (isSquare) {
        // 驗證方形柱子
        if (typeof item.width !== 'number' || isNaN(item.width) || item.width <= 0) {
            console.error(`第 ${index + 1} 項 (方形柱子) 的 width 無效: ${item.width}`);
            return false;
        }
        
        // depth 可選，如果未提供則使用 width
        const depth = item.depth !== undefined ? item.depth : item.width;
        if (typeof depth !== 'number' || isNaN(depth) || depth <= 0) {
            console.error(`第 ${index + 1} 項 (方形柱子) 的 depth 無效: ${depth}`);
            return false;
        }
    } else {
        // 原有的圓形柱子驗證
        let hasValidRadius = false;
        
        if (typeof item.radius === 'number' && !isNaN(item.radius) && item.radius > 0) {
            hasValidRadius = true;
        } else if (typeof item.width === 'number' && !isNaN(item.width) && item.width > 0) {
            console.warn(`第 ${index + 1} 項 (圓形柱子) 使用 width 而不是 radius，將轉換為 radius=${item.width/2}`);
            hasValidRadius = true;
        }
        
        if (!hasValidRadius) {
            console.error(`第 ${index + 1} 項 (圓形柱子) 缺少有效的 radius`);
            return false;
        }
    }
    
    // 共用的驗證：高度和位置
    if (typeof item.height !== 'number' || isNaN(item.height) || item.height <= 0) {
        console.error(`第 ${index + 1} 項 (柱子) 的 height 無效: ${item.height}`);
        return false;
    }
    
    // 檢查坐標是否為數字
    if (isNaN(Number(item.x)) || isNaN(Number(item.y)) || isNaN(Number(item.z))) {
        console.error(`第 ${index + 1} 項 (柱子) 的坐標無效: x=${item.x}, y=${item.y}, z=${item.z}`);
        return false;
    }
    
    return true;
}

// 驗證門窗數據
function validateOpenings(item, index) {
    if (typeof item.width !== 'number' || isNaN(item.width) || item.width <= 0) {
        console.error(`第 ${index + 1} 項 (${item.type}) 的 width 無效: ${item.width}`);
        return false;
    }
    
    if (typeof item.height !== 'number' || isNaN(item.height) || item.height <= 0) {
        console.error(`第 ${index + 1} 項 (${item.type}) 的 height 無效: ${item.height}`);
        return false;
    }
    
    // 檢查坐標是否為數字
    if (isNaN(Number(item.x)) || isNaN(Number(item.y)) || isNaN(Number(item.z))) {
        console.error(`第 ${index + 1} 項 (${item.type}) 的坐標無效: x=${item.x}, y=${item.y}, z=${item.z}`);
        return false;
    }
    
    return true;
}
