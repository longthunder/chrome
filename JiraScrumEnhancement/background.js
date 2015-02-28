/***
 @ Author Raymond
***/
chrome.extension.onRequest.addListener(function(message, sender, callback){
	//console.log('receive version message:'+message.type);
	if(message.type == 'version') {		
		$.getJSON("manifest.json", function(json) {
			callback({version: json.version})
		})
	}
})