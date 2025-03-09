import { View, Text } from "@/components/Themed";
import { StyleSheet, TouchableOpacity, Image, useColorScheme } from "react-native";
import { useLanguage } from "./LanguageContext";
import i18next from "@/app/i18n";
import changeLanguageModule from "@/components/changeLanguageModule";
import mimicAnimalsData from "@/assets/jsonWordLists/mimicAnimals.json";
import mimicActionsData from "@/assets/jsonWordLists/mimicActions.json";
import mimicMoviesData from "@/assets/jsonWordLists/mimicMovies.json";
import mimicProfessionsData from "@/assets/jsonWordLists/mimicProfessions.json";
import mimicChoresData from "@/assets/jsonWordLists/mimicChores.json";
import { useEffect, useState } from "react";
import Colors from '@/constants/Colors';

type MimicWord = {
    en: string;
    no: string;
    pl: string;
};

type LanguageType = "en" | "pl" | "no";

const pickedWords: { [category: string]: number[] } = {};

const GameMimic = () => {
    
    const { language } = useLanguage();
    const { currentLanguage, changeLanguage, getLanguage } = changeLanguageModule();
    const [currentWord, setCurrenWord] = useState<MimicWord | null>(null);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

    const categories = [
        {
            id: 'animals',
            name: i18next.t('mimicAnimalsCategoryButtonText'),
            words: mimicAnimalsData.mimicAnimals
        },
        {
            id: 'actions',
            name: i18next.t('mimicActionsCategoryButtonText'),
            words: mimicActionsData.mimicActions
        },
        {
            id: 'movies',
            name: i18next.t('mimicMoviesCategoryButtonText'),
            words: mimicMoviesData.mimicMovies
        },
        {
            id: 'professions',
            name: i18next.t('mimicProfessionsCategoryButtonText'),
            words: mimicProfessionsData.mimicProfessions
        },
        {
            id: 'chores',
            name: i18next.t('mimicChoresCategoryButtonText'),
            words: mimicChoresData.mimicChores
        }
    ];

    const toggleCategory = (categoryId: string) => {
        setSelectedCategories(prev =>
            prev.includes(categoryId)
                ? prev.filter(id => id !== categoryId)
                : [...prev, categoryId]
        )
    };

    // const translate = (key: string): string => {
    //     const animal = mimicAnimalsData.mimicAnimals.find((animal: MimicAnimal) => animal[currentLanguage] === key);
    //     return animal ? animal[currentLanguage] : key;
    // }

    const translate = (word: MimicWord | null): string => {
        if (!word) return "";
        // if (language === 'nb') {
        //     currentLanguage = 'no';
        // } else if (language === 'pl') {
        //     initialLang = 'pl';
        // } else {
        //     initialLang = 'en';
        // }
        return word[currentLanguage as keyof MimicWord]  || "";
    }

    // const pickedWords: { [category: string]: number[] } = {};

    // make a reset button so you can start over...
    // const resetAllWords = () => {
    //     Object.keys(pickedWords).forEach(category => {
    //         pickedWords[category] = [];
    //     });
    // }

    useEffect(() => {
        Object.keys(pickedWords).forEach(category => {
            pickedWords[category] = [];
        });
    }, [selectedCategories]);

    const pickRandomWord = () => {
        if (selectedCategories.length === 0) {
            alert(i18next.t('selectCategoryAlert'));
            return;
        }
        let activeCategories = selectedCategories.length === 0 || selectedCategories.includes('all')
            ? categories.map(cat => cat.id)
            : selectedCategories;

        activeCategories.forEach(category => {
            if (!pickedWords[category]) {
                pickedWords[category] = [];
            }
        });

        const allWordsPicked = activeCategories.every(category =>
            pickedWords[category].length === categories.find(cat => cat.id === category)!.words.length
        );

        if (allWordsPicked) {
            alert("All words have been picked!");
            return;
        }

        const randomCategory = activeCategories[Math.floor(Math.random() * activeCategories.length)];
        const categoryWords = categories.find(cat => cat.id === randomCategory)!.words;

        let randomIndex;
        do {
            randomIndex = Math.floor(Math.random() * categoryWords.length);
        } while (pickedWords[randomCategory].includes(randomIndex));

        const newWord = categoryWords[randomIndex];

        let initialLanguage: LanguageType;
        if (language === 'nb') {initialLanguage = 'no';
        } else if (language === 'pl') {
        initialLanguage = 'pl';
        } else {
        initialLanguage = 'en';
        }
        pickedWords[randomCategory].push(randomIndex);

        changeLanguage(initialLanguage);
        setCurrenWord(newWord);
        console.log(language);
    }

    // const pickRandomWord = () => {
    //     if (pickedWords.length === mimicAnimalsData.mimicAnimals.length) {
    //         alert("All words have been picked!");
    //         return;
    //     }

    //     let randomIndex;
    //     do {
    //         randomIndex = Math.floor(Math.random() * mimicAnimalsData.mimicAnimals.length);
    //     } while (pickedWords.includes(randomIndex));

    //     const newWord = mimicAnimalsData.mimicAnimals[randomIndex];
    //     let initialLanguage: LanguageType;

    //     if (language === 'nb') {
    //         initialLanguage = 'no';
    //     } else if (language === 'pl') {
    //         initialLanguage = 'pl';
    //     } else {
    //         initialLanguage = 'en';
    //     }

    //     pickedWords.push(randomIndex);
    //     // setCurrenWord(mimicAnimalsData.mimicAnimals[randomIndex]);
    //     changeLanguage(initialLanguage);
    //     setCurrenWord(newWord);
    //     console.log(language);
    // }

    useEffect(() => {
    }, [currentLanguage, translate, language, getLanguage]);

    return (
        <View style={styles.container}>
            <View style={styles.titleContainer}>
                <Text style={styles.title}>{i18next.t('mimicGame')}</Text>
            </View>
            <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
            <View style={styles.categoriesContainer}>
                <Text style={styles.categoriesTitle}>{i18next.t('mimicChooseCategoryText')}</Text>
                <View style={styles.categoriesButtonsRow}>
                    {categories.map(category => (
                        <TouchableOpacity
                            key={category.id}
                            style={[
                                styles.categoriesButton,
                                selectedCategories.includes(category.id) && styles.categoriesButtonSelected
                            ]}
                            onPress={() => toggleCategory(category.id)}
                        >
                            <Text style={[
                                styles.categoriesButtonText,
                                selectedCategories.includes(category.id) && styles.categoriesButtonTextSelected
                                
                            ]}>
                                {i18next.t(category.name)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                    <TouchableOpacity 
                        style={[
                            styles.categoriesButton,
                            selectedCategories.includes('all') && styles.categoriesButtonSelected
                        ]}
                        onPress={() => toggleCategory('all')}
                    >
                        <Text style={[
                            styles.categoriesButtonText,
                            selectedCategories.includes('all') && styles.categoriesButtonTextSelected
                        ]}>
                            {i18next.t('mimicAllCategoryButtonText')}
                        </Text>
                    </TouchableOpacity>
                </View>
            {/* <TouchableOpacity 
                style={[
                    styles.allCategoryButton,
                    selectedCategories.includes('all') && styles.allCategoryButtonSelected
                ]}
                onPress={() => toggleCategory('all')}
            >
                <Text style={[
                    styles.categoriesButtonText,
                    selectedCategories.includes('all') && styles.categoriesButtonTextSelected
                ]}>
                    {i18next.t('mimicAllCategoryButtonText')}
                </Text>
            </TouchableOpacity> */}
            </View>
            <View style={styles.gameContainer}>
                {/* The main game will come here! */}
                <View style={styles.gameInfoTextContainer}>
                    {/* <Text>{i18next.t('mimicGameHeaderTitle')}</Text> */}
                    <Text>{i18next.t('mimicGameHeaderText')}</Text>
                    <Text>{i18next.t('mimicGameInfoText')}</Text>
                </View>
                <View style={styles.gamebuttonViewContainer}>
                    <TouchableOpacity
                        onPress={() => {pickRandomWord();}}
                        style={styles.startMimicButton}
                    >
                            <Text style={styles.startMimicButtonText}>{i18next.t('mimicButtonStartText')}</Text>
                    </TouchableOpacity>
                    <View style={styles.mimicWordContainer}>
                        <Text style={{color: useColorScheme() === 'dark' ? Colors.dark.text : Colors.light.tint, fontFamily: 'Gotu', fontSize: 22, fontWeight: '800'}}>{translate(currentWord)}</Text>
                    </View>
                </View>
            </View>
            <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
            <View style={styles.footerContainer}>
                <View style={styles.flagsContainer}>
                <TouchableOpacity onPress={() => changeLanguage("en")}>
                    <Image source={require('../assets/images/flag_america.png')} style={{width: 40, height: 25}} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => changeLanguage("no")}>
                    <Image source={require('../assets/images/flag_norway.png')} style={{width: 40, height: 25}} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => changeLanguage("pl")}>
                    <Image source={require('../assets/images/flag_poland.png')} style={{width: 40, height: 25}} />
                </TouchableOpacity>
                </View>
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
    titleContainer: {
        height: '12%',
        alignItems: 'center',
        justifyContent: 'center',
        // paddingVertical: 10,
    },
    title: {
        fontFamily: 'FFF',
        fontSize: 40,
        // padding: 10,
        // fontWeight: 'bold',
      },
    separator: {
        // marginVertical: 30,
        height: 1,
        width: '80%',
    },
    categoriesContainer: {
        width: '100%',
        // height: '8%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        // paddingVertical: 10,
        // justifyContent: 'center',
    },
    categoriesTitle: {
        fontFamily: 'Gotu',
        fontSize: 14,
        // paddingVertical: 5,
    },
    categoriesButtonsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent:'center',
        width: '80%',
        height: 'auto',
        // borderWidth: 1,
        // borderColor: Colors.light.tint,
        // paddingVertical: 5,
    },
    categoriesButton: {
        backgroundColor: Colors.light.background,
        borderColor: Colors.light.tint,
        borderWidth: 1,
        width: '22%',
        height: 30,
        // aspectRatio: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 3,
        margin: 3,
        flexBasis: '25%'
    },
    allCategoryButton: {
        backgroundColor: Colors.light.background,
        borderColor: Colors.light.tint,
        width: '20%',
        height: 30,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 3,
        borderWidth: 1,
        marginTop: 5,
    },
    allCategoryButtonSelected: {
        backgroundColor: Colors.light.tint,
        width: '20%',
        height: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 3,
    },
    categoriesButtonSelected: {
        backgroundColor: Colors.light.tint,
        // borderColor: Colors.light.tint,
        width: '22%',
        height: 30,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 3,
        borderWidth: 2,
    },
    categoriesButtonText: {
        fontFamily: 'Gotu',
        fontSize: 12,
        color: Colors.light.tint,
        // padding: 10,
        // fontWeight: 'bold',
    },
    categoriesButtonTextSelected: {
        fontFamily: 'Gotu',
        fontSize: 12,
        color: 'white',
        // padding: 10,
        // fontWeight: 'bold',
    },
    allCategoriesButtonText: {
        fontFamily: 'Gotu',
        fontSize: 14,
        color: Colors.light.tint,
        marginTop: 5,
    },
    allCategoriesButtonTextSelected: {
        fontFamily: 'Gotu',
        fontSize: 14,
        color: 'white',
        marginTop: 5,
    },
    gameContainer: {
        width: '80%',
        height: '55%',
        display: 'flex',
        alignItems: 'center',
        // paddingVertical: 10,
        // justifyContent: 'center',
    },
    gameInfoTextContainer: {
        width: '100%',
        // height: '40%',
        paddingVertical: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    gamebuttonViewContainer: {
        width: '100%',
        // height: '40%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    startMimicButton: {
        backgroundColor: Colors.light.tint,
        width: '45%',
        height: 50,
        borderRadius: 10,
        margin: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: Colors.light.tint,
        shadowOffset: {
            width: 10,
            height: 10,
        },
        shadowOpacity: 1,
        shadowRadius: 15,
        elevation: 25, // For android
    },
    startMimicButtonText: {
        fontFamily: 'Gotu',
        fontSize: 20,
        color: 'white',
    },
    mimicWordContainer: {
        width: '100%',
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
        //borderWidth: 0.5,
        borderColor: Colors.light.tint,
        borderStyle: 'dashed',
        borderRadius: 10,
        shadowColor: Colors.light.tint,
        shadowOffset: {
            width: 10,
            height: 10,
        },
        shadowOpacity: 1,
        shadowRadius: 15,
        elevation: 25, // For android
    },
    footerContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        height: '10%',
        width: '100%',
        justifyContent: 'center',
    },
    flagsContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '40%',
    }
})

export default GameMimic;