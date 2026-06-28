/* ==========================================================================
   ВАЛИДАЦИЯ ФОРМ
   ========================================================================== */

(function() {
  "use strict";

  console.log('✅ validation.js loaded');

  const CONFIG = {
    patterns: {
      phone: /^(\+375|375|80)(29|25|44|33|17)\d{7}$/,
      name: /^[А-Яа-яA-Za-z\s\-']{2,}$/,
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    messages: {
      name: 'Имя должно содержать только буквы (минимум 2 символа)',
      phone: 'Введите номер в формате +375 (XX) XXX-XX-XX',
      phoneRequired: 'Введите номер телефона',
      email: 'Введите корректный email',
      message: 'Сообщение должно содержать минимум 10 символов',
      required: 'Это поле обязательно для заполнения',
    }
  };

  // ── Плавное удаление элемента ──
  function removeWithAnimation(element, className = 'is-hiding', delay = 300) {
    if (!element) return;
    element.classList.add(className);
    setTimeout(() => {
      if (element.parentNode) {
        element.remove();
      }
    }, delay);
  }

  // ── Форматирование телефона ──
  function formatPhone(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.startsWith('8')) {
      value = '375' + value.substring(1);
    } else if (!value.startsWith('375') && value.length > 0) {
      value = '375' + value;
    }
    if (value.length > 12) {
      value = value.substring(0, 12);
    }
    let formatted = '';
    if (value.length > 0) {
      formatted = '+375 ';
      if (value.length > 3) {
        formatted += '(' + value.substring(3, 5) + ') ';
        if (value.length > 5) {
          formatted += value.substring(5, 8) + '-';
          if (value.length > 8) {
            formatted += value.substring(8, 10) + '-';
            if (value.length > 10) {
              formatted += value.substring(10, 12);
            } else {
              formatted += value.substring(10);
            }
          } else {
            formatted += value.substring(8);
          }
        } else {
          formatted += value.substring(5);
        }
      } else {
        formatted += value.substring(3);
      }
    }
    input.value = formatted;
    return value;
  }

  // ── Создать подсказку ──
  function createHint(field, type) {
    const oldHint = field.parentElement.querySelector('.field-hint');
    if (oldHint) oldHint.remove();

    const hint = document.createElement('span');
    hint.className = 'field-hint';

    let hintText = '';
    let exampleText = '';

    switch (type) {
      case 'name':
        hintText = CONFIG.messages.name;
        exampleText = 'Например: Иван';
        break;
      case 'phone':
        hintText = CONFIG.messages.phone;
        exampleText = 'Например: +375 (29) 123-45-67';
        break;
      case 'email':
        hintText = CONFIG.messages.email;
        exampleText = 'Например: example@mail.com';
        break;
      case 'message':
        hintText = CONFIG.messages.message;
        exampleText = 'Напишите кратко о вашем проекте';
        break;
      default:
        return;
    }

    hint.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="12" x2="12" y2="16"/>
        <line x1="12" y1="8" x2="12.01" y2="8"/>
      </svg>
      <span>${hintText}</span>
      <small>${exampleText}</small>
    `;

    field.parentElement.appendChild(hint);
  }

  // ── Показать подсказку ──
  function showHint(field, type) {
    const oldHint = field.parentElement.querySelector('.field-hint');
    if (oldHint) {
      if (oldHint.classList.contains('is-hiding')) return;
      removeWithAnimation(oldHint);
      setTimeout(() => {
        createHint(field, type);
      }, 300);
      return;
    }
    createHint(field, type);
  }

  // ── Скрыть подсказку плавно ──
  function hideHint(field) {
    const hint = field.parentElement.querySelector('.field-hint');
    if (hint) {
      if (hint.classList.contains('is-hiding')) return;
      removeWithAnimation(hint);
    }
  }

  // ── Показать ошибку ──
  function showError(field, message) {
    const oldError = field.parentElement.querySelector('.field-error');
    if (oldError) {
      if (oldError.classList.contains('is-hiding')) return;
      removeWithAnimation(oldError);
    }

    const oldHint = field.parentElement.querySelector('.field-hint');
    if (oldHint) {
      if (oldHint.classList.contains('is-hiding')) return;
      removeWithAnimation(oldHint);
    }

    setTimeout(() => {
      const error = document.createElement('span');
      error.className = 'field-error';
      error.textContent = message;
      error.setAttribute('role', 'alert');
      field.parentElement.appendChild(error);
    }, 150);

    field.classList.add('shake');
    setTimeout(() => field.classList.remove('shake'), 500);
  }

  // ── Очистка ошибок ──
  function clearErrors(field, keepHint = false) {
    field.classList.remove('is-error', 'is-valid', 'shake');

    const error = field.parentElement.querySelector('.field-error');
    if (error) removeWithAnimation(error);

    if (!keepHint) {
      const hint = field.parentElement.querySelector('.field-hint');
      if (hint) removeWithAnimation(hint);
    }
  }

  // ── Основная валидация поля ──
  function validateField(field) {
    const type = field.dataset.validate || field.type;
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';

    clearErrors(field, true);

    if (field.required && !value) {
      isValid = false;
      errorMessage = CONFIG.messages.required;
      showError(field, errorMessage);
      return false;
    }

    if (value) {
      switch (type) {
        case 'name':
          if (!CONFIG.patterns.name.test(value)) {
            isValid = false;
            errorMessage = CONFIG.messages.name;
          }
          break;
        case 'phone':
          const cleanPhone = value.replace(/\D/g, '');
          if (cleanPhone.length === 0) {
            isValid = false;
            errorMessage = CONFIG.messages.phoneRequired;
          } else if (!CONFIG.patterns.phone.test(cleanPhone) || cleanPhone.length < 11) {
            isValid = false;
            errorMessage = CONFIG.messages.phone;
          }
          break;
        case 'email':
          if (!CONFIG.patterns.email.test(value)) {
            isValid = false;
            errorMessage = CONFIG.messages.email;
          }
          break;
        case 'message':
          if (value.length < 10) {
            isValid = false;
            errorMessage = CONFIG.messages.message;
          }
          break;
      }
    }

    if (!isValid && value) {
      showError(field, errorMessage);
      setTimeout(() => {
        showHint(field, type);
      }, 200);
    } else if (isValid && value) {
      field.classList.add('is-valid');
      hideHint(field);
    }

    return isValid;
  }

  // ── Валидация всей формы ──
  function validateForm(form) {
    const fields = form.querySelectorAll('[data-validate], [required]');
    let isValid = true;

    fields.forEach(field => {
      if (field.dataset.validate === 'phone' || field.type === 'tel') {
        const clean = formatPhone(field);
        if (clean.length > 0 && clean.length < 11) {
          field.classList.add('is-error');
          showError(field, CONFIG.messages.phone);
          showHint(field, 'phone');
          isValid = false;
          return;
        }
      }

      if (!validateField(field)) {
        isValid = false;
      }
    });

    return isValid;
  }

  // ── Инициализация формы ──
  function initForm(form) {
    console.log('✅ Инициализация формы:', form.id || 'форма без ID');

    const fields = form.querySelectorAll('[data-validate], [required]');
    console.log('Найдено полей для валидации:', fields.length);

    fields.forEach(field => {
      field.addEventListener('input', function() {
        if (this.dataset.validate === 'phone' || this.type === 'tel') {
          const clean = formatPhone(this);
          if (clean.length > 0) {
            validateField(this);
          }
        } else {
          validateField(this);
        }
      });

      field.addEventListener('blur', function() {
        if (this.value.trim() || this.required) {
          validateField(this);
        }
        hideHint(this);
      });

      field.addEventListener('focus', function() {
        if (!this.value.trim()) {
          const type = this.dataset.validate || this.type;
          if (['name', 'phone', 'email', 'message'].includes(type)) {
            showHint(this, type);
          }
        }
      });
    });

    form.addEventListener('submit', function(e) {
      console.log('📤 Отправка формы, проверяем валидацию...');

      let isValid = true;
      fields.forEach(field => {
        if (!validateField(field)) {
          isValid = false;
        }
      });

      if (!isValid) {
        e.preventDefault();
        console.log('❌ Форма содержит ошибки');
        const firstError = this.querySelector('.is-error');
        if (firstError) {
          firstError.focus();
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return false;
      }
      console.log('✅ Форма валидна, отправляем...');
    });
  }

  // ── Инициализация всех форм ──
  function initAllForms() {
    console.log('🔍 Поиск форм...');

    const modalForm = document.getElementById('modalContactForm');
    if (modalForm) {
      console.log('✅ Найдена форма modalContactForm');
      initForm(modalForm);
    }

    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
      console.log('✅ Найдена форма contactForm');
      initForm(contactForm);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllForms);
  } else {
    initAllForms();
  }

})();