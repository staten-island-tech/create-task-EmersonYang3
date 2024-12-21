const DOMSelectors = {
  betButton: document.querySelector(".bet-button"),
  betAmountSelector: document.getElementById("bet-amount"),
  coalSelector: document.getElementById("Coal"),
};

DOMSelectors.betButton.addEventListener("click", () => {
  console.log("Bet button clicked");
  DOMSelectors.betAmountSelector.disabled = true;
  DOMSelectors.coalSelector.disabled = true;
});
