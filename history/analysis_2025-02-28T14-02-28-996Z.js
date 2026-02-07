// 分析結果 - æªå 2025-02-28 ä¸å5.01.38.png
// 生成於 2025/2/28 下午10:02:28

const analysisData = [
  {
    "type": "floor",
    "width": 3,
    "height": 2
  },
  {
    "type": "wall",
    "x": -1.5,
    "y": 0,
    "z": 1,
    "width": 0.1,
    "height": 2.4,
    "depth": 2
  },
  {
    "type": "wall",
    "x": 1.5,
    "y": 0,
    "z": 1,
    "width": 0.1,
    "height": 2.4,
    "depth": 2
  },
  {
    "type": "wall",
    "x": 0,
    "y": 0,
    "z": 2,
    "width": 3,
    "height": 2.4,
    "depth": 0.1
  },
  {
    "type": "wall",
    "x": 0,
    "y": 0,
    "z": 0,
    "width": 3,
    "height": 2.4,
    "depth": 0.1
  },
  {
    "type": "column",
    "shape": "square",
    "x": -1.2,
    "y": 0,
    "z": 0.3,
    "width": 0.6,
    "depth": 0.6,
    "height": 2.4
  }
];

// 分析信息
const analysisInfo = {
  timestamp: 1740732908976,
  date: "2025/2/28 下午4:02:28",
  filename: "402",
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
