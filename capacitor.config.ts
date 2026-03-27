import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nomadspeak.app',
  appName: 'NomadSpeak',
  webDir: 'android/app/src/main/assets/public',
  bundledWebRuntime: false,
  android: {
    allowMixedContent: false,
    webContentsDebuggingEnabled: false,
    backgroundColor: '#062b2f'
  }
};

export default config;
