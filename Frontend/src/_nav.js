export default {
  navigation: function () {
    return {
      items: [
        { name: 'Home', url: '/dashboard', icon: 'icon2-home', permission: ["Dashboard"] },
        { name: 'Dashboard', url: '/dashboard', icon: 'icon2-dashboard', permission: ["Dashboard"] },
        { name: 'Video', url: '/video', icon: 'icon2-video', permission: ["Video"] },
        { name: 'Events', url: '/eventfeed', icon: 'icon2-events', permission: ["Events"] },
        { name: 'Health Monitor', url: '/healthmonitor', icon: 'fa fa-desktop', permission: ["Dashboard"] },
        {
          name: 'Reports', url: '/reports', icon: 'icon-lock', permission: ["Reports"],
          children: [
            {
              name: 'Scales',
              url: '/reports/scales',
              icon: 'icon-briefcase',
              permission: ["Reports"]
            },
            {
              name: 'Access Control',
              url: '/reports/accesscontrol',
              icon: 'icon-briefcase',
              permission: ["Reports"]
            },
            {
              name: 'Alarm',
              url: '/reports/alarm',
              icon: 'icon-briefcase',
              permission: ["Reports"]
            },
            {
              name: 'Sales',
              url: '/reports/sales',
              icon: 'icon-briefcase',
              permission: ["Point of Sale"]
            },
            {
              name: 'No Sales',
              url: '/reports/nosales',
              icon: 'icon-basket',
              permission: ["Point of Sale"]
            },
            {
              name: 'Weekly Sales',
              url: '/reports/weeklysales',
              icon: 'icon-clock',
              permission: ["Point of Sale"]
            },
            {
              name: 'Voids',
              url: '/reports/voids',
              icon: 'icon-ban',
              permission: ["Point of Sale"]
            },
            {
              name: 'Video Clips',
              url: '/reports/videoClips',
              icon: 'icon-clock',
              permission: ["Point of Sale"]
            },
          ]
        },
        {
          name: 'Logs', url: '/sales', icon: 'icon-basket-loaded', permission: ["Logs"],
          children: [
            { name: 'Point of Sale', url: '/logs/pos', icon: 'icon-clock', permission: ["Point of Sale"] },
            { name: 'Safe*', url: '/safe', icon: 'icon-lock', permission: ["Safe"] },
            { name: 'Temperature', url: '/logs/temperature', icon: 'fa fa-thermometer', permission: ["Temperature"] },
            { name: 'Alarm', url: '/logs/alarm', icon: 'icon-clock', permission: ["Alarm"] }
          ]
        },
        { name: 'Alerts', url: '/alert', icon: 'icon2-alerts', permission: ["Alarm"] },
        {
          name: 'System Health', url: '/health', icon: 'fa fa-plus-square', permission: ["Health"],
          children: [
            { name: 'Site Logs', url: '/health/logsDirectories', icon: 'fa fa-history', permission: ["Site Logs"] },
            { name: 'Monitor', url: '/health/monitor', icon: 'fa fa-line-chart', permission: ["Site Logs"] }
          ]
        },
        { name: 'Analysis*', url: '/analysis', icon: 'fa fa-bar-chart-o', permission: ["Analysis"] },
        {
          name: 'Admin', url: '/admin', icon: 'icon-user-follow', permission: ["Admin"],
          children: [
            { name: 'Configuration', url: '/admin/configuration', icon: 'icon-settings', permission: ["Configuration"] },
            // { name: 'Configuration*', url: '/admin/configuration', icon: 'icon-settings', permission: ["Safe"] },
            { name: 'Users', url: '/admin/users', icon: 'icon-user', permission: ["Users"] },
            { name: 'Sites', url: '/admin/sites', icon: 'icon-layers', permission: ["Sites"] },
            { name: 'Roles', url: '/admin/role', icon: 'icon-layers', permission: ["Roles"] },
            { name: 'Clients', url: '/admin/clients', icon: 'icon-user', permission: ["Clients"] },
            { name: 'Activity Logs', url: '/admin/activityLogs', icon: 'icon-check', permission: ["Activity Logs"] },
            { name: 'User Faces', url: '/admin/userFaces', icon: 'fa fa-smile-o', permission: ["User Faces"] },
            { name: 'Mac Addresses', url: '/admin/macAddresses', icon: 'fa fa-address-book', permission: ["Mac Addresses"] },
            { name: 'Bookmark Type', url: '/admin/bookmarkType', icon: 'fa fa-bookmark', permission: ["BookMark Type"] }
          ]
        },
        { name: 'Face Events', url: '/faceEvents', icon: 'icon2-facial-recognition', permission: ["Face Events"] },
        { name: 'Other*', url: '/other', icon: 'icon-basket', permission: ["Other"] },
        { name: 'Map View', url: '/mapView', icon: 'icon2-map', permission: ["Map View"] },
        { name: 'Camera Logs', url: '/cameraLogs', class: 'hidden', icon: 'fa fa-history', permission: ["Site Logs"] },
        { name: 'People Count', url: '/peopleCountLog', hidden: true, icon: 'fa fa-history', permission: ["Site Logs"] },
        { name: 'Playbacks', url: '/timelineWindow', hidden: true, icon: 'fa fa-history', permission: ["Video"] }
        // { name: 'Promotions', url: '/promotions', icon: 'icon-lock', permission: ["Promotions"] },
        // { name: 'Timeline', url: '/timeline', icon: 'icon-camrecorder', permission: ["Timeline"] }
      ]
    }
  }

};

