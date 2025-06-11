// Splash delay
setTimeout(() => {
  document.getElementById("splashScreen").style.display = "none";
  document.getElementById("root").style.display = "flex";
}, 2000);

function showRegister() {
  document.getElementById("root").style.display = "none";
  document.getElementById("registerForm").style.display = "flex";
}

function showLogin() {
  document.getElementById("registerForm").style.display = "none";
  document.getElementById("root").style.display = "flex";
}

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.querySelector('#root form');

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const studentNumber = loginForm.studentNumber.value.trim();
    const password = loginForm.password.value.trim();

    try {
      const response = await fetch('https://ecdsga.onrender.com/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentNumber, password })
      });

      if (response.ok) {
        const contentType = response.headers.get("content-type");

        if (contentType && contentType.includes("application/json")) {
          const data = await response.json();

          // Handle multiple roles
          if (data.multipleRoles && Array.isArray(data.roles)) {
            let chosenRole = prompt(`You have multiple roles. Choose one: ${data.roles.join(" or ")}`);

            if (!chosenRole) {
              alert("No role selected. Login cancelled.");
              return;
            }

            chosenRole = chosenRole.trim().toLowerCase();

            if (data.roles.map(r => r.toLowerCase()).includes(chosenRole)) {
              if (chosenRole === "admin") {
                window.location.href = "admindashboard.html";
              } else if (chosenRole === "student") {
                window.location.href = "studentdashboard.html";
              } else {
                alert("Selected role is not recognized.");
              }
            } else {
              alert("Invalid role selected.");
            }
          }
        } else {
          const text = await response.text();

          // Handle single role redirect
          if (text.startsWith("redirect:")) {
            const url = text.split("redirect:")[1];
            window.location.href = url;
          } else {
            alert(text);
          }
        }
      } else if (response.status === 401) {
        alert('Invalid student number or password.');
      } else {
        alert('Login failed. Please try again later.');
      }
    } catch (err) {
      alert('Error connecting to server.');
      console.error(err);
    }
  });

  // Register form handler
  const registerForm = document.querySelector('#registerFormElement');
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = {
      fullName: registerForm.fullName.value,
      studentNumber: registerForm.studentNumber.value.trim(),
      program: registerForm.program.value,
      yearSection: registerForm.yearSection.value,
      status: registerForm.status.value,
      gender: registerForm.gender.value,
      password: registerForm.password.value.trim(),
    };

    try {
      const response = await fetch('https://ecdsga.onrender.com/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("Registration successful! You may now log in.");
        showLogin();
      } else {
        const errText = await response.text();
        alert("Registration failed: " + errText);
      }
    } catch (err) {
      alert("Error connecting to server.");
      console.error(err);
    }
  });
});