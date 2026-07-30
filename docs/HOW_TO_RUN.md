# 运行与构建

> 请在 `xuanshiai-vue` 项目目录操作，不依赖某台电脑的绝对路径。更新日期：2026-07-30。

## 1. 环境准备

- Node.js 与 npm，用于安装依赖和执行结构测试。
- HBuilderX，当前 `.uvue` / `.uts` 工程的首选编译入口。
- 微信开发者工具，并在“设置 → 安全设置”中开启服务端口。

## 2. 安装依赖

```bash
npm install
```

不要在未确认的情况下升级依赖大版本或删除现有依赖。

## 3. 当前可用入口

### 3.1 结构验证

```bash
node tests/test-mock-system.js
```

该脚本检查当前 Mock、API 和核心页面文件结构，不代表页面已经完成端侧编译或业务验收。

### 3.2 HBuilderX 运行（推荐验收入口）

#### Windows 一键入口

- 双击项目根目录的 `open-in-hbuilderx.bat`，HBuilderX 会打开本项目根目录。
- HBuilderX 编译完成后，双击 `open-wechat-devtools.bat` 可把最新的 `unpackage/dist/dev/mp-weixin` 产物导入微信开发者工具；该目录本身就是小程序项目根目录。
- 不要把 `unpackage/dist/dev/mp-weixin` 当作 HBuilderX 源工程打开；它只用于微信开发者工具运行。

**打开项目时只打开本目录本身：**

```text
.../宣誓爱/xuanshiai-vue
```

不要打开上一级 `宣誓爱` 工作区根，也不要只打开 `pages/` 或 `unpackage/`。

正确导入后，HBuilderX 项目管理器根下应直接看到这些文件：

```text
App.uvue
main.uts
manifest.json
pages.json
pages/
components/
api/
mock/
static/
```

#### 运行步骤

1. 菜单：**文件 → 打开目录**，选择 `xuanshiai-vue`。
2. 若提示“是否转换为 uni-app 项目 / 关联云服务空间”，开发期可跳过或取消关联；当前社区联调使用 `USE_MOCK = false` 和本机 FastAPI，不依赖 uniCloud。
3. **H5 冒烟**：运行 → 运行到浏览器 → Chrome（或默认浏览器）。
4. **微信小程序冒烟**：运行 → 运行到小程序模拟器 → 微信开发者工具。
5. 微信开发者工具需先安装，并在 **设置 → 安全设置 → 服务端口** 中开启。
6. 当前本地验收 AppID 为 `wxb5f4e639f4eb2591`；本地 HTTP 联调保持 `urlCheck: false`，生产环境必须改用正式合法域名配置。
7. 记录 HBuilderX 版本、目标端和**第一条完整错误**，不要只截最后一条连锁报错。

#### 微信开发者工具手动导入（HBuilderX 未自动拉起时）

HBuilderX 编译成功后，产物一般在：

```text
unpackage/dist/dev/mp-weixin
```

在微信开发者工具中：

1. 导入项目 → 目录选上面的 `mp-weixin`，不要选 `xuanshiai-vue` 或 `unpackage`。
2. AppID 使用 `wxb5f4e639f4eb2591`；开发期关闭域名校验（与当前 `urlCheck: false` 一致）。
3. 编译并确认首页、五个 Tab 能切换；社区 Tab 应加载 FastAPI 种子动态，而不是固定“网络异常”。

产物目录中的 `project.config.json` 使用 `miniprogramRoot: "./"`，因此微信开发者工具会从当前 `mp-weixin` 目录读取 `app.json`。如果看到 `mp-weixin/unpackage/dist/dev/mp-weixin/app.json` 不存在，说明打开了旧项目配置或旧产物：先关闭该项目，重新运行 HBuilderX 到微信，再重新导入最新的 `mp-weixin` 目录。

仓库中可能已有历史 `unpackage/` 产物，只能用于临时打开验证，**不能替代本次 HBuilderX 重新编译**。改过页面或 `api/*.uts` 后请重新运行生成新产物。

#### HBuilderX CLI 编译（可选，本机已验证路径）

图形界面「运行到小程序模拟器 → 微信开发者工具」仍是主路径。本机也可在项目根用 CLI 触发编译（路径按本机安装位置调整）：

```bash
# 示例：HBuilderX 5.15 系列
"<HBuilderX安装目录>/cli.exe" launch mp-weixin --project "<项目绝对路径>/xuanshiai-vue" --compile true
```

编译成功后，用微信开发者工具打开/刷新 `unpackage/dist/dev/mp-weixin`。CLI 失败时仍以 HBuilderX 菜单运行为准；不要改用 `npm run dev:mp-weixin` 顶替。

#### H5 预览端口

HBuilderX 跑到浏览器时，本机常见入口是 `http://localhost:8080`。`:5173` 不是本工程有效 UI 端口，不要拿该端口 404 当业务失败。

#### 导入/打开自检（本机 2 分钟）

- [ ] HBuilderX 打开的是 `xuanshiai-vue` 根目录，不是父目录。
- [ ] 根目录可见 `App.uvue`、`manifest.json`、`pages.json`。
- [ ] `static/logo.png` 存在（App 图标引用；缺失时部分端会警告）。
- [ ] `static/portraits/` 下有肖像资源。
- [ ] 微信开发者工具服务端口已开启。
- [ ] 运行到微信后，首页不是白屏，底部 5 个 Tab 可点。
- [ ] 首页推荐区能看到 Mock 人物故事（或明确的加载/空态文案）。

#### 本机已知干扰：旧项目路径

若 HBuilderX 日志或启动时出现：

```text
open editor with no exists file: D:/Users/ASUS/Desktop/前端/xuanshiai-vue/frontend
```

说明本机曾打开过已迁移/删除的旧目录。处理：

1. 在 HBuilderX 中关闭指向旧路径的标签页或从最近项目列表移除旧项。
2. 只保留当前工程：`D:/Users/ASUS/Desktop/宣誓爱/xuanshiai-vue`。
3. 不要再打开 `Desktop/前端/...` 或工作区父目录当工程根。

本机 HBuilderX 已检测到：`D:\Users\ASUS\tools\HBuilderX\HBuilderX.exe`（约 5.15 系列），支持 uni-app x。

#### 微信小程序烟测清单（验收“能打开”）

编译成功并进入模拟器后，逐项确认：

1. 启动页为首页，非白屏、非持续报错。
2. 底部 Tab：首页 / 社区 / 牵线 / 消息 / 我的 均可切换。
3. 首页推荐区出现 Mock 用户故事，或显示“认真为你匹配中… / 暂无推荐”。
4. 点“申请认识”能弹出说明与附言（Mock 成功提示即可）。
5. 社区列表能出 Mock 动态（关注/同城/发现可切换）；不应长期停在“网络异常”。
6. 牵线、消息列表至少有加载态或列表内容。
7. 控制台无阻断级红错；`USE_MOCK = false` 时应能通过本机 FastAPI 读取社区真实接口。

#### 本机网络地址

微信开发者工具和 FastAPI 都运行在同一台 Windows 电脑时，`api/config.uts` 使用 `http://127.0.0.1:8000`，不依赖 Windows 的局域网入站规则。需要用真机访问时，把 `API_BASE_URL` 改为 `LAN_API_BASE_URL` 的值，并仅向本地子网放行 TCP 8000。

本地本轮已验证调试登录和真实 HTTP 社区接口；不在本轮强求：物理真机、真实支付、真实云函数、正式版本发布。

2026-07-23 本会话已用 HBuilderX 重编 mp-weixin 并导入开发者工具；H5 社区列表在 `:8080` 冒烟可见动态。完整手测回归仍以你本机模拟器为准。

## 4. npm CLI 的当前限制

`package.json` 中仍保留以下脚本：

```bash
npm run dev:h5
npm run dev:mp-weixin
npm run build:h5
npm run build:mp-weixin
```

截至 2026-07-22，在当前依赖版本 `@dcloudio/vite-plugin-uni 3.0.0-4020920240930001` 下，直接执行脚本会默认读取 `src/manifest.json`，但本工程是根目录式结构，配置文件位于项目根目录。手动把 `UNI_INPUT_DIR` 指向根目录后，编译会继续到 `App.uvue`，随后因当前 CLI 未正确处理 `.uvue` 而失败。

因此：

- 这些 npm 脚本暂时是待修复入口，不应写成“已可直接运行”。
- 不要复制、移动或改写受保护的 `manifest.json`、`pages.json` 来迎合默认 `src/` 结构。
- 不要仅为通过 CLI 批量把 `.uvue` / `.uts` 改成普通 Vue 文件。
- CLI 结构调整属于技术架构变更，应先形成迁移方案并完成 H5、微信小程序双端回归。

## 5. 基础业务验证

当前联调开关位于 `api/config.uts`：社区验收使用 `export const USE_MOCK = false`；需要纯结构 Mock 预览时才临时切回 `true`。

检查首页推荐与申请认识、社区动态、牵线服务、消息申请和我的页面入口。Mock 数据数量和示例姓名会随开发调整，不把具体条数作为稳定验收标准。

## 6. 编译产物

HBuilderX 产物通常位于 `unpackage/`。该目录是构建结果，不作为源代码修改，也不能以已有旧产物代替本次重新编译。

## 7. 常见问题

- npm 提示缺少 `src/manifest.json`：见 `TROUBLESHOOTING.md` 的“npm CLI 与根目录式工程”章节。
- 页面空白：检查终端、浏览器或微信开发者工具控制台的第一条错误。
- Mock 不生效：确认 `USE_MOCK = true`，并检查页面是否通过 `@/api` 调用。
- uniCloud 关联提示：见 `TROUBLESHOOTING.md`，不要擅自删除或重命名云函数目录。
