/* Контент-завод Accio — логика конструктора, калькулятора, тарифов и формы.
   Никаких зависимостей. Цены задаются в CONFIG. */
(function () {
  'use strict';

  var CONFIG = {
    mgmtFee: 0,        // управление заводом, ₽/мес (0 = «Рассчитаем по брифу»)
    creatorRate: 0,    // оплата одного креатора, ₽/мес
    videosPerCreator: 60,
    viewsPerPost: 800,
    telegramUser: 'aloha699'   // куда уходят заявки: t.me/<username> с готовым текстом
  };

  /* Услуги, которые чаще всего берут отдельно — показываются сразу после первого экрана */
  var POPULAR = [
    { id: 'threads', title: 'Автоматизация Threads', desc: 'Посты, цепочки, комментарии и лайки от лица бренда на автомате. Отдельный бесплатный канал охвата.', tag: 'Хит', extra: ['engage'] },
    { id: 'funnelbot', title: 'Бот-воронка в Telegram', desc: 'Бот прогревает, отвечает на вопросы и доводит до заявки или оплаты. Работает 24/7 без менеджера.', tag: 'Хит', extra: [] },
    { id: 'tggroup', title: 'Ведение Telegram-группы', desc: 'Модерация, приветствия, автоответы, рубрики и активность — группа живёт сама.', tag: 'Хит', extra: ['tgchannel'] }
  ];

  var PIPELINE = [
    { num: '01', title: 'Бриф', desc: 'Цель, продукт, аудитория' },
    { num: '02', title: 'База знаний', desc: 'УТП, возражения, tone of voice' },
    { num: '03', title: 'Сценарии', desc: 'AI-сценарист + тренды' },
    { num: '04', title: 'Съёмка', desc: 'UGC-креаторы и AI-аватары' },
    { num: '05', title: 'Сборка', desc: 'Автомонтаж, субтитры, уникализация' },
    { num: '06', title: 'Публикация', desc: 'Автопостинг, Threads, Telegram' },
    { num: '07', title: 'Продажи', desc: 'Боты, UTM, отчёты' }
  ];

  var GROUPS = [
    { num: '01', title: 'Стратегия и идеи', sub: 'С чего начинается поток контента', items: [
      { id: 'audit', title: 'Аудит соцсетей и конкурентов', desc: 'Разбираем ваши аккаунты и нишу: что работает, а что нет.' },
      { id: 'kb', title: 'База знаний бренда', desc: 'Продукт, аудитория, возражения, tone of voice — фундамент для всех сценариев.' },
      { id: 'plan', title: 'Контент-стратегия и матрица форматов', desc: 'Рубрики, форматы и график выхода на месяц вперёд.' },
      { id: 'pack', title: 'Упаковка профилей', desc: 'Шапка, аватар, закреп, хайлайты и ссылки в профиле.' },
      { id: 'script', title: 'AI-сценарист', desc: 'Сетка сценариев под продукт: хуки, обзоры, распаковки, тренды.' },
      { id: 'trends', title: 'Поиск трендов в реальном времени', desc: 'Находит тренды и сразу превращает их в готовый Reels — для UGC и AI-аватаров.', soon: true }
    ]},
    { num: '02', title: 'Производство', sub: 'Кто и как создаёт ролики', items: [
      { id: 'ugc', title: 'UGC-креаторы', desc: 'Живые блогеры снимают нативные ролики по сценариям со смартфона.' },
      { id: 'ai', title: 'AI-креаторы (HeyGen)', desc: 'AI-аватары: ролики без съёмок, быстро и в любом объёме.' },
      { id: 'influencers', title: 'Инфлюенсеры', desc: 'Крупные блогеры с аудиторией для громких запусков.' },
      { id: 'premium', title: 'Премиум-продакшн', desc: 'Съёмка с оператором, светом и цветокоррекцией.' },
      { id: 'voice', title: 'AI-озвучка и клон голоса', desc: 'Закадровый голос и озвучка на разных языках.' },
      { id: 'photo', title: 'Фото и продуктовые съёмки', desc: 'Карточки товаров, лайфстайл-фото, контент для маркетплейсов.' },
      { id: 'cover', title: 'Обложки и превью', desc: 'Цепляющие обложки для Reels, Shorts и YouTube.' }
    ]},
    { num: '03', title: 'Монтаж и сборка', sub: 'Из исходников — в готовый контент', items: [
      { id: 'edit', title: 'Автомонтаж Reels и Shorts', desc: 'Вертикальный формат, вырезание пауз, динамика, акцент на продукте.' },
      { id: 'subs', title: 'Субтитры и хуки', desc: 'Фирменные субтитры и текстовые хуки в первые секунды.' },
      { id: 'uniq', title: 'Уникализатор', desc: 'Уникальные версии одного ролика для многих аккаунтов и площадок.' },
      { id: 'clips', title: 'Нарезка длинных видео', desc: 'Подкасты, эфиры и вебинары превращаем в десятки коротких клипов.' },
      { id: 'carousel', title: 'Карусели для Instagram', desc: 'Добиваем охват каруселями по той же теме, что и видео.' },
      { id: 'mpvideo', title: 'Видео для карточек WB и Ozon', desc: 'Ролики под требования маркетплейсов, которые поднимают конверсию карточки.' },
      { id: 'locale', title: 'Перевод и локализация', desc: 'Те же ролики — на других языках и для других рынков.' }
    ]},
    { num: '04', title: 'Публикация и ведение', sub: 'Контент выходит сам, каждый день', items: [
      { id: 'autopost', title: 'Автопостинг в соцсети', desc: 'Reels, TikTok, YouTube Shorts, VK Клипы, Дзен — по расписанию.' },
      { id: 'threads', title: 'Автопостинг в Threads', desc: 'Посты, цепочки и прогрев в Threads без ручной работы.' },
      { id: 'engage', title: 'Комментарии и лайки', desc: 'Активность от лица бренда: ответы в комментариях, лайки, реакции на упоминания.' },
      { id: 'multi', title: 'Сетка аккаунтов', desc: 'Выкладка на десятки аккаунтов сразу, чтобы забрать больше охвата.' },
      { id: 'tgchannel', title: 'Ведение Telegram-канала', desc: 'Посты, рубрики и автопубликации в вашем канале.' },
      { id: 'tggroup', title: 'Автоведение Telegram-группы', desc: 'Модерация, приветствия, автоответы и активность в чате.' },
      { id: 'smm', title: 'Комьюнити-менеджмент', desc: 'Ответы на сообщения в директе и мессенджерах от лица бренда.' }
    ]},
    { num: '05', title: 'Трафик и продвижение', sub: 'Приводим людей к вашему контенту', items: [
      { id: 'bloggers', title: 'Реклама у блогеров', desc: 'Подбираем и покупаем размещения у блогеров под вашу аудиторию.' },
      { id: 'seeding', title: 'Посевы в Telegram и MAX', desc: 'Закупка рекламы в тематических каналах и медиа.' },
      { id: 'parsing', title: 'Парсинг аудитории в Telegram', desc: 'Собираем целевую аудиторию из чатов и каналов вашей ниши.' },
      { id: 'inviting', title: 'Инвайтинг в Telegram', desc: 'Приглашаем собранную аудиторию в ваш канал или группу.' },
      { id: 'challenge', title: 'Челлендж в TikTok и Reels', desc: 'Запускаем свой тренд с хештегом и креаторами.' },
      { id: 'tasks', title: 'Биржа заданий для блогеров', desc: 'Блогеры снимают и выкладывают ролики о вас за вознаграждение.' },
      { id: 'ads', title: 'Таргетированная реклама', desc: 'Запуск рекламы на лучших роликах из потока.' }
    ]},
    { num: '06', title: 'Продажи и автоматизация', sub: 'Превращаем охваты в заявки', items: [
      { id: 'funnelbot', title: 'Telegram-бот воронка', desc: 'Бот прогревает, отвечает на вопросы и доводит до заявки или оплаты.' },
      { id: 'aiagent', title: 'AI-менеджер в директ', desc: 'AI-агент отвечает клиентам в директе и мессенджерах 24/7.' },
      { id: 'c2dm', title: 'Комментарий → директ', desc: 'Автоответ в директ на ключевое слово в комментариях Instagram.' },
      { id: 'landing', title: 'Лендинг или мини-сайт', desc: 'Страница под продукт или акцию, куда ведёт весь трафик.' },
      { id: 'crm', title: 'Сбор заявок и CRM', desc: 'Все заявки из соцсетей и ботов — в одном месте.' },
      { id: 'payments', title: 'Приём оплат', desc: 'Оплата прямо в боте или на странице.' }
    ]},
    { num: '07', title: 'Аналитика и рост', sub: 'Видим, что работает, и масштабируем', items: [
      { id: 'utm', title: 'UTM-метки', desc: 'Метки где угодно — в шапке, описании, постах — видно, какой ролик приводит клиентов.' },
      { id: 'reports', title: 'Отчёты по охватам и заявкам', desc: 'Регулярная сводка: просмотры, переходы, заявки, CPV.' },
      { id: 'abtest', title: 'A/B-тесты креативов', desc: 'Проверяем хуки и форматы и масштабируем победителей.' },
      { id: 'creatorbase', title: 'База креаторов под нишу', desc: '50–100 проверенных авторов, которая остаётся у вас.' },
      { id: 'vip', title: 'Реферальная VIP-система', desc: 'Партнёры и клиенты получают вознаграждение за приведённых людей.' },
      { id: 'ambassador', title: 'Амбассадорская программа', desc: 'Свои блогеры-амбассадоры, которые продвигают бренд постоянно.' },
      { id: 'training', title: 'Обучение вашей команды', desc: 'Учим запускать UGC и пользоваться сервисами Accio самостоятельно.' }
    ]}
  ];

  var TARIFFS = [
    { id: 'start', name: 'Старт', price: 'Цена — по брифу', forWho: 'Малый бизнес, эксперты и тест гипотез', hit: false,
      features: ['База знаний бренда и сценарии', '1–3 UGC-креатора или AI-аватары', 'Автомонтаж и субтитры', 'Автопостинг в 2 соцсети', 'UTM-метки и ежемесячный отчёт'] },
    { id: 'growth', name: 'Рост', price: 'Цена — по брифу', forWho: 'Средний бизнес и маркетплейсы', hit: true,
      features: ['Всё из «Старта»', '5–10 креаторов: UGC + AI-аватары', 'Уникализатор и сетка аккаунтов', 'Автопостинг в 4+ площадки и Threads', 'Комментарии, лайки, посевы в Telegram', 'A/B-тесты и отчёт каждую неделю'] },
    { id: 'full', name: 'Под ключ', price: 'Цена — по брифу', forWho: 'Крупный бизнес и громкие запуски', hit: false,
      features: ['Всё из «Роста»', '10–20 креаторов, инфлюенсеры, премиум-продакшн', 'Telegram-бот воронка и AI-менеджер', 'Парсинг и инвайтинг в Telegram', 'Ведение Telegram-канала и группы', 'Персональный продюсер, связь 24/7'] }
  ];

  var state = { picked: {}, tariff: null, creators: 5, platforms: 4, uniq: 1, calcApplied: false };

  function $(sel, root) { return (root || document).querySelector(sel); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function num(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }
  function allItems() { var a = []; GROUPS.forEach(function (g) { g.items.forEach(function (it) { a.push(it); }); }); return a; }

  var CHECK = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8.5l3.2 3L13 4.5" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  /* ---------- pipeline ---------- */
  function renderPipeline() {
    $('#pipeline-grid').innerHTML = PIPELINE.map(function (s) {
      return '<div class="card pipe"><div class="pipe__head"><span class="pipe__num">' + s.num + '</span><span class="pipe__arrow">→</span></div><b>' + esc(s.title) + '</b><p>' + esc(s.desc) + '</p></div>';
    }).join('');
  }

  /* ---------- builder ---------- */
  function renderBuilder() {
    var root = $('#builder-groups');
    root.innerHTML = GROUPS.map(function (g) {
      var count = g.items.filter(function (it) { return state.picked[it.id]; }).length;
      var allOn = count === g.items.length;
      return '<div class="group" data-group="' + g.num + '">' +
        '<div class="group__head"><div class="group__title"><span class="group__num">' + g.num + '</span><div><h3>' + esc(g.title) + '</h3><p>' + esc(g.sub) + '</p></div></div>' +
        '<div class="group__ctl"><span>Выбрано ' + count + ' из ' + g.items.length + '</span><button type="button" data-toggle-group="' + g.num + '">' + (allOn ? 'Снять все' : 'Выбрать весь цех') + '</button></div></div>' +
        '<div class="mods">' + g.items.map(function (it) {
          var on = !!state.picked[it.id];
          return '<button type="button" class="mod" data-mod="' + it.id + '" aria-pressed="' + on + '"><span class="mod__box">' + CHECK + '</span><span class="mod__body"><span class="mod__title">' + esc(it.title) + (it.soon ? '<span class="mod__soon">скоро</span>' : '') + '</span><span class="mod__desc">' + esc(it.desc) + '</span></span></button>';
        }).join('') + '</div></div>';
    }).join('');
  }

  /* ---------- calculator ---------- */
  function seg(el, vals, cur, key, fmt) {
    el.innerHTML = vals.map(function (v) {
      return '<button type="button" data-set="' + key + '" data-val="' + v + '" aria-pressed="' + (v === cur) + '">' + (fmt ? fmt(v) : v) + '</button>';
    }).join('');
  }
  function calcValues() {
    var videos = state.creators * CONFIG.videosPerCreator;
    var publications = videos * state.platforms * state.uniq;
    var reach = publications * CONFIG.viewsPerPost;
    return { videos: videos, publications: publications, reach: reach };
  }
  function renderCalc() {
    seg($('#calc-creators'), [5, 10, 15, 20], state.creators, 'creators');
    seg($('#calc-platforms'), [2, 4, 6, 8], state.platforms, 'platforms');
    seg($('#calc-uniq'), [1, 3, 5], state.uniq, 'uniq', function (v) { return v === 1 ? 'выкл' : '×' + v; });
    $('#calc-creators-val').textContent = state.creators;
    $('#calc-platforms-val').textContent = state.platforms;
    $('#calc-uniq-val').textContent = state.uniq === 1 ? 'выкл' : '×' + state.uniq + ' аккаунтов';
    var c = calcValues();
    $('#calc-videos').textContent = num(c.videos);
    $('#calc-publications').textContent = num(c.publications);
    $('#calc-reach').textContent = num(c.reach);
    $('#calc-formula').textContent = state.creators + ' креаторов × ' + CONFIG.videosPerCreator + ' роликов = ' + num(c.videos) + ' · × ' + state.platforms + ' площадок' + (state.uniq > 1 ? ' × ' + state.uniq + ' версий' : '') + ' = ' + num(c.publications) + ' публикаций · × ~' + CONFIG.viewsPerPost + ' просмотров ≈ ' + num(c.reach);
    var known = CONFIG.mgmtFee > 0 && CONFIG.creatorRate > 0;
    $('#calc-budget').textContent = known ? 'от ' + num(CONFIG.mgmtFee + state.creators * CONFIG.creatorRate) + ' ₽/мес' : 'Рассчитаем по брифу';
  }

  /* ---------- tariffs ---------- */
  function renderTariffs() {
    $('#tariffs-grid').innerHTML = TARIFFS.map(function (t) {
      var on = state.tariff === t.id;
      var cls = 'tariff' + (t.hit ? ' tariff--hit' : '') + (on ? ' tariff--on' : '');
      var btn = (t.hit || on) ? 'btn btn--grad' : 'btn btn--outline';
      return '<div class="' + cls + '"><div class="tariff__head"><h3>' + esc(t.name) + '</h3>' + (t.hit ? '<span class="tariff__badge">ПОПУЛЯРНЫЙ</span>' : '') + '</div>' +
        '<div class="tariff__price">' + esc(t.price) + '</div><p class="tariff__for">' + esc(t.forWho) + '</p>' +
        '<ul>' + t.features.map(function (f) { return '<li>' + esc(f) + '</li>'; }).join('') + '</ul>' +
        '<button type="button" class="' + btn + '" data-tariff="' + t.id + '">' + (on ? 'Выбран ✓' : 'Выбрать тариф') + '</button></div>';
    }).join('');
  }

  /* ---------- popular (отдельные услуги) ---------- */
  function itemById(id) { return allItems().filter(function (it) { return it.id === id; })[0]; }
  function renderPopular() {
    $('#popular-grid').innerHTML = POPULAR.map(function (p) {
      var on = !!state.picked[p.id];
      return '<div class="card pop' + (on ? ' pop--on' : '') + '"><div class="pop__head"><span class="pop__tag">' + esc(p.tag) + '</span>' + (on ? '<span class="pop__in">В корзине ✓</span>' : '') + '</div>' +
        '<h3>' + esc(p.title) + '</h3><p>' + esc(p.desc) + '</p>' +
        '<button type="button" class="btn ' + (on ? 'btn--outline' : 'btn--grad') + '" data-popular="' + p.id + '">' + (on ? 'Убрать из корзины' : 'В корзину') + '</button></div>';
    }).join('');
  }

  /* ---------- cart ---------- */
  function pickedTitles() { return allItems().filter(function (it) { return state.picked[it.id]; }).map(function (it) { return it.title; }); }
  function pickedIds() { return allItems().filter(function (it) { return state.picked[it.id]; }).map(function (it) { return it.id; }); }
  function tariffName() { var t = TARIFFS.filter(function (x) { return x.id === state.tariff; })[0]; return t ? t.name : ''; }
  function cartCount() { return pickedIds().length + (state.tariff ? 1 : 0) + (state.calcApplied ? 1 : 0); }
  function plural(n, a, b, c) { var m = n % 100; if (m >= 11 && m <= 19) return c; m = n % 10; return m === 1 ? a : (m >= 2 && m <= 4 ? b : c); }

  function renderCart() {
    var ids = pickedIds();
    var c = calcValues();
    var html = '';
    if (state.tariff) html += '<div class="cart__item cart__item--hl"><span><small>Тариф</small><b>' + esc(tariffName()) + '</b></span><button type="button" data-remove="tariff" aria-label="Убрать тариф">×</button></div>';
    if (state.calcApplied) html += '<div class="cart__item cart__item--hl"><span><small>Расчёт объёма</small><b>' + state.creators + ' креаторов · ' + state.platforms + ' площадок · ' + num(c.videos) + ' роликов · ' + num(c.publications) + ' публикаций · охват ≈ ' + num(c.reach) + '</b></span><button type="button" data-remove="calc" aria-label="Убрать расчёт">×</button></div>';
    html += ids.map(function (id) { var it = itemById(id); return '<div class="cart__item"><span><b>' + esc(it.title) + '</b></span><button type="button" data-remove="' + id + '" aria-label="Убрать">×</button></div>'; }).join('');
    if (!html) {
      html = '<div class="cart__empty"><p>Корзина пока пуста. Выберите услуги в разделе <a href="#popular">«Чаще всего берут отдельно»</a> или соберите завод в <a href="#builder">конструкторе</a>.</p><p>Можно и без выбора — просто напишите нам, что хотите, и мы подберём набор сами.</p></div>';
    } else {
      html = '<div class="cart__count">' + ids.length + ' ' + plural(ids.length, 'модуль', 'модуля', 'модулей') + (state.tariff ? ' · тариф' : '') + (state.calcApplied ? ' · расчёт' : '') + '</div>' + html;
    }
    $('#cart-list').innerHTML = html;
    var n = cartCount();
    var bar = $('#cartbar');
    bar.hidden = n === 0;
    $('#cartbar-text').textContent = 'В корзине: ' + ids.length + ' ' + plural(ids.length, 'модуль', 'модуля', 'модулей') + (state.tariff ? ' + тариф «' + tariffName() + '»' : '');
    updateTgLink();
  }

  function composeLead() {
    var form = $('#lead-form');
    var c = calcValues();
    var lines = ['Здравствуйте! Хочу контент-завод Accio.'];
    var titles = pickedTitles();
    if (state.tariff) lines.push('Тариф: ' + tariffName());
    if (titles.length) lines.push('Модули (' + titles.length + '): ' + titles.join(', '));
    if (state.calcApplied) lines.push('Объём: ' + state.creators + ' креаторов, ' + state.platforms + ' площадок, уникализатор ×' + state.uniq + ' → ' + num(c.videos) + ' роликов, ' + num(c.publications) + ' публикаций/мес, охват ≈ ' + num(c.reach));
    if (!titles.length && !state.tariff && !state.calcApplied) lines.push('Пока не выбрал модули — помогите подобрать.');
    if (form.niche.value) lines.push('Ниша: ' + form.niche.value);
    if (form.site.value.trim()) lines.push('Сайт: ' + form.site.value.trim());
    return lines.join('\n');
  }
  function updateTgLink() {
    $('#tg-send').href = 'https://t.me/' + CONFIG.telegramUser + '?text=' + encodeURIComponent(composeLead());
  }

  function renderAll() { renderPopular(); renderBuilder(); renderCalc(); renderTariffs(); renderCart(); }

  /* ---------- events ---------- */
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-mod],[data-toggle-group],[data-set],[data-tariff],[data-action],[data-popular],[data-remove]');
    if (!t) return;
    if (t.dataset.mod) { state.picked[t.dataset.mod] = !state.picked[t.dataset.mod]; renderPopular(); renderBuilder(); renderCart(); return; }
    if (t.dataset.popular) {
      var p = POPULAR.filter(function (x) { return x.id === t.dataset.popular; })[0];
      var on = !!state.picked[p.id];
      state.picked[p.id] = !on;
      p.extra.forEach(function (id) { if (!on) state.picked[id] = true; });
      renderPopular(); renderBuilder(); renderCart(); return;
    }
    if (t.dataset.remove) {
      if (t.dataset.remove === 'tariff') state.tariff = null;
      else if (t.dataset.remove === 'calc') state.calcApplied = false;
      else state.picked[t.dataset.remove] = false;
      renderAll(); return;
    }
    if (t.dataset.toggleGroup) {
      var g = GROUPS.filter(function (x) { return x.num === t.dataset.toggleGroup; })[0];
      var allOn = g.items.every(function (it) { return state.picked[it.id]; });
      g.items.forEach(function (it) { state.picked[it.id] = !allOn; });
      renderPopular(); renderBuilder(); renderCart(); return;
    }
    if (t.dataset.set) { state[t.dataset.set] = Number(t.dataset.val); renderCalc(); renderCart(); return; }
    if (t.dataset.tariff) { state.tariff = state.tariff === t.dataset.tariff ? null : t.dataset.tariff; renderTariffs(); renderCart(); return; }
    if (t.dataset.action === 'select-all') { allItems().forEach(function (it) { state.picked[it.id] = true; }); renderPopular(); renderBuilder(); renderCart(); }
    if (t.dataset.action === 'clear-all') { state.picked = {}; renderPopular(); renderBuilder(); renderCart(); }
    if (t.dataset.action === 'apply-calc') { state.calcApplied = true; renderCart(); }
    if (t.dataset.action === 'copy') {
      var text = composeLead();
      var done = $('#form-done');
      var show = function (copied) { done.hidden = false; done.innerHTML = (copied ? 'Скопировано. ' : '') + 'Отправьте текст нам в Telegram: <a href="https://t.me/' + CONFIG.telegramUser + '" target="_blank" rel="noopener">@' + CONFIG.telegramUser + '</a><pre>' + esc(text) + '</pre>'; };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(function () { show(true); }, function () { show(false); });
      else show(false);
    }
  });
  $('#lead-form').addEventListener('change', updateTgLink);
  $('#lead-form').addEventListener('input', updateTgLink);
  $('#lead-form').addEventListener('submit', function (e) { e.preventDefault(); });

  renderPipeline();
  renderAll();
})();
