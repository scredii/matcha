let connexion = require('../config/setup');
let moment = require('moment');

class message {

	static get_message(myid, user_id, user_pseudo, cb)
	{
		connexion.query('SELECT * FROM mutual_match WHERE user1 = ? AND user2 = ? OR user1 = ? AND user2 = ?', [myid, user_id, user_id, myid], (err, result) => {
			if (result.length === 0)
			{
				cb(-1);
			}
			else
			{
				connexion.query('SELECT pseudo, id FROM users WHERE id = ? AND pseudo = ?', [user_id, user_pseudo], (err, user_ret) => {
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
						connexion.query('SELECT * FROM message WHERE id_author = ? AND user_id = ? OR id_author = ? AND user_id = ?', [myid, user_id, user_id, myid], (err, rows) => {
							if (err) throw err;
							cb(rows.map((row) => new message (row)));
						});
					}
				});
			}
		});
	}

	constructor (row){
		this.row = row;
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