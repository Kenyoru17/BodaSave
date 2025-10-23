// ---------------- USER MANAGEMENT ----------------
function getUsers() {
  return JSON.parse(localStorage.getItem("bodaUsers") || "[]");
}
function saveUsers(users) {
  localStorage.setItem("bodaUsers", JSON.stringify(users));
}
function getCurrentUser() {
  const username = localStorage.getItem("loggedInUser");
  if (!username) return null;
  return getUsers().find(u => u.username === username) || null;
}
function updateCurrentUser(user) {
  const users = getUsers();
  const i = users.findIndex(u => u.username === user.username);
  if (i >= 0) users[i] = user;
  else users.push(user);
  saveUsers(users);
}

// ---------------- AUTHENTICATION ----------------
function initAuthPage() {
  const loginBtn = document.getElementById("loginBtn");
  const signupBtn = document.getElementById("signupBtn");

  // Signup
  if (signupBtn) {
    signupBtn.addEventListener("click", () => {
      const fullName = document.getElementById("fullName").value.trim();
      const username = document.getElementById("signupUsername").value.trim();
      const password = document.getElementById("signupPassword").value.trim();
      const phone = document.getElementById("phoneNumber").value.trim();
      const stage = document.getElementById("stageName").value.trim();

      if (!fullName || !username || !password) {
        alert("Please fill in all required fields.");
        return;
      }
      const users = getUsers();
      if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
        alert("That username already exists.");
        return;
      }

      users.push({
        fullName,
        username,
        password,
        phone,
        stage,
        dateJoined: new Date().toLocaleDateString(),
        trips: [],
        expenses: [],
        savings: [],
        goals: [],
        credits: [],
      });
      saveUsers(users);
      alert("Account created successfully! You can now log in.");
      window.location.reload();
    });
  }

  // Login
  if (loginBtn) {
    loginBtn.addEventListener("click", () => {
      const username = document.getElementById("loginUsername").value.trim();
      const password = document.getElementById("loginPassword").value.trim();
      const user = getUsers().find(
        u => u.username.toLowerCase() === username.toLowerCase() && u.password === password
      );
      if (!user) return alert("Invalid credentials.");
      localStorage.setItem("loggedInUser", user.username);
      window.location.href = "dashboard.html";
    });
  }
}

function ensureAuth() {
  if (!localStorage.getItem("loggedInUser")) {
    alert("Please log in first.");
    window.location.href = "index.html";
  }
}

// ---------------- SIDEBAR ----------------
function initSidebar() {
  const logoutBtns = document.querySelectorAll("#logoutBtn");
  logoutBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      localStorage.removeItem("loggedInUser");
      window.location.href = "index.html";
    });
  });
}

// ---------------- TRIPS ----------------
function saveTrip() {
  const user = getCurrentUser();
  if (!user) return;

  const date = document.getElementById("tripDate").value;
  const amount = parseFloat(document.getElementById("tripAmount").value) || 0;
  const details = document.getElementById("tripDetails").value.trim();
  const payment = document.getElementById("tripPayment").value;
  const note = document.getElementById("tripNote").value.trim();

  if (!date || !amount) return alert("Please fill all required fields.");

  const trip = { date, amount, details, payment, note };
  user.trips.push(trip);

  // If trip is on credit, save it under credits too
  if (payment.toLowerCase() === "credit") {
    const customer = prompt("Enter Customer Name:");
    const phone = prompt("Enter Customer Phone Number:");
    user.credits.push({
      customer,
      phone,
      details,
      amount,
      date,
      status: "Unpaid"
    });
  }

  updateCurrentUser(user);
  alert("Trip saved successfully!");
  renderTrips();
}

function renderTrips() {
  const user = getCurrentUser();
  if (!user) return;
  const body = document.getElementById("tripsBody");
  body.innerHTML = "";
  user.trips.slice().reverse().forEach(t => {
    const row = `<tr>
      <td>${t.date}</td>
      <td>${t.amount}</td>
      <td>${t.details || ""}</td>
      <td>${t.payment}</td>
    </tr>`;
    body.insertAdjacentHTML("beforeend", row);
  });
}

// ---------------- EXPENSES ----------------
function saveExpense() {
  const user = getCurrentUser();
  if (!user) return;
  const date = document.getElementById("expenseDate").value;
  const type = document.getElementById("expenseType").value;
  const amount = parseFloat(document.getElementById("expenseAmount").value) || 0;
  const note = document.getElementById("expenseNote").value.trim();

  if (!date || !amount) return alert("Please fill all required fields.");
  user.expenses.push({ date, type, amount, note });
  updateCurrentUser(user);
  alert("Expense saved!");
  renderExpenses();
}

function renderExpenses() {
  const user = getCurrentUser();
  if (!user) return;
  const body = document.getElementById("expensesBody");
  body.innerHTML = "";
  user.expenses.slice().reverse().forEach(e => {
    const row = `<tr>
      <td>${e.date}</td>
      <td>${e.type}</td>
      <td>${e.amount}</td>
      <td>${e.note || ""}</td>
    </tr>`;
    body.insertAdjacentHTML("beforeend", row);
  });
}

// ---------------- SAVINGS ----------------
function saveManualSaving() {
  const user = getCurrentUser();
  if (!user) return;
  const date = document.getElementById("saveDate").value;
  const amount = parseFloat(document.getElementById("saveAmount").value) || 0;
  const goal = document.getElementById("saveGoalSelect").value;
  const note = document.getElementById("saveNote").value.trim();
  if (!date || !amount) return alert("Please fill all required fields.");
  user.savings.push({ date, amount, goal, note });
  updateCurrentUser(user);
  alert("Saving added!");
  renderSavingsManual();
}

function renderSavingsManual() {
  const user = getCurrentUser();
  if (!user) return;
  const body = document.getElementById("savingsManualBody");
  body.innerHTML = "";
  user.savings.slice().reverse().forEach(s => {
    const row = `<tr>
      <td>${s.date}</td>
      <td>${s.amount}</td>
      <td>${s.goal}</td>
      <td>${s.note || ""}</td>
    </tr>`;
    body.insertAdjacentHTML("beforeend", row);
  });
}

// ---------------- GOALS ----------------
function saveGoal() {
  const user = getCurrentUser();
  if (!user) return;
  const name = document.getElementById("goalName").value.trim();
  const target = parseFloat(document.getElementById("goalTarget").value) || 0;
  const end = document.getElementById("goalEnd").value;
  const priority = document.getElementById("goalPriority").value;
  if (!name || !target) return alert("Please enter all details.");
  user.goals.push({ name, target, end, priority });
  updateCurrentUser(user);
  alert("Goal saved!");
  renderGoals();
}

function renderGoals() {
  const user = getCurrentUser();
  if (!user) return;
  const body = document.getElementById("goalsBody");
  body.innerHTML = "";
  user.goals.slice().reverse().forEach(g => {
    const totalSaved = user.savings.filter(s => s.goal === g.name)
      .reduce((sum, s) => sum + s.amount, 0);
    const progress = Math.min(100, Math.round((totalSaved / g.target) * 100));
    const row = `<tr>
      <td>${g.name}</td>
      <td>${g.target}</td>
      <td>${progress}%</td>
      <td>${progress >= 100 ? "Completed" : "Ongoing"}</td>
    </tr>`;
    body.insertAdjacentHTML("beforeend", row);
  });
}

// ---------------- CREDITS ----------------
function renderCredits() {
  const user = getCurrentUser();
  if (!user) return;
  const body = document.getElementById("creditBody");
  body.innerHTML = "";
  user.credits.slice().reverse().forEach((c, i) => {
    const row = `<tr>
      <td>${c.customer}</td>
      <td>${c.phone}</td>
      <td>${c.details}</td>
      <td>${c.amount}</td>
      <td>${c.date}</td>
      <td>${c.status}</td>
      <td>${c.status === "Unpaid" ? `<button onclick="markPaid(${i})">Mark Paid</button>` : "✓"}</td>
    </tr>`;
    body.insertAdjacentHTML("beforeend", row);
  });
}
function markPaid(index) {
  const user = getCurrentUser();
  if (!user) return;
  user.credits[index].status = "Paid";
  updateCurrentUser(user);
  renderCredits();
}

// ---------------- REPORTS ----------------
function renderReports() {
  const user = getCurrentUser();
  if (!user) return;
  const earned = user.trips.reduce((s, t) => s + t.amount, 0);
  const spent = user.expenses.reduce((s, e) => s + e.amount, 0);
  const saved = user.savings.reduce((s, a) => s + a.amount, 0);
  document.getElementById("reportEarned").textContent = earned;
  document.getElementById("reportSpent").textContent = spent;
  document.getElementById("reportSaved").textContent = saved;
}

function exportCSV() {
  const user = getCurrentUser();
  if (!user) return;
  const date = prompt("Enter date (YYYY-MM-DD) to export data for:");
  if (!date) return;
  const all = [
    ...user.trips.filter(t => t.date.includes(date)).map(t => ({ type: "Trip", ...t })),
    ...user.expenses.filter(e => e.date.includes(date)).map(e => ({ type: "Expense", ...e })),
    ...user.savings.filter(s => s.date.includes(date)).map(s => ({ type: "Saving", ...s })),
  ];
  if (all.length === 0) return alert("No data found for that date.");

  let csv = "Type,Date,Amount,Details,Note\n";
  all.forEach(i => {
    csv += `${i.type},${i.date},${i.amount},${i.details || i.goal || ""},${i.note || ""}\n`;
  });
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `BodaSave_Report_${date}.csv`;
  a.click();
}

// ---------------- PROFILE ----------------
function renderProfile() {
  const user = getCurrentUser();
  if (!user) return;
  document.getElementById("profileName").textContent = user.fullName;
  document.getElementById("profileUser").textContent = user.username;
  document.getElementById("profilePhone").textContent = user.phone || "N/A";
  document.getElementById("profileStage").textContent = user.stage || "N/A";
  document.getElementById("profileJoined").textContent = user.dateJoined;
}

function clearUserData() {
  if (!confirm("Are you sure you want to clear all your data?")) return;
  const user = getCurrentUser();
  if (!user) return;
  user.trips = [];
  user.expenses = [];
  user.savings = [];
  user.goals = [];
  user.credits = [];
  updateCurrentUser(user);
  alert("All your data has been cleared.");
}

// ---------------- DASHBOARD ----------------
function renderDashboardPage() {
  const user = getCurrentUser();
  if (!user) return;

  const today = new Date().toLocaleDateString();
  const tripsToday = user.trips.filter(t => new Date(t.date).toLocaleDateString() === today);
  const expToday = user.expenses.filter(e => new Date(e.date).toLocaleDateString() === today);
  const savToday = user.savings.filter(s => new Date(s.date).toLocaleDateString() === today);

  const earn = tripsToday.reduce((s, t) => s + t.amount, 0);
  const spend = expToday.reduce((s, e) => s + e.amount, 0);
  const save = savToday.reduce((s, s2) => s + s2.amount, 0);
  const net = earn - spend + save;

  document.getElementById("earnToday").textContent = `KES ${earn}`;
  document.getElementById("expToday").textContent = `KES ${spend}`;
  document.getElementById("netToday").textContent = `KES ${net}`;

  const currentGoal = user.goals[0] || { target: 0 };
  const totalSaved = user.savings.reduce((sum, s) => sum + s.amount, 0);
  const percent = currentGoal.target ? Math.min(100, Math.round((totalSaved / currentGoal.target) * 100)) : 0;
  document.getElementById("progressFill").style.width = `${percent}%`;
  document.getElementById("progressPercent").textContent = `${percent}%`;
  document.getElementById("currentGoal").textContent = currentGoal.target;

  const lastTrip = user.trips[user.trips.length - 1];
  document.getElementById("lastTrip").textContent = lastTrip
    ? `You earned KES ${lastTrip.amount} on your last trip.`
    : "No trips recorded yet.";
}

// ---------------- AUTO INIT ----------------
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("loginCard")) initAuthPage();
});
