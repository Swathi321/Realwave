set deploymentPath=../deployment\Realwave_Frontend_Portal
set sourceCodePath=../Frontend\build
set remotePath=/client
set ftpHost=ftp://realwave-portal:6NmwhZUjNUx6@portal.realwave.io
set uploadScriptPath=Common/Upload_Frontend.txt
if exist "%deploymentPath%" (del /f /s /q "%deploymentPath%" 1>nul) else (mkdir "%deploymentPath%")
xcopy "%sourceCodePath%" "%deploymentPath%" /d/k/e/v/h/r/y
winscp /script="%uploadScriptPath%" 