import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, Pressable } from 'react-native';
import { Text, View } from '@/components/Themed';
import i18n from './i18n';

const SettingsScreen = () => {

  const [language, setLanguage] = useState(i18n.language);

  const handleLanguageChange = (language: string) => {
    i18n.changeLanguage(language);
    setLanguage(language);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{i18n.t('settings')}</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      <View style={styles.languageContainer}>
        <Text style={styles.languageLabel}>{i18n.t('language')}</Text>
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

export default SettingsScreen;