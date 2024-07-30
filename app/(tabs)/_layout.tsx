import React, { useEffect } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Link, Tabs } from 'expo-router';
import { Pressable, Image } from 'react-native';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import i18next from '@/app/i18n';
import { useLanguage } from '../LanguageContext';
import useLoadedFonts from './../../components/useLoadedFonts';
import commonHeaderOptions from '@/components/CommonHeader';

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}
function TabBarMaterialCommunityIcon(props: {
  name: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  color: string;
}) {
  return <MaterialCommunityIcons size={28} style={{ marginBottom: -3 }} {...props} />;
}
// function TabBarMaterialIcon(props: {
//   name: React.ComponentProps<typeof MaterialIcons>['name'];
//   color: string;
// }) {
//   return <MaterialIcons size={28} style={{ marginBottom: -3 }} {...props} />;
// }


export default function TabLayout() {
  const fontsLoaded = useLoadedFonts();
  const colorScheme = useColorScheme();
  const { language } = useLanguage();

  useEffect(() => {
    console.log("Language: ", language);
  }, [language, fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        ...commonHeaderOptions,
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarInactiveTintColor: Colors[colorScheme ?? 'light'].tabIconDefault,
        headerStyle: { height: 105 },
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        // headerShown: useClientOnlyValue(false, true),
        // headerTitleAlign: 'center',
        // headerTitle: 'tupaQ',
        // headerTitle: () => (
        //   <Image
        //     source={require('../../assets/images/TupaQ_logo_transp.png')}
        //     style={{ width: 170, height: 70, marginBottom: 10 }}
        //     resizeMode='contain'
        //   />
        // ),
        // headerTitleStyle: { fontFamily: 'Rowdies', color: Colors[colorScheme ?? 'light'].tint },
        // headerRight: () => (
        //   <Link href="/SettingsModal" asChild>
        //     <Pressable>
        //       {({ pressed }) => (
        //         <MaterialIcons
        //           name="display-settings"
        //           size={25}
        //           color={Colors[colorScheme ?? 'light'].text}
        //           style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
        //         />
        //       )}
        //     </Pressable>
        //   </Link>
        // ),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: i18next.t('homeScreen'),
          tabBarIcon: ({ color }) => <TabBarMaterialCommunityIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="GamesScreen"
        options={{
          title: i18next.t('gamesScreen'),
          tabBarIcon: ({ color }) => <TabBarMaterialCommunityIcon name="robot-happy-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="QuizScreen"
        options={{
          title: i18next.t('quizScreen'),
          tabBarIcon: ({ color }) => <TabBarIcon name="quora" color={color} />,
        }}
      />
    </Tabs>
  );
}
