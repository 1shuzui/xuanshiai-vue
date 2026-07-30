# Mock 与 API 快速说明

> 当前状态：社区 1.0 验收使用 `api/config.uts` 中的 `USE_MOCK = false`；Mock 仍是开发支撑，不是生产后端。

## 数据流

```text
页面 / 组件
  ↓ 只调用 @/api
api/*.uts
  ↓
api/request.uts
  ├─ USE_MOCK = true  → 返回调用方传入的 mockData
  └─ USE_MOCK = false → 通过 HTTP 请求 FastAPI（当前社区路径）
```

## 页面调用规则

```uts
import { getRecommendUser } from '@/api'

const response = await getRecommendUser()
```

禁止页面直接导入 `@/mock`。API 层负责让 Mock 与未来真实接口保持同一返回结构。

## 切换真实接口前必须完成

1. 确认对应云函数真实存在，名称与 `cloudFunctionName` 一致。
2. 对齐请求参数、返回结构、错误码、鉴权和超时策略。
3. 验证 `api/request.uts` 的真实请求分支，而不是只改 `USE_MOCK`。
4. 按模块逐步切换并保留可回退能力，不直接删除 `mock/`。
5. 在 H5 和微信开发者工具回归关键流程。

详细说明见 [`docs/MOCK_API_GUIDE.md`](./docs/MOCK_API_GUIDE.md) 与 [`docs/Mock使用与退役约定.md`](./docs/Mock使用与退役约定.md)。
