'use strict';
const CronJob = require('cron').CronJob;

let _runningTask = [];

/**
 * @desc - Create the Background Job 
 * @param {string} taskName - Name of the Task
 * @param {string} time - Use the Cron Time format like * * * * * *
 * @param {object} info - Object that have the information that need to be pass in Action Function
 * @param {function} action - Function that will be called from Job based on Time
 * @param {function} onComplete - Function that will be called from Job Completed
 */
function _createBackgroudJob(taskName, time, info, action, onComplete) {
    const job = new CronJob(time,
        function (callback) {
            let options = Object.assign({}, info);
            action(taskName, options);
        }, onComplete, true);
    job.start();
    _runningTask.push({ TaskName: taskName, Info: info, Job: job });
}

/**
 * @desc - Stop the Background Job Based on Name 
 * @param {string} taskName - Task Name that need to be stop
 */
function _stopBackgroudJob(taskName) {
    let filterJob = _runningTask.filter(job => {
        return taskName === job.TaskName;
    });
    if (filterJob && filterJob.length !== 0) {
        filterJob[0].Job.stop();
        _runningTask = _runningTask.filter((item) => taskName !== item.TaskName);
    }
}

function _getRunningTask() {
    return _runningTask;
}

module.exports = {
    CreateBackgroudJob: _createBackgroudJob,
    StopBackgroudJob: _stopBackgroudJob,
    GetRunningTask: _getRunningTask
}