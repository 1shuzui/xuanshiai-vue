# 宣誓爱项目 — CLAUDE.md

本文件是 xuanshiai-vue/ 的开发导航和运行入口。实现约束以 AGENTS.md 为准；产品与设计参考以 PRODUCT.md、DESIGN.md 为准。

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
2. 相关 pages/、components/、api/、mock/ 源码。
3. PRODUCT.md、DESIGN.md、uni.scss。
4. docs/HOW_TO_RUN.md 与 docs/TROUBLESHOOTING.md。

## 3. 微信小程序运行与刷新

- 使用 HBuilderX 运行 mp-weixin，并在微信开发者工具中打开 unpackage/dist/dev/mp-weixin。
- 修改 .uvue 或 .uts 后，保持 HBuilderX 的 mp-weixin 编译会话运行，确认产物目录已更新后再在微信开发者工具刷新或重启模拟器。
- `npm run build:mp-weixin` 通过本机 HBuilderX 生成发行产物，明确关闭上传；随后运行 `npm run verify:mp`。需要先打开 HBuilderX、导入当前前端目录并完成账号登录；CLI 路径可用 `HBUILDERX_CLI` 指定。
- `npm run build:mp-weixin:dev`（或 `dev:mp-weixin`）执行一次开发编译，随后运行 `npm run verify:mp:dev`。持续编译仍使用 HBuilderX 的运行会话；源码变动后必须重新构建，旧凭据不能通过门禁。
- 上述 npm 微信命令已不再调用项目内旧版 UniApp CLI。H5 命令仍沿用原入口，H5 结果不能代替微信验收。
- H5 冒烟常见端口：`http://localhost:8080`（不要用 `:5173` 当本工程 UI）。
- `.uts` 返回对象时避免属性简写（`{ tab }`）；UTS 可能丢掉局部变量，页面 catch 会误显示“网络异常”。社区列表已按显式键名修复，详见 docs/TROUBLESHOOTING.md §5.1。
- GitHub 与本地源码检查：`npm run test:source`，包含 Mock、父母端、MBTI 及构建/门禁失败场景。真实发行产物和微信回归在本机执行，提交前运行 `git diff --check`。

## 4. 常用定位

- 全局 Token 与视觉规则：uni.scss、App.uvue、DESIGN.md。
- Tab 与路由：pages.json。
- Mock 开关与接口边界：api/config.uts、api/、mock/。
- 社区闭环：pages/community/*、api/community.uts、mock/community.uts、utils/realNameGate.uts、XsaApplySheet / XsaReportSheet / XsaDynamicCard。
- 复用 UI：components/Xsa*.uvue。
- 分包独用组件：`pages/parent/components/`、`pagesSub/profileExtra/components/`。父母授权弹层保持公共组件；地区数据在 `utils/data/location.json`。
- 小程序资源、构建与质量验收：[MP_QUALITY.md](MP_QUALITY.md)。
- 运行和刷新排障：docs/HOW_TO_RUN.md、docs/TROUBLESHOOTING.md。
- 代码关系定位：工作区 graphify-out/，先使用 graphify query。

## 5. 文件分工

- AGENTS.md：可执行约束、保护文件与验证要求。
- CLAUDE.md：目录导航、阅读顺序与运行入口。
- PRODUCT.md、DESIGN.md：项目产品与设计参考。

## 父母端与情感实验室联调说明

本次入口、数据源、自动化验证和待验收说明见[父母端与情感实验室修复验收](docs/父母端与情感实验室修复验收.md)。微信构建应在 HBuilderX 中按导入的项目名选择当前检出目录，避免路径前缀匹配到同名的旧目录。

`scripts/verify-mp-weixin.cjs` 是跨平台产物检查器，PowerShell 包装器兼容 Windows PowerShell 5。它同时检查源路由、生成路由、每页三个必需文件和本次成功构建凭据；默认读取发行目录。
