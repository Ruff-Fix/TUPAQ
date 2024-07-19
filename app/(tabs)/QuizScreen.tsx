import { StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';
import i18next from '@/app/i18n';
import { useLanguage } from '../LanguageContext';

const QuizScreen = () => {

  const { language } = useLanguage();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{i18next.t('quizScreen')}</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      <View>
        <Text style={styles.title}>{i18next.t('quizInfoText')}</Text>
      </View>
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
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});

export default QuizScreen;