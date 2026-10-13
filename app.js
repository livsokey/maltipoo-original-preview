'use strict';
(() => {
  const $=(selector,scope=document)=>scope.querySelector(selector);
  const $$=(selector,scope=document)=>[...scope.querySelectorAll(selector)];
  const escapeHTML=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const manager='https://t.me/mariya_robbi';
  const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
  const questions=[
    {key:'size',title:'Щенок какого размера вам нужен?',options:[['Микро','Ориентир веса: 1,5–2,5 кг'],['Мини','Ориентир веса: 2,5–3,5 кг'],['Стандарт','Ориентир веса: 3,5+ кг'],['Ещё не решил(-а)','Мария поможет с выбором.']]},
    {key:'sex',title:'Мальчик или девочка?',options:[['Мальчик',''],['Девочка',''],['Не принципиально','']]},
    {key:'timing',title:'Когда планируете забрать малыша?',options:[['Сейчас',''],['В ближайшие 2 недели',''],['Ещё выбираю',''],['Не срочно','']]}
  ];
  const answers={};let step=0;
  const contact={name:'',value:'',consent:false};
  function telegramDraft(photo=''){
    const text=['Здравствуйте, Мария! Хочу получить подборку щенков с ценами.'];
    questions.forEach(q=>{if(answers[q.key])text.push(q.title+' '+answers[q.key]);});
    if(photo)text.push('Интересует щенок: '+new URL(photo,location.href).href);
    if(contact.name.trim())text.push('Имя: '+contact.name.trim());
    if(contact.value.trim())text.push('Контакт: '+contact.value.trim());
    return manager+'?text='+encodeURIComponent(text.join('\n'));
  }
  function saveContact(){if(!$('#lead-contact'))return;contact.name=$('#lead-name').value;contact.value=$('#lead-contact').value;contact.consent=$('#lead-consent').checked;}
  function renderQuiz(focus=false){
    $('#quiz-error').hidden=true;$('#quiz-navigation').hidden=step===questions.length;$('#quiz-back').hidden=step===0;
    if(step<questions.length){
      const q=questions[step];
      $('#quiz-stage').innerHTML=`<fieldset><legend>${q.title}</legend><div class="quiz-options">${q.options.map(([title,description],i)=>`<label class="quiz-option"><input type="radio" name="${q.key}" value="${i}" ${answers[q.key]===title?'checked':''}><strong>${title}</strong>${description?`<small>${description}</small>`:''}</label>`).join('')}</div></fieldset>`;
      $$('input',$('#quiz-stage')).forEach(input=>input.addEventListener('change',()=>{answers[q.key]=q.options[Number(input.value)][0];$('#quiz-error').hidden=true;}));
      $('#quiz-next').setAttribute('aria-label',step===2?'Перейти к контактам':'Следующий вопрос');
      if(focus)($('input:checked',$('#quiz-stage'))||$('input',$('#quiz-stage'))).focus({preventScroll:true});
    }else{
      $('#quiz-stage').innerHTML=`<div class="quiz-result"><h3 tabindex="-1">Получите подборку с ценами</h3><p>Отправьте сообщение Марии в Telegram — она пришлёт фото, видео и цены.</p><ul>${questions.map(q=>`<li>${escapeHTML(answers[q.key])}</li>`).join('')}</ul><form id="lead-form" novalidate><label class="form-label" for="lead-contact">Ваш Telegram или телефон</label><input class="form-input" id="lead-contact" name="contact" autocomplete="off" placeholder="@username или +7 999 123-45-67" value="${escapeHTML(contact.value)}" aria-describedby="lead-error"><label class="form-label" for="lead-name">Ваше имя · необязательно</label><input class="form-input" id="lead-name" name="name" autocomplete="given-name" value="${escapeHTML(contact.name)}"><label class="consent"><input id="lead-consent" type="checkbox" ${contact.consent?'checked':''}><span>Соглашаюсь на <a href="https://maltipoo-original.com/politika-konfidencialnosti.html" target="_blank" rel="noopener noreferrer">обработку персональных данных</a>.</span></label><p class="error" id="lead-error" role="alert" hidden></p><button class="button" type="submit">Продолжить в Telegram ↗</button></form><button type="button" class="quiz-edit" id="quiz-edit">← Изменить ответы</button></div>`;
      $('#quiz-edit').addEventListener('click',()=>{saveContact();step=0;renderQuiz(true);});
      $('#lead-form').addEventListener('input',saveContact);$('#lead-form').addEventListener('change',saveContact);
      $('#lead-form').addEventListener('submit',event=>{
        event.preventDefault();saveContact();const value=contact.value.trim();let error='',invalid=null;
        const telegram=/^@?[A-Za-z][A-Za-z0-9_]{4,31}$/.test(value);
        const phone=/^\+?[\d\s()\-]{10,22}$/.test(value)&&value.replace(/\D/g,'').length>=10&&value.replace(/\D/g,'').length<=15;
        if(!telegram&&!phone){error='Укажите Telegram в формате @username или номер телефона с кодом страны.';invalid=$('#lead-contact');}
        else if(!contact.consent){error='Подтвердите согласие на обработку персональных данных.';invalid=$('#lead-consent');}
        $('#lead-error').textContent=error;$('#lead-error').hidden=!error;$('#lead-contact').setAttribute('aria-invalid',String(invalid===$('#lead-contact')));
        if(error){invalid.focus({preventScroll:true});return;}
        window.location.assign(telegramDraft());
      });
      if(focus)$('h3',$('#quiz-stage')).focus({preventScroll:true});
    }
  }
  $('#quiz-next').addEventListener('click',()=>{if(!answers[questions[step].key]){$('#quiz-error').hidden=false;return;}step++;renderQuiz(true);});
  $('#quiz-back').addEventListener('click',()=>{if(step>0){step--;renderQuiz(true);}});
  // These controls set a requested size; photos have no unverified size assignments.
  $$('[data-size]').forEach(button=>button.addEventListener('click',()=>{
    $$('[data-size]').forEach(other=>{const active=other===button;other.classList.toggle('active',active);other.setAttribute('aria-pressed',String(active));});
    saveContact();
    answers.size=button.dataset.size==='Любой'?'Ещё не решил(-а)':button.dataset.size;
    step=0;renderQuiz();
    $('#selection').scrollIntoView({behavior:reduced()?'instant':'smooth'});
  }));
  $$('[data-inquire]').forEach(link=>link.addEventListener('click',()=>{link.href=telegramDraft(link.dataset.inquire);}));
  const menu=$('.menu-toggle'),nav=$('#navigation');
  const closeMenu=()=>{menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Открыть меню');nav.classList.remove('is-open');};
  menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Закрыть меню':'Открыть меню');nav.classList.toggle('is-open',open);});
  $$('a',nav).forEach(link=>link.addEventListener('click',closeMenu));
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&nav.classList.contains('is-open')){closeMenu();menu.focus();}});
  const rails=[...new Set($$('[data-rail]').map(b=>b.dataset.rail))];
  function updateRail(id){const rail=document.getElementById(id);$(`[data-rail="${id}"][data-direction="-1"]`).disabled=rail.scrollLeft<=2;$(`[data-rail="${id}"][data-direction="1"]`).disabled=rail.scrollLeft+rail.clientWidth>=rail.scrollWidth-2;}
  $$('[data-rail]').forEach(button=>button.addEventListener('click',()=>{const rail=document.getElementById(button.dataset.rail);rail.scrollBy({left:Number(button.dataset.direction)*(rail.firstElementChild.getBoundingClientRect().width+(parseFloat(getComputedStyle(rail).columnGap)||20)),behavior:reduced()?'instant':'smooth'});}));
  rails.forEach(id=>document.getElementById(id).addEventListener('scroll',()=>updateRail(id),{passive:true}));
  addEventListener('resize',()=>rails.forEach(updateRail));
  const dialog=$('#image-dialog');let images=[],imageIndex=0,opener=null;
  function renderImage(){const source=images[imageIndex];$('#dialog-image').src=source.dataset.lightbox;$('#dialog-image').alt=source.dataset.caption;$('#image-dialog-title').textContent=source.dataset.caption;$('#image-counter').textContent=`${imageIndex+1} / ${images.length}`;$('#image-inquire').hidden=source.dataset.group==='reviews';$('#image-inquire').href=telegramDraft(source.dataset.lightbox);}
  $$('[data-lightbox]').forEach(button=>button.addEventListener('click',()=>{opener=button;images=$$(`[data-group="${button.dataset.group}"][data-lightbox]`);imageIndex=images.indexOf(button);renderImage();dialog.showModal();document.body.classList.add('dialog-open');}));
  $('#dialog-close').addEventListener('click',()=>dialog.close());
  $('#image-prev').addEventListener('click',()=>{imageIndex=(imageIndex-1+images.length)%images.length;renderImage();});
  $('#image-next').addEventListener('click',()=>{imageIndex=(imageIndex+1)%images.length;renderImage();});
  dialog.addEventListener('keydown',event=>{if(event.key==='ArrowLeft')$('#image-prev').click();if(event.key==='ArrowRight')$('#image-next').click();});
  dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();});
  dialog.addEventListener('close',()=>{document.body.classList.remove('dialog-open');opener?.focus({preventScroll:true});});
  $('#gallery-more').addEventListener('click',event=>{const open=event.currentTarget.getAttribute('aria-expanded')!=='true';$('#gallery-extra').hidden=!open;event.currentTarget.setAttribute('aria-expanded',String(open));event.currentTarget.textContent=open?'Свернуть галерею ↑':'Показать ещё →';});
  document.addEventListener('play',event=>{if(event.target.tagName==='VIDEO')$$('video').forEach(video=>{if(video!==event.target)video.pause();});},true);
  renderQuiz();rails.forEach(updateRail);
})();
