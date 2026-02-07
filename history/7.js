// 分析結果 - 完整校正版
// 生成於 2025/3/7 下午6:30:00

const analysisData = [
  // 地板（有凸出形狀）
  {
    "type": "floor",
    "points": [
      {"x": -3.05, "z": 4.3},
      {"x": 3.05, "z": 4.3},
      {"x": 3.05, "z": -4.3},
      {"x": 4.35, "z": -4.3},
      {"x": 4.35, "z": -6.87},
      {"x": -3.05, "z": -6.87}
    ],
    "y": 0
  },

  // 外牆
  {"type": "wall", "x": 0, "y": 1.8, "z": 4.3, "width": 6.1, "height": 3.6, "depth": 0.2}, //北牆
  {"type": "wall", "x": 0, "y": 1.8, "z": -6.87, "width": 7.4, "height": 3.6, "depth": 0.2}, //南牆(含凸出)
  {"type": "wall", "x": -3.05, "y": 1.8, "z": -1.285, "width": 11.17, "height": 3.6, "depth": 0.2}, //西牆
  {"type": "wall", "x": 4.35, "y": 1.8, "z": -5.585, "width": 2.57, "height": 3.6, "depth": 0.2}, //東凸出牆
  {"type": "wall", "x": 3.05, "y": 1.8, "z": 0, "width": 8.6, "height": 3.6, "depth": 0.2}, //東牆
  
  // 柱子（6根）
  {"type": "column","shape":"square","x":-2.75,"y":0,"z":4,"width":0.5,"depth":0.5,"height":3.6},
  {"type": "column","shape":"square","x":0,"y":0,"z":4,"width":0.5,"depth":0.5,"height":3.6},
  {"type": "column","shape":"square","x":2.75,"y":0,"z":4,"width":0.5,"depth":0.5,"height":3.6},
  {"type": "column","shape":"square","x":-2.75,"y":0,"z":-4,"width":0.5,"depth":0.5,"height":3.6},
  {"type": "column","shape":"square","x":0,"y":0,"z":-4,"width":0.5,"depth":0.5,"height":3.6},
  {"type": "column","shape":"square","x":2.75,"y":0,"z":-4,"width":0.5,"depth":0.5,"height":3.6},

  // 門（主入口）
  {"type":"door","x":0,"y":1,"z":4.2,"width":1.0,"height":2.0,"depth":0.1},

  // 窗戶
  {"type":"window","x":-3.05,"y":1.5,"z":1,"width":1.2,"height":1.0,"depth":0.05}, //W1西側假設位置
  {"type":"window","x":-3.05,"y":1.5,"z":-1,"width":1.2,"height":1.0,"depth":0.05}, //W2西側假設位置
  {"type":"window","x":3.05,"y":1.5,"z":-2.5,"width":1.0,"height":1.0,"depth":0.05} //W3東側
];

// 分析信息
const analysisInfo = {
  timestamp: 1741343400000,
  date: "2025/3/7 下午6:30:00",
  filename: "最終完整校正版",
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