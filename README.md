# cohost-notification-server
Deliver [cohost](https://cohost.org) notifications to an IFTTT Webhook.

**This repo is not affiliated with cohost.**

## Setup

 1. Clone the repo & install the dependencies
    ```bash
    git clone git@github.com:mogery/cohost-notification-server.git
    cd cohost-notification-server
    npm i
    ```
 2. Create your IFTTT Applet like so:
    ![Your applet should have two parts: a Webhook "Receive a web request" trigger, and a Notifications "Send a rich notification from the IFTTT app" action.](https://raw.githubusercontent.com/mogery/cohost-notification-server/images/ifttt_step1.jpg)
    ![In the Webhook trigger, the event name should be "cohost_notification" (without the quotes).](https://raw.githubusercontent.com/mogery/cohost-notification-server/images/ifttt_step2.jpg)
    ![In the Notifications action, the title should be the Value1 ingredient, the message should be the Value2 ingredient, and the link URL should be the Value3 ingredient.](https://raw.githubusercontent.com/mogery/cohost-notification-server/images/ifttt_step2.jpg)
 3. Get your IFTTT Webhook. You can find the link by clicking on the Documentation button on [this site](https://ifttt.com/maker_webhooks). You'll know you have the correct link when it starts with `https://maker.ifttt.com/trigger/`. When you have the link, you should replace `{event}` with `cohost_notification`.
 4. Create a `.env` file in the root directory of the repo. Inside you should set 3 values. `COHOST_EMAIL` should be set to the e-mail address of your cohost account. `COHOST_PASSWORD` should be your cohost password. `IFTTT_WEBHOOK` should be the Webhook link that you just got. **Make sure that you replaced `{event}` with `cohost_notification`.**
    
    Here's an example `.env` file (fill it out with your own info though):
    ```dotenv
    COHOST_EMAIL=eggbug@cohost.org
    COHOST_PASSWORD=hunter2
    IFTTT_WEBHOOK=https://maker.ifttt.com/trigger/cohost_notification/with/key/randomstringofcharacters
    ```

## Usage

```bash
node index.js
```

It will crash if cohost goes down, so you should probably pair it with [forever](https://npmjs.com/package/forever):
```bash
forever index.js
```