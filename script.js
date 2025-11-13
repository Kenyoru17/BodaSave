// =========================
// BodaSave - Full Script.js
// =========================

// -------------- AUTH --------------
function getCurrentUser() {
  return localStorage.getItem("currentUser");
}

function ensureAuth() {
  const user = getCurrentUser();
  if (!user) {
    alert("Session expired. Please log in again.");
    window.location.href = "index.html";
  }
}

function logout() {
  localStorage.removeItem("currentUser");
  window.location.href = "index.html";
}

document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) logoutBtn.addEventListener("click", logout);
});

// -------------- SIDEBAR TOGGLE --------------
function initSidebar() {
  const hamburger = document.querySelector(".hamburger");
  const sidebar = document.querySelector(".sidebar");
  if (hamburger && sidebar) {
    hamburger.addEventListener("click", () => {
      sidebar.classList.toggle("open");
    });
  }
}

// -------------- STORAGE HELPERS --------------
function loadData(key) {
  const user = getCurrentUser();
  return JSON.parse(localStorage.getItem(`${user}_${key}`) || "[]");
}

function saveData(key, data) {
  const user = getCurrentUser();
  localStorage.setItem(`${user}_${key}`, JSON.stringify(data));
}

// -------------- TRIPS --------------
function renderTrips() {
  const trips = loadData("trips");
  const body = document.getElementById("tripsBody");
  if (!body) return;
  body.innerHTML = "";
  trips.forEach(t => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${t.date}</td>
      <td>${t.amount}</td>
      <td>${t.details || ""}</td>
      <td>${t.payment}</td>
    `;
    body.appendChild(tr);
  });
}

function saveTrip() {
  const date = document.getElementById("tripDate").value;
  const amount = parseFloat(document.getElementById("tripAmount").value || 0);
  const details = document.getElementById("tripDetails").value;
  const payment = document.getElementById("tripPayment").value;
  const note = document.getElementById("tripNote").value;

  if (!amount || amount <= 0) return alert("Enter a valid amount!");

  const trips = loadData("trips");
  trips.unshift({ date, amount, details, payment, note });
  saveData("trips", trips);

  // If credit payment, create credit record
  if (payment === "Credit") {
    const customer = document.getElementById("creditCustomer").value;
    const phone = document.getElementById("creditPhone").value;
    const credits = loadData("credits");
    credits.unshift({
      customer,
      phone,
      details,
      amount,
      date,
      status: "Unpaid"
    });
    saveData("credits", credits);
  }

  alert("Trip saved successfully!");
  renderTrips();
  document.getElementById("tripAmount").value = "";
  document.getElementById("tripDetails").value = "";
  document.getElementById("tripNote").value = "";
}

// -------------- CREDITS --------------
function renderCredits() {
  const credits = loadData("credits");
  const body = document.getElementById("creditBody");
  if (!body) return;
  body.innerHTML = "";
  credits.forEach((c, i) => {
    const tr = document.createElement("tr");
    const statusColor = c.status === "Paid" ? "green" : "red";
    tr.innerHTML = `
      <td>${c.customer || "-"}</td>
      <td>${c.phone || "-"}</td>
      <td>${c.details || "-"}</td>
      <td>${c.amount}</td>
      <td>${c.date}</td>
      <td style="color:${statusColor};font-weight:bold">${c.status}</td>
      <td>
        <button class="markPaidBtn" data-index="${i}" title="Mark as Paid">✅</button>
        <button class="markUnpaidBtn" data-index="${i}" title="Mark as Unpaid">❌</button>
      </td>
    `;
    body.appendChild(tr);
  });

  // Add event listeners
  document.querySelectorAll(".markPaidBtn").forEach(btn =>
    btn.addEventListener("click", e => toggleCreditStatus(e, "Paid"))
  );
  document.querySelectorAll(".markUnpaidBtn").forEach(btn =>
    btn.addEventListener("click", e => toggleCreditStatus(e, "Unpaid"))
  );
}

function toggleCreditStatus(e, status) {
  const index = e.target.dataset.index;
  const credits = loadData("credits");
  credits[index].status = status;
  saveData("credits", credits);
  renderCredits();
}

// -------------- EXPENSES --------------
function renderExpenses() {
  const expenses = loadData("expenses");
  const body = document.getElementById("expensesBody");
  if (!body) return;
  body.innerHTML = "";
  expenses.forEach(e => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${e.date}</td>
      <td>${e.type}</td>
      <td>${e.amount}</td>
      <td>${e.note || ""}</td>
    `;
    body.appendChild(tr);
  });
}

function saveExpense() {
  const date = document.getElementById("expDate").value;
  const type = document.getElementById("expType").value;
  const amount = parseFloat(document.getElementById("expAmount").value || 0);
  const note = document.getElementById("expNote").value;

  if (!amount || amount <= 0) return alert("Enter valid amount!");
  const expenses = loadData("expenses");
  expenses.unshift({ date, type, amount, note });
  saveData("expenses", expenses);
  alert("Expense recorded!");
  renderExpenses();
}

// -------------- SAVINGS --------------
function renderSavingsManual() {
  const saves = loadData("savingsManual");
  const body = document.getElementById("savingsManualBody");
  if (!body) return;
  body.innerHTML = "";
  saves.forEach(s => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${s.date}</td>
      <td>${s.amount}</td>
      <td>${s.goal || "-"}</td>
      <td>${s.note || ""}</td>
    `;
    body.appendChild(tr);
  });
}

function saveManualSaving() {
  const date = document.getElementById("saveDate").value;
  const amount = parseFloat(document.getElementById("saveAmount").value || 0);
  const goal = document.getElementById("saveGoalSelect").value;
  const note = document.getElementById("saveNote").value;
  if (!amount || amount <= 0) return alert("Enter valid amount!");
  const saves = loadData("savingsManual");
  saves.unshift({ date, amount, goal, note });
  saveData("savingsManual", saves);
  alert("Saving recorded!");
  renderSavingsManual();
}

// -------------- GOALS --------------
function renderGoals() {
  const goals = loadData("goals");
  const body = document.getElementById("goalsBody");
  if (!body) return;
  body.innerHTML = "";
  goals.forEach(g => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${g.name}</td>
      <td>${g.target}</td>
      <td>${g.deadline}</td>
    `;
    body.appendChild(tr);
  });
}

function saveGoal() {
  const name = document.getElementById("goalName").value;
  const target = parseFloat(document.getElementById("goalTarget").value || 0);
  const deadline = document.getElementById("goalDeadline").value;
  if (!name || !target) return alert("Enter goal details!");
  const goals = loadData("goals");
  goals.unshift({ name, target, deadline });
  saveData("goals", goals);
  alert("Goal added!");
  renderGoals();
}

function populateGoalsDropdown() {
  const goals = loadData("goals");
  const select = document.getElementById("saveGoalSelect");
  if (!select) return;
  select.innerHTML = '<option value="">-- Select a Goal --</option>';
  goals.forEach(g => {
    const opt = document.createElement("option");
    opt.value = g.name;
    opt.textContent = g.name;
    select.appendChild(opt);
  });
}

// -------------- REPORTS (CSV EXPORT) --------------
function downloadCSV() {
  const user = getCurrentUser();
  if (!user) return;

  const data = {
    trips: loadData("trips"),
    expenses: loadData("expenses"),
    savings: loadData("savingsManual"),
    credits: loadData("credits")
  };

  let csv = "Category,Date,Details,Amount,Extra\n";
  data.trips.forEach(t => csv += `Trip,${t.date},${t.details || ""},${t.amount},${t.payment}\n`);
  data.expenses.forEach(e => csv += `Expense,${e.date},${e.type || ""},${e.amount},${e.note || ""}\n`);
  data.savings.forEach(s => csv += `Saving,${s.date},${s.goal || ""},${s.amount},${s.note || ""}\n`);
  data.credits.forEach(c => csv += `Credit,${c.date},${c.customer || ""},${c.amount},${c.status}\n`);

  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "bodaSave_report.csv";
  link.click();
}

// -------------- PROFILE --------------
function loadProfile() {
  const user = getCurrentUser();
  if (!user) return;

  const info = JSON.parse(localStorage.getItem(`${user}_profile`) || "{}");
  document.getElementById("profileName").textContent = info.name || user;
  document.getElementById("profileEmail").textContent = info.email || "Not provided";
  document.getElementById("profileDate").textContent = info.createdAt || "N/A";
}

function updatePassword() {
  const newPass = document.getElementById("newPass").value.trim();
  if (!newPass) {
    alert("Please enter a new password.");
    return;
  }
  const user = getCurrentUser();
  let users = JSON.parse(localStorage.getItem("users") || "{}");
  if (users[user]) {
    users[user].password = newPass;
    localStorage.setItem("users", JSON.stringify(users));
    alert("Password updated successfully!");
  }
}
