/* ===========================================================
   script.js — полный рабочий скрипт для index.html
   Реализует:
   - регистрация (учитель -> заявка админу; ученик сразу),
   - вход/выход, отображение ФИО вместо кнопок,
   - админ: просмотр заявок, принять/отклонить,
   - карточки учителей (фото, сводка), редактирование / загрузка фото админом,
   - Вопрос-Ответ (публикация вопросов, ответы от учителя/админа),
   - переводчик (локальная заглушка + пример POST /api/translate),
   - тема (светлая/тёмная),
   - синхронизация между вкладками через localStorage,
   - сохранение/загрузка данных.
   =========================================================== */

(function () {
  'use strict';

  // ---------- Ключи localStorage ----------
  const LS_KEYS = {
    DATA: 'school_portal_data_v1',
    USERS: 'school_portal_users_v1',
    REQS: 'school_portal_teacher_requests_v1',
    CUR_USER: 'school_portal_current_user_v1',
    THEME: 'school_portal_theme_v1'
  };

  // ---------- Начальные данные (если localStorage пуст) ----------
  const initialData = {
    teachers: [
      { id: 1, name: "Ли Хуа", subject: "Китайский язык", experience: "10 лет", photo: "" },
      { id: 2, name: "Чжан Вэй", subject: "Китайская культура", experience: "7 лет", photo: "" }
    ],
    students: [
      { id: 1, name: "Иван Иванов", group: "A" },
      { id: 2, name: "Мария Петрова", group: "A" },
      { id: 3, name: "Алексей Смирнов", group: "B" }
    ],
    groups: {
      A: { name: "Группа A", students: [1,2], teacher: 1 },
      B: { name: "Группа B", students: [3], teacher: 2 }
    },
    schedule: {
      1: [
        { day: "Понедельник", time: "10:00", group: "A", subject: "Китайский язык", teacher: "Ли Хуа" },
        { day: "Среда", time: "12:00", group: "B", subject: "Культура Китая", teacher: "Чжан Вэй" }
      ],
      2: [
        { day: "Понедельник", time: "12:00", group: "A", subject: "Иероглифика", teacher: "Ли Хуа" }
      ]
    },
    extraLessons: [
      { id: 1, title: "Каллиграфия", desc: "Изучение китайской каллиграфии", time: "Пятница 16:00" }
    ],
    questions: [], // { id, text, author, createdAt, answer, answeredBy, answeredAt }
    chineseFacts: [
      "Великая китайская стена — одно из самых известных сооружений.",
      "В Китае изобрели бумагу, компас, порох и печатание."
    ]
  };

  // ---------- Пользователи: логин -> { password, role, name, approved } ----------
  // По умолчанию создаём администратора admin/admin123
  const initialUsers = {
    admin: { password: "admin123", role: "admin", name: "Администратор", approved: true }
  };

  // ---------- State ----------
  let appData = {};             // основной объект данных
  let usersDb = {};             // база пользователей
  let teacherRequests = [];     // заявки учителей (не подтверждённые)
  let currentUser = null;       // { login, role, name }
  let currentWeek = 1;

  // ---------- DOM helpers ----------
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $all(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); }

  // ---------- Safe escape (для вставки в innerText preferably) ----------
  function escapeHtml(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // ---------- Notifications ----------
  function notify(text, timeout = 3000) {
    const area = document.getElementById('notification-area') || (function () {
      const a = document.createElement('div');
      a.id = 'notification-area';
      document.body.appendChild(a);
      return a;
    })();
    const el = document.createElement('div');
    el.className = 'notification';
    el.textContent = text;
    area.appendChild(el);
    setTimeout(() => {
      el.style.opacity = '0';
      setTimeout(()=> el.remove(), 300);
    }, timeout);
  }

  // ---------- Persistence ----------
  function saveAll() {
    try {
      localStorage.setItem(LS_KEYS.DATA, JSON.stringify(appData));
      localStorage.setItem(LS_KEYS.USERS, JSON.stringify(usersDb));
      localStorage.setItem(LS_KEYS.REQS, JSON.stringify(teacherRequests));
      if (currentUser) localStorage.setItem(LS_KEYS.CUR_USER, JSON.stringify(currentUser));
      else localStorage.removeItem(LS_KEYS.CUR_USER);
    } catch (e) {
      console.error('saveAll err', e);
      notify('Ошибка сохранения данных');
    }
  }

  function loadAll() {
    try {
      const rawData = localStorage.getItem(LS_KEYS.DATA);
      const rawUsers = localStorage.getItem(LS_KEYS.USERS);
      const rawReqs = localStorage.getItem(LS_KEYS.REQS);
      const rawCur = localStorage.getItem(LS_KEYS.CUR_USER);

      appData = rawData ? JSON.parse(rawData) : JSON.parse(JSON.stringify(initialData));
      usersDb = rawUsers ? JSON.parse(rawUsers) : JSON.parse(JSON.stringify(initialUsers));
      teacherRequests = rawReqs ? JSON.parse(rawReqs) : [];
      currentUser = rawCur ? JSON.parse(rawCur) : null;

      // safety: ensure structures exist
      appData.questions = appData.questions || [];
      appData.teachers = appData.teachers || [];
      appData.students = appData.students || [];
      appData.groups = appData.groups || {};
      appData.schedule = appData.schedule || {};
      appData.extraLessons = appData.extraLessons || [];
      appData.chineseFacts = appData.chineseFacts || [];
    } catch (e) {
      console.error('loadAll err', e);
      // fallback
      appData = JSON.parse(JSON.stringify(initialData));
      usersDb = JSON.parse(JSON.stringify(initialUsers));
      teacherRequests = [];
      currentUser = null;
    }
  }

  // ---------- UI: modals, pages ----------
  function openModal(id) {
    const m = document.getElementById(id);
    if (m) m.style.display = 'flex';
  }
  function closeModal(id) {
    const m = document.getElementById(id);
    if (m) m.style.display = 'none';
  }

  function switchAuthTab(tab) {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginTab = document.getElementById('login-tab');
    const registerTab = document.getElementById('register-tab');
    if (!loginForm || !registerForm) return;
    if (tab === 'login') {
      loginForm.style.display = 'block';
      registerForm.style.display = 'none';
      loginTab.classList.add('active');
      registerTab.classList.remove('active');
    } else {
      loginForm.style.display = 'none';
      registerForm.style.display = 'block';
      loginTab.classList.remove('active');
      registerTab.classList.add('active');
    }
  }

  function changePage(id) {
    $all('.page').forEach(p => p.classList.remove('active'));
    const el = document.getElementById(id);
    if (el) el.classList.add('active');
    // update active menu
    $all('.menu .menu-item').forEach(item => item.classList.remove('active'));
    const menuItems = $all('.menu .menu-item');
    menuItems.forEach(mi => {
      if (mi.textContent && mi.textContent.trim().toLowerCase().includes('учителя') && id === 'teachers') mi.classList.add('active');
      if (mi.textContent && mi.textContent.trim().toLowerCase().includes('ученики') && id === 'students') mi.classList.add('active');
      if (mi.textContent && mi.textContent.trim().toLowerCase().includes('группы') && id === 'groups') mi.classList.add('active');
      if (mi.textContent && mi.textContent.trim().toLowerCase().includes('расписание') && id === 'schedule') mi.classList.add('active');
      if (mi.textContent && mi.textContent.trim().toLowerCase().includes('занятия') && id === 'extra-lessons') mi.classList.add('active');
    });
  }

  // ---------- Auth (register/login/logout) ----------
  function registerHandler() {
    const name = $('#register-username').value.trim();
    const pass = $('#register-password').value;
    const role = $('#register-role').value;

    if (!name || !pass) {
      notify('Заполните ФИО и пароль');
      return;
    }
    const login = generateLoginFromName(name);
    if (usersDb[login]) {
      notify('Пользователь с таким логином уже существует: ' + login);
      return;
    }

    if (role === 'teacher') {
      // create request for admin
      teacherRequests.push({
        login,
        password: pass,
        name,
        role: 'teacher',
        approved: false,
        photo: '',
        subject: '',
        experience: ''
      });
      saveAll();
      notify('Заявка отправлена администратору. Логин: ' + login);
      closeModal('auth-modal');
      renderTeacherRequests(); // update if admin open
      // broadcast via storage (to trigger other tabs)
      localStorage.setItem(LS_KEYS.REQS, JSON.stringify(teacherRequests));
    } else {
      // immediate creation (student)
      usersDb[login] = { password: pass, role: 'student', name: name, approved: true };
      currentUser = { login, role: 'student', name: name };
      saveAll();
      notify('Регистрация выполнена, вы вошли как ' + name);
      closeModal('auth-modal');
      renderHeaderForUser();
      renderStudents();
      localStorage.setItem(LS_KEYS.USERS, JSON.stringify(usersDb));
      localStorage.setItem(LS_KEYS.CUR_USER, JSON.stringify(currentUser));
    }
  }

  function loginHandler() {
    const loginInput = $('#login-username').value.trim();
    const pass = $('#login-password').value;
    if (!loginInput || !pass) {
      notify('Введите логин и пароль');
      return;
    }
    const login = loginInput; // earlier we autogen login — accept either login or full name
    // try match by login; also try find user by name
    let userRecord = usersDb[login];
    if (!userRecord) {
      // try find by name
      const found = Object.keys(usersDb).find(k => usersDb[k].name === loginInput);
      if (found) userRecord = usersDb[found], userRecord._loginKey = found;
    }
    if (!userRecord) { notify('Пользователь не найден'); return; }
    if (userRecord.password !== pass) { notify('Неверный пароль'); return; }
    if (!userRecord.approved) { notify('Ваша заявка ожидает подтверждения администратора'); return; }

    const key = userRecord._loginKey || login;
    currentUser = { login: key, role: userRecord.role, name: userRecord.name };
    saveAll();
    renderHeaderForUser();
    notify('Вы вошли как ' + currentUser.name);
    closeModal('auth-modal');
    localStorage.setItem(LS_KEYS.CUR_USER, JSON.stringify(currentUser));
  }

  function logoutHandler() {
    currentUser = null;
    saveAll();
    renderHeaderForUser();
    notify('Вы вышли');
    localStorage.removeItem(LS_KEYS.CUR_USER);
  }

  function generateLoginFromName(name) {
    // simple translit-ish or slug: lowercase, remove spaces -> take first word + timestamp suffix if collides
    let base = name.toLowerCase().replace(/[^a-zа-яё0-9]+/g, '-').replace(/^-+|-+$/g, '');
    if (!base) base = 'user';
    let login = base;
    let i = 0;
    while (usersDb[login] || teacherRequests.find(r => r.login === login)) {
      i++;
      login = base + (i);
    }
    return login;
  }

  // ---------- Teacher requests: render, approve, reject ----------
  function renderTeacherRequests() {
    const list = document.getElementById('teacher-requests-list');
    if (!list) return;
    list.innerHTML = '';
    if (!teacherRequests || teacherRequests.length === 0) {
      list.innerHTML = '<p>Заявок нет</p>';
      return;
    }
    teacherRequests.forEach((r, idx) => {
      const item = document.createElement('div');
      item.className = 'request-item';
      const info = document.createElement('div');
      info.className = 'request-info';
      info.innerHTML = `<div><strong>ФИО:</strong> ${escapeHtml(r.name)}</div>
                        <div><strong>Логин:</strong> ${escapeHtml(r.login)}</div>
                        <div><strong>Пароль:</strong> ${escapeHtml(r.password)}</div>`;
      const actions = document.createElement('div');
      actions.className = 'request-actions';
      const ok = document.createElement('button');
      ok.className = 'request-approve';
      ok.textContent = 'Принять';
      ok.onclick = () => approveRequest(idx);
      const deny = document.createElement('button');
      deny.className = 'request-deny';
      deny.textContent = 'Отклонить';
      deny.onclick = () => rejectRequest(idx);
      actions.appendChild(ok);
      actions.appendChild(deny);
      item.appendChild(info);
      item.appendChild(actions);
      list.appendChild(item);
    });
  }

  function approveRequest(index) {
    const req = teacherRequests[index];
    if (!req) { notify('Заявка не найдена'); return; }
    usersDb[req.login] = { password: req.password, role: 'teacher', name: req.name, approved: true };
    // create teacher record
    const newId = (appData.teachers.reduce((m,t)=>Math.max(m,t.id||0),0) || 0) + 1;
    appData.teachers.push({
      id: newId,
      name: req.name,
      subject: req.subject || 'Китайский язык',
      experience: req.experience || '0 лет',
      photo: req.photo || ''
    });
    teacherRequests.splice(index,1);
    saveAll();
    notify('Заявка принята. Учитель добавлен.');
    renderTeacherRequests();
    renderTeachers();
    localStorage.setItem(LS_KEYS.USERS, JSON.stringify(usersDb));
    localStorage.setItem(LS_KEYS.REQS, JSON.stringify(teacherRequests));
    localStorage.setItem(LS_KEYS.DATA, JSON.stringify(appData));
  }

  function rejectRequest(index) {
    if (!teacherRequests[index]) { notify('Заявка не найдена'); return; }
    const removed = teacherRequests.splice(index,1);
    saveAll();
    notify('Заявка отклонена');
    renderTeacherRequests();
    localStorage.setItem(LS_KEYS.REQS, JSON.stringify(teacherRequests));
  }

  // ---------- Render teachers / students / groups / schedule / extra lessons ----------
  function renderTeachers() {
    const container = document.querySelector('.teacher-list');
    if (!container) return;
    container.innerHTML = '';
    appData.teachers.forEach((t) => {
      const card = document.createElement('div');
      card.className = 'teacher-card';
      // photo
      const img = document.createElement('img');
      img.className = 'teacher-photo';
      img.src = t.photo || defaultTeacherPlaceholder();
      img.alt = t.name;
      // info
      const h = document.createElement('h3');
      h.textContent = t.name;
      const p = document.createElement('p');
      p.textContent = t.subject + ' • ' + (t.experience || '');
      // append
      card.appendChild(img);
      card.appendChild(h);
      card.appendChild(p);
      // click to open detail
      card.addEventListener('click', () => openTeacherDetail(t.id));
      // if admin, add small control panel to card
      if (currentUser && currentUser.role === 'admin') {
        const adminBar = document.createElement('div');
        adminBar.style.marginTop = '8px';
        adminBar.style.display = 'flex';
        adminBar.style.gap = '6px';
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Ред.';
        editBtn.onclick = (ev) => {
          ev.stopPropagation();
          openTeacherEditModal(t.id);
        };
        const photoBtn = document.createElement('button');
        photoBtn.textContent = 'Фото';
        photoBtn.onclick = (ev) => {
          ev.stopPropagation();
          triggerPhotoUpload(t.id);
        };
        adminBar.appendChild(editBtn);
        adminBar.appendChild(photoBtn);
        card.appendChild(adminBar);
      }
      container.appendChild(card);
    });
  }

  function defaultTeacherPlaceholder() {
    // tiny dataURL or remote placeholder
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='128' height='128'><rect width='100%' height='100%' fill='#f2f2f2'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#bbb' font-size='16'>Фото</text></svg>`);
  }

  function renderStudents() {
    const container = document.querySelector('.student-list');
    if (!container) return;
    container.innerHTML = '';
    appData.students.forEach(s => {
      const el = document.createElement('div');
      el.className = 'student-card';
      el.textContent = `${s.name} (Группа ${s.group})`;
      container.appendChild(el);
    });
  }

  function renderGroups() {
    const container = document.querySelector('.groups-container');
    if (!container) return;
    container.innerHTML = '';
    Object.keys(appData.groups).forEach(key => {
      const g = appData.groups[key];
      const el = document.createElement('div');
      el.className = 'group-card';
      el.innerHTML = `<h3>${escapeHtml(g.name)}</h3><p>Учитель: ${escapeHtml((appData.teachers.find(t=>t.id===g.teacher)||{}).name || '—')}</p>`;
      el.addEventListener('click', () => {
        // show student list in modal
        const names = (g.students || []).map(id => (appData.students.find(s=>s.id===id) || {}).name || '').join(', ');
        const dlg = document.createElement('div');
        dlg.className = 'modal';
        dlg.style.display = 'flex';
        dlg.innerHTML = `<div class="modal-content"><span class="close">&times;</span><h3>${escapeHtml(g.name)}</h3><p>Ученики: ${escapeHtml(names)}</p></div>`;
        document.body.appendChild(dlg);
        dlg.querySelector('.close').addEventListener('click', ()=> dlg.remove());
      });
      container.appendChild(el);
    });
  }

  function renderSchedule() {
    const tbody = document.getElementById('schedule-body');
    if (!tbody) return;
    tbody.innerHTML = '';
    const lessons = appData.schedule[currentWeek] || [];
    if (lessons.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5">Занятий нет</td></tr>';
      return;
    }
    lessons.forEach(l => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${escapeHtml(l.day)}</td><td>${escapeHtml(l.time)}</td><td>${escapeHtml(l.group)}</td><td>${escapeHtml(l.subject)}</td><td>${escapeHtml(l.teacher)}</td>`;
      tbody.appendChild(tr);
    });
    document.getElementById('week-label').textContent = 'Неделя ' + currentWeek;
  }

  function renderExtraLessons() {
    const container = document.querySelector('.extra-lessons');
    if (!container) return;
    container.innerHTML = '';
    (appData.extraLessons || []).forEach(l => {
      const card = document.createElement('div');
      card.className = 'extra-card';
      card.innerHTML = `<h3>${escapeHtml(l.title)}</h3><p>${escapeHtml(l.desc)}</p><small>${escapeHtml(l.time)}</small>`;
      container.appendChild(card);
    });
  }

  // ---------- Open teacher detail modal ----------
  function openTeacherDetail(teacherId) {
    const t = appData.teachers.find(x => x.id === teacherId);
    if (!t) { notify('Учитель не найден'); return; }
    const modal = document.getElementById('teacher-detail-modal');
    modal.style.display = 'flex';
    modal.querySelector('.teacher-detail-photo').src = t.photo || defaultTeacherPlaceholder();
    modal.querySelector('.teacher-detail-name').textContent = t.name;
    modal.querySelector('.teacher-detail-subject').textContent = 'Предмет: ' + (t.subject || '');
    modal.querySelector('.teacher-detail-experience').textContent = 'Стаж: ' + (t.experience || '');
    // show admin controls inside modal if needed (we add buttons dynamically)
    const content = modal.querySelector('.modal-content');
    // remove existing admin controls if any
    const old = content.querySelector('.teacher-modal-admin-controls');
    if (old) old.remove();
    if (currentUser && currentUser.role === 'admin') {
      const controls = document.createElement('div');
      controls.className = 'teacher-modal-admin-controls';
      controls.style.marginTop = '10px';
      const editBtn = document.createElement('button');
      editBtn.textContent = 'Редактировать';
      editBtn.onclick = () => openTeacherEditModal(teacherId);
      const uploadBtn = document.createElement('button');
      uploadBtn.textContent = 'Загрузить фото';
      uploadBtn.onclick = () => triggerPhotoUpload(teacherId);
      controls.appendChild(editBtn);
      controls.appendChild(uploadBtn);
      content.appendChild(controls);
    }
  }

  // ---------- Edit teacher modal (admin) ----------
  function openTeacherEditModal(teacherId) {
    const index = appData.teachers.findIndex(t => t.id === teacherId);
    if (index === -1) { notify('Учитель не найден'); return; }
    // build modal if not exist
    let editModal = document.getElementById('teacher-edit-modal');
    if (!editModal) {
      editModal = document.createElement('div');
      editModal.className = 'modal';
      editModal.id = 'teacher-edit-modal';
      editModal.innerHTML = `<div class="modal-content">
        <span class="close">&times;</span>
        <h3>Редактировать учителя</h3>
        <label>ФИО</label><input id="edit-teacher-name" type="text"/>
        <label>Предмет</label><input id="edit-teacher-subject" type="text"/>
        <label>Стаж</label><input id="edit-teacher-exp" type="text"/>
        <div style="margin-top:10px;"><button id="save-teacher-changes">Сохранить</button> <button id="cancel-teacher-edit">Отмена</button></div>
      </div>`;
      document.body.appendChild(editModal);
      editModal.querySelector('.close').addEventListener('click', ()=> editModal.style.display='none');
      editModal.querySelector('#cancel-teacher-edit').addEventListener('click', ()=> editModal.style.display='none');
      editModal.querySelector('#save-teacher-changes').addEventListener('click', () => {
        const idx = +editModal.getAttribute('data-idx');
        if (!appData.teachers[idx]) { notify('Ошибка'); return; }
        const name = document.getElementById('edit-teacher-name').value.trim();
        const subj = document.getElementById('edit-teacher-subject').value.trim();
        const exp = document.getElementById('edit-teacher-exp').value.trim();
        if (name) appData.teachers[idx].name = name;
        appData.teachers[idx].subject = subj || appData.teachers[idx].subject;
        appData.teachers[idx].experience = exp || appData.teachers[idx].experience;
        saveAll();
        renderTeachers();
        editModal.style.display='none';
        notify('Данные учителя обновлены');
        localStorage.setItem(LS_KEYS.DATA, JSON.stringify(appData));
      });
    }
    // fill fields
    const teacher = appData.teachers[index];
    document.getElementById('edit-teacher-name').value = teacher.name || '';
    document.getElementById('edit-teacher-subject').value = teacher.subject || '';
    document.getElementById('edit-teacher-exp').value = teacher.experience || '';
    editModal.setAttribute('data-idx', index);
    editModal.style.display = 'flex';
  }

  // ---------- Photo upload ----------
  function triggerPhotoUpload(teacherId) {
    // create (or reuse) hidden input
    let input = document.getElementById('global-photo-uploader');
    if (!input) {
      input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.style.display = 'none';
      input.id = 'global-photo-uploader';
      document.body.appendChild(input);
    }
    input.onchange = (ev) => {
      const f = ev.target.files && ev.target.files[0];
      if (!f) return;
      const reader = new FileReader();
      reader.onload = function (e) {
        const t = appData.teachers.find(x => x.id === teacherId);
        if (!t) { notify('Учитель не найден'); return; }
        t.photo = e.target.result; // base64
        saveAll();
        renderTeachers();
        notify('Фото учителя обновлено');
        localStorage.setItem(LS_KEYS.DATA, JSON.stringify(appData));
      };
      reader.readAsDataURL(f);
    };
    input.click();
  }

  // ---------- Questions & Answers ----------
  function sendQuestionHandler() {
    const txt = document.getElementById('question-input').value.trim();
    if (!txt) { notify('Введите вопрос'); return; }
    const q = {
      id: Date.now(),
      text: txt,
      author: currentUser ? currentUser.name : 'Гость',
      createdAt: new Date().toISOString(),
      answer: null
    };
    appData.questions.push(q);
    saveAll();
    renderQuestions();
    document.getElementById('question-input').value = '';
    notify('Вопрос отправлен');
    localStorage.setItem(LS_KEYS.DATA, JSON.stringify(appData));
  }

  function renderQuestions() {
    const list = document.getElementById('qa-list');
    if (!list) return;
    list.innerHTML = '';
    if (!appData.questions || appData.questions.length === 0) {
      list.innerHTML = '<p>Вопросов пока нет</p>';
      return;
    }
    appData.questions.slice().reverse().forEach(q => {
      const el = document.createElement('div');
      el.className = 'question-card';
      let inner = `<div class="question-text">${escapeHtml(q.text)}</div>`;
      inner += `<div class="question-meta">От: ${escapeHtml(q.author)} • ${new Date(q.createdAt).toLocaleString()}</div>`;
      if (q.answer) {
        inner += `<div class="answer-block"><strong>Ответ:</strong> ${escapeHtml(q.answer)} <small>(${escapeHtml(q.answeredBy || '')})</small></div>`;
      } else {
        if (currentUser && (currentUser.role === 'teacher' || currentUser.role === 'admin')) {
          inner += `<div class="answer-actions"><button class="answer-btn" data-id="${q.id}">Ответить</button></div>`;
        }
      }
      el.innerHTML = inner;
      list.appendChild(el);
    });
    // attach answer handlers
    $all('.answer-btn').forEach(b => {
      b.onclick = function () {
        const id = +this.getAttribute('data-id');
        openAnswerModal(id);
      };
    });
    // update badge
    updateQuestionBadge();
  }

  function openAnswerModal(qid) {
    const q = appData.questions.find(x => x.id === qid);
    if (!q) { notify('Вопрос не найден'); return; }
    // create modal if needed
    let am = document.getElementById('answer-modal');
    if (!am) {
      am = document.createElement('div');
      am.id = 'answer-modal';
      am.className = 'modal';
      am.innerHTML = `<div class="modal-content"><span class="close">&times;</span><h3>Ответить</h3><div id="answer-question-text"></div><textarea id="answer-input" rows="6"></textarea><div style="margin-top:8px;"><button id="submit-answer">Отправить</button> <button id="cancel-answer">Отмена</button></div></div>`;
      document.body.appendChild(am);
      am.querySelector('.close').addEventListener('click', ()=> am.style.display='none');
      am.querySelector('#cancel-answer').addEventListener('click', ()=> am.style.display='none');
      am.querySelector('#submit-answer').addEventListener('click', ()=> {
        const id = +am.getAttribute('data-qid');
        const val = document.getElementById('answer-input').value.trim();
        if (!val) { notify('Введите ответ'); return; }
        const obj = appData.questions.find(x => x.id === id);
        if (!obj) { notify('Вопрос не найден'); return; }
        obj.answer = val;
        obj.answeredBy = currentUser ? currentUser.name : '—';
        obj.answeredAt = new Date().toISOString();
        saveAll();
        am.style.display='none';
        renderQuestions();
        notify('Ответ отправлен');
        localStorage.setItem(LS_KEYS.DATA, JSON.stringify(appData));
      });
    }
    am.setAttribute('data-qid', qid);
    am.querySelector('#answer-question-text').innerHTML = `<p><strong>Вопрос:</strong> ${escapeHtml(q.text)}</p>`;
    am.querySelector('#answer-input').value = q.answer || '';
    am.style.display = 'flex';
  }

  function updateQuestionBadge() {
    const badge = document.querySelector('.notification-badge');
    if (!badge) return;
    const count = (appData.questions || []).filter(q => !q.answer).length;
    badge.textContent = count > 0 ? count : '0';
    badge.style.display = count > 0 ? 'inline-flex' : 'none';
  }

  // ---------- Translator (stub + example API call) ----------
  async function translateHandler() {
    const txt = document.getElementById('translate-input').value.trim();
    if (!txt) { notify('Введите текст для перевода'); return; }
    // Local stub for short text:
    if (txt.length < 40) {
      const chinese = fakeLocalTranslate(txt);
      document.getElementById('translate-chinese').textContent = chinese.chinese;
      document.getElementById('translate-pinyin').textContent = chinese.pinyin;
      notify('Перевод готов (локальная заглушка)');
      return;
    }
    // Example of server POST (needs backend)
    try {
      const resp = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: txt, to: 'zh' })
      });
      if (!resp.ok) throw new Error('network');
      const data = await resp.json();
      document.getElementById('translate-chinese').textContent = data.chinese || '';
      document.getElementById('translate-pinyin').textContent = data.pinyin || '';
      notify('Перевод получен с сервера');
    } catch (e) {
      // fallback
      const chinese = fakeLocalTranslate(txt);
      document.getElementById('translate-chinese').textContent = chinese.chinese;
      document.getElementById('translate-pinyin').textContent = chinese.pinyin;
      notify('Сервер недоступен — использован локальный перевод');
    }
  }

  function fakeLocalTranslate(text) {
    // очень простая замена — не реальный перевод
    // для демонстрации: возвращаем слово "测试" + pinyin
    return { chinese: '测试 ' + text, pinyin: 'cè shì' };
  }

  // ---------- Theme toggle ----------
  function loadTheme() {
    const t = localStorage.getItem(LS_KEYS.THEME) || 'light';
    if (t === 'dark') document.body.classList.add('dark');
    else document.body.classList.remove('dark');
  }
  function toggleTheme() {
    document.body.classList.toggle('dark');
    const now = document.body.classList.contains('dark') ? 'dark' : 'light';
    localStorage.setItem(LS_KEYS.THEME, now);
  }

  // ---------- Helpers ----------
  function ensureElements() {
    // attach event listeners to static buttons
    const regBtn = document.getElementById('register-btn');
    if (regBtn) regBtn.addEventListener('click', ()=> openModal('auth-modal') && switchAuthTab('register'));
    const logBtn = document.getElementById('login-btn');
    if (logBtn) logBtn.addEventListener('click', ()=> openModal('auth-modal') && switchAuthTab('login'));
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) themeBtn.addEventListener('click', toggleTheme);

    const loginSubmit = document.getElementById('login-submit');
    if (loginSubmit) loginSubmit.addEventListener('click', loginHandler);
    const registerSubmit = document.getElementById('register-submit');
    if (registerSubmit) registerSubmit.addEventListener('click', registerHandler);
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', logoutHandler);

    const sendQ = document.getElementById('send-question');
    if (sendQ) sendQ.addEventListener('click', sendQuestionHandler);

    const translateBtn = document.getElementById('translate-btn');
    if (translateBtn) translateBtn.addEventListener('click', translateHandler);

    // close modal on background click (for any modal)
    $all('.modal').forEach(m => {
      m.addEventListener('click', function(e) {
        if (e.target === m) m.style.display = 'none';
      });
    });

    // close buttons inside modals
    $all('.modal .close').forEach(btn => {
      btn.addEventListener('click', function() {
        const modal = this.closest('.modal');
        if (modal) modal.style.display = 'none';
      });
    });
  }

  // ---------- Sync: listen storage events ----------
  window.addEventListener('storage', function(e) {
    // If another tab changed data, reload relevant data and re-render
    if (!e.key) return;
    if ([LS_KEYS.DATA, LS_KEYS.USERS, LS_KEYS.REQS, LS_KEYS.CUR_USER].includes(e.key)) {
      loadAll();
      refreshAllUI();
    }
  });

  // ---------- refresh UI ----------
  function renderHeaderForUser() {
    const userSpan = document.getElementById('user-info');
    if (!userSpan) return;
    if (currentUser) {
      userSpan.textContent = currentUser.name + (currentUser.role ? ' (' + currentUser.role + ')' : '');
      // hide hero buttons if logged in
      document.getElementById('register-btn').style.display = 'none';
      document.getElementById('login-btn').style.display = 'none';
      // show logout button in auth modal
      const logoutModalBtn = document.getElementById('logout-btn');
      if (logoutModalBtn) logoutModalBtn.style.display = 'inline-block';
    } else {
      userSpan.textContent = '';
      document.getElementById('register-btn').style.display = '';
      document.getElementById('login-btn').style.display = '';
      const logoutModalBtn = document.getElementById('logout-btn');
      if (logoutModalBtn) logoutModalBtn.style.display = 'none';
    }
    // admin-only menu: show teacher requests link if admin
    const reqModal = document.getElementById('teacher-requests-modal');
    // find menu and maybe add admin entry dynamically
    const nav = document.querySelector('nav ul.menu');
    if (!nav) return;
    let adminItem = Array.from(nav.children).find(li => li.dataset.role === 'admin-requests');
    if (currentUser && currentUser.role === 'admin') {
      if (!adminItem) {
        adminItem = document.createElement('li');
        adminItem.className = 'menu-item';
        adminItem.textContent = 'Заявки учителей';
        adminItem.dataset.role = 'admin-requests';
        adminItem.addEventListener('click', ()=> {
          renderTeacherRequests();
          openModal('teacher-requests-modal');
        });
        nav.appendChild(adminItem);
      }
    } else {
      if (adminItem) adminItem.remove();
    }
  }

  function refreshAllUI() {
    renderHeaderForUser();
    renderTeachers();
    renderStudents();
    renderGroups();
    renderSchedule();
    renderExtraLessons();
    renderQuestions();
    renderTeacherRequests(); // it's safe to call even for non-admins (list area exists)
    updateQuestionBadge();
  }

  // ---------- Change schedule week ----------
  function changeWeek(delta) {
    currentWeek += delta;
    if (currentWeek < 1) currentWeek = 1;
    if (!appData.schedule[currentWeek]) currentWeek = 1;
    renderSchedule();
  }

  // ---------- Init ----------
  function init() {
    loadAll();
    ensureElements();
    loadTheme();
    // If currentUser stored, read
    if (currentUser) {
      // keep currentUser as is
    } else {
      // maybe there is user in localStorage
      const cu = localStorage.getItem(LS_KEYS.CUR_USER);
      if (cu) currentUser = JSON.parse(cu);
    }
    refreshAllUI();

    // show random fact
    const factEl = document.getElementById('china-fact');
    if (factEl && appData.chineseFacts && appData.chineseFacts.length) {
      factEl.textContent = appData.chineseFacts[Math.floor(Math.random()*appData.chineseFacts.length)];
    }

    // Attach open auth modal on register/login hero buttons (in case header not used)
    const heroReg = document.getElementById('register-btn');
    if (heroReg) heroReg.addEventListener('click', ()=> { openModal('auth-modal'); switchAuthTab('register'); });
    const heroLog = document.getElementById('login-btn');
    if (heroLog) heroLog.addEventListener('click', ()=> { openModal('auth-modal'); switchAuthTab('login'); });

    // If no usersDb, initialise
    if (!usersDb || Object.keys(usersDb).length === 0) usersDb = JSON.parse(JSON.stringify(initialUsers));

    // UI polish: hide badge if zero
    updateQuestionBadge();
  }

  // Run init on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', init);

  // expose some functions globally that HTML uses inline (changePage, openModal, closeModal, switchAuthTab)
  window.changePage = changePage;
  window.openModal = openModal;
  window.closeModal = closeModal;
  window.switchAuthTab = switchAuthTab;
  window.changeWeek = changeWeek;

  // for debugging convenience
  window._portal = {
    get state() { return { appData, usersDb, teacherRequests, currentUser }; },
    save: saveAll,
    load: loadAll,
    notify
  };

})();
