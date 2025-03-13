
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.75b6c21d2e51478d8e7220b7c06791c4',
  appName: 'fish-splitter',
  webDir: 'dist',
  server: {
    url: 'https://75b6c21d-2e51-478d-8e72-20b7c06791c4.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  ios: {
    contentInset: 'always'
  },
  android: {
    buildOptions: {
      keystorePath: null,
      keystoreAlias: null
    }
  }
};

export default config;
