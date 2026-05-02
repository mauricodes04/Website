/* ==============================================================
   STATE
   ============================================================== */
let activeProject = 0;

/* ==============================================================
   THEME — toggle between dark and light, sync icon
   ============================================================== */
function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === "light" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", next);
  updateToggleIcons(next);
}

function updateToggleIcons(theme) {
  const icon = theme === "light" ? "☀" : "☾";
  document.getElementById("topbar-toggle").textContent = icon;
}

/* ==============================================================
   NAVIGATION — go home, show highlight/about, switch projects
   ============================================================== */
function goHome() {
  showHighlight();
}

function showHighlight() {
  const highlight = document.getElementById("topbar-highlight");
  const detail = document.getElementById("topbar-project-detail");
  const about = document.getElementById("topbar-about");

  highlight.style.display = "block";
  detail.style.display = "none";
  about.style.display = "none";

  document.querySelectorAll(".topbar__nav-link[data-tb-section]").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.tbSection === "highlight");
  });

  document.documentElement.style.setProperty("--accent", "#ffd700");

  retriggerFade(highlight);
  renderHighlight();
}

function showSection(section) {
  const detail = document.getElementById("topbar-project-detail");
  const about = document.getElementById("topbar-about");
  const highlight = document.getElementById("topbar-highlight");

  highlight.style.display = "none";

  if (section === "about") {
    detail.style.display = "none";
    about.style.display = "block";
    renderAbout();
    retriggerFade(about);
  }

  document.querySelectorAll(".topbar__nav-link[data-tb-section]").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.tbSection === section);
  });
}

function switchProject(index) {
  activeProject = index;
  setAccent(index);
  updateProjectButtons();

  const detail = document.getElementById("topbar-project-detail");
  const about  = document.getElementById("topbar-about");
  const highlight = document.getElementById("topbar-highlight");

  highlight.style.display = "none";
  detail.style.display = "block";
  about.style.display  = "none";

  renderProject(index);
}

function setAccent(index) {
  document.documentElement.style.setProperty("--accent", PROJECT_COLORS[index]);
}

function updateProjectButtons() {
  document.querySelectorAll(".topbar-proj-btn").forEach((btn, i) => {
    btn.classList.toggle("active", i === activeProject);
  });
}

/* ==============================================================
   RENDERING — shared section renderer + per-view wrappers
   ============================================================== */
function renderSections(container, data) {
  container.innerHTML = "";

  const title = document.createElement("h2");
  title.className = "detail__title";
  title.textContent = data.title;
  container.appendChild(title);

  data.sections.forEach(section => {
    if (section.type === "subtitle") {
      const subtitle = document.createElement("p");
      subtitle.className = "detail__subtitle";
      subtitle.textContent = section.content;
      container.appendChild(subtitle);

      const rule = document.createElement("div");
      rule.className = "detail__rule";
      container.appendChild(rule);
    }
    else if (section.type === "desc") {
      const desc = document.createElement("p");
      desc.className = "detail__desc";
      if (section.html) {
        desc.innerHTML = section.content;
      } else {
        desc.textContent = section.content;
      }
      container.appendChild(desc);
    }
    else if (section.type === "media") {
      if (section.src) {
        const img = document.createElement("img");
        img.className = "detail__media";
        img.src = section.src;
        img.alt = section.alt || "Image";
        img.style.cursor = "pointer";
        img.style.objectFit = "contain";

        img.addEventListener("click", () => {
          openImageModal(section.src, section.alt || "Image");
        });

        container.appendChild(img);
      } else {
        const media = document.createElement("div");
        media.className = "detail__media";
        media.textContent = "Image / Video placeholder";
        container.appendChild(media);
      }
    }
    else if (section.type === "link") {
      const link = document.createElement("a");
      link.className = "detail__link";
      link.href = section.url;
      link.target = "_blank";
      link.rel = "noopener";
      link.textContent = section.text;
      container.appendChild(link);
    }
    else if (section.type === "comments") {
      const commentsWrapper = document.createElement("div");
      commentsWrapper.className = "detail__comments";

      const commentsToggle = document.createElement("button");
      commentsToggle.className = "detail__comments-toggle";
      commentsToggle.textContent = "Comments >";
      commentsToggle.setAttribute("aria-expanded", "false");

      const commentsContent = document.createElement("div");
      commentsContent.className = "detail__comments-content";
      if (section.html) {
        commentsContent.innerHTML = section.content;
      } else {
        commentsContent.textContent = section.content;
      }

      commentsToggle.addEventListener("click", () => {
        const isExpanded = commentsContent.classList.contains("expanded");
        commentsContent.classList.toggle("expanded");
        commentsToggle.textContent = isExpanded ? "Comments >" : "Comments v";
        commentsToggle.setAttribute("aria-expanded", !isExpanded);
      });

      commentsWrapper.appendChild(commentsToggle);
      commentsWrapper.appendChild(commentsContent);
      container.appendChild(commentsWrapper);
    }
  });
}

function renderHighlight() {
  const container = document.getElementById("highlight-content");
  renderSections(container, HIGHLIGHT);
  retriggerFade(document.getElementById("topbar-highlight"));
}

function renderAbout() {
  const container = document.getElementById("about-content");
  renderSections(container, ABOUT);
}

function renderProject(index) {
  const container = document.getElementById("proj-content");
  renderSections(container, PROJECTS[index]);
  retriggerFade(document.getElementById("topbar-project-detail"));
}

function retriggerFade(el) {
  el.classList.remove("fade-in");
  void el.offsetWidth;
  el.classList.add("fade-in");
}

/* ==============================================================
   IMAGE MODAL — lightbox for full-resolution images
   ============================================================== */
function openImageModal(src, alt) {
  const modal = document.createElement("div");
  modal.className = "image-modal";

  const overlay = document.createElement("div");
  overlay.className = "image-modal__overlay";

  const content = document.createElement("div");
  content.className = "image-modal__content";

  const img = document.createElement("img");
  img.src = src;
  img.alt = alt;
  img.className = "image-modal__img";

  const closeBtn = document.createElement("button");
  closeBtn.className = "image-modal__close";
  closeBtn.textContent = "✕";
  closeBtn.setAttribute("aria-label", "Close image");

  content.appendChild(closeBtn);
  content.appendChild(img);
  modal.appendChild(overlay);
  modal.appendChild(content);
  document.body.appendChild(modal);

  const closeModal = () => {
    modal.classList.add("closing");
    setTimeout(() => modal.remove(), 300);
  };

  closeBtn.addEventListener("click", closeModal);
  overlay.addEventListener("click", closeModal);

  setTimeout(() => modal.classList.add("open"), 10);
}

/* ==============================================================
   RESUME/CV DROPDOWN
   ============================================================== */
function initResumeDropdown() {
  const resumeDropdown = document.querySelector(".topbar__resume-dropdown");
  const resumeToggle = document.getElementById("resume-toggle");
  if (!resumeDropdown || !resumeToggle) return;

  const closeResumeDropdown = () => {
    resumeDropdown.classList.remove("open");
    resumeToggle.setAttribute("aria-expanded", "false");
  };

  resumeToggle.addEventListener("click", () => {
    const willOpen = !resumeDropdown.classList.contains("open");
    resumeDropdown.classList.toggle("open", willOpen);
    resumeToggle.setAttribute("aria-expanded", String(willOpen));
  });

  document.addEventListener("click", event => {
    if (!resumeDropdown.contains(event.target)) closeResumeDropdown();
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeResumeDropdown();
  });

  resumeDropdown.querySelectorAll(".topbar__resume-menu-link").forEach(link => {
    link.addEventListener("click", closeResumeDropdown);
  });
}

/* ==============================================================
   TOP-BAR NAV BINDINGS
   ============================================================== */
function initTopbarNav() {
  document.querySelectorAll(".topbar__nav-link[data-tb-section]").forEach(btn => {
    btn.addEventListener("click", () => {
      const section = btn.dataset.tbSection;
      if (section === "highlight") {
        showHighlight();
        return;
      }
      showSection(section);
    });
  });
}

/* ==============================================================
   INIT — default to dark theme, render highlight
   ============================================================== */
document.addEventListener("DOMContentLoaded", () => {
  const theme = document.documentElement.getAttribute("data-theme") || "dark";
  document.documentElement.setAttribute("data-theme", theme);
  updateToggleIcons(theme);

  initTopbarNav();
  initResumeDropdown();
  showHighlight();
});
