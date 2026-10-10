/* AUTOPROTECTTMN — общий скрипт: меню на телефоне и карусели с видео.
   Без библиотек. Если скрипт не загрузился, страница остаётся читаемой:
   меню просто не открывается, а у каруселей виден первый кадр. */
(function(){
  /* ---------- меню на телефоне ---------- */
  var burger = document.getElementById('burger');
  var menu = document.getElementById('mobileMenu');
  if(burger && menu){
    function setMenu(open){
      menu.classList.toggle('open', open);
      burger.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    }
    burger.addEventListener('click', function(){ setMenu(!menu.classList.contains('open')); });
    menu.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', function(){ setMenu(false); }); });
    document.addEventListener('keydown', function(e){ if(e.key === 'Escape') setMenu(false); });
  }

  /* ---------- карусели проектов ---------- */
  document.querySelectorAll('[data-project]').forEach(function(root){
    var slides  = Array.prototype.slice.call(root.querySelectorAll('.project-slide'));
    var stage   = root.querySelector('.project-stage');
    var dotsBox = root.querySelector('.project-dots');
    var counter = root.querySelector('.project-counter');
    var prev    = root.querySelector('.project-arrow--prev');
    var next    = root.querySelector('.project-arrow--next');
    if(slides.length < 2){ root.classList.add('is-single'); return; }

    var index = slides.findIndex(function(s){ return s.classList.contains('is-active'); });
    if(index < 0) index = 0;

    // точки строим кодом — их всегда столько же, сколько кадров
    var dots = slides.map(function(_, i){
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-label', 'Ролик ' + (i + 1));
      b.addEventListener('click', function(){ go(i); });
      dotsBox.appendChild(b);
      return b;
    });

    function go(n){
      n = (n + slides.length) % slides.length;
      if(n === index) return;
      // видео на уходящем кадре останавливаем, иначе звук играет из-за кулис
      var leaving = slides[index].querySelector('video');
      if(leaving && !leaving.paused) leaving.pause();
      slides[index].classList.remove('is-active');
      slides[n].classList.add('is-active');
      index = n;
      paint();
    }
    function paint(){
      dots.forEach(function(d, i){ d.setAttribute('aria-selected', i === index ? 'true' : 'false'); });
      if(counter) counter.innerHTML = '<b>' + (index + 1) + '</b> / ' + slides.length;
    }
    if(prev) prev.addEventListener('click', function(){ go(index - 1); });
    if(next) next.addEventListener('click', function(){ go(index + 1); });

    // свайп: считаем только явно горизонтальный жест, чтобы не перехватывать
    // вертикальную прокрутку страницы
    var x0 = null, y0 = null;
    stage.addEventListener('touchstart', function(e){ x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, {passive:true});
    stage.addEventListener('touchend', function(e){
      if(x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
      if(Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) go(index + (dx < 0 ? 1 : -1));
      x0 = y0 = null;
    }, {passive:true});
    root.addEventListener('keydown', function(e){
      if(e.key === 'ArrowLeft'){ e.preventDefault(); go(index - 1); }
      if(e.key === 'ArrowRight'){ e.preventDefault(); go(index + 1); }
    });
    paint();
  });
})();
