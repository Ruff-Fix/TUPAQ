import { FontAwesome } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from "react";

export {
    // Catch any errors thrown by the Layout component.
    ErrorBoundary,
  } from 'expo-router';

const useLoadedFonts = () => {
    const [fontsLoaded, error] = useFonts({
        SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
        Rowdies: require('../assets/fonts/Rowdies-Regular.ttf'),
        Gotu: require('../assets/fonts/Gotu-Regular.ttf'),
        FFF: require('../assets/fonts/FFF-Tusj.ttf'),
        ...FontAwesome.font,
    });

    useEffect(() => {
        async function prepare() {
            await SplashScreen.preventAutoHideAsync();
        }
        prepare();
    }, []);

    useEffect(() => {
        if (error) throw error;
      }, [error]);
    
    useEffect(() => {
        if (fontsLoaded) {
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded]);
    
    return fontsLoaded;
}

export default useLoadedFonts;