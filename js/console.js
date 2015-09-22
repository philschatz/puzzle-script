export function jumpToLine(i) {

    var code = parent.form1.code;

    var editor = code.editorreference;

    // editor.getLineHandle does not help as it does not return the reference of line.
    editor.scrollIntoView(i - 1 - 10);
    editor.scrollIntoView(i - 1 + 10);
    editor.scrollIntoView(i - 1);
    editor.setCursor(i - 1, 0);
}

var consolecache = [];
export function consolePrint(text,urgent) {
	if (urgent===undefined) {
		urgent=false;
	}
	if (GAME.cache_console_messages&&urgent==false) {
		consolecache.push(text);
	} else {
		addToConsole(text);
	}
}


var cache_n = 0;

export function addToConsole(text) {
	cache = document.createElement("div");
	cache.id = "cache" + cache_n;
	cache.innerHTML = text;
	cache_n++;

	var code = document.getElementById('consoletextarea');
	code.appendChild(cache);
	consolecache=[];
	var objDiv = document.getElementById('lowerarea');
	objDiv.scrollTop = objDiv.scrollHeight;
}

export function consoleCacheDump() {
	if (GAME.cache_console_messages===false) {
		return;
	}

	var lastline = "";
	var times_repeated = 0;
	var summarised_message = "<br>";
	for (var i = 0; i < consolecache.length; i++) {
		if (consolecache[i] == lastline) {
			times_repeated++;
		} else {
			lastline = consolecache[i];
			if (times_repeated > 0) {
				summarised_message = summarised_message + " (x" + (times_repeated + 1) + ")";
			}
			summarised_message += "<br>"
			summarised_message += lastline;
			times_repeated = 0;
		}
	}


	addToConsole(summarised_message);
}

export function consoleError(text) {
        var errorString = '<span class="errorText">' + text + '</span>';
        consolePrint(errorString,true);
}
export function clearConsole() {
	var code = document.getElementById('consoletextarea');
	code.innerHTML = '';
	var objDiv = document.getElementById('lowerarea');
	objDiv.scrollTop = objDiv.scrollHeight;
}

// var clearConsoleClick = document.getElementById("clearConsoleClick");
// clearConsoleClick.addEventListener("click", clearConsole, false);
