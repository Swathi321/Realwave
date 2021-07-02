set deploymentPath=../deployment\Realwave_Backend_Test
set sourceCodePath=../Backend
set remotePath=/
set ftpHost=ftp://devesh:tp9jbwKrhdBr@test.realwave.io
set uploadScriptPath=Common/Upload_Backend.txt
if exist "%deploymentPath%" (del /f /s /q "%deploymentPath%" 1>nul) else (mkdir "%deploymentPath%")
xcopy "%sourceCodePath%" "%deploymentPath%" /d/k/e/v/h/r/y/c
winscp /script="%uploadScriptPath%"