import { View, Text } from "@/components/Themed";
import { useLanguage } from "./LanguageContext";
import i18next from "@/app/i18n";
import { StyleSheet } from "react-native";

const GameKaraoke = () => {
    const { language } = useLanguage();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{i18next.t('karaoke')}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        display : 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontFamily: 'Rowdies',
        fontSize: 30,
    }
});

export default GameKaraoke;