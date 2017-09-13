// Variables d'environnement

let express = require('express');
let app = express();
let bcrypt = require('bcrypt');
let bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
let session = require('express-session');
let form = require('./models/form');
let moment = require('moment');
let fileUpload = require('express-fileupload');
var bool = "";
let helmet = require('helmet');
let axios = require('axios');
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
	console.log('checkAuth url: ' + req.url);
	console.log('authenticated: ',req.session.authenticated);
				// USE DB \\
	if (req.url === '/profile' && (!req.session || !req.session.authenticated) || req.url === '/galerie' && (!req.session || !req.session.authenticated)) {
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

// Routes

//Index
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

// GESTION DU NOUVEAU MOT DE PASSE
app.get('/new_pass', function (req, res) {
		// console.log(req.query);
		res.locals.token = req.query.key;
		res.locals.email = req.query.email;
		res.render('pages/new_pass');	
});

app.get('/show/:id', function (req, res) {
	let user = require('./models/user');
	let picture = require('./models/picture');
	let hashtag = require('./models/hashtag');
	let locate = require('./models/locate');
	user.popplus1(req.params.id);
	user.getbyid(req.params.id, function(user){
		picture.profilpic(req.params.id, function(pp){
			picture.allwithoutpp(req.params.id, function(picture){
				hashtag.all(req.params.id, function(hashtag){
					locate.get_dist(req.session.identifiant, function(dist){
						if (user[0] && req.session.identifiant)
						{
							// console.log(user[0].latitude)
							locate.calcCrow(dist[0].latitude, dist[0].longitude, user[0].latitude, user[0].longitude, function(diff){
								// console.log(pp);
								res.render('pages/show', {user: user, picture: picture, pp: pp, hashtag: hashtag, diff: diff});
							});
						}
						else
						{
								// res.render('pages/index', {user: user, picture: picture, pp: pp, hashtag: hashtag});
							res.redirect('/');
						}
					});
				});
			});
		});
	});

		// res.render('pages/new_pass');	
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


//delogue
app.get('/logout', function (req, res, next) {
		delete req.session.authenticated;
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
				console.log("Formulaire mal rempli");
			}
			else
			{
				user.search_user(req.body, function(results){
					// console.log(results);
					if (results.length == 0)
					{
						res.render('pages/index', req.flash('error', "compte inconnu !"));
						console.log("Compte inconnu");
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
								// console.log(req.session);
								res.redirect('/profile');
								bool = "";
							}
							else
							{
								req.flash('error', 'Username and password are incorrect');
								res.redirect('/');
								console.log("Mot de passe incorrect");
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
	user.all_profile(function(user_profile) {
		// console.log("user_profile")
		// console.log(user_profile)
		// user.all_hashtag(function(hashtag){
			// console.log(user_profile);
			user_profile.myid = req.session.identifiant;
			// console.log(user_profile.myid)
			res.render('pages/galerie', { user_profile: user_profile });
		})
	// });
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
		console.log(req.body.picture);
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

// ECOUTE PORT 8080
app.listen(8080, function () {
	console.log('SERVEUR OK BITCH!');
});