// Variables d'environnement

let express = require('express');
let app = express();
let bcrypt = require('bcrypt');
let bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
let session = require('cookie-session');
let form = require('./models/form');
let moment = require('moment');
let fileUpload = require('express-fileupload');
var bool = "";
let helmet = require('helmet');
let axios = require('axios');
let fs = require('fs');
let connexion = require('./config/setup');
let mysql = require('mysql');
moment.locale('fr');
let googleMapsClient = require('@google/maps').createClient({
    key: 'AIzaSyB9Gr5C1dfF_1NnemWPlD9ideN3DG6Dn4I'
});

// Moteur de template

app.set('view engine', 'ejs');

// PROFILE/ BUFGGG

// Middleware
app.use(helmet());
app.use(fileUpload());
app.use('/assets', express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({
	secret: 'jifoejwfio',
	resave: false,
	saveUninitialized: true,
	cookie: { secure: false }
}))
app.use(function(req, res, next) {
    if (req.path.substr(-1) == '/' && req.path.length > 1) {
        var query = req.url.slice(req.path.length);
        res.redirect(301, req.path.slice(0, -1) + query);
    } else {
        next();
    }
});
app.use(function checkAuth (req, res, next) {
				// USE DB \\
	if (req.url === '/profile' && (!req.session || !req.session.authenticated) ||
			req.url === '/galerie' && (!req.session || !req.session.authenticated)||
				req.url === '/show/:id' && (!req.session || !req.session.authenticated) ||
					req.url === '/notification' && (!req.session || !req.session.authenticated) ||
					req.url === '/match' && (!req.session || !req.session.authenticated) ||
					req.url === '/message/:id/:pseudo' && (!req.session || !req.session.authenticated) ||
					req.url === '/message/:id/:pseudo/api' && (!req.session || !req.session.authenticated)) {
		res.render('./pages/unauthorised', { status: 403 });
		return;
	}
	next();
});
app.use(function(req, res, next) {
  res.locals.email = req.session.email;
  res.locals.pseudo = req.session.pseudo;
  res.locals.auth = req.session.authenticated;
  next();
});

app.use(require('./middlewares/flash'));

// ROUTES

app.get('/message/:id/:pseudo', function (req, res) {
		let message = require('./models/message');
		message.get_message(req.session.identifiant, req.params.id, req.params.pseudo, function(message){
			if (message === -1)
			{
				res.redirect('/');
			}
			else
			{
				var userpseudo = req.params.pseudo;
				res.render('pages/message', {message: message, userpseudo: userpseudo});
			}
		})
});


app.post('/message/:id/:pseudo', function (req, res) {
	let message = require('./models/message');
	let user = require('./models/user');

	message.check_auth(req.session.identifiant, req.session.pseudo, req.params.id, req.params.pseudo, function(bool){
		if (bool === -1)
		{
			req.flash('error', "Probleme lors de l'envoie du message");
			res.redirect(req._parsedOriginalUrl.path);
		}
		else
		{
			if (req.body.form === "send_message" && req.body.message.trim() !== "" && req.body.message.trim() !== undefined)
			{
				message.add_message(req.session.identifiant, req.session.pseudo, req.params.id, req.params.pseudo, req.body.message);
				user.add_notification_newmessage(req.params.id, req.session.identifiant, req.session.pseudo);
				res.redirect(req._parsedOriginalUrl.path);
			}
		}
	});
});


app.get('/match', function (req, res, next) {
	let user = require('./models/user');
	user.get_mutual_match(req.session.identifiant, function(match){
		var myid = req.session.identifiant;
		res.render('pages/match', {match: match, myid: myid});
	});
});

app.get('/notification', function (req, res) {
	let user = require('./models/user');
	user.get_all_notif(req.session.identifiant, (notif) =>{
		// console.log(notif)
		res.render('pages/notification', {notif: notif});
		user.reset_notif(req.session.identifiant)	
	});
});


app.post('/del_tag', function (req, res, next){
	let hashtag = require('./models/hashtag');
	hashtag.del_tag(req.body.hashtag, req.body.id, req.session.identifiant ,function(){
		//redirect non FONCTIONNELE
		return res.render('pages/index', req.flash('error', "Merci de remplir tout les champs !"));
	});

});
app.get('/', function (req, res) {
	if (req.url === '/' && req.session.authenticated == true) {
		res.redirect('profile');
		return;
	}
	else
		res.render('pages/index');	
});

app.get('/notif/api', function(req, res){
		connexion.query('SELECT COUNT(user_id) as count FROM notification WHERE isread = 0 AND user_id = ?', [req.session.identifiant], (err, result) =>{
			// console.log(result)
			res.setHeader('Content-Type', 'application/json');
			if (result){
				res.send(JSON.stringify({"unread": result[0].count}));
			}
		});
});

app.get('/message/:id/:pseudo/api', function(req, res){
	let messagess = require('./models/message');

	if (req.session.authenticated)
	{
		connexion.query('SELECT * FROM message WHERE (id_author = ? AND user_id = ?) AND isread = 0', [req.params.id, req.session.identifiant], (err, message) => {
			if (err) throw err;
			connexion.query('UPDATE message SET isread = 1 WHERE (id_author = ? AND user_id = ?)', [req.params.id, req.session.identifiant], (err, result) => {
			if (err) throw err;
			res.setHeader('Content-Type', 'application/json');
				if (message){
					res.send(JSON.stringify({"unread": message.length, messages: message}));
				}
			});
		});
	}
	else
	{
		res.redirect('/');
	}
});


// GESTION DU NOUVEAU MOT DE PASSE
app.get('/new_pass', function (req, res) {
		res.locals.token = req.query.key;
		res.locals.email = req.query.email;
		res.render('pages/new_pass');
});

app.post('/show/:id', function (req, res) {
	let user = require('./models/user');
	let mail = require('./models/mail');
	if (req.body.form === "block")
	{
		user.block_user(req.session.identifiant, req.body.myid, req.body.userid, function(){
			req.flash('success', "Utilisateur bloqué !")
			res.redirect('/galerie');
		});
	}
	if (req.body.form === "report")
	{
		// PENSEZ A BLOQUER LE USER ET NE PLUS LAFFICHER
		//VEROUILLER LES SQL DU BUTTON
		mail.send_report(req.body.userid, req.session.identifiant)
		req.flash('success', "Utilisateur signalé, le profil va etre analysé. Merci !")
		res.redirect('/galerie');
	}
	if (req.body.form === "match")
	{
		//VEROUILLER LES SQL DU BUTTON		
		user.add_match(req.body.userid, req.session.identifiant, req.session.pseudo, function(result){
			if (result === "already")
			{
				req.flash('error', "Vous avez deja envoyé un match a cette personne");
				res.redirect(req._parsedOriginalUrl.path);
			}
			else if (result === "add_pic")
			{
				req.flash('error', "Seul les membres avec une photo peuvent liker des utilisateurs");
				res.redirect(req._parsedOriginalUrl.path);
			}
			else
			{
			req.flash('success', "Un match vient d'etre envoyé a cet utilisateur");
			res.redirect(req._parsedOriginalUrl.path);
			}
		});
	}
	if (req.body.form === "unmatch")
	{
		// VEROUILLER LES SQL DU BUTTON		
		user.del_match(req.session.identifiant, req.body.userid, req.session.pseudo, function(bool){
			// console.log(bool)
			if (bool === -1)
			{
				req.flash('error', "Aucun match trouvé avec cet utilisateur");
				res.redirect(req._parsedOriginalUrl.path);
			}
			else if (bool === 1)
			{
				req.flash('success', "Match supprimé");
				res.redirect(req._parsedOriginalUrl.path);
			}
		});
	}
});
app.get('/show/:id', function (req, res) {
	let user = require('./models/user');
	let picture = require('./models/picture');
	let hashtag = require('./models/hashtag');
	let locate = require('./models/locate');
	if (req.session.identifiant && (req.params.id != req.session.identifiant)){
		user.add_notification_view(req.params.id, req.session.identifiant, req.session.pseudo)
		user.add_view(req.session.identifiant, req.params.id);
		user.popplus1(req.session.identifiant, req.params.id);
	}
	user.select_date_last_co(req.params.id, function(lastco){
		user.get_this_match(req.session.identifiant, req.params.id,  function(match){
			user.get_pop(req.params.id, function(pop){
				user.get_this_match(req.params.id, req.session.identifiant, function(match2){
					user.get_mutual_match(req.session.identifiant, function(mutual){
						user.getbyid(req.params.id, function(user){
							picture.profilpic(req.params.id, function(pp){
								picture.allwithoutpp(req.params.id, function(picture){
									hashtag.all(req.params.id, function(hashtag){
										locate.get_dist(req.session.identifiant, function(dist){
											if (user[0] && req.session.identifiant && dist[0])
											{
												user[0].myid = req.session.identifiant;
												//probleme de distance quand pas de loc
												locate.calcCrow(dist[0].latitude, dist[0].longitude, user[0].latitude, user[0].longitude, function(diff){
													res.render('pages/show', {user: user, picture: picture, pp: pp, hashtag: hashtag, diff: diff, mutual: mutual, match: match, match2: match2, lastco: lastco, pop: pop});
												});
											}
											else
											{
												// res.render('pages/index', {user: user, picture: picture, pp: pp, hashtag: hashtag});
												req.flash('error', "Vous ne pouvez pas consulter de profil si nous n'avons pas votre locatisation !")
												res.redirect('/');
											}
										});
									});
								});
							});
						});
					});
				});
			});
		});
	});
});

app.post('/new_pass', function (req, res, next) {
			form.valid(req.body, function(bool){
				if (bool === false)
				{
					req.flash('error', "Merci de remplir tout les champs !")
					res.redirect(req._parsedOriginalUrl.path);
				}
				else
				{
					if (req.body.password !== req.body.confirm_pass)
					{
						req.flash('error', "Les mots de passe ne correspondent pas !")
						res.redirect(req._parsedOriginalUrl.path);
					}
					else
					{
						let user = require('./models/user');
						user.maj_password(req.body, function (){
							req.flash('success', "Mot de passe modifié avec succés !")
							res.redirect('/');
						});
					}
				}
			});
});

//Page de profil

app.get('/profile', function (req, res, next) {
	let user = require('./models/user');
	let hashtag = require('./models/hashtag');
	let picture = require('./models/picture');
	let locate = require('./models/locate');
	// user.check_block(req.session.identifiant, function(user_blocked){
		user.search_account(req, function (user){
			hashtag.all(req.session.identifiant, function(hashtag){
				picture.profilpic(req.session.identifiant, function(pp){
					picture.all(req.session.identifiant, function(picture){
						locate.my_locate(req.session.identifiant, function(city){
							res.render('pages/profile', {user: user, hashtag: hashtag, picture: picture, pp: pp, city: city});
						});
					});
				});
			});
		});
	});
// });


//delogue
app.get('/logout', function (req, res, next) {
		let user = require('./models/user')
		if (req.session && req.session.identifiant)
		{
			user.add_date_last_connexion(req.session.identifiant);
			user.disconnect(req.session.identifiant);
			delete req.session.authenticated;
		}
		res.redirect('/');
	});

app.get('/lost', function (req, res, next){
	res.render('pages/lost');
});

// FORMULAIRE PAGE INDEX
app.post('/', function (req, res, next) {
	let user = require('./models/user');

	// FORMULAIRE DE CONNEXION
	if (req.body.form === 'connect')
	{
		form.valid(req.body, function(bool){
			if (bool === false)
			{
				res.render('pages/index', req.flash('error', "Merci de remplir tout les champs !"));
			}
			else
			{
				user.search_user(req.body, function(results){
					if (results.length == 0)
					{
						res.render('pages/index', req.flash('error', "compte inconnu !"));
					}
					else
					{
						user.compare_pass(results, req.body, function(bool){
							if (bool === true)
							{
								// ACTIVATION DE LA SESSION + REDIRECTION.
								req.session.authenticated = true;
								req.session.email = results[0].email;
								req.session.identifiant = results[0].id;
								req.session.pseudo = results[0].pseudo;
								user.connected(req.session.identifiant);
								res.redirect('/profile');
								bool = "";
							}
							else
							{
								req.flash('error', 'Username and/or password are incorrect');
								res.redirect('/');
								bool = "";
							}
						});
					}
				});
			}
		});
	}

	// FORMULAIRE DE SOUSCRIPTION
	if (req.body.form === 'subscribe')
	{
		form.valid(req.body, function(bool){
			if (bool === false)
			{
				req.flash('error', "Merci de remplir tout les champs !");
				res.redirect('/');
			}
			else
			{
				if (req.body.password === req.body.confirm_pass)
				{
					user.check_register(req.body, function (results){
						if (results.length == 0)
						{
							user.pass_secure(req.body.password, function(secure){
								if (secure === false)
								{
									req.flash('error', "Mot de passe non sécurisé")
									res.redirect('/');
								}
								else
								{
									user.create(req.body, function (){
										req.flash('success', "Votre compte a ete crée")
										res.redirect('/');
									});
								}
							});
						}
						else
						{
							req.flash('error', "Pseudo ou email deja utilisé")
							res.redirect('/');
						}
					});
				}
			}
		});
	}
});

app.post('/locate', (req, res) => {
	let location = require('./models/locate');
	location.save_locate(req.body.longitude, req.session.identifiant)
	// req.flash('success', "Profil mis a jour avec succés !");	
	res.redirect('/profile');
});

//GALERY
app.get('/galerie', function (req, res, next) {
	let user = require('./models/user');
	let hashtag = require('./models/hashtag');
	let locate = require('./models/locate');
	// console.log(req.query)
	if (!req.query.age_min && !req.query.age_max && !req.query.pop_min && !req.query.pop_max)
	{
		user.all_profile(function(user_profile) {
			user.check_block(req.session.identifiant, function(blocked){
				// console.log(user_profile);
				// console.log(blocked);
				var myid = req.session.identifiant;
				user.get_my_match_g(myid, function(match_g){
				var match_g = match_g[0].match_g;
				var filter_user = null;
				res.render('pages/galerie', { user_profile: user_profile, blocked: blocked, myid: myid, filter_user: filter_user, match_g: match_g});
				})
			});
		});
	}
	else
	{
		if (req.session.identifiant)
		{
			console.log(req.query)
			if (req.query.city === "" || req.query.city === undefined)
			{
				user.advanced_search(req.session.match_g, req.query.age_min, req.query.age_max, req.query.pop_min, req.query.pop_max, function(filter_user){
					user.get_my_match_g(req.session.identifiant, function(match_g){
						console.log("KOFPEKFOPWEKGOEWPJGOPEWJ")
						var match_g = match_g[0].match_g;
						var user_profile = null;
						// console.log("FILTER ===>")
						// console.log(filter_user)
						var myid = req.session.identifiant;
						res.render('pages/galerie', { filter_user: filter_user, user_profile: user_profile, myid: myid, match_g: match_g});
					});
				});
			}
			else if (req.query.city !== "" || req.query.city !== undefined)
			{
				locate.check_city(req.query.city, function(city){
					if (city === undefined || !city)
					{
						req.flash('error', "Aucune ville trouvée");
						res.redirect('/galerie');
					}
					else
					{
						var lat = city.geometry.location.lat;
						var lng = city.geometry.location.lng;
						user.advanced_search_and_city(req.session.match_g, req.query.age_min, req.query.age_max, req.query.pop_min, req.query.pop_max, lat, lng, function(filter_user){
							user.get_my_match_g(req.session.identifiant, function(match_g){
								var match_g = match_g[0].match_g;
								var myid = req.session.identifiant;
								var user_profile = null;
								res.render('pages/galerie', { filter_user: filter_user, user_profile: user_profile, myid: myid, match_g: match_g});
							});
						});
					}
				});
			}
		}
		else
		{
			res.redirect('/')
		}
	}
});

// FORMULAIRE DE MODIF COMPTE
app.post('/profile', function (req, res, next) {
	// console.log(req.body);
	let user = require('./models/user');
	let picture = require('./models/picture')
	if (req.body.form === 'modif')
	{	
		form.valid(req.body, function(bool){
			console.log(req.body.age);
			if (req.body.age.length > 2 || !Number.isInteger(parseInt(req.body.age)))
			{
				req.flash('error', "Ton age n'est pas valide");
				res.redirect('/profile');
				console.log("Formulaire mal rempli");
				return;
			}
			if (bool === false)
			{
				req.flash('error', "Merci de remplir tout les champs !");
				res.redirect('/profile');
				console.log("Formulaire mal rempli");
			}
			else
			{
				user.maj_account(req.body, req.session, function(ret){
					// console.log(ret);
				});
				req.flash('success', "Profil mis a jour avec succés !");
				res.redirect('/profile');
			}
		});
	}
	else if (req.body.form === 'hashtag')
	{
		if (req.body.hashtag.trim() === "" || req.body.hashtag === undefined)
		{
			req.flash('error', "Inserer un hashtag valide");
			res.redirect('/profile');
		}
		else
		{
			let hashtag = require('./models/hashtag');
			hashtag.add(req.body.hashtag, req.session.identifiant, function(cb){
				console.log(cb);
			});
			res.redirect('/profile');
		}
	}
	else if (req.body.form === 'upload_photo')
	{
		if (req.files.photo == undefined)
		{
			req.flash('error', "Inserer une photo valide");
			res.redirect('/profile');
		}
		else
		{
		picture.add(req.files.photo, req.session.identifiant, function(bool){
			if (bool == "overload")
			{
				req.flash('error', "5 photos maximum autorisé");
				res.redirect('/profile');
				return;
			}
			else if (bool === true)
			{
				req.flash('success', "Upload photo OK");
				res.redirect('/profile');
				return;
					
			}
			else
			{
				req.flash('error', "Inserer une photo valide");
				res.redirect('/profile');
				return;
			}
		});
		}
	}
	else if (req.body.form === 'del_picture')
	{
		// console.log(req.body.picture);
		picture.del(req.body.picture, req.session.identifiant, function(bool){
			if (bool === false)
			{
				req.flash('error', "Impossible de supprimer la photo selectionne");
				res.redirect('/profile');
			}
			else
			{
				res.redirect('/profile');
			}
		});
	}
	else if (req.body.form === 'profil_picture')
	{
		console.log(req.body)
		picture.pp(req.body.picture, req.session.identifiant);
		req.flash('success', "Photo de profil mis a jour");
		res.redirect('/profile');
	}
});

// FORMULAIRE DE MODIF MOT DE PASSE
app.post('/lost', function (req, res, next) {
	let user = require('./models/user');
	let mail = require('./models/mail');
	form.valid(req.body, function(bool){
		console.log(bool);
		if (bool === false)
		{
			req.flash('error', "Merci de renseignez votre email !");
			res.redirect('/lost');
			console.log("Formulaire mal rempli");
		}
		else
		{
			user.recup_tok(req.body.email, function(token){
				if (token.length === 0)
				{
					req.flash('error', "Email non reconnu !");
					res.redirect('/lost');
				}
				else
				{
				// console.log(token);
				mail.send_lost(req.body.email, token, function(ret){
				});
				req.flash('success', "Un mail vient de vous etre envoyé !");
				res.redirect('/lost');
				}
			})

		}
	});
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Matcha :: Page non trouvée');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      msg: err.message,
    error: {}
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('pages/unauthorised', {
    msg: err.status,
    error: {}
  });
});
// ECOUTE PORT 8080
app.listen(4242, function () {
	console.log('SERVEUR OK BITCH! JE RUN EN', app.get('env'));
});