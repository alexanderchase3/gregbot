const substringSearch = require('./substring-search.js');
const queueUrls = require( '../auth/rabbit-urls.js' );
const twitterAPI = require('./twitter-api.js');

exports.start = function() 
{
	console.log("Hey lads, I'm awake!");
}

exports.parseMessage = function(messageData, callback) 
{
	var response = "";
	
	var receivedText = messageData['text'].toLowerCase();
	var user_id = messageData['user'];
	
	var greetings = substringSearch.greeting;
	var farewell = substringSearch.farewell;
	
	//IF A GREETING
	if(greetings.some(function(v) { return receivedText.indexOf(v) >= 0; })) 
	{
		var timeAndDay = getTimeandDay();
		
		callback('Hello, <@' + user_id + '>! What a glorious ' + timeAndDay['day'] + " " + timeAndDay['period'] + "!");
	}
	//IF A FAREWELL
	else if(farewell.some(function(v) { return receivedText.indexOf(v) >= 0; })) 
	{		
		callback('Going already, <@' + user_id + '>? Bye!');
	}
	//IF ASKED QUEUE STATUS
	else if(receivedText.indexOf('queue status') >= 0)
	{
		callback('Gonna check the queues lad.');
	}
	else if(receivedText.indexOf('tweet') >= 0)
	{
		twitterAPI.generateTweet(messageData['text'], function(error, tweetObject)
		{
			if( error || typeof tweetObject.errors !== "undefined" )
			{
				//If duplicate tweet
				if(error[0]['code'] === 187)
					callback( "You've already tweeted that! :hushed:" );
				else
					callback( ':scream_cat: Something went wrong!' );
					
				return;
			}

			var username = tweetObject['user']['screen_name'];
			var tweet_id = tweetObject['id_str'];

			callback("https://twitter.com/" + username + "/status/" + tweet_id);
		});
	}
}

const getTimeandDay = function()
{
	var response = {
		"period": "",
		"day": ""
	}
	
	var date = new Date();

	var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
	var day = date.getUTCDay();
	response['day'] = days[day];
	
	var hours = date.getUTCHours();
	
	if(hours > 16)
		response['period'] = 'evening';
	else if(hours > 11)
		response['period'] = 'afternoon';
	else
		response['period'] = 'morning';
		
	return response;
};