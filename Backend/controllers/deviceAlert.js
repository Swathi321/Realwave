async function sendDeviceAlert(req, res) {
  //deviceId && Parameter1( POSdeviceRegisterNo or scaleIP..etc) is mandatory

  try {
    const {
      deviceId,
      deviceType,
      Parameter1,
      Parameter2,
      remarkContent,
    } = req.body;
    res.send({ error: false, message: 'Device Alert Sent' });
  } catch (error) {
    res.send({ error: true, message: error });
  }
}

module.exports = {
  sendDeviceAlert,
};
