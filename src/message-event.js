const substringSearch = require('./substring-search.js');
const queueUrls = require( '../auth/rabbit-urls.js' );

exports.start = function() 
{
	console.log("Hey lads, I'm awake!");
}

exports.parseMessage = function(messageData) 
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
		
		//response = "Hello, @alex! What a glorious Sunday evening!" 
		response = 'Hello, <@' + user_id + '>! What a glorious ' + timeAndDay['day'] + " " + timeAndDay['period'] + "!";
	}
	//IF A FAREWELL
	else if(farewell.some(function(v) { return receivedText.indexOf(v) >= 0; })) 
	{		
		//response = "Going already, @alex? Bye!" 
		response = 'Going already, <@' + user_id + '>? Bye!';
	}
	
	//IF ASKED QUEUE STATUS
	if(receivedText.indexOf('queue status') >= 0)
	{
		response = 'Gonna check the queues lad.'
	}
	
	return response;
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