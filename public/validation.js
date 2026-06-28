/* ==========================================================================
   ВАЛИДАЦИЯ ФОРМ
   ========================================================================== */

(function() {
  "use strict";

  // ── Конфигурация ──
  const CONFIG = {
    // Регулярные выражения
    patterns: {
      // Белорусские номера: +375 (XX) XXX-XX-XX
      phone: /^(\+375|375|80)(29|25|44|33|17)\d{7}$/,
      // Имя: только буквы, пробелы, дефис, апостроф (минимум 2 символа)
      name: /^[А-Яа-яA-Za-z\s\-']{2,}$/,
      // Email: стандартный
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    // Сообщения об ошибках
    messages: {
      name: 'Имя должно содержать только буквы (минимум 2 символа)',
      nameExample: 'Например: Иван',
      phone: 'Введите номер в формате +375 (XX) XXX-XX-XX',
      phoneExample: 'Например: +375 (29) 123-45-67',
      phoneRequired: 'Введите номер телефона',
      email: 'Введите корректный email',
      emailExample: 'Например: example@mail.com',
      message: 'Сообщение должно содержать минимум 10 символов',
      messageExample: 'Напишите кратко о вашем проекте',
      required: 'Это поле обязательно для заполнения',
    }
  };

  // ── Форматирование телефона ──
  function formatPhone(input) {
    // Удаляем все не-цифры
    let value = input.value.replace(/\D/g, '');

    // Если начинается с 8, заменяем на 375
    if (value.startsWith('8')) {
      value = '375' + value.substring(1);
    } else if (!value.startsWith('375') && value.length > 0) {
      // Если ввели без кода, добавляем 375
      value = '375' + value;
    }

    // Оставляем только 12 цифр (375 + 9 цифр)
    if (value.length > 12) {
      value = value.substring(0, 12);
    }

    // Применяем маску
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
    return value; // возвращаем "чистый" номер для валидации
  }

  // ── Показать подсказку ──
  function showHint(field, type) {
    // Удаляем старую подсказку
    const oldHint = field.parentElement.querySelector('.field-hint');
    if (oldHint) oldHint.remove();

    // Создаем подсказку
    const hint = document.createElement('span');
    hint.className = 'field-hint';

    let hintText = '';
    let exampleText = '';

    switch (type) {
      case 'name':
        hintText = CONFIG.messages.name;
        exampleText = CONFIG.messages.nameExample;
        break;
      case 'phone':
        hintText = CONFIG.messages.phone;
        exampleText = CONFIG.messages.phoneExample;
        break;
      case 'email':
        hintText = CONFIG.messages.email;
        exampleText = CONFIG.messages.emailExample;
        break;
      case 'message':
        hintText = CONFIG.messages.message;
        exampleText = CONFIG.messages.messageExample;
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

  // ── Показать ошибку ──
  function showError(field, message) {
    // Удаляем старую ошибку
    const oldError = field.parentElement.querySelector('.field-error');
    if (oldError) oldError.remove();

    // Удаляем подсказку
    const oldHint = field.parentElement.querySelector('.field-hint');
    if (oldHint) oldHint.remove();

    // Создаем ошибку
    const error = document.createElement('span');
    error.className = 'field-error';
    error.textContent = message;
    error.setAttribute('role', 'alert');
    field.parentElement.appendChild(error);

    // Встряска поля
    field.classList.add('shake');
    setTimeout(() => field.classList.remove('shake'), 500);
  }

  // ── Очистка ошибок ──
  function clearErrors(field) {
    field.classList.remove('is-error', 'is-valid', 'shake');

    const error = field.parentElement.querySelector('.field-error');
    if (error) error.remove();

    const hint = field.parentElement.querySelector('.field-hint');
    if (hint) hint.remove();
  }

  // ── Основная валидация поля ──
  function validateField(field) {
    const type = field.dataset.validate || field.type;
    const value = field.value.trim();
    const label = field.parentElement.querySelector('label');
    let isValid = true;
    let errorMessage = '';

    // Очищаем старые ошибки и подсказки
    clearErrors(field);

    // Проверка на обязательность
    if (field.required && !value) {
      isValid = false;
      errorMessage = CONFIG.messages.required;
    }

    // Проверка по типу
    if (isValid && value) {
      switch (type) {
        case 'name':
          if (!CONFIG.patterns.name.test(value)) {
            isValid = false;
            errorMessage = CONFIG.messages.name;
            showHint(field, 'name');
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
            showHint(field, 'phone');
          }
          break;

        case 'email':
          if (!CONFIG.patterns.email.test(value)) {
            isValid = false;
            errorMessage = CONFIG.messages.email;
            showHint(field, 'email');
          }
          break;

        case 'message':
          if (value.length < 10) {
            isValid = false;
            errorMessage = CONFIG.messages.message;
            showHint(field, 'message');
          }
          break;
      }
    }

    // Показываем результат
    if (!isValid && value) {
      field.classList.add('is-error');
      showError(field, errorMessage);
    } else if (!isValid && !value && field.required) {
      field.classList.add('is-error');
      showError(field, CONFIG.messages.required);
    } else if (isValid && value) {
      field.classList.add('is-valid');
    }

    // Обновляем лейбл при ошибке
    if (label) {
      if (field.classList.contains('is-error')) {
        label.style.color = '#ff7c7c';
      } else {
        label.style.color = '';
      }
    }

    return isValid;
  }

  // ── Валидация всей формы ──
  function validateForm(form) {
    const fields = form.querySelectorAll('[data-validate], [required]');
    let isValid = true;

    fields.forEach(field => {
      // Для телефона сначала форматируем
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

  // ── Обработчики событий ──
  function initForm(form) {
    // Все поля с валидацией
    const fields = form.querySelectorAll('[data-validate], [required]');

    fields.forEach(field => {
      // Валидация при вводе
      field.addEventListener('input', function() {
        // Для телефона — форматирование
        if (this.dataset.validate === 'phone' || this.type === 'tel') {
          const clean = formatPhone(this);
          // Валидируем только если введено достаточно цифр
          if (clean.length >= 11) {
            validateField(this);
          } else if (clean.length > 0) {
            // Показываем подсказку при вводе
            this.classList.remove('is-error', 'is-valid');
            const error = this.parentElement.querySelector('.field-error');
            if (error) error.remove();
            showHint(this, 'phone');
          } else {
            clearErrors(this);
          }
        } else {
          validateField(this);
        }
      });

      // Валидация при потере фокуса
      field.addEventListener('blur', function() {
        // Для телефона проверяем, если есть хоть что-то
        if (this.dataset.validate === 'phone' || this.type === 'tel') {
          const clean = this.value.replace(/\D/g, '');
          if (clean.length > 0) {
            if (clean.length < 11) {
              this.classList.add('is-error');
              showError(this, CONFIG.messages.phone);
              showHint(this, 'phone');
            } else {
              validateField(this);
            }
          }
        } else {
          if (this.value.trim() || this.required) {
            validateField(this);
          }
        }
      });

      // Очистка ошибок при фокусе
      field.addEventListener('focus', function() {
        clearErrors(this);
        // Показываем подсказку для пустых полей
        if (!this.value.trim()) {
          const type = this.dataset.validate || this.type;
          if (['name', 'phone', 'email', 'message'].includes(type)) {
            showHint(this, type);
          }
        }
      });
    });

    // Валидация при отправке
    form.addEventListener('submit', function(e) {
      // Для телефона проверяем все поля перед отправкой
      const phoneFields = this.querySelectorAll('[data-validate="phone"], input[type="tel"]');
      phoneFields.forEach(field => {
        const clean = field.value.replace(/\D/g, '');
        if (clean.length > 0 && clean.length < 11) {
          field.classList.add('is-error');
          showError(field, CONFIG.messages.phone);
          showHint(field, 'phone');
        } else if (clean.length >= 11) {
          validateField(field);
        }
      });

      if (!validateForm(this)) {
        e.preventDefault();
        // Прокручиваем к первому полю с ошибкой
        const firstError = this.querySelector('.is-error');
        if (firstError) {
          firstError.focus();
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return false;
      }
    });
  }

  // ── Инициализация всех форм ──
  function initAllForms() {
    // Конфигуратор (модалка)
    const modalForm = document.getElementById('modalContactForm');
    if (modalForm) initForm(modalForm);

    // Контакты (основная форма)
    const contactForm = document.getElementById('contactForm');
    if (contactForm) initForm(contactForm);
  }

  // ── Запуск ──
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllForms);
  } else {
    initAllForms();
  }

})();