// main.js — логика для главной страницы: форма, API, навигация
document.addEventListener('DOMContentLoaded', () => {
  // ========== ФОРМА ОБРАТНОЙ СВЯЗИ ==========
  const form = document.getElementById('feedback-form');
  const nameInput = document.getElementById('fb-name');
  const emailInput = document.getElementById('fb-email');
  const messageInput = document.getElementById('fb-message');
  const nameError = document.getElementById('name-error');
  const emailError = document.getElementById('email-error');
  const msgError = document.getElementById('msg-error');
  const successMsg = document.getElementById('form-success-msg');

  function clearFormErrors() {
    if (nameError) nameError.textContent = '';
    if (emailError) emailError.textContent = '';
    if (msgError) msgError.textContent = '';
    [nameInput, emailInput, messageInput].forEach(inp => {
      if (inp) inp.style.borderColor = '';
    });
  }

  function validateForm() {
    let isValid = true;
    clearFormErrors();

    const name = nameInput?.value.trim() || '';
    if (name.length < 2) {
      if (nameError) nameError.textContent = 'Имя должно содержать минимум 2 символа';
      isValid = false;
    } else if (!/^[A-Za-zА-Яа-яЁё\s\-']+$/.test(name)) {
      if (nameError) nameError.textContent = 'Только буквы, пробелы, дефисы';
      isValid = false;
    }

    const email = emailInput?.value.trim() || '';
    const emailPattern = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
    if (!emailPattern.test(email)) {
      if (emailError) emailError.textContent = 'Введите корректный email (name@example.com)';
      isValid = false;
    }

    const message = messageInput?.value.trim() || '';
    if (message.length === 0) {
      if (msgError) msgError.textContent = 'Сообщение не может быть пустым';
      isValid = false;
    } else if (message.length > 500) {
      if (msgError) msgError.textContent = 'Сообщение не более 500 символов';
      isValid = false;
    }

    return isValid;
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (validateForm()) {
        const formData = {
          name: nameInput.value.trim(),
          email: emailInput.value.trim(),
          message: messageInput.value.trim(),
          timestamp: new Date().toISOString()
        };
        console.log('✅ Отправка формы (демо):', formData);
        if (successMsg) {
          successMsg.textContent = '✓ Спасибо! Ваше сообщение отправлено (демо-режим).';
          setTimeout(() => { successMsg.textContent = ''; }, 3000);
        }
        form.reset();
        clearFormErrors();
      } else {
        console.log('❌ Ошибка валидации формы');
      }
    });
  }

  // ========== API ЗАПРОСЫ (JSONPlaceholder) ==========
  const usersDiv = document.getElementById('users-list-api');
  const postsDiv = document.getElementById('posts-list-api');
  const loadPostsBtn = document.getElementById('load-posts-btn');

  async function fetchUsers() {
    if (!usersDiv) return;
    usersDiv.innerHTML = '<div class="api-card">⏳ Загрузка пользователей...</div>';
    try {
      const res = await fetch('https://jsonplaceholder.typicode.com/users?_limit=3');
      const users = await res.json();
      usersDiv.innerHTML = users.map(user => `
        <div class="api-card">
          <strong>👤 ${escapeHtml(user.name)}</strong><br>
          📧 ${escapeHtml(user.email)}<br>
          🏢 ${escapeHtml(user.company?.name || '—')}
        </div>
      `).join('');
      console.table(users);
    } catch (err) {
      usersDiv.innerHTML = '<div class="api-card">⚠️ Ошибка загрузки пользователей</div>';
      console.error(err);
    }
  }

  async function fetchPosts() {
    if (!postsDiv) return;
    postsDiv.innerHTML = '<div class="api-card">⏳ Загрузка постов...</div>';
    try {
      const res = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=3');
      const posts = await res.json();
      postsDiv.innerHTML = posts.map(post => `
        <div class="api-card">
          <strong>📌 ${escapeHtml(post.title)}</strong><br>
          ${escapeHtml(post.body.substring(0, 100))}...
        </div>
      `).join('');
      console.table(posts);
    } catch (err) {
      postsDiv.innerHTML = '<div class="api-card">⚠️ Ошибка загрузки постов</div>';
      console.error(err);
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
      if (m === '&') return '&amp;';
      if (m === '<') return '&lt;';
      if (m === '>') return '&gt;';
      return m;
    });
  }

  // Загружаем пользователей при старте
  fetchUsers();
  // Посты по клику
  if (loadPostsBtn) {
    loadPostsBtn.addEventListener('click', fetchPosts);
  }

  // Активная ссылка в навигации (уже есть класс active в index.html, но страховка)
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-links a');
  navLinks.forEach(link => {
    if (link.getAttribute('href') === 'index.html' && (currentPath.endsWith('index.html') || currentPath === '/' || currentPath.endsWith('/'))) {
      link.classList.add('active');
    } else if (link.getAttribute('href') === 'game.html' && currentPath.includes('game.html')) {
      link.classList.add('active');
    }
  });
});
