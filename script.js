// Initialize the authentication page (login & signup)
function initAuthPage() {
  const loginBtn = document.getElementById("loginBtn");
  const signupBtn = document.getElementById("signupBtn");
  const openSignup = document.getElementById("openSignup");
  const cancelSignup = document.getElementById("cancelSignup");
  const loginCard = document.getElementById("loginCard");
  const signupCard = document.getElementById("signupCard");

  // Switch between login and signup forms
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

  // Handle signup
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

      const users = JSON.parse(localStorage.getItem("bodaUsers") || "[]");

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
      localStorage.setItem("bodaUsers", JSON.stringify(users));

      alert("Account created successfully! You can now log in.");
      signupCard.classList.add("hidden");
      loginCard.classList.remove("hidden");
    });
  }

  // Handle login
  if (loginBtn) {
    loginBtn.addEventListener("click", () => {
      const username = document.getElementById("loginUsername").value.trim();
      const password = document.getElementById("loginPassword").value.trim();

      const users = JSON.parse(localStorage.getItem("bodaUsers") || "[]");
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

// Auto-run on page load
document.addEventListener("DOMContentLoaded", initAuthPage);
