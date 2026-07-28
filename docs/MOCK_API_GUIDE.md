# Mock 数据与 API 管理说明

## 1. 目录结构

```text
api/  config.uts request.uts index.uts user.uts message.uts parent.uts emotionLab.uts community.uts matchmaker.uts
mock/ index.uts user.uts message.uts parent.uts emotionLab.uts community.uts matchmaker.uts
```

## 2. 调用边界

页面与组件只能调用 API 层：

```uts
import { getRecommendUser, applyToMeet } from '@/api'
const response = await getRecommendUser()
```

不要在页面中直接导入 `@/mock`。Mock 数据由 `api/*.uts` 引用，并通过 `request()` 返回统一结构：`success / data / code / message`。

## 3. 当前开关

`api/config.uts` 当前设置 `USE_MOCK = false`，用于既有 HTTP 联调：

- `true`：`request()` 返回 API 调用参数中的 `mockData`。
- `false` 且 `API_CONFIG.useHttp = true`：HTTP 请求 FastAPI（`API_BASE_URL` + `API_PREFIX`，Bearer token）。
- `false` 且 `useHttp = false`：回退 `uniCloud.callFunction`（`spaceId` 仍为占位）。

社区联调路径对照与变更时间线见 [`COMMUNITY_HTTP_CHANGELOG.md`](./COMMUNITY_HTTP_CHANGELOG.md)。不要把“关闭 Mock”描述成“一键完成上线”。

消息、父母端和情感实验室没有跟随全局开关静默切换，而是使用显式模块开关：

| 开关 | 当前值 | 关闭前门禁 |
|---|---:|---|
| `MESSAGE_USE_MOCK` | `true` | 会话、收到/发出申请、处理申请、聊天权限、全部已读与消息幂等完成真实接口联调 |
| `PARENT_USE_MOCK` | `true` | 真实父母/子女关系、关联子女业务主体、双主体认证、授权有效期和照片隐私字段完成后端授权校验 |
| `EMOTION_LAB_USE_MOCK` | `true` | FastAPI 的 MBTI 定义/会话/资料同步接口已实现；关闭前完成可达环境、鉴权、会话持久化与资料同步联调 |

模块开关关闭后请求失败必须返回失败，不能使用 `mockFallback` 或页面本地假数据继续伪造成功。

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
| `user.uts` | 推荐、广场、详情、我的资料；`likeUser` / `applyToMeet` 已 Mock+HTTP 双路径（social like / discovery applications） |
| `message.uts` | 会话/申请分页、聊天权限、全部已读、聊天记录、发送与失败重试；当前 `MESSAGE_USE_MOCK=true`，真实消息接口待联调 |
| `parent.uts` | 父母上下文、单子女资料、推荐、喜欢、申请与隐私裁剪；当前 `PARENT_USE_MOCK=true`，真实关系主体未联调 |
| `emotionLab.uts` | MBTI 摘要、固定会话快照、保存/提交、手动类型和资料来源；当前使用已授权的 60 题 `mbti-core@2` 快照与 1–7 级量表，Mock 仅替代离线存储与传输 |
| `community.uts` | 动态列表（tab/filter 分页 `list+hasMore`；关注 all 真路径并集）、详情、删帖/删评、话题、纸飞机收发/我的、活动、Banner、通知、配额、发布/评论、点赞/收藏/关注/取关、举报/拉黑、同城城市；`USE_MOCK=false` 时走 FastAPI |
| `matchmaker.uts` | 服务红娘、志愿红娘、AI 推荐、套餐、预约 |

### 社区列表约定（Mock）

- `getDynamicList({ tab, filter, page, pageSize, city? })` → `{ list, page, pageSize, hasMore, total, tab, filter }`
- 主 Tab：`follow | city | discover`
- 二级筛选：
  - follow：`all | following | likedUsers`（likedUsers = 用户级喜欢，不是帖子点赞）
  - city：`all | hot | latest`
  - discover：`all | mbti | alumni | hometown`
- `getTopicList({ sort, page, pageSize, excludeIds })` → `{ list, page, pageSize, total, hasMore }`
- `getTopicDetail(topicId, sort)` 支持 `hot | latest`
- 会话态：`mockBlockedUserIds`、`mockApplyStates`、`mockLikedUserIds`、`mockCurrentCity`
- `likeUser` 维护 `mockLikedUserIds`；与 `dynamic.liked` / `dynamic.collected` 分离
- `applyToMeet` 与 `mockApplyStates` 幂等：`pending`/`accepted` 不重复扣免费次数

实际能力以代码导出为准；文档不得先于实现宣称功能完成。

### 消息、父母端与 MBTI 契约

- 消息分页统一返回 `list / nextCursor / hasMore / total`；待处理数仅为收到且 `pending`。接受、拒绝、全部已读和发送消息只有业务 `success=true` 才能改变本地成功状态。
- 消息 API 使用 `MessageSubject` 区分普通用户与父母关联子女；父母主体必须携带合法 `childId`，Mock 的可变会话、申请和发送状态也按该主体隔离。真实服务端必须根据登录会话重新校验父母关系与子女授权，不能信任客户端传入的 `childId`。
- 消息发送使用稳定 `clientMessageId` 去重；同一 ID 只能对应同一主体、会话和内容，失败消息保留并允许单条重试。接受 / 拒绝使用稳定 `clientCommandId`，响应丢失后通过同键重试和列表回补确认最终状态。
- 消息模块通过统一适配器把 HTTP resolve 与云函数 reject 归一为保留 `code / message / data` 的失败响应；401 仍须由请求层清理本地登录凭据，页面不能把 reject 当作成功或继续展示旧数据。
- 父母端的 protected 响应必须在 API 数据层递归移除头像、照片和媒体 URL；401 或授权失效时清除已加载的消息数据，不能继续渲染旧缓存。
- `ParentContext` 同时描述父母身份、单一子女、父母实名、子女授权、资料完整度和剩余申请次数。父母 API 在门禁失效时 fail-closed；清晰照片 URL 不得先下发再靠前端隐藏。
- `PARENT_USE_MOCK=true` 不代表匿名可读：父母上下文及所有父母动作必须先校验 access token 与当前账号 ID。退出登录或请求层收到 401 时同时清除账号 ID、身份选择与完善状态，旧 `ParentContext` 随即失效。
- 父母端在真实关系接口完成前使用 `parent:<childId>` 内部 Mock scope 调用候选详情、喜欢和申请，并显式选择 Mock 红娘列表；该 scope 与普通用户及其他子女的可变状态隔离，即使全局 `USE_MOCK=false` 也不得误打普通用户真实接口。
- 父母申请成功后的剩余次数同时写回当前 `ParentContext` 与父母模块 Mock 上下文；父母聊天中的举报/屏蔽通过父母安全适配器处理，内部会话不得穿透到普通用户真实安全接口。
- MBTI 题库需稳定字符串题目 ID、明确极性与反向标记；会话固定题目及计分快照，提交必须完整且无重复、越界或快照外答案。资料同步必须显式确认并记录 `assessment | self_reported`。
- 情感实验室 Mock 状态及“我的资料”MBTI 来源均按 `xsa_user_id` 分区并通过 UniApp Storage 持久化；资料编辑页只经 `getEmotionLabSummary()` 读取已确认来源，并从 MBTI 行进入情感实验室。登出会清理当前主体标识。该本地隔离只服务内部审校，真实接口仍须在服务端校验会话、结果与当前账号的所有权。
