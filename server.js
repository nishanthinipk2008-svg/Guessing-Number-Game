const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;

let secretNumber = 0;
let attempts = 0;
let gameStarted = false;

const frontendPath = path.join(__dirname, "../frontend");

const server = http.createServer((req, res) => {

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        res.writeHead(204);
        return res.end();
    }

    function sendJSON(status, data) {
        res.writeHead(status, {
            "Content-Type": "application/json"
        });
        res.end(JSON.stringify(data));
    }

    if (req.url === "/api/start" && req.method === "POST") {
        secretNumber = Math.floor(Math.random() * 100) + 1;
        attempts = 0;
        gameStarted = true;

        return sendJSON(200, {
            message: "New game started!"
        });
    }

    if (req.url === "/api/guess" && req.method === "POST") {
        let body = "";

        req.on("data", chunk => {
            body += chunk;
        });

        req.on("end", () => {
            try {
                const data = JSON.parse(body);
                const guess = data.guess;

                if (!gameStarted) {
                    return sendJSON(400, {
                        message: "Start the game first!"
                    });
                }

                if (!Number.isInteger(guess) || guess < 1 || guess > 100) {
                    return sendJSON(400, {
                        message: "Enter a valid number!"
                    });
                }

                attempts++;

                if (guess === secretNumber) {
                    gameStarted = false;

                    return sendJSON(200, {
                        status: "won",
                        message: "🎉 Congratulations! You Won!",
                        number: secretNumber,
                        attempts: attempts
                    });
                }

                return sendJSON(200, {
                    status: "playing",
                    message: guess > secretNumber
                        ? "Too High! Try a smaller number 🔺"
                        : "Too Low! Try a bigger number 🔻",
                    attempts: attempts
                });

            } catch (error) {
                return sendJSON(400, {
                    message: "Invalid request!"
                });
            }
        });

        return;
    }

    const requestedFile = req.url === "/"
        ? "index.html"
        : decodeURIComponent(req.url.split("?")[0].slice(1));

    const filePath = path.resolve(frontendPath, requestedFile);

    if (!filePath.startsWith(frontendPath + path.sep)) {
        return sendJSON(403, { message: "Access denied" });
    }

    const contentTypes = {
        ".html": "text/html",
        ".css": "text/css",
        ".js": "text/javascript"
    };

    fs.readFile(filePath, (error, content) => {
        if (error) {
            res.writeHead(404);
            return res.end("File not found");
        }

        res.writeHead(200, {
            "Content-Type":
                contentTypes[path.extname(filePath)] || "text/plain"
        });

        res.end(content);
    });
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});