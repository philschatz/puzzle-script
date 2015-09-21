import * as FOO1 from './globalVariables';
import * as FOO2 from './debug_off';
import * as FOO3 from './font';
import * as FOO4 from './rng';
import * as FOO5 from './riffwave';
import * as FOO6 from './sfxr';
import * as FOO7 from './codemirror/codemirror';
import * as FOO8 from './colors';
import * as FOO9 from './graphics';
import * as FOO10 from './engine';
import * as FOO11 from './parser';
import {compile, qualifyURL} from './compiler';
import * as FOO13 from './inputoutput';
import * as FOO14 from './mobile';






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
		compile(["restart"],code);

		if (state.metadata.homepage!==undefined) {
			var homepage=state.metadata.homepage;
			var homepageLink = document.getElementById("homepagelink");
			homepageLink.innerHTML=strip_http(homepage);
 			if (!homepage.match(/^https?:\/\//)) {
 				homepage = "http://" + homepage;
 			}
 			homepageLink.href = homepage;
		}
		if (state.metadata.title!==undefined) {
			var title=state.metadata.title;
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
