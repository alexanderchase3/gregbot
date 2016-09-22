const Twitter = require('twitter');

// @TODO: Move these into a separate file
const client = new Twitter({
  consumer_key: 'q1tMmBW5ILXRMbkdShHsG6OSw',
  consumer_secret: 'lsj7cmQK9jVtLgIlA2TFg3EBbs9sQrlobk7QOfdC1jfeT6kS9B',
  access_token_key: '761130436231823360-uRb4p4frsDwiiXyheocAXUVWw7LPlxd',
  access_token_secret: 'a04T741ndqV7DLSlYlIWcpY8k2ibtSEHM5D8G84EHLplC'
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
		//@TODO: Add error check and response for  { code: 187, message: 'Status is a duplicate.' }
		if(error) 
		{
			callback( error, undefined );
			return;
		}
		
		var tweetObject = JSON.parse(JSON.stringify(tweet));

		callback( undefined, tweetObject );
	});	
}