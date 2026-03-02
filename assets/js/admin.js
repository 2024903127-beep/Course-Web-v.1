(async () => {
  const ADMIN_EMAIL = "rahulmishraoffical69@gmail.com";

  const { data } = await window.supabase.auth.getUser();
  const user = data.user;
  if (!user) {
    location.replace("login.html");
    return;
  }

  const email = (user.email || "").toLowerCase();
  let isAdmin = email === ADMIN_EMAIL.toLowerCase();
  try {
    const { data: profile, error: profileError } = await window.supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();
    if (!profileError && profile?.is_admin === true) {
      isAdmin = true;
    }
  } catch {
    // Fallback to email check if profiles table/column isn't available
  }

  if (!isAdmin) {
    location.replace("dashboard.html");
    return;
  }

  document.getElementById("adminEmail").textContent = email;
  document.getElementById("logoutBtn").onclick = async () => {
    await window.supabase.auth.signOut();
    location.replace("login.html");
  };

  const courseSelect = document.getElementById("courseSelect");
  const newCourseBtn = document.getElementById("newCourseBtn");
  const deleteCourseBtn = document.getElementById("deleteCourseBtn");

  const courseForm = document.getElementById("courseForm");
  const courseId = document.getElementById("courseId");
  const courseTitle = document.getElementById("courseTitle");
  const courseDescription = document.getElementById("courseDescription");
  const courseDuration = document.getElementById("courseDuration");
  const coursePrice = document.getElementById("coursePrice");
  const courseLink = document.getElementById("courseLink");
  const courseThumbnailUrl = document.getElementById("courseThumbnailUrl");
  const courseThumbnailFile = document.getElementById("courseThumbnailFile");
  const thumbnailPreview = document.getElementById("thumbnailPreview");
  const courseLocked = document.getElementById("courseLocked");
  const coursePaid = document.getElementById("coursePaid");
  const saveCourseBtn = document.getElementById("saveCourseBtn");

  const chapterForm = document.getElementById("chapterForm");
  const chapterId = document.getElementById("chapterId");
  const chapterTitle = document.getElementById("chapterTitle");
  const chapterPosition = document.getElementById("chapterPosition");
  const saveChapterBtn = document.getElementById("saveChapterBtn");
  const resetChapterBtn = document.getElementById("resetChapterBtn");
  const chaptersList = document.getElementById("chaptersList");

  const lessonForm = document.getElementById("lessonForm");
  const lessonId = document.getElementById("lessonId");
  const lessonChapter = document.getElementById("lessonChapter");
  const lessonTitle = document.getElementById("lessonTitle");
  const lessonPosition = document.getElementById("lessonPosition");
  const lessonVideoUrl = document.getElementById("lessonVideoUrl");
  const lessonPdfUrl = document.getElementById("lessonPdfUrl");
  const lessonVideoFile = document.getElementById("lessonVideoFile");
  const lessonPdfFile = document.getElementById("lessonPdfFile");
  const saveLessonBtn = document.getElementById("saveLessonBtn");
  const resetLessonBtn = document.getElementById("resetLessonBtn");
  const lessonsList = document.getElementById("lessonsList");

  const totalCourses = document.getElementById("totalCourses");

  let activeCourseId = "";

  function resetCourseForm() {
    courseId.value = "";
    courseTitle.value = "";
    courseDescription.value = "";
    courseDuration.value = "";
    coursePrice.value = "";
    courseLink.value = "";
    courseThumbnailUrl.value = "";
    courseThumbnailFile.value = "";
    if (thumbnailPreview) thumbnailPreview.innerHTML = "No thumbnail";
    courseLocked.checked = false;
    coursePaid.checked = false;
    saveCourseBtn.textContent = "Save Course";
  }

  function updateThumbnailPreview(url) {
    if (!thumbnailPreview) return;
    if (!url) {
      thumbnailPreview.innerHTML = "No thumbnail";
      return;
    }
    const previewUrl = normalizeThumbnailUrl(url);
    thumbnailPreview.innerHTML = `<img src="${previewUrl}" alt="Thumbnail preview" />`;
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

  function normalizeThumbnailUrl(url) {
    if (!url) return "";
    const trimmed = String(url).trim();
    if (trimmed.includes("drive.google.com")) {
      return toDriveThumbnail(trimmed);
    }
    return trimmed;
  }

  courseThumbnailUrl.addEventListener("input", () => {
    updateThumbnailPreview(courseThumbnailUrl.value.trim());
  });

  courseThumbnailFile.addEventListener("change", () => {
    const file = courseThumbnailFile.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => updateThumbnailPreview(String(e.target?.result || ""));
    reader.readAsDataURL(file);
  });

  function resetChapterForm() {
    chapterId.value = "";
    chapterTitle.value = "";
    chapterPosition.value = 1;
    saveChapterBtn.textContent = "Save Chapter";
  }

  function resetLessonForm() {
    lessonId.value = "";
    lessonTitle.value = "";
    lessonPosition.value = 1;
    lessonVideoUrl.value = "";
    lessonPdfUrl.value = "";
    lessonVideoFile.value = "";
    lessonPdfFile.value = "";
    saveLessonBtn.textContent = "Save Lesson";
  }

  newCourseBtn.addEventListener("click", () => {
    activeCourseId = "";
    courseSelect.value = "";
    resetCourseForm();
    resetChapterForm();
    resetLessonForm();
    renderChaptersList([]);
    renderLessonsList([]);
  });

  resetChapterBtn.addEventListener("click", resetChapterForm);
  resetLessonBtn.addEventListener("click", resetLessonForm);

  async function fetchCourses() {
    const { data: courses, error } = await window.supabase
      .from("courses")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return courses || [];
  }

  async function fetchChapters() {
    const { data, error } = await window.supabase
      .from("course_chapters")
      .select("*")
      .order("position", { ascending: true });
    if (error) throw error;
    return data || [];
  }

  async function fetchLessons() {
    const { data, error } = await window.supabase
      .from("course_lessons")
      .select("*")
      .order("position", { ascending: true });
    if (error) throw error;
    return data || [];
  }

  async function uploadFile(file, pathPrefix) {
    if (!file) return null;
    const fileName = `${pathPrefix}/${Date.now()}-${file.name}`;
    const { error } = await window.supabase
      .storage
      .from("course-assets")
      .upload(fileName, file, { upsert: true });
    if (error) throw error;
    const { data } = window.supabase
      .storage
      .from("course-assets")
      .getPublicUrl(fileName);
    return data.publicUrl;
  }

  async function saveCourse(e) {
    e.preventDefault();
    saveCourseBtn.disabled = true;
    saveCourseBtn.textContent = "Saving...";

    try {
      const uploadedThumb = await uploadFile(courseThumbnailFile.files[0], "thumbnails");
      const normalizedThumbUrl = normalizeThumbnailUrl(courseThumbnailUrl.value.trim());
      const payload = {
        title: courseTitle.value.trim(),
        description: courseDescription.value.trim(),
        duration: courseDuration.value.trim() || null,
        price: coursePrice.value ? Number(coursePrice.value) : null,
        link: courseLink.value.trim() || null,
        is_paid: coursePaid.checked,
        locked: coursePaid.checked || courseLocked.checked,
        thumbnail: uploadedThumb || normalizedThumbUrl || null,
      };

      if (courseId.value) {
        const { error } = await window.supabase
          .from("courses")
          .update(payload)
          .eq("id", courseId.value);
        if (error) throw error;
      } else {
        payload.owner = user.id;
        const { error } = await window.supabase
          .from("courses")
          .insert([payload]);
        if (error) throw error;
      }

      await refreshAll();
    } catch (err) {
      console.error("Save failed:", err?.message || err);
    } finally {
      saveCourseBtn.disabled = false;
      saveCourseBtn.textContent = "Save Course";
    }
  }

  async function saveChapter(e) {
    e.preventDefault();
    if (!activeCourseId) return;
    saveChapterBtn.disabled = true;
    saveChapterBtn.textContent = "Saving...";

    try {
      const payload = {
        course_id: activeCourseId,
        title: chapterTitle.value.trim(),
        position: Number(chapterPosition.value || 1),
      };

      if (chapterId.value) {
        const { error } = await window.supabase
          .from("course_chapters")
          .update(payload)
          .eq("id", chapterId.value);
        if (error) throw error;
      } else {
        const { error } = await window.supabase
          .from("course_chapters")
          .insert([payload]);
        if (error) throw error;
      }

      resetChapterForm();
      await refreshAll();
    } catch (err) {
      console.error("Chapter save failed:", err?.message || err);
    } finally {
      saveChapterBtn.disabled = false;
      saveChapterBtn.textContent = "Save Chapter";
    }
  }

  async function saveLesson(e) {
    e.preventDefault();
    if (!lessonChapter.value) return;
    saveLessonBtn.disabled = true;
    saveLessonBtn.textContent = "Saving...";

    try {
      const uploadedVideo = await uploadFile(lessonVideoFile.files[0], "videos");
      const uploadedPdf = await uploadFile(lessonPdfFile.files[0], "pdfs");

      const payload = {
        chapter_id: lessonChapter.value,
        title: lessonTitle.value.trim(),
        position: Number(lessonPosition.value || 1),
        video_url: uploadedVideo || lessonVideoUrl.value.trim() || null,
        pdf_url: uploadedPdf || lessonPdfUrl.value.trim() || null,
      };

      if (lessonId.value) {
        const { error } = await window.supabase
          .from("course_lessons")
          .update(payload)
          .eq("id", lessonId.value);
        if (error) throw error;
      } else {
        const { error } = await window.supabase
          .from("course_lessons")
          .insert([payload]);
        if (error) throw error;
      }

      resetLessonForm();
      await refreshAll();
    } catch (err) {
      console.error("Lesson save failed:", err?.message || err);
    } finally {
      saveLessonBtn.disabled = false;
      saveLessonBtn.textContent = "Save Lesson";
    }
  }

  courseForm.addEventListener("submit", saveCourse);
  chapterForm.addEventListener("submit", saveChapter);
  lessonForm.addEventListener("submit", saveLesson);

  deleteCourseBtn.addEventListener("click", async () => {
    if (!courseId.value) return;
    const ok = window.confirm("Delete this course?");
    if (!ok) return;
    await window.supabase.from("courses").delete().eq("id", courseId.value);
    activeCourseId = "";
    resetCourseForm();
    await refreshAll();
  });

  courseSelect.addEventListener("change", () => {
    activeCourseId = courseSelect.value;
    refreshAll();
  });

  function renderCourseSelect(courses) {
    courseSelect.innerHTML = "";
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Select a course";
    courseSelect.appendChild(placeholder);
    courses.forEach(course => {
      const opt = document.createElement("option");
      opt.value = course.id;
      opt.textContent = course.title || course.id;
      courseSelect.appendChild(opt);
    });
  }

  function loadCourseIntoForm(course) {
    if (!course) return;
    courseId.value = course.id;
    courseTitle.value = course.title || "";
    courseDescription.value = course.description || "";
    courseDuration.value = course.duration || "";
    coursePrice.value = course.price ?? "";
    courseLink.value = course.link || "";
    courseThumbnailUrl.value = course.thumbnail || "";
    updateThumbnailPreview(course.thumbnail || "");
    courseLocked.checked = !!course.locked;
    coursePaid.checked = !!course.is_paid;
    saveCourseBtn.textContent = "Update Course";
  }

  function renderChaptersList(chapters) {
    chaptersList.innerHTML = "";
    if (!chapters.length) {
      chaptersList.innerHTML = `<div class="list-item"><p>No chapters yet.</p></div>`;
      return;
    }
    chapters.forEach(ch => {
      const item = document.createElement("div");
      item.className = "list-item";
      item.innerHTML = `
        <div>
          <h4>${ch.title}</h4>
          <p>Position ${ch.position ?? 1}</p>
        </div>
        <div>
          <button class="btn-mini" data-edit="${ch.id}">Edit</button>
          <button class="btn-mini danger" data-delete="${ch.id}">Delete</button>
        </div>
      `;
      chaptersList.appendChild(item);
    });
  }

  function renderLessonsList(lessons) {
    lessonsList.innerHTML = "";
    if (!lessons.length) {
      lessonsList.innerHTML = `<div class="list-item"><p>No lessons yet.</p></div>`;
      return;
    }
    lessons.forEach(ls => {
      const item = document.createElement("div");
      item.className = "list-item";
      item.innerHTML = `
        <div>
          <h4>${ls.title}</h4>
          <p>Position ${ls.position ?? 1}</p>
        </div>
        <div>
          <button class="btn-mini" data-edit="${ls.id}">Edit</button>
          <button class="btn-mini danger" data-delete="${ls.id}">Delete</button>
        </div>
      `;
      lessonsList.appendChild(item);
    });
  }

  function attachChapterHandlers(chapters) {
    chaptersList.querySelectorAll("[data-edit]").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-edit");
        const chapter = chapters.find(c => String(c.id) === id);
        if (!chapter) return;
        chapterId.value = chapter.id;
        chapterTitle.value = chapter.title || "";
        chapterPosition.value = chapter.position || 1;
        saveChapterBtn.textContent = "Update Chapter";
      });
    });

    chaptersList.querySelectorAll("[data-delete]").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-delete");
        const ok = window.confirm("Delete this chapter?");
        if (!ok) return;
        await window.supabase.from("course_chapters").delete().eq("id", id);
        await refreshAll();
      });
    });
  }

  function attachLessonHandlers(lessons) {
    lessonsList.querySelectorAll("[data-edit]").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-edit");
        const lesson = lessons.find(l => String(l.id) === id);
        if (!lesson) return;
        lessonId.value = lesson.id;
        lessonChapter.value = lesson.chapter_id;
        lessonTitle.value = lesson.title || "";
        lessonPosition.value = lesson.position || 1;
        lessonVideoUrl.value = lesson.video_url || "";
        lessonPdfUrl.value = lesson.pdf_url || "";
        saveLessonBtn.textContent = "Update Lesson";
      });
    });

    lessonsList.querySelectorAll("[data-delete]").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-delete");
        const ok = window.confirm("Delete this lesson?");
        if (!ok) return;
        await window.supabase.from("course_lessons").delete().eq("id", id);
        await refreshAll();
      });
    });
  }

  function hydrateLessonChapters(chapters) {
    lessonChapter.innerHTML = "";
    if (!chapters.length) {
      const opt = document.createElement("option");
      opt.value = "";
      opt.textContent = "No chapters yet";
      lessonChapter.appendChild(opt);
      return;
    }
    chapters.forEach(ch => {
      const opt = document.createElement("option");
      opt.value = ch.id;
      opt.textContent = ch.title;
      lessonChapter.appendChild(opt);
    });
  }

  async function refreshAll() {
    const [courses, chapters, lessons] = await Promise.all([
      fetchCourses(),
      fetchChapters(),
      fetchLessons(),
    ]);

    totalCourses.textContent = `Courses: ${courses.length}`;
    renderCourseSelect(courses);

    if (!activeCourseId && courses.length) {
      activeCourseId = courses[0].id;
    }
    courseSelect.value = activeCourseId || "";

    const activeCourse = courses.find(c => String(c.id) === String(activeCourseId));
    if (activeCourse) loadCourseIntoForm(activeCourse);

    const activeChapters = chapters
      .filter(ch => String(ch.course_id) === String(activeCourseId))
      .sort((a, b) => (a.position || 0) - (b.position || 0));
    const activeLessons = lessons
      .filter(ls => activeChapters.some(ch => ch.id === ls.chapter_id))
      .sort((a, b) => (a.position || 0) - (b.position || 0));

    renderChaptersList(activeChapters);
    renderLessonsList(activeLessons);
    attachChapterHandlers(activeChapters);
    attachLessonHandlers(activeLessons);
    hydrateLessonChapters(activeChapters);
  }

  await refreshAll();
})();
