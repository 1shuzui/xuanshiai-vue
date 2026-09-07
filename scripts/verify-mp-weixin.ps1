<#
  Windows entry point for the project-local mp-weixin artifact quality gate.
  Exit codes: 0 = pass, 2 = quality failure, 1 = missing input / runtime failure.
#>
[CmdletBinding()]
param(
  [string]$ArtifactPath,
  [string]$ConfigPath,
  [ValidateSet('production', 'development')][string]$Mode = 'production',
  [switch]$RequireBuild,
  [string]$ReportPath,
  [long]$MainPackageLimitBytes = 2097152,
  [long]$SubpackageLimitBytes = 2097152,
  [long]$MediaLimitBytes = 204800
)
$ErrorActionPreference = 'Stop'
$checker = Join-Path $PSScriptRoot 'verify-mp-weixin.cjs'
$arguments = @($checker, '--mode', $Mode, '--main-limit', "$MainPackageLimitBytes", '--sub-limit', "$SubpackageLimitBytes", '--media-limit', "$MediaLimitBytes")
if ($ArtifactPath) { $arguments += @('--artifact', $ArtifactPath) }
if ($ConfigPath) { $arguments += @('--config', $ConfigPath) }
if ($ReportPath) { $arguments += @('--report', $ReportPath) }
if ($RequireBuild) { $arguments += '--require-build' }
try { & node @arguments; exit $LASTEXITCODE }
catch { Write-Error $_; exit 1 }
