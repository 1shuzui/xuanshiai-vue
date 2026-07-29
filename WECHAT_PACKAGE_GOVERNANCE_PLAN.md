# 微信小程序包体质量治理 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `subagent-driven-development` (recommended) or `executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在不改变产品流程的前提下，开启组件按需注入，清理和压缩静态资源，把非核心页面迁入业务分包，并建立可重复的包体质量门禁，使微信主包和每个分包长期保持在内部预算以内。

**Architecture:** 主包只保留启动、登录、首次资料和五个 TabBar 页面；社区、红娘和账户二级流程分别进入三个普通分包。生产 `static/` 只保存运行时必需的小资源，大媒体使用压缩版本或受控远程地址。源码测试负责保护配置和路由，HBuilderX 生成产物后再执行包体审计和微信开发者工具回归。

**Tech Stack:** UniApp X、Vue 3、UTS/UVue、HBuilderX 5.15、微信开发者工具、Node.js 结构测试、PowerShell 产物审计、Python Pillow 图片压缩。

## Global Constraints

- `manifest.json`、`pages.json` 是受保护配置，执行 Task 2 或 Task 4 前必须取得用户明确授权。
- 只修改源码和项目文档，不直接修改 `unpackage/dist/dev/mp-weixin` 中的生成文件。
- 小程序端以 HBuilderX 编译和微信开发者工具为验收入口；当前 `npm run build:mp-weixin` 不能作为通过证据。
- 保留当前 AppID、权限、合法域名和接口配置；包体治理不得顺带修改认证、后端地址或产品范围。
- TabBar 页面必须留在主包，分包按业务域划分，不创建空分包，不默认使用 `independent: true`。
- 内部预算：单个图片/音频不超过 `184320` 字节，主包不超过 `1572864` 字节，单个分包不超过 `1572864` 字节。
- 微信常见硬限制仍按媒体 `204800` 字节、主包和单个分包 `2097152` 字节检查；内部预算用于预留增长空间。
- 移动页面后必须同步更新所有跳转、分享路径、测试夹具和文档引用。
- 修改代码或重要文档后，从工作区根目录执行 `graphify update .`。

---

## Baseline

审计对象：`unpackage/dist/dev/mp-weixin`

| 指标 | 当前值 | 目标 |
|---|---:|---:|
| 总包 | 4,014,431 字节，3.828 MiB | 按业务分包，总量受持续监控 |
| 主包 | 4,014,431 字节，3.828 MiB | 不超过 1.5 MiB |
| 分包 | 0 个 | 3 个普通分包 |
| `lazyCodeLoading` | 缺失 | `requiredComponents` |
| 超过 200 KiB 的媒体 | 5 个 JPG | 0 个 |
| 可疑静态残留 | 32 个，487,973 字节 | 0 个生产包残留 |
| `static/` | 1.857 MiB | 只保留运行时必需资源 |

当前超限图片：

- `static/portraits/profile-woman-alt.jpg`：293,703 字节。
- `static/portraits/profile-man-alt.jpg`：238,364 字节。
- `static/portraits/profile-woman-main.jpg`：231,073 字节。
- `static/portraits/profile-man-light.jpg`：220,932 字节。
- `static/portraits/profile-woman-community.jpg`：213,875 字节。

## Target File Structure

```text
xuanshiai-vue/
├─ pages/
│  ├─ index/index.uvue
│  ├─ community/community.uvue
│  ├─ matchmaker/matchmaker.uvue
│  ├─ message/message.uvue
│  ├─ profile/profile.uvue
│  ├─ auth/login.uvue
│  ├─ auth/register.uvue
│  └─ onboarding/profile.uvue
├─ packages/
│  ├─ community/pages/*.uvue
│  ├─ matchmaker/pages/*.uvue
│  └─ account/pages/*.uvue
├─ scripts/
│  ├─ check-wechat-package-quality.ps1
│  └─ optimize-wechat-media.py
├─ tests/
│  ├─ test-wechat-package-quality.ps1
│  ├─ test-wechat-app-quality.js
│  ├─ test-static-package-assets.js
│  └─ test-wechat-subpackages.js
└─ dev-assets/iconfont-previews/
```

### Task 1: 建立项目内包体质量门禁

**Files:**
- Create: `scripts/check-wechat-package-quality.ps1`
- Create: `tests/test-wechat-package-quality.ps1`
- Modify: `docs/HOW_TO_RUN.md`

**Interfaces:**
- Consumes: HBuilderX 生成的 `unpackage/dist/dev/mp-weixin`。
- Produces: JSON 审计结果；结构或质量硬检查失败时退出码为 `2`。

- [ ] **Step 1: 先创建会失败的项目内回归测试**

以已验证测试为基线复制文件，并把 `$checker` 改为项目内脚本路径：

```powershell
Copy-Item `
  -LiteralPath 'C:\Users\ASUS\.codex\skills\debug-wechat-build-artifacts\tests\test-inspect-wechat-artifact.ps1' `
  -Destination 'tests\test-wechat-package-quality.ps1'
```

在测试中将：

```powershell
$skillRoot = Split-Path -Parent (Split-Path -Parent $PSCommandPath)
$checker = Join-Path $skillRoot 'scripts\inspect-wechat-artifact.ps1'
```

替换为：

```powershell
$projectRoot = Split-Path -Parent (Split-Path -Parent $PSCommandPath)
$checker = Join-Path $projectRoot 'scripts\check-wechat-package-quality.ps1'
```

- [ ] **Step 2: 运行测试并确认因项目脚本不存在而失败**

Run:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass `
  -File .\tests\test-wechat-package-quality.ps1
```

Expected: FAIL，错误指出 `scripts/check-wechat-package-quality.ps1` 不存在。

- [ ] **Step 3: 引入已验证的项目内审计脚本**

```powershell
Copy-Item `
  -LiteralPath 'C:\Users\ASUS\.codex\skills\debug-wechat-build-artifacts\scripts\inspect-wechat-artifact.ps1' `
  -Destination 'scripts\check-wechat-package-quality.ps1'
```

脚本接口必须保留：

```powershell
-ArtifactPath D:\Users\ASUS\Desktop\宣誓爱\xuanshiai-vue\unpackage\dist\dev\mp-weixin
-IncludeQualityAudit
-SummaryOnly
-MediaLimitBytes 184320
-MainPackageLimitBytes 1572864
-SubpackageLimitBytes 1572864
```

- [ ] **Step 4: 运行回归测试并确认通过**

Run:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass `
  -File .\tests\test-wechat-package-quality.ps1
```

Expected: `PASS: inspect-wechat-artifact quality audit tests`。

- [ ] **Step 5: 对当前产物记录内部预算基线**

Run:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass `
  -File .\scripts\check-wechat-package-quality.ps1 `
  -ArtifactPath .\unpackage\dist\dev\mp-weixin `
  -IncludeQualityAudit `
  -SummaryOnly `
  -MediaLimitBytes 184320 `
  -MainPackageLimitBytes 1572864 `
  -SubpackageLimitBytes 1572864
```

Expected: exit code `2`，并至少报告 `lazy-code-loading`、`main-package-size`、`oversized-media` 三项失败。

- [ ] **Step 6: 在运行文档中登记命令**

在 `docs/HOW_TO_RUN.md` 的微信编译步骤后增加“包体质量审计”，说明该命令必须在 HBuilderX 生成新产物后运行，不能对旧产物给出通过结论。

- [ ] **Step 7: Commit**

```powershell
git add scripts/check-wechat-package-quality.ps1 tests/test-wechat-package-quality.ps1 docs/HOW_TO_RUN.md
git commit -m "test: add wechat package quality gate"
```

### Task 2: 开启组件按需注入

**Files:**
- Create: `tests/test-wechat-app-quality.js`
- Modify: `manifest.json`
- Verify: `unpackage/dist/dev/mp-weixin/app.json`

**Interfaces:**
- Consumes: `manifest.json` 的 `mp-weixin` 配置。
- Produces: 生成 `app.json` 中的 `"lazyCodeLoading": "requiredComponents"`。

- [ ] **Step 1: 创建失败的源码配置测试**

Create `tests/test-wechat-app-quality.js`：

```javascript
const assert = require('assert')
const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const manifest = fs.readFileSync(path.join(root, 'manifest.json'), 'utf8')

assert.match(
  manifest,
  /"lazyCodeLoading"\s*:\s*"requiredComponents"/,
  'mp-weixin must enable required component lazy loading'
)

console.log('微信组件按需注入源码配置测试通过')
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `node tests/test-wechat-app-quality.js`

Expected: FAIL，提示未找到 `lazyCodeLoading`。

- [ ] **Step 3: 经明确授权后修改受保护的 `manifest.json`**

在 `mp-weixin` 对象中加入：

```json
"lazyCodeLoading": "requiredComponents",
```

目标结构：

```json
"mp-weixin": {
  "appid": "wxb5f4e639f4eb2591",
  "setting": {
    "urlCheck": false,
    "es6": true,
    "minified": true
  },
  "lazyCodeLoading": "requiredComponents",
  "usingComponents": true
}
```

- [ ] **Step 4: 运行源码测试并确认通过**

Run: `node tests/test-wechat-app-quality.js`

Expected: `微信组件按需注入源码配置测试通过`。

- [ ] **Step 5: 用 HBuilderX 重新编译并检查生成配置**

```powershell
& 'D:\Users\ASUS\tools\HBuilderX\cli.exe' launch mp-weixin `
  --project 'D:\Users\ASUS\Desktop\宣誓爱\xuanshiai-vue' `
  --compile true
```

编译完成后运行：

```powershell
$app = Get-Content -Raw -Encoding UTF8 '.\unpackage\dist\dev\mp-weixin\app.json' | ConvertFrom-Json
if ($app.lazyCodeLoading -ne 'requiredComponents') { throw 'generated app.json did not preserve lazyCodeLoading' }
```

Expected: 命令退出码 `0`。

- [ ] **Step 6: Commit**

```powershell
git add manifest.json tests/test-wechat-app-quality.js
git commit -m "perf: enable wechat component lazy loading"
```

### Task 3: 清理静态预览残留并压缩超限图片

**Files:**
- Create: `tests/test-static-package-assets.js`
- Create: `scripts/optimize-wechat-media.py`
- Move: `static/**/demo.css`
- Move: `static/**/demo_index.html`
- Move: `static/**/iconfont.css`
- Move: `static/**/iconfont.js`
- Move: `static/**/iconfont.json`
- Modify binary: `static/portraits/profile-woman-alt.jpg`
- Modify binary: `static/portraits/profile-man-alt.jpg`
- Modify binary: `static/portraits/profile-woman-main.jpg`
- Modify binary: `static/portraits/profile-man-light.jpg`
- Modify binary: `static/portraits/profile-woman-community.jpg`
- Create directory: `dev-assets/iconfont-previews/`

**Interfaces:**
- Consumes: 源码 `static/`。
- Produces: 每个本地媒体不超过 180 KiB，生产 `static/` 不包含预览 HTML/JS/JSON/CSS。

- [ ] **Step 1: 创建失败的静态资源门禁**

Create `tests/test-static-package-assets.js`：

```javascript
const assert = require('assert')
const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const staticRoot = path.join(root, 'static')
const mediaLimit = 184320
const mediaExtensions = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.mp3', '.wav', '.m4a', '.aac', '.ogg'])
const forbiddenNames = new Set(['demo.css', 'demo_index.html', 'iconfont.css', 'iconfont.js', 'iconfont.json'])
const oversized = []
const previewFiles = []

function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name)
    const stat = fs.statSync(full)
    if (stat.isDirectory()) {
      walk(full)
      continue
    }
    const relative = path.relative(root, full).replaceAll('\\', '/')
    if (mediaExtensions.has(path.extname(name).toLowerCase()) && stat.size > mediaLimit) {
      oversized.push(`${relative}:${stat.size}`)
    }
    if (forbiddenNames.has(name)) previewFiles.push(relative)
  }
}

walk(staticRoot)
assert.deepStrictEqual(oversized, [], `oversized media:\n${oversized.join('\n')}`)
assert.deepStrictEqual(previewFiles, [], `preview files in static/:\n${previewFiles.join('\n')}`)
console.log('微信静态资源包体测试通过')
```

- [ ] **Step 2: 运行测试并确认当前基线失败**

Run: `node tests/test-static-package-assets.js`

Expected: FAIL，并列出 5 个超限 JPG 和 40 个预览/元数据文件。

- [ ] **Step 3: 将 Iconfont 预览文件移出生产 `static/`**

```powershell
$projectRoot = 'D:\Users\ASUS\Desktop\宣誓爱\xuanshiai-vue'
$staticRoot = Join-Path $projectRoot 'static'
$archiveRoot = Join-Path $projectRoot 'dev-assets\iconfont-previews'
$previewNames = @('demo.css', 'demo_index.html', 'iconfont.css', 'iconfont.js', 'iconfont.json')

Get-ChildItem -File -Recurse $staticRoot |
  Where-Object { $previewNames -contains $_.Name } |
  ForEach-Object {
    $relative = $_.FullName.Substring($staticRoot.Length).TrimStart('\')
    $destination = Join-Path $archiveRoot $relative
    New-Item -ItemType Directory -Force -Path (Split-Path -Parent $destination) | Out-Null
    Move-Item -LiteralPath $_.FullName -Destination $destination
  }
```

移动后运行：

```powershell
rg -n --glob '!static/**' --glob '!unpackage/**' `
  'demo_index|iconfont\.(css|js|json)' .
```

Expected: 生产源码不引用已移动文件；字体 `.woff2/.woff/.ttf` 引用保持不变。

- [ ] **Step 4: 创建可重复的 JPEG 压缩脚本**

Create `scripts/optimize-wechat-media.py`：

```python
from __future__ import annotations

import argparse
import os
from pathlib import Path

from PIL import Image, ImageOps


def optimize_jpeg(path: Path, limit: int) -> None:
    with Image.open(path) as source:
        image = ImageOps.exif_transpose(source).convert('RGB')

    temp = path.with_suffix(path.suffix + '.tmp')
    working = image
    try:
        while True:
            for quality in range(84, 54, -3):
                working.save(temp, format='JPEG', quality=quality, optimize=True, progressive=True)
                if temp.stat().st_size <= limit:
                    os.replace(temp, path)
                    print(f'{path}: {path.stat().st_size} bytes')
                    return
            width = max(320, int(working.width * 0.9))
            height = max(320, int(working.height * 0.9))
            if (width, height) == working.size:
                raise RuntimeError(f'cannot compress {path} below {limit} bytes')
            working = working.resize((width, height), Image.Resampling.LANCZOS)
    finally:
        if temp.exists():
            temp.unlink()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument('--limit', type=int, default=184320)
    parser.add_argument('files', nargs='+', type=Path)
    args = parser.parse_args()
    for file in args.files:
        optimize_jpeg(file, args.limit)


if __name__ == '__main__':
    main()
```

- [ ] **Step 5: 压缩五张超限图片**

```powershell
python .\scripts\optimize-wechat-media.py --limit 184320 `
  .\static\portraits\profile-woman-alt.jpg `
  .\static\portraits\profile-man-alt.jpg `
  .\static\portraits\profile-woman-main.jpg `
  .\static\portraits\profile-man-light.jpg `
  .\static\portraits\profile-woman-community.jpg
```

Expected: 每个输出文件均不超过 `184320` 字节。

- [ ] **Step 6: 运行资源测试并做视觉检查**

Run: `node tests/test-static-package-assets.js`

Expected: `微信静态资源包体测试通过`。

用微信开发者工具检查首页、社区、红娘、消息、我的五个 Tab 中出现的头像和 Iconfont，确认没有明显压缩伪影、缺字或字体加载错误。

- [ ] **Step 7: Commit**

```powershell
git add static dev-assets/iconfont-previews scripts/optimize-wechat-media.py tests/test-static-package-assets.js
git commit -m "perf: reduce wechat static package assets"
```

### Task 4: 按业务域迁移三个普通分包

**Files:**
- Create: `tests/test-wechat-subpackages.js`
- Modify protected: `pages.json`
- Move: `pages/community/{publish,topic-list,topic-detail,post-detail,activity-list,activity-detail,my-activities,paper-plane,dating-plane,dating-plane-compose,paper-plane-messages,paper-plane-sent,notifications}.uvue`
- Move: `pages/matchmaker/{apply,detail,payment,become-matchmaker,become-partner,become-promoter,application-success,custom}.uvue`
- Move: `pages/profile/{settings,certification,vip,my-moments}.uvue`
- Move: `pages/user/{detail,edit}.uvue`
- Move: `pages/chat/detail.uvue`
- Move: `pages/mytags/edit.uvue`
- Modify route references in `pages/`, `packages/`, `components/BUSINESS_COMPONENTS.md`, `utils/` and affected `tests/`.

**Interfaces:**
- Consumes: 现有 37 个页面路由。
- Produces: 主包 8 个页面，`community`、`matchmaker`、`account` 三个非独立分包。

- [ ] **Step 1: 创建失败的分包结构测试**

Create `tests/test-wechat-subpackages.js`：

```javascript
const assert = require('assert')
const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const config = JSON.parse(fs.readFileSync(path.join(root, 'pages.json'), 'utf8'))
const mainPages = config.pages.map((page) => page.path)
const packages = new Map((config.subPackages || []).map((item) => [item.name, item]))

assert.deepStrictEqual(mainPages, [
  'pages/index/index',
  'pages/community/community',
  'pages/matchmaker/matchmaker',
  'pages/message/message',
  'pages/profile/profile',
  'pages/auth/login',
  'pages/auth/register',
  'pages/onboarding/profile'
])

assert.deepStrictEqual([...packages.keys()], ['community', 'matchmaker', 'account'])
assert.strictEqual(packages.get('community').root, 'packages/community')
assert.strictEqual(packages.get('matchmaker').root, 'packages/matchmaker')
assert.strictEqual(packages.get('account').root, 'packages/account')
for (const item of packages.values()) assert.notStrictEqual(item.independent, true)

console.log('微信业务分包结构测试通过')
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `node tests/test-wechat-subpackages.js`

Expected: FAIL，因为当前 `pages.json` 没有 `subPackages`。

- [ ] **Step 3: 经明确授权后移动页面文件**

使用 `git mv` 保留历史：

```powershell
$community = @('publish','topic-list','topic-detail','post-detail','activity-list','activity-detail','my-activities','paper-plane','dating-plane','dating-plane-compose','paper-plane-messages','paper-plane-sent','notifications')
$matchmaker = @('apply','detail','payment','become-matchmaker','become-partner','become-promoter','application-success','custom')

New-Item -ItemType Directory -Force packages\community\pages, packages\matchmaker\pages, packages\account\pages | Out-Null
foreach ($name in $community) { git mv "pages/community/$name.uvue" "packages/community/pages/$name.uvue" }
foreach ($name in $matchmaker) { git mv "pages/matchmaker/$name.uvue" "packages/matchmaker/pages/$name.uvue" }

git mv pages/profile/settings.uvue packages/account/pages/settings.uvue
git mv pages/profile/certification.uvue packages/account/pages/certification.uvue
git mv pages/profile/vip.uvue packages/account/pages/vip.uvue
git mv pages/profile/my-moments.uvue packages/account/pages/my-moments.uvue
git mv pages/user/detail.uvue packages/account/pages/user-detail.uvue
git mv pages/user/edit.uvue packages/account/pages/user-edit.uvue
git mv pages/chat/detail.uvue packages/account/pages/chat-detail.uvue
git mv pages/mytags/edit.uvue packages/account/pages/tag-edit.uvue
```

- [ ] **Step 4: 重写 `pages.json` 页面归属**

主包只保留测试中列出的 8 个页面。增加：

```json
"subPackages": [
  {
    "name": "community",
    "root": "packages/community",
    "pages": [
      { "path": "pages/publish", "style": { "navigationBarTitleText": "发布动态" } },
      { "path": "pages/topic-list", "style": { "navigationBarTitleText": "话题" } },
      { "path": "pages/topic-detail", "style": { "navigationBarTitleText": "话题详情" } },
      { "path": "pages/post-detail", "style": { "navigationBarTitleText": "动态详情" } },
      { "path": "pages/activity-list", "style": { "navigationBarTitleText": "线下活动" } },
      { "path": "pages/activity-detail", "style": { "navigationBarTitleText": "活动详情" } },
      { "path": "pages/my-activities", "style": { "navigationBarTitleText": "我的活动" } },
      { "path": "pages/paper-plane", "style": { "navigationBarTitleText": "纸飞机" } },
      { "path": "pages/dating-plane", "style": { "navigationBarTitleText": "脱单纸飞机", "navigationStyle": "custom" } },
      { "path": "pages/dating-plane-compose", "style": { "navigationBarTitleText": "脱单纸飞机", "navigationStyle": "custom" } },
      { "path": "pages/paper-plane-messages", "style": { "navigationBarTitleText": "纸飞机消息", "navigationStyle": "custom" } },
      { "path": "pages/paper-plane-sent", "style": { "navigationBarTitleText": "我发出的", "navigationStyle": "custom" } },
      { "path": "pages/notifications", "style": { "navigationBarTitleText": "社区通知" } }
    ]
  },
  {
    "name": "matchmaker",
    "root": "packages/matchmaker",
    "pages": [
      { "path": "pages/apply", "style": { "navigationBarTitleText": "我要做红娘" } },
      { "path": "pages/detail", "style": { "navigationBarTitleText": "红娘详情" } },
      { "path": "pages/payment", "style": { "navigationBarTitleText": "确认付款" } },
      { "path": "pages/become-matchmaker", "style": { "navigationBarTitleText": "我要做红娘", "navigationStyle": "custom" } },
      { "path": "pages/become-partner", "style": { "navigationBarTitleText": "申请成为合伙人", "navigationStyle": "custom" } },
      { "path": "pages/become-promoter", "style": { "navigationBarTitleText": "申请推广红娘", "navigationStyle": "custom" } },
      { "path": "pages/application-success", "style": { "navigationBarTitleText": "申请成功", "navigationStyle": "custom" } },
      { "path": "pages/custom", "style": { "navigationBarTitleText": "私人定制" } }
    ]
  },
  {
    "name": "account",
    "root": "packages/account",
    "pages": [
      { "path": "pages/settings", "style": { "navigationBarTitleText": "设置" } },
      { "path": "pages/certification", "style": { "navigationBarTitleText": "我的认证" } },
      { "path": "pages/vip", "style": { "navigationBarTitleText": "会员中心" } },
      { "path": "pages/my-moments", "style": { "navigationBarTitleText": "我的动态", "navigationStyle": "custom" } },
      { "path": "pages/user-detail", "style": { "navigationBarTitleText": "用户详情" } },
      { "path": "pages/user-edit", "style": { "navigationBarTitleText": "编辑资料" } },
      { "path": "pages/chat-detail", "style": { "navigationBarTitleText": "聊天" } },
      { "path": "pages/tag-edit", "style": { "navigationBarTitleText": "编辑标签", "navigationStyle": "custom" } }
    ]
  }
],
"preloadRule": {
  "pages/community/community": { "network": "all", "packages": ["community"] },
  "pages/matchmaker/matchmaker": { "network": "all", "packages": ["matchmaker"] },
  "pages/message/message": { "network": "all", "packages": ["account"] },
  "pages/profile/profile": { "network": "all", "packages": ["account"] }
}
```

- [ ] **Step 5: 按固定映射更新全部路由和文档**

| 旧前缀 | 新前缀 |
|---|---|
| `/pages/community/页面名` | `/packages/community/pages/页面名` |
| `/pages/matchmaker/页面名` | `/packages/matchmaker/pages/页面名` |
| `/pages/profile/settings` | `/packages/account/pages/settings` |
| `/pages/profile/certification` | `/packages/account/pages/certification` |
| `/pages/profile/vip` | `/packages/account/pages/vip` |
| `/pages/profile/my-moments` | `/packages/account/pages/my-moments` |
| `/pages/user/detail` | `/packages/account/pages/user-detail` |
| `/pages/user/edit` | `/packages/account/pages/user-edit` |
| `/pages/chat/detail` | `/packages/account/pages/chat-detail` |
| `/pages/mytags/edit` | `/packages/account/pages/tag-edit` |

先执行：

```powershell
rg -n --glob '!unpackage/**' --glob '!node_modules/**' `
  'pages/(community|matchmaker|profile|user|chat|mytags)/' .
```

更新所有业务跳转、`components/BUSINESS_COMPONENTS.md` 和测试中的文件路径/路由断言。完成后重复该搜索，只允许保留五个主包页面和明确的历史说明。

- [ ] **Step 6: 更新受页面移动影响的测试**

至少修改并运行：

```powershell
node tests/test-community-flow.js
node tests/test-paper-plane-ui.js
node tests/test-paper-plane-conversation-flow.js
node tests/test-role-application-flow.js
node tests/test-custom-payment-flow.js
node tests/test-matchmaker-avatar-fallback.js
node tests/test-matchmaker-rating-format.js
node tests/test-matchmaker-contact-flow.js
node tests/test-chat-detail-ui.js
node tests/test-mock-system.js
node tests/test-wechat-subpackages.js
```

Expected: 全部退出码为 `0`。

- [ ] **Step 7: Commit**

```powershell
git add pages packages pages.json components/BUSINESS_COMPONENTS.md utils tests
git commit -m "perf: split wechat secondary flows into packages"
```

### Task 5: HBuilderX 编译、预算验收和微信回归

**Files:**
- Verify generated: `unpackage/dist/dev/mp-weixin/app.json`
- Verify generated: `unpackage/dist/dev/mp-weixin/project.config.json`
- Modify: `docs/PROJECT_STATUS.md`
- Modify: `docs/待完成事项.md`

**Interfaces:**
- Consumes: Task 1-4 的源码结果。
- Produces: 通过内部预算的最新微信产物和端侧验收记录。

- [ ] **Step 1: 运行源码和配置测试**

```powershell
node tests/test-mock-system.js
node tests/test-wechat-project-config.js
node tests/test-wechat-app-quality.js
node tests/test-static-package-assets.js
node tests/test-wechat-subpackages.js
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\tests\test-wechat-package-quality.ps1
git diff --check
```

Expected: 全部退出码为 `0`，`git diff --check` 无输出。

- [ ] **Step 2: 通过 HBuilderX 重新编译 `mp-weixin`**

```powershell
& 'D:\Users\ASUS\tools\HBuilderX\cli.exe' launch mp-weixin `
  --project 'D:\Users\ASUS\Desktop\宣誓爱\xuanshiai-vue' `
  --compile true
```

记录 HBuilderX 版本、编译开始/结束时间和第一条错误；只有编译退出成功且关键文件时间戳更新，才进入下一步。

- [ ] **Step 3: 验证生成配置和内部预算**

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass `
  -File .\scripts\check-wechat-package-quality.ps1 `
  -ArtifactPath .\unpackage\dist\dev\mp-weixin `
  -IncludeQualityAudit `
  -SummaryOnly `
  -IncludeHashes `
  -MediaLimitBytes 184320 `
  -MainPackageLimitBytes 1572864 `
  -SubpackageLimitBytes 1572864
```

Expected:

- `ok=true`。
- `lazyCodeLoading.enabled=true`。
- `subpackages.count=3`。
- 主包不超过 1.5 MiB。
- 三个分包分别不超过 1.5 MiB。
- `media.oversized` 为空。
- `suspiciousStatic` 为空。

- [ ] **Step 4: 打开准确产物并执行冒烟回归**

```powershell
& 'C:\Program Files (x86)\Tencent\微信web开发者工具\cli.bat' open `
  --project 'D:\Users\ASUS\Desktop\宣誓爱\xuanshiai-vue\unpackage\dist\dev\mp-weixin'
```

依次验证：

1. 首页和五个 TabBar 页面首次进入不白屏。
2. 社区进入话题详情、动态详情、活动详情、纸飞机和发布页。
3. 红娘进入详情、私人定制、角色申请和付款页。
4. 消息进入聊天页；我的进入设置、认证、会员和编辑资料。
5. 每个首次进入的分包只出现一次合理加载，不出现页面不存在或资源路径错误。
6. 控制台无新增组件、字体、图片、分包或路由错误。

- [ ] **Step 5: 更新状态文档并刷新知识图谱**

在 `docs/PROJECT_STATUS.md` 和 `docs/待完成事项.md` 记录：

- 实际主包/分包大小。
- `lazyCodeLoading` 生成证据。
- 媒体和静态残留结果。
- HBuilderX 与微信开发者工具回归状态。

然后从工作区根目录运行：

```powershell
Set-Location 'D:\Users\ASUS\Desktop\宣誓爱'
graphify update .
```

- [ ] **Step 6: Final commit**

```powershell
Set-Location 'D:\Users\ASUS\Desktop\宣誓爱\xuanshiai-vue'
git add docs/PROJECT_STATUS.md docs/待完成事项.md
git commit -m "docs: close wechat package quality governance"
```

## Completion Criteria

- 生成 `app.json` 包含 `"lazyCodeLoading": "requiredComponents"`。
- 主包和每个分包均不超过 1.5 MiB 内部预算。
- 生成产物存在 3 个普通分包，五个 TabBar 页面仍在主包。
- 源码和生成产物均无超过 180 KiB 的本地图片或音频。
- 生产 `static/` 不包含 Demo HTML、预览 JS/JSON/CSS 或设计源文件。
- 所有受影响 Node/PowerShell 测试通过。
- HBuilderX 重新编译成功，微信开发者工具关键路径回归完成。
- 文档和 Graphify 图谱同步到最终实现。