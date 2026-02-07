// 修正後的分析結果 - 截圖 2025-03-07 下午5.21.00.png
// 生成於 2025/3/7 下午5:50:00

const analysisData = [
  // 地板 (floor)
  {
    "type": "floor",
    "x": 0,
    "y": 0,
    "z": 0,
    "width": 6.1,
    "height": 8.6
  },

  // 主牆 (北側)
  {
    "type": "wall",
    "x": 0,
    "y": 1.25,
    "z": 4.3,
    "width": 6.1,
    "height": 2.5,
    "depth": 0.2
  },

  // 主牆 (南側)
  {
    "type": "wall",
    "x": 0,
    "y": 1.25,
    "z": -4.3,
    "width": 6.1,
    "height": 2.5,
    "depth": 0.2
  },

  // 凸出牆體（東南側小凸出）
  {
    "type": "wall",
    "x": 2.4,      // 調整位置更靠邊
    "y": 1.25,
    "z": -3.65,    // 靠近南側
    "width": 1.3,
    "height": 2.5,
    "depth": 2.57
  },

  // 柱子（精確位置）
  {
    "type": "column",
    "shape": "square",
    "x": -2.75,
    "y": 0,
    "z": 4,
    "width": 0.5,
    "depth": 0.5,
    "height": 2.5
  },
  {
    "type": "column",
    "shape": "square",
    "x": 2.75,
    "y": 0,
    "z": 4,
    "width": 0.5,
    "depth": 0.5,
    "height": 2.5
  },
  {
    "type": "column",
    "shape": "square",
    "x": -2.75,
    "y": 0,
    "z": -4,
    "width": 0.5,
    "depth": 0.5,
    "height": 2.5
  },
  {
    "type": "column",
    "shape": "square",
    "x": 2.75,
    "y": 0,
    "z": -4,
    "width": 0.5,
    "depth": 0.5,
    "height": 2.5
  },
  {
    "type": "column",
    "shape": "square",
    "x": 0,
    "y": 0,
    "z": 4,
    "width": 0.5,
    "depth": 0.5,
    "height": 2.5
  },
  {
    "type": "column",
    "shape": "square",
    "x": 0,
    "y": 0,
    "z": -4,
    "width": 0.5,
    "depth": 0.5,
    "height": 2.5
  },

  // 主入口門 (DW, 北側)
  {
    "type": "door",
    "x": 0,
    "y": 1,
    "z": 4.2,
    "width": 1.0,
    "height": 2.0,
    "depth": 0.1
  },

  // 東南側窗戶(W3)
  {
    "type": "window",
    "x": 3.05,
    "y": 1.5,
    "z": -2.5,
    "width": 1.0,
    "height": 1.0,
    "depth": 0.05
  }
];

// 分析信息
const analysisInfo = {
  timestamp: 1741341000000,
  date: "2025/3/7 下午5:50:00",
  filename: "gpt4.5調整",
  modelCount: analysisData.length
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