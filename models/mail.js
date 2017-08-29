var mailer = require("nodemailer");

var smtpTransport = mailer.createTransport("smtps://matcha42paris%40gmail.com:"+encodeURIComponent('matcha42') + "@smtp.gmail.com:465"); 

class send {
			static send_lost(dest, token, cb)
			{
				// console.log(token[0].token)
				var encode_tok = encodeURI(token[0].token);
				var encode_email = encodeURI(dest);
				var uri = "http://localhost:8080/new_pass?key=" + encode_tok + "&email="+ encode_email;
				// console.log(uri)
				var mail = {
				from: "matcha42paris@gmail.com",
				to: dest,
				subject: "Réinitialisation du mot de passe",
				html: "Bienvenue sur Matcha, Pour reinitialiser votre mot de passe, veuillez cliquer sur le lien ci dessous ou copier/coller dans votre navigateur internet." + uri + "  --------------- Ceci est un mail automatique, Merci de ne pas y répondre."
				}
				smtpTransport.sendMail(mail, function (error, response){
				if(error){
					//RENVOYER LES ERREURS EN CAS D'ECHEC
					//RENVOYER LES ERREURS EN CAS D'ECHEC
					//RENVOYER LES ERREURS EN CAS D'ECHEC
					console.log("Erreur lors de l'envoie du mail!");
					cb(error);
				}else{
					console.log("Mail envoyé avec succès!")
					cb(Response)
				}
				smtpTransport.close();
			});
		};
}

module.exports = send;