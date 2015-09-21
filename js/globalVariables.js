window.unitTesting=false;
window.curlevel=0;
window.curlevelTarget=null;
window.levelEditorOpened=false;

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


window.verbose_logging=false;
window.throttle_movement=false;
window.cache_console_messages=false;
window.quittingTitleScreen=false;
window.quittingMessageScreen=false;
window.deltatime=17;
window.timer=0;
window.repeatinterval=150;
window.autotick=0;
window.autotickinterval=0;
window.winning=false;
window.againing=false;
window.againinterval=150;
window.norepeat_action=false;
window.oldflickscreendat=[];//used for buffering old flickscreen/scrollscreen positions, in case player vanishes
window.keybuffer = [];


window.messageselected=false;

window.textImages={};
window.initLevel = {
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

window.level = initLevel;
