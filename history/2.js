// 分析結果 - 截圖 2025-02-28 下午5.36.09.png
// 生成於 2025/2/28 下午5:45:00

const analysisData = [
  {
    "type": "floor",
    "x": 0,
    "y": 0,
    "z": 0,
    "width": 3,
    "height": 2
  },
  {
    "type": "column",
    "shape": "square",
    "x": 1.5-0.3,
    "y": 0,  // y 為高度的一半
    "z": 1-0.3,
    "width": 0.6,
    "depth": 0.6,
    "height": 2.4
  },
  {
    "type": "wall",
    "x": 0,
    "y": 0,
    "z": 0,
    "width": 0,
    "height": 0,
    "depth": 0.1
  },
  {
    "type": "door",
    "x": 0,
    "y": 0,
    "z": 0,
    "width": 0,
    "height": 0,
    "depth": 0.1
  },
  {
    "type": "window",
    "x": 0,
    "y": 0,
    "z": 0,
    "width": 0,
    "height": 0,
    "depth": 0.05
  }
];

// 分析信息
const analysisInfo = {
  timestamp: 1740734700000,
  date: "2025/2/28 下午5:45:00",
  filename: "截圖 2025-02-28 下午5.36.09.png",
  modelCount: 5
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
