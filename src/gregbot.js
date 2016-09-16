const SlackBot = require('slackbots');
const request = require('request');
const wondergirl = require('wondergirl');

var gregBot = new SlackBot({
    token: require( '../auth/slack-token.js' ), // Add a bot https://my.slack.com/services/new/bot and put the token  
    name: 'gregbot'
});

const queueUrls = require( '../auth/rabbit-urls.js' );

var sentWarnings = {};
var sentQuotes = {};
const checkInterval = 1000 * 10;
const warningThreshold = 5000;
const channel = 'gregbottest';

const params = 
{
	icon_emoji: ':tropical_fish:'
};

gregBot.on('start', function() 
{	
	pingUrls( queueUrls );
	
	var people = {
		"0": {
	    	"name": "Alex",
	    	"handle": "alex"
	    }
	    /*,
	    "1" : {
	    	"name": "James",
	    	"handle": "jamesfrost"
	    },
	    "2": {
	    	"name": "Jim",
	    	"handle": "jim"
	    }
	    */
	};
	
	for (var key in people) {
		var thismessage = "Oi " + people[key]['name'] + ", check out my cat lad! https://media.giphy.com/media/SRO0ZwmImic0/giphy.gif :us: :tropical_fish:";
		//gregBot.postMessageToUser( people[key]['handle'], thismessage, params);
	}
	
	setInterval( function()
	{
		pingUrls( queueUrls );
	}, checkInterval );
});


gregBot.on('message', function(data)
{
	//EVENTS: MESSAGE TO GREGBOT
	if(data['type'] === 'message' && data['subtype'] !== 'bot_message')
	{
		//If contains the substring 'quote' or 'inspire'
		if(data['text'].includes('quote') || data['text'].includes('inspire'))
		{
			postedBy = getChannelOrUserNameFromID(data['channel'], data['user']);
			setTimeout(function(){ postQuote(postedBy); }, 2000);
		}
		
		//Tell gregbot he isn't a lad - if you dare!
		if(data['text'].includes('you are not a lad'))
		{
			postedBy = getChannelOrUserNameFromID(data['channel'], data['user']);
			message = 'Do not question me human, I am king of the lads. :crown: :us:';
			
			setTimeout(function(){ postMessage(postedBy, message); }, 2000);
		}
	}
	
	//EVENTS: SOMEONE TYPING TO GREGBOT
	if(data['type'] === 'user_typing')
	{
		//If a user is typing to gregbot, there's a 100/1 chance of some encouragement...
		postedBy = getChannelOrUserNameFromID(data['channel'], data['user']);
		message = "I see you typing lad, what do you need?! :tropical_fish:";
		
		number = Math.round(Math.random() * 100);

		if(number === 33)
			setTimeout(function(){ postMessage(postedBy, message); }, 1000);
	}
});

const generateQueueWarningMessage = function( queueResponse )
{
	return 'oi lads, ' + queueResponse.name + ' - ' + queueResponse.node + ' has ' + queueResponse.messages + ' messages :tropical_fish:'
};

const generateQueueOkMessage = function( queueResponse )
{
	return 'wew lads, ' + queueResponse.name + ' - ' + queueResponse.node + ' only has ' + queueResponse.messages + ' messages now :tropical_fish:'
};

const checkQueues = function( queueResponse )
{
	if( queueResponse.length === 0 )
		return;

	const thisQueueResponse = queueResponse.shift();
	const queueResponseHash = getQueueResponseHash( thisQueueResponse );

	if( thisQueueResponse.messages > warningThreshold )
	{
		if( typeof sentWarnings[ queueResponseHash ] === "undefined" || !sentWarnings[ queueResponseHash ] )
		{
			gregBot.postMessageToChannel(channel, generateQueueWarningMessage( thisQueueResponse ), params);
			sentWarnings[ queueResponseHash ] = true;
		}
	}
	else
	{
		if( typeof sentWarnings[ queueResponseHash ] !== "undefined" && sentWarnings[ queueResponseHash ] )
		{
			gregBot.postMessageToChannel(channel, generateQueueOkMessage( thisQueueResponse ), params);
		}

		sentWarnings[ queueResponseHash ] = false;
	}

	checkQueues( queueResponse );
};

const getQueueResponseHash = function( queueResponse )
{
	return queueResponse.name + ' - ' + queueResponse.node;
};

const pingUrls = function( queueUrls )
{
	if( queueUrls.length === 0 )
		return;

	const thisQueue = queueUrls.shift();

	request(thisQueue , function (error, response, body) 
	{
		if ( error || response.statusCode !== 200 ) 
			return;

		checkQueues( JSON.parse( body ) );
	});

	pingUrls( queueUrls );
};

/**
 * Post an inspirational quote
 * @param {object} replyTo
 */
const postQuote = function(replyTo)
{
	var quote = wondergirl.getQuote();
	
	var type = replyTo['type'];
	var name = replyTo['name'];

	if(type === 'channel')
	{
		gregBot.postMessageToChannel( name, "Bear with me lad, finding the perfect quote... :tropical_fish:", params);
		setTimeout(function(){ gregBot.postMessageToChannel( name, quote, params ); }, 3500);
	}
	else if(type === 'user')
	{
		gregBot.postMessageToUser( name, "Bear with me lad, finding the perfect quote... :tropical_fish:", params);
		setTimeout(function(){ gregBot.postMessageToUser( name, quote, params ); }, 3500);
	}
};

/**
 * Post a generic message
 * @param {object} replyTo
 * @param {string} message
 */
const postMessage = function(replyTo, message)
{	
	var type = replyTo['type'];
	var name = replyTo['name'];

	if(type === 'channel')
		gregBot.postMessageToChannel( name, message, params );
	else if(type === 'user')
		gregBot.postMessageToUser( name, message, params );
};


/**
 * Check if message is posted to user or channel
 * @param {string} channel_id
 * @param {string} user_id
 * @returns {object}
 */
const getChannelOrUserNameFromID = function(channel_id, user_id)
{
	var channel = getChannelName(channel_id);
	
	if(channel['name'] === "")
	{
		channel = getUserName(user_id);
	}
	
	return channel;
};

/**
 * Get channel name from is
 * @param {string} channel_id
 * @returns {object}
 */
const getChannelName = function(channel_id)
{
	var response = {
		"type": "channel",
		"name": ""
	}
	
	//Check if id is related to a channel
	var allChannels = gregBot.getChannels();
	allChannels = allChannels['_value']['channels'];
	
	for(var key in allChannels)
	{
		if(allChannels[key]['id'] === channel_id)
		{
			response['name'] = allChannels[key]['name'];
		}
	}
	
	return response;	
};

/**
 * Get user name from is
 * @param {string} user_id
 * @returns {object}
 */
const getUserName = function(user_id)
{
	var response = {
		"type": "user",
		"name": ""
	}
	
	//Check if id is related to a channel
	var allUsers = gregBot.getUsers();
	allUsers = allUsers['_value']['members'];
	
	for(var key in allUsers)
	{
		if(allUsers[key]['id'] === user_id)
		{
			response['name'] = allUsers[key]['name'];
		}
	}
	
	return response;	
};
