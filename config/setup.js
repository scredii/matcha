let mysql		=	require('mysql');
let connexion	=	mysql.createConnection({

	host:		'127.0.0.1',
	port:		3307,
	user:		'root',
	// password:	'root',
	database:	'matcha'

});
 
connexion.connect();

module.exports = connexion;

// connexion.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
//   if (error) throw error;
//   console.log('The solution is: ', results[0].solution);
// });
 
// connection.end();