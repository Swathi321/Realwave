set deploymentPath=../deployment\Realwave_Frontend_Prod
set sourceCodePath=../Frontend\build
set remotePath=/client
set ftpHost=ftp://realwave-live:p7DRy3ypv4Dc@live.realwave.io
set uploadScriptPath=Common/Upload_Frontend.txt
if exist "%deploymentPath%" (del /f /s /q "%deploymentPath%" 1>nul) else (mkdir "%deploymentPath%")
xcopy "%sourceCodePath%" "%deploymentPath%" /d/k/e/v/h/r/y
winscp /script="%uploadScriptPath%" 