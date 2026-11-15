## For web

`npm start` or `npm expo start -c` if wanna clear cache

## For android

`npx expo login` to login your expo account then `npm run tunnel`, QR code will be generated there. Open expo app then scan it.

# How to release

## For web:

Run `./deploy.sh` then check github pages

## For android:

First add env var:

```
eas env:create --name EXPO_PUBLIC_API_GATEWAY_URL --value [value]
```

Check it: `npm run list`
Then release

```
npm install -g eas-cli
npm run release
```

this will use build.production in `eas.json` as config to build

# How to maintain it

To add env, just add it to `.env` then release, deploy.sh will auto inject it
`npx expo install --fix` to upgrade all packages
`npx expo-doctor` to check
To add routes, modify `_layout.tsx`

# Native Kotlin Android app

`android/` is a Jetpack Compose port of the web app: same showstart token/list
requests (with request signing), keyword sync through the gateway, city/artist
filters, image zoom and keyword management.

## Keywords API

Keywords are stored in the `cloudflare-api-gateway` worker (Workers KV key
`showapp:keywords`) instead of Supabase:

- `GET /api/keywords` → `{ success: true, data: { keywords: string[] } }`
- `PUT /api/keywords` with `{ "keywords": string[] }` replaces the list

One-time setup in the gateway project:

```bash
npx wrangler login
npx wrangler kv namespace create KEYWORDS   # paste the id into wrangler.jsonc
npm run deploy
```

## Build locally

Requires JDK 17 and Android SDK platform 36. Point Gradle at the SDK with
`ANDROID_HOME` or `android/local.properties` (`sdk.dir=...`).

```bash
cd android
API_GATEWAY_URL=https://cloudflare-api-gateway.641706106.workers.dev ./gradlew :app:assembleRelease
```

The APK is written to `android/app/build/outputs/apk/release/app-release.apk`.
`API_GATEWAY_URL` points at the gateway used by the web app; when empty the app
calls `wap.showstart.com` directly and keyword sync is unavailable.

Optional release signing env vars: `KEYSTORE_FILE`, `KEYSTORE_PASSWORD`,
`KEY_ALIAS`, `KEY_PASSWORD`. Without them the release APK is debug-signed so it
can still be installed.

## GitHub Actions

`.github/workflows/android-release.yml` builds the APK automatically:

- every push to `master` publishes the APK as a workflow artifact
- pushing a tag like `v1.0.0` also creates a GitHub Release with the APK attached

```bash
git tag v1.0.0
git push origin v1.0.0
```

Configure these repository secrets:

| Secret | Purpose |
| --- | --- |
| `ANDROID_KEYSTORE_BASE64` | Base64 of the release `.jks` |
| `ANDROID_KEYSTORE_PASSWORD` | Keystore password |
| `ANDROID_KEY_ALIAS` | Key alias |
| `ANDROID_KEY_PASSWORD` | Key password |
| `API_GATEWAY_URL` | Gateway URL used for showstart and keyword requests |

Create a keystore once:

```bash
keytool -genkeypair -v -keystore release.keystore -alias showapp \
  -keyalg RSA -keysize 2048 -validity 10000
```

On Windows PowerShell, base64-encode it into the clipboard:

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("release.keystore")) | Set-Clipboard
```
