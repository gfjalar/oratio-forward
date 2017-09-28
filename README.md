# oratio forward

## firebase

1. Install firebase

    ```
    npm install -g firebase
    ```

2. Login to firebase from firebase CLI

    ```
    firebase login
    ```

3. Create a directory for the firebase project eg. `oratio-forward`

    ```
    mkdir oratio-forward
    cd oratio-forward
    ```

4. Initialize the firebase project

    ```
    firebase init
    ```

    - to clone this repository

        1. Do not choose any firebase features during the initialization process

        2. Clone the repository after the initialization process

            ```
            git clone git@github.com:gfjalar/oratio-forward.git functions
            ```

        3. Install npm packages inside the `functions` directory

            ```
            cd functions && npm install && cd ..
            ```

        4. Set up the config for firebase

            ```
            firebase functions:config:set sparkpost.key="YOUR SPARKPOST API KEY"
            firebase functions:config:set giphy.key="YOUR GIPHY API KEY"
            firebase functions:config:set address.key="EMAIL ADDRESS HEADER KEY"
            firebase functions:config:set datetime.format="MOMENT'S DATETIME FORMAT"
            ```

    - otherwise

        1. Choose `Functions` feature during the initialization process

        2. Implement `oratio-forward` inside the `functions` directory

5. Deploy the firebase project

    ```
    firebase deploy
    ```

## oratio

1. Go to [integration settings](https://app.orat.io/account#/settings/integrations) at [orat.io](https://app.orat.io)

2. Click `Open` on the `Custom Integration` box

3. Fill in the following inputs

    - `Name`: the name of your integration eg. `oratio forward`

    - `Headers`: add the EMAIL ADDRESS HEADER KEY eg. `x-email-address`

    - `Webhook`: the url to your firebase function

    - `Type of Integration`: choose `Passive Integration` as the integration is not designed to reply to messages

4. Click `Add Custom Integration`

5. Click `Open` on the box of the integration you've just added

6. Fill in the following inputs

    - `EMAIL ADDRESS HEADER KEY`/`x-email-address`: the email address you want the messages to be forwarded to

7. Click `Connect oratio forward`
