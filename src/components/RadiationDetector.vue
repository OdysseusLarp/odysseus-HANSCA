<template>
  <v-ons-page>
    <toolbar-top/></toolbar-top>
    <div style="text-align: center; margin-top: 50px;">
      <h1 :class="exposureRisk">{{ radiationLevel }}</h1>
      <div>
      Latitude: {{ latitude }}<br>
      Longitude: {{ longitude }}
      </div>
      <table class="center">
        <tr>
          <td>Source Type</td>
          <td>Distance</td>
          <td>Dose</td>
        </tr>
        <tr v-for="source in radiationSources">
          <td>{{ source.type }}</td>
          <td>{{ source.distance }} m</td>
          <td>{{ source.radiationLevel }} Sv</td>
        </tr>
      </table>
    </div>
  </v-ons-page>
</template>
<script>
export default {
  data() {
    return {
      radiationLevel: 0,
      latitude: 0,
      longitude: 0,
      exposure: 0,
      exposureRisk: 'exposure-normal',
      radiationSources: [
        { type: 'Gamma', intensity: 1000, latitude: 60.624176, longitude: 24.875920, distance: 0, radiationLevel: 0 },
        { type: 'X-ray', intensity: 5000, latitude: 60.624276, longitude: 24.876011, distance: 0, radiationLevel: 0 },
        /*{ type: 'Gamma', intensity: 1000, latitude: 60.322611, longitude: 24.856569, distance: 0, radiationLevel: 0 },
        { type: 'X-ray', intensity: 5000, latitude: 60.322695, longitude: 24.856748, distance: 0, radiationLevel: 0 },
        { type: 'Neutron', intensity: 10000, latitude: 60.62424, longitude: 24.876, distance: 0, radiationLevel: 0 },
        { type: 'Ultraviolet', intensity: 50000, latitude: 60.6242, longitude: 24.878, distance: 0, radiationLevel: 0 },
        */
      ],
      columns: ['type', 'distance', 'radiationLevel'],
      watcher: 0
    }
  },
  methods: {
    updatePosition(position) {
      this.latitude = position.coords.latitude
      this.longitude = position.coords.longitude
      this.radiationLevel = 0
      this.radiationSources.forEach((source) => {
        source.distance = distance(this.longitude, this.latitude, source.longitude, source.latitude).toPrecision(4) * 1000
        if(source.distance < 1) source.distance = 1
        source.radiationLevel = (source.intensity / Math.pow(source.distance, 2)).toPrecision(4)
        this.radiationLevel = (Number(this.radiationLevel) + Number(source.radiationLevel)).toPrecision(4)
      })
      this.exposureRisk = 'exposure-normal'
      if (this.radiationLevel > 100) this.exposureRisk = 'exposure-warning'
      if (this.radiationLevel > 500) this.exposureRisk = 'exposure-critical'
    },
    positionError(err) {
      console.warn('ERROR(' + err.code + '): ' + err.message)
    },
  },
  created() {
    if (navigator.geolocation) {
      this.watcher = navigator.geolocation.watchPosition(this.updatePosition, this.positionError, {maximumAge:0, timeout:5000, enableHighAccuracy: true})
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

/** Converts numeric degrees to radians */
if (typeof(Number.prototype.toRad) === "undefined") {
  Number.prototype.toRad = function() {
    return this * Math.PI / 180;
  }
}

</script>
<style>
.center {
  margin-left:auto; 
  margin-right:auto;
}
.exposure-normal {
  color: green;
}
.exposure-warning {
  color: yellow;
}
.exposure-critical {
  color: red;
}
</style>
