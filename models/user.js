let connexion = require('../config/setup');
let moment = require('moment');
let bcrypt = require('bcrypt');
let md5 = require('md5');
const saltRounds = 10;

moment.locale('fr');

class user {

	// constructor (row){
	// 	this.row = row;
	// }

	// get content (){
	// 	return this.row.content;
	// }
	// get created_at (){
	// 	return moment(this.row.created_at);
	// }
		// get date_naissance (){
		// 	return moment(this.date_naissance);
		// }
	// get id (){
	// 	return this.row.id;
	// }
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
		// console.log(content.lastname);
		connexion.query('UPDATE users SET pseudo = ?, name = ?, lastname = ?, email = ?, gender = ?, match_g = ?, bio = ?, date_naissance = ? WHERE email = ?', [content.pseudo, content.firstname, content.lastname, content.email, content.gender, content.match_g, content.bio, content.date_naissance, session.email], (err, ret) =>{
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

	static create(content, cb)
	{
		var token = md5(content.password);
		console.log(token)
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

	static compare_pass(pass, content, bool)
	{
		bcrypt.compare(content.password, pass[0].password, function(err, res) {
			if (err) throw err;
			bool(res);
		});
	}
	// static all (cb){
	// 	connexion.query('SELECT * FROM messages', (err, rows) =>{
	// 		if (err) throw err;
	// 		cb(rows.map((row) => new Message (row)));
	// 	});
	// }
}

module.exports = user;