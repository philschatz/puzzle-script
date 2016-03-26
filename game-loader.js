import {globals as ENGINE} from './js/_global-engine';
import Mobile from './js/mobile';
import {qualifyURL} from './js/compiler';


import GameEngine from './js';



function displayError(message) {
	var errorText = document.getElementById("errormessage");
	errorText.innerHTML="ERROR "+message+"<br>";

}
function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function strip_http(url) {
   url = url.replace(/^https?:\/\//,'');
   return url;
}

function getData(){
	var url = './games/' + prompt('Which game?', 'bubble') + '.txt';

	var githubHTTPClient = new XMLHttpRequest();
	githubHTTPClient.open('GET', url);
	githubHTTPClient.onreadystatechange = function() {
		if(githubHTTPClient.readyState!=4) {
			return;
		}
		if (githubHTTPClient.status!==200&&githubHTTPClient.status!==201) {
			alert('Bad Filename. Refresh and Try again');
		}
		var code = githubHTTPClient.responseText;


		// -------------------------------------------------------------------------
		// -------------------------------------------------------------------------
		// -------------------------------------------------------------------------
		const node = document.getElementById('gameCanvas');
		GameEngine.useDefaultSaveAndLoad(document.URL);
		GameEngine.start(node, code);
		window.GameEngine = GameEngine;
		// GameEngine.stop(node);
		// -------------------------------------------------------------------------
		// -------------------------------------------------------------------------
		// -------------------------------------------------------------------------



		if (ENGINE.state.metadata.homepage!==undefined) {
			var homepage=ENGINE.state.metadata.homepage;
			var homepageLink = document.getElementById("homepagelink");
			homepageLink.innerHTML=strip_http(homepage);
 			if (!homepage.match(/^https?:\/\//)) {
 				homepage = "http://" + homepage;
 			}
 			homepageLink.href = homepage;
		}
		if (ENGINE.state.metadata.title!==undefined) {
			var title=ENGINE.state.metadata.title;
			var gametitle = document.getElementById("gametitle");
			gametitle.innerHTML=title;
			window.document.title=title+" - PuzzleScript Game";
		}
                Mobile.enable();
		var hacklink = document.getElementById("hacklink");

		// var url = "editor.html?hack="+id;
		// url=qualifyURL(url);
		//
		// hacklink.href=url;
	}
	githubHTTPClient.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	githubHTTPClient.send();
}

getData();
