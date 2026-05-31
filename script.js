const inputs = {
  daysWorked: document.getElementById("daysWorked"),
  patientRvu: document.getElementById("patientRvu"),
  patientsPerDay: document.getElementById("patientsPerDay"),
  rvuRate: document.getElementById("rvuRate")
};

const outputs = {
  totalRvus: document.getElementById("totalRvus"),
  productionSalary: document.getElementById("productionSalary"),
  bonusLabel: document.getElementById("bonusLabel"),
  bonusAmount: document.getElementById("bonusAmount"),
  finalSalary: document.getElementById("finalSalary")
};

const bonusTierBody = document.getElementById("bonusTierBody");
const addTierButton = document.getElementById("addTier");

let bonusTiers = [
  { percentile: 60, threshold: 6000, bonus: 10 },
  { percentile: 70, threshold: 7500, bonus: 15 }
];

const dollars = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

const number = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0
});

function getValue(input) {
  return Number(input.value) || 0;
}

function getHighestBonusTier(totalRvus) {
  return bonusTiers
    .filter(tier => totalRvus >= Number(tier.threshold || 0))
    .sort((a, b) => Number(b.threshold || 0) - Number(a.threshold || 0))[0] || null;
}

function renderBonusTiers() {
  bonusTierBody.innerHTML = "";

  bonusTiers.forEach((tier, index) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td><input aria-label="Percentile" type="number" min="0" step="1" value="${tier.percentile}" data-index="${index}" data-field="percentile" /></td>
      <td><input aria-label="Threshold RVUs" type="number" min="0" step="100" value="${tier.threshold}" data-index="${index}" data-field="threshold" /></td>
      <td><input aria-label="Bonus percent" type="number" min="0" step="1" value="${tier.bonus}" data-index="${index}" data-field="bonus" /></td>
      <td><button class="delete-button" type="button" data-index="${index}">Delete</button></td>
    `;

    bonusTierBody.appendChild(row);
  });

  calculate();
}

function calculate() {
  const daysWorked = getValue(inputs.daysWorked);
  const patientRvu = getValue(inputs.patientRvu);
  const patientsPerDay = getValue(inputs.patientsPerDay);
  const rvuRate = getValue(inputs.rvuRate);

  const totalRvus = daysWorked * patientRvu * patientsPerDay;
  const productionSalary = totalRvus * rvuRate;
  const activeTier = getHighestBonusTier(totalRvus);
  const bonusRate = activeTier ? Number(activeTier.bonus || 0) / 100 : 0;
  const bonusAmount = productionSalary * bonusRate;
  const finalSalary = productionSalary + bonusAmount;

  outputs.totalRvus.textContent = number.format(totalRvus);
  outputs.productionSalary.textContent = dollars.format(productionSalary);
  outputs.bonusLabel.textContent = activeTier
    ? `Current Bonus: ${number.format(activeTier.bonus)}% at ${number.format(activeTier.threshold)} RVUs`
    : "Current Bonus: 0%";
  outputs.bonusAmount.textContent = dollars.format(bonusAmount);
  outputs.finalSalary.textContent = dollars.format(finalSalary);
}

Object.values(inputs).forEach(input => input.addEventListener("input", calculate));

bonusTierBody.addEventListener("input", event => {
  const target = event.target;
  if (!target.matches("input")) return;

  const index = Number(target.dataset.index);
  const field = target.dataset.field;
  bonusTiers[index][field] = Number(target.value) || 0;
  calculate();
});

bonusTierBody.addEventListener("click", event => {
  const target = event.target;
  if (!target.matches("button")) return;

  const index = Number(target.dataset.index);
  bonusTiers.splice(index, 1);
  renderBonusTiers();
});

addTierButton.addEventListener("click", () => {
  bonusTiers.push({ percentile: 80, threshold: 9000, bonus: 20 });
  renderBonusTiers();
});

renderBonusTiers();
