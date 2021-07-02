let PTZConfig = {
    templates: [
        {
            "id": 1,
            "brand": "Toshiba",
            "modal": "",
            "commandUrl": "{url}/cgi-bin/camctrl/eCamCtrl.cgi?stream=0&{action}",
            "actions": {
                "UP": "move=up",
                "DOWN": "move=down",
                "LEFT": "move=left",
                "RIGHT": "move=right",
                "ZOOM_IN": "zoom=tele",
                "ZOOM_OUT": "zoom=wide",
                "HOME": "HomePosition"
            }
        },
        {
            "id": 2,
            "brand": "Flexwatch",
            "modal": "",
            "commandUrl": "{url}/cgi-bin/fwptzctr.cgi?FwModId=0&PortId=0,1&PtzCode={action}&RcvData=YES&FwCgiVer=0x0001&PtzParm=0x00000005",
            "actions": {
                "UP": "0x00000307",
                "DOWN": "0x00000301",
                "LEFT": "0x00000303",
                "RIGHT": "0x00000305",
                "ZOOM_IN": "0x0000030B",
                "ZOOM_OUT": "0x0000030C",
                "HOME": "0x00000112"
            }
        },
        {
            "id": 3,
            "brand": "axis",
            "modal": "",
            "commandUrl": "{url}/axis-cgi/com/ptz.cgi?{action}",
            "actions": {
                "UP": "move=up",
                "DOWN": "move=down",
                "LEFT": "move=left",
                "RIGHT": "move=right",
                "ZOOM_IN": "rzoom=1000",
                "ZOOM_OUT": "rzoom=-1000",
                "HOME": "move=home"
            }
        },

        {
            "id" : 4,
            "brand": "Hanwha",
            "modal" : "",
            "PTZPort": 8080,
            "commandUrl" : "{url}/stw-cgi/ptzcontrol.cgi?msubmenu=continuous&action=control&Channel=0&NormalizedSpeed=True&{action}",
            "stopCommandURL" : "{url}/stw-cgi/ptzcontrol.cgi?msubmenu=stop&action=control&Channel=0&OperationType=All",
            "homeCommandURL" : "{url}/stw-cgi/ptzcontrol.cgi?msubmenu=home&action=control",
            "actions": {
                "UP": "Tilt=20",
                "DOWN": "Tilt=-20",
                "LEFT": "Pan=-20",
                "RIGHT": "Pan=20",
                "ZOOM_IN": "Zoom=50",
                "ZOOM_OUT": "Zoom=-50"
            }
        }

    ]
};
module.exports = PTZConfig;