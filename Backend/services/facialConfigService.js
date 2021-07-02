let facialConfig = {
	_startUpdateProcess: function (params) {
		return new Promise(function (resolve, reject) {
			//TODO: Call Console Application for update GAL based on users face's.
			resolve();
		});
	}
};

module.exports = {
	StartUpdateProcess: facialConfig._startUpdateProcess
};