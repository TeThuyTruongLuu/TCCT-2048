const characterImages = {}; // Lưu hình gán cho các giá trị tile
const tileValues = [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048];
const gridSize = 6;
let grid = [];
let timer = 0; // Biến đếm thời gian
let timerInterval; // Biến lưu interval để dừng/khởi động timer
let timerStarted = false;
let draggedImage = null;

// Chọn nhân vật
document.querySelectorAll(".character").forEach((character) => {
    character.addEventListener("click", () => {
        const charId = character.dataset.id;
        loadCharacterTiles(charId);
        document.getElementById("character-selection").style.display = "none";
        document.getElementById("tile-assignment").style.display = "block";
    });
});

// Load ảnh các tile cho nhân vật
function loadCharacterTiles(charId) {
    const container = document.getElementById("character-tiles");
    container.innerHTML = "";
	const totalImages = 8;
    for (let i = 1; i <= totalImages; i++) {
        const img = document.createElement("img");
        img.src = `images/${charId} (${i}).png`;
        img.draggable = true;
        img.dataset.charId = charId;
        img.dataset.tileIndex = i;

        img.addEventListener("dragstart", (e) => {
            e.dataTransfer.setData("tileIndex", img.dataset.tileIndex);
            e.dataTransfer.setData("charId", img.dataset.charId);
        });

        container.appendChild(img);
    }
}

document.querySelectorAll("#character-tiles img").forEach((img) => {
    // Sự kiện chuột (desktop)
    img.addEventListener("dragstart", (e) => {
        draggedImage = e.target; // Lưu hình ảnh đang kéo
    });

    // Sự kiện cảm ứng (điện thoại)
    img.addEventListener("touchstart", (e) => {
        e.preventDefault(); // Ngăn hành vi mặc định
        draggedImage = e.target; // Lưu hình ảnh đang kéo
    });
});


// Kéo thả hình ảnh vào tiles
document.querySelectorAll(".tile-slot").forEach((slot) => {
    slot.addEventListener("dragover", (e) => e.preventDefault());
    slot.addEventListener("drop", (e) => {
        e.preventDefault();
        const tileIndex = e.dataTransfer.getData("tileIndex");
        const charId = e.dataTransfer.getData("charId");
        const tileValue = slot.dataset.value;

        // Gán ảnh
        slot.innerHTML = `<img src="images/${charId} (${tileIndex}).png" alt="Tile">`;
        characterImages[tileValue] = `images/${charId} (${tileIndex}).png`;
    });
    slot.addEventListener("touchend", (e) => {
        if (draggedImage) {
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;

            // Kiểm tra nếu vị trí thả nằm trong slot
            const slotRect = slot.getBoundingClientRect();
            if (
                touchEndX >= slotRect.left &&
                touchEndX <= slotRect.right &&
                touchEndY >= slotRect.top &&
                touchEndY <= slotRect.bottom
            ) {
                slot.innerHTML = ""; // Xóa nội dung cũ
                const imgClone = draggedImage.cloneNode(true); // Tạo bản sao hình ảnh
                imgClone.style.width = "100%";
                imgClone.style.height = "100%";
                imgClone.style.objectFit = "cover";
                slot.appendChild(imgClone);

                // Gán hình ảnh vào slot
                const tileValue = slot.dataset.value;
                characterImages[tileValue] = draggedImage.src;

                draggedImage = null; // Reset hình ảnh kéo
            }
        }
    });
});

// Bắt đầu game
document.getElementById("confirm-selection").addEventListener("click", () => {
    document.getElementById("tile-assignment").style.display = "none";
    document.getElementById("game-container").style.display = "block";
    createBoard();
    renderBoard();
});

// Tạo bảng game
function createBoard() {
    const gameBoard = document.getElementById("game-board");
    gameBoard.innerHTML = "";
    grid = Array(gridSize)
        .fill(null)
        .map(() => Array(gridSize).fill(0));

    for (let i = 0; i < gridSize * gridSize; i++) {
        const tile = document.createElement("div");
        tile.classList.add("tile");
        tile.innerHTML = `
            <img src="" alt="Tile">
            <div class="tile-overlay"></div>
            <div class="tile-text"></div>
        `;
        gameBoard.appendChild(tile);
    }

    addRandomTile();
    addRandomTile();
}

// Hiển thị bảng game
function renderBoard() {
    const tiles = document.querySelectorAll(".tile");
    let index = 0;

    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            const value = grid[i][j];
            const tile = tiles[index];
            const img = tile.querySelector("img");
            const overlay = tile.querySelector(".tile-overlay");
            const text = tile.querySelector(".tile-text");

            // Hiển thị hình ảnh nếu value > 0, nếu không thì ẩn ảnh
            if (value > 0 && characterImages[value]) {
                img.src = characterImages[value];
                img.style.display = "block"; // Hiển thị ảnh
            } else {
                img.src = ""; // Xóa đường dẫn ảnh
                img.style.display = "none"; // Ẩn ảnh
            }

            // Hiển thị overlay
            overlay.style.backgroundColor = value > 0 ? getTileColor(value) : "transparent";

            // Hiển thị chữ
            text.textContent = value > 0 ? value : "";

            index++;
        }
    }
}



// Thêm ô mới
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
        grid[x][y] = Math.random() < 0.8 ? 2 : 4; // 90% là 2, 10% là 4
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
    stopTimer(); // Dừng timer hiện tại
    timerStarted = false; // Đặt lại trạng thái để khởi động timer khi di chuyển lần đầu
    document.getElementById("timer").textContent = "Time: 00:00"; // Hiển thị mặc định
    createBoard(); // Reset bảng chơi
    renderBoard(); // Hiển thị lại bảng
}



// Đếm thời gian
function startTimer() {
    const timerElement = document.getElementById("timer");
    timer = 0; // Reset lại thời gian
    if (timerInterval) clearInterval(timerInterval); // Đảm bảo không có interval cũ đang chạy

    timerInterval = setInterval(() => {
        timer++;
        const minutes = Math.floor(timer / 60); // Tính số phút
        const seconds = timer % 60; // Tính số giây còn lại
        timerElement.textContent = `Time: ${formatTime(minutes)}:${formatTime(seconds)}`; // Hiển thị thời gian
    }, 1000);
}

// Hàm định dạng thời gian
function formatTime(value) {
    return value < 10 ? `0${value}` : value; // Thêm số 0 nếu giá trị < 10
}


function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval); // Xóa interval
        timerInterval = null; // Đặt lại biến
    }
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

// Di chuyển ô theo hướng
function move(direction) {
    let moved = false;
    if (!timerStarted) {
        timerStarted = true;
        startTimer();
    }

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
				stopTimer();
				const minutes = Math.floor(timer / 60);
				const seconds = timer % 60;
                alert(`Hooray! Bồ đã hoàn thành 2048 trong ${formatTime(minutes)}:${formatTime(seconds)}!`);
                restartGame();
                return;
            }
        }
    }

    // Kiểm tra còn nước đi nào không
    if (!canMove()) {
		stopTimer();
		const minutes = Math.floor(timer / 60);
		const seconds = timer % 60;
        alert("Game Over! Bí lối rồi.");
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
