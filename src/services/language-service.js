import ptBR from '../config/locales/pt-BR.js';
import enUS from '../config/locales/en-US.js';

const languages = {
    'pt-BR': ptBR,
    'en-US': enUS,
};

class LanguageService {
    static instance;
    #languagePack = enUS;

    constructor() {
        if (LanguageService.instance) {
            return LanguageService.instance;
        }
        LanguageService.instance = this;
    }

    static getInstance() {
        if (!LanguageService.instance) {
            LanguageService.instance = new LanguageService();
        }
        return LanguageService.instance;
    }

    /**
     * Define o idioma ativo.
     * @param {string} lang - O código do idioma (ex: 'en-US' or 'pt-BR').
     */
    setLanguage(lang) {
        if (languages[lang]) {
            this.#languagePack = languages[lang];
        } else {
            this.#languagePack = enUS; 
        }
    }

    /**
     * Busca um texto no pacote de idiomas.
     * @param {string} key - A chave (ex: 'config.welcome').
     * @param  {...any} args - Argumentos para substituir (ex: {0}, {1}).
     * @returns {string} - O texto traduzido.
     */
    get(key, ...args) {
        let text = key.split('.').reduce((obj, k) => {
            return (obj && obj[k] !== undefined) ? obj[k] : null;
        }, this.#languagePack);

        if (text === null) {
            text = key.split('.').reduce((obj, k) => {
                return (obj && obj[k] !== undefined) ? obj[k] : null;
            }, enUS);
        }
        
        if (text === null) {
            return key;
        }

        if (args.length > 0) {
            return text.replace(/{(\d+)}/g, (match, number) => {
                return typeof args[number] !== 'undefined'
                    ? args[number]
                    : match;
            });
        }

        return text;
    }
}

export default LanguageService.getInstance();