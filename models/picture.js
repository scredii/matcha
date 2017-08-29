let connexion = require('../config/setup');
let md5 = require('md5');
let randomize = require('randomatic');
let mmmagic = require('mmmagic');  
let sizeOf = require('image-size');
let fs = require('fs');

class picture {

			static profilpic(identifiant, cb)
			{
				connexion.query('SELECT picture FROM pictures WHERE content_id = ? AND pp = 1', [identifiant], (err, pp) => {
					if (err) throw err;
					cb(pp)
				});
			}

			static add(picture, identifiant, cb)
			{
				var magic = new mmmagic.Magic(mmmagic.MAGIC_MIME_TYPE);
				var id_picture = randomize('Aa0', 10);
				id_picture =  md5(id_picture);
				if (picture.mimetype == "image/jpeg")
					id_picture = id_picture + ".jpg";
				if (picture.mimetype == "image/png")
					id_picture = id_picture + ".png";
				if (picture.mimetype == "image/gif")
					id_picture = id_picture + ".gif";
				picture.mv('public/images/user_image/'+id_picture, function(err) {
					if (err)
						return res.status(500).send(err);
					else
					{
						connexion.query('SELECT COUNT(*) AS count FROM pictures WHERE content_id = ?', [identifiant], (err, count) => {
							if (err) throw err;
							if (count[0].count && count[0].count >= 5)
							{
								cb("overload");
								return;
							}
							else
							{	
								sizeOf('public/images/user_image/'+id_picture, function (err, dimensions) {
									if (err) console.log(err);
									if (!dimensions)
									{
										fs.unlink('public/images/user_image/'+id_picture, (err) =>{
											if (err) console.log(err);
										});
										cb(false);
										return;
									}
									else
									{
										connexion.query('INSERT INTO pictures SET picture = ?, content_id = ?', [id_picture, identifiant], (err) => {
											if (err) throw err;
										});
										cb(true);
										return;
									}
								});
							}
						});
					}
				});
			};

			static all(identifiant, cb)
			{
				connexion.query('SELECT picture FROM pictures WHERE content_id = ?', [identifiant], (err, hashtag) =>{
					if (err) throw err;
					cb(hashtag);
				});
			};

			static del(picture, identifiant, cb)
			{
				connexion.query('SELECT picture FROM pictures WHERE content_id = ? AND picture = ?', [identifiant, picture], (err, result) => {
					if (result.length <= 0)
					{
						cb(false);
					}
					else
					{
						connexion.query('DELETE FROM pictures WHERE content_id = ? AND picture = ?', [identifiant, picture], (err, result) => {
						if (err) throw err;
							fs.unlink('public/images/user_image/'+picture, (err) =>{
									if (err) console.log(err);
							});
						cb(true);
						});
					}
				});
			}

			static pp(picture, identifiant)
			{
				connexion.query('SELECT picture FROM pictures WHERE content_id = ? AND pp = 1', [identifiant], (err, result) => {
					console.log(result)
					console.log(result.length)
					if (result.length === 0)
					{
						connexion.query('UPDATE pictures SET pp = 1 WHERE content_id = ? AND picture = ?', [identifiant, picture], (err) =>{
							if (err) throw err;
						});
					}
					else if (result.length > 0)
					{
						connexion.query('UPDATE pictures SET pp = 0 WHERE content_id = ? AND picture = ?', [identifiant, result[0].picture], (err) =>{
							if (err) throw err;
							connexion.query('UPDATE pictures SET pp = 1 WHERE content_id = ? AND picture = ?', [identifiant, picture], (err) =>{
								if (err) throw err;
							});
						});
					}
				});
			}
}
module.exports = picture;