import type { CapacitorConfig } from '@capacitor/cli'
const config: CapacitorConfig = {
  appId: 'com.fauv.ubnotion',
  appName: 'ub-notion',
  webDir: 'out',
  server: (() => {
    const fallback =
      process.env.NODE_ENV === 'production'
        ? 'https://furcelay.com/ub-notion'
        : 'http://localhost:3000';
    return {
      url: process.env.CAP_SERVER_URL || fallback,
      iosScheme: 'capacitor',
      androidScheme: 'https',
      cleartext: false,
      hostname: 'ub-notion.local'
    };
  })(),
  ios: { contentInset: 'automatic' }
}
export default config
