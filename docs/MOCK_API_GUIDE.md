# Mock 数据与 API 管理说明

## 1. 目录结构

```text
api/  config.uts request.uts index.uts user.uts message.uts community.uts matchmaker.uts
mock/ index.uts user.uts message.uts community.uts matchmaker.uts
```

## 2. 调用边界

页面与组件只能调用 API 层：

```uts
import { getRecommendUser, applyToMeet } from '@/api'
const response = await getRecommendUser()
```

不要在页面中直接导入 `@/mock`。Mock 数据由 `api/*.uts` 引用，并通过 `request()` 返回统一结构：`success / data / code / message`。

## 3. 当前开关

`api/config.uts` 当前设置 `USE_MOCK = true`：

- `true`：`request()` 返回 API 调用参数中的 `mockData`。
- `false`：`request()` 调用 `uniCloud.callFunction`。

配置中的 `spaceId` 是占位值，现有真实请求分支也没有形成完整的生产接口契约。不要把“关闭 Mock”描述成“一键完成上线”。

## 4. 新增 API

1. 在对应 `mock/*.uts` 增加与目标接口一致的样例数据。
2. 在对应 `api/*.uts` 填写 `url`、`cloudFunctionName`、`action`、`data` 和 `mockData`。
3. 从 `api/index.uts` 统一导出。
4. 页面从 `@/api` 导入，实现加载、空态、失败与重试。
5. 增加最小测试或更新 `tests/test-mock-system.js`。
6. 在 H5 和微信开发者工具验证。

## 5. 数据契约

Mock 与真实接口至少对齐字段名、类型、分页、状态码、错误码、鉴权与隐私字段。不得用 Mock 的成功路径掩盖真实接口尚未实现的失败和权限状态。

## 6. 切换真实接口前

云函数已部署且名称一致；请求参数和返回结构已经联调；鉴权、超时、错误处理和日志策略已确认；关键流程有回归用例；按模块切换，不一次性删除 `mock/`。

## 7. API 模块

| 模块 | 主要能力 |
|---|---|
| `user.uts` | 推荐、广场、详情、我的资料、喜欢、申请认识 |
| `message.uts` | 消息列表、聊天记录、发送消息、认识申请 |
| `community.uts` | 动态、话题、纸飞机、活动、Banner、发布、点赞 |
| `matchmaker.uts` | 服务红娘、志愿红娘、AI 推荐、套餐、预约 |

实际能力以代码导出为准；文档不得先于实现宣称功能完成。
