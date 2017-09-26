# oratio forward on firebase

```
npm install -g firebase
mkdir oratio-forward && cd oratio-forward
firebase login
# visit link and login to your firebase account
firebase init
# choose firebase functions for the project
firebase functions:config:set sparkpost.key="THE API KEY"
firebase functions:config:set address.key="x-email-address"
firebase functions:config:set datetime.format="LLLL"
cd functions && npm install sparkpost moment --save && cd ..
firebase deploy
```
