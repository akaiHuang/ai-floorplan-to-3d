/**
 * 回退功能 - 當無法連接到後端服務器時使用
 */

// 使用靜態 JSON 文件而不是調用 API
async function useStaticJson() {
    try {
        document.getElementById('loadingMessage').style.display = 'block';
        document.getElementById('errorMessage').style.display = 'none';
        
        // 檢查是否有選中的歷史文件
        if (window.selectedHistoryFile) {
            useSelectedFile();
            return;
        }
        
        console.log("使用本地靜態數據模板...");
        
        // 從模板文件加載數據
        const response = await fetch('history/temp.js');
        if (!response.ok) {
            throw new Error(`無法加載模板文件: ${response.status} ${response.statusText}`);
        }
        
        const scriptContent = await response.text();
        
        // 使用動態腳本執行而不是解析 JSON
        const script = document.createElement('script');
        script.textContent = scriptContent;
        document.body.appendChild(script);
        
        // 等待腳本加載和執行
        setTimeout(() => {
            document.getElementById('loadingMessage').style.display = 'none';
            
            if (typeof renderAnalysis === 'function') {
                renderAnalysis();
            } else if (typeof analysisData !== 'undefined') {
                create3DModel(analysisData);
            } else {
                throw new Error("無法找到渲染函數或數據");
            }
        }, 100);
        
        return true;
    } catch (error) {
        console.error("加載靜態數據失敗:", error);
        document.getElementById('loadingMessage').style.display = 'none';
        document.getElementById('errorMessage').textContent = `無法加載示例數據: ${error.message}`;
        document.getElementById('errorMessage').style.display = 'block';
        return false;
    }
}

// 檢測服務器狀態
async function checkServerStatus() {
    try {
        const response = await fetch('http://localhost:3000/status', {
            method: 'GET',
            mode: 'no-cors'
        });
        return true;
    } catch (error) {
        console.warn("服務器狀態檢查失敗:", error);
        return false;
    }
}
