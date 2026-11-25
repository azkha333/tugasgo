# TugasGo APK

## A. Analisa (bedah situs + tes semua tombol)
    npm install
    npx playwright install chromium
    npm run analyze
Hasil di folder `analysis/`: screenshot tiap tombol, JS bundle, daftar API/request, manifest, error console.
Kirim `analysis/report.json` ke Claude buat dianalisa lebih lanjut.

## B. Build APK
1. Push folder ini ke repo GitHub.
2. Tab Actions > Build APK > Run workflow.
3. Download artifact `TugasGo-apk` (app-debug.apk), install di HP.

Atau lokal: npx cap add android && npx cap sync android, buka folder android/ di Android Studio, Build > Build APK.

## C. Catatan
- Debug APK bisa langsung dipasang. Untuk rilis/Play Store perlu keystore + `assembleRelease`.
- Ganti ikon: taruh icon di `resources/` lalu pakai `@capacitor/assets`.
