<template>
    <div>
        <span>Hello Google Map</span>
        <gmap-map
            :center="center"
            :zoom="12"
            style="width: 100%; height: 400px;"
        >
        </gmap-map>
    </div>
</template>
<script type="module">
export default {
    name: 'Home',
    data () {
        return {
            center: { lat: 31.953940000000003, lng: 35.910630000000005 }
        }
    },
    mounted() {
        let geocoder = new window.google.maps.Geocoder();
        let testAddress = '1600 W. 82nd Street, Suite 100';
        geocoder.geocode({
            'address': testAddress
        }, function (results, status) {
            console.log('---------results', results);
            if (status === 'OK') {
                let latlng = {
                    lat: results[0].geometry.location.lat(),
                    lng: results[0].geometry.location.lng()
                };

                console.log(latlng)
            } else {
                window.alert('Geocode was not successful for the following reason: ' + status);
            }
        });
    }
}
</script>