const mongoose = require('mongoose');
const Schema = mongoose.Schema;

String.prototype.toObjectId = function () {
  var ObjectId = require('mongoose').Types.ObjectId;
  return ObjectId(this.toString());
};
const Role = require('./role');
const SiteSmartDevices=require('./siteSmartDevices');
const permissionSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
    permType: { type: String },
    isForAdminRole: { type: Boolean },
    isForClientAdminRole: { type: Boolean },
    isForInstallerRole: { type: Boolean },
  },
  { timestamps: true }
);

const Permission = mongoose.model('permission', permissionSchema, 'permission');

function createDefaultPermission() {
  Permission.find({}).exec(function (err, collection) {
    if (collection && collection.length === 0) {
      Permission.create({
        _id: '5c5414ca9f2b541dd0fbae1e'.toObjectId(),
        name: 'Dashboard',
        description: 'Dashboard',
        permType: 'Page',
        isForAdminRole: true,
        isForClientAdminRole: false,
        isForInstallerRole: false,
      });
      Permission.create({
        _id: '6001741a0591dc179c468658'.toObjectId(),
        name: 'Configuration',
        description: 'Configuration',
        permType: 'Page',
        isForAdminRole: true,
        isForClientAdminRole: false,
        isForInstallerRole: false,
      });
      Permission.create({
        _id: '600174d70591dc179c46865b'.toObjectId(),
        name: 'Clients',
        description: 'Clients',
        permType: 'Page',
        isForAdminRole: true,
        isForClientAdminRole: false,
        isForInstallerRole: false,
      });
      Permission.create({
        _id: '5c5414ca9f2b541dd0fbae1f'.toObjectId(),
        name: 'Video',
        description: 'Video',
        permType: 'Page',
        isForAdminRole: true,
        isForClientAdminRole: false,
        isForInstallerRole: false,
      });

      Permission.create({
        _id: '5c5414ca9f2b541dd0fbae20'.toObjectId(),
        name: 'Events',
        description: 'Events',
        permType: 'Page',
        isForAdminRole: true,
        isForClientAdminRole: false,
        isForInstallerRole: false,
      });

      Permission.create({
        _id: '5c5414ca9f2b541dd0fbae21'.toObjectId(),
        name: 'Point of Sale',
        description: 'Point of Sale',
        permType: 'Page',
        isForAdminRole: true,
        isForClientAdminRole: false,
        isForInstallerRole: false,
      });

      Permission.create({
        _id: '5c5414ca9f2b541dd0fbae22'.toObjectId(),
        name: 'Safe',
        description: 'Safe',
        permType: 'Page',
        isForAdminRole: true,
        isForClientAdminRole: false,
        isForInstallerRole: false,
      });

      Permission.create({
        _id: '5c5414ca9f2b541dd0fbae23'.toObjectId(),
        name: 'Alarm',
        description: 'Alarm',
        permType: 'Page',
        isForAdminRole: true,
        isForClientAdminRole: false,
        isForInstallerRole: false,
      });

      Permission.create({
        _id: '5c5414ca9f2b541dd0fbae24'.toObjectId(),
        name: 'Temperature',
        description: 'Temperature',
        permType: 'Page',
        isForAdminRole: true,
        isForClientAdminRole: false,
        isForInstallerRole: false,
      });

      Permission.create({
        _id: '5c5414ca9f2b541dd0fbae25'.toObjectId(),
        name: 'Health',
        description: 'Health',
        permType: 'Page',
        isForAdminRole: true,
        isForClientAdminRole: false,
        isForInstallerRole: false,
      });

      Permission.create({
        _id: '5c5414ca9f2b541dd0fbae26'.toObjectId(),
        name: 'Other',
        description: 'Other',
        permType: 'Page',
        isForAdminRole: true,
        isForClientAdminRole: false,
        isForInstallerRole: false,
      });

      Permission.create({
        _id: '5c5414ca9f2b541dd0fbae27'.toObjectId(),
        name: 'Analysis',
        description: 'Analysis',
        permType: 'Page',
        isForAdminRole: true,
        isForClientAdminRole: false,
        isForInstallerRole: false,
      });

      Permission.create({
        _id: '5c5414ca9f2b541dd0fbae28'.toObjectId(),
        name: 'Admin',
        description: 'Admin',
        permType: 'Page',
        isForAdminRole: true,
        isForClientAdminRole: false,
        isForInstallerRole: false,
      });

      Permission.create({
        _id: '5c5414ca9f2b541dd0fbae29'.toObjectId(),
        name: 'Timeline',
        description: 'Timeline',
        permType: 'Page',
        isForAdminRole: true,
        isForClientAdminRole: false,
        isForInstallerRole: false,
      });

      Permission.create({
        _id: '5c5818327a0dd941e0266a1b'.toObjectId(),
        name: 'Users',
        description: 'Users',
        permType: 'Page',
        isForAdminRole: true,
        isForClientAdminRole: false,
        isForInstallerRole: false,
      });

      Permission.create({
        _id: '5c5818327a0dd941e0266a1c'.toObjectId(),
        name: 'Sites',
        description: 'Sites',
        permType: 'Page',
        isForAdminRole: true,
        isForClientAdminRole: false,
        isForInstallerRole: false,
      });

      Permission.create({
        _id: '5c5818327a0dd941e0266a1d'.toObjectId(),
        name: 'Roles',
        description: 'Roles',
        permType: 'Page',
        isForAdminRole: true,
        isForClientAdminRole: false,
        isForInstallerRole: false,
      });

      Permission.create({
        _id: '5c5818327a0dd941e0266a1f'.toObjectId(),
        name: 'Site Logs',
        description: 'Site Logs',
        permType: 'Page',
        isForAdminRole: true,
        isForClientAdminRole: false,
        isForInstallerRole: false,
      });

      Permission.create({
        _id: '5c5818327a0dd941e0266a20'.toObjectId(),
        name: 'Activity Logs',
        description: 'Activity Logs',
        permType: 'Page',
        isForAdminRole: true,
        isForClientAdminRole: false,
        isForInstallerRole: false,
      });

      Permission.create({
        _id: '5c5818327a0dd941e0266a21'.toObjectId(),
        name: 'User Faces',
        description: 'User Faces',
        permType: 'Page',
        isForAdminRole: true,
        isForClientAdminRole: false,
        isForInstallerRole: false,
      });

      Permission.create({
        _id: '5c6a6f97a1602e2ac8b8ef65'.toObjectId(),
        name: 'Face Events',
        description: 'Face Events',
        permType: 'Page',
        isForAdminRole: true,
        isForClientAdminRole: false,
        isForInstallerRole: false,
      });

      Permission.create({
        _id: '5c8201643d6da02c48adc5ff'.toObjectId(),
        name: 'Promotions',
        description: 'Promotions',
        permType: 'Page',
        isForAdminRole: true,
        isForClientAdminRole: false,
        isForInstallerRole: false,
      });

      Permission.create({
        _id: '5c8201643d6da02c48adc5fe'.toObjectId(),
        name: 'Map View',
        description: 'Map View',
        permType: 'Page',
        isForAdminRole: true,
        isForClientAdminRole: false,
        isForInstallerRole: false,
      });

      Permission.create({
        _id: '5c8b4b253caf2f1db429fc21'.toObjectId(),
        name: 'Logs',
        description: 'Logs',
        permType: 'Page',
        isForAdminRole: true,
        isForClientAdminRole: false,
        isForInstallerRole: false,
      });

      Permission.create({
        _id: '5c9105f812ec34293c73859f'.toObjectId(),
        name: 'Reports',
        description: 'Reports',
        permType: 'Page',
        isForAdminRole: true,
        isForClientAdminRole: false,
        isForInstallerRole: false,
      });

      Permission.create({
        _id: '5fb4f734b32b0705f861f413'.toObjectId(),
        name: 'Recording',
        description: 'Recording',
        permType: 'Functions',
        isForAdminRole: true,
        isForClientAdminRole: false,
        isForInstallerRole: true,
      });

      Permission.create({
        _id: '5fb4f734b32b0705f861f414'.toObjectId(),
        name: 'SiteRestart',
        description: 'SiteRestart',
        permType: 'Functions',
        isForAdminRole: true,
        isForClientAdminRole: false,
        isForInstallerRole: false,
      });

      Permission.create({
        _id: '5fb4f734b32b0705f861f415'.toObjectId(),
        name: 'Media Server',
        description: 'Media Server',
        permType: 'Functions',
        isForAdminRole: true,
        isForClientAdminRole: false,
        isForInstallerRole: true,
      });

      Permission.create({
        _id: '5fb4f734b32b0705f861f416'.toObjectId(),
        name: 'Camera Tags',
        description: 'Camera Tags',
        permType: 'Functions',
        isForAdminRole: true,
        isForClientAdminRole: false,
        isForInstallerRole: false,
      });

      Permission.create({
        _id: '5fb4f734b32b0705f861f417'.toObjectId(),
        name: 'Impersonate User',
        description: 'Impersonate User',
        permType: 'Functions',
        isForAdminRole: true,
        isForClientAdminRole: false,
        isForInstallerRole: false,
      });

      Permission.create({
        _id: '5fb4f734b32b0705f861f418'.toObjectId(),
        name: 'Add Clients',
        description: 'Add Clients',
        permType: 'Functions',
        isForAdminRole: true,
        isForClientAdminRole: false,
        isForInstallerRole: true,
      });

      Permission.create({
        _id: '5fb4f734b32b0705f861f419'.toObjectId(),
        name: 'Can see Covert Cameras',
        description: 'Can see Covert Cameras',
        permType: 'Functions',
        isForAdminRole: true,
        isForClientAdminRole: true,
        isForInstallerRole: true,
      });
      Permission.create({
        _id: '608bb6e41bf9d0465027586f'.toObjectId(),
        name: 'SSH Configuration ',
        description: 'SSH Configuration ',
        permType: 'Functions',
        isForAdminRole: true,
        isForClientAdminRole: true,
        isForInstallerRole: true,
      });
      Permission.create({
        _id: '608bb4cd1bf9d0465027586e'.toObjectId(),
        name: 'VNC Configuration',
        description: 'VNC Configuration',
        permType: 'Functions',
        isForAdminRole: true,
        isForClientAdminRole: true,
        isForInstallerRole: true,
      });
    }
  });
}
async function createnewPermission() {
  const data = await Permission.find({ $or: [{ name: 'VNC Configuration' }, { name: 'SSH Configuration ' }] });
  if (data && data.length == 0) {
    await Permission.create({
      _id: '608bb6e41bf9d0465027586f'.toObjectId(),
      name: 'SSH Configuration ',
      description: 'SSH Configuration ',
      permType: 'Functions',
      isForAdminRole: true,
      isForClientAdminRole: false,
      isForInstallerRole: false,
    });
    await Permission.create({
      _id: '608bb4cd1bf9d0465027586e'.toObjectId(),
      name: 'VNC Configuration',
      description: 'VNC Configuration',
      permType: 'Functions',
      isForAdminRole: true,
      isForClientAdminRole: false,
      isForInstallerRole: false,
    });
  }
}
async function updateAdminRolePermission() {
  const data = await Role.findById('6011d57f022ac06f3829f994');
  const adminRole = await Role.findOne({ _id: '6011d57f022ac06f3829f994', 'permissions.functionId': { $in: ['608bb6e41bf9d0465027586f', '608bb4cd1bf9d0465027586e'] } });

  if (data && !adminRole) {
    data.permissions.push(
      {
        pageId: null,
        widgetId: null,
        reportId: null,
        functionId: '608bb6e41bf9d0465027586f'.toObjectId(),
        isViewAllowed: true,
        isEditAllowed: false
      },
      {
        pageId: null,
        widgetId: null,
        reportId: null,
        functionId: '608bb4cd1bf9d0465027586e'.toObjectId(),
        isViewAllowed: true,
        isEditAllowed: false
      }
    );
    data.save();
  }
}
async function addDashBoardePermission() {
  const data = await Role.find({'permissions.pageId':{$ne:'5c5414ca9f2b541dd0fbae1e'},roleStatus:0});
  // const adminRole = await Role.findOne({ _id: '6011d57f022ac06f3829f994', 'permissions.functionId': { $in: ['608bb6e41bf9d0465027586f', '608bb4cd1bf9d0465027586e'] } });

  if (data && data.length) {
    for(let i=0;i<data.length;i++){
      data[i].permissions.push(
        {
          pageId: '5c5414ca9f2b541dd0fbae1e'.toObjectId(),
          widgetId: null,
          reportId: null,
          functionId: null,
          isViewAllowed: true,
          isEditAllowed: true
        }
      );
      data[i].save();

    }
    
  }
}
async function createSeraDevices(){
  const device1=await SiteSmartDevices.findOne({kicDeviceID:'37520',storeId:'5ff83ffb2ef4cf1ed8ce1401'});
  if(!device1){
    await SiteSmartDevices.create({
      deviceNotificationSettings: [true],
      siteSmartDeviceStatus: 0,
      clientId: "600965c14fe84877c8ad5d55".toObjectId(),
      device: "5ff2ec17b8707d39e8efaf4e".toObjectId(),
      name: "CSO - Armored Car Access",
      notes: "",
      POSdeviceRegisterNo: "",
      kicDeviceID: "37520",
      kicDeviceType: "",
      kicVendorName: "",
      kicDeviceName: "CSO - Armored Car Access",
      kicSerialNumber: "",
      kicStatus: "",
      kicLocationID: "",
      scaleIP: "",
      scalePort: 80,
      connectionType: "",
      scaleUserName: "",
      scalePassword: "",
      storeId: "5ff83ffb2ef4cf1ed8ce1401".toObjectId(),
      day: [],
      
      
    },
    )
  }
  const device2=await SiteSmartDevices.findOne({kicDeviceID:'37532',storeId:'5ff83ffb2ef4cf1ed8ce1401'});
  if(!device2){
    await SiteSmartDevices.create({
      deviceNotificationSettings: [true],
      siteSmartDeviceStatus: 0,
      clientId: "600965c14fe84877c8ad5d55".toObjectId(),
      device: "5ff2ec17b8707d39e8efaf4e".toObjectId(),
      name: "CSO - Manager Door Access",
      notes: "",
      POSdeviceRegisterNo: "",
      kicDeviceID: "37532",
      kicDeviceType: "",
      kicVendorName: "",
      kicDeviceName: "CSO - Manager Door Access",
      kicSerialNumber: "",
      kicStatus: "",
      kicLocationID: "",
      scaleIP: "",
      scalePort: 80,
      connectionType: "",
      scaleUserName: "",
      scalePassword: "",
      storeId: "5ff83ffb2ef4cf1ed8ce1401".toObjectId(),
      day: [],
      
      
    },
    )
  }
  const device3=await SiteSmartDevices.findOne({kicDeviceID:'37599',storeId:'5ff83ffb2ef4cf1ed8ce1401'});
  if(!device3){
    await SiteSmartDevices.create({
      deviceNotificationSettings: [true],
      siteSmartDeviceStatus: 0,
      clientId: "600965c14fe84877c8ad5d55".toObjectId(),
      device: "5ff2ec17b8707d39e8efaf4e".toObjectId(),
      name: "Engineering Test Lock 1",
      notes: "",
      POSdeviceRegisterNo: "",
      kicDeviceID: "37599",
      kicDeviceType: "",
      kicVendorName: "",
      kicDeviceName: "Engineering Test Lock 1",
      kicSerialNumber: "",
      kicStatus: "",
      kicLocationID: "",
      scaleIP: "",
      scalePort: 80,
      connectionType: "",
      scaleUserName: "",
      scalePassword: "",
      storeId: "5ff83ffb2ef4cf1ed8ce1401".toObjectId(),
      day: [],
      
      
    },
    )
  }


}
// createnewPermission();
module.exports = { Permission, createDefaultPermission, createnewPermission, updateAdminRolePermission,addDashBoardePermission,createSeraDevices };
