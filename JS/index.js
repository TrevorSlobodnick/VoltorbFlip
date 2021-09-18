'use strict';

if(window.matchMedia('screen and (max-width: 768px)').matches){
    let legendSpansArr = Array.from(document.getElementsByClassName("legend"));
    legendSpansArr.forEach(element => {
        if (element.textContent == "Voltorbs"){
            element.textContent = "V";
        }
        else if (element.textContent == "Points"){
            element.textContent = "P";
        }
    });
}

let filterDiv = document.getElementById("filterDiv");
let sampleRowColl = document.getElementsByClassName("sampleRow");
let sampleRowArr = Array.from(sampleRowColl);
let sampleCellColl = document.getElementsByClassName("sampleCell");
let sampleCellArr = Array.from(sampleCellColl);
let optionsUl = document.getElementById("options");
let filterOptionsColl = document.getElementsByClassName("filterOption");
let filterOptionsArr = Array.from(filterOptionsColl);
let resetFiltersButton = document.getElementById("resetFilter");
let applyFiltersButton = document.getElementById("applyFilter");
let previousActiveCell = null;
let activeCell = null;

let filters = [];

// Adding events to modal buttons
resetFiltersButton.addEventListener("click", resetFilters);
applyFiltersButton.addEventListener("click", applyFilters);

// Setting modal settings and adding additional handler when clicking outside of the modal window
$.modal.defaults.escapeClose = false;
$.modal.defaults.clickClose = false;
$('#modal1').on($.modal.BLOCK, function(e, modal) {
    modal.$blocker.on("click", onClickOutsideElement);
});

// Adding events for each cell in table (in modal)
sampleCellArr.forEach(element => {
    element.textContent = "\u200b";
    element.addEventListener("click", onCellClicked);
});

//Handle events for clicking outside of an element within modal
sampleRowArr.forEach(element => {
    element.addEventListener("click", onClickOutsideElement);
});
optionsUl.addEventListener("click", onClickOutsideElement);
document.getElementById("applyFilterWrapper").addEventListener("click", onClickOutsideElement);
document.getElementById("modal1").addEventListener("click", onClickOutsideElement);

// events for the filter options (Unset Voltorb 1 2 3 - within modal)
filterOptionsArr.forEach(element => {
    element.addEventListener("mouseover", function(e){
        if(activeCell != null){
            e.currentTarget.style.cursor = "pointer";
            e.currentTarget.style.backgroundColor = "lightblue";
        }
    });
    element.addEventListener("mouseleave", function(e) {
        e.currentTarget.style.cursor = "default";
        e.currentTarget.style.backgroundColor = "transparent";
    });
    element.addEventListener("click", onFilterOptionSelected);
});

// When a square (table cell) in the modal is clicked...
function onCellClicked(e){
    // set previous cell
    previousActiveCell = activeCell;
    // set active cell (selected)
    activeCell = e.currentTarget;
    // give it the selected class
    activeCell.classList.add("selected");
    // Check if it is a new square being clicked or the same one
    if (previousActiveCell != null && activeCell != null && previousActiveCell != activeCell){
        //new square has been clicked
        previousActiveCell.classList.remove("selected");
    }
    // Unblur the filter Options
    optionsUl.classList.remove("blur");
}

function onFilterOptionSelected(e){
    if (activeCell != null){
        if (e.currentTarget.textContent != "Unset"){
            activeCell.innerHTML = e.currentTarget.innerHTML;
        }
        else{
            activeCell.innerHTML = "\u200b";
        }
    }
}

function onClickOutsideElement(e){
    if (e.target == e.currentTarget){ // ensures event only fires when the element clicked on is itself (not children)
        previousActiveCell = null;
        if (activeCell != null){
            activeCell.classList.remove("selected");
        }
        optionsUl.classList.add("blur");
        activeCell = null;
    }
}

function applyFilters(){
    let removed = 0;
    clearFilters();
    setFilters();
    if (filters.length > 0){
        filters.forEach(element => {
            let searchStr = element.cell;
            let cells = document.querySelectorAll("li[class*='" + searchStr + "']");
            let cellsArr = Array.from(cells);
            cellsArr.forEach(cell => {
                let board = getContainerFromCell(cell);
                if (board.style.display != "none"){
                    //check if value of cell matches value in filter
                    let cellValue = 0;
                    if (cell.children.length == 0){
                        cellValue = cell.textContent;
                    }
                    if (element.cellValue != cellValue){
                        board.style.display = "none";
                        removed++;
                    }
                }
            });
        });
    }
    solutionsShowing.textContent = "Showing " + (solutionsCounter - removed);
}

/** Clears all filters/Shows all results */
function clearFilters(){
    let solutionsColl = document.getElementsByClassName("solution");
    let solutionsArr = Array.from(solutionsColl);
    solutionsArr.forEach(element => {
        element.style.removeProperty("display");
    });
}

/** Takes the values from the modal and sets them into the filters dictionary */
function setFilters(){
    filters = [];
    sampleCellArr.forEach(element => {
        if (element.textContent != "\u200b"){
            let cell = element.id.substr(element.id.length - 3, element.id.length - 1);
            let cellValue = 0;
            if(element.children.length == 0){
                cellValue = element.textContent;
            }
            filters.push({"cell": cell, "cellValue": cellValue});
        }
    });
}

/** Gets the div wrapping the solution (board)
 * @param cell A cell within the solution board
 * @return the div element containing this cell
 */
function getContainerFromCell(cell){
    return cell.parentNode.parentNode;
}

/** Resets the filter values within the modal */
function resetFilters() {
    previousActiveCell = null;
    if (activeCell != null){
        activeCell.classList.remove("selected");
        activeCell = null;
    }
    sampleCellArr.forEach(element => {
        element.textContent = "\u200b";
    });
    optionsUl.classList.add("blur");
}