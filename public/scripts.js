
	geolocator.config({
		language: "en",
		google: {
			version: "3",
			key: "AIzaSyB9Gr5C1dfF_1NnemWPlD9ideN3DG6Dn4I"
		}
	});

	// window.onload = 
	function locate_me() {
		var options = {
			enableHighAccuracy: true,
			timeout: 5000,
			maximumWait: 10000,     // max wait time for desired accuracy 
			maximumAge: 0,          // disable cache 
			desiredAccuracy: 150,    // meters 
			fallbackToIP: true,     // fallback to IP if Geolocation fails or rejected 
			addressLookup: true,    // requires Google API key if true 
			timezone: true,         // requires Google API key if true 
			// map: "map-canvas",      // interactive map element id (or options object) 
			staticMap: false         // map image URL (boolean or options object) 
		};
		geolocator.locate(options, function (err, location) {
			if (err) return console.log(err);
			console.log(location);
			return axios.post('http://localhost:8080/locate', {
				longitude: location,
			});
		});
	};


	function del_hashtag(hashtag, id)
	{
		return axios.post('http://localhost:8080/del_tag', {
				id: id,
				hashtag: hashtag,
			});
	}