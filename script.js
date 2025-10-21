// Shared logic for BodaSave (localStorage based)
// Key names
const USERS_KEY = 'bodaUsers';
const LOGGED_KEY = 'loggedInUser';

// ---------- AUTH & INIT ----------
function getUsers(){
  return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
}
function saveUsers(users){
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}
function ensureAuth(){
  const u = localStorage.getItem(LOGGED_KEY);
  if(!u){
    window.location.href = 'index.html';
    return false;
  }
  return true;
}
function getCurrentUser(){
  const username = localStorage.getItem(LOGGED_KEY);
  if(!username) return null;
  const users = getUsers();
  return users.find(t => t.username === username) || null;
}
function updateCurrentUser(user){
  const users = getUsers();
  const idx = users.findIndex(u => u.username === user.username);
  if(idx >=0) users[idx] = user;
  else users.push(user);
  saveUsers(users);
}

// ---------- AUTH PAGE (index.html) ----------
function initAuthPage(){
  // elements
  const goSignup = document.getElementById('goSignup');
  const cancelSignup = document.getElementById('cancelSignup');
  const signupBtn = document.getElementById('signupBtn');
  const loginBtn = document.getElementById('loginBtn');

  goSignup.addEventListener('click', ()=>{
    document.getElementById('loginBox').style.display = 'none';
    document.getElementById('signupBox').style.display = 'block';
  });
  cancelSignup.addEventListener('click', ()=>{
    document.getElementById('signupBox').style.display = 'none';
    document.getElementById('loginBox').style.display = 'block';
  });

  signupBtn.addEventListener('click', ()=>{
    const fullName = document.getElementById('fullName').value.trim();
    const username = document.getElementById('signupUsername').value.trim();
    const phone = document.getElementById('phoneNumber').value.trim();
    const stage = document.getElementById('stageName').value.trim();
    const password = document.getElementById('signupPassword').value.trim();
    if(!fullName||!username||!phone||!stage||!password){ alert('Please fill all fields'); return; }

    let users = getUsers();
    if(users.some(u=>u.username.toLowerCase()===username.toLowerCase())){ alert('Username exists'); return; }

    const newUser = { fullName, username, password, phone, stage, dateJoined: new Date().toLocaleDateString(), trips:[], expenses:[], savings:[], goals:[] };
    users.push(newUser);
    saveUsers(users);
    alert('Account created. You can log in now.');
    document.getElementById('signupBox').style.display = 'none';
    document.getElementById('loginBox').style.display = 'block';
  });

  loginBtn.addEventListener('click', ()=>{
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    if(!username||!password){ alert('Enter credentials'); return; }
    const users = getUsers();
    const u = users.find(x=>x.username.toLowerCase()===username.toLowerCase() && x.password===password);
    if(!u){ alert('Incorrect username or password'); return; }
    localStorage.setItem(LOGGED_KEY, u.username);
    window.location.href = 'dashboard.html';
  });
}

// ---------- SIDEBAR & COMMON UI ----------
function initSidebar(){
  // logout buttons
  document.querySelectorAll('#logoutBtn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      localStorage.removeItem(LOGGED_KEY);
      window.location.href = 'index.html';
    });
  });
  // hamburger for small screens toggles sidebar (basic: scroll into view)
  document.querySelectorAll('.hamburger').forEach(b=>{
    b.addEventListener('click', ()=> window.scrollTo({top:0,behavior:'smooth'}));
  });
  // display username where needed
  const user = getCurrentUser();
  if(user){
    document.querySelectorAll('#userName').forEach(n=> n.textContent = user.fullName);
  }
}

// ---------- TRIPS ----------
function saveTrip(){
  const dateStr = document.getElementById('tripDate').value;
  const amount = parseFloat(document.getElementById('tripAmount').value);
  const details = document.getElementById('tripDetails').value.trim();
  const method = document.getElementById('tripPayment').value;
  const note = document.getElementById('tripNote').value.trim();

  if(!dateStr || isNaN(amount) || amount<=0){ alert('Enter valid date and amount'); return; }

  const user = getCurrentUser();
  const entry = { id: Date.now(), date: dateStr, amount, details, method, note };
  user.trips.unshift(entry); // latest first
  updateCurrentUser(user);
  alert('Trip saved');
  renderTrips();
  renderDashboardPage(); // keep dashboard updated
}

function renderTrips(){
  const user = getCurrentUser();
  const tbody = document.getElementById('tripsBody');
  if(!tbody) return;
  tbody.innerHTML = '';
  user.trips.slice(0,20).forEach(t=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${new Date(t.date).toLocaleString()}</td><td>${t.amount}</td><td>${t.details||''}</td><td>${t.method||''}</td>`;
    tbody.appendChild(tr);
  });
}

// ---------- EXPENSES ----------
function saveExpense(){
  const date = document.getElementById('expenseDate').value;
  const type = document.getElementById('expenseType').value;
  const amount = parseFloat(document.getElementById('expenseAmount').value);
  const note = document.getElementById('expenseNote').value.trim();

  if(!date || !type || isNaN(amount) || amount<=0){ alert('Enter valid expense'); return; }
  const user = getCurrentUser();
  const e = { id: Date.now(), date, type, amount, note };
  user.expenses.unshift(e);
  updateCurrentUser(user);
  alert('Expense saved');
  renderExpenses();
  renderDashboardPage();
}

function renderExpenses(){
  const user = getCurrentUser();
  const tbody = document.getElementById('expensesBody');
  if(!tbody) return;
  tbody.innerHTML = '';
  user.expenses.slice(0,30).forEach(e=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${e.date}</td><td>${e.type}</td><td>${e.amount}</td><td>${e.note||''}</td>`;
    tbody.appendChild(tr);
  });
}

// ---------- SAVINGS (manual) ----------
function saveManualSaving(){
  const date = document.getElementById('saveDate').value;
  const amount = parseFloat(document.getElementById('saveAmount').value);
  const goal = document.getElementById('saveGoalSelect').value;
  const note = document.getElementById('saveNote').value.trim();

  if(!date || isNaN(amount) || amount<=0){ alert('Enter valid saving'); return; }
  const user = getCurrentUser();
  const s = { id: Date.now(), date, amount, goal, note };
  user.savings.unshift(s);
  updateCurrentUser(user);
  alert('Saved');
  renderSavingsManual();
  renderDashboardPage();
}

function renderSavingsManual(){
  const user = getCurrentUser();
  const tbody = document.getElementById('savingsManualBody');
  if(!tbody) return;
  tbody.innerHTML = '';
  user.savings.slice(0,50).forEach(s=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${s.date}</td><td>${s.amount}</td><td>${s.goal||''}</td><td>${s.note||''}</td>`;
    tbody.appendChild(tr);
  });
}

// ---------- GOALS ----------
function saveGoal(){
  const name = document.getElementById('goalName').value.trim();
  const target = parseFloat(document.getElementById('goalTarget').value);
  const end = document.getElementById('goalEnd').value;
  const priority = document.getElementById('goalPriority').value;
  if(!name || isNaN(target) || target<=0){ alert('Enter valid goal'); return; }
  const user = getCurrentUser();
  const g = { id: Date.now(), name, target, end, priority, created: new Date().toLocaleDateString() };
  user.goals.unshift(g);
  updateCurrentUser(user);
  alert('Goal saved');
  renderGoals();
  renderDashboardPage();
}

function renderGoals(){
  const user = getCurrentUser();
  const tbody = document.getElementById('goalsBody');
  if(!tbody) return;
  tbody.innerHTML = '';
  user.goals.forEach(g=>{
    const totalSaved = user.savings.reduce((sum,s)=>sum.amount+sum.amount ? sum + s.amount : sum, 0); // safe reduce (keeps 0)
    // compute progress toward this goal by checking manual savings with matching goal name
    const relevant = user.savings.filter(s => s.goal === g.name);
    const progress = relevant.reduce((sum,s)=>sum+s.amount,0);
    const percent = Math.min(100, Math.round((progress/g.target)*100||0));
    const status = percent >=100 ? 'Completed' : 'Active';
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${g.name}</td><td>${g.target}</td><td>${percent}%</td><td>${status}</td>`;
    tbody.appendChild(tr);
  });
}

// ---------- DASHBOARD render ----------
function renderDashboardPage(){
  const user = getCurrentUser();
  if(!user) return;
  // Today totals (based on date strings)
  const today = new Date().toLocaleDateString();
  const tripsToday = user.trips.filter(t => new Date(t.date).toLocaleDateString() === today);
  const expensesToday = user.expenses.filter(e => new Date(e.date).toLocaleDateString() === today);
  const savingsToday = user.savings.filter(s => new Date(s.date).toLocaleDateString() === today);

  const earnToday = tripsToday.reduce((s,t)=>s+t.amount,0);
  const expToday = expensesToday.reduce((s,e)=>s+e.amount,0);
  const saveToday = savingsToday.reduce((s,sv)=>s+sv.amount,0);
  const netToday = earnToday - expToday - saveToday;

  document.getElementById('earnToday').textContent = 'KES ' + earnToday.toFixed(2);
  document.getElementById('expToday').textContent = 'KES ' + expToday.toFixed(2);
  document.getElementById('netToday').textContent = 'KES ' + netToday.toFixed(2);

  // last trip
  const lastTrip = user.trips[0];
  document.getElementById('lastTrip').textContent = lastTrip ? `You earned KES ${lastTrip.amount} and spent KES 0 on this trip (notes: ${lastTrip.note||'n/a'})` : 'No trips recorded yet.';

  // goals progress - take first goal as current
  const goal = user.goals[0] || { target:0, name:'' };
  document.getElementById('currentGoal').textContent = goal.target || 0;
  const totalSaved = user.savings.reduce((s,sv)=>s+sv.amount,0);
  const pct = goal.target ? Math.min(100, Math.round((totalSaved/goal.target)*100)) : 0;
  document.getElementById('progressFill').style.width = pct + '%';
  document.getElementById('progressPercent').textContent = pct + '%';
  document.getElementById('userName').textContent = user.fullName;
}

// ---------- REPORTS ----------
function renderReports(){
  const user = getCurrentUser();
  if(!user) return;
  const earned = user.trips.reduce((s,t)=>s+t.amount,0);
  const spent = user.expenses.reduce((s,e)=>s+e.amount,0);
  const saved = user.savings.reduce((s,sv)=>s+sv.amount,0);
  document.getElementById('reportEarned').textContent = earned.toFixed(2);
  document.getElementById('reportSpent').textContent = spent.toFixed(2);
  document.getElementById('reportSaved').textContent = saved.toFixed(2);

  const body = document.getElementById('reportBody');
  if(!body) return;
  // combine lists by date for simple view
  const rows = [];
  user.trips.forEach(t=> rows.push({date: new Date(t.date).toLocaleDateString(), type:'Trip', amount:t.amount, note:t.details||t.note||''}));
  user.expenses.forEach(e=> rows.push({date:e.date, type:e.type, amount:e.amount, note:e.note||''}));
  user.savings.forEach(s=> rows.push({date:s.date, type:'Saving', amount:s.amount, note:s.note||''}));
  rows.sort((a,b)=> new Date(b.date) - new Date(a.date));
  body.innerHTML = '';
  rows.slice(0,50).forEach(r=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${r.date}</td><td>${r.type}</td><td>${r.amount}</td><td>${r.note}</td>`;
    body.appendChild(tr);
  });
}

// ---------- PROFILE & EXPORT ----------
function renderProfile(){
  const user = getCurrentUser();
  if(!user) return;
  document.getElementById('profileName').textContent = user.fullName;
  document.getElementById('profileUser').textContent = user.username;
  document.getElementById('profilePhone').textContent = user.phone || '';
  document.getElementById('profileStage').textContent = user.stage || '';
  document.getElementById('profileJoined').textContent = user.dateJoined || '';
}

function exportCSV(){
  const user = getCurrentUser();
  if(!user) return alert('No user');
  // combine trips, expenses, savings
  const rows = [['type','date','amount','category','note']];
  user.trips.forEach(t=> rows.push(['trip', t.date, t.amount, t.details||'', t.note||'']));
  user.expenses.forEach(e=> rows.push(['expense', e.date, e.amount, e.type||'', e.note||'']));
  user.savings.forEach(s=> rows.push(['saving', s.date, s.amount, s.goal||'', s.note||'']));
  // CSV build
  const csv = rows.map(r=> r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${user.username}_bodasave_data.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function clearUserData(){
  if(!confirm('This will remove your trips, expenses, savings and goals. Continue?')) return;
  const user = getCurrentUser();
  if(!user) return;
  user.trips = []; user.expenses = []; user.savings = []; user.goals = [];
  updateCurrentUser(user);
  alert('Data cleared');
  window.location.reload();
}
