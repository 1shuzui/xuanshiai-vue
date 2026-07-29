---
name: 宣誓爱
description: 以故事、可信档案和清晰行动为骨架的认真婚恋 UniApp 视觉系统。
colors:
  canvas: "#F4F8F7"
  paper: "#FAFCFC"
  surface: "#FFFFFF"
  warm: "#E7ECEC"
  ink: "#0C1313"
  ink2: "#42494A"
  muted: "#7B8282"
  line: "#D3D9D8"
  accent: "#38988D"
  accent2: "#007565"
  soft: "#79B1A9"
  brown: "#2C807C"
  navy: "#18415D"
  sage: "#338D6B"
  sage-soft: "#C2E0CF"
  like: "#E85A6B"
  like-bg: "rgba(232, 90, 107, 0.12)"
  text-invert: "#FCFCFC"
  overlays:
    surface: "rgba(250, 252, 252, 0.96)"
    image: "linear-gradient(180deg, rgba(17, 23, 24, 0.20) 0%, rgba(17, 23, 24, 0.78) 100%)"
    imageHero: "linear-gradient(180deg, rgba(17, 23, 24, 0.25) 0%, rgba(17, 23, 24, 0.82) 100%)"
    imageText: "rgba(231, 236, 236, 0.75)"
    imageTextMuted: "rgba(231, 236, 236, 0.72)"
    imageTextStrong: "rgba(231, 236, 236, 0.88)"
    imageSurface: "rgba(250, 252, 252, 0.10)"
    imageLine: "rgba(231, 236, 236, 0.16)"
typography:
  display:
    fontFamily: "ui-serif, Songti SC, STSong, Noto Serif SC, serif"
    fontSize: "clamp(2rem, 8vw, 4rem)"
    fontWeight: 600
    lineHeight: 1.08
    letterSpacing: "-0.03em"
  heading:
    fontFamily: "ui-serif, Songti SC, STSong, Noto Serif SC, serif"
    fontSize: "22px"
    fontWeight: 700
    lineHeight: 1.35
    letterSpacing: "normal"
  body:
    fontFamily: "Inter, PingFang SC, Microsoft YaHei, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  label:
    fontFamily: "Inter, PingFang SC, Microsoft YaHei, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 700
    lineHeight: 1.45
    letterSpacing: "0.02em"
rounded:
  xs: "4px"
  sm: "6px"
  control: "8px"
  input: "9px"
  md: "12px"
  lg: "16px"
  pill: "999px"
spacing:
  hairline: "1px"
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  xxl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.brown}"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "0 18px"
    height: "50px"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "0 13px"
    height: "44px"
  story-card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "16px"
  trust-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "13px"
---

## Overview

宣誓爱是一款以移动端小程序为第一目标的认真婚恋产品。视觉设计不是装饰层，而是帮助用户完成三件事：先通过**真实故事**产生理解，再通过**可信档案**降低不确定性，最后用**清晰行动**表达喜欢、申请认识或暂不继续。

当前实现的视觉真相来自两处：

1. `uni.scss`：UniApp 的全局 Token 与通用工具类，是开发时的首要来源。
2. `../design-demos/final/index.html` + `styles.css`：390 × 844 的交互原型，用于校准首页节奏、故事阅读顺序、Sheet / Modal 形态和动作文案；它是参考，不是继续维护的 HTML 产品。

**场景句：** 用户在通勤、午休或夜间的手机屏幕前，用 15—30 分钟认真阅读一个人的生活片段，在决定申请认识前，希望界面安静、可信、没有被催促的感觉。

设计关键词：冷瓷白、青瓷绿、宋体叙事、清晰分层、轻量边界、非对称人物卡片、克制的安全感。

## Colors

### 核心色板

> **运行时约定（2026-07-22 方案 A）**  
> Token **语义名**不变；**运行时色值**统一为 hex / rgba，保证微信小程序、H5、APP 同一套颜色。  
> 全局注入点：`App.uvue` 的 `page { --token: ... }`（会进入微信 `app.wxss`），并与 `uni.scss` 保持一致。  
> 业务代码继续写 `var(--token)`，不要在页面散落字面色值；不要再写 `oklch()`。

| Token | 运行时值（hex/rgba） | 用途 |
|---|---|---|
| `--canvas` | `#F4F8F7` | 页面底色、滚动区域背景 |
| `--paper` | `#FAFCFC` | 顶部栏、Sheet 内衬、轻背景 |
| `--surface` | `#FFFFFF` | 卡片、输入框、按钮表面 |
| `--warm` | `#E7ECEC` | 提示块、媒体占位、筛选提示 |
| `--ink` | `#0C1313` | 主标题、正文重点、核心数字 |
| `--ink2` | `#42494A` | 次级正文、叙事内容 |
| `--muted` | `#7B8282` | 辅助说明、时间、状态描述 |
| `--line` | `#D3D9D8` | 分割线、浅边界 |
| `--accent` | `#38988D` | 青瓷绿主强调、选中态、进度填充 |
| `--accent2` | `#007565` | 主强调文字、可读的深色强调 |
| `--soft` | `#79B1A9` | 强调背景、播放按钮、徽章底色 |
| `--brown` | `#2C807C` | 语音卡片、行动色块等高权重表面 |
| `--navy` | `#18415D` | AI / 专业服务等深色功能卡片 |
| `--sage` | `#338D6B` | 在线、已认证、成功提示 |
| `--sage-soft` | `#C2E0CF` | 安全提示、认证背景 |
| `--text-invert` | `#FCFCFC` | 深色表面上的反白文字 |
| `--bg-hover` | `#E7ECEC` | 轻悬停 / 次级底 |
| `--bg-subtle` | `#DCE3E2` | 更浅的分区底 |
| `--accent-bg` | `#C3DEDA` | 强调浅底 |
| `--accent-glow` | `rgba(56, 152, 141, 0.15)` | 强调光晕 / 弱高亮 |

### 使用规则

- 颜色通过 `var(--token)` 使用，不在页面中复制色值。新增语义颜色前，先判断能否由现有 Token 表达；确有必要时先更新本文档与 `uni.scss`。
- 主色采用**低饱和青瓷绿**，强调信任和行动，不使用婚庆红金、荧光色或高饱和冷蓝。
- 大面积保持 `--canvas` / `--paper` 的冷瓷白；`--accent` 只承担关键状态和决策动作，不铺满所有区域。
- 文本优先使用 `--ink`、`--ink2`，`--muted` 只用于辅助信息，不承载必须阅读的正文。
- `--surface` 是代码中的表面白，不应在页面里直接写 `#fff`；同理不得直接写 `#000`。
- 认证成功与在线状态使用 `--sage` 系列；AI 结果必须同时展示“仅供参考”说明，不能用颜色暗示确定性结果。

### 对比度与状态

正文和关键操作必须保持可读对比度；占位文本、禁用态、错误说明也要有足够辨识度。焦点态使用青瓷绿描边：`outline: 3px solid rgba(56, 152, 141, 0.45)`，并保留 `outline-offset: 2px`。错误状态沿用现有组件行为，但新代码不应继续散落硬编码颜色；需要统一错误 Token 时先走设计评审。

## 图片与浮层 Token

图片 Hero、渐变浮层、半透明底栏与阴影统一使用 uni.scss 的 --surface-overlay、--image-*、--shadow-overlay 等语义 Token，页面不得散落新的 rgba 值。

## Typography

### 字体角色

- `--serif`：`ui-serif, "Songti SC", "STSong", "Noto Serif SC", serif`。用于人物姓名、故事标题、关系期待、重要确认标题，传达阅读感与承诺感。
- `--sans`：`Inter, "PingFang SC", "Microsoft YaHei", system-ui, sans-serif`。用于正文、标签、按钮、时间、表单与系统信息，保证小字号清晰。

### 层级

- 页面 / Sheet 标题：20—22px，宋体，700。
- 人物姓名：22—25px，宋体，700；不要额外堆叠大号装饰字。
- 段落正文：13—15px，`1.6—1.8` 行高；故事段落优先 `--serif`。
- 标签、按钮、状态：9—13px，`--sans`，通常 700—800。
- 辅助说明：11—12px，颜色使用 `--muted`，不能代替核心说明。

标题可使用轻微负字距（建议不低于 `-0.04em`），禁止让中文笔画挤压或溢出。长标题使用自然换行，移动端不以强制单行换行换取“整齐”。

### 父母端可访问性变体

父母端在页面根节点启用局部大字号变体，不修改 `uni.scss` 或普通用户页面：页面标题 22px、卡片标题 20px、正文 16px、辅助文字 14px；按钮、列表项、Tab 和图标操作的触控目标不小于 48px。行高保持至少 1.45，长文案允许自然换行，不能用缩小字号维持单行。

复用组件通过 `largeText` / `large-text` 变体放大内部标题、正文、状态、空态和反馈文案。父母端的消息、申请、Sheet、Toast、红娘卡片与底部导航必须完整传递该变体，不能只放大页面外层标题。所有颜色和字体仍使用现有 Token，不建立第二套父母端色板。

## Elevation

阴影表达层级，不制造漂浮的营销感。全局工具类是首选：

```css
.shadow-sm { box-shadow: var(--shadow-sm); } /* 0 2px 12px rgba(17, 23, 24, 0.04) */
.shadow-md { box-shadow: var(--shadow-md); } /* 0 4px 16px rgba(17, 23, 24, 0.08) */
.shadow-lg { box-shadow: var(--shadow-lg); } /* 0 8px 24px rgba(17, 23, 24, 0.10) */
```

- 普通卡片：优先使用 `shadow-sm`，或仅使用 `1px solid var(--line)`；不要同时叠加重边框和大阴影。
- Sheet / Modal：可以使用 `shadow-md` 或 `shadow-lg`，同时依靠遮罩和位置表达层级。
- 首页人物图、语音卡片、深色功能卡片主要靠色块、裁切和间距建立层级，不靠阴影堆效果。
- 不使用纯黑阴影、发光渐变、装饰性玻璃拟态。阴影模糊半径通常不超过 24px。

## Components

### Story / 人物首屏

首页推荐的核心顺序是：人物照片 → 基础资料与认证 → 自我介绍 → 声音 / 生活切片 → 关系期待 → 合拍度参考 → 动作栏。照片卡片采用 `8px 26px 8px 8px` 的非对称圆角作为品牌识别；这个形态只用于人物 / 特色媒体，不扩散到所有卡片。

### Cards / 信任档案

- 标准卡片：`--surface`、`12px` 圆角、`13—16px` 内边距，内容分区用 `--line`。
- 用户卡片：头像区域保持清晰裁切，认证使用圆形徽章或 `XsaTag`，信息不叠加过多标签。
- 特色卡片：可使用 `--navy` 或 `--brown`，必须保留明确标题与正文，不做纯装饰渐变。
- 列表页优先使用真实内容的纵向节奏，不把每一段都包装成相同大小的“图标 + 卡片”。

### Buttons / Actions

- 主按钮用于“申请认识”“确认”“开始聊天”等不可逆或高价值行动；默认 `44—50px` 高度、`8—10px` 圆角。
- 次按钮用于筛选、查看档案、跳过等并列动作；白色表面 + `--line` 边界。
- 文字按钮用于低权重辅助操作；不可伪装成主要 CTA。
- 申请认识必须先经过说明 / 附言 / 安全提示，再确认提交；拒绝不会扣除次数的产品承诺要在相关界面可见。

### Tabs / Navigation

- 一级导航固定为 **首页、牵线、社区、消息、我的**（定版顺序）；路由由 `pages.json` 管理。修改顺序前须与决策层 / PRODUCT 一致并获确认。
- 父母角色使用单页内的 **首页、牵线、消息、我的** 四面板和自定义底部导航；它不替换、不重排普通用户原生五 Tab，也不展示社区或情感实验室。
- 页面内 Tab 使用胶囊或底部线条两种既有变体；选中态使用 `--accent`，未选中使用 `--muted`。
- 底部 Tab、页面顶部栏和内容滚动区要有清晰层级，避免内容被固定栏遮挡。

### Inputs / Tags / Feedback

- 输入框高度约 44px，`9px` 圆角，`--surface` 背景和 `--line` 边框；聚焦时使用统一青瓷绿 outline。
- 标签使用 `XsaTag`；筛选项采用 `choice-chip`，选中时 `--soft` + `--accent` 边界。
- Sheet 用于筛选、完整档案和 AI 解读等可回看内容；Modal 用于申请确认、成功、双方同意等需要明确决策的场景。
- 空状态必须说明发生了什么，并给出可选下一步；Toast 只提示结果，不承载完整业务说明。

### Layout / Responsive / Motion

- 小程序优先，覆盖 320px—428px；内容左右内边距通常 16px，页面底部为固定操作栏预留空间。
- 父母端在 320px、375px、390px、428px 下必须保持 48px 触控目标、四栏底部导航和 16px 正文；空间不足时让信息与动作换行，不压缩字号或遮挡底部安全区。
- 使用 `view` / `text` / `scroll-view` / `image` 和 UniApp API；不得依赖 `window`、`document` 或 DOM 操作。
- 间距以 8px 为主网格，但允许 4px、6px、10px、12px、13px 等用于控件细调；先复用既有 Token，再局部调整。
- 动效以 `0.18s—0.22s` 为主，采用 ease-out；按压可 `scale(0.98)`，悬浮仅用于 H5，不依赖 hover 完成功能。尊重减少动效偏好，不能让内容只在动画完成后才出现。

## Do's and Don'ts

### Do

- 先讲清一个人的生活，再展示认证与关系期待，最后给行动。
- 使用 `XsaButton`、`XsaCard`、`XsaInput`、`XsaTag`、`XsaSheet`、`XsaModal` 等已有组件。
- 让安全提示、认证状态、申请门槛和付费权益在决策点附近出现。
- 用真实图片、真实内容结构和清晰的空 / 加载 / 错误状态建立信任。
- 让 H5 与微信小程序共享同一套 Token，关键路径在微信开发者工具回归。

### Don't

- 不做左右快速滑动匹配，不把首页写成 Tinder 式卡片堆。
- 不在双方同意前开放即时聊天，不展示联系方式，不弱化举报与隐私控制。
- 不新增未经评审的颜色、字体、渐变、超大圆角、纯黑 / 纯白字面色值或装饰性玻璃卡片。
- 不把 `../design-demos/final/` 当作继续维护的 HTML 生产入口，不新建根目录 `demo*.html`。
- 不使用带颜色的粗 `border-left` / `border-right` 作为卡片装饰，不使用渐变文字、重复网格背景或无意义的编号眉题。
- 不用“限时优惠”“马上脱单”等催促或夸大结果的文案；认真关系需要可核验、可撤回、可理解。
