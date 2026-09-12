const LANGUAGE_KEY = 'tetris3d_language';

const translations = {
  uk: {
    score: 'РАХУНОК', level: 'РІВЕНЬ', lines: 'ЛІНІЙ', controls: 'КЕРУВАННЯ',
    depth: 'вглиб / назовні', leftRight: 'ліво / право', softDrop: 'прискорити',
    camera: 'камера', rotateY: 'поворот Y', rotateX: 'поворот X', drop: 'дроп', pause: 'пауза',
    current: 'ЗАРАЗ', next: 'НАСТУПНА', play: 'Грати', scores: 'Рекорди', settings: 'Налаштування',
    fullscreen: 'На весь екран', exitFullscreen: 'Вийти з повного екрана', about: 'Про проєкт', exit: 'Вийти',
    aboutTitle: 'ПРО ПРОЄКТ', version: 'Версія 1.1', aboutDescription: 'Класичний тетріс у тривимірному просторі.<br>Поле 6×6×20, повне обертання фігур по всіх осях,<br>плавна анімація та таблиця рекордів.',
    developer: 'РОЗРОБНИК', developerRole: 'Ідея, дизайн, код', support: 'ПІДТРИМАТИ ПРОЄКТ',
    supportDescription: 'Якщо тобі подобається гра —<br>підтримай розробника ☕', githubHelp: 'Зірочка на GitHub теж дуже допомагає 🙏', madeWith: 'Зроблено з ❤️ за допомогою',
    back: 'Назад', settingsTitle: 'НАЛАШТУВАННЯ', speed: 'Швидкість падіння', slow: 'Повільно', fast: 'Швидко',
    sound: 'Звук', soundEffects: 'Звукові ефекти', music: 'Музика', theme: 'Тема оформлення', lightTheme: 'Світла тема',
    keyBindings: 'Клавіші керування', bindingsHint: 'Натисни на клавішу щоб перебіндити · ESC — скасувати', resetBindings: '↺ Скинути до стандартних',
    save: 'Зберегти', language: 'Мова', resume: 'Продовжити', mainMenu: 'Головне меню',
    gameOver: 'GAME OVER', newRecord: '🏆 Новий рекорд!', again: 'Знову', movement: 'РУХ', rotation: 'ПОВОРОТ', mobileCamera: 'кам.', mobileFullscreen: 'повн.', mobileSoftDrop: 'м’яко', mobileDrop: 'дроп',
    noScores: 'Ще немає рекордів', levelShort: 'Рів.', exitConfirm: 'Справді вийти з гри?',
    verySlow: 'Дуже повільно', normal: 'Нормально', veryFast: 'Дуже швидко', one: 'ОДНА!', double: 'ДУБЛЬ!', triple: 'ТРИПЛ!',
  },
  ru: {
    score: 'СЧЁТ', level: 'УРОВЕНЬ', lines: 'ЛИНИЙ', controls: 'УПРАВЛЕНИЕ',
    depth: 'вглубь / наружу', leftRight: 'влево / вправо', softDrop: 'ускорить',
    camera: 'камера', rotateY: 'поворот Y', rotateX: 'поворот X', drop: 'сброс', pause: 'пауза',
    current: 'СЕЙЧАС', next: 'СЛЕДУЮЩАЯ', play: 'Играть', scores: 'Рекорды', settings: 'Настройки',
    fullscreen: 'На весь экран', exitFullscreen: 'Выйти из полноэкранного режима', about: 'О проекте', exit: 'Выйти',
    aboutTitle: 'О ПРОЕКТЕ', version: 'Версия 1.1', aboutDescription: 'Классический тетрис в трёхмерном пространстве.<br>Поле 6×6×20, полное вращение фигур по всем осям,<br>плавная анимация и таблица рекордов.',
    developer: 'РАЗРАБОТЧИК', developerRole: 'Идея, дизайн, код', support: 'ПОДДЕРЖАТЬ ПРОЕКТ',
    supportDescription: 'Если тебе нравится игра —<br>поддержи разработчика ☕', githubHelp: 'Звёздочка на GitHub тоже очень помогает 🙏', madeWith: 'Сделано с ❤️ с помощью',
    back: 'Назад', settingsTitle: 'НАСТРОЙКИ', speed: 'Скорость падения', slow: 'Медленно', fast: 'Быстро',
    sound: 'Звук', soundEffects: 'Звуковые эффекты', music: 'Музыка', theme: 'Тема оформления', lightTheme: 'Светлая тема',
    keyBindings: 'Клавиши управления', bindingsHint: 'Нажмите на клавишу для переназначения · ESC — отмена', resetBindings: '↺ Сбросить по умолчанию',
    save: 'Сохранить', language: 'Язык', resume: 'Продолжить', mainMenu: 'Главное меню',
    gameOver: 'GAME OVER', newRecord: '🏆 Новый рекорд!', again: 'Снова', movement: 'ДВИЖЕНИЕ', rotation: 'ПОВОРОТ', mobileCamera: 'кам.', mobileFullscreen: 'полн.', mobileSoftDrop: 'мягко', mobileDrop: 'сброс',
    noScores: 'Рекордов пока нет', levelShort: 'Ур.', exitConfirm: 'Выйти из игры?',
    verySlow: 'Очень медленно', normal: 'Нормально', veryFast: 'Очень быстро', one: 'ОДНА!', double: 'ДВОЙНАЯ!', triple: 'ТРОЙНАЯ!',
  },
};

export function getLanguage() {
  return localStorage.getItem(LANGUAGE_KEY) === 'ru' ? 'ru' : 'uk';
}

export function t(key) {
  return translations[getLanguage()][key] ?? key;
}

export function applyLanguage() {
  const lang = getLanguage();
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const value = t(el.dataset.i18n);
    if (el.dataset.i18nHtml !== undefined) el.innerHTML = value;
    else el.textContent = value;
  });
  document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
    el.setAttribute('aria-label', t(el.dataset.i18nAria));
  });
  const select = document.getElementById('language-select');
  if (select) select.value = lang;
}

export function setLanguage(lang) {
  localStorage.setItem(LANGUAGE_KEY, lang === 'ru' ? 'ru' : 'uk');
  applyLanguage();
  document.dispatchEvent(new Event('languagechange'));
}
