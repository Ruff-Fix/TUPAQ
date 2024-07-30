import { Image, Pressable } from 'react-native';
import { Link, usePathname } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from '../components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import Colors from '../constants/Colors';

// const colorScheme = useColorScheme();

// const getHeaderRight = () => {
//     const pathname = usePathname();
//     return () => {
//       if (pathname === '/SettingsModal') return null; {
//         return (
//           <Link href="/SettingsModal" asChild>
//             <Pressable>
//               {({ pressed }) => (
//                 <MaterialIcons
//                   name="display-settings"
//                   size={25}
//                   color={Colors[colorScheme ?? 'light'].text}
//                   style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
//                 />
//               )}
//             </Pressable>
//           </Link>
//         );
//       }
//       return getHeaderRight();
//     };
//   };

const commonHeaderOptions = {
    headerShown: useClientOnlyValue(false, true),
    headerTitle: () => (
      <Image
        source={require('../assets/images/TupaQ_logo_transp.png')}
        style={{ width: 170, height: 70, marginBottom: 10 }}
        resizeMode='contain'
      />
    ),
    headerTitleAlign: 'center' as const,
    headerRight: () => {
        const Component = () => {
          const pathname = usePathname();
          const colorScheme = useColorScheme();
          if (pathname === '/SettingsModal') return null;
          return (
            <Link href="/SettingsModal" asChild>
              <Pressable>
                {({ pressed }) => (
                  <MaterialIcons
                    name="display-settings"
                    size={25}
                    color={Colors[colorScheme ?? 'light'].text}
                    style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link>
          );
        };
        return <Component />;
      },
  };

export default commonHeaderOptions;