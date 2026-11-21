@echo off
setlocal
cd /d "%~dp0"
set "ATLAS_NODE=node.exe"
where node.exe >nul 2>nul
if errorlevel 1 set "ATLAS_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
"%ATLAS_NODE%" "%~dp0scripts\launch-preview.mjs"
if errorlevel 1 (
  echo.
  echo ATLAS could not start. See the message above.
  pause
)
endlocal
