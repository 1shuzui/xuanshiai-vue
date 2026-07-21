# 宣誓爱 — 前端设计规范

> **版本：** 1.0.0  
> **提取自：** `design-demos/final/styles.css` 高保真原型  
> **更新日期：** 2026-07-20  
> **适用范围：** 宣誓爱小程序所有前端页面、组件与交互

---

## 一、色彩体系

### 1.1 核心色板（OKLCH 色彩空间）

宣誓爱采用 **OKLCH 色彩空间**，确保在不同屏幕下色彩感知一致。所有颜色必须使用 `oklch()` 格式定义。

```css
/* 基底色（背景与表面） */
--canvas: oklch(0.947 0.018 68);      /* 奶油米画布 */
--paper: oklch(0.982 0.012 72);       /* 杏白纸张 */
--surface: oklch(0.994 0.008 72);     /* 浅燕麦表面 */
--warm: oklch(0.956 0.028 61);        /* 暖色调辅助背景 */

/* 文字色（深暖棕体系） */
--ink: oklch(0.292 0.033 43);         /* 主文字色（禁用纯黑） */
--ink2: oklch(0.43 0.035 46);         /* 次级文字色 */
--muted: oklch(0.58 0.025 52);        /* 辅助说明文字 */

/* 分割与边框 */
--line: oklch(0.87 0.022 63);         /* 极细暖灰线条 */

/* 主色（蜜桃暖橙） */
--accent: oklch(0.637 0.159 42);      /* 主色：按钮、选中态、CTA */
--accent2: oklch(0.548 0.152 38);     /* 主色深色变体：hover、强调 */
--soft: oklch(0.91 0.052 47);         /* 主色浅色变体：软底、标签 */

/* 功能色 */
--brown: oklch(0.36 0.055 38);        /* 深暖棕：强调按钮、匹配成功 */
--navy: oklch(0.36 0.067 242);        /* 深暖蓝：AI 功能、深色面板 */
--sage: oklch(0.62 0.102 153);        /* 暖绿：在线状态、成功提示 */
--sage-soft: oklch(0.93 0.035 151);   /* 暖绿浅底 */
```

### 1.2 色彩使用规则

| 元素 | 颜色变量 | 说明 |
|------|----------|------|
| 页面背景 | `--canvas` | 奶油米，降低视觉刺激 |
| 卡片背景 | `--surface` / `--paper` | 浅燕麦表面或杏白纸张 |
| 主按钮 | `--accent` / `--brown` | 蜜桃暖橙（通用）或深暖棕（强调） |
| 主文字 | `--ink` | 深暖棕，**禁用 `#000` 纯黑** |
| 次级文字 | `--ink2` | 中暖灰 |
| 辅助说明 | `--muted` | 浅暖灰 |
| 边框分割线 | `--line` | 极细暖灰 |
| 选中态 | `--accent` | 蜜桃暖橙 |
| 在线状态 | `--sage` | 暖绿小圆点 |
| AI 功能 | `--navy` | 深暖蓝背景 |

### 1.3 色彩禁区

❌ **禁止使用：**
- 纯黑 `#000` 和纯白 `#fff`
- 高饱和冷色（亮蓝、荧光绿、紫色）
- 生硬撞色组合
- 婚庆俗艳红金色（`#ff0000`, `#ffd700`）

✅ **正确做法：**
- 所有中性色带暖色倾向（chroma 0.005—0.03）
- 色彩过渡使用柔和渐变
- 装饰色低透明度使用（0.1—0.3）

---

## 二、字体排印

### 2.1 字体栈

```css
/* 衬线字体（标题、重要文案） */
--serif: ui-serif, "Songti SC", "STSong", "Noto Serif SC", serif;

/* 无衬线字体（正文、UI 控件） */
--sans: Inter, "PingFang SC", "Microsoft YaHei", system-ui, sans-serif;
```

### 2.2 字号与行高

| 用途 | 字号 | 行高 | 字重 | 字体 |
|------|------|------|------|------|
| 大标题（H1） | 64px | 1.08 | 600 | `--serif` |
| 页面标题（H2） | 20—25px | 1.2 | 700 | `--serif` |
| 卡片标题（H3） | 16—22px | 1.2 | 700 | `--serif` |
| 正文 | 13—15px | 1.6—1.9 | 300—500 | `--sans` |
| 辅助说明 | 11—12px | 1.55 | 400—500 | `--sans` |
| 微型文字 | 9—10px | 1.4 | 400—800 | `--sans` |
| 按钮文字 | 12—13px | 1 | 700—800 | `--sans` |

### 2.3 排版规则

- **标题：** 使用衬线字体 `--serif`，负 letter-spacing（-0.05em）
- **正文：** 使用无衬线字体 `--sans`，行高 1.6—1.9
- **按钮/标签：** 使用无衬线字体，字重 700—800，letter-spacing 0.08—0.14em
- **最小可读字号：** 正文 ≥ 12px，标签 ≥ 9px

❌ **禁止：**
- 正文使用衬线字体（除引用块外）
- 标题使用过细字重（< 500）
- 按钮文字使用衬线字体

---

## 三、间距体系

### 3.1 基础间距单位

采用 **8px 基础网格**：

```
4px   → 微间距（图标与文字、标签内边距）
8px   → 最小间距（控件内元素）
12px  → 小间距（标签、徽章、小卡片）
16px  → 标准间距（页面左右 padding、卡片内边距）
18px  → 中间距（卡片间距、模块分隔）
24px  → 大间距（区域分隔）
32px  → 超大间距（页面顶部、底部）
```

### 3.2 常见组件间距

| 组件 | Padding | Margin | Gap |
|------|---------|--------|-----|
| 卡片 | 13—18px | 10—18px | — |
| 按钮 | 0 11—13px（横向） | 8—12px | — |
| 列表项 | 12—16px | 0 | — |
| 表单输入框 | 0 11—12px | 8—12px | — |
| 页面容器 | 14—18px | — | — |
| 栅格布局 | — | — | 8—10px |

### 3.3 留白原则

- ✅ 页面四周预留 14—18px 边距
- ✅ 模块间充足间距（18—24px）
- ✅ 避免元素拥挤，宁多勿少
- ❌ 禁止所有元素紧贴边缘

---

## 四、圆角体系

### 4.1 圆角等级

```css
/* 微圆角 */
4px   → 徽章、标签
6px   → 小按钮、输入框标签
7px   → 中型按钮
8px   → 卡片次要元素、图片

/* 标准圆角 */
9—10px  → 输入框、中型卡片
12px    → 大卡片、面板
14px    → 底部操作栏

/* 大圆角（消解尖锐感） */
16px    → AI 悬浮按钮
18—24px → Sheet 弹窗
26—28px → App 外壳、Hero 图片

/* 胶囊圆角（pill） */
50% / 999px → Tab 切换器、标签按钮、进度条轨道
```

### 4.2 圆角使用规则

| 元素 | 圆角值 | 说明 |
|------|--------|------|
| 按钮（小） | 7—9px | 轻微圆角 |
| 按钮（大/CTA） | 9—10px | 标准圆角 |
| 卡片 | 10—12px | 标准卡片 |
| 弹窗 | 18—24px | 大圆角 |
| 胶囊按钮 | 999px | 完全圆形端点 |
| 头像 | 50% | 圆形 |
| 输入框 | 9—10px | 标准圆角 |
| 图片 | 8—12px | 根据上下文调整 |

❌ **禁止：**
- 小按钮使用过大圆角（> 12px）
- 同一界面使用过多不同圆角值（≤ 4 种）
- 矩形卡片使用 50% 圆角

---

## 五、阴影体系

### 5.1 阴影等级（柔和暖色投影）

```css
/* 微阴影 */
box-shadow: 0 2px 8px oklch(0.35 0.03 45 / 0.06);

/* 标准阴影 */
box-shadow: 0 4px 16px oklch(0.35 0.03 45 / 0.08);

/* 大阴影 */
box-shadow: 0 8px 24px oklch(0.35 0.04 45 / 0.12);

/* 悬浮阴影 */
box-shadow: 0 10px 24px oklch(0.3 0.05 240 / 0.24);

/* 设备外壳阴影 */
box-shadow: 0 24px 70px oklch(0.3 0.03 40 / 0.16);
```

### 5.2 阴影使用规则

| 元素 | 阴影类型 | 何时使用 |
|------|----------|----------|
| 卡片 | 微阴影 | 默认状态 |
| 按钮 | 微阴影 | Hover 状态 |
| 悬浮按钮 | 悬浮阴影 | 固定定位元素 |
| 弹窗 | 大阴影 | Modal / Sheet |
| Toast | 标准阴影 | 临时提示 |

### 5.3 阴影禁区

❌ **禁止：**
- 使用纯黑阴影（必须带暖色倾向）
- 阴影透明度过高（> 0.3）
- 多层叠加阴影（除特殊设计外）
- 内阴影（inset）用于装饰

---

## 六、组件设计规范

### 6.1 按钮

#### 主按钮（Primary）
```css
background: var(--brown);
color: var(--paper);
height: 44—50px;
padding: 0 13—18px;
border-radius: 9—10px;
font-size: 13px;
font-weight: 800;
```

#### 次要按钮（Secondary）
```css
background: var(--surface);
border: 1px solid var(--line);
color: var(--ink);
```

#### 胶囊按钮（Pill）
```css
border-radius: 999px;
padding: 10px 12px;
```

#### Hover 状态
```css
border-color: var(--accent);
color: var(--accent2);
transform: translateY(-1px);
transition: 0.18s;
```

### 6.2 卡片

#### 标准卡片
```css
background: var(--surface);
border: 1px solid var(--line);
border-radius: 10—12px;
padding: 13—18px;
box-shadow: 0 2px 8px oklch(0.35 0.03 45 / 0.06);
```

#### Hero 卡片（人物照片）
```css
border-radius: 8px 26px 8px 8px; /* 不对称圆角 */
height: 304px;
overflow: hidden;
```

#### 功能卡片（Feature）
```css
background: var(--navy);
color: var(--paper);
border-radius: 12px 28px 12px 12px;
padding: 18px;
```

### 6.3 输入框

```css
height: 44—46px;
border: 1px solid var(--line);
background: var(--surface);
border-radius: 9—10px;
padding: 0 11—12px;
font-size: 12—13px;
color: var(--ink);
```

**Focus 状态：**
```css
outline: 3px solid oklch(0.72 0.13 49 / 0.45);
outline-offset: 2px;
```

### 6.4 标签（Tag / Badge）

```css
padding: 5—7px 8—9px;
border: 1px solid var(--line);
border-radius: 6—7px;
background: var(--surface);
font-size: 11px;
color: var(--ink2);
```

**强调标签：**
```css
background: var(--soft);
border-color: var(--accent);
color: var(--accent2);
font-weight: 800;
```

### 6.5 徽章（Badge / Pill）

```css
min-width: 17—20px;
height: 17—20px;
border-radius: 50%;
background: var(--accent);
color: var(--paper);
font-size: 9px;
font-weight: 800;
padding: 0 4px;
```

### 6.6 进度条

```css
height: 6—7px;
background: oklch(0.94 0.03 50 / 0.22);
border-radius: 4px;
overflow: hidden;
```

**填充条：**
```css
height: 100%;
background: var(--soft);
border-radius: 4px;
```

### 6.7 分割线

```css
border-bottom: 1px solid var(--line);
```

❌ 禁止使用纯色 `#ddd` 或 `#ccc` 分割线

---

## 七、布局规范

### 7.1 全局布局

```
App 容器：390px × 844px（iPhone 尺寸参考）
顶部导航栏：74px
底部 Tab 栏：68px
内容区域：844px - 74px - 68px = 702px
```

### 7.2 页面结构

```html
<div class="app">
  <header class="app-header">...</header>
  <div class="screens">
    <div class="screen active">
      <div class="scroller">
        <!-- 可滚动内容 -->
      </div>
    </div>
  </div>
  <div class="action-dock">...</div>
  <div class="tabbar">...</div>
</div>
```

### 7.3 栅格布局

**双列网格（广场模式）：**
```css
display: grid;
grid-template-columns: 1fr 1fr;
gap: 10px;
```

**三列网格（小图标）：**
```css
grid-template-columns: repeat(3, 1fr);
gap: 8—12px;
```

**四列网格（认证图标）：**
```css
grid-template-columns: repeat(4, 1fr);
```

### 7.4 Flexbox 规则

- ✅ 优先使用 `gap` 而非 `margin` 控制间距
- ✅ 对齐方式明确：`align-items: center` / `justify-content: space-between`
- ❌ 避免嵌套超过 3 层 Flexbox

---

## 八、交互与动效

### 8.1 过渡时长

```css
/* 快速反馈 */
transition: 0.18s;  /* 按钮 hover、标签选中 */

/* 标准过渡 */
transition: 0.22—0.25s;  /* 弹窗、Toast、面板 */

/* 舒缓过渡 */
transition: 0.28s cubic-bezier(0.2, 0.75, 0.25, 1);  /* Sheet 滑入 */
```

### 8.2 缓动函数

| 用途 | 缓动函数 |
|------|----------|
| 按钮 Hover | `ease-out` 或默认 |
| 弹窗出现 | `cubic-bezier(0.2, 0.75, 0.25, 1)` |
| 滑动面板 | `cubic-bezier(0.2, 0.75, 0.25, 1)` |
| 页面切换 | `ease-in-out` |

### 8.3 交互状态

#### Hover 状态
```css
transform: translateY(-1—-2px);
border-color: var(--accent);
color: var(--accent2);
```

#### Active 状态（选中）
```css
background: var(--soft);
border-color: var(--accent);
color: var(--accent2);
font-weight: 800;
```

#### Disabled 状态
```css
opacity: 0.4;
cursor: not-allowed;
pointer-events: none;
```

#### Focus 状态
```css
outline: 3px solid oklch(0.72 0.13 49 / 0.45);
outline-offset: 2px;
```

### 8.4 加载态

**骨架屏：**
```css
background: var(--warm);
animation: pulse 1.5s ease-in-out infinite;
```

**淡入动画：**
```css
opacity: 0;
animation: fadeIn 0.3s forwards;
```

---

## 九、响应式设计

### 9.1 断点

```css
/* 移动端（默认） */
@media (max-width: 760px) {
  /* UniApp 小程序、移动浏览器 */
}

/* 桌面端（原型展示用） */
@media (min-width: 761px) {
  /* 浏览器开发模式 */
  .stage {
    width: 1440px;
    height: 900px;
  }
}
```

### 9.2 移动端适配

- ✅ 所有尺寸使用 `px`（UniApp 会自动转换为 `rpx`）
- ✅ 触摸目标最小尺寸 44px × 44px
- ✅ 文字最小 12px（iOS）/ 10px（Android）
- ❌ 禁止使用固定宽度布局

---

## 十、无障碍设计（Accessibility）

### 10.1 对比度

- 正文文字对比度 ≥ 4.5:1
- 大文字（≥ 18px）对比度 ≥ 3:1
- UI 控件对比度 ≥ 3:1

### 10.2 语义化

```html
<!-- ✅ 正确 -->
<button aria-label="筛选">...</button>
<nav aria-label="主导航">...</nav>

<!-- ❌ 错误 -->
<div onclick="...">筛选</div>
```

### 10.3 键盘导航

- ✅ 所有交互元素可通过 Tab 键访问
- ✅ Focus 状态可见（outline）
- ✅ 弹窗可通过 Esc 键关闭

### 10.4 屏幕阅读器

```html
<div class="overlay" aria-hidden="true">...</div>
<button aria-pressed="false">喜欢</button>
```

---

## 十一、图片与媒体

### 11.1 图片规范

| 用途 | 尺寸 | 格式 | 压缩 |
|------|------|------|------|
| 用户头像 | 200×200px | WebP / JPEG | 80% |
| 大图卡片 | 750×1000px | WebP / JPEG | 75% |
| 缩略图 | 300×400px | WebP / JPEG | 70% |
| 图标 | SVG 矢量 | SVG | — |

### 11.2 图片加载

```css
img {
  object-fit: cover;
  object-position: center 35%; /* 人物照片上移 */
  filter: saturate(0.88) contrast(0.98); /* 柔和滤镜 */
}
```

### 11.3 占位与加载态

```html
<div class="skeleton">
  <!-- 骨架屏占位 -->
</div>
```

---

## 十二、设计 Token（CSS 变量汇总）

```css
:root {
  /* 色彩 */
  --canvas: oklch(0.947 0.018 68);
  --paper: oklch(0.982 0.012 72);
  --surface: oklch(0.994 0.008 72);
  --warm: oklch(0.956 0.028 61);
  --ink: oklch(0.292 0.033 43);
  --ink2: oklch(0.43 0.035 46);
  --muted: oklch(0.58 0.025 52);
  --line: oklch(0.87 0.022 63);
  --accent: oklch(0.637 0.159 42);
  --accent2: oklch(0.548 0.152 38);
  --soft: oklch(0.91 0.052 47);
  --brown: oklch(0.36 0.055 38);
  --navy: oklch(0.36 0.067 242);
  --sage: oklch(0.62 0.102 153);
  --sage-soft: oklch(0.93 0.035 151);
  
  /* 字体 */
  --serif: ui-serif, "Songti SC", "STSong", "Noto Serif SC", serif;
  --sans: Inter, "PingFang SC", "Microsoft YaHei", system-ui, sans-serif;
}
```

---

## 十三、设计禁区（Critical Constraints）

### ❌ 绝对禁止

1. **色彩禁区**
   - 纯黑 `#000` 或纯白 `#fff`
   - 高饱和冷色（亮蓝 `#0080ff`、荧光绿 `#00ff00`）
   - 婚庆红金（`#ff0000`, `#ffd700`）

2. **字体禁区**
   - 正文使用衬线字体（除引用外）
   - 按钮使用衬线字体
   - 文字小于 10px（除特殊标注）

3. **布局禁区**
   - 元素紧贴边缘（必须留 14—18px 边距）
   - 嵌套超过 5 层
   - 固定宽度布局（必须响应式）

4. **交互禁区**
   - 触摸目标小于 44×44px
   - 没有 Hover / Focus 状态
   - 动画时长超过 0.5s

5. **组件禁区**
   - 自定义非标准 UI 控件（除非必要）
   - 使用 `<div>` 模拟按钮（必须用 `<button>`）
   - 阴影使用纯黑色

---

## 十四、迁移到 UniApp 注意事项

### 14.1 标签替换

| HTML | UniApp |
|------|--------|
| `<div>` | `<view>` |
| `<span>` | `<text>` |
| `<img>` | `<image>` |
| `<a>` | `<navigator>` |
| `<input>` | `<input>` |
| `<button>` | `<button>` |

### 14.2 单位转换

- `px` → UniApp 自动转换为 `rpx`（750rpx = 375px）
- 保持原型中的 `px` 值，UniApp 编译时处理

### 14.3 样式限制

- ❌ UniApp 不支持 `backdrop-filter`（毛玻璃）
  - ✅ 替代方案：半透明背景 + 模糊图片
- ❌ 不支持伪类 `:before` / `:after` 动态内容
- ✅ 支持 Flexbox 和 Grid

---

**文档所有者：** 宣誓爱设计团队  
**最后审核：** 2026-07-20  
**下次审核：** 新增页面或组件时同步更新
