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
function ensureUserArrays(user) {
  if (!user.trips) user.trips = [];
  if (!user.expenses) user.expenses = [];
  if (!user.savings) user.savings = [];
  if (!user.goals) user.goals = [];
  if (!user.credits) user.credits = [];
}

// ---------------- AUTH ----------------
function initAuthPage() {
  const loginBtn = document.getElementById("loginBtn");
  const signupBtn = document.getElementById("signupBtn");
  const openSignup = document.getElementById("openSignup");
  const cancelSignup = document.getElementById("cancelSignup");
  const loginCard = document.getElementById("loginCard");
  const signupCard = document.getElementById("signupCard");

  if (openSignup) openSignup.addEventListener("click", e => {
    e.preventDefault(); loginCard.classList.add("hidden"); signupCard.classList.remove("hidden");
  });
  if (cancelSignup) cancelSignup.addEventListener("click", () => {
    signupCard.classList.add("hidden"); loginCard.classList.remove("hidden");
  });

  if (signupBtn) signupBtn.addEventListener("click", () => {
    const fullName = document.getElementById("fullName").value.trim();
    const username = document.getElementById("signupUsername").value.trim();
    const password = document.getElementById("signupPassword").value;
    const phone = document.getElementById("phoneNumber").value.trim();
    const stage = document.getElementById("stageName").value.trim();
    if (!fullName || !username || !password) return alert("Please fill all required fields.");
    const users = getUsers();
    if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) return alert("Username exists.");
    users.push({
      fullName, username, password, phone, stage,
      dateJoined: new Date().toLocaleDateString(),
      trips: [], expenses: [], savings: [], goals: [], credits: []
    });
    saveUsers(users);
    alert("Account created successfully!");
    signupCard.classList.add("hidden"); loginCard.classList.remove("hidden");
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

// ---------------- SIDEBAR ----------------
function initSidebar() {
  document.querySelectorAll("#logoutBtn").forEach(b => b.addEventListener("click", () => {
    localStorage.removeItem("loggedInUser");
    location.href = "index.html";
  }));
  const user = getCurrentUser();
  if (user) document.querySelectorAll("#userName").forEach(el => el.textContent = user.fullName);
}

// ---------------- PROFILE ----------------
function loadProfile() {
  const user = getCurrentUser(); if (!user) return;
  document.getElementById("profileName").textContent = user.fullName || "";
  document.getElementById("profileEmail").textContent = user.username || "";
  document.getElementById("profileDate").textContent = user.dateJoined || "";
}

function updatePassword() {
  const user = getCurrentUser(); if (!user) return alert("User not found.");
  const newPass = document.getElementById("newPass").value.trim();
  if (!newPass) return alert("Please enter a new password.");
  user.password = newPass;
  updateCurrentUser(user);
  alert("Password updated successfully!");
  document.getElementById("newPass").value = "";
}

// ---------------- CSV DOWNLOAD (REPORTS) ----------------
function downloadCSV() {
  const user = getCurrentUser(); if (!user) return alert("User not found.");
  ensureUserArrays(user);
  const rows = [];
  
  function addSection(title, data, headers) {
    rows.push([title]);
    rows.push(headers);
    data.forEach(item => {
      const row = headers.map(h => item[h] !== undefined ? item[h] : "");
      rows.push(row);
    });
    rows.push([]); // empty row for spacing
  }

  addSection("Trips", user.trips, ["date","amount","details","payment","note"]);
  addSection("Expenses", user.expenses, ["date","type","amount","note"]);
  addSection("Credits", user.credits, ["date","customer","phone","details","amount","status"]);
  addSection("Savings", user.savings, ["date","amount","goal","note"]);

  const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "bodaSave_data.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
