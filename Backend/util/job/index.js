'use strict';

const fs = require('fs');
const { CreateBackgroudJob, GetRunningTask } = require('./createJob');
const logger = require('../logger');

//Json file path that store tasks
const jobList = require('../job/jobs');

/**
  * @desc This will log the information that task is complete on each iteration
*/
let _onComplete = function (taskName, info) {
}

/**
  * @desc Read list of jobs from jobList file and add those as Backgroud Job
*/
module.exports.StartPolling = function () {
    try {
        //Check if jobList exists 
        if (jobList) {
            //Here we are adding the tasks one by one mentioned in jobList file
            jobList.forEach(task => {
                if (!task.Disabled) {
                    CreateBackgroudJob(`${task.Name} - Task`, task.Interval, task.Options, task.Action, _onComplete);
                }
            });
        }
    }
    catch (ex) {
        logger.error(ex);
    }
}