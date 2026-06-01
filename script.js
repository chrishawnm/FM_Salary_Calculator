const storageKey = "mgma-rvu-calculator-v3-weekly";

const defaults = {
  weeksWorked: 48,
  clinicDaysPerWeek: 4,
  perPatientRvu: 1.6,
  patientsPerDay: 16,
  rvuValue: 42,
  tiers: [
    { percentile: "60th", threshold: 6000, bonus: 10 },
    { percentile: "70th", threshold: 7500, bonus: 15 }
  ]
};

let state = loadState();

const fields = {
  weeksWorked: document.getElementById("weeksWorked"),
  clinicDaysPerWeek: document.getElementById("clinicDaysPerWeek"),
  perPatientRvu: document.getElementById("perPatientRvu"),
  patientsPerDay: document.getElementById("patientsPerDay"),
  rvuValue: document.getElementById("rvuValue"),
  tierRows: document.getElementById("tierRows"),
  annualRvusTop: document.getElementById("annualRvusTop"),
  rvuFormula: document.getElementById("rvuFormula"),
  annualRvus: document.getElementById("annualRvus"),
  productionSalary: document.getElementById("productionSalary"),
  salaryFormula: document.getElementById("salaryFormula"),
  currentBonus: document.getElementById("currentBonus"),
  bonusTierText: document.getElementById("bonusTierText"),
  bonusAmount: document.getElementById("bonusAmount"),
  bonusFormula: document.getElementById("bonusFormula"),
  finalSalary: document.getElementById("finalSalary")
};

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (!saved) return structuredClone(defaults);
    return { ...structuredClone(defaults), ...saved, tiers: saved.tiers?.length ? saved.tiers : structuredClone(defaults.tiers) };
  } catch {
    return structuredClone(defaults);
  }
}

function saveState() {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function fmtNumber(value, digits = 0) {
  return Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: digits, minimumFractionDigits: digits });
}

function fmtMoney(value) {
  return Number(value || 0).toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function setAssumptionInputs() {
  fields.weeksWorked.value = state.weeksWorked;
  fields.clinicDaysPerWeek.value = state.clinicDaysPerWeek;
  fields.perPatientRvu.value = state.perPatientRvu;
  fields.patientsPerDay.value = state.patientsPerDay;
  fields.rvuValue.value = state.rvuValue;
}

function percentileOptions(selected = "") {
  const options = ["50th", "55th", "60th", "65th", "70th", "75th", "80th", "85th", "90th", "95th"];
  return options.map(opt => `<option value="${opt}" ${opt === selected ? "selected" : ""}>${opt}</option>`).join("");
}

function renderTiers() {
  fields.tierRows.innerHTML = "";

  state.tiers.forEach((tier, index) => {
    const row = document.createElement("div");
    row.className = "tier-row";
    row.innerHTML = `
      <div class="percent-wrap">
        <select class="percent-select" data-index="${index}" data-field="percentile">${percentileOptions(tier.percentile)}</select>
      </div>
      <div class="threshold-wrap">
        <input type="number" min="0" step="1" value="${tier.threshold}" data-index="${index}" data-field="threshold" />
      </div>
      <div class="bonus-wrap">
        <div class="bonus-input"><input type="number" min="0" step="0.1" value="${tier.bonus}" data-index="${index}" data-field="bonus" /><span>%</span></div>
      </div>
      <div class="action-wrap"><button class="action-btn remove" type="button" title="Remove tier" aria-label="Remove tier" data-remove="${index}">−</button></div>
    `;
    fields.tierRows.appendChild(row);
  });

  const addRow = document.createElement("div");
  addRow.className = "tier-row add-row";
  addRow.innerHTML = `
    <div class="percent-wrap"><select id="newPercentile">${percentileOptions("80th")}</select></div>
    <div class="threshold-wrap"><input id="newThreshold" type="number" min="0" step="1" placeholder="e.g. 8000" /></div>
    <div class="bonus-wrap"><div class="bonus-input"><input id="newBonus" type="number" min="0" step="0.1" placeholder="e.g. 20" /><span>%</span></div></div>
    <div class="action-wrap"><button id="addTier" class="action-btn" type="button" title="Add tier" aria-label="Add tier">+</button></div>
  `;
  fields.tierRows.appendChild(addRow);
}

function calculate() {
  const annualRvus = Number(state.weeksWorked) * Number(state.clinicDaysPerWeek) * Number(state.perPatientRvu) * Number(state.patientsPerDay);
  const productionSalary = annualRvus * Number(state.rvuValue);
  const sorted = [...state.tiers].sort((a, b) => Number(a.threshold) - Number(b.threshold));
  const metTier = sorted.filter(t => annualRvus >= Number(t.threshold)).pop();
  const bonusPct = metTier ? Number(metTier.bonus) : 0;
  const bonusAmount = productionSalary * (bonusPct / 100);
  const finalSalary = productionSalary + bonusAmount;

  fields.annualRvusTop.textContent = fmtNumber(annualRvus);
  fields.rvuFormula.textContent = `${fmtNumber(state.weeksWorked, state.weeksWorked % 1 ? 1 : 0)} weeks × ${fmtNumber(state.clinicDaysPerWeek, state.clinicDaysPerWeek % 1 ? 1 : 0)} days/week × ${state.perPatientRvu} RVU × ${state.patientsPerDay} patients`;
  fields.annualRvus.textContent = fmtNumber(annualRvus);
  fields.productionSalary.textContent = fmtMoney(productionSalary);
  fields.salaryFormula.textContent = `${fmtNumber(annualRvus)} RVUs × $${Number(state.rvuValue || 0).toFixed(2)}`;
  fields.currentBonus.textContent = `${fmtNumber(bonusPct, bonusPct % 1 ? 1 : 0)}%`;
  fields.bonusTierText.textContent = metTier ? `Based on ${metTier.percentile} percentile tier` : "No threshold met";
  fields.bonusAmount.textContent = fmtMoney(bonusAmount);
  fields.bonusFormula.textContent = `${fmtNumber(bonusPct, bonusPct % 1 ? 1 : 0)}% of Production Salary`;
  fields.finalSalary.textContent = fmtMoney(finalSalary);
}

function updateAssumption(event) {
  const key = event.target.id;
  state[key] = Number(event.target.value);
  saveState();
  calculate();
}

function handleTierInput(event) {
  const el = event.target;
  const index = el.dataset.index;
  const field = el.dataset.field;
  if (index === undefined || !field) return;

  state.tiers[index][field] = field === "percentile" ? el.value : Number(el.value);
  saveState();
  calculate();
}

function handleTierClick(event) {
  const removeIndex = event.target.dataset.remove;
  if (removeIndex !== undefined) {
    state.tiers.splice(Number(removeIndex), 1);
    saveState();
    renderTiers();
    calculate();
    return;
  }

  if (event.target.id === "addTier") {
    const percentile = document.getElementById("newPercentile").value;
    const threshold = Number(document.getElementById("newThreshold").value);
    const bonus = Number(document.getElementById("newBonus").value);

    if (!threshold && threshold !== 0) return;
    if (!bonus && bonus !== 0) return;

    state.tiers.push({ percentile, threshold, bonus });
    state.tiers.sort((a, b) => Number(a.threshold) - Number(b.threshold));
    saveState();
    renderTiers();
    calculate();
  }
}

[fields.weeksWorked, fields.clinicDaysPerWeek, fields.perPatientRvu, fields.patientsPerDay, fields.rvuValue].forEach(input => {
  input.addEventListener("input", updateAssumption);
});
fields.tierRows.addEventListener("input", handleTierInput);
fields.tierRows.addEventListener("change", handleTierInput);
fields.tierRows.addEventListener("click", handleTierClick);

setAssumptionInputs();
renderTiers();
calculate();
