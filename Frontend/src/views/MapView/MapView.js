import React, { PureComponent } from 'react';
import { storesData } from './../../redux/actions/httpRequest';
import PropTypes from 'prop-types';
import { withRouter } from "react-router";
import { storeChange } from './../../redux/actions/';
import { connect } from 'react-redux';
import url from '../../redux/httpUtil/serverApi';
import promiseUtils from '../../redux/httpUtil/cancelableFetch';
import oncamPng from '../../assets/img/oncam.png';
import navigate from '../../assets/img/navigate.png';
import camIcon from '../../assets/img/offcam_dashboard.png';
import offcamPng from '../../assets/img/offcam.png';
import noImage from '../../assets/img/na.png';
import redDot from "../../assets/img/red_circle.png";
import greenDot from "../../assets/img/green_circle.png";
import util from '../../Util/Util';
import WebRTCPlayer from '../../component/Player/WebRTCPlayer';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';

export class MapView extends PureComponent {
  constructor() {
    super();
    this.state = {
      cameraData: [],
      cameraDataList: null,
      storeData: [],
      modal: false,
      toggleMapModal: false,
      showCameraModal: false,
      cameraData: '',
      camStream: '',
      camId: ''
    }
    this.locations = []
    this.map = null;
    this.infoWindow = null;
    this.options = { legWeight: 3 }
    this.timeOut = null;
    this.markerCluster = [];
    this.cluster = null;
    this.canvas = null;
    this.ctx = null;
    this.canvasWidth = 0;
    this.canvasHeight = 0;
    this.offsetX = 0;
    this.offsetY = 0;
  }

  imageDataRequest(data) {
    let me = this;
    let liveCamID = document.getElementById('liveCam');
    let CamStatus = document.getElementById('cameraStatus');
    if (data._id && data._id == me.state.camId) {
      var formData = new FormData();
      formData.append('storeId', data.storeId._id ? data.storeId._id : data.storeId);
      formData.append('camId', data._id);
      formData.append('cameraImageUrl', data.cameraImageUrl);
      formData.append('cameraRTSPUrl', data.cameraRTSPUrl);
      formData.append('imageEnabled', data.imageEnabled || false);

      var p = fetch(url.IMAGE_DATA + '?v=' + new Date().valueOf(), {
        method: 'POST',
        body: formData
      });
      p = promiseUtils.makeCancelable(p, 2000);
      // me.lastFetch = p;
      p.then(response => {
        if (response.status === 200) {
          response.arrayBuffer().then(function (responseBuffer) {
            if (liveCamID) {
              if (responseBuffer.byteLength) {
                let src = 'data:image/jpeg;base64,' + new Buffer(responseBuffer).toString('base64');
                liveCamID.innerHTML = `<img src=${src} className='live-video-image-cover video-image-loading' alt='Sample cam' width='100%' height:'100%' />`
                // liveCamID.src = 'data:image/jpeg;base64,' + new Buffer(responseBuffer).toString('base64')
              }
            }

            if (CamStatus) {
              if (response.headers.get("connected")) {
                CamStatus.remove();
              } else {
                CamStatus.src = redDot
              }
            }

            me.startImageData(data);
          })
        } else {
          console.log('error')
        }
      }, function (err) {
        console.log(err)
      });
    } else {
      clearTimeout(me.timeOut);
    }
  }

  startImageData(data) {
    this.timeOut = setTimeout(this.imageDataRequest.bind(this, data), 300);
  }

  getGoogleMaps() {
    // If we haven't already defined the promise, define it
    if (!this.googleMapsPromise) {
      this.googleMapsPromise = new Promise((resolve, reject) => {
        setTimeout(() => {
          if (window.google) {
            resolve(window.google);
          }
        }, 400)
      });
    }

    return this.googleMapsPromise;
  }

  siteSelection(data) {
    if (data) {
      let val = [{ label: 'All', value: 'All' }];
      val.push({ label: data.storeId.name, value: data.storeId._id });

      val = val.filter(function (e) { return val.length >= 1 && val[val.length - 1].label != 'All' ? e.label != 'All' : e.label === 'All' });
      let cameraData = this.props.storesData.data.data,
        filterData = [],
        selectedMultipleStoreLength = val.length;
      if (val && val.length == 0) {
        val = [{ label: 'All', value: 'All' }]
      }
      localStorage.setItem('SelectedStore', JSON.stringify(val));

      if (val && selectedMultipleStoreLength > 0) {
        val.forEach(function (data) {
          let selectedSite = data.label === 'All' ? cameraData : cameraData.filter(function (e) { return e.storeId._id === data.value });
          if (selectedSite.length > 0) {
            selectedSite.forEach(function (data) {
              filterData.push(data);
            });
          }
        });

        if (val && val.length > 0 && val[0].label === 'All') {
          filterData = cameraData;
        }
        this.props.dispatch(storeChange({ data: filterData, selectedStore: val }));
      } else {
        this.props.dispatch(storeChange({ data: cameraData, selectedStore: val }));
      }
      this.setState({
        selectedOption: val,
        disableSelectTag: val.length > 0 ? true : false,
        selectedTag: ''
      });
      this.props.history.push('video');
    }

  }

  handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ?
      'Error: The Geolocation service failed.' :
      'Error: Your browser doesn\'t support geolocation.');
    infoWindow.open(this.map);
  }

  componentDidMount() {
    let me = this;
    this.props.dispatch(storesData.request({ stores: [] }));
    me.getGoogleMaps().then((google) => {
      // if(!google)
      me.map = new window.google.maps.Map(document.getElementById('map'), {
        center: { lat: 28.6394736, lng: 77.3266879 },
        zoom: 12,
        styles: [
          {
            "elementType": "geometry",
            "stylers": [
              {
                "color": "#f5f5f5"
              }
            ]
          },
          {
            "elementType": "labels.icon",
            "stylers": [
              {
                "visibility": "off"
              }
            ]
          },
          {
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#616161"
              }
            ]
          },
          {
            "elementType": "labels.text.stroke",
            "stylers": [
              {
                "color": "#f5f5f5"
              }
            ]
          },
          {
            "featureType": "administrative.land_parcel",
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#bdbdbd"
              }
            ]
          },
          {
            "featureType": "poi",
            "elementType": "geometry",
            "stylers": [
              {
                "color": "#eeeeee"
              }
            ]
          },
          {
            "featureType": "poi",
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#757575"
              }
            ]
          },
          {
            "featureType": "poi.park",
            "elementType": "geometry",
            "stylers": [
              {
                "color": "#e5e5e5"
              }
            ]
          },
          {
            "featureType": "poi.park",
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#9e9e9e"
              }
            ]
          },
          {
            "featureType": "road",
            "elementType": "geometry",
            "stylers": [
              {
                "color": "#ffffff"
              }
            ]
          },
          {
            "featureType": "road.arterial",
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#757575"
              }
            ]
          },
          {
            "featureType": "road.highway",
            "elementType": "geometry",
            "stylers": [
              {
                "color": "#dadada"
              }
            ]
          },
          {
            "featureType": "road.highway",
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#616161"
              }
            ]
          },
          {
            "featureType": "road.local",
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#9e9e9e"
              }
            ]
          },
          {
            "featureType": "transit.line",
            "elementType": "geometry",
            "stylers": [
              {
                "color": "#e5e5e5"
              }
            ]
          },
          {
            "featureType": "transit.station",
            "elementType": "geometry",
            "stylers": [
              {
                "color": "#eeeeee"
              }
            ]
          },
          {
            "featureType": "water",
            "stylers": [
              {
                "color": "#535353"
              },
              {
                "visibility": "on"
              }
            ]
          },
          {
            "featureType": "water",
            "elementType": "geometry",
            "stylers": [
              {
                "color": "#c9c9c9"
              }
            ]
          },
          {
            "featureType": "water",
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#9e9e9e"
              }
            ]
          },
          {
            "featureType": "water",
            "elementType": "labels.text.stroke",
            "stylers": [
              {
                "color": "#333333"
              }
            ]
          }
        ]
      });

      // Create the search box and link it to the UI element.
      var input = document.getElementById('pac-input');
      var searchBox = new google.maps.places.SearchBox(input);
      me.map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

      // Bias the SearchBox results towards current map's viewport.
      me.map.addListener('bounds_changed', function () {
        searchBox.setBounds(me.map.getBounds());
      });

      var markers = [];
      // Listen for the event fired when the user selects a prediction and retrieve
      // more details for that place.
      searchBox.addListener('places_changed', function () {
        var places = searchBox.getPlaces();

        if (places.length == 0) {
          return;
        }

        // Clear out the old markers.
        markers.forEach(function (marker) {
          marker.setMap(null);
        });
        markers = [];

        // For each place, get the icon, name and location.
        var bounds = new google.maps.LatLngBounds();
        places.forEach(function (place) {
          let geomety = place.geometry;
          let location = geomety && geomety.location;
          let viewport = geomety && geomety.viewport;
          if (!geomety) {
            console.log("Returned place contains no geometry");
            return;
          }
          var icon = {
            url: place.icon,
            size: new google.maps.Size(71, 71),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(17, 34),
            scaledSize: new google.maps.Size(25, 25)
          };

          // Create a marker for each place.
          markers.push(new google.maps.Marker({
            map: me.map,
            icon: icon,
            title: place.name,
            position: location
          }));

          if (viewport) {
            // Only geocodes have viewport.
            bounds.union(viewport);
          } else {
            bounds.extend(location);
          }
        });
        me.map.fitBounds(bounds);
      });


      this.oms = new window.OverlappingMarkerSpiderfier(me.map, {
        keepSpiderfied: true,
        circleFootSeparation: 150,
        circleStartAngle: 120
      });

      me.infoWindow = new google.maps.InfoWindow;
      // Try HTML5 geolocation.
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
          var pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          me.infoWindow.setPosition(pos);
          me.map.setCenter(pos);
        }, function () {
          me.handleLocationError(true, me.infoWindow, me.map.getCenter());
        });
      } else {
        // Browser doesn't support Geolocation
        me.handleLocationError(false, me.infoWindow, me.map.getCenter());
      }
    });
  }


  setClusterData = () => {
    let me = this;
    if (me.map) {
      me.getGoogleMaps().then((google) => {
        let latlngbounds = new google.maps.LatLngBounds();
        me.locations.map(function (data, i) {
          if (data.storeId.latitude && data.storeId.longitude) {
            let Latlng = new google.maps.LatLng(data.storeId.latitude, data.storeId.longitude);
            let url = data.storeId.isConnected ? oncamPng : offcamPng;

            let icon = {
              url: url, // url
              scaledSize: new google.maps.Size(40, 40), // scaled size
              origin: new google.maps.Point(0, 0), // origin
              anchor: new google.maps.Point(20, 20), // anchor
              labelOrigin: new google.maps.Point(20, -10),
            };

            let marker = new google.maps.Marker({
              position: Latlng,
              map: me.map,
              icon: icon,
              label: { color: '#00aaff', fontWeight: 'bold', fontSize: '14px', text: '' },
              title: '',
              animation: google.maps.Animation.DROP
            });
            latlngbounds.extend(Latlng);

            // Check for spider view
            let cameraCoordinates = data.cameraCoordinates || [];
            if (!cameraCoordinates || (cameraCoordinates && cameraCoordinates.length == 0)) {
              // me.oms.addMarker(marker); // add marker in spider view
            }
            me.markerCluster.push(marker); // add marker in cluster
            //Attach click event to the marker.
            (function (marker, data) {
              google.maps.event.addListener(marker, "click", function (e) {
                let version = `/?v=${Date.now()}`;
                let mapImage = util.serverUrl + "/api/mapThumbnail/" + data.storeId.map + version;
                let storeName = data.storeId.name;
                let isConnected = data.storeId.isConnected
                clearTimeout(me.timeOut);
                if (cameraCoordinates && cameraCoordinates.length > 0) {
                  // me.infoWindow.setContent(`<canvas id="canvas"  width="582" height="425"/>`);
                  // me.infoWindow.open(me.map, marker);
                  // setTimeout(function () { me.updateCanvas(cameraCoordinates, mapImage, isConnected, storeName); }, 1000);
                } else {
                  me.infoWindow.setContent(`<div style='width: 15em;'><div style='text-overflow:ellipsis;white-space:nowrap;overflow:hidden;width:15em'>${storeName}</div><div style='display: flex;'><span id="MapViewSiteName" ><img style='width:40px;padding-top:1em;cursor: pointer;' title="Navigate to video screen" src=${navigate} /></span><span style='padding-left:1em;' id="showCameraIcon"><img style='width:40px;padding-top:1em;cursor: pointer;' title="Show camera's"  src=${camIcon} /> </span></div>`);
                  me.infoWindow.open(me.map, marker);
                  setTimeout(function () {
                    var siteIcon = document.getElementById("MapViewSiteName");
                    if (siteIcon) {
                      siteIcon.addEventListener('click', me.siteSelection.bind(me, data));
                    }
                    var showCameraIcon = document.getElementById("showCameraIcon");
                    if (showCameraIcon) {
                      showCameraIcon.addEventListener('click', me.showCameraModal.bind(me, data));
                    }
                  }, 1000);
                }
              });

              google.maps.event.addListener(me.infoWindow, 'closeclick', function () { // on close clike event info window
                me.setState({ camId: '' })
                clearTimeout(me.timeOut);
              });

              google.maps.event.addListener(me.map, 'zoom_changed', function () {
                util.getGoogleMarkerCount(me.markerCluster);
              });
              me.oms.addListener('spiderfy', function () {
                util.getGoogleMarkerCount(me.markerCluster);
              });

              me.oms.addListener('unspiderfy', function () {
                util.getGoogleMarkerCount(me.markerCluster);
              });
              util.getGoogleMarkerCount(me.markerCluster);
            })(marker, data);
          }
        });

        setTimeout(function () { me.map.fitBounds(latlngbounds); }, 500);

        this.cluster = new window.MarkerClusterer(me.map, me.markerCluster, { imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m', maxZoom: 12 });
      })
    }
  }

  updateGrid(scope, nextProps) {
    let selectedStoreData = nextProps.storeChange ? nextProps.storeChange.selectedStore : null;
    let selectedTagsData = nextProps.storeChange ? nextProps.storeChange.selectedTag : null;
    let storeChangeData = scope.props.storeChange;
    let updateGrid = false;
    if (selectedStoreData || selectedTagsData) {
      if (selectedStoreData) {
        if (storeChangeData.selectedStore != selectedStoreData) {
          storeChangeData.selectedStore = selectedStoreData;
          updateGrid = true;
        }
      }
      if (selectedTagsData) {
        if (storeChangeData.selectedTag != selectedTagsData) {
          storeChangeData.selectedTag = selectedTagsData;
          updateGrid = true;
        }
      }
      return updateGrid;
    }
  }

  updateCanvas = (circles, mapImage, isConnected, storeName) => {
    this.canvas = document.getElementById("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.offsetX = this.canvas.getBoundingClientRect().left;
    this.offsetY = this.canvas.getBoundingClientRect().top;
    let img = new Image();
    img.onload = this.drawImageScaled.bind(this, img, circles, isConnected, storeName);
    img.src = mapImage;
  }

  drawImageScaled(img, circles, isConnected, storeName) {
    let { cameraData } = this.state,
      newCircles = [];
    cameraData && cameraData.length > 0 && cameraData.map((el) => {
      circles.filter((element) => {
        if (element.camId == el._id) {
          newCircles.push(element);
        }
      })
    });
    circles = newCircles;
    var canvas = this.ctx.canvas;
    var hRatio = canvas.width / img.width;
    var vRatio = canvas.height / img.height;
    var ratio = Math.min(hRatio, vRatio);
    var centerShift_x = (canvas.width - img.width * ratio) / 2;
    var centerShift_y = (canvas.height - img.height * ratio) / 2;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.ctx.drawImage(img, 0, 0, img.width, img.height,
      centerShift_x, centerShift_y, img.width * ratio, img.height * ratio);
    if (circles) {
      for (var i = 0; i < circles.length; i++) {
        var circle = circles[i];
        util.drawCircle(circle, this.ctx, null, null, [], "map", isConnected);
        this.ctx.fillStyle = circle.fill;
        this.ctx.fill();
        this.ctx.stroke();

      }
      var me = this;
      this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this, storeName))
    }
  }

  handleMouseDown = (storeName, e) => {
    e.preventDefault();
    e.stopPropagation();
    let mouseX = parseInt(e.clientX - this.offsetX);
    let mouseY = parseInt(e.clientY - this.offsetY);

    let circles = this.state.storeData[0].cameraCoordinates || [];
    for (var i = 0; i < circles.length; i++) {
      var circle = circles[i];
      var dx = circle.x - mouseX;
      var dy = circle.y - mouseY;
      if (dx * dx + dy * dy < circle.r * circle.r) {
        this.setState({ camId: circle.cameraData._id });
        this.toggle();
        this.startImageData(circle.cameraData);
        let liveCameraHeader = document.getElementById('header');
        if (liveCameraHeader) {
          liveCameraHeader.innerHTML = `<div style='max-width: 446px'><h4 style='color: #6c6c6c !important'> ${storeName} - ${circle.cameraData.name} <img id='cameraStatus' src=${redDot} /></h4></div>`;
        }
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    let me = this;
    const { storeChange } = this.props;
    if (nextProps['storesData']) {
      const { data } = nextProps['storesData'];
      let isToUpdateGridData = this.updateGrid(this, nextProps);
      if (isToUpdateGridData) {
        let selectedStoreLocal = [];
        if (JSON.parse(localStorage.getItem('SelectedStore')) && JSON.parse(localStorage.getItem('SelectedStore')).length > 0) {
          selectedStoreLocal = JSON.parse(localStorage.getItem('SelectedStore'));
        }
        let cameraFilteredData = storeChange.selectedStore.length > 0 ? nextProps.storeChange && nextProps.storeChange.data ? nextProps.storeChange.data : data.data : [];
        let storeCameraData = [];
        // For refresh, we are picking up thelocalstorage value. 
        if (selectedStoreLocal.length > 0 && selectedStoreLocal[0].label !== 'All') {
          selectedStoreLocal.forEach(function (item) {
            storeCameraData = storeCameraData.concat(cameraFilteredData.filter((cam) => cam.storeId.name == item.label));
          });
          if (storeCameraData.length > 0) {
            //assiging filtered camera data based on store selected in universal filter.
            cameraFilteredData = storeCameraData
          }
        }
        this.setState({ storeData: storeChange.selectedStore.length > 0 && data && data.stores || selectedStoreLocal || [], cameraData: cameraFilteredData }, () => {

          for (var i = 0; i < this.markerCluster.length; i++) {
            this.markerCluster[i].setMap(null);
          }
          if (this.cluster) {
            this.cluster.clearMarkers();
          }
          if (this.oms) {
            this.oms.clearMarkers();
          }

          this.markerCluster = [];
          me.locations = [];

          cameraFilteredData.map((d, i) => {
            let store = me.state.storeData.filter((element) => {
              return element._id == d.storeId._id
            })
            let cameraCoordinates = store && store.length > 0 && store[0].cameraCoordinates || [];
            if (cameraCoordinates && cameraCoordinates.length > 0) {
              d.cameraCoordinates = cameraCoordinates;
            }
            me.locations.push(d);
          });

          me.getGoogleMaps().then((google) => {
            me.setClusterData();
          });
        });
      }
    }
  }

  toggle = () => {
    this.setState(prevState => ({
      modal: !prevState.modal
    }), () => {
      if (!this.state.modal) {
        this.setState({ camId: '' })
        clearTimeout(this.timeOut);
      }
    });
  }

  toggleMapModal = () => {
    this.setState({ toggleMapModal: !this.state.toggleMapModal });
  }

  showCameraModal = (data) => {
    let camList = [];
    if (data) {
      camList = this.props.storesData.data.data.filter(function (cams) { return cams.storeId._id == data.storeId._id });
    }
    this.setState({ showCameraModal: !this.state.showCameraModal, cameraDataList: camList });
  }

  onCamClick = (data) => {
    this.setState({ toggleMapModal: true, camConfigData: data });
  }

  render() {
    let { modal, toggleMapModal, storeName, camName, camConfigData, showCameraModal, cameraDataList, camId } = this.state;
    let videoConfigType = camConfigData && camConfigData.storeId && camConfigData.storeId.liveVideoConfig ? camConfigData.storeId.liveVideoConfig : 'WebRTC';
    let url = null;
    if (videoConfigType == 'FLV' || videoConfigType == "NodeMedia") {
      url = camConfigData.flv.lowStreamURL;
    }
    if (videoConfigType == "WebRTC" && camConfigData && camConfigData.storeId) {
      camId = camConfigData.lowStreamId;
    }
    let camNameAndDetail = "";
    if (camConfigData) {
      camNameAndDetail = camConfigData.storeId.name + " - " + camConfigData.name;
    }
    return (
      <React.Fragment>
      
        <div style={{ height: '100%', width: '100%' }}>
          <div id="map"></div>
        </div>
        <Modal isOpen={modal} toggle={() => this.toggle()} >
          <ModalHeader toggle={() => this.toggle()}><span id="header" className="site-map-upload"></span></ModalHeader>
          <ModalBody>
            <div id='liveCam'><img src={noImage} className='live-video-image-cover video-image-loading' alt='Sample cam' width='100%' height='100%' /></div>
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={() => this.toggle()}>Cancel</Button>
          </ModalFooter>
        </Modal>
        <Modal isOpen={toggleMapModal} toggle={() => this.toggleMapModal()} className="custom-modal-style">
          <ModalHeader toggle={() => this.toggleMapModal()}><span id="mapModal" className="site-map-upload"> {camNameAndDetail}</span></ModalHeader>
          <ModalBody style={{ height: '26em' }} >
            <WebRTCPlayer config={this.state.camConfigData} url={url} componentKey={camId} style={{ height: '100%', width: '100%' }} />
          </ModalBody>
        </Modal>
        <Modal isOpen={showCameraModal} toggle={() => this.showCameraModal()} className="custom-modal-style">
          <ModalHeader toggle={() => this.showCameraModal()}><span id="mapModal" className="site-map-upload"> {cameraDataList && cameraDataList.length > 0 ? cameraDataList[0].storeId.name : ""}</span></ModalHeader>
          <ModalBody style={{ height: '26em', overflow: 'scroll' }} >
            {cameraDataList && cameraDataList.map((item, index) => {
              return (
                <div
                  className={'notDragging mapViewCams'}
                  onClick={this.onCamClick.bind(this, item)}
                >
                  {item.storeId && item.storeId.name && item.name ? (item.name) : "Blank"}
                </div>
              );
            })}
          </ModalBody>
        </Modal>
      </React.Fragment>
    );
  }
}

MapView.contextTypes = {
  router: PropTypes.object.isRequired
};

function mapStateToProps(state, ownProps) {
  return {
    storesData: state.storesData,
    userDetail: state.userDetail,
    storeChange: state.storeChange
  };
}

var MapViewModule = connect(mapStateToProps)(withRouter(MapView));
export default MapViewModule;
