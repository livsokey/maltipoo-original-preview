'use strict';
(() => {
    const $ = (selector, scope = document) => scope.querySelector(selector);
    const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
    const ASSETS = './assets/media/';
    const puppies = [
        { id: '1788', sex: 'boy', title: 'Мальчик · супермикро', description: 'Прогноз взрослого веса — до 1,5 кг', date: '12 октября 2026', status: 'Наличие и цену уточнит Мария.', cover: './assets/posters/tg-1788.jpg', media: [{ type: 'video', src: ASSETS + 'tg-1788-video.mp4', poster: './assets/posters/tg-1788.jpg' }] },
        { id: '1756', sex: 'girl', title: 'Девочка', description: 'Прогноз взрослого веса — до 3 кг', date: '8 сентября 2026', status: 'Наличие и цену уточнит Мария.', cover: ASSETS + 'tg-1756-photo-05.jpg', media: [5, 1, 2, 3, 4, 6].map(n => ({ type: 'photo', src: ASSETS + `tg-1756-photo-0${n}.jpg` })) },
        { id: '1786', sex: 'boy', title: 'Мальчик', description: 'Прогноз взрослого веса — до 3 кг', date: '22 сентября 2026', status: 'Наличие и цену уточнит Мария.', cover: './assets/posters/tg-1786.jpg', media: [{ type: 'video', src: ASSETS + 'tg-1786-video.mp4', poster: './assets/posters/tg-1786.jpg' }] },
        { id: '1785', sex: 'girl', title: 'Девочка · стандарт', description: 'Окрас пати-колор', date: '22 сентября 2026', status: 'Наличие и цену уточнит Мария.', cover: './assets/posters/tg-1785.jpg', media: [{ type: 'video', src: ASSETS + 'tg-1785-video.mp4', poster: './assets/posters/tg-1785.jpg' }] }
    ];
    const record = (name, detail = {}) => document.dispatchEvent(new CustomEvent('maltipoo:interaction', { detail: { name, ...detail } }));
    let activePuppy = null, mediaIndex = 0, opener = null;
    const dialog = $('#puppy-dialog');
    function renderCatalog(filter = 'all') {
        const shown = puppies.filter(p => filter === 'all' || p.sex === filter);
        $('#puppy-grid').innerHTML = shown.map(p => `<article class="puppy-card"><button class="puppy-cover" data-open-puppy="${p.id}" aria-label="Открыть: ${p.title}, публикация ${p.date}"><img src="${p.cover}" width="600" height="800" alt="${p.title}, кадр из Telegram питомника" loading="lazy"><span class="puppy-label">${p.date.replace(' 2026', '')}</span>${p.media[0].type === 'video' ? '<span class="play-mark" aria-hidden="true">▷</span>' : ''}</button><h3>${p.title}</h3><p class="puppy-description">${p.description}</p><p class="puppy-availability">${p.status}</p><button class="puppy-detail" data-open-puppy="${p.id}">Узнать подробнее <span aria-hidden="true">↗</span></button></article>`).join('');
        $('#catalog-status').textContent = `Щенков в подборке: ${shown.length}`;
        $('#puppy-grid').scrollLeft = 0;
        requestAnimationFrame(() => updateRail('puppy-grid'));
    }
    function renderMedia() {
        const item = activePuppy.media[mediaIndex];
        $$('#dialog-media video').forEach(v => v.pause());
        $('#dialog-media').innerHTML = item.type === 'video' ? `<video controls playsinline preload="metadata" poster="${item.poster}" aria-label="Видео выбранного щенка"><source src="${item.src}" type="video/mp4"></video>` : `<img src="${item.src}" alt="${activePuppy.title}, фотография ${mediaIndex + 1} из публикации" width="600" height="800">`;
        $('#gallery-counter').textContent = `${mediaIndex + 1} / ${activePuppy.media.length}`;
        $('#gallery-prev').disabled = activePuppy.media.length < 2;
        $('#gallery-next').disabled = activePuppy.media.length < 2;
    }
    function openPuppy(id, button) {
        activePuppy = puppies.find(p => p.id === id);
        if (!activePuppy)
            return;
        opener = button;
        mediaIndex = 0;
        $('#dialog-heading').textContent = activePuppy.title;
        $('#dialog-date').textContent = 'Публикация от ' + activePuppy.date;
        $('#dialog-description').textContent = activePuppy.description;
        $('#dialog-status').textContent = activePuppy.status;
        $('#dialog-source').href = 'https://t.me/maltipooTeddi/' + activePuppy.id;
        renderMedia();
        dialog.showModal();
        document.body.classList.add('dialog-open');
        updateSticky();
        record('puppy_open', { post_id: id });
    }
    document.addEventListener('click', event => { const button = event.target.closest('[data-open-puppy]'); if (button)
        openPuppy(button.dataset.openPuppy, button); });
    $$('.filter').forEach(button => button.addEventListener('click', () => { $$('.filter').forEach(b => { b.classList.toggle('active', b === button); b.setAttribute('aria-pressed', String(b === button)); }); renderCatalog(button.dataset.filter); }));
    $('#gallery-prev').addEventListener('click', () => { mediaIndex = (mediaIndex - 1 + activePuppy.media.length) % activePuppy.media.length; renderMedia(); });
    $('#gallery-next').addEventListener('click', () => { mediaIndex = (mediaIndex + 1) % activePuppy.media.length; renderMedia(); });
    $('#dialog-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => { if (event.target === dialog) {
        const box = dialog.getBoundingClientRect();
        if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom)
            dialog.close();
    } });
    dialog.addEventListener('close', () => { $$('video', dialog).forEach(v => v.pause()); document.body.classList.remove('dialog-open'); updateSticky(); if (opener)
        opener.focus({ preventScroll: true }); });
    dialog.addEventListener('keydown', event => { if (event.target.tagName === 'VIDEO')
        return; if (event.key === 'ArrowRight' && activePuppy.media.length > 1) {
        event.preventDefault();
        $('#gallery-next').click();
    } if (event.key === 'ArrowLeft' && activePuppy.media.length > 1) {
        event.preventDefault();
        $('#gallery-prev').click();
    } });
    const questions = [
        { key: 'size', question: 'Какого размера хотите щенка?', options: ['Микро', 'Мини', 'Стандарт', 'Нужна помощь с выбором'] },
        { key: 'sex', question: 'Мальчик или девочка?', options: ['Мальчик', 'Девочка', 'Не принципиально'] },
        { key: 'timing', question: 'Когда планируете забрать малыша?', options: ['Сейчас', 'В ближайшие 2 недели', 'Ещё выбираю', 'Не срочно'] }
    ];
    let step = 0, chosenPost = null;
    const answers = {};
    const contactState = { method: 'telegram', contact: '', name: '', consent: false };
    function escapeHTML(value) { return String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
    function summaryText() { return 'Здравствуйте, Мария! Хочу получить подборку щенков с ценами.\n' + questions.map(q => q.question + ' ' + (answers[q.key] || 'Не выбрано')).join('\n') + (chosenPost ? '\nЗаинтересовал щенок: https://t.me/maltipooTeddi/' + chosenPost : '') + (contactState.name.trim() ? '\nИмя: ' + contactState.name.trim() : '') + '\nДля ответа: ' + ({ telegram: 'Telegram', phone: 'Телефон', max: 'MAX' }[contactState.method]) + ' ' + contactState.contact.trim(); }
    function renderQuiz(focus = false) {
        $('#quiz-error').hidden = true;
        $('#quiz-counter').textContent = step < 3 ? `0${step + 1} / 03` : '03 / 03';
        $('#quiz-progress').style.width = Math.min((step + 1) / 3 * 100, 100) + '%';
        $('#quiz-navigation').hidden = step === 3;
        $('#quiz-back').hidden = step === 0;
        if (step < 3) {
            const q = questions[step];
            $('#quiz-stage').innerHTML = (chosenPost ? `<p class="quiz-context">Вы интересуетесь щенком из выбранной карточки.</p>` : '') + `<fieldset><legend>${q.question}</legend><div class="quiz-options">${q.options.map((option, i) => `<label class="quiz-option"><input type="radio" name="${q.key}" value="${i}" ${answers[q.key] === option ? 'checked' : ''}><span>${option}</span></label>`).join('')}</div></fieldset>`;
            $('#quiz-next').innerHTML = (step === 2 ? 'Оставить контакт' : 'Дальше') + ' <span aria-hidden="true">→</span>';
            $$('input', $('#quiz-stage')).forEach(input => input.addEventListener('change', () => { answers[q.key] = q.options[Number(input.value)]; $('#quiz-error').hidden = true; }));
            if (focus) {
                const el = $('input:checked', $('#quiz-stage')) || $('input', $('#quiz-stage'));
                el.focus({ preventScroll: true });
            }
        }
        else {
            $('#quiz-stage').innerHTML = `<div class="quiz-result"><h3 tabindex="-1">Получите подборку с ценами</h3><p class="result-intro">Отправьте сообщение Марии в Telegram — она пришлёт фото, видео и цены.</p><ul>${questions.map(q => `<li>${escapeHTML(answers[q.key])}</li>`).join('')}${chosenPost ? `<li>Выбранный щенок</li>` : ''}</ul><form id="lead-form" novalidate><fieldset class="contact-method"><legend>Как с вами связаться?</legend><label><input type="radio" name="contact-method" value="telegram" ${contactState.method === 'telegram' ? 'checked' : ''}> Telegram</label><label><input type="radio" name="contact-method" value="phone" ${contactState.method === 'phone' ? 'checked' : ''}> Телефон</label><label><input type="radio" name="contact-method" value="max" ${contactState.method === 'max' ? 'checked' : ''}> MAX</label></fieldset><label class="form-label" for="lead-contact" id="contact-label">${contactState.method === 'telegram' ? 'Ваш Telegram' : 'Номер телефона'}</label><input id="lead-contact" class="form-input" name="contact" value="${escapeHTML(contactState.contact)}" type="${contactState.method !== 'telegram' ? 'tel' : 'text'}" autocomplete="${contactState.method !== 'telegram' ? 'tel' : 'off'}" placeholder="${contactState.method !== 'telegram' ? '+7 999 123-45-67' : '@username'}" aria-describedby="lead-error"><label class="form-label" for="lead-name">Ваше имя <span>· необязательно</span></label><input id="lead-name" class="form-input" name="name" value="${escapeHTML(contactState.name)}" autocomplete="given-name"><label class="consent-label"><input type="checkbox" id="lead-consent" ${contactState.consent ? 'checked' : ''}><span>Соглашаюсь на <a href="https://maltipoo-original.com/politika-konfidencialnosti.html" target="_blank" rel="noopener noreferrer">обработку персональных данных</a>.</span></label><p id="lead-error" class="quiz-error" role="alert" hidden></p><button class="button" type="submit">Продолжить в Telegram <span aria-hidden="true">↗</span></button></form><div class="quiz-result-actions"><button type="button" id="quiz-edit">← Изменить ответы</button></div><button class="quiz-reset" id="quiz-reset" type="button">Начать заново</button></div>`;
            $('#quiz-edit').addEventListener('click', () => { saveContact(); step = 2; renderQuiz(true); });
            $('#quiz-reset').addEventListener('click', () => { for (const key of Object.keys(answers))
                delete answers[key]; chosenPost = null; step = 0; contactState.method = 'telegram'; contactState.contact = ''; contactState.name = ''; contactState.consent = false; renderQuiz(true); });
            $$('input[name="contact-method"]').forEach(input => input.addEventListener('change', () => { saveContact(); contactState.method = input.value; contactState.contact = ''; renderQuiz(); $('#lead-contact').focus({ preventScroll: true }); }));
            $('#lead-form').addEventListener('input', saveContact);
            $('#lead-form').addEventListener('change', saveContact);
            $('#lead-form').addEventListener('submit', submitLead);
            if (focus)
                $('h3', $('#quiz-stage')).focus({ preventScroll: true });
            record('selection_summary');
        }
    }
    function saveContact() { const contact = $('#lead-contact'); if (!contact)
        return; contactState.contact = contact.value; contactState.name = $('#lead-name').value; contactState.consent = $('#lead-consent').checked; }
    function submitLead(event) {
        event.preventDefault();
        saveContact();
        const value = contactState.contact.trim(), error = $('#lead-error');
        let message = '', invalidField = null;
        if (contactState.method !== 'telegram' && (!/^\+?[\d\s()\-]{10,22}$/.test(value) || value.replace(/\D/g, '').length < 10 || value.replace(/\D/g, '').length > 15)) {
            message = 'Укажите номер телефона с кодом страны.';
            invalidField = $('#lead-contact');
        }
        if (contactState.method === 'telegram' && !/^@?[A-Za-z][A-Za-z0-9_]{4,31}$/.test(value)) {
            message = 'Укажите Telegram в формате @username.';
            invalidField = $('#lead-contact');
        }
        if (!message && !contactState.consent) {
            message = 'Подтвердите согласие на обработку персональных данных.';
            invalidField = $('#lead-consent');
        }
        error.textContent = message;
        error.hidden = !message;
        $('#lead-contact').setAttribute('aria-invalid', String(invalidField === $('#lead-contact')));
        if (message) {
            invalidField.focus({ preventScroll: true });
            return;
        }
        const telegramUrl = 'https://t.me/mariya_robbi?text=' + encodeURIComponent(summaryText());
        record('lead_telegram_open');
        window.location.assign(telegramUrl);
    }
    $('#quiz-next').addEventListener('click', () => { const q = questions[step]; if (!answers[q.key]) {
        $('#quiz-error').hidden = false;
        return;
    } step++; renderQuiz(true); record('selection_step', { step }); });
    $('#quiz-back').addEventListener('click', () => { if (step > 0) {
        step--;
        renderQuiz(true);
    } });
    $('#dialog-select').addEventListener('click', () => { chosenPost = activePuppy.id; dialog.close(); step = 0; renderQuiz(); $('#selection').scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }); });
    const menu = $('.menu-toggle'), nav = $('#navigation');
    function closeMenu() { menu.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-label', 'Открыть меню'); nav.classList.remove('is-open'); }
    menu.addEventListener('click', () => { const opened = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded', String(opened)); menu.setAttribute('aria-label', opened ? 'Закрыть меню' : 'Открыть меню'); nav.classList.toggle('is-open', opened); });
    $$('a', nav).forEach(a => a.addEventListener('click', closeMenu));
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        closeMenu();
        menu.focus();
    } });
    const visible = { hero: true, selection: false, footer: false };
    function updateSticky() { const sticky = $('#sticky-selection'); if (!sticky)
        return; sticky.hidden = !window.matchMedia('(max-width:600px)').matches || visible.hero || visible.selection || visible.footer || !!document.querySelector('dialog[open]'); }
    const observer = new IntersectionObserver(entries => { entries.forEach(entry => { if (entry.target.id === 'top')
        visible.hero = entry.isIntersecting; if (entry.target.id === 'selection')
        visible.selection = entry.isIntersecting; if (entry.target.id === 'contacts')
        visible.footer = entry.isIntersecting; }); updateSticky(); }, { threshold: 0 });
    ['#top', '#selection', '#contacts'].forEach(selector => observer.observe($(selector)));
    window.addEventListener('resize', updateSticky);
    document.addEventListener('play', event => { if (event.target.tagName !== 'VIDEO')
        return; record('video_play'); $$('video').forEach(other => { if (other !== event.target)
        other.pause(); }); }, true);
    document.addEventListener('click', event => { const link = event.target.closest('a'); if (!link)
        return; if (link.getAttribute('href') === '#selection')
        record('selection_start'); if (link.href.startsWith('https://t.me/'))
        record('telegram_click'); });
    // Native, swipeable rails. Controls never auto-advance or play media.
    const railIds = [...new Set($$('[data-rail]').map(button => button.dataset.rail))];
    function updateRail(id) { const rail = document.getElementById(id); if (!rail)
        return; const previous = $(`[data-rail="${id}"][data-direction="-1"]`), next = $(`[data-rail="${id}"][data-direction="1"]`); previous.disabled = rail.scrollLeft <= 2; next.disabled = rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 2; }
    $$('[data-rail]').forEach(button => button.addEventListener('click', () => { const rail = document.getElementById(button.dataset.rail); const card = rail.firstElementChild; const gap = parseFloat(getComputedStyle(rail).columnGap) || 24; rail.scrollBy({ left: Number(button.dataset.direction) * (card.getBoundingClientRect().width + gap), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }); }));
    railIds.forEach(id => { const rail = document.getElementById(id); rail.addEventListener('scroll', () => updateRail(id), { passive: true }); updateRail(id); });
    window.addEventListener('resize', () => railIds.forEach(updateRail));
    const imageDialog = $('#image-dialog');
    let imageOpener = null, imageItems = [], imageIndex = 0;
    function renderImage() { const button = imageItems[imageIndex]; $('#image-dialog-title').textContent = button.dataset.caption; $('#image-dialog-img').src = button.dataset.lightbox; $('#image-dialog-img').alt = button.dataset.caption; $('#image-counter').textContent = `${imageIndex + 1} / ${imageItems.length}`; }
    document.addEventListener('click', event => { const button = event.target.closest('[data-lightbox]'); if (!button)
        return; imageOpener = button; const group = button.closest('#review-rail') || button.closest('.gallery-grid'); imageItems = $$('[data-lightbox]', group); imageIndex = imageItems.indexOf(button); renderImage(); imageDialog.showModal(); document.body.classList.add('dialog-open'); updateSticky(); });
    $('#image-dialog-close').addEventListener('click', () => imageDialog.close());
    $('#image-prev').addEventListener('click', () => { imageIndex = (imageIndex - 1 + imageItems.length) % imageItems.length; renderImage(); });
    $('#image-next').addEventListener('click', () => { imageIndex = (imageIndex + 1) % imageItems.length; renderImage(); });
    imageDialog.addEventListener('keydown', e => { if (e.key === 'ArrowLeft')
        $('#image-prev').click(); if (e.key === 'ArrowRight')
        $('#image-next').click(); });
    imageDialog.addEventListener('click', e => { if (e.target === imageDialog) {
        const r = imageDialog.getBoundingClientRect();
        if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom)
            imageDialog.close();
    } });
    imageDialog.addEventListener('close', () => { document.body.classList.remove('dialog-open'); updateSticky(); if (imageOpener)
        imageOpener.focus({ preventScroll: true }); });
    $('#gallery-more').addEventListener('click', e => { const button = e.currentTarget, expanded = button.getAttribute('aria-expanded') === 'true'; $$('.gallery-item').forEach((item, i) => { if (i >= 6)
        item.hidden = expanded; }); button.setAttribute('aria-expanded', String(!expanded)); button.innerHTML = expanded ? 'Показать больше малышей <span aria-hidden="true">↗</span>' : 'Свернуть галерею <span aria-hidden="true">↑</span>'; });
    renderCatalog();
    renderQuiz();
})();
