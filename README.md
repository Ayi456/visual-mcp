# MCPDemo - AI驱动的数据可视化与SQL Chat平台

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8+-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-ISC-yellow.svg)](LICENSE)

本项目是一个基于**模型上下文协议（Model Context Protocol, MCP）**的综合性数据服务平台，集成了数据可视化、SQL智能查询和链接管理功能。通过 AI 驱动的自然语言处理，让数据查询和可视化变得更加简单高效。

### 1. 我能用它做什么？

- 用中文/英文和「SQL Chat」对话，让 AI 帮你写 SQL 并执行。
- 把查询结果一键变成图表（折线、柱状、饼图、热力图等），生成可分享的链接。
- 在 Dashboard 里拖拽这些图表，做一个自己的多图表大屏。
- 在支持 MCP 的客户端里，把它当成一个「图表 / SQL 助手」工具源来调用。

### 2. 如果我只想在线用（不想自己部署）

- 打开网站首页：`http://mcp.zha-ji.cn`
- 想玩 SQL Chat：直接进 `http://mcp.zha-ji.cn/sql`
- MCP 端点地址（给 Cherry Studio 等用）：`http://mcp.zha-ji.cn/mcp`

### 3. 如果我想在本地跑一套

1. 安装：Node.js 18+，（可选）MySQL + Redis。
2. 终端执行：

```bash
npm install
npm --prefix web install
cp .env.example .env  # 按需修改数据库/AI 配置
npm run dev           # 启动后端，默认 3000 端口
npm --prefix web run dev  # 启动前端，默认 5173 端口
```

3. 浏览器打开 `http://localhost:5173` 即可。

### 4. SQL Chat + 图表最常见的使用流程

1. 在 SQL Chat 配好数据库连接，写一句自然语言（例如：“按日期统计最近 7 天的订单数”）。
2. 让 AI 帮你生成并执行 SQL，确认结果表格正确。
3. 点击结果上方的「可视化」按钮：
   - 选图表类型（不知道选啥就选「自动」）。
   - 选 X 轴字段（一般是时间或分类）、Y 轴字段（一般是数值）。
4. 点「生成图表」，系统会给你一个图表链接，可以直接分享或添加到 Dashboard。

### 5. MCP 客户端 / AI CLI 里怎么接入（超简版）

#### 5.1 通用配置思路

不管你用的是 Cherry Studio、还是其他支持 MCP / HTTP 的 AI CLI，本质都是：

- MCP 端点：`http://mcp.zha-ji.cn/mcp` 或你自己的 `http://localhost:3000/mcp`。
- 必要请求头：
  - `Content-Type: application/json`
  - `Accept: application/json, text/event-stream`
  - `AccessID` / `AccessKey`
    - 可以在网页版里注册账号拿到，或者本地调 `/api/auth/register` 拿到一对凭证。
- 在你的客户端里，把上面的 URL + 请求头配置进去，就能在对话中看到并调用：
  - `create_visualization_chart`（生成图表）
  
#### 5.2 如果你用的是命令行 / curl

有些 AI CLI（或者你自己写的脚本）其实就是帮你发 HTTP 请求，这时可以先自己用 `curl` 测一遍：

```bash path=null start=null
# 假设已经有 ACCESS_ID 和 ACCESS_KEY 两个环境变量

curl -N \
  -X POST "http://localhost:3000/mcp" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "AccessID: $ACCESS_ID" \
  -H "AccessKey: $ACCESS_KEY" \
  --data '{
    "jsonrpc": "2.0",
    "id": "1",
    "method": "tools/call",
    "params": {
      "name": "create_visualization_chart",
      "arguments": {
        "data": [["学生1", 85], ["学生2", 92]],
        "schema": [
          { "name": "学生", "type": "string" },
          { "name": "分数", "type": "number" }
        ],
        "chartType": "auto",
        "title": "学生成绩分布"
      }
    }
  }'
```

> 上面这个请求体是一个**示例**的 MCP `tools/call` 结构：真正使用时，建议让你的 AI CLI 按 MCP 协议自动构造外层字段，你只需要准备 `arguments` 里的内容即可（也就是 data、schema、chartType 等）。

#### 5.3 Windows PowerShell 小贴士

在 PowerShell 里，建议先把敏感信息放进环境变量，然后再用它们：

```powershell path=null start=null
$env:ACCESS_ID = "你的AccessID"
$env:ACCESS_KEY = "你的AccessKey"

curl -N `
  -X POST "http://localhost:3000/mcp" `
  -H "Content-Type: application/json" `
  -H "Accept: application/json, text/event-stream" `
  -H "AccessID: $env:ACCESS_ID" `
  -H "AccessKey: $env:ACCESS_KEY" `
  --data '{
    "jsonrpc": "2.0",
    "id": "1",
    "method": "tools/call",
    "params": {
      "name": "create_visualization_chart",
      "arguments": {
        "data": [["学生1", 85], ["学生2", 92]],
        "schema": [
          { "name": "学生", "type": "string" },
          { "name": "分数", "type": "number" }
        ],
        "chartType": "auto",
        "title": "学生成绩分布"
      }
    }
  }'
```

这样，无论你用哪种 AI CLI，只要它支持：
- 指定 MCP 源的 URL；
- 自定义请求头；
-（可选）给 `tools/call` 传 `arguments`；
就能把本项目作为一个「远程图表 / SQL 工具源」接进去了。
