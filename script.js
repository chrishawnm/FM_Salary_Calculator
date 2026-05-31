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

function getBonusRate(totalRvus) {
  if (totalRvus >= 7500) return 0.15;
  if (totalRvus >= 6000) return 0.10;
  return 0;
}

function calculate() {
  const daysWorked = getValue(inputs.daysWorked);
  const patientRvu = getValue(inputs.patientRvu);
  const patientsPerDay = getValue(inputs.patientsPerDay);
  const rvuRate = getValue(inputs.rvuRate);

  const totalRvus = daysWorked * patientRvu * patientsPerDay;
  const productionSalary = totalRvus * rvuRate;
  const bonusRate = getBonusRate(totalRvus);
  const bonusAmount = productionSalary * bonusRate;
  const finalSalary = productionSalary + bonusAmount;

  outputs.totalRvus.textContent = number.format(totalRvus);
  outputs.productionSalary.textContent = dollars.format(productionSalary);
  outputs.bonusLabel.textContent = `Current Bonus: ${Math.round(bonusRate * 100)}%`;
  outputs.bonusAmount.textContent = dollars.format(bonusAmount);
  outputs.finalSalary.textContent = dollars.format(finalSalary);
}

Object.values(inputs).forEach(input => input.addEventListener("input", calculate));
calculate();
