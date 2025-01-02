const gridSize = 8;
let grid = [];
let timer = 0;
let interval;

// Tạo bảng chơi
function createBoard() {
    const gameBoard = document.getElementById("game-board");
    gameBoard.innerHTML = ""; // Xóa bảng cũ
    grid = Array(gridSize)
        .fill(null)
        .map(() => Array(gridSize).fill(0));

    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            const tile = document.createElement("div");
            tile.classList.add("tile");

            const background = document.createElement("div");
            background.classList.add("tile-background");

            const overlay = document.createElement("div");
            overlay.classList.add("tile-overlay");

            const text = document.createElement("div");
            text.classList.add("tile-text");

            tile.appendChild(background);
            tile.appendChild(overlay);
            tile.appendChild(text);
            gameBoard.appendChild(tile);
        }
    }

    addRandomTile();
    addRandomTile();
    renderBoard();
}


// Thêm ô mới vào bảng
function addRandomTile() {
    const emptyTiles = [];
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            if (grid[i][j] === 0) {
                emptyTiles.push({ x: i, y: j });
            }
        }
    }

    if (emptyTiles.length > 0) {
        const { x, y } = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
        grid[x][y] = Math.random() < 0.8 ? 2 : 4;
    }
}

// Hiển thị bảng chơi
function renderBoard() {
    const tiles = document.querySelectorAll(".tile");
    let index = 0;

    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            const value = grid[i][j];
            const tile = tiles[index];
            const background = tile.querySelector(".tile-background");
            const overlay = tile.querySelector(".tile-overlay");
            const text = tile.querySelector(".tile-text");

            // Xác định index hình ảnh (log2 của giá trị)
            const imageIndex = value > 0 ? Math.log2(value) : 0;

            // Ghi rõ đường dẫn tới file hình ảnh
            const imagePath = imageIndex > 0 ? `images/Khuu (${imageIndex}).png` : "";

            // Gán hình ảnh vào background
            background.style.backgroundImage = imagePath ? `url(${imagePath})` : "";

            // Hiển thị overlay màu
            overlay.style.backgroundColor = value === 0 ? "rgba(0, 0, 0, 0.8)" : getTileColor(value);

            // Hiển thị chữ
            text.textContent = value === 0 ? "" : value;

            index++;
        }
    }
}



// Màu sắc dựa trên giá trị ô
function getTileColor(value) {
    const colors = {
        0: "#cdc1b4",
        2: "#eee4da",
        4: "#ede0c8",
        8: "#f2b179",
        16: "#f59563",
        32: "#f67c5f",
        64: "#f65e3b",
        128: "#edcf72",
        256: "#edcc61",
        512: "#edc850",
        1024: "#edc53f",
        2048: "#edc22e",
    };
    return colors[value] || "#3c3a32";
}

// Khởi động lại game
function restartGame() {
    clearInterval(interval);
    timer = 0;
    document.getElementById("timer").textContent = `Time: 0s`;
    startTimer();
    createBoard();
}

// Đếm thời gian
function startTimer() {
    interval = setInterval(() => {
        timer++;
        document.getElementById("timer").textContent = `Time: ${timer}s`;
    }, 1000);
}

// Xử lý nút di chuyển
function move(direction) {
    // Logic di chuyển (thêm sau)
    addRandomTile();
    renderBoard();
}

// Lắng nghe sự kiện bàn phím
document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") move("left");
    else if (e.key === "ArrowRight") move("right");
    else if (e.key === "ArrowUp") move("up");
    else if (e.key === "ArrowDown") move("down");
});

// Lắng nghe nút Restart
document.getElementById("restart-button").addEventListener("click", restartGame);

// Bắt đầu game
createBoard();
startTimer();

// Di chuyển ô theo hướng
function move(direction) {
    let moved = false;

    if (direction === "left") {
        for (let row = 0; row < gridSize; row++) {
            let newRow = compressAndMerge(grid[row]); // Gộp ô sang trái
            grid[row] = newRow;
            moved = true;
        }
    } else if (direction === "right") {
        for (let row = 0; row < gridSize; row++) {
            let reversedRow = grid[row].slice().reverse();
            let newRow = compressAndMerge(reversedRow).reverse(); // Gộp ô sang phải
            grid[row] = newRow;
            moved = true;
        }
    } else if (direction === "up") {
        for (let col = 0; col < gridSize; col++) {
            let column = getColumn(grid, col);
            let newCol = compressAndMerge(column); // Gộp ô lên trên
            setColumn(grid, col, newCol);
            moved = true;
        }
    } else if (direction === "down") {
        for (let col = 0; col < gridSize; col++) {
            let column = getColumn(grid, col).reverse();
            let newCol = compressAndMerge(column).reverse(); // Gộp ô xuống dưới
            setColumn(grid, col, newCol);
            moved = true;
        }
    }

    if (moved) {
        addRandomTile();
        renderBoard();
        checkGameOver(); // Kiểm tra điều kiện thắng/thua
    }
}

// Lấy cột từ lưới
function getColumn(grid, colIndex) {
    return grid.map((row) => row[colIndex]);
}

// Gán giá trị cho cột
function setColumn(grid, colIndex, newCol) {
    for (let row = 0; row < gridSize; row++) {
        grid[row][colIndex] = newCol[row];
    }
}

// Gộp và nén ô trong một dòng/cột
function compressAndMerge(line) {
    let compressed = line.filter((num) => num !== 0); // Loại bỏ ô trống
    for (let i = 0; i < compressed.length - 1; i++) {
        if (compressed[i] === compressed[i + 1]) {
            compressed[i] *= 2; // Gộp ô
            compressed[i + 1] = 0; // Ô tiếp theo thành trống
        }
    }
    compressed = compressed.filter((num) => num !== 0); // Loại bỏ ô trống sau khi gộp
    while (compressed.length < gridSize) compressed.push(0); // Bổ sung ô trống
    return compressed;
}

// Kiểm tra điều kiện thắng/thua
function checkGameOver() {
    // Kiểm tra có ô nào đạt 2048 không
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            if (grid[row][col] === 2048) {
                alert(`Congratulations! You reached 2048 in ${timer} seconds!`);
                restartGame();
                return;
            }
        }
    }

    // Kiểm tra còn nước đi nào không
    if (!canMove()) {
        alert("Game Over! No moves left.");
        restartGame();
    }
}

// Kiểm tra có thể di chuyển được không
function canMove() {
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            if (grid[row][col] === 0) return true; // Còn ô trống
            if (col < gridSize - 1 && grid[row][col] === grid[row][col + 1]) return true; // Có thể gộp ngang
            if (row < gridSize - 1 && grid[row][col] === grid[row + 1][col]) return true; // Có thể gộp dọc
        }
    }
    return false; // Không còn nước đi
}
