const configs = {
  minimumBet: 0.0,
  defaultCoal: 3,
  defaultBalance: 1000.0,
  safePresentImage: "images/",
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
  board: [],
};

function applyConfigs() {
  DOMSelectors.numberOfCoalField.value = configs.defaultCoal;
  DOMSelectors.betAmountField.value = configs.minimumBet.toFixed(2);
}

const betSettingService = {
  betInput(input) {
    const betAmount =
      input === "" || input < configs.minimumBet
        ? configs.minimumBet
        : parseFloat(input);
    gameStatus.betAmount = betAmount;
    DOMSelectors.betAmountField.value = betAmount.toFixed(2);
  },

  adjustBet(factor) {
    const { betAmount } = gameStatus;
    if (!betAmount) return;
    const adjustedBet = betAmount * factor;
    gameStatus.betAmount = adjustedBet;
    DOMSelectors.betAmountField.value = adjustedBet.toFixed(2);
  },

  minesInput(input) {
    const minesAmount = input < 0 ? 0 : parseInt(input, 10);
    gameStatus.coalAmount = minesAmount;
    DOMSelectors.numberOfCoalField.value = minesAmount;
  },

  betStart() {
    const { betAmount } = gameStatus;
    if (!betAmount) return;
    [
      "betAmountField",
      "numberOfCoalField",
      "betButton",
      "halfBetButton",
      "doubleBetButton",
    ].forEach((id) => {
      DOMSelectors[id].disabled = true;
    });
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
