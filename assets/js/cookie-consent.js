(() => {
  const STORAGE_KEY = "cookieConsent";
  const consent = localStorage.getItem(STORAGE_KEY);
  if (consent) return;

  const style = document.createElement("style");
  style.textContent = `
    .cookie-banner {
      position: fixed;
      left: 16px;
      right: 16px;
      bottom: 18px;
      z-index: 9999;
      background: rgba(12, 14, 24, 0.92);
      border: 1px solid rgba(255,255,255,0.12);
      color: #fff;
      padding: 14px 16px;
      border-radius: 14px;
      display: flex;
      flex-wrap: wrap;
      gap: 12px 16px;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 10px 30px rgba(0,0,0,0.35);
      font-family: Inter, system-ui, sans-serif;
    }
    .cookie-banner p {
      margin: 0;
      font-size: 14px;
      line-height: 1.4;
      color: rgba(255,255,255,0.9);
      flex: 1 1 280px;
    }
    .cookie-banner a { color: #8aa3ff; text-decoration: none; }
    .cookie-actions { display: flex; gap: 10px; }
    .cookie-actions button {
      border: 1px solid rgba(255,255,255,0.2);
      background: rgba(255,255,255,0.08);
      color: #fff;
      padding: 8px 14px;
      border-radius: 10px;
      cursor: pointer;
      font-size: 13px;
    }
    .cookie-actions .accept {
      background: #6c63ff;
      border-color: #6c63ff;
      color: #fff;
      font-weight: 600;
    }
    @media (max-width: 600px) {
      .cookie-banner { left: 10px; right: 10px; }
      .cookie-actions { width: 100%; justify-content: flex-end; }
    }
  `;
  document.head.appendChild(style);

  const banner = document.createElement("div");
  banner.className = "cookie-banner";
  banner.innerHTML = `
    <p>
      We use essential cookies to keep you signed in and improve your learning experience.
      Read our <a href="/pages/privacy-policy.html">Privacy Policy</a>.
    </p>
    <div class="cookie-actions">
      <button class="accept" type="button">Accept</button>
      <button class="decline" type="button">Decline</button>
    </div>
  `;

  const acceptBtn = banner.querySelector(".accept");
  const declineBtn = banner.querySelector(".decline");

  acceptBtn.addEventListener("click", () => {
    localStorage.setItem(STORAGE_KEY, "accepted");
    banner.remove();
  });

  declineBtn.addEventListener("click", () => {
    localStorage.setItem(STORAGE_KEY, "declined");
    banner.remove();
  });

  document.body.appendChild(banner);
})();
