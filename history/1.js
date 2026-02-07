// 分析結果 - 截圖 2025-02-28 下午5.01.38.png
// 生成於 2025/2/28 下午5:10:00

const analysisData = [
  {
    "type": "floor",
    "width": 3,
    "height": 2
  },
  {
    "type": "column",
    "shape": "square",  // 添加 shape 屬性表明這是方形柱子
    "x": 0,
    "y": 1.2,          // 修正 Y 值為高度的一半
    "z": 0,
    "width": 0.6,
    "depth": 0.6,      // 確保 depth 存在
    "height": 2.4
  },
  {
    "type": "wall",
    "x": 0,
    "y": 1,            // 修正 Y 值
    "z": 0,
    "width": 1.5,      // 修正寬度為有效值
    "height": 2,       // 修正高度為有效值
    "depth": 0.1
  },
  {
    "type": "door",
    "x": 1.5,          // 修正位置
    "y": 1.05,         // 修正 Y 值為高度的一半
    "z": 0,
    "width": 0.9,      // 修正寬度為有效值
    "height": 2.1,     // 修正高度為有效值
    "depth": 0.05
  },
  {
    "type": "window",
    "x": -1,           // 修正位置
    "y": 1.5,          // 修正 Y 值為高度的一半
    "z": 0.5,          // 修正位置
    "width": 1.2,      // 修正寬度為有效值
    "height": 1,       // 修正高度為有效值
    "depth": 0.05
  }
];

// 分析信息
const analysisInfo = {
  timestamp: 1740732600000,
  date: "2025/2/28 下午5:10:00",
  filename: "截圖 2025-02-28 下午5.01.38.png",
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
