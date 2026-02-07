// 確保 THREE.js 和 OrbitControls 已經載入
if (typeof THREE === 'undefined') {
    console.error("THREE.js 未加載！");
    document.getElementById('errorMessage').textContent = 'THREE.js 庫未正確加載，請刷新頁面或檢查網絡連接。';
    document.getElementById('errorMessage').style.display = 'block';
}

console.log("script.js 已加載，THREE 對象:", typeof THREE);
console.log("OrbitControls 狀態:", typeof THREE.OrbitControls !== 'undefined' ? '可用' : '不可用');

let analysisStartTime; // 記錄分析開始時間
let progressInterval; // 進度更新計時器

// 新增：元件選擇相關變數
let selectedObjects = []; // 選中的物件陣列
let raycaster; // 射線投射器
let mouse; // 滑鼠位置
let scene; // 場景引用
let camera; // 相機引用
let renderer; // 渲染器引用
let selectionBox; // 選擇框物件

async function uploadFile() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    
    // 檢查是否選擇了文件
    if (!file) {
        alert('請選擇一個文件上傳');
        return;
    }
    
    // 檢查是否為圖片
    if (!file.type.startsWith('image/')) {
        alert('請上傳圖片文件');
        return;
    }
    
    // 顯示 AI 分析中提示
    showAnalysisStatus();
    
    // 顯示加載中提示
    document.getElementById('loadingMessage').style.display = 'none';
    document.getElementById('errorMessage').style.display = 'none';
    
    const formData = new FormData();
    formData.append('file', file);

    try {
        console.log("開始上傳文件...", file.name, file.type, file.size + " bytes");
        
        // 檢查後端服務器是否在運行
        try {
            console.log("檢查後端服務器狀態...");
            const checkResponse = await fetch('http://localhost:3000', { 
                method: 'GET',
                mode: 'no-cors' 
            });
            console.log("後端服務器檢查結果:", checkResponse.type);
        } catch (checkError) {
            console.error("後端服務器檢查失敗:", checkError);
            throw new Error(`無法連接到後端服務器，請確保服務器已在端口 3000 上啟動: ${checkError.message}`);
        }
        
        // 使用完整的 URL
        const backendUrl = 'http://localhost:3000/upload';
        console.log("發送請求至:", backendUrl);
        
        // 移除不必要的 headers，簡化請求
        const response = await fetch(backendUrl, {
            method: 'POST',
            body: formData,
            mode: 'cors'
        }).catch(fetchError => {
            console.error("Fetch 操作錯誤:", fetchError);
            throw new Error(`網絡請求失敗: ${fetchError.message}`);
        });
        
        console.log("收到響應狀態:", response.status, response.statusText);
        console.log("響應類型:", response.type);
        console.log("響應 headers:", [...response.headers.entries()]);
        
        if (!response.ok) {
            console.error("響應不成功:", response.status, response.statusText);
            
            // 嘗試獲取錯誤細節
            let errorDetails = null;
            try {
                const errorText = await response.text();
                console.log("錯誤響應內容:", errorText);
                
                try {
                    errorDetails = JSON.parse(errorText);
                } catch (parseError) {
                    errorDetails = { error: errorText };
                }
            } catch (textError) {
                console.error("無法讀取錯誤詳情:", textError);
            }
            
            throw new Error(`服務器錯誤 (${response.status}): ${
                errorDetails?.error || response.statusText
            }`);
        }

        // 先獲取響應的 blob，然後嘗試讀取為文本
        console.log("獲取響應內容...");
        const blob = await response.blob();
        console.log("收到的 blob:", blob.type, blob.size + " bytes");
        
        const responseText = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(new Error("無法讀取響應數據"));
            reader.readAsText(blob);
        });
        
        console.log("收到的響應文本長度:", responseText.length);
        console.log("響應前 200 字符:", responseText.substring(0, 200) + "...");
        
        let json;
        try {
            json = JSON.parse(responseText);
            console.log("JSON 解析成功");
        } catch (parseError) {
            console.error("JSON 解析失敗:", parseError);
            throw new Error(`無法解析服務器響應: ${parseError.message}. 原始響應: ${responseText.substring(0, 100)}...`);
        }
        
        // 取得 JSON 響應後，等待一段時間確保文件系統操作完成
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 先渲染 3D 模型
        create3DModel(json);
        
        // 刷新歷史記錄列表
        await refreshHistoryList();
        
        // 再等待一段時間，確保一切操作都已完成
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 分析完成並記錄在歷史清單後才隱藏分析中提示
        hideAnalysisStatus();
        
    } catch (error) {
        // 隱藏分析中提示
        hideAnalysisStatus();
        
        console.error('上傳失敗:', error);
        document.getElementById('loadingMessage').style.display = 'none';
        document.getElementById('errorMessage').textContent = `錯誤: ${error.message}\n\n詳細錯誤: ${error.stack || '(無堆棧信息)'}`;
        document.getElementById('errorMessage').style.display = 'block';
    }
}

// 新增測試渲染按鈕功能
function testRender() {
    if (typeof testData !== 'undefined') {
        console.log("使用測試數據進行渲染");
        create3DModel(testData);
    } else {
        console.error("測試數據未定義，請確保已加載 test_data.js");
        alert("測試數據未定義，請確保已加載 test_data.js");
    }
}

function create3DModel(data) {
    console.log("開始創建 3D 模型，數據:", data);
    
    // 更新當前模型數據（用於 AI 指令）
    if (typeof updateCurrentModelData === 'function') {
        updateCurrentModelData(data);
    }
    
    const container = document.getElementById('threejsContainer');
    
    // 清除舊的內容
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
    
    try {
        // 確認 THREE 對象可用
        if (typeof THREE === 'undefined') {
            throw new Error("THREE.js 未載入");
        }
        
        // 確認是否能創建場景
        scene = new THREE.Scene();
        if (!scene) {
            throw new Error("無法創建 THREE.Scene");
        }
        
        scene.background = new THREE.Color(0xf0f0f0); // 淺灰色背景
        
        camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        container.appendChild(renderer.domElement);

        // 添加環境光
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);
        
        // 添加方向光
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(1, 1, 1);
        scene.add(directionalLight);

        // 檢查 OrbitControls 是否可用
        if (typeof THREE.OrbitControls === 'undefined') {
            console.error("OrbitControls 未載入");
            document.getElementById('orbitControlsStatus').textContent = '❌ 未定義';
            document.getElementById('orbitControlsStatus').style.color = 'red';
        }
        
        // 添加控制器，允許用戶旋轉視角
        const controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true; // 啟用阻尼效果
        controls.dampingFactor = 0.05;

        // 初始化射線投射器和滑鼠位置向量（用於選擇物件）
        raycaster = new THREE.Raycaster();
        mouse = new THREE.Vector2();

        // 計算場景邊界，用於適當放置相機
        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;
        let minZ = Infinity, maxZ = -Infinity;
        
        // 物件映射表，用於存儲 3D 物件與原始資料的對應關係
        const objectDataMap = new Map();

        // 根據 data 創建地板、牆壁和柱子
        if (Array.isArray(data)) {
            data.forEach((item, index) => {
                try {
                    // 檢查必要屬性是否存在
                    if (!item || !item.type) {
                        console.warn("跳過無效項目:", item);
                        return;
                    }
                    
                    let object3D = null;
                    
                    if (item.type === 'floor') {
                        // 檢查 width 和 height 是否為有效數字
                        const width = Number(item.width);
                        const height = Number(item.height);
                        
                        if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
                            console.warn("跳過無效地板尺寸:", item);
                            return;
                        }
                        
                        const geometry = new THREE.PlaneGeometry(width, height);
                        const material = new THREE.MeshStandardMaterial({ 
                            color: 0xaaaaaa,
                            side: THREE.DoubleSide 
                        });
                        const floor = new THREE.Mesh(geometry, material);
                        floor.rotation.x = -Math.PI / 2;
                        floor.userData.type = 'floor';
                        floor.userData.index = index;
                        scene.add(floor);
                        object3D = floor;
                        
                        // 更新邊界
                        minX = Math.min(minX, -width/2);
                        maxX = Math.max(maxX, width/2);
                        minZ = Math.min(minZ, -height/2);
                        maxZ = Math.max(maxZ, height/2);
                        
                    } else if (item.type === 'wall') {
                        // 檢查必要屬性
                        const width = Number(item.width || 0);
                        const height = Number(item.height || 0);
                        const depth = Number(item.depth || 0.1);
                        const x = Number(item.x || 0);
                        const y = Number(item.y || (height/2));
                        const z = Number(item.z || 0);
                        
                        if (isNaN(width) || isNaN(height) || isNaN(depth) ||
                            isNaN(x) || isNaN(y) || isNaN(z) ||
                            width <= 0 || height <= 0 || depth <= 0) {
                            console.warn("跳過無效牆壁:", item);
                            return;
                        }
                        
                        const geometry = new THREE.BoxGeometry(width, height, depth);
                        const material = new THREE.MeshStandardMaterial({ 
                            color: item.color || 0xdddddd 
                        });
                        const wall = new THREE.Mesh(geometry, material);
                        wall.position.set(x, y, z);
                        wall.userData.type = 'wall';
                        wall.userData.index = index;
                        scene.add(wall);
                        object3D = wall;
                        
                        // 更新邊界
                        minX = Math.min(minX, x - width/2);
                        maxX = Math.max(maxX, x + width/2);
                        minY = Math.min(minY, y - height/2);
                        maxY = Math.max(maxY, y + height/2);
                        minZ = Math.min(minZ, z - depth/2);
                        maxZ = Math.max(maxZ, z + depth/2);
                        
                    } else if (item.type === 'column') {
                        // 檢查是否為方形柱子
                        const isSquare = item.shape === 'square' || 
                                        (item.width && item.depth && !item.radius);
                        
                        if (isSquare) {
                            // 方形柱子
                            const width = Number(item.width || 0.3);
                            const height = Number(item.height || 3);
                            const depth = Number(item.depth || width);
                            const x = Number(item.x || 0);
                            const y = Number(item.y || (height/2));
                            const z = Number(item.z || 0);
                            
                            if (width <= 0 || height <= 0 || depth <= 0) {
                                console.warn("跳過無效方形柱子:", item);
                                return;
                            }
                            
                            const geometry = new THREE.BoxGeometry(width, height, depth);
                            const material = new THREE.MeshStandardMaterial({ 
                                color: item.color || 0xbbbbbb 
                            });
                            const column = new THREE.Mesh(geometry, material);
                            column.position.set(x, y, z);
                            column.userData.type = 'column';
                            column.userData.shape = 'square';
                            column.userData.index = index;
                            scene.add(column);
                            object3D = column;
                            
                            // 更新邊界
                            minX = Math.min(minX, x - width/2);
                            maxX = Math.max(maxX, x + width/2);
                            minY = Math.min(minY, y - height/2);
                            maxY = Math.max(maxY, y + height/2);
                            minZ = Math.min(minZ, z - depth/2);
                            maxZ = Math.max(maxZ, z + depth/2);
                        } else {
                            // 圓形柱子 (原先的實現)
                            let radius = Number(item.radius);
                            if (isNaN(radius) && item.width) {
                                // 嘗試從 width 轉換
                                radius = Number(item.width) / 2;
                                console.log(`將 column 的 width ${item.width} 轉換為 radius ${radius}`);
                            }
                            
                            const height = Number(item.height || 0);
                            const x = Number(item.x || 0);
                            const y = Number(item.y || (height/2));
                            const z = Number(item.z || 0);
                            
                            if (isNaN(radius) || isNaN(height) || 
                                isNaN(x) || isNaN(y) || isNaN(z) ||
                                radius <= 0 || height <= 0) {
                                console.warn("跳過無效圓形柱子:", item);
                                return;
                            }
                            
                            const geometry = new THREE.CylinderGeometry(radius, radius, height, 32);
                            const material = new THREE.MeshStandardMaterial({ 
                                color: item.color || 0xbbbbbb 
                            });
                            const column = new THREE.Mesh(geometry, material);
                            column.position.set(x, y, z);
                            column.userData.type = 'column';
                            column.userData.index = index;
                            scene.add(column);
                            object3D = column;
                            
                            // 更新邊界
                            minX = Math.min(minX, x - radius);
                            maxX = Math.max(maxX, x + radius);
                            minY = Math.min(minY, y - height/2);
                            maxY = Math.max(maxY, y + height/2);
                            minZ = Math.min(minZ, z - radius);
                            maxZ = Math.max(maxZ, z + radius);
                        }
                    } else if (item.type === 'door' || item.type === 'window') {
                        // 檢查必要屬性
                        const width = Number(item.width || 0);
                        const height = Number(item.height || 0);
                        const depth = Number(item.depth || 0.05);
                        const x = Number(item.x || 0);
                        const y = Number(item.y || (height/2));
                        const z = Number(item.z || 0);
                        
                        if (isNaN(width) || isNaN(height) || isNaN(depth) ||
                            isNaN(x) || isNaN(y) || isNaN(z) ||
                            width <= 0 || height <= 0 || depth <= 0) {
                            console.warn("跳過無效門/窗:", item);
                            return;
                        }
                        
                        const geometry = new THREE.BoxGeometry(width, height, depth);
                        const material = new THREE.MeshStandardMaterial({ 
                            color: item.type === 'door' ? 0x8B4513 : 0xadd8e6,
                            transparent: item.type === 'window',
                            opacity: item.type === 'window' ? 0.6 : 1
                        });
                        const element = new THREE.Mesh(geometry, material);
                        element.position.set(x, y, z);
                        element.userData.type = item.type;
                        element.userData.index = index;
                        scene.add(element);
                        object3D = element;
                        
                        // 更新邊界
                        minX = Math.min(minX, x - width/2);
                        maxX = Math.max(maxX, x + width/2);
                        minY = Math.min(minY, y - height/2);
                        maxY = Math.max(maxY, y + height/2);
                        minZ = Math.min(minZ, z - depth/2);
                        maxZ = Math.max(maxZ, z + depth/2);
                    }
                    
                    // 將物件與資料建立映射關係
                    if (object3D) {
                        object3D.userData.originalData = item;
                        objectDataMap.set(object3D.uuid, item);
                    }
                    
                } catch (e) {
                    console.error(`渲染對象時發生錯誤:`, item, e);
                }
            });
        } else {
            console.error('數據格式不正確，預期為數組:', data);
            document.getElementById('errorMessage').textContent = '收到的數據格式不正確';
            document.getElementById('errorMessage').style.display = 'block';
            return;
        }

        // 如果場景為空，添加一個默認平面
        if (minX === Infinity) {
            minX = -5; maxX = 5;
            minY = 0; maxY = 0;
            minZ = -5; maxZ = 5;
            
            const geometry = new THREE.PlaneGeometry(10, 10);
            const material = new THREE.MeshBasicMaterial({ 
                color: 0xaaaaaa, 
                side: THREE.DoubleSide 
            });
            const plane = new THREE.Mesh(geometry, material);
            plane.rotation.x = -Math.PI / 2;
            plane.userData.type = 'floor';
            scene.add(plane);
        }

        // 計算場景的中心和尺寸
        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;
        const centerZ = (minZ + maxZ) / 2;
        
        const sizeX = maxX - minX;
        const sizeY = Math.max(1, maxY - minY); // 確保高度至少為1
        const sizeZ = maxZ - minZ;
        
        const maxSize = Math.max(sizeX, sizeY, sizeZ);
        
        // 設置相機位置
        camera.position.set(
            centerX + maxSize, 
            centerY + maxSize, 
            centerZ + maxSize
        );
        camera.lookAt(centerX, centerY, centerZ);
        
        // 添加網格輔助線
        const gridSize = Math.max(100, maxSize * 2);
        const gridHelper = new THREE.GridHelper(gridSize, gridSize);
        scene.add(gridHelper);
        
        // 添加坐標軸輔助線
        const axesHelper = new THREE.AxesHelper(maxSize);
        scene.add(axesHelper);

        // 渲染完成後，添加保存按鈕
        const saveButtonContainer = document.createElement('div');
        saveButtonContainer.style.position = 'absolute';
        saveButtonContainer.style.bottom = '10px';
        saveButtonContainer.style.right = '10px';
        
        const saveButton = document.createElement('button');
        saveButton.textContent = '保存此模型數據';
        saveButton.className = 'save-button';
        saveButton.onclick = () => saveCurrentData(data);
        
        saveButtonContainer.appendChild(saveButton);
        container.appendChild(saveButtonContainer);

        // 添加選擇物件的點擊事件
        renderer.domElement.addEventListener('click', onDocumentClick, false);
        
        // 修改這段代碼，使用我們的新函數來創建面板，而不是直接在這裡定義
        createPropertiesPanel();

        function animate() {
            requestAnimationFrame(animate);
            controls.update(); // 更新控制器
            renderer.render(scene, camera);
        }
        
        // 處理窗口大小變化
        window.addEventListener('resize', () => {
            const width = container.clientWidth;
            const height = container.clientHeight;
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        });
        
        animate();
    } catch (error) {
        console.error("創建 3D 模型時出錯:", error);
        document.getElementById('errorMessage').textContent = `3D 渲染錯誤: ${error.message}`;
        document.getElementById('errorMessage').style.display = 'block';
    }
}

// 點擊文件處理函數
function onDocumentClick(event) {
    event.preventDefault();
    
    // 計算滑鼠位置的標準化設備坐標
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    // 更新射線投射器
    raycaster.setFromCamera(mouse, camera);
    
    // 計算與物件的交點
    const intersects = raycaster.intersectObjects(scene.children);
    
    // 檢查是否按住 Shift 鍵 (用於多選)
    const isMultiSelect = event.shiftKey;
    
    if (!isMultiSelect) {
        // 如果沒有按 Shift，清除之前的選擇
        selectedObjects.forEach(obj => {
            if (obj.material) {
                // 恢復原始顏色
                if (obj.material.emissive) {
                    obj.material.emissive.setHex(0x000000);
                }
                obj.material.opacity = obj.userData.originalOpacity || 1;
            }
        });
        selectedObjects = [];
    }
    
    if (intersects.length > 0) {
        const selectedObject = intersects[0].object;
        
        // 確保選擇的物件有 userData
        if (selectedObject.userData && selectedObject.userData.type) {
            // 跳過網格和軸線
            if (selectedObject instanceof THREE.GridHelper || 
                selectedObject instanceof THREE.AxesHelper) {
                return;
            }
            
            // 檢查物件是否已被選中
            const alreadySelected = selectedObjects.includes(selectedObject);
            
            if (isMultiSelect && alreadySelected) {
                // 如果按住 Shift 且已選中，則取消選擇
                selectedObjects = selectedObjects.filter(obj => obj !== selectedObject);
                
                // 恢復原始顏色
                if (selectedObject.material) {
                    if (selectedObject.material.emissive) {
                        selectedObject.material.emissive.setHex(0x000000);
                    }
                    selectedObject.material.opacity = selectedObject.userData.originalOpacity || 1;
                }
            } else if (!alreadySelected) {
                // 選中新物件
                selectedObjects.push(selectedObject);
                
                // 保存原始透明度
                if (selectedObject.material) {
                    selectedObject.userData.originalOpacity = selectedObject.material.opacity;
                    
                    // 高亮顯示選中的物件
                    if (selectedObject.material.emissive) {
                        selectedObject.material.emissive.setHex(0x555555);
                    }
                    selectedObject.material.opacity = 0.8;
                }
            }
            
            // 更新屬性面板
            updatePropertiesPanel();
            
            // 更新 AI 指令的選擇物件
            if (typeof updateSelectedObjects === 'function') {
                updateSelectedObjects(selectedObjects);
            }
        }
    } else {
        // 如果點擊空白處，清除選擇
        if (!isMultiSelect) {
            selectedObjects.forEach(obj => {
                if (obj.material) {
                    if (obj.material.emissive) {
                        obj.material.emissive.setHex(0x000000);
                    }
                    obj.material.opacity = obj.userData.originalOpacity || 1;
                }
            });
            selectedObjects = [];
            
            // 更新屬性面板
            updatePropertiesPanel();
            
            // 更新 AI 指令的選擇物件
            if (typeof updateSelectedObjects === 'function') {
                updateSelectedObjects(selectedObjects);
            }
        }
    }
}

// 更新屬性面板
function updatePropertiesPanel() {
    const propertiesPanel = document.getElementById('propertiesPanel');
    
    if (selectedObjects.length === 0) {
        propertiesPanel.style.display = 'none';
        return;
    }
    
    propertiesPanel.style.display = 'block';
    const panelContent = propertiesPanel.querySelector('.panel-content');
    
    if (selectedObjects.length === 1) {
        // 單個物件的屬性面板
        const obj = selectedObjects[0];
        const data = obj.userData.originalData;
        
        // 根據物件類型顯示不同的屬性
        let html = `<div class="property-group">
            <div class="property-label">類型：</div>
            <div class="property-value">${getChineseTypeName(obj.userData.type)}</div>
        </div>`;
        
        // 位置資訊
        html += `<div class="property-group">
            <div class="property-label">位置：</div>
            <div class="property-value">
                X: <input type="number" class="position-input" data-axis="x" value="${obj.position.x}" step="0.1">
                Y: <input type="number" class="position-input" data-axis="y" value="${obj.position.y}" step="0.1">
                Z: <input type="number" class="position-input" data-axis="z" value="${obj.position.z}" step="0.1">
            </div>
        </div>`;
        
        // 尺寸資訊
        if (obj.userData.type === 'wall' || obj.userData.type === 'door' || obj.userData.type === 'window') {
            html += `<div class="property-group">
                <div class="property-label">尺寸：</div>
                <div class="property-value">
                    寬度: <input type="number" class="size-input" data-prop="width" value="${data.width}" min="0.1" step="0.1">
                    高度: <input type="number" class="size-input" data-prop="height" value="${data.height}" min="0.1" step="0.1">
                    深度: <input type="number" class="size-input" data-prop="depth" value="${data.depth}" min="0.02" step="0.1">
                </div>
            </div>`;
        } else if (obj.userData.type === 'column') {
            if (obj.userData.shape === 'square') {
                html += `<div class="property-group">
                    <div class="property-label">尺寸：</div>
                    <div class="property-value">
                        寬度: <input type="number" class="size-input" data-prop="width" value="${data.width}" min="0.1" step="0.1">
                        高度: <input type="number" class="size-input" data-prop="height" value="${data.height}" min="0.1" step="0.1">
                        深度: <input type="number" class="size-input" data-prop="depth" value="${data.depth}" min="0.1" step="0.1">
                    </div>
                </div>`;
            } else {
                html += `<div class="property-group">
                    <div class="property-label">尺寸：</div>
                    <div class="property-value">
                        半徑: <input type="number" class="size-input" data-prop="radius" value="${data.radius}" min="0.1" step="0.1">
                        高度: <input type="number" class="size-input" data-prop="height" value="${data.height}" min="0.1" step="0.1">
                    </div>
                </div>`;
            }
        } else if (obj.userData.type === 'floor') {
            html += `<div class="property-group">
                <div class="property-label">尺寸：</div>
                <div class="property-value">
                    寬度: <input type="number" class="size-input" data-prop="width" value="${data.width}" min="0.1" step="0.1">
                    長度: <input type="number" class="size-input" data-prop="height" value="${data.height}" min="0.1" step="0.1">
                </div>
            </div>`;
        }
        
        // 顏色選擇器（對非地板物件）
        if (obj.userData.type !== 'floor') {
            const color = obj.material.color.getHexString();
            html += `<div class="property-group">
                <div class="property-label">顏色：</div>
                <div class="property-value">
                    <input type="color" class="color-picker" value="#${color}">
                </div>
            </div>`;
        }
        
        // 添加應用按鈕
        html += `<div class="property-actions">
            <button class="apply-properties-btn">套用變更</button>
        </div>`;
        
        panelContent.innerHTML = html;
        
        // 綁定事件處理程序
        const positionInputs = panelContent.querySelectorAll('.position-input');
        positionInputs.forEach(input => {
            input.addEventListener('change', updateObjectPosition);
        });
        
        const sizeInputs = panelContent.querySelectorAll('.size-input');
        sizeInputs.forEach(input => {
            input.addEventListener('change', updateObjectSize);
        });
        
        const colorPicker = panelContent.querySelector('.color-picker');
        if (colorPicker) {
            colorPicker.addEventListener('change', updateObjectColor);
        }
        
        const applyBtn = panelContent.querySelector('.apply-properties-btn');
        applyBtn.addEventListener('click', applyProperties);
        
    } else {
        // 多個物件的屬性面板
        panelContent.innerHTML = `
            <div class="property-group">
                <div class="property-label">已選擇：</div>
                <div class="property-value">${selectedObjects.length} 個物件</div>
            </div>
            <div class="property-group">
                <div class="property-value">
                    <button class="batch-properties-btn">批次修改</button>
                </div>
            </div>`;
        
        // 綁定批次修改按鈕
        const batchBtn = panelContent.querySelector('.batch-properties-btn');
        batchBtn.addEventListener('click', showBatchEditDialog);
    }
}

// 獲取物件類型的中文名稱
function getChineseTypeName(type) {
    const typeMap = {
        'floor': '地板',
        'wall': '牆壁',
        'column': '柱子',
        'door': '門',
        'window': '窗'
    };
    return typeMap[type] || type;
}

// 更新物件位置
function updateObjectPosition(event) {
    if (selectedObjects.length !== 1) return;
    
    const axis = event.target.dataset.axis;
    const value = parseFloat(event.target.value);
    
    if (isNaN(value)) return;
    
    const obj = selectedObjects[0];
    obj.position[axis] = value;
    
    // 同時更新原始數據
    if (obj.userData.originalData) {
        obj.userData.originalData[axis] = value;
    }
}

// 更新物件尺寸 - 這個函數是缺失的
function updateObjectSize(event) {
    if (selectedObjects.length !== 1) return;
    
    const prop = event.target.dataset.prop;
    const value = parseFloat(event.target.value);
    
    if (isNaN(value) || value <= 0) return;
    
    const obj = selectedObjects[0];
    const data = obj.userData.originalData;
    
    if (!data) return;
    
    // 更新原始數據
    data[prop] = value;
    
    // 根據物件類型更新幾何體
    if (obj.userData.type === 'wall' || obj.userData.type === 'door' || obj.userData.type === 'window') {
        // 更新牆壁/門/窗的幾何體
        const width = data.width || 1;
        const height = data.height || 2;
        const depth = data.depth || 0.1;
        
        // 建立新的幾何體
        const newGeometry = new THREE.BoxGeometry(width, height, depth);
        obj.geometry.dispose(); // 釋放舊的幾何體
        obj.geometry = newGeometry;
        
        // 更新 Y 位置，使底部對齊地面
        obj.position.y = height / 2;
        
    } else if (obj.userData.type === 'column') {
        if (obj.userData.shape === 'square') {
            // 更新方形柱子
            const width = data.width || 0.3;
            const height = data.height || 3;
            const depth = data.depth || width;
            
            const newGeometry = new THREE.BoxGeometry(width, height, depth);
            obj.geometry.dispose();
            obj.geometry = newGeometry;
            
            // 更新位置
            obj.position.y = height / 2;
            
        } else if (prop === 'radius' || prop === 'height') {
            // 更新圓形柱子
            const radius = data.radius;
            const height = data.height;
            
            const newGeometry = new THREE.CylinderGeometry(radius, radius, height, 32);
            obj.geometry.dispose();
            obj.geometry = newGeometry;
            
            // 更新位置
            obj.position.y = height / 2;
        }
    } else if (obj.userData.type === 'floor') {
        // 更新地板
        const width = data.width;
        const height = data.height;
        
        const newGeometry = new THREE.PlaneGeometry(width, height);
        obj.geometry.dispose();
        obj.geometry = newGeometry;
    }
    
    // 刷新屬性面板
    updatePropertiesPanel();
}

// 更新物件顏色 - 這個函數也是缺失的
function updateObjectColor(event) {
    if (selectedObjects.length !== 1) return;
    
    const colorHex = event.target.value;
    const obj = selectedObjects[0];
    
    if (!obj.material) return;
    
    // 更新材質顏色
    obj.material.color.set(colorHex);
    
    // 更新原始資料
    if (obj.userData.originalData) {
        obj.userData.originalData.color = parseInt(colorHex.replace('#', '0x'));
    }
}

// 應用屬性變更 - 這個函數也是缺失的
function applyProperties() {
    if (selectedObjects.length !== 1) return;
    
    const obj = selectedObjects[0];
    const data = obj.userData.originalData;
    
    // 更新當前模型數據中對應的物件
    if (data && typeof updateCurrentModelData === 'function') {
        // 獲取當前模型數據
        const currentData = window.currentModelData || [];
        
        // 找到對應索引的物件並更新
        const index = obj.userData.index;
        if (index !== undefined && index >= 0 && index < currentData.length) {
            currentData[index] = { ...data };
            
            // 更新模型數據
            updateCurrentModelData(currentData);
            
            console.log(`已更新索引 ${index} 的物件數據`);
        }
    }
    
    // 關閉屬性面板
    const propertiesPanel = document.getElementById('propertiesPanel');
    propertiesPanel.style.display = 'none';
    
    // 清除選擇
    selectedObjects.forEach(obj => {
        if (obj.material) {
            if (obj.material.emissive) {
                obj.material.emissive.setHex(0x000000);
            }
            obj.material.opacity = obj.userData.originalOpacity || 1;
        }
    });
    selectedObjects = [];
    
    alert('已套用變更');
}

// 顯示批次修改對話框
function showBatchEditDialog() {
    alert('批次修改功能尚未實現');
    // 未來可以實現多物件的批次修改
}

// 更新 AI 指令的選擇物件
function updateSelectedObjects(objects) {
    // 將選擇的物件傳給 AI 指令處理模組
    if (typeof window.setSelectedForAI === 'function') {
        const selectedData = objects.map(obj => {
            return {
                type: obj.userData.type,
                index: obj.userData.index,
                data: obj.userData.originalData || {}
            };
        });
        
        window.setSelectedForAI(selectedData);
    }
}

// 顯示分析狀態
function showAnalysisStatus() {
    const statusElement = document.getElementById('analysisStatus');
    const progressElement = document.getElementById('analysisProgress');
    
    analysisStartTime = Date.now();
    statusElement.style.display = 'block';
    
    // 更新進度指示器
    let elapsedSeconds = 0;
    progressInterval = setInterval(() => {
        elapsedSeconds = Math.floor((Date.now() - analysisStartTime) / 1000);
        progressElement.textContent = `已耗時 ${elapsedSeconds} 秒`;
    }, 1000);
}

// 隱藏分析狀態
function hideAnalysisStatus() {
    const statusElement = document.getElementById('analysisStatus');
    statusElement.style.display = 'none';
    
    // 停止進度更新
    if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
    }
}

// 保存當前數據為 JS 文件
async function saveCurrentData(data) {
    try {
        console.log("正在將當前數據保存為文件...");
        const response = await fetch('http://localhost:3000/save-result', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`服務器錯誤: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        console.log(`數據已成功保存為: ${result.filename}`);
        alert(`模型數據已成功保存為: ${result.filename}\n您可以在將來直接使用此文件進行渲染`);
        
        // 保存成功後刷新歷史記錄列表，但不隱藏分析狀態
        // 因為這個函數可能在分析完成後單獨調用
        await refreshHistoryList();
        
        return result.filename;
    } catch (error) {
        console.error("保存數據時出錯:", error);
        alert(`保存數據失敗: ${error.message}`);
        return null;
    }
}

// 檢查是否可以加載歷史記錄
function checkServerAvailability() {
    fetch('http://localhost:3000/history')
        .then(response => {
            if (response.ok) {
                console.log('伺服器連接正常，可以獲取歷史記錄');
                
                // 連接成功後主動加載歷史記錄
                return refreshHistoryList();
            } else {
                console.warn('無法連接到歷史記錄服務(狀態碼錯誤)');
                return Promise.reject(new Error('服務器返回了錯誤狀態碼: ' + response.status));
            }
        })
        .catch(error => {
            console.error('歷史記錄服務器不可用:', error);
            // 顯示更友好的錯誤消息
            const errorMsg = document.getElementById('errorMessage');
            errorMsg.textContent = `無法連接到服務器(端口 3000)。請確保已運行 server.js 或 start_servers.js`;
            errorMsg.style.display = 'block';
            
            // 禁用需要服務器的功能
            document.getElementById('useSelectedButton').disabled = true;
            
            // 10 秒後自動重試
            setTimeout(() => {
                console.log("正在重試連接到服務器...");
                checkServerAvailability();
            }, 10000);
        });
}

// 頁面加載時檢查服務器是否可用
window.addEventListener('DOMContentLoaded', checkServerAvailability);

// 設定屬性面板
document.addEventListener('DOMContentLoaded', () => {
    // 創建屬性面板
    createPropertiesPanel();
});

// 創建屬性面板並添加最小化功能
function createPropertiesPanel() {
    // 檢查是否已存在
    let propertiesPanel = document.getElementById('propertiesPanel');
    if (propertiesPanel) {
        // 更新現有面板
        const header = propertiesPanel.querySelector('.panel-header');
        if (!header.querySelector('.panel-minimize-btn')) {
            const minimizeBtn = document.createElement('button');
            minimizeBtn.className = 'panel-minimize-btn';
            minimizeBtn.innerHTML = '−';
            minimizeBtn.title = '最小化';
            minimizeBtn.onclick = togglePropertiesPanelSize;
            header.appendChild(minimizeBtn);
        }
    } else {
        // 創建新面板
        propertiesPanel = document.createElement('div');
        propertiesPanel.id = 'propertiesPanel';
        propertiesPanel.className = 'properties-panel';
        
        const headerDiv = document.createElement('div');
        headerDiv.className = 'panel-header';
        
        const headerTitle = document.createElement('span');
        headerTitle.textContent = '物件屬性';
        
        const minimizeBtn = document.createElement('button');
        minimizeBtn.className = 'panel-minimize-btn';
        minimizeBtn.innerHTML = '−';
        minimizeBtn.title = '最小化';
        minimizeBtn.onclick = togglePropertiesPanelSize;
        
        headerDiv.appendChild(headerTitle);
        headerDiv.appendChild(minimizeBtn);
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'panel-content';
        contentDiv.textContent = '未選擇物件';
        
        propertiesPanel.appendChild(headerDiv);
        propertiesPanel.appendChild(contentDiv);
        
        // 添加到容器
        document.getElementById('threejsContainer').appendChild(propertiesPanel);
        
        // 默認隱藏
        propertiesPanel.style.display = 'none';
    }
}

// 切換屬性面板的大小（最小化/最大化）
function togglePropertiesPanelSize() {
    const panel = document.getElementById('propertiesPanel');
    const btn = panel.querySelector('.panel-minimize-btn');
    
    if (panel.classList.contains('minimized')) {
        // 展開面板
        panel.classList.remove('minimized');
        btn.innerHTML = '−';
        btn.title = '最小化';
    } else {
        // 最小化面板
        panel.classList.add('minimized');
        btn.innerHTML = '+';
        btn.title = '展開';
    }
}
