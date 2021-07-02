if [ "$1" = "manual" ];
        then
                echo "Interacctive/Manual mode enabled"
		serialKeyBackup=$(cat /oss/serialKey.txt)
		if [ -z "$serialKeyBackup" ];
		        then
                		echo "\$serialKeyBackup is empty, so no serial key available for backup"
		        else
		                while true; do
                		        read -p "We found a serial key @/oss/serialKey.txt. Do you wish to backup this serialKey $serialKeyBackup ?" yn
		                        case $yn in
		                                [Yy]* ) cp /oss/serialKey.txt / ; break;;
		                                [Nn]* ) exit;;
		                                * ) echo "Please answer yes or no.";;
		                        esac
		                done

		fi
	else
                echo "auto mode enabled"
fi

cat /serialKey.txt
echo " "
systemctl stop realwave
systemctl disable realwave
systemctl stop realwave-daemon
systemctl disable realwave-daemon
systemctl stop realwave-daemon-upgrade
systemctl disable realwave-daemon-upgrade

rm /etc/systemd/system/realwave-daemon.service
rm /etc/systemd/system/realwave.service
rm /etc/systemd/system/realwave-daemon-upgrade.service

systemctl daemon-reload
systemctl reset-failed

rm /oss -rf
rm /realwave-daemon -rf
rm /realwave-daemon-upgrade -rf

rm /home/realwave/realwave-oss-arm64.zip
rm /home/realwave/realwave-daemon-arm64.zip
rm /home/realwave/daemon-upgrade-arm64.zip
echo "Realwave Uninstalled"
