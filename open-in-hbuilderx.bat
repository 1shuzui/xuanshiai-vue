@echo off
setlocal

set "PROJECT_DIR=%~dp0"
set "HBUILDER_CLI=D:\xuanshiai_runtime\hbuilderx\HBuilderX\cli.exe"
set "HBUILDER_EXE=D:\xuanshiai_runtime\hbuilderx\HBuilderX\HBuilderX.exe"

if not exist "%HBUILDER_CLI%" (
  echo HBuilderX CLI was not found at:
  echo %HBUILDER_CLI%
  echo Open this folder directly in HBuilderX instead:
  echo %PROJECT_DIR%
  pause
  exit /b 1
)

"%HBUILDER_CLI%" open --project "%PROJECT_DIR%"
if errorlevel 1 (
  start "" "%HBUILDER_EXE%" "%PROJECT_DIR%"
)
