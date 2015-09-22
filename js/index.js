import {setCanvas} from './_global-graphics';
import {globals as ENGINE} from './_global-engine';
import {init as engineInit} from './engine';
import {compile, qualifyURL} from './compiler';
import Mobile from './mobile';

import {addListeners as addGraphicsListeners, removeListeners as removeGraphicsListeners} from './graphics';
import {addListeners as addInputOutputListeners, removeListeners as removeInputOutputListeners, startGameLoop, stopGameLoop} from './inputoutput';


class GameEngine {
	start(node, gameData) {
		this.node = node;
		addGraphicsListeners(this.node);
		addInputOutputListeners(this.node);
		startGameLoop();
		setCanvas(this.node);
		engineInit();
		compile(["restart"],gameData);
	}
	pause() {
		stopGameLoop();
		removeInputOutputListeners(this.node);
	}
	resume() {
		startGameLoop();
		addInputOutputListeners(this.node);
	}
	stop() {
		removeGraphicsListeners(this.node);
		removeInputOutputListeners(this.node);
		stopGameLoop();
	}
}



export default new GameEngine()
