import {globals as GAME} from './globalVariables';

export function makeGIF() {
	var randomseed = RandomGen.seed;
	GAME.levelEditorOpened=false;
	var targetlevel=GAME.curlevel;
	var gifcanvas = document.createElement('canvas');
	gifcanvas.width=ENGINE.screenwidth*cellwidth;
	gifcanvas.height=ENGINE.screenheight*cellheight;
	gifcanvas.style.width=ENGINE.screenwidth*cellwidth;
	gifcanvas.style.height=ENGINE.screenheight*cellheight;

	var gifctx = gifcanvas.getContext('2d');

	var inputDat = inputHistory.concat([]);


	GAME.unitTesting=true;
	levelString=compiledText;



	var encoder = new GIFEncoder();
	encoder.setRepeat(0); //auto-loop
	encoder.setDelay(200);
	encoder.start();

	compile(["loadLevel",GAME.curlevel],levelString,randomseed);
	canvasResize();
	redraw();
	gifctx.drawImage(canvas,-xoffset,-yoffset);
  	encoder.addFrame(gifctx);
	var autotimer=0;

  	for(var i=0;i<inputDat.length;i++) {
  		var realtimeframe=false;
		var val=inputDat[i];
		if (val==="undo") {
			DoUndo();
		} else if (val==="restart") {
			DoRestart();
		} else if (val=="tick") {
			processInput(-1);
			realtimeframe=true;
		} else {
			processInput(val);
		}
		redraw();
		gifctx.drawImage(canvas,-xoffset,-yoffset);
		encoder.addFrame(gifctx);
		encoder.setDelay(realtimeframe?GAME.autotickinterval:GAME.repeatinterval);
		autotimer+=GAME.repeatinterval;

		while (GAME.againing) {
			processInput(-1);
			redraw();
			encoder.setDelay(GAME.againinterval);
			gifctx.drawImage(canvas,-xoffset,-yoffset);
	  		encoder.addFrame(gifctx);
		}
	}

  	encoder.finish();
  	var dat = 'data:image/gif;base64,'+encode64(encoder.stream().getData());
  	window.open(dat);

  	GAME.unitTesting = false;
}
