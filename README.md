# 宣誓爱 UniApp 前端

宣誓爱的唯一生产前端工程，目标端为微信小程序与 H5；H5 主要用于快速调试，关键流程以微信开发者工具验收为准。

## 快速开始

当前源码采用根目录式 UniApp X 结构（`.uvue` / `.uts`）。请优先使用 HBuilderX 打开本目录，然后运行到浏览器或微信开发者工具。

```bash
npm install
node tests/test-mock-system.js
```

`package.json` 保留了 `dev:h5`、`dev:mp-weixin`、`build:h5` 和 `build:mp-weixin`，但截至 2026-07-22，当前 npm CLI 会默认寻找 `src/manifest.json`；即使手动指定根目录，仍会在解析 `App.uvue` 时失败。因此这些命令暂时只用于诊断，不作为已通过的运行入口。不要为绕过问题复制或移动受保护的 `manifest.json`、`pages.json`。详细说明见 [`docs/HOW_TO_RUN.md`](./docs/HOW_TO_RUN.md) 与 [`docs/TROUBLESHOOTING.md`](./docs/TROUBLESHOOTING.md)。

## 必读文件

| 文件 | 作用 |
|---|---|
| [`AGENTS.md`](./AGENTS.md) | 项目级强约束与允许修改范围 |
| [`PRODUCT.md`](./PRODUCT.md) | 产品定位、功能边界与核心流程 |
| [`DESIGN.md`](./DESIGN.md) | 设计 Token、组件与视觉规范 |
| [`CLAUDE.md`](./CLAUDE.md) | AI 协作与开发执行说明 |
| [`docs/README.md`](./docs/README.md) | 工程文档索引 |
| [`docs/PROJECT_STATUS.md`](./docs/PROJECT_STATUS.md) | 当前实现、已知差异与待确认项 |

## 目录结构

```text
api/                 统一数据接口与请求封装
components/          Xsa* 基础组件和业务组件
pages/               UniApp 页面
mock/                开发期 Mock 数据
static/              静态资源
docs/                运行、接口、UI、排错与验收文档
tests/               当前测试脚本
uniCloud-aliyun/      既有云函数目录，未经确认不得修改
```

## 当前开发状态

- `api/config.uts` 当前社区 1.0 验收为 `USE_MOCK = false`；其它尚未接入真实后端的模块仍保留 Mock。
- 页面只能通过 `@/api` 获取业务数据，不直接依赖 `@/mock`。
- `USE_MOCK = false` 不代表生产后端已经可用；切换前必须完成云函数、错误码、鉴权和接口契约联调。
- `manifest.json`、`pages.json`、`uniCloud-aliyun/` 是受保护区域，未经明确确认不得修改。
- `../design-demos/final/` 只作为外部视觉参考，不是生产入口。

## 验证顺序

1. 运行 `node tests/test-mock-system.js`。
2. 使用 HBuilderX 运行到浏览器，记录第一条编译错误并完成 H5 快速回归。
3. 使用 HBuilderX 运行到微信开发者工具，检查关键路径；H5 不能替代小程序验收。
4. npm CLI 问题修复后，再恢复 `npm run build:h5` / `npm run build:mp-weixin` 为提交门禁。
5. 按 [`docs/开发自检清单.md`](./docs/开发自检清单.md) 完成提交前自检。
