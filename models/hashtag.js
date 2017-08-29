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
				connexion.query('SELECT hashtag FROM hashtag WHERE content_id = ?', [identifiant], (err, hashtag) =>{
					if (err) throw err;
					cb(hashtag);
				});
			};
}

module.exports = hashtag;