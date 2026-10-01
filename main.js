(function(){
  'use strict';
  var $=function(s,r){return (r||document).querySelector(s)};
  var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
  var fmt=function(n){return new Intl.NumberFormat('ru-RU').format(n)+' ₽'};
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Прайс-лист с suntopia.ru */
  var SERVICES=[
    {id:'antic',name:'Антицеллюлитный массаж',len:'1 час',price:5500,desc:'Убирает лишние сантиметры и отёчность, тонизирует кожу - она становится глаже и упруже.'},
    {id:'sport',name:'Спортивный массаж',len:'1 час',price:5000,desc:'Восстановление мышц, профилактика травм и рост выносливости.'},
    {id:'relax',name:'Релакс массаж',len:'1 час',price:4500,desc:'Глубокое расслабление: снимает напряжение и возвращает силы.'},
    {id:'lymph',name:'Лимфодренажный массаж',len:'1 час',price:4500,desc:'Выводит отёки и токсины, дарит лёгкость и энергию.'},
    {id:'preg',name:'Массаж для беременных',len:'50 минут',price:4000,desc:'Бережная работа с шейно-воротниковой зоной, руками и ногами - на боку или сидя.'},
    {id:'face',name:'Массаж лица',len:'40 минут',price:3000,desc:'Сияющая кожа и свежий, отдохнувший вид.'},
    {id:'back',name:'Массаж спины',len:'30 минут',price:3000,desc:'Снимает боль и напряжение, возвращает подвижность.'},
    {id:'legs',name:'Массаж ног',len:'30 минут',price:3000,desc:'Отдых для уставших ног: лёгкость и комфорт.'},
    {id:'neck',name:'Массаж шейно-воротниковой зоны',len:'20 минут',price:2500,desc:'Убирает боль в шее и головную боль, снимает напряжение.'},
    {id:'feet',name:'Массаж стоп',len:'20 минут',price:2000,desc:'Лёгкость в каждом шаге - расслабление и тонус.'}
  ];
  var ZONES=[
    {id:'neck',label:'Шея и плечи',svc:'neck',groups:['neck']},
    {id:'back',label:'Спина',svc:'back',groups:['upper','lower']},
    {id:'legs',label:'Ноги',svc:'legs',groups:['legs']},
    {id:'feet',label:'Стопы',svc:'feet',groups:['feet']},
    {id:'all',label:'Всё тело',svc:'relax',groups:['neck','upper','lower','legs','feet']}
  ];
  function svcById(id){return SERVICES.filter(function(s){return s.id===id})[0]}

  /* Шапка + прогресс прокрутки */
  var top=$('#top'),burger=$('#burger'),prog=$('#progress');
  function onScroll(){
    var y=window.scrollY||0,h=document.documentElement.scrollHeight-innerHeight;
    prog.style.width=(h>0?y/h*100:0)+'%';
  }
  window.addEventListener('scroll',onScroll,{passive:true});onScroll();
  burger.addEventListener('click',function(){
    var o=top.classList.toggle('open');
    burger.setAttribute('aria-expanded',o);
    burger.setAttribute('aria-label',o?'Закрыть меню':'Открыть меню');
  });
  $$('#nav a').forEach(function(a){a.addEventListener('click',function(){top.classList.remove('open');burger.setAttribute('aria-expanded','false')})});

  /* Форма: выбор услуги и переход к записи */
  var fSvc=$('#fSvc');
  fSvc.innerHTML='<option value="">Подберите мне массаж</option>'+SERVICES.map(function(s){return '<option value="'+s.id+'">'+s.name+', '+s.len+', '+fmt(s.price)+'</option>'}).join('');
  function goBook(id){
    fSvc.value=id;
    $('#zapis').scrollIntoView({behavior:reduce?'auto':'smooth'});
    setTimeout(function(){var n=$('input[name=name]');if(n)n.focus({preventScroll:true})},600);
  }
  var d=new Date(),pad=function(n){return (n<10?'0':'')+n};
  $('#fDate').min=d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());

  /* Список услуг */
  var svc=$('#svc');
  svc.innerHTML=SERVICES.map(function(s){
    return '<li class="row" id="svc-'+s.id+'"><div><h3>'+s.name+'</h3><p>'+s.desc+'</p></div>'
      +'<span class="len">'+s.len+'</span><span class="cost">'+fmt(s.price)+'</span>'
      +'<button class="btn sm" type="button" data-book="'+s.id+'">Записаться</button></li>';
  }).join('');
  svc.addEventListener('click',function(e){
    var b=e.target.closest('[data-book]');if(b)goBook(b.dataset.book);
  });

  /* Карта тела */
  var zonesBox=$('#zones'),rec=$('#rec');
  zonesBox.innerHTML=ZONES.map(function(z){return '<button type="button" data-z="'+z.id+'" aria-pressed="false">'+z.label+'</button>'}).join('');
  function selectZone(id){
    var z=ZONES.filter(function(x){return x.id===id})[0],s=svcById(z.svc);
    $$('#zones button').forEach(function(b){b.setAttribute('aria-pressed',b.dataset.z===id)});
    $$('#map .z').forEach(function(g){g.classList.toggle('on',z.groups.indexOf(g.dataset.z)>-1)});
    rec.innerHTML='<h3>'+s.name+'</h3><p>'+s.desc+'</p><p class="price">'+s.len+', '+fmt(s.price)+'</p><button class="btn hot" type="button" id="recBook">Записаться на это</button>';
    $('#recBook').addEventListener('click',function(){goBook(s.id)});
    $$('.row.hl').forEach(function(r){r.classList.remove('hl')});
    var row=$('#svc-'+s.id);if(row)row.classList.add('hl');
  }
  zonesBox.addEventListener('click',function(e){var b=e.target.closest('button');if(b)selectZone(b.dataset.z)});
  var groupZone={neck:'neck',upper:'back',lower:'back',legs:'legs',feet:'feet'};
  $$('#map .z').forEach(function(g){g.addEventListener('click',function(){selectZone(groupZone[g.dataset.z])})});
  selectZone('back');

  /* Заявка */
  var WA_NUMBER='79286323511';
  var form=$('#lead'),status=$('#status');
  function say(m,c){status.textContent=m;status.className='status '+(c||'')}
  form.addEventListener('submit',function(e){
    e.preventDefault();
    var data=new FormData(form),phone=String(data.get('phone')||'').replace(/\D/g,'');
    if(!String(data.get('name')||'').trim()){say('Укажите имя, чтобы мы знали, как к вам обращаться.','err');form.name.focus();return}
    if(phone.length<10){say('Введите номер телефона полностью, например +7 900 000-00-00.','err');form.phone.focus();return}
    if(!form.consent.checked){say('Отметьте согласие на обработку данных, иначе мы не сможем принять заявку.','err');return}
    var svcOpt=fSvc.options[fSvc.selectedIndex],svcText=svcOpt&&svcOpt.value?svcOpt.text:'';
    var lines=['Заявка на массаж, Serenity','Имя: '+data.get('name'),'Телефон: '+data.get('phone')];
    if(svcText)lines.push('Массаж: '+svcText);
    if(data.get('date'))lines.push('Дата: '+data.get('date'));
    if(data.get('time'))lines.push('Время: '+data.get('time'));
    if(String(data.get('comment')||'').trim())lines.push('Комментарий: '+data.get('comment'));
    var win=window.open('https://wa.me/'+WA_NUMBER+'?text='+encodeURIComponent(lines.join('\n')),'_blank','noopener');
    if(win){say('Открылся WhatsApp - отправьте готовое сообщение, чтобы заявка дошла до нас.','ok')}
    else{say('Не удалось открыть WhatsApp (возможно, блокировщик всплывающих окон). Напишите нам напрямую: +7 928 632-35-11.','err')}
  });

  $('#year').textContent=new Date().getFullYear();
})();