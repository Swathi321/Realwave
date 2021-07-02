const logger = require('../logger');
const moment = require('moment');
const ReportDataModel = require('../../modals/reportData');
const SiteSmartDeviceModel = require('../../modals/siteSmartDevices');
const Camera =require('../../modals/camera');
const { VIDEO_CLIP_TYPE } = require('../../util/enum');
const util = require('../util');
const enums = require('../../util/enum');
const SiteSmartDevices = require('../../modals/siteSmartDevices');
const RealwaveAction = require("../RealwaveAction");
const RealwaveVideoClip = require('../../modals/VideoClips');
const BookMarkModal = require('../../modals/bookMark');
const BookmarkTypeModel = require('../../modals/bookmarkType');
const NotificationParams = require('./../Notification/NotificationParams');
const { Notification, Template } = require('./../Notification');

String.prototype.toObjectId = function () {
  var ObjectId = (require('mongoose').Types.ObjectId);
  return ObjectId(this.toString());
};

class AccessControlTask {
  inProcess = false;

  static Execute = async () => {
    if (this.inProcess) {
      logger.info(`AccessControlRule Task already Started: ${new Date()}`)
      return
    }
    this.inProcess = true
    try {
      let records = await ReportDataModel.find({ isProcessed: false }).populate('storeId');
      

      records = JSON.parse(JSON.stringify(records));
      for (let i = 0; i < records.length; i++) {
        try {
          let query;
          if(records[i].source=="kic"){
            query={ storeId: records[i].storeId._id.toObjectId(),
              kicDeviceID: records[i].publisherId,
              siteSmartDeviceStatus:0}
          }
          if(records[i].source=="sera4"){
            query={ storeId: records[i].storeId._id.toObjectId(),
              sera4DeviceID: records[i].publisherId,
              siteSmartDeviceStatus:0}
          }
          const smartDeviceId=await SiteSmartDevices.findOne(query);
            // let smartDeviceId = JSON.parse(
            //   JSON.stringify(await this.getKICDeviceRule(record))
            // )
            records[i].smartDeviceId=smartDeviceId;

          let cameraData = await Camera.find({ storeId: records[i].storeId._id, 'siteSmartDevices.deviceId': smartDeviceId?smartDeviceId._id:null },{name:1,siteSmartDevices:1,});
          
          cameraData = JSON.parse(JSON.stringify(cameraData));

          if(cameraData&&cameraData.length){
            records[i].CameraId=cameraData;
           
          }

          let dateobj =records[i].data.attributes.occurredAt;
          // records[i].DateTimeString = dateobj.toString();

          await this.processRecord(records[i])
        } catch (ex) {
          console.log(ex,'#####');
          logger.error('Process Record Error', ex.stack)
          if (ex.message.indexOf('pool is draining') > -1) {
            break
          }
        }
      }
    } catch (ex) {
      console.log(ex,'55');
      logger.debug(`accessControlDataule Exception: ${ex}`)
    } finally {
      this.inProcess = false
    }
  }

  static processRecord = async record => {
    let deviceKicEventResult = JSON.parse(
      JSON.stringify(await this.getKICDeviceRule(record))
    )
    if (deviceKicEventResult.length > 0) {
      for (let reportN = 0; reportN < deviceKicEventResult.length; reportN++) {
        let accessControlData;
        if(record.source=='kic'){
          if (deviceKicEventResult[reportN].kicEvent) {
             accessControlData = deviceKicEventResult[reportN].kicEvent;
            await this.performAction(accessControlData, record)
          }
        }
        if(record.source=='sera4'){
          if (deviceKicEventResult[reportN].seraEvent) {
             accessControlData = deviceKicEventResult[reportN].seraEvent;
            await this.performAction(accessControlData, record)
          }
        }
       
      }
    }
  }

  static getKICDeviceRule = async record => {
    let query;
          if(record.source=="kic"){
            query={ storeId: record.storeId._id.toObjectId(),
              kicDeviceID: record.publisherId,
              siteSmartDeviceStatus:0}
          }
          if(record.source=="sera4"){
            query={ storeId: record.storeId._id.toObjectId(),
              sera4DeviceID: record.publisherId,
              siteSmartDeviceStatus:0}
          }
    const deviceKicEventResult = await SiteSmartDeviceModel.find(query).populate([
      {
        path: 'kicEvent.emailNotificationUsers',
        select: {
          _id: 1,
          email: 1,
          firstName: 1
        }
      },
      {
        path: 'kicEvent.smsNotificationUsers',
        select: {
          _id: 1,
          mobile: 1,
          firstName: 1
        }
      },
      {
        path: 'seraEvent.emailNotificationUsers',
        select: {
          _id: 1,
          email: 1,
          firstName: 1
        }
      },
      {
        path: 'seraEvent.smsNotificationUsers',
        select: {
          _id: 1,
          mobile: 1,
          firstName: 1
        }
      },
      {
        path: 'scale',
        select: {
          createClip: 1,
          bookMark: 1
        }
      },
      {
        path: 'scale',
        select: {
          bookMark: true
        }
      }
    ])
    return deviceKicEventResult
  }

  static performAction = async (accessControlData, record) => {
    for (let i = 0; i < accessControlData.length; i++) {
      const recordAccessControl= accessControlData[i];
      if (record.data.type == recordAccessControl.eventType) {

        if (recordAccessControl.createClip) {
          
          let VideoClipIds=[];
          for(let i=0;i<record.CameraId.length;i++){
           
              record.CamId= record.CameraId[i];
              record.StoreId= record.storeId;
              record.DateTimeString=record.data.attributes.occurredAt;
             let savedRecord=await RealwaveAction.createEventClip(record, VIDEO_CLIP_TYPE.ACCESSCONTROL);
           
             VideoClipIds.push(savedRecord);
          }
           await ReportDataModel.updateOne({ _id: record._id }, { $set: { VideoClipId:VideoClipIds, isProcessed: true } });
        }

         // if bookMark Check then Create bookMark
        if (recordAccessControl.bookMark) {
         
         let bookmarkIds=[];

          for(let i=0;i<record.CameraId.length;i++){
            let dateValue = moment(record.data.attributes.occurredAt).format("YYYY-MM-DD hh:mm:ss A");
            let bookMarkName = `AccessControl: ${record.data.type}  at ${dateValue}`;

              record.CamId= record.CameraId[i];
              record.StoreId= record.storeId;
              record.DateTime=record.data.attributes.occurredAt;
              record.bookMarkName=bookMarkName;
           
            let savedRecord= await RealwaveAction.createEventBookMark(record, recordAccessControl);

            bookmarkIds.push(savedRecord);
          }

            await ReportDataModel.update({ _id: record._id }, { $set: { BookMarkId:bookmarkIds, isProcessed: true } });
  
          }
        if (((recordAccessControl.smsNotificationTo && recordAccessControl.smsNotificationTo.length > 0) || (recordAccessControl.smsNotificationUsers && recordAccessControl.smsNotificationUsers.length > 0))) {
          
          //if smsNotificationUsers set then send SMS for all saved User
          let userDataForText = [];
          for (let addedNumbers = 0; addedNumbers < recordAccessControl.smsNotificationTo.length; addedNumbers++) {
              const phoneNumbers = recordAccessControl.smsNotificationTo[addedNumbers];
              if (!userDataForText.includes(phoneNumbers)) {
                  userDataForText.push(phoneNumbers);
              }

          }
          for (let addedUsers = 0; addedUsers < recordAccessControl.smsNotificationUsers.length; addedUsers++) {
              const userNumbers = recordAccessControl.smsNotificationUsers[addedUsers];
              if (userNumbers.mobile) {
                  if (!userDataForText.includes(userNumbers.mobile)) {
                      userDataForText.push(userNumbers.mobile);
                  }

              }
          }
         let body=` The ${record.smartDeviceId.name} was ${record.data.type} at ${moment(record.data.attributes.occurredAt).format(util.dateFormat.dateTimeFormatAmPm)} for Site ${record.storeId.name}`
          await RealwaveAction.sendEventText(record, userDataForText, body, enums.EVENT_TYPE.ACCESSCONTROL, ReportDataModel);
        }
        if (((recordAccessControl.emailNotificationTo && recordAccessControl.emailNotificationTo.length > 0) || (recordAccessControl.emailNotificationUsers && recordAccessControl.emailNotificationUsers.length > 0))) {//if emailNotificationUsers set then send Email for all saved User
          let userData = [];
          for (let addedEmails = 0; addedEmails < recordAccessControl.emailNotificationTo.length; addedEmails++) {
              const emails = recordAccessControl.emailNotificationTo[addedEmails];
              if (!userData.includes(emails)) {
                  userData.push(emails);
              }
          }
          for (let addedUsers = 0; addedUsers < recordAccessControl.emailNotificationUsers.length; addedUsers++) {
              const userEmails = recordAccessControl.emailNotificationUsers[addedUsers];
              if (userEmails.email) {
                  if (!userData.includes(userEmails.email)) {
                      userData.push(userEmails.email);
                  }
              }

          }

          let tags={
                PublisherId:  record.smartDeviceId.name,
                  Type:recordAccessControl.eventType,
                  Site: record.storeId.name,
                  DateTime: moment(record.data.attributes.occurredAt).format(util.dateFormat.dateTimeFormatAmPm)
              };
         await RealwaveAction.sendEventEmail(record, userData, Template.Email.AccessReport, enums.EVENT_TYPE.ACCESSCONTROL, ReportDataModel, recordAccessControl.eventType, record.smartDeviceId.name,null,tags);

          // await sendEventEmail(record, userData, Template.Email.AccessReport, enums.EVENT_TYPE.ACCESSCONTROL, ReportDataModel, recordAccessControl.eventType, record.smartDeviceId.name,record.storeId.name);
        }
      }
    }
  }
}

module.exports = AccessControlTask
