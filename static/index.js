// Keeps track of walls drawn
const walls = new Set()

// Method to continuosly draw black grids while mouse down
let drawing = false;

// Keeps track if user is handling a start or finish cell
let drag = false

// User clicks mouse
document.addEventListener('mousedown', function () {
    if (drag)
        return
    drawing = true
    console.log("drawing mouse down: ", drawing)
    draw_point()
})

// User lets go of click
document.addEventListener('mouseup', function () {
    drawing = false
    console.log("drawing mouse up: ",drawing)
});

// Hovering
document.addEventListener('mouseover', draw_point)

// When user clicks and hovers while still mainining click down
function draw_point() {

    if (!drawing)
        return;

    // Creates a tree of html structure over hovering area
    const cells = document.querySelectorAll(":hover");
    const cell = cells[cells.length - 1]

    // Don't draw on start and finish cells
    if (cell.style.backgroundColor == "red" || cell.style.backgroundColor == "green"){
        return;
    }

    if (cell.matches('td')){
        cell.style.backgroundColor = "black"
        // if cell already visited, turn white, else turn black
        if (walls.has(cell.id)) {
            walls.delete(cell.id)
            cell.style.backgroundColor = "white"
        } else {
            walls.add(cell.id)
        }
        
    };
};

// Submit Button
document.addEventListener('DOMContentLoaded', function(){
    document.querySelector('#search_button').onclick = function(){
        // Also fetch the method wanted
        algo = document.querySelector("select").value
        if (algo == "all")
            return
        // Send a GET request to the URL
        fetch('http://127.0.0.1:5000/search',{
            method:"POST",
            body: JSON.stringify({"walls":[...walls],"algo":algo}),
            headers: {
                "Content-Type": "application/json" 
            }   
        })
        // Put response into json form
        .then(response => response.json())
        .then(data => {
            
            let current = 1;

            function initialize(){
                for (let i = 1; i < data["order"].length - 1; i++) {
                    let cell = data["order"][i]
                    setTimeout(() => {
                        colorcells(cell)
                    }, i * 5);
                   
                }
            }
          
            // Creates visual effect when swarming towards target

            const cell_count = document.querySelector('#state_count')
            
            function colorcells (cell){
                temp = document.getElementById(`(${cell[0]}, ${cell[1]})`);
                temp.style.backgroundColor = "yellow";
                setTimeout(() => {
                    // Change swarming cells to orange
                    temp = document.getElementById(`(${cell[0]}, ${cell[1]})`);
                    temp.style.backgroundColor = "orange";
                    current++;

                    // update cell count variable
                    if(current <= data["states"]){
                        cell_count.innerHTML = current;
                    }
                    

                }, 40);
            }
            
            // Drawing the final path to target

            function draw_path(){

                if (current == (data["order"].length - 1)){
                    for (let i = 0; i < data["solution"].length; i++) {
                        let cell = data["solution"][i];

                        temp = document.getElementById(`(${cell[0]}, ${cell[1]})`);
                        temp.style.backgroundColor = "yellow";
                    };
                } else{
                    setTimeout(() => {
                        draw_path()
                    }, 2);
                }
            }
            
            initialize()
            draw_path()

        })
    }
})

// Manhattan Heuristic Function, calculates the path cost L shape
function heuristic(cell){
    var position = cell.slice(1,cell.length-1).split(",")
    let x = parseInt(position[0])
    let y = parseInt(position[1])

    cost = Math.abs((5 - x)) + Math.abs((20 - y))

    return cost
}

// Method that writes the cost to finish line, gets the ID from Finish and does computations to start
const colors = ["green", "red", "black"]
function greedy_cost(){
    document.querySelectorAll('td').forEach(function (td) {
        if (td.style.backgroundColor == "") {
            // Manhattan
            console.log(td.style.backgroundColor)
            var cost = heuristic(td.id)
            td.innerHTML = cost
        }
    })
}

function clear_numbers() {
    document.querySelectorAll('td').forEach(function (td) {
        td.innerHTML = ""
        
        
    })
}

// Clears out the previous run while keeping the current walls drawn by user
document.addEventListener('DOMContentLoaded', function () {
    document.querySelector('select').onchange = function() {
        document.querySelectorAll('td').forEach(function (td) {
            if (td.style.backgroundColor == "yellow" || td.style.backgroundColor == "orange")
                td.style.backgroundColor = "";

        });

        if (this.value == "greedy" || this.value == "astar"){
            greedy_cost()
        }
        else {
            clear_numbers()
        }
    }
});

// Clear Button
document.addEventListener('DOMContentLoaded', function () {

    document.querySelector('#clear_button').onclick = function () {
        window.location.reload()
    }
})

// Set a start and finish cell
document.addEventListener('DOMContentLoaded', function (){
    // Start and finish cells
    start = document.getElementById('(20, 5)')
    finish = document.getElementById('(5, 20)')

    // Assign colors
    start.style.backgroundColor = "green";
    finish.style.backgroundColor = "red";

    // Allow draggable events, set to true
    start.setAttribute("draggable", "true")
    finish.setAttribute("draggable", "true")
    
    // Adding event listeners to the start and finish buttons
    start.addEventListener('dragstart', handleDragStart);
    start.addEventListener('dragend', handleDragEnd);
    start.addEventListener('drop', handleDrop)

    start.addEventListener('mousedown', function () {
        drag = true
    });

    start.addEventListener('mouseup', function () {
        drag = false
        console.log(drag)
    });


    finish.addEventListener('dragstart', handleDragStart);
    finish.addEventListener('dragend', handleDragEnd);
    finish.addEventListener('drop', handleDrop)

    finish.addEventListener('mousedown', function () {
        drag = true
    });

    finish.addEventListener('mouseup', function () {
        drag = false
    });
});


// Allowing start and finish to be dragged and dropped anywhere on map
document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('td').forEach( function(td){
        td.addEventListener('drop', handleDrop);
    });
});

function handleDrop(e) {
    e.stopPropagation();

    if (dragSrcEl !== this) {
        dragSrcEl.innerHTML = this.innerHTML;
        this.innerHTML = e.dataTransfer.getData('text/html');
    }

    return false;
}

// Handle Drag Start
function handleDragStart(e) {
    drag = true
    
    this.style.opacity = '0.4';

    dragSrcEl = this;

    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);
}

function handleDragEnd(e) {
    drag = false
    this.style.opacity = '1';
}


