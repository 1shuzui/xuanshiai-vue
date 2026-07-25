# 宣誓爱项目 — CLAUDE.md

本文件是 xuanshiai-vue/ 的开发导航和运行入口。实现约束以 AGENTS.md 为准；产品与设计参考以 PRODUCT.md、DESIGN.md 为准；最终需求决策以 ../最终版的文字需求/定版决策收口记录.md 为准。

## 1. 项目目录

xuanshiai-vue/
├─ App.uvue、main.uts：应用入口。
├─ manifest.json、pages.json：受保护配置。
├─ pages/：页面。
├─ components/：Xsa* 复用组件。
├─ api/、mock/：接口边界和 Mock 数据。
├─ utils/：工具函数。
├─ static/：静态资源。
├─ docs/：运行说明、排障与项目文档。
├─ tests/：自动化检查。
├─ uni.scss：全局视觉 Token。
├─ PRODUCT.md、DESIGN.md：项目产品与设计参考。
└─ unpackage/：HBuilderX 生成产物。

## 2. 推荐阅读顺序

1. AGENTS.md：确认实现边界、保护文件和验证要求。
2. ../最终版的文字需求/定版决策收口记录.md：确认本期与二期、认证、安全和商业化决策。
3. 根目录 最终版的文字需求/ 内对应的页面文字、结构和截图材料。
4. 相关 pages/、components/、api/、mock/ 源码。
5. PRODUCT.md、DESIGN.md、uni.scss。
6. docs/HOW_TO_RUN.md 与 docs/TROUBLESHOOTING.md。

## 3. 微信小程序运行与刷新

- 使用 HBuilderX 运行 mp-weixin，并在微信开发者工具中打开 unpackage/dist/dev/mp-weixin。
- 修改 .uvue 或 .uts 后，保持 HBuilderX 的 mp-weixin 编译会话运行，确认产物目录已更新后再在微信开发者工具刷新或重启模拟器。
- 当前根目录式 UniApp 工程的 npm CLI 会查找 src/manifest.json；即使调整输入目录，仍可能在 App.uvue 解析阶段失败。因此 npm run dev:mp-weixin、npm run build:mp-weixin 以及对应 H5 命令不能作为端侧验收结论。
- H5 冒烟常见端口：`http://localhost:8080`（不要用 `:5173` 当本工程 UI）。
- `.uts` 返回对象时避免属性简写（`{ tab }`）；UTS 可能丢掉局部变量，页面 catch 会误显示“网络异常”。社区列表已按显式键名修复，详见 docs/TROUBLESHOOTING.md §5.1。
- 可用的自动化检查：`node tests/test-mock-system.js`、`node tests/test-community-flow.js`；提交前还要运行 `git diff --check`。

## 4. 常用定位

- 全局 Token 与视觉规则：uni.scss、App.uvue、DESIGN.md。
- Tab 与路由：pages.json。
- Mock 开关与接口边界：api/config.uts、api/、mock/。
- 社区闭环：pages/community/*、api/community.uts、mock/community.uts、utils/realNameGate.uts、XsaApplySheet / XsaReportSheet / XsaDynamicCard。
- 复用 UI：components/Xsa*.uvue。
- 运行和刷新排障：docs/HOW_TO_RUN.md、docs/TROUBLESHOOTING.md。
- 代码关系定位：工作区 graphify-out/，先使用 graphify query。

## 5. 文件分工

- AGENTS.md：可执行约束、保护文件与验证要求。
- CLAUDE.md：目录导航、阅读顺序与运行入口。
- PRODUCT.md、DESIGN.md：与定版决策记录保持一致的项目参考。
