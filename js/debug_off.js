export const globals = {

	canSetHTMLColors: true,
	canDump: false,
	canOpenEditor: false,
	canYoutube: true,
	IDE: false,

};


export function stripTags(str) {
	var div = document.createElement("div");
	div.innerHTML = str;
	var result = div.textContent || div.innerText || "";
	return result;
}

export function consolePrint(str){
/*	var errorText = document.getElementById("errormessage");

	str=stripTags(str);
	errorText.innerHTML+=str+"<br>";*/
}

export function consoleCacheDump(str){

}

export function consoleError(str,lineNumber){
	var errorText = document.getElementById("errormessage");
	str=stripTags(str);
	errorText.innerHTML+=str+"<br>";
}

export function logErrorNoLine(str){
	var errorText = document.getElementById("errormessage");
	str=stripTags(str);
	errorText.innerHTML+=str+"<br>";
}

export function logBetaMessage(str){
	var errorText = document.getElementById("errormessage");
	str=stripTags(str);
	errorText.innerHTML+=str+"<br>";
}

export function clearInputHistory() {}
export function pushInput(inp) {}
