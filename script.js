// BodaSave - script.js (updated with Credits + date-filtered CSV export)

// ---------- Keys & Helpers ----------
const USERS_KEY = "bodaUsers";
const LOGGED_KEY = "loggedInUser";

function getUsers(){ return JSON.parse(localStorage.getItem(USERS_KEY) || "[]"); }
function saveUsers(u){ localStorage.setItem(USERS_KEY, JSON.stringify(u)); }
function getCurrentUser(){ const username = localStorage.getItem(LOGGED_KEY); if(!username) return null; return getUsers().find(x=>x.username===username) || null; }
function updateCurrentUser(user){ const users = getUsers(); const idx = users.findIndex(u=>u.username===user.username); if(idx>=0) users[idx]=user; else users.push(user); saveUsers(users); }

// ---------- AUTH ----------
function initAuthPage(){
  const loginBtn = document.getElementById("loginBtn");
  const signupBtn = document.getElementById("signupBtn");
  const openSignup = document.getElementById("openSignup");
  const cancelSignup = document.getElementById("cancelSignup");
  const loginCard = document.getElementById("loginCard");
  const signupCard = document.getElementById("signupCard");

  if(openSignup) openSignup.addEventListener('click', e=>{ e.preventDefault(); loginCard.classList.add('hidden'); signupCard.classList.remove('hidden'); });
  if(cancelSignup) cancelSignup.addEventListener('click', ()=>{ signupCard.classList.add('hidden'); loginCard.classList.remove('hidden'); });

  if(signupBtn) signupBtn.addEventListener('click', ()=>{
    const fullName = document.getElementById('fullName').value.trim();
    const username = document.getElementById('signupUsername').value.trim();
    const password = document.getElementById('signupPassword').value.trim();
    const phone = document.getElementById('phoneNumber') ? document.getElementById('phoneNumber').value.trim() : '';
    const stage = document.getElementById('stageName') ? document.getElementById('stageName').value.trim() : '';
    if(!fullName||!username||!password){ alert('Please fill Full Name, Username and Password'); return; }
    const users = getUsers();
    if(users.some(u=>u.username.toLowerCase()===username.toLowerCase())){ alert('Username exists'); return; }
    users.push({ fullName, username, password, phone, stage, dateJoined: new Date().toLocaleDateString(), trips:[], expenses:[], savings:[], goals:[], credits:[] });
    saveUsers(users);
    alert('Account created. Please login.');
    signupCard.classList.add('hidden'); loginCard.classList.remove('hidden');
  });

  if(loginBtn) loginBtn.addEventListener('click', ()=>{
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

// ---------- Auth check ----------
function ensureAuth(){ if(!localStorage.getItem(LOGGED_KEY)){ window.location.href='index.html'; return false; } return true; }

// ---------- Sidebar & Logout ----------
function initSidebar(){
  document.querySelectorAll('#logoutBtn').forEach(btn=>btn.addEventListener('click', ()=>{ localStorage.removeItem(LOGGED_KEY); window.location.href='index.html'; }));
  const user = getCurrentUser();
  if(user) document.querySelectorAll('#userName').forEach(el=>el.textContent = user.fullName || user.username);
}

// ---------- Trips (with Credit handling) ----------
function saveTrip(){
  const dateStr = document.getElementById('tripDate') ? document.getElementById('tripDate').value : '';
  const amount = parseFloat(document.getElementById('tripAmount') ? document.getElementById('tripAmount').value : 0);
  const details = document.getElementById('tripDetails') ? document.getElementById('tripDetails').value.trim() : '';
  const method = document.getElementById('tripPayment') ? document.getElementById('tripPayment').value : '';
  const note = document.getElementById('tripNote') ? document.getElementById('tripNote').value.trim() : '';

  if(!dateStr || isNaN(amount) || amount<=0){ alert('Enter valid date and amount'); return; }
  const user = getCurrentUser(); if(!user) { alert('Not logged in'); return; }

  // If credit, store in credits list (unpaid)
  if(method === 'Credit'){
    const customer = document.getElementById('creditCustomer') ? document.getElementById('creditCustomer').value.trim() : '';
    const phone = document.getElementById('creditPhone') ? document.getElementById('creditPhone').value.trim() : '';
    const credit = { id: Date.now(), date: dateStr, amount: Number(amount), details, customer, phone, status:'Unpaid', createdAt: new Date().toISOString(), paidAt: null };
    user.credits = user.credits || [];
    user.credits.unshift(credit);
    updateCurrentUser(user);
    alert('Credit recorded (Unpaid). Track it from Credits page.');
    if(typeof renderCredits === 'function') renderCredits();
    if(typeof renderReports === 'function') renderReports();
    if(typeof renderDashboardPage === 'function') renderDashboardPage();
    // clear form fields (except date)
    document.getElementById('tripAmount').value=''; document.getElementById('tripDetails').value=''; document.getElementById('creditCustomer') && (document.getElementById('creditCustomer').value=''); document.getElementById('creditPhone') && (document.getElementById('creditPhone').value=''); document.getElementById('tripNote') && (document.getElementById('tripNote').value='');
    return;
  }

  // Normal trip (cash or mpesa)
  user.trips = user.trips || [];
  const entry = { id: Date.now(), date: dateStr, amount: Number(amount), details, method, note };
  user.trips.unshift(entry);
  updateCurrentUser(user);
  alert('Trip saved');
  if(typeof renderTrips === 'function') renderTrips();
  if(typeof renderDashboardPage === 'function') renderDashboardPage();
  if(typeof renderReports === 'function') renderReports();
}

function renderTrips(){
  const user = getCurrentUser(); if(!user) return;
  const tbody = document.getElementById('tripsBody'); if(!tbody) return;
  tbody.innerHTML='';
  (user.trips||[]).slice(0,50).forEach(t=>{
    const tr = document.createElement('tr');
    const d = new Date(t.date).toLocaleString();
    tr.innerHTML = `<td>${d}</td><td>KES ${Number(t.amount).toFixed(2)}</td><td>${t.details||''}</td><td>${t.method||''}</td>`;
    tbody.appendChild(tr);
  });
}

// ---------- Expenses ----------
function saveExpense(){
  const date = document.getElementById('expenseDate') ? document.getElementById('expenseDate').value : '';
  const type = document.getElementById('expenseType') ? document.getElementById('expenseType').value : '';
  const amount = parseFloat(document.getElementById('expenseAmount') ? document.getElementById('expenseAmount').value : 0);
  const note = document.getElementById('expenseNote') ? document.getElementById('expenseNote').value.trim() : '';
  if(!date || !type || isNaN(amount) || amount<=0){ alert('Enter valid expense'); return; }
  const user = getCurrentUser(); if(!user) return;
  user.expenses = user.expenses || [];
  user.expenses.unshift({ id:Date.now(), date, type, amount: Number(amount), note});
  updateCurrentUser(user);
  alert('Expense saved');
  if(typeof renderExpenses === 'function') renderExpenses();
  if(typeof renderDashboardPage === 'function') renderDashboardPage();
  if(typeof renderReports === 'function') renderReports();
}
function renderExpenses(){ const user=getCurrentUser(); if(!user) return; const tbody=document.getElementById('expensesBody'); if(!tbody) return; tbody.innerHTML=''; (user.expenses||[]).slice(0,50).forEach(e=>{ const tr=document.createElement('tr'); tr.innerHTML=`<td>${e.date}</td><td>${e.type}</td><td>KES ${Number(e.amount).toFixed(2)}</td><td>${e.note||''}</td>`; tbody.appendChild(tr); }); }

// ---------- Savings ----------
function saveManualSaving(){
  const date = document.getElementById('saveDate') ? document.getElementById('saveDate').value : '';
  const amount = parseFloat(document.getElementById('saveAmount') ? document.getElementById('saveAmount').value : 0);
  const goal = document.getElementById('saveGoalSelect') ? document.getElementById('saveGoalSelect').value : '';
  const note = document.getElementById('saveNote') ? document.getElementById('saveNote').value.trim() : '';
  if(!date || isNaN(amount) || amount<=0){ alert('Enter valid saving'); return; }
  const user = getCurrentUser(); if(!user) return;
  user.savings = user.savings || [];
  user.savings.unshift({ id:Date.now(), date, amount: Number(amount), goal, note});
  updateCurrentUser(user);
  alert('Saved');
  if(typeof renderSavingsManual === 'function') renderSavingsManual();
  if(typeof renderDashboardPage === 'function') renderDashboardPage();
  if(typeof renderReports === 'function') renderReports();
}
function renderSavingsManual(){ const user=getCurrentUser(); if(!user) return; const tbody=document.getElementById('savingsManualBody'); if(!tbody) return; tbody.innerHTML=''; (user.savings||[]).slice(0,100).forEach(s=>{ const tr=document.createElement('tr'); tr.innerHTML=`<td>${s.date}</td><td>KES ${Number(s.amount).toFixed(2)}</td><td>${s.goal||''}</td><td>${s.note||''}</td>`; tbody.appendChild(tr); }); }

// ---------- Goals ----------
function saveGoal(){ const name=document.getElementById('goalName')?document.getElementById('goalName').value.trim():''; const target=parseFloat(document.getElementById('goalTarget')?document.getElementById('goalTarget').value:0); const end=document.getElementById('goalEnd')?document.getElementById('goalEnd').value:''; const priority=document.getElementById('goalPriority')?document.getElementById('goalPriority').value:'Medium'; if(!name||isNaN(target)||target<=0){ alert('Enter valid goal'); return; } const user=getCurrentUser(); if(!user) return; user.goals=user.goals||[]; user.goals.unshift({ id:Date.now(), name, target: Number(target), end, priority, created:new Date().toLocaleDateString() }); updateCurrentUser(user); alert('Goal saved'); if(typeof renderGoals === 'function') renderGoals(); if(typeof renderDashboardPage === 'function') renderDashboardPage(); }
function renderGoals(){ const user=getCurrentUser(); if(!user) return; const tbody=document.getElementById('goalsBody'); if(!tbody) return; tbody.innerHTML=''; (user.goals||[]).forEach(g=>{ const relevant=(user.savings||[]).filter(s=>s.goal===g.name); const progress=relevant.reduce((sum,s)=>sum+(s.amount||0),0); const percent=g.target?Math.min(100,Math.round((progress/g.target)*100)):0; const status=percent>=100?'Completed':'Active'; const tr=document.createElement('tr'); tr.innerHTML=`<td>${g.name}</td><td>KES ${Number(g.target).toFixed(2)}</td><td>${percent}%</td><td>${status}</td>`; tbody.appendChild(tr); }); }

// ---------- Credits ----------
function renderCredits(){
  const user = getCurrentUser(); if(!user) return;
  const body = document.getElementById('creditsBody'); if(!body) return;
  body.innerHTML='';
  const credits = user.credits || [];
  let unpaid = 0, paid = 0;
  credits.forEach(c=>{
    const tr = document.createElement('tr');
    const date = new Date(c.date).toLocaleDateString();
    const statusLabel = c.status === 'Paid' ? `<span style="color:green;font-weight:700">Paid</span>` : `<span style="color:#b45309;font-weight:700">Unpaid</span>`;
    const action = c.status === 'Paid' ? `${c.paidAt?new Date(c.paidAt).toLocaleDateString():'-'}` : `<button class="btn primary" onclick="markCreditPaid(${c.id})">Mark Paid</button>`;
    tr.innerHTML = `<td>${date}</td><td>${c.customer||''}</td><td>${c.phone||''}</td><td>KES ${Number(c.amount||0).toFixed(2)}</td><td>${c.details||''}</td><td>${statusLabel}</td><td>${action}</td>`;
    body.appendChild(tr);
    if(c.status==='Paid') paid += Number(c.amount||0); else unpaid += Number(c.amount||0);
  });
  const unpaidEl = document.getElementById('creditsUnpaidAmt');
  const paidEl = document.getElementById('creditsPaidAmt');
  if(unpaidEl) unpaidEl.textContent = 'KES ' + unpaid.toFixed(2);
  if(paidEl) paidEl.textContent = 'KES ' + paid.toFixed(2);
}

function markCreditPaid(id){
  if(!confirm('Mark this credit as PAID?')) return;
  const user = getCurrentUser(); if(!user) return;
  user.credits = user.credits || [];
  const idx = user.credits.findIndex(c=>c.id===id);
  if(idx < 0) return alert('Credit not found');
  const credit = user.credits[idx];
  // mark paid
  credit.status = 'Paid';
  credit.paidAt = new Date().toISOString();
  // create corresponding trip (earning) entry to reflect payment (paid date)
  user.trips = user.trips || [];
  const paidTrip = {
    id: Date.now()+1,
    date: credit.paidAt,
    amount: Number(credit.amount||0),
    details: `Paid credit for ${credit.customer||'customer'} (original: ${new Date(credit.date).toLocaleDateString()})`,
    method: 'Cash (Credit Paid)',
    note: `Credit ID: ${credit.id}`
  };
  user.trips.unshift(paidTrip);
  updateCurrentUser(user);
  alert('Marked as paid. A trip record has been added to earnings.');
  if(typeof renderCredits === 'function') renderCredits();
  if(typeof renderTrips === 'function') renderTrips();
  if(typeof renderDashboardPage === 'function') renderDashboardPage();
  if(typeof renderReports === 'function') renderReports();
}

// ---------- Dashboard & Reports ----------
function renderDashboardPage(){
  const user = getCurrentUser(); if(!user) return;
  const today = new Date().toLocaleDateString();
  const tripsToday = (user.trips||[]).filter(t=> new Date(t.date).toLocaleDateString() === today);
  const expensesToday = (user.expenses||[]).filter(e=> new Date(e.date).toLocaleDateString() === today);
  const savingsToday = (user.savings||[]).filter(s=> new Date(s.date).toLocaleDateString() === today);
  const earnToday = tripsToday.reduce((s,t)=>s+(t.amount||0),0);
  const expToday = expensesToday.reduce((s,e)=>s+(e.amount||0),0);
  const saveToday = savingsToday.reduce((s,sv)=>s+(sv.amount||0),0);
  const netToday = earnToday - expToday - saveToday;
  const elEarn = document.getElementById('earnToday'); if(elEarn) elEarn.textContent = `KES ${earnToday.toFixed(2)}`;
  const elExp = document.getElementById('expToday'); if(elExp) elExp.textContent = `KES ${expToday.toFixed(2)}`;
  const elNet = document.getElementById('netToday'); if(elNet) elNet.textContent = `KES ${netToday.toFixed(2)}`;
  const lastTrip = (user.trips||[])[0]; const lastTripEl = document.getElementById('lastTrip'); if(lastTripEl) lastTripEl.textContent = lastTrip?`You earned KES ${lastTrip.amount} on your last trip.`:'No trips recorded yet.';
  const currentGoal = (user.goals||[])[0] || { target:0 };
  const totalSaved = (user.savings||[]).reduce((s,sv)=>s+(sv.amount||0),0);
  const pct = currentGoal.target ? Math.min(100, Math.round((totalSaved/currentGoal.target)*100)) : 0;
  const pf = document.getElementById('progressFill'); if(pf) pf.style.width = pct + '%';
  const pp = document.getElementById('progressPercent'); if(pp) pp.textContent = pct + '%';
  const cge = document.getElementById('currentGoal'); if(cge) cge.textContent = currentGoal.target || 0;
}

function renderReports(){
  const user = getCurrentUser(); if(!user) return;
  const earned = (user.trips||[]).reduce((s,t)=>s+(t.amount||0),0);
  const spent = (user.expenses||[]).reduce((s,e)=>s+(e.amount||0),0);
  const saved = (user.savings||[]).reduce((s,sv)=>s+(sv.amount||0),0);
  const unpaidCredits = (user.credits||[]).filter(c=>c.status!=='Paid').reduce((s,c)=>s+(c.amount||0),0);
  const pe = document.getElementById('reportEarned'); if(pe) pe.textContent = earned.toFixed(2);
  const ps = document.getElementById('reportSpent'); if(ps) ps.textContent = spent.toFixed(2);
  const pv = document.getElementById('reportSaved'); if(pv) pv.textContent = saved.toFixed(2);
  const pc = document.getElementById('reportCredits'); if(pc) pc.textContent = unpaidCredits.toFixed(2);

  const body = document.getElementById('reportBody'); if(!body) return;
  const rows = [];
  (user.trips||[]).forEach(t=> rows.push({ date: new Date(t.date).toLocaleDateString(), type:'Trip', amount:t.amount, details:t.details||t.note||'' }));
  (user.expenses||[]).forEach(e=> rows.push({ date: e.date, type: e.type || 'Expense', amount: e.amount, details: e.note||'' }));
  (user.savings||[]).forEach(s=> rows.push({ date: s.date, type: 'Saving', amount: s.amount, details: s.note||'' }));
  (user.credits||[]).forEach(c=> rows.push({ date: new Date(c.date).toLocaleDateString(), type: c.status==='Paid' ? 'Credit (Paid)' : 'Credit (Unpaid)', amount: c.amount, details: `${c.customer||''} ${c.details||''}` }));
  // sort descending
  rows.sort((a,b)=> new Date(b.date) - new Date(a.date));
  body.innerHTML = '';
  rows.slice(0,200).forEach(r=>{ const tr=document.createElement('tr'); tr.innerHTML = `<td>${r.date}</td><td>${r.type}</td><td>KES ${Number(r.amount||0).toFixed(2)}</td><td>${r.details||''}</td>`; body.appendChild(tr); });
}

// ---------- CSV generation (date filter optional) ----------
// dateParam: null means all, otherwise a 'YYYY-MM-DD' string from <input type="date">
function generateReportCSV(dateParam){
  const user = getCurrentUser(); if(!user) return '';
  const rows = [['type','date','amount','details','extra']];
  const matchDate = (dStr) => {
    if(!dateParam) return true;
    try {
      const target = new Date(dateParam).toLocaleDateString();
      return new Date(dStr).toLocaleDateString() === target;
    } catch (e) { return false; }
  };

  (user.trips||[]).forEach(t=>{
    if(matchDate(t.date)) rows.push(['Trip', new Date(t.date).toLocaleString(), t.amount, t.details||t.note||'', t.method||'']);
  });
  (user.expenses||[]).forEach(e=>{
    if(matchDate(e.date)) rows.push(['Expense', e.date, e.amount, e.note||'', e.type||'']);
  });
  (user.savings||[]).forEach(s=>{
    if(matchDate(s.date)) rows.push(['Saving', s.date, s.amount, s.note||'', s.goal||'']);
  });
  (user.credits||[]).forEach(c=>{
    // credit has original date and possibly paidAt; include row when either original date or paidAt matches the filter
    if(matchDate(c.date) || (c.paidAt && matchDate(c.paidAt))){
      rows.push([c.status === 'Paid' ? 'Credit (Paid)' : 'Credit (Unpaid)', new Date(c.date).toLocaleString(), c.amount, `${c.customer||''} ${c.details||''}`, c.phone||'']);
    }
  });

  // build CSV
  return rows.map(r => r.map(cell => `"${String(cell).replace(/"/g,'""')}"`).join(',')).join('\n');
}

// ---------- Profile & Export helpers ----------
function renderProfile(){
  const user = getCurrentUser(); if(!user) return;
  const setIf=(id,val)=>{ const el=document.getElementById(id); if(el) el.textContent = val||''; };
  setIf('profileName', user.fullName); setIf('profileUser', user.username); setIf('profilePhone', user.phone); setIf('profileStage', user.stage); setIf('profileJoined', user.dateJoined);
}
function exportCSV(){ const csv = generateReportCSV(null); const blob=new Blob([csv],{type:'text/csv'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`${(getCurrentUser() && getCurrentUser().username)||'bodasave'}_all.csv`; a.click(); URL.revokeObjectURL(url); }
function clearUserData(){ if(!confirm('This will remove your trips, expenses, savings and goals. Continue?')) return; const user=getCurrentUser(); if(!user) return; user.trips=[]; user.expenses=[]; user.savings=[]; user.goals=[]; user.credits=[]; updateCurrentUser(user); alert('Data cleared'); location.reload(); }

// ---------- Init bindings ----------
document.addEventListener('DOMContentLoaded', ()=>{
  // login page detection
  if(document.getElementById('loginCard')){ initAuthPage(); return; }
  if(!ensureAuth()) return;
  initSidebar();

  if(document.getElementById('earnToday')) renderDashboardPage();
  if(document.getElementById('tripsBody')) {
    renderTrips();
    const btn = document.getElementById('saveTripBtn');
    if(btn && !btn.hasAttribute('data-bound')){ btn.addEventListener('click', saveTrip); btn.setAttribute('data-bound','1'); }
  }
  if(document.getElementById('expensesBody')){
    renderExpenses();
    const btn = document.getElementById('saveExpenseBtn');
    if(btn && !btn.hasAttribute('data-bound')){ btn.addEventListener('click', saveExpense); btn.setAttribute('data-bound','1'); }
  }
  if(document.getElementById('savingsManualBody')){
    renderSavingsManual();
    const btn = document.getElementById('saveManualBtn');
    if(btn && !btn.hasAttribute('data-bound')){ btn.addEventListener('click', saveManualSaving); btn.setAttribute('data-bound','1'); }
  }
  if(document.getElementById('goalsBody')){
    renderGoals();
    const btn = document.getElementById('saveGoalBtn');
    if(btn && !btn.hasAttribute('data-bound')){ btn.addEventListener('click', saveGoal); btn.setAttribute('data-bound','1'); }
  }
  if(document.getElementById('reportBody')) renderReports();
  if(document.getElementById('creditsBody')) renderCredits();
  if(document.getElementById('profileName')){
    renderProfile();
    const expBtn = document.getElementById('exportCsv');
    if(expBtn && !expBtn.hasAttribute('data-bound')){ expBtn.addEventListener('click', exportCSV); expBtn.setAttribute('data-bound','1'); }
    const clearBtn = document.getElementById('clearData');
    if(clearBtn && !clearBtn.hasAttribute('data-bound')){ clearBtn.addEventListener('click', clearUserData); clearBtn.setAttribute('data-bound','1'); }
  }
});

// Prevent cached pages after logout
window.addEventListener('pageshow',(event)=>{ const loggedIn = localStorage.getItem(LOGGED_KEY); if(!loggedIn && event.persisted) window.location.href='index.html'; });
