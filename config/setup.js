let mysql		=	require('mysql');
let connexion	=	mysql.createConnection({

	host:		'localhost',
	user:		'root',
	password:	'',
	// database:	'Matcha',
	database:	'matcha',
	// port:		3307

});
 
connexion.connect();

module.exports = connexion;

// connection.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
//   if (error) throw error;
//   console.log('The solution is: ', results[0].solution);
// });
 
// connection.end();