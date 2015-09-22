import {globals as GAME} from './globalVariables';

var canSetHTMLColors=false;
var canDump=true;
var canYoutube=false;
var inputHistory=[];
var compiledText;
var canOpenEditor=true;
var IDE=true;

function convertLevelToString() {
	var out = '';
	var seenCells = {};
	var i = 0;
	for (var y = 0; y < GAME.level.height; y++) {
		for (var x = 0; x < GAME.level.width; x++) {
			var bitmask = GAME.level.getCell(x + y * GAME.level.width);
			var objs = [];
			for (var bit = 0; bit < 32 * STRIDE_OBJ; ++bit) {
				if (bitmask.get(bit)) {
					objs.push(state.idDict[bit])
				}
			}
			objs.sort();
			objs = objs.join(" ");
			/* replace repeated object combinations with numbers */
			if (!seenCells.hasOwnProperty(objs)) {
				seenCells[objs] = i++;
				out += objs + ":";
			}
			out += seenCells[objs] + ",";
		}
		out += '\n';
	}
	return out;
}

function dumpTestCase() {
	var levelDat = compiledText;
	var input = inputHistory.concat([]);
	var outputDat = convertLevelToString();

	var resultarray = [levelDat,input,outputDat,GAME.curlevel,loadedLevelSeed];
	var resultstring = JSON.stringify(resultarray);
	consolePrint("<br><br><br>"+resultstring+"<br><br><br>",true);
}

function clearInputHistory() {
	if (canDump===true) {
		inputHistory=[];
	}
}

function pushInput(inp) {
	if (canDump===true) {
		inputHistory.push(inp);
	}
}
