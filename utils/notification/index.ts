import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform, Alert, Linking } from 'react-native';
import i18n from '../../translations/i18n';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      vibrate:true
    }),
  });
export async function schedulePushNotification(data: any) {
    await Notifications.scheduleNotificationAsync({
        content: {
            title: "Shoofi",
            body: 'طلبية جديدة',
            data: data,
            sound: 'buffalosound.wav',
            vibrate: [10]
        },
        trigger: { seconds: 2 },
    });
}

export async function schedulePushNotificationDeliveryDelay(data: any) {
    await Notifications.scheduleNotificationAsync({
        content: {
            title: "Shoofi",
            body: 'تاخير بالارسالية',
            data: data,
            sound: 'deliverysound.wav',
            vibrate: [10]
        },
        trigger: { seconds: 2 },
    });
}

function showNotificationSettingsAlert() {
    if (Platform.OS !== 'android') return;
    Alert.alert(
        i18n.t("enable-notifications"),
        i18n.t("notifications-are-disabled"),
        [
            { text: i18n.t("cancel"), style: 'cancel' },
            { text: i18n.t("open-settings"), onPress: () => Linking.openSettings() },
        ]
    );
}

export async function registerForPushNotificationsAsync() {
    let token;
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        console.log('Existing notification permission status:', existingStatus);
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            console.log('Requesting notification permission...');
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
            console.log('Requested notification permission status:', status);
            if (finalStatus !== 'granted') {
                showNotificationSettingsAlert();
            }
        }
        try{
        token = (await Notifications.getExpoPushTokenAsync({projectId:'9019b715-65e9-4970-9f38-764b936d1abf'})).data;
        console.log('Push token:', token);
        }catch(e){
            console.log('Error getting push token:', e);
        }
    } else {
       // alert('Must use physical device for Push Notifications');
    }
    return token;
}