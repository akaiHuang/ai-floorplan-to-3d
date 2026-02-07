# 系統啟動指南

本文檔提供了正確啟動所有需要的服務的步驟。

## 啟動方式一：使用統一啟動腳本（推薦）

最簡單的方式是使用統一啟動腳本：

```bash
node start_servers.js
```

這會自動啟動以下服務：
1. 主服務器 (端口 3000)
2. GPT-4o 處理服務 (端口 3001)

## 啟動方式二：分開啟動各個服務

如果您希望分開啟動各個服務，需要打開兩個終端窗口：

### 終端窗口 1：啟動主服務器
```bash
node server.js
```

### 終端窗口 2：啟動 GPT-4o 處理服務
```bash
node server_gpt4o.js
```

## 確認服務已正確啟動

服務啟動後，您應該能看到以下端口：
- 主服務器：`http://localhost:3000`
- GPT-4o 處理服務：`http://localhost:3001`

您可以通過以下命令檢查是否有進程正在使用這些端口：

### macOS/Linux
```bash
lsof -i :3000
lsof -i :3001
```

### Windows
```cmd
netstat -ano | findstr 3000
netstat -ano | findstr 3001
```

## 如果端口被佔用

如果出現 "EADDRINUSE" 錯誤，這表示端口已被佔用。您可以：

1. 終止佔用端口的進程
2. 修改 `server.js` 和 `server_gpt4o.js` 中的端口號
3. 運行以下命令找到並終止佔用端口的進程：

### macOS/Linux
```bash
kill -9 $(lsof -ti:3000)
kill -9 $(lsof -ti:3001)
```

### Windows
```cmd
FOR /F "tokens=5" %P IN ('netstat -ano | findstr 3000') DO taskkill /F /PID %P
FOR /F "tokens=5" %P IN ('netstat -ano | findstr 3001') DO taskkill /F /PID %P
```

## 常見問題解決

### 1. "歷史記錄服務器不可用"
確保主服務器 (server.js) 已啟動並運行在端口 3000。

### 2. "GPT-4o 處理失敗，嘗試回退到本地處理"
確保 GPT-4o 處理服務 (server_gpt4o.js) 已啟動並運行在端口 3001。

### 3. "EADDRINUSE: address already in use"
端口已被其他程序佔用，請參考上方"如果端口被佔用"部分解決。
