const config = () => ({
    expo: {
        name: 'TUPAQ',
        slug: 'TUPAQ',
        scheme: 'tupac',
        version: '1.0.0',
        description: 'V1.0.0',
        orientation: 'portrait',
        platforms: ['ios', 'android', 'web'],
        web: {
            "bundler": "metro"
        },
        splash: {
            image: './assets/images/splash.png',
            resizeMode: 'contain',
            backgroundColor: '#ffffff'
        },
        ios: {
            // icon: './assets/images/icon.png',
            // bundleIdentifier: 'no.ruffy.tupaq',
            // googleServicesFile: './GoogleService-Info.plist',
            // buildNumber: '1',
            // infoPlist: {
            //     UIUserInterfaceStyle: 'Light',
            //     CFBundleDevelopmentRegion: 'nbNO',
            // }
        },
        android: {
            icon: './assets/images/icon.png',
            UIUserInterfaceStyle: 'Light',
            package: 'no.ruffy.tupaq',
            versionCode: 1,
            adaptiveIcon: {
                foregroundImage: './assets/images/adaptive-icon.png',
                backgroundColor: '#ffffff'
            },
            // googleServicesFile: './google-services.json',
        },
        owner: 'ruffy',
        plugins: [
            'expo-router',
            'expo-font'
        ],
        extra: {
            eas: {
                projectId: 'e6a96069-070f-4b64-9bc1-49bfc7ab2110'
            },
            environment: process.env.ENVIRONMENT
        },
    },
});

export default config;