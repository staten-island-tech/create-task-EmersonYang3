// Image sources from Pixabay (Free for use under Pixabay Content License):
// Treasure chest: pixabay.com/vectors/treasure-khajana-gold-gold-coins-5193772/
// Present box: pixabay.com/vectors/present-box-gift-ribbon-wrapped-307775/
// Coal Image: pixabay.com/vectors/stone-rock-slab-marble-black-coal-8694303/

const configs = {
  minimumBet: 0.0,
  defaultCoal: 3,
  houseEdge: 0.02,
  defaultBalance: 1000.0,
  safePresentImage: "src/images/treasure_chest.png",
  coalImage: "src/images/coal.png",
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

const TOTAL_CELLS = 25;

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
  revealedPresents: new Set(),
};

function applyConfigs() {
  DOMSelectors.balance.textContent = `Balance: $${configs.defaultBalance.toFixed(
    2
  )}`;
  DOMSelectors.numberOfCoalField.value = configs.defaultCoal;
  Array.from(DOMSelectors.presentContainer.children).forEach((button) => {
    button.style.backgroundImage = `url(${configs.presentImage})`;
  });
}

function setElementsDisabled(disabled) {
  DOMSelectors.betAmountField.disabled = disabled;
  DOMSelectors.numberOfCoalField.disabled = disabled;
  DOMSelectors.halfBetButton.disabled = disabled;
  DOMSelectors.doubleBetButton.disabled = disabled;
}

const balanceService = {
  refreshWin() {
    const minesCount = gameStatus.coalPresentsLeft;
    const safeCellsCount = TOTAL_CELLS - minesCount;
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
      TOTAL_CELLS,
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

    DOMSelectors.winField.textContent = `$${gameStatus.winAmount.toFixed(
      2
    )} (${gameStatus.winMultiplier.toFixed(2)}x)`;
  },

  cashOut() {
    gameStatus.balance += gameStatus.winAmount;
    DOMSelectors.balance.textContent = `Balance: $${gameStatus.balance.toFixed(
      2
    )}`;
    gameStatus.gameInSession = false;
    setElementsDisabled(false);
    DOMSelectors.betButton.textContent = "Open Presents!";
  },
};

const gameBoardService = {
  populateCoals(coalAmount, gameBoard) {
    gameBoard.length = 0;
    gameStatus.revealedPresents.clear();

    for (let i = 0; i < TOTAL_CELLS; i++) {
      gameBoard.push(i < coalAmount ? 1 : 0);
    }

    for (let i = gameBoard.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [gameBoard[i], gameBoard[j]] = [gameBoard[j], gameBoard[i]];
    }

    gameStatus.coalPresentsLeft = coalAmount;
    gameStatus.safePresentsLeft = TOTAL_CELLS - coalAmount;

    Array.from(DOMSelectors.presentContainer.children).forEach((button) => {
      button.style.backgroundImage = `url(${configs.presentImage})`;
      button.classList.remove("reveal", "presented");
    });
  },

  revealPresent(present, skipGameLogic = false) {
    const index = parseInt(present.id, 10);
    if (!gameStatus.gameInSession && !skipGameLogic) return;
    if (gameStatus.revealedPresents.has(index)) return;

    gameStatus.revealedPresents.add(index);
    present.classList.add("hide");

    if (!skipGameLogic && gameStatus.board[index] === 1) {
      gameStatus.gameInSession = false;
    }

    setTimeout(() => {
      present.style.backgroundImage = `url(${
        gameStatus.board[index] === 1
          ? configs.coalImage
          : configs.safePresentImage
      })`;
      if (!skipGameLogic && gameStatus.board[index] !== 1) {
        gameStatus.safePresentsLeft -= 1;
        balanceService.refreshWin();
      }
      if (!skipGameLogic && gameStatus.board[index] === 1) {
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
    setElementsDisabled(false);
    DOMSelectors.winField.textContent = "You got coal! (0.00x)";
    DOMSelectors.betButton.textContent = "Open Presents!";

    this.revealAllPresent();

    gameStatus.gameInSession = false;
    setElementsDisabled(false);
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

      setElementsDisabled(true);

      gameStatus.balance -= gameStatus.betAmount;
      gameStatus.safePresentsLeft = TOTAL_CELLS - gameStatus.coalAmount;
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
    present.addEventListener("click", () => {
      if (
        !gameStatus.gameInSession ||
        gameStatus.revealedPresents.has(parseInt(present.id, 10))
      )
        return;
      gameBoardService.revealPresent(present);
    });
  });
}

applyConfigs();
attachListeners();
