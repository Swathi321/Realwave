set deploymentPath=../deployment\Realwave_Backend_Prod
set sourceCodePath=../Backend
set remotePath=/
set ftpHost=ftp://realwave-live:p7DRy3ypv4Dc@live.realwave.io
set uploadScriptPath=Common/Upload_Backend.txt
if exist "%deploymentPath%" (del /f /s /q "%deploymentPath%" 1>nul) else (mkdir "%deploymentPath%")
xcopy "%sourceCodePath%" "%deploymentPath%" /d/k/e/v/h/r/y/c
winscp /script="%uploadScriptPath%"