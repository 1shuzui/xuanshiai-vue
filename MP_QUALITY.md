# 微信小程序构建与质量验收

本轮保留 61 个页面 URL、现有业务流程、接口字段、认证与父母授权规则、MBTI 流程及主要视觉内容。资源优化和构建正确性已实现；发行体积与真机回归须使用成功生成的发行产物完成，不能由源码 CI 或开发预算推断通过。

## 构建入口与门禁

在当前前端仓库目录执行，HBuilderX 必须已启动并导入此目录。发行命令需要登录 HBuilderX。

本项目 DCloud AppID 为 `__UNI__A840047`，微信小程序 AppID 为 `wx744472d3e3e7f825`，分别对应 `manifest.json` 的顶层 `appid` 和 `mp-weixin.appid`。DCloud 账号入口在 HBuilderX 左下角“未登录”；编辑器中的 `pages/auth/login.uvue` 是业务页面源码。填写项目 AppID 不会登录账号。

```powershell
$env:HBUILDERX_CLI = 'D:\HBuilderX\cli.exe'
npm run test:source
npm run build:mp-weixin
npm run verify:mp
```

`build:mp-weixin` 使用项目绝对路径调用 `publish mp-weixin --appid <manifest.json 中的微信 AppID> --upload false --sourceMap false`，不会上传微信。HBuilderX 5.24 会把命令参数的 AppID 写回配置，省略参数会写入空值；脚本读取现有微信 AppID，缺少时停止发行。开发编译按 HBuilderX 中当前目录的项目名调用 `launch mp-weixin --compile true`。再次构建前，先关闭微信工具中该产物对应的项目，等待文件监听释放输出目录。如果窗口已关闭但仍因文件监听占用出现 EPERM，完全退出本次调试的微信工具后重新构建；不能保留旧产物冒充本次构建。

| 用途 | 构建命令 | 产物目录 | 质量检查与预算 |
| --- | --- | --- | --- |
| 正式发行 | `npm run build:mp-weixin` | `unpackage/dist/build/mp-weixin/` | `npm run verify:mp`：每包 2 MiB、媒体 200 KiB |
| 开发调试 | `npm run build:mp-weixin:dev` | `unpackage/dist/dev/mp-weixin/` | `npm run verify:mp:dev`：沿用每包 3 MiB、媒体 300 KiB 的开发容忍上限 |

`dev:mp-weixin` 是一次开发编译的别名，持续监听请使用 HBuilderX 运行会话。正式主包的优化目标为 1.9 MiB，硬门禁仍是 2 MiB，不放宽发行阈值。

开发编译通过 `api/config.uts` 连接 `http://127.0.0.1:8000`，发行编译继续连接 `https://xhztest.xyz`；HTTP、WebSocket 和服务端媒体地址统一使用所选地址，`USE_MOCK` 保持 false。HBuilderX 在编译时替换 `process.env.NODE_ENV`；两种模式的 URL 行为均有源码测试，编译后还须核对生成的 `api/config.js`。[DCloud 运行环境管理](https://doc.dcloud.net.cn/uni-app-x/worktile/)

使用本地后端时，在微信工具中打开开发产物目录，在“详情 → 本地设置”允许本地 HTTP 调试并重新编译。`project.private.config.json` 只保存该开发产物的本机设置，不用于证明线上域名已配置。手机无法通过 `127.0.0.1` 访问电脑；真机联调需要可达的测试服务器或局域网地址。

构建前验证并清理当前项目对应的输出目录，清除上次构建凭据。退出码 0 还必须同时具备编译成功日志及新生成的完整页面。凭据记录提交 SHA、工作区是否有未提交变更、HBuilderX 版本、开始/结束时间及源码/产物 SHA-256 指纹。源码或产物改变后门禁拒绝旧凭据；编译期间源码改变则本次构建失败。

HBuilderX 每次发行都会重排 `manifest.json` 的缩进和换行，因此源码指纹对该文件解析后核对全部配置值，其他源码和产物仍按字节核对。未跳过 AppID 或其他配置字段；测试同时覆盖格式变化通过、实际配置变化失败。

日志、构建凭据、质量报告都放在被 Git 忽略的 `unpackage/build-reports/`，不进入小程序包。微信工具自行写入的 `project.private.config.json` 不参与内容指纹。

检查器核对源 `pages.json`、产物 `app.json`、每页 `.js` / `.json` / `.wxml` 三方一致，包含 URL 和分包归属。还检查 Tab 仍在主包、按需注入、资源存在且与源码一致、分包引用是否合法、地区 JSON 没有额外静态副本，以及每份原字库只内嵌一次。缺少一个页面文件也会失败。退出码为 0（通过）、2（质量失败）、1（输入缺失或运行错误）。

独立检查已有产物可用 `node scripts/verify-mp-weixin.cjs --artifact <目录>`；正式验收始终用带 `--require-build` 的 npm 命令。PowerShell 5 包装器 `scripts/verify-mp-weixin.ps1` 转发同一检查核心，无技能目录依赖。

## 资源归属

| 所属包 | 页面与资源 |
| --- | --- |
| 主包 | 原 5 个 Tab 与登录/注册，共 7 页；书法图、公共人像、导航及共享组件 |
| `pages/parent` | 父母端 2 页及独用组件；URL 保持不变，授权弹层仍在公共层 |
| `pages/emotion-lab` | 情感实验室 1 页；URL、登录跳转和 MBTI 业务逻辑不变 |
| `pagesSub/profileExtra` | 原 21 页；墨相师/语音/海报组件、四种状态图、四套海报预览 |
| `pagesSub/matchmaker` | 原 8 页；案例照片与私人定制头图 |
| 其他 4 个原有分包 | 原 22 页和 URL 保留 |

全部为普通分包，沿用应用登录状态；`mp-weixin.optimization.subPackages` 使独用组件跟随所属分包。[DCloud 分包优化](https://uniapp.dcloud.net.cn/collocation/manifest?id=optimization-1)

地区数据迁移到 `utils/data/location.json`，规范化 JSON 的 SHA-256 为 `eec58b631679e9afdc86fcbf8fa613c710bdd73efcc38ba517160c8aaabb1819`，完整保留 34 个省级条目和所有市区名称、编码、顺序。

`XsaIcon` 保留六套原字库的 13 个文件格式及 52 个名称映射。字库在 `components/assets/icons/`，通过 CSS 打包，减少重复内嵌并消除 static 原文件副本。图标组件直接承接原尺寸样式和事件；uni-app x 在小程序启用 virtualHost 并合并宿主属性，仍须端侧核对实际显示。[DCloud 小程序组件说明](https://doc.dcloud.net.cn/uni-app-x/mp/index.html)

## 图片可复现记录

原图保存在 Git 提交 `6a3e659de0e2327ff041f913705944a326f8fe4e`。`scripts/optimize-mp-media.py` 始终读取该提交的原文件；`scripts/mp-media-manifest.json` 记录 25 个文件的编码参数、原始与优化后大小、尺寸及哈希。未删人物、裁画面或重绘文字。公共人像仍为 JPEG，四套海报 WebP 与原 PNG 的 RGBA 像素逐一相同。

| 图片 | 方法 | 合计大小变化 |
| --- | --- | --- |
| 墨相师四状态 | 长边 320，WebP quality 84 / method 6 | 4,825 → 84 KiB |
| 两张书法图 | 长边 1284，WebP quality 84 / method 6 | 2,097 → 123 KiB |
| 四套海报 | 原尺寸，无损 WebP / exact / method 6 | 514 → 266 KiB |
| 公共人像 | JPEG 长边 1152，quality 80 / optimize / progressive，原路径 | 1,288 → 563 KiB |
| 案例及定制头图 | JPEG 长边 960，quality 84；重编码更大时保留原字节 | 912 → 696 KiB |

复现环境独立于前后端依赖：

```powershell
uv run --with pillow==12.3.0 python scripts/optimize-mp-media.py
```

先确保来源提交存在于当前前端 Git 历史。需要修改参数时编辑脚本并重新生成清单，再编译验收。WebP 的 `image` 已配置 `webp` 属性，Android / iOS 的实际显示不能仅靠编码或编译成功证明。[DCloud image 兼容说明](https://doc.dcloud.net.cn/uni-app-x/component/image.html)

## GitHub CI 与本地验收边界

GitHub 使用 Ubuntu / Node 20，`npm ci` 后运行 `npm run test:source`：25 组源码与行为检查，覆盖开发/发行 API 地址、Mock、请求账号隔离、父母端与授权申请、MBTI 开始/续答/提交、路由、语音组件、图片/字形契约，以及首页会话、申请接收方确认/拒绝/重试、海报真实媒体对象与加载失败重试、资料编辑入口、会员状态与聊天界面。合成产物测试覆盖包与媒体边界、页面缺文件、路由遗漏/归包错误、重复资源、重复字体、无构建凭据、源码或产物过期；合成编译器覆盖登录提示但退出码为 0、没有新文件、编译不完整、编译期间源码变化、AppID 缺失/写回与成功记录版本/SHA。

该任务名为 **Frontend source and synthetic artifact checks**，不生成真实微信产物。HBuilderX 发行门禁与微信端验收在本机完成。

2026-09-08 的本地开发编译（HBuilderX 5.24.2026081301）已生成全部 61 页；主包从 12,067.9 KiB 降到 2,489.9 KiB，8 个分包分别为 273.8、921.2、956.2、81.8、13.1、259.7、122.5、45.6 KiB（按 `pages.json` 顺序）。超过 200 KiB 的媒体从 13 个降到 0；全产物内嵌字体数据从约 449.6 降到 80.6 KiB。开发门禁及图片归包检查通过。

2026-09-08 已完成 HBuilderX 账号登录，按用户授权将微信开发者工具升级到官方 Nightly 2.02.2609072，登录与服务端口保持可用。前端代码提交 `65f07d9` 在干净工作区完成发行构建和正式 `verify:mp`，包括真实构建凭据校验；后续报告以 PR 附录中对应 SHA 的本次构建凭据为准。61 页完整生成，主包 1,712.5 KiB，最大分包 858.8 KiB，无媒体超过 200 KiB。主包低于 1.9 MiB 优化目标，正式 2 MiB / 200 KiB 阈值保持不变。

以下为 `65f07d9` 的发行基线；最后的海报媒体适配提交须重新发行，最新实测以 PR 对应提交的凭据与质量报告为准。

| 发行包 | 实测 KiB |
| --- | ---: |
| 主包 | 1,712.5 |
| `pagesSub/community` | 177.7 |
| `pagesSub/matchmaker` | 858.8 |
| `pagesSub/profileExtra` | 764.0 |
| `pagesSub/chat` | 43.3 |
| `pagesSub/about` | 9.1 |
| `pagesSub/userExtra` | 170.3 |
| `pages/parent` | 74.7 |
| `pages/emotion-lab` | 27.6 |

微信模拟器基础库 3.17.0、390 宽度已检查欢迎页的协议打开与取消。使用同一批 25 张优化图片的独立原生小程序探针，全部触发 `image` 加载成功事件，尺寸与清单一致，错误事件为 0；其中 WebP 的 `getImageInfo` 在该模拟器返回失败，但 `image` 组件实际成功加载，不能据此 API 的失败结果认定图片损坏。该探针只验证格式解码，不替代业务页面路径、视觉清晰度或真机验收。

在提交 `32c0999` 的干净工作区重新发行后，欢迎页协议打开/取消、父母分包游客跳转登录、情感实验室分包进入均已在模拟器确认，相关页面实例完成挂载。此前开发产物连续自动检查中的生命周期超时没有在本次发行检查中复现；本轮没有据此修改业务生命周期。

**本地联调与线上环境的验收边界**：

用户已选择直接使用本地后端。使用 `D:\项目\宣誓爱后端\xuanshiai` 现有代码启动本机 Uvicorn、独立 MySQL 8 数据目录及 WSL Redis 7.0.15 实例，未修改后端源码、未使用现有业务数据库、未执行后端 Git 操作。健康检查返回 testing，29 条父母端/情感实验室路由可用；登录使用本地 Mock 短信提供方和合成用户，后续请求走真实 HTTP、MySQL 与 Redis。

独立 HTTP 验证已通过：邀请预览/明确确认/撤销、越权拒绝、喜欢、并发申请只扣一次额度、双方同意后聊天及消息幂等；MBTI 60 题提交、保存 7 题后读取续答、跨账号拒绝、重复提交和确认同步到资料。此项没有替换业务依赖或使用 ASGI 测试传输，仍不等于微信页面操作验收。

本地开发产物已确认编入 `http://127.0.0.1:8000`，`USE_MOCK=false`。升级工具并重建调试会话后，实际 `wx.request` 能访问本地服务，此前域名检查未生效和 RC 工具内部编译异常不再阻塞本地回归。内置调试接口版本为 0.3.10，微信基础库为 3.17.0；切换模拟器机型后需重新建立自动化连接，不能复用旧连接的超时结果判断业务失败。

微信开发产物连接真实本地后端，已通过以下页面操作：

- 父母手机号登录与角色跳转；无子女授权时显示门槛；父母生成邀请，成年子女预览并明确勾选同意后授权。
- 子女 MBTI 开始、保存 7 题、离开后恢复到第 8 题、完成全部 60 题并提交；明确勾选后同步本次 ESTJ 结果，资料来源为 `assessment`。
- 父母喜欢候选人、发送申请，今日额度由 3 变为 2；待同意时不允许聊天。候选人从消息页同意申请后，父母进入会话并通过真实接口发送文字。
- 子女在授权记录和原生确认弹窗中撤销；父母端恢复“需由子女明确同意”，后端拒绝继续读取子女消息（403）。为后续布局回归，合成账号通过真实 HTTP 重新建立测试授权。
- 父母首页在 320 / 375 / 390 / 428 宽度均检查页面高度、胶囊避让、头部文字与子女标签不重叠、授权状态横向排列、四个导航按钮至少 48×48、申请按钮可滚动到达。MBTI 结果页在这四种宽度均确认内容区与内层滚动边界正确，并显示真实提交结果。

- 海报媒体适配提交 `e76f3c2` 的新开发产物已在 320 宽度重新验证四套选择与预览：使用实际本人资料接口，均显示合成子女资料；图片节点引用正确的本地 HTTP 照片，四套均通过图片解码检查。此项没有点击或宣称完成相册保存。

测试使用合成父母/子女/候选人。父母登录走实际页面；后续多账号切换使用正常登录接口获得的测试会话写入隔离的模拟器存储，未替换业务接口响应。手机真机尚未参与。

回归发现并修复三项实际问题：

- `.uvue` 的 flex 默认纵向，父母页面的横向排列和按钮区因此堆叠；页面只有 `min-height` 时，内部滚动区又被长内容撑开。显式声明横向布局、使用 flex 替代这些页面的 grid、限定页面高度和滚动区，并为父母自定义头部保留胶囊空间。[DCloud flex-direction](https://doc.dcloud.net.cn/uni-app-x/css/flex-direction.html)
- 普通用户消息页“同意/拒绝”没有传接口要求的 `clientCommandId`，点击没有真正处理申请；旧异常分支还会生成本地聊天或移除请求。现在按账号、申请与动作生成稳定命令 ID，服务端成功后才更新界面；失败保留请求并显示重试入口，删除演示申请/本地匹配的降级路径。新增行为测试先复现缺参失败，再覆盖重试、重复点击、账号切换及服务端确认后导航。
- 海报原来把后端相册的媒体对象转成 `[object Object]` 图片路径，真实照片空白。现在读取 `file_url` / `url`，同时保留原有字符串图片路径和排序。资料请求失败时使用已有错误与重试面板，不再自动展示演示人物；行为测试覆盖两种媒体格式和失败后的重试。

线上及真机验收仍有以下边界：

- 用户已选择本地后端。上线前仍需为实际部署地址配置微信 request 合法域名，并部署包含父母端与情感实验室的后端版本。此前 `https://xhztest.xyz/api/v1/emotion-lab/summary` 返回 404，公开接口清单没有对应路由；本地通过不代表线上已部署。
- 用户本次明确暂时无法参与真机回归。Android / iOS、弱网首次进入分包，以及墨相师/海报/地区/图标在真机上的完整视觉与交互仍待验收；模拟器的四种宽度不能替代手机。

2026-09-08 已处理此前记录的 3 项失败测试，并纳入源码 CI。`test-six-page-reconstruction-contract.js` 核对当前资料编辑入口并执行错误操作；`test-vip-card-rendering-flow.js` 使用真实页面函数验证服务端目标 ID、会员状态、预览操作限制及测试支付响应；`test-chat-detail-ui.js` 执行模板 class 表达式验证父母聊天样式独立于其他模式。测试不再要求旧 Mock 固定 ID、已迁移的编辑函数或过时 class 字符串；测试支付仍不代表真实支付验收。

其中首页会话问题是实际回归：已有登录令牌仍会进入欢迎页，且 `onShow` 消费一次跳过标记后，`onMounted` 又会重新显示欢迎页。现在由 `onLoad` 初始化路由与欢迎状态，`onShow` 读取当前会话并统一消费一次跳过标记，移除不再需要的全局冷启动标记。顺序依据 [DCloud 页面生命周期](https://doc.dcloud.net.cn/uni-app-x/page.html)。新增 `test-home-session-flow.js` 先复现失败，再验证已有会话、游客协议确认、登录返回、一次跳过、指定 Tab 与父母角色路由；未改变认证、父母授权或 MBTI 规则。

已通过的模拟器路径与待完成的真机路径分别记录，后续在 Android / iOS 复核以下内容，并将对应提交的报告附到前端 PR：

- 首次进入两个新分包、登录后角色跳转、父母授权生成/本人确认/撤销、申请认识和授权失效状态。
- MBTI 开始、续答、保存、提交及回到个人资料后的来源同步。
- 墨相师四状态、语音入口、四套海报选择与预览、地区三级选择与图标字形/尺寸/点击。
- 320 / 375 / 390 / 428 宽度的头尾留白、长内容滚动，以及弱网首次加载、已加载分包的本地资源显示。

既有占位功能、测试题库授权和远端接口可用性继续按产品验收记录，包体通过不能证明这些业务已经完成。例如 `my-poster-preview.uvue` 的 `savePoster` 目前仅显示成功提示，尚未实现真实图片导出/保存；模板中的 `QR` 仍是占位内容，尚未生成可识别的小程序码。这些既有行为不作为本轮资源优化已完成的功能验收。

## Git 与 Graphify

本轮实施目录是 `D:\项目\.worktrees\parent-emotion-frontend`，前端远端 `1shuzui/xuanshiai-vue`，沿用 PR #2。所有拉取/提交/推送显式指定此目录；所有 `gh` 操作显式指定 `--repo 1shuzui/xuanshiai-vue`。后端 Git 操作与原开发目录的未提交修改均不纳入本轮。

Graphify 0.9.55 安装于独立 Python 3.12 工具环境。当前机器的 `uv tool install` 遇到跨磁盘重命名错误，已改用独立 venv + pip 安装 `graphifyy==0.9.55`；未写入前端依赖或后端虚拟环境。可执行路径：`C:\Users\Administrator\.local\share\graphify-venv\Scripts\graphify.exe`。

前端工作树和 `D:\项目\宣誓爱` 工作区根各执行 `graphify update . --no-cluster`，各自的 `graphify-out/graph.json` 只对应各自目录。当前版本未解析 `.uvue` / `.uts` 主体，图谱用于已支持文件的定位；这些文件的关系以源码引用和实际编译产物核对。
