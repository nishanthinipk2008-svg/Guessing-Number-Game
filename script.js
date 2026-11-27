const attemptsDisplay = document.getElementById("attempts");
const message = document.getElementById("message");
const guessInput = document.getElementById("guessInput");
const numberBox = document.getElementById("numberBox");

async function startGame() {
    try {
        const response = await fetch("/api/start", {
            method: "POST"
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.message);

        attemptsDisplay.textContent = "0";
        numberBox.textContent = "?";
        message.textContent = "Game started! Make your first guess.";

        guessInput.disabled = false;
        guessInput.value = "";
        guessInput.focus();

        document.getElementById("guessBtn").disabled = false;
        document.getElementById("startBtn").hidden = true;
        document.getElementById("restartBtn").hidden = true;

    } catch (error) {
        message.textContent = "Cannot connect to server!";
    }
}

async function checkGuess() {
    const guess = Number(guessInput.value);

    if (!guessInput.value || guess < 1 || guess > 100) {
        message.textContent = "Enter a number between 1 and 100!";
        return;
    }

    try {
        const response = await fetch("/api/guess", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ guess })
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.message);

        attemptsDisplay.textContent = data.attempts;
        message.textContent = data.message;

        if (data.status === "won") {
            numberBox.textContent = data.number;
            endGame();
        } else if (data.status === "playing") {
            guessInput.value = "";
            guessInput.focus();
        }

    } catch (error) {
        message.textContent = error.message;
    }
}

function endGame() {
    guessInput.disabled = true;
    document.getElementById("guessBtn").disabled = true;
    document.getElementById("restartBtn").hidden = false;
}

guessInput.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        checkGuess();
    }
});