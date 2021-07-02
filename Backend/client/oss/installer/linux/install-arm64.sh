echo "Realwave OSS Setup Started";

if [ "$1" = "manual" ]; 
	then
    		echo "Interacctive/Manual mode enabled"
	else
		echo "auto mode enabled"
fi

sudo rm /var/lib/apt/lists/lock
sudo rm /var/cache/apt/archives/lock
cd /var/lib/dpkg/updates
sudo rm *
sudo apt-get update

apt-get install curl libunwind8 gettext -y;
curl -O https://download.visualstudio.microsoft.com/download/pr/5ee48114-19bf-4a28-89b6-37cab15ec3f2/f5d1f54ca93ceb8be7d8e37029c8e0f2/dotnet-sdk-3.1.302-linux-arm64.tar.gz
curl -O https://download.visualstudio.microsoft.com/download/pr/76829580-79b2-4ec5-97ff-1a733936af14/6ba68613c7491951b896396f7d7490d9/aspnetcore-runtime-3.1.6-linux-arm64.tar.gz
mkdir -p /usr/share/dotnet
tar zxf dotnet-sdk-3.1.302-linux-arm64.tar.gz -C /usr/share/dotnet;
export DOTNET_ROOT=/usr/share/dotnet;
export PATH=$PATH:/usr/share/dotnet;
echo "export DOTNET_ROOT=/usr/share/dotnet">> /home/realwave/.bashrc;
echo "export PATH=$PATH:/usr/share/dotnet">>/home/realwave/.bashrc;
tar zxf aspnetcore-runtime-3.1.6-linux-arm64.tar.gz -C /usr/share/dotnet;
apt-get update -y;
apt-get install ffmpeg -y;
rm realwave-oss-arm64.zip* -rf;
rm /oss -rf;
rm /realwave-daemon -rf;
curl -O https://devportal.realwave.io/oss/installer/linux/realwave-oss-arm64.zip;
unzip realwave-oss-arm64.zip -d /oss;
chmod +x /oss/OSS
if [ "$1" = "manual" ]; then
serialKeyBackup=$(cat /serialKey.txt)
if [ -z "$serialKeyBackup" ];
	then	
		echo "\$serialKeyBackup is empty, so no serial key back up available"
	else
		while true; do
    			read -p "We found a backup serial key. Do you wish to install $serialKeyBackup backup serial key?" yn
    			case $yn in
        			[Yy]* ) cp /serialKey.txt /oss ; break;;
        			[Nn]* ) exit;;
        			* ) echo "Please answer yes or no.";;
    			esac
		done
      		echo "\$var is the backup serial key available. Do you like to use it? [y/n] "

fi
fi
rm aspnetcore*
rm dotnet-sdk*
rm realwave-oss-arm64*
sudo cp /oss/realwave.service /etc/systemd/system
sudo systemctl daemon-reload
sudo systemctl reset-failed
sudo systemctl enable realwave
sudo systemctl start realwave
#sudo systemctl status realwave
echo "Install Daemon Service";
curl -O https://devportal.realwave.io/oss/installer/linux/realwave-daemon-arm64.zip;
unzip realwave-daemon-arm64.zip  -d /realwave-daemon;
sudo cp /realwave-daemon/realwave-daemon.service /etc/systemd/system
sudo systemctl daemon-reload
sudo systemctl reset-failed
sudo systemctl enable realwave-daemon
sudo systemctl start realwave-daemon
#sudo systemctl status realwave-daemon
rm realwave-daemon-arm64.zip;
echo "Install Daemon Upgrade Service";
curl -O https://devportal.realwave.io/oss/installer/linux/daemon-upgrade-arm64.zip;
unzip daemon-upgrade-arm64.zip -d /realwave-daemon-upgrade;
rm daemon-upgrade-arm64.zip;
sudo cp /realwave-daemon-upgrade/realwave-daemon-upgrade.service /etc/systemd/system
cd /realwave-daemon-upgrade
curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
sudo apt install nodejs -y
sudo apt-get install p7zip-full -y
npm install
sudo systemctl daemon-reload
sudo systemctl reset-failed
sudo systemctl enable realwave-daemon-upgrade
sudo systemctl start realwave-daemon-upgrade
#sudo systemctl status realwave-daemon-upgrade

echo " "
echo "***TOTAL INSTALL TIME = $SECONDS secs ***"
echo " "
echo "***INSTALL STATUS***"
sudo systemctl status realwave;
sleep 1
sudo systemctl status realwave-daemon-upgrade;
sleep 1
sudo systemctl status realwave-daemon;

#Enable the VNC server to start each time you log in
mkdir -p ~/.config/autostart
cp /usr/share/applications/vino-server.desktop ~/.config/autostart/.
cd /usr/lib/systemd/user/graphical-session.target.wants
sudo ln -s ../vino-server.service ./.

#Configure the VNC server
gsettings set org.gnome.Vino prompt-enabled false
gsettings set org.gnome.Vino require-encryption false

#Set a password to access the VNC server
gsettings set org.gnome.Vino require-encryption false
gsettings set org.gnome.Vino authentication-methods "['vnc']"
gsettings set org.gnome.Vino vnc-password $(echo -n 'realwave'|base64)

echo "Setup Completed, Box will reboot now";

sudo reboot now
