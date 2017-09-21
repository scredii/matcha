// let connexion = require('./setup');
let mysql = require('mysql');

let connexion1 = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  // port: 3307
});

let connexion2 = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "matcha",
  password: "",
  // port: 3307
});
//CREATE TABLE message(id_author INT(16) NOT NULL, message TEXT, user_id INT(16) NOT NULL, date_message TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
//CREATE TABLE notif(id INT(16) PRIMARY KEY NOT NULL AUTO_INCREMENT, user_id INT(16) NOT NULL, isread INT(16) NOT NULL); TABLE NOTIF
// CREATE TABLE mutual_match(id INT(16) PRIMARY KEY NOT NULL AUTO_INCREMENT, user1 INT(16) NOT NULL, user2 INT(16) NOT NULL)
// CREATE TABLE notification(id INT(16) PRIMARY KEY NOT NULL AUTO_INCREMENT, user_id INT(16) NOT NULL, content VARCHAR(255) NOT NULL, by_pseudo VARCHAR(255) NOT NULL, by_id INT(16) NOT NULL, isread INT(16) NOT NULL)
connexion1.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
  connexion1.query("CREATE DATABASE IF NOT EXISTS matcha", function (err, result) {
    if (err) throw err;
    console.log("Database created");
		if (result)
		{
			connexion2.connect(function(err) {
				if (err) throw err;
				console.log("Connected to DB matcha !");
				connexion2.query('CREATE TABLE IF NOT EXISTS users (id INT(16) PRIMARY KEY NOT NULL AUTO_INCREMENT, pseudo VARCHAR(255) NOT NULL, name VARCHAR(255) NOT NULL, lastname VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL, password VARCHAR(255) NOT NULL, gender VARCHAR(255) NULL, match_g VARCHAR(255) NULL, bio VARCHAR(255) NULL, token VARCHAR(255) NOT NULL, age INT(2) NULL, isconnected int(255) DEFAULT 0)', (err, result) => {
					if (err) throw err;
					console.log("Table user created");
				if (result)
				{
					connexion2.query('CREATE TABLE IF NOT EXISTS pictures (id INT(16) UNSIGNED AUTO_INCREMENT PRIMARY KEY, picture VARCHAR(255) NOT NULL, content_id int(30) NOT NULL, pp INT(6) NULL)', (err, result) => {
							if (err) throw err;
							console.log("Table pictures created");
						if (result)
						{
							connexion2.query('CREATE TABLE IF NOT EXISTS locations ( id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY, latitude FLOAT(20) NOT NULL, longitude FLOAT(20) NOT NULL, city VARCHAR(255) NOT NULL, id_content int(30) NOT NULL)', (err, result) => {
									if (err) throw err;
									console.log("Table locations created");
								if (result)
								{
									connexion2.query('CREATE TABLE IF NOT EXISTS hashtag ( id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY, hashtag VARCHAR(255) NOT NULL, content_id int(30) NOT NULL)', (err, result) => {
											if (err) throw err;
											console.log("Table hashtag created");
										if (result)
										{
											connexion2.query('CREATE TABLE IF NOT EXISTS block ( id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY, user_blocked int(30) NOT NULL, by_id int(30) NOT NULL)', (err, result) => {
													if (err) throw err;
													console.log("Table block created");
												if (result)
												{
													connexion2.query('CREATE TABLE IF NOT EXISTS likes (id INT(16) PRIMARY KEY NOT NULL AUTO_INCREMENT, user_like INT(16) NOT NULL, by_id INT(16) NOT NULL, date_match TIMESTAMP DEFAULT CURRENT_TIMESTAMP)', (err, result) =>{
														console.log("Table likes created");
														if (result)
														{
															connexion2.query('CREATE TABLE IF NOT EXISTS historical (id INT(16) PRIMARY KEY NOT NULL AUTO_INCREMENT, viewer_id INT(16) NOT NULL, pageview_id INT(16) NOT NULL, date_view TIMESTAMP DEFAULT CURRENT_TIMESTAMP)', (err, result) =>{
															console.log("Table historical created");
															if (result)
															{
																
																connexion2.query('CREATE TABLE IF NOT EXISTS lastconnexion(id int(16) PRIMARY KEY NOT NULL AUTO_INCREMENT, user_id INT(16) NOT NULL, last_connexion timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP)', (err, result) =>{
																	console.log("Table lastconnexion created");
																	if (result)
																	{
																		connexion2.query('CREATE TABLE IF NOT EXISTS pop(id INT(16) PRIMARY KEY NOT NULL AUTO_INCREMENT, user_like INT(16) NOT NULL, by_id INT(16), date_pop TIMESTAMP DEFAULT CURRENT_TIMESTAMP)', (err, result) =>{
																			console.log("Table pop created");
																			if (result)
																			{
																				connexion2.query('CREATE TABLE notification(id INT(16) PRIMARY KEY NOT NULL AUTO_INCREMENT, user_id INT(16) NOT NULL, content VARCHAR(255) NOT NULL, by_pseudo VARCHAR(255) NOT NULL, by_id INT(16) NOT NULL, isread INT(16) NOT NULL, date_action TIMESTAMP DEFAULT CURRENT_TIMESTAMP)', (err, result) =>{
																					console.log("Table notif created");
																					connexion2.end();
																				});
																				
																			}
																		});
																	}
																});
															}
															});
														}
													});
												}
											});
										}
									});
								}
							});
						}
					});
				}
				});
			});
		}
  });
});
