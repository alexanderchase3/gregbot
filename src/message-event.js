const substring_search = require('./substring-search.js');

exports.start = function() 
{
	console.log("Hey lads, I'm awake!");
}

exports.parseMessage = function(messageData) 
{
	var response = "";
	
	var receivedText = messageData['text'].toLowerCase();
	var user_id = messageData['user'];
	
	var greetings = substring_search.greeting;
	
	//IF IT'S A GREETING
	if(greetings.some(function(v) { return receivedText.indexOf(v) >= 0; })) 
	{
		var timeAndDay = getTimeandDay();
		
		//response = "Hello @alex! What a glorious Sunday evening!" 
		var response = 'Hello, <@' + user_id + '>! What a glorious ' + timeAndDay['day'] + " " + timeAndDay['period'] + "!";
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