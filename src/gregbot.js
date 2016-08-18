const SlackBot = require('slackbots');
const request = require('request');

var gregBot = new SlackBot({
    token: require( '../auth/slack-token.js' ), // Add a bot https://my.slack.com/services/new/bot and put the token  
    name: 'gregbot'
});

const queueUrls = require( '../auth/rabbit-urls.js' );

var sentWarnings = {};
const checkInterval = 1000 * 60;
const warningThreshold = 5000;
const channel = 'developer-chat';

const params = 
{
	icon_emoji: ':tropical_fish:'
};

gregBot.on('start', function() 
{
	pingUrls( queueUrls );

	setInterval( function()
	{
		pingUrls( queueUrls );

	}, checkInterval );
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

