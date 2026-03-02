const form = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const agree = document.getElementById("agree");
const btn = document.getElementById("loginBtn");
const loadingText = document.getElementById("loginLoading");

function toggle() {
  btn.disabled = !(emailInput.value && agree.checked);
}

emailInput.addEventListener("input", toggle);
agree.addEventListener("change", toggle);

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = emailInput.value.trim();

  btn.disabled = true;
  btn.innerText = "Sending OTP...";
  if (loadingText) loadingText.classList.remove("hidden");

  const { error } = await window.supabase.auth.signInWithOtp({ email });

  if (error) {
    alert(error.message);
    btn.disabled = false;
    btn.innerText = "Send Login OTP";
    if (loadingText) loadingText.classList.add("hidden");
    return;
  }

  localStorage.setItem("auth_email", email);
  window.location.href = "verify-otp.html";
});
