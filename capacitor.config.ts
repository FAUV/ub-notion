import type { CapacitorConfig } from '@capacitor/cli'
const config: CapacitorConfig = {
  appId: 'com.fauv.ubnotion',
  appName: 'ub-notion',
  webDir: 'out',
  server: {
    url: process.env.CAP_SERVER_URL || 'https://YOUR_PROD_DOMAIN',
    iosScheme: 'capacitor',
    androidScheme: 'https',
    cleartext: false,
    hostname: 'ub-notion.local'
  },
  ios: { contentInset: 'automatic' }
}
export default config
