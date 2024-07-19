import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, Pressable } from 'react-native';
import { Text, View } from '@/components/Themed';
import i18next from '@/app/i18n';
import { useLanguage } from './LanguageContext';

const SettingsModal = () => {

  const { language, setLanguage } = useLanguage();

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
  };

  // const handleLanguageChange = (newLanguage: string) => {
  //   i18next.changeLanguage(newLanguage);
  //   setTimeout(() => {
  //     setLanguage(newLanguage);
  //   }, 0);
  // };

  // useEffect(() => {
  //   console.log('Language changed to: ', language);
  // }, [language]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{i18next.t('settings')}</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      <View style={styles.languageContainer}>
        <Text style={styles.languageLabel}>{i18next.t('language')}</Text>
        <Pressable
          style={[styles.languageButton, language === 'en' && styles.selectedLanguage]}
          onPress={() => handleLanguageChange('en')}
        >
          <Text style={styles.languageButtonText}>English</Text>
        </Pressable>
        <Pressable
          style={[styles.languageButton, language === 'nb' && styles.selectedLanguage]}
          onPress={() => handleLanguageChange('nb')}
        >
          <Text style={styles.languageButtonText}>Norsk</Text>
        </Pressable>
        <Pressable
          style={[styles.languageButton, language === 'pl' && styles.selectedLanguage]}
          onPress={() => handleLanguageChange('pl')}
        >
          <Text style={styles.languageButtonText}>Polski</Text>
        </Pressable>
      </View>
      {/* Use a light status bar on iOS to account for the black space above the modal */}
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 20,
    height: 1,
    width: '80%',
  },
  languageContainer: {
    alignItems: 'center',
  },
  languageLabel: {
    fontSize: 18,
    marginBottom: 10,
  },
  languageButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    marginVertical: 5,
  },
  selectedLanguage: {
    backgroundColor: 'lightgray',
  },
  languageButtonText: {
    fontSize: 16,
  }
});

export default SettingsModal;