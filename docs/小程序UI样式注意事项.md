# 小程序 UI 与样式注意事项

## 1. 设计来源

- 规则来源：`../DESIGN.md`。
- 代码 Token：`../uni.scss`。
- 组件来源：`../components/Xsa*.uvue`。
- 外部 HTML Demo 只能用于视觉节奏参考，不能复制浏览器 DOM 技巧。

## 2. 标签与 API

| Web 思维 | UniApp 写法 |
|---|---|
| `div` | `view` |
| `span` / `p` | `text` |
| `img` | `image` |
| `a` | `navigator` 或 `uni.navigateTo` |
| 浏览器弹层 | `XsaModal` / `XsaSheet` |
| `window` / `document` | 使用 UniApp 生命周期与 API |

## 3. 样式规则

- 使用 `var(--canvas)`、`var(--paper)`、`var(--surface)`、`var(--ink)`、`var(--accent)` 等既有 Token。
- 标题使用 `var(--serif)`，正文使用 `var(--sans)`。
- 新页面圆角遵循 `DESIGN.md` 的 4px / 8px / 12px / 999px。
- 当前 `uni.scss` 的旧圆角工具类仍有 6px / 10px / 16px，属于待统一差异，不应继续扩散。
- 运行时 Token 为 hex/rgba（全端统一）；**不要**再写 `oklch()`。全局变量定义在 `App.uvue` 的 `page` 与 `uni.scss`。
- 阴影使用 `var(--shadow-sm|md|lg)` 或等价 `rgba(17, 23, 24, …)` 软阴影，不使用纯黑阴影。
- 不新增纯黑、纯白、高饱和亮蓝、婚庆红金等局部色值；业务色只通过 Token。
- 优先使用 flex、rpx、百分比和安全区，不依赖复杂选择器或 DOM 定位。
- 改 Token 后必须用 HBuilderX 重新编译到微信开发者工具；只刷新旧 `unpackage` 可能看不到全局变量。

## 4. 响应式与安全区

- 验证宽度：320px、375px/390px、428px。
- 底部固定操作区为 TabBar 和设备安全区留出空间。
- 输入页检查键盘弹起、滚动回弹和按钮遮挡。
- 图片明确设置尺寸与 `mode`；头像常用 `aspectFill`。

## 5. 组件优先

新增按钮、卡片、输入、标签、弹窗、Sheet、Toast、空态前，先检查现有 `Xsa*` 组件。只有现有组件不能表达已确认需求时才新增组件，并保证小程序端复用。

## 6. 交互与验收

- 关键触控区域尽量不小于 44px。
- 只靠颜色不能表达认证、错误或选中状态，同时提供文字或图标。
- 异步操作提供加载和结果反馈，避免重复提交。
- 微信开发者工具中可用，不只看 H5；无横向溢出、遮挡或图片变形。
