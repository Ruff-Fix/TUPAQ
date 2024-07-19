import { View, Text } from "@/components/Themed";
import { useLanguage } from "./LanguageContext";
import i18next from "@/app/i18n";

const GameKaraoke = () => {
    const { language } = useLanguage();

    return (
        <View>
            <Text>{i18next.t('karaoke')}</Text>
        </View>
    )
}

export default GameKaraoke;