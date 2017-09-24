let connexion = require('../config/setup');
let moment = require('moment');

class message {

	static get_message(myid, user_id, user_pseudo, cb)
	{
		connexion.query('SELECT * FROM mutual_match WHERE (user1 = ? AND user2 = ?) OR (user1 = ? AND user2 = ?)', [myid, user_id, user_id, myid], (err, result) => {
					console.log(result)
		
			if (result == undefined)
			{
				cb(-1);
			}
			// if (result.length == 0)
			// {
			// 	cb(-1);
			// }
			else
			{
				connexion.query('SELECT pseudo, id FROM users WHERE id = ? AND pseudo = ?', [user_id, user_pseudo], (err, user_ret) => {
					if (err) throw err;
					console.log(user_ret)
					if (user_ret.length === 0)
					{
						cb(-1);
					}
					if(user_ret[0].pseudo != user_pseudo || user_ret[0].id != user_id)
					{
						cb(-1);
					}
					else
					{
						connexion.query('SELECT * FROM message WHERE id_author = ? AND user_id = ? OR id_author = ? AND user_id = ?', [myid, user_id, user_id, myid], (err, rows) => {
							if (err) throw err;
							cb(rows.map((row) => new message (row)));
						});
					}
				});
			}
		});
	}

	static check_auth(myid, mypseudo, user_id, user_pseudo, cb)
	{
				connexion.query('SELECT * FROM mutual_match WHERE user1 = ? AND user2 = ? OR user1 = ? AND user2 = ?', [myid, user_id, user_id, myid], (err, result) => {
			if (result.length === 0)
			{
				cb(-1);
			}
			else
			{
				connexion.query('SELECT pseudo, id FROM users WHERE id = ? AND pseudo = ?', [user_id, user_pseudo], (err, user_ret) => {
					console.log(user_ret)
					if (err) throw err;
					if (user_ret.length === 0)
					{
						cb(-1);
					}
					if(user_ret[0].pseudo != user_pseudo || user_ret[0].id != user_id)
					{
						cb(-1);
					}
					else
					{
						cb(1);
					}
				});
			}
		});
	}

	static add_message(myid, mypseudo, user_id, user_pseudo, message)
	{
		connexion.query('INSERT INTO message SET id_author = ?, author_pseudo = ?, message = ?, user_id = ?, user_pseudo = ?', [myid, mypseudo, message, user_id, user_pseudo], (err) => {
			if (err) throw err;
		})
	}

	constructor (row){
		this.row = row;
	}

	get author_pseudo (){
		return this.row.author_pseudo;
	}

	get date_message (){
		return moment(this.row.date_message);
	}	

	get message (){
		return this.row.message;
	}

	get id_author(){
		return this.row.id_author;
	}
}

module.exports = message;