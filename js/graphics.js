import {globals as GRAPHICS} from './_global-graphics';
import font from './font';
import {globals as ENGINE} from './_global-engine';
import {sprites, _o12} from './engine';
import {globals as GAME} from './globalVariables';

export function createSprite(name,spritegrid, colors, padding) {
	if (colors === undefined) {
		colors = [ENGINE.state.bgcolor, ENGINE.state.fgcolor];
	}

	var sprite = makeSpriteCanvas(name);
	var spritectx = sprite.getContext('2d');

    spritectx.clearRect(0, 0, ENGINE.cellwidth, ENGINE.cellheight);

	var w = spritegrid[0].length;
	var h = spritegrid.length;
	var cw = ~~(ENGINE.cellwidth / (w + (padding|0)));
    var ch = ~~(ENGINE.cellheight / (h + (padding|0)));
    var pixh=ch;
    if ("scanline" in ENGINE.state.metadata) {
        pixh=Math.ceil(ch/2);
    }
    spritectx.fillStyle = ENGINE.state.fgcolor;
    for (var j = 0; j < w; j++) {
        for (var k = 0; k < h; k++) {
            var val = spritegrid[j][k];
            if (val >= 0) {
                var cy = (j * cw)|0;
                var cx = (k * ch)|0;
                spritectx.fillStyle = colors[val];
                spritectx.fillRect(cx, cy, cw, pixh);
            }
        }
    }

    return sprite;
}

export function regenText(spritecanvas,spritectx) {
	GAME.textImages={};

	for (var n in font) {
		if (font.hasOwnProperty(n)) {
			GAME.textImages[n] = createSprite('char'+n,font[n], undefined, 1);
		}
	}
}
var spriteimages;
export function regenSpriteImages() {
	if (ENGINE.textMode) {
		regenText();
		return;
	} else if (GAME.levelEditorOpened) {
        GAME.textImages['s'] = createSprite('chars',font['s'],undefined);
    }

    if (ENGINE.state.levels.length===0) {
        return;
    }
    spriteimages = [];

    for (var i = 0; i < sprites.length; i++) {
        if (sprites[i] == undefined) {
            continue;
        }
        spriteimages[i] = createSprite(i.toString(),sprites[i].dat, sprites[i].colors);
    }

    if (DEBUG.canOpenEditor) {
    	generateGlyphImages();
    }
}

var glyphImagesCorrespondance;
var glyphImages;
var glyphHighlight;
var glyphHighlightResize;
var glyphPrintButton;
var glyphMouseOver;
var glyphSelectedIndex=0;
var editorRowCount=1;

export function makeSpriteCanvas(name) {
    var canvas;
    if (name in GRAPHICS.canvasdict) {
        canvas = GRAPHICS.canvasdict[name];
    } else {
        canvas = document.createElement('canvas');
        GRAPHICS.canvasdict[name]=canvas;
    }
	canvas.width = ENGINE.cellwidth;
	canvas.height = ENGINE.cellheight;
	return canvas;
}


export function generateGlyphImages() {
    if (ENGINE.cellwidth===0||ENGINE.cellheight===0) {
        return;
    }
	glyphImagesCorrespondance=[];
	glyphImages=[];

	for (var n in ENGINE.state.glyphDict) {
		if (n.length==1 && ENGINE.state.glyphDict.hasOwnProperty(n)) {
			var g=ENGINE.state.glyphDict[n];
			var sprite = makeSpriteCanvas("C"+n)
			var spritectx = sprite.getContext('2d');
			glyphImagesCorrespondance.push(n);
			for (var i=0;i<g.length;i++){
				var id = g[i];
				if (id===-1) {
					continue;
				}
				spritectx.drawImage(spriteimages[id], 0, 0);
			}
			glyphImages.push(sprite);
		}
	}

	{
		//make highlight thingy
		glyphHighlight = makeSpriteCanvas("highlight");
		var spritectx = glyphHighlight.getContext('2d');
		spritectx.fillStyle = '#FFFFFF';

		spritectx.fillRect(0,0,ENGINE.cellwidth,1);
		spritectx.fillRect(0,0,1,ENGINE.cellheight);

		spritectx.fillRect(0,ENGINE.cellheight-1,ENGINE.cellwidth,1);
		spritectx.fillRect(ENGINE.cellwidth-1,0,1,ENGINE.cellheight);
	}

	{
		glyphPrintButton = GAME.textImages['s'];
	}
	{
		//make highlight thingy
		glyphHighlightResize = makeSpriteCanvas("highlightresize");
		var spritectx = glyphHighlightResize.getContext('2d');
		spritectx.fillStyle = '#FFFFFF';

		var minx=((ENGINE.cellwidth/2)-1)|0;
		var xsize=ENGINE.cellwidth-minx-1-minx;
		var miny=((ENGINE.cellheight/2)-1)|0;
		var ysize=ENGINE.cellheight-miny-1-minx;

		spritectx.fillRect(minx,0,xsize,ENGINE.cellheight);
		spritectx.fillRect(0,miny,ENGINE.cellwidth,ysize);
	}

	{
		//make highlight thingy
		glyphMouseOver = makeSpriteCanvas();
		var spritectx = glyphMouseOver.getContext('2d');
		spritectx.fillStyle = 'yellow';

		spritectx.fillRect(0,0,ENGINE.cellwidth,2);
		spritectx.fillRect(0,0,2,ENGINE.cellheight);

		spritectx.fillRect(0,ENGINE.cellheight-2,ENGINE.cellwidth,2);
		spritectx.fillRect(ENGINE.cellwidth-2,0,2,ENGINE.cellheight);
	}
}


window.addEventListener('resize', canvasResize, false);

export function glyphCount(){
    var count=0;
    for (var n in ENGINE.state.glyphDict) {
        if (n.length==1 && ENGINE.state.glyphDict.hasOwnProperty(n)) {
            count++;
        }
    }
    return count;
}

export function redraw() {
    if (ENGINE.cellwidth===0||ENGINE.cellheight===0) {
        return;
    }
    if (spriteimages===undefined) {
        regenSpriteImages();
    }

    if (ENGINE.textMode) {
        GRAPHICS.ctx.fillStyle = ENGINE.state.bgcolor;
        GRAPHICS.ctx.fillRect(0, 0, GRAPHICS.canvas.width, GRAPHICS.canvas.height);

        for (var i = 0; i < ENGINE.titleWidth; i++) {
            for (var j = 0; j < ENGINE.titleHeight; j++) {
                var ch = ENGINE.titleImage[j].charAt(i);
                if (ch in GAME.textImages) {
                    var sprite = GAME.textImages[ch];
                    GRAPHICS.ctx.drawImage(sprite, ENGINE.xoffset + i * ENGINE.cellwidth, ENGINE.yoffset + j * ENGINE.cellheight);
                }
            }
        }
        return;
    } else {
        GRAPHICS.ctx.fillStyle = ENGINE.state.bgcolor;
        GRAPHICS.ctx.fillRect(0, 0, GRAPHICS.canvas.width, GRAPHICS.canvas.height);

        var mini=0;
        var maxi=ENGINE.screenwidth;
        var minj=0;
        var maxj=ENGINE.screenheight;

        if (GAME.levelEditorOpened) {
            var glyphcount = glyphCount();
            editorRowCount = Math.ceil(glyphcount/(ENGINE.screenwidth-1));
            maxi-=2;
            maxj-=2+editorRowCount;
        } else if (ENGINE.flickscreen) {
            var playerPositions = getPlayerPositions();
            if (playerPositions.length>0) {
                var playerPosition=playerPositions[0];
                var px = (playerPosition/(GAME.level.height))|0;
                var py = (playerPosition%GAME.level.height)|0;

                var screenx = (px/ENGINE.screenwidth)|0;
                var screeny = (py/ENGINE.screenheight)|0;
                mini=screenx*ENGINE.screenwidth;
                minj=screeny*ENGINE.screenheight;
                maxi=Math.min(mini+ENGINE.screenwidth,GAME.level.width);
                maxj=Math.min(minj+ENGINE.screenheight,GAME.level.height);

                GAME.oldflickscreendat=[mini,minj,maxi,maxj];
            } else if (GAME.oldflickscreendat.length>0){
                mini=GAME.oldflickscreendat[0];
                minj=GAME.oldflickscreendat[1];
                maxi=GAME.oldflickscreendat[2];
                maxj=GAME.oldflickscreendat[3];
            }
        } else if (ENGINE.zoomscreen) {
            var playerPositions = getPlayerPositions();
            if (playerPositions.length>0) {
                var playerPosition=playerPositions[0];
                var px = (playerPosition/(GAME.level.height))|0;
                var py = (playerPosition%GAME.level.height)|0;
                mini=Math.max(Math.min(px-((ENGINE.screenwidth/2)|0),GAME.level.width-ENGINE.screenwidth),0);
                minj=Math.max(Math.min(py-((ENGINE.screenheight/2)|0),GAME.level.height-ENGINE.screenheight),0);
                maxi=Math.min(mini+ENGINE.screenwidth,GAME.level.width);
                maxj=Math.min(minj+ENGINE.screenheight,GAME.level.height);
                GAME.oldflickscreendat=[mini,minj,maxi,maxj];
            }  else if (GAME.oldflickscreendat.length>0){
                mini=GAME.oldflickscreendat[0];
                minj=GAME.oldflickscreendat[1];
                maxi=GAME.oldflickscreendat[2];
                maxj=GAME.oldflickscreendat[3];
            }
        }


        for (var i = mini; i < maxi; i++) {
            for (var j = minj; j < maxj; j++) {
                var posIndex = j + i * GAME.level.height;
                var posMask = GAME.level.getCellInto(posIndex,_o12);
                for (var k = 0; k < ENGINE.state.objectCount; k++) {
                    if (posMask.get(k) != 0) {
                        var sprite = spriteimages[k];
                        GRAPHICS.ctx.drawImage(sprite, ENGINE.xoffset + (i-mini) * ENGINE.cellwidth, ENGINE.yoffset + (j-minj) * ENGINE.cellheight);
                    }
                }
            }
        }

	    if (GAME.levelEditorOpened) {
	    	drawEditorIcons();
	    }
    }
}

export function drawEditorIcons() {
	var glyphCount = glyphImages.length;
	var glyphStartIndex=0;
	var glyphEndIndex = glyphImages.length;/*Math.min(
							glyphStartIndex+10,
							ENGINE.screenwidth-2,
							glyphStartIndex+Math.max(glyphCount-glyphStartIndex,0)
							);*/
	var glyphsToDisplay = glyphEndIndex-glyphStartIndex;

	GRAPHICS.ctx.drawImage(glyphPrintButton,ENGINE.xoffset-ENGINE.cellwidth,ENGINE.yoffset-ENGINE.cellheight*(1+editorRowCount));
	if (mouseCoordY===(-1-editorRowCount)&&mouseCoordX===-1) {
			GRAPHICS.ctx.drawImage(glyphMouseOver,ENGINE.xoffset-ENGINE.cellwidth,ENGINE.yoffset-ENGINE.cellheight*(1+editorRowCount));
	}

	var ypos = editorRowCount-(-mouseCoordY-2)-1;
	var mouseIndex=mouseCoordX+(ENGINE.screenwidth-1)*ypos;

	for (var i=0;i<glyphsToDisplay;i++) {
		var glyphIndex = glyphStartIndex+i;
		var sprite = glyphImages[glyphIndex];
        var xpos=i%(ENGINE.screenwidth-1);
        var ypos=(i/(ENGINE.screenwidth-1))|0;
		GRAPHICS.ctx.drawImage(sprite,ENGINE.xoffset+(xpos)*ENGINE.cellwidth,ENGINE.yoffset+ypos*ENGINE.cellheight-ENGINE.cellheight*(1+editorRowCount));
		if (mouseCoordX>=0&&mouseCoordX<(ENGINE.screenwidth-1)&&mouseIndex===i) {
			GRAPHICS.ctx.drawImage(glyphMouseOver,ENGINE.xoffset+xpos*ENGINE.cellwidth,ENGINE.yoffset+ypos*ENGINE.cellheight-ENGINE.cellheight*(1+editorRowCount));
		}
		if (i===glyphSelectedIndex) {
			GRAPHICS.ctx.drawImage(glyphHighlight,ENGINE.xoffset+xpos*ENGINE.cellwidth,ENGINE.yoffset+ypos*ENGINE.cellheight-ENGINE.cellheight*(1+editorRowCount));
		}
	}
	if (mouseCoordX>=-1&&mouseCoordY>=-1&&mouseCoordX<ENGINE.screenwidth-1&&mouseCoordY<ENGINE.screenheight-1-editorRowCount) {
		if (mouseCoordX==-1||mouseCoordY==-1||mouseCoordX==ENGINE.screenwidth-2||mouseCoordY===ENGINE.screenheight-2-editorRowCount) {
			GRAPHICS.ctx.drawImage(glyphHighlightResize,
				ENGINE.xoffset+mouseCoordX*ENGINE.cellwidth,
				ENGINE.yoffset+mouseCoordY*ENGINE.cellheight
				);
		} else {
			GRAPHICS.ctx.drawImage(glyphHighlight,
				ENGINE.xoffset+mouseCoordX*ENGINE.cellwidth,
				ENGINE.yoffset+mouseCoordY*ENGINE.cellheight
				);
		}
	}

}

var oldcellwidth=0;
var oldcellheight=0;
var oldtextmode=-1;
var oldfgcolor=-1;
export function canvasResize() {
    GRAPHICS.canvas.width = GRAPHICS.canvas.parentNode.clientWidth;
    GRAPHICS.canvas.height = GRAPHICS.canvas.parentNode.clientHeight;

    ENGINE.screenwidth=GAME.level.width;
    ENGINE.screenheight=GAME.level.height;
    if (ENGINE.state!==undefined){
        ENGINE.flickscreen=ENGINE.state.metadata.flickscreen!==undefined;
        ENGINE.zoomscreen=ENGINE.state.metadata.zoomscreen!==undefined;
	    if (GAME.levelEditorOpened) {
            ENGINE.screenwidth+=2;
            var glyphcount = glyphCount();
            editorRowCount = Math.ceil(glyphcount/(ENGINE.screenwidth-1));
            ENGINE.screenheight+=2+editorRowCount;
        } else if (ENGINE.flickscreen) {
	        ENGINE.screenwidth=ENGINE.state.metadata.flickscreen[0];
	        ENGINE.screenheight=ENGINE.state.metadata.flickscreen[1];
	    } else if (ENGINE.zoomscreen) {
	        ENGINE.screenwidth=ENGINE.state.metadata.zoomscreen[0];
	        ENGINE.screenheight=ENGINE.state.metadata.zoomscreen[1];
	    }
	}

    if (ENGINE.textMode) {
        ENGINE.screenwidth=ENGINE.titleWidth;
        ENGINE.screenheight=ENGINE.titleHeight;
    }

    ENGINE.cellwidth = GRAPHICS.canvas.width / ENGINE.screenwidth;
    ENGINE.cellheight = GRAPHICS.canvas.height / ENGINE.screenheight;

    var w = 5;//sprites[1].dat.length;
    var h = 5;//sprites[1].dat[0].length;


    if (ENGINE.textMode) {
        w=6;
        h=6;
    }

    ENGINE.cellwidth = w * ~~(ENGINE.cellwidth / w);
    ENGINE.cellheight = h * ~~(ENGINE.cellheight / h);

    ENGINE.xoffset = 0;
    ENGINE.yoffset = 0;

    if (ENGINE.cellwidth > ENGINE.cellheight) {
        ENGINE.cellwidth = ENGINE.cellheight;
        ENGINE.xoffset = (GRAPHICS.canvas.width - ENGINE.cellwidth * ENGINE.screenwidth) / 2;
        ENGINE.yoffset = (GRAPHICS.canvas.height - ENGINE.cellheight * ENGINE.screenheight) / 2;
    }
    else { //if (ENGINE.cellheight > ENGINE.cellwidth) {
        ENGINE.cellheight = ENGINE.cellwidth;
        ENGINE.yoffset = (GRAPHICS.canvas.height - ENGINE.cellheight * ENGINE.screenheight) / 2;
        ENGINE.xoffset = (GRAPHICS.canvas.width - ENGINE.cellwidth * ENGINE.screenwidth) / 2;
    }
		// TODO: seems like magnification is unused
    ENGINE.magnification = ((ENGINE.cellwidth/w)*5)|0;

    if (GAME.levelEditorOpened && !ENGINE.textMode) {
    	ENGINE.xoffset+=ENGINE.cellwidth;
    	ENGINE.yoffset+=ENGINE.cellheight*(1+editorRowCount);
    }

    ENGINE.cellwidth = ENGINE.cellwidth|0;
    ENGINE.cellheight = ENGINE.cellheight|0;
    ENGINE.xoffset = ENGINE.xoffset|0;
    ENGINE.yoffset = ENGINE.yoffset|0;

    if (oldcellwidth!=ENGINE.cellwidth||oldcellheight!=ENGINE.cellheight||oldtextmode!=ENGINE.textMode||oldfgcolor!=ENGINE.state.fgcolor||GRAPHICS.forceRegenImages){
    	GRAPHICS.forceRegenImages=false;
    	regenSpriteImages();
    }

    oldcellheight=ENGINE.cellheight;
    oldcellwidth=ENGINE.cellwidth;
    oldtextmode=ENGINE.textMode;
    oldfgcolor=ENGINE.state.fgcolor;

    redraw();
}
