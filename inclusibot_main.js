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
var sourcesArray = ['biobio', 'adnradiochile', 'Cooperativa', 'bbcmundo', '24HorasTVN', 'CNNChile', 'latercera', 'elmostrador', 'thecliniccl', 'ahoranoticiasAN', 'DiarioLaHora', 'nacioncl', 'Tele13_Radio', 'lacuarta','ElGraficoChile', 'soychilecl', 'emol', 'CNNEE', 'el_pais', 'sebastianpinera', 'GobiernodeChile', 'ceciperez1', 'ceciliamorel', 'andreschadwickp', 'KarlaEnAccion', 'MarceSabat', 'cmonckeberg', 'nmonckeberg', 'lilyperez', 'joseantoniokast', 'mjossandon', 'aluksicc','mauriciohofmann','bianchileiton','BarackObama','copano','LavinJoaquin','rafaelgumucioa','AlbertoMayol','RinconSalfate','consuelosaav','RicardoLagos','TonkaTP','MarceloRios75','patricionavia','ramirez_polo','kingarturo23','AndresVelasco','MedelPitbull','C1audioBravo','SoledadOnetto','Cumparini','jumastorga','tv_mauricio','matiasdelrio','Orrego', 'gabrielboric', 'GiorgioJackson', 'fernandopaulsen', 'DMatamala', 'lucyanaah', 'AldoDuqueSantos', 'mbachelet', 'AldoDuqueSantos', 'maylwino', 'guillier', 'melnicksergio', 'albertoespina', 'chahuan', 'allamand', 'lcruzcoke', 'felipekast'];
var totalCharacters = 280;
var intervalTime = 1000*60*10;
var lastTweetID = 0;

//RUN, Forrest, RUN!
tweetIt();
//Cada 10 minutos, un nuevo tweet
setInterval( function() { tweetIt(); }, intervalTime); 

//Funcion de tweeteo principal
function tweetIt() {
	var tweet = new Tweet(true);
	//Seleccionamos la fuente
	tweet.source = randomSource();
	console.log("source: "+tweet.source);
	//GET tweet
	var count = randomCount();
	T.get('statuses/user_timeline', { screen_name: tweet.source, count: count, tweet_mode: 'extended' }, function (err, data, response) {
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
	});
}


/**************************************************************************
** postIt: Postea el tweet 
** Nota: Si se agrega como parametro in_reply_to_status_id: tweet.tweetID, 
** responde al tweet simulando una traduccion. En el textfinal debe @ la cuenta
**************************************************************************/
function postIt(tweet){
	T.post('statuses/update', {status: tweet.finalText}, function (err, data, response) {
		if(!err){
			console.log("Posteado :)");
		}else{
			console.log("Retrying :(");
			tweetIt();
		}		
	});
}

/**************************************************************************
** randomSource: Busca aleatoreamente una fuente de twitter. 
** Si sourceAvoid existe, se entrega obligatoriamente otra fuente.
**************************************************************************/
function randomSource(sourceAvoid){
	if(sourceAvoid == undefined){
		return sourcesArray[Math.floor(Math.random() * sourcesArray.length)];
	}else{
		var sourceSelected = sourcesArray[Math.floor(Math.random() * sourcesArray.length)];
		if(sourceSelected == sourceAvoid)
			return randomSource(sourceAvoid);
		else
			return sourceSelected;
	}
}

/**************************************************************************
** randomCount: Busca aleatoreamente un contador
**************************************************************************/
function randomCount(){
	return Math.floor(Math.random() * 10) + 1 ;
}