let connexion = require('../config/setup');


class hashtag {

			static add(hashtag, identifiant, cb)
			{
				if (hashtag[0] !== '#')
				{
					hashtag = '#' + hashtag;
				}
				connexion.query('INSERT INTO hashtag SET hashtag = ?, content_id = ?', [hashtag, identifiant], (err, result) => {
					if (err) throw err;
					cb(result);
				});
			};

			static all(identifiant, cb)
			{
				connexion.query('SELECT hashtag, id FROM hashtag WHERE content_id = ?', [identifiant], (err, hashtag) =>{
					if (err) throw err;
					cb(hashtag);
				});
			};

			static del_tag(hashtag, id, identifiant)
			{
				connexion.query('DELETE FROM hashtag WHERE id = ? AND hashtag = ? AND content_id = ?', [id, hashtag, identifiant], (err, result) => {
					if (err) throw err;
				});
			}

			// static all_tag(cb)
			// {
			// 	connexion.query('SELECT hashtag, content_id FROM hashtag GROUP BY hashtag.content_id', (err, result) => {
			// 		if (err) throw err;
			// 		if (result) cb(result);
			// 	});
			// }
}

module.exports = hashtag;