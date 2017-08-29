class form{

	static valid(content, bool)
	{
		// console.log(content);
		if (content.form === 'subscribe')
		{
			if (content.form === 'subscribe' && (content.email === "" || content.email === undefined) || 
				content.form === 'subscribe' && (content.password === "" || content.password === undefined) ||
				content.form === 'subscribe' && (content.name === "" || content.name === undefined) ||
				content.form === 'subscribe' && (content.firstname === "" || content.firstname === undefined) ||
				content.form === 'subscribe' && (content.pseudo === "" || content.pseudo === undefined) ||
				content.form === 'subscribe' && (content.gender === "" || content.gender === undefined) ||
				content.form === 'subscribe' && (content.confirm_pass === "" || content.confirm_pass === undefined))
				{
					bool(false);
				}
				else
					bool(true);
		}

		if (content.form === 'connect')
		{
			if (content.email === "" || content.email === undefined  || content.password === "" || content.password === undefined)
				{
					bool(false);
				}
				else
					bool(true);
		}

		if (content.form === 'modif')
		{
			// attention au textarea avec juste des space qui valide quand meme
			if (content.email === "" || content.email === undefined  || content.lastname === "" || content.lastname === undefined ||
				content.firstname === "" || content.firstname === undefined || content.pseudo === "" || content.pseudo === undefined
				|| content.gender === "" || content.gender === undefined || content.match_g === "" || content.match_g === undefined
				|| content.bio.trim() === "" || content.bio === undefined)
				{
					bool(false);
				}
				else
					bool(true);
		}

		if (content.form === 'lost')
		{
			if (content.email === "" || content.email === undefined)
				{
					bool(false);
				}
				else
					bool(true);
		}

		if (content.form === 'new_pass')
		{
			if (content.password === "" || content.password === undefined || content.confirm_pass === "" || content.confirm_pass === undefined)
				{
					bool(false);
				}
				else
					bool(true);
		}
	}

}

module.exports = form;
