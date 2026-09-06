<#
.SYNOPSIS
  Quality gate for the Xuanshiai mp-weixin build artifact.

.DESCRIPTION
  This project-local checker intentionally has no dependency on an uncommitted
  developer skill directory. It checks lazy loading, package and media sizes,
  suspicious static files, and app.json page declarations against generated
  artifact files.

  Exit codes: 0 = pass, 2 = quality failure, 1 = missing artifact or runtime error.
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

function Get-FileSize([object[]]$Files) {
  $total = [long]0
  foreach ($file in $Files) { $total += [long]$file.Length }
  return $total
}

function Format-Size([long]$Bytes) {
  return ('{0:N1} KiB' -f ($Bytes / 1KB))
}

function Get-PagePaths([object]$AppConfig) {
  $paths = @()
  foreach ($page in @($AppConfig.pages)) {
    if ($page -is [string]) { $paths += $page }
    elseif ($null -ne $page.path) { $paths += [string]$page.path }
  }
  $packages = @()
  if ($null -ne $AppConfig.subPackages) { $packages = @($AppConfig.subPackages) }
  elseif ($null -ne $AppConfig.subpackages) { $packages = @($AppConfig.subpackages) }
  foreach ($package in $packages) {
    $root = if ($null -ne $package.root) { ([string]$package.root).Trim('/') } else { '' }
    if ($root.Length -eq 0) { continue }
    foreach ($page in @($package.pages)) {
      $path = if ($page -is [string]) { $page } elseif ($null -ne $page.path) { [string]$page.path } else { '' }
      if ($path.Length -gt 0) { $paths += ($root + '/' + $path.TrimStart('/')) }
    }
  }
  return @($paths | Select-Object -Unique)
}

$wrapperDir = Split-Path -Parent $PSCommandPath
$projectRoot = Split-Path -Parent $wrapperDir
if (-not $ArtifactPath) { $ArtifactPath = Join-Path $projectRoot 'unpackage\dist\dev\mp-weixin' }
if (-not $ConfigPath) { $ConfigPath = Join-Path $ArtifactPath 'project.config.json' }

Write-Host '=== Xuanshiai mp-weixin artifact quality check ===' -ForegroundColor Cyan
Write-Host "Artifact: $ArtifactPath" -ForegroundColor Gray

if (-not (Test-Path -LiteralPath $ArtifactPath -PathType Container)) {
  Write-Host "ERROR: Artifact directory does not exist: $ArtifactPath. Build mp-weixin with HBuilderX or an installed Uni CLI first." -ForegroundColor Red
  exit 1
}

$appJsonPath = Join-Path $ArtifactPath 'app.json'
if (-not (Test-Path -LiteralPath $appJsonPath -PathType Leaf)) {
  Write-Host "ERROR: Compiled app.json was not found: $appJsonPath" -ForegroundColor Red
  exit 1
}

try {
  $appConfig = Get-Content -LiteralPath $appJsonPath -Raw -Encoding UTF8 | ConvertFrom-Json
  $allFiles = @(Get-ChildItem -LiteralPath $ArtifactPath -Recurse -File)
} catch {
  Write-Host "ERROR: Unable to read mp-weixin artifact: $($_.Exception.Message)" -ForegroundColor Red
  exit 1
}

$artifactRoot = (Resolve-Path -LiteralPath $ArtifactPath).Path.TrimEnd('\') + '\'
$failures = @()

Write-Host "`n--- Lazy loading ---" -ForegroundColor Cyan
if ([string]$appConfig.lazyCodeLoading -eq 'requiredComponents') {
  Write-Host '  [PASS] lazyCodeLoading = requiredComponents' -ForegroundColor Green
} else {
  $failures += 'lazyCodeLoading is not requiredComponents'
  Write-Host "  [FAIL] lazyCodeLoading = $($appConfig.lazyCodeLoading)" -ForegroundColor Red
}

$packages = @()
if ($null -ne $appConfig.subPackages) { $packages = @($appConfig.subPackages) }
elseif ($null -ne $appConfig.subpackages) { $packages = @($appConfig.subpackages) }
$subRoots = @($packages | ForEach-Object { if ($null -ne $_.root) { ([string]$_.root).Trim('/') } } | Where-Object { $_.Length -gt 0 })

$mainFiles = @()
foreach ($file in $allFiles) {
  $relative = $file.FullName.Substring($artifactRoot.Length).Replace('\', '/')
  $inSubpackage = $false
  foreach ($root in $subRoots) {
    if ($relative.StartsWith($root + '/', [System.StringComparison]::OrdinalIgnoreCase)) {
      $inSubpackage = $true
      break
    }
  }
  if (-not $inSubpackage) { $mainFiles += $file }
}

Write-Host "`n--- Package size ---" -ForegroundColor Cyan
$mainBytes = Get-FileSize $mainFiles
if ($mainBytes -le $MainPackageLimitBytes) {
  Write-Host "  [PASS] main $(Format-Size $mainBytes) / limit $(Format-Size $MainPackageLimitBytes)" -ForegroundColor Green
} else {
  $failures += 'main package exceeds its size limit'
  Write-Host "  [FAIL] main $(Format-Size $mainBytes) / limit $(Format-Size $MainPackageLimitBytes)" -ForegroundColor Red
}
foreach ($root in $subRoots) {
  $prefix = $root + '/'
  $files = @($allFiles | Where-Object {
    $relative = $_.FullName.Substring($artifactRoot.Length).Replace('\', '/')
    $relative.StartsWith($prefix, [System.StringComparison]::OrdinalIgnoreCase)
  })
  $bytes = Get-FileSize $files
  if ($bytes -le $SubpackageLimitBytes) {
    Write-Host "  [PASS] subpackage $root $(Format-Size $bytes) / limit $(Format-Size $SubpackageLimitBytes)" -ForegroundColor Green
  } else {
    $failures += "subpackage $root exceeds its size limit"
    Write-Host "  [FAIL] subpackage $root $(Format-Size $bytes) / limit $(Format-Size $SubpackageLimitBytes)" -ForegroundColor Red
  }
}

Write-Host "`n--- Media ---" -ForegroundColor Cyan
$mediaExtensions = @('.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.mp3', '.wav', '.aac', '.m4a', '.mp4')
$oversizedMedia = @($allFiles | Where-Object { $mediaExtensions -contains $_.Extension.ToLowerInvariant() -and $_.Length -gt $MediaLimitBytes })
if ($oversizedMedia.Count -eq 0) {
  Write-Host "  [PASS] all media files are within $(Format-Size $MediaLimitBytes)" -ForegroundColor Green
} else {
  $failures += 'one or more media files exceed the size limit'
  Write-Host "  [FAIL] $($oversizedMedia.Count) media files exceed $(Format-Size $MediaLimitBytes):" -ForegroundColor Red
  foreach ($file in $oversizedMedia) {
    $relative = $file.FullName.Substring($artifactRoot.Length).Replace('\', '/')
    Write-Host "    - $relative ($(Format-Size $file.Length))" -ForegroundColor Yellow
  }
}

Write-Host "`n--- Suspicious static files ---" -ForegroundColor Cyan
$suspiciousExtensions = @('.pen', '.psd', '.sketch', '.fig', '.zip', '.rar')
$suspiciousFiles = @($allFiles | Where-Object { $suspiciousExtensions -contains $_.Extension.ToLowerInvariant() })
if ($suspiciousFiles.Count -eq 0) {
  Write-Host '  [PASS] no suspicious static files found' -ForegroundColor Green
} else {
  Write-Host "  [WARN] $($suspiciousFiles.Count) static files need review:" -ForegroundColor Yellow
  foreach ($file in $suspiciousFiles) {
    $relative = $file.FullName.Substring($artifactRoot.Length).Replace('\', '/')
    Write-Host "    - $relative" -ForegroundColor Yellow
  }
}

Write-Host "`n--- Declared pages vs artifact ---" -ForegroundColor Cyan
$declaredPages = @(Get-PagePaths $appConfig)
$missingPages = @()
foreach ($pagePath in $declaredPages) {
  $normalized = ([string]$pagePath).TrimStart('/').Replace('/', '\')
  $generated = @('.js', '.wxml', '.json') | Where-Object { Test-Path -LiteralPath (Join-Path $ArtifactPath ($normalized + $_)) -PathType Leaf }
  if ($generated.Count -eq 0) { $missingPages += $pagePath }
}
if ($missingPages.Count -eq 0) {
  Write-Host "  [PASS] all $($declaredPages.Count) declared pages were generated" -ForegroundColor Green
} else {
  $failures += 'app.json declares pages that are not generated'
  Write-Host "  [FAIL] missing generated pages: $($missingPages -join ', ')" -ForegroundColor Red
}

Write-Host "`n=== Result ===" -ForegroundColor Cyan
if ($failures.Count -eq 0) {
  Write-Host '  PASS' -ForegroundColor Green
  exit 0
}

Write-Host '  FAIL: see checks above.' -ForegroundColor Red
exit 2
