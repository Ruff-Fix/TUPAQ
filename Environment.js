import Constants from 'expo-constants';

const ENV = {
    dev: {
        apiUrl: 'http://192.168.68.55:8081',
        instance: 'dev-rolf',
    },
    preview: {
        apiUrl: 'https://api.rolf.app-pre',
        instance: 'preview-rolf',
    },
    production: {
        apiUrl: 'https://api.rolf.app',
        instance: 'prod-rolf',
    }
};

const getEnvVars = () => {
    const isPreview = Constants.expoConfig?.extra?.enviroment === 'preview';
    const isDevelopment = Constants.expoConfig?.extra?.enviroment === 'development';
    const isProduction = Constants.expoConfig?.extra?.enviroment === 'production';

    if (__DEV__ || isDevelopment) {
        return ENV.dev;
    }
    else if (isPreview) {
        return ENV.preview;
    }
    else if (isProduction) {
        return ENV.production;
    }
};

export default getEnvVars;