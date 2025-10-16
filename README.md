# How to run it

## For web
`npx expo start` or `npm expo start -c` if wanna clear cache

## For android
`npx expo login` to login your expo account then `npm run tunnel`, QR code will be generated there. Open expo app then scan it.

# How to release

'''
npm install -g eas-cli
eas build --platform android --profile production
'''

this will use build.production in `eas.json` as config to build

# How to configure env variable via eas
```
eas env:create --name SUPABASE_PUBLISHABLE_KEY --value [value]
eas env:list production
```
To delete: `eas env:delete`
