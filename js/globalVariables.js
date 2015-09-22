let unitTesting=false;
let curlevel=0;
let curlevelTarget=null;
let levelEditorOpened=false;

try {
 	if (!!window.localStorage) {
		if (localStorage[document.URL]!==undefined) {
            if (localStorage[document.URL+'_checkpoint']!==undefined){
                curlevelTarget = JSON.parse(localStorage[document.URL+'_checkpoint']);

                var arr = [];
                for(var p in Object.getOwnPropertyNames(curlevelTarget.dat)) {
                    arr[p] = curlevelTarget.dat[p];
                }
                curlevelTarget.dat = new Int32Array(arr);

            }
	        curlevel = localStorage[document.URL];
		}
	}
} catch(ex) {
}


let verbose_logging=false;
let throttle_movement=false;
let cache_console_messages=false;
let quittingTitleScreen=false;
let quittingMessageScreen=false;
let deltatime=17;
let timer=0;
let repeatinterval=150;
let autotick=0;
let autotickinterval=0;
let winning=false;
let againing=false;
let againinterval=150;
let norepeat_action=false;
let oldflickscreendat=[];//used for buffering old flickscreen/scrollscreen positions, in case player vanishes
let keybuffer = [];


let messageselected=false;

let textImages={};
let initLevel = {
    width: 5,
    height: 5,
    layerCount: 2,
    dat: [
    1, 3, 3, 1, 1, 2, 2, 3, 3, 1,
    2, 1, 2, 2, 3, 3, 1, 1, 2, 2,
    3, 2, 1, 3, 2, 1, 3, 2, 1, 3,
    1, 3, 3, 1, 1, 2, 2, 3, 3, 1,
    2, 1, 2, 2, 3, 3, 1, 1, 2, 2
    ],
    movementMask:[
    1, 3, 3, 1, 1, 2, 2, 3, 3, 1,
    2, 1, 2, 2, 3, 3, 1, 1, 2, 2,
    3, 2, 1, 3, 2, 1, 3, 2, 1, 3,
    1, 3, 3, 1, 1, 2, 2, 3, 3, 1,
    2, 1, 2, 2, 3, 3, 1, 1, 2, 2
    ],
    rigidGroupIndexMask:[],//[indexgroupNumber, masked by layer arrays]
    rigidMovementAppliedMask:[],//[indexgroupNumber, masked by layer arrays]
    bannedGroup:[],
    colCellContents:[],
    rowCellContents:[]
};

let level = initLevel;


export const globals = {
  curlevelTarget,
  curlevelTarget,
  curlevelTarget,
  levelEditorOpened,
  verbose_logging,
  throttle_movement,
  cache_console_messages,
  quittingTitleScreen,
  quittingMessageScreen,
  deltatime,
  timer,
  repeatinterval,
  autotick,
  autotickinterval,
  winning,
  againing,
  againinterval,
  norepeat_action,
  oldflickscreendat,
  keybuffer,


  messageselected,

  textImages,
  level,

}

window.GAME = globals;
