let enums = {
    STORE_NOTIFICATION_TYPE: {
        STORE: 'STORE',
        CAMERA: 'CAMERA',
        SPIRITKWAIT: 'SPIRITKWAIT',
        SPIRITKSER: 'SPIRITKSER',
        SPIRITBWAIT: 'SPIRITBWAIT',
        SPIRITBSER: 'SPIRITBSER',
        SPIRITSSER: 'SPIRITSSER',
        SPIRITFWAIT: 'SPIRITFWAIT',
        SPIRITFSER: 'SPIRITFSER'
    },
    PEOPLE_COUNT_ACTION: {
        HOURLY: 'HOURLY',
        DAILY: 'DAILY',
        WEEKLY: 'WEEKLY',
        GRID: 'GRID',
        LOAD: 'load'
    },
    VIDEO_CLIP_TYPE: {
        ONDEMAND: 0,
        POS: 1,
        SCALE: 2,
        ACCESSCONTROL : 3
    },
    RECORDING_ENGLINE_TYPE: {
        REX: 'Rex',
        GANZ: 'Ganz',
        NVR: 'NVR',
        DEFAULT: 'Default'
    },
    RECORDING_ENGLINE_TYPE_ENUM: {
        Windows: 0,
        REX: 1,
        GANZ: 2,
        DEFAULT: 3
    },
    VIDEO_CLIP_STATUS: {
        NOT_CREATED: 0,
        CREATED: 1,
        FAILED: 2
    },
    EVENT_TYPE: {
        DEFAULT: 0, // Store / Camera notifications
        POS: 1,
        SCALE: 2,
        BOOKMARK: 3,
        CAMERA: 4,
        STORE: 5,
        LOW_STREAM: 6,
        HIGH_STREAM: 7,
        ACCESSCONTROL:8
    },
    LIVE_STREAM_CONFIG: {
        LowStreamOnly: "LowStreamOnly",
        OnDemand: "OnDemand",
        LowHighAlways: "LowHighAlways"
    }
};
module.exports = enums;

