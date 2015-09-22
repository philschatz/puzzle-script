import {generateTitleScreen, tryPlayStartGameSound, nextLevel, sprites, processInput, tryPlayCloseMessageSound, drawMessageScreen, DoRestart, DoUndo} from './engine';
import {redraw, canvasResize} from './graphics';
import {globals as DEBUG, pushInput} from './debug_off';
import {globals as GRAPHICS} from './_global-graphics';
import {globals as ENGINE} from './_global-engine';
import {globals as GAME} from './globalVariables';

var keyRepeatTimer=0;
var keyRepeatIndex=0;
var input_throttle_timer=0.0;
var lastinput=-100;

var dragging=false;
var rightdragging=false;
var columnAdded=false;

function selectText(containerid,e) {
	e = e || window.event;
	var myspan = document.getElementById(containerid);
	if (e&&(e.ctrlKey || e.metaKey)) {
		var levelarr = ["console"].concat(myspan.innerHTML.split("<br>"));
		var leveldat = levelFromString(ENGINE.state,levelarr);
		loadLevelFromLevelDat(ENGINE.state,leveldat,null);
		canvasResize();
	} else {
	    if (document.selection) {
	        var range = document.body.createTextRange();
	        range.moveToElementText(myspan);
	        range.select();
	    } else if (window.getSelection) {
	        var range = document.createRange();
	        range.selectNode(myspan);
	        window.getSelection().addRange(range);
	    }
	}
}

function recalcLevelBounds(){
}

function arrCopy(from, fromoffset, to, tooffset, len) {
	while (len--)
		to[tooffset++] = from[fromoffset]++;
}

function adjustLevel(level, widthdelta, heightdelta) {
	backups.push(backupLevel());
	var oldlevel = level.clone();
	level.width += widthdelta;
	level.height += heightdelta;
	level.n_tiles = level.width * level.height;
	level.objects = new Int32Array(level.n_tiles * ENGINE.STRIDE_OBJ);
	var bgMask = new BitVec(ENGINE.STRIDE_OBJ);
	bgMask.ibitset(ENGINE.state.backgroundid);
	for (var i=0; i<level.n_tiles; ++i)
		level.setCell(i, bgMask);
	level.movements = new Int32Array(level.objects.length);
	columnAdded=true;
	RebuildLevelArrays();
	return oldlevel;
}

function addLeftColumn() {
	var oldlevel = adjustLevel(GAME.level, 1, 0);
	for (var x=1; x<GAME.level.width; ++x) {
		for (var y=0; y<GAME.level.height; ++y) {
			var index = x*GAME.level.height + y;
			GAME.level.setCell(index, oldlevel.getCell(index - GAME.level.height))
		}
	}
}

function addRightColumn() {
	var oldlevel = adjustLevel(GAME.level, 1, 0);
	for (var x=0; x<GAME.level.width-1; ++x) {
		for (var y=0; y<GAME.level.height; ++y) {
			var index = x*GAME.level.height + y;
			GAME.level.setCell(index, oldlevel.getCell(index))
		}
	}
}

function addTopRow() {
	var oldlevel = adjustLevel(GAME.level, 0, 1);
	for (var x=0; x<GAME.level.width; ++x) {
		for (var y=1; y<GAME.level.height; ++y) {
			var index = x*GAME.level.height + y;
			GAME.level.setCell(index, oldlevel.getCell(index - x - 1))
		}
	}
}

function addBottomRow() {
	var oldlevel = adjustLevel(GAME.level, 0, 1);
	for (var x=0; x<GAME.level.width; ++x) {
		for (var y=0; y<GAME.level.height - 1; ++y) {
			var index = x*GAME.level.height + y;
			GAME.level.setCell(index, oldlevel.getCell(index - x));
		}
	}
}

function removeLeftColumn() {
	if (GAME.level.width<=1) {
		return;
	}
	var oldlevel = adjustLevel(GAME.level, -1, 0);
	for (var x=0; x<GAME.level.width; ++x) {
		for (var y=0; y<GAME.level.height; ++y) {
			var index = x*GAME.level.height + y;
			GAME.level.setCell(index, oldlevel.getCell(index + GAME.level.height))
		}
	}
}

function removeRightColumn(){
	if (GAME.level.width<=1) {
		return;
	}
	var oldlevel = adjustLevel(GAME.level, -1, 0);
	for (var x=0; x<GAME.level.width; ++x) {
		for (var y=0; y<GAME.level.height; ++y) {
			var index = x*GAME.level.height + y;
			GAME.level.setCell(index, oldlevel.getCell(index))
		}
	}
}

function removeTopRow(){
	if (GAME.level.height<=1) {
		return;
	}
	var oldlevel = adjustLevel(GAME.level, 0, -1);
	for (var x=0; x<GAME.level.width; ++x) {
		for (var y=0; y<GAME.level.height; ++y) {
			var index = x*GAME.level.height + y;
			GAME.level.setCell(index, oldlevel.getCell(index + x + 1))
		}
	}
}
function removeBottomRow(){
	if (GAME.level.height<=1) {
		return;
	}
	var oldlevel = adjustLevel(GAME.level, 0, -1);
	for (var x=0; x<GAME.level.width; ++x) {
		for (var y=0; y<GAME.level.height; ++y) {
			var index = x*GAME.level.height + y;
			GAME.level.setCell(index, oldlevel.getCell(index + x))
		}
	}
}

function matchGlyph(inputmask,glyphAndMask) {
	// find mask with closest match
	var highestbitcount=-1;
	var highestmask;
	for (var i=0; i<glyphAndMask.length; ++i) {
		var glyphname = glyphAndMask[i][0];
		var glyphmask = glyphAndMask[i][1]
		//require all bits of glyph to be in input
		if (glyphmask.bitsSetInArray(inputmask.data)) {
			var bitcount = 0;
			for (var bit=0;bit<32*ENGINE.STRIDE_OBJ;++bit) {
				if (glyphmask.get(bit) && inputmask.get(bit))
					bitcount++;
			}
			if (bitcount>highestbitcount) {
				highestbitcount=bitcount;
				highestmask=glyphname;
			}
		}
	}
	if (highestbitcount>0) {
		return highestmask;
	}

	logErrorNoLine("Wasn't able to approximate a glyph value for some tiles, using '.' as a placeholder.",true);
	return '.';
}

var htmlEntityMap = {
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	'"': '&quot;',
	"'": '&#39;',
	"/": '&#x2F;'
};

var selectableint  = 0;

function printLevel() {
	var glyphAndMask = [];
	for (var glyphName in ENGINE.state.glyphDict) {
		if (ENGINE.state.glyphDict.hasOwnProperty(glyphName)&&glyphName.length===1) {
			var glyph = ENGINE.state.glyphDict[glyphName];
			var glyphmask=new BitVec(ENGINE.STRIDE_OBJ);
			for (var i=0;i<glyph.length;i++)
			{
				var id = glyph[i];
				if (id>=0) {
					glyphmask.ibitset(id);
				}
			}
			glyphAndMask.push([glyphName, glyphmask.clone()])
			//register the same - backgroundmask with the same name
			var bgMask = ENGINE.state.layerMasks[ENGINE.state.backgroundlayer];
			glyphmask.iclear(bgMask);
			glyphAndMask.push([glyphName, glyphmask.clone()])
			for (var i=0;i<32;i++) {
				var bgid = 1<<i;
				if (bgMask.get(i)) {
					glyphmask.ibitset(i);
					glyphAndMask.push([glyphName, glyphmask.clone()]);
					glyphmask.ibitclear(i);
				}
			}
		}
	}
	selectableint++;
	var tag = 'selectable'+selectableint;
	var output="Printing GAME.level contents:<br><br><span id=\""+tag+"\" onclick=\"selectText('"+tag+"',event)\">";
	GAME.cache_console_messages = false;
	for (var j=0;j<GAME.level.height;j++) {
		for (var i=0;i<GAME.level.width;i++) {
			var cellIndex = j+i*GAME.level.height;
			var cellMask = GAME.level.getCell(cellIndex);
			var glyph = matchGlyph(cellMask,glyphAndMask);
			if (glyph in htmlEntityMap) {
				glyph = htmlEntityMap[glyph];
			}
			output = output+glyph;
		}
		if (j<GAME.level.height-1){
			output=output+"<br>";
		}
	}
	output+="</span><br>"
	consolePrint(output,true);
}

function levelEditorClick(event,click) {
	if (mouseCoordY<=-2) {
		var ypos = editorRowCount-(-mouseCoordY-2)-1;
		var newindex=mouseCoordX+(ENGINE.screenwidth-1)*ypos;
		if (mouseCoordX===-1) {
			printLevel();
		} else if (mouseCoordX>=0&&newindex<glyphImages.length) {
			glyphSelectedIndex=newindex;
			redraw();
		}

	} else if (mouseCoordX>-1&&mouseCoordY>-1&&mouseCoordX<ENGINE.screenwidth-2&&mouseCoordY<ENGINE.screenheight-2-editorRowCount	) {
		var glyphname = glyphImagesCorrespondance[glyphSelectedIndex];
		var glyph = ENGINE.state.glyphDict[glyphname];
		var glyphmask = new BitVec(ENGINE.STRIDE_OBJ);
		for (var i=0;i<glyph.length;i++)
		{
			var id = glyph[i];
			if (id>=0) {
				glyphmask.ibitset(id);
			}
		}

		var backgroundMask = ENGINE.state.layerMasks[ENGINE.state.backgroundlayer];
		if (glyphmask.bitsClearInArray(backgroundMask)) {
			// If we don't already have a background layer, mix in
			// the default one.
			glyphmask.ibitset(state.backgroundid);
		}

		var coordIndex = mouseCoordY + mouseCoordX*GAME.level.height;
		var getcell = GAME.level.getCell(coordIndex);
		if (getcell.equals(glyphmask)) {
			return;
		} else {
			if (anyEditsSinceMouseDown===false) {
				anyEditsSinceMouseDown=true;
        		backups.push(backupLevel());
			}
			GAME.level.setCell(coordIndex, glyphmask);
			redraw();
		}
	}
	else if (click) {
		if (mouseCoordX===-1) {
			//add a left row to the map
			addLeftColumn();
			canvasResize();
		} else if (mouseCoordX===ENGINE.screenwidth-2) {
			addRightColumn();
			canvasResize();
		}
		if (mouseCoordY===-1) {
			addTopRow();
			canvasResize();
		} else if (mouseCoordY===ENGINE.screenheight-2-editorRowCount) {
			addBottomRow();
			canvasResize();
		}
	}
}

function levelEditorRightClick(event,click) {
	if (mouseCoordY===-2) {
		if (mouseCoordX<=glyphImages.length) {
			glyphSelectedIndex=mouseCoordX;
			redraw();
		}
	} else if (mouseCoordX>-1&&mouseCoordY>-1&&mouseCoordX<ENGINE.screenwidth-2&&mouseCoordY<ENGINE.screenheight-2-editorRowCount	) {
		var coordIndex = mouseCoordY + mouseCoordX*GAME.level.height;
		var glyphmask = new BitVec(ENGINE.STRIDE_OBJ);
		glyphmask.ibitset(state.backgroundid);
		GAME.level.setCell(coordIndex, glyphmask);
		redraw();
	}
	else if (click) {
		if (mouseCoordX===-1) {
			//add a left row to the map
			removeLeftColumn();
			canvasResize();
		} else if (mouseCoordX===ENGINE.screenwidth-2) {
			removeRightColumn();
			canvasResize();
		}
		if (mouseCoordY===-1) {
			removeTopRow();
			canvasResize();
		} else if (mouseCoordY===ENGINE.screenheight-2-editorRowCount) {
			removeBottomRow();
			canvasResize();
		}
	}
}

var anyEditsSinceMouseDown = false;

function onMouseDown(event) {
	if (event.button===0 && !(event.ctrlKey||event.metaKey) ) {
        GRAPHICS.lastDownTarget = event.target;
        GAME.keybuffer=[];
        if (event.target===GRAPHICS.canvas) {
        	setMouseCoord(event);
        	dragging=true;
        	rightdragging=false;
        	if (GAME.levelEditorOpened) {
        		anyEditsSinceMouseDown=false;
        		return levelEditorClick(event,true);
        	}
        }
        dragging=false;
        rightdragging=false;
    } else if (event.button===2 || (event.button===0 && (event.ctrlKey||event.metaKey)) ) {
    	if (event.target.id==="gameCanvas") {
		    dragging=false;
		    rightdragging=true;
        	if (GAME.levelEditorOpened) {
        		return levelEditorRightClick(event,true);
        	}
        }
    }

}

function rightClickCanvas(event) {
    return prevent(event);
}

function onMouseUp(event) {
	dragging=false;
    rightdragging=false;
}

function onKeyDown(event) {

    event = event || window.event;

	// Prevent arrows/space from scrolling page
	if ((!DEBUG.IDE) && ([32, 37, 38, 39, 40].indexOf(event.keyCode) > -1)) {
		prevent(event);
	}


    if (GAME.keybuffer.indexOf(event.keyCode)>=0) {
    	return;
    }

    if(GRAPHICS.lastDownTarget === GRAPHICS.canvas) {
    	if (GAME.keybuffer.indexOf(event.keyCode)===-1) {
    		GAME.keybuffer.splice(keyRepeatIndex,0,event.keyCode);
	    	keyRepeatTimer=0;
	    	checkKey(event,true);
		}
	}


    if (DEBUG.canDump===true) {
        if (event.keyCode===74 && (event.ctrlKey||event.metaKey)) {//ctrl+j
            dumpTestCase();
            prevent(event);
        } else if (event.keyCode===75 && (event.ctrlKey||event.metaKey)) {//ctrl+k
            makeGIF();
            prevent(event);
        }
    }
}

export function relMouseCoords(event){
    var totalOffsetX = 0;
    var totalOffsetY = 0;
    var canvasX = 0;
    var canvasY = 0;
    var currentElement = this;

    do{
        totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
        totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
    }
    while(currentElement = currentElement.offsetParent)

    canvasX = event.pageX - totalOffsetX;
    canvasY = event.pageY - totalOffsetY;

    return {x:canvasX, y:canvasY}
}
HTMLCanvasElement.prototype.relMouseCoords = relMouseCoords;

function onKeyUp(event) {
	event = event || window.event;
	var index=GAME.keybuffer.indexOf(event.keyCode);
	if (index>=0){
    	GAME.keybuffer.splice(index,1);
    	if (keyRepeatIndex>=index){
    		keyRepeatIndex--;
    	}
    }
}

function onMyFocus(event) {
	GAME.keybuffer=[];
	keyRepeatIndex = 0;
	keyRepeatTimer = 0;
}

function onMyBlur(event) {
	GAME.keybuffer=[];
	keyRepeatIndex = 0;
	keyRepeatTimer = 0;
}

var mouseCoordX=0;
var mouseCoordY=0;

function setMouseCoord(e){
    var coords = GRAPHICS.canvas.relMouseCoords(e);
    mouseCoordX=coords.x-xoffset;
	mouseCoordY=coords.y-yoffset;
	mouseCoordX=Math.floor(mouseCoordX/cellwidth);
	mouseCoordY=Math.floor(mouseCoordY/cellheight);
}

function mouseMove(event) {
    if (GAME.levelEditorOpened) {
    	setMouseCoord(event);
    	if (dragging) {
    		levelEditorClick(event,false);
    	} else if (rightdragging){
    		levelEditorRightClick(event,false);
    	}
	    redraw();
    }

    //window.console.log("showcoord ("+ canvas.width+","+canvas.height+") ("+x+","+y+")");
}

function mouseOut() {
//  window.console.log("clear");
}

document.addEventListener('mousedown', onMouseDown, false);
document.addEventListener('mouseup', onMouseUp, false);
document.addEventListener('keydown', onKeyDown, false);
document.addEventListener('keyup', onKeyUp, false);
window.addEventListener('focus', onMyFocus, false);
window.addEventListener('blur', onMyBlur, false);


function prevent(e) {
    if (e.preventDefault) e.preventDefault();
    if (e.stopImmediatePropagation) e.stopImmediatePropagation();
    if (e.stopPropagation) e.stopPropagation();
    e.returnValue=false;
    return false;
}

function checkKey(e,justPressed) {

    if (GAME.winning) {
    	return;
    }
    var inputdir=-1;
    switch(e.keyCode) {
        case 65://a
        case 37: //left
        {
//            window.console.log("LEFT");
            inputdir=1;
        break;
        }
        case 38: //up
        case 87: //w
        {
//            window.console.log("UP");
            inputdir=0;
        break;
        }
        case 68://d
        case 39: //right
        {
//            window.console.log("RIGHT");
            inputdir=3;
        break;
        }
        case 83://s
        case 40: //down
        {
//            window.console.log("DOWN");
            inputdir=2;
        break;
        }
        case 13://enter
        case 32://space
        case 67://c
        case 88://x
        {
//            window.console.log("ACTION");
			if (GAME.norepeat_action===false || justPressed) {
            	inputdir=4;
            } else {
            	return;
            }
        break;
        }
        case 85://u
        case 90://z
        {
            //undo
            if (ENGINE.textMode===false) {
                pushInput("undo");
                DoUndo();
                canvasResize(); // calls redraw
            	return prevent(e);
            }
            break;
        }
        case 82://r
        {
        	if (ENGINE.textMode===false) {
        		if (justPressed) {
	        		pushInput("restart");
	        		DoRestart();
	                canvasResize(); // calls redraw
            		return prevent(e);
            	}
            }
            break;
        }
        case 27://escape
        {
        	if (ENGINE.titleScreen===false) {
				goToTitleScreen();
		    	tryPlayTitleSound();
				canvasResize();
				return prevent(e)
        	}
        	break;
        }
        case 69: {//e
        	if (canOpenEditor) {
        		if (justPressed) {
        			GAME.levelEditorOpened=!GAME.levelEditorOpened;
        			restartTarget=backupLevel();
        			canvasResize();
        		}
        		return prevent(e);
        	}
            break;
		}
		case 48://0
		case 49://1
		case 50://2
		case 51://3
		case 52://4
		case 53://5
		case 54://6
		case 55://7
		case 56://8
		case 57://9
		{
        	if (GAME.levelEditorOpened&&justPressed) {
        		var num=9;
        		if (e.keyCode>=49)  {
        			num = e.keyCode-49;
        		}

				if (num<glyphImages.length) {
					glyphSelectedIndex=num;
				} else {
					consolePrint("Trying to select tile outside of range in GAME.level editor.",true)
				}

        		canvasResize();
        		return prevent(e);
        	}
        	break;
        }
    }
    if (GAME.throttle_movement && inputdir>=0&&inputdir<=3) {
    	if (lastinput==inputdir && input_throttle_timer<GAME.repeatinterval) {
    		return;
    	} else {
    		lastinput=inputdir;
    		input_throttle_timer=0;
    	}
    }
    if (ENGINE.textMode) {
    	if (ENGINE.state.levels.length===0) {
    		//do nothing
    	} else if (ENGINE.titleScreen) {
    		if (ENGINE.titleMode===0) {
    			if (inputdir===4&&justPressed) {
    				if (ENGINE.titleSelected===false) {
						tryPlayStartGameSound();
	    				ENGINE.titleSelected=true;
	    				GAME.messageselected=false;
	    				GAME.timer=0;
	    				GAME.quittingTitleScreen=true;
	    				generateTitleScreen();
	    				canvasResize();
	    			}
    			}
    		} else {
    			if (inputdir==4&&justPressed) {
    				if (ENGINE.titleSelected===false) {
						tryPlayStartGameSound();
	    				ENGINE.titleSelected=true;
	    				GAME.messageselected=false;
	    				GAME.timer=0;
	    				GAME.quittingTitleScreen=true;
	    				generateTitleScreen();
	    				redraw();
	    			}
    			}
    			else if (inputdir===0||inputdir===2) {
    				ENGINE.titleSelection=1-ENGINE.titleSelection;
    				generateTitleScreen();
    				redraw();
    			}
    		}
    	} else {
    		if (inputdir==4&&justPressed) {
				if (GAME.unitTesting) {
					nextLevel();
					return;
				} else if (GAME.messageselected===false) {
    				GAME.messageselected=true;
    				GAME.timer=0;
    				GAME.quittingMessageScreen=true;
    				tryPlayCloseMessageSound();
    				ENGINE.titleScreen=false;
    				drawMessageScreen();
    			}
    		}
    	}
    } else {
	    if (!GAME.againing && inputdir>=0) {
            if (inputdir===4 && ('noaction' in ENGINE.state.metadata)) {

            } else {
                pushInput(inputdir);
                if (processInput(inputdir)) {
                    redraw();
                }
	        }
	       	return prevent(e);
    	}
    }
}


function update() {
    GAME.timer+=GAME.deltatime;
    input_throttle_timer+=GAME.deltatime;
    if (GAME.quittingTitleScreen) {
        if (GAME.timer/1000>0.3) {
            GAME.quittingTitleScreen=false;
            nextLevel();
        }
    }
    if (GAME.againing) {
        if (GAME.timer>GAME.againinterval&&ENGINE.messagetext.length==0) {
            if (processInput(-1)) {
                redraw();
                keyRepeatTimer=0;
                GAME.autotick=0;
            }
        }
    }
    if (GAME.quittingMessageScreen) {
        if (GAME.timer/1000>0.15) {
            GAME.quittingMessageScreen=false;
            if (ENGINE.messagetext==="") {
            	nextLevel();
            } else {
            	ENGINE.messagetext="";
            	ENGINE.textMode=false;
				ENGINE.titleScreen=false;
				ENGINE.titleMode=(GAME.curlevel>0||GAME.curlevelTarget!==null)?1:0;
				ENGINE.titleSelected=false;
				ENGINE.titleSelection=0;
    			canvasResize();
    			checkWin();
            }
        }
    }
    if (GAME.winning) {
        if (GAME.timer/1000>0.5) {
            GAME.winning=false;
            nextLevel();
        }
    }
    if (GAME.keybuffer.length>0) {
	    keyRepeatTimer+=GAME.deltatime;
	    var ticklength = GAME.throttle_movement ? GAME.repeatinterval : GAME.repeatinterval/(Math.sqrt(GAME.keybuffer.length));
	    if (keyRepeatTimer>ticklength) {
	    	keyRepeatTimer=0;
	    	keyRepeatIndex = (keyRepeatIndex+1)%GAME.keybuffer.length;
	    	var key = GAME.keybuffer[keyRepeatIndex];
	        checkKey({keyCode:key},false);
	    }
	}

    if (GAME.autotickinterval>0&&!ENGINE.textMode&&!GAME.levelEditorOpened&&!GAME.againing&&!GAME.winning) {
        GAME.autotick+=GAME.deltatime;
        if (GAME.autotick>GAME.autotickinterval) {
            GAME.autotick=0;
            pushInput("tick");
            if (processInput(-1)) {
                redraw();
            }
        }
    }
}

// Lights, camera…function!
setInterval(function() {
    update();
}, GAME.deltatime);
