// import PushNotification from 'react-native-push-notification';
// import { Platform } from 'react-native';

// PushNotification.configure({
//   onNotification: n => console.log('LOCAL NOTIFICATION =>', n),
//   requestPermissions: Platform.OS === 'ios',
// });

// export const showLocalNotification = (title, message) => {
//   PushNotification.localNotification({
//     channelId: 'default-channel-id', // must exist
//     title,
//     message,
//     playSound: true,
//     soundName: 'default',
//     importance: 'high',
//     vibrate: true,
//     priority: 'high',
//     allowWhileIdle: true,
//     largeIcon: 'ic_notification', // optional, uses your app icon
//   });
// };

//import PushNotification from 'react-native-push-notification';
import { Platform } from 'react-native';

// 1. Create notification channel (Android 8+)
PushNotification.createChannel(
  {
    channelId: 'default-channel-id',
    channelName: 'Default Notifications',
    importance: 4, // high
    vibrate: true,
  },
  created => console.log(`Notification Channel: ${created}`) 
);

// 2. Configure
PushNotification.configure({
  onNotification: notif => {
    console.log('LOCAL NOTIFICATION =>', notif);
  },
  requestPermissions: Platform.OS === 'ios',
}); 

// 3. Export method for use in any page
export const showLocalNotification = (title, message) => {
  PushNotification.localNotification({
    channelId: 'default-channel-id',
    title: title,
    message: message,
    playSound: true,
    soundName: 'default',
    priority: 'high',
    importance: 'high',
    vibrate: true,
    smallIcon: 'crm_logo',       // must exist in android/app/src/main/res/drawable-*/ 
    largeIcon: 'ic_notification', // optional  
    allowWhileIdle: true,
  });
};
