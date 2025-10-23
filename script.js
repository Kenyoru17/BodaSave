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

// Ensure user object has arrays (defensive)
function ensureUserArrays(user) {
  if (!user.trips) user.trips = [];
  if (!user.expenses) user.expenses = [];
  if (!user.savings) user.savings = [];
  if (!user.goals) user.goals = [];
  if (!user.credits) user.credits = [];
}

// ---------------- AUTHENTICATION ----------------
function initAuthPage() {
  const loginBtn = document.getElementById("loginBtn");
  const signupBtn = document.getElementById("signupBtn");
  const openSignup = document.getElementById("openSignup");
  const cancelSignup = document.getElementById("cancelSignup");
  const loginCard = document.getElementById("loginCard");
  const signupCard = document.getElementById("signupCard");

  if (openSignup && loginCard && signupCard) {
    openSignup.addEventListener("click", (e) => {
      e.preventDefault();
      loginCard.classList.add("hidden");
      signupCard.classList.remove("hidden");
    });
  }
  if (cancelSignup && loginCard && signupCard) {
    cancelSignup.addEventListener("click", () => {
      signupCard.classList.add("hidden");
      loginCard.classList.remove("hidden");
    });
  }

  // Signup
  if (signupBtn) {
    signupBtn.addEventListener("click", () => {
      const fullName = (document.getElementById("fullName") || {}).value || "";
      const username = (document.getElementById("signupUsername") || {}).value || "";
      const password = (document.getElementById("signupPassword") || {}).value || "";
      const phone = (document.getElementById("phoneNumber") || {}).value || "";
      const stage = (document.getElementById("stageName") || {}).value || "";

      if (!fullName.trim() || !username.trim() || !password.trim()) {
        alert("Please fill in Full Name, Username and Password.");
        return;
      }
      const users = getUsers();
      if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
        alert("That username already exists.");
        return;
      }

      users.push({
        fullName: fullName.trim(),
        username: username.trim(),
        password: password,
        phone: phone.trim(),
        stage: stage.trim(),
        dateJoined: new Date().toLocaleDateString(),
        trips: [],
        expenses: [],
        savings: [],
        goals: [],
        credits: []
      });
      saveUsers(users);
      alert("Account created successfully! You can now log in.");
      // Return to login card (if available) or reload
      if (loginCard && signupCard) {
        signupCard.classList.add("hidden");
        loginCard.classList.remove("hidden");
      } else {
        window.location.reload();
      }
    });
  }

  // Login
  if (loginBtn) {
    loginBtn.addEventListener("click", () => {
      const username = (document.getElementById("loginUsername") || {}).value || "";
      const password = (document.getElementById("loginPassword") || {}).value || "";
      if (!username.trim() || !password) return alert("Enter username and password.");
      const user = getUsers().find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
      if (!user) return alert("Invalid credentials.");
      localStorage.setItem("loggedInUser", user.username);
      window.location.href = "dashboard.html";
    });
  }
}

function ensureAuth() {
  if (!localStorage.getItem("loggedInUser")) {
    // If already on index (login) don't redirect
    if (location.pathname.endsWith("index.html") || location.pathname.endsWith("/") || location.pathname.endsWith("index")) {
      return;
    }
    window.location.href = "index.html";
  }
}

// ---------------- SIDEBAR ----------------
function initSidebar() {
  // Attach logout - safe guard if button not present
  document.querySelectorAll("#logoutBtn").forEach(btn => {
    btn.addEventListener("click", () => {
      localStorage.removeItem("loggedInUser");
      // prevent caching/back navigation to authenticated pages
      location.href = "index.html";
    });
  });

  // Display name in any element(s) with id=userName
  const user = getCurrentUser();
  if (user && user.fullName) {
    document.querySelectorAll("#userName").forEach(el => el.textContent = user.fullName);
  }
}

// ---------------- TRIPS ----------------
function saveTrip() {
  const user = getCurrentUser();
  if (!user) return alert("User not found.");

  ensureUserArrays(user);

  const dateEl = document.getElementById("tripDate");
  const amountEl = document.getElementById("tripAmount");
  const detailsEl = document.getElementById("tripDetails");
  const paymentEl = document.getElementById("tripPayment");
  const noteEl = document.getElementById("tripNote");

  const date = dateEl ? dateEl.value : "";
  const amount = amountEl ? parseFloat(amountEl.value || "0") : 0;
  const details = detailsEl ? detailsEl.value.trim() : "";
  const payment = paymentEl ? paymentEl.value : "";
  const note = noteEl ? noteEl.value.trim() : "";

  if (!date || !amount) return alert("Please fill date and amount.");

  const trip = { id: Date.now(), date, amount, details, payment, note };
  user.trips.push(trip);

  // If trip is on credit, read credit fields if present else fallback to prompt
  if (payment.toLowerCase() === "credit") {
    const customerInput = document.getElementById("creditCustomer");
    const phoneInput = document.getElementById("creditPhone");
    const customer = customerInput ? (customerInput.value.trim() || "Unknown") : (prompt("Enter customer name:") || "Unknown");
    const phone = phoneInput ? (phoneInput.value.trim() || "N/A") : (prompt("Enter customer phone:") || "N/A");
    // add credit record with id for robust referencing
    user.credits.push({
      id: Date.now() + Math.floor(Math.random() * 999),
      tripId: trip.id,
      customer,
      phone,
      details,
      amount,
      date,
      status: "Unpaid"
    });
  }

  updateCurrentUser(user);
  // Try to re-render trips and dashboard safely
  if (typeof renderTrips === "function") renderTrips();
  if (typeof renderDashboardPage === "function") renderDashboardPage();
  alert("Trip saved successfully.");
}

function renderTrips() {
  const user = getCurrentUser();
  if (!user) return;
  const body = document.getElementById("tripsBody");
  if (!body) return;
  body.innerHTML = "";
  // show latest first
  user.trips.slice().reverse().forEach(t => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${t.date}</td><td>KES ${Number(t.amount || 0).toFixed(2)}</td><td>${t.details || ""}</td><td>${t.payment || ""}</td>`;
    body.appendChild(tr);
  });
}

// ---------------- EXPENSES ----------------
function saveExpense() {
  const user = getCurrentUser();
  if (!user) return alert("User not found.");
  ensureUserArrays(user);

  const date = (document.getElementById("expenseDate") || {}).value || "";
  const type = (document.getElementById("expenseType") || {}).value || "";
  const amount = parseFloat((document.getElementById("expenseAmount") || {}).value || "0");
  const note = (document.getElementById("expenseNote") || {}).value || "";

  if (!date || !amount) return alert("Please fill date and amount.");
  user.expenses.push({ id: Date.now(), date, type, amount, note });
  updateCurrentUser(user);
  if (typeof renderExpenses === "function") renderExpenses();
  if (typeof renderDashboardPage === "function") renderDashboardPage();
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
    tr.innerHTML = `<td>${e.date}</td><td>${e.type}</td><td>KES ${Number(e.amount || 0).toFixed(2)}</td><td>${e.note || ""}</td>`;
    body.appendChild(tr);
  });
}

// ---------------- SAVINGS ----------------
function saveManualSaving() {
  const user = getCurrentUser();
  if (!user) return alert("User not found.");
  ensureUserArrays(user);

  const date = (document.getElementById("saveDate") || {}).value || "";
  const amount = parseFloat((document.getElementById("saveAmount") || {}).value || "0");
  const goal = (document.getElementById("saveGoalSelect") || {}).value || "";
  const note = (document.getElementById("saveNote") || {}).value || "";

  if (!date || !amount) return alert("Please fill date and amount.");
  user.savings.push({ id: Date.now(), date, amount, goal, note });
  updateCurrentUser(user);
  if (typeof renderSavingsManual === "function") renderSavingsManual();
  if (typeof renderDashboardPage === "function") renderDashboardPage();
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
    tr.innerHTML = `<td>${s.date}</td><td>KES ${Number(s.amount || 0).toFixed(2)}</td><td>${s.goal || ""}</td><td>${s.note || ""}</td>`;
    body.appendChild(tr);
  });
}

// ---------------- GOALS ----------------
function saveGoal() {
  const user = getCurrentUser();
  if (!user) return alert("User not found.");
  ensureUserArrays(user);

  const name = (document.getElementById("goalName") || {}).value || "";
  const target = parseFloat((document.getElementById("goalTarget") || {}).value || "0");
  const end = (document.getElementById("goalEnd") || {}).value || "";
  const priority = (document.getElementById("goalPriority") || {}).value || "Medium";

  if (!name.trim() || !target) return alert("Please enter all details.");
  user.goals.push({ id: Date.now(), name: name.trim(), target, end, priority });
  updateCurrentUser(user);
  if (typeof renderGoals === "function") renderGoals();
  if (typeof renderDashboardPage === "function") renderDashboardPage();
  alert("Goal saved.");
}

function renderGoals() {
  const user = getCurrentUser();
  if (!user) return;
  const body = document.getElementById("goalsBody");
  if (!body) return;
  body.innerHTML = "";
  user.goals.slice().reverse().forEach(g => {
    const totalSaved = user.savings.filter(s => s.goal === g.name).reduce((sum, s) => sum + (s.amount || 0), 0);
    const progressPct = g.target ? Math.min(100, Math.round((totalSaved / g.target) * 100)) : 0;
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${g.name}</td><td>KES ${Number(g.target).toFixed(2)}</td><td>${progressPct}%</td><td>${progressPct >= 100 ? "Completed" : "Ongoing"}</td>`;
    body.appendChild(tr);
  });
}

// ---------------- CREDITS ----------------
function renderCredits() {
  const user = getCurrentUser();
  if (!user) return;
  const body = document.getElementById("creditBody");
  if (!body) return;
  body.innerHTML = "";

  // we'll render latest first but reference by credit.id
  const credits = user.credits.slice().reverse();
  credits.forEach(c => {
    const tr = document.createElement("tr");
    const statusClass = c.status === "Paid" ? "paid" : "unpaid";
    tr.innerHTML = `
      <td>${c.customer || ""}</td>
      <td>${c.phone || ""}</td>
      <td>${c.details || ""}</td>
      <td>KES ${Number(c.amount || 0).toFixed(2)}</td>
      <td>${c.date || ""}</td>
      <td style="font-weight:700;color:${c.status === 'Paid' ? 'var(--success)' : '#c0392b'}">${c.status}</td>
      <td>${c.status === "Unpaid" ? `<button class="btn small primary" onclick="markPaidById(${c.id})">Mark Paid</button>` : "✓"}</td>
    `;
    body.appendChild(tr);
  });
}

// Mark paid by id (robust)
function markPaidById(id) {
  const user = getCurrentUser();
  if (!user) return;
  const idx = user.credits.findIndex(c => c.id === id);
  if (idx === -1) return alert("Record not found.");
  user.credits[idx].status = "Paid";
  updateCurrentUser(user);
  if (typeof renderCredits === "function") renderCredits();
  if (typeof renderReports === "function") renderReports();
  if (typeof renderDashboardPage === "function") renderDashboardPage();
}

// ---------------- REPORTS ----------------
function renderReports() {
  const user = getCurrentUser();
  if (!user) return;
  const earned = user.trips.reduce((s, t) => s + (t.amount || 0), 0);
  const spent = user.expenses.reduce((s, e) => s + (e.amount || 0), 0);
  const saved = user.savings.reduce((s, a) => s + (a.amount || 0), 0);

  const earnedEl = document.getElementById("reportEarned");
  const spentEl = document.getElementById("reportSpent");
  const savedEl = document.getElementById("reportSaved");
  if (earnedEl) earnedEl.textContent = Number(earned).toFixed(2);
  if (spentEl) spentEl.textContent = Number(spent).toFixed(2);
  if (savedEl) savedEl.textContent = Number(saved).toFixed(2);

  // render combined recent records
  const body = document.getElementById("reportBody");
  if (!body) return;
  body.innerHTML = "";
  const rows = [];
  user.trips.forEach(t => rows.push({date: t.date, type: "Trip", amount: t.amount, details: t.details || t.note || ""}));
  user.expenses.forEach(e => rows.push({date: e.date, type: e.type || "Expense", amount: e.amount, details: e.note || ""}));
  user.savings.forEach(s => rows.push({date: s.date, type: "Saving", amount: s.amount, details: s.goal || s.note || ""}));
  user.credits.forEach(c => rows.push({date: c.date, type: "Credit (" + (c.status||"") + ")", amount: c.amount, details: c.customer + " / " + c.phone}));

  // sort descending by date (best-effort)
  rows.sort((a,b) => new Date(b.date) - new Date(a.date));
  rows.slice(0,200).forEach(r => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${r.date}</td><td>${r.type}</td><td>KES ${Number(r.amount || 0).toFixed(2)}</td><td>${r.details || ""}</td>`;
    body.appendChild(tr);
  });
}

// Export CSV for a chosen date (YYYY-MM-DD)
function exportCSV() {
  const user = getCurrentUser();
  if (!user) return alert("User not found.");
  const date = prompt("Enter date (YYYY-MM-DD) to export data for:");
  if (!date) return;
  const rows = [];

  user.trips.filter(t => (t.date || "").includes(date)).forEach(t => rows.push(["Trip", t.date, t.amount, t.details || "", t.note || ""]));
  user.expenses.filter(e => (e.date || "").includes(date)).forEach(e => rows.push(["Expense", e.date, e.amount, e.type || "", e.note || ""]));
  user.savings.filter(s => (s.date || "").includes(date)).forEach(s => rows.push(["Saving", s.date, s.amount, s.goal || "", s.note || ""]));
  user.credits.filter(c => (c.date || "").includes(date)).forEach(c => rows.push(["Credit " + (c.status||""), c.date, c.amount, c.customer || "", c.phone || ""]));

  if (rows.length === 0) return alert("No data found for that date.");

  let csv = "Type,Date,Amount,FieldA,FieldB\n";
  rows.forEach(r => {
    const escaped = r.map(cell => `"${String(cell).replace(/"/g,'""')}"`).join(",");
    csv += escaped + "\n";
  });

  const blob = new Blob([csv], {type: "text/csv"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `BodaSave_${date}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ---------------- PROFILE ----------------
function renderProfile() {
  const user = getCurrentUser();
  if (!user) return;
  if (document.getElementById("profileName")) document.getElementById("profileName").textContent = user.fullName || "";
  if (document.getElementById("profileUser")) document.getElementById("profileUser").textContent = user.username || "";
  if (document.getElementById("profilePhone")) document.getElementById("profilePhone").textContent = user.phone || "";
  if (document.getElementById("profileStage")) document.getElementById("profileStage").textContent = user.stage || "";
  if (document.getElementById("profileJoined")) document.getElementById("profileJoined").textContent = user.dateJoined || "";
}

function clearUserData() {
  if (!confirm("This will clear your trips, expenses, savings, goals and credits. Continue?")) return;
  const user = getCurrentUser();
  if (!user) return;
  user.trips = [];
  user.expenses = [];
  user.savings = [];
  user.goals = [];
  user.credits = [];
  updateCurrentUser(user);
  alert("All data cleared.");
  location.reload();
}

// ---------------- DASHBOARD ----------------
function renderDashboardPage() {
  const user = getCurrentUser();
  if (!user) return;
  const today = new Date().toLocaleDateString();

  const tripsToday = user.trips.filter(t => new Date(t.date).toLocaleDateString() === today);
  const expensesToday = user.expenses.filter(e => new Date(e.date).toLocaleDateString() === today);
  const savingsToday = user.savings.filter(s => new Date(s.date).toLocaleDateString() === today);

  const earn = tripsToday.reduce((s, t) => s + (t.amount || 0), 0);
  const spend = expensesToday.reduce((s, e) => s + (e.amount || 0), 0);
  const save = savingsToday.reduce((s, v) => s + (v.amount || 0), 0);

  const net = earn - spend - save; // net after saving

  if (document.getElementById("earnToday")) document.getElementById("earnToday").textContent = `KES ${Number(earn).toFixed(2)}`;
  if (document.getElementById("expToday")) document.getElementById("expToday").textContent = `KES ${Number(spend).toFixed(2)}`;
  if (document.getElementById("netToday")) document.getElementById("netToday").textContent = `KES ${Number(net).toFixed(2)}`;

  const currentGoal = user.goals[0] || { target: 0 };
  const totalSaved = user.savings.reduce((s, v) => s + (v.amount || 0), 0);
  const pct = currentGoal.target ? Math.min(100, Math.round((totalSaved / currentGoal.target) * 100)) : 0;
  if (document.getElementById("progressFill")) document.getElementById("progressFill").style.width = `${pct}%`;
  if (document.getElementById("progressPercent")) document.getElementById("progressPercent").textContent = `${pct}%`;
  if (document.getElementById("currentGoal")) document.getElementById("currentGoal").textContent = currentGoal.target || 0;

  const lastTrip = user.trips && user.trips.length ? user.trips[user.trips.length - 1] : null;
  if (document.getElementById("lastTrip")) document.getElementById("lastTrip").textContent = lastTrip ? `You earned KES ${Number(lastTrip.amount || 0).toFixed(2)} on your last trip.` : "No trips recorded yet.";
}

// ---------------- AUTO INIT ----------------
document.addEventListener("DOMContentLoaded", () => {
  // only init auth handlers on login page (index.html)
  if (document.getElementById("loginCard")) {
    initAuthPage();
    // wire quick open/close if elements exist (login/signup inlined in index)
    const openSignup = document.getElementById("openSignup");
    const cancelSignup = document.getElementById("cancelSignup");
    const loginCard = document.getElementById("loginCard");
    const signupCard = document.getElementById("signupCard");
    if (openSignup && loginCard && signupCard) openSignup.addEventListener("click",(e)=>{e.preventDefault();loginCard.classList.add('hidden');signupCard.classList.remove('hidden');});
    if (cancelSignup && loginCard && signupCard) cancelSignup.addEventListener("click",()=>{signupCard.classList.add('hidden');loginCard.classList.remove('hidden');});
  }
});
