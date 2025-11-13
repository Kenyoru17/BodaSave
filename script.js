// ==============================
// script.js - Full from-scratch
// BodaSave (all features: Trips, Credits, Expenses, Savings, Goals, Reports, Profile)
// ==============================

// ----------------- STORAGE & USER HELPERS -----------------
const USERS_KEY = "bodaUsers";
const LOGGED_KEY = "loggedInUser";

function getUsers() {
  return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// returns the user object (not username). null if none.
function getCurrentUser() {
  const username = localStorage.getItem(LOGGED_KEY);
  if (!username) return null;
  return getUsers().find(u => u.username === username) || null;
}

function setCurrentUser(user) {
  // Replace user in list and persist
  const users = getUsers();
  const i = users.findIndex(x => x.username === user.username);
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

// ----------------- AUTH (signup / login / ensure) -----------------
function initAuthPage() {
  const loginBtn = document.getElementById("loginBtn");
  const signupBtn = document.getElementById("signupBtn");
  const openSignup = document.getElementById("openSignup");
  const cancelSignup = document.getElementById("cancelSignup");
  const loginCard = document.getElementById("loginCard");
  const signupCard = document.getElementById("signupCard");

  if (openSignup) openSignup.addEventListener("click", e => {
    e.preventDefault();
    if (loginCard) loginCard.classList.add("hidden");
    if (signupCard) signupCard.classList.remove("hidden");
  });

  if (cancelSignup) cancelSignup.addEventListener("click", () => {
    if (signupCard) signupCard.classList.add("hidden");
    if (loginCard) loginCard.classList.remove("hidden");
  });

  if (signupBtn) signupBtn.addEventListener("click", () => {
    const fullName = (document.getElementById("fullName") || {}).value || "";
    const username = (document.getElementById("signupUsername") || {}).value || "";
    const password = (document.getElementById("signupPassword") || {}).value || "";
    const phone = (document.getElementById("phoneNumber") || {}).value || "";
    const stage = (document.getElementById("stageName") || {}).value || "";

    if (!fullName.trim() || !username.trim() || !password) {
      return alert("Please fill required fields (name, username, password).");
    }

    const users = getUsers();
    if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
      return alert("Username already exists.");
    }

    const newUser = {
      fullName: fullName.trim(),
      username: username.trim(),
      password,
      phone,
      stage,
      dateJoined: new Date().toLocaleDateString(),
      trips: [],
      expenses: [],
      savings: [],
      goals: [],
      credits: []
    };

    users.push(newUser);
    saveUsers(users);
    alert("Account created. Please log in.");
    if (signupCard) signupCard.classList.add("hidden");
    if (loginCard) loginCard.classList.remove("hidden");
  });

  if (loginBtn) loginBtn.addEventListener("click", () => {
    const username = (document.getElementById("loginUsername") || {}).value || "";
    const password = (document.getElementById("loginPassword") || {}).value || "";

    const user = getUsers().find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
    if (!user) return alert("Invalid credentials.");
    localStorage.setItem(LOGGED_KEY, user.username);
    window.location.href = "dashboard.html";
  });
}

function ensureAuthOrRedirect() {
  // used in pages that require authentication
  const user = getCurrentUser();
  if (!user) {
    window.location.href = "index.html";
    return false;
  }
  return true;
}

// ----------------- SIDEBAR & LOGOUT -----------------
function initSidebar() {
  document.querySelectorAll("#logoutBtn").forEach(b => {
    b.addEventListener("click", () => {
      localStorage.removeItem(LOGGED_KEY);
      window.location.href = "index.html";
    });
  });

  // set user name in header if present
  const user = getCurrentUser();
  if (user) {
    document.querySelectorAll("#userName").forEach(el => el.textContent = user.fullName);
  }
}

// ----------------- TRIPS -----------------
function saveTrip() {
  const user = getCurrentUser();
  if (!user) return alert("You must be logged in.");

  ensureUserArrays(user);

  const date = (document.getElementById("tripDate") || {}).value || new Date().toISOString();
  const amountRaw = (document.getElementById("tripAmount") || {}).value || "";
  const amount = parseFloat(amountRaw) || 0;
  const details = (document.getElementById("tripDetails") || {}).value || "";
  const payment = (document.getElementById("tripPayment") || {}).value || "Cash";
  const note = (document.getElementById("tripNote") || {}).value || "";

  if (!date || amount <= 0) return alert("Please enter a valid date and amount.");

  const trip = {
    id: Date.now(),
    date,
    amount,
    details,
    payment,
    note
  };

  user.trips = user.trips || [];
  user.trips.push(trip);

  // if credit, create credit record
  if (payment.toLowerCase() === "credit") {
    const customer = (document.getElementById("creditCustomer") || {}).value || "Unknown";
    const phone = (document.getElementById("creditPhone") || {}).value || "N/A";
    user.credits = user.credits || [];
    user.credits.push({
      id: Date.now() + Math.floor(Math.random() * 1000),
      tripId: trip.id,
      customer,
      phone,
      details,
      amount,
      date,
      status: "Unpaid"
    });
  }

  setCurrentUser(user);
  renderTrips();
  renderDashboardPage();
  renderCredits(); // refresh credits if on that page
  alert("Trip saved.");
}

function renderTrips() {
  const user = getCurrentUser();
  if (!user) return;
  const tbody = document.getElementById("tripsBody");
  if (!tbody) return;
  ensureUserArrays(user);
  tbody.innerHTML = "";
  const rows = user.trips.slice().reverse();
  rows.forEach(t => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${t.date}</td>
      <td>KES ${Number(t.amount).toFixed(2)}</td>
      <td>${t.details || ""}</td>
      <td>${t.payment}</td>
    `;
    tbody.appendChild(tr);
  });
}

// ----------------- EXPENSES -----------------
function saveExpense() {
  const user = getCurrentUser();
  if (!user) return alert("You must be logged in.");
  ensureUserArrays(user);

  const date = (document.getElementById("expenseDate") || {}).value || new Date().toLocaleDateString();
  const type = (document.getElementById("expenseType") || {}).value || "Other";
  const amount = parseFloat((document.getElementById("expenseAmount") || {}).value || "0") || 0;
  const note = (document.getElementById("expenseNote") || {}).value || "";

  if (!date || amount <= 0) return alert("Enter valid date and amount.");

  user.expenses.push({ id: Date.now(), date, type, amount, note });
  setCurrentUser(user);
  renderExpenses();
  renderDashboardPage();
  alert("Expense saved.");
}

function renderExpenses() {
  const user = getCurrentUser();
  if (!user) return;
  const tbody = document.getElementById("expensesBody");
  if (!tbody) return;
  ensureUserArrays(user);
  tbody.innerHTML = "";
  user.expenses.slice().reverse().forEach(e => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${e.date}</td>
      <td>${e.type}</td>
      <td>KES ${Number(e.amount).toFixed(2)}</td>
      <td>${e.note || ""}</td>
    `;
    tbody.appendChild(tr);
  });
}

// ----------------- GOALS -----------------
function saveGoal() {
  const user = getCurrentUser();
  if (!user) return alert("You must be logged in.");
  ensureUserArrays(user);

  const name = (document.getElementById("goalName") || {}).value || "";
  const target = parseFloat((document.getElementById("goalTarget") || {}).value || "0") || 0;
  const end = (document.getElementById("goalEnd") || {}).value || "";

  if (!name || target <= 0) return alert("Enter valid goal name and target.");

  user.goals.push({ id: Date.now(), name, target, end, priority: (document.getElementById("goalPriority") || {}).value || "Medium" });
  setCurrentUser(user);
  renderGoals();
  populateGoalsDropdown();
  renderDashboardPage();
  alert("Goal saved.");
}

function renderGoals() {
  const user = getCurrentUser();
  if (!user) return;
  const tbody = document.getElementById("goalsBody");
  if (!tbody) return;
  ensureUserArrays(user);
  tbody.innerHTML = "";
  user.goals.slice().reverse().forEach(g => {
    const totalSaved = user.savings.filter(s => s.goal === g.name).reduce((s, v) => s + Number(v.amount || 0), 0);
    const progress = g.target ? Math.min(100, Math.round((totalSaved / g.target) * 100)) : 0;
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${g.name}</td><td>KES ${Number(g.target).toFixed(2)}</td><td>${progress}%</td><td>${progress >= 100 ? "Completed" : "Ongoing"}</td>`;
    tbody.appendChild(tr);
  });
}

function populateGoalsDropdown() {
  const user = getCurrentUser();
  if (!user) return;
  const select = document.getElementById("saveGoalSelect");
  if (!select) return;
  select.innerHTML = `<option value="">-- Select a Goal --</option>`;
  (user.goals || []).forEach(g => {
    const opt = document.createElement("option");
    opt.value = g.name;
    opt.textContent = g.name;
    select.appendChild(opt);
  });
}

// ----------------- SAVINGS -----------------
function saveManualSaving() {
  const user = getCurrentUser();
  if (!user) return alert("You must be logged in.");
  ensureUserArrays(user);

  const date = (document.getElementById("saveDate") || {}).value || new Date().toLocaleDateString();
  const amount = parseFloat((document.getElementById("saveAmount") || {}).value || "0") || 0;
  const goal = (document.getElementById("saveGoalSelect") || {}).value || "";
  const note = (document.getElementById("saveNote") || {}).value || "";

  if (!date || amount <= 0) return alert("Enter valid saving date and amount.");

  user.savings.push({ id: Date.now(), date, amount, goal, note });
  setCurrentUser(user);
  renderSavingsManual();
  renderGoals();
  renderDashboardPage();
  alert("Saved.");
}

function renderSavingsManual() {
  const user = getCurrentUser();
  if (!user) return;
  const tbody = document.getElementById("savingsManualBody");
  if (!tbody) return;
  tbody.innerHTML = "";
  (user.savings || []).slice().reverse().forEach(s => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${s.date}</td><td>KES ${Number(s.amount).toFixed(2)}</td><td>${s.goal || ""}</td><td>${s.note || ""}</td>`;
    tbody.appendChild(tr);
  });
}

// ----------------- CREDITS (with tick + X actions) -----------------
function renderCredits() {
  const user = getCurrentUser();
  if (!user) return;
  ensureUserArrays(user);

  const tbody = document.getElementById("creditsBody") || document.getElementById("creditBody") || document.getElementById("creditsBody");
  // some pages used creditsBody, earlier also used creditBody; support both by checking existance
  if (!tbody) return;
  tbody.innerHTML = "";

  // show most recent first
  (user.credits || []).slice().reverse().forEach(c => {
    const tr = document.createElement("tr");

    // For unpaid: show both X and ✔️ (X could be used to delete). For paid: show Paid text and Undo X.
    let actionHtml = "";
    if (c.status === "Unpaid") {
      // Show tick (mark paid) and X (delete)
      actionHtml = `<button class="btn small" data-id="${c.id}" data-action="pay">✔️</button>
                    <button class="btn small ghost" data-id="${c.id}" data-action="delete">❌</button>`;
    } else {
      // Paid: show Paid and a Revert (X) to mark Unpaid if needed
      actionHtml = `✅ Paid <button class="btn small ghost" data-id="${c.id}" data-action="revert">↺</button>`;
    }

    tr.innerHTML = `
      <td>${c.date}</td>
      <td>${c.customer}</td>
      <td>${c.phone}</td>
      <td>${c.details || ""}</td>
      <td>KES ${Number(c.amount).toFixed(2)}</td>
      <td>${c.status}</td>
      <td>${actionHtml}</td>
    `;

    tbody.appendChild(tr);
  });

  // attach delegated listeners
  tbody.querySelectorAll("button[data-action]").forEach(btn => {
    btn.removeEventListener("click", creditActionHandler);
    btn.addEventListener("click", creditActionHandler);
  });
}

function creditActionHandler(e) {
  const btn = e.currentTarget;
  const id = Number(btn.dataset.id);
  const action = btn.dataset.action;
  if (!id || !action) return;
  if (action === "pay") markCreditPaid(id);
  else if (action === "delete") deleteCredit(id);
  else if (action === "revert") revertCreditToUnpaid(id);
}

function markCreditPaid(id) {
  const user = getCurrentUser();
  if (!user) return;
  const credit = (user.credits || []).find(c => c.id === id);
  if (!credit) return alert("Credit not found.");
  credit.status = "Paid";
  setCurrentUser(user);
  renderCredits();
}

function deleteCredit(id) {
  const user = getCurrentUser();
  if (!user) return;
  user.credits = (user.credits || []).filter(c => c.id !== id);
  setCurrentUser(user);
  renderCredits();
}

function revertCreditToUnpaid(id) {
  const user = getCurrentUser();
  if (!user) return;
  const credit = (user.credits || []).find(c => c.id === id);
  if (!credit) return;
  credit.status = "Unpaid";
  setCurrentUser(user);
  renderCredits();
}

// ----------------- REPORTS CSV -----------------
function downloadReportCSV() {
  const user = getCurrentUser();
  if (!user) return alert("Login required.");

  const trips = user.trips || [];
  const expenses = user.expenses || [];
  const savings = user.savings || [];
  const credits = user.credits || [];

  let csv = "Category,Date,Details,Amount,Extra\n";

  trips.forEach(t => {
    csv += `Trip,${escapeCsv(t.date)},${escapeCsv(t.details || "")},${t.amount || 0},${escapeCsv(t.payment || "")}\n`;
  });
  expenses.forEach(e => {
    csv += `Expense,${escapeCsv(e.date)},${escapeCsv(e.type || "")},${e.amount || 0},${escapeCsv(e.note || "")}\n`;
  });
  savings.forEach(s => {
    csv += `Saving,${escapeCsv(s.date)},${escapeCsv(s.goal || "")},${s.amount || 0},${escapeCsv(s.note || "")}\n`;
  });
  credits.forEach(c => {
    csv += `Credit,${escapeCsv(c.date)},${escapeCsv(c.customer || "")},${c.amount || 0},${escapeCsv(c.status || "")}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `BodaSave_Report_${new Date().toISOString().slice(0,10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function escapeCsv(s) {
  if (s == null) return "";
  const str = String(s);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// ----------------- PROFILE -----------------
function loadProfile() {
  const user = getCurrentUser();
  if (!user) return;
  // show profile fields
  const profileName = document.getElementById("profileName");
  const profileUser = document.getElementById("profileUser");
  const profilePhone = document.getElementById("profilePhone");
  const profileStage = document.getElementById("profileStage");
  const profileJoined = document.getElementById("profileJoined");

  if (profileName) profileName.textContent = user.fullName || "";
  if (profileUser) profileUser.textContent = user.username || "";
  if (profilePhone) profilePhone.textContent = user.phone || "N/A";
  if (profileStage) profileStage.textContent = user.stage || "N/A";
  if (profileJoined) profileJoined.textContent = user.dateJoined || "N/A";
}

// Update password (simple)
function updatePasswordFromProfile() {
  const newPassEl = document.getElementById("newPass");
  if (!newPassEl) return;
  const newPass = newPassEl.value.trim();
  if (!newPass) return alert("Enter a new password.");
  const user = getCurrentUser();
  if (!user) return alert("Not logged in.");
  // update user in storage
  user.password = newPass;
  setCurrentUser(user);
  alert("Password updated.");
}

// ----------------- DASHBOARD -----------------
function renderDashboardPage() {
  const user = getCurrentUser();
  if (!user) return;
  ensureUserArrays(user);

  // Today's aggregates
  const today = new Date().toLocaleDateString();
  const tripsToday = user.trips.filter(t => new Date(t.date).toLocaleDateString() === today);
  const expensesToday = user.expenses.filter(e => new Date(e.date).toLocaleDateString() === today);
  const savingsToday = user.savings.filter(s => new Date(s.date).toLocaleDateString() === today);

  const earn = tripsToday.reduce((s, t) => s + Number(t.amount || 0), 0);
  const spend = expensesToday.reduce((s, e) => s + Number(e.amount || 0), 0);
  const save = savingsToday.reduce((s, v) => s + Number(v.amount || 0), 0);

  const net = earn - spend - save;

  const elEarn = document.getElementById("earnToday");
  const elExp = document.getElementById("expToday");
  const elNet = document.getElementById("netToday");
  if (elEarn) elEarn.textContent = `KES ${earn.toFixed(2)}`;
  if (elExp) elExp.textContent = `KES ${spend.toFixed(2)}`;
  if (elNet) elNet.textContent = `KES ${net.toFixed(2)}`;

  // goal progress (first goal)
  const currentGoal = (user.goals && user.goals[0]) || { target: 0 };
  const totalSaved = (user.savings || []).reduce((s, v) => s + Number(v.amount || 0), 0);
  const pct = currentGoal.target ? Math.min(100, Math.round((totalSaved / currentGoal.target) * 100)) : 0;
  const fill = document.getElementById("progressFill");
  const pctEl = document.getElementById("progressPercent");
  const goalEl = document.getElementById("currentGoal");
  if (fill) fill.style.width = `${pct}%`;
  if (pctEl) pctEl.textContent = `${pct}%`;
  if (goalEl) goalEl.textContent = Number(currentGoal.target || 0).toFixed(2);

  const lastTrip = user.trips.at(-1);
  const lastTripEl = document.getElementById("lastTrip");
  if (lastTripEl) lastTripEl.textContent = lastTrip ? `You earned KES ${Number(lastTrip.amount).toFixed(2)} on your last trip.` : "No trips recorded yet.";
}

// ----------------- AUTO INIT (wire up pages) -----------------
document.addEventListener("DOMContentLoaded", () => {
  // Auth page
  if (document.getElementById("loginCard") || document.getElementById("signupCard")) {
    initAuthPage();
  }

  // Pages that require auth
  const path = window.location.pathname;
  const page = path.split("/").pop();

  // For all app pages try to init common features
  initSidebar();

  // If dashboard exists
  if (document.getElementById("earnToday") || document.getElementById("progressFill")) {
    if (!ensureAuthOrRedirect()) return;
    renderDashboardPage();
  }

  // Trips page
  if (document.getElementById("tripsBody") || document.getElementById("saveTripBtn")) {
    if (!ensureAuthOrRedirect()) return;
    renderTrips();
    const saveBtn = document.getElementById("saveTripBtn");
    if (saveBtn) saveBtn.addEventListener("click", saveTrip);

    // wire credit block show/hide
    const paymentEl = document.getElementById("tripPayment");
    const creditBlock = document.getElementById("creditBlock");
    if (paymentEl && creditBlock) {
      const update = () => { if (paymentEl.value === "Credit") creditBlock.classList.add("active"); else creditBlock.classList.remove("active"); };
      paymentEl.addEventListener("change", update);
      update();
    }
    // default trip date
    const dt = document.getElementById("tripDate");
    if (dt && !dt.value) dt.value = new Date().toISOString().slice(0,16);
  }

  // Credits page
  if (document.getElementById("creditsBody") || document.getElementById("creditBody")) {
    if (!ensureAuthOrRedirect()) return;
    renderCredits();
  }

  // Expenses page
  if (document.getElementById("expensesBody") || document.getElementById("saveExpenseBtn")) {
    if (!ensureAuthOrRedirect()) return;
    renderExpenses();
    const btn = document.getElementById("saveExpenseBtn");
    if (btn) btn.addEventListener("click", saveExpense);
    // prefill date
    const d = document.getElementById("expenseDate");
    if (d && !d.value) d.value = new Date().toISOString().slice(0,10);
  }

  // Savings page
  if (document.getElementById("savingsManualBody") || document.getElementById("saveManualBtn")) {
    if (!ensureAuthOrRedirect()) return;
    renderSavingsManual();
    populateGoalsDropdown();
    const btn = document.getElementById("saveManualBtn");
    if (btn) btn.addEventListener("click", saveManualSaving);
    const d = document.getElementById("saveDate");
    if (d && !d.value) d.value = new Date().toISOString().slice(0,10);
  }

  // Goals page
  if (document.getElementById("goalsBody") || document.getElementById("saveGoalBtn")) {
    if (!ensureAuthOrRedirect()) return;
    renderGoals();
    const btn = document.getElementById("saveGoalBtn");
    if (btn) btn.addEventListener("click", saveGoal);
  }

  // Reports page (download CSV)
  if (document.getElementById("downloadCSVBtn")) {
    if (!ensureAuthOrRedirect()) return;
    const dl = document.getElementById("downloadCSVBtn");
    dl.addEventListener("click", downloadReportCSV);
  }

  // Profile page
  if (document.getElementById("profileName") || document.getElementById("profileUser")) {
    if (!ensureAuthOrRedirect()) return;
    loadProfile();
    const passBtn = document.getElementById("changePassBtn");
    if (passBtn) passBtn.addEventListener("click", updatePasswordFromProfile);
  }
});
