# 当前工程状态与已知差异

> 更新日期：2026-07-26
> 用途：防止文档把占位实现、Mock 或历史配置描述成已完成生产能力。

## 父母端、消息与情感实验室首期（2026-07-28）

- `pages.json` 按本次明确授权只新增 `pages/parent/parent`、`pages/parent/user-detail`、`pages/emotion-lab/emotion-lab` 三个路由；普通用户原生五 Tab、`manifest.json`、`uniCloud-aliyun/` 未因本切片调整。
- 父母身份使用独立单页四面板：**首页 / 牵线 / 消息 / 我的**。首期仅一名已授权子女，申请认识同时校验父母实名、子女授权及授权有效期；父母端不展示社区、情感实验室、联系人交换、多人子女、会员支付或未落地购买入口。
- 父母 Mock 上下文也要求 access token 与 `xsa_user_id` 同时存在；退出登录或 401 会一并清除 token、账号 ID、`xsa_onboarding_mode` 与 `xsa_onboarding_completed`，避免下一账号继承父母身份。父母页面失去会话后清空敏感状态并回到登录页，旧的异步请求不能在页面隐藏或身份失效后写回。
- 父母候选列表使用受保护头像；详情只有在子女允许且访问门槛有效时才可获得清晰照片。照片隐私必须由 API 数据裁剪保证，CSS 模糊只负责呈现。
- 普通用户消息页与父母端共用 `XsaMessageCenter`、`XsaApplicationTabs`、`XsaConversationList`。申请分收到/发出分页，待处理数只统计收到且 `pending`；会话入口和聊天详情均重新检查双方同意权限，失败时保持原状态并提供重试。父母模式所有消息调用显式绑定关联子女主体，Mock 状态按主体隔离；申请处理使用命令幂等键，protected 数据递归脱敏，云函数 reject 归一保留 `code/message/data`，401 或授权失效时清除登录凭据和页面旧数据。
- 父母候选详情、喜欢和申请在真实关系接口完成前固定使用 `parent:<childId>` 内部 Mock scope，红娘列表也显式选择内部 Mock；全局 `USE_MOCK=false` 时不会误调用普通用户真实业务接口，不同子女主体的可变状态互不共享。
- 父母申请成功后的剩余次数会写回当前上下文与模块 Mock 上下文，页面刷新不重置；父母 Mock 聊天中的举报/屏蔽走父母安全适配器并显示“内部演示”，不会误作用于普通用户真实关系。
- 情感实验室首期仅 MBTI：介绍、答题、结果、手动设置在单页内切换；结果只含四维、类型、版本化说明和非心理诊断声明。Mock 草稿、结果及“我的资料”MBTI 来源按账号分区持久化，明确确认后才同步；资料编辑页通过统一摘要接口读取确认值并从 MBTI 行进入实验室。题库现使用已授权、经审校的 60 题 `mbti-core@2` 快照，采用稳定 ID、极性和 1–7 级量表；不迁入 demo UI 或其他人格体系。
- `MESSAGE_USE_MOCK=true`、`PARENT_USE_MOCK=true`、`EMOTION_LAB_USE_MOCK=true` 是显式模块边界。普通用户消息与 MBTI FastAPI 路由已在后端源码实现，但当前端侧仍使用 Mock 以保证离线可浏览；关闭开关前必须完成可达环境、鉴权、数据库初始化和失败状态联调。客户端 `MessageSubject.childId` 只表达业务主体，不构成授权；真实服务端必须从登录会话校验父母关系、子女授权和资源所有权。真实父母/子女关系主体仍不在本期后端范围。
- 本切片源码尚未用 HBuilderX 重新编译 `mp-weixin`，也未完成微信开发者工具和 320/375/390/428px 端侧回归；旧 `unpackage` 产物不能作为验收证据。

## 媒体与互动扩展（2026-07-26）

- 已补：评论点赞、纸飞机语音上传播放、纸飞机回复转匿名会话（页内面板）。
- 真实私信仍仅申请同意后开启；消息 Tab 的 /chat/sessions 联调不在本次。

## 1. 当前可确认的工程事实

- 技术栈：UniApp / Vue 3，页面和组件以 `.uvue` 为主，逻辑以 `.uts` 为主。
- 主目标端：微信小程序；H5 用于快速调试。
- 已注册 38 个页面，其中 5 个原生 Tab 保持：首页、社区、牵线、消息、我的；父母端四面板不是原生 Tab。
- 社区闭环子路由（`pages.json` 已登记）：话题列表/详情、动态详情、活动列表/详情/我的活动、纸飞机、社区通知、发布。
- 社区主 Tab：**关注 / 同城 / 发现**；二级筛选随主 Tab 切换：
  - 关注：`全部 / 关注 / 喜欢`（喜欢 = 用户级喜欢关系，不是帖子点赞）
  - 同城：`全部 / 热门 / 最新`
  - 发现：`全部 / MBTI / 校友 / 同乡`（TOPIC 面板仅在「发现·全部」）
- 已有 `Xsa*` 组件含 `XsaDynamicCard`、`XsaApplySheet`、`XsaReportSheet` 等；实名门槛见 `utils/realNameGate.uts`（`passed|missing|reviewing|rejected`，兼容 pending/failed）。
- 认证门槛：常规社区互动、申请认识、参与话题 / 带话题发布均仅要求实名通过；双重认证仅作展示加分。
- 已有 `api/` 与 `mock/` 分层；**社区 API 已支持 Mock / FastAPI 双路径**（`config.uts` + `request.uts` HTTP Bearer + `community.uts` map*）；当前工作树全局 `USE_MOCK = true` 用于端侧 Mock 浏览，消息、父母端、情感实验室仍由各自模块开关走 Mock。
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
- **微信 AppID 现状：** 产物 `project.config.json` 为 `touristappid`；`manifest.json` 的 `mp-weixin.appid` 为空。正式 AppID 须负责人授权后改 `manifest.json`（受保护文件），不要只改产物里的临时字段。
- **社区门槛（实现覆盖）：** 浏览无需认证；互动与申请认识仅 `realNameStatus === 'passed'`；学历只展示不拦截；举报/拉黑无门槛。

## 3. 页面成熟度说明

路由存在不等于功能已经生产就绪。当前登录、注册、发布、编辑资料、认证、会员、设置等页面仍可能包含静态展示或占位交互；验收时必须以实际代码和定版 PRD 为准。

聊天详情页已经存在，但产品规则仍是“先申请认识、双方同意后再建立沟通”。不得把现有页面理解为允许陌生人直接私信。

## 4. 当前后端 / 联调状态

- `api/request.uts`：当 `USE_MOCK=true` 时走 mock；当前 `false` 且 `API_CONFIG.useHttp=true`，走 FastAPI HTTP（Bearer）；`useHttp=false` 才回退 `uniCloud.callFunction`。
- 仓库默认 `API_BASE_URL=http://127.0.0.1:8000`（真机/同网段联调请本地改为局域网 IP）；token 存 `xsa_access_token`。
- 社区模块主链路与旁路（like/apply）**适配器 + 审查 P0 缺陷已修**。
- **2026-07-25 本地 HTTP 冒烟（A1–A4/B1 核心）已过：** quotas 200、like 可取消、`page_size` 50/100 契约、互喜欢无 `chat_session`、apply remain−1 + 409、accept 才建会话；记录见 changelog「实际测试」。环境：MySQL + Docker Redis + `SMS_PROVIDER=mock`。
- **关 Mock 端侧联调（进行中，非物理真机完成）：** 本地将 `USE_MOCK=false` 并配置可达 `API_BASE_URL`；BE 监听 `0.0.0.0:8000`；登录页**仅「调试登录」**写 mock 短信 token（`13800001001`/`123456`），新账号随后进入身份选择，正式一键登录不绑联调账号；HBuilderX 5.15 编译成功；微信开发者工具已打开产物；`auto-preview` 因 IDE `access_token expired` 失败。详见 changelog「关 Mock 端侧联调」。
- 实测顺带修：BE `discovery._viewer_context` 缺 `user_auth` JOIN（R-T1）；社区 feed `up.school` → `ua.school`（R-T2）。
- 物理手机扫码预览、开发者工具内手点全路径、阶段 C 仍开放；**不能**只把 `USE_MOCK` 改为 `false` 就宣称生产完成。
- BE：`set_like` 不再互喜欢建会话（对齐先申请再聊）；quotas VIP 用 `end_at`；额度 Redis 键 UTC 统一。
- **同城城市（2026-07-25 续）：** 独立偏好 `community_city_*`（**不写** residence）；一周限改 429；`mode=city` **只按** 帖子 `p.location`；锚点请求→偏好→现居回落；未设城 FE CTA「选择城市」。Live：`tests/live/test_community_city_http.py`。详见 changelog「同城偏好独立 + location-only + 一周限改」。
- Mock 应按模块逐步退役，不删除作为契约样例的有效数据；当前全局开关为 HTTP 联调态，联调结束后应恢复项目约定默认值，且勿把个人局域网 IP 当生产配置提交。
- 消息、父母端与情感实验室不能随全局开关自动宣称已联调；关闭各自模块开关前，必须完成真实接口、鉴权、失败状态、主体语义和隐私字段联调。
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

现有文档声明定版 PRD 应位于上级路径，但当前工作区未找到该权威文件；本次用户明确实施计划优先，项目内镜像只用于避免冲突，未修改 XMind 或 PRD 镜像。预期需求顺序为：

1. **决策层：** `../最终版的文字需求/定版决策收口记录.md`（本期/二期、认证、次数、付费与隐藏能力）。
2. **文字层：** `../最终版的文字需求/`（大纲与 `pages/`；与决策冲突时以决策为准）。
3. **分页面与截图：** `../最终版分页面拆分的相关需求/`。
4. `PRODUCT.md`（产品叙事与原则；范围边界须向决策层收敛，未回写前勿单独扩大范围）。
5. `DESIGN.md` 与当前代码 / Mock 状态。

注意：

- 最终版页面/大纲正文可能仍含导图残留（VIP 锁定、爆灯存疑、会员开通等），**不得按残留旧句实现**。
- 根目录过渡文档、`ref-*`、历史 XMind 源文件与已废弃路径（`xmind-*`、`design-demos`）不作为生产需求源。
- 当前代码中的会员开通页、认证项列表等可能与决策层不一致；验收以决策层 + 实际代码对照为准，并逐步收敛。
