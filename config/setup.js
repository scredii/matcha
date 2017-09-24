let mysql		=	require('mysql');
let connexion	=	mysql.createConnection({

	host:		'localhost',
	user:		'root',
	password:	'',
	database:	'matcha'
	// port:		3307

});
 
connexion.connect();

module.exports = connexion;
 
// connection.end();