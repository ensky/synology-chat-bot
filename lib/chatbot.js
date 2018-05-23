const EventEmitter = require('events');
const bodyParser = require('body-parser');
const rq = require('request-promise');
const Message = require('./message');
const URLBuilder = require('./urlbuilder');

class ChatBot extends EventEmitter {
	constructor(token, serverURL, expressApp) {
		super();

		this.token_ = token;
		this.serverURL_ = serverURL;
		this.app_ = expressApp;
		this.urlbuilder_ = new URLBuilder(serverURL, token);
		this.usernameMap_ = null;
	}

	route (path) {
		this.app_.route(path)
			.all(bodyParser.json()) // for parsing application/json
			.all(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
			.all((req, resp, next) => {
				let payload = req.body;
				if (!payload.user_id) {
					console.log('no payload gg');
					next();
					return;
				}

				this.emit('request', this._requestBuilder(payload), this._responseBuilder(resp), next);
				console.log('emitted request: ', this._requestBuilder(payload));
			});
	}

	_requestBuilder (payload) {
		return payload;
	}

	_responseBuilder (resp) {
		return {
			send: (message) => {
				resp.json({
					text: message.text
				});
			},

			end: () => {
				resp.end();
			}
		};
	}

	send (userIDs, message) {
		const payload = {
			user_ids: userIDs,
			text: message.text
		};

		return rq({
			method: 'POST',
			uri: this.urlbuilder_.bot_incoming(),
			form: {
				payload: JSON.stringify(payload)
			}
		});
	}

	sendIncoming (message) {
		const payload = {
			text: message.text
		};

		return rq({
			method: 'POST',
			uri: this.urlbuilder_.incoming(),
			form: {
				payload: JSON.stringify(payload)
			}
		});
	}

	sendByUserName (userNames, message) {
		if (!Array.isArray(userNames)) {
			userNames = [userNames];
		}

		return this.refreshUserCache().then(() => {
			var userIDs = userNames.map((username) => {
				return this.usernameMap_[username] || null;
			}).filter((userID) => {
				return !!userID;
			});
			return this.send(userIDs, message)
		})
	}

	refreshUserCache (force) {
		if (!force && this.usernameMap_) {
			return Promise.resolve();
		}

		this.usernameMap_ = {};

		return rq({
			method: 'GET',
			uri: this.urlbuilder_.userList(),
			json: true
		}).then((resp) => {
			resp.data.users.reduce((map, user) => {
				map[user.username] = user.user_id;
				return map;
			}, this.usernameMap_);
		});
	}
};

ChatBot.Message = Message;

module.exports = ChatBot;
