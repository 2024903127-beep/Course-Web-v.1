(async () => {
  const { data } = await window.supabase.auth.getUser();
  const user = data.user;
  if (!user) { location.replace("login.html"); return; }

  // Set active nav link
  const currentPage = window.location.pathname.split('/').pop();
  document.querySelectorAll('.sidebar nav a').forEach(a => {
    if (a.getAttribute('href') === currentPage) {
      a.classList.add('active');
    } else {
      a.classList.remove('active');
    }
  });

  // Display user info
  const name = user.user_metadata.full_name || "User";
  document.getElementById("profileName").innerText = name;
  document.getElementById("profileEmail").innerText = user.email;
  document.getElementById("memberSince").innerText = new Date(user.created_at).toLocaleDateString();

  // Logout
  document.getElementById("logoutBtn").onclick = async () => {
    await window.supabase.auth.signOut();
    location.replace("login.html");
  };

  // Edit Profile (placeholder)
  document.getElementById("editProfileBtn").onclick = () => {
    alert("Edit profile feature coming soon!");
  };
})();