import { Redirect, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text } from '@/components/Themed';
import i18next from '@/app/i18n';
import { useLanguage } from './LanguageContext';
import { StyleSheet, Image, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// const MainScreen = () => {
//     // First time app opens this screen will be shown otherwise GamesScreen
//     return <Redirect href="/(tabs)/GamesScreen" />;
// }

const FirstTimeWelcomeScreen = () => {
    // First time app opens this screen will be shown otherwise index/homescreen
    // return <Redirect href="/(tabs)" />;
    const router = useRouter();
    const { language } = useLanguage();
    const [isFirstTime, setIsFirstTime] = useState(false);
    const [ loading, setLoading ] = useState(true);

    useEffect(() => {
        checkFirstTimeUser();
    }, []);

    const checkFirstTimeUser = async () => {
        try {
            const value = await AsyncStorage.getItem('@first_time_user');
            if (value !== null) {
                router.replace('/(tabs)');
            } else {
                setIsFirstTime(true);
            }
        } catch (error) {
            console.error('Error checking first time user', error);
        } finally {
            setLoading(false);
        }
    };

    const handleContinue = async () => {
        try {
            await AsyncStorage.setItem('@first_time_user', 'false');
            router.replace('/(tabs)');
        } catch (error) {
            console.error('Error setting first time user', error);
        }
    };

    if (loading) {
        return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>{i18next.t('loading')}</Text>
        </View> );
    }

    if (!isFirstTime) {
        return null;
    }

    return (
        <View>
            <Text style={styles.title}>{i18next.t('firstTimeWelcomeScreenTitle')}</Text>
            <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
            <Text style={styles.description}>{i18next.t('firstTimeWelcomeScreenDescription')}</Text>
            <Text style={styles.description}>{i18next.t('firstTimeWelcomeScreenInfo')}</Text>
            <Button title={i18next.t('firstTimeWelcomeScreenButtonText')} onPress={handleContinue} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
    },
    description: {
      fontSize: 16,
      textAlign: 'center',
      marginBottom: 30,
    },
    separator: {
        // marginVertical: 30,
        height: 1,
        width: '80%',
    },
});

export default FirstTimeWelcomeScreen;