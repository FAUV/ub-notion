# iOS Info.plist keys (ATS & permisos)
- NSAppTransportSecurity
  - NSAllowsArbitraryLoads = NO
  - NSExceptionDomains > YOUR_PROD_DOMAIN
    - NSIncludesSubdomains = YES
    - NSTemporaryExceptionMinimumTLSVersion = TLSv1.2
- Permisos si aplica: NSCameraUsageDescription, NSMicrophoneUsageDescription, NSPhotoLibraryAddUsageDescription
