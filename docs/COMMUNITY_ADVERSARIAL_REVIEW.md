# 社区模块对抗式审查结果

> 日期：2026-07-25  
> 范围：社区 FE↔BE 联调（`community.uts` / `user.uts` apply·like / BE community·discovery·social）  
> 方法：多子智能体交叉读码（code-reviewer / Explore / silent-failure-hunter）+ 主会话证据核对  
> 产品红线：定版 PRD **喜欢私有 + 先申请再聊**（互喜欢不得直接开聊）

状态：`open` 未修 · `fixed` 本轮已修 · `deferred` 明确后置 · `wontfix` 有意保留

---

## 1. 结论摘要

| 级别 | 审查发现 | 本轮处置 |
|------|----------|----------|
| P0 | quotas VIP SQL 错误列 → 500 | **fixed** A1 |
| P0 | apply Redis 日键 UTC vs local 漂移 | **fixed** A2 |
| P0 | `likeUser` `page_size:100` → BE 422 → 永不取消 | **fixed** A3 |
| P0 | 互喜欢建 match + chat_session 违 PRD | **fixed** A4 |
| P1 | apply 409 映射为 success | **fixed** B1 |
| P1 | 额度刷新空 catch / remain 本地 -1 | **fixed** B2 |
| P1 | 关注 all 假并集分页 | **fixed** B3 → BE `following_and_liked` |
| P1 | pointsAvailable / joined 默认 true | **fixed** B4 |
| P1 | 详情评论静默失败；赞藏预检失败仍 PUT | **fixed** B5 |
| P1 | 多处仅 catch toast、`!success` 无提示 | **fixed** B6 主路径 |
| P2 | 消息申请/聊天真路径、reply 幂等、E2E | **deferred** 阶段 C |
| P2 | 媒体上传、积分加次 | **deferred** |
| P3 | 文档把适配器完成写成集成完成 | **fixed** B7 诚实化 |

**不能**仅凭 `USE_MOCK=false` 宣称社区联调完成。静态 `test-community-flow.js` 不等于 HTTP E2E。

---

## 2. 缺陷台账

| ID | 级别 | 位置 | 问题 | 状态 |
|----|------|------|------|------|
| R-A1 | P0 | BE `community.py` get_community_quotas | `user_membership.expire_at` 不存在（应为 end_at/start_at） | fixed |
| R-A2 | P0 | BE discovery `_quota_key` vs community apply_key | `date.today()` vs UTC date；remain 与扣次不一致 | fixed（`daily_quota_key`） |
| R-A3 | P0 | FE `user.uts` likeUser | page_size 100 超 BE le=50 | fixed |
| R-A4 | P0 | BE `social.set_like` | 互喜欢 → match + chat_session + 开聊文案 | fixed |
| R-B1 | P1 | FE apply 409 | `okRes(success:true)` 假成功 | fixed |
| R-B2 | P1 | apply 成功后 quotas + ApplySheet | 空 catch；null remain 仍 -1 | fixed |
| R-B3 | P1 | mergeLiked 关注 all | page:1 cap 50 + totalA+totalB 假分页 | fixed（BE `following_and_liked` 真并集） |
| R-B4 | P1 | mapQuotaItem / BE quotas / joinTopic | 默认 points/joined 乐观 | fixed |
| R-B5 | P1 | getDynamicDetail / likeDynamic / collectDynamic | 评论失败静默；预检失败默认写 | fixed |
| R-B6 | P1 | community/post-detail/ReportSheet/paper-plane | `!res.success` 无 toast | fixed（主路径） |
| R-C1 | P2 | message.uts / chat | 申请列表与会话真路径不全 | deferred |
| R-C2 | P2 | UI | 删帖/取关/mine planes 无入口或仅 API | deferred |
| R-C3 | P2 | paper-plane reply | 无幂等 | deferred |
| R-C4 | P2 | feed applyStatus | 常写死 none | deferred |
| R-C5 | P2 | E2E | 无双用户 HTTP 脚本 | deferred（本地手工/脚本冒烟已覆盖核心路径，脚本未入库） |
| R-T1 | P0 | BE `discovery._viewer_context` | 缺 `user_auth` JOIN → apply 500 | **fixed**（实测发现） |
| R-T2 | P0 | BE `community` feed / viewer | `up.school` 列不存在 → posts 500 | **fixed**（关 Mock 联调；改 `ua.school`） |
| R-CITY1 | P1 | BE `_feed_clauses` mode=city | `location OR residence` 假同城 / 改现居带动旧帖 | **fixed**（仅 `p.location`） |
| R-CITY2 | P1 | BE `PUT /community/city` | 覆写 `residence` + 半写 code | **fixed**（独立 `community_city_*`） |
| R-CITY3 | P1 | FE city 空态 CTA | 未设城仍「发布动态」 | **fixed**（「选择城市」→ switchCity） |
| R-CITY4 | P2 | FE `loadCity` | 失败静默成「未设置」 | **fixed**（toast「城市加载失败」） |
| R-CITY5 | P2 | Mock city filter / setCity | 比 BE 宽；不拒「未设置」 | **fixed**（location-only + 422/429） |
| R-CITY6 | P2 | 一周限改 | 产品要求未落地 | **fixed**（`community_city_updated_at` + 429） |

---

## 3. 修复对照（执行记录）

详见 [`COMMUNITY_HTTP_CHANGELOG.md`](./COMMUNITY_HTTP_CHANGELOG.md)「对抗审查缺陷修复」「实际测试」「关 Mock 端侧联调」。

验收（P0 过线目标）：

1. `GET /api/v1/community/quotas` 登录后 200，含 `apply_daily` — **HTTP 实测 PASS**
2. 已喜欢用户再 like → DELETE；`page_size=100` 422 / `50` 200 — **HTTP 实测 PASS**
3. A 喜欢 B、B 喜欢 A → **无**新 `chat_session`；申请同意后才有会话 — **HTTP 实测 PASS**
4. 重复申请 409；成功后 remain−1 — **HTTP 实测 PASS**
5. `node tests/test-community-flow.js` 全绿 — **PASS**
6. 关 Mock 后 `GET /community/posts` 200（R-T2）— **HTTP 实测 PASS**；物理真机预览 — **blocked**（DevTools 登录过期）

---

## 4. 诚实边界

- **代码完成** ≠ **全量联调完成**：本地 HTTP 冒烟已过 A1–A4/B1 核心；关 Mock 编译与 DevTools 打开已做；**物理真机扫码未完成**；全社区 UI 面、阶段 C 仍开放。
- 当前联调 `USE_MOCK=false`；演示回退改 `true`。回归以静态测 + 本地 HTTP 冒烟为准。
- 关注「全部」已接 BE `following_and_liked`（`user_favorite.type IN (1,3)`）；`mergeLiked` 客户端假分页路径保留但恒 false。
- 本机需 Redis（冒烟用 Docker `xuanshiai-redis`）与 `SMS_PROVIDER=mock` 才能走登录写路径。

---

## 5. 同城城市对抗批（2026-07-25 续）

详见 [`COMMUNITY_HTTP_CHANGELOG.md`](./COMMUNITY_HTTP_CHANGELOG.md)「同城偏好独立 + location-only + 一周限改」。

验收目标：

1. `PUT /community/city` **不**改 `user_profile.residence*` — 代码路径已无 residence 写入。 **fixed**  
2. `mode=city` 只匹配 `p.location` — SQL 已删 residence OR；L7 异地 location 帖不进杭州流。 **HTTP PASS**  
3. 7 日内换城 **429**；同城重提 200。 **HTTP PASS**（L4）  
4. 未设城 FE CTA =「选择城市」。 **静态 PASS**  
5. Live：`tests/live/test_community_city_http.py` + `LIVE_API_BASE` — **8 passed**（2026-07-25）。  
6. 静态：`node tests/test-community-flow.js` 含 city 断言 — **全绿**。
