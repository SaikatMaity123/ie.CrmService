import PushNotification from 'react-native-push-notification';

PushNotification.createChannel(
  {
    channelId: 'default-channel-id',
    channelName: 'Default Channel',
    importance: 4,
    vibrate: true,
  },
  created => console.log(`Notification Channel: ${created}`)
);

export function initNotifications() {
  PushNotification.configure({
    onNotification: function (notif) {
      console.log('Android Local Notification:', notif);
    },
    popInitialNotification: true,
    requestPermissions: true,
  });
}

export const showLocalNotification = (title, message) => {
  PushNotification.localNotification({
    channelId: 'default-channel-id',   // IMPORTANT
    title,
    message,
    playSound: true,
    soundName: 'default',
    priority: 'high',
    importance: 'high',
    vibrate: true,
    // smallIcon: 'crm_logo',
    // largeIcon: 'ic_notification',
    allowWhileIdle: true,
  });
};
