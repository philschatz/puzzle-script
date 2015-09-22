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


export const globals = {
	titletemplate_select1,
	titleImage: [],
	titleWidth: titletemplate_select1[0].length,
	titleHeight: titletemplate_select1.length,
	textMode: true,
	titleScreen: true,
	titleMode: 0,//1 means there are options
	titleSelection: 0,
	titleSelected: false
};
