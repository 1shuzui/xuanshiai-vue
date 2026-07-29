# 当前工程状态与已知差异

> 更新日期：2026-07-27
> 用途：防止文档把占位实现、Mock 或历史配置描述成已完成生产能力。

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
  - 发现：`全部 / MBTI / 校友`（TOPIC 面板仅在「发现·全部」；MBTI 上方有情感实验室四入口占位，点击敬请期待）
- 已有 `Xsa*` 组件含 `XsaDynamicCard`、`XsaApplySheet`、`XsaReportSheet` 等；实名门槛见 `utils/realNameGate.uts`（`passed|missing|reviewing|rejected`，兼容 pending/failed）。
- 认证门槛：常规社区互动、申请认识、参与话题 / 带话题发布均仅要求实名通过；双重认证仅作展示加分。
- 已有 `api/` 与 `mock/` 分层；社区 API 支持分页 list+hasMore、结构化 publish/comment/paperPlane、通知已读、拉黑过滤、同城城市；当前 `USE_MOCK = true`。
- 申请认识：`applyToMeet` 与 `mockApplyStates` 幂等（pending/accepted 不重复扣次）；首页与社区统一 `XsaApplySheet`。
- 2026-07-24：社区动态卡字段密度、发布页话题/声明/视频/表情、通知三栏已按设计实现（Mock + 页面渐进增强）；真机视频上传与 COS 仍属二期。
- 用户肖像资源位于 `static/portraits/`。
- HTML 参考 `design-demos/community-shell/` 已冻结，不再作为实现主线。

## 2. 运行与构建状态

- 2026-07-24 结构验证：`node tests/test-mock-system.js` 与 `node tests/test-community-flow.js` 均 exit 0；`git diff --check` 无错误（仅有 CRLF 提示）。工作区根目录 graphify 见 `../graphify-out/`（本项目目录内无独立 `graphify-out/`）。
- **HBuilderX 端侧编译（本会话已执行，2026-07-23 17:57 产物）：** 以 HBuilderX CLI `launch mp-weixin --compile true` 重新生成 `unpackage/dist/dev/mp-weixin`；社区子页与 `api/community.js` 同步刷新；微信开发者工具可导入该目录。H5 冒烟预览端口为本机 `http://localhost:8080`（`:5173` 不是本工程 UI）。
- **社区列表曾报“网络异常”：** 根因不是真实网络失败，而是 UTS 编译对象属性简写时丢掉局部变量（`normalizeListQuery` 返回 `{ tab }` 被编成裸 `tab` → ReferenceError → 页面 catch 文案）。源码已改为 `resolveTabValue` + 显式 `tab: tabName` 等属性名；产物中可见 `tab: tabName_1`。同类对象简写在 `.uts` 中应避免。
- npm CLI 当前未通过：默认会读取不存在的 `src/manifest.json`；手动指定项目根目录后，又会在解析 `App.uvue` 时失败。`npm run build:mp-weixin` / `dev:mp-weixin` 不能作为端侧验收结论。
- 因此当前应以 HBuilderX 作为端侧编译入口，并分别在浏览器和微信开发者工具验证；旧 `unpackage` 不能代替本次重新编译。
- 不得通过移动受保护配置、复制双份 `manifest.json` / `pages.json` 或批量改写 `.uvue` 来隐藏该架构差异。
- **微信 AppID 现状：** 产物 `project.config.json` 为 `touristappid`；`manifest.json` 的 `mp-weixin.appid` 为空。正式 AppID 须负责人授权后改 `manifest.json`（受保护文件），不要只改产物里的临时字段。
- **社区门槛（实现覆盖）：** 浏览无需认证；互动与申请认识仅 `realNameStatus === 'passed'`；学历只展示不拦截；举报/拉黑无门槛。

## 3. 页面成熟度说明

路由存在不等于功能已经生产就绪。当前登录、注册、发布、编辑资料、认证、会员、设置等页面仍可能包含静态展示或占位交互；验收时必须以实际代码和定版 PRD 为准。

聊天详情页已经存在，但产品规则仍是“先申请认识、双方同意后再建立沟通”。不得把现有页面理解为允许陌生人直接私信。

## 4. 当前后端状态

- `api/request.uts` 的真实分支调用 `uniCloud.callFunction`。
- `api/config.uts` 中的 `spaceId` 当前是占位值，现有请求封装没有完成完整生产联调说明。
- 因此不能只把 `USE_MOCK` 改为 `false` 就宣称真实接口完成。
- Mock 应按模块逐步退役，不删除作为契约样例的有效数据。

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





