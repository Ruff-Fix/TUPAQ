import { View, Text } from "@/components/Themed";
import { StyleSheet, TouchableOpacity } from "react-native";
import { useLanguage } from "./LanguageContext";
import i18next from "@/app/i18n";
import changeLanguageModule from "@/components/changeLanguageModule";
import mimicAnimalsData from "@/assets/jsonWordLists/mimicAnimals.json";
import { useEffect, useState } from "react";
import { useFonts } from "expo-font";

type MimicAnimal = {
    en: string;
    no: string;
    pl: string;
};

const GameMimic = () => {
    const [fontsLoaded] = useFonts({
        Rowdies: require('../assets/fonts/Rowdies-Regular.ttf'),
    });
    
    const { language } = useLanguage();
    const { currentLanguage, changeLanguage, getLanguage } = changeLanguageModule();

    const translate = (key: string): string => {
        const animal = mimicAnimalsData.mimicAnimals.find((animal: MimicAnimal) => animal[currentLanguage] === key);
        return animal ? animal[currentLanguage] : key;
    }

    useEffect(() => {
    }, [currentLanguage, translate, language]);

    if (!fontsLoaded) {
        return null;
    };

    return (
        <View style={styles.container}>
            <View style={{height: '10%', alignItems: 'center', justifyContent: 'center'}}>
                <Text style={styles.title}>{i18next.t('mimicGame')}</Text>
            </View>
            <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
            <View style={styles.gameContainer}>
                {/* The main game will come here! */}
                <Text>{i18next.t('mimicGameHeaderTitle')}</Text>
                <Text>{i18next.t('mimicGameHeaderText')}</Text>
                <Text>{i18next.t('mimicGameInfoText')}</Text>
                <TouchableOpacity
                    onPress={() => {}}
                    style={styles.startMimicButton}
                >
                        <Text>{i18next.t('mimicButtonStartText')}</Text>
                </TouchableOpacity>
                <Text>{}</Text>
            </View>
            <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
            <View style={styles.footerContainer}>
                <TouchableOpacity onPress={() => changeLanguage("en")}>
                    <Text>English</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => changeLanguage("no")}>
                    <Text>Norsk</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => changeLanguage("pl")}>
                    <Text>Polski</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontFamily: 'Rowdies',
        fontSize: 20,
        fontWeight: 'bold',
      },
    separator: {
        // marginVertical: 30,
        height: 1,
        width: '80%',
    },
    gameContainer: {
        width: '80%',
        height: '80%',
        display: 'flex',
        alignItems: 'center',
        // justifyContent: 'space-between',
    },
    startMimicButton: {
        backgroundColor: 'green',
        width: 100,
        height: 35,
        borderRadius: 10,
        padding: 10,
        margin: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    footerContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        height: '10%',
    }
})

export default GameMimic;