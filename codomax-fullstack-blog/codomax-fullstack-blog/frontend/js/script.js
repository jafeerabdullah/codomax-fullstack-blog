/* Codomax Journal — Module 2 frontend integration.
 * Real accounts and blog operations use BlogAPI (api.js).
 * The original Module 1 sample workspace remains available as ?demo=1.
 * Passwords are never stored by the frontend.
 */
"use strict";

(() => {
  const STORAGE_KEY = "codomax.module1.posts.v1";
  const DEMO_WRITER = "Jafeer Abdullah";
  const DEMO_INITIALS = "JA";
  const API = window.BlogAPI;
  const params = new URLSearchParams(window.location.search);
  const DEMO_MODE = params.get("demo") === "1" || (document.body.dataset.page === "dashboard" && !API.session());
  const CATEGORIES = ["Web Development", "Design", "Productivity", "Technology", "Personal Growth"];
  const FALLBACK_IMAGE = "images/cover-fallback.svg";
  const LOCAL_IMAGES = ["images/code-workspace.jpg", "images/design-perspective.jpg", "images/writing-routine.jpg", FALLBACK_IMAGE];
  const SAMPLE_POSTS = [
    {
      id: "post-1", title: "Start small. Build something great.", category: "Web Development",
      date: "2026-10-05", status: "published", imageUrl: "images/code-workspace.jpg",
      imageAlt: "A laptop on a desk, ready for a new project", author: DEMO_WRITER,
      description: "Your first project doesn't have to change the world. It just has to help you take the next step.",
      readMinutes: 5,
      content: "The blank editor can feel like a big place. There are so many tools to learn and so many directions to take. The best way forward is often much smaller than you think.\n\nChoose one useful thing to build. A personal homepage, a reading list, or a simple blog gives you a real reason to practice. Start with the content and a few semantic HTML elements. Give the page a clear structure before reaching for a new tool.\n\nNext, add your styles. Create a small set of colors and spacing values you can reuse. Check your page on a narrow screen early. A layout that works on a phone usually teaches you more about good structure than a perfect desktop screenshot.\n\nFinally, make one interaction work. A navigation menu or a validated form is enough to turn a static page into something that responds to a person. Test the happy path and the moments when someone enters something unexpected.\n\nYou don't need to finish everything in one sitting. Keep your changes small, your names clear, and your curiosity close. A working first step is the beginning of something great."
    },
    {
      id: "post-2", title: "Good design leaves room to breathe.", category: "Design",
      date: "2026-10-03", status: "published", imageUrl: "images/design-perspective.jpg",
      imageAlt: "Clean architectural lines and thoughtful geometric details", author: DEMO_WRITER,
      description: "Why a little less clutter, a little more space, and a clear purpose can make all the difference.",
      readMinutes: 4,
      content: "A thoughtful design rarely asks every element to speak at once. It gives the most useful idea a clear place to live and lets the supporting details follow.\n\nSpace helps us understand relationships. A heading close to its paragraph tells us those two things belong together. More room between sections signals a change in topic. You can create hierarchy before you add a single extra color.\n\nTry choosing a small spacing scale. Reuse it for card padding, section gaps, and the distance between a label and its input. Consistency makes a page feel considered, even when its elements are simple.\n\nTypography deserves the same care. Use a readable body size, a comfortable line height, and a small number of heading sizes. A strong title works best when the text around it has room to breathe.\n\nBefore adding another decoration, ask what your reader needs next. Sometimes the most effective design decision is to make that next step easier to see."
    },
    {
      id: "post-3", title: "Make a little time for your next idea.", category: "Productivity",
      date: "2026-09-29", status: "published", imageUrl: "images/writing-routine.jpg",
      imageAlt: "A notebook and coffee arranged for a quiet writing session", author: DEMO_WRITER,
      description: "A simple routine for finding focus, staying curious, and turning small thoughts into meaningful work.",
      readMinutes: 3,
      content: "Ideas rarely arrive with a finished plan. More often, they show up as a question during a walk or a small observation while you're working. A good routine makes room to notice them.\n\nKeep one place for your notes. It can be a notebook or a plain text file. Write the idea in a sentence, then add the next small thing you could do to explore it. You don't have to decide whether it's brilliant yet.\n\nSet aside a short block of time without notifications. Twenty quiet minutes can be enough to sketch a page, write a paragraph, or test a possibility. Choose one task before you begin so you don't spend the whole session deciding.\n\nWhen you stop, leave yourself a useful starting point. A note about what to try next makes it easier to return. Progress comes from giving your ideas a little attention, regularly."
    },
    {
      id: "post-4", title: "What I'm learning about accessible websites", category: "Web Development",
      date: "2026-09-27", status: "draft", imageUrl: "images/code-workspace.jpg",
      imageAlt: "A laptop and a carefully arranged workspace", author: DEMO_WRITER,
      description: "Small choices that help more people feel at home on the web.", readMinutes: 2,
      content: "An accessible website begins with a simple question: can someone use this page in the way that works for them?\n\nStart with meaningful headings, real buttons for actions, and visible labels for form fields. Test the keyboard path through your page. The focus indicator should make it easy to see where you are.\n\nMy next step is to review error messages and make sure they explain how to correct a field, without relying on color alone."
    }
  ];

  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
  const element = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const icon = (name) => {
    const paths = {
      chevron: "M9 5l7 7-7 7",
      edit: "m15 4 5 5M4 20l5-1L20 8a3.5 3.5 0 0 0-5-5L4 14l-1 7Z",
      delete: "M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14M10 11v6M14 11v6"
    };
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", paths[name]);
    svg.append(path);
    return svg;
  };

  function validImageUrl(value) {
    if (LOCAL_IMAGES.includes(value)) return true;
    try {
      const url = new URL(value);
      return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password;
    } catch { return false; }
  }

  function formatDate(value) {
    // Local noon avoids a UTC date shifting to the previous day.
    return new Date(`${value}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }
  function today() {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  }
  function wordCount(value) { return value.trim() ? value.trim().split(/\s+/).length : 0; }
  function readMinutes(content) { return Math.max(1, Math.ceil(wordCount(content) / 200)); }

  // Only demo post data is stored. Passwords, emails and account names are never stored.
  const DemoPosts = (() => {
    const freshSamples = () => SAMPLE_POSTS.map(post => ({ ...post }));
    let storageAvailable = true;
    function load() {
      try {
        const saved = sessionStorage.getItem(STORAGE_KEY);
        if (saved === null) return freshSamples();
        const parsed = JSON.parse(saved);
        const valid = Array.isArray(parsed) && parsed.every(post =>
          post && typeof post.id === "string" && /^[a-zA-Z0-9-]+$/.test(post.id) &&
          typeof post.title === "string" && post.title.trim() && post.title.length <= 120 &&
          CATEGORIES.includes(post.category) && ["published", "draft"].includes(post.status) &&
          typeof post.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(post.date) &&
          Number.isFinite(new Date(`${post.date}T12:00:00`).getTime()) &&
          typeof post.imageUrl === "string" && validImageUrl(post.imageUrl) &&
          typeof post.content === "string" && typeof post.author === "string" &&
          typeof post.description === "string" && typeof post.imageAlt === "string" &&
          Number.isFinite(post.readMinutes) && post.readMinutes > 0
        );
        if (valid && new Set(parsed.map(post => post.id)).size === parsed.length) {
          // Keep existing demo edits while applying the current demo writer's name.
          return parsed.map(post => ({ ...post, author: DEMO_WRITER }));
        }
      } catch { storageAvailable = false; }
      return freshSamples();
    }
    let posts = load();
    function save() {
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
        storageAvailable = true;
      } catch { storageAvailable = false; }
      return storageAvailable;
    }
    return {
      all: () => posts.map(post => ({ ...post })),
      find: id => posts.find(post => post.id === id),
      create(post) { posts.unshift(post); return save(); },
      update(id, changes) {
        const index = posts.findIndex(post => post.id === id);
        if (index === -1) return false;
        posts[index] = { ...posts[index], ...changes };
        return save();
      },
      remove(id) { posts = posts.filter(post => post.id !== id); return save(); },
      reset() { posts = freshSamples(); return save(); },
      available: () => storageAvailable
    };
  })();

  function watchImage(img) {
    const fallback = () => {
      if (img.dataset.fallbackApplied) return;
      img.dataset.fallbackApplied = "true";
      img.src = FALLBACK_IMAGE;
      img.alt = "Abstract blue geometric blog cover";
    };
    img.addEventListener("error", fallback);
    if (img.complete && img.naturalWidth === 0) fallback();
  }
  function makeImage(src, alt) {
    const img = element("img");
    img.width = 1200;
    img.height = 800;
    img.loading = "lazy";
    img.alt = alt;
    img.addEventListener("error", () => {
      if (img.dataset.fallbackApplied) return;
      img.dataset.fallbackApplied = "true";
      img.src = FALLBACK_IMAGE;
      img.alt = "Abstract blue geometric blog cover";
    });
    img.src = src;
    return img;
  }
  function showMessage(target, text, isError = false) {
    target.textContent = text;
    target.classList.toggle("is-error", isError);
    target.hidden = false;
  }
  function initials(name) { return name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join("").toUpperCase(); }
  function loginLink(message) {
    const link = element("a", "text-button", "Login");
    link.href = "login.html";
    message.append(document.createTextNode(" "), link);
  }
  function applyApiErrors(form, error) {
    const names = { name: "full-name", email: "email", password: "password", title: "blog-title", category: "category", imageUrl: "image-url", content: "blog-content" };
    for (const [name, text] of Object.entries(error.fields || {})) {
      const field = document.getElementById(names[name]);
      if (field && form.contains(field)) fieldError(field, text);
    }
  }
  function initIdentity() {
    const current = API.session();
    const name = DEMO_MODE ? DEMO_WRITER : (current?.user.name || DEMO_WRITER);
    $$("[data-writer-name]").forEach(node => { node.textContent = name; });
    $$("[data-writer-initials]").forEach(node => { node.textContent = initials(name); });
    $$("[data-writer-role]").forEach(node => { node.textContent = DEMO_MODE ? "Demo writer" : "Writer"; });
    const heading = $("#dashboard-heading");
    if (heading) heading.textContent = `Welcome back, ${name}.`;
    if (DEMO_MODE) {
      $$("a[href='create-blog.html'], a[href='dashboard.html']").forEach(link => { link.href += "?demo=1"; });
      const note = $(".editor-aside .demo-note p");
      if (note) note.textContent = "Demo workspace: your changes stay in this browser tab. Login and open the regular editor to publish a saved blog.";
    }
    if (current) {
      const logout = element("button", "text-button", "Logout");
      logout.type = "button";
      logout.addEventListener("click", () => { API.logout(); window.location.assign("index.html"); });
      $("#primary-nav").append(logout);
    }
  }
  function openDialog(dialog) { dialog.showModal(); document.body.classList.add("dialog-open"); }

  function initNavigation() {
    const button = $(".menu-toggle");
    const nav = $("#primary-nav");
    if (!button || !nav) return;
    const setOpen = open => {
      button.setAttribute("aria-expanded", String(open));
      button.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
      nav.classList.toggle("is-open", open);
    };
    button.addEventListener("click", () => setOpen(button.getAttribute("aria-expanded") !== "true"));
    $$("a", nav).forEach(link => link.addEventListener("click", () => setOpen(false)));
    document.addEventListener("click", event => {
      if (!nav.contains(event.target) && !button.contains(event.target)) setOpen(false);
    });
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && nav.classList.contains("is-open")) { setOpen(false); button.focus(); }
    });
    const desktop = window.matchMedia("(min-width: 701px)");
    desktop.addEventListener("change", () => setOpen(false));
  }

  function initDialogs() {
    $$("dialog").forEach(dialog => {
      $$("[data-close-dialog], [data-cancel-confirm]", dialog).forEach(button => button.addEventListener("click", () => dialog.close()));
      dialog.addEventListener("close", () => document.body.classList.remove("dialog-open"));
      dialog.addEventListener("click", event => {
        if (event.target !== dialog) return;
        const bounds = dialog.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
      });
    });
  }

  function makeBlogCard(post) {
    const article = element("article", "blog-card");
    const cover = element("div", "card-image");
    cover.append(makeImage(post.imageUrl, post.imageAlt), element("span", "image-category", post.category));
    const content = element("div", "card-content");
    const meta = element("div", "post-meta");
    const time = element("time", "", formatDate(post.date));
    time.dateTime = post.date;
    const dot = element("span", "", "·");
    dot.setAttribute("aria-hidden", "true");
    meta.append(time, dot, element("span", "", `${post.readMinutes} min read`));
    const author = element("span", "author");
    author.append(element("span", "avatar avatar-small", initials(post.author)), document.createTextNode(post.author));
    const read = element("button", "read-more", "Read more ");
    read.type = "button";
    read.dataset.readPost = post.id;
    read.setAttribute("aria-label", `Read more: ${post.title}`);
    read.append(icon("chevron"));
    const bottom = element("div", "card-bottom");
    bottom.append(author, read);
    content.append(meta, element("h3", "", post.title), element("p", "", post.description), bottom);
    article.append(cover, content);
    return article;
  }

  async function initHome() {
    const grid = $("#blog-grid");
    if (!grid) return;
    const samples = DemoPosts.all().filter(post => post.status === "published");
    let published = samples;
    function render() {
      grid.replaceChildren(...published.map(makeBlogCard));
      if (published.length) return;
      const empty = element("div", "empty-state");
      empty.append(element("h3", "", "The next story could be yours."), element("p", "", "Create a blog to share your next idea."));
      const link = element("a", "button button-primary", "Open dashboard");
      link.href = "dashboard.html";
      empty.append(link);
      grid.append(empty);
    }
    render();
    const dialog = $("#reader-dialog");
    document.addEventListener("click", event => {
      const read = event.target.closest("[data-read-post]");
      if (!read) return;
      // The editor's pick remains readable even if a sample is deleted from the demo.
      const post = published.find(post => post.id === read.dataset.readPost) || SAMPLE_POSTS.find(post => post.id === read.dataset.readPost);
      if (!post) return;
      $("#reader-title").textContent = post.title;
      $("#reader-meta").textContent = `${post.category} · ${formatDate(post.date)} · ${post.readMinutes} min read · ${post.author}`;
      const image = $("#reader-image");
      delete image.dataset.fallbackApplied;
      image.alt = post.imageAlt;
      image.src = post.imageUrl;
      $("#reader-content").replaceChildren(...post.content.split(/\n\s*\n/).filter(Boolean).map(paragraph => element("p", "", paragraph)));
      openDialog(dialog);
    });
    try {
      published = [...await API.published(), ...samples];
      render();
    } catch (error) {
      const message = element("div", "form-message is-error", `${error.message} The original sample stories are still available.`);
      message.setAttribute("role", "status");
      grid.before(message);
    }
  }

  function fieldError(field, message) {
    const error = $(`#${field.id}-error`);
    if (error) error.textContent = message;
    if (message) field.setAttribute("aria-invalid", "true");
    else field.removeAttribute("aria-invalid");
    return !message;
  }
  function emailError(field) {
    const email = field.value.trim();
    if (!email) return "Enter your email address.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || field.validity.typeMismatch || email.length > 254) return "Enter a valid email address, such as you@example.com.";
    return "";
  }
  function validateForm(fields, validate) {
    let firstInvalid;
    fields.forEach(field => {
      if (!fieldError(field, validate(field)) && !firstInvalid) firstInvalid = field;
    });
    if (firstInvalid) firstInvalid.focus();
    return !firstInvalid;
  }
  function bindValidation(fields, validate, message) {
    fields.forEach(field => {
      field.addEventListener("blur", () => {
        if (field.value || field.hasAttribute("aria-invalid")) fieldError(field, validate(field));
      });
      field.addEventListener("input", () => {
        if (field.hasAttribute("aria-invalid")) fieldError(field, validate(field));
        message.hidden = true;
      });
    });
  }

  function initAccountForm(kind) {
    const form = $(`#${kind}-form`);
    if (!form) return;
    const message = $(`#${kind}-message`);
    const fields = $$("input", form);
    const password = $("#password", form);
    const confirm = $("#confirm-password", form);
    function validate(field) {
      switch (field.id) {
        case "email": return emailError(field);
        case "full-name": return field.value.trim() ? "" : "Enter your full name.";
        case "password":
          if (!field.value.trim()) return "Enter your password.";
          if (kind === "register" && field.value.length < 8) return "Use a password with at least 8 characters.";
          if (new TextEncoder().encode(field.value).length > 72) return "Password is too long. Use a shorter password.";
          return "";
        case "confirm-password":
          if (!field.value) return "Confirm your password.";
          return field.value === password.value ? "" : "Your passwords don't match. Try again.";
        default: return "";
      }
    }
    bindValidation(fields, validate, message);
    if (confirm) password.addEventListener("input", () => {
      if (confirm.value) fieldError(confirm, validate(confirm));
    });
    const submit = $("[type='submit']", form);
    let busy = false;
    form.addEventListener("submit", async event => {
      event.preventDefault();
      if (busy) return;
      if (!validateForm(fields, validate)) {
        showMessage(message, "Please check the highlighted fields and try again.", true);
        if (kind === "login") $("#login-dashboard-link").hidden = true;
        return;
      }
      busy = true;
      submit.disabled = true;
      const label = submit.textContent;
      submit.textContent = kind === "login" ? "Logging in…" : "Creating account…";
      try {
        const input = { email: $("#email", form).value.trim(), password: password.value };
        const result = kind === "login" ? await API.login(input) : await API.register({ ...input, name: $("#full-name", form).value.trim() });
        showMessage(message, kind === "login" ? `${result.message}. Open your dashboard below.` : `${result.message}. You can now login using the link below.`);
        if (kind === "login") $("#login-dashboard-link").hidden = false;
        password.value = "";
        password.type = "password";
        if (confirm) { confirm.value = ""; confirm.type = "password"; }
        $$(".password-toggle", form).forEach(toggle => {
          toggle.setAttribute("aria-pressed", "false");
          toggle.setAttribute("aria-label", "Show password");
        });
      } catch (error) {
        showMessage(message, error.message, true);
        applyApiErrors(form, error);
        if (kind === "login") $("#login-dashboard-link").hidden = true;
      } finally {
        busy = false;
        submit.disabled = false;
        submit.textContent = label;
        message.focus();
      }
    });
    form.querySelector("[type='submit']").disabled = false;
  }

  function initPasswordToggles() {
    $$(".password-toggle").forEach(button => button.addEventListener("click", () => {
      const input = document.getElementById(button.getAttribute("aria-controls"));
      const show = input.type === "password";
      input.type = show ? "text" : "password";
      button.setAttribute("aria-label", show ? "Hide password" : "Show password");
      button.setAttribute("aria-pressed", String(show));
    }));
  }

  async function initDashboard() {
    const list = $("#dashboard-posts");
    if (!list) return;
    const message = $("#dashboard-message");
    const dialog = $("#confirm-dialog");
    let pendingAction = null;
    let posts = DEMO_MODE ? DemoPosts.all() : [];
    $("#reset-demo").hidden = !DEMO_MODE;
    if (!DEMO_MODE) $(".workspace-notice p").textContent = "Your writing workspace. Published posts appear in the journal. Drafts stay in your dashboard.";
    async function refresh() {
      posts = DEMO_MODE ? DemoPosts.all() : await API.mine();
      render();
    }
    function render() {
      posts.sort((a, b) => b.date.localeCompare(a.date));
      $("#stat-total").textContent = posts.length;
      $("#stat-published").textContent = posts.filter(post => post.status === "published").length;
      $("#stat-drafts").textContent = posts.filter(post => post.status === "draft").length;
      $("#post-count").textContent = `${posts.length} ${posts.length === 1 ? "post" : "posts"}`;
      $("#dashboard-empty").hidden = posts.length !== 0;
      list.replaceChildren(...posts.map(post => {
        const row = element("article", "dashboard-row");
        const title = element("h3", "dashboard-post-title", post.title);
        title.append(element("span", "dashboard-post-subtitle", `${post.readMinutes} min read · By ${post.author}`));
        const date = element("time", "dashboard-date", formatDate(post.date));
        date.dateTime = post.date;
        const status = element("div", "dashboard-status");
        status.append(element("span", `status-badge${post.status === "draft" ? " status-draft" : ""}`, post.status === "draft" ? "Draft" : "Published"));
        const actions = element("div", "row-actions");
        const edit = element("a", "row-action");
        edit.href = `create-blog.html?edit=${encodeURIComponent(post.id)}${DEMO_MODE ? "&demo=1" : ""}`;
        edit.setAttribute("aria-label", `Edit ${post.title}`);
        edit.append(icon("edit"), document.createTextNode("Edit"));
        const remove = element("button", "row-action row-action-delete");
        remove.type = "button";
        remove.dataset.deletePost = post.id;
        remove.setAttribute("aria-label", `Delete ${post.title}`);
        remove.append(icon("delete"), document.createTextNode("Delete"));
        actions.append(edit, remove);
        row.append(title, element("span", "dashboard-category", post.category), date, status, actions);
        return row;
      }));
    }
    function askConfirmation(title, description, label, action) {
      $("#confirm-title").textContent = title;
      $("#confirm-description").textContent = description;
      $("#confirm-action").textContent = label;
      pendingAction = action;
      openDialog(dialog);
      $("[data-cancel-confirm]", dialog).focus();
    }
    list.addEventListener("click", event => {
      const button = event.target.closest("[data-delete-post]");
      if (!button) return;
      const post = posts.find(post => post.id === button.dataset.deletePost);
      if (!post) return;
      askConfirmation("Delete this story?", DEMO_MODE ? `“${post.title}” will be removed from this tab's demo posts. Reset demo posts restores the original samples.` : `“${post.title}” will be permanently removed from your saved posts.`, "Delete story", async () => {
        if (DEMO_MODE) DemoPosts.remove(post.id);
        else await API.remove(post.id);
        await refresh();
        showMessage(message, `“${post.title}” was deleted${DEMO_MODE ? " from the demo" : ""}.`);
        message.focus();
      });
    });
    $("#reset-demo").addEventListener("click", () => askConfirmation("Start fresh?", "Your demo changes will be replaced by the four original sample posts in this browser tab.", "Reset posts", async () => {
      DemoPosts.reset();
      await refresh();
      showMessage(message, "The original demo posts have been restored.");
      message.focus();
    }));
    $("#confirm-action").addEventListener("click", async () => {
      const action = pendingAction;
      pendingAction = null;
      dialog.close();
      if (!action) return;
      list.inert = true;
      try { await action(); }
      catch (error) { showMessage(message, error.message, true); message.focus(); }
      finally { list.inert = false; }
    });
    dialog.addEventListener("close", () => { pendingAction = null; });
    render();
    try {
      await refresh();
      if (DEMO_MODE && !DemoPosts.available()) showMessage(message, "Browser storage is unavailable. Demo changes may not carry between pages.", true);
    } catch (error) {
      showMessage(message, error.message, true);
      loginLink(message);
    }
  }

  async function initEditor() {
    const form = $("#blog-form");
    if (!form) return;
    const message = $("#blog-message");
    const fields = $$("input, select, textarea", form);
    const title = $("#blog-title");
    const category = $("#category");
    const image = $("#image-url");
    const content = $("#blog-content");
    const submit = $("#publish-button");
    const submitLabel = $("span", submit);
    let editingId = new URLSearchParams(window.location.search).get("edit");
    let submitted = false;
    let busy = false;
    const updateWords = () => {
      const count = wordCount(content.value);
      $("#word-count").textContent = `${count} ${count === 1 ? "word" : "words"}`;
    };
    function validate(field) {
      if (!field.value.trim()) {
        return { "blog-title": "Give your blog a title.", category: "Choose a category.", "image-url": "Add a cover image URL or use a bundled image.", "blog-content": "Write some content for your blog." }[field.id];
      }
      if (field === category && !CATEGORIES.includes(field.value)) return "Choose one of the listed categories.";
      if (field === image && !validImageUrl(field.value.trim())) return "Use a valid HTTP/HTTPS image URL or a bundled image path, such as images/code-workspace.jpg.";
      if (field === title && field.value.trim().length > 120) return "Keep your title within 120 characters.";
      return "";
    }
    if (editingId) {
      let post;
      try { post = DEMO_MODE ? DemoPosts.find(editingId) : await API.find(editingId); }
      catch (error) {
        showMessage(message, error.message, true);
        if (!API.session()) loginLink(message);
        return;
      }
      if (post) {
        document.title = "Edit Blog — Codomax Journal";
        $("#editor-heading").textContent = "Make your story even better.";
        $("#editor-subtitle").textContent = "A fresh look at an idea you've already started.";
        title.value = post.title;
        category.value = post.category;
        image.value = post.imageUrl;
        content.value = post.content;
        submitLabel.textContent = post.status === "draft" ? "Publish blog" : "Save changes";
      } else {
        showMessage(message, "That post could not be found. You can create a new blog instead.", true);
        editingId = null;
      }
    }
    updateWords();
    content.addEventListener("input", updateWords);
    bindValidation(fields, validate, message);
    fields.forEach(field => field.addEventListener("input", () => {
      if (submitted) {
        submit.disabled = false;
        submitLabel.textContent = "Save changes";
        submitted = false;
      }
    }));
    if (!DEMO_MODE && !API.session()) {
      showMessage(message, "Please login before publishing a saved blog.");
      loginLink(message);
    }
    form.addEventListener("submit", async event => {
      event.preventDefault();
      if (submitted || busy) return;
      if (!validateForm(fields, validate)) {
        showMessage(message, "Please complete the highlighted fields before publishing.", true);
        return;
      }
      const body = content.value.trim();
      const changes = {
        title: title.value.trim(), category: category.value, imageUrl: image.value.trim(),
        imageAlt: `Cover image for ${title.value.trim()}`, content: body,
        description: body.replace(/\s+/g, " ").slice(0, 145) + (body.replace(/\s+/g, " ").length > 145 ? "…" : ""),
        status: "published", readMinutes: readMinutes(body)
      };
      const wasEditing = Boolean(editingId);
      busy = true;
      submit.disabled = true;
      submitLabel.textContent = "Saving…";
      try {
        if (DEMO_MODE) {
          let saved;
          if (editingId) saved = DemoPosts.update(editingId, changes);
          else {
            editingId = `post-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
            saved = DemoPosts.create({ ...changes, id: editingId, date: today(), author: DEMO_WRITER });
          }
          if (!saved) throw new Error("Browser storage is unavailable, so this demo won't carry over to the dashboard.");
          showMessage(message, wasEditing ? "Your changes were saved to the demo!" : "Blog published successfully in the demo! Changes stay in this browser tab only.");
        } else {
          const input = { ...changes, author: API.session()?.user.name };
          const result = editingId ? await API.update(editingId, input) : await API.create(input);
          editingId = result.blog.id;
          showMessage(message, result.message);
        }
        try { history.replaceState(null, "", `create-blog.html?edit=${encodeURIComponent(editingId)}${DEMO_MODE ? "&demo=1" : ""}`); } catch { /* Local files may restrict history updates. */ }
        $("#blog-dashboard-link").hidden = false;
        submitted = true;
        submitLabel.textContent = "Saved";
      } catch (error) {
        showMessage(message, error.message, true);
        applyApiErrors(form, error);
        if (!DEMO_MODE && !API.session()) loginLink(message);
        submitLabel.textContent = wasEditing ? "Save changes" : "Publish blog";
      } finally {
        busy = false;
        submit.disabled = submitted;
        message.focus();
      }
    });
    submit.disabled = false;
  }

  // defer ensures the HTML is ready before any initializer runs.
  initNavigation();
  initDialogs();
  initIdentity();
  initPasswordToggles();
  $$("img").forEach(watchImage);
  $$("[data-year]").forEach(node => { node.textContent = new Date().getFullYear(); });
  initHome();
  initAccountForm("login");
  initAccountForm("register");
  initDashboard();
  initEditor();
})();
