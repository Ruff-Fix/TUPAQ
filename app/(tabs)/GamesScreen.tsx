import React from 'react';
import { FlatList, StyleSheet, Image, Pressable } from 'react-native';
import { Link } from 'expo-router';
import Colors from '@/constants/Colors';
import { Text, View } from '@/components/Themed';
import i18n from '@/app/i18n';

const imageData = [
  { id: '1', source: require('@/assets/images/cat1.jpg'), link: '/mimic' },
  { id: '2', source: require('@/assets/images/Bilde_i_Extra.png'), link: 'tictactoe' },
  { id: '3', source: require('@/assets/images/favicon.png'), link: '/closeup'  },
  { id: '4', source: require('@/assets/images/icon.png'), link: '/singalong'  },
];

const renderItem = ({ item }: { item: typeof imageData[number] }) => (
  <Link href={item.link} asChild>
    <Pressable style={styles.imageContainer}>
      <Image source={item.source} style={styles.image} />
    </Pressable>
  </Link>
);

const GamesScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{i18n.t('gamesScreen')}</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      <FlatList 
        data={imageData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  imageContainer: {
    display: 'flex',
    justifyContent: 'space-around',
    width: '25%',
    aspectRatio: 1,
    margin: 30,
    marginBottom: 30,
  },
  image: {
    flex: 1,
    borderRadius: 10,

    height: 70,
    width: 100,
  },
  // container: {
  //   flex: 1,
  //   alignItems: 'center',
  //   justifyContent: 'center',
  // },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});

export default GamesScreen;