(async () => {
  const { data } = await window.supabase.auth.getSession();

  if (!data.session) {
    window.location.replace("login.html");
  }
})();
