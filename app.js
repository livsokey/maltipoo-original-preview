'use strict';
(() => {
  const $=(selector,scope=document)=>scope.querySelector(selector);
  const $$=(selector,scope=document)=>[...scope.querySelectorAll(selector)];
  const escapeHTML=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const manager='https://t.me/mariya_robbi';
  const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
  const questions=[
    {key:'size',title:'Какой размер щенка вам ближе?',options:[['Микро','Ориентир веса: 1,5–2,5 кг'],['Мини','Ориентир веса: 2,5–3,5 кг'],['Стандарт','Ориентир веса: 3,5+ кг'],['Пока не знаю','Поможем определиться.']]},
    {key:'purpose',title:'Для кого выбираете щенка?',options:[['Для себя',''],['В подарок','']]},
    {key:'gender',title:'Мальчик или девочка?',options:[['Мальчик',''],['Девочка',''],['Не принципиально','']]},
    {key:'color',title:'Какой окрас вам нравится?',options:[['Платиновый (белый)',''],['Абрикосовый',''],['Редбраун (коричневый)',''],['Кремовый',''],['Серый',''],['Чёрный',''],['Ещё не решил(-а)','']]},
    {key:'timing',title:'Когда планируете забрать малыша?',options:[['Сейчас',''],['До 2 недель',''],['Ещё выбираю',''],['Не срочно','']]}
  ];
  const answers={};let step=0,advanceTimer=null;
  function telegramDraft(photo=''){
    const text=['Здравствуйте! Хочу получить подборку щенков с ценами.'];
    questions.forEach(q=>{if(answers[q.key])text.push(q.title+' '+answers[q.key]);});
    if(photo)text.push('Интересует щенок на фото: '+new URL(photo,location.href).href);
    return manager+'?text='+encodeURIComponent(text.join('\n'));
  }
  function focusQuizHeading(){
    const heading=$('legend,h3',$('#quiz-stage'));if(!heading)return;
    heading.focus({preventScroll:true});
    requestAnimationFrame(()=>{const rect=heading.getBoundingClientRect();if(rect.top<24||rect.bottom>innerHeight-24)heading.scrollIntoView({block:'start',behavior:reduced()?'instant':'smooth'});});
  }
  function renderQuiz(focus=false){
    clearTimeout(advanceTimer);
    $('#quiz-back').hidden=step===0||step===questions.length;$('#quiz-progress').textContent=step<questions.length?`Вопрос ${step+1} из ${questions.length}`:'Подборка по вашим ответам';
    $('#quiz-progress-bar').value=Math.min(step+1,questions.length);
    if(step<questions.length){
      const q=questions[step];
      $('#quiz-stage').innerHTML=`<fieldset><legend tabindex="-1">${q.title}</legend><div class="quiz-options">${q.options.map(([title,description],i)=>`<button type="button" class="quiz-option" data-answer="${i}" aria-pressed="${answers[q.key]===title}"><strong>${title}</strong>${description?`<small>${description}</small>`:''}<span class="option-indicator" aria-hidden="true"></span></button>`).join('')}</div></fieldset>`;
      $$('[data-answer]',$('#quiz-stage')).forEach(button=>button.addEventListener('click',()=>{
        clearTimeout(advanceTimer);answers[q.key]=q.options[Number(button.dataset.answer)][0];
        $$('[data-answer]',$('#quiz-stage')).forEach(other=>other.setAttribute('aria-pressed',String(other===button)));
        advanceTimer=setTimeout(()=>{step++;renderQuiz(true);},180);
      }));
      if(focus)focusQuizHeading();
    }else{
      $('#quiz-stage').innerHTML=`<div class="quiz-result"><h3 tabindex="-1">Посмотрим, кто вам подойдёт</h3><p>Перейдите в Telegram и отправьте свои пожелания. Пришлём актуальные фото, видео и цены.</p><ul>${questions.map(q=>`<li>${escapeHTML(answers[q.key]||'Не выбрано')}</li>`).join('')}</ul><a class="button" href="${telegramDraft()}" target="_blank" rel="noopener noreferrer">Продолжить в Telegram ↗</a><button type="button" class="quiz-edit" id="quiz-edit">Изменить ответы</button></div>`;
      $('#quiz-edit').addEventListener('click',()=>{step=0;renderQuiz(true);});
      if(focus)focusQuizHeading();
    }
  }
  $('#quiz-back').addEventListener('click',()=>{clearTimeout(advanceTimer);if(step>0){step--;renderQuiz(true);}});
  $$('[data-size]').forEach(button=>button.addEventListener('click',()=>{
    $$('[data-size]').forEach(other=>{const active=other===button;other.classList.toggle('active',active);other.setAttribute('aria-pressed',String(active));});
    clearTimeout(advanceTimer);answers.size=button.dataset.size==='Любой'?'Пока не знаю':button.dataset.size;
    step=0;renderQuiz();$('#selection').scrollIntoView({behavior:reduced()?'instant':'smooth'});
  }));
  $$('[data-inquire]').forEach(link=>link.addEventListener('click',()=>{link.href=telegramDraft(link.dataset.inquire);}));
  const menu=$('.menu-toggle'),nav=$('#navigation');
  const closeMenu=()=>{menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Открыть меню');nav.classList.remove('is-open');document.documentElement.classList.remove('menu-open');document.body.classList.remove('menu-open');};
  menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';if(!open){closeMenu();return;}menu.setAttribute('aria-expanded','true');menu.setAttribute('aria-label','Закрыть меню');nav.classList.add('is-open');document.documentElement.classList.add('menu-open');document.body.classList.add('menu-open');$('a',nav)?.focus({preventScroll:true});});
  document.addEventListener('pointerdown',event=>{if(nav.classList.contains('is-open')&&!nav.contains(event.target)&&!menu.contains(event.target))closeMenu();});
  document.addEventListener('focusin',event=>{if(nav.classList.contains('is-open')&&!nav.contains(event.target)&&!menu.contains(event.target))closeMenu();});
  addEventListener('resize',()=>{if(innerWidth>900)closeMenu();});
  $$('a',nav).forEach(link=>link.addEventListener('click',closeMenu));
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&nav.classList.contains('is-open')){closeMenu();menu.focus();}});
  const rails=[...new Set($$('[data-rail]').map(b=>b.dataset.rail))];
  function updateRail(id){const rail=document.getElementById(id);$(`[data-rail="${id}"][data-direction="-1"]`).disabled=rail.scrollLeft<=2;$(`[data-rail="${id}"][data-direction="1"]`).disabled=rail.scrollLeft+rail.clientWidth>=rail.scrollWidth-2;}
  $$('[data-rail]').forEach(button=>button.addEventListener('click',()=>{const rail=document.getElementById(button.dataset.rail);rail.scrollBy({left:Number(button.dataset.direction)*(rail.firstElementChild.getBoundingClientRect().width+(parseFloat(getComputedStyle(rail).columnGap)||20)),behavior:reduced()?'instant':'smooth'});}));
  rails.forEach(id=>document.getElementById(id).addEventListener('scroll',()=>updateRail(id),{passive:true}));
  addEventListener('resize',()=>rails.forEach(updateRail));
  const dialog=$('#image-dialog');let images=[],imageIndex=0,opener=null,dialogHistory=false;
  function renderImage(){
    const source=images[imageIndex],group=source.dataset.group,catalog=group==='catalog',reviews=group==='reviews';
    dialog.dataset.kind=group;$('#dialog-image').src=source.dataset.lightbox;$('#dialog-image').alt=source.dataset.caption;
    $('#image-dialog-title').textContent=catalog?'Познакомиться со щенком':source.dataset.caption;
    $('#image-counter').textContent=`${imageIndex+1} / ${images.length}`;
    $('#catalog-detail').hidden=!catalog;$('#image-inquire').hidden=reviews;$('#image-select').hidden=!catalog;
    $('#image-inquire').textContent=catalog?'Узнать об этом щенке в Telegram ↗':'Спросить о щенке в Telegram ↗';
    $('#image-inquire').href=telegramDraft(source.dataset.lightbox);
  }
  function closeDialog(){if(dialogHistory){history.back();}else dialog.close();}
  $$('[data-lightbox]').forEach(button=>button.addEventListener('click',()=>{
    opener=button;images=$$(`[data-group="${button.dataset.group}"][data-lightbox]`);imageIndex=images.indexOf(button);renderImage();
    closeMenu();dialog.showModal();pauseBackgroundVideos();document.body.classList.add('dialog-open');history.pushState({...history.state,maltipooViewer:true},'');dialogHistory=true;$('#dialog-close').focus();
  }));
  $$('[data-card-details]').forEach(button=>button.addEventListener('click',()=>{button.closest('.catalog-card').querySelector('[data-lightbox]').click();opener=button;}));
  $('#dialog-close').addEventListener('click',closeDialog);
  $('#image-prev').addEventListener('click',()=>{imageIndex=(imageIndex-1+images.length)%images.length;renderImage();});
  $('#image-next').addEventListener('click',()=>{imageIndex=(imageIndex+1)%images.length;renderImage();});
  dialog.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'){event.preventDefault();$('#image-prev').click();}if(event.key==='ArrowRight'){event.preventDefault();$('#image-next').click();}});
  dialog.addEventListener('cancel',event=>{event.preventDefault();closeDialog();});
  dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closeDialog();});
  let goSelection=false;
  $('#image-select').addEventListener('click',()=>{goSelection=true;closeDialog();});
  dialog.addEventListener('close',()=>{document.body.classList.remove('dialog-open');resumeBackgroundVideos();opener?.focus({preventScroll:true});if(goSelection){goSelection=false;$('#selection').scrollIntoView({behavior:reduced()?'instant':'smooth'});}});
  addEventListener('popstate',()=>{if(dialog.open){dialogHistory=false;dialog.close();}});
  $('#gallery-more').addEventListener('click',event=>{const open=event.currentTarget.getAttribute('aria-expanded')!=='true';$('#gallery-extra').hidden=!open;event.currentTarget.setAttribute('aria-expanded',String(open));event.currentTarget.textContent=open?'Свернуть галерею ↑':'Показать ещё →';});
  const videos=$$('video'),states=new Map();
  const lowData=()=>Boolean(navigator.connection?.saveData)||/^(slow-2g|2g)$/.test(navigator.connection?.effectiveType||'');
  function loadPoster(video){if(video.dataset.poster&&!video.poster)video.poster=video.dataset.poster;}
  function clearVideoError(video){const shell=video.parentElement;shell.classList.remove('video-failed');$$('.video-error',shell).forEach(message=>message.remove());const controls=$('.video-controls',shell);if(controls)controls.hidden=false;}
  function loadVideo(video){loadPoster(video);const retry=video.parentElement.classList.contains('video-failed');clearVideoError(video);if(video.dataset.loaded&&!retry)return;video.dataset.loaded='true';$$('source[data-src]',video).forEach(source=>{source.src=source.dataset.src;});video.load();}
  function updateVideo(video){const state=states.get(video),play=state.play,sound=state.sound;play.textContent=video.paused?'▶':'Ⅱ';play.setAttribute('aria-label',video.paused?'Воспроизвести видео':'Приостановить видео');sound.textContent=video.muted?'Звук выкл.':'Звук вкл.';sound.setAttribute('aria-pressed',String(!video.muted));sound.setAttribute('aria-label',video.muted?'Включить звук':'Выключить звук');}
  function pauseVideo(video){states.get(video).systemPause=true;video.pause();}
  function pauseBackgroundVideos(){videos.forEach(pauseVideo);}
  function resumeBackgroundVideos(){if($$('dialog[open]').length||document.hidden||reduced()||lowData())return;videos.forEach(video=>{const state=states.get(video);if(state.visible&&!state.userPaused){loadVideo(video);video.play().catch(()=>updateVideo(video));}});}
  videos.forEach(video=>{
    const shell=video.parentElement; shell.classList.add('video-shell');
    const controls=document.createElement('div');controls.className='video-controls';controls.innerHTML='<button type="button" class="video-play" aria-label="Воспроизвести видео">▶</button><button type="button" class="video-sound" aria-label="Включить звук" aria-pressed="false">Звук выкл.</button>';
    shell.append(controls);const play=$('.video-play',controls),sound=$('.video-sound',controls);
    states.set(video,{play,sound,visible:false,userPaused:false,systemPause:false});video.muted=true;
    play.addEventListener('click',()=>{const state=states.get(video);if(video.paused){state.userPaused=false;loadVideo(video);video.play().catch(()=>updateVideo(video));}else{state.userPaused=true;video.pause();}});
    sound.addEventListener('click',()=>{const enable=video.muted;videos.forEach(other=>{if(other!==video){other.muted=true;updateVideo(other);}});video.muted=!enable;loadVideo(video);if(enable&&video.paused){states.get(video).userPaused=false;video.play().catch(()=>updateVideo(video));}updateVideo(video);});
    video.addEventListener('pause',()=>{const state=states.get(video);if(!state.systemPause&&!video.ended&&state.visible)state.userPaused=true;state.systemPause=false;updateVideo(video);});
    video.addEventListener('play',()=>{const state=states.get(video);state.userPaused=false;state.systemPause=false;updateVideo(video);});
    video.addEventListener('volumechange',()=>{if(!video.muted)videos.forEach(other=>{if(other!==video)other.muted=true;});updateVideo(video);});
    const showVideoError=event=>{
      // Empty deferred <source> elements can emit errors before a real request exists.
      if(!video.dataset.loaded)return;
      if(event.target.tagName==='SOURCE'&&!event.target.getAttribute('src'))return;
      if(!video.error&&video.networkState!==HTMLMediaElement.NETWORK_NO_SOURCE)return;
      if(shell.classList.contains('video-failed'))return;
      shell.classList.add('video-failed');controls.hidden=true;
      const message=document.createElement('p');message.className='video-error';message.textContent='Не удалось загрузить видео. ';
      const retry=document.createElement('button');retry.type='button';retry.textContent='Повторить';
      retry.addEventListener('click',()=>{states.get(video).userPaused=false;loadVideo(video);video.play().catch(()=>updateVideo(video));});
      const fallback=document.createElement('a');fallback.href=video.dataset.fallback;fallback.target='_blank';fallback.rel='noopener noreferrer';fallback.textContent='Открыть оригинал ↗';
      message.append(retry,document.createTextNode(' · '),fallback);shell.append(message);
    };
    video.addEventListener('error',showVideoError);$$('source',video).forEach(source=>source.addEventListener('error',showVideoError));
    ['loadeddata','canplay'].forEach(eventName=>video.addEventListener(eventName,()=>{clearVideoError(video);updateVideo(video);}));
    updateVideo(video);
  });
  const posterObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){loadPoster(entry.target);posterObserver.unobserve(entry.target);}}),{rootMargin:'400px 0px'});videos.forEach(video=>posterObserver.observe(video));
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{const video=entry.target,state=states.get(video);state.visible=entry.isIntersecting&&entry.intersectionRatio>=.4;
    if(state.visible&&!document.hidden&&!$$('dialog[open]').length&&!state.userPaused&&!reduced()&&!lowData()){loadVideo(video);video.play().catch(()=>updateVideo(video));}
    else if(!state.visible)pauseVideo(video);
  }),{threshold:[0,.4,.75]});videos.forEach(video=>observer.observe(video));
  document.addEventListener('visibilitychange',()=>videos.forEach(video=>{const state=states.get(video);if(document.hidden)pauseVideo(video);else if(state.visible&&!$$('dialog[open]').length&&!state.userPaused&&!reduced()&&!lowData()){loadVideo(video);video.play().catch(()=>updateVideo(video));}}));
  const consultation=$('#consultation-dialog');let consultationOpener=null,consultationHistory=false;
  function setTopic(button){$$('[data-topic]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));$('#consultation-telegram').href=manager+'?text='+encodeURIComponent('Здравствуйте, Мария! '+button.dataset.topic);}
  $$('[data-topic]').forEach(button=>button.addEventListener('click',()=>setTopic(button)));setTopic($('[data-topic]'));
  $$('[data-consultation]').forEach(button=>button.addEventListener('click',()=>{consultationOpener=button;closeMenu();consultation.showModal();pauseBackgroundVideos();document.body.classList.add('dialog-open');history.pushState({...history.state,maltipooConsultation:true},'');consultationHistory=true;$('#consultation-close').focus();}));
  function closeConsultation(){if(consultationHistory)history.back();else consultation.close();}
  $('#consultation-close').addEventListener('click',closeConsultation);consultation.addEventListener('cancel',event=>{event.preventDefault();closeConsultation();});
  consultation.addEventListener('click',event=>{if(event.target!==consultation)return;const r=consultation.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closeConsultation();});
  consultation.addEventListener('close',()=>{document.body.classList.remove('dialog-open');resumeBackgroundVideos();consultationOpener?.focus({preventScroll:true});});
  addEventListener('popstate',()=>{if(consultation.open){consultationHistory=false;consultation.close();}});
  [dialog,consultation].forEach(modal=>modal.addEventListener('keydown',event=>{
    if(event.key!=='Tab')return;
    const focusable=$$('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])',modal).filter(element=>!element.hidden&&element.getClientRects().length>0&&getComputedStyle(element).visibility!=='hidden');
    const first=focusable[0]||$('button',modal),last=focusable[focusable.length-1]||first,active=document.activeElement;
    if(event.shiftKey&&(active===first||!modal.contains(active))){event.preventDefault();last.focus();}
    else if(!event.shiftKey&&(active===last||!modal.contains(active))){event.preventDefault();first.focus();}
  }));
  renderQuiz();rails.forEach(updateRail);
})();
