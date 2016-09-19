const SlackBot = require('slackbots');
const request = require('request');

const queueUrls = require( '../auth/rabbit-urls.js' );
const messageEvent = require( '../src/message-event.js' );
const botTokens = require( '../auth/slack-token.js' );

var sentWarnings = {};
var sentQuotes = {};
const checkInterval = 1000 * 10;
const warningThreshold = 1500;
const channel = 'developer-chat';

var botToken = botTokens.live;
var botID = 'U227YR75M';
var botName = 'greg-bot';
var params = 
{
	icon_emoji: ':tropical_fish:'
};
	
//if dev use paul-bot else use 
if(process.argv[2] === 'paul')
{
	botToken = botTokens.dev;
	botID = 'U2DA8FA4C';
	botName = 'paul-bot';
	params = 
	{
		icon_emoji: ':beers:'
	};
}

var gregBot = new SlackBot({
    token: botToken, 
    name: botName
});

gregBot.on('start', function() 
{	
	//MOVE THIS FOR LOOP TO pingURLs itself
	for(var key in queueUrls)
	{
		pingUrls( queueUrls[key] );
	}
	
	messageEvent.start();
	
	setInterval( function()
	{
		for(var key in queueUrls)
		{
			pingUrls( queueUrls[key] );
		}
	}, checkInterval );
});


gregBot.on('message', function(data)
{
	var type = data['type'];
	var subtype = data['subtype'];
	var channel_id = data['channel'];
	var user_id = data['user'];
	var text = data['text'];
		
	var postedBy = getChannelOrUserNameFromID(channel_id, user_id);
	
	//EVENTS: MESSAGE TO GREGBOT
	if(type === 'message' && subtype !== 'bot_message')
	{
		//Build regex to find someone mentioning gregbot
		var mentionSyntax = '<@' + botID + '(\\|' + botName.replace('.', '\\.') + ')?>';
        var mention = new RegExp(mentionSyntax, 'i');

        //Only reply if mentioned
        if(text.match(mention))
        {
	        var response = messageEvent.parseMessage(data);
	        
	        //Seems more human to have a slightly delayed response
			setTimeout(function(){ postMessage(postedBy, response); }, 1000);
        }
        
	}
});

const generateQueueWarningMessage = function( queueResponse )
{
	return ':bangbang: OI LADS, *' + queueResponse.name + ' - ' + queueResponse.node + '* has ' + queueResponse.messages + ' messages :tropical_fish:'
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

const pingUrls = function( queueUrl )
{
	request(queueUrl , function (error, response, body) 
	{
		if ( error || response.statusCode !== 200 ) 
			return;

		checkQueues( JSON.parse( body ) );
	});
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
 * Get user name from id
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