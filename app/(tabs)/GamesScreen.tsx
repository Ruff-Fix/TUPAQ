import React, { useEffect } from 'react';
import { FlatList, StyleSheet, Image, Pressable, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import { Text, View } from '@/components/Themed';
import i18next from '@/app/i18n';
import { useLanguage } from '../LanguageContext';

// const imageData = [
//   { id: '1', source: require('@/assets/images/cat1.jpg'), link: '/mimic' },
//   { id: '2', source: require('@/assets/images/Bilde_i_Extra.png'), link: 'tictactoe' },
//   { id: '3', source: require('@/assets/images/favicon.png'), link: '/closeup'  },
//   { id: '4', source: require('@/assets/images/icon.png'), link: '/singalong'  },
// ];

// const renderItem = ({ item }: { item: typeof imageData[number] }) => (
//   <Link href={item.link} asChild>
//     <Pressable style={styles.imageContainer}>
//       <Image source={item.source} style={styles.image} />
//     </Pressable>
//   </Link>
// );

const GamesScreen = () => {
  const router = useRouter();
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
        <Text style={styles.title}>{i18next.t('gamesScreen')}</Text>
        <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
        <View style={styles.imageContainer}>
          <View style={styles.gameItem}>
            <Pressable onPress={() => router.push('../GameMimic')}>
              <Image
                source={require('../../assets/images/mimicGameImage.png')}
                style={styles.image}
                resizeMode='contain'
                accessibilityLabel={i18next.t('mimicGame')} />
              <Text style={styles.imageText}>{i18next.t('mimicGame')}</Text>
            </Pressable>
          </View>
          <View style={styles.gameItem}>
            <Pressable onPress={() => router.push('../GameKaraoke')}>
              <Image
                source={require('../../assets/images/microphone.png')}
                style={styles.image}
                resizeMode='contain'
                accessibilityLabel={i18next.t('karaoke')} />
              <Text style={styles.imageText}>{i18next.t('karaoke')}</Text>
            </Pressable>
          </View>
        </View>
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
  imageContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    backgroundColor: 'transparent',
    height: '90%',
  },
  gameItem: {
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  image: {
    width: 75,
    height: 75,
    borderRadius: 10
  },
  imageText: {
    textAlign: 'center',
    marginTop: 5,
  },
  title: {
    fontFamily: 'Rowdies',
    fontSize: 40,
    fontWeight: 400,
  },
  separator: {
    // marginVertical: 30,
    height: 1,
    width: '80%',
  },
});

export default GamesScreen;