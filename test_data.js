// 這是一個測試用的 JSON 數據，用於在無法連接服務器時測試 3D 渲染功能

const testData = [
    {
        "type": "floor",
        "width": 10,
        "height": 8
    },
    {
        "type": "wall",
        "x": 0,
        "y": 0,
        "z": -4,
        "width": 10,
        "height": 2.5,
        "depth": 0.2
    },
    {
        "type": "wall",
        "x": 0,
        "y": 0,
        "z": 4,
        "width": 10,
        "height": 2.5,
        "depth": 0.2
    },
    {
        "type": "wall",
        "x": -5,
        "y": 0,
        "z": 0,
        "width": 8,
        "height": 2.5,
        "depth": 0.2
    },
    {
        "type": "wall",
        "x": 5,
        "y": 0,
        "z": 0,
        "width": 8,
        "height": 2.5,
        "depth": 0.2
    },
    {
        "type": "door",
        "x": 0,
        "y": 0,
        "z": -4,
        "width": 1.0,
        "height": 2.0,
        "depth": 0.1
    },
    {
        "type": "window",
        "x": 0,
        "y": 1.5,
        "z": 4,
        "width": 1.5,
        "height": 1.0,
        "depth": 0.1
    },
    {
        "type": "column",
        "x": -4,
        "y": 0,
        "z": -3,
        "radius": 0.2,
        "height": 2.5
    },
    {
        "type": "column",
        "x": 4,
        "y": 0,
        "z": 3,
        "radius": 0.2,
        "height": 2.5
    }
];

// 添加一個測試函數，可以從 HTML 頁面上直接調用
function testRender() {
    console.log("正在使用測試數據進行渲染");
    create3DModel(testData);
    return false; // 防止表單提交
}
