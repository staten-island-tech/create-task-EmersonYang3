const configs = {
  minimumBet: 0.0,
  defaultCoal: 3,
  houseEdge: 0.02,
  defaultBalance: 1000.0,
  safePresentImage: "src/images/money.png",
  coalImage: "src/images/coal_pile.png",
  presentImage: "src/images/present.png",
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
  winMultiplier: 1.0,
  winAmount: 0.0,
  balance: configs.defaultBalance,
  safePresentsLeft: 0,
  coalPresentsLeft: 0,
  board: [],
};

function applyConfigs() {
  DOMSelectors.balance.textContent = `Balance: $${configs.defaultBalance.toFixed(
    2
  )}`;
  DOMSelectors.numberOfCoalField.value = configs.defaultCoal;
}

const balanceService = {
  refreshWin() {
    const totalCells = 25;
    const minesCount = gameStatus.coalPresentsLeft;
    const safeCellsCount = totalCells - minesCount;
    const uncoveredSafeCells = safeCellsCount - gameStatus.safePresentsLeft;

    function binomialCoefficient(total, choose) {
      if (choose > total) return 0;
      if (choose === 0 || choose === total) return 1;
      let coefficient = 1;
      for (let i = 1; i <= choose; i++) {
        coefficient *= (total - i + 1) / i;
      }
      return coefficient;
    }

    const totalUncoveredCombinations = binomialCoefficient(
      totalCells,
      uncoveredSafeCells
    );
    const safeUncoveredCombinations = binomialCoefficient(
      safeCellsCount,
      uncoveredSafeCells
    );

    const payoutMultiplier =
      (totalUncoveredCombinations / safeUncoveredCombinations) *
      (1 - configs.houseEdge);

    gameStatus.winMultiplier = payoutMultiplier;
    gameStatus.winAmount = gameStatus.betAmount * gameStatus.winMultiplier;

    DOMSelectors.winField.textContent = `$ ${gameStatus.winAmount.toFixed(
      2
    )} (${gameStatus.winMultiplier.toFixed(2)}x)`;
  },

  cashOut() {
    gameStatus.balance += gameStatus.winAmount;
    DOMSelectors.balance.textContent = `Balance: $${gameStatus.balance.toFixed(
      2
    )}`;
    gameStatus.gameInSession = false;
    [
      "betAmountField",
      "numberOfCoalField",
      "halfBetButton",
      "doubleBetButton",
    ].forEach((id) => {
      DOMSelectors[id].disabled = false;
    });

    DOMSelectors.betButton.textContent = "Open Presents!";
  },
};

const gameBoardService = {
  populateCoals(coalAmount, gameBoard) {
    gameBoard.length = 0;

    for (let i = 0; i < 25; i++) {
      if (i < coalAmount) {
        gameBoard.push(1);
      } else {
        gameBoard.push(0);
      }
    }

    // Shuffle the gameBoard
    for (let i = gameBoard.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [gameBoard[i], gameBoard[j]] = [gameBoard[j], gameBoard[i]];
    }

    gameStatus.coalPresentsLeft = coalAmount;
    gameStatus.safePresentsLeft = 25 - coalAmount;

    Array.from(DOMSelectors.presentContainer.children).forEach((button, i) => {
      button.style.backgroundImage = `url(${configs.presentImage})`;
      button.classList.remove("reveal", "presented", "coal", "done");
      if (gameBoard[i] === 1) {
        button.classList.add("coal");
      }
    });
  },

  revealPresent(present, skipGameLogic = false) {
    if (!gameStatus.gameInSession && !skipGameLogic) return;

    present.classList.add("hide");
    if (!skipGameLogic && present.classList.contains("coal")) {
      gameStatus.gameInSession = false;
    }

    setTimeout(() => {
      present.style.backgroundImage = `url(${
        present.classList.contains("coal")
          ? configs.coalImage
          : configs.safePresentImage
      })`;
      if (!skipGameLogic && !present.classList.contains("coal")) {
        gameStatus.safePresentsLeft -= 1;
        balanceService.refreshWin();
      }
      if (!skipGameLogic && present.classList.contains("coal")) {
        gameBoardService.loseGame();
      }
      present.classList.remove("hide");
      present.classList.add("reveal");
    }, 375);

    setTimeout(() => {
      present.classList.remove("reveal");
      present.classList.add("presented");
    }, 775);
  },

  revealAllPresent() {
    DOMSelectors.betButton.removeEventListener(
      "click",
      betSettingService.betButtonEvent
    );

    Array.from(DOMSelectors.presentContainer.children).forEach((present) => {
      this.revealPresent(present, true);
      present.classList.remove("done");
      present.classList.remove("presented");
    });

    setTimeout(() => {
      DOMSelectors.betButton.addEventListener(
        "click",
        betSettingService.betButtonEvent
      );
    }, 800);
  },

  loseGame() {
    ["betAmountField", "numberOfCoalField"].forEach((id) => {
      DOMSelectors[id].disabled = false;
    });
    DOMSelectors.winField.textContent = "You got coal! (0.00x)";
    DOMSelectors.betButton.textContent = "Open Presents!";

    this.revealAllPresent();

    gameStatus.gameInSession = false;
    [
      "betAmountField",
      "numberOfCoalField",
      "halfBetButton",
      "doubleBetButton",
    ].forEach((id) => {
      DOMSelectors[id].disabled = false;
    });
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

  betButtonEvent() {
    if (
      !gameStatus.betAmount ||
      gameStatus.betAmount.toFixed(2) <= configs.minimumBet
    )
      return;

    if (!gameStatus.gameInSession) {
      if (gameStatus.balance < gameStatus.betAmount) {
        alert("You don't have enough money to bet that amount!");
        return;
      }

      [
        "betAmountField",
        "numberOfCoalField",
        "halfBetButton",
        "doubleBetButton",
      ].forEach((id) => {
        DOMSelectors[id].disabled = true;
      });

      gameStatus.balance -= gameStatus.betAmount;
      gameStatus.safePresentsLeft = 25 - gameStatus.coalAmount;
      DOMSelectors.balance.textContent = `Balance: $${gameStatus.balance.toFixed(
        2
      )}`;
      DOMSelectors.betButton.textContent = "Leave The Factory...";
      gameStatus.gameInSession = true;
      gameBoardService.populateCoals(gameStatus.coalAmount, gameStatus.board);
      balanceService.refreshWin();
    } else {
      gameStatus.gameInSession = false;
      balanceService.cashOut();
      gameBoardService.revealAllPresent();
    }
  },
};

const handleBetInput = (event) => {
  if (event.type === "keydown" && event.key !== "Enter") return;
  betSettingService.betInput(event.target.value);
};

function attachListeners() {
  DOMSelectors.betAmountField.addEventListener("keydown", handleBetInput);
  DOMSelectors.halfBetButton.addEventListener("click", () =>
    betSettingService.adjustBet(0.5)
  );
  DOMSelectors.doubleBetButton.addEventListener("click", () =>
    betSettingService.adjustBet(2)
  );
  DOMSelectors.betAmountField.addEventListener("blur", handleBetInput);
  DOMSelectors.betButton.addEventListener(
    "click",
    betSettingService.betButtonEvent
  );
  DOMSelectors.numberOfCoalField.addEventListener("input", (event) =>
    betSettingService.minesInput(event.target.value)
  );

  Array.from(DOMSelectors.presentContainer.children).forEach((present) => {
    present.addEventListener("click", (event) => {
      if (
        present.classList.contains("presented") ||
        present.classList.contains("done")
      )
        return;
      present.classList.add("done");
      gameBoardService.revealPresent(present);
    });
  });
}

applyConfigs();
attachListeners();
