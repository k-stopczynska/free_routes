import i18next from 'i18next';
import HttpBackend from 'i18next-http-backend';

export class LanguageSwitch {
    constructor() {
        
        this.initializeI18next();
        this.setDefaultLang();
        this.addEventListener();
    }
    
    setDefaultLang() {
        const userLang = navigator.language || navigator.userLanguage; 
        const defaultLang = userLang.split('-')[0] || 'en';
        const langSelector = document.getElementById('languageSelector');
        defaultLang === 'en' ? langSelector.checked = false : langSelector.checked = true;
        i18next.changeLanguage(defaultLang, (err, t) => {
            if (err) console.log('something went wrong', err);
            this.render();
        });
    }

    async initializeI18next() {
        await i18next
            .use(HttpBackend)
            .init({
                fallbackLng: 'en',
                resources: {
                    en: {
                        translation: {
                            "routeName": "Route Name",
                            "save": "Save",
                            "savedRoutes": "Saved Routes",
                            "resetMap": "Reset Map",
                            "undo": "Undo",
                            "uploadGPX": "Upload GPX",
                            "exportGPX": "Export GPX",
                            "distance": "Route Length: "
                        },
                    },
                    pl: {
                        translation: {
                            "routeName": "Nazwa trasy",
                            "save": "Zapisz trasę",
                            "savedRoutes": "Wybierz trasę",
                            "resetMap": "Resetuj mapę",
                            "undo": "Resetuj ostatni",
                            "uploadGPX": "Załaduj GPX",
                            "exportGPX": "Exportuj do GPX",
                            "distance": "Długość trasy: "
                        }
                    }
                },

                debug: true,
        
            },(err,t) => {
                if (err) console.error('Error loading translations:', err);
        
        this.render();
    });
}

    async render() {
    document.getElementById('routeName').placeholder = await i18next.t('routeName');
        document.getElementById('saveButton').innerText = await i18next.t('save');
        if (JSON.parse(localStorage.getItem('routes')) == undefined || JSON.parse(localStorage.getItem('routes')) == null) {
             document.getElementById("savedRoutes").innerHTML =  `<option value="">${i18next.t('savedRoutes')}</option>`; 
        }
    document.getElementById("resetButton").innerText = await i18next.t('resetMap');
    document.getElementById("undoButton").innerText = await i18next.t('undo');
    document.getElementById("uploadGPX").innerText = await i18next.t('uploadGPX');
    document.getElementById("exportButton").innerText = await i18next.t('exportGPX');
    document.getElementById('routeLength').innerText = await i18next.t('distance');
}

addEventListener() {
    document.getElementById('languageSelector').addEventListener('change', (e) => {
        const selectedLanguage = e.target.checked ? 'pl' : 'en';
        i18next.changeLanguage(selectedLanguage, () => {
        this.render();
    });
});
    } 
}