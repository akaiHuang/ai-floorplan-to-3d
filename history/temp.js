// 分析結果 - 截圖 2025-02-28 下午5.01.38.png
// 生成於 2025/2/28 下午5:10:00

const analysisData = [
  {
    "type": "floor",
    "width": 10,
    "height": 8
  },
  {
    "type": "wall",
    "x": -2,
    "y": 1.25,
    "z": 3,
    "width": 6,
    "height": 2.5,
    "depth": 0.2
  },
  {
    "type": "column", // 這是正確的圓形柱子定義
    "x": 3,
    "y": 1.5,
    "z": -2,
    "radius": 0.3,
    "height": 3
  },
  {
    "type": "column", // 這是正確的方形柱子定義
    "shape": "square",
    "x": -3,
    "y": 1.5,
    "z": -2,
    "width": 0.5,
    "depth": 0.5,
    "height": 3
  },
  {
    "type": "door",
    "x": 0,
    "y": 1,
    "z": -4,
    "width": 1.0,
    "height": 2.0,
    "depth": 0.1
  },
  {
    "type": "window",
    "x": 2,
    "y": 1.5,
    "z": 4,
    "width": 1.5,
    "height": 1.0,
    "depth": 0.05
  }
];

// 分析信息
const analysisInfo = {
  timestamp: 1740732600000,
  date: "2025/2/28 下午5:10:00",
  filename: "Temp",
  modelCount: 6
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
