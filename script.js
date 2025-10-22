// ============ BodaSave Core Script (Login, Signup, Dashboard, Logout) ============

// ---------- Helper Functions ----------
function getUsers() {
  return JSON.parse(localStorage.getItem("bodaUsers") || "[]");
}

function saveUsers(users) {
  localStorage.setItem("bodaUsers", JSON.stringify(users));
}

function getCurrentUser() {
  const username = localStorage.getItem("loggedInUser");
  if (!username) return null;
  const users = getUsers();
  return users.find((u) => u.username === username) || null;
}

function updateCurrentUser(user) {
  const users = getUsers();
  const idx = users.findIndex((u) => u.username === user.username);
  if (idx >= 0) users[idx] = user;
  else users.push(user);
  saveUsers(users);
}

// ---------- Authentication ----------
function initAuthPage() {
  const loginBtn = document.getElementById("loginBtn");
  const signupBtn = document.getElementById("signupBtn");
  const openSignup = document.getElementById("openSignup");
  const cancelSignup = document.getElementById("cancelSignup");
  const loginCard = document.getElementById("loginCard");
  const signupCard = document.getElementById("signupCard");

  // Switch between login and signup
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

  // Signup logic
  if (signupBtn) {
    signupBtn.addEventListener("click", () => {
      const fullName = document.getElementById("fullName").value.trim();
      const username = document.getElementById("signupUsername").value.trim();
      const password = document.getElementById("signupPassword").value.trim();
      const phone = document.getElementById("phoneNumber").value.trim();
      const stage = document.getElementById("stageName").value.trim();

      if (!fullName || !username || !password) {
        alert("Please fill in Full Name, Username, and Password.");
        return;
      }

      const users = getUsers();
      if (users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
        alert("That username already exists.");
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
        goals: [],
      };

      users.push(newUser);
      saveUsers(users);

      alert("Account created successfully! You can now log in.");
      signupCard.classList.add("hidden");
      loginCard.classList.remove("hidden");
    });
  }

  // Login logic
  if (loginBtn) {
    loginBtn.addEventListener("click", () => {
      const username = document.getElementById("loginUsername").value.trim();
      const password = document.getElementById("loginPassword").value.trim();

      if (!username || !password) {
        alert("Please enter both Username and Password.");
        return;
      }

      const users = getUsers();
      const user = users.find(
        (u) =>
          u.username.toLowerCase() === username.toLowerCase() &&
          u.password === password
      );

      if (user) {
        localStorage.setItem("loggedInUser", user.username);
        alert(`Welcome back, ${user.fullName || user.username}!`);
        window.location.href = "dashboard.html";
      } else {
        alert("Incorrect username or password.");
      }
    });
  }
}

// ---------- Auth Check ----------
function ensureAuth() {
  const loggedIn = localStorage.getItem("loggedInUser");
  if (!loggedIn) {
    alert("Please log in first.");
    window.location.href = "index.html";
  }
}

// ---------- Dashboard Rendering ----------
function renderDashboardPage() {
  const user = getCurrentUser();
  if (!user) return;

  const today = new Date().toLocaleDateString();

  // Totals
  const tripsToday = user.trips.filter((t) => new Date(t.date).toLocaleDateString() === today);
  const expensesToday = user.expenses.filter((e) => new Date(e.date).toLocaleDateString() === today);
  const savingsToday = user.savings.filter((s) => new Date(s.date).toLocaleDateString() === today);

  const earnToday = tripsToday.reduce((sum, t) => sum + (t.amount || 0), 0);
  const expToday = expensesToday.reduce((sum, e) => sum + (e.amount || 0), 0);
  const saveToday = savingsToday.reduce((sum, s) => sum + (s.amount || 0), 0);
  const netToday = earnToday - expToday + saveToday;

  document.getElementById("earnToday").textContent = `KES ${earnToday.toFixed(2)}`;
  document.getElementById("expToday").textContent = `KES ${expToday.toFixed(2)}`;
  document.getElementById("netToday").textContent = `KES ${netToday.toFixed(2)}`;

  // Goal progress
  const currentGoal = user.goals[0] || { name: "No goal", target: 0 };
  const totalSaved = user.savings.reduce((sum, s) => sum + (s.amount || 0), 0);
  const percent = currentGoal.target
    ? Math.min(100, Math.round((totalSaved / currentGoal.target) * 100))
    : 0;

  document.getElementById("progressFill").style.width = `${percent}%`;
  document.getElementById("progressPercent").textContent = `${percent}%`;
  document.getElementById("currentGoal").textContent = currentGoal.target || 0;

  // Last trip
  const lastTrip = user.trips[0];
  document.getElementById("lastTrip").textContent = lastTrip
    ? `You earned KES ${lastTrip.amount || 0} on your last trip.`
    : "No trips recorded yet.";
}

// ---------- Sidebar & Logout ----------
function initSidebar() {
  const logoutButtons = document.querySelectorAll("#logoutBtn");
  logoutButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      localStorage.removeItem("loggedInUser");
      alert("You have been logged out.");
      window.location.href = "index.html";
    });
  });
}

// Prevent using back button after logout
window.addEventListener("pageshow", (event) => {
  const loggedIn = localStorage.getItem("loggedInUser");
  if (!loggedIn && event.persisted) {
    window.location.href = "index.html";
  }
});

// ---------- Auto Init ----------
document.addEventListener("DOMContentLoaded", () => {
  if (document.body.contains(document.getElementById("loginCard"))) {
    initAuthPage();
  }
});
