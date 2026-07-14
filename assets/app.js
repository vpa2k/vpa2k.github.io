(() => {
    // === Constants ===
    const CONFIG = {
        STORAGE_KEY: 'lang',
        QUERY_KEY: 'lang',
        SUPPORTED_LANGS: ['en', 'ru'],
        DEFAULT_LANG: 'en',
        TIMEOUT: 3000,
        SVG_SIZE: 120,
        EMOJI: '😊',
        IS_POPOVER_SUPPORTED: typeof HTMLDivElement.prototype.showPopover === 'function',
    };

    // === Dictionary ===
    const DICTIONARY = {
        ru: {
            notice: 'Эй! Не трогай то, что работает!',
            title: 'Профессиональный профиль',
            about_me: 'Обо мне',
            full_name: 'Павел Вечерин',
            motto: 'Веб-разработчик высокого уровня',
            my_resume: 'Моё резюме',
            my_online_courses: 'Мои онлайн курсы',
            my_recommendation_letters: 'Мои рекомендательные письма',
            hh_url: 'docs/Vecherin Pavel (ru).pdf',
        },
        en: {
            notice: 'Hey! Don\'t touch what works!',
            title: 'Professional Profile',
            about_me: 'About Me',
            full_name: 'Pavel Vecherin',
            motto: 'High Level Web Developer',
            my_resume: 'My Resume',
            my_online_courses: 'My Online Courses',
            my_recommendation_letters: 'My Rec Letters',
            hh_url: 'docs/Vecherin Pavel (en).pdf',
        },
    };

    // === State ===
    const state = {
        language: null,
        timeoutID: null,
    };

    // === Elements ===
    const $ = {
        html: document.documentElement,
        title: document.querySelector('title'),
        h1: document.querySelector('#title h1'),
        motto: document.querySelector('#motto'),
        about: document.querySelector('#aboutMe h2'),
        resume: document.querySelector('#resume h2'),
        courses: document.querySelector('#courses h2'),
        letters: document.querySelector('#letters h2'),
        langWrapper: document.querySelector('#lang-wrapper'),
        popover: document.querySelector('#popover'),
        notice: document.querySelector('#notice'),
        hhLink: document.querySelector('#hh_link'),
        links: document.querySelectorAll('article a'),
    };

    // === Language Detection ===
    const detectLanguage = () => {
        const params = new URLSearchParams(location.search);
        const queryLang = params.get(CONFIG.QUERY_KEY)?.toLowerCase();
        const storedLang = localStorage.getItem(CONFIG.STORAGE_KEY);
        const browserLang = navigator.language?.slice(0, 2).toLowerCase();

        const resolvedLang = queryLang || storedLang || browserLang || CONFIG.DEFAULT_LANG;
        const lang = CONFIG.SUPPORTED_LANGS.includes(resolvedLang) ? resolvedLang : CONFIG.DEFAULT_LANG;

        state.language = lang;
        localStorage.setItem(CONFIG.STORAGE_KEY, lang);
    };

    // === UI ===
    const createLanguageMenu = () => {
        if (!$.langWrapper) return;

        const select = document.createElement('select');
        select.id = 'lang-menu';
        CONFIG.SUPPORTED_LANGS.forEach((lang) => {
            const option = document.createElement('option');
            option.value = lang;
            option.textContent = lang.toUpperCase();
            if (lang === state.language) option.selected = true;
            select.appendChild(option);
        });

        select.addEventListener('change', (e) => {
            setLanguage(e.target.value);
        });

        $.langWrapper.appendChild(select);
    };

    const setLanguage = (lang) => {
        if (!CONFIG.SUPPORTED_LANGS.includes(lang)) return;
        state.language = lang;
        localStorage.setItem(CONFIG.STORAGE_KEY, lang);
        render();
    };

    const render = () => {
        const dict = DICTIONARY[state.language];

        CONFIG.SUPPORTED_LANGS.forEach(lang => {
            const el = document.getElementById(lang);
            if (el) el.style.display = lang === state.language ? 'block' : 'none';
        });

        if ($.html) $.html.setAttribute('lang', state.language);
        if ($.title) $.title.textContent = dict.title;
        if ($.h1) $.h1.textContent = dict.full_name;
        if ($.motto) $.motto.textContent = `${dict.motto} ${CONFIG.EMOJI}`;
        if ($.about) $.about.textContent = dict.about_me;
        if ($.resume) $.resume.textContent = dict.my_resume;
        if ($.courses) $.courses.textContent = dict.my_online_courses;
        if ($.letters) $.letters.textContent = dict.my_recommendation_letters;
        if ($.notice) $.notice.textContent = dict.notice;
        if ($.hhLink) $.hhLink.href = dict.hh_url;

        const url = new URL(location);
        url.searchParams.set(CONFIG.QUERY_KEY, state.language);
        history.replaceState(null, '', url);
    };

    // === Interactions ===
    const setupLinks = () => {
        $.links?.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                window.open(link.href, '_blank').focus();
            });
        });
    }

    const hideGearwheel = () => {
        if (!$.gear || !$.popover) return;

        clearTimeout(state.timeoutID);
        $.popover.style.opacity = '1';
        $.gear.style.display = 'none';

        $.popover.togglePopover?.();
        if ($.popover.checkVisibility?.()) {
            $.popover.style.opacity = '0';
            state.timeoutID = setTimeout(() => {
                $.popover.hidePopover?.();
                $.gear.style.display = 'block';
            }, CONFIG.TIMEOUT);
        }
    };

    const loadGear = () => {
        fetch('assets/gear_with_transparent.svg')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.text();
            })
            .then((data) => {
                $.popover.insertAdjacentHTML('afterend', data);
                $.svg = $.html.querySelector('svg');
                if (!$.svg) return;

                $.svg.setAttribute('width', CONFIG.SVG_SIZE);
                $.svg.setAttribute('height', CONFIG.SVG_SIZE);

                $.gear = document.querySelector('#gear');
                if (!$.gear) return;

                $.gear.style.animationPlayState = 'running';
                if (CONFIG.IS_POPOVER_SUPPORTED) {
                    ['click', 'touchstart'].forEach(event => {
                        $.gear.addEventListener(event, () => {
                            hideGearwheel();
                        });
                    });
                } else {
                    $.popover.style.display = 'none';
                }
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            });
    };

    // === Init ===
    window.addEventListener('load', () => {
        detectLanguage();
        createLanguageMenu();
        setupLinks();
        loadGear();
        render();
    });
})();
