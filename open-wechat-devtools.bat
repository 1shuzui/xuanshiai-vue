@echo off
setlocal

set "MINIPROGRAM_DIR=%~dp0unpackage\dist\dev\mp-weixin"
set "WECHAT_CLI="

if not exist "%MINIPROGRAM_DIR%\project.config.json" (
  echo Mini Program output was not found:
  echo %MINIPROGRAM_DIR%
  echo Run the project to WeChat Mini Program from HBuilderX first.
  pause
  exit /b 1
)

for /f "delims=" %%F in ('where /r D:\ cli.bat 2^>nul') do (
  echo %%F | findstr /i "web" >nul && set "WECHAT_CLI=%%F"
)

if not defined WECHAT_CLI (
  echo WeChat DevTools CLI was not found under D:\.
  pause
  exit /b 1
)

call "%WECHAT_CLI%" open --project "%MINIPROGRAM_DIR%"
