// ------------------ USER MANAGEMENT ------------------
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

function ensureUserArrays(user) {
  if (!user.trips) user.trips = [];
  if (!user.expenses) user.expenses = [];
  if (!user.savings) user.savings = [];
  if (!user.goals) user.goals = [];
  if (!user.credits) user.credits = [];
}

// ------------------ AUTH ------------------
function initAuthPage() {
  const loginBtn = document.getElementById("loginBtn");
  const signupBtn = document.getElementById("signupBtn");
  const openSignup = document.getElementById("openSignup");
  const cancelSignup = document.getElementById("cancelSignup");
  const loginCard = document.getElementById("loginCard");
  const signupCard = document.getElementById("signupCard");

  if (openSignup) openSignup.addEventListener("click", e => {
    e.preventDefault();
    loginCard.classList.add("hidden");
    signupCard.classList.remove("hidden");
  });

  if (cancelSignup) cancelSignup.addEventListener("click", () => {
    signupCard.classList.add("hidden");
    loginCard.classList.remove("hidden");
  });

  if (signupBtn) signupBtn.addEventListener("click", () => {
    const fullName = document.getElementById("fullName").value.trim();
    const username = document.getElementById("signupUsername").value.trim();
    const password = document.getElementById("signupPassword").value;
    const phone = document.getElementById("phoneNumber").value.trim();
    const stage = document.getElementById("stageName").value.trim();

    if (!fullName || !username || !password) return alert("Please fill all required fields.");

    const users = getUsers();
    if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) 
      return alert("Username exists.");

    const newUser = {
      fullName, username, password, phone, stage,
      dateJoined: new Date().toLocaleDateString(),
      trips: [], expenses: [], savings: [], goals: [], credits: []
    };

    users.push(newUser);
    saveUsers(users);

    alert("Account created successfully!");
    signupCard.classList.add("hidden");
    loginCard.classList.remove("hidden");
  });

  if (loginBtn) loginBtn.addEventListener("click", () => {
    const username = document.getElementById("loginUsername").value.trim();
    const password = document.getElementById("loginPassword").value;

    const user = getUsers().find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
    if (!user) return alert("Invalid credentials.");

    localStorage.setItem("loggedInUser", user.username);
    window.location.href = "dashboard.html";
  });
}

function ensureAuth() {
  if (!localStorage.getItem("loggedInUser") &&
      !(location.pathname.endsWith("index.html") || location.pathname.endsWith("/") || location.pathname.endsWith("index"))) {
    window.location.href = "index.html";
  }
}

// ------------------ SIDEBAR ------------------
function initSidebar() {
  document.querySelectorAll("#logoutBtn").forEach(b => b.addEventListener("click", () => {
    localStorage.removeItem("loggedInUser");
    location.href = "index.html";
  }));

  const user = getCurrentUser();
  if (user) document.querySelectorAll("#userName").forEach(el => el.textContent = user.fullName);
}

// ------------------ TRIPS ------------------
function saveTrip() {
  const user = getCurrentUser();
  if (!user) return alert("User not found.");
  ensureUserArrays(user);

  const date = document.getElementById("tripDate").value;
  const amount = parseFloat(document.getElementById("tripAmount").value || "0");
  const details = document.getElementById("tripDetails").value.trim();
  const payment = document.getElementById("tripPayment").value;
  const note = document.getElementById("tripNote").value.trim();

  if (!date || !amount) return alert("Please fill date and amount.");

  const trip = { id: Date.now(), date, amount, details, payment, note };
  user.trips.push(trip);

  if (payment.toLowerCase() === "credit") {
    const customer = document.getElementById("creditCustomer").value.trim() || "Unknown";
    const phone = document.getElementById("creditPhone").value.trim() || "N/A";
    user.credits.push({ 
      id: Date.now() + Math.floor(Math.random()*999), 
      tripId: trip.id, customer, phone, details, amount, date, status: "Unpaid"
    });
  }

  updateCurrentUser(user);
  renderTrips();
  renderDashboardPage();
  alert("Trip saved successfully.");
}

function renderTrips() {
  const user = getCurrentUser();
  if (!user) return;
  const body = document.getElementById("tripsBody");
  if (!body) return;
  body.innerHTML = "";

  user.trips.slice().reverse().forEach(t => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${t.date}</td><td>KES ${t.amount.toFixed(2)}</td><td>${t.details}</td><td>${t.payment}</td>`;
    body.appendChild(tr);
  });
}

// ------------------ EXPENSES ------------------
function saveExpense() {
  const user = getCurrentUser();
  if (!user) return alert("User not found.");
  ensureUserArrays(user);

  const date = document.getElementById("expenseDate").value;
  const type = document.getElementById("expenseType").value;
  const amount = parseFloat(document.getElementById("expenseAmount").value || "0");
  const note = document.getElementById("expenseNote").value;

  if (!date || !amount) return alert("Please fill date and amount.");

  user.expenses.push({ id: Date.now(), date, type, amount, note });
  updateCurrentUser(user);
  renderExpenses();
  renderDashboardPage();
  alert("Expense saved.");
}

function renderExpenses() {
  const user = getCurrentUser();
  if (!user) return;
  const body = document.getElementById("expensesBody");
  if (!body) return;
  body.innerHTML = "";

  user.expenses.slice().reverse().forEach(e => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${e.date}</td><td>${e.type}</td><td>KES ${e.amount.toFixed(2)}</td><td>${e.note}</td>`;
    body.appendChild(tr);
  });
}

// ------------------ GOALS ------------------
function saveGoal() {
  const user = getCurrentUser();
  if (!user) return alert("User not found.");
  ensureUserArrays(user);

  const name = document.getElementById("goalName").value.trim();
  const target = parseFloat(document.getElementById("goalTarget").value || "0");
  const end = document.getElementById("goalEnd").value;
  const priority = document.getElementById("goalPriority").value;

  if (!name || !target) return alert("Please fill all details.");

  user.goals.push({ id: Date.now(), name, target, end, priority });
  updateCurrentUser(user);
  renderGoals();
  renderDashboardPage();
  alert("Goal saved.");
}

function renderGoals() {
  const user = getCurrentUser();
  if (!user) return;
  const body = document.getElementById("goalsBody");
  if (!body) return;
  body.innerHTML = "";

  user.goals.slice().reverse().forEach(g => {
    const totalSaved = user.savings.filter(s => s.goal === g.name).reduce((sum, s) => sum + s.amount, 0);
    const progress = Math.min(100, Math.round((totalSaved / g.target) * 100));
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${g.name}</td><td>KES ${g.target.toFixed(2)}</td><td>${progress}%</td><td>${progress >= 100 ? "Completed" : "Ongoing"}</td>`;
    body.appendChild(tr);
  });
}

// ------------------ SAVINGS ------------------
function populateGoalsDropdown() {
  const user = getCurrentUser();
  if (!user) return;
  const select = document.getElementById("saveGoalSelect");
  if (!select) return;

  select.innerHTML = `<option value="">-- Select a Goal --</option>`;
  user.goals.forEach(g => {
    const opt = document.createElement("option");
    opt.value = g.name;
    opt.textContent = g.name;
    select.appendChild(opt);
  });
}

function saveManualSaving() {
  const user = getCurrentUser();
  if (!user) return alert("User not found.");
  ensureUserArrays(user);

  const date = document.getElementById("saveDate").value;
  const amount = parseFloat(document.getElementById("saveAmount").value || "0");
  const goal = document.getElementById("saveGoalSelect").value;
  const note = document.getElementById("saveNote").value;

  if (!date || !amount) return alert("Please fill date and amount.");

  user.savings.push({ id: Date.now(), date, amount, goal, note });
  updateCurrentUser(user);
  renderSavingsManual();
  renderGoals();
  renderDashboardPage();
  alert("Saved.");
}

function renderSavingsManual() {
  const user = getCurrentUser();
  if (!user) return;
  const body = document.getElementById("savingsManualBody");
  if (!body) return;
  body.innerHTML = "";

  user.savings.slice().reverse().forEach(s => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${s.date}</td><td>KES ${s.amount.toFixed(2)}</td><td>${s.goal || ""}</td><td>${s.note}</td>`;
    body.appendChild(tr);
  });
}

// ------------------ CREDITS ------------------
function renderCredits() {
  const user = getCurrentUser(); if (!user) return;
  const body = document.getElementById("creditsBody"); if (!body) return;
  body.innerHTML = "";

  user.credits.slice().reverse().forEach(c => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${c.date}</td>
      <td>${c.customer}</td>
      <td>${c.phone}</td>
      <td>KES ${c.amount.toFixed(2)}</td>
      <td>${c.details}</td>
      <td>${c.status}</td>
      <td>
        ${c.status === "Unpaid" ? `<button class="btn small primary" onclick="markCreditPaid(${c.id})">✅ Paid</button>` : ""}
      </td>
    `;
    body.appendChild(tr);
  });
}

function markCreditPaid(creditId) {
  const user = getCurrentUser();
  if (!user) return;

  const credit = user.credits.find(c => c.id === creditId);
  if (!credit) return alert("Credit not found.");

  credit.status = "Paid";
  updateCurrentUser(user);
  renderCredits();
  alert(`Credit for ${credit.customer} marked as Paid.`);
}

// ------------------ DASHBOARD ------------------
function renderDashboardPage() {
  const user = getCurrentUser(); if (!user) return;
  const today = new Date().toLocaleDateString();

  const tripsToday = user.trips.filter(t => new Date(t.date).toLocaleDateString() === today);
  const expensesToday = user.expenses.filter(e => new Date(e.date).toLocaleDateString() === today);
  const savingsToday = user.savings.filter(s => new Date(s.date).toLocaleDateString() === today);

  const earn = tripsToday.reduce((s, t) => s + t.amount, 0);
  const spend = expensesToday.reduce((s, e) => s + e.amount, 0);
  const save = savingsToday.reduce((s, v) => s + v.amount, 0);
  const net = earn - spend - save;

  if(document.getElementById("earnToday")) document.getElementById("earnToday").textContent = `KES ${earn.toFixed(2)}`;
  if(document.getElementById("expToday")) document.getElementById("expToday").textContent = `KES ${spend.toFixed(2)}`;
  if(document.getElementById("netToday")) document.getElementById("netToday").textContent = `KES ${net.toFixed(2)}`;

  const currentGoal = user.goals[0] || { target: 0 };
  const totalSaved = user.savings.reduce((s, v) => s + v.amount, 0);
  const pct = currentGoal.target ? Math.min(100, Math.round((totalSaved / currentGoal.target) * 100)) : 0;

  if(document.getElementById("progressFill")) document.getElementById("progressFill").style.width = `${pct}%`;
  if(document.getElementById("progressPercent")) document.getElementById("progressPercent").textContent = `${pct}%`;
  if(document.getElementById("currentGoal")) document.getElementById("currentGoal").textContent = currentGoal.target.toFixed(2);

  const lastTrip = user.trips.at(-1);
  if(document.getElementById("lastTrip")) document.getElementById("lastTrip").textContent = lastTrip ? `You earned KES ${lastTrip.amount.toFixed(2)} on your last trip.` : "No trips recorded yet.";
}

// ------------------ AUTO INIT ------------------
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("loginCard")) initAuthPage();
});
