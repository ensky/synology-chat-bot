class URLBuilder {
	constructor (baseURL, token) {
		this.baseURL_ = baseURL;
		this.token_ = token;
	}

	base () {
		return this.baseURL_ + '/webapi/entry.cgi?api=SYNO.Chat.External&token=%22' + this.token_ + '%22';
	}

	incoming () {
		return this.base() + '&method=incoming&version=2';
	}

	bot_incoming () {
		return this.base() + '&method=chatbot&version=2';
	}

	userList () {
		return this.base() + '&method=user_list&version=2';
	}
};

module.exports = URLBuilder;