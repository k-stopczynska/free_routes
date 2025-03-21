export class LanguageSwitch {
    constructor() {
        this.initializeI18next();
        // this.setDefaultLang();
    
        this.addEventListener();
    }
    
    setDefaultLang() {
   const userLang = navigator.language || navigator.userLanguage; 
        const defaultLang = userLang.split('-')[0] || 'en';
        i18next.changeLanguage(defaultLang, () => {
        render();  
});
    }
    async initializeI18next() {
 
    const en = await fetch('/locales/en.json').then(response => response.json());
    const pl = await fetch('/locales/pl.json').then(response => response.json());

    i18next.init({
        lng: 'en',
        resources: {
            en: { translation: en },
            pl: { translation: pl }
        }
    }, function (err, t) {
        if (err) console.error('Error loading translations:', err);
        render();
    });
}

render() {
    document.getElementById('saveButton').innerText = i18next.t('save');
    document.getElementById("savedRoutes").innerText = i18next.t('savedRoutes'); 
    document.getElementById("resetButton").innerText = i18next.t('resetMap');
    document.getElementById("undoButton").innerText = i18next.t('undo');
    document.getElementById("gpxUpload").innerText = i18next.t('uploadGPX');
    document.getElementById("exportButton").innerText = i18next.t('exportGPX');
    document.getElementById('distance').innerText = i18next.t('distance');
}

addListener() {
        document.getElementById('languageSelector').addEventListener('change', function(e) {
    const selectedLanguage = e.target.value;
    i18next.changeLanguage(selectedLanguage, () => {
        render();
    });
});
    } 
}