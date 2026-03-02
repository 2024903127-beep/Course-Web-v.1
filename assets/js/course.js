(async () => {
  const { data } = await window.supabase.auth.getUser();
  const user = data.user;
  if (!user) { location.replace("login.html"); return; }

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await window.supabase.auth.signOut();
      location.replace("login.html");
    });
  }

  // ===============================
  // GET COURSE ID
  // ===============================
  const params = new URLSearchParams(window.location.search);
  const courseId = params.get("course");
  if (!courseId) {
    location.replace("dashboard.html");
    return;
  }

  // ===============================
  // ELEMENTS
  // ===============================
  const chaptersEl = document.querySelector(".chapters");
  const titleEl = document.querySelector(".course-info h1");
  const descEl = document.querySelector(".course-info p");
  const progressEl = document.querySelector(".progress strong");
  const videoBox = document.querySelector(".video-placeholder");
  const lessonTitle = document.querySelector(".lesson-info h2");
  const lessonDesc = document.querySelector(".lesson-info p");
  const pdfCard = document.querySelector(".pdf-card");

  const STATUS = {
    LOCKED: "locked",
    UNLOCKED: "unlocked",
    IN_PROGRESS: "in_progress",
    COMPLETED: "completed"
  };

  async function fetchCourse() {
    const { data: course, error } = await window.supabase
      .from("courses")
      .select("*")
      .eq("id", courseId)
      .single();

    if (error) throw error;
    return course;
  }

  async function fetchProgress() {
    const { data, error } = await window.supabase
      .from("user_course_progress")
      .select("course_id,progress,status,last_accessed,purchased")
      .eq("user_id", user.id)
      .eq("course_id", courseId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async function updateProgress(progressValue) {
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

  function buildChapters(contentText) {
    return [
      {
        title: "Chapter 1: Overview",
        unlocked: true,
        lessons: [
          { title: "Course Overview", content: contentText, video: "", pdf: "" }
        ]
      }
    ];
  }

  function toEmbedUrl(url) {
    if (!url) return "";
    const input = String(url).trim();
    if (input.includes("youtube.com/watch")) {
      const id = new URL(input).searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : input;
    }
    if (input.includes("youtu.be/")) {
      const id = input.split("youtu.be/")[1].split("?")[0];
      return id ? `https://www.youtube.com/embed/${id}` : input;
    }
    if (input.includes("drive.google.com")) {
      const match = input.match(/\/d\/([^/]+)/);
      const id = match ? match[1] : null;
      return id ? `https://drive.google.com/file/d/${id}/preview` : input;
    }
    return input;
  }

  function isSafeUrl(url) {
    try {
      const parsed = new URL(url);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  }

  function setActiveLesson(title, contentText, videoUrl, pdfUrl) {
    document.querySelectorAll(".chapter li").forEach(l =>
      l.classList.remove("active")
    );

    lessonTitle.innerText = title;
    lessonDesc.innerText = contentText;

    const embedUrl = toEmbedUrl(videoUrl);
    if (embedUrl && isSafeUrl(embedUrl)) {
      const frame = document.createElement("iframe");
      frame.src = embedUrl;
      frame.setAttribute("allowfullscreen", "");
      videoBox.innerHTML = "";
      videoBox.appendChild(frame);
    } else {
      const placeholder = document.createElement("div");
      placeholder.style.height = "360px";
      placeholder.style.display = "flex";
      placeholder.style.alignItems = "center";
      placeholder.style.justifyContent = "center";
      placeholder.style.opacity = ".7";
      placeholder.style.padding = "20px";
      placeholder.style.textAlign = "center";
      placeholder.textContent = contentText;
      videoBox.innerHTML = "";
      videoBox.appendChild(placeholder);
    }

    if (pdfCard) {
      pdfCard.innerHTML = "";
      if (pdfUrl && isSafeUrl(pdfUrl)) {
        const link = document.createElement("a");
        link.href = pdfUrl;
        link.target = "_blank";
        link.rel = "noreferrer";
        link.textContent = "\uD83D\uDCC4 Lesson Notes (PDF)";
        pdfCard.appendChild(link);
      } else {
        pdfCard.textContent = "\uD83D\uDCC4 Lesson Notes (PDF) - not available";
      }
    }

    [...document.querySelectorAll(".chapter li")].find(
      el => el.innerText.includes(title)
    )?.classList.add("active");
  }

  try {
    const course = await fetchCourse();
    const progressRow = await fetchProgress();

    const isLocked =
      course.locked === true ||
      course.locked === "true" ||
      course.locked === 1 ||
      course.is_paid === true ||
      course.is_paid === "true" ||
      course.is_paid === 1;
    const purchased = progressRow?.purchased === true;
    const unlocked = isLocked ? purchased : true;
    if (isLocked && !purchased) {
      location.replace("dashboard.html");
      return;
    }
    if (!unlocked) {
      location.replace("dashboard.html");
      return;
    }

    const { data: chaptersData, error: chaptersError } = await window.supabase
      .from("course_chapters")
      .select("id,title,position")
      .eq("course_id", courseId)
      .order("position", { ascending: true });
    if (chaptersError) throw chaptersError;

    const { data: lessonsData, error: lessonsError } = await window.supabase
      .from("course_lessons")
      .select("id,chapter_id,title,video_url,pdf_url,position")
      .order("position", { ascending: true });
    if (lessonsError) throw lessonsError;

    const progress = progressRow?.progress ?? 0;

    // Load header
    titleEl.innerText = course.title;
    descEl.innerText = course.description || "";
    progressEl.innerText = `${progress}%`;

    // Build minimal dynamic content
    const contentText = course.content || course.description || "Course content coming soon.";
    const chapters = (chaptersData && chaptersData.length)
      ? chaptersData.map(ch => ({
          id: ch.id,
          title: ch.title,
          unlocked: true,
          lessons: (lessonsData || [])
            .filter(ls => ls.chapter_id === ch.id)
            .map(ls => ({
              title: ls.title,
              content: contentText,
              video: ls.video_url || "",
              pdf: ls.pdf_url || ""
            }))
        }))
      : buildChapters(contentText);

    const allLessons = chapters.flatMap(ch => ch.lessons);
    const totalLessons = allLessons.length || 1;

    // Build chapters
    chaptersEl.innerHTML = "<h3>Chapters</h3>";

    chapters.forEach((chapter) => {
      const chapterDiv = document.createElement("div");
      chapterDiv.className = "chapter open";

      const titleDiv = document.createElement("div");
      titleDiv.className = "chapter-title";
      titleDiv.innerText = chapter.title;

      titleDiv.onclick = () => {
        chapterDiv.classList.toggle("open");
      };

      chapterDiv.appendChild(titleDiv);

      const ul = document.createElement("ul");

      chapter.lessons.forEach((lesson) => {
        const liEl = document.createElement("li");
        liEl.innerText = `\u25B6 ${lesson.title}`;

        liEl.onclick = async () => {
          setActiveLesson(lesson.title, lesson.content, lesson.video, lesson.pdf);
          const lessonIndex = allLessons.findIndex(l => l.title === lesson.title);
          const percent = Math.max(1, Math.round(((lessonIndex + 1) / totalLessons) * 100));
          try {
            await updateProgress(percent);
            progressEl.innerText = `${percent}%`;
          } catch (err) {
            console.error("Progress update failed:", err?.message || err);
          }
        };

        ul.appendChild(liEl);
      });

      chapterDiv.appendChild(ul);
      chaptersEl.appendChild(chapterDiv);
    });

    // Set default lesson
    setActiveLesson(
      chapters[0].lessons[0].title,
      chapters[0].lessons[0].content,
      chapters[0].lessons[0].video,
      chapters[0].lessons[0].pdf
    );

    // Update last accessed
    if (unlocked) {
      try {
        await updateProgress(progress);
      } catch (err) {
        console.error("Progress update failed:", err?.message || err);
      }
    }
  } catch (err) {
    console.error("Course load failed:", err?.message || err);
    location.replace("dashboard.html");
  }
})();
