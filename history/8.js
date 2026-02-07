// 分析結果 - 座標修正版
// 生成於 2025/3/7 下午7:00:00

const analysisData = [
  // 地板（正確6點座標）
  {
    "type": "floor",
    "points": [
      {"x": -3.05, "z": 4.3},   // 左上角
      {"x": 3.05, "z": 4.3},    // 右上角
      {"x": 3.05, "z": -4.3},   // 右下凹點
      {"x": 4.35, "z": -4.3},   // 右側凸出上點
      {"x": 4.35, "z": -6.87},  // 右側凸出下點
      {"x": -3.05, "z": -6.87}  // 左下角
    ],
    "y": 0
  },

  // 北牆 (含門DW)
  {
    "type": "wall",
    "x": 0,
    "y": 1.8,
    "z": 4.3,
    "width": 6.1,
    "height": 3.6,
    "depth": 0.2
  },

  // 南側牆面
  {
    "type": "wall",
    "x": 0,
    "y": 1.8,
    "z": -6.87,
    "width": 7.4,
    "height": 3.6,
    "depth": 0.2
  },

  // 東側凸出牆面
  {
    "type": "wall",
    "x": 4.35,
    "y": 1.8,
    "z": -5.585,
    "width": 2.57,
    "height": 3.6,
    "depth": 0.2
  },

  // 西側牆面（左側）
  {
    "type": "wall",
    "x": -3.05,
    "y": 1.8,
    "z": -1.285,
    "width": 11.17,  // 從4.3延伸至-6.87
    "height": 3.6,
    "depth": 0.2
  },

  // 柱子 (6根，明確定位)
  {"type":"column","shape":"square","x":-2.75,"y":0,"z":4,"width":0.5,"depth":0.5,"height":3.6}, // 左上
  {"type":"column","shape":"square","x":2.75,"y":0,"z":4,"width":0.5,"depth":0.5,"height":3.6}, // 右上
  {"type":"column","shape":"square","x":-2.75,"y":0,"z":-4,"width":0.5,"depth":0.5,"height":3.6}, // 左下
  {"type":"column","shape":"square","x":2.75,"y":0,"z":-4,"width":0.5,"depth":0.5,"height":3.6}, // 右下
  {"type":"column","shape":"square","x":0,"y":0,"z":4,"width":0.5,"depth":0.5,"height":3.6}, // 中上
  {"type":"column","shape":"square","x":0,"y":0,"z":-4,"width":0.5,"depth":0.5,"height":3.6}, // 中下

  // 主入口門 (北側中央)
  {
    "type": "door",
    "x": 0,
    "y": 1,
    "z": 4.2,
    "width": 1.0,
    "height": 2.0,
    "depth": 0.1
  },

  // W3窗戶位置（東側牆面靠南側）
  {
    "type": "window",
    "x": 3.05,   // 東側牆
    "y": 1.5,    // 窗戶中心位置（窗高下緣1m，上緣2m）
    "z": -2.5,   // 靠南側位置
    "width": 1.0,
    "height": 1.0,
    "depth": 0.05
  }
];

// 分析信息
const analysisInfo = {
  timestamp: 1741345200000,
  date: "2025/3/7 下午7:00:00",
  filename: "4.5.png",
  modelCount: analysisData.length
};

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