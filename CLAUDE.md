# CLAUDE.md

本文件是 Claude 在「宣誓爱」仓库中的工作入口。项目级强约束以 `AGENTS.md` 为准；产品边界以 `PRODUCT.md` 为准；视觉与组件语言以 `DESIGN.md` 为准。

## Project Identity

- 产品：认真婚恋小程序 / 移动端应用。
- 主实现：`./`。
- 平台：微信小程序优先，H5 用于快速预览和联调。
- 技术栈：UniApp、Vue 3、UTS、Sass。
- 定版 PRD（已登记，路径相对本工程）：
  - 决策层：`../最终版的文字需求/定版决策收口记录.md`
  - 文字层：`../最终版的文字需求/`
  - 分页面与截图：`../最终版分页面拆分的相关需求/`
- 视觉与 Token：`DESIGN.md`、`uni.scss`；分页面截图作界面对照。
- 当前数据状态：`api/config.uts` 中 `USE_MOCK = true`，不要把 Mock 流程描述成生产后端已完成。
- 完整协作规则以仓库根目录 `../AGENTS.md` / `../CLAUDE.md` 为准；本文件为工程内副本。

## Source of Truth

按以下顺序解决冲突：

1. 用户当前明确授权。
2. 定版 PRD 决策层：`../最终版的文字需求/定版决策收口记录.md`。
3. 定版 PRD 文字层与分页面拆分层。
4. `AGENTS.md` 的项目硬约束。
5. `PRODUCT.md`（须与决策层收敛；未回写处以决策层为准）。
6. `DESIGN.md` 的 Token、组件和交互规则。
7. 当前 `./` 实现。
8. 过渡文档与对照材料；历史 XMind 与旧演示路径不再是需求源。

大纲/页面 md 中的残留旧句以决策层覆盖。若定版 PRD 与旧文档冲突，先更新相关文档，再收敛代码。

## Before Editing

1. 确认任务落在 `./`，不是仓库根目录 HTML demo。
2. 先读决策层本期/二期边界，再读对应最终版页面与截图。
3. 阅读相关页面、`uni.scss` 和至少一个可复用的 `Xsa*` 组件。
4. 判断需求是否符合认真婚恋、双重认证、双向同意、隐私保护和决策层付费边界。
5. 涉及产品范围、设计 Token、架构或规则时，先更新对应文档。
6. 代码库问题优先使用 Graphify 获取范围，再阅读源文件验证。
7. 检查 Git 工作区，保留用户已有改动，不覆盖无关文件。

## Development Commands

当前可直接执行的结构检查：

```bash
cd .
npm install
node tests/test-mock-system.js
```

`package.json` 保留 `npm run dev:h5`、`npm run build:h5`、`npm run dev:mp-weixin`、`npm run build:mp-weixin`，但截至 2026-07-22，当前根目录式 `.uvue` / `.uts` 工程尚未通过 npm CLI：默认输入目录是 `src/`，手动改为根目录后仍会在 `App.uvue` 解析阶段失败。端侧编译优先用 HBuilderX，并把实际结果写入报告；不要移动 `manifest.json` / `pages.json` 或批量改写源码来隐藏问题。

- H5 用于快速验证结构、交互和接口状态。
- 微信小程序是关键路径验收端；H5 通过不能替代小程序回归。
- 不安装新依赖，除非现有技术栈无法合理实现且用户已确认用途。
- 不擅自更新大版本依赖，不删除已有依赖。

## Architecture

```text
./
├─ pages/          页面；五个一级 Tab 与二级业务页
├─ components/     Xsa* 基础组件与业务组件
├─ api/            API 封装、请求适配与环境配置
├─ mock/           开发阶段假数据
├─ utils/          跨页面工具函数
├─ static/         静态资源
├─ uni.scss        全局设计 Token 与工具类
├─ pages.json      路由与 Tab（受保护）
├─ manifest.json   UniApp 应用配置（受保护）
└─ uniCloud-aliyun/ 后端资源（受保护）
```

### Protected Files
未经用户针对本次任务明确确认，不修改：

- `manifest.json`
- `pages.json`
- `uniCloud-aliyun/`
- `PRODUCT.md`、`DESIGN.md`、`AGENTS.md` 的核心规则

用户明确点名要求修改上述文档或配置时，才视为本次授权；修改仍要说明影响并做一致性校验。

## Product Rules

### 必须保持

- 首页围绕“故事 → 信任 → 行动”，不是快速滑动匹配。
- 四类认证：实名、学历、头像、单身；状态必须真实、明确、可解释。
- 双方同意后才开启聊天；会员不能绕过同意机制。
- 申请认识前展示规则、剩余次数、拒绝规则、隐私提示和附言入口。
- 举报、拉黑、安全提示和个人数据删除路径易于触达。
- 会员权益、金额、周期、续费和限制透明，不默认连续包月。
- AI 合拍度只做参考和破冰建议，不承诺结果。

### 禁止引入

- Tinder 式左右滑动、颜值榜、娱乐化陪聊或低俗内容。
- 未同意前私信、联系方式泄露、自动代发申请或自动同意。
- 虚假认证、弱化认证、用会员购买认证结果。
- 虚假倒计时、模糊价格、隐藏续费或以焦虑推动转化。

## Design Rules

### Canonical Tokens

从 `uni.scss` 与 `App.uvue` 的 `page` 复用（运行时为 hex/rgba，语义名不变）：

- 背景：`--canvas`、`--paper`、`--surface`、`--warm`
- 文本：`--ink`、`--ink2`、`--muted`
- 边界：`--line`
- 强调：`--accent`、`--accent2`、`--soft`
- 功能：`--brown`、`--navy`、`--sage`、`--sage-soft`
- 字体：`--serif`、`--sans`
- 阴影：`--shadow-sm`、`--shadow-md`、`--shadow-lg`

全局变量必须注入会进入微信 `app.wxss` 的 `App.uvue` `page { ... }`，并与 `uni.scss` 对齐。业务只写 `var(--token)`，禁止 `oklch()` 与页面散落字面色。需要新颜色时，先说明语义缺口并更新 `DESIGN.md`、`App.uvue` 与 `uni.scss`。

### Visual Language

- 冷瓷白背景 + 青瓷绿强调，克制、安静、可信。
- 标题和人物叙事使用宋体系；正文、按钮和表单使用无衬线体。
- 内容左右内边距通常 16px，间距以 8px 为主网格。
- 标准卡片 12—16px 圆角；人物照片允许既有非对称圆角。不要把 24px+ 圆角铺到所有卡片。
- 使用 rgba 柔和阴影（`var(--shadow-*)`）；普通卡片优先边界或轻阴影二选一。
- 动效 0.18s—0.22s，按压可 `scale(0.98)`；不能依赖 hover 或动画完成后才显示内容。

### Component Priority

新增控件前先查：

- `XsaButton`
- `XsaCard`
- `XsaInput`
- `XsaTag`
- `XsaTabs`
- `XsaSheet`
- `XsaModal`
- `XsaToast`
- `XsaEmpty`
- `XsaUserCard`
- `XsaDynamicCard`
- `XsaMessageItem`
- `XsaPhotoGrid`

如果现有组件只差一个可复用变体，扩展组件而不是复制一套页面私有样式。扩展不能破坏小程序兼容性。

## UniApp Constraints

- 使用 `view`、`text`、`image`、`scroll-view`、`button`、`input` 等跨端标签。
- 使用 `uni.navigateTo`、`uni.switchTab`、`uni.showToast` 等 UniApp API。
- 不使用 `window`、`document`、DOM 查询、浏览器专属 Popover / Dialog API。
- 样式优先使用 flex、rpx / 跨端安全的 px、固定栏安全区和可滚动容器。
- 图片优先 WebP，必要时提供 JPEG 降级；列表图片懒加载，避免主包放入大资源。
- H5 的 `:hover` 只能增强表现，不能承载必要反馈。

## Implementation Quality

### 页面与状态

每个页面至少考虑：加载中、空状态、错误、无权限、操作成功和重复提交。重要操作必须防止重复点击；接口错误不能只记录日志，要给用户可理解的下一步。

### 文案

使用真诚、平等、具体的中文。优先说明“发生了什么、为什么、接下来能做什么”。禁止“马上脱单”“命中注定”“最后机会”等夸大和焦虑文案。

### Accessibility

- 可点击区域建议至少 44px。
- 文本与背景保持足够对比度，`--muted` 不承载核心说明。
- 图片提供合适说明；图标按钮提供可理解的标签。
- 焦点态、禁用态、错误态不能只靠颜色区分。

## Validation

提交或报告完成前至少执行当前可用的验证：

```bash
cd .
node tests/test-mock-system.js
```

端侧编译优先使用 HBuilderX；若尝试 npm CLI，必须保留并报告第一条失败，不得声称构建通过。若项目存在额外检查，再运行相应 type-check / lint。还需人工检查：

- 320px、375 / 390px、428px 宽度下无溢出。
- 固定顶部栏、底部 Tab 和操作栏不遮挡内容。
- 首页申请认识主路径、认证展示、聊天门槛正常。
- H5 与微信小程序关键路径一致。
- `git diff --check` 无空白错误。

若因本机缺少微信开发者工具或依赖而无法验证，要明确说明未验证项，不得声称全部通过。

## Graphify

当 `../graphify-out/graph.json` 存在时：

- 代码库问题先运行 `graphify query "<question>"`。
- 关系问题使用 `graphify path "<A>" "<B>"`。
- 聚焦概念使用 `graphify explain "<concept>"`。
- `../graphify-out/wiki/index.md` 存在时，用它做宽范围导航。
- 只有宽泛架构审查或查询结果不足时才读 `GRAPH_REPORT.md`。
- 修改代码或重要项目文档后运行 `graphify update .`，保持图谱同步。

Graphify 只帮助定位范围；最终结论必须回到源文件核对。




