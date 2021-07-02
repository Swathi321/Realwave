cd ../Frontend
call yarn install --network-timeout 1000000
xcopy node_modules_changes\*.* node_modules\ /s /y /q
call npm run build
cd ../DeploymentScripts