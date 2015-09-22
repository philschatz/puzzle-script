import {RNG} from './rng';
import {canvasResize} from './graphics';
import {globals as ENGINE} from './_global-engine';
import {globals as DEBUG, clearInputHistory, consolePrint} from './debug_off';
import {globals as GAME} from './globalVariables';
import {logErrorCacheable} from './parser';
import {playSound} from './sfxr';

/*
..................................
.............SOKOBAN..............
..................................
...........#.new game.#...........
..................................
.............continue.............
..................................
arrow keys to move................
x to action.......................
z to undo, r to restart...........
*/

var RandomGen = new RNG();

var intro_template = [
	"..................................",
	"..................................",
	"..................................",
	"......Puzzle Script Terminal......",
	"..............v 1.0...............",
	"..................................",
	"..................................",
	"..................................",
	".........insert cartridge.........",
	"..................................",
	"..................................",
	"..................................",
	".................................."
];

var messagecontainer_template = [
	"..................................",
	"..................................",
	"..................................",
	"..................................",
	"..................................",
	"..................................",
	"..................................",
	"..................................",
	"..................................",
	"..................................",
	"..........X to continue...........",
	"..................................",
	".................................."
];

var titletemplate_firstgo = [
	"..................................",
	"..................................",
	"..................................",
	"..................................",
	"..................................",
	"..................................",
	"..........#.start game.#..........",
	"..................................",
	"..................................",
	".arrow keys to move...............",
	".X to action......................",
	".Z to undo, R to restart..........",
	".................................."];

var titletemplate_select0 = [
	"..................................",
	"..................................",
	"..................................",
	"..................................",
	"..................................",
	"...........#.new game.#...........",
	"..................................",
	".............continue.............",
	"..................................",
	".arrow keys to move...............",
	".X to action......................",
	".Z to undo, R to restart..........",
	".................................."];

var titletemplate_select1 = [
	"..................................",
	"..................................",
	"..................................",
	"..................................",
	"..................................",
	".............new game.............",
	"..................................",
	"...........#.continue.#...........",
	"..................................",
	".arrow keys to move...............",
	".X to action......................",
	".Z to undo, R to restart..........",
	".................................."];


var titletemplate_firstgo_selected = [
	"..................................",
	"..................................",
	"..................................",
	"..................................",
	"..................................",
	"..................................",
	"###########.start game.###########",
	"..................................",
	"..................................",
	".arrow keys to move...............",
	".X to action......................",
	".Z to undo, R to restart..........",
	".................................."];

var titletemplate_select0_selected = [
	"..................................",
	"..................................",
	"..................................",
	"..................................",
	"..................................",
	"############.new game.############",
	"..................................",
	".............continue.............",
	"..................................",
	".arrow keys to move...............",
	".X to action......................",
	".Z to undo, R to restart..........",
	".................................."];

var titletemplate_select1_selected = [
	"..................................",
	"..................................",
	"..................................",
	"..................................",
	"..................................",
	".............new game.............",
	"..................................",
	"############.continue.############",
	"..................................",
	".arrow keys to move...............",
	".X to action......................",
	".Z to undo, R to restart..........",
	".................................."];


export function unloadGame() {
	ENGINE.state=ENGINE.introstate;
	GAME.level = new Level(0, 5, 5, 2, null);
	GAME.level.objects = new Int32Array(0);
	generateTitleScreen();
	canvasResize();
	redraw();
}

export function generateTitleScreen()
{
	ENGINE.titleMode=(GAME.curlevel>0||GAME.curlevelTarget!==null)?1:0;

	if (ENGINE.state.levels.length===0) {
		ENGINE.titleImage=intro_template;
		return;
	}

	var title = "PuzzleScript Game";
	if (ENGINE.state.metadata.title!==undefined) {
		title=ENGINE.state.metadata.title;
	}

	if (ENGINE.titleMode===0) {
		if (ENGINE.titleSelected) {
			ENGINE.titleImage = deepClone(titletemplate_firstgo_selected);
		} else {
			ENGINE.titleImage = deepClone(titletemplate_firstgo);
		}
	} else {
		if (ENGINE.titleSelection===0) {
			if (ENGINE.titleSelected) {
				ENGINE.titleImage = deepClone(titletemplate_select0_selected);
			} else {
				ENGINE.titleImage = deepClone(titletemplate_select0);
			}
		} else {
			if (ENGINE.titleSelected) {
				ENGINE.titleImage = deepClone(titletemplate_select1_selected);
			} else {
				ENGINE.titleImage = deepClone(ENGINE.titletemplate_select1);
			}
		}
	}

	var noAction = 'noaction' in ENGINE.state.metadata;
	var noUndo = 'noundo' in ENGINE.state.metadata;
	var noRestart = 'norestart' in ENGINE.state.metadata;
	if (noUndo && noRestart) {
		ENGINE.titleImage[11]="..................................";
	} else if (noUndo) {
		ENGINE.titleImage[11]=".R to restart.....................";
	} else if (noRestart) {
		ENGINE.titleImage[11]=".Z to undo.....................";
	}
	if (noAction) {
		ENGINE.titleImage[10]="..................................";
	}
	for (var i=0;i<ENGINE.titleImage.length;i++)
	{
		ENGINE.titleImage[i]=ENGINE.titleImage[i].replace(/\./g, ' ');
	}

	var width = ENGINE.titleImage[0].length;
	var titlelines=wordwrap(title,ENGINE.titleImage[0].length);
	for (var i=0;i<titlelines.length;i++) {
		var titleline=titlelines[i];
		var titleLength=titleline.length;
		var lmargin = ((width-titleLength)/2)|0;
		var rmargin = width-titleLength-lmargin;
		var row = ENGINE.titleImage[1+i];
		ENGINE.titleImage[1+i]=row.slice(0,lmargin)+titleline+row.slice(lmargin+titleline.length);
	}
	if (ENGINE.state.metadata.author!==undefined) {
		var attribution="by "+ENGINE.state.metadata.author;
		var attributionsplit = wordwrap(attribution,ENGINE.titleImage[0].length);
		for (var i=0;i<attributionsplit.length;i++) {
			var line = attributionsplit[i]+" ";
			if (line.length>width){
				line=line.slice(0,width);
			}
			var row = ENGINE.titleImage[3+i];
			ENGINE.titleImage[3+i]=row.slice(0,width-line.length)+line;
		}
	}

}


export function deepClone(item) {
    if (!item) { return item; } // null, undefined values check

    var types = [ Number, String, Boolean ],
        result;

    // normalizing primitives if someone did new String('aaa'), or new Number('444');
    types.forEach(function(type) {
        if (item instanceof type) {
            result = type( item );
        }
    });

    if (typeof result == "undefined") {
        if (Object.prototype.toString.call( item ) === "[object Array]") {
            result = [];
            item.forEach(function(child, index, array) {
                result[index] = deepClone( child );
            });
        } else if (typeof item == "object") {
            // testing that this is DOM
            if (item.nodeType && typeof item.cloneNode == "function") {
                var result = item.cloneNode( true );
            } else if (!item.prototype) { // check that this is a literal
                if (item instanceof Date) {
                    result = new Date(item);
                } else {
                    // it is an object literal
                    result = {};
                    for (var i in item) {
                        result[i] = deepClone( item[i] );
                    }
                }
            } else {
                // depending what you would like here,
                // just keep the reference, or create new object
/*                if (false && item.constructor) {
                    // would not advice to do that, reason? Read below
                    result = new item.constructor();
                } else */{
                    result = item;
                }
            }
        } else {
            result = item;
        }
    }

    return result;
}

export function wordwrap( str, width ) {

    width = width || 75;
    var cut = true;

    if (!str) { return str; }

    var regex = '.{1,' +width+ '}(\\s|$)' + (cut ? '|.{' +width+ '}|.+$' : '|\\S+?(\\s|$)');

    return str.match( RegExp(regex, 'g') );

}

var splitMessage=[];

export function drawMessageScreen() {
	ENGINE.titleMode=0;
	ENGINE.textMode=true;
	ENGINE.titleImage = deepClone(messagecontainer_template);

	for (var i=0;i<ENGINE.titleImage.length;i++)
	{
		ENGINE.titleImage[i]=ENGINE.titleImage[i].replace(/\./g, ' ');
	}

	var width = ENGINE.titleImage[0].length;

	var message;
	if (ENGINE.messagetext==="") {
		var leveldat = ENGINE.state.levels[GAME.curlevel];
		message = leveldat.message.trim();
	} else {
		message = ENGINE.messagetext;
	}
	splitMessage = wordwrap(message,ENGINE.titleImage[0].length);

	for (var i=0;i<splitMessage.length;i++) {
		var m = splitMessage[i];
		var row = 5-((splitMessage.length/2)|0)+i;
		var messageLength=m.length;
		var lmargin = ((width-messageLength)/2)|0;
		var rmargin = width-messageLength-lmargin;
		var rowtext = ENGINE.titleImage[row];
		ENGINE.titleImage[row]=rowtext.slice(0,lmargin)+m+rowtext.slice(lmargin+m.length);
	}

	if (GAME.quittingMessageScreen) {
		ENGINE.titleImage[10]=ENGINE.titleImage[9];
	}
	canvasResize();
}

var loadedLevelSeed=0;

export function loadLevelFromLevelDat(state,leveldat,randomseed) {
	if (randomseed==null) {
		randomseed = (Math.random() + Date.now()).toString();
	}
	loadedLevelSeed = randomseed;
	RandomGen = new RNG(loadedLevelSeed);
	forceRegenImages=true;
	ENGINE.titleScreen=false;
	ENGINE.titleMode=(GAME.curlevel>0||GAME.curlevelTarget!==null)?1:0;
	ENGINE.titleSelection=(GAME.curlevel>0||GAME.curlevelTarget!==null)?1:0;
	ENGINE.titleSelected=false;
    GAME.againing=false;
    if (leveldat===undefined) {
    	consolePrint("Trying to access a GAME.level that doesn't exist.",true);
    	return;
    }
    if (leveldat.message===undefined) {
    	ENGINE.titleMode=0;
    	ENGINE.textMode=false;
		GAME.level = leveldat.clone();
		RebuildLevelArrays();

	    backups=[]
	    restartTarget=backupLevel();

	    if ('run_rules_on_level_start' in state.metadata) {
			processInput(-1,true);
	    }
	} else {
		tryPlayShowMessageSound();
		drawMessageScreen();
    	canvasResize();
	}

	clearInputHistory();
}

export function loadLevelFromStateTarget(state,levelindex,target,randomseed) {
    var leveldat = target;
	GAME.curlevel=levelindex;
	GAME.curlevelTarget=target;
    if (leveldat.message===undefined) {
	    if (levelindex=== 0){
			tryPlayStartLevelSound();
		} else {
			tryPlayStartLevelSound();
		}
    }
    loadLevelFromLevelDat(state,state.levels[levelindex],randomseed);
    restoreLevel(target);
    restartTarget=target;
}

export function loadLevelFromState(state,levelindex,randomseed) {
    var leveldat = state.levels[levelindex];
	GAME.curlevel=levelindex;
	GAME.curlevelTarget=null;
    if (leveldat.message===undefined) {
	    if (levelindex=== 0){
			tryPlayStartLevelSound();
		} else {
			tryPlayStartLevelSound();
		}
    }
    loadLevelFromLevelDat(state,leveldat,randomseed);
}

var sprites = [
{
    color: '#423563',
    dat: [
        [1, 1, 1, 1, 1],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 1, 1, 1, 1]
    ]
},
{
    color: '#252342',
    dat: [
        [0, 0, 1, 0, 0],
        [1, 1, 1, 1, 1],
        [0, 0, 1, 0, 0],
        [0, 1, 1, 1, 0],
        [0, 1, 0, 1, 0]
    ]
}
];

export function init() {
	generateTitleScreen();
	canvasResize();
}

export function tryPlaySimpleSound(soundname) {
	if (ENGINE.state.sfx_Events[soundname]!==undefined) {
		var seed = ENGINE.state.sfx_Events[soundname];
		playSound(seed);
	}
}
export function tryPlayTitleSound() {
	tryPlaySimpleSound("titlescreen");
}

export function tryPlayStartGameSound() {
	tryPlaySimpleSound("startgame");
}

export function tryPlayEndGameSound() {
	tryPlaySimpleSound("endgame");
}

export function tryPlayStartLevelSound() {
	tryPlaySimpleSound("startlevel");
}

export function tryPlayEndLevelSound() {
	tryPlaySimpleSound("endlevel");
}

export function tryPlayUndoSound(){
	tryPlaySimpleSound("undo");
}

export function tryPlayRestartSound(){
	tryPlaySimpleSound("restart");
}

export function tryPlayShowMessageSound(){
	tryPlaySimpleSound("showmessage");
}

export function tryPlayCloseMessageSound(){
	tryPlaySimpleSound("closemessage");
}

var backups=[];
var restartTarget;

export function backupLevel() {
	var ret = {
		dat : new Int32Array(GAME.level.objects),
		width : GAME.level.width,
		height : GAME.level.height,
		oldflickscreendat: GAME.oldflickscreendat.concat([])
	};
	return ret;
}

export function setGameState(_state, command, randomseed) {
	GAME.oldflickscreendat=[];
	GAME.timer=0;
	GAME.autotick=0;
	GAME.winning=false;
	GAME.againing=false;
    GAME.messageselected=false;
    ENGINE.STRIDE_MOV=_state.STRIDE_MOV;
    ENGINE.STRIDE_OBJ=_state.STRIDE_OBJ;

	if (command===undefined) {
		command=["restart"];
	}
	if (ENGINE.state.levels.length===0 && command.length>0 && command[0]==="rebuild")  {
		command=["restart"];
	}
	if (randomseed===undefined) {
		randomseed=null;
	}
	RandomGen = new RNG(randomseed);

	ENGINE.state = _state;
    window.console.log('setting game state :D ');
    backups=[];
    //set sprites
    sprites = [];
    for (var n in ENGINE.state.objects) {
        if (ENGINE.state.objects.hasOwnProperty(n)) {
            var object = ENGINE.state.objects[n];
            var sprite = {
                colors: object.colors,
                dat: object.spritematrix
            };
            sprites[object.id] = sprite;
        }
    }
    if (ENGINE.state.metadata.realtime_interval!==undefined) {
    	GAME.autotick=0;
    	GAME.autotickinterval=ENGINE.state.metadata.realtime_interval*1000;
    } else {
    	GAME.autotick=0;
    	GAME.autotickinterval=0;
    }

    if (ENGINE.state.metadata.key_repeat_interval!==undefined) {
		GAME.repeatinterval=ENGINE.state.metadata.key_repeat_interval*1000;
    } else {
    	GAME.repeatinterval=150;
    }

    if (ENGINE.state.metadata.again_interval!==undefined) {
		GAME.againinterval=ENGINE.state.metadata.again_interval*1000;
    } else {
    	GAME.againinterval=150;
    }
    if (GAME.throttle_movement && GAME.autotickinterval===0) {
    	logWarning("GAME.throttle_movement is designed for use in conjunction with realtime_interval. Using it in other situations makes games gross and unresponsive, broadly speaking.  Please don't.");
    }
    GAME.norepeat_action = ENGINE.state.metadata.norepeat_action!==undefined;

    switch(command[0]){
    	case "restart":
    	{
		    GAME.winning=false;
		    GAME.timer=0;
		    ENGINE.titleScreen=true;
		    tryPlayTitleSound();
		    ENGINE.textMode=true;
		    ENGINE.titleSelection=(GAME.curlevel>0||GAME.curlevelTarget!==null)?1:0;
		    ENGINE.titleSelected=false;
		    GAME.quittingMessageScreen=false;
		    GAME.quittingTitleScreen=false;
		    GAME.messageselected=false;
		    ENGINE.titleMode = 0;
		    if ((GAME.curlevel>0||GAME.curlevelTarget!==null)) {
		    	ENGINE.titleMode=1;
		    }
		    generateTitleScreen();
		    break;
		}
		case "rebuild":
		{
			//do nothing
			break;
		}
		case "loadLevel":
		{
			var targetLevel = command[1];
			GAME.curlevel=i;
		    GAME.winning=false;
		    GAME.timer=0;
		    ENGINE.titleScreen=false;
		    ENGINE.textMode=false;
		    ENGINE.titleSelection=(GAME.curlevel>0||GAME.curlevelTarget!==null)?1:0;
		    ENGINE.titleSelected=false;
		    GAME.quittingMessageScreen=false;
		    GAME.quittingTitleScreen=false;
		    GAME.messageselected=false;
		    ENGINE.titleMode = 0;
			loadLevelFromState(ENGINE.state,targetLevel,randomseed);
			break;
		}
		case "levelline":
		{
			var targetLine = command[1];
			for (var i=ENGINE.state.levels.length-1;i>=0;i--) {
				var level= ENGINE.state.levels[i];
				if(level.lineNumber<=targetLine+1) {
					GAME.curlevel=i;
				    GAME.winning=false;
				    GAME.timer=0;
				    ENGINE.titleScreen=false;
				    ENGINE.textMode=false;
				    ENGINE.titleSelection=(GAME.curlevel>0||GAME.curlevelTarget!==null)?1:0;
				    ENGINE.titleSelected=false;
				    GAME.quittingMessageScreen=false;
				    GAME.quittingTitleScreen=false;
				    GAME.messageselected=false;
				    ENGINE.titleMode = 0;
					loadLevelFromState(ENGINE.state,i);
					break;
				}
			}
			break;
		}
	}

	if(command[0] !== "rebuild") {
		clearInputHistory();
	}
	canvasResize();



	if (DEBUG.canYoutube) {
		if ('youtube' in ENGINE.state.metadata) {
			var youtubeid=ENGINE.state.metadata['youtube'];
			var url = "https://youtube.googleapis.com/v/"+youtubeid+"?autoplay=1&loop=1&playlist="+youtubeid;
			ifrm = document.createElement("IFRAME");
			ifrm.setAttribute("src",url);
			ifrm.style.visibility="hidden";
			ifrm.style.width="500px";
			ifrm.style.height="500px";
			ifrm.style.position="absolute";
			ifrm.style.top="-1000px";
			ifrm.style.left="-1000px";
//			ifrm.style.display="none";
			document.body.appendChild(ifrm);
		}

		/*
		if ('youtube' in state.metadata) {
			var div_container = document.createElement('DIV');
			var div_front = document.createElement('DIV');
			div_front.style.zIndex=-100;
			div_front.style.backgroundColor=state.bgcolor;
			div_front.style.position= "absolute";
			div_front.style.width="500px";
			div_front.style.height="500px";
			var div_back = document.createElement('DIV');
			div_back.style.zIndex=-200;
			div_back.style.position= "absolute";

			div_container.appendChild(div_back);
			div_container.appendChild(div_front);

			var youtubeid=state.metadata['youtube'];
			var url = "https://youtube.googleapis.com/v/"+youtubeid+"?autoplay=1&loop=1&playlist="+youtubeid;
			ifrm = document.createElement("IFRAME");
			ifrm.setAttribute("src",url);
			ifrm.style.visibility="hidden";
			ifrm.style.width="500px";
			ifrm.style.height="500px";
			ifrm.frameBorder="0";
//			ifrm.style.display="none";

			div_back.appendChild(ifrm);
			document.body.appendChild(div_container);
			*/
	}

}

export function RebuildLevelArrays() {
	GAME.level.movements = new Int32Array(GAME.level.n_tiles * ENGINE.STRIDE_MOV);

    GAME.level.rigidMovementAppliedMask = [];
    GAME.level.rigidGroupIndexMask = [];
	GAME.level.rowCellContents = [];
	GAME.level.colCellContents = [];
	GAME.level.mapCellContents = new BitVec(ENGINE.STRIDE_OBJ);
	_movementsVec = new BitVec(ENGINE.STRIDE_MOV);

	_o1 = new BitVec(ENGINE.STRIDE_OBJ);
	_o2 = new BitVec(ENGINE.STRIDE_OBJ);
	_o2_5 = new BitVec(ENGINE.STRIDE_OBJ);
	_o3 = new BitVec(ENGINE.STRIDE_OBJ);
	_o4 = new BitVec(ENGINE.STRIDE_OBJ);
	_o5 = new BitVec(ENGINE.STRIDE_OBJ);
	_o6 = new BitVec(ENGINE.STRIDE_OBJ);
	_o7 = new BitVec(ENGINE.STRIDE_OBJ);
	_o8 = new BitVec(ENGINE.STRIDE_OBJ);
	_o9 = new BitVec(ENGINE.STRIDE_OBJ);
	_o10 = new BitVec(ENGINE.STRIDE_OBJ);
	_o11 = new BitVec(ENGINE.STRIDE_OBJ);
	_o12 = new BitVec(ENGINE.STRIDE_OBJ);
	_m1 = new BitVec(ENGINE.STRIDE_MOV);
	_m2 = new BitVec(ENGINE.STRIDE_MOV);
	_m3 = new BitVec(ENGINE.STRIDE_MOV);


    for (var i=0;i<GAME.level.height;i++) {
    	GAME.level.rowCellContents[i]=new BitVec(ENGINE.STRIDE_OBJ);
    }
    for (var i=0;i<GAME.level.width;i++) {
    	GAME.level.colCellContents[i]=new BitVec(ENGINE.STRIDE_OBJ);
    }

    for (var i=0;i<GAME.level.n_tiles;i++)
    {
        GAME.level.rigidMovementAppliedMask[i]=new BitVec(ENGINE.STRIDE_MOV);
        GAME.level.rigidGroupIndexMask[i]=new BitVec(ENGINE.STRIDE_MOV);
    }
}

export function restoreLevel(lev) {
	GAME.oldflickscreendat=lev.oldflickscreendat.concat([]);

	GAME.level.objects = new Int32Array(lev.dat);
	if (GAME.level.width !== lev.width || GAME.level.height !== lev.height) {
		GAME.level.width = lev.width;
		GAME.level.height = lev.height;
		GAME.level.n_tiles = lev.width * lev.height;
		RebuildLevelArrays();
		//regenerate all other stride-related stuff
	}
	else
	{
	// layercount doesn't change

		for (var i=0;i<GAME.level.n_tiles;i++) {
			GAME.level.movements[i]=0;
			GAME.level.rigidMovementAppliedMask[i]=0;
			GAME.level.rigidGroupIndexMask[i]=0;
		}

	    for (var i=0;i<GAME.level.height;i++) {
	    	var rcc = GAME.level.rowCellContents[i];
	    	rcc.setZero();
	    }
	    for (var i=0;i<GAME.level.width;i++) {
	    	var ccc = GAME.level.colCellContents[i];
	    	ccc.setZero();
	    }
	}

    GAME.againing=false;
    GAME.level.commandQueue=[];
}


export function DoRestart(force) {

	if (force!==true && ('norestart' in ENGINE.state.metadata)) {
		return;
	}
	if (force===false) {
		backups.push(backupLevel());
	}

	if (GAME.verbose_logging) {
		consolePrint("--- restarting ---",true);
	}

	restoreLevel(restartTarget);
	tryPlayRestartSound();

	if ('run_rules_on_level_start' in ENGINE.state.metadata) {
    	processInput(-1,true);
	}

	GAME.level.commandQueue=[];
}

export function DoUndo(force) {
	if ((!GAME.levelEditorOpened)&&('noundo' in ENGINE.state.metadata && force!==true)) {
		return;
	}
	if (GAME.verbose_logging) {
		consolePrint("--- undoing ---",true);
	}
	if (backups.length>0) {
		var tobackup = backups[backups.length-1];
		restoreLevel(tobackup);
		backups = backups.splice(0,backups.length-1);
		if (! force) {
			tryPlayUndoSound();
		}
	}
}

export function getPlayerPositions() {
    var result=[];
    var playerMask = ENGINE.state.playerMask;
    for (i=0;i<GAME.level.n_tiles;i++) {
        GAME.level.getCellInto(i,_o11);
        if (playerMask.anyBitsInCommon(_o11)) {
            result.push(i);
        }
    }
    return result;
}

export function getLayersOfMask(cellMask) {
    var layers=[];
    for (var i=0;i<ENGINE.state.objectCount;i++) {
        if (cellMask.get(i)) {
            var n = ENGINE.state.idDict[i];
            var o = ENGINE.state.objects[n];
            layers.push(o.layer)
        }
    }
    return layers;
}

export function moveEntitiesAtIndex(positionIndex, entityMask, dirMask) {
    var cellMask = GAME.level.getCell(positionIndex);
    cellMask.iand(entityMask);
    var layers = getLayersOfMask(cellMask);

    var movementMask = GAME.level.getMovements(positionIndex);
    for (var i=0;i<layers.length;i++) {
    	movementMask.ishiftor(dirMask, 5 * layers[i]);
    }
    GAME.level.setMovements(positionIndex, movementMask);
}


export function startMovement(dir) {
	var movedany=false;
    var playerPositions = getPlayerPositions();
    for (var i=0;i<playerPositions.length;i++) {
        var playerPosIndex = playerPositions[i];
        moveEntitiesAtIndex(playerPosIndex,ENGINE.state.playerMask,dir);
    }
    return playerPositions;
}

var dirMasksDelta = {
     1:[0,-1],//up
     2:[0,1],//'down'  :
     4:[-1,0],//'left'  :
     8:[1,0],//'right' :
     15:[0,0],//'?' :
     16:[0,0],//'action' :
     3:[0,0]//'no'
};

var dirMaskName = {
     1:'up',
     2:'down'  ,
     4:'left'  ,
     8:'right',
     15:'?' ,
     16:'action',
     3:'no'
};

var seedsToPlay_CanMove=[];
var seedsToPlay_CantMove=[];

export function repositionEntitiesOnLayer(positionIndex,layer,dirMask)
{
    var delta = dirMasksDelta[dirMask];

    var dx = delta[0];
    var dy = delta[1];
    var tx = ((positionIndex/GAME.level.height)|0);
    var ty = ((positionIndex%GAME.level.height));
    var maxx = GAME.level.width-1;
    var maxy = GAME.level.height-1;

    if ( (tx===0&&dx<0) || (tx===maxx&&dx>0) || (ty===0&&dy<0) || (ty===maxy&&dy>0)) {
    	return false;
    }

    var targetIndex = (positionIndex+delta[1]+delta[0]*GAME.level.height)%GAME.level.n_tiles;

    var layerMask = ENGINE.state.layerMasks[layer];
    var targetMask = GAME.level.getCellInto(targetIndex,_o7);
    var sourceMask = GAME.level.getCellInto(positionIndex,_o8);

    if (layerMask.anyBitsInCommon(targetMask) && (dirMask!=16)) {
        return false;
    }

	for (var i=0;i<ENGINE.state.sfx_MovementMasks.length;i++) {
		var o = ENGINE.state.sfx_MovementMasks[i];
		var objectMask = o.objectMask;
		if (objectMask.anyBitsInCommon(sourceMask)) {
			var movementMask = GAME.level.getMovements(positionIndex);
			var directionMask = o.directionMask;
			if (movementMask.anyBitsInCommon(directionMask) && seedsToPlay_CanMove.indexOf(o.seed)===-1) {
				seedsToPlay_CanMove.push(o.seed);
			}
		}
	}

    var movingEntities = sourceMask.clone();
    sourceMask.iclear(layerMask);
    movingEntities.iand(layerMask);
    targetMask.ior(movingEntities);

    GAME.level.setCell(positionIndex, sourceMask);
    GAME.level.setCell(targetIndex, targetMask);

    var colIndex=(targetIndex/GAME.level.height)|0;
	var rowIndex=(targetIndex%GAME.level.height);
    GAME.level.colCellContents[colIndex].ior(movingEntities);
    GAME.level.rowCellContents[rowIndex].ior(movingEntities);
    GAME.level.mapCellContents.ior(layerMask);
    return true;
}

export function repositionEntitiesAtCell(positionIndex) {
    var movementMask = GAME.level.getMovements(positionIndex);
    if (movementMask.iszero())
        return false;

    var moved=false;
    for (var layer=0;layer<GAME.level.layerCount;layer++) {
        var layerMovement = movementMask.getshiftor(0x1f, 5*layer);
        if (layerMovement!==0) {
            var thismoved = repositionEntitiesOnLayer(positionIndex,layer,layerMovement);
            if (thismoved) {
                movementMask.ishiftclear(layerMovement, 5*layer);
                moved = true;
            }
        }
    }

   	GAME.level.setMovements(positionIndex, movementMask);

    return moved;
}


export function Level(lineNumber, width, height, layerCount, objects) {
	this.lineNumber = lineNumber;
	this.width = width;
	this.height = height;
	this.n_tiles = width * height;
	this.objects = objects;
	this.layerCount = layerCount;
	this.commandQueue = [];
}

Level.prototype.clone = function() {
	var clone = new Level(this.lineNumber, this.width, this.height, this.layerCount, null);
	clone.objects = new Int32Array(this.objects);
	return clone;
}

Level.prototype.getCell = function(index) {
	return new BitVec(this.objects.subarray(index * ENGINE.STRIDE_OBJ, index * ENGINE.STRIDE_OBJ + ENGINE.STRIDE_OBJ));
}

Level.prototype.getCellInto = function(index,targetarray) {
	for (var i=0;i<ENGINE.STRIDE_OBJ;i++) {
		targetarray.data[i]=this.objects[index*ENGINE.STRIDE_OBJ+i];
	}
	return targetarray;
}

Level.prototype.setCell = function(index, vec) {
	for (var i = 0; i < vec.data.length; ++i) {
		this.objects[index * ENGINE.STRIDE_OBJ + i] = vec.data[i];
	}
}

var _movementsVec;

Level.prototype.getMovements = function(index) {
	for (var i=0;i<ENGINE.STRIDE_MOV;i++) {
		_movementsVec.data[i]=this.movements[index*ENGINE.STRIDE_MOV+i];
	}
	return _movementsVec;
}

Level.prototype.setMovements = function(index, vec) {
	for (var i = 0; i < vec.data.length; ++i) {
		this.movements[index * ENGINE.STRIDE_MOV + i] = vec.data[i];
	}
}

var ellipsisPattern = ['ellipsis'];

export function BitVec(init) {
	this.data = new Int32Array(init);
	return this;
}

BitVec.prototype.cloneInto = function(target) {
	for (var i=0;i<this.data.length;++i) {
		target.data[i]=this.data[i];
	}
	return target;
}
BitVec.prototype.clone = function() {
	return new BitVec(this.data);
}

BitVec.prototype.iand = function(other) {
	for (var i = 0; i < this.data.length; ++i) {
		this.data[i] &= other.data[i];
	}
}

BitVec.prototype.ior = function(other) {
	for (var i = 0; i < this.data.length; ++i) {
		this.data[i] |= other.data[i];
	}
}

BitVec.prototype.iclear = function(other) {
	for (var i = 0; i < this.data.length; ++i) {
		this.data[i] &= ~other.data[i];
	}
}

BitVec.prototype.ibitset = function(ind) {
	this.data[ind>>5] |= 1 << (ind & 31);
}

BitVec.prototype.ibitclear = function(ind) {
	this.data[ind>>5] &= ~(1 << (ind & 31));
}

BitVec.prototype.get = function(ind) {
	return (this.data[ind>>5] & 1 << (ind & 31)) !== 0;
}

BitVec.prototype.getshiftor = function(mask, shift) {
	var toshift = shift & 31;
	var ret = this.data[shift>>5] >>> (toshift);
	if (toshift) {
		ret |= this.data[(shift>>5)+1] << (32 - toshift);
	}
	return ret & mask;
}

BitVec.prototype.ishiftor = function(mask, shift) {
	var toshift = shift&31;
	var low = mask << toshift;
	this.data[shift>>5] |= low;
	if (toshift) {
		var high = mask >> (32 - toshift);
		this.data[(shift>>5)+1] |= high;
	}
}

BitVec.prototype.ishiftclear = function(mask, shift) {
	var toshift = shift & 31;
	var low = mask << toshift;
	this.data[shift>>5] &= ~low;
	if (toshift){
		var high = mask >> (32 - (shift & 31));
		this.data[(shift>>5)+1] &= ~high;
	}
}

BitVec.prototype.equals = function(other) {
	if (this.data.length !== other.data.length)
		return false;
	for (var i = 0; i < this.data.length; ++i) {
		if (this.data[i] !== other.data[i])
			return false;
	}
	return true;
}

BitVec.prototype.setZero = function() {
	for (var i = 0; i < this.data.length; ++i) {
		this.data[i]=0;
	}
}

BitVec.prototype.iszero = function() {
	for (var i = 0; i < this.data.length; ++i) {
		if (this.data[i])
			return false;
	}
	return true;
}

BitVec.prototype.bitsSetInArray = function(arr) {
	for (var i = 0; i < this.data.length; ++i) {
		if ((this.data[i] & arr[i]) !== this.data[i]) {
			return false;
		}
	}
	return true;
}

BitVec.prototype.bitsClearInArray = function(arr) {
	for (var i = 0; i < this.data.length; ++i) {
		if (this.data[i] & arr[i]) {
			return false;
		}
	}
	return true;
}

BitVec.prototype.anyBitsInCommon = function(other) {
	return !this.bitsClearInArray(other.data);
}

export function Rule(rule) {
	this.direction = rule[0]; 		/* direction rule scans in */
	this.patterns = rule[1];		/* lists of CellPatterns to match */
	this.hasReplacements = rule[2];
	this.lineNumber = rule[3];		/* rule source for debugging */
	this.isEllipsis = rule[4];		/* true if pattern has ellipsis */
	this.groupNumber = rule[5];		/* execution group number of rule */
	this.isRigid = rule[6];
	this.commands = rule[7];		/* cancel, restart, sfx, etc */
	this.isRandom = rule[8];
	this.cellRowMasks = rule[9];
	this.cellRowMatches = [];
	for (var i=0;i<this.patterns.length;i++) {
		this.cellRowMatches.push(this.generateCellRowMatchesFunction(this.patterns[i],this.isEllipsis[i]));
	}
	/* TODO: eliminate isRigid, groupNumber, isRandom
	from this class by moving them up into a RuleGroup class */
}


Rule.prototype.generateCellRowMatchesFunction = function(cellRow,hasEllipsis)  {
	if (hasEllipsis==false) {
		var delta = dirMasksDelta[this.direction];
		var d0 = delta[0];
		var d1 = delta[1];
		var cr_l = cellRow.length;

			/*
			hard substitute in the first one - if I substitute in all of them, firefox chokes.
			*/
		var fn = "var d = "+d1+"+"+d0+"*GAME_dot_level.height;\n";
		var mul = ENGINE.STRIDE_OBJ === 1 ? '' : '*'+ENGINE.STRIDE_OBJ;
		for (var i = 0; i < ENGINE.STRIDE_OBJ; ++i) {
			fn += 'var cellObjects' + i + ' = GAME_dot_level.objects[i' + mul + (i ? '+'+i: '') + '];\n';
		}
		mul = ENGINE.STRIDE_MOV === 1 ? '' : '*'+ENGINE.STRIDE_MOV;
		for (var i = 0; i < ENGINE.STRIDE_MOV; ++i) {
			fn += 'var cellMovements' + i + ' = GAME_dot_level.movements[i' + mul + (i ? '+'+i: '') + '];\n';
		}
		fn += "return "+cellRow[0].generateMatchString('0_');// cellRow[0].matches(i)";
		for (var cellIndex=1;cellIndex<cr_l;cellIndex++) {
			fn+="&&cellRow["+cellIndex+"].matches(GAME_dot_level, (i+"+cellIndex+"*d)%GAME_dot_level.n_tiles)";
		}
		fn+=";";

		if (fn in matchCache) {
			return matchCache[fn];
		}
		//console.log(fn.replace(/\s+/g, ' '));
		return matchCache[fn] = new Function("GAME_dot_level","cellRow","i",fn);
	} else {
		var delta = dirMasksDelta[this.direction];
		var d0 = delta[0];
		var d1 = delta[1];
		var cr_l = cellRow.length;

		var fn = "var d = "+d1+"+"+d0+"*GAME_dot_level.height;\n";
		fn += "var result = [];\n"
		fn += "if(cellRow[0].matches(GAME_dot_level, i)";
		var cellIndex=1;
		for (;cellRow[cellIndex]!==ellipsisPattern;cellIndex++) {
			fn+="&&cellRow["+cellIndex+"].matches(GAME_dot_level, (i+"+cellIndex+"*d)%GAME_dot_level.n_tiles)";
		}
		cellIndex++;
		fn+=") {\n";
		fn+="\tfor (var k=kmin;k<kmax;k++) {\n"
		fn+="\t\tif(cellRow["+cellIndex+"].matches(GAME_dot_level,(i+d*(k+"+(cellIndex-1)+"))%GAME_dot_level.n_tiles)";
		cellIndex++;
		for (;cellIndex<cr_l;cellIndex++) {
			fn+="&&cellRow["+cellIndex+"].matches(GAME_dot_level,(i+d*(k+"+(cellIndex-1)+"))%GAME_dot_level.n_tiles)";
		}
		fn+="){\n";
		fn+="\t\t\tresult.push([i,k]);\n";
		fn+="\t\t}\n"
		fn+="\t}\n";
		fn+="}\n";
		fn+="return result;"


		if (fn in matchCache) {
			return matchCache[fn];
		}
		//console.log(fn.replace(/\s+/g, ' '));
		return matchCache[fn] = new Function("GAME_dot_level","cellRow","i","kmax","kmin", fn);
	}
//say cellRow has length 3, with a split in the middle
/*
export function cellRowMatchesWildcardFunctionGenerate(direction,cellRow,i, maxk, mink) {

	var result = [];
	var matchfirsthalf = cellRow[0].matches(i);
	if (matchfirsthalf) {
		for (var k=mink;k<maxk;k++) {
			if (cellRow[2].matches((i+d*(k+0))%GAME.level.n_tiles)) {
				result.push([i,k]);
			}
		}
	}
	return result;
}
*/


}


Rule.prototype.toJSON = function() {
	/* match construction order for easy deserialization */
	return [
		this.direction, this.patterns, this.hasReplacements, this.lineNumber, this.isEllipsis,
		this.groupNumber, this.isRigid, this.commands, this.isRandom, this.cellRowMasks
	];
};


export function CellPattern(row) {
	this.objectsPresent = row[0];
	this.objectsMissing = row[1];
	this.anyObjectsPresent = row[2];
	this.movementsPresent = row[3];
	this.movementsMissing = row[4];
	this.matches = this.generateMatchFunction(GAME.level);
	this.replacement = row[5];
};

export function CellReplacement(row) {
	this.objectsClear = row[0];
	this.objectsSet = row[1];
	this.movementsClear = row[2];
	this.movementsSet = row[3];
	this.movementsLayerMask = row[4];
	this.randomEntityMask = row[5];
	this.randomDirMask = row[6];
};


var matchCache = {};



CellPattern.prototype.generateMatchString = function() {
	var fn = "(true";
	for (var i = 0; i < Math.max(ENGINE.STRIDE_OBJ, ENGINE.STRIDE_MOV); ++i) {
		var co = 'cellObjects' + i;
		var cm = 'cellMovements' + i;
		var op = this.objectsPresent.data[i];
		var om = this.objectsMissing.data[i];
		var mp = this.movementsPresent.data[i];
		var mm = this.movementsMissing.data[i];
		if (op) {
			if (op&(op-1))
				fn += '\t\t&& ((' + co + '&' + op + ')===' + op + ')\n';
			else
				fn += '\t\t&& (' + co + '&' + op + ')\n';
		}
		if (om)
			fn += '\t\t&& !(' + co + '&' + om + ')\n';
		if (mp) {
			if (mp&(mp-1))
				fn += '\t\t&& ((' + cm + '&' + mp + ')===' + mp + ')\n';
			else
				fn += '\t\t&& (' + cm + '&' + mp + ')\n';
		}
		if (mm)
			fn += '\t\t&& !(' + cm + '&' + mm + ')\n';
	}
	for (var j = 0; j < this.anyObjectsPresent.length; j++) {
		fn += "\t\t&& (0";
		for (var i = 0; i < ENGINE.STRIDE_OBJ; ++i) {
			var aop = this.anyObjectsPresent[j].data[i];
			if (aop)
				fn += "|(cellObjects" + i + "&" + aop + ")";
		}
		fn += ")";
	}
	fn += '\t)';
	return fn;
}

CellPattern.prototype.generateMatchFunction = function() {
	var i;
	var fn = '';
	var mul = ENGINE.STRIDE_OBJ === 1 ? '' : '*'+ENGINE.STRIDE_OBJ;
	for (var i = 0; i < ENGINE.STRIDE_OBJ; ++i) {
		fn += '\tvar cellObjects' + i + ' = GAME_dot_level.objects[i' + mul + (i ? '+'+i: '') + '];\n';
	}
	mul = ENGINE.STRIDE_MOV === 1 ? '' : '*'+ENGINE.STRIDE_MOV;
	for (var i = 0; i < ENGINE.STRIDE_MOV; ++i) {
		fn += '\tvar cellMovements' + i + ' = GAME_dot_level.movements[i' + mul + (i ? '+'+i: '') + '];\n';
	}
	fn += "return " + this.generateMatchString()+';';
	if (fn in matchCache) {
		return matchCache[fn];
	}
	//console.log(fn.replace(/\s+/g, ' '));
	return matchCache[fn] = new Function("GAME_dot_level","i",fn);
}

CellPattern.prototype.toJSON = function() {
	return [
		this.movementMask, this.cellMask, this.nonExistenceMask,
		this.moveNonExistenceMask, this.moveStationaryMask, this.randomDirOrEntityMask,
		this.movementsToRemove
	];
};

var _o1,_o2,_o2_5,_o3,_o4,_o5,_o6,_o7,_o8,_o9,_o10,_o11,_o12;
var _m1,_m2,_m3;

CellPattern.prototype.replace = function(rule, currentIndex) {
	var replace = this.replacement;

	if (replace === null) {
		return false;
	}

	var replace_RandomEntityMask = replace.randomEntityMask;
	var replace_RandomDirMask = replace.randomDirMask;

	var objectsSet = replace.objectsSet.cloneInto(_o1);
	var objectsClear = replace.objectsClear.cloneInto(_o2);

	var movementsSet = replace.movementsSet.cloneInto(_m1);
	var movementsClear = replace.movementsClear.cloneInto(_m2);
	movementsClear.ior(replace.movementsLayerMask);

	if (!replace_RandomEntityMask.iszero()) {
		var choices=[];
		for (var i=0;i<32*ENGINE.STRIDE_OBJ;i++) {
			if (replace_RandomEntityMask.get(i)) {
				choices.push(i);
			}
		}
		var rand = choices[Math.floor(RandomGen.uniform() * choices.length)];
		var n = ENGINE.state.idDict[rand];
		var o = ENGINE.state.objects[n];
		objectsSet.ibitset(rand);
		objectsClear.ior(ENGINE.state.layerMasks[o.layer]);
		movementsClear.ishiftor(0x1f, 5 * o.layer);
	}
	if (!replace_RandomDirMask.iszero()) {
		for (var layerIndex=0;layerIndex<GAME.level.layerCount;layerIndex++){
			if (replace_RandomDirMask.get(5*layerIndex)) {
				var randomDir = Math.floor(RandomGen.uniform()*4);
				movementsSet.ibitset(randomDir + 5 * layerIndex);
			}
		}
	}

	var curCellMask = GAME.level.getCellInto(currentIndex,_o2_5);
	var curMovementMask = GAME.level.getMovements(currentIndex);

	var oldCellMask = curCellMask.cloneInto(_o3);
	var oldMovementMask = curMovementMask.cloneInto(_m3);

	curCellMask.iclear(objectsClear);
	curCellMask.ior(objectsSet);

	curMovementMask.iclear(movementsClear);
	curMovementMask.ior(movementsSet);

	var rigidchange=false;
	var curRigidGroupIndexMask =0;
	var curRigidMovementAppliedMask =0;
	if (rule.isRigid) {
		var rigidGroupIndex = ENGINE.state.groupNumber_to_RigidGroupIndex[rule.groupNumber];
		rigidGroupIndex++;//don't forget to -- it when decoding :O
		var rigidMask = new BitVec(ENGINE.STRIDE_MOV);
		for (var layer = 0; layer < GAME.level.layerCount; layer++) {
			rigidMask.ishiftor(rigidGroupIndex, layer * 5);
		}
		rigidMask.iand(replace.movementsLayerMask);
		curRigidGroupIndexMask = GAME.level.rigidGroupIndexMask[currentIndex] || new BitVec(ENGINE.STRIDE_MOV);
		curRigidMovementAppliedMask = GAME.level.rigidMovementAppliedMask[currentIndex] || new BitVec(ENGINE.STRIDE_MOV);

		if (!rigidMask.bitsSetInArray(curRigidGroupIndexMask.data) &&
			!replace.movementsLayerMask.bitsSetInArray(curRigidMovementAppliedMask.data) ) {
			curRigidGroupIndexMask.ior(rigidMask);
			curRigidMovementAppliedMask.ior(replace.movementsLayerMask);
			rigidchange=true;

		}
	}

	var result = false;

	//check if it's changed
	if (!oldCellMask.equals(curCellMask) || !oldMovementMask.equals(curMovementMask) || rigidchange) {
		result=true;
		if (rigidchange) {
			GAME.level.rigidGroupIndexMask[currentIndex] = curRigidGroupIndexMask;
			GAME.level.rigidMovementAppliedMask[currentIndex] = curRigidMovementAppliedMask;
		}

		var created = curCellMask.cloneInto(_o4);
		created.iclear(oldCellMask);
		sfxCreateMask.ior(created);
		var destroyed = oldCellMask.cloneInto(_o5);
		destroyed.iclear(curCellMask);
		sfxDestroyMask.ior(destroyed);

		GAME.level.setCell(currentIndex, curCellMask);
		GAME.level.setMovements(currentIndex, curMovementMask);

		var colIndex=(currentIndex/GAME.level.height)|0;
		var rowIndex=(currentIndex%GAME.level.height);
		GAME.level.colCellContents[colIndex].ior(curCellMask);
		GAME.level.rowCellContents[rowIndex].ior(curCellMask);
		GAME.level.mapCellContents.ior(curCellMask);
	}

	return result;
}


//say cellRow has length 5, with a split in the middle
/*
export function cellRowMatchesWildcardFunctionGenerate(direction,cellRow,i, maxk, mink) {

	var result = [];
	var matchfirsthalf = cellRow[0].matches(i)&&cellRow[1].matches((i+d)%GAME.level.n_tiles);
	if (matchfirsthalf) {
		for (var k=mink,kmaxk;k++) {
			if (cellRow[2].matches((i+d*(k+0))%GAME.level.n_tiles)&&cellRow[2].matches((i+d*(k+1))%GAME.level.n_tiles)) {
				result.push([i,k]);
			}
		}
	}
	return result;
}
*/

export function DoesCellRowMatchWildCard(direction,cellRow,i,maxk,mink) {
	if (mink === undefined) {
		mink = 0;
	}

	var cellPattern = cellRow[0];

    //var result=[];

    if (cellPattern.matches(GAME.level, i)){
    	var delta = dirMasksDelta[direction];
    	var d0 = delta[0]*GAME.level.height;
		var d1 = delta[1];
        var targetIndex = i;

        for (var j=1;j<cellRow.length;j+=1) {
            targetIndex = (targetIndex+d1+d0)%GAME.level.n_tiles;

            var cellPattern = cellRow[j]
            if (cellPattern === ellipsisPattern) {
            	//BAM inner loop time
            	for (var k=mink;k<maxk;k++) {
            		var targetIndex2=targetIndex;
                    targetIndex2 = (targetIndex2+(d1+d0)*(k)+GAME.level.n_tiles)%GAME.level.n_tiles;
            		for (var j2=j+1;j2<cellRow.length;j2++) {
		                cellPattern = cellRow[j2];
					    if (!cellPattern.matches(GAME.level, targetIndex2)) {
					    	break;
					    }
                        targetIndex2 = (targetIndex2+d1+d0)%GAME.level.n_tiles;
            		}

		            if (j2>=cellRow.length) {
		            	return true;
		                //result.push([i,k]);
		            }
            	}
            	break;
            } else if (!cellPattern.matches(GAME.level, targetIndex)) {
				break;
            }
        }
    }
    return false;
}

//say cellRow has length 3
/*
CellRow Matches can be specialized to look something like:
export function cellRowMatchesFunctionGenerate(direction,cellRow,i) {
	var delta = dirMasksDelta[direction];
	var d = delta[1]+delta[0]*GAME.level.height;
	return cellRow[0].matches(i)&&cellRow[1].matches((i+d)%GAME.level.n_tiles)&&cellRow[2].matches((i+2*d)%GAME.level.n_tiles);
}
*/

export function DoesCellRowMatch(direction,cellRow,i,k) {
	var cellPattern = cellRow[0];
    if (cellPattern.matches(GAME.level, i)) {

	    var delta = dirMasksDelta[direction];
	    var d0 = delta[0]*GAME.level.height;
		var d1 = delta[1];
		var cr_l = cellRow.length;

        var targetIndex = i;
        for (var j=1;j<cr_l;j++) {
            targetIndex = (targetIndex+d1+d0)%GAME.level.n_tiles;
            cellPattern = cellRow[j];
			if (cellPattern === ellipsisPattern) {
					//only for once off verifications
            	targetIndex = (targetIndex+(d1+d0)*k)%GAME.level.n_tiles;
            }
		    if (!cellPattern.matches(GAME.level, targetIndex)) {
                break;
            }
        }

        if (j>=cellRow.length) {
            return true;
        }

    }
    return false;
}

export function matchCellRow(direction, cellRowMatch, cellRow, cellRowMask) {
	var result=[];

	if ((!cellRowMask.bitsSetInArray(GAME.level.mapCellContents.data))) {
		return result;
	}

	var xmin=0;
	var xmax=GAME.level.width;
	var ymin=0;
	var ymax=GAME.level.height;

    var len=cellRow.length;

    switch(direction) {
    	case 1://up
    	{
    		ymin+=(len-1);
    		break;
    	}
    	case 2: //down
    	{
			ymax-=(len-1);
			break;
    	}
    	case 4: //left
    	{
    		xmin+=(len-1);
    		break;
    	}
    	case 8: //right
		{
			xmax-=(len-1);
			break;
		}
    	default:
    	{
    		window.console.log("EEEP "+direction);
    	}
    }

    var horizontal=direction>2;
    if (horizontal) {
		for (var y=ymin;y<ymax;y++) {
			if (!cellRowMask.bitsSetInArray(GAME.level.rowCellContents[y].data)) {
				continue;
			}

			for (var x=xmin;x<xmax;x++) {
				var i = x*GAME.level.height+y;
				if (cellRowMatch(GAME.level, cellRow,i))
				{
					result.push(i);
				}
			}
		}
	} else {
		for (var x=xmin;x<xmax;x++) {
			if (!cellRowMask.bitsSetInArray(GAME.level.colCellContents[x].data)) {
				continue;
			}

			for (var y=ymin;y<ymax;y++) {
				var i = x*GAME.level.height+y;
				if (cellRowMatch(GAME.level,	cellRow,i))
				{
					result.push(i);
				}
			}
		}
	}

	return result;
}


export function matchCellRowWildCard(direction, cellRowMatch, cellRow,cellRowMask) {
	var result=[];
	if ((!cellRowMask.bitsSetInArray(GAME.level.mapCellContents.data))) {
		return result;
	}
	var xmin=0;
	var xmax=GAME.level.width;
	var ymin=0;
	var ymax=GAME.level.height;

	var len=cellRow.length-1;//remove one to deal with wildcard
    switch(direction) {
    	case 1://up
    	{
    		ymin+=(len-1);
    		break;
    	}
    	case 2: //down
    	{
			ymax-=(len-1);
			break;
    	}
    	case 4: //left
    	{
    		xmin+=(len-1);
    		break;
    	}
    	case 8: //right
		{
			xmax-=(len-1);
			break;
		}
    	default:
    	{
    		window.console.log("EEEP2 "+direction);
    	}
    }



    var horizontal=direction>2;
    if (horizontal) {
		for (var y=ymin;y<ymax;y++) {
			if (!cellRowMask.bitsSetInArray(GAME.level.rowCellContents[y].data)) {
				continue;
			}

			for (var x=xmin;x<xmax;x++) {
				var i = x*GAME.level.height+y;
				var kmax;

				if (direction === 4) { //left
					kmax=x-len+2;
				} else if (direction === 8) { //right
					kmax=GAME.level.width-(x+len)+1;
				} else {
					window.console.log("EEEP2 "+direction);
				}

				result.push.apply(result, cellRowMatch(GAME.level, cellRow,i,kmax,0));
			}
		}
	} else {
		for (var x=xmin;x<xmax;x++) {
			if (!cellRowMask.bitsSetInArray(GAME.level.colCellContents[x].data)) {
				continue;
			}

			for (var y=ymin;y<ymax;y++) {
				var i = x*GAME.level.height+y;
				var kmax;

				if (direction === 2) { // down
					kmax=GAME.level.height-(y+len)+1;
				} else if (direction === 1) { // up
					kmax=y-len+2;
				} else {
					window.console.log("EEEP2 "+direction);
				}
				result.push.apply(result, cellRowMatch(GAME.level, cellRow,i,kmax,0));
			}
		}
	}

	return result;
}

export function generateTuples(lists) {
    var tuples=[[]];

    for (var i=0;i<lists.length;i++)
    {
        var row = lists[i];
        var newtuples=[];
        for (var j=0;j<row.length;j++) {
            var valtoappend = row[j];
            for (var k=0;k<tuples.length;k++) {
                var tuple=tuples[k];
                var newtuple = tuple.concat([valtoappend]);
                newtuples.push(newtuple);
            }
        }
        tuples=newtuples;
    }
    return tuples;
}

var rigidBackups=[]

export function commitPreservationState(ruleGroupIndex) {
	var propagationState = {
		ruleGroupIndex:ruleGroupIndex,
		//don't need to know the tuple index
		objects:new Int32Array(GAME.level.objects),
		movements:new Int32Array(GAME.level.movements),
		rigidGroupIndexMask:GAME.level.rigidGroupIndexMask.concat([]),
		rigidMovementAppliedMask:GAME.level.rigidMovementAppliedMask.concat([]),
		bannedGroup:GAME.level.bannedGroup.concat([])
	};
	rigidBackups[ruleGroupIndex]=propagationState;
	return propagationState;
}

export function restorePreservationState(preservationState) {
//don't need to concat or anythign here, once something is restored it won't be used again.
	GAME.level.objects = new Int32Array(preservationState.objects);
	GAME.level.movements = new Int32Array(preservationState.movements);
	GAME.level.rigidGroupIndexMask = preservationState.rigidGroupIndexMask.concat([]);
    GAME.level.rigidMovementAppliedMask = preservationState.rigidMovementAppliedMask.concat([]);
    sfxCreateMask=new BitVec(ENGINE.STRIDE_OBJ);
    sfxDestroyMask=new BitVec(ENGINE.STRIDE_OBJ);
//	rigidBackups = preservationState.rigidBackups;
}

Rule.prototype.findMatches = function() {
	var matches=[];
	var cellRowMasks=this.cellRowMasks;
    for (var cellRowIndex=0;cellRowIndex<this.patterns.length;cellRowIndex++) {
        var cellRow = this.patterns[cellRowIndex];
        var matchFunction = this.cellRowMatches[cellRowIndex];
        if (this.isEllipsis[cellRowIndex]) {//if ellipsis
        	var match = matchCellRowWildCard(this.direction,matchFunction,cellRow,cellRowMasks[cellRowIndex]);
        } else {
        	var match = matchCellRow(this.direction,matchFunction,cellRow,cellRowMasks[cellRowIndex]);
        }
        if (match.length===0) {
            return [];
        } else {
            matches.push(match);
        }
    }
    return matches;
};

Rule.prototype.applyAt = function(delta,tuple,check) {
	var rule = this;
	//have to double check they apply
	//Q: why?
    if (check) {
        var ruleMatches=true;
        for (var cellRowIndex=0;cellRowIndex<rule.patterns.length;cellRowIndex++) {
        	if (rule.isEllipsis[cellRowIndex]) {//if ellipsis
            	if (DoesCellRowMatchWildCard(rule.direction,rule.patterns[cellRowIndex],tuple[cellRowIndex][0],
            		tuple[cellRowIndex][1]+1, tuple[cellRowIndex][1])===false) { /* pass mink to specify */
                    ruleMatches=false;
                    break;
                }
        	} else {
            	if (DoesCellRowMatch(rule.direction,rule.patterns[cellRowIndex],tuple[cellRowIndex])===false) {
                    ruleMatches=false;
                    break;
                }
        	}
        }
        if (ruleMatches === false ) {
            return false;
        }
    }
    var result=false;

    //APPLY THE RULE
    var d0 = delta[0]*GAME.level.height;
    var d1 = delta[1];
    for (var cellRowIndex=0;cellRowIndex<rule.patterns.length;cellRowIndex++) {
        var preRow = rule.patterns[cellRowIndex];

        var currentIndex = rule.isEllipsis[cellRowIndex] ? tuple[cellRowIndex][0] : tuple[cellRowIndex];
        for (var cellIndex=0;cellIndex<preRow.length;cellIndex++) {
            var preCell = preRow[cellIndex];

            if (preCell === ellipsisPattern) {
            	var k = tuple[cellRowIndex][1];
            	currentIndex = (currentIndex+(d1+d0)*k)%GAME.level.n_tiles;
            	continue;
            }

            result = preCell.replace(rule, currentIndex) || result;

            currentIndex = (currentIndex+d1+d0)%GAME.level.n_tiles;
        }
    }

	if (GAME.verbose_logging && result){
		var ruleDirection = dirMaskName[rule.direction];
		var logString = '<font color="green">Rule <a onclick="jumpToLine(' + rule.lineNumber + ');"  href="javascript:void(0);">' + rule.lineNumber + '</a> ' +
			ruleDirection + ' applied.</font>';
		consolePrint(logString);
	}

    return result;
};

Rule.prototype.tryApply = function() {
	var delta = dirMasksDelta[this.direction];

    //get all cellrow matches
    var matches = this.findMatches();
    if (matches.length===0) {
    	return false;
    }

    var result=false;
	if (this.hasReplacements) {
	    var tuples = generateTuples(matches);
	    for (var tupleIndex=0;tupleIndex<tuples.length;tupleIndex++) {
	        var tuple = tuples[tupleIndex];
	        var shouldCheck=tupleIndex>0;
	        var success = this.applyAt(delta,tuple,shouldCheck);
	        result = success || result;
	    }
	}

    if (matches.length>0) {
    	this.queueCommands();
    }
    return result;
};

Rule.prototype.queueCommands = function() {
	var commands = this.commands;
	for(var i=0;i<commands.length;i++) {
		var command=commands[i];
		var already=false;
		if (GAME.level.commandQueue.indexOf(command[0])>=0) {
			continue;
		}
		GAME.level.commandQueue.push(command[0]);

		if (GAME.verbose_logging){
			var lineNumber = this.lineNumber;
			var ruleDirection = dirMaskName[this.direction];
			var logString = '<font color="green">Rule <a onclick="jumpToLine(' + lineNumber.toString() + ');"  href="javascript:void(0);">' + lineNumber.toString() + '</a> triggers command '+command[0]+'.</font>';
			consolePrint(logString);
		}

		if (command[0]==='message') {
			ENGINE.messagetext=command[1];
		}
	}
};

export function showTempMessage() {
	GAME.keybuffer=[];
	ENGINE.textMode=true;
	ENGINE.titleScreen=false;
	GAME.quittingMessageScreen=false;
	GAME.messageselected=false;
	tryPlayShowMessageSound();
	drawMessageScreen();
	canvasResize();
}

export function applyRandomRuleGroup(ruleGroup) {
	var propagated=false;

	var matches=[];
	for (var ruleIndex=0;ruleIndex<ruleGroup.length;ruleIndex++) {
		var rule=ruleGroup[ruleIndex];
		var ruleMatches = rule.findMatches();
		if (ruleMatches.length>0) {
	    	var tuples  = generateTuples(ruleMatches);
	    	for (var j=0;j<tuples.length;j++) {
	    		var tuple=tuples[j];
				matches.push([ruleIndex,tuple]);
	    	}
		}
	}

	if (matches.length===0)
	{
		return false;
	}

	var match = matches[Math.floor(RandomGen.uniform()*matches.length)];
	var ruleIndex=match[0];
	var rule=ruleGroup[ruleIndex];
	var delta = dirMasksDelta[rule.direction];
	var tuple=match[1];
	var check=false;
	var modified = rule.applyAt(delta,tuple,check);

   	rule.queueCommands();

	return modified;
}

export function applyRuleGroup(ruleGroup) {
	if (ruleGroup[0].isRandom) {
		return applyRandomRuleGroup(ruleGroup);
	}

	var loopPropagated=false;
    var propagated=true;
    var loopcount=0;
    while(propagated) {
    	loopcount++;
    	if (loopcount>200)
    	{
    		logErrorCacheable("Got caught looping lots in a rule group :O",ruleGroup[0].lineNumber,true);
    		break;
    	}
        propagated=false;
        for (var ruleIndex=0;ruleIndex<ruleGroup.length;ruleIndex++) {
            var rule = ruleGroup[ruleIndex];
            propagated = rule.tryApply() || propagated;
        }
        if (propagated) {
        	loopPropagated=true;
        }
    }

    return loopPropagated;
}

export function applyRules(rules, loopPoint, startRuleGroupindex, bannedGroup){
    //for each rule
    //try to match it

    //when we're going back in, let's loop, to be sure to be sure
    var loopPropagated = startRuleGroupindex>0;
    var loopCount = 0;
    for (var ruleGroupIndex=startRuleGroupindex;ruleGroupIndex<rules.length;) {
    	if (bannedGroup && bannedGroup[ruleGroupIndex]) {
    		//do nothing
    	} else {
    		var ruleGroup=rules[ruleGroupIndex];
			loopPropagated = applyRuleGroup(ruleGroup) || loopPropagated;
	    }
        if (loopPropagated && loopPoint[ruleGroupIndex]!==undefined) {
        	ruleGroupIndex = loopPoint[ruleGroupIndex];
        	loopPropagated=false;
        	loopCount++;
			if (loopCount > 200) {
    			var ruleGroup=rules[ruleGroupIndex];
			   	logErrorCacheable("got caught in an endless startloop...endloop vortex, escaping!", ruleGroup[0].lineNumber,true);
			   	break;
			}
        } else {
        	ruleGroupIndex++;
        	if (ruleGroupIndex===rules.length) {
        		if (loopPropagated && loopPoint[ruleGroupIndex]!==undefined) {
		        	ruleGroupIndex = loopPoint[ruleGroupIndex];
		        	loopPropagated=false;
		        	loopCount++;
					if (loopCount > 200) {
		    			var ruleGroup=rules[ruleGroupIndex];
					   	logErrorCacheable("got caught in an endless startloop...endloop vortex, escaping!", ruleGroup[0].lineNumber,true);
					   	break;
					}
		        }
        	}
        }
    }
}


//if this returns!=null, need to go back and reprocess
export function resolveMovements(dir){
    var moved=true;
    while(moved){
        moved=false;
        for (var i=0;i<GAME.level.n_tiles;i++) {
        	moved = repositionEntitiesAtCell(i) || moved;
        }
    }
    var doUndo=false;

	for (var i=0;i<GAME.level.n_tiles;i++) {
		var cellMask = GAME.level.getCellInto(i,_o6);
		var movementMask = GAME.level.getMovements(i);
		if (!movementMask.iszero()) {
			var rigidMovementAppliedMask = GAME.level.rigidMovementAppliedMask[i];
			if (rigidMovementAppliedMask !== 0) {
				movementMask.iand(rigidMovementAppliedMask);
				if (!movementMask.iszero()) {
					//find what layer was restricted
					for (var j=0;j<GAME.level.layerCount;j++) {
						var layerSection = movementMask.getshiftor(0x1f, 5*j);
						if (layerSection!==0) {
							//this is our layer!
							var rigidGroupIndexMask = GAME.level.rigidGroupIndexMask[i];
							var rigidGroupIndex = rigidGroupIndexMask.getshiftor(0x1f, 5*j);
							rigidGroupIndex--;//group indices start at zero, but are incremented for storing in the bitfield
							var groupIndex = ENGINE.state.rigidGroupIndex_to_GroupIndex[rigidGroupIndex];
							GAME.level.bannedGroup[groupIndex]=true;
							//backtrackTarget = rigidBackups[rigidGroupIndex];
							doUndo=true;
							break;
						}
					}
				}
			}
			for (var j=0;j<ENGINE.state.sfx_MovementFailureMasks.length;j++) {
				var o = ENGINE.state.sfx_MovementFailureMasks[j];
				var objectMask = o.objectMask;
				if (objectMask.anyBitsInCommon(cellMask)) {
					var directionMask = o.directionMask;
					if (movementMask.anyBitsInCommon(directionMask) && seedsToPlay_CantMove.indexOf(o.seed)===-1) {
						seedsToPlay_CantMove.push(o.seed);
					}
				}
			}
    	}

    	for (var j=0;j<ENGINE.STRIDE_MOV;j++) {
    		GAME.level.movements[j+i*ENGINE.STRIDE_MOV]=0;
    	}
	    GAME.level.rigidGroupIndexMask[i]=0;
	    GAME.level.rigidMovementAppliedMask[i]=0;
    }
    return doUndo;
}

var sfxCreateMask=0;
var sfxDestroyMask=0;

export function calculateRowColMasks() {
	for(var i=0;i<GAME.level.mapCellContents.length;i++) {
		GAME.level.mapCellContents[i]=0;
	}

	for (var i=0;i<GAME.level.width;i++) {
		var ccc = GAME.level.colCellContents[i];
		ccc.setZero();
	}

	for (var i=0;i<GAME.level.height;i++) {
		var rcc = GAME.level.rowCellContents[i];
		rcc.setZero();
	}

	for (var i=0;i<GAME.level.width;i++) {
		for (var j=0;j<GAME.level.height;j++) {
			var index = j+i*GAME.level.height;
			var cellContents=GAME.level.getCellInto(index,_o9);
			GAME.level.mapCellContents.ior(cellContents);
			GAME.level.rowCellContents[j].ior(cellContents);
			GAME.level.colCellContents[i].ior(cellContents);
		}
	}
}

/* returns a bool indicating if anything changed */
export function processInput(dir,dontCheckWin,dontModify) {
	GAME.againing = false;

	if (GAME.verbose_logging) {
	 	if (dir===-1) {
	 		consolePrint('Turn starts with no input.')
	 	} else {
	 		consolePrint('=======================');
			consolePrint('Turn starts with input of ' + ['up','left','down','right','action'][dir]+'.');
	 	}
	}

	var bak = backupLevel();

	var playerPositions=[];
    if (dir<=4) {
    	if (dir>=0) {
	        switch(dir){
	            case 0://up
	            {
	                dir=parseInt('00001', 2);;
	                break;
	            }
	            case 1://left
	            {
	                dir=parseInt('00100', 2);;
	                break;
	            }
	            case 2://down
	            {
	                dir=parseInt('00010', 2);;
	                break;
	            }
	            case 3://right
	            {
	                dir=parseInt('01000', 2);;
	                break;
	            }
	            case 4://action
	            {
	                dir=parseInt('10000', 2);;
	                break;
	            }
	        }
	        playerPositions = startMovement(dir);
		}

        var i=0;
        GAME.level.bannedGroup = [];
        rigidBackups = [];
        GAME.level.commandQueue=[];
        var startRuleGroupIndex=0;
        var rigidloop=false;
        var startState = commitPreservationState();
	    sfxCreateMask=new BitVec(ENGINE.STRIDE_OBJ);
	    sfxDestroyMask=new BitVec(ENGINE.STRIDE_OBJ);

		seedsToPlay_CanMove=[];
		seedsToPlay_CantMove=[];

		calculateRowColMasks();

        do {
        //not particularly elegant, but it'll do for now - should copy the world state and check
        //after each iteration
        	rigidloop=false;
        	i++;

        	if (GAME.verbose_logging){consolePrint('applying rules');}

        	applyRules(ENGINE.state.rules, ENGINE.state.loopPoint, startRuleGroupIndex, GAME.level.bannedGroup);
        	var shouldUndo = resolveMovements();

        	if (shouldUndo) {
        		rigidloop=true;
        		restorePreservationState(startState);
        		startRuleGroupIndex=0;//rigidGroupUndoDat.ruleGroupIndex+1;
        	} else {
        		if (GAME.verbose_logging){consolePrint('applying late rules');}
        		applyRules(ENGINE.state.lateRules, ENGINE.state.lateLoopPoint, 0);
        		startRuleGroupIndex=0;
        	}
        } while (i < 50 && rigidloop);

        if (i>=50) {
            consolePrint("looped through 50 times, gave up.  too many loops!");
        }


        if (playerPositions.length>0 && ENGINE.state.metadata.require_player_movement!==undefined) {
        	var somemoved=false;
        	for (var i=0;i<playerPositions.length;i++) {
        		var pos = playerPositions[i];
        		var val = GAME.level.getCell(pos);
        		if (ENGINE.state.playerMask.bitsClearInArray(val.data)) {
        			somemoved=true;
        			break;
        		}
        	}
        	if (somemoved===false) {
        		if (GAME.verbose_logging){
	    			consolePrint('require_player_movement set, but no player movement detected, so cancelling turn.');
	    			consoleCacheDump();
        		}
        		backups.push(bak);
        		DoUndo(true);
        		return false;
        	}
        	//play player cantmove sounds here
        }

	    if (GAME.level.commandQueue.indexOf('cancel')>=0) {
	    	if (GAME.verbose_logging) {
	    		consolePrint('CANCEL command executed, cancelling turn.');
	    		consoleCacheDump();
			}
    		backups.push(bak);
    		DoUndo(true);
    		return false;
	    }

	    if (GAME.level.commandQueue.indexOf('restart')>=0) {
	    	if (GAME.verbose_logging) {
	    		consolePrint('RESTART command executed, reverting to restart state.');
	    		consoleCacheDump();
			}
    		backups.push(bak);
	    	DoRestart(true);
    		return true;
	    }

	    if (dontModify && GAME.level.commandQueue.indexOf('win')>=0) {
	    	return true;
	    }

        var modified=false;
	    for (var i=0;i<GAME.level.objects.length;i++) {
	    	if (GAME.level.objects[i]!==bak.dat[i]) {
				if (dontModify) {
	        		if (GAME.verbose_logging) {
	        			consoleCacheDump();
	        		}
	        		backups.push(bak);
	        		DoUndo(true);
					return true;
				} else {
					if (dir!==-1) {
	    				backups.push(bak);
	    			}
	    			modified=true;
	    		}
	    		break;
	    	}
	    }

		if (dontModify) {
    		if (GAME.verbose_logging) {
    			consoleCacheDump();
    		}
			return false;
		}

        for (var i=0;i<seedsToPlay_CantMove.length;i++) {
	        	playSound(seedsToPlay_CantMove[i]);
        }

        for (var i=0;i<seedsToPlay_CanMove.length;i++) {
	        	playSound(seedsToPlay_CanMove[i]);
        }

        for (var i=0;i<ENGINE.state.sfx_CreationMasks.length;i++) {
        	var entry = ENGINE.state.sfx_CreationMasks[i];
        	if (sfxCreateMask.anyBitsInCommon(entry.objectMask)) {
	        	playSound(entry.seed);
        	}
        }

        for (var i=0;i<ENGINE.state.sfx_DestructionMasks.length;i++) {
        	var entry = ENGINE.state.sfx_DestructionMasks[i];
        	if (sfxDestroyMask.anyBitsInCommon(entry.objectMask)) {
	        	playSound(entry.seed);
        	}
        }

	    for (var i=0;i<GAME.level.commandQueue.length;i++) {
	 		var command = GAME.level.commandQueue[i];
	 		if (command.charAt(1)==='f')  {//identifies sfxN
	 			tryPlaySimpleSound(command);
	 		}
			if (GAME.unitTesting===false) {
				if (command==='message') {
					showTempMessage();
				}
			}
	    }

	    if (ENGINE.textMode===false && (dontCheckWin===undefined ||dontCheckWin===false)) {
	    	if (GAME.verbose_logging) {
	    		consolePrint('Checking win condition.');
			}
	    	checkWin();
	    }

	    if (!GAME.winning) {
			if (GAME.level.commandQueue.indexOf('checkpoint')>=0) {
		    	if (GAME.verbose_logging) {
		    		consolePrint('CHECKPOINT command executed, saving current state to the restart state.');
				}
				restartTarget=backupLevel();
				GAME.curlevelTarget=restartTarget;
				localStorage[document.URL+'_checkpoint']=JSON.stringify(restartTarget);
				//test line, remove later!:
				var restored = JSON.parse(localStorage[document.URL+'_checkpoint']);
				var arr = [];
				for(var p in Object.getOwnPropertyNames(restored.dat)) {
				    arr[p] = restored.dat[p];
				}
				restored.dat = new Int32Array(arr);
				localStorage[document.URL]=GAME.curlevel;
			}

		    if (GAME.level.commandQueue.indexOf('again')>=0 && modified) {
		    	//first have to verify that something's changed
		    	var old_verbose_logging=GAME.verbose_logging;
		    	var oldmessagetext = ENGINE.messagetext;
		    	GAME.verbose_logging=false;
		    	if (processInput(-1,true,true)) {
			    	GAME.verbose_logging=old_verbose_logging;

			    	if (GAME.verbose_logging) {
			    		consolePrint('AGAIN command executed, with changes detected - will execute another turn.');
					}

			    	GAME.againing=true;
			    	GAME.timer=0;
			    } else {
			    	GAME.verbose_logging=old_verbose_logging;
					if (GAME.verbose_logging) {
						consolePrint('AGAIN command not executed, it wouldn\'t make any changes.');
					}
			    }
			    GAME.verbose_logging=old_verbose_logging;
			    ENGINE.messagetext = oldmessagetext;
		    }
		}


	    GAME.level.commandQueue=[];

    }

	if (GAME.verbose_logging) {
		consoleCacheDump();
	}

	if (GAME.winning) {
		GAME.againing=false;
	}

	return modified;
}

export function checkWin() {

	if (GAME.levelEditorOpened) {
		return;
	}

	if (GAME.level.commandQueue.indexOf('win')>=0) {
		consolePrint("Win Condition Satisfied");
		DoWin();
		return;
	}

	var won= false;
	if (ENGINE.state.winconditions.length>0)  {
		var passed=true;
		for (var wcIndex=0;wcIndex<ENGINE.state.winconditions.length;wcIndex++) {
			var wincondition = ENGINE.state.winconditions[wcIndex];
			var filter1 = wincondition[1];
			var filter2 = wincondition[2];
			var rulePassed=true;
			switch(wincondition[0]) {
				case -1://NO
				{
					for (var i=0;i<GAME.level.n_tiles;i++) {
						var cell = GAME.level.getCellInto(i,_o10);
						if ( (!filter1.bitsClearInArray(cell.data)) &&
							 (!filter2.bitsClearInArray(cell.data)) ) {
							rulePassed=false;
							break;
						}
					}

					break;
				}
				case 0://SOME
				{
					var passedTest=false;
					for (var i=0;i<GAME.level.n_tiles;i++) {
						var cell = GAME.level.getCellInto(i,_o10);
						if ( (!filter1.bitsClearInArray(cell.data)) &&
							 (!filter2.bitsClearInArray(cell.data)) ) {
							passedTest=true;
							break;
						}
					}
					if (passedTest===false) {
						rulePassed=false;
					}
					break;
				}
				case 1://ALL
				{
					for (var i=0;i<GAME.level.n_tiles;i++) {
						var cell = GAME.level.getCellInto(i,_o10);
						if ( (!filter1.bitsClearInArray(cell.data)) &&
							 (filter2.bitsClearInArray(cell.data)) ) {
							rulePassed=false;
							break;
						}
					}
					break;
				}
			}
			if (rulePassed===false) {
				passed=false;
			}
		}
		won=passed;
	}

	if (won) {
		consolePrint("Win Condition Satisfied");
		DoWin();
	}
}

export function DoWin() {
	if (GAME.winning) {
		return;
	}
	GAME.againing=false;
	tryPlayEndLevelSound();
	if (GAME.unitTesting) {
		nextLevel();
		return;
	}

	GAME.winning=true;
	GAME.timer=0;
}

/*
//this function isn't valid after refactoring, but also isn't used.
export function anyMovements() {
    for (var i=0;i<GAME.level.movementMask.length;i++) {
        if (GAME.level.movementMask[i]!==0) {
        	return true;
        }
    }
    return false;
}*/


export function nextLevel() {
	GAME.keybuffer=[];
    GAME.againing=false;
	ENGINE.messagetext="";
	if (ENGINE.titleScreen) {
		if (ENGINE.titleSelection===0) {
			//new game
			GAME.curlevel=0;
			GAME.curlevelTarget=null;
		}
		if (GAME.curlevelTarget!==null){
			loadLevelFromStateTarget(ENGINE.state,GAME.curlevel,GAME.curlevelTarget);
		} else {
			loadLevelFromState(ENGINE.state,GAME.curlevel);
		}
	} else {
		if (GAME.curlevel<(ENGINE.state.levels.length-1))
		{
			GAME.curlevel++;
			ENGINE.textMode=false;
			ENGINE.titleScreen=false;
			GAME.quittingMessageScreen=false;
			GAME.messageselected=false;

			if (GAME.curlevelTarget!==null){
				loadLevelFromStateTarget(ENGINE.state,GAME.curlevel,GAME.curlevelTarget);
			} else {
				loadLevelFromState(ENGINE.state,GAME.curlevel);
			}
		} else {
			GAME.curlevel=0;
			GAME.curlevelTarget=null;
			goToTitleScreen();
			tryPlayEndGameSound();
		}
		//continue existing game
	}
	try {
		if (!!window.localStorage) {
			localStorage[document.URL]=GAME.curlevel;
			if (GAME.curlevelTarget!==null){
				localStorage[document.URL+"_checkpoint"]=JSON.stringify(GAME.curlevelTarget);
			} else {
				localStorage.removeItem(document.URL+"_checkpoint");
			}
		}
	} catch (ex) {

	}

	canvasResize();
	clearInputHistory();
}

export function goToTitleScreen(){
    GAME.againing=false;
	ENGINE.messagetext="";
	ENGINE.titleScreen=true;
	ENGINE.textMode=true;
	ENGINE.titleSelection=(GAME.curlevel>0||GAME.curlevelTarget!==null)?1:0;
	generateTitleScreen();
}

export {ellipsisPattern, sprites}

export {_o1,_o2,_o2_5,_o3,_o4,_o5,_o6,_o7,_o8,_o9,_o10,_o11,_o12}
export {_m1,_m2,_m3}
