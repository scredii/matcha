let connexion = require('../config/setup');
let moment = require('moment');
let bcrypt = require('bcrypt');
let md5 = require('md5');
const saltRounds = 10;
let location = require('../models/locate');
let hashtag = require('../models/hashtag');
moment.locale('fr');

class user {

	static get_pop(id, cb)
	{
		connexion.query('SELECT COUNT(user_like) as count FROM pop WHERE user_like = ?', [id], (err, count) =>{
			if (err) console.log(err);
			console.log( count)
			cb(count);
		});
	}

	static select_date_last_co(myid, cb)
	{
		connexion.query('SELECT last_connexion FROM lastconnexion WHERE user_id = ?', [myid], (err, date) =>{
			if (err) console.log(err);
			// console.log(date)
			cb(moment(date[0]));
		});
	}


	static add_date_last_connexion(myid)
	{
		connexion.query('SELECT user_id FROM lastconnexion WHERE user_id = ?', [myid], (err, id) => {
			if (err) throw err;
			if (id.length === 0)
			{
				connexion.query('INSERT INTO lastconnexion SET user_id = ?', [myid], (err, result) =>{
					if (err) console.log(err);
				});
			}
			else if (id[0].user_id == myid)
			{
				connexion.query('UPDATE lastconnexion SET user_id = ?, last_connexion = CURRENT_TIMESTAMP WHERE user_id = ?', [myid, myid], (err, result) =>{
					if (err) console.log(err);
				});
			}
			else{
				
			}
			// cb(rows.map((row) => new user (row)));
		});
	}


	// static get_mutual_match(myid, cb)
	// {
	// 	// FUNCTION OK 
	// 	// SELECT l2.* FROM likes L1 INNER JOIN likes L2 ON L1.user_like = L2.by_id AND L2.user_like = L1.by_id WHERE L2.user_like = 1;
	// 	connexion.query('SELECT l2.* FROM likes L1 INNER JOIN likes L2 ON L1.user_like = L2.by_id AND L2.user_like = L1.by_id WHERE L2.user_like = ?', [myid], (err, rows) => {
	// 		if (err) throw err;
	// 		cb(rows.map((row) => new user (row)));
	// 	});
	// }


	static get_mutual_match(myid, cb)
	{
		// FUNCTION OK 
		// SELECT l2.* FROM likes L1 INNER JOIN likes L2 ON L1.user_like = L2.by_id AND L2.user_like = L1.by_id WHERE L2.user_like = 1;
		connexion.query('SELECT U.* ,l2.user_like, l2.date_match FROM users U, likes L1 INNER JOIN likes L2 ON L1.user_like = L2.by_id AND L2.user_like = L1.by_id WHERE L2.by_id = ? AND L1.by_id = U.id OR L1.user_like = ? AND L2.by_id = U.id ORDER BY U.id', [myid, myid], (err, rows) => {
			if (err) throw err;
			// console.log(rows)
			cb(rows.map((row) => new user (row)));
		});
	}



	static get_this_match(myid, userid, cb)
	{
				connexion.query('SELECT user_like FROM likes WHERE user_like = ? AND by_id = ?', [userid, myid], (err, rows) =>{
			if (err) console.log(err);
			// console.log(rows)
			cb(rows.map((row) => new user (row)));
		});
	}

	static get_match(id, cb)
	{
		//VERIFIER SI CEST DEJA LE DERNIER POUR LE SHOOOOOTER
		connexion.query('SELECT U.id, U.pseudo, U.isconnected, P.picture, L.date_match FROM users U INNER JOIN likes L ON L.by_id = U.id INNER JOIN pictures P ON L.by_id= P.content_id AND P.pp = 1 WHERE L.user_like = ? ORDER BY L.date_match DESC', [id], (err, rows) =>{
			if (err) console.log(err);
			// console.log(rows)
			cb(rows.map((row) => new user (row)));
		});
	}

	static get_my_match(id, cb)
	{
		//VERIFIER SI CEST DEJA LE DERNIER POUR LE SHOOOOOTER
		connexion.query('SELECT U.id, U.pseudo, U.isconnected, P.picture, L.date_match FROM users U INNER JOIN likes L ON L.user_like = U.id INNER JOIN pictures P ON L.user_like = P.content_id AND P.pp = 1 WHERE L.by_id = ? ORDER BY L.date_match DESC', [id], (err, rows) =>{
			if (err) console.log(err);
			// console.log(rows)
			cb(rows.map((row) => new user (row)));
		});
	}


	static get_visite(id, cb)
	{
		//VERIFIER SI CEST DEJA LE DERNIER POUR LE SHOOOOOTER
		connexion.query('SELECT U.id, U.pseudo, U.isconnected, H.*, P.picture FROM users U INNER JOIN historical H ON H.`viewer_id` = U.id INNER JOIN pictures P ON H.viewer_id = P.content_id AND P.pp = 1 WHERE H.pageview_id = ? ORDER BY date_view DESC', [id], (err, rows) =>{
			if (err) console.log(err);
			// console.log(rows)
			cb(rows.map((row) => new user (row)));
		});
	}

	static add_view(myid, idview)
	{
		connexion.query("SELECT viewer_id FROM historical WHERE pageview_id = ? ORDER BY date_view DESC LIMIT 1;", [idview], function (err, id) {
			if (err) throw err;
			var lastview_uid = 0;
			if (id[0] != null) {
				lastview_uid = id[0].viewer_id;
			}
			if (lastview_uid != myid) {
				connexion.query('INSERT INTO historical SET viewer_id = ?, pageview_id = ?', [myid, idview], (err, result) =>{
					if (err) console.log(err);
				});
			} 
			else {
						// a deja vu
					}
		});
		// connexion.query('INSERT INTO historical SET viewer_id = ?, pageview_id = ?', [myid, idview], (err, result) =>{
		// 	if (err) console.log(err);
		// });
	}

	static connected(id)
	{
		connexion.query('UPDATE users SET isconnected = 1 WHERE id = ?', [id], (err, result) =>{
			if (err) console.log(err);
		});
	}

	static disconnect(id)
	{
		connexion.query('UPDATE users SET isconnected = 0 WHERE id = ?', [id], (err, result) =>{
			if (err) console.log(err);
		});
	}
	static add_match(userliker, byuser, cb)
	{

		connexion.query('SELECT content_id FROM pictures WHERE content_id = ? LIMIT 1', [byuser], (err, result) => {
			// console.log(result);
			if (result.length !== 0)
			{
				if (result[0].content_id == byuser)
				{
					connexion.query('SELECT count(id) as rep FROM likes WHERE user_like = ? AND by_id = ? LIMIT 1;', [userliker, byuser], (err, result) => {
						// console.log(result)
						if (result[0].rep !== 1)
						{
							connexion.query('INSERT INTO likes SET user_like = ?, by_id = ?', [userliker, byuser], (err, result) => {
								user.popplus(byuser, userliker);
								if (err) throw err;
								cb(result);
							});
							return;
						}
						else
						{
							cb("already");
						}
					});
				}
			}
				else
					cb("add_pic");
		});
	}

	static del_match(myid, user_id, cb)
	{
		connexion.query('SELECT * from likes WHERE user_like = ? AND by_id = ?', [user_id, myid], (err, result) =>{
			if (err) console.log(err);
			console.log(result)
			if (result.length === 0)
			{
				cb(-1);
			}
			else
			{
				connexion.query('DELETE FROM likes WHERE user_like = ? AND by_id = ?', [user_id, myid], (err, result) => {
					if (err) throw err;
					cb(1);
				});
			}
		});
	}


	static check_block(myid, cb)
	{
		connexion.query('SELECT * FROM block WHERE by_id = ? ORDER BY by_id', [myid], (err, result) => {
			// console.log(result);
			cb(result);
		});
	}
	static block_user(idsession, myid, userid,  cb)
	{
		connexion.query('INSERT INTO block SET user_blocked = ?, by_id = ?', [userid, myid], (err, result) =>{
			if (err) console.log(err);
			cb(result);
		});
	}

	static	recup_tok(email,cb)
	{
		connexion.query('SELECT token FROM users WHERE email = ?', [email], (err, token) =>{
			if (err) console.log(err);
			if (token)
			{
				// console.log(err);
				// if (err) throw err;
				cb(token);
			}
			else
			{
				token = ""
				cb(token);
			}
		});
	}

	static popplus1(myid, userid)
	{
		//SECURISE PAR LA SESSION !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
		connexion.query('SELECT count(id) as rep FROM users WHERE id = ? LIMIT 1;', [myid], (err, result) => {
			// console.log(result[0].rep)
			if (result[0].rep !== 1)
			{
				console.log('pas de compte je me casse');
				return;
			}
			else
			{
				console.log('bon ok je vais dans la db');
				connexion.query("SELECT by_id FROM pop WHERE user_like = ? ORDER BY date_pop DESC LIMIT 1;", [userid], function (err, id) {
					if (err) throw err;
					var lastview_uid = 0;
					if (id[0] != null) {
						lastview_uid = id[0].by_id;
					}
					if (lastview_uid != myid) {
						connexion.query('INSERT INTO pop SET user_like = ?, by_id = ?', [userid, myid], (err, result) =>{
							if (err) console.log(err);
						});
					} 
					else {
								// a deja vu
							}
				});
			}
		});
	}

	static popplus(myid, userid)
	{
		//SECURISE PAR LA SESSION !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
		connexion.query('SELECT count(id) as rep FROM users WHERE id = ? LIMIT 1;', [myid], (err, result) => {
			// console.log(result[0].rep)
			if (result[0].rep !== 1)
			{
				console.log('pas de compte je me casse');
				return;
			}
			else
			{
				console.log('bon ok je vais dans la db');
						connexion.query('INSERT INTO pop SET user_like = ?, by_id = ?', [userid, myid], (err, result) =>{
							if (err) console.log(err);
				});
			}
		});
	}

	static maj_password(user_infos, cb)
	{
		console.log(user_infos.password);
		connexion.query('SELECT token FROM users WHERE email = ?', [user_infos.email], (err, token) =>{
			if (err) throw err;
			if (token[0].token.length > 0 && token[0].token === user_infos.token)
			{
				bcrypt.genSalt(saltRounds, function(err, salt)
				{
					bcrypt.hash(user_infos.password, salt, function(err, hash)
					{
						if (err)
						{
							console.log(err);
						}
						else
						{
							if (hash)
							{
								connexion.query('UPDATE users SET password = ? WHERE email = ?', [hash, user_infos.email], (err, ret) =>{
									if (err) throw err;
									cb(ret);
								});
							}
						}
					});
				});
			}
			else
			{
				console.log("ERROR")
			}
		});
	}

	static	maj_account(content, session, cb)
	{
		// VERIFIER QUE LE MAIL NEXISTE PAS AVANT DE LA CHANGER
		if (!content.locate && content.localisation !== "")
		{
			location.check_city(content.localisation, function(coords){
				if (coords)
				{
					location.save_locate_city(coords, content.localisation, session.identifiant);
				}
			});

		}
		else if (content.locate && content.localisation === "")
		{
			console.log("Je veux etre en auto");
		}
		connexion.query('UPDATE users SET pseudo = ?, name = ?, lastname = ?, email = ?, gender = ?, match_g = ?, bio = ?, age = ? WHERE email = ?', [content.pseudo, content.firstname, content.lastname, content.email, content.gender, content.match_g, content.bio, content.age, session.email], (err, ret) =>{
		if (err) throw err;
		cb(ret);
		});
	}

	static	search_account(content, cb)
	{
		// console.log(content.session.email);
		connexion.query('SELECT * FROM users WHERE email = ?', [content.session.email], (err, user) =>{
			if (err) throw err;
			cb(user);
		});
	}

	static search_user(content, cb)
	{
		connexion.query('SELECT * FROM users WHERE email = ?', [content.email], (err, res) => {
			if (err) throw err;
			cb(res);
		});
	}

	static check_register(content, cb)
	{
		connexion.query('SELECT * FROM users WHERE pseudo = ? OR email = ?', [content.pseudo, content.email], (err, results) => {
			if (err) throw err;
			if (results)
			{
				cb(results);
			}
		});
	}

	static pass_secure(password, cb){
	if (password.length < 6)
		 cb(false);
	let hasUpperCase = /[A-Z]/.test(password);
	let hasLowerCase = /[a-z]/.test(password);
	let hasNumbers = /\d/.test(password);
	let hasNonalphas = /\W/.test(password);
	if (hasUpperCase + hasLowerCase + hasNumbers + hasNonalphas < 2)
		cb(false);
	else
		cb(true);
	}
	static create(content, cb)
	{
		var token = md5(content.password);
		bcrypt.genSalt(saltRounds, function(err, salt)
		{
			bcrypt.hash(content.password, salt, function(err, hash)
			{
				if (err)
				{
					console.log(err);
				}
				else
				{
					if (hash)
					{
						connexion.query('INSERT INTO users SET pseudo = ?, name = ?, lastname = ?, email = ?, password = ?, gender = ?, token = ?', [content.pseudo, content.firstname, content.name, content.email, hash, content.gender, token], (err, result) => {
							if (err) throw err;
							cb(result);
						});
					}
				}
			});
		});
	}
	static getbyid(id, cb)
	{
		connexion.query('SELECT users.pseudo, users.id, users.name, users.lastname, users.gender, users.match_g, users.bio, users.age, users.isconnected, locations.latitude, locations.longitude, locations.city FROM users LEFT JOIN locations  ON users.id = locations.id_content  WHERE users.id = ?', [id], (err, user) => {
			if (err) throw err;
			// console.log(user);
			cb(user);
		});
	}
	static compare_pass(pass, content, bool)
	{
		bcrypt.compare(content.password, pass[0].password, function(err, res) {
			if (err) throw err;
			bool(res);
		});
	}

	static all_profile(cb)
	{
		connexion.query('SELECT U.*, L.city, L.latitude, L.longitude, P.picture, H.hashtag FROM users U INNER JOIN locations L ON U.id = L.id_content LEFT JOIN pictures P ON U.id = P.content_id AND P.pp = 1 LEFT JOIN hashtag H ON U.id = H.content_id WHERE NOT EXISTS (SELECT * FROM block B WHERE U.id = B.user_blocked) ORDER BY U.id', (err, rows) =>{
			if (err) throw err;
			// console.log(rows)
			// cb(result);
			cb(rows.map((row) => new user (row)));
		});
	}

	// static suggest(cb)
	// {
	// 	connexion.query('SELECT U.*, L.city, L.latitude, L.longitude, P.picture, H.hashtag FROM users U INNER JOIN locations L ON U.id = L.id_content LEFT JOIN pictures P ON U.id = P.content_id AND P.pp = 1 LEFT JOIN hashtag H ON U.id = H.content_id WHERE NOT EXISTS (SELECT * FROM block B WHERE U.id = B.user_blocked) ORDER BY U.id', (err, rows) =>{
	// 		if (err) throw err;
	// 		// console.log(rows)
	// 		// cb(result);
	// 		cb(rows.map((row) => new user (row)));
	// 	});
	// }

	static all_hashtag(cb)
	{
		connexion.query('SELECT hashtag, content_id FROM hashtag GROUP BY content_id', (err, rows) =>{
			if (err) throw err;
			console.log(rows)
			// cb(result);
			cb(rows.map((row) => new user (row)));
		});
	}

	constructor (row){
		this.row = row;
	}
// DB USERS
	get pseudo (){
		return this.row.pseudo;
	}
	get lastconnexion (){
		return this.row.lastconnexion;
	}
	get last_connexion (){
		return this.row.last_connexion;
	}
	get by_id (){
		return this.row.by_id;
	}
	get user_like (){
		return this.row.user_like;
	}		
	get date_match (){
		return moment(this.row.date_match);
	}
	get isconnected (){
		return this.row.isconnected;
	}
	get name (){
		return this.row.name;
	}
	get lastname (){
		return this.row.name;
	}	
	get date_view (){
		return moment(this.row.date_view);
	}
	get gender (){
		return this.row.gender;
	}
	get hashtag (){
		return this.row.hashtag;
	}
	get user_blocked (){
		return this.row.user_blocked;
	}
	get match_g (){
		return this.row.match_g;
	}
	get bio (){
		return this.row.bio;
	}
	get age (){
		return this.row.age;
	}
	get id (){
		return this.row.id;
	}
	get viewer_id (){
		return this.row.viewer_id;
	}
// DB LOCATIONS
	get latitude (){
		return this.row.latitude;
	}
	get longitude (){
		return this.row.longitude;
	}
	get id_content (){
		return this.row.id_content;
	}
	get city (){
		return this.row.city;
	}
// DB PICTURES
	get picture (){
		return this.row.picture;
	}
	get content_id (){
		return this.row.content_id;
	}
	get pp (){
		return this.row.pp;
	}
}

module.exports = user;