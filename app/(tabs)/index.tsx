import React, { useEffect } from 'react';
import { StyleSheet, Image, Pressable, ImageBackground } from 'react-native';
// import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import { Text, View } from '@/components/Themed';
import i18next from '@/app/i18n';
import { useLanguage } from '../LanguageContext';

const HomeScreen = () => {
  // const router = useRouter();
  const { language } = useLanguage();

  return (
    
      <View style={styles.container}>
        <ImageBackground
        source={require('../../assets/images/partyQ.png')}
        style={{ width: '100%', height: '100%', alignItems: 'center' }}
        imageStyle={{ opacity: 0.2 }}
        resizeMode='cover'
        accessibilityLabel={'partyQ'}
      >
        <Text style={styles.title}>{i18next.t('homeScreen')}</Text>
        <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
        </ImageBackground>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Rowdies',
    fontSize: 40,
    fontWeight: 400,
  },
  separator: {
    height: 1,
    width: '80%',
  },
});

export default HomeScreen;