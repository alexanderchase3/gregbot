const Twitter = require('twitter');

const twitterAuth = require( '../auth/twitter-auth.js' );

// @TODO: Move these into a separate file
const client = new Twitter({
  consumer_key: twitterAuth.consumer_key,
  consumer_secret: twitterAuth.consumer_secret,
  access_token_key: twitterAuth.access_token_key,
  access_token_secret: twitterAuth.access_token_secret
});

var postLink = "";

//@TODO: Change from tweet between pipe. Slack changes normal quotes to open and close so caused problems.
exports.generateTweet = function(tweetText, callback) 
{	
	var tweet = tweetText.substring(tweetText.indexOf("|") + 1, tweetText.lastIndexOf("|"));
	
	postTweet(tweet, callback);	
}

const postTweet = function(tweetText, callback)
{	
	var tweetRequest = client.post('statuses/update', {status: tweetText},  function(error, tweet, response) {
		
		if(error) 
		{
			callback( error, undefined );
			return;
		}
		
		var tweetObject = JSON.parse(JSON.stringify(tweet));

		callback( undefined, tweetObject );
	});	
}