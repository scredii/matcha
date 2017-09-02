// alert(calcCrow(59.3293371,13.4877472,59.3225525,13.4619422).toFixed(1));



    //This function takes in latitude and longitude of two location and returns the distance between them as the crow flies (in km)
    // function calcCrow(lat1, lon1, lat2, lon2) 
    // {
    //   var R = 6371; // km
    //   var dLat = toRad(lat2-lat1);
    //   var dLon = toRad(lon2-lon1);
    //   var lat1 = toRad(lat1);
    //   var lat2 = toRad(lat2);

    //   var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    //     Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
    //   var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    //   var d = R * c;
    //   return d;
    // }

    // // Converts numeric degrees to radians
    // function toRad(Value) 
    // {
    //     return Value * Math.PI / 180;
    // }

    // var geocoder =  new google.maps.Geocoder();
    // geocoder.geocode( { 'address': address}, function(results, status) {
    //       if (status == google.maps.GeocoderStatus.OK) {

    //         var Lat = results[0].geometry.location.lat();
    //         var Lng = results[0].geometry.location.lng();


    //       } else {
    //         alert("Something got wrong " + status);
    //       }
    //     });


class location{

	static	save_locate(address, identifiant)
	{
		//latitude
		// var latitude = address.coords.latitude;
		console.log(address.coords.latitude);
		console.log(address.coords.longitude);
		console.log(address.address.city);
		// console.log(address.longitude.coords.latitude);
		// var latitude = address.body.longitude.coords.latitude;
		//longitude
		//city
		//id_content
		    // console.log(req.body.longitude.coords.latitude) //undefined
    // console.log(req.body.longitude.coords.longitude) //undefined
    // console.log(req.body.longitude.address.postalCode) //undefined
    // console.log(req.body.longitude.address.city) //undefined
	}
}

module.exports = location;