(async () => {
  const { data } = await window.supabase.auth.getUser();
  const user = data.user;
  if (!user) { location.replace("login.html"); return; }

  // Display user info
  const name = user.user_metadata.full_name || "User";
  document.getElementById("username").innerText = `Welcome, ${name}`;
  document.getElementById("useremail").innerText = user.email;

  // Set active nav link
  const currentPage = window.location.pathname.split('/').pop();
  document.querySelectorAll('.sidebar nav a').forEach(a => {
    if (a.getAttribute('href') === currentPage) {
      a.classList.add('active');
    } else {
      a.classList.remove('active');
    }
  });

  // Logout
  document.getElementById("logoutBtn").onclick = async () => {
    await window.supabase.auth.signOut();
    location.replace("login.html");
  };

  // ==========================
  // Stats Data
  // ==========================
  const STATS_DATA = [
    { label: "Total Courses", value: 0 },
    { label: "Unlocked Courses", value: 0 },
    { label: "Completed Courses", value: 0 }
  ];

  // ==========================
  // Courses Data (Admin-panel friendly)
  // ==========================
  const DEFAULT_THUMBNAILS = [
    "../assets/images/course1.jpg",
    "../assets/images/course2.svg",
    "../assets/images/course3.svg"
  ];

  const STATUS = {
    LOCKED: "locked",
    UNLOCKED: "unlocked",
    IN_PROGRESS: "in_progress",
    COMPLETED: "completed"
  };
  const CURRENCY_SYMBOL = "\u20B9";

  function formatDuration(duration) {
    if (duration === null || duration === undefined || duration === "") return "";
    if (typeof duration === "number") return `${duration} mins`;
    return String(duration);
  }

  function getThumbnail(index) {
    return DEFAULT_THUMBNAILS[index % DEFAULT_THUMBNAILS.length];
  }

  function toDriveThumbnail(url) {
    if (!url) return "";
    const input = String(url).trim();
    let id = "";
    const idMatch = input.match(/[?&]id=([^&]+)/);
    if (idMatch) id = idMatch[1];
    if (!id) {
      const dMatch = input.match(/\/d\/([^/]+)/);
      if (dMatch) id = dMatch[1];
    }
    return id ? `https://drive.google.com/thumbnail?id=${id}&sz=w600` : input;
  }

  function isSafeImageUrl(url) {
    if (!url) return false;
    const value = String(url).trim();
    if (value.startsWith("data:image/")) return true;
    try {
      const parsed = new URL(value);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  }

  function normalizeThumbnailUrl(url) {
    if (!url) return "";
    const trimmed = String(url).trim();
    if (trimmed.includes("drive.google.com")) {
      return toDriveThumbnail(trimmed);
    }
    return trimmed;
  }

  function getCourseThumbnail(course, index) {
    const candidate = normalizeThumbnailUrl(course?.thumbnail || "");
    if (isSafeImageUrl(candidate)) return candidate;
    return getThumbnail(index);
  }

  // Function to show skeletons
  function showSkeletons(container, count, className) {
    container.innerHTML = "";
    for (let i = 0; i < count; i++) {
      const skeleton = document.createElement("div");
      skeleton.className = className;
      skeleton.innerHTML = `
        <div class="skeleton skeleton-card"></div>
        <div class="skeleton skeleton-text long"></div>
        <div class="skeleton skeleton-text short"></div>
      `;
      container.appendChild(skeleton);
    }
  }

  // Load stats with skeleton
  const statsGrid = document.getElementById("statsGrid");
  showSkeletons(statsGrid, 3, "stat-card");

  function renderStats(stats) {
    statsGrid.innerHTML = "";
    stats.forEach(stat => {
      const card = document.createElement("div");
      card.className = "stat-card";
      card.innerHTML = `
        <h4>${stat.value}</h4>
        <p>${stat.label}</p>
      `;
      statsGrid.appendChild(card);
    });
  }

  // Load courses with skeleton
  const coursesGrid = document.getElementById("coursesGrid");
  showSkeletons(coursesGrid, 3, "course-card");
  const paymentBanner = document.getElementById("paymentBanner");

  function showPaymentBanner(message, type) {
    if (!paymentBanner) return;
    paymentBanner.classList.remove("hidden", "success", "error");
    paymentBanner.classList.add(type);
    paymentBanner.textContent = message;
  }

  function hidePaymentBanner() {
    if (!paymentBanner) return;
    paymentBanner.classList.add("hidden");
    paymentBanner.textContent = "";
  }

  async function fetchCoursesWithProgress() {
    const { data: courses, error: coursesError } = await window.supabase
      .from("courses")
      .select("*")
      .order("created_at", { ascending: true });

    if (coursesError) throw coursesError;

    const courseIds = (courses || []).map(course => course.id);

    let progressRows = [];
    if (courseIds.length) {
      const { data: progressData, error: progressError } = await window.supabase
        .from("user_course_progress")
        .select("course_id,progress,status,last_accessed,purchased")
        .eq("user_id", user.id)
        .in("course_id", courseIds);

      if (progressError) throw progressError;
      progressRows = progressData || [];
    }

    const progressMap = progressRows.reduce((acc, row) => {
      acc[row.course_id] = row;
      return acc;
    }, {});

    const courseModels = (courses || []).map((course, index) => {
      const progressRow = progressMap[course.id];
      const isLocked =
        course.locked === true ||
        course.locked === "true" ||
        course.locked === 1 ||
        course.is_paid === true ||
        course.is_paid === "true" ||
        course.is_paid === 1;
      const purchased = progressRow?.purchased === true;
      const status = progressRow?.status ?? (isLocked ? STATUS.LOCKED : STATUS.UNLOCKED);
      const unlocked = isLocked ? purchased : true;
      const progress = progressRow?.progress ?? 0;

      return {
        id: course.id,
        title: course.title,
        description: course.description,
        duration: formatDuration(course.duration),
        link: course.link && String(course.link).trim() ? course.link : `course.html?course=${course.id}`,
        thumbnail: course.thumbnail || getThumbnail(index),
        unlocked,
        status,
        progress,
        purchased,
        lastAccessed: progressRow?.last_accessed || null,
        isPaid: course.is_paid === true || course.is_paid === "true" || course.is_paid === 1,
        price: course.price ?? null
      };
    });

    const completedCount = progressRows.filter(row => Number(row.progress) >= 100).length;
    const unlockedCount = courseModels.filter(course => course.unlocked).length;

    const stats = [
      { label: "Total Courses", value: courseModels.length },
      { label: "Unlocked Courses", value: unlockedCount },
      { label: "Completed Courses", value: completedCount }
    ];

    return { courseModels, stats };
  }

  async function purchaseCourse(courseId) {
    const { data: sessionData } = await window.supabase.auth.getSession();
    let token = sessionData?.session?.access_token || "";
    const expiresAt = sessionData?.session?.expires_at
      ? sessionData.session.expires_at * 1000
      : 0;
    const isExpired = expiresAt && Date.now() > expiresAt - 30_000;
    if (isExpired) {
      const refreshed = await window.supabase.auth.refreshSession();
      token = refreshed?.data?.session?.access_token || "";
    }
    if (!token || token.length < 20) {
      throw new Error("Session expired. Please log in again.");
    }
    const { data: payload, error: createError } = await window.supabase.functions.invoke(
      "razorpay-create",
      {
        body: { course_id: courseId },
        headers: {
          Authorization: `Bearer ${token}`,
          apikey: window.SUPABASE_ANON_KEY
        }
      }
    );
    if (createError) {
      if (createError?.status === 401) {
        await window.supabase.auth.signOut();
        throw new Error("Session expired. Please log in again.");
      }
      const message = createError?.message || "Order error";
      throw new Error(message);
    }

    const options = {
      key: payload.key_id,
      amount: payload.amount,
      currency: payload.currency,
      name: payload.name || "Course",
      description: payload.description || "",
      order_id: payload.order_id,
      handler: async function (response) {
        const { data: verifyData, error: verifyError } =
          await window.supabase.functions.invoke("razorpay-verify", {
            body: {
              course_id: courseId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            }
          });
        if (verifyError) {
          if (verifyError?.status === 401) {
            await window.supabase.auth.signOut();
            throw new Error("Session expired. Please log in again.");
          }
          throw new Error(verifyError?.message || "Payment verify failed");
        }
        showPaymentBanner("Payment successful. Course unlocked!", "success");
        const { courseModels, stats } = await fetchCoursesWithProgress();
        renderStats(stats);
        renderCourses(courseModels);
      },
      theme: { color: "#6c63ff" }
    };

    const razorpay = new window.Razorpay(options);
    razorpay.on("payment.failed", function () {
      showPaymentBanner("Payment failed. Please try again.", "error");
    });
    razorpay.open();
  }

  async function updateProgress(courseId, progressValue, allowUpdate) {
    if (!allowUpdate) return;
    const progress = Math.max(0, Math.min(100, Math.round(progressValue)));
    const status =
      progress >= 100 ? STATUS.COMPLETED :
      progress > 0 ? STATUS.IN_PROGRESS :
      STATUS.UNLOCKED;

    const payload = {
      user_id: user.id,
      course_id: courseId,
      progress,
      status,
      last_accessed: new Date().toISOString()
    };

    const { error } = await window.supabase
      .from("user_course_progress")
      .upsert(payload, { onConflict: "user_id,course_id" });

    if (error) throw error;
  }

  function renderCourses(courses) {
    coursesGrid.innerHTML = "";

    if (!courses.length) {
      coursesGrid.innerHTML = `
        <div class="empty-state">
          <h4>No courses yet</h4>
          <p>Add a few courses in Supabase, or insert demo courses below.</p>
          <button class="btn-primary" id="seedCoursesBtn">Add Demo Courses</button>
        </div>
      `;

      const seedBtn = document.getElementById("seedCoursesBtn");
      seedBtn?.addEventListener("click", async () => {
        seedBtn.disabled = true;
        seedBtn.innerText = "Adding...";
        try {
          const { error } = await window.supabase.from("courses").insert([
            {
              owner: user.id,
              title: "Trading Foundations",
              description: "Market basics, structure & execution"
            },
            {
              owner: user.id,
              title: "Risk Management Pro",
              description: "Capital protection & position sizing"
            }
          ]);
          if (error) throw error;
          await refreshDashboard();
        } catch (err) {
          const message = err?.message || String(err);
          console.error("Seed failed:", message);
          const hint = document.querySelector(".empty-state p");
          if (hint) {
            hint.textContent = `Seed failed: ${message}. Check RLS insert policy on courses.`;
          }
          seedBtn.disabled = false;
          seedBtn.innerText = "Add Demo Courses";
        }
      });
      return;
    }

    courses.forEach((course, index) => {
      const card = document.createElement("div");
      card.className = "course-card" + (course.unlocked ? " unlocked" : " locked");
      card.id = course.id;
      card.dataset.link = course.link;

      const timerText = course.duration
        ? course.duration
        : (course.unlocked ? "" : "Unlock to start");

      const img = document.createElement("img");
      img.src = getCourseThumbnail(course, index);
      img.loading = "lazy";
      img.alt = course.title || "Course";
      img.onerror = () => {
        img.src = getThumbnail(index);
      };
      card.appendChild(img);

      const body = document.createElement("div");
      body.className = "course-body";
      card.appendChild(body);

      const info = document.createElement("div");
      body.appendChild(info);

      const title = document.createElement("h4");
      title.textContent = course.title || "Untitled Course";
      info.appendChild(title);

      const desc = document.createElement("p");
      desc.textContent = course.description || "";
      info.appendChild(desc);

      const price = document.createElement("div");
      price.className = "course-price" + (course.isPaid ? "" : " free");
      price.textContent = course.isPaid
        ? `${CURRENCY_SYMBOL}${Number(course.price || 0).toFixed(2)}`
        : "Free";
      info.appendChild(price);

      if (timerText) {
        const timer = document.createElement("div");
        timer.className = "course-timer";
        timer.textContent = timerText;
        info.appendChild(timer);
      }

      const progressBar = document.createElement("div");
      progressBar.className = "progress-bar";
      const progressFill = document.createElement("span");
      progressFill.style.width = `${course.progress}%`;
      progressBar.appendChild(progressFill);
      info.appendChild(progressBar);

      if (course.unlocked) {
        const actions = document.createElement("div");
        actions.className = "course-actions";

        const ring = document.createElement("div");
        ring.className = "progress-ring";
        ring.dataset.course = course.id;
        ring.dataset.progress = String(course.progress);
        ring.style.setProperty("--p", String(course.progress));
        ring.textContent = `${course.progress}%`;

        const btn = document.createElement("button");
        btn.className = "btn-primary continue-btn";
        btn.dataset.course = course.id;
        btn.dataset.link = course.link;
        btn.textContent = "Continue";

        actions.appendChild(ring);
        actions.appendChild(btn);
        body.appendChild(actions);
      } else {
        const locked = document.createElement("div");
        locked.className = "locked-actions";

        const lockedText = document.createElement("div");
        lockedText.className = "locked-text";
        lockedText.dataset.tooltip = "Purchase required to unlock";
        lockedText.textContent = "\uD83D\uDD12 Locked";

        const btn = document.createElement("button");
        btn.className = "btn-primary purchase-btn";
        btn.dataset.course = course.id;
        btn.dataset.price = course.price ?? "";
        btn.textContent = "Purchase";

        locked.appendChild(lockedText);
        locked.appendChild(btn);
        body.appendChild(locked);
      }

      if (course.lastAccessed) {
        const last = document.createElement("div");
        last.className = "last-accessed";
        last.textContent = `Last accessed: ${new Date(course.lastAccessed).toLocaleString()}`;
        body.appendChild(last);
      }

      if (course.unlocked) {
        card.addEventListener("click", async (event) => {
          if (event.target.closest("button")) return;
          if (!course.unlocked) return;
          try {
            await updateProgress(course.id, course.progress, true);
          } catch (err) {
            console.error("Progress update failed:", err?.message || err);
          }
          window.location.href = course.link;
        });
      }

      coursesGrid.appendChild(card);
    });

    // Link Continue buttons to course.html (and update progress / last accessed)
    document.querySelectorAll(".continue-btn").forEach(btn => {
      btn.addEventListener("click", async (event) => {
        event.stopPropagation();
        const courseId = btn.dataset.course;
        const link = btn.dataset.link || `course.html?course=${courseId}`;
        const progressValue = Number(btn.closest(".course-card")
          ?.querySelector(".progress-ring")
          ?.dataset.progress || 0);

        const card = btn.closest(".course-card");
        const isLocked = card?.classList.contains("locked");
        if (isLocked) return;
        try {
          await updateProgress(courseId, progressValue, true);
        } catch (err) {
          console.error("Progress update failed:", err?.message || err);
        }

        window.location.href = link;
      });
    });
    // Purchase buttons (Razorpay)
    document.querySelectorAll(".purchase-btn").forEach(btn => {
      btn.addEventListener("click", async (event) => {
        event.stopPropagation();
        const courseId = btn.dataset.course;
        btn.disabled = true;
        const original = btn.innerText;
        btn.innerText = "Processing...";

        try {
          const priceValue = Number(btn.dataset.price || 0);
          if (!priceValue || priceValue <= 0) {
            throw new Error("Course price missing. Set a valid price in admin.");
          }
          hidePaymentBanner();
          await new Promise(resolve => setTimeout(resolve, 300));
          await purchaseCourse(courseId);
          const { courseModels, stats } = await fetchCoursesWithProgress();
          renderStats(stats);
          renderCourses(courseModels);
        } catch (err) {
          const message = err?.message || String(err);
          console.error("Purchase failed:", message);
          showPaymentBanner(`Purchase failed: ${message}`, "error");
          btn.disabled = false;
          btn.innerText = original;
        }
      });
    });
    // Click progress ring to simulate progress update
    document.querySelectorAll(".progress-ring").forEach(ring => {
      ring.addEventListener("click", async (event) => {
        event.stopPropagation();
        const courseId = ring.dataset.course;
        const current = Number(ring.dataset.progress || 0);
        const next = Math.min(100, current + 5);

        ring.dataset.progress = String(next);
        ring.innerText = `${next}%`;
        ring.style.setProperty("--p", String(next));

        const bar = ring.closest(".course-card")?.querySelector(".progress-bar span");
        if (bar) bar.style.width = `${next}%`;

        const card = ring.closest(".course-card");
        const isLocked = card?.classList.contains("locked");
        if (isLocked) return;
        try {
          await updateProgress(courseId, next, true);
        } catch (err) {
          console.error("Progress update failed:", err?.message || err);
        }
      });
    });
  }

  async function refreshDashboard() {
    try {
      const { courseModels, stats } = await fetchCoursesWithProgress();
      renderStats(stats);
      renderCourses(courseModels);
    } catch (err) {
      console.error("Course fetch failed:", err?.message || err);
      coursesGrid.innerHTML = `<div class="locked-text">Unable to load courses right now.</div>`;
    }
  }

  function setupRealtime() {
    window.supabase
      .channel("public:courses")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "courses" },
        () => refreshDashboard()
      )
      .subscribe();

    window.supabase
      .channel("public:user_course_progress")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "user_course_progress", filter: `user_id=eq.${user.id}` },
        () => refreshDashboard()
      )
      .subscribe();
  }

  await refreshDashboard();
  setupRealtime();
})();













