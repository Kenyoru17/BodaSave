// LocalStorage keys
const USERS_KEY = "bodaUsers";
const LOGGED_KEY = "loggedInUser";

// Utility
function getUsers() {
  return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
}
function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Init authentication page
function initAuthPage() {
  const loginCard = document.getElementById("loginCard");
  const signupCard = document.getElementById("signupCard");

  const openSignup = document.getElementById("openSignup");
  const cancelSignup = document.getElementById("cancelSignup");
  const loginBtn = document.getElementById("loginBtn");
  const signupBtn = document.getElementById("signupBtn");

  // Switch Login <-> Signup
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

  // SIGN UP
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
        alert("Username already exists!");
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
      alert("Account created! You can now log in.");
      signupCard.classList.add("hidden");
      loginCard.classList.remove("hidden");
    });
  }

  // LOGIN
  if (loginBtn) {
    loginBtn.addEventListener("click", () => {
      const username = document.getElementById("loginUsername").value.trim();
      const password = document.getElementById("loginPassword").value.trim();

      if (!username || !password) {
        alert("Enter both username and password.");
        return;
      }

      const users = getUsers();
      const user = users.find(
        (u) =>
          u.username.toLowerCase() === username.toLowerCase() &&
          u.password === password
      );

      if (!user) {
        alert("Incorrect username or password!");
        return;
      }

      localStorage.setItem(LOGGED_KEY, user.username);
      alert(`Welcome back, ${user.fullName}!`);
      window.location.href = "dashboard.html";
    });
  }
}

// Logout function
function logout() {
  localStorage.removeItem(LOGGED_KEY);
  window.location.href = "index.html";
}

// Ensure auth on pages
function ensureAuth() {
  const u = localStorage.getItem(LOGGED_KEY);
  if (!u) window.location.href = "index.html";
  return u;
}

// When page loads
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("loginCard")) {
    initAuthPage();
  }

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
  }
});
