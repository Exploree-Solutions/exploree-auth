import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useState, useRef, useEffect } from 'react';

const LanguageSwitcher = () => {
    const { i18n, t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const languages = [
        { code: 'en', name: t('language.english'), flag: '🇺🇸' },
        { code: 'am', name: t('language.amharic'), flag: '🇪🇹' },
        { code: 'om', name: t('language.oromifa'), flag: '🇪🇹' },
        { code: 'ti', name: t('language.tigrinya'), flag: '🇪🇹' },
    ];

    const currentLang = languages.find(l => l.code === i18n.language) || languages[0];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const changeLanguage = (code: string) => {
        i18n.changeLanguage(code);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
            >
                <Globe className="w-4 h-4" />
                <span>{currentLang.flag} {currentLang.name}</span>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-1 bg-white border border-border rounded-lg shadow-lg py-1 min-w-[140px] z-50">
                    {languages.map(lang => (
                        <button
                            key={lang.code}
                            onClick={() => changeLanguage(lang.code)}
                            className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-muted transition-colors ${i18n.language === lang.code ? 'text-primary font-medium' : 'text-foreground'
                                }`}
                        >
                            <span>{lang.flag}</span>
                            <span>{lang.name}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LanguageSwitcher;
