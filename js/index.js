import {setCanvas} from './_global-graphics';
import {globals as DEBUG} from './debug_off';
import {globals as GAME} from './globalVariables';
import {globals as ENGINE} from './_global-engine';
import {init as engineInit} from './engine';
import {compile, qualifyURL} from './compiler';
import Mobile from './mobile';

import {addListeners as addGraphicsListeners, removeListeners as removeGraphicsListeners} from './graphics';
import {addListeners as addInputOutputListeners, removeListeners as removeInputOutputListeners, startGameLoop, stopGameLoop} from './inputoutput';


DEBUG.canYoutube = false;
DEBUG.canSetHTMLColors = false;

class GameEngine {
	start(node, gameData) {
		this.node = node;

		// Just in case no one specifies the `onWinGame`
		if (!GAME.onWinGame) {
			GAME.onWinGame = () => {return};
		}
		this._load();
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
	setSaver(fn) {
		GAME.stateSaver = fn;
	}
	setLoader(fn) {
		this._loader = fn;
	}
	setOnWinGame(fn) {
		GAME.onWinGame = fn;
	}

	_load() {
		const {level, checkpoint} = this._loader();
		GAME.curlevel = level;
		if (checkpoint) {
			var arr = [];
			for(var p in Object.getOwnPropertyNames(checkpoint.dat)) {
					arr[p] = checkpoint.dat[p];
			}
			checkpoint.dat = new Int32Array(arr);
			GAME.curlevelTarget = checkpoint;
		}
	}
	useDefaultSaveAndLoad(saveKeyPrefix) {
		// Set the localStorage saver and loader by default
		this.setSaver((level, checkpoint) => {
			const levelKey = saveKeyPrefix;
			const checkpointKey = levelKey + '_checkpoint';
			window.localStorage.setItem(levelKey, level);
			// Checkpoint is optional. some games have it
			if (checkpoint) {
				window.localStorage.setItem(checkpointKey, JSON.stringify(checkpoint));
			} else {
				window.localStorage.removeItem(checkpointKey);
			}
		});
		this.setLoader(() => {
			const levelKey = saveKeyPrefix;
			const checkpointKey = levelKey + '_checkpoint';
			const level = window.localStorage.getItem(levelKey);
			// Checkpoint is optional. some games have it
			const checkpointStr = window.localStorage.getItem(checkpointKey);
			let checkpoint;
			if (checkpointStr) {
				checkpoint = JSON.parse(checkpointStr);
			}
			return {level, checkpoint};
		});
	}
}



export default new GameEngine()
