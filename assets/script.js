// ============================================================
// DOMPETLINK — PABWE P3
// Fokus: DOM, Event, Validasi, Logika Aplikasi, localStorage
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  // ==========================================================
  // 0. IKON (SVG inline — tidak bergantung pada font/CDN eksternal)
  // ==========================================================

  const ICONS = {
    edit: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" aria-hidden="true" focusable="false"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" /><path d="m15 5 4 4" /></svg>',
    trash: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" aria-hidden="true" focusable="false"><path d="M10 11v6" /><path d="M14 11v6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>',
    externalLink: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" aria-hidden="true" focusable="false"><path d="M15 3h6v6" /><path d="M10 14 21 3" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></svg>'
  };

  // ==========================================================
  // 1. KONSTANTA & STATE
  // ==========================================================

  const STORAGE_KEYS = {
    expenses: "dompetlink_expenses_v1",
    bookmarks: "dompetlink_bookmarks_v1",
    highScore: "dompetlink_quiz_high_score_v1",
    activeTab: "dompetlink_active_tab_v1"
  };

  const state = {
    expenses: loadData(STORAGE_KEYS.expenses, []),
    bookmarks: loadData(STORAGE_KEYS.bookmarks, []),
    currentTab: getInitialTab(),
    editingType: null,
    quiz: {
      currentIndex: 0,
      score: 0,
      answered: false
    }
  };

  // Array of object untuk data soal quiz.
  const quizQuestions = [
    {
      question: "Method DOM yang umum digunakan untuk memilih satu elemen berdasarkan selector adalah...",
      options: ["querySelector()", "push()", "JSON.parse()", "sort()"],
      answer: "querySelector()"
    },
    {
      question: "Event yang tepat untuk menangani pengiriman form adalah...",
      options: ["hover", "submit", "scroll", "load"],
      answer: "submit"
    },
    {
      question: "Apa fungsi JSON.stringify()?",
      options: [
        "Mengubah object menjadi string JSON",
        "Menghapus object",
        "Mengurutkan array",
        "Mengambil elemen HTML"
      ],
      answer: "Mengubah object menjadi string JSON"
    },
    {
      question: "Method array untuk mengambil data yang memenuhi kondisi tertentu adalah...",
      options: ["filter()", "push()", "findIndex()", "forEach()"],
      answer: "filter()"
    },
    {
      question: "API browser yang digunakan untuk menyimpan data sederhana secara lokal adalah...",
      options: ["localStorage", "fetchAPI", "sessionHTML", "DOMStorageOnly"],
      answer: "localStorage"
    }
  ];

  // ==========================================================
  // 2. SELEKTOR DOM
  // ==========================================================

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => document.querySelectorAll(selector);

  // Tab
  const tabButtons = $$(".tab-button");
  const panels = {
    expense: $("#expense-panel"),
    bookmark: $("#bookmark-panel"),
    quiz: $("#quiz-panel")
  };

  // Expense
  const expenseList = $("#expense-list");
  const expenseEmpty = $("#expense-empty");
  const incomeTotal = $("#income-total");
  const expenseTotal = $("#expense-total");
  const balanceTotal = $("#balance-total");
  const expenseSearch = $("#expense-search");
  const expenseTypeFilter = $("#expense-type-filter");
  const expenseCategoryFilter = $("#expense-category-filter");
  const expenseSort = $("#expense-sort");

  // Bookmark
  const bookmarkList = $("#bookmark-list");
  const bookmarkEmpty = $("#bookmark-empty");
  const bookmarkSearch = $("#bookmark-search");
  const bookmarkSort = $("#bookmark-sort");

  // Modal
  const modal = $("#modal");
  const modalTitle = $("#modal-title");
  const expenseForm = $("#expense-form");
  const bookmarkForm = $("#bookmark-form");
  const expenseFormError = $("#expense-form-error");
  const bookmarkFormError = $("#bookmark-form-error");
  let lastFocusedBeforeModal = null;

  // Field form Expense (di-cache sekali, dipakai berulang saat isi/baca form)
  const expenseFields = {
    id: $("#expense-id"),
    title: $("#expense-title-input"),
    category: $("#expense-category-input"),
    amount: $("#expense-amount-input"),
    type: $("#expense-type-input"),
    date: $("#expense-date-input")
  };

  // Field form Bookmark (di-cache sekali, dipakai berulang saat isi/baca form)
  const bookmarkFields = {
    id: $("#bookmark-id"),
    title: $("#bookmark-title-input"),
    url: $("#bookmark-url-input"),
    category: $("#bookmark-category-input"),
    note: $("#bookmark-note-input")
  };

  // Modal konfirmasi hapus (dipakai bersama oleh Expense & Bookmark)
  const confirmModal = $("#confirm-modal");
  const confirmModalMessage = $("#confirm-modal-message");
  const confirmModalCancel = $("#confirm-modal-cancel");
  const confirmModalConfirm = $("#confirm-modal-confirm");
  let pendingDeleteAction = null;

  // Quiz
  const quizStart = $("#quiz-start");
  const quizQuestion = $("#quiz-question");
  const quizResult = $("#quiz-result");
  const startHighScore = $("#start-high-score");
  const questionText = $("#question-text");
  const answerList = $("#answer-list");
  const quizFeedback = $("#quiz-feedback");
  const nextQuestionBtn = $("#next-question-btn");
  const quizCounter = $("#quiz-counter");
  const quizScore = $("#quiz-score");
  const quizProgress = $("#quiz-progress");
  const finalScore = $("#final-score");
  const finalMessage = $("#final-message");
  const finalHighScore = $("#final-high-score");

  // ==========================================================
  // 3. UTILITAS
  // ==========================================================

  function loadData(key, fallback) {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : fallback;
    } catch (error) {
      console.error("Gagal membaca localStorage:", error);
      return fallback;
    }
  }

  function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  function createId(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(value);
  }

  function escapeHTML(value) {
    const div = document.createElement("div");
    div.textContent = String(value ?? "");
    return div.innerHTML;
  }

  let toastTimeoutId = null;

  function showToast(message, type = "success") {
    const toast = $("#toast");

    // Batalkan timer toast sebelumnya (kalau ada) supaya toast baru tidak
    // ikut disembunyikan lebih cepat oleh timer toast yang lama.
    clearTimeout(toastTimeoutId);

    toast.textContent = message;
    toast.className =
      "fixed bottom-5 right-5 z-[60] max-w-sm rounded-xl border px-4 py-3 text-sm shadow-2xl " +
      (type === "error"
        ? "border-rose-400/20 bg-rose-500/10 text-rose-200"
        : "border-emerald-400/20 bg-emerald-500/10 text-emerald-200");
    toast.classList.remove("hidden");

    toastTimeoutId = setTimeout(() => {
      toast.classList.add("hidden");
    }, 2500);
  }

  // ==========================================================
  // 4. TAB + QUERY STRING
  // ==========================================================

  function getInitialTab() {
    const validTabs = ["expense", "bookmark", "quiz"];

    // URL query string (?tab=...) tetap didukung untuk deep-link,
    // tapi sumber utama "tab terakhir dibuka" adalah localStorage.
    const params = new URLSearchParams(window.location.search);
    const fromURL = params.get("tab");
    if (validTabs.includes(fromURL)) return fromURL;

    const fromStorage = localStorage.getItem(STORAGE_KEYS.activeTab);
    if (validTabs.includes(fromStorage)) return fromStorage;

    return "expense";
  }

  function setActiveTab(tab, updateURL = true) {
    if (!panels[tab]) tab = "expense";

    state.currentTab = tab;

    tabButtons.forEach((button) => {
      const active = button.dataset.tab === tab;

      button.classList.toggle("bg-violet-600", active);
      button.classList.toggle("text-white", active);
      button.classList.toggle("text-slate-400", !active);
      button.classList.toggle("hover:bg-slate-800", !active);
      button.setAttribute("aria-selected", String(active));
    });

    Object.entries(panels).forEach(([name, panel]) => {
      panel.hidden = name !== tab;
    });

    // Wajib rubrik: tab terakhir disimpan ke localStorage agar
    // pulih otomatis saat halaman di-refresh.
    localStorage.setItem(STORAGE_KEYS.activeTab, tab);

    if (updateURL) {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", tab);
      history.replaceState(null, "", url);
    }
  }

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setActiveTab(button.dataset.tab);
    });
  });

  // ==========================================================
  // 5. EXPENSE TRACKER
  // ==========================================================

  function updateExpenseCategories() {
    const current = expenseCategoryFilter.value;

    const categories = [...new Set(
      state.expenses
        .map((item) => item.category.trim())
        .filter(Boolean)
    )].sort((a, b) => a.localeCompare(b, "id"));

    expenseCategoryFilter.innerHTML = '<option value="all">Semua kategori</option>';

    categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category;
      expenseCategoryFilter.appendChild(option);
    });

    expenseCategoryFilter.value =
      categories.includes(current) ? current : "all";
  }

  function getFilteredExpenses() {
    const keyword = expenseSearch.value.trim().toLowerCase();
    const type = expenseTypeFilter.value;
    const category = expenseCategoryFilter.value;
    const sort = expenseSort.value;

    const result = state.expenses.filter((item) => {
      const matchesKeyword =
        !keyword ||
        item.title.toLowerCase().includes(keyword) ||
        item.category.toLowerCase().includes(keyword);

      const matchesType = type === "all" || item.type === type;
      const matchesCategory =
        category === "all" || item.category === category;

      return matchesKeyword && matchesType && matchesCategory;
    });

    result.sort((a, b) => {
      if (sort === "oldest") return a.date.localeCompare(b.date);
      if (sort === "amount-high") return b.amount - a.amount;
      if (sort === "amount-low") return a.amount - b.amount;
      if (sort === "title-az") return a.title.localeCompare(b.title, "id");
      return b.date.localeCompare(a.date);
    });

    return result;
  }

  function renderExpenseSummary() {
    const income = state.expenses
      .filter((item) => item.type === "Pemasukan")
      .reduce((total, item) => total + item.amount, 0);

    const expense = state.expenses
      .filter((item) => item.type === "Pengeluaran")
      .reduce((total, item) => total + item.amount, 0);

    incomeTotal.textContent = formatCurrency(income);
    expenseTotal.textContent = formatCurrency(expense);
    balanceTotal.textContent = formatCurrency(income - expense);
  }

  function renderExpenses() {
    updateExpenseCategories();

    const filtered = getFilteredExpenses();
    expenseList.innerHTML = "";

    expenseEmpty.classList.toggle("hidden", filtered.length !== 0);

    filtered.forEach((item) => {
      const row = document.createElement("tr");
      row.className = "border-b border-white/5 hover:bg-white/[0.02]";

      const amountClass =
        item.type === "Pemasukan" ? "text-emerald-400" : "text-rose-400";

      row.innerHTML = `
        <td class="px-5 py-4 text-slate-400">${escapeHTML(item.date)}</td>
        <td class="px-5 py-4 font-semibold">${escapeHTML(item.title)}</td>
        <td class="px-5 py-4 text-slate-400">${escapeHTML(item.category)}</td>
        <td class="px-5 py-4">
          <span class="rounded-full px-2.5 py-1 text-xs font-semibold ${
            item.type === "Pemasukan"
              ? "bg-emerald-500/10 text-emerald-300"
              : "bg-rose-500/10 text-rose-300"
          }">${escapeHTML(item.type)}</span>
        </td>
        <td class="px-5 py-4 text-right font-semibold ${amountClass}">
          ${item.type === "Pemasukan" ? "+" : "-"} ${formatCurrency(item.amount)}
        </td>
        <td class="px-5 py-4">
          <div class="flex justify-end gap-2">
            <button data-action="edit-expense" data-id="${item.id}"
              class="rounded-lg p-2.5 text-slate-400 hover:bg-white/5 hover:text-white"
              title="Ubah" aria-label="Ubah transaksi ${escapeHTML(item.title)}">
              ${ICONS.edit}
            </button>
            <button data-action="delete-expense" data-id="${item.id}"
              class="rounded-lg p-2.5 text-rose-400 hover:bg-rose-500/10"
              title="Hapus" aria-label="Hapus transaksi ${escapeHTML(item.title)}">
              ${ICONS.trash}
            </button>
          </div>
        </td>
      `;

      expenseList.appendChild(row);
    });

    renderExpenseSummary();
  }

  // Helper generik: tampilkan modal untuk form tertentu, sembunyikan yang
  // lain, simpan elemen fokus sebelumnya, lalu pindahkan fokus ke form.
  // Dipakai bersama oleh openExpenseModal & openBookmarkModal supaya tidak
  // ada kode "tampilkan/sembunyikan modal" yang diduplikasi dua kali.
  function showModalForm(activeForm, focusField) {
    expenseForm.hidden = activeForm !== expenseForm;
    bookmarkForm.hidden = activeForm !== bookmarkForm;
    lastFocusedBeforeModal = document.activeElement;
    modal.hidden = false;
    focusField.focus();
  }

  function openExpenseModal(id = null) {
    state.editingType = "expense";
    expenseForm.reset();
    expenseFormError.classList.add("hidden");

    if (id) {
      const item = state.expenses.find((expense) => expense.id === id);
      if (!item) return;

      modalTitle.textContent = "Ubah Transaksi";
      expenseFields.id.value = item.id;
      expenseFields.title.value = item.title;
      expenseFields.category.value = item.category;
      expenseFields.amount.value = item.amount;
      expenseFields.type.value = item.type;
      expenseFields.date.value = item.date;
    } else {
      modalTitle.textContent = "Tambah Transaksi";
      expenseFields.id.value = "";
      expenseFields.date.value = new Date().toISOString().slice(0, 10);
    }

    showModalForm(expenseForm, expenseFields.title);
  }

  function deleteExpense(id) {
    const item = state.expenses.find((expense) => expense.id === id);
    if (!item) return;

    openConfirmModal(`Hapus transaksi "${item.title}"? Tindakan ini tidak bisa dibatalkan.`, () => {
      state.expenses = state.expenses.filter((expense) => expense.id !== id);
      saveData(STORAGE_KEYS.expenses, state.expenses);
      renderExpenses();
      showToast("Transaksi berhasil dihapus.");
    });
  }

  expenseForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const title = expenseFields.title.value.trim();
    const category = expenseFields.category.value.trim();
    const amount = Number(expenseFields.amount.value);
    const type = expenseFields.type.value;
    const date = expenseFields.date.value;
    const id = expenseFields.id.value;

    if (!title || !category || !date) {
      expenseFormError.textContent = "Semua field wajib harus diisi.";
      expenseFormError.classList.remove("hidden");
      return;
    }

    if (!isValidCategory(category)) {
      expenseFormError.textContent =
        "Kategori 1-40 karakter, hanya huruf, angka, spasi, dan tanda baca umum ( . , & / ( ) ' - ).";
      expenseFormError.classList.remove("hidden");
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      expenseFormError.textContent = "Jumlah harus berupa angka lebih dari 0.";
      expenseFormError.classList.remove("hidden");
      return;
    }

    const data = {
      id: id || createId("expense"),
      title,
      category,
      amount,
      type,
      date
    };

    if (id) {
      const index = state.expenses.findIndex((item) => item.id === id);
      if (index !== -1) state.expenses[index] = data;
      showToast("Transaksi berhasil diubah.");
    } else {
      state.expenses.push(data);
      showToast("Transaksi berhasil ditambahkan.");
    }

    saveData(STORAGE_KEYS.expenses, state.expenses);
    closeModal();
    renderExpenses();
  });

  $("#add-expense-btn").addEventListener("click", () => openExpenseModal());

  [expenseSearch, expenseTypeFilter, expenseCategoryFilter, expenseSort]
    .forEach((element) => {
      element.addEventListener(
        element.tagName === "SELECT" ? "change" : "input",
        renderExpenses
      );
    });

  expenseList.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;

    const { action, id } = button.dataset;

    if (action === "edit-expense") openExpenseModal(id);
    if (action === "delete-expense") deleteExpense(id);
  });

  // ==========================================================
  // 6. BOOKMARK MANAGER
  // ==========================================================

  function getFilteredBookmarks() {
    const keyword = bookmarkSearch.value.trim().toLowerCase();
    const sort = bookmarkSort.value;

    const result = state.bookmarks.filter((item) => {
      return (
        !keyword ||
        item.title.toLowerCase().includes(keyword) ||
        item.url.toLowerCase().includes(keyword) ||
        item.category.toLowerCase().includes(keyword) ||
        item.note.toLowerCase().includes(keyword)
      );
    });

    result.sort((a, b) => {
      if (sort === "oldest") return a.createdAt - b.createdAt;
      if (sort === "title-az") return a.title.localeCompare(b.title, "id");
      if (sort === "title-za") return b.title.localeCompare(a.title, "id");
      return b.createdAt - a.createdAt;
    });

    return result;
  }

  function renderBookmarks() {
    const filtered = getFilteredBookmarks();
    bookmarkList.innerHTML = "";

    bookmarkEmpty.classList.toggle("hidden", filtered.length !== 0);

    filtered.forEach((item) => {
      const card = document.createElement("article");
      card.className =
        "rounded-2xl border border-white/10 bg-slate-900 p-5 transition hover:-translate-y-0.5 hover:border-violet-400/30";

      card.innerHTML = `
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <span class="rounded-full bg-violet-500/10 px-2.5 py-1 text-xs font-semibold text-violet-300">
              ${escapeHTML(item.category)}
            </span>
            <h3 class="mt-4 truncate text-lg font-bold">${escapeHTML(item.title)}</h3>
          </div>
          <div class="flex shrink-0 gap-1">
            <button data-action="edit-bookmark" data-id="${item.id}"
              class="rounded-lg p-2.5 text-slate-400 hover:bg-white/5 hover:text-white"
              title="Ubah" aria-label="Ubah bookmark ${escapeHTML(item.title)}">
              ${ICONS.edit}
            </button>
            <button data-action="delete-bookmark" data-id="${item.id}"
              class="rounded-lg p-2.5 text-rose-400 hover:bg-rose-500/10"
              title="Hapus" aria-label="Hapus bookmark ${escapeHTML(item.title)}">
              ${ICONS.trash}
            </button>
          </div>
        </div>
        <p class="mt-3 break-all text-xs text-slate-400">${escapeHTML(item.url)}</p>
        ${
          item.note
            ? `<p class="mt-3 text-sm leading-relaxed text-slate-400">${escapeHTML(item.note)}</p>`
            : ""
        }
        <a href="${escapeHTML(item.url)}" target="_blank" rel="noopener noreferrer"
          class="mt-5 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold hover:bg-violet-500">
          Buka ${escapeHTML(item.title)} di tab baru ${ICONS.externalLink}
        </a>
      `;

      bookmarkList.appendChild(card);
    });
  }

  function openBookmarkModal(id = null) {
    state.editingType = "bookmark";
    bookmarkForm.reset();
    bookmarkFormError.classList.add("hidden");

    if (id) {
      const item = state.bookmarks.find((bookmark) => bookmark.id === id);
      if (!item) return;

      modalTitle.textContent = "Ubah Bookmark";
      bookmarkFields.id.value = item.id;
      bookmarkFields.title.value = item.title;
      bookmarkFields.url.value = item.url;
      bookmarkFields.category.value = item.category;
      bookmarkFields.note.value = item.note;
    } else {
      modalTitle.textContent = "Tambah Bookmark";
      bookmarkFields.id.value = "";
    }

    showModalForm(bookmarkForm, bookmarkFields.title);
  }

  function isValidHTTPURL(value) {
    try {
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  }

  // Dipakai bersama oleh form Expense & Bookmark: kategori 1-40 karakter,
  // hanya huruf (termasuk non-Latin), angka, spasi, dan tanda baca umum.
  function isValidCategory(value) {
    return /^[\p{L}\p{N} .,&/()'-]{1,40}$/u.test(value);
  }

  function deleteBookmark(id) {
    const item = state.bookmarks.find((bookmark) => bookmark.id === id);
    if (!item) return;

    openConfirmModal(`Hapus bookmark "${item.title}"? Tindakan ini tidak bisa dibatalkan.`, () => {
      state.bookmarks = state.bookmarks.filter((bookmark) => bookmark.id !== id);
      saveData(STORAGE_KEYS.bookmarks, state.bookmarks);
      renderBookmarks();
      showToast("Bookmark berhasil dihapus.");
    });
  }

  bookmarkForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const title = bookmarkFields.title.value.trim();
    const url = bookmarkFields.url.value.trim();
    const category = bookmarkFields.category.value.trim();
    const note = bookmarkFields.note.value.trim();
    const id = bookmarkFields.id.value;

    if (!title || !url || !category) {
      bookmarkFormError.textContent = "Judul, URL, dan kategori wajib diisi.";
      bookmarkFormError.classList.remove("hidden");
      return;
    }

    if (!isValidCategory(category)) {
      bookmarkFormError.textContent =
        "Kategori 1-40 karakter, hanya huruf, angka, spasi, dan tanda baca umum ( . , & / ( ) ' - ).";
      bookmarkFormError.classList.remove("hidden");
      return;
    }

    if (!isValidHTTPURL(url)) {
      bookmarkFormError.textContent =
        "URL harus menggunakan http:// atau https://.";
      bookmarkFormError.classList.remove("hidden");
      return;
    }

    const data = {
      id: id || createId("bookmark"),
      title,
      url,
      category,
      note,
      createdAt: id
        ? (state.bookmarks.find((item) => item.id === id)?.createdAt || Date.now())
        : Date.now()
    };

    if (id) {
      const index = state.bookmarks.findIndex((item) => item.id === id);
      if (index !== -1) state.bookmarks[index] = data;
      showToast("Bookmark berhasil diubah.");
    } else {
      state.bookmarks.push(data);
      showToast("Bookmark berhasil ditambahkan.");
    }

    saveData(STORAGE_KEYS.bookmarks, state.bookmarks);
    closeModal();
    renderBookmarks();
  });

  $("#add-bookmark-btn").addEventListener("click", () => openBookmarkModal());

  bookmarkSearch.addEventListener("input", renderBookmarks);
  bookmarkSort.addEventListener("change", renderBookmarks);

  bookmarkList.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;

    const { action, id } = button.dataset;

    if (action === "edit-bookmark") openBookmarkModal(id);
    if (action === "delete-bookmark") deleteBookmark(id);
  });

  // ==========================================================
  // 7. MODAL
  // ==========================================================

  function closeModal() {
    modal.hidden = true;
    expenseForm.hidden = true;
    bookmarkForm.hidden = true;
    state.editingType = null;

    if (lastFocusedBeforeModal && typeof lastFocusedBeforeModal.focus === "function") {
      lastFocusedBeforeModal.focus();
    }
    lastFocusedBeforeModal = null;
  }

  $("#close-modal-btn").addEventListener("click", closeModal);

  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });

  // -------- Modal konfirmasi hapus (pengganti window.confirm) --------

  function openConfirmModal(message, onConfirm) {
    pendingDeleteAction = onConfirm;
    confirmModalMessage.textContent = message;
    lastFocusedBeforeModal = document.activeElement;
    confirmModal.hidden = false;
    confirmModalCancel.focus();
  }

  function closeConfirmModal() {
    confirmModal.hidden = true;
    pendingDeleteAction = null;

    if (lastFocusedBeforeModal && typeof lastFocusedBeforeModal.focus === "function") {
      lastFocusedBeforeModal.focus();
    }
    lastFocusedBeforeModal = null;
  }

  confirmModalCancel.addEventListener("click", closeConfirmModal);

  confirmModalConfirm.addEventListener("click", () => {
    const action = pendingDeleteAction;
    closeConfirmModal();
    if (typeof action === "function") action();
  });

  confirmModal.addEventListener("click", (event) => {
    if (event.target === confirmModal) closeConfirmModal();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !confirmModal.hidden) {
      closeConfirmModal();
      return;
    }

    if (modal.hidden) return;

    if (event.key === "Escape") {
      closeModal();
      return;
    }

    if (event.key === "Tab") {
      const focusable = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const visible = Array.from(focusable).filter(
        (element) => element.offsetParent !== null
      );
      if (visible.length === 0) return;

      const first = visible[0];
      const last = visible[visible.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  // ==========================================================
  // 8. QUIZ APP
  // ==========================================================

  function getHighScore() {
    return Number(localStorage.getItem(STORAGE_KEYS.highScore)) || 0;
  }

  function updateHighScoreDisplay() {
    const highScore = getHighScore();
    startHighScore.textContent = highScore;
    finalHighScore.textContent = highScore;
  }

  function startQuiz() {
    state.quiz.currentIndex = 0;
    state.quiz.score = 0;
    state.quiz.answered = false;

    quizStart.classList.add("hidden");
    quizResult.classList.add("hidden");
    quizQuestion.classList.remove("hidden");

    renderQuestion();
  }

  function renderQuestion() {
    const quiz = quizQuestions[state.quiz.currentIndex];
    const number = state.quiz.currentIndex + 1;
    const total = quizQuestions.length;

    state.quiz.answered = false;

    quizCounter.textContent = `Soal ${number}/${total}`;
    quizScore.textContent = `Skor: ${state.quiz.score}`;
    quizProgress.style.width = `${(number / total) * 100}%`;
    questionText.textContent = quiz.question;

    answerList.innerHTML = "";
    quizFeedback.classList.add("hidden");
    nextQuestionBtn.classList.add("hidden");

    quiz.options.forEach((option) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = option;
      button.dataset.answer = option;
      button.className =
        "w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-4 text-left text-sm font-medium transition hover:border-violet-400/50 hover:bg-violet-500/10";

      answerList.appendChild(button);
    });
  }

  function answerQuestion(selectedAnswer) {
    if (state.quiz.answered) return;

    state.quiz.answered = true;

    const quiz = quizQuestions[state.quiz.currentIndex];
    const buttons = answerList.querySelectorAll("button");

    buttons.forEach((button) => {
      button.disabled = true;

      if (button.dataset.answer === quiz.answer) {
        button.classList.add(
          "border-emerald-400/40",
          "bg-emerald-500/10",
          "text-emerald-300"
        );
      }

      if (
        button.dataset.answer === selectedAnswer &&
        selectedAnswer !== quiz.answer
      ) {
        button.classList.add(
          "border-rose-400/40",
          "bg-rose-500/10",
          "text-rose-300"
        );
      }
    });

    const correct = selectedAnswer === quiz.answer;

    if (correct) {
      state.quiz.score += 1;
      quizFeedback.textContent = "Benar! Jawaban kamu tepat.";
      quizFeedback.className =
        "mt-5 rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-300";
    } else {
      quizFeedback.textContent = `Belum tepat. Jawaban yang benar: ${quiz.answer}`;
      quizFeedback.className =
        "mt-5 rounded-xl border border-rose-400/20 bg-rose-500/10 p-4 text-sm text-rose-300";
    }

    quizScore.textContent = `Skor: ${state.quiz.score}`;
    nextQuestionBtn.textContent =
      state.quiz.currentIndex === quizQuestions.length - 1
        ? "Lihat Hasil"
        : "Soal Berikutnya";

    nextQuestionBtn.classList.remove("hidden");
  }

  function finishQuiz() {
    const oldHighScore = getHighScore();

    if (state.quiz.score > oldHighScore) {
      localStorage.setItem(
        STORAGE_KEYS.highScore,
        String(state.quiz.score)
      );
    }

    quizQuestion.classList.add("hidden");
    quizResult.classList.remove("hidden");

    finalScore.textContent = `${state.quiz.score}/${quizQuestions.length}`;

    if (state.quiz.score === quizQuestions.length) {
      finalMessage.textContent = "Sempurna! Semua jawaban benar.";
    } else if (state.quiz.score >= 3) {
      finalMessage.textContent = "Bagus! Tinggal tingkatkan sedikit lagi.";
    } else {
      finalMessage.textContent = "Tetap semangat. Coba lagi untuk meningkatkan skor.";
    }

    updateHighScoreDisplay();
  }

  answerList.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-answer]");
    if (!button) return;

    answerQuestion(button.dataset.answer);
  });

  nextQuestionBtn.addEventListener("click", () => {
    if (state.quiz.currentIndex === quizQuestions.length - 1) {
      finishQuiz();
      return;
    }

    state.quiz.currentIndex += 1;
    renderQuestion();
  });

  $("#start-quiz-btn").addEventListener("click", startQuiz);
  $("#restart-quiz-btn").addEventListener("click", startQuiz);

  // ==========================================================
  // 9. INISIALISASI
  // ==========================================================

  renderExpenses();
  renderBookmarks();
  updateHighScoreDisplay();
  setActiveTab(state.currentTab, false);
});
