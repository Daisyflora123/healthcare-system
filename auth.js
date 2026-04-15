document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const showSignupBtn = document.getElementById('showSignup');
  const showLoginBtn = document.getElementById('showLogin');
  const loginCard = document.getElementById('loginCard');
  const signupCard = document.getElementById('signupCard');

  // Toggle Forms
  if(showSignupBtn) {
    showSignupBtn.addEventListener('click', (e) => {
      e.preventDefault();
      loginCard.classList.add('d-none');
      signupCard.classList.remove('d-none');
    });
  }

  if(showLoginBtn) {
    showLoginBtn.addEventListener('click', (e) => {
      e.preventDefault();
      signupCard.classList.add('d-none');
      loginCard.classList.remove('d-none');
    });
  }

  // Handle Signup
  if(signupForm) {
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const name = document.getElementById('regName').value.trim();
      const email = document.getElementById('regEmail').value.trim();
      const password = document.getElementById('regPassword').value;
      const confirmPassword = document.getElementById('regConfirmPassword').value;
      const errorMsg = document.getElementById('signupError');
      
      errorMsg.style.display = 'none';

      if(!name || !email || !password || !confirmPassword) {
        showError(errorMsg, 'All fields are required.');
        return;
      }

      if(password.length < 8) {
        showError(errorMsg, 'Password must be at least 8 characters long.');
        return;
      }
      
      if(!/\d/.test(password)) {
        showError(errorMsg, 'Password must contain at least one number.');
        return;
      }

      if(password !== confirmPassword) {
        showError(errorMsg, 'Passwords do not match.');
        return;
      }

      const existingEmail = localStorage.getItem('hc_userEmail');
      if (existingEmail && existingEmail.toLowerCase() === email.toLowerCase()) {
        showError(errorMsg, 'An account with this email already exists. Please Sign In.');
        return;
      }

      // Save user
      localStorage.setItem('hc_userName', name);
      localStorage.setItem('hc_userEmail', email);
      // In real app, don't store plain password
      localStorage.setItem('hc_userPass', password);
      
      // Auto login and redirect
      window.location.href = 'healthcare-dashboard.html';
    });
  }

  // Handle Login
  if(loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value;
      const errorMsg = document.getElementById('loginError');

      errorMsg.style.display = 'none';

      const storedEmail = localStorage.getItem('hc_userEmail');
      const storedPass = localStorage.getItem('hc_userPass');

      if(!storedEmail) {
        showError(errorMsg, 'No account found. Please sign up first.');
        return;
      }

      if(email !== storedEmail || password !== storedPass) {
        showError(errorMsg, 'Invalid email or password.');
        return;
      }

      // Success
      window.location.href = 'healthcare-dashboard.html';
    });
  }

  function showError(el, msg) {
    el.textContent = msg;
    el.style.display = 'block';
  }
});
