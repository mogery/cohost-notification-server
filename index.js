require("dotenv").config();
const cohost = require("cohost");
const fetch = require("node-fetch");

if (!process.env.IFTTT_WEBHOOK) {
    console.error("IFTTT_WEBHOOK is empty! Did you set it in your .env file?");
    process.exit(1);
}

(async function index() {
    let user = new cohost.User();

    console.log("Signing in...");
    try {
        await user.login(process.env.COHOST_EMAIL, process.env.COHOST_PASSWORD);
    } catch(e) {
        console.error(e);
        console.error("Failed to sign in! Did you set COHOST_EMAIL and COHOST_PASSWORD in your .env file?");
        process.exit(1);
    }
    console.log("Signed in!");

    let lastTime;

    async function pollNotifications() {
        let res = await user.getNotifications();

        if (lastTime) {
            let news = res.notifications.filter(x => new Date(x.createdAt) > lastTime);
            console.log(news.length, "new notifications")

            for (let notif of news) {
                let project = res.projects[notif.fromProjectId]
                let post = res.posts[notif.toPostId]
                let sharePost = res.posts[notif.sharePostId]
                let comment = res.comments[notif.commentId]

                let data = {}

                if (notif.type == "follow") {
                    data.value1 = `@${project.handle} followed you`
                    data.value2 = project.dek || "no dek.";
                    data.value3 = `https://cohost.org/${encodeURIComponent(project.handle)}`;
                } else if (notif.type == "share") {
                    data.value1 = `@${project.handle} shared your post`;
                    data.value2 = (sharePost.plainTextBody || post.plainTextBody).replace(/<[^>]*>?/gm, '');
                    data.value3 = sharePost.singlePostPageUrl;
                } else if (notif.type == "like") {
                    data.value1 = `@${project.handle} liked your post`;
                    data.value2 = post.plainTextBody.replace(/<[^>]*>?/gm, '');
                    data.value3 = post.singlePostPageUrl;
                } else if (notif.type == "comment") {
                    data.value1 = `@${project.handle} commented on your post`;
                    data.value2 = comment.comment.body.replace(/<[^>]*>?/gm, '');
                    data.value3 = post.singlePostPageUrl;
                } else {
                    data.value1 = `unknown cohost notif type '${notif.type}'`
                    data.value2 = JSON.stringify(notif);
                    data.value3 = '';
                    console.warn("WARNING: Unknown notification.");
                    console.warn(JSON.stringify(notif));
                }

                let req = await fetch(process.env.IFTTT_WEBHOOK, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(data)
                });

                if (req.status >= 400) {
                    console.error("Failed to call webhook!");
                    console.error(await req.text());
                }
            }

            if (news.length > 0) {
                lastTime = new Date(news[0].createdAt);
            }
        } else {
            lastTime = new Date(res.notifications[0].createdAt);
            console.log("Calibrated time: showing notifications after", lastTime);
        }

        setTimeout(pollNotifications, 60 * 1000);
    }

    await pollNotifications();
})();