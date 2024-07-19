import { useState, useEffect } from "react";
import * as Localization from "expo-localization";

type Language = "en" | "no" | "pl";

const changeLanguageModule = () => {
    const [currentLanguage, setCurrentLanguage] = useState<Language>("en");

    useEffect(() => {
        const locales = Localization.getLocales();
        if (locales.length > 0) {
            const deviceLanguage = locales[0].languageCode;
            if (deviceLanguage === "en" || deviceLanguage === "no" || deviceLanguage === "pl") {
                setCurrentLanguage(deviceLanguage as Language);
            } else {
                setCurrentLanguage("en");
            }
        }
    }, []);

    const changeLanguage = (lang: Language) => {
        setCurrentLanguage(lang);
    }
    const getLanguage = (): Language => {
        return currentLanguage;
    }
    return {
        currentLanguage,
        changeLanguage,
        getLanguage
    }
}

export default changeLanguageModule;