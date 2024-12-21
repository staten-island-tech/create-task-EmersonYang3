const configs = {
  minimumBet: 0.0,
  defaultCoal: 3,
  defaultBalance: 1000.0,
  safePresentImage: "images/",
  coalImage: "images/",
};

const DOMSelectors = {
  betAmountField: document.getElementById("bet-amount"),
  halfBetButton: document.getElementById("halve-bet"),
  doubleBetButton: document.getElementById("double-bet"),
  numberOfCoalField: document.getElementById("Coal"),
  winField: document.getElementById("total-payout"),
  betButton: document.querySelector(".bet-button"),
  presentContainer: document.querySelector(".present-container"),
};

let gameStatus = {
  betAmount: configs.minimumBet,
  coalAmount: configs.defaultCoal,
  balance: configs.defaultBalance,
  board: [],
};

function applyConfigs() {
  DOMSelectors.numberOfCoalField.value = configs.defaultCoal;
}

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
    [
      "betAmountField",
      "numberOfCoalField",
      "betButton",
      "halfBetButton",
      "doubleBetButton",
    ].forEach((id) => {
      DOMSelectors[id].disabled = true;
    });

    DOMSelectors.betButton.textContent = "Leave The Factory...";
  },
};

const handleBetInput = (event) => {
  if (event.type === "keydown" && event.key !== "Enter") return;
  betSettingService.betInput(event.target.value);
};

applyConfigs();

DOMSelectors.betAmountField.addEventListener("keydown", handleBetInput);
DOMSelectors.halfBetButton.addEventListener("click", () =>
  betSettingService.adjustBet(0.5)
);
DOMSelectors.doubleBetButton.addEventListener("click", () =>
  betSettingService.adjustBet(2)
);
DOMSelectors.betAmountField.addEventListener("blur", handleBetInput);
DOMSelectors.betButton.addEventListener("click", betSettingService.betStart);
