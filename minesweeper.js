var myTimer;
var c;
var cX;
var cY;
var time = 0;
var gameBoard = [[], []];
var bombs = [];
var zeroStack = [];
var callLevel = 0;

var prop = {
    rows: 10,
    cols: 10,
    bombs: 20,
    width: 40,
    height: 40
};

var firstClick = true;
var playerWinOrLose = false;
var isSuperman = false;

const surroundBoxes = [ // all the coordinates around box
    [-1,-1],
    [0,-1],
    [1,-1],
    [1,0],
    [1,1],
    [0,1],
    [-1,1],
    [-1,0]
]

// 1 = 1
// 2 = 2
// ...
// 8 = 8
// 9 = bomb
// 10 = empty (0)
const ZERO_VALUE = 10;
const BOMB_VALUE = 9;

const DEF_COLS = 20;
const DEF_ROWS = 20;
const DEF_BOMBS = 10;
const DEF_SIZE = 40;
const MAX_SIZE = 300;
const MIN_SIZE = 1;
const MIN_BOMBS = 1;
const BOMBS_RATIO = 8 / 9;
const SIZE_RATIO = 0.0586;

const ZERO = 0;

window.onload = function () { // create the canvas and start new game
	var canvas = document.getElementById("gameCanvas");
    c = canvas.getContext("2d");
    newGame();
};

function newGame() { //create new game
    var timerH = document.getElementById("timerH");
    time = ZERO; // restart the timer from 0
    timerH.innerHTML = time.toString() + "s";
    firstClick = true;
    playerWinOrLose = false;
    clearTimeout(myTimer);
  
    setWinTitle(); // hide win title
    
    prop.bombs = DEF_BOMBS;
	
    prop.cols = setInput("colsInput"); // calc the cols
    prop.rows = setInput("rowsInput"); // calc the rows

    setBombs();
    
    // check if superman checkbox is checked
    var input = document.getElementsByName("supermanCB")[0];
    isSuperman = input.checked;
    
    var bombsLeftH = document.getElementById("bombsLeftH");
    bombsLeftH.innerHTML = prop.bombs.toString();
    
    calcBoardSize();
	
    initGameBoard(); // initialize the matrix[][] (=-10) and draw the board
}

function setInput(inputName) { // get name of input elemnt and runing calculation on his value
    var input = document.getElementsByName(inputName)[0];
	var num = Math.floor(Number(input.value)); // get the input value and round down
	if (num > MAX_SIZE) num = MAX_SIZE; // if the value bigger than the MAX_SIZE (=300) set the value to MAX_SIZE
    else if (num < MIN_SIZE) num = DEF_ROWS; // if the value smaller than MIN_SIZE (=1) set the value to DEF_SIZE (=10)
	input.value = num; // update the input value
    return num;
}

function setBombs() { // get the number of bombs that the player assign and runing calculation on this number
    var input = document.getElementsByName("bombsInput")[0];
	prop.bombs = Math.floor(Number(input.value)); // get input value and round down
	if (prop.bombs > (prop.cols * prop.rows * (BOMBS_RATIO))) prop.bombs = Math.floor(prop.cols * prop.rows * (BOMBS_RATIO));
    else if (prop.bombs < MIN_BOMBS) prop.bombs = Math.floor((prop.cols + prop.rows) / 2);
    if (prop.bombs == 0) prop.bombs = 1;
    input.value = prop.bombs;
}

function calcBoardSize() { // calc the board size - width + height
    prop.height = DEF_SIZE - SIZE_RATIO * (prop.rows - DEF_ROWS);
	prop.width = DEF_SIZE - SIZE_RATIO * (prop.cols - DEF_COLS);
	prop.height = Math.min(prop.height, prop.width);
	prop.width = prop.height;
    
	var canvas = document.getElementById("gameCanvas");
	canvas.setAttribute("width", (prop.cols * prop.width).toString());
	canvas.setAttribute("height", (prop.rows * prop.height).toString());
    
    cY = canvas.offsetTop;
	cX = canvas.offsetLeft;
}

function drawBox(src, x, y) { // this method get the src arrtibute of the img and the coordinates and draw the Image
    var img = new Image()
    img.src = src;
    img.onload = function() {
        c.drawImage(img, x * prop.width, y * prop.height, prop.width, prop.height);
    }
}

function createBombs() { // this method create random bombs
    var i;
    
    bombs = [];
    var bombX;
    var bombY;
    
    i=ZERO;
    while (i < prop.bombs) {
        bombX = Math.floor(Math.random() * prop.cols);
        bombY = Math.floor(Math.random() * prop.rows);
        while (gameBoard[bombX][bombY] == -9) {
            bombX = Math.floor(Math.random() * prop.cols);
            bombY = Math.floor(Math.random() * prop.rows);
        }
        
        bombs[i] = [bombX, bombY, false];
        gameBoard[bombX][bombY] = -BOMB_VALUE;
        incSurround(bombX, bombY);
        i++;  
    }
    
    if(isSuperman) supermanShow();
}

function incSurround(x, y) { // increases the value of the boxs surround the box coordinates (x, y)  
    for (i in surroundBoxes) {
        if ( onLimits(x + surroundBoxes[i][0], y + surroundBoxes[i][1]) && (gameBoard[x + surroundBoxes[i][0]][y + surroundBoxes[i][1]] != -BOMB_VALUE) ) {
            if (gameBoard[x + surroundBoxes[i][0]][y + surroundBoxes[i][1]] == -ZERO_VALUE) gameBoard[x + surroundBoxes[i][0]][y + surroundBoxes[i][1]] = 0;
            --gameBoard[x + surroundBoxes[i][0]][y + surroundBoxes[i][1]];
        }
    }
}

function initGameBoard() { //initialize the game board
    var x;
    var y;
             
    // initialize matrix[][] of the board game
    for (i = 0; i < prop.cols; i++) {
        gameBoard[i] = [];
    }
    
    //draw all the board and set all matrix values to zero (=-10) 
    for (x = 0; x < prop.cols; x++) {
        for (y = 0; y < prop.rows; y++) {
            gameBoard[x][y] = -ZERO_VALUE;
            drawBox("box.png", x, y);
        }   
    }
    
    createBombs();
}

function supermanShow() { // when superman checkbox is checked use this method - show all the boxs
    var num;
    clearTimeout(myTimer);

    for (x = 0; x < prop.cols; x++) {
        for (y = 0; y < prop.rows; y++) {
            num = gameBoard[x][y];
            if (num == -ZERO_VALUE) num = "0";
            else if(num == -BOMB_VALUE) num = "bomb";
            else num = (-num).toString();
            drawBox(num + ".png", x, y);
        }   
    }
}

function supermanHide() { // when superman checkbox isn't checked use this method - hise all the boxs not clicked
    var num;
    timer();
    
    for (x = 0; x < prop.cols; x++) {
        for (y = 0; y < prop.rows; y++) {
            if( (gameBoard[x][y] >= -ZERO_VALUE) && (gameBoard[x][y] < 0) ) drawBox("box.png", x, y);
        }   
    }
}

function cbChange() { // this method called when checkbox ("supermanCB") is changed
    var input = document.getElementsByName("supermanCB")[0];
    isSuperman = input.checked;
    if (isSuperman) supermanShow();
    else supermanHide();
}

window.onclick = function(e) { // event on mouse click
    var i;
    var mX = e.pageX;
    var mY = e.pageY;

    if (isSuperman) return; // if superman check box is checked the player can't click on the board
    
    if (playerWinOrLose) { // if player win or lose the first click start new game
        newGame();
        return;
    }

    if ( (mX >= cX) && (mY >= cY) && (mX < prop.cols * prop.width + cX) && (mY < prop.rows * prop.height + cY) ) { // check if the mouse click coordinates is on the board limits
        var clickedCol = Math.floor( (mX - cX - 1) / prop.width);
        var clickedRow = Math.floor( (mY - cY - 1) / prop.height);

        if (firstClick) { // start the timer on the first click on the board
            timer(); // start the timer
            firstClick = false;
        }
        
        if (gameBoard[clickedCol][clickedRow] > 0)  return; // the box is shown
        
        if (e.shiftKey) shiftKeyDown(clickedCol, clickedRow); // Shift key is pressed
        else if (gameBoard[clickedCol][clickedRow] < -ZERO_VALUE) return; //there is a flag in this clicked box
        else if ( gameBoard[clickedCol][clickedRow] == -BOMB_VALUE ) lose(); //there is a bomb in this clicked box
        else showBoxs(clickedCol, clickedRow); // there is number (0-8) in this clicked box
    }
}

function showBoxs(x,y) { // show the number behind the box - if zero (=10) - open all the boxs surround
    gameBoard[x][y] *= (-1);
    var boxNum = gameBoard[x][y];
    if (boxNum == ZERO_VALUE) { // 10 equals to empty box
        zeroStack = [];
        zeroStack[0] = [x, y];
        var i = -1;
        while (i != zeroStack.length - 1) {
            for (i in zeroStack) {
                surroundZero(zeroStack[i][0], zeroStack[i][1]);
            } 
        }
        boxNum = 0;
    }
    drawBox(boxNum.toString() + ".png", x, y);
}

function shiftKeyDown(x, y) { // this method called if shift key is pressed
    var bobmsLeftH = document.getElementById("bombsLeftH");
    var bombsLeft = Number(bobmsLeftH.innerHTML);
            
    if (gameBoard[x][y] < -ZERO_VALUE) { // if the value is smaller tham -10 - it's a flag
        gameBoard[x][y] += 10; // add 10 - down the flag
        drawBox("box.png", x, y); // draw box (without a flag)
        bombsLeft++;
    }
    else { // there is no flag in this box --> draw flag if the player didn't all of them
        if (bombsLeft != 0) { 
            bombsLeft--;
            gameBoard[x][y] -= 10;
            drawBox("flag.png", x, y); // draw box with flag
        }
        else {
            alert("You don't have any remaining flags");// the player used all the flags
            return;
        }
    }

    var i = bombIndex(x,y);
    if (i != -1) bombs[i][2] = !bombs[i][2];

    bobmsLeftH.innerHTML = bombsLeft.toString();

    if (bombsLeft == 0) winCheck(); // check if the player win
}

function bombIndex(x, y) { // this method return the index in the Array bombs[] of the box coordinates (x, y) -- if this box isn't bomb return -1
    for (i in bombs) {
        if ( (x == bombs[i][0]) && (y == bombs[i][1]) ) {
            return i; // return the index of the bomb in the Array bombs[]
        }
    }
    return -1; // this box isn't bomb - return -1
}

function surroundZero(x, y) { // show all the boxs surround this box coordinates (x, y)
    var newX;
    var newY;
        
    for (boxPos in surroundBoxes) {
        newX = x + surroundBoxes[boxPos][0];
        newY = y + surroundBoxes[boxPos][1];
        
        if ( onLimits(newX, newY) && (gameBoard[newX][newY] < 0) && (gameBoard[newX][newY] >= -ZERO_VALUE) ) {
            gameBoard[newX][newY] *= (-1);
            var boxNum = gameBoard[newX][newY];
            if (boxNum == ZERO_VALUE) {
                callLevel++;
                if (callLevel == 1000) zeroStack[zeroStack.length] = [newX, newY];
                else surroundZero(newX, newY);
                callLevel--;
                boxNum = 0;
            }
            drawBox(boxNum.toString() + ".png", newX, newY);
        }
    }
}

function surroundCheck(x,y) { // this method return the number of bombs surround this box box coordinates (x, y)
    var numOfBombsSurrounding = 0;
    
    for (boxPos in surroundBoxes) {
        if ( onLimits(x + surroundBoxes[boxPos][0], y + surroundBoxes[boxPos][1]) ) {
            if (gameBoard[x + surroundBoxes[boxPos][0]][y + surroundBoxes[boxPos][1]] == -BOMB_VALUE) numOfBombsSurrounding++;
        }
    }
    
    return numOfBombsSurrounding;
}

function lose() { // this method called when the player clicked on bomb
    var bomb = new Image()
    bomb.src = "bomb.png";
    bomb.onload = function() {
        for (bombPos in bombs) c.drawImage(bomb, bombs[bombPos][0] * prop.width, bombs[bombPos][1] * prop.height, prop.width, prop.height);
    }
    
    playerWinOrLose = true;
    clearTimeout(myTimer); // stop the Timer

    setWinTitle(false); // show "YOU LOSE :(" Image
}

function winCheck() { // this method called when no flags remain to be placed -- if all flags are in the correct place the player win
    for (i in bombs) {
        if (!(bombs[i][2])) {
            return; // one (or more) of the flags is not on bomb position
        }
    }
    
    // option to show all the board after win
    
/*    for (i = 0; i < prop.rows; i = i + 1) {
        for (j = 0; j < prop.cols; j = j + 1) {
            if ( (gameBoard[j][i] >= -10) && (gameBoard[j][i] < 0) ) {
                gameBoard[j][i] *= (-1); // show all the board
                var boxNum = gameBoard[j][i];
                if (boxNum == 10) boxNum = 0;
                drawBox(boxNum.toString() + ".png", j, i);
            }
        }
    }*/
    
    playerWinOrLose = true;
    clearTimeout(myTimer); // stop the Timer
  
    
    setWinTitle(true);    
}

function setWinTitle(isWin) { // this method show the overlay Image
    // isWin:
    // true = show win Image
    // false = show lose Image
    // else (undefined) = hide the Image
    
    var png = document.getElementsByClassName("overlay")[0];    

    if(isWin) {
        png.src = "win.png";
        png.style.visibility = "visible";
        
    }
    else if(isWin == false) {
        png.src = "lose.png";
        png.style.visibility = "visible";
    }
    else {
        png.style.visibility = "hidden";
        return;
    }
    
    setImgSize(png);
}

function setImgSize(png) { // this method set the Image size by the window size
    const IMG_RATIO = 847 / 213; // width / height
    
    if(window.innerHeight * IMG_RATIO < window.innerWidth * (1 / IMG_RATIO)) {
        png.style.height = window.innerHeight.toString() + "px";
        png.style.width = (window.innerHeight * IMG_RATIO).toString() + "px";
    }
    else {
        png.style.width = window.innerWidth.toString() + "px";
        png.style.height = (window.innerWidth * (1 / IMG_RATIO)).toString() + "px";
    }
    
    png.style.top = window.pageYOffset.toString() + "px";
    png.style.left = window.pageXOffset.toString() + "px";
}

function timer() { // set the timer (this method called every 1000ms (=1sec))
    myTimer = setTimeout(function() {
                    var timerH = document.getElementById("timerH");
                    time++;
                    timerH.innerHTML = time.toString() + "s";
                    timer();
    
               }, 1000)
}

function onLimits(x, y) { // this method check if the x & y coordinates are on the board limits
    if ( (x >= ZERO) && (x < prop.cols) && (y >= ZERO) && (y < prop.rows) ) return true;
    return false; // return false if the coordinates are out of the board
}

window.onscroll = function() { // event method - called when the page is scroll and update the location of the overlay Image
    var png = document.getElementsByClassName("overlay")[0];
    png.style.top = window.pageYOffset.toString() + "px";
    png.style.left = window.pageXOffset.toString() + "px";
}