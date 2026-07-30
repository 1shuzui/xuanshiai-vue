# 当前工程状态与已知差异

> 更新日期：2026-07-30
> 用途：防止文档把占位实现、Mock 或历史配置描述成已完成生产能力。

## 当前验收记录（2026-07-30）

- **微信 AppID：** `wxb5f4e639f4eb2591`，已写入 `manifest.json`、`project.config.json` 和最新 `mp-weixin` 产物。
- **HBuilderX：** `5.15.2026070915` 已成功编译 `mp-weixin`；产物目录为 `unpackage/dist/dev/mp-weixin`，微信开发者工具已打开该目录。
- **微信端冷启动：** 清理模拟器缓存后，欢迎页协议、调试登录、首页到社区均通过；短信发送 `202`、手机号登录 `200`。
- **社区真实接口：** 本地 FastAPI `http://127.0.0.1:8000` 的动态、筛选、话题、活动、Banner、通知、纸飞机、配额、详情/评论矩阵通过；数据来自后端 `seed_community_demo.py`，没有新增前端虚拟数据。
- **社区子页面：** 话题列表、活动列表、纸飞机、社区通知均已在 DevTools 打开并有真实数据；通知种子已绑定当前调试账号 `17870810285`。
- **控制台：** 未发现新的 `error`、`exception` 或 `failed`；仅有微信基础库 `wx.getSystemInfoSync` 弃用警告。
- **包体门禁：** `npm run verify:mp` 通过；主包 `1,980,849` bytes，6 个分包均低于 2 MiB，媒体超限 `0`，`lazyCodeLoading=requiredComponents`。
- **边界：** 这是本地 DevTools 模拟器验证，不等于正式发布、真机验收或生产 HTTPS 合法域名验收。

## 近期合入（2026-07-26 ~ 2026-07-27）

- **PR #3（tongouo）：** 纸飞机页面精调 — 纸飞机工作台 UI、底部 dock、消息列表页、聊天 80 积分解锁、脱单纸飞机页面
- **PR #4（tongouo）：** 纸飞机轮播卡片、纸飞机身份（头像/昵称）、获取纸飞机次数（50 积分）
- **PR #5（lilizh514）：** 消息和聊天页面增强 — 引用消息、多选删除、单条删除、撤回、复制、联系方式交换、消息页布局优化、会话工具（utils/conversation.uts）

## 后端对接状态（2026-07-27）

- **USE_MOCK = false**，已连接后端 FastAPI（`http://127.0.0.1:8000`）
- 纸飞机核心接口（发送、获取、回复、会话列表、消息、已读）均已对接后端
- 纸飞机获取次数（`purchasePaperPlaneChance`）后端暂未实现，仍使用本地 Mock（`PAPER_PLANE_CHANCE_USE_MOCK = true`）

## 媒体与互动扩展（2026-07-26）

- 已补：评论点赞、纸飞机语音上传播放、纸飞机回复转匿名会话（页内面板）。
- 真实私信仍仅申请同意后开启；消息 Tab 的 /chat/sessions 联调不在本次。

## 1. 当前可确认的工程事实

- 技术栈：UniApp / Vue 3，页面和组件以 `.uvue` 为主，逻辑以 `.uts` 为主。
- 主目标端：微信小程序；H5 用于快速调试。
- 已注册 35 个页面，其中 5 个 Tab：首页、社区、牵线、消息、我的。
- 社区闭环子路由（`pages.json` 已登记）：话题列表/详情、动态详情、活动列表/详情/我的活动、纸飞机、社区通知、发布。
- 社区主 Tab：**关注 / 同城 / 发现**；二级筛选随主 Tab 切换：
  - 关注：`全部 / 关注 / 喜欢`（喜欢 = 用户级喜欢关系，不是帖子点赞）
  - 同城：`全部 / 热门 / 最新`
  - 发现：`全部 / MBTI / 校友 / 同乡`（TOPIC 面板仅在「发现·全部」）
- 已有 `Xsa*` 组件含 `XsaDynamicCard`、`XsaApplySheet`、`XsaReportSheet` 等；实名门槛见 `utils/realNameGate.uts`（`passed|missing|reviewing|rejected`，兼容 pending/failed）。
- 认证门槛：常规社区互动、申请认识、参与话题 / 带话题发布均仅要求实名通过；双重认证仅作展示加分。
- 已有 `api/` 与 `mock/` 分层；**社区 API 已支持 Mock / FastAPI 双路径**（`config.uts` + `request.uts` HTTP Bearer + `community.uts` map*）。当前社区 1.0 验收配置为 `USE_MOCK = false`；需要纯结构预览时才临时切回 `true`。
- 申请认识：`applyToMeet` Mock 幂等（重复申请 `success:false`）；**真路径** `POST /discovery/applications/{id}` + 刷新 quotas；409 → failRes。喜欢用户：`likeUser` 真路径 `PUT|DELETE /users/{id}/like`，likes 列表 `page_size≤50` 分页预检。
- 社区 API 另导出：删帖/删评/取关/我的纸飞机；关注 Tab「全部」真路径 **`mode=following_and_liked`**（关注∪用户级喜欢，BE 分页；原客户端假并集已撤）。
- **联调总账：** [`COMMUNITY_HTTP_CHANGELOG.md`](./COMMUNITY_HTTP_CHANGELOG.md)；**对抗审查：** [`COMMUNITY_ADVERSARIAL_REVIEW.md`](./COMMUNITY_ADVERSARIAL_REVIEW.md)。
- 2026-07-24：社区动态卡字段密度、发布页话题/声明/视频/表情、通知三栏已按设计实现（Mock + 页面渐进增强）；真机视频上传与 COS 仍属二期。
- 用户肖像资源位于 `static/portraits/`。
- HTML 参考 `design-demos/community-shell/` 已冻结，不再作为实现主线。

## 2. 运行与构建状态

- 2026-07-24 结构验证：`node tests/test-mock-system.js` 与 `node tests/test-community-flow.js` 均 exit 0；`git diff --check` 无错误（仅有 CRLF 提示）。工作区根目录 graphify 见 `../graphify-out/`（本项目目录内无独立 `graphify-out/`）。
- **HBuilderX 端侧编译：** 2026-07-25 关 Mock 后以 CLI `launch mp-weixin --compile true` 重新生成 `unpackage/dist/dev/mp-weixin`（产物 HTTP-only）；微信开发者工具已打开该目录。H5 冒烟预览端口为本机 `http://localhost:8080`（`:5173` 不是本工程 UI）。
- **社区列表曾报“网络异常”：** 根因不是真实网络失败，而是 UTS 编译对象属性简写时丢掉局部变量（`normalizeListQuery` 返回 `{ tab }` 被编成裸 `tab` → ReferenceError → 页面 catch 文案）。源码已改为 `resolveTabValue` + 显式 `tab: tabName` 等属性名；产物中可见 `tab: tabName_1`。同类对象简写在 `.uts` 中应避免。
- npm CLI 当前未通过：默认会读取不存在的 `src/manifest.json`；手动指定项目根目录后，又会在解析 `App.uvue` 时失败。`npm run build:mp-weixin` / `dev:mp-weixin` 不能作为端侧验收结论。
- 因此当前应以 HBuilderX 作为端侧编译入口，并分别在浏览器和微信开发者工具验证；旧 `unpackage` 不能代替本次重新编译。
- 不得通过移动受保护配置、复制双份 `manifest.json` / `pages.json` 或批量改写 `.uvue` 来隐藏该架构差异。
- **微信 AppID 历史记录：** 2026-07-27 以前曾使用 `touristappid`/空 AppID；该状态已由当前授权 AppID `wxb5f4e639f4eb2591` 替换，验收以最新 HBuilderX 产物为准。
- **社区门槛（实现覆盖）：** 浏览无需认证；互动与申请认识仅 `realNameStatus === 'passed'`；学历只展示不拦截；举报/拉黑无门槛。

## 3. 页面成熟度说明

路由存在不等于功能已经生产就绪。当前登录、注册、发布、编辑资料、认证、会员、设置等页面仍可能包含静态展示或占位交互；验收时必须以实际代码和定版 PRD 为准。

聊天详情页已经存在，但产品规则仍是“先申请认识、双方同意后再建立沟通”。不得把现有页面理解为允许陌生人直接私信。

## 4. 当前后端 / 联调状态

- `api/request.uts`：`USE_MOCK=true` 走 mock；`false` 且 `API_CONFIG.useHttp=true` 走 FastAPI HTTP（Bearer）；`useHttp=false` 才回退 `uniCloud.callFunction`。
- 仓库默认 `API_BASE_URL=http://127.0.0.1:8000`（真机/同网段联调请本地改为局域网 IP）；token 存 `xsa_access_token`。
- 社区模块主链路与旁路（like/apply）**适配器 + 审查 P0 缺陷已修**。
- **2026-07-25 本地 HTTP 冒烟（A1–A4/B1 核心）已过：** quotas 200、like 可取消、`page_size` 50/100 契约、互喜欢无 `chat_session`、apply remain−1 + 409、accept 才建会话；记录见 changelog「实际测试」。环境：MySQL + Docker Redis + `SMS_PROVIDER=mock`。
- **关 Mock 端侧联调（本地模拟器已验证）：** 本地使用 `USE_MOCK=false`、`API_BASE_URL=http://127.0.0.1:8000`；登录页调试登录使用 `17870810285`/`123456`；HBuilderX 5.15 编译成功，微信开发者工具已打开并完成社区路径回归。物理手机、正式登录、正式 HTTPS 合法域名仍不在本次范围。
- 实测顺带修：BE `discovery._viewer_context` 缺 `user_auth` JOIN（R-T1）；社区 feed `up.school` → `ua.school`（R-T2）。
- 物理手机扫码预览、正式发布配置和阶段 C 仍开放；本地 DevTools 通过不能替代生产验收。
- BE：`set_like` 不再互喜欢建会话（对齐先申请再聊）；quotas VIP 用 `end_at`；额度 Redis 键 UTC 统一。
- **同城城市（2026-07-25 续）：** 独立偏好 `community_city_*`（**不写** residence）；一周限改 429；`mode=city` **只按** 帖子 `p.location`；锚点请求→偏好→现居回落；未设城 FE CTA「选择城市」。Live：`tests/live/test_community_city_http.py`。详见 changelog「同城偏好独立 + location-only + 一周限改」。
- Mock 应按模块逐步退役，不删除作为契约样例的有效数据；当前社区联调保持 `USE_MOCK = false`，其它尚未接入真实后端的模块仍按模块保留 Mock。
- 仍后置：媒体上传、消息页 applications 真路径、聊天 sessions FE、纸飞机 reply 幂等、区级筛选/完整 regions 选择器、自动化 E2E 入库；见 changelog / 审查台账 deferred。

## 5. 配置与产品边界差异

以下是现有配置中的历史或预留项，不代表已批准产品能力：

- `manifest.json` 包含定位、麦克风等 App 权限描述。
- 权限文案提到“附近推荐”“语音聊天和视频通话”，与当前认真婚恋、申请认识优先的产品边界并不完全一致。
- `manifest.json` 引用了 `static/logo.png`，但当前仓库没有该正式品牌图标。

这些内容属于受保护配置，本文只记录差异；修改前需明确授权并同步产品、设计与隐私说明。

## 6. 设计实现差异

- `DESIGN.md` 规定圆角等级为 4px / 8px / 12px / 999px。
- 当前 `uni.scss` 的部分旧工具类仍为 6px / 10px / 16px。
- 新页面应遵循 `DESIGN.md`，不要继续复制旧圆角值；全局 Token 的统一修改需要设计评审。
- `pages.json` 只能使用平台支持的静态色值，不能直接引用 CSS 变量；其中颜色应视为平台配置映射，而非新增设计 Token。
- **Token 运行时（2026-07-22 方案 A）**：语义名不变；色值为 hex/rgba。全局注入在 `App.uvue` 的 `page { --token }`（进入微信 `app.wxss`），并与 `uni.scss` 对齐。业务继续用 `var(--token)`，禁止 `oklch()` 与页面散落字面色。
- 历史产物 `unpackage/dist/dev/mp-weixin` 在未重新编译前可能仍是旧样式；验收以 HBuilderX 重新运行到微信开发者工具后的结果为准。

## 7. 下一阶段开发计划

分阶段执行与验收以 [`DEV_PLAN_HBUILDERX.md`](./DEV_PLAN_HBUILDERX.md) 为准（2026-07-22 v1.0.0）：

- **P0：** Tab 顺序与图标、首页壳层/故事卡/广场双列（对照冷白 HTML final，不回 HTML 主线）
- **P1：** 申请认识 → 双方同意 → 聊天主路径；社区/牵线/我的/认证
- **P2：** 会员拦截、爆灯/置顶/积分 Mock 付费
- **工具链：** HBuilderX + 微信开发者工具验收；不以 npm CLI 构建为门禁

## 8. 当前需求依据

定版产品定义已在 PRODUCT.md 登记，裁决优先级：

1. **用户本次明确授权**
2. **`PRODUCT.md`：** 产品定位、原则、边界与当前基线
3. **`AGENTS.md` 硬约束**
4. **`DESIGN.md`** 与当前代码 / Mock 状态

注意：

- 最终版页面/大纲正文可能仍含导图残留（VIP 锁定、爆灯存疑、会员开通等），**不得按残留旧句实现**。
- 根目录过渡文档、`ref-*`、历史 XMind 源文件与已废弃路径（`xmind-*`、`design-demos`）不作为生产需求源。
- 当前代码中的会员开通页、认证项列表等可能与决策层不一致；验收以决策层 + 实际代码对照为准，并逐步收敛。





