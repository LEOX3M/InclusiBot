'use strict';
require('dotenv').config();
const Tweet = require('./Tweet.js');
const Twit = require('twit');
const request = require('request').defaults({ encoding: null });

//Values
var T = new Twit({
  consumer_key:         process.env.CONSUMER_KEY,
  consumer_secret:      process.env.CONSUMER_SECRET,
  access_token:         process.env.ACCESS_TOKEN,
  access_token_secret:  process.env.ACCESS_TOKEN_SECRET,
});

//Variables globales
var sourcesArray = process.env.SOURCE_ARRAY.split(' ')
var totalCharacters = process.env.TWITTER_CHAR_LIMIT;
var intervalTweetTime = process.env.TWEET_TIME;
var intervalReplyTime = process.env.REPLY_TIME;
var lastTweetID = 0;

//RUN, Forrest, RUN!
tweetIt();
//Cada X minutos, un nuevo tweet
setInterval( function() { tweetIt(); }, intervalTweetTime); 
//Cada X minutos, un nuevo reply
setInterval( function() { replayIt(); }, intervalReplyTime); 

//Funcion de tweeteo principal
function tweetIt() {
	var tweet = new Tweet(false);
	//Seleccionamos la fuente
	tweet.source = randomSource();
	console.log("source: "+tweet.source);
	//GET tweet
	var count = randomCount();
	T.get('statuses/user_timeline', { screen_name: tweet.source, count: count, tweet_mode: 'extended' }, function (err, data, response) {
		if(!err){
			//Seteo de informacion relevante proveniente del tweet
			//y creacion del tweet final
			tweet.createTweetFinal(data);
			console.log("OTweet: "+tweet.originalText);
			console.log("FTweet: "+tweet.finalText);
			
			//Si el tweet actual resulta ser el mismo que se posteo anteriormente, se busca otro.
			//Si el tweet final excede el total, se busca otro.
			if(lastTweetID==tweet.tweetID || tweet.finalText.length > totalCharacters){
				tweetIt();
				return;
			}
			lastTweetID = tweet.tweetID;

			//¡¡¡SEND TWIT!!!
			postIt(tweet); 
		}else{
			console.log(err);
		}
	});
}

//Funcion de reply principal
function replayIt() {
	var tweet = new Tweet(true);
	//Seleccionamos la fuente
	tweet.source = randomSource(true);
	console.log("source: "+tweet.source);
	//GET tweet
	var count = randomCount();
	T.get('statuses/user_timeline', { screen_name: tweet.source, count: count, tweet_mode: 'extended' }, function (err, data, response) {
		//Seteo de informacion relevante proveniente del tweet
		//y creacion del tweet final
		tweet.createTweetFinal(data);
		console.log("ReplyO: "+tweet.originalText);
		console.log("ReplyF: "+tweet.finalText);
		 
		//Reply Tweet!!
		 postReply(tweet); 
	});
}


/**************************************************************************
** postIt: Postea el tweet 
**************************************************************************/
function postIt(tweet){
	T.post('statuses/update', {status: tweet.finalText}, function (err, data, response) {
		if(!err){
			console.log("Posteado :)");
		}else{
			console.log(err);
			console.log("Retrying :(");
			tweetIt();
		}		
	});
}

/**************************************************************************
** postReply: Reply del tweet 
** Nota: Si se agrega como parametro in_reply_to_status_id: tweet.tweetID, 
** responde al tweet simulando una traduccion. En el textfinal debe @ la cuenta
**************************************************************************/

function postReply(tweet){

	T.post('statuses/update', {status: tweet.finalText, in_reply_to_status_id: tweet.tweetID}, function (err, data, response) {
		if(!err){
			console.log("Reply correcto :)");
		}else{
			console.log("Retrying Reply :(");
			console.log(err);
			replayIt();
		}		
	});
}

/**************************************************************************
** randomSource: Busca aleatoreamente una fuente de twitter. 
** Si justPeople existe, se retorna solo usuarios que son personas, no medios de comunicacion.
**************************************************************************/
function randomSource(justPeople){
	if(justPeople == undefined){
		return sourcesArray[Math.floor(Math.random() * sourcesArray.length)];
	}else{
		return sourcesArray[Math.floor(Math.random() * sourcesArray.length - 19) + 19];
	}
}

/**************************************************************************
** randomCount: Busca aleatoreamente un contador
**************************************************************************/
function randomCount(){
	return Math.floor(Math.random() * 10) + 1 ;
}