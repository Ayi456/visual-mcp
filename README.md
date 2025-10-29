# MCPDemo - AI驱动的数据可视化与SQL Chat平台

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8+-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-ISC-yellow.svg)](LICENSE)

本项目是一个基于**模型上下文协议（Model Context Protocol, MCP）**的综合性数据服务平台，集成了数据可视化、SQL智能查询和链接管理功能。通过 AI 驱动的自然语言处理，让数据查询和可视化变得更加简单高效。

---
## 📚 目录

- [🚀 核心功能](#-核心功能)
- [📍 在线访问](#-在线访问)
- [1. 快速开始 (Quick Start)](#1-快速开始-quick-start)
- [2. SQL Chat 使用指南](#2-sql-chat-使用指南-)
- [3. MCP 数据可视化功能](#3-mcp-数据可视化功能)
- [4. 如何调用 MCP (HTTP /mcp)](#4-如何调用-mcp-http-mcp)
- [5. 数据输入与写入说明](#5-数据输入与写入说明-重点)
- [6. Cherry Studio 配置](#6-cherry-studio-配置-可选)
- [7. 常见问题 (FAQ)](#7-常见问题-faq)
- [8. 贡献指南](#9-贡献指南)
- [9. 联系与支持](#10-联系与支持)
- [10. 许可证](#11-许可证)
- [11. 致谢](#12-致谢)

---

## 🚀 核心功能

### 1. MCP 服务能力
- 📊 **数据可视化工具**（MCP Tool: `create_visualization_chart`）
  - 支持 8+ 种图表类型：折线、柱状、饼、散点、雷达、面积、气泡、热力图
  - 智能图表推荐（chartType=auto）
  - 4 种主题风格：default/dark/business/colorful
  - 强大的数据类型识别（货币、百分比、日期、布尔）
  
- 🔗 **临时链接管理**（PanelManager）
  - `add_panel`: 生成带有效期的短链
  - `get_panel_info`: 查询短链信息、访问次数
  - 支持 OSS 托管与本地预览
  
- 🌐 **统一的 HTTP MCP 端点**（`/mcp`）
  - 兼容本地常驻服务与云函数部署
  - 支持 SSE 流式响应
  - AccessID/AccessKey 认证

### 2. SQL Chat 智能查询系统 🆕
- 🤖 **AI SQL 生成**
  - 集成 **DeepSeek-V3** 模型（魔塔社区 ModelScope API）
  - 自然语言转 SQL，支持中英文
  - Schema 感知：自动获取表结构信息
  - 置信度检查：防止执行错误或危险的 SQL
  - 缓存机制：相同请求快速响应
  
- 💾 **多数据库支持**
  - MySQL 8.0+
  - PostgreSQL 12+
  - 连接池管理，高效稳定
  - 连接测试与错误处理
  
- 📝 **智能代码编辑器**
  - **Monaco Editor** 集成（VS Code 级体验）
  - SQL 语法高亮与智能补全
  - 快捷键：Ctrl+Enter 执行，Ctrl+Shift+F 格式化
  - 实时错误提示
  
- 📊 **结果展示与分析**
  - 表格化数据展示
  - 执行统计：查询时间、影响行数
  - SQL 解释与置信度评分
  - 友好的错误提示与建议
  
- 🔒 **安全特性**
  - AccessID/AccessKey 双重验证
  - 只读 SQL 强制（防止数据修改）
  - 多语句禁止（防 SQL 注入）
  - 请求频率限制

## 📍 在线访问

- **主站点**：http://mcp.zha-ji.cn
- **MCP 端点**：http://mcp.zha-ji.cn/mcp
- **SQL Chat**：http://mcp.zha-ji.cn/sql（需认证）

---

## 1. 快速开始（Quick Start）

### 系统要求
- Node.js >= 18
- npm >= 8
- MySQL 8.0+ 或 PostgreSQL 12+（SQL Chat 功能必需）
- Redis（用户会话和配额管理）

### 安装与启动

```bash
# 1. 安装依赖
npm install
npm --prefix web install  # 安装前端依赖

# 2. 配置环境变量
cp .env.example .env  # 复制并编辑环境变量

# 3. 开发模式启动
npm run dev              # 启动后端服务（端口 3000）
npm --prefix web run dev # 启动前端开发服务器（端口 5173）

# 4. 生产构建
npm run build            # 构建后端
npm --prefix web run build # 构建前端到 web-dist/
npm start                # 启动生产服务
```

默认端口配置：
- 后端 API：3000（可通过 PORT/HTTP_PORT 配置）
- 前端开发：5173（Vite 默认）
- 生产环境：后端服务静态托管前端文件

### 环境配置（.env 示例）

```env
# 服务配置
PORT=3000
BASE_URL=http://localhost
STATIC_DIR=web-dist

# MySQL 配置（必需）
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=mcp

# Redis 配置
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
# REDIS_PASSWORD=your_redis_password

# AI 服务配置（SQL Chat）
AI_API_URL=https://api-inference.modelscope.cn/v1
AI_API_KEY=your_api_key
AI_MODEL=your_model
AI_TEMPERATURE=0.7
AI_MAX_TOKENS=2048

# OSS 配置（可选）
OSS_REGION=your_region
OSS_ACCESS_KEY_ID=your_access_key
OSS_ACCESS_KEY_SECRET=your_secret
OSS_BUCKET=your_bucket
```

---

## 2. SQL Chat 使用指南 📊

### 2.1 认证设置

首先需要获取 AccessID 和 AccessKey：

1. 启动服务并确保 MySQL/Redis 可用
2. 注册新用户：

```bash
curl -X POST "http://localhost:3000/api/auth/register" \
  -H "Content-Type: application/json" \
  --data '{
    "username": "alice",
    "email": "alice@example.com",
    "password": "Passw0rd!",
    "phone": "13800138000"
  }'
```

3. 保存返回的 `access_id` 和 `accessKey`

### 2.2 SQL Chat 功能

#### 数据库连接管理
- **连接配置**：支持 MySQL 和 PostgreSQL ✅
- **连接测试**：一键测试数据库可达性
- **安全存储**：连接信息本地加密存储

#### AI SQL 生成
- **自然语言输入**：支持中英文查询描述
- **智能 SQL 生成**：基于 DeepSeek-V3 模型
- **Schema 感知**：自动获取表结构信息
- **查询解释**：提供 SQL 语句解释和置信度评分

#### 代码编辑体验
- **Monaco Editor**：VS Code 级代码编辑器
- **语法高亮**：SQL 语法识别和高亮
- **智能补全**：SQL 关键字、函数提示
- **快捷键**：Ctrl+Enter 执行，Ctrl+Shift+F 格式化

#### 结果展示
- **表格展示**：清晰的数据表格
- **执行统计**：查询时间、影响行数
- **错误处理**：友好的错误提示和建议

---

## 3. MCP 数据可视化功能

### 3.1 通用数据可视化工具（create_visualization_chart）
该工具可将二维数组 + Schema 描述转为可交互的 HTML 报告，支持智能图表推荐与主题样式。

主要特性：
- 支持折线、柱状、饼、散点、雷达、面积、气泡、热力图
- chartType=auto 时按数据自动推荐
- 主题与样式可定制（default/dark/business/colorful）
- 可在 OSS 托管并返回 Panel 短链，或本地生成 HTML 并自动打开浏览器
- 强力的数据类型识别（货币、百分比、多日期格式、布尔别名等）

输入数据结构：
- data：二维数组，如 [["学生1", 85], ["学生2", 92]]。第一列常用于类别或时间，第二列为数值。
- schema：与 data 列对应的字段定义 [{ name, type } ...]，type ∈ { string, number, date, boolean }
- 可选参数：chartType、title、axisLabels、style.theme、style.customColors 等

输入示例（工具 arguments）：
```json
{
  "data": [["学生1", 85], ["学生2", 92]],
  "schema": [
    { "name": "学生", "type": "string" },
    { "name": "分数", "type": "number" }
  ],
  "chartType": "bar",
  "title": "学生成绩分布"
}
```

返回结果：包含一段说明文本，内含 Panel 短链（云端/自托管）或本地 file:// 路径。

### 3.2 临时链接管理（PanelManager）
- add_panel：为指定 OSS 路径生成带有效期的短链，默认私有
- get_panel_info：查询短链信息（创建/过期时间、访问次数、是否缓存等）
- 访问形态：`{BASE_URL}/panel/{id}`（云函数环境不拼接内部端口）

---

## 4. 如何调用 MCP（HTTP /mcp）

服务对外暴露统一端点：`POST {BASE_URL}:{PORT}/mcp`（生产：http://mcp.zha-ji.cn/mcp）

必须的请求头：
- Content-Type: application/json
- Accept: application/json, text/event-stream（两者都需要以通过 SDK 校验）
- AccessID: <你的访问ID>
- AccessKey: <你的访问密钥> 或 `Bearer <访问密钥>`

获取 AccessID/AccessKey（一次性明文回显）：
1) 启动服务并确保 MySQL/Redis 可用
2) 注册用户（仅示例）：
```bash
curl -X POST "http://localhost:3000/api/auth/register" \
  -H "Content-Type: application/json" \
  --data '{
    "username": "alice",
    "email": "alice@example.com",
    "password": "Passw0rd!",
    "phone": "13800138000"
  }'
```
响应 data 中包含 access_id 和一次性 accessKey，请妥善保存。随后可用 `/api/auth/access-key/rotate` 轮换密钥（需邮箱+密码）。

Windows PowerShell 建议先导出为环境变量：
```powershell
$env:ACCESS_ID = "ak_xxx"
$env:ACCESS_KEY = "xxx"
```



---

## 5. 数据输入与写入说明（重点）

- 数据写入位置：所有数据通过 MCP 工具调用（tools/call）的 `params.arguments` 进行输入写入。
- create_visualization_chart 所需：
  - data：二维数组，每行代表一条记录，列顺序与 schema 对齐
  - schema：字段定义数组（必须与 data 列数一致），type 取值：string | number | date | boolean
  - 可选：chartType（auto/line/bar/pie/scatter/radar/area/heatmap/bubble）、title、axisLabels、style
- add_panel 所需：
  - osspath：目标资源路径（完整 URL 或相对路径），默认生成 7 天有效期短链

数据清洗与识别：
- 数值支持科学计数法、百分比（10%）、常见货币格式（¥/$/€/£）
- 日期支持 YYYY-MM-DD、YYYY/MM/DD、MM/DD/YYYY、中文“YYYY年M月D日”、ISO 等
- 布尔支持 true/false/yes/no/y/n/是/否/1/0

---

## 6. Cherry Studio 配置（可选）
- URL：`http://mcp.zha-ji.cn/mcp`（生产）或 `http://localhost:3000/mcp`（本地）
- Transport：选择 URL/HTTP 传输（SSE/Streamable HTTP）
- Headers：
  - Content-Type: application/json
  - Accept: application/json, text/event-stream
  - AccessID / AccessKey：与你注册账号对应的凭据
- 超时：建议 30–60s（兼容冷启动）

更多云函数适配与排障，请参考 docs/cherry-mcp-integration-notes.md。

---

## 7. 常见问题（FAQ）
- 406 Not Acceptable：检查 Accept 是否同时包含 application/json 与 text/event-stream。
- JSON 解析错误（PowerShell）：请使用 `--data-binary @file.json`，确保 Body 是“真 JSON”。
- 未找到认证用户信息：确认已在请求头中提供 AccessID 与 AccessKey，并在数据库中创建了用户。
- 短链打开 404：确认 `BASE_URL` 与部署网关域一致，且未拼接内部端口。

---

### 开发指令
```bash
# 开发模式（后端 + 前端热重载）
npm run dev &
npm --prefix web run dev

# 分别构建
npm run build              # 后端 TypeScript 编译
npm --prefix web run build # 前端 Vite 构建

# 测试
npm test                   # 后端测试
npm --prefix web test      # 前端测试
```

### 技术栈

**后端技术**
- 🟢 **运行时**: Node.js 18+ + TypeScript 5.8+
- 🚀 **Web 框架**: Express 5.1 + CORS
- 💾 **数据库**: 
  - MySQL 8.0+ (mysql2 ^3.15.0)
  - PostgreSQL 12+ (pg ^8.16.3)
  - Redis 5.6+ (会话管理 + 配额系统)
- 🔐 **安全**: 
  - Argon2 ^0.41.1 (密码哈希)
  - express-rate-limit + rate-limiter-flexible (API 限流)
- 📁 **文件存储**: Ali OSS ^6.23.0
- 📝 **日志**: Pino ^9.9.5 + pino-pretty
- 📧 **短信**: tencentcloud-sdk-nodejs-sms ^4.1.71

**前端技术**
- ⚛️ **框架**: React 18+ + TypeScript
- ⚡ **构建工具**: Vite 5+
- 🎨 **样式**: Tailwind CSS 3+
- 📦 **状态管理**: Zustand
- 📝 **代码编辑**: Monaco Editor (内置)
- 🌐 **HTTP 客户端**: Fetch API

**AI 服务**
- 🤖 **模型**: DeepSeek-V3 (魔塔社区 ModelScope API)
- 🧠 **功能**: 自然语言转 SQL + 置信度评估
- 💡 **特性**: Schema 感知 + 缓存机制

**部署环境**
- ☁️ **云平台**: 腾讯云 SCF (云函数)
- 📁 **对象存储**: 腾讯云 COS / 阿里云 OSS
- 🌐 **域名**: http://mcp.zha-ji.cn
- 🐳 **容器化**: Dockerfile 支持

---

## 8. 贡献指南

欢迎贡献！如果你想为该项目贡献代码，请：

1. Fork 该仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的修改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 发起 Pull Request

- 使用 TypeScript 编写代码
- 遵循 ESLint 和 Prettier 配置
- 确保所有测试通

---

## 9. 联系与支持

- **项目地址**: [GitHub](https://github.com/Ayi456/data-visualization-mcp-server)
- **在线演示**: http://mcp.zha-ji.cn
- **问题反馈**: 请在 GitHub Issues 中提出

### 常见问题解决
如果遇到问题，请先查阅上方的 **常见问题（FAQ）** 部分，或者：
1. 检查环境变量配置是否正确
2. 确认数据库和 Redis 服务正常运行
3. 查看后端日志输出 (Pino)
4. 检查浏览器控制台错误信息

---

## 10. 许可证

ISC License

Copyright (c) 2025 MCPDemo Contributors

---
## 11. 致谢

感谢以下开源项目和服务：

- [Model Context Protocol (MCP)](https://github.com/modelcontextprotocol) - 核心协议
- [DeepSeek](https://www.deepseek.com/) - AI 模型支持
- [ModelScope](https://modelscope.cn/) - AI 模型推理平台
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - 代码编辑器
- [React](https://react.dev/) + [Vite](https://vitejs.dev/) - 前端框架
- [Express](https://expressjs.com/) - 后端框架

---

<div align="center">
  <strong>🚀 Made with ❤️ by MCPDemo Team</strong>
  <br>
  <sub>如果这个项目对你有帮助，欢迎给个 Star ⭐</sub>
</div>