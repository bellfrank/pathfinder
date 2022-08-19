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

    console.log(walls)
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
        // Send a GET request to the URL
        fetch('http://127.0.0.1:5000/search',{
            method:"POST",
            body: JSON.stringify([...walls]),
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
            function colorcells (cell){
                temp = document.getElementById(`(${cell[0]}, ${cell[1]})`);
                temp.style.backgroundColor = "yellow";
                setTimeout(() => {
                    temp = document.getElementById(`(${cell[0]}, ${cell[1]})`);
                    temp.style.backgroundColor = "orange";
                    current++;
                }, 40);
            }
            
            // Drawing the final path to target

            function draw_path(){
                console.log(current)
                console.log(data["order"].length - 1)

                if (current == (data["order"].length - 1)){
                    console.log("Inside the draw path")
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
        console.log(drag)
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