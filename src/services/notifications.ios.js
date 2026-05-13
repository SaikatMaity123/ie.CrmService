import notifee, { AuthorizationStatus, IOSAuthorizationOptions } from '@notifee/react-native';

export async function initNotifications() {
  // Request iOS permissions
  const settings = await notifee.requestPermission({
    alert: true,
    sound: true,
    badge: true,
    announcement: true,
  });

  if (settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED) {
    console.log('iOS Notifications Authorized');
  } else {
    console.log('iOS Notification Permission Denied');
  }
}

// Local notification using Notifee (iOS only)
export async function showLocalNotification(title, message) {
  await notifee.displayNotification({
    title,
    body: message,
    ios: {
      sound: 'default',
      foregroundPresentationOptions: {
        alert: true,
        badge: true,
        sound: true,
      },
    },
  });
}
