// ========================================================= Меню-бургер =================================
let bodyLockStatus = true;

let bodyLock = (delay = 500) => {
    let body = document.querySelector("body");
    if (bodyLockStatus) {
        let lock_padding = document.querySelectorAll("[data-lp]");
        for (let index = 0; index < lock_padding.length; index++) {
            const el = lock_padding[index];
            el.style.paddingRight = window.innerWidth - document.querySelector('.wrapper').offsetWidth + 'px';
        }
        body.style.paddingRight = window.innerWidth - document.querySelector('.wrapper').offsetWidth + 'px';
        document.documentElement.classList.add("lock");

        bodyLockStatus = false;
        setTimeout(function () {
            bodyLockStatus = true;
        }, delay);
    }
}

let bodyLockToggle = (delay = 500) => {
    if (document.documentElement.classList.contains('lock')) {
        bodyUnlock(delay);
    } else {
        bodyLock(delay);
    }
}

let bodyUnlock = (delay = 500) => {
    let body = document.querySelector("body");
    if (bodyLockStatus) {
        let lock_padding = document.querySelectorAll("[data-lp]");
        setTimeout(() => {
            for (let index = 0; index < lock_padding.length; index++) {
                const el = lock_padding[index];
                el.style.paddingRight = '0px';
            }
            body.style.paddingRight = '0px';
            document.documentElement.classList.remove("lock");
        }, delay);
        bodyLockStatus = false;
        setTimeout(function () {
            bodyLockStatus = true;
        }, delay);
    }
}

function menuInit() {
    if (document.querySelector(".icon-menu")) {
        document.addEventListener("click", function (e) {
            if (bodyLockStatus && e.target.closest('.icon-menu')) {
                bodyLockToggle();
                document.documentElement.classList.toggle("menu-open");
            }
        });

        // Додаємо обробник для пунктів меню
        const menuLinks = document.querySelectorAll(".menu__link");
        if (menuLinks.length) {
            menuLinks.forEach(link => {
                link.addEventListener("click", () => {
                    menuClose(); // Закриваємо меню при натисканні на пункт
                });
            });
        }
    }
}

function menuOpen() {
    bodyLock();
    document.documentElement.classList.add("menu-open");
}

function menuClose() {
    bodyUnlock();
    document.documentElement.classList.remove("menu-open");
}

menuInit();


// ==================================================================== Dinamic Adaptive =======================================================

class DynamicAdapt {
    constructor(type) {
        this.type = type
    }
    init() {
        // масив об'єктів
        this.оbjects = []
        this.daClassname = '_dynamic_adapt_'
        // масив DOM-елементів
        this.nodes = [...document.querySelectorAll('[data-da]')]

        // наповнення оbjects об'єктами
        this.nodes.forEach((node) => {
            const data = node.dataset.da.trim()
            const dataArray = data.split(',')
            const оbject = {}
            оbject.element = node
            оbject.parent = node.parentNode
            оbject.destination = document.querySelector(`${dataArray[0].trim()}`)
            оbject.breakpoint = dataArray[1] ? dataArray[1].trim() : '767'
            оbject.place = dataArray[2] ? dataArray[2].trim() : 'last'
            оbject.index = this.indexInParent(оbject.parent, оbject.element)
            this.оbjects.push(оbject)
        })

        this.arraySort(this.оbjects)

        // масив унікальних медіа-запитів
        this.mediaQueries = this.оbjects
            .map(({ breakpoint }) => `(${this.type}-width: ${breakpoint}px),${breakpoint}`)
            .filter((item, index, self) => self.indexOf(item) === index)

        // навішування слухача на медіа-запит
        // та виклик оброблювача при першому запуску
        this.mediaQueries.forEach((media) => {
            const mediaSplit = media.split(',')
            const matchMedia = window.matchMedia(mediaSplit[0])
            const mediaBreakpoint = mediaSplit[1]

            // масив об'єктів з відповідним брейкпоінтом
            const оbjectsFilter = this.оbjects.filter(({ breakpoint }) => breakpoint === mediaBreakpoint)
            matchMedia.addEventListener('change', () => {
                this.mediaHandler(matchMedia, оbjectsFilter)
            })
            this.mediaHandler(matchMedia, оbjectsFilter)
        })
    }
    // Основна функція
    mediaHandler(matchMedia, оbjects) {
        if (matchMedia.matches) {
            оbjects.forEach((оbject) => {
                // оbject.index = this.indexInParent(оbject.parent, оbject.element);
                this.moveTo(оbject.place, оbject.element, оbject.destination)
            })
        } else {
            оbjects.forEach(({ parent, element, index }) => {
                if (element.classList.contains(this.daClassname)) {
                    this.moveBack(parent, element, index)
                }
            })
        }
    }
    // Функція переміщення
    moveTo(place, element, destination) {
        element.classList.add(this.daClassname)
        if (place === 'last' || place >= destination.children.length) {
            destination.append(element)
            return
        }
        if (place === 'first') {
            destination.prepend(element)
            return
        }
        destination.children[place].before(element)
    }
    // Функція повернення
    moveBack(parent, element, index) {
        element.classList.remove(this.daClassname)
        if (parent.children[index] !== undefined) {
            parent.children[index].before(element)
        } else {
            parent.append(element)
        }
    }
    // Функція отримання індексу всередині батьківського єлементу
    indexInParent(parent, element) {
        return [...parent.children].indexOf(element)
    }
    // Функція сортування масиву по breakpoint та place
    // за зростанням для this.type = min
    // за спаданням для this.type = max
    arraySort(arr) {
        if (this.type === 'min') {
            arr.sort((a, b) => {
                if (a.breakpoint === b.breakpoint) {
                    if (a.place === b.place) {
                        return 0
                    }
                    if (a.place === 'first' || b.place === 'last') {
                        return -1
                    }
                    if (a.place === 'last' || b.place === 'first') {
                        return 1
                    }
                    return 0
                }
                return a.breakpoint - b.breakpoint
            })
        } else {
            arr.sort((a, b) => {
                if (a.breakpoint === b.breakpoint) {
                    if (a.place === b.place) {
                        return 0
                    }
                    if (a.place === 'first' || b.place === 'last') {
                        return 1
                    }
                    if (a.place === 'last' || b.place === 'first') {
                        return -1
                    }
                    return 0
                }
                return b.breakpoint - a.breakpoint
            })
            return
        }
    }
}
const da = new DynamicAdapt("max");
da.init();

// ==================================================================== Header scroll =======================================================
let addWindowScrollEvent = false;

function headerScroll() {
    addWindowScrollEvent = true;
    const header = document.querySelector('header.header');
    const headerShow = header.hasAttribute('data-scroll-show');
    const headerShowTimer = header.dataset.scrollShow ? header.dataset.scrollShow : 500;
    const startPoint = header.dataset.scroll ? header.dataset.scroll : 1;
    let scrollDirection = 0;
    let timer;
    document.addEventListener("windowScroll", function (e) {
        const scrollTop = window.scrollY;
        clearTimeout(timer);
        if (scrollTop >= startPoint) {
            !header.classList.contains('header-scroll') ? header.classList.add('header-scroll') : null;
            if (headerShow) {
                if (scrollTop > scrollDirection) {
                    // downscroll code
                    header.classList.contains('header-show') ? header.classList.remove('header-show') : null;
                } else {
                    // upscroll code
                    !header.classList.contains('header-show') ? header.classList.add('header-show') : null;
                }
                timer = setTimeout(() => {
                    !header.classList.contains('header-show') ? header.classList.add('header-show') : null;
                }, headerShowTimer);
            }
        } else {
            header.classList.contains('header-scroll') ? header.classList.remove('header-scroll') : null;
            if (headerShow) {
                header.classList.contains('header-show') ? header.classList.remove('header-show') : null;
            }
        }
        scrollDirection = scrollTop <= 0 ? 0 : scrollTop;
    });
}

headerScroll();

setTimeout(() => {
    if (addWindowScrollEvent) {
        let windowScroll = new Event("windowScroll");
        window.addEventListener("scroll", function (e) {
            document.dispatchEvent(windowScroll);
        });
    }
}, 0);

// ==================================================================== Smooth scroll =======================================================
var scroll = new SmoothScroll('a[href*="#"]', {
    speed: 500,
    header: ".header"
});

// ==================================================================== Watcher =======================================================
// Спостерігач об'єктів [всевидюче око]
// data-watch - можна писати значення для застосування кастомного коду
// data-watch-root - батьківський елемент всередині якого спостерігати за об'єктом
// data-watch-margin -відступ
// data-watch-threshold - відсоток показу об'єкта для спрацьовування
// data-watch-once - спостерігати лише один раз
// _watcher-view - клас який додається за появи об'єкта
function uniqArray(array) {
    return array.filter(function (item, index, self) {
        return self.indexOf(item) === index;
    });
}

class ScrollWatcher {
    constructor(props) {
        let defaultConfig = {
            logging: true,
        };
        this.config = Object.assign(defaultConfig, props);
        this.observer;

        // Перевірка, чи є вже клас 'watcher' на кореневому елементі
        if (!document.documentElement.classList.contains('watcher')) {
            this.scrollWatcherRun();
        }
    }

    // Оновлення конструктора
    scrollWatcherUpdate() {
        this.scrollWatcherRun();
    }

    // Запуск конструктора
    scrollWatcherRun() {
        document.documentElement.classList.add('watcher');
        this.scrollWatcherConstructor(document.querySelectorAll('[data-watch]'));
    }

    // Конструктор спостерігачів
    scrollWatcherConstructor(items) {
        if (items.length) {
            this.scrollWatcherLogging(`Прокинувся, стежу за об'єктами (${items.length})...`);
            let uniqParams = uniqArray(Array.from(items).map(item => `${item.dataset.watchRoot ? item.dataset.watchRoot : null}|${item.dataset.watchMargin ? item.dataset.watchMargin : '0px'}|${item.dataset.watchThreshold ? item.dataset.watchThreshold : 0}`));

            uniqParams.forEach(uniqParam => {
                let uniqParamArray = uniqParam.split('|');
                let paramsWatch = {
                    root: uniqParamArray[0],
                    margin: uniqParamArray[1],
                    threshold: uniqParamArray[2]
                };

                let groupItems = Array.from(items).filter(item => {
                    let watchRoot = item.dataset.watchRoot ? item.dataset.watchRoot : null;
                    let watchMargin = item.dataset.watchMargin ? item.dataset.watchMargin : '0px';
                    let watchThreshold = item.dataset.watchThreshold ? item.dataset.watchThreshold : 0;
                    return (
                        String(watchRoot) === paramsWatch.root &&
                        String(watchMargin) === paramsWatch.margin &&
                        String(watchThreshold) === paramsWatch.threshold
                    );
                });

                let configWatcher = this.getScrollWatcherConfig(paramsWatch);
                this.scrollWatcherInit(groupItems, configWatcher);
            });
        } else {
            this.scrollWatcherLogging("Сплю, немає об'єктів для стеження. ZzzZZzz");
        }
    }

    // Функція створення налаштувань
    getScrollWatcherConfig(paramsWatch) {
        let configWatcher = {};
        if (document.querySelector(paramsWatch.root)) {
            configWatcher.root = document.querySelector(paramsWatch.root);
        } else if (paramsWatch.root !== 'null') {
            this.scrollWatcherLogging(`Емм... батьківського об'єкта ${paramsWatch.root} немає на сторінці`);
        }

        configWatcher.rootMargin = paramsWatch.margin;
        if (paramsWatch.margin.indexOf('px') < 0 && paramsWatch.margin.indexOf('%') < 0) {
            this.scrollWatcherLogging(`Йой, налаштування data-watch-margin потрібно задавати в PX або %`);
            return;
        }

        if (paramsWatch.threshold === 'prx') {
            paramsWatch.threshold = [];
            for (let i = 0; i <= 1.0; i += 0.005) {
                paramsWatch.threshold.push(i);
            }
        } else {
            paramsWatch.threshold = paramsWatch.threshold.split(',');
        }
        configWatcher.threshold = paramsWatch.threshold;

        return configWatcher;
    }

    // Функція створення нового спостерігача зі своїми налаштуваннями
    scrollWatcherCreate(configWatcher) {
        this.observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                this.scrollWatcherCallback(entry, observer);
            });
        }, configWatcher);
    }

    // Функція ініціалізації спостерігача зі своїми налаштуваннями
    scrollWatcherInit(items, configWatcher) {
        this.scrollWatcherCreate(configWatcher);
        items.forEach(item => this.observer.observe(item));
    }

    // Функція обробки базових дій точок спрацьовування
    scrollWatcherIntersecting(entry, targetElement) {
        if (entry.isIntersecting) {
            !targetElement.classList.contains('_watcher-view') ? targetElement.classList.add('_watcher-view') : null;
            this.scrollWatcherLogging(`Я бачу ${targetElement.classList}, додав клас _watcher-view`);
        } else {
            targetElement.classList.contains('_watcher-view') ? targetElement.classList.remove('_watcher-view') : null;
            this.scrollWatcherLogging(`Я не бачу ${targetElement.classList}, прибрав клас _watcher-view`);
        }
    }

    // Функція вимкнення стеження за об'єктом
    scrollWatcherOff(targetElement, observer) {
        observer.unobserve(targetElement);
        this.scrollWatcherLogging(`Я перестав стежити за ${targetElement.classList}`);
    }

    // Функція виведення в консоль
    scrollWatcherLogging(message) {
        this.config.logging ? console.log(`[Спостерігач]: ${message}`) : null;
    }

    // Функція обробки спостереження
    scrollWatcherCallback(entry, observer) {
        const targetElement = entry.target;
        this.scrollWatcherIntersecting(entry, targetElement);

        if (targetElement.hasAttribute('data-watch-once') && entry.isIntersecting) {
            this.scrollWatcherOff(targetElement, observer);
        }

        document.dispatchEvent(new CustomEvent("watcherCallback", {
            detail: {
                entry: entry
            }
        }));
    }
}

new ScrollWatcher({});