const app = require('express')();
const ChatBot = require('./index');
// In your app, you should use:
// const ChatBot = require('synology-chat-bot');
const token = 'YOUR_TOKEN_HERE';
const url = 'http://example.com:5000';
const port = 6666;
const chatbotApp = new ChatBot(token, url, app);

// setup the root for chatbot outgoing
chatbotApp.route('/');

/**
 * outgoing request contains
 *
 * token
 * user_id
 * username
 * post_id
 * timestamp
 * text
 */
chatbotApp.on('request', (outgoingRequest, response, next) => {
	console.log('ggggg request: ', outgoingRequest.text);
	if (outgoingRequest.text === 'hi') {
		response.send(new ChatBot.Message('hi there'));
	} else {
		response.end();
	}
});

// listen on port
app.listen(port);

// do something interesting...
// send message via user id
const userId = 5;
chatbotApp.send([userId], new ChatBot.Message('hi 5'))
	.then(() => {})
	.catch(() => {});

// send message via username
const username = 'admin';
chatbotApp.sendByUserName([username], new ChatBot.Message('hi admin'))
	.then(() => {})
	.catch((err) => {
		console.log(err);
	});
