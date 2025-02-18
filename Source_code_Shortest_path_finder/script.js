const gridSize = 20;
let grid = [];
let startCell = null;
let endCell = null;
let walls = [];
let allPaths = []; // Store all the paths
let totalPaths = 0;

document.addEventListener('DOMContentLoaded', () => {
    createGrid(); // Create the grid when the document is ready
});

function createGrid() {
    const gridContainer = document.getElementById('grid');
    gridContainer.innerHTML = ''; // Clear any existing grid

    grid = [];
    walls = [];
    allPaths = [];
    totalPaths = 0;

    for (let row = 0; row < gridSize; row++) {
        const gridRow = [];
        for (let col = 0; col < gridSize; col++) {
            const cell = document.createElement('div');
            cell.classList.add('grid-cell');
            cell.dataset.row = row;
            cell.dataset.col = col;

            // Add event listener for cell clicks
            cell.addEventListener('click', () => handleCellClick(row, col));

            gridRow.push(cell);
            gridContainer.appendChild(cell); // Append each cell to the grid container
        }
        grid.push(gridRow);
    }
}

function handleCellClick(row, col) {
    const clickedCell = grid[row][col];
    if (!startCell) {
        startCell = clickedCell;
        startCell.classList.add('start');
    } else if (!endCell) {
        endCell = clickedCell;
        endCell.classList.add('end');
    } else {
        clickedCell.classList.toggle('wall');
        if (clickedCell.classList.contains('wall')) {
            walls.push({ row, col });
        } else {
            walls = walls.filter(wall => wall.row !== row || wall.col !== col);
        }
    }
}

function clearGrid() {
    startCell = null;
    endCell = null;
    walls = [];
    allPaths = [];
    totalPaths = 0;
    document.getElementById('stepCount').innerText = 0;
    document.getElementById('pathCount').innerText = 0;
    createGrid();
}

// Dijkstra Algorithm to find multiple paths
function startDijkstra() {
    resetPath();
    console.log("Starting Dijkstra's Algorithm...");

    const openList = [];
    const closedList = [];
    const start = { row: parseInt(startCell.dataset.row), col: parseInt(startCell.dataset.col), g: 0, parent: null };
    openList.push(start);

    // Initialize parent arrays to track all paths
    const parentMap = new Map();
    parentMap.set(`${start.row},${start.col}`, [null]);

    while (openList.length > 0) {
        openList.sort((a, b) => a.g - b.g); // Sort by g (shortest distance)
        const current = openList.shift();
        closedList.push(current);

        if (current.row === parseInt(endCell.dataset.row) && current.col === parseInt(endCell.dataset.col)) {
            reconstructPaths(current, parentMap); // Reconstruct all paths when the end is reached
            return;
        }

        getNeighbors(current).forEach(neighbor => {
            if (closedList.some(cell => cell.row === neighbor.row && cell.col === neighbor.col)) return;

            const g = current.g + 1;

            if (!openList.some(cell => cell.row === neighbor.row && cell.col === neighbor.col && g >= cell.g)) {
                neighbor.g = g;
                if (!parentMap.has(`${neighbor.row},${neighbor.col}`)) {
                    parentMap.set(`${neighbor.row},${neighbor.col}`, [current]);
                } else {
                    parentMap.get(`${neighbor.row},${neighbor.col}`).push(current);
                }
                openList.push(neighbor);
            }
        });
    }
}

function getNeighbors(cell) {
    const neighbors = [];
    const directions = [
        { row: -1, col: 0 }, { row: 1, col: 0 }, // Up, Down
        { row: 0, col: -1 }, { row: 0, col: 1 }  // Left, Right
    ];

    directions.forEach(direction => {
        const newRow = cell.row + direction.row;
        const newCol = cell.col + direction.col;

        if (newRow >= 0 && newRow < gridSize && newCol >= 0 && newCol < gridSize) {
            const neighborCell = grid[newRow][newCol];
            if (!neighborCell.classList.contains('wall')) {
                neighbors.push({ row: newRow, col: newCol });
            }
        }
    });

    return neighbors;
}

function reconstructPaths(cell, parentMap) {
    const paths = [];
    let currentPath = [];
    let current = cell;

    // Backtrack from multiple parents to find all possible paths
    let parents = parentMap.get(`${current.row},${current.col}`);

    while (parents.length > 0) {
        let parent = parents.pop();

        while (parent) {
            currentPath.push(grid[current.row][current.col]);
            current = parent;
            parent = parentMap.get(`${current.row},${current.col}`).pop();
        }
        paths.push([...currentPath.reverse()]);
        currentPath = [];
    }

    paths.forEach((path, index) => {
        // Display all paths in yellow, including the start point
        path.forEach((cell, idx) => {
            cell.classList.add('path');  // Path in yellow
        });
    });

    // Ensure the start point is also yellow (if not already)
    if (startCell) {
        startCell.classList.add('path'); // Set start to yellow
    }

    // Update the step count for the first path
    document.getElementById('stepCount').innerText = paths[0].length;

    // Update the total number of paths
    totalPaths = paths.length;
    document.getElementById('pathCount').innerText = totalPaths;
}

function resetPath() {
    const cells = document.querySelectorAll('.grid-cell');
    cells.forEach(cell => {
        cell.classList.remove('path');
    });
}

