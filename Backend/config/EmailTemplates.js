module.exports = {
    EventLinkSend: {
        Subject: 'Realwave – Share video link',
        Body: `Hello {FirstName},<br/>
            <p><b>Event Type:</b> {EventType}<br/>
            <b>Event Id:</b> {EventId}<br/>
            <b>Event Time:</b> {EventTime}<br/>
            <b>Operator:</b> {Operator}<br/>
            <b>Register:</b> {Terminal}<br/>
            <b>Amount:</b> {Amount}<br/>
            <b>Site:</b> {Site}<br/>
            <b>Camera:</b> {Camera}<br/><br/>
            Please review video attached - {Link}</p>
            <br/>Thank You`
    },
    VideoLinkSend: {
        Subject: 'Realwave – Share video link',
        Body: `Hello {FirstName},<br/>
            <p><b>Event Type:</b> {EventType}<br/>
            <b>Event Id:</b> {EventId}<br/>
            <b>Event Time:</b> {EventTime}<br/>
            <b>Site:</b> {Site}<br/>
            <b>Camera:</b> {Camera}<br/><br/>
            Please review video attached - {Link}</p>
            <br/>Thank You`
    },
    FaceVideoLinkSend: {
        Subject: 'Realwave – Share video link',
        Body: `Hello {FirstName},<br/>
            <p><b>Event Type:</b> {EventType}<br/>
            <b>Event Id:</b> {EventId}<br/>
            <b>Event Time:</b> {EventTime}<br/>          
            <b>Site:</b> {Site}<br/>
            <b>Camera:</b> {Camera}<br/><br/>
            Please review video attached - {Link}</p>
            <br/>Thank You`
    },
    ForgotPassword: {
        Subject: 'Realwave – Reset password',
        Body: `Dear {FirstName} {LastName} 
            <p><span style="display:inline-block; width: 50px;"></span>A request has been filed to reset your password.  Please use the token provided below to change your password.</p>
            <br/><br/>Thank You
            <br/>System Administrator`
    },
    ResetPassword: {
        Subject: 'Realwave – Reset password',
        Body: `Dear {FirstName} {LastName} 
            <p>You recently requested to reset your password for your Realwave account. Please click the link below to reset it<br><h4> {ForgotPasswordURL} </h4><br>If you did not request a password reset, please ignore this email.</p><br> <p>Thanks<br> Realwave </p>
            <br/><br/>Thank You
            <br/>System Administrator`
    },
    CustomVideoClip: {
        Subject: 'Realwave – Video Clip Ready for {SITE} - {CAMERA}',
        Body: `Hi,
            <p>Your video clip is ready 
            <br /><br />
            Below is the clip requested from {StartTime} to {EndTime}.
            <br /><br />
            <p>Site: {SITE}</p>
            <p>Camera: {CAMERA}</p>
            <br /><br />
            Please click on the link below to download and play <br><h4> {URL} </h4><br>.</p>
            <br/><br/>Thank You
            <br/>System Administrator`
    },
    CameraInfo: {
        Subject: 'Realwave | {SITE} | Camera Status',
        Body: `
            Hi User,
            <br/> <br/>
            <b>Here is the camera detail:</b>
            <br/>

            <p><b>Site:</b>  {SITE}</p>
            <p><b>Camera:</b> {CAMERA_NAME}</p>
            <p><b>Camera IP:</b> {IP}</p>
            <p><b>Camera Port:</b> {PORT}</p>
            <p><b>Status:</b> {STATUS}</p>
            <br/><br/>Thank You
            <br/>System Administrator
            <br/>www.realwave.io`
    },
    StoreInfo: {
        Subject: 'Realwave | {SITE} | Site Status',
        Body: `Hi User,
            <br/> <br/>
            <b>Here is the site detail:</b>
            <br/>
            
            <p><b>Site:</b> {SITE}</p>
            <p><b>Status:</b> {STATUS}</p>
            <p><b>Latitude:</b> {LATITUDE}</p>
            <p><b>Longitude:</b> {LONGITUDE}</p> 
            <p><b>SerialNumber:</b> {SERIAL_NUMBER}</p>

            <br/><br/>Thank You
            <br/>System Administrator
            <br/>www.realwave.io`
    },
    CamReport: {
        Subject: 'NEED ATTENTION: {SITE}-CAMERA is not responding',
        Body: `Below camera is not responding:
            <br/> <br/>

            {REPORT_DATA}

            <br/><br/>Thank You
            <br/>System Administrator
            <br/>www.realwave.io`
    },
    StoreReport: {
        Subject: 'NEED ATTENTION: Site {SITENAME} connectivity is lost',
        Body: `Connectivity to below site and it’s cameras is lost.
        <br/> Site : {SITENAME}
        <br/> Disconnect Time : {DISCONNECT_DATE}
        <br/> Connected Start Time : {CONNECT_DATE}     
         <br/><br/>Thank You
            <br/>System Administrator
            <br/>www.realwave.io`
    },
    StoreOnlineReport: {
        Subject: 'Site {SITENAME} connectivity is back',
        Body: `Connectivity to below site and it’s cameras is back.
        <br/> Site : {SITENAME}
        <br/> Disconnect Time : {DISCONNECT_DATE}
        <br/> Connected Start Time : {CONNECT_DATE}     
         <br/><br/>Thank You
            <br/>System Administrator
            <br/>www.realwave.io`
    },
    DisconnectCamReport: {
        Subject: 'NEED ATTENTION: Camera {CAMERA} of Site {SITENAME} is down',
        Body: `
            <br/>
            Camera : {CAMERA}
            <br/> IP : {IP}
            <br/> Port : {PORT}
            <br/> Site : {SITENAME}
            <br/> Disconnect Time : {DISCONNECT_DATE}
            <br/> Connected Start Time : {CONNECT_DATE}     
            <br/><br/>Thank You
            <br/>System Administrator
            <br/>www.realwave.io`
    },
    ConnectCamReport: {
        Subject: 'Camera {CAMERA} of Site {SITENAME} is up',
        Body: `
            <br/>
            Camera : {CAMERA}
            <br/> IP : {IP}
            <br/> Port : {PORT}
            <br/> Site : {SITENAME}
            <br/> Disconnect Time : {DISCONNECT_DATE}
            <br/> Connected Start Time : {CONNECT_DATE}     
            <br/><br/>Thank You
            <br/>System Administrator
            <br/>www.realwave.io`
    },
    DisconnectStreamReport: {
        Subject: 'NEED ATTENTION: {STREAMTYPE} Stream for {CAMERA} of Site {SITENAME} is down',
        Body: `
            <br/>
            Camera : {CAMERA}
            <br/> IP : {IP}
            <br/> Port : {PORT}
            <br/> Site : {SITENAME}
            <br/> Disconnect Time : {DISCONNECT_DATE}
            <br/> Connected Start Time : {CONNECT_DATE}    
            <br/> Stream Type: {STREAMTYPE}
            <br/><br/>Thank You
            <br/>System Administrator
            <br/>www.realwave.io`
    },
    ConnectStreamReport: {
        Subject: '{STREAMTYPE} Stream for {CAMERA} of Site {SITENAME} is up',
        Body: `
            <br/>
            Camera : {CAMERA}
            <br/> IP : {IP}
            <br/> Port : {PORT}
            <br/> Site : {SITENAME}
            <br/> Disconnect Time : {DISCONNECT_DATE}
            <br/> Last Connected Start Time : {CONNECT_DATE}    
            <br/> Stream Type: {STREAMTYPE} 
            <br/><br/>Thank You
            <br/>System Administrator
            <br/>www.realwave.io`
    },
    SpiritReport: {
        Subject: 'NEED ATTENTION: Spirit Airlines Notification for {SITENAME}',
        Body: `
            <br/>
            Alert : {ALERT_TIME_IND}
            <br/> Site Name : {SITENAME}
            <br/> Service Type – {SPIRITKWAIT} 
            <br/> Service Time Limit – {ALERT_TIME_LIMIT}
            <br/> Service Time – {ALERT_TIME}
            <br/> Alert created on – {NOTIFICATION_SENT_ON}
            <br/><br/>Thank You
            <br/>System Administrator
            <br/>www.realwave.io`
    },
}