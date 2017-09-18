let connexion = require('../config/setup');

class location{

	static check_city(city, cb)
	{
		let googleMapsClient = require('@google/maps').createClient({
			key: 'AIzaSyB9Gr5C1dfF_1NnemWPlD9ideN3DG6Dn4I'
		});
		googleMapsClient.geocode({ address: city, language: 'fr-FR' }, function(err, response) {
			if (err) throw err;
			if (!err) {
				cb(response.json.results[0])
			}
		});
	}

	static	save_locate(address, identifiant)
	{
		connexion.query('SELECT * FROM locations WHERE id_content = ?', [identifiant], (err, user) =>{
			if (err) throw err;
			console.log(user);
			if (user.length === 0)
			{
				console.log("user non trouvé")
				connexion.query('INSERT INTO locations SET latitude = ?, longitude = ?, city = ?, id_content = ?', [address.coords.latitude.toFixed(3), address.coords.longitude.toFixed(3), address.address.city, identifiant], (err, result) => {
					if (err) throw err;
					console.log(result);
				});
			}
			else
			{
				console.log("user trouvé")
				connexion.query('UPDATE locations SET latitude = ?, longitude = ?, city = ? WHERE id_content = ?', [address.coords.latitude.toFixed(3), address.coords.longitude.toFixed(3), address.address.city, identifiant], (err, result) => {
					if (err) throw err;
					console.log(result);
				});
			}
		});
	}

		static	save_locate_city(address, city, identifiant)
	{
		console.log(address);
		console.log(city);
		console.log(identifiant);
		connexion.query('SELECT * FROM locations WHERE id_content = ?', [identifiant], (err, user) =>{
			if (err) throw err;
			console.log(user);
			if (user.length === 0)
			{
				console.log("user non trouvé")
				connexion.query('INSERT INTO locations SET latitude = ?, longitude = ?, city = ?, id_content = ?', [address.geometry.location.lat.toFixed(3), address.geometry.location.lng.toFixed(3), address.formatted_address, identifiant], (err, result) => {
					if (err) throw err;
					console.log(result);
				});
			}
			else
			{
				console.log("user trouvé")
				connexion.query('UPDATE locations SET latitude = ?, longitude = ?, city = ? WHERE id_content = ?', [address.geometry.location.lat.toFixed(3), address.geometry.location.lng.toFixed(3), address.formatted_address, identifiant], (err, result) => {
					if (err) throw err;
					console.log(result);
				});
			}
		});
	}


	static my_locate(identifiant, cb)
	{
		connexion.query('SELECT city from locations WHERE id_content = ?', [identifiant], (err, city) => {
			if (err) throw err;
			if (city) cb(city);
		});
	}


// alert(calcCrow(59.3293371,13.4877472,59.3225525,13.4619422).toFixed(1));
	static get_dist(myid, cb)
	{
		connexion.query('SELECT locations.latitude, locations.longitude from locations WHERE id_content = ?', [myid], (err, result) => {
			if (err) throw err;
			if (result)
				cb(result);
			else
				cb(0)
		});
	}


     static calcCrow(lat1, lon1, lat2, lon2, cb) 
    {
      var R = 6371; // km
      var dLat = toRad(lat2-lat1);
      var dLon = toRad(lon2-lon1);
      var lat1 = toRad(lat1);
      var lat2 = toRad(lat2);

      var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
      var d = R * c;
      cb(d.toFixed(2));
    }

    // Converts numeric degrees to radians

}
    function toRad(Value) 
    {
        return Value * Math.PI / 180;
    }
    // var geocoder =  new google.maps.Geocoder();
    // geocoder.geocode( { 'address': address}, function(results, status) {
    //       if (status == google.maps.GeocoderStatus.OK) {

    //         var Lat = results[0].geometry.location.lat();
    //         var Lng = results[0].geometry.location.lng();


    //       } else {
    //         alert("Something got wrong " + status);
    //       }
    //     });

module.exports = location;