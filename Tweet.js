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

// Constructor
function Tweet(retweeting) {
	this.originalText;
	this.screen_name;
	this.tweetID;
  	this.finalText;
	this.truncated;
	this.mediaUrl;
	this.source; //screen_name
	this.retweeting = retweeting;
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

	console.log("__________________________________");
	console.log(data[dataLength-1]);
	console.log("__________________________________");

	//Texto Original
	this.originalText = data[dataLength-1].full_text;

	//Seteo temporal del finalText igual al texto Original
	this.finalText =  this.originalText;
	
	//ID tweet
	this.tweetID = data[dataLength-1].id_str;
	
	//User del tweet (source)
	this.screen_name = data[dataLength-1].user.screen_name;

	//Esta truncado el texto?
	this.truncated = data[dataLength-1].truncated;

	//Tiene Imagen/Video?
	if(data[dataLength-1].entities.hasOwnProperty("media"))
  		this.mediaUrl = data[dataLength-1].entities.media[0].media_url;
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
	//USAR TEMPORALMENTE
	this.screen_name = 'AhoraBoticias';

	//var quotedTweet = ' <span class="invisible"><a href="https://twitter.com/'+this.source+'/status/'+this.tweetID+'"></a></span>';
	var quotedTweet = ' https://twitter.com/'+this.source+'/status/'+this.tweetID;
	//var quotedTweet = ' ';
	
	//util para responder al tweet como traduccion.
	//var quotedTweet = ' @' + this.source;
	this.finalText = this.noSexistSemantics(this.finalText);
	if(this.retweeting)
		this.finalText =  this.finalText + ' ' + quotedTweet;

		//this.finalText =  'RT @' + this.screen_name + ' '+ this.finalText + ' ' +quotedTweet;

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
	//Si tiene mas de 3 letras, aplica cambio
	if(sexedWord.length >= 4){
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

// export the class
module.exports = Tweet;