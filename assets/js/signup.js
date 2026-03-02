const form = document.getElementById("signupForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const mobile = document.getElementById("mobile").value.trim();
  const agree = document.getElementById("agree").checked;

  if (!agree) {
    alert("Please accept terms");
    return;
  }

  // 🔍 Check if already registered
  const { data: existingUser } = await window.supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .single();

  if (existingUser) {
    alert("Email already registered. Please login.");
    return;
  }

  const btn = form.querySelector("button");
  btn.disabled = true;
  btn.innerText = "Sending OTP...";

  const { error } = await window.supabase.auth.signInWithOtp({
    email,
    options: {
      data: {
        full_name: name,
        mobile
      }
    }
  });

  if (error) {
    alert(error.message);
    btn.disabled = false;
    btn.innerText = "Create Account";
    return;
  }

  localStorage.setItem("auth_email", email);
  window.location.href = "verify-otp.html";
});
