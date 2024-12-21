const configs = {
  minimumBet: 0.0,
  defaultCoal: 3,
  defaultBalance: 1000.0,
  safePresentImage: "images/coal_pile.png",
  coalImage: "src/images/coal_pile.png",
};

const DOMSelectors = {
  betAmountField: document.getElementById("bet-amount"),
  halfBetButton: document.getElementById("halve-bet"),
  doubleBetButton: document.getElementById("double-bet"),
  numberOfCoalField: document.getElementById("Coal"),
  winField: document.getElementById("total-payout"),
  betButton: document.querySelector(".bet-button"),
  presentContainer: document.querySelector(".present-container"),
  balance: document.getElementById("balance"),
};

let gameStatus = {
  gameInSession: false,
  betAmount: configs.minimumBet,
  coalAmount: configs.defaultCoal,
  balance: configs.defaultBalance,
  safePresentsLeft: 0,
  coalPresentsLeft: 0,
  board: [],
};

function applyConfigs() {
  DOMSelectors.balance.textContent =
    "Balance: $" + configs.defaultBalance.toFixed(2);
  DOMSelectors.numberOfCoalField.value = configs.defaultCoal;
}

const gameBoardService = {
  populateCoals() {
    gameStatus.board = [];
    gameStatus.coalPresentsLeft = 0;
    gameStatus.safePresentsLeft = 0;

    for (let i = 0; i < gameStatus.coalAmount; i++) {
      gameStatus.board.push(1);
      gameStatus.coalPresentsLeft++;
    }

    while (gameStatus.board.length < 25) {
      gameStatus.board.push(0);
      gameStatus.safePresentsLeft++;
    }

    for (let i = gameStatus.board.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [gameStatus.board[i], gameStatus.board[j]] = [
        gameStatus.board[j],
        gameStatus.board[i],
      ];
    }

    for (let i = 0; i < gameStatus.board.length; i++) {
      const button = document.getElementById((i + 1).toString());
      if (gameStatus.board[i] === 1) {
        button.style.backgroundImage = `url(${configs.coalImage})`;
      }
    }

    console.log(gameStatus.board);
  },
};

const betSettingService = {
  betInput(input) {
    const betAmount =
      input === "" || input < configs.minimumBet
        ? configs.minimumBet
        : parseFloat(input);

    gameStatus.betAmount = Math.min(betAmount, gameStatus.balance);
    DOMSelectors.betAmountField.value = gameStatus.betAmount.toFixed(2);
  },

  adjustBet(factor) {
    const adjustedBet = gameStatus.betAmount * factor;
    gameStatus.betAmount = Math.max(
      configs.minimumBet,
      Math.min(adjustedBet, gameStatus.balance)
    );
    DOMSelectors.betAmountField.value = gameStatus.betAmount.toFixed(2);
  },

  minesInput(input) {
    gameStatus.coalAmount = Math.max(0, parseInt(input, 10));
    DOMSelectors.numberOfCoalField.value = gameStatus.coalAmount;
  },

  betStart() {
    if (!gameStatus.betAmount) return;

    if (!gameStatus.gameInSession) {
      [
        "betAmountField",
        "numberOfCoalField",
        "betButton",
        "halfBetButton",
        "doubleBetButton",
      ].forEach((id) => {
        DOMSelectors[id].disabled = true;
      });

      DOMSelectors.winField.textContent =
        "$ " + gameStatus.betAmount.toFixed(2) + " (1.00x)";
      gameStatus.balance -= gameStatus.betAmount;
      DOMSelectors.balance.textContent =
        "Balance: $" + gameStatus.balance.toFixed(2);
      DOMSelectors.betButton.textContent = "Leave The Factory...";
      gameStatus.gameInSession = true;
      gameBoardService.populateCoals();
      return;
    }
  },
};

const handleBetInput = (event) => {
  if (event.type === "keydown" && event.key !== "Enter") return;
  betSettingService.betInput(event.target.value);
};

applyConfigs();

function attachListeners() {
  DOMSelectors.betAmountField.addEventListener("keydown", handleBetInput);
  DOMSelectors.halfBetButton.addEventListener("click", () =>
    betSettingService.adjustBet(0.5)
  );
  DOMSelectors.doubleBetButton.addEventListener("click", () =>
    betSettingService.adjustBet(2)
  );
  DOMSelectors.betAmountField.addEventListener("blur", handleBetInput);
  DOMSelectors.betButton.addEventListener("click", betSettingService.betStart);
  DOMSelectors.numberOfCoalField.addEventListener("input", (event) =>
    betSettingService.minesInput(event.target.value)
  );
}

function main() {
  attachListeners();
}

main();
