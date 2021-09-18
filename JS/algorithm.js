'use strict';

let tempBool;
let bInput = document.getElementsByClassName("inputForBoard");
let boardInputArray = Array.from(bInput);
let possibleSolutions = [];
let solutionsContainer = document.getElementById("solutions");
let currentBoard;
let constraints;
let solutionsCounter = 0;
let solutionsMarker = 0;
let solutionsHeader = document.getElementById("solutionsHeader");
let solutionsShowing = document.getElementById("solutionsShowing");
let openModalDiv = document.getElementById("openFilterWrapper");
let pos = {
    "row": 0,
    "col": 0
};

let submitBtn = document.getElementById("submitBtn");

submitBtn.addEventListener("click", onSubmit);

/** Function to be called when the 'Solve' button is pressed */
function onSubmit(e) {
    e.preventDefault();
    solutionsMarker = 0;
    solutionsHeader.textContent = "Finding Solutions..."
    solutionsContainer.innerHTML = "";
    solutionsShowing.textContent = "";
    setBoard();
    setConstraints();
    possibleSolutions = [];
    setTimeout(function(){
        solve(currentBoard);
        displaySolutions();
        //solutionsHeader.scrollIntoView(true);
        $('html,body').animate({scrollTop: $("#solutionsHeader").offset().top},'slow');
        console.log("Solved");
    }, 0);
}

/** Checks if there is an empty space on the board */
function findEmpty(currentBoard){
    for (let i = 0; i < currentBoard.length; i++) {
        for (let j = 0; j < currentBoard[i].length; j++) {
            if (currentBoard[i][j] === -1){
                pos["row"] = i;
                pos["col"] = j;
                return pos;
            }
        }
    }
    return false;
}

/** Checks if the board is valid */
function boardIsValid(testNum){
    let isRowValid = checkRow(pos["row"], testNum);
    let isColValid;
    if(isRowValid){
        isColValid = checkCol(pos["col"], testNum);
        if(isColValid){
            return true;
        }
        else{
            return false;
        }
    }
    return false;
}

/** Checks to make sure the current row is valid ( meets bombs/points requirements ) */
function checkRow(currentIndex, testNum) { 
    let funcBool = false;
    let currentRow = [...currentBoard[currentIndex]];
    currentRow[pos['col']] = testNum;
    if(getVoltorbsInArray(currentRow) <= constraints[getCurrentRowConstraints(pos["row"])]["voltorbs"]){
        //move is allowed
        funcBool = true;
        if (pos['col'] == 4){// At end of row
            if (sumArray(currentRow) == constraints[getCurrentRowConstraints(pos["row"])]['points']){
                //passes points test
                funcBool = true;
                if(getVoltorbsInArray(currentRow) <= constraints[getCurrentRowConstraints(pos["row"])]["voltorbs"]){
                    funcBool = true;
                }
                else{
                    funcBool = false;
                }
            }
            else{
                funcBool = false;
            }
        }
    }
    return funcBool;
}


function checkCol(currentIndex, testNum){
    let funcBool = false;
    let currentCol = [currentBoard[0][currentIndex], currentBoard[1][currentIndex], currentBoard[2][currentIndex], currentBoard[3][currentIndex], currentBoard[4][currentIndex]];
    currentCol[pos['row']] = testNum;
    if(getVoltorbsInArray(currentCol) <= constraints[getCurrentColConstraints(pos["col"])]["voltorbs"]){
        //passes voltorb test
        funcBool = true;
        if (pos['row'] == 4){ //last index in column
            if (sumArray(currentCol) == constraints[getCurrentColConstraints(pos["col"])]['points']){
                //passes points test
                funcBool = true;
                if(getVoltorbsInArray(currentCol) == constraints[getCurrentColConstraints(pos["col"])]["voltorbs"]){
                    funcBool = true;
                }
                else{
                    funcBool = false;
                }
            }
            else{
                funcBool = false;
            }
        }
    }
    return funcBool;
}


function movePosBack() {
    if(pos['col'] > 0){
        pos['col'] = pos['col'] - 1;
        return true;
    }
    else if(pos['row'] == 0 && pos['col'] == 0){
        return false;
        // cant go back
    }
    else{
        pos['row'] = pos['row'] - 1;
        pos['col'] = 4;
        return true;
    }
}

let stop = false;
function solve(currentBoard) {
    let foundEmpty = findEmpty(currentBoard);
    if (!foundEmpty){
        console.log("Didnt find empty");
    }
    else{
        pos['row'] = foundEmpty['row'];
        pos['col'] = foundEmpty['col'];
    }

    for (let i = 0; i < 4; i++) {
        if (boardIsValid(i)){
            currentBoard[pos["row"]][pos['col']] = i;
            if (pos['row'] == 4 && pos['col'] == 4){
                solutionsMarker++;
                let possibleSolution = copyBoard(currentBoard);
                possibleSolutions.push(possibleSolution);
                if (stop == true){
                    return true;
                }
            }
            else{
                if (solve(currentBoard)){
                    return true;
                }

                currentBoard[pos["row"]][pos['col']] = -1;
                let movesAvailable = movePosBack();
                if (movesAvailable == false){
                    stop = true;
                    return true;
                }
            }
        }
    }

    return false;
}

function displaySolutions() {
    solutionsCounter = 0;
    possibleSolutions.forEach(board => { //element is a board (array of arrays) [ [], [], [], [], [] ]
        let boardDiv = document.createElement("div"); //wrapper for the board
        boardDiv.classList.add("solution");
        let rowCounter = 1;
        board.forEach(row => { //value is a row (array)
            let ul = document.createElement("ul"); //list to hold row
            let colCounter = 1;
            row.forEach(value => {
                let li = document.createElement("li"); //li containing value
                li.classList.add("solutionCell" + rowCounter + "-" + colCounter); 
                if (value == 0){
                    let img = document.createElement("img");
                    img.src = "Images/voltorb.png";
                    li.appendChild(img);
                }
                else{
                    let liText = document.createTextNode(value);
                    li.appendChild(liText);
                }
                colCounter++;
                ul.appendChild(li); //add value to row
            });
            rowCounter++;
            boardDiv.appendChild(ul); //add row to board
        });
        solutionsCounter++;
        solutionsContainer.appendChild(boardDiv); //add board to container
    });
    solutionsHeader.textContent = "Solutions Found - " + solutionsCounter;
    solutionsShowing.textContent = "Showing " + solutionsCounter;
    openModalDiv.style.display = "block";
}






/** Takes all elements in an array and adds them, returns the results */
function sumArray(array){
    let sum = 0;
    array.forEach(element => {
        if (element != -1){ //skip the empty spaces
            sum += element;
        }
    });
    return sum;
}

/** Gets the amount of voltorbs in the current row */
function getVoltorbsInArray(array){
    let counter = 0;
    array.forEach(element => {
        if(element === 0){
            counter++;
        }
    });
    return counter;
}

/** Sets the values for each row and column */
function setConstraints(){
    constraints = {
        "row1": {
            "points": document.querySelector("[name='row1_points']").value,
            "voltorbs": document.querySelector("[name='row1_voltorbs']").value
        },
        "row2": {
            "points": document.querySelector("[name='row2_points']").value,
            "voltorbs": document.querySelector("[name='row2_voltorbs']").value
        },
        "row3": {
            "points": document.querySelector("[name='row3_points']").value,
            "voltorbs": document.querySelector("[name='row3_voltorbs']").value
        },
        "row4": {
            "points": document.querySelector("[name='row4_points']").value,
            "voltorbs": document.querySelector("[name='row4_voltorbs']").value
        },
        "row5": {
            "points": document.querySelector("[name='row5_points']").value,
            "voltorbs": document.querySelector("[name='row5_voltorbs']").value
        },
        "col1": {
            "points": document.querySelector("[name='col1_points']").value,
            "voltorbs": document.querySelector("[name='col1_voltorbs']").value
        },
        "col2": {
            "points": document.querySelector("[name='col2_points']").value,
            "voltorbs": document.querySelector("[name='col2_voltorbs']").value
        },
        "col3": {
            "points": document.querySelector("[name='col3_points']").value,
            "voltorbs": document.querySelector("[name='col3_voltorbs']").value
        },
        "col4": {
            "points": document.querySelector("[name='col4_points']").value,
            "voltorbs": document.querySelector("[name='col4_voltorbs']").value
        },
        "col5": {
            "points": document.querySelector("[name='col5_points']").value,
            "voltorbs": document.querySelector("[name='col5_voltorbs']").value
        }
    }
}

/** Initializes the board with values */
function setBoard() {
    currentBoard = [
        [-1, -1, -1, -1, -1],
        [-1, -1, -1, -1, -1],
        [-1, -1, -1, -1, -1],
        [-1, -1, -1, -1, -1],
        [-1, -1, -1, -1, -1]
    ];
    boardInputArray.forEach(element => {
        if (element.value != 0){
            let insertInRow = element.name.charAt(element.name.length - 3); // Row index
            let insertInCol = element.name.charAt(element.name.length - 1); // Column index
            let rowIndex = parseInt(insertInRow) - 1;
            let colIndex = parseInt(insertInCol) - 1;
            currentBoard[rowIndex][colIndex] = element.value;
        }
    });
}

/** Makes a copy of the current board and returns it */
function copyBoard(board){
    let newBoard = [[],[],[],[],[]];
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            newBoard[i][j] = board[i][j];
        }
    }
    return newBoard;
}

function getCurrentRowConstraints(index){
    if (index === 0){
        return "row1";
    }
    else if(index === 1){
        return "row2";
    }
    else if(index === 2){
        return "row3";
    }
    else if(index === 3){
        return "row4";
    }
    else if(index === 4){
        return "row5";
    }
}

function getCurrentColConstraints(index){
    if (index === 0){
        return "col1";
    }
    else if(index === 1){
        return "col2";
    }
    else if(index === 2){
        return "col3";
    }
    else if(index === 3){
        return "col4";
    }
    else if(index === 4){
        return "col5";
    }
}

function isArrayOfArraysEqual(arr1, arr2){
    for (let i = 0; i < arr1.length; i++) {
        for(let j = 0; j < arr1[i].length; j++){
            if(arr1[i][j] != arr2[i][j]){
                return false;
            }
        }
    }
    return true;
}