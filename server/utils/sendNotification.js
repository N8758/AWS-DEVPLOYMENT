require("../config/firebaseAdmin");

const { getMessaging } =
  require("firebase-admin/messaging");

async function sendNotification(
  token,
  title,
  body
) {
  try {

    await getMessaging().send({
      token,
      notification: {
        title,
        body,
      },
    });

    console.log(
      "Notification sent successfully"
    );

  } catch (err) {

    console.error(
      "Notification Error:",
      err
    );

  }
}

module.exports = sendNotification;