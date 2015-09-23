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
	var id = getParameterByName("p").replace(/[\\\/]/,"");
	if (id===null||id.length===0) {
		displayError("No ID specified in URL.")
		return;
	}

	var githubURL = 'https://api.github.com/gists/'+id;

	var githubHTTPClient = new XMLHttpRequest();
	githubHTTPClient.open('GET', githubURL);
	githubHTTPClient.onreadystatechange = function() {
		if(githubHTTPClient.readyState!=4) {
			return;
		}
		var result = JSON.parse(githubHTTPClient.responseText);
		if (githubHTTPClient.status===403) {
			displayError(result.message);
		} else if (githubHTTPClient.status!==200&&githubHTTPClient.status!==201) {
			displayError("HTTP Error "+ githubHTTPClient.status + ' - ' + githubHTTPClient.statusText);
		}
		var result = JSON.parse(githubHTTPClient.responseText);
		var code=result["files"]["script.txt"]["content"];


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

		var url = "editor.html?hack="+id;
		url=qualifyURL(url);

		hacklink.href=url;
	}
	githubHTTPClient.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	githubHTTPClient.send();
}

getData();



		// var code=result["files"]["script.txt"]["content"];
		// compile(["restart"],code);
		//
		// if (state.metadata.homepage!==undefined) {
		// 	var homepage=state.metadata.homepage;
		// 	var homepageLink = document.getElementById("homepagelink");
		// 	homepageLink.innerHTML=strip_http(homepage);
 	// 		if (!homepage.match(/^https?:\/\//)) {
 	// 			homepage = "http://" + homepage;
 	// 		}
 	// 		homepageLink.href = homepage;
		// }
		// if (state.metadata.title!==undefined) {
		// 	var title=state.metadata.title;
		// 	var gametitle = document.getElementById("gametitle");
		// 	gametitle.innerHTML=title;
		// 	window.document.title=title+" - PuzzleScript Game";
		// }
    //             Mobile.enable();
		// var hacklink = document.getElementById("hacklink");
		//
		// var url = "editor.html?hack="+id;
		// url=qualifyURL(url);
		//
		// hacklink.href=url;
