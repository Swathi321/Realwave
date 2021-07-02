cd ../Backend
call yarn install --network-timeout 1000000
call dos2unix client\oss\installer\linux\install-arm64.sh
call dos2unix client\oss\installer\linux\uninstall.sh
call dos2unix client\realwave-upgrade.sh
cd ../DeploymentScripts