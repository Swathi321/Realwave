set deploymentPath=../deployment\Realwave_Frontend_Test
set sourceCodePath=../Frontend\build
set remotePath=/client
set ftpHost=ftp://devesh:tp9jbwKrhdBr@test.realwave.io
set uploadScriptPath=Common/Upload_Frontend.txt
if exist "%deploymentPath%" (del /f /s /q "%deploymentPath%" 1>nul) else (mkdir "%deploymentPath%")
xcopy "%sourceCodePath%" "%deploymentPath%" /d/k/e/v/h/r/y
winscp /script="%uploadScriptPath%" 