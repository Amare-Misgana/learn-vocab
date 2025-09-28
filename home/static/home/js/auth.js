let currentMode = "login";

function setMode(mode) {
  currentMode = mode;
  updateForm();
}

function toggleMode() {
  currentMode = currentMode === "login" ? "signup" : "login";
  updateForm();
}

function updateForm() {
  const authTitle = document.getElementById("authTitle");
  const authDescription = document.getElementById("authDescription");
  const emailGroup = document.getElementById("emailGroup");
  const confirmPasswordGroup = document.getElementById("confirmPasswordGroup");
  const submitBtn = document.getElementById("submitBtn");
  const footerText = document.getElementById("footerText");
  const toggleBtn = document.getElementById("toggleBtn");
  const emailInput = document.getElementById("email");
  const confirmPasswordInput = document.getElementById("confirmPassword");
  const authMethodInput = document.getElementById("authMethod");

  if (currentMode === "login") {
    authTitle.textContent = "Welcome Back";
    authDescription.textContent = "Sign in to continue your vocabulary journey";
    emailGroup.classList.add("hidden");
    confirmPasswordGroup.classList.add("hidden");
    submitBtn.textContent = "Sign In";
    footerText.textContent = "Don't have an account yet?";
    toggleBtn.textContent = "Sign up here";
    emailInput.removeAttribute("required");
    confirmPasswordInput.removeAttribute("required");
    authMethodInput.value = "login";
  } else {
    authTitle.textContent = "Join LearnVocab";
    authDescription.textContent = "Start building your vocabulary today";
    emailGroup.classList.remove("hidden");
    confirmPasswordGroup.classList.remove("hidden");
    submitBtn.textContent = "Create Account";
    footerText.textContent = "Already have an account?";
    toggleBtn.textContent = "Sign in here";
    emailInput.setAttribute("required", "");
    confirmPasswordInput.setAttribute("required", "");
    authMethodInput.value = "signup";
  }

  // Clear form
  document.getElementById("authForm").reset();
}

function togglePassword(fieldId) {
  const passwordField = document.getElementById(fieldId);
  const icon = document.getElementById(fieldId + "Icon");

  if (passwordField.type === "password") {
    passwordField.type = "text";
    icon.innerHTML = `
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                `;
  } else {
    passwordField.type = "password";
    icon.innerHTML = `
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                `;
  }
}
