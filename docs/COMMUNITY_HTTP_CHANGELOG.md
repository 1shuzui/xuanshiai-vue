### 评论点赞 / 纸飞机语音 / 匿名会话（2026-07-26）

- FE：likeComment、详情页评论点赞；uploadMedia；纸飞机录音/播放；回复后打开匿名对话面板。
- BE：PUT/DELETE /community/comments/{id}/like、POST /media/uploads、纸飞机 voice_url/voice_duration_sec、/paper-plane-conversations*。
- 匿名对话不等于真实私信（不建 chat_session / user_match）。

# Community HTTP Changelog

## 2026-07-26 内容举报契约（双轨）

- `reportContent(targetType, targetId, reasonId, detail)` live：
  - `post` / `comment` / `paper_plane`（兼容 `paperPlane`）→ `POST /community/reports`，body 用 `target_type` / `target_id` / `reason_id`
  - `user` → 仍 `POST /security/reports/{userId}`
- `XsaReportSheet` 提交真实内容对象，不再把 context 塞进 description，也不再强制内容举报必须有 userId（屏蔽仍要 userId）
- 详情页评论增加举报入口；纸飞机 `target-type=paper_plane`

# 社区 FE ↔ BE 联调修改记录

## 2026-07-26 · 社区媒体上传契约（Task 5–6 代码完成 / Task 7 验收）

> 目标：发布页 / 纸飞机先上传拿 `media_id`，再在 create 请求传 id；拒外链与本地临时路径。
> **自动化验收**：FE 静态 + BE 单测已跑；**真实 HTTP / 微信端手测未跑**（见下方清单）。

### 前端 `xuanshiai-vue`（commits `ccfcba4` … `3efcfcd`）

| 能力 | 契约 |
|------|------|
| 上传 | `uploadCommunityMedia(filePath, purpose)` → `uni.uploadFile` `POST /community/media/uploads`，字段 `file` + `formData.purpose`（`post` \| `paper_plane`） |
| 删除未绑定 | `deleteCommunityMedia(mediaId)` → `DELETE /community/media/{id}`（取消编辑 / 换图清理 orphan） |
| 发帖 | `publishDynamic` 优先 body：`image_media_ids[]`、`video_media_id`；图/视频互斥；media-only 允许空文案 |
| 纸飞机 | `sendPaperPlane` body：`image_media_ids[]`（最多 6）；无视频；语音另走通用 `uploadMedia` → `POST /media/uploads` |
| 幂等 | create 仍带 `Idempotency-Key`；key 指纹含 media id，连点同 payload 复用 key |
| 取消上传 | 发布页 photo↔video / 替换时取消 in-flight `uploadFile` 任务 |
| Mock | `mockCommunityMediaById` 解析 id→url，publish/send 后列表可见 |

页面：`pagesSub/community/publish.uvue`、`pagesSub/community/paper-plane.uvue`；API：`api/community.uts`。

### 后端 `xuanshiai-backend`（commits `baa939e` … `5f899bc`，分支 `codex/community-live-api-hardening`）

| 项 | 说明 |
|----|------|
| 表 | `community_media` / `community_media_attachment`（`baa939e`） |
| 上传/删 | `POST/DELETE /api/v1/community/media/...`（实现于 `community` 路由 + `community_media` 服务） |
| 绑定 | 发帖/纸飞机 create 将 ready → bound；删帖标 deleted |
| 安全 | 外链 / `wxfile://` / 本地路径 `422`；非本人 media id `422`；图视频互斥 |
| 文档 | `docs/api/community.md` 媒体生命周期（`5f899bc`） |

### Task 7 真实 HTTP 联调清单（人工）

| # | 场景 | 状态 |
|---|------|------|
| 1 | 登录实名用户 | **skipped** — 本轮未起 live 服务 / 未拿 token |
| 2 | 选图上传成功拿 media id | **skipped** — 同上 |
| 3 | 发布图片动态 | **skipped** |
| 4 | 选视频上传并发布 | **skipped** |
| 5 | 纸飞机选图发送 | **skipped** |
| 6 | 上传失败重试 | **skipped** |
| 7 | 取消编辑清理媒体（或 24h cleanup） | **skipped** |
| 8 | 连点发布只一条（幂等 + fingerprint 含 media id） | **skipped**（单测覆盖幂等逻辑；端到端未跑） |
| 9 | 伪造外部 URL 发布被拒 | **skipped**（单测有 `assert_owned_media_urls` / legacy external 拒绝；HTTP 未手测） |

### 自动化（本轮）

- BE dirty WIP 树：`pytest` media/features/bootstrap **83 passed, 4 skipped**；`ruff` media 相关路径 **All checks passed**
- BE clean `HEAD=5f899bc`：**2 failed**（见 Task 7 报告：路由断言测错层 + 纸飞机 rollback 与 WIP content_filter 序差异）
- FE：`test-mock-system` / `test-community-flow` / `git diff --check` 均 **pass**

## 2026-07-26 · 话题参与表持久化

- BE：`community_topic_participant`；`joined` / `participant_count` 读参与表；`POST .../join` 真实写入；`DELETE .../leave`；带话题发帖自动参与；历史发帖作者 init 幂等回填。
- FE：`joinTopic` / `leaveTopic` 映射 `joined`（fail-closed）与 `participantCount`；话题详情按 `joined` 切换「参与话题 / 去发言 + 取消参与」；`onShow` 重拉详情；Mock 对称。
- 文档：`xuanshiai-backend/docs/api/community.md` §7.3–7.4 与变更记录。

## 2026-07-25 · 实时契约对齐（Task 4）

- `GET /auth/me` 取代旧的 profile 真路径；实名状态映射为 `passed|missing|reviewing|rejected`，缺失认证数据一律为 `missing`。
- 动态真响应保留 `realname_status`、`visibility` 与 `declaration`；创建动态也透传后两项。
- 动态、评论、纸飞机发送及回复的真实写请求带 `Idempotency-Key`。失败重试复用同一 payload 的 key，服务端成功后才释放。
- 未接入上传服务时，真实环境拒绝本地临时图片或视频路径，不把设备路径发送给 API。
- 话题详情使用服务端页码、总数与 `hasMore`，前端仅在服务端写入成功后刷新点赞、收藏与关注状态。

### 已替代的同城说明

早期“社区城市读写 residence / 同城按 residence 回落”的记录已被替代。当前契约是独立的社区城市偏好；同城动态只按动态 `location` 匹配，不能再将 residence 作为社区城市或同城动态过滤依据。

> 用途：社区模块对接 FastAPI 的时间线总账。
> 状态约定：`已完成` / `进行中` / `未完成`。
> 不把 `USE_MOCK=false` 单独写成「联调完成」。

---

## 总览

| 阶段 | 状态 | 说明 |
|------|------|------|
| 后端社区基础接口与文档 | 已完成 | 动态/话题/活动/Banner/额度/城市/纸飞机等 |
| 前端 HTTP 层 + `community.uts` 双路径 | 代码完成 | config / request / map* 适配；集成验收另见审查修复 |
| P0 `likeUser` / `applyToMeet` 真接 | 代码完成 | 适配器已接；审查后修 409/page_size 等阻断 |
| P1 删帖删评取关 / 我的纸飞机 / 关注 all | 代码完成 | all → BE `following_and_liked` 真并集（原假分页已撤） |
| 对抗审查 P0/P1 缺陷修复 | 已完成 | 见 2026-07-25 · 审查修复；详见 `COMMUNITY_ADVERSARIAL_REVIEW.md` |
| 本地 HTTP 冒烟（A1–A4 / B1 核心） | 已完成 | 见 2026-07-25 · 实际测试；双用户 token + Redis + MySQL |
| 关 Mock 端侧联调（编译 + DevTools） | 已完成（本地模拟器） | 2026-07-30 HBuilderX 编译、AppID `wxb5f4e639f4eb2591` 导入和社区真实 HTTP 回归通过；物理真机/正式发布仍不在本轮范围 |
| 同城城市 GET/PUT + mode=city 传参 | 已完成 | 见 2026-07-25 · 同城城市端到端；过滤在 BE |
| 同城 city_code + 关注全部 BE 并集 | 已完成 | 见 2026-07-25 · 同城 city_code 与关注并集 |
| 媒体上传 FE/BE 代码 + 单测/静态验收 | 代码完成 | 见 2026-07-26 · 社区媒体上传契约；真实 HTTP/微信手测仍 skipped |
| 媒体上传真实 HTTP / 物理真机手测 / 消息申请 E2E | 未完成 | Task 7 清单 1–9 skipped；物理手机需同网预览扫码 |

默认开关：**当前联调为 `USE_MOCK = false`**（`api/config.uts`）；演示回退时改回 `true`。

---

## 2026-07-25 · 同城 city_code 与关注并集

> 目标：同城按市一级 `city_code` 对齐 profile；关注「全部」恢复 BE 真并集分页。discovery 高级筛选本期不做。

### 前端 `xuanshiai-vue`

| 文件 | 变更 |
|------|------|
| `api/community.uts` | `COMMUNITY_CITY_OPTIONS`（name+6 位码）；`normalizeCityCode` / `cityCodeFromName`；列表 `city_code` query；`feedModeFromTab` 全部 → `following_and_liked`（`mergeLiked` 恒 false）；`setCurrentCity(name, code)` |
| `api/index.uts` | 导出 `COMMUNITY_CITY_OPTIONS` |
| `pages/community/community.uvue` | `cityCode` 状态；`loadCity`/`switchCity` 读写 code；`getDynamicList` 传 `cityCode` |
| `mock/community.uts` | `mockCurrentCity.code = '320100'` |
| `tests/test-community-flow.js` | 断言 all → `following_and_liked` + city_code 对齐 |

### 后端 `xuanshiai-backend`

| 项 | 变更 |
|----|------|
| `normalize_city_code` / `city_code_from_name` | 短码 4 位右补 `00` → 6 位市码 |
| `GET/PUT /community/city` | 读写 `residence` + `residence_city_code`；响应 `{ name, code }` |
| `list_posts mode=city` | 优先 `city_code` / 作者 `residence_city_code`；name/location 弱兼容 |
| `mode=following_and_liked` | `user_favorite.type IN (1,3)` EXISTS，服务端 COUNT + 分页 |

### 仍后置

- 区级 `district_code` 筛选 UI；完整 regions 三级选择器
- 发帖 `post.city_code`（当前同城看人：作者现居 code）
- discovery 高级筛选；Stage C；物理真机手点

---

## 2026-07-25 · 同城城市端到端（所在城市）

> 目标：前端只负责选城 + 传参；过滤在后端。不要前端拉全量再按城市 filter。
> **后续增强：** 见上文「同城 city_code 与关注并集」（code 对齐 + 并集 mode）。

### 前端 `xuanshiai-vue`

| 文件 | 变更 |
|------|------|
| `pages/community/community.uvue` | 启动先 `await loadCity()` 再拉列表；`cityName` 默认空/`未设置`；同城未选城不发列表请求；`switchCity` 失败 toast；空态引导选城 |
| `api/community.uts` | `normalizeCityName` 过滤空/`未设置`；真路径缺省不塞假城市；`mode=city` 仅有效 city 入 query |
| `components/XsaApplySheet.uvue` | 申请 tip 统一为「需要实名认证」（去掉学历拦截相关文案） |

### 后端 `xuanshiai-backend`

| 项 | 变更 |
|----|------|
| `GET/PUT /community/city` | 读写 `user_profile.residence`；`PUT` 拒空/`未设置`（422） |
| `list_posts mode=city` | 无 city 时回落 residence；显式 `city=未设置` → 422；匹配 `p.location` / `up.residence` 精确或前缀（TRIM） |

### HTTP 冒烟（本机，旧 token + 重启 BE）

| 项 | 结果 |
|----|------|
| `PUT city=南京/杭州` | 200，GET 回读一致 |
| `PUT name=未设置` / 空白 | **422** |
| `GET posts?mode=city&city=南京` | 命中 location/residence 含南京的帖（含 seed 联调帖） |
| `GET posts?mode=city&city=杭州` | total=0（无杭州帖） |
| `GET posts?mode=city`（无 city） | 回落用户 residence=南京 |
| `GET posts?mode=city&city=未设置` | **422** |

### 仍后置（本段历史；code 已在上节落地）

- 发布页默认带当前同城；物理真机手点同城 Tab
- 高级发现筛选（MBTI 语义等）与 Stage C


---

## 2026-07-25 · 历史：社区 HTTP 双路径（已完成）

### 后端 `xuanshiai-backend`

- 扩展社区能力并写入 `docs/api/community.md`（含 §6–11 与变更记录）。
- 动态：列表/详情/发布/删、点赞、收藏（`community_like.type=3`）、评论增删。
- 话题：list / page / meta / detail / join。
- 活动：list / mine / detail / signup（地址在已报名后可见）。
- 元数据：banners、quotas、city、report-reasons。
- 纸飞机：发 / 捡 / 回 / mine；Redis 日额度。
- 动态流 `mode`：`latest | following | liked_users | city`；`filter` / `sort`。
- `CommunityPostResponse` 兼容资料字段（nickname/avatar/gender/age/mbti/school/hometown/residence 等）。
- `tests/test_community_features.py`：OpenAPI 路径注册 + 关键 GET 401 + schema 限长。
- 边界：媒体上传/审核仍有边界；评论点赞已接通；join 幂等存在性校验。

### 前端 `xuanshiai-vue`

- `api/config.uts`：`USE_MOCK`、`API_BASE_URL`、`API_PREFIX`、token 读写、`buildApiUrl`、`API_CONFIG.useHttp`。
- `api/request.uts`：Mock / HTTP(Bearer) / uniCloud；204；401 清 token；统一 `{success,data,code,message}`。
- `api/community.uts` 双路径 + snake→camel：`mapPost` / `mapTopic` / `mapActivity` / `mapBanner` / `mapQuotas` / `mapPaperPlane` / `mapNotification` / `mapComment`。
- 覆盖：动态、话题、活动、Banner、额度、城市、纸飞机、关注、拉黑、举报、通知。
- `components/XsaReportSheet.uvue`：举报目标优先作者 `userId`（对齐 `POST /security/reports/{target_id}`）。
- 静态：`node tests/test-community-flow.js` 通过；保留 `mock/`。
- 工作区执行 `graphify update .`。

### 当时已知未完成

- `likeUser` / `applyToMeet` 仍 mock 路径（`/user/like`、`/user/apply`），与 BE 不符。
- 社区未导出：删帖、删评、取关、我的纸飞机。
- 关注 Tab `all` 真路径仅 `following`。
- 发布媒体仍为本地 temp path。
- 不能仅靠关 Mock 宣称完成。

---

## 2026-07-25 · P0/P1 收口（已完成）

### 前端落地

| 文件 | 变更 |
|------|------|
| `api/user.uts` | `likeUser` / `applyToMeet` Mock+HTTP 双路径；真路径 `PUT\|DELETE /users/{id}/like`、`GET /relations/likes`、`POST /discovery/applications/{id}`；映射 403/409/429；真路径不改 `mockLikedUserIds` |
| `api/community.uts` | `unfollowUserFromCommunity` / `deleteDynamic` / `deleteComment` / `getMyPaperPlanes`；`feedModeFromTab.mergeLiked` + `mergeFollowAndLikedLists` 关注 all 并集 |
| `api/index.uts` | 导出上述四个新函数 |
| `components/XsaReportSheet.uvue` | `userId<=0` 直接失败，禁止帖 id 顶替 |
| `pagesSub/community/post-detail.uvue` | `@blocked` → toast + navigateBack |
| `tests/test-community-flow.js` | 断言 mergeLiked、index 新导出、user 双路径字符串 |

### 文档

- 本文件时间线；`PROJECT_STATUS.md` / `MOCK_API_GUIDE.md` / `前端开发注意事项.md` / `docs/README.md` 摘要与链接。
- 后端 `docs/api/community.md` §10 扩 discovery/social 协作表 + §11「前端对接补充」；**本轮无后端接口代码**。

### 验证

```text
cd xuanshiai-vue && node tests/test-community-flow.js
→ 社区闭环静态校验全部通过
```

- 当时静态验收仍以 `USE_MOCK=true` 为主；当前社区 1.0 本地验收已切换为 `USE_MOCK=false`，使用 FastAPI、access token 和已种子化数据库。
- 不把关 Mock 单独写成联调完成。

### 仍未做（P0/P1 收口当时）

- 媒体上传（COS/云存储 → URL 再发帖）
- 积分加次写路径
- mutual-like 自动建 match 与 PRD「先申请再聊」产品冲突裁决（**已在审查修复中按定版改 BE**）
- 消息页 applications 列表 / accept / reject 完整真路径
- 内容审核、feed 服务端 union mode（评论点赞已提供）

---

## 2026-07-25 · 对抗审查缺陷修复（A+B）

> 审查结论见 [`COMMUNITY_ADVERSARIAL_REVIEW.md`](./COMMUNITY_ADVERSARIAL_REVIEW.md)。
> 本轮修阻断与误导；**不**把关 Mock 写成联调完成。

### 后端 `xuanshiai-backend`

| ID | 变更 |
|----|------|
| A1 | `community.get_community_quotas` VIP 查询改 `start_at`/`end_at`（原 `expire_at` 列不存在会 500） |
| A2 | `redis.daily_quota_key`；discovery `_quota_key` + community apply/paper 读侧与 `create_paper_plane` 写侧统一 UTC 日键 |
| A4 | `social.set_like`：只写/删 `user_favorite`；**不再**互喜欢建 `user_match`/`chat_session`/match 通知；取消喜欢仍可 `match status=3` 清历史脏数据 |
| B4 | quotas `points_available=False`（积分加次写路径未接） |

### 前端 `xuanshiai-vue`

| ID | 变更 |
|----|------|
| A3 | `likeUser`：`page_size=50` 分页扫 likes；预检失败 `failRes`，不默认 PUT |
| B1 | apply 409 → `failRes(ALREADY_PENDING/MATCHED)`；Mock 重复申请 `success:false` |
| B2 | 申请成功后额度刷新失败 → `quotaRefreshFailed`；Sheet 不本地 `remain-1` |
| B3 | 关注 Tab「全部」真路径降级 **following only**（去掉假并集分页） |
| B4 | `mapQuotaItem.pointsAvailable` 缺省 false；`joinTopic.joined` 缺省 false |
| B5 | 详情评论失败 `commentsLoadError`；like/collect 详情预检失败不默认 PUT |
| B6 | community / post-detail / ReportSheet / paper-plane：`!success` toast |

### 验证

```text
cd xuanshiai-vue && node tests/test-community-flow.js
→ 社区闭环静态校验全部通过
```

### 仍未做（阶段 C / 后置）

- 消息页 discovery applications + accept/reject 真路径
- 聊天 FE 接 `/chat/sessions`
- 删帖/取关/我的纸飞机 UI 入口或「仅 API」声明收口
- 纸飞机 reply 幂等 / applyStatus 水合 / 完整自动化 E2E 脚本入库
- 媒体上传、积分加次写路径、BE feed union

---

## 2026-07-25 · 实际测试（本地 HTTP 冒烟）

### 环境

| 项 | 实际 |
|----|------|
| MySQL | `127.0.0.1:3306` / `xuanshiai`（已有 86 表） |
| Redis | 本机无服务 → `docker run -d --name xuanshiai-redis -p 6379:6379 redis:7-alpine` |
| BE | conda `xuanshiai-backend`；`SMS_PROVIDER=mock` + `ENVIRONMENT=development`；`uvicorn app.main:app --host 127.0.0.1 --port 8000`（无 reload） |
| 账号 | mock 短信 `123456` 登录 `13800001001` / `13800001002` → uid 1/2；库内 seed `user_auth.realname_status=2`、`user_profile_completion.score=100` |

### 结果

| 验收项 | 结果 | 证据 |
|--------|------|------|
| A1 quotas | **PASS** | `GET /community/quotas` → **200**；`apply_daily` total=3 used=0 remain=3；`points_available=false` |
| A3 page_size | **PASS** | `GET /relations/likes?page_size=100` → **422**；`page_size=50` → **200** |
| A3 like 可取消 | **PASS** | `PUT /users/2/like` → 200 `enabled:true matched:false`；`DELETE` → `enabled:false`；再 PUT 成功 |
| A4 互喜欢无会话 | **PASS** | A↔B 均 like 后 `chat_session=0`、`active_match=0`、`likes=2`、`matched:false` |
| A2/B1 remain 扣次 | **PASS** | apply 前 remain=3 → 成功后 used=1 remain=**2**（UTC Redis 键一致） |
| B1 重复申请 409 | **PASS** | 二次 `POST /discovery/applications/2` → **409** `双方已有进行中的认识申请或匹配` |
| 对照：同意才开聊 | **PASS** | `POST .../applications/1/accept` → 200 后 `chat_session=1`、`active_match=2` |
| 未登录 | **PASS** | `GET /community/quotas` → **401** |
| BE pytest 子集 | **PASS** | `test_community_features` + `test_social_features` + `test_discovery_features` + `test_health` → **16 passed** |
| FE 静态 | **PASS** | `node tests/test-community-flow.js` 全绿；`test-mock-system.js` 通过 |

说明：申请创建接口 HTTP 状态为 **201**（非 200），属正常 Created。

### 测试中新发现并已修

| 项 | 说明 |
|----|------|
| BE `discovery._viewer_context` | 选了 `ua.realname_status` 但漏 `LEFT JOIN user_auth ua` → apply **500**；已补 JOIN（`app/services/discovery.py`） |
| 本机 Redis | 未安装 Windows 服务；冒烟依赖 Docker 容器 `xuanshiai-redis` |
| `.env` 默认 `SMS_PROVIDER=disabled` | 冒烟启动时需 `SMS_PROVIDER=mock`（环境变量覆盖），否则无法发码登录 |

### 仍不算「全量联调完成」（HTTP 冒烟当时）

- 当时未跑 HBuilderX/微信端；冒烟仅 curl/脚本
- 未覆盖发帖/赞藏/关注/纸飞机/活动等全社区 HTTP 面
- 阶段 C（消息申请列表 UI、chat 列表、reply 幂等等）未做
- apply 依赖资料完成度/实名；生产数据需真实资料流，本冒烟为 DB seed

---

## 2026-07-25 · 关 Mock 端侧联调

### 配置

| 项 | 值 |
|----|----|
| `USE_MOCK` | **false**（`api/config.uts`，联调中） |
| `API_BASE_URL` | `http://192.168.112.65:8000`（本机 WLAN；真机需同网段） |
| BE | `uvicorn --host 0.0.0.0 --port 8000`；`SMS_PROVIDER=mock`；`CORS_ORIGINS_RAW=*` |
| Redis | Docker `xuanshiai-redis` |
| 登录 | 登录页「调试登录 / 模拟微信一键登录」：`POST /auth/sms/send` + `/auth/phone/login`（`13800001001` / `123456`）→ `setAuthTokens` |

### 端侧动作

| 步骤 | 结果 |
|------|------|
| HBuilderX 5.15 `cli launch mp-weixin --compile true` | **编译成功**（约 86s；uniCloud 未关联警告可忽略） |
| 产物 | `unpackage/dist/dev/mp-weixin`；`request.js` **无 Mock 分支**（常量折叠为 HTTP） |
| 微信开发者工具 `cli open --project …/mp-weixin` | **已打开**（历史记录使用 `touristappid`；当前验收使用 `wxb5f4e639f4eb2591`） |
| 物理真机 `auto-preview` | **失败**：微信 IDE `INVALID_LOGIN, access_token expired`（需在开发者工具内重新扫码登录后再预览） |

### 关 Mock 后接口对照（LAN）

| 接口 | 结果 |
|------|------|
| sms send + phone login | 200，拿 token |
| `GET /community/quotas` | **200** |
| `GET /community/posts` | 初 **500**（`up.school` 不存在）→ 改 `ua.school` 后 **200** |
| `POST /community/posts` 种子帖 | **201**，列表 items=1 |

### 本轮代码

| 文件 | 变更 |
|------|------|
| `api/config.uts` | `USE_MOCK=false`；`API_BASE_URL` 局域网 IP |
| `pages/auth/login.uvue` | 关 Mock 时 mock 短信登录写 Bearer |
| BE `app/services/community.py` | feed / viewer_profile：`school` 改从 `user_auth` |

### 你在开发者工具里需点的（CLI 无法代点 UI）

1. 确认详情里 **不校验合法域名**（`urlCheck: false` 已在 manifest）。
2. 打开登录页 → **调试登录，直接进入首页**（应 toast「已写入联调 token」）。
3. 切到 **社区 Tab** → 应出现种子动态「联调冒烟动态…」，Network 指向 `192.168.112.65:8000`。
4. 物理手机：先在微信开发者工具重新登录，再「预览」扫码；手机与电脑同 Wi‑Fi。

### 诚实边界

- 已完成：关 Mock 编译、产物 HTTP 化、BE 可达、登录写 token 路径、feed 500 修复、DevTools 打开。
- **未**由本会话完成：开发者工具内手点全路径录屏、物理真机（IDE 登录过期）、阶段 C。
- 演示回退：`USE_MOCK=true`；生产仍须正式登录与 HTTPS 域名。

---

## 2026-07-25（同城偏好独立 + location-only + 一周限改）

> 对抗审查同城 P1/P2 修复。产品：独立浏览偏好 + 一周限改；`mode=city` 只按帖子 `location`。

### 契约

| 项 | 行为 |
|----|------|
| 存储 | `user_profile.community_city_name/code/updated_at`（**不写** residence） |
| GET/PUT city | 读写偏好；空/`未设置` → 422；同城重提 200；换城 &lt;7d → **429** |
| mode=city | 命中仅 `p.location`；锚点：请求 → 偏好 → 现居回落 |
| 发现 same_city | 仍只看 `residence_city_code`，与偏好无关 |

### BE

| 文件 | 变更 |
|------|------|
| `database_setup_marriage.py` | 确保三列存在 |
| `app/core/config.py` | `community_city_cooldown_days=7` |
| `app/services/community.py` | `_resolve_city_anchor`；city 子句只 location；get/set 独立字段+冷却 |
| `docs/api/community.md` | §mode=city、§9.3、变更记录 |
| `tests/live/test_community_city_http.py` | L1–L11（`LIVE_API_BASE` + httpx） |

### FE

| 文件 | 变更 |
|------|------|
| `pages/community/community.uvue` | 未设城 CTA「选择城市」→`switchCity`；`loadCity` 失败 toast |
| `api/community.uts` | Mock 同城只 location；`setCurrentCity` 拒非法+7d 冷却 |
| `tests/test-community-flow.js` | 上述源码断言 |

### 冒烟矩阵（真实 HTTP，需起 BE）

| # | 用例 | 期望 |
|---|------|------|
| L1 | 短信登录 | 200 + token |
| L2 | PUT 南京 → GET | roundtrip name/code |
| L3 | PUT 未设置 / 空 | 422 |
| L4 | &lt;7d 再 PUT 杭州 | 429；GET 仍南京 |
| L5 | POST post location=南京 | 201 |
| L6 | feed city=南京 | 含 L5；location 前缀南京 |
| L7 | feed city=杭州 | 不含 L5 |
| L9 | city=未设置 | 422 |
| L10 | bare mode=city（偏好已设） | 200 |
| L11 | 未登录 GET city | 401 |

运行：`LIVE_API_BASE=http://127.0.0.1:8000 pytest tests/live/test_community_city_http.py -v`（服务端 `SMS_PROVIDER=mock`）。

### 实测（2026-07-25）

- 静态：`node tests/test-community-flow.js` — **全绿**（含同城 CTA / Mock location-only）。
- DB：`init_db` 已加 `community_city_name/code/updated_at`。
- Live：`LIVE_API_BASE=http://127.0.0.1:8000` + `SMS_PROVIDER=mock` → `pytest tests/live/test_community_city_http.py -v` — **8 passed**（L1–L4、L5–L7、L9–L11；L8 residence 直连 SQL 未默认跑）。

### 诚实边界

- 静态覆盖 FE/Mock 契约字符串；Live 默认 skip，需显式 `LIVE_API_BASE`。
- **不**宣称关 Mock / 本修复即全量联调完成；物理真机、阶段 C、L8 SQL 回归仍开放。

---

## 路径对照（联调速查）

| FE 能力 | Mock / 旧 path | 真 HTTP |
|---------|----------------|---------|
| 动态流 | mock filter | `GET /community/posts` |
| 发帖 | mock list unshift | `POST /community/posts` |
| 点赞/收藏 | mock toggle | `PUT\|DELETE .../like`、`.../collect` |
| 关注 | mock followed | `PUT /users/{id}/follow` |
| 取关 | （补） | `DELETE /users/{id}/follow` |
| 喜欢用户 | mockLikedUserIds | `PUT\|DELETE /users/{id}/like` |
| 申请认识 | mockApplyStates | `POST /discovery/applications/{id}` |
| 拉黑/举报 | mock | `PUT /security/blocks/{id}`、`POST /security/reports/{id}` |
| 额度 | mockCommunityQuotas | `GET /community/quotas` |
| 我的纸飞机 | （补） | `GET /paper-planes/mine` |

---

## 修订规则

1. 代码与本文不一致时以代码为准，并立刻改本文。
2. 写「已完成」必须可指到文件或测试输出。
3. 后端契约变更同步 `xuanshiai-backend/docs/api/*`。
4. 产品范围变更走根目录定版 PRD，不写在本文件冒充决策。
