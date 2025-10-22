// BodaSave final script.js
// Handles: auth (signup/login), logout, trips, expenses, savings, goals, dashboard, reports, profile, CSV export, clear data
// Data stored in localStorage per user under 'bodaUsers' and the logged-in user key 'loggedInUser'

// ---------- Keys & Helpers ----------
const USERS_KEY = "bodaUsers";
const LOGGED_KEY = "loggedInUser";

function getUsers() {
  return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
}
function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}
function getCurrentUser() {
  const username = localStorage.getItem(LOGGED_KEY);
  if (!username) return null;
  const users = getUsers();
  return users.find(u => u.username === username) || null;
}
function updateCurrentUser(user) {
  const users = getUsers();
  const idx = users.findIndex(u => u.username === user.username);
  if (idx >= 0) users[idx] = user;
  else users.push(user);
  saveUsers(users);
}

// ---------- AUTH (index.html) ----------
function initAuthPage() {
  const loginBtn = document.getElementById("loginBtn");
  const signupBtn = document.getElementById("signupBtn");
  const openSignup = document.getElementById("openSignup");
  const cancelSignup = document.getElementById("cancelSignup");
  const loginCard = document.getElementById("loginCard");
  const signupCard = document.getElementById("signupCard");

  if (openSignup) {
    openSignup.addEventListener("click", (e) => {
      e.preventDefault();
      loginCard.classList.add("hidden");
      signupCard.classList.remove("hidden");
    });
  }
  if (cancelSignup) {
    cancelSignup.addEventListener("click", () => {
      signupCard.classList.add("hidden");
      loginCard.classList.remove("hidden");
    });
  }

  if (signupBtn) {
    signupBtn.addEventListener("click", () => {
      const fullName = document.getElementById("fullName").value.trim();
      const username = document.getElementById("signupUsername").value.trim();
      const password = document.getElementById("signupPassword").value.trim();
      const phone = document.getElementById("phoneNumber") ? document.getElementById("phoneNumber").value.trim() : "";
      const stage = document.getElementById("stageName") ? document.getElementById("stageName").value.trim() : "";

      if (!fullName || !username || !password) {
        alert("Please fill in Full Name, Username and Password.");
        return;
      }

      const users = getUsers();
      if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
        alert("Username already exists.");
        return;
      }

      const newUser = {
        fullName,
        username,
        password,
        phone,
        stage,
        dateJoined: new Date().toLocaleDateString(),
        trips: [],
        expenses: [],
        savings: [],
        goals: []
      };
      users.push(newUser);
      saveUsers(users);
      alert("Account created. Please log in.");
      signupCard.classList.add("hidden");
      loginCard.classList.remove("hidden");
    });
  }

  if (loginBtn) {
    loginBtn.addEventListener("click", () => {
      const username = document.getElementById("loginUsername").value.trim();
      const password = document.getElementById("loginPassword").value.trim();
      if (!username || !password) { alert("Enter credentials"); return; }
      const users = getUsers();
      const u = users.find(x => x.username.toLowerCase() === username.toLowerCase() && x.password === password);
      if (!u) { alert("Incorrect username or password."); return; }
      localStorage.setItem(LOGGED_KEY, u.username);
      window.location.href = "dashboard.html";
    });
  }
}

// ---------- AUTH CHECK ----------
function ensureAuth() {
  const u = localStorage.getItem(LOGGED_KEY);
  if (!u) {
    window.location.href = "index.html";
    return false;
  }
  return true;
}

// ---------- SIDEBAR & LOGOUT ----------
function initSidebar() {
  document.querySelectorAll("#logoutBtn").forEach(btn => {
    btn.addEventListener("click", () => {
      localStorage.removeItem(LOGGED_KEY);
      window.location.href = "index.html";
    });
  });

  const user = getCurrentUser();
  if (user) {
    document.querySelectorAll("#userName").forEach(el => { el.textContent = user.fullName || user.username; });
  }
}

// ---------- TRIPS ----------
function saveTrip() {
  const dateStr = document.getElementById('tripDate') ? document.getElementById('tripDate').value : "";
  const amount = parseFloat(document.getElementById('tripAmount') ? document.getElementById('tripAmount').value : 0);
  const details = document.getElementById('tripDetails') ? document.getElementById('tripDetails').value.trim() : "";
  const method = document.getElementById('tripPayment') ? document.getElementById('tripPayment').value : "";
  const note = document.getElementById('tripNote') ? document.getElementById('tripNote').value.trim() : "";

  if (!dateStr || isNaN(amount) || amount <= 0) { alert('Enter valid date and amount'); return; }

  const user = getCurrentUser();
  if (!user) { alert('Not logged in'); return; }

  user.trips = user.trips || [];
  const entry = { id: Date.now(), date: dateStr, amount: Number(amount), details, method, note };
  user.trips.unshift(entry);
  updateCurrentUser(user);
  alert('Trip saved');
  if (typeof renderTrips === 'function') renderTrips();
  if (typeof renderDashboardPage === 'function') renderDashboardPage();
  if (typeof renderReports === 'function') renderReports();
}

function renderTrips() {
  const user = getCurrentUser();
  if (!user) return;
  const tbody = document.getElementById('tripsBody');
  if (!tbody) return;
  tbody.innerHTML = '';
  (user.trips || []).slice(0, 50).forEach(t => {
    const tr = document.createElement('tr');
    const dateFormatted = new Date(t.date).toLocaleString();
    tr.innerHTML = `<td>${dateFormatted}</td><td>KES ${Number(t.amount).toFixed(2)}</td><td>${t.details||''}</td><td>${t.method||''}</td>`;
    tbody.appendChild(tr);
  });
}

// ---------- EXPENSES ----------
function saveExpense() {
  const date = document.getElementById('expenseDate') ? document.getElementById('expenseDate').value : "";
  const type = document.getElementById('expenseType') ? document.getElementById('expenseType').value : "";
  const amount = parseFloat(document.getElementById('expenseAmount') ? document.getElementById('expenseAmount').value : 0);
  const note = document.getElementById('expenseNote') ? document.getElementById('expenseNote').value.trim() : "";

  if (!date || !type || isNaN(amount) || amount <= 0) { alert('Enter valid expense'); return; }
  const user = getCurrentUser();
  if (!user) { alert('Not logged in'); return; }

  user.expenses = user.expenses || [];
  const e = { id: Date.now(), date, type, amount: Number(amount), note };
  user.expenses.unshift(e);
  updateCurrentUser(user);
  alert('Expense saved');
  if (typeof renderExpenses === 'function') renderExpenses();
  if (typeof renderDashboardPage === 'function') renderDashboardPage();
  if (typeof renderReports === 'function') renderReports();
}

function renderExpenses() {
  const user = getCurrentUser();
  if (!user) return;
  const tbody = document.getElementById('expensesBody');
  if (!tbody) return;
  tbody.innerHTML = '';
  (user.expenses || []).slice(0, 50).forEach(e => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${e.date}</td><td>${e.type}</td><td>KES ${Number(e.amount).toFixed(2)}</td><td>${e.note||''}</td>`;
    tbody.appendChild(tr);
  });
}

// ---------- SAVINGS ----------
function saveManualSaving() {
  const date = document.getElementById('saveDate') ? document.getElementById('saveDate').value : "";
  const amount = parseFloat(document.getElementById('saveAmount') ? document.getElementById('saveAmount').value : 0);
  const goal = document.getElementById('saveGoalSelect') ? document.getElementById('saveGoalSelect').value : "";
  const note = document.getElementById('saveNote') ? document.getElementById('saveNote').value.trim() : "";

  if (!date || isNaN(amount) || amount <= 0) { alert('Enter valid saving'); return; }
  const user = getCurrentUser();
  if (!user) { alert('Not logged in'); return; }

  user.savings = user.savings || [];
  const s = { id: Date.now(), date, amount: Number(amount), goal, note };
  user.savings.unshift(s);
  updateCurrentUser(user);
  alert('Saved');
  if (typeof renderSavingsManual === 'function') renderSavingsManual();
  if (typeof renderDashboardPage === 'function') renderDashboardPage();
  if (typeof renderReports === 'function') renderReports();
}

function renderSavingsManual() {
  const user = getCurrentUser();
  if (!user) return;
  const tbody = document.getElementById('savingsManualBody');
  if (!tbody) return;
  tbody.innerHTML = '';
  (user.savings || []).slice(0, 100).forEach(s => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${s.date}</td><td>KES ${Number(s.amount).toFixed(2)}</td><td>${s.goal||''}</td><td>${s.note||''}</td>`;
    tbody.appendChild(tr);
  });
}

// ---------- GOALS ----------
function saveGoal() {
  const name = document.getElementById('goalName') ? document.getElementById('goalName').value.trim() : "";
  const target = parseFloat(document.getElementById('goalTarget') ? document.getElementById('goalTarget').value : 0);
  const end = document.getElementById('goalEnd') ? document.getElementById('goalEnd').value : "";
  const priority = document.getElementById('goalPriority') ? document.getElementById('goalPriority').value : "Medium";

  if (!name || isNaN(target) || target <= 0) { alert('Enter valid goal'); return; }
  const user = getCurrentUser();
  if (!user) { alert('Not logged in'); return; }

  user.goals = user.goals || [];
  const g = { id: Date.now(), name, target: Number(target), end, priority, created: new Date().toLocaleDateString() };
  user.goals.unshift(g);
  updateCurrentUser(user);
  alert('Goal saved');
  if (typeof renderGoals === 'function') renderGoals();
  if (typeof renderDashboardPage === 'function') renderDashboardPage();
}

// ---------- DASHBOARD ----------
function renderDashboardPage() {
  const user = getCurrentUser();
  if (!user) return;
  const today = new Date().toLocaleDateString();
  const tripsToday = (user.trips || []).filter(t => new Date(t.date).toLocaleDateString() === today);
  const expensesToday = (user.expenses || []).filter(e => new Date(e.date).toLocaleDateString() === today);
  const savingsToday = (user.savings || []).filter(s => new Date(s.date).toLocaleDateString() === today);

  const earnToday = tripsToday.reduce((s, t) => s + (t.amount || 0), 0);
  const expToday = expensesToday.reduce((s, e) => s + (e.amount || 0), 0);
  const saveToday = savingsToday.reduce((s, sv) => s + (sv.amount || 0), 0);
  const netToday = earnToday - expToday - saveToday;

  const earnEl = document.getElementById('earnToday');
  const expEl = document.getElementById('expToday');
  const netEl = document.getElementById('netToday');
  if (earnEl) earnEl.textContent = `KES ${earnToday.toFixed(2)}`;
  if (expEl) expEl.textContent = `KES ${expToday.toFixed(2)}`;
  if (netEl) netEl.textContent = `KES ${netToday.toFixed(2)}`;

  const lastTrip = (user.trips || [])[0];
  const lastTripEl = document.getElementById('lastTrip');
  if (lastTripEl) lastTripEl.textContent = lastTrip ? `You earned KES ${lastTrip.amount} on your last trip.` : 'No trips recorded yet.';

  const currentGoal = (user.goals || [])[0] || { target: 0, name: '' };
  const totalSaved = (user.savings || []).reduce((s, sv) => s + (sv.amount || 0), 0);
  const pct = currentGoal.target ? Math.min(100, Math.round((totalSaved / currentGoal.target) * 100)) : 0;
  const progressFill = document.getElementById('progressFill');
  const progressPercent = document.getElementById('progressPercent');
  const currentGoalEl = document.getElementById('currentGoal');
  if (progressFill) progressFill.style.width = pct + '%';
  if (progressPercent) progressPercent.textContent = pct + '%';
  if (currentGoalEl) currentGoalEl.textContent = currentGoal.target || 0;
}

// ---------- REPORTS ----------
function renderReports() {
  const user = getCurrentUser();
  if (!user) return;
  const earned = (user.trips || []).reduce((s, t) => s + (t.amount || 0), 0);
  const spent = (user.expenses || []).reduce((s, e) => s + (e.amount || 0), 0);
  const saved = (user.savings || []).reduce((s, sv) => s + (sv.amount || 0), 0);

  const pe = document.getElementById('reportEarned');
  const ps = document.getElementById('reportSpent');
  const pv = document.getElementById('reportSaved');
  if (pe) pe.textContent = earned.toFixed(2);
  if (ps) ps.textContent = spent.toFixed(2);
  if (pv) pv.textContent = saved.toFixed(2);

  const body = document.getElementById('reportBody');
  if (!body) return;
  const rows = [];
  (user.trips || []).forEach(t => rows.push({ date: new Date(t.date).toLocaleDateString(), type: 'Trip', amount: t.amount, note: t.details || t.note || '' }));
  (user.expenses || []).forEach(e => rows.push({ date: e.date, type: e.type, amount: e.amount, note: e.note || '' }));
  (user.savings || []).forEach(s => rows.push({ date: s.date, type: 'Saving', amount: s.amount, note: s.note || '' }));
  rows.sort((a, b) => new Date(b.date) - new Date(a.date));
  body.innerHTML = '';
  rows.slice(0, 200).forEach(r => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${r.date}</td><td>${r.type}</td><td>KES ${Number(r.amount||0).toFixed(2)}</td><td>${r.note||''}</td>`;
    body.appendChild(tr);
  });
}

// ---------- PROFILE & EXPORT ----------
function renderProfile() {
  const user = getCurrentUser();
  if (!user) return;
  const setIf = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = value || ''; };
  setIf('profileName', user.fullName || '');
  setIf('profileUser', user.username || '');
  setIf('profilePhone', user.phone || '');
  setIf('profileStage', user.stage || '');
  setIf('profileJoined', user.dateJoined || '');
}

function exportCSV() {
  const user = getCurrentUser();
  if (!user) return alert('No user logged in.');
  const rows = [['type','date','amount','category','note']];
  (user.trips || []).forEach(t => rows.push(['trip', t.date, t.amount, t.details||'', t.note||'']));
  (user.expenses || []).forEach(e => rows.push(['expense', e.date, e.amount, e.type||'', e.note||'']));
  (user.savings || []).forEach(s => rows.push(['saving', s.date, s.amount, s.goal||'', s.note||'']));
  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${user.username || 'bodasave'}_data.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function clearUserData() {
  if (!confirm('This will remove your trips, expenses, savings and goals. Continue?')) return;
  const user = getCurrentUser();
  if (!user) return;
  user.trips = []; user.expenses = []; user.savings = []; user.goals = [];
  updateCurrentUser(user);
  alert('Data cleared');
  location.reload();
}

// ---------- init on pages ----------
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('loginCard')) {
    initAuthPage();
    return;
  }

  if (!ensureAuth()) return;
  initSidebar();

  if (document.getElementById('earnToday')) renderDashboardPage();
  if (document.getElementById('tripsBody')) {
    renderTrips();
    const saveTripBtn = document.getElementById('saveTripBtn');
    if (saveTripBtn && !saveTripBtn.hasAttribute('data-bound')) {
      saveTripBtn.addEventListener('click', saveTrip);
      saveTripBtn.setAttribute('data-bound','1');
    }
  }
  if (document.getElementById('expensesBody')) {
    renderExpenses();
    const saveExpenseBtn = document.getElementById('saveExpenseBtn');
    if (saveExpenseBtn && !saveExpenseBtn.hasAttribute('data-bound')) {
      saveExpenseBtn.addEventListener('click', saveExpense);
      saveExpenseBtn.setAttribute('data-bound','1');
    }
  }
  if (document.getElementById('savingsManualBody')) {
    renderSavingsManual();
    const saveSaveBtn = document.getElementById('saveManualBtn');
    if (saveSaveBtn && !saveSaveBtn.hasAttribute('data-bound')) {
      saveSaveBtn.addEventListener('click', saveManualSaving);
      saveSaveBtn.setAttribute('data-bound','1');
    }
  }
  if (document.getElementById('goalsBody')) {
    renderGoals();
    const saveGoalBtn = document.getElementById('saveGoalBtn');
    if (saveGoalBtn && !saveGoalBtn.hasAttribute('data-bound')) {
      saveGoalBtn.addEventListener('click', saveGoal);
      saveGoalBtn.setAttribute('data-bound','1');
    }
  }
  if (document.getElementById('reportBody')) renderReports();
  if (document.getElementById('profileName')) {
    renderProfile();
    const exportBtn = document.getElementById('exportCsv');
    if (exportBtn && !exportBtn.hasAttribute('data-bound')) {
      exportBtn.addEventListener('click', exportCSV);
      exportBtn.setAttribute('data-bound','1');
    }
    const clearBtn = document.getElementById('clearData');
    if (clearBtn && !clearBtn.hasAttribute('data-bound')) {
      clearBtn.addEventListener('click', clearUserData);
      clearBtn.setAttribute('data-bound','1');
    }
  }
});

// Prevent back-button showing cached pages after logout
window.addEventListener('pageshow', (event) => {
  const loggedIn = localStorage.getItem(LOGGED_KEY);
  if (!loggedIn && event.persisted) {
    window.location.href = 'index.html';
  }
});
