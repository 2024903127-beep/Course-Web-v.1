const checkbox = document.getElementById("agree");
const button = document.querySelector("button");

if (checkbox && button) {
  checkbox.addEventListener("change", () => {
    button.disabled = !checkbox.checked;
    button.style.opacity = checkbox.checked ? "1" : "0.6";
  });

  button.addEventListener("click", () => {
    showToast("OTP will be sent to your email ✨");
  });
}

function showToast(message) {
  const toast = document.createElement("div");
  toast.innerText = message;
  toast.className = "toast";
  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add("show"), 100);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
