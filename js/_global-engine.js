const titletemplate_select1 = [
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


var introstate = {
	title: "2D Whale World",
	attribution: "increpare",
   	objectCount: 2,
   	metadata:[],
   	levels:[],
   	bgcolor:"#000000",
   	fgcolor:"#FFFFFF"
};

export const globals = {
	titletemplate_select1,
	titleImage: [],
	titleWidth: titletemplate_select1[0].length,
	titleHeight: titletemplate_select1.length,
	textMode: true,
	titleScreen: true,
	titleMode: 0,//1 means there are options
	titleSelection: 0,
	titleSelected: false,
	introstate,
	state: introstate,
	messagetext: '',
  STRIDE_OBJ: 1,
  STRIDE_MOV: 1,
	zoomscreen: false,
	flickscreen: false,
	screenwidth: 0,
	screenheight: 0

};
