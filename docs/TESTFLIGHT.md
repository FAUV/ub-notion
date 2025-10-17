# TestFlight desde el mismo código (Capacitor)
1) `npm ci && npm run build`
2) `./scripts/ios.sh`
3) En Xcode: Team/Signing, iOS 15+, permisos (Info.plist) si usas cámara/mic/archivos, `Product > Archive` → `Distribute App` (App Store Connect) → TestFlight.
