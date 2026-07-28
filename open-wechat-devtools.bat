@echo off
setlocal

set "MINIPROGRAM_DIR=%~dp0unpackage\dist\dev\mp-weixin"
set "WECHAT_CLI=D:\soft\wxkaifa\微信web开发者工具\cli.bat"

if not exist "%MINIPROGRAM_DIR%\project.config.json" (
  echo Mini Program output was not found:
  echo %MINIPROGRAM_DIR%
  echo Run the project to WeChat Mini Program from HBuilderX first.
  pause
  exit /b 1
)

if not exist "%WECHAT_CLI%" (
  echo WeChat DevTools CLI was not found at:
  echo %WECHAT_CLI%
  pause
  exit /b 1
)

call "%WECHAT_CLI%" open --project "%MINIPROGRAM_DIR%"
