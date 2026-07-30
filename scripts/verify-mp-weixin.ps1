<#
.SYNOPSIS
  宣誓爱微信小程序产物质量检查门禁。

.DESCRIPTION
  包装 .zcode/skills/debug-wechat-build-artifacts/scripts/inspect-wechat-artifact.ps1，
  为 xuanshiai-vue 项目提供固定的默认路径和预算参数。
  可从 npm script、CI 或命令行直接调用。

  退出代码：0 = 全部通过，2 = 质量审计失败，1 = 运行时/参数错误。

.PARAMETER ArtifactPath
  产物目录（mp-weixin）。默认从项目约定路径推导：
    <项目根>/xuanshiai-vue/unpackage/dist/dev/mp-weixin

.PARAMETER ConfigPath
  project.config.json 所在路径，用于提取 AppID 等元信息。
  默认从 ArtifactPath 同级查找。

.PARAMETER MainPackageLimitBytes
  主包大小限制，默认 2 MiB。

.PARAMETER SubpackageLimitBytes
  单个分包大小限制，默认 2 MiB。

.PARAMETER MediaLimitBytes
  媒体文件阈值，默认 200 KiB。

.EXAMPLE
  # 使用项目默认产物路径
  powershell -NoProfile -ExecutionPolicy Bypass -File scripts/verify-mp-weixin.ps1

  # 指定自定义产物路径
  powershell -NoProfile -ExecutionPolicy Bypass -File scripts/verify-mp-weixin.ps1 `
    -ArtifactPath "D:\build\mp-weixin"
#>

[CmdletBinding()]
param(
  [string]$ArtifactPath,
  [string]$ConfigPath,
  [long]$MainPackageLimitBytes = 2097152,
  [long]$SubpackageLimitBytes = 2097152,
  [long]$MediaLimitBytes = 204800
)

$ErrorActionPreference = 'Stop'

# 解析技能脚本路径 — 从本包装脚本相对定位
$wrapperDir = Split-Path -Parent $PSCommandPath
$projectRoot = Split-Path -Parent $wrapperDir
$skillDir = Resolve-Path (Join-Path $projectRoot '..\.zcode\skills\debug-wechat-build-artifacts')
$checker = Join-Path $skillDir 'scripts\inspect-wechat-artifact.ps1'

if (-not (Test-Path -LiteralPath $checker -PathType Leaf)) {
  Write-Error "技能脚本未找到: $checker"
  exit 1
}

# 默认产物路径
if (-not $ArtifactPath) {
  $ArtifactPath = Join-Path $projectRoot 'unpackage\dist\dev\mp-weixin'
}
if (-not $ConfigPath) {
  $ConfigPath = Join-Path $ArtifactPath 'project.config.json'
}

Write-Host "=== 宣誓爱微信小程序产物质量检查 ===" -ForegroundColor Cyan
Write-Host "产物目录:       $ArtifactPath" -ForegroundColor Gray
Write-Host "技能脚本:       $checker" -ForegroundColor Gray

# 前置校验
if (-not (Test-Path -LiteralPath $ArtifactPath -PathType Container)) {
  Write-Error "产物目录不存在：$ArtifactPath"
  Write-Host "请先执行 npm run build:mp-weixin 或 npm run dev:mp-weixin 生成产物。" -ForegroundColor Yellow
  exit 1
}

# 执行质量审计
$params = @(
  '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', "`"$checker`""
  '-ArtifactPath', "`"$ArtifactPath`""
  '-IncludeQualityAudit'
  '-SummaryOnly'
  '-MainPackageLimitBytes', "$MainPackageLimitBytes"
  '-SubpackageLimitBytes', "$SubpackageLimitBytes"
  '-MediaLimitBytes', "$MediaLimitBytes"
)

$raw = & powershell.exe $params 2>&1 | Out-String
$exitCode = $LASTEXITCODE

try {
  $result = $raw | ConvertFrom-Json
} catch {
  Write-Warning "脚本输出解析失败，展示原始输出："
  Write-Host $raw
  exit 1
}

# 输出摘要
if ($result.qualityAudit) {
  $qa = $result.qualityAudit
  Write-Host "`n--- 懒加载 ---" -ForegroundColor Cyan
  if ($qa.lazyCodeLoading.enabled) {
    Write-Host "  [通过] lazyCodeLoading = requiredComponents" -ForegroundColor Green
  } else {
    Write-Host "  [失败] $($qa.lazyCodeLoading.value)" -ForegroundColor Red
  }

  Write-Host "`n--- 包体积 ---" -ForegroundColor Cyan
  $pkg = $qa.packages
  if ($pkg.main.passed) {
    Write-Host "  [通过] 主包 $([math]::Round($pkg.main.bytes / 1KB, 1)) KiB / 上限 $([math]::Round($pkg.main.limitBytes / 1KB, 1)) KiB" -ForegroundColor Green
  } else {
    Write-Host "  [失败] 主包 $([math]::Round($pkg.main.bytes / 1KB, 1)) KiB 超过上限 $([math]::Round($pkg.main.limitBytes / 1KB, 1)) KiB" -ForegroundColor Red
  }
  foreach ($sp in $pkg.subpackages) {
    if ($sp.passed) {
      Write-Host "  [通过] 分包 $($sp.root) $([math]::Round($sp.bytes / 1KB, 1)) KiB / 上限 $([math]::Round($sp.limitBytes / 1KB, 1)) KiB" -ForegroundColor Green
    } else {
      Write-Host "  [失败] 分包 $($sp.root) $([math]::Round($sp.bytes / 1KB, 1)) KiB 超过上限 $([math]::Round($sp.limitBytes / 1KB, 1)) KiB" -ForegroundColor Red
    }
  }

  Write-Host "`n--- 媒体资源 ---" -ForegroundColor Cyan
  if ($qa.media.oversized.Count -eq 0) {
    Write-Host "  [通过] 所有 $($qa.media.totalCount) 个媒体文件未超限" -ForegroundColor Green
  } else {
    Write-Host "  [失败] $($qa.media.oversized.Count) 个文件超过 $([math]::Round($qa.media.limitBytes / 1KB, 0)) KiB：" -ForegroundColor Red
    foreach ($m in $qa.media.oversized) {
      Write-Host "    - $($m.relativePath) ($($m.sizeKB) KiB)" -ForegroundColor Yellow
    }
  }

  Write-Host "`n--- 可疑静态文件 ---" -ForegroundColor Cyan
  if ($qa.suspiciousStatic.Count -eq 0) {
    Write-Host "  [通过] 未发现可疑残留" -ForegroundColor Green
  } else {
    Write-Host "  [警告] $($qa.suspiciousStatic.Count) 个可疑文件：" -ForegroundColor Yellow
    foreach ($s in $qa.suspiciousStatic) {
      Write-Host "    - $($s.relativePath) : $($s.reason)" -ForegroundColor Yellow
    }
  }

  Write-Host "`n--- 页面声明 vs 产物 ---" -ForegroundColor Cyan
  $pageCheck = $result.checks | Where-Object { $_.name -eq 'pages-declared-vs-generated' } | Select-Object -First 1
  if ($pageCheck -and $pageCheck.passed) {
    Write-Host "  [通过] $($pageCheck.detail)" -ForegroundColor Green
  } elseif ($pageCheck) {
    Write-Host "  [失败] $($pageCheck.detail)" -ForegroundColor Red
  }
}

# 结果
Write-Host "`n=== 结论 ===" -ForegroundColor Cyan
if ($result.ok) {
  Write-Host "  通过！" -ForegroundColor Green
  exit 0
} else {
  Write-Host "  失败。检查上方红色标记项。" -ForegroundColor Red
  exit 2
}
