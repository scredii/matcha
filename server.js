// Variables d'environnement

let express = require('express');
let app = express();
let bcrypt = require('bcrypt');
let bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
let session = require('express-session');
let form = require('./models/form');
var bool = "";

// Moteur de template

app.set('view engine', 'ejs');

// Middleware

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
app.use(function checkAuth (req, res, next) {
	console.log('checkAuth url: ' + req.url);
	console.log('authenticated: ',req.session.authenticated);
				// USE DB \\
	if (req.url === '/profile' && (!req.session || !req.session.authenticated)) {
		res.render('./pages/unauthorised', { status: 403 });
		return;
	}
	next();
})
app.use(function(req, res, next) {
  res.locals.email = req.session.email;
  res.locals.pseudo = req.session.pseudo;
  res.locals.auth = req.session.authenticated;
  next();
});

app.use(require('./middlewares/flash'));

// Routes

app.get('/', function (req, res) {
		res.render('pages/index');	
});

app.get('/profile', function (req, res, next) {
	let user = require('./models/user');
	user.search_account(req, function (user){
		res.render('pages/profile', {user: user});
	});
});

app.get('/logout', function (req, res, next) {
		delete req.session.authenticated;
		res.redirect('/');
	});

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
							user.create(req.body, function (){
								req.flash('success', "Votre compte a ete crée")
								res.redirect('/');
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

// FORMULAIRE DE MODIF COMPTE
app.post('/profile', function (req, res, next) {
	let user = require('./models/user');
	form.valid(req.body, function(bool){
		console.log(bool);
		if (bool === false)
		{
			req.flash('error', "Merci de remplir tout les champs !");
			res.redirect('/profile');
			console.log("Formulaire mal rempli");
		}
		else
		{
			user.maj_account(req.body, req.session, function(ret){
				console.log(ret);
			});
			req.flash('success', "Profil mis a jour avec succés !");
			res.redirect('/profile');
		}
	});
});

// ECOUTE PORT 8080
app.listen(8080, function () {
	console.log('SERVEUR OK BITCH!');
});