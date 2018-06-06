'use strict';

//Patterns
var pattURL = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
var pattURLSelected = /(\b(https?|ftp|file):\/\/[(t.ce|goo.gl|t.co)\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|]*)/gi;
var pattStartWithRT = /^(RT.@[\w]*:)/i;
var pattStartWithInterrogation = /^\?+/
var pattEmoji = /\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/;
var pattTwoSpaces = /\s\s/;
var pattStartWithUpper = /^[A-Z]/;

var removeEmojis=false;

//Vowels and Replace
var vowels = "aeiou";
var vowelsTilde = "áéíóú";
var replaceChar = "e";
var replaceCharTilde = "é";

//Keep words. Palabras que no se unisexearan por motivos de entendiento.
var keepWords = ['tras'];

//Reply start
var replyStartArray = ['¿Y por qué no decirlo asi? : ', 'Mmm... suena más inclusivo decirlo: ', 'Yo lo diría: ', 'Dígalo asi: ', 'Traducido sin sexismo: ', 'Error 404: ', 'Error 202: ', 'Error 200: ', 'Error 316: ', 'No ofenda, digalo así: ', 'Seamos inclusivos. Digamos: ', 'Mi Detectar Error: '];

// Constructor
function Tweet(reply) {
	this.originalText;
	this.screen_name;
	this.tweetID;
  	this.finalText;
	this.source; //screen_name
	this.reply = reply;
}


Tweet.prototype.createTweetFinal = function(data){
	this.seleccionarDataRelevante(data);
	
	this.purifyInitialText();

	this.generateFinalText();
};

/**************************************************************************
** 1. seleccionarDataRelevante: Obtiene info importante desde data de T.get().
** Si se agrega mas info, se debe agrear el atributo correspondiente a Tweet
**************************************************************************/
Tweet.prototype.seleccionarDataRelevante = function(data) {
	var dataLength = data.length;
	//Texto Original
	this.originalText = data[dataLength-1].full_text;

	//Seteo temporal del finalText igual al texto Original
	this.finalText =  this.originalText;
	
	//ID tweet
	this.tweetID = data[dataLength-1].id_str;
	
	//User del tweet (source)
	this.screen_name = data[dataLength-1].user.screen_name;
};


/**************************************************************************
** 2. purifyInitialText: Clean inicial de frases con simbolos o patrones no deseados
** Elimina links, RT, etc.
**************************************************************************/
Tweet.prototype.purifyInitialText = function() {
	//Remover emojis si es requerido
  	if(removeEmojis && this.firstIndexOf(this.finalText, pattEmoji) != -1)
  		this.finalText = this.deletePattern(this.finalText, pattEmoji);

  	//Eliminar Links
	this.finalText = this.deletePattern(this.finalText, pattURLSelected);
	
	//Eliminar inicio con RT @XXX:
	this.finalText = this.deletePattern(this.finalText, pattStartWithRT);

	//Eliminar inicio con ???:
	this.finalText = this.deletePattern(this.finalText, pattStartWithInterrogation);

	//Eliminar dobles espacios
	this.finalText = this.deletePattern(this.finalText, pattTwoSpaces);

	this.finalText = this.finalText.trim();
};

/**************************************************************************
** 3. generateFinalText: Retorna el texto final a postear. 
** Se aplica la semantica no sexista.
**************************************************************************/
Tweet.prototype.generateFinalText = function() {
	this.finalText = this.noSexistSemantics(this.finalText);
	if(this.reply){
		//Buscamos inicio
		var replyStart = randomReplyStart();
		//generamos el texto final. @sorce es obligatorio. Se agrega replyStart para darle mas vida al bot
		this.finalText =  '@' + this.source + ' ' + replyStart + this.finalText;
	}else{
		var quotedTweet = ' https://twitter.com/'+this.source+'/status/'+this.tweetID;
		this.finalText = this.finalText + ' ' + quotedTweet;
	}		
};

/**************************************************************************
** noSexistSemantics: Se busca la ultima vocal, si es a ó o, se reemplaza por e.
** Si la palabra tiene menos de 3 letras, no se hace nada
** Si la letra sexista tiene tilde, se respeta el tilde al unisexizar
**************************************************************************/
Tweet.prototype.noSexistSemantics = function(str) {
	//Se genera un array de las palabras
	var resultArray = str.split(" ");
	for (let index = 0; index < resultArray.length; index++) {
		//Se unisexiza la palabra siempre que no sea un keepWord
		if(keepWords.indexOf(resultArray[index]) == -1){
			resultArray[index] = this.unisexWord(resultArray[index]);	
		}
	}
	return resultArray.join(" ");
};

Tweet.prototype.unisexWord = function(sexedWord) {
	//Si tiene mas de 3 letras y no es un @, aplica cambio
	if(sexedWord.length >= 4 && sexedWord.indexOf('@') == -1 && sexedWord.indexOf('#') == -1){
		//Buscamos desde atras de la palabra
		for(let i = sexedWord.length - 1; i > 0; i--)	{
			//Si encontramos una vocal, reemplazamos 
			//Sin tilde
			if(vowels.indexOf(sexedWord.charAt(i)) >= 0){
				sexedWord = sexedWord.substring(0, i) +replaceChar + sexedWord.substring(i + 1);
				break;
			}
			//Con tilde
			if(vowelsTilde.indexOf(sexedWord.charAt(i)) >= 0){
				sexedWord = sexedWord.substring(0, i) +replaceCharTilde + sexedWord.substring(i + 1);
				break;
			}
		}
	}
	return sexedWord;
};


/**************************************************************************
*************************** UTILS *****************************************
**************************************************************************/

/**************************************************************************
** firstIndexOf: Retorna el primer INDICE del patron buscado en la palabra
** Si no encuentra, retorna -1
**************************************************************************/
Tweet.prototype.firstIndexOf = function(str, pattern){
    return str.search(pattern);
};

/**************************************************************************
** deletePattern: Elimina todo pattern dentro de la palabra. Retorna STRING
**************************************************************************/
Tweet.prototype.deletePattern = function(str, pattern){
	return str.replace(pattern," "); 
};

/**************************************************************************
** replyStatrRandom: Elimina todo pattern dentro de la palabra. Retorna STRING
**************************************************************************/
function randomReplyStart(){
	return replyStartArray[Math.floor(Math.random() * replyStartArray.length)];
}

// export the class
module.exports = Tweet;
