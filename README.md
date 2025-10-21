# How to run it

`npx expo login` to login your expo account then `npm run tunnel`, QR code will be generated there. Open expo app then scan it.

# How to release

'''
npm install -g eas-cli
eas build --platform android --profile production
'''

this will use build.production in `eas.json` as config to build
