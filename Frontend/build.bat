@echo off
cls
:start
echo
echo 1. For install node and build application
set /p choice=Enter your choice and press enter.

if not '%choice%'=='1' ECHO "%choice%" is not valid please try again
if '%choice%'=='1' goto install

ECHO.
goto start
:install
call npm install
xcopy node_modules_changes\*.* node_modules\ /s /y
goto end

