# Mock 与 API 快速说明

> 当前状态：全局 `USE_MOCK = false` 用于 FastAPI 联调；消息、父母端和情感实验室的显式模块 Mock 仍开启。Mock 是开发支撑，不是生产后端。

## 数据流

```text
页面 / 组件
  ↓ 只调用 @/api
api/*.uts
  ↓
api/request.uts
  ├─ USE_MOCK = true  → 返回调用方传入的 mockData
  ├─ USE_MOCK = false 且 useHttp = true → 请求 FastAPI HTTP
  └─ USE_MOCK = false 且 useHttp = false → 调用 uniCloud.callFunction

消息、父母端和情感实验室先由各自模块开关选择 Mock 或真实请求，不依赖 `mockFallback` 静默回退。
```

## 页面调用规则

```uts
import { getRecommendUser } from '@/api'

const response = await getRecommendUser()
```

禁止页面直接导入 `@/mock`。API 层负责让 Mock 与未来真实接口保持同一返回结构。

## 切换真实接口前必须完成

1. 确认对应 FastAPI 接口或云函数真实存在，路径或 `cloudFunctionName` 与调用一致。
2. 对齐请求参数、返回结构、错误码、鉴权和超时策略。
3. 验证 `api/request.uts` 的真实请求分支，而不是只改 `USE_MOCK`。
4. 按模块逐步切换并保留可回退能力，不直接删除 `mock/`。
5. 在 H5 和微信开发者工具回归关键流程。

详细说明见 [`docs/MOCK_API_GUIDE.md`](./docs/MOCK_API_GUIDE.md) 与 [`docs/Mock使用与退役约定.md`](./docs/Mock使用与退役约定.md)。
