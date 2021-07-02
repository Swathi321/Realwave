const fs = require('fs');
const path = require('path');
const azure = require('azure-storage');
const moment = require('moment');

const EventModal = require('./../../modals/Event');
const config = {
    account: 'realwave',
    key: 'XcNp+SHbHLFQAT1TuRMwhT+3GaqE15uwrRRHKME9VamsAy1gX4qQxkMmSi0p0MaVlWbhvpRYijVDwc7irop7qg==',
    container: 'realwavecamfeed-test'
}

class AzureRecordTest {
    get failedRecordFilePath() {
        let filePath = path.resolve("failedRecord.json");
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, "");
        }
        return path.resolve("failedRecord.json");
    }

    constructor(dbModal) {
        this.blobService = azure.createBlobService(config.account, config.key);
        this.failedRecord = [];
        this.dbModal = EventModal;
    }

    async StartTest(data) {
        let events = [];
        try {
            let result = fs.readFileSync(this.failedRecordFilePath);
             if (result.length > 0) {
                events = JSON.parse(result);
                fs.appendFileSync(this.failedRecordFilePath, ''); //Write All Failed Record in File
            }
            else {
                events = await this.FetchRecord();
                fs.appendFileSync(this.failedRecordFilePath, JSON.stringify(events)); //Write All Failed Record in File
            }
            if (events.length > 0) {
                for (let index = 0, len = events.length; index < len; index++) {
                    const event = events[index];
                    let result = await this.CheckRecord(event, index);
                    if (result.error) {
                        this.failedRecord.push({ event: result.event });
                    } else {
                        if (!result.isUpdateRecord) {
                            await this.UpdateDBRecord(result);
                        }
                    }
                }
                if (this.failedRecord.length > 0) {
                    fs.appendFileSync(this.failedRecordFilePath, JSON.stringify(this.failedRecord)); //Write All Failed Record in File
                }
            }
            logger.info("Process Completed");
        }
        catch (ex) {
            logger.error(`Error: ${ex.message}`)
        }
    }

    Retry() {
        let result = fs.readFileSync(this.failedRecordFilePath);
        try {
            result = JSON.parse(result);
            this.StartTest(result);
        } catch (ex) {
            logger.error(`Error: ${ex.message}`)
        }
    }

    async FetchRecord() {
        let eventData = [];

        let count = 1000;
        let filtersObject = {
            IsVideoAvailable: true,
            EventTime: {
                $gte: new Date("11-10-2019")
            }
        };
        let query = { limit: count, skip: 0 };
        let methodName = this.dbModal;
        let totalRecord = Number(62000);
        let loopCount = Math.ceil((totalRecord - query.skip) / count);
        for (let limit = 0; limit < loopCount; limit++) {
            query.skip = count * limit;
            let result = await methodName.find(filtersObject, {}, query);
            if (result.length > 0) {
                eventData = eventData.concat(result);
            }
        }
        return eventData;
    }

    async CheckRecord(event, index) {
        return new Promise((resolve) => {
            try {
                let storeId = event.StoreId.toString(),
                    videoName = event._id + ".mp4",
                    eventDate = moment.utc(event.EventTime).format('MM-DD-YYYY'),
                    azureVideoFileName = path.join(storeId, eventDate, 'videos', videoName); // Create path: storeId/date/Videos/eventId.mp4.
                // Create container if does not exists.
                this.blobService.doesBlobExist(config.container, azureVideoFileName, function (error, result) {
                    if (error) {
                        return resolve({ success: false, event: event, error: error.message });
                    }
                    resolve({ success: result.exists, event: event, isUpdateRecord: result.exists });
                })
            } catch (ex) {
                resolve({ success: false, event: event, error: ex.message });
            }
        });
    }

    async UpdateDBRecord(result) {
        await this.dbModal.updateOne({ _id: result.event._id }, { $set: { IsVideoAvailable: false } });
    }
}

module.exports = AzureRecordTest;