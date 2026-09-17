/* UI strings: full packs for major languages; others fall back to English while preference is stored */
const AK_I18N = {
  packs: {
    ru: {
      home: 'Главная', create: 'Создать сайт', domains: 'Домены', settings: 'Настройки',
      homeTitle: 'Главная', homeSub: 'Сайты, домены и ссылки — всё здесь.',
      createTitle: 'Опишите идею', createSub: 'Не нужно знать код. Нужно знать, чего хочется.',
      engine: 'Движок', idea: 'Ваша идея', build: 'Собрать сайт', preview: 'Предпросмотр',
      address: 'Адрес сайта', save: 'Сохранить', domainsTitle: 'Домены', domainsSub: 'Имя и зона. Если занято — не создадим.',
      name: 'Имя', tld: 'Окончание', check: 'Проверить', saveDomain: 'Сохранить домен',
      linksTitle: 'Короткие ссылки', linkName: 'Название ссылки', linkUrl: 'Куда ведёт (URL)', createLink: 'Создать ссылку',
      settingsTitle: 'Настройки', lang: 'Язык интерфейса', theme: 'Тема', accent: 'Цвет акцента',
      account: 'Аккаунт', logout: 'Выйти', deleteAcc: 'Удалить данные аккаунта', dark: 'Тёмная', light: 'Светлая',
      sites: 'Сайты', noSites: 'Пока нет сайтов. Опишите идею →', open: 'Открыть', del: 'Удалить',
      step1: '1. Идея', step2: '2. Движок', step3: '3. Адрес'
    },
    en: {
      home: 'Home', create: 'Create site', domains: 'Domains', settings: 'Settings',
      homeTitle: 'Home', homeSub: 'Sites, domains and links — all here.',
      createTitle: 'Describe the idea', createSub: 'No code needed. Just say what you want.',
      engine: 'Engine', idea: 'Your idea', build: 'Build site', preview: 'Preview',
      address: 'Site address', save: 'Save', domainsTitle: 'Domains', domainsSub: 'Name and TLD. If taken — we will not create it.',
      name: 'Name', tld: 'TLD', check: 'Check', saveDomain: 'Save domain',
      linksTitle: 'Short links', linkName: 'Link title', linkUrl: 'Destination URL', createLink: 'Create link',
      settingsTitle: 'Settings', lang: 'Interface language', theme: 'Theme', accent: 'Accent color',
      account: 'Account', logout: 'Log out', deleteAcc: 'Delete account data', dark: 'Dark', light: 'Light',
      sites: 'Sites', noSites: 'No sites yet. Describe an idea →', open: 'Open', del: 'Delete',
      step1: '1. Idea', step2: '2. Engine', step3: '3. Address'
    },
    es: {
      home: 'Inicio', create: 'Crear sitio', domains: 'Dominios', settings: 'Ajustes',
      homeTitle: 'Inicio', homeSub: 'Sitios, dominios y enlaces.', createTitle: 'Describe la idea', createSub: 'Sin código. Di qué quieres.',
      engine: 'Motor', idea: 'Tu idea', build: 'Crear sitio', preview: 'Vista previa', address: 'Dirección', save: 'Guardar',
      domainsTitle: 'Dominios', domainsSub: 'Nombre y zona. Si está ocupado, no se crea.', name: 'Nombre', tld: 'Zona', check: 'Comprobar', saveDomain: 'Guardar dominio',
      linksTitle: 'Enlaces', linkName: 'Título', linkUrl: 'URL', createLink: 'Crear enlace', settingsTitle: 'Ajustes', lang: 'Idioma', theme: 'Tema', accent: 'Color',
      account: 'Cuenta', logout: 'Salir', deleteAcc: 'Borrar datos', dark: 'Oscuro', light: 'Claro', sites: 'Sitios', noSites: 'Sin sitios aún.', open: 'Abrir', del: 'Borrar',
      step1: '1. Idea', step2: '2. Motor', step3: '3. Dirección'
    },
    de: {
      home: 'Start', create: 'Seite erstellen', domains: 'Domains', settings: 'Einstellungen',
      homeTitle: 'Start', homeSub: 'Seiten, Domains und Links.', createTitle: 'Idee beschreiben', createSub: 'Kein Code nötig.',
      engine: 'Engine', idea: 'Ihre Idee', build: 'Seite bauen', preview: 'Vorschau', address: 'Adresse', save: 'Speichern',
      domainsTitle: 'Domains', domainsSub: 'Name und Zone. Belegt = nicht anlegen.', name: 'Name', tld: 'Zone', check: 'Prüfen', saveDomain: 'Domain speichern',
      linksTitle: 'Links', linkName: 'Titel', linkUrl: 'URL', createLink: 'Link erstellen', settingsTitle: 'Einstellungen', lang: 'Sprache', theme: 'Theme', accent: 'Farbe',
      account: 'Konto', logout: 'Abmelden', deleteAcc: 'Daten löschen', dark: 'Dunkel', light: 'Hell', sites: 'Seiten', noSites: 'Noch keine Seiten.', open: 'Öffnen', del: 'Löschen',
      step1: '1. Idee', step2: '2. Engine', step3: '3. Adresse'
    },
    fr: {
      home: 'Accueil', create: 'Créer un site', domains: 'Domaines', settings: 'Réglages',
      homeTitle: 'Accueil', homeSub: 'Sites, domaines et liens.', createTitle: 'Décrivez l’idée', createSub: 'Pas besoin de code.',
      engine: 'Moteur', idea: 'Votre idée', build: 'Créer le site', preview: 'Aperçu', address: 'Adresse', save: 'Enregistrer',
      domainsTitle: 'Domaines', domainsSub: 'Nom et zone. Occupé = pas de création.', name: 'Nom', tld: 'Zone', check: 'Vérifier', saveDomain: 'Sauver le domaine',
      linksTitle: 'Liens', linkName: 'Titre', linkUrl: 'URL', createLink: 'Créer un lien', settingsTitle: 'Réglages', lang: 'Langue', theme: 'Thème', accent: 'Couleur',
      account: 'Compte', logout: 'Déconnexion', deleteAcc: 'Effacer les données', dark: 'Sombre', light: 'Clair', sites: 'Sites', noSites: 'Pas encore de sites.', open: 'Ouvrir', del: 'Supprimer',
      step1: '1. Idée', step2: '2. Moteur', step3: '3. Adresse'
    },
    zh: {
      home: '首页', create: '创建网站', domains: '域名', settings: '设置',
      homeTitle: '首页', homeSub: '网站、域名与链接。', createTitle: '描述想法', createSub: '无需会写代码。',
      engine: '引擎', idea: '你的想法', build: '生成网站', preview: '预览', address: '地址', save: '保存',
      domainsTitle: '域名', domainsSub: '名称与后缀。已被占用则不会创建。', name: '名称', tld: '后缀', check: '检查', saveDomain: '保存域名',
      linksTitle: '短链', linkName: '标题', linkUrl: 'URL', createLink: '创建链接', settingsTitle: '设置', lang: '语言', theme: '主题', accent: '强调色',
      account: '账户', logout: '退出', deleteAcc: '删除数据', dark: '深色', light: '浅色', sites: '网站', noSites: '还没有网站。', open: '打开', del: '删除',
      step1: '1. 想法', step2: '2. 引擎', step3: '3. 地址'
    },
    ja: {
      home: 'ホーム', create: 'サイト作成', domains: 'ドメイン', settings: '設定',
      homeTitle: 'ホーム', homeSub: 'サイト・ドメイン・リンク。', createTitle: 'アイデアを書く', createSub: 'コードは不要です。',
      engine: 'エンジン', idea: 'アイデア', build: 'サイトを作る', preview: 'プレビュー', address: 'アドレス', save: '保存',
      domainsTitle: 'ドメイン', domainsSub: '名前とゾーン。使用中なら作成しません。', name: '名前', tld: 'ゾーン', check: '確認', saveDomain: 'ドメインを保存',
      linksTitle: 'リンク', linkName: 'タイトル', linkUrl: 'URL', createLink: 'リンク作成', settingsTitle: '設定', lang: '言語', theme: 'テーマ', accent: 'アクセント',
      account: 'アカウント', logout: 'ログアウト', deleteAcc: 'データを削除', dark: 'ダーク', light: 'ライト', sites: 'サイト', noSites: 'サイトはまだありません。', open: '開く', del: '削除',
      step1: '1. アイデア', step2: '2. エンジン', step3: '3. アドレス'
    },
    ar: {
      home: 'الرئيسية', create: 'إنشاء موقع', domains: 'النطاقات', settings: 'الإعدادات',
      homeTitle: 'الرئيسية', homeSub: 'المواقع والنطاقات والروابط.', createTitle: 'صف الفكرة', createSub: 'لا حاجة للبرمجة.',
      engine: 'المحرك', idea: 'فكرتك', build: 'إنشاء الموقع', preview: 'معاينة', address: 'العنوان', save: 'حفظ',
      domainsTitle: 'النطاقات', domainsSub: 'الاسم والمنطقة. إن كان محجوزاً لن يُنشأ.', name: 'الاسم', tld: 'المنطقة', check: 'تحقق', saveDomain: 'حفظ النطاق',
      linksTitle: 'روابط', linkName: 'العنوان', linkUrl: 'URL', createLink: 'إنشاء رابط', settingsTitle: 'الإعدادات', lang: 'اللغة', theme: 'المظهر', accent: 'اللون',
      account: 'الحساب', logout: 'خروج', deleteAcc: 'حذف البيانات', dark: 'داكن', light: 'فاتح', sites: 'المواقع', noSites: 'لا مواقع بعد.', open: 'فتح', del: 'حذف',
      step1: '1. الفكرة', step2: '2. المحرك', step3: '3. العنوان'
    },
    pt: {
      home: 'Início', create: 'Criar site', domains: 'Domínios', settings: 'Definições',
      homeTitle: 'Início', homeSub: 'Sites, domínios e links.', createTitle: 'Descreva a ideia', createSub: 'Sem código.',
      engine: 'Motor', idea: 'Sua ideia', build: 'Criar site', preview: 'Prévia', address: 'Endereço', save: 'Salvar',
      domainsTitle: 'Domínios', domainsSub: 'Nome e zona. Ocupado = não cria.', name: 'Nome', tld: 'Zona', check: 'Verificar', saveDomain: 'Salvar domínio',
      linksTitle: 'Links', linkName: 'Título', linkUrl: 'URL', createLink: 'Criar link', settingsTitle: 'Definições', lang: 'Idioma', theme: 'Tema', accent: 'Cor',
      account: 'Conta', logout: 'Sair', deleteAcc: 'Apagar dados', dark: 'Escuro', light: 'Claro', sites: 'Sites', noSites: 'Ainda sem sites.', open: 'Abrir', del: 'Apagar',
      step1: '1. Ideia', step2: '2. Motor', step3: '3. Endereço'
    },
    hi: {
      home: 'होम', create: 'साइट बनाएँ', domains: 'डोमेन', settings: 'सेटिंग्स',
      homeTitle: 'होम', homeSub: 'साइट, डोमेन और लिंक।', createTitle: 'विचार लिखें', createSub: 'कोड की ज़रूरत नहीं।',
      engine: 'इंजन', idea: 'आपका विचार', build: 'साइट बनाएँ', preview: 'पूर्वावलोकन', address: 'पता', save: 'सेव',
      domainsTitle: 'डोमेन', domainsSub: 'नाम और ज़ोन। व्यस्त हो तो नहीं बनेगा।', name: 'नाम', tld: 'ज़ोन', check: 'जाँच', saveDomain: 'डोमेन सेव',
      linksTitle: 'लिंक', linkName: 'शीर्षक', linkUrl: 'URL', createLink: 'लिंक बनाएँ', settingsTitle: 'सेटिंग्स', lang: 'भाषा', theme: 'थीम', accent: 'रंग',
      account: 'खाता', logout: 'लॉग आउट', deleteAcc: 'डेटा हटाएँ', dark: 'डार्क', light: 'लाइट', sites: 'साइटें', noSites: 'अभी कोई साइट नहीं।', open: 'खोलें', del: 'हटाएँ',
      step1: '1. विचार', step2: '2. इंजन', step3: '3. पता'
    }
  },
  // Common world languages for the selector (code → native name)
  world: [
    ['ru','Русский'],['en','English'],['zh','中文'],['es','Español'],['hi','हिन्दी'],['ar','العربية'],['bn','বাংলা'],['pt','Português'],
    ['id','Bahasa Indonesia'],['fr','Français'],['ja','日本語'],['de','Deutsch'],['ko','한국어'],['tr','Türkçe'],['vi','Tiếng Việt'],
    ['it','Italiano'],['th','ไทย'],['pl','Polski'],['uk','Українська'],['nl','Nederlands'],['fa','فارسی'],['ro','Română'],
    ['el','Ελληνικά'],['cs','Čeština'],['sv','Svenska'],['hu','Magyar'],['fi','Suomi'],['no','Norsk'],['da','Dansk'],
    ['he','עברית'],['ms','Bahasa Melayu'],['tl','Filipino'],['sw','Kiswahili'],['ta','தமிழ்'],['te','తెలుగు'],['mr','मराठी'],
    ['ur','اردو'],['gu','ગુજરાતી'],['kn','ಕನ್ನಡ'],['ml','മലയാളം'],['pa','ਪੰਜਾਬੀ'],['bg','Български'],['hr','Hrvatski'],
    ['sk','Slovenčina'],['sr','Српски'],['lt','Lietuvių'],['lv','Latviešu'],['et','Eesti'],['sl','Slovenščina'],['ka','ქართული'],
    ['hy','Հայերեն'],['az','Azərbaycan'],['kk','Қазақ'],['uz','Oʻzbek'],['mn','Монгол'],['ne','नेपाली'],['si','සිංහල'],
    ['my','မြန်မာ'],['km','ខ្មែរ'],['lo','ລາວ'],['am','አማርኛ'],['yo','Yorùbá'],['ig','Igbo'],['ha','Hausa'],
    ['zu','isiZulu'],['af','Afrikaans'],['sq','Shqip'],['mk','Македонски'],['bs','Bosanski'],['is','Íslenska'],['ga','Gaeilge'],
    ['cy','Cymraeg'],['eu','Euskara'],['ca','Català'],['gl','Galego'],['be','Беларуская'],['tg','Тоҷикӣ'],['ky','Кыргызча'],
    ['tk','Türkmen'],['ps','پښتو'],['ku','Kurdî'],['sd','سنڌي'],['so','Soomaali'],['rw','Kinyarwanda'],['xh','isiXhosa'],
    ['mt','Malti'],['lb','Lëtzebuergesch'],['eo','Esperanto']
  ],
  t(key) {
    const lang = (typeof AK !== 'undefined' && AK.settings().lang) || 'ru';
    const pack = this.packs[lang] || this.packs.en;
    return pack[key] || this.packs.en[key] || key;
  },
  apply() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const k = el.getAttribute('data-i18n');
      if (k) el.textContent = this.t(k);
    });
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
      const k = el.getAttribute('data-i18n-ph');
      if (k) el.placeholder = this.t(k);
    });
  }
};
