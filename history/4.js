// 分析結果 - 截圖 2025-02-28 下午5.55.00.png
// 生成於 2025/2/28 下午6:15:00

const analysisData = [
  // 地板 (floor)
  {
    "type": "floor",
    "x": 0,
    "y": 0,
    "z": 0,
    "width": 6.1,    // 例如: 圖中寬度約 6.1m
    "height": 8.6    // 例如: 圖中長度約 8.6m (此處 height 代表在 2D 平面上的另一邊長度)
  },
  // 牆 (walls)
  {
    "type": "wall",
    "x": 0,
    "y": 2.5,
    "z": 0,
    "width": 6.1,    // 與 floor 寬度一致
    "height": 2.5,   // 牆高 2.5m
    "depth": 0.2     // 牆厚度 0.2m
  },
  {
    "type": "wall",
    "x": 0,
    "y": 5,
    "z": 0,
    "width": 6.1,
    "height": 2.5,
    "depth": 0.2
  },
  // 柱 (columns) - 共 6 根
  {
    "type": "column",
    "shape": "square",
    "x": -3.05 + 0.3,
    "y": 0,
    "z": 4.3 - 0.3,
    "width": 0.6,
    "depth": 0.6,
    "height": 2.5
  },
  {
    "type": "column",
    "shape": "square",
    "x": 3.05 - 0.3,
    "y": 0,
    "z": -4.3 + 0.3,
    "width": 0.6,
    "depth": 0.6,
    "height": 2.5
  },
  {
    "type": "column",
    "shape": "square",
    "x": -3.05 + 0.3,
    "y": 0,
    "z": -4.3 + 0.3,
    "width": 0.6,
    "depth": 0.6,
    "height": 2.5
  },
  {
    "type": "column",
    "shape": "square",
    "x": 3.05 - 0.3,
    "y": 0,
    "z": 4.3 - 0.3,
    "width": 0.6,
    "depth": 0.6,
    "height": 2.5
  },
  {
    "type": "column",
    "shape": "square",
    "x": 0,
    "y": 0,
    "z": 4.3 - 0.3,
    "width": 0.6,
    "depth": 0.6,
    "height": 2.5
  },
  {
    "type": "column",
    "shape": "square",
    "x": 0,
    "y": 0,
    "z": -4.3 + 0.3,
    "width": 0.6,
    "depth": 0.6,
    "height": 2.5
  },
  // 門 (door)
  {
    "type": "door",
    "x": 0,
    "y": 1,
    "z": -4,
    "width": 1.0,
    "height": 2.0,
    "depth": 0.1
  },
  // 窗 (window)
  {
    "type": "window",
    "x": 2,
    "y": 2,
    "z": 4,
    "width": 1.5,
    "height": 1.0,
    "depth": 0.05
  }
];

// 分析信息 (metadata)
const analysisInfo = {
  timestamp: 1740736500000,              // 對應 2025/2/28 下午6:15:00 的毫秒值
  date: "2025/2/28 下午6:15:00",
  filename: "截圖 2025-02-28 下午5.55.00.png",
  modelCount: analysisData.length         // 此處為 10 個模型構件
};

// 渲染此數據
function renderAnalysis() {
  if (typeof create3DModel === "function") {
    console.log("渲染分析結果:", analysisInfo.date);
    create3DModel(analysisData);
    return true;
  } else {
    console.error("找不到 create3DModel 函數");
    return false;
  }
}