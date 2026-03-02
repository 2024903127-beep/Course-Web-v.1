const form = document.getElementById("otpForm");
const otpInput = document.getElementById("otp");
const verifyBtn = document.getElementById("verifyBtn");
const loadingText = document.getElementById("otpLoading");

const email = localStorage.getItem("auth_email");

if (!email) {
  window.location.href = "login.html";
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const token = otpInput.value.trim();
  if (token.length !== 6) {
    alert("Enter valid 6-digit OTP");
    return;
  }

  verifyBtn.disabled = true;
  verifyBtn.innerText = "Verifying...";
  if (loadingText) loadingText.classList.remove("hidden");

  const { data, error } = await window.supabase.auth.verifyOtp({
    email,
    token,
    type: "email"
  });

  if (error) {
    alert("Invalid or expired OTP");
    verifyBtn.disabled = false;
    verifyBtn.innerText = "Verify & Continue";
    if (loadingText) loadingText.classList.add("hidden");
    return;
  }

  const user = data.user;

  // 🔐 Create profile if not exists
  const { data: existingProfile } = await window.supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .single();

  if (!existingProfile) {
    await window.supabase.from("profiles").insert({
      id: user.id,
      email: user.email,
      name: user.user_metadata.full_name || "",
      phone: user.user_metadata.mobile || "",
      is_paid: false
    });
  }

  localStorage.removeItem("auth_email");

  // ✅ SUCCESS → Dashboard
  window.location.href = "dashboard.html";
});
