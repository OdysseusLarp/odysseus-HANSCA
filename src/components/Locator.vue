<template>
  <v-ons-page>
    <toolbar-top/></toolbar-top>
    <div style="text-align: center; margin-top: 50px;">
      <img class="arrow" src="images/locator/arrow.png" :style="angle"/>
      <p>{{ distance }}m</p>
    </div>
  </v-ons-page>
</template>
<script>
export default {
  data() {
    return {
      latitude: 0,
      longitude: 0,
      targets: [
        { latitude: 60.624276, longitude: 24.876011, distance: 0, bearing: 0 },
        /*
        { latitude: 60.624176, longitude: 24.875920, distance: 0, bearing: 0 },
        { latitude: 60.322611, longitude: 24.856569, distance: 0, bearing: 0 },
        { latitude: 60.322695, longitude: 24.856748, distance: 0, bearing: 0 },*/
      ],
      angle: '',
      distance: 0,
      deviceOrientation: 0,
      watcher: 0
    }
  },
  methods: {
    updatePosition(position) {
      this.latitude = position.coords.latitude
      this.longitude = position.coords.longitude
      this.targets.forEach((target) => {
        target.distance = distance(this.longitude, this.latitude, target.longitude, target.latitude).toPrecision(4) * 1000
        target.bearing = this.deviceOrientation - bearing(this.longitude, this.latitude, target.longitude, target.latitude)
      })
      this.angle = { transform: 'rotate(' + this.targets[0].bearing + 'deg)' }
      this.distance = this.targets[0].distance
    },
    positionError(err) {
      console.warn('ERROR(' + err.code + '): ' + err.message)
    },
    handleOrientation (e) {
      this.deviceOrientation = e.alpha
    }
  },
  created() {
    if (navigator.geolocation) {
      this.watcher = navigator.geolocation.watchPosition(this.updatePosition, this.positionError, {maximumAge:0, timeout:5000, enableHighAccuracy: true})
      window.addEventListener('deviceorientationabsolute', this.handleOrientation);
    }
  },
  beforeDestroy () {
    navigator.geolocation.clearWatch(this.watcher)
  }

}

function distance(lon1, lat1, lon2, lat2) {
  var R = 6371; // Radius of the earth in km
  var dLat = (lat2-lat1).toRad();  // Javascript functions in radians
  var dLon = (lon2-lon1).toRad(); 
  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) * 
          Math.sin(dLon/2) * Math.sin(dLon/2); 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d;
}
function bearing(lon1, lat1, lon2,lat2) {
    var dLon = (lon2-lon1).toRad();
    lat1 = lat1.toRad();
    lat2 = lat2.toRad();
    var y = Math.sin(dLon) * Math.cos(lat2);
    var x = Math.cos(lat1)*Math.sin(lat2) - Math.sin(lat1)*Math.cos(lat2)*Math.cos(dLon);
    var rad = Math.atan2(y, x);
    var brng = rad.toDeg();
    return (brng + 360) % 360;
}

/** Converts numeric degrees to radians */
if (typeof(Number.prototype.toRad) === "undefined") {
  Number.prototype.toRad = function() {
    return this * Math.PI / 180;
  }
}
if (typeof(Number.prototype.toDeg) === "undefined") {
  Number.prototype.toDeg = function() {
    return this * 180 / Math.PI;
  } 
}

</script>
<style>
.arrow {
    top: 100px; 
}
</style>
