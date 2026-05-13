import {
  View,
  Text,
  Alert,
  Linking,
  Platform,
  TouchableOpacity,
  StatusBar,
  PermissionsAndroid,
  NativeModules,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import LinearGradient from 'react-native-linear-gradient';
import Splashscreen from './src/screens/Splashscreen';
//import PushNotification from 'react-native-push-notification';
//import LogIn from './src/screens/LogIn';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import AppNavScreen from './src/screens/AppNavScreen';
import TourPlanSubmission from './src/screens/TourPlanSubmission';
import TourViewScreen from './src/screens/TourViewScreen';
import TourProgScreen from './src/screens/TourProgScreen';
import RequestApprovalScreen from './src/screens/RequestApprovalScreen';
import SettingScreen from './src/screens/SettingScreen';
import AppNavOrder from './src/screens/AppNavOrder';
import AppNavExpense from './src/screens/AppNavExpense';
import AppNavMaster from './src/screens/AppNavMaster';
import MasterDoctor from './src/screens/MasterDoctor';
import MasterRetailer from './src/screens/MasterRetailer';
import ViewMasterData from './src/screens/ViewMasterData';
import UniversalSearch from './src/screens/UniversalSearch';
import DCRScreen from './src/screens/DCRScreen';
import AppNavDCRScreen from './src/screens/AppNavDCRScreen';
import DoctorDCRScreen from './src/screens/DoctorDCRScreen';
import RetailerDCRScreen from './src/screens/RetailerDCRScreen';
import DoctorUScreen from './src/screens/DoctorUScreen';
import RetailerUnlisted from './src/screens/RetailerUnlisted';
import UnlistedScreen from './src/screens/UnlistedScreen';
import OtherScreen from './src/screens/OtherScreen';
import StayScreen from './src/screens/StayScreen';
import ViewDCRScreen from './src/screens/ViewDCRScreen';
import AppNavreport from './src/screens/AppNavreport';
import {SafeAreaProvider} from 'react-native-safe-area-context';
//import VersionCheck from 'react-native-version-check';
import SpInAppUpdates, {
  IAUUpdateKind,
  StartUpdateOptions,
  IAUInstallStatus,
} from 'sp-react-native-in-app-updates';
import RCPA from './src/screens/RCPA';
//import RCPANEW from './src/screens/RCPANEW';
import RCPAN from './src/screens/RCPAN';
import ActivityDashBoard from './src/screens/ActivityDashBoard';
import DoctorActivities from './src/screens/DoctorActivities';
import PartyActivities from './src/screens/PartyActivities';
import ViewActivity from './src/screens/ViewActivity';
import LeaveScreen from './src/screens/LeaveScreen';
import LeaveApplicationList from './src/screens/LeaveApplicationList';
import EmployeeQuizScreen from './src/screens/EmployeeQuizScreen';
import DoctorQuizScreen from './src/screens/DoctorQuizScreen';
import MarketSurveyScreen from './src/screens/MarketSurveyScreen';
import HalfDayLeaveScreen from './src/screens/HalfDayLeaveScreen';
import FullDayLeaveScreen from './src/screens/FullDayLeaveScreen';
import UserInfoScreen from './src/screens/UserInfoScreen';
import DCRDoctor from './src/screens/DCRDoctor';
import ClientDashBoard from './src/screens/ClientDashBoard';
import ClientMSRList from './src/screens/ClientMSRList';
import DCRDoctorNew from './src/screens/DCRDoctorNew';
import ReportsWebView from './src/screens/ReportsWebView';
import StartDCRScreen from './src/screens/StartDCRScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {CommonActions} from '@react-navigation/native';
import AppNavQuiz from './src/screens/AppNavQuiz';
import AppNavActivity from './src/screens/AppNavActivity';
import MyStatusScreen from './src/screens/MyStatusScreen';
import ComparativeSales from './src/screens/ComparativeSales';
import ProductWiseSale from './src/screens/ProductWiseSale';
import HierarchyWiseSale from './src/screens/HierarchyWiseSale';
import SalesDashBoard from './src/screens/SalesDashBoard';
import SecondaryStockClosing from './src/screens/SecondaryStockClosing';
import OutStandingReports from './src/screens/OutStandingReports';
import StockReports from './src/screens/StockReports';
import SalesOrderTransaction from './src/screens/SalesOrderTransaction';
import LeaveApproval from './src/screens/LeaveApproval';
import ApprovalDashboard from './src/screens/ApprovalDashboard';
import LeaveStatus from './src/screens/LeaveStatus';
import AppNavDPC from './src/screens/AppNavDPC';
import TestGps from './src/screens/TestGps';
import DcrAdminDashBoard from './src/screens/DcrAdminDashBoard';
import AdminDoctor from './src/screens/AdminDoctor'; // Import the AdminDoctor component
import AdminRetailer from './src/screens/AdminRetailer'; // Import the AdminRetailer component
import AdminOthers from './src/screens/AdminOthers';
import AdminViewDcr from './src/screens/AdminViewDcr';
import AdminSalesDashboard from './src/screens/AdminSalesDashboard'; // Import the AdminSalesDashboard component
import SettingScreenNew from './src/screens/SettingScreenNew';
import DPCScreen from './src/screens/DPCScreen';
import DPCList from './src/screens/DPCList';
import RXsurvey from './src/screens/RXsurvey';
import NoticeBoardList from './src/screens/NoticeBoardList';
import messaging from '@react-native-firebase/messaging';
import {showLocalNotification} from './src/services/notifications';
import {initNotifications} from './src/services/notifications';
import FacebookUserShare from './src/screens/FacebookUserShare';
import notifee from '@notifee/react-native';
import LogInScreen from './src/screens/LogInScreen';
import AppNavDash from './src/screens/AppNavDash';
import Attendance from './src/screens/Attendance';
import ClientVisitScreen from './src/screens/ClientVisitScreen';
import ViewCustomerVisitList from './src/screens/ViewCustomerVisitList';
import MasterAccount from './src/screens/MasterAccount';
import MasterRefer from './src/screens/MasterRefer';
import MasterProduct from './src/screens/MasterProduct';
import ViewMaster from './src/screens/ViewMaster';
import AppNavLead from './src/screens/AppNavLead';
import LeadGenerationView from './src/screens/LeadGenerationView';

console.log('NativeModules:', Object.keys(NativeModules));
const Stack = createNativeStackNavigator();

const App = () => {
  const [showSplashScreen, setShowSplashScreen] = useState(true);
  console.log('NativeModules:', Object.keys(NativeModules));
  useEffect(() => {
    //requestTracking();
    // console.warn('hello Saikat');
    requestNotificationPermission();
    initNotifications();
    checkForUpdate();

    // VersionCheck.needUpdate().then(async res => {
    //   console.log(res.isNeeded); // true
    //   if (res.isNeeded) {
    //     Linking.openURL(res.storeUrl); // open store if update is needed.
    //   }
    // });

    setTimeout(() => {
      setShowSplashScreen(false);
    }, 2000);

    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('📩 Foreground message:', remoteMessage);

      const {title, body} = remoteMessage.notification || {};
      if (title && body) {
        // show local push since FCM won't display automatically
        showLocalNotification(title, body);
        Alert.alert(title, body);
      }
    });

    return unsubscribe;
  }, []);

  async function requestNotificationPermission() {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
      console.log('Notification permission:', granted);
    }
    if (Platform.OS === 'ios') {
      const settings = await notifee.requestPermission({
        alert: true,
        sound: true,
        badge: true,
      });

      console.log('iOS Permission:', settings);
    }
  }

  // const checkForUpdate = async () => {
  //   try {
  //     const latestVersion = await VersionCheck.getLatestVersion();
  //     const currentVersion = VersionCheck.getCurrentVersion();

  //     if (VersionCheck.needUpdate({currentVersion, latestVersion})) {
  //       Alert.alert(
  //         'Update Available',
  //         'A new version of the app is available. Please update to the latest version.',
  //         [
  //           {text: 'Cancel', style: 'cancel'},
  //           {
  //             text: 'Update',
  //             onPress: () => {
  //               Linking.openURL(VersionCheck.getStoreUrl()); // Opens the Play Store link
  //             },
  //           },
  //         ],
  //         {cancelable: false},
  //       );
  //     }
  //   } catch (error) {
  //     console.error('Error checking app version', error);
  //   }
  // };

  const checkForUpdate = async () => {
    const inAppUpdates = new SpInAppUpdates(false); // isDebug set to false

    try {
      const result = await inAppUpdates.checkNeedsUpdate();

      if (result.shouldUpdate) {
        let updateOptions = {};

        if (Platform.OS === 'android') {
          updateOptions = {
            updateType: IAUUpdateKind.IMMEDIATE,
          };
        } else if (Platform.OS === 'ios') {
          updateOptions = {
            title: 'Update available',
            message:
              'There is a new version of the app available on the App Store. Do you want to update it?',
            buttonUpgradeText: 'Update',
            buttonCancelText: 'Cancel',
          };
        }

        // Add status update listener for download progress
        const statusListener = downloadStatus => {
          console.log('Download status:', downloadStatus);

          if (downloadStatus.status === IAUInstallStatus.DOWNLOADED) {
            console.log('Downloaded');
            inAppUpdates.installUpdate();

            // Remove listener after installation
            inAppUpdates.removeStatusUpdateListener(statusListener);
          }
        };

        // Add the listener before starting the update
        inAppUpdates.addStatusUpdateListener(statusListener);

        // Start the update process
        await inAppUpdates.startUpdate(updateOptions);
      }
    } catch (error) {
      console.log('Error checking for update:', error);
    }
  };

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#ffffff" />
      <NavigationContainer>
        <Stack.Navigator>
          {showSplashScreen ? (
            <Stack.Screen
              options={{
                headerShown: false,
                headerBackTitleVisible: false,
                headerBackVisible: false,
              }}
              name="Splash"
              component={Splashscreen}
            />
          ) : null}
          <Stack.Screen
            options={{
              headerShown: false,
              headerBackTitleVisible: false,
              headerBackVisible: false,
            }}
            name="LogIn"
            component={LogInScreen}
          />
          <Stack.Screen
            options={{
              headerShown: false,
              headerBackTitleVisible: false,
              headerBackVisible: false,
            }}
            name="AppNavScreen"
            component={AppNavScreen}
          />
          <Stack.Screen
            options={{
              headerShown: false,
              headerBackTitleVisible: false,
              headerBackVisible: false,
            }}
            name="AppNavDash"
            component={AppNavDash}
          />

          <Stack.Screen
            options={{
              headerBackTitleVisible: false,
              headerTintColor: 'black',
            }}
            name="Attendance"
            component={Attendance}
          />

          <Stack.Screen
            options={{
              headerBackTitleVisible: false,
              headerTintColor: 'black',
            }}
            name="Client Visits"
            component={ClientVisitScreen}
          />
          <Stack.Screen
            options={{
              headerBackTitleVisible: false,
              headerTintColor: 'black',
            }}
            name="Client Visit List"
            component={ViewCustomerVisitList}
          />

          {/* <Stack.Screen
          options={{
            //headerShown: false,
            headerBackTitleVisible: false,
            headerTintColor: 'black',
            //headerBackVisible: false,
          }}
          name="Tour Program Approval"
          component={ManagerApproval}
        /> */}
          <Stack.Screen
            options={({navigation}) => ({
              headerBackTitleVisible: false,
              headerTintColor: '#ffffff',
              headerTitleAlign: 'center',
              // headerTitle: () => (
              //   <Text
              //     style={{
              //       fontSize: 18,
              //       fontWeight: 'bold',
              //       textAlign: 'center',
              //       //flex: 1,
              //       color: '#ffffff',
              //     }}>
              //     Tour Plan Submission
              //   </Text>
              // ),
              headerBackground: () => (
                <LinearGradient
                  colors={['#a9ddfaff', '#005696']} // light → dark
                  style={{flex: 1}}
                  start={{x: 0, y: 0}}
                  end={{x: 0, y: 1}}
                />
              ),
              headerLeft: () => (
                <TouchableOpacity
                  onPress={() =>
                    navigation.dispatch(
                      CommonActions.reset({
                        index: 0,
                        routes: [{name: 'AppNavScreen'}],
                      }),
                    )
                  }
                  style={{
                    paddingHorizontal: 10, // control your own spacing
                    paddingVertical: 8,
                    backgroundColor: 'transparent', // REMOVE iOS highlight
                  }}
                  hitSlop={{top: 10, bottom: 10, left: 10, right: 10}} // safe touch area
                  activeOpacity={0.9} // nice iOS feedback without white circle
                >
                  <Ionicons name="arrow-back" size={24} color="#ffffff" />
                </TouchableOpacity>
              ),
            })}
            name="Tour Plan Submission"
            component={TourPlanSubmission}
          />
          <Stack.Screen
            options={{
              //headerShown: false,
              headerBackTitleVisible: false,
              headerTintColor: 'black',
              //headerBackVisible: false,
            }}
            name="Activity DashBoard"
            component={ActivityDashBoard}
          />
          <Stack.Screen
            options={({navigation}) => ({
              //headerShown: false,
              headerBackTitleVisible: false,
              headerTintColor: '#ffffff',
              headerTitleAlign: 'center',
              //headerBackVisible: false,
              headerBackground: () => (
                <LinearGradient
                  colors={['#a9ddfaff', '#005696']} // light → dark
                  style={{flex: 1}}
                  start={{x: 0, y: 0}}
                  end={{x: 0, y: 1}}
                />
              ),
              headerLeft: () => (
                <TouchableOpacity
                  onPress={() =>
                    navigation.dispatch(
                      CommonActions.reset({
                        index: 0,
                        routes: [{name: 'Tour Plan Submission'}], // or whatever your main screen is
                      }),
                    )
                  }>
                  <Ionicons name="arrow-back" size={24} color="#ffffff" />
                </TouchableOpacity>
              ),
            })}
            name="Tour Program"
            //component={TourNavScreen}
            component={TourProgScreen}
          />
          <Stack.Screen
            options={{
              //headerShown: false,
              headerBackTitleVisible: false,
              headerTintColor: '#ffffff',
              //headerBackVisible: false,
              headerTitleAlign: 'center',
              headerBackground: () => (
                <LinearGradient
                  colors={['#a9ddfaff', '#005696']} // light → dark
                  style={{flex: 1}}
                  start={{x: 0, y: 0}}
                  end={{x: 0, y: 1}}
                />
              ),
            }}
            name="Tour View"
            component={TourViewScreen}
          />
          <Stack.Screen
            options={{
              //headerShown: false,
              headerBackTitleVisible: false,
              headerTintColor: 'black',
              //headerBackVisible: false,
            }}
            name="RX-Survey"
            component={RXsurvey}
          />
          <Stack.Screen
            options={{
              //headerShown: false,
              headerBackTitleVisible: false,
              headerTintColor: '#ffffff',
              headerTitleAlign: 'center',
              //headerBackVisible: false,
              headerBackground: () => (
                <LinearGradient
                  colors={['#a9ddfaff', '#005696']} // light → dark
                  style={{flex: 1}}
                  start={{x: 0, y: 0}}
                  end={{x: 0, y: 1}}
                />
              ),
            }}
            name="Request Approval"
            component={RequestApprovalScreen}
          />
          <Stack.Screen
            // options={{
            //   //headerShown: false,
            //   headerBackTitleVisible: false,
            //   headerTintColor: 'black',
            //   //headerBackVisible: false,
            // }}
            // name="Secondary Closing Stock Entry"
            options={({navigation}) => ({
              headerBackTitleVisible: false,
              headerTintColor: 'black',
              headerTitle: () => (
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: 'bold',
                    textAlign: 'center',
                    flex: 1,
                  }}>
                  Secondary Closing Stock Entry
                </Text>
              ),
              headerLeft: () => (
                <TouchableOpacity
                  onPress={() =>
                    navigation.dispatch(
                      CommonActions.reset({
                        index: 0,
                        routes: [{name: 'AppNavScreen'}], // or whatever your main screen is
                      }),
                    )
                  }>
                  <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
              ),
            })}
            name="Secondary Closing Stock Entry"
            component={SecondaryStockClosing}
          />

          <Stack.Screen
            options={{
              //headerShown: false,
              headerBackTitleVisible: false,
              headerTintColor: '#ffffff',
              //headerBackVisible: false,
              headerBackground: () => (
                <LinearGradient
                  colors={['#a9ddfaff', '#005696']} // light → dark
                  style={{flex: 1}}
                  start={{x: 0, y: 0}}
                  end={{x: 0, y: 1}}
                />
              ),
            }}
            name="DPC Entry"
            component={DPCScreen}
          />
          <Stack.Screen
            options={{
              //headerShown: false,
              headerBackTitleVisible: false,
              headerTintColor: '#ffffff',
              //headerBackVisible: false,
              headerBackground: () => (
                <LinearGradient
                  colors={['#a9ddfaff', '#005696']} // light → dark
                  style={{flex: 1}}
                  start={{x: 0, y: 0}}
                  end={{x: 0, y: 1}}
                />
              ),
            }}
            name="DPC View"
            component={DPCList}
          />
          <Stack.Screen
            options={{
              headerShown: true,
              headerBackTitleVisible: false,
              headerBackVisible: false,
              headerTitleAlign: 'center',
            }}
            name="Dashboard"
            component={ClientDashBoard}
          />
          <Stack.Screen
            options={{
              headerBackTitleVisible: false,
              headerTintColor: 'black',
            }}
            name="Customer Visit"
            component={ClientMSRList}
          />
          <Stack.Screen
            options={({navigation}) => ({
              headerBackTitleVisible: false,
              headerTintColor: 'black',
              headerTitle: () => (
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: 'bold',
                    textAlign: 'center',
                    flex: 1,
                    color: '#ffffff',
                    paddingRight: 50,
                  }}>
                  SettingScreen
                </Text>
              ),
              headerBackground: () => (
                <LinearGradient
                  colors={['#a9ddfaff', '#005696']} // light → dark
                  style={{flex: 1}}
                  start={{x: 0, y: 0}}
                  end={{x: 0, y: 1}}
                />
              ),
              headerLeft: () => (
                <TouchableOpacity
                  onPress={() =>
                    navigation.dispatch(
                      CommonActions.reset({
                        index: 0,
                        routes: [{name: 'AppNavScreen'}], // or whatever your main screen is
                      }),
                    )
                  }>
                  <Ionicons name="arrow-back" size={24} color="#ffffff" />
                </TouchableOpacity>
              ),
            })}
            name="SettingScreen"
            component={SettingScreenNew}
          />
          {/* <Stack.Screen
            options={({ navigation }) => ({
              headerBackTitleVisible: false,
              headerTintColor: 'black',
              headerTitle: () => (
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: 'bold',
                    textAlign: 'center',
                    flex: 1,
                  }}>
                  RX-Survey
                </Text>
              ),
              // headerLeft: () => (
              //   <TouchableOpacity
              //     onPress={() =>
              //       navigation.dispatch(
              //         CommonActions.reset({
              //           index: 0,
              //           routes: [{ name: 'AppNavScreen' }], // or whatever your main screen is
              //         }),
              //       )
              //     }>
              //     <Ionicons name="arrow-back" size={24} color="black" />
              //   </TouchableOpacity>
              // ),
            })}
            name="RX-Survey"
            component={RXsurvey}
          /> */}
          <Stack.Screen
            options={{
              headerShown: false,
              headerBackTitleVisible: false,
              headerBackVisible: false,
            }}
            name="AppNavOrder"
            component={AppNavOrder}
          />
          <Stack.Screen
            options={{
              headerShown: false,
              headerBackTitleVisible: false,
              headerBackVisible: false,
            }}
            name="AppNavExpense"
            component={AppNavExpense}
          />
          <Stack.Screen
            options={{
              headerShown: false,
              headerBackTitleVisible: false,
              headerBackVisible: false,
            }}
            name="AppNavMaster"
            component={AppNavMaster}
          />
          <Stack.Screen
            options={{
              headerShown: false,
              headerBackTitleVisible: false,
              headerBackVisible: false,
            }}
            name="AppNavLead"
            component={AppNavLead}
          />
          <Stack.Screen
            // options={{
            //   //headerShown: false,
            //   headerBackTitleVisible: false,
            //   headerTintColor: 'black',
            //   //headerBackVisible: false,
            // }}
            options={({navigation}) => ({
              headerBackTitleVisible: false,
              headerTintColor: '#ffffff',
              headerBackground: () => (
                <LinearGradient
                  colors={['#a9ddfaff', '#005696']} // light → dark
                  style={{flex: 1}}
                  start={{x: 0, y: 0}}
                  end={{x: 0, y: 1}}
                />
              ),
              headerTitle: () => (
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: 'bold',
                    textAlign: 'center',
                    flex: 1,
                    color: '#ffffff',
                    paddingRight: 50,
                  }}>
                  Master Account
                </Text>
              ),
              // headerLeft: () => (
              //   <TouchableOpacity
              //     onPress={() =>
              //       navigation.dispatch(
              //         CommonActions.reset({
              //           index: 0,
              //           routes: [{name: 'AppNavMaster'}], // or whatever your main screen is
              //         }),
              //       )
              //     }>
              //     <Ionicons name="arrow-back" size={24} color="#ffffff" />
              //   </TouchableOpacity>
              // ),
            })}
            name="Master Account"
            component={MasterAccount}
          />
          <Stack.Screen
            // options={{
            //   //headerShown: false,
            //   headerBackTitleVisible: false,
            //   headerTintColor: 'black',
            //   //headerBackVisible: false,
            // }}
            options={({navigation}) => ({
              headerBackTitleVisible: false,
              headerTintColor: '#ffffff',
              headerBackground: () => (
                <LinearGradient
                  colors={['#a9ddfaff', '#005696']} // light → dark
                  style={{flex: 1}}
                  start={{x: 0, y: 0}}
                  end={{x: 0, y: 1}}
                />
              ),
              headerTitle: () => (
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: 'bold',
                    textAlign: 'center',
                    flex: 1,
                    color: '#ffffff',
                    paddingRight: 50,
                  }}>
                  Master Referr
                </Text>
              ),
              // headerLeft: () => (
              //   <TouchableOpacity
              //     onPress={() =>
              //       navigation.dispatch(
              //         CommonActions.reset({
              //           index: 0,
              //           routes: [{name: 'AppNavMaster'}], // or whatever your main screen is
              //         }),
              //       )
              //     }>
              //     <Ionicons name="arrow-back" size={24} color="#ffffff" />
              //   </TouchableOpacity>
              // ),
            })}
            name="Master Referr"
            component={MasterRefer}
          />
          <Stack.Screen
            // options={{
            //   //headerShown: false,
            //   headerBackTitleVisible: false,
            //   headerTintColor: 'black',
            //   //headerBackVisible: false,
            // }}
            options={({navigation}) => ({
              headerBackTitleVisible: false,
              headerTintColor: '#ffffff',
              headerBackground: () => (
                <LinearGradient
                  colors={['#a9ddfaff', '#005696']} // light → dark
                  style={{flex: 1}}
                  start={{x: 0, y: 0}}
                  end={{x: 0, y: 1}}
                />
              ),
              headerTitle: () => (
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: 'bold',
                    textAlign: 'center',
                    flex: 1,
                    color: '#ffffff',
                    paddingRight: 50,
                  }}>
                 Master Product
                </Text>
              ),
              // headerLeft: () => (
              //   <TouchableOpacity
              //     onPress={() =>
              //       navigation.dispatch(
              //         CommonActions.reset({
              //           index: 0,
              //           routes: [{name: 'AppNavMaster'}], // or whatever your main screen is
              //         }),
              //       )
              //     }>
              //     <Ionicons name="arrow-back" size={24} color="#ffffff" />
              //   </TouchableOpacity>
              // ),
            })}
            name="Master Product"
            component={MasterProduct}
          />
          <Stack.Screen
            options={({navigation}) => ({
              headerBackTitleVisible: false,
              headerTintColor: '#ffffff',
              headerBackground: () => (
                <LinearGradient
                  colors={['#a9ddfaff', '#005696']} // light → dark
                  style={{flex: 1}}
                  start={{x: 0, y: 0}}
                  end={{x: 0, y: 1}}
                />
              ),
              headerTitle: () => (
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: 'bold',
                    textAlign: 'center',
                    flex: 1,
                    color: '#ffffff',
                    paddingRight: 50,
                  }}>
                 Lead Generation View
                </Text>
              ),
            })}
            name="Lead Generation View"
            component={LeadGenerationView}
          />
          <Stack.Screen
            // options={{
            //   //headerShown: false,
            //   headerBackTitleVisible: false,
            //   headerTintColor: 'black',
            //   //headerBackVisible: false,
            // }}
            options={({navigation}) => ({
              headerBackTitleVisible: false,
              headerTintColor: '#ffffff',
              headerBackground: () => (
                <LinearGradient
                  colors={['#a9ddfaff', '#005696']} // light → dark
                  style={{flex: 1}}
                  start={{x: 0, y: 0}}
                  end={{x: 0, y: 1}}
                />
              ),
              headerTitle: () => (
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: 'bold',
                    textAlign: 'center',
                    flex: 1,
                    color: '#ffffff',
                    paddingRight: 50,
                  }}>
                  Master Doctor
                </Text>
              ),
              headerLeft: () => (
                <TouchableOpacity
                  onPress={() =>
                    navigation.dispatch(
                      CommonActions.reset({
                        index: 0,
                        routes: [{name: 'AppNavMaster'}], // or whatever your main screen is
                      }),
                    )
                  }>
                  <Ionicons name="arrow-back" size={24} color="#ffffff" />
                </TouchableOpacity>
              ),
            })}
            name="Master Doctor"
            component={MasterDoctor}
          />
          <Stack.Screen
            // options={{
            //   //headerShown: false,
            //   headerBackTitleVisible: false,
            //   headerTintColor: 'black',
            //   //headerBackVisible: false,
            // }}
            options={({navigation}) => ({
              headerBackTitleVisible: false,
              headerTintColor: '#ffffff',
              headerTitle: () => (
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: 'bold',
                    textAlign: 'center',
                    color: '#ffffff',
                    paddingRight: 50,
                    flex: 1,
                  }}>
                  Master Retailer
                </Text>
              ),
              headerBackground: () => (
                <LinearGradient
                  colors={['#a9ddfaff', '#005696']} // light → dark
                  style={{flex: 1}}
                  start={{x: 0, y: 0}}
                  end={{x: 0, y: 1}}
                />
              ),
              headerLeft: () => (
                <TouchableOpacity
                  onPress={() =>
                    navigation.dispatch(
                      CommonActions.reset({
                        index: 0,
                        routes: [{name: 'AppNavMaster'}], // or whatever your main screen is
                      }),
                    )
                  }>
                  <Ionicons name="arrow-back" size={24} color="#ffffff" />
                </TouchableOpacity>
              ),
            })}
            name="Master Retailer"
            component={MasterRetailer}
          />

          <Stack.Screen
            // options={{
            //   //headerShown: false,
            //   headerBackTitleVisible: false,
            //   headerTintColor: 'black',
            //   //headerBackVisible: false,
            // }}
            options={({navigation}) => ({
              headerBackTitleVisible: false,
              headerTintColor: 'black',
              headerTitle: () => (
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: 'bold',
                    textAlign: 'center',
                    flex: 1,
                    paddingRight: 50,
                    color: '#ffffff',
                  }}>
                  View Master Data
                </Text>
              ),
              headerBackground: () => (
                <LinearGradient
                  colors={['#a9ddfaff', '#005696']} // light → dark
                  style={{flex: 1}}
                  start={{x: 0, y: 0}}
                  end={{x: 0, y: 1}}
                />
              ),
              headerLeft: () => (
                <TouchableOpacity
                  onPress={() =>
                    navigation.dispatch(
                      CommonActions.reset({
                        index: 0,
                        routes: [{name: 'AppNavMaster'}], // or whatever your main screen is
                      }),
                    )
                  }>
                  <Ionicons name="arrow-back" size={24} color="#ffffff" />
                </TouchableOpacity>
              ),
            })}
            name="View Master Data"
            component={ViewMasterData}
          />
          <Stack.Screen
            options={({ navigation }) => ({
              headerBackTitleVisible: false,
              headerTintColor: '#ffffff',
              headerBackground: () => (
                <LinearGradient
                  colors={['#a9ddfaff', '#005696']} // light → dark
                  style={{ flex: 1 }}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                />
              ),
              headerTitle: () => (
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: 'bold',
                    textAlign: 'center',
                    //flex: 1,
                    color: '#ffffff',
                    //paddingRight: 10,
                    paddingLeft: 20,
                    //justifyContent: 'center',
                  }}>
                  View  Master 
                </Text>
              ),
            })}
            name="View Master"
            component={ViewMaster}
          />
          <Stack.Screen
            // options={{
            //   //headerShown: false,
            //   headerBackTitleVisible: false,
            //   headerTintColor: 'black',
            //   //headerBackVisible: false,
            // }}
            options={({navigation}) => ({
              headerBackTitleVisible: false,
              headerTintColor: 'black',
              headerTitle: () => (
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: 'bold',
                    textAlign: 'center',
                    flex: 1,
                    color: '#ffffff',
                    paddingRight: 50,
                  }}>
                  Universal Search
                </Text>
              ),
              headerBackground: () => (
                <LinearGradient
                  colors={['#a9ddfaff', '#005696']} // light → dark
                  style={{flex: 1}}
                  start={{x: 0, y: 0}}
                  end={{x: 0, y: 1}}
                />
              ),
              headerLeft: () => (
                <TouchableOpacity
                  onPress={() =>
                    navigation.dispatch(
                      CommonActions.reset({
                        index: 0,
                        routes: [{name: 'AppNavMaster'}], // or whatever your main screen is
                      }),
                    )
                  }>
                  <Ionicons name="arrow-back" size={24} color="#ffffff" />
                </TouchableOpacity>
              ),
            })}
            name="Universal Search"
            component={UniversalSearch}
          />
          <Stack.Screen
            options={{
              //headerShown: false,
              headerBackTitleVisible: false,
              headerTintColor: '#ffffff',
              //headerBackVisible: false,
              headerTitleAlign: 'center',
              headerBackground: () => (
                <LinearGradient
                  colors={['#a9ddfaff', '#005696']} // light → dark
                  style={{flex: 1}}
                  start={{x: 0, y: 0}}
                  end={{x: 0, y: 1}}
                />
              ),
            }}
            name="DCR Session"
            component={StartDCRScreen}
          />
          <Stack.Screen
            options={{
              headerShown: false,
              headerBackTitleVisible: false,
              headerBackVisible: false,
            }}
            name="AppNavDCRScreen"
            component={AppNavDCRScreen}
          />
          <Stack.Screen
            // options={{
            //   //headerShown: false,
            //   headerBackTitleVisible: false,
            //   headerTintColor: 'black',
            //   //headerBackVisible: false,
            // }}
            options={({navigation}) => ({
              headerBackTitleVisible: false,
              headerTintColor: '#ffffff',
              // headerStyle: {
              //   backgroundColor: '#005696', // background color for the header
              // },
              headerBackground: () => (
                <LinearGradient
                  colors={['#a9ddfaff', '#005696']} // light → dark
                  style={{flex: 1}}
                  start={{x: 0, y: 0}}
                  end={{x: 0, y: 1}}
                />
              ),
              headerTitle: () => (
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: 'bold',
                    textAlign: 'center',
                    color: '#ffffff', // white title text
                    flex: 1,
                    paddingRight: 50,
                  }}>
                  Doctor Daily Call Report
                </Text>
              ),
              headerLeft: () => (
                <TouchableOpacity
                  onPress={() =>
                    navigation.dispatch(
                      CommonActions.reset({
                        index: 0,
                        routes: [{name: 'AppNavDCRScreen'}], // or whatever your main screen is
                      }),
                    )
                  }>
                  <Ionicons name="arrow-back" size={24} color="#ffffff" />
                </TouchableOpacity>
              ),
            })}
            name="Doctor Daily Call Report"
            //component={DCRDoctor}
            component={DCRDoctorNew}
          />
          <Stack.Screen
            // options={{
            //   //headerShown: false,
            //   headerBackTitleVisible: false,
            //   headerTintColor: 'black',
            //   //headerBackVisible: false,
            // }}
            options={({navigation}) => ({
              headerBackTitleVisible: false,
              headerTintColor: '#ffffff',
              // headerStyle: {
              //   backgroundColor: '#005696', // background color for the header
              // },
              // ✅ Add gradient background
              headerBackground: () => (
                <LinearGradient
                  colors={['#a9ddfaff', '#005696']} // light → dark
                  style={{flex: 1}}
                  start={{x: 0, y: 0}}
                  end={{x: 0, y: 1}}
                />
              ),
              headerTitle: () => (
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: 'bold',
                    textAlign: 'center',
                    color: '#ffffff', // white title text
                    flex: 1,
                    paddingRight: 50,
                  }}>
                  Retailer Daily Call Report
                </Text>
              ),
              headerLeft: () => (
                <TouchableOpacity
                  onPress={() =>
                    navigation.dispatch(
                      CommonActions.reset({
                        index: 0,
                        routes: [{name: 'AppNavDCRScreen'}], // or whatever your main screen is
                      }),
                    )
                  }>
                  <Ionicons name="arrow-back" size={24} color="#ffffff" />
                </TouchableOpacity>
              ),
            })}
            name="Retailer Daily Call Report"
            component={RetailerDCRScreen}
          />
          <Stack.Screen
            options={{
              //headerShown: false,
              headerBackTitleVisible: false,
              headerTintColor: 'black',
              //headerBackVisible: false,
            }}
            name="User Info"
            component={UserInfoScreen}
          />
          <Stack.Screen
            // options={{
            //   //headerShown: false,
            //   headerBackTitleVisible: false,
            //   headerTintColor: 'black',
            //   //headerBackVisible: false,
            // }}
            options={({navigation}) => ({
              headerBackTitleVisible: false,
              headerTintColor: 'black',
              headerTitle: () => (
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: 'bold',
                    textAlign: 'center',
                    flex: 1,
                    paddingRight: 50,
                    color: '#ffffff',
                  }}>
                  Doctor Activities
                </Text>
              ),
              headerLeft: () => (
                <TouchableOpacity
                  onPress={() =>
                    navigation.dispatch(
                      CommonActions.reset({
                        index: 0,
                        routes: [{name: 'AppNavActivity'}], // or whatever your main screen is
                      }),
                    )
                  }>
                  <Ionicons name="arrow-back" size={24} color="#ffffff" />
                </TouchableOpacity>
              ),
              headerBackground: () => (
                <LinearGradient
                  colors={['#a9ddfaff', '#005696']} // light → dark
                  style={{flex: 1}}
                  start={{x: 0, y: 0}}
                  end={{x: 0, y: 1}}
                />
              ),
            })}
            name="Doctor Activities"
            component={DoctorActivities}
          />
          <Stack.Screen
            // options={{
            //   //headerShown: false,
            //   headerBackTitleVisible: false,
            //   headerTintColor: 'black',
            //   //headerBackVisible: false,
            // }}
            options={({navigation}) => ({
              headerBackTitleVisible: false,
              headerTintColor: 'black',
              headerTitle: () => (
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: 'bold',
                    textAlign: 'center',
                    flex: 1,
                    paddingRight: 50,
                    color: '#ffffff',
                  }}>
                  Party Visit
                </Text>
              ),
              headerLeft: () => (
                <TouchableOpacity
                  onPress={() =>
                    navigation.dispatch(
                      CommonActions.reset({
                        index: 0,
                        routes: [{name: 'AppNavActivity'}], // or whatever your main screen is
                      }),
                    )
                  }>
                  <Ionicons name="arrow-back" size={24} color="#ffffff" />
                </TouchableOpacity>
              ),
              headerBackground: () => (
                <LinearGradient
                  colors={['#a9ddfaff', '#005696']} // light → dark
                  style={{flex: 1}}
                  start={{x: 0, y: 0}}
                  end={{x: 0, y: 1}}
                />
              ),
            })}
            name="Party Visit"
            component={PartyActivities}
          />
          <Stack.Screen
            options={{
              //headerShown: false,
              headerBackTitleVisible: false,
              headerTintColor: 'black',
              //headerBackVisible: false,
            }}
            name="Doctor Unlisted"
            component={DoctorUScreen}
          />
          <Stack.Screen
            options={{
              //headerShown: false,
              headerBackTitleVisible: false,
              headerTintColor: 'black',
              //headerBackVisible: false,
            }}
            name="Retailer Unlisted"
            component={RetailerUnlisted}
          />
          <Stack.Screen
            // options={{
            //   //headerShown: false,
            //   headerBackTitleVisible: false,
            //   headerTintColor: 'black',
            //   //headerBackVisible: false,
            // }}
            options={({navigation}) => ({
              headerBackTitleVisible: false,
              headerTintColor: 'black',
              headerTitle: () => (
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: 'bold',
                    textAlign: 'center',
                    flex: 1,
                    paddingRight: 50,
                  }}>
                  Unlisted Screen
                </Text>
              ),
              headerLeft: () => (
                <TouchableOpacity
                  onPress={() =>
                    navigation.dispatch(
                      CommonActions.reset({
                        index: 0,
                        routes: [{name: 'AppNavDCRScreen'}], // or whatever your main screen is
                      }),
                    )
                  }>
                  <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
              ),
            })}
            name="Unlisted Screen"
            component={UnlistedScreen}
          />
          <Stack.Screen
            // options={{
            //   //headerShown: false,
            //   headerBackTitleVisible: false,
            //   headerTintColor: 'black',
            //   //headerBackVisible: false,
            // }}
            options={({navigation}) => ({
              headerBackTitleVisible: false,
              headerTintColor: 'black',
              headerTitle: () => (
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: 'bold',
                    textAlign: 'center',
                    color: '#ffffff',
                    flex: 1,
                    paddingRight: 50,
                  }}>
                  Others
                </Text>
              ),
              headerBackground: () => (
                <LinearGradient
                  colors={['#a9ddfaff', '#005696']} // light → dark
                  style={{flex: 1}}
                  start={{x: 0, y: 0}}
                  end={{x: 0, y: 1}}
                />
              ),
              headerLeft: () => (
                <TouchableOpacity
                  onPress={() =>
                    navigation.dispatch(
                      CommonActions.reset({
                        index: 0,
                        routes: [{name: 'AppNavDCRScreen'}], // or whatever your main screen is
                      }),
                    )
                  }>
                  <Ionicons name="arrow-back" size={24} color="#ffffff" />
                </TouchableOpacity>
              ),
            })}
            name="Others"
            component={OtherScreen}
          />
          <Stack.Screen
            // options={{
            //   //headerShown: false,
            //   headerBackTitleVisible: false,
            //   headerTintColor: 'black',
            //   //headerBackVisible: false,
            // }}
            options={({navigation}) => ({
              headerBackTitleVisible: false,
              headerTintColor: '#ffffff',
              headerTitle: () => (
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: 'bold',
                    textAlign: 'center',
                    flex: 1,
                    color: '#ffffff',
                    paddingRight: 50,
                  }}>
                  Stay
                </Text>
              ),
              headerBackground: () => (
                <LinearGradient
                  colors={['#a9ddfaff', '#005696']} // light → dark
                  style={{flex: 1}}
                  start={{x: 0, y: 0}}
                  end={{x: 0, y: 1}}
                />
              ),
              headerLeft: () => (
                <TouchableOpacity
                  onPress={() =>
                    navigation.dispatch(
                      CommonActions.reset({
                        index: 0,
                        routes: [{name: 'AppNavDCRScreen'}], // or whatever your main screen is
                      }),
                    )
                  }>
                  <Ionicons name="arrow-back" size={24} color="#ffffff" />
                </TouchableOpacity>
              ),
            })}
            name="Stay"
            component={StayScreen}
          />
          <Stack.Screen
            // options={{
            //   //headerShown: false,
            //   headerBackTitleVisible: false,
            //   headerTintColor: 'black',
            //   //headerBackVisible: false,
            // }}
            options={({navigation}) => ({
              headerBackTitleVisible: false,
              headerTintColor: 'black',
              headerTitle: () => (
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: 'bold',
                    textAlign: 'center',
                    flex: 1,
                    color: '#ffffff',
                    paddingRight: 50,
                  }}>
                  RCPA
                </Text>
              ),
              headerBackground: () => (
                <LinearGradient
                  colors={['#a9ddfaff', '#005696']} // light → dark
                  style={{flex: 1}}
                  start={{x: 0, y: 0}}
                  end={{x: 0, y: 1}}
                />
              ),
              headerLeft: () => (
                <TouchableOpacity
                  onPress={() =>
                    navigation.dispatch(
                      CommonActions.reset({
                        index: 0,
                        routes: [{name: 'AppNavDCRScreen'}], // or whatever your main screen is
                      }),
                    )
                  }>
                  <Ionicons name="arrow-back" size={24} color="#ffffff" />
                </TouchableOpacity>
              ),
            })}
            name="RCPA"
            component={RCPAN}
          />
          <Stack.Screen
            // options={{
            //   //headerShown: false,
            //   headerBackTitleVisible: false,
            //   headerTintColor: 'black',
            //   //headerBackVisible: false,
            // }}
            options={({navigation}) => ({
              headerBackTitleVisible: false,
              headerTintColor: '#ffffff',
              headerTitle: () => (
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: 'bold',
                    textAlign: 'center',
                    flex: 1,
                    color: '#ffffff',
                    paddingRight: 50,
                  }}>
                  View DCR
                </Text>
              ),
              headerBackground: () => (
                <LinearGradient
                  colors={['#a9ddfaff', '#005696']} // light → dark
                  style={{flex: 1}}
                  start={{x: 0, y: 0}}
                  end={{x: 0, y: 1}}
                />
              ),
              headerLeft: () => (
                <TouchableOpacity
                  onPress={() =>
                    navigation.dispatch(
                      CommonActions.reset({
                        index: 0,
                        routes: [{name: 'AppNavDCRScreen'}], // or whatever your main screen is
                      }),
                    )
                  }>
                  <Ionicons name="arrow-back" size={24} color="#ffffff" />
                </TouchableOpacity>
              ),
            })}
            name="View DCR"
            component={ViewDCRScreen}
          />
          <Stack.Screen
            // options={{
            //   //headerShown: false,
            //   headerBackTitleVisible: false,
            //   headerTintColor: 'black',
            //   //headerBackVisible: false,
            // }}
            options={({navigation}) => ({
              headerBackTitleVisible: false,
              headerTintColor: 'black',
              headerTitle: () => (
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: 'bold',
                    textAlign: 'center',
                    flex: 1,
                    paddingRight: 50,
                    color: '#ffffff',
                  }}>
                  View Activity
                </Text>
              ),
              headerLeft: () => (
                <TouchableOpacity
                  onPress={() =>
                    navigation.dispatch(
                      CommonActions.reset({
                        index: 0,
                        routes: [{name: 'AppNavActivity'}], // or whatever your main screen is
                      }),
                    )
                  }>
                  <Ionicons name="arrow-back" size={24} color="#ffffff" />
                </TouchableOpacity>
              ),
              headerBackground: () => (
                <LinearGradient
                  colors={['#a9ddfaff', '#005696']} // light → dark
                  style={{flex: 1}}
                  start={{x: 0, y: 0}}
                  end={{x: 0, y: 1}}
                />
              ),
            })}
            name="View Activity"
            component={ViewActivity}
          />
          <Stack.Screen
            options={{
              headerShown: false,
              headerBackTitleVisible: false,
              headerBackVisible: false,
            }}
            name="AppNavreport"
            component={AppNavreport}
          />
          <Stack.Screen
            options={{
              headerShown: false,
              headerBackTitleVisible: false,
              headerBackVisible: false,
            }}
            name="AppNavActivity"
            component={AppNavActivity}
          />
          <Stack.Screen
            options={{
              headerShown: false,
              headerBackTitleVisible: false,
              headerBackVisible: false,
            }}
            name="AppNavDPC"
            component={AppNavDPC}
          />
          <Stack.Screen
            options={{
              headerShown: false,
              headerBackTitleVisible: false,
              headerBackVisible: false,
            }}
            name="AppNavQuiz"
            component={AppNavQuiz}
          />
          <Stack.Screen
            options={{
              headerShown: false,
              headerBackTitleVisible: false,
              headerTintColor: 'black',
              //headerBackVisible: false,
            }}
            name="Test GPS"
            component={TestGps}
          />
          <Stack.Screen
            name="Leave Application"
            component={LeaveScreen}
            options={({navigation}) => ({
              headerBackTitleVisible: false,
              headerTintColor: 'white', // back arrow color
              headerBackground: () => (
                <LinearGradient
                  colors={['#a9ddfaff', '#005696']} // light → dark
                  style={{flex: 1}}
                  start={{x: 0, y: 0}}
                  end={{x: 0, y: 1}}
                />
              ),
              headerTitleAlign: 'center', // ✅ center the title
              headerTitleStyle: {
                color: 'white', // white title text
                fontWeight: 'bold',
              },
              headerLeft: () => (
                <TouchableOpacity
                  onPress={() =>
                    navigation.dispatch(
                      CommonActions.reset({
                        index: 0,
                        routes: [{name: 'approvalDashboard'}], // or whatever your main screen is
                      }),
                    )
                  }>
                  <Ionicons name="arrow-back" size={24} color="#ffffff" />
                </TouchableOpacity>
              ),
            })}
          />
          <Stack.Screen
            options={{
              //headerShown: false,
              headerBackTitleVisible: false,
              headerTintColor: 'black',
              //headerBackVisible: false,
            }}
            name="Leave Application List"
            component={LeaveApplicationList}
          />

          <Stack.Screen
            options={{
              //headerShown: false,
              headerBackTitleVisible: false,
              headerTintColor: 'black',
              //headerBackVisible: false,
            }}
            name="Half Day Leave Application"
            component={HalfDayLeaveScreen}
          />

          <Stack.Screen
            options={{
              //headerShown: false,
              headerBackTitleVisible: false,
              headerTintColor: 'black',
              //headerBackVisible: false,
            }}
            name="Full Day Leave Application"
            component={FullDayLeaveScreen}
          />

          {/* <Stack.Screen
          // options={{
          //   //headerShown: false,
          //   headerBackTitleVisible: false,
          //   headerTintColor: 'black',
          //   //headerBackVisible: false,s
          // }}
          options={({navigation}) => ({
            headerBackTitleVisible: false,
            headerTintColor: 'black',
            headerTitle: () => (
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  textAlign: 'center',
                  flex: 1,
                }}>
                Quiz Dashboard
              </Text>
            ),
            headerLeft: () => (
              <TouchableOpacity
                onPress={() =>
                  navigation.dispatch(
                    CommonActions.reset({
                      index: 0,
                      routes: [{name: 'AppNavScreen'}], // or whatever your main screen is
                    }),
                  )
                }>
                <Ionicons name="arrow-back" size={24} color="black" />
              </TouchableOpacity>
            ),
          })}
          name="Quiz Dashboard"
          component={QuizDashboard}
        /> */}

          <Stack.Screen
            // options={{
            //   //headerShown: false,
            //   headerBackTitleVisible: false,
            //   headerTintColor: 'black',
            //   //headerBackVisible: false,s
            // }}
            options={({navigation}) => ({
              headerBackTitleVisible: false,
              headerTintColor: '#ffffff',
              headerTitle: () => (
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: 'bold',
                    textAlign: 'center',
                    flex: 1,
                    paddingRight: 50,
                    color: '#ffffff',
                  }}>
                  Employee Survey
                </Text>
              ),
              headerLeft: () => (
                <TouchableOpacity
                  onPress={() =>
                    navigation.dispatch(
                      CommonActions.reset({
                        index: 0,
                        routes: [{name: 'AppNavQuiz'}], // or whatever your main screen is
                      }),
                    )
                  }>
                  <Ionicons name="arrow-back" size={24} color="#ffffff" />
                </TouchableOpacity>
              ),
              headerBackground: () => (
                <LinearGradient
                  colors={['#a9ddfaff', '#005696']} // light → dark
                  style={{flex: 1}}
                  start={{x: 0, y: 0}}
                  end={{x: 0, y: 1}}
                />
              ),
            })}
            name="Employee Survey"
            component={EmployeeQuizScreen}
          />

          <Stack.Screen
            // options={{
            //   //headerShown: false,
            //   headerBackTitleVisible: false,
            //   headerTintColor: 'black',
            //   //headerBackVisible: false,s
            // }}
            options={({navigation}) => ({
              headerBackTitleVisible: false,
              headerTintColor: '#ffffff',
              headerTitle: () => (
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: 'bold',
                    textAlign: 'center',
                    flex: 1,
                    paddingRight: 50,
                    color: '#ffffff',
                  }}>
                  Doctor Survey
                </Text>
              ),
              headerLeft: () => (
                <TouchableOpacity
                  onPress={() =>
                    navigation.dispatch(
                      CommonActions.reset({
                        index: 0,
                        routes: [{name: 'AppNavQuiz'}], // or whatever your main screen is
                      }),
                    )
                  }>
                  <Ionicons name="arrow-back" size={24} color="#ffffff" />
                </TouchableOpacity>
              ),
              headerBackground: () => (
                <LinearGradient
                  colors={['#a9ddfaff', '#005696']} // light → dark
                  style={{flex: 1}}
                  start={{x: 0, y: 0}}
                  end={{x: 0, y: 1}}
                />
              ),
            })}
            name="Doctor Survey"
            component={DoctorQuizScreen}
          />
          <Stack.Screen
            options={{
              //headerShown: false,
              headerBackTitleVisible: false,
              headerTintColor: 'black',
              //headerBackVisible: false,s
            }}
            name="ReportsWebView"
            component={ReportsWebView}
          />

          <Stack.Screen
            // options={{
            //   //headerShown: false,
            //   headerBackTitleVisible: false,
            //   headerTintColor: 'black',
            //   //headerBackVisible: false,s
            // }}
            options={({navigation}) => ({
              headerBackTitleVisible: false,
              headerTintColor: '#ffffff',
              headerTitle: () => (
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: 'bold',
                    textAlign: 'center',
                    flex: 1,
                    paddingRight: 50,
                    color: '#ffffff',
                  }}>
                  Market Survey
                </Text>
              ),
              headerBackground: () => (
                <LinearGradient
                  colors={['#a9ddfaff', '#005696']} // light → dark
                  style={{flex: 1}}
                  start={{x: 0, y: 0}}
                  end={{x: 0, y: 1}}
                />
              ),
              headerLeft: () => (
                <TouchableOpacity
                  onPress={() =>
                    navigation.dispatch(
                      CommonActions.reset({
                        index: 0,
                        routes: [{name: 'AppNavQuiz'}], // or whatever your main screen is
                      }),
                    )
                  }>
                  <Ionicons name="arrow-back" size={24} color="#ffffff" />
                </TouchableOpacity>
              ),
            })}
            name="Market Survey"
            component={MarketSurveyScreen}
          />

          <Stack.Screen
            options={({navigation}) => ({
              headerBackTitleVisible: false,
              headerTintColor: '#005696',
              headerTitle: () => (
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: 'bold',
                    textAlign: 'center',
                    flex: 1,
                    paddingRight: 50,
                    //headerTintColor:'#005696',
                    color: '#005696',
                  }}>
                  ADMIN SALES DASHBOARD
                </Text>
              ),
              headerLeft: () => (
                <TouchableOpacity
                  onPress={() =>
                    navigation.dispatch(
                      CommonActions.reset({
                        index: 0,
                        routes: [{name: 'AppNavScreen'}], // or whatever your main screen is
                      }),
                    )
                  }>
                  <Ionicons name="arrow-back" size={24} color="#005696" />
                </TouchableOpacity>
              ),
            })}
            name="ADMIN SALES REPORT"
            component={AdminSalesDashboard}
          />

          <Stack.Screen
            options={({navigation}) => ({
              headerBackTitleVisible: false,
              headerTintColor: '#ffffff',
              headerTitleAlign: 'center',
              // headerTitle: () => (
              //   <Text
              //     style={{
              //       fontSize: 20,
              //       fontWeight: 'bold',
              //       textAlign: 'center',
              //       flex: 1,
              //       paddingRight: 50,
              //       //headerTintColor:'#005696',
              //       color: '#ffffff',
              //     }}>
              //     SALES DASHBOARD
              //   </Text>
              // ),
              headerBackground: () => (
                <LinearGradient
                  colors={['#a9ddfaff', '#005696']} // light → dark
                  style={{flex: 1}}
                  start={{x: 0, y: 0}}
                  end={{x: 0, y: 1}}
                />
              ),
              // headerLeft: () => (
              //   <TouchableOpacity
              //     onPress={() =>
              //       navigation.dispatch(
              //         CommonActions.reset({
              //           index: 0,
              //           routes: [{ name: 'AppNavScreen' }], // or whatever your main screen is
              //         }),
              //       )
              //     }>
              //     <Ionicons name="arrow-back" size={24} color="#005696" />
              //   </TouchableOpacity>
              // ),
            })}
            name="SALES REPORT"
            component={SalesDashBoard}
          />
          <Stack.Screen
            options={({navigation}) => ({
              headerBackTitleVisible: false,
              headerTintColor: '#ffffff',
              headerTitle: () => (
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: 'bold',
                    textAlign: 'center',
                    // flex: 1,
                    paddingRight: 30,
                    color: '#ffffff',
                  }}>
                  MY STATUS
                </Text>
              ),
              headerBackground: () => (
                <LinearGradient
                  colors={['#a9ddfaff', '#005696']} // light → dark
                  style={{flex: 1}}
                  start={{x: 0, y: 0}}
                  end={{x: 0, y: 1}}
                />
              ),

              headerTitleAlign: 'center', // ✅ center the title
              // headerLeft: () => (
              //   <TouchableOpacity
              //     onPress={() =>
              //       navigation.dispatch(
              //         CommonActions.reset({
              //           index: 0,
              //           routes: [{ name: 'SALES REPORT' }], // or whatever your main screen is
              //         }),
              //       )
              //     }>
              //     <Ionicons name="arrow-back" size={24} color="#005696" />
              //   </TouchableOpacity>
              // ),
            })}
            name="MY STATUS"
            component={MyStatusScreen}
          />

          <Stack.Screen
            options={({navigation}) => ({
              headerBackTitleVisible: false,
              headerTintColor: '#ffffff',
              headerTitle: () => (
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: 'bold',
                    //textAlign: 'center',
                    alignContent: 'center',
                    // flex: 1,
                    paddingRight: 10,
                    color: '#ffffff',
                  }}>
                  Comparative Sales
                </Text>
              ),
              headerBackground: () => (
                <LinearGradient
                  colors={['#a9ddfaff', '#005696']} // light → dark
                  style={{flex: 1}}
                  start={{x: 0, y: 0}}
                  end={{x: 0, y: 1}}
                />
              ),
              headerTitleAlign: 'center', // ✅ center the title
              // headerLeft: () => (
              //   <TouchableOpacity
              //     onPress={() =>
              //       navigation.dispatch(
              //         CommonActions.reset({
              //           index: 0,
              //           routes: [{ name: 'SALES REPORT' }], // or whatever your main screen is
              //         }),
              //       )
              //     }>
              //     <Ionicons name="arrow-back" size={24} color="#005696" />
              //   </TouchableOpacity>
              // ),
            })}
            name="Comparative Sales"
            component={ComparativeSales}
          />

          <Stack.Screen
            options={({navigation}) => ({
              headerBackTitleVisible: false,
              headerTintColor: '#ffffff',
              headerTitle: () => (
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: 'bold',
                    textAlign: 'center',
                    // flex: 1,
                    paddingRight: 30,
                    color: '#ffffff',
                  }}>
                  Product Wise Sales
                </Text>
              ),
              headerBackground: () => (
                <LinearGradient
                  colors={['#a9ddfaff', '#005696']} // light → dark
                  style={{flex: 1}}
                  start={{x: 0, y: 0}}
                  end={{x: 0, y: 1}}
                />
              ),
              headerTitleAlign: 'center', // ✅ center the title
              // headerLeft: () => (
              //   <TouchableOpacity
              //     onPress={() =>
              //       navigation.dispatch(
              //         CommonActions.reset({
              //           index: 0,
              //           routes: [{ name: 'SALES REPORT' }], // or whatever your main screen is
              //         }),
              //       )
              //     }>
              //     <Ionicons name="arrow-back" size={24} color="#005696" />
              //   </TouchableOpacity>
              // ),
            })}
            name="ProductWise Sales"
            component={ProductWiseSale}
          />

          <Stack.Screen
            options={({navigation}) => ({
              headerBackTitleVisible: false,
              headerTintColor: '#ffffff',
              headerTitle: () => (
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: 'bold',
                    textAlign: 'center',
                    // flex: 1,
                    paddingRight: 30,
                    color: '#ffffff',
                  }}>
                  Hierarchy Wise Sales
                </Text>
              ),
              headerBackground: () => (
                <LinearGradient
                  colors={['#a9ddfaff', '#005696']} // light → dark
                  style={{flex: 1}}
                  start={{x: 0, y: 0}}
                  end={{x: 0, y: 1}}
                />
              ),
              headerTitleAlign: 'center', // ✅ center the title
              // headerLeft: () => (
              //   <TouchableOpacity
              //     onPress={() =>
              //       navigation.dispatch(
              //         CommonActions.reset({
              //           index: 0,
              //           routes: [{ name: 'SALES REPORT' }], // or whatever your main screen is
              //         }),
              //       )
              //     }>
              //     <Ionicons name="arrow-back" size={24} color="#005696" />
              //   </TouchableOpacity>
              // ),
            })}
            name="HierarchyWise Sales"
            component={HierarchyWiseSale}
          />

          <Stack.Screen
            options={({navigation}) => ({
              headerBackTitleVisible: false,
              headerTintColor: '#ffffff',
              headerTitle: () => (
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: 'bold',
                    textAlign: 'center',
                    // flex: 1,
                    paddingRight: 30,
                    color: '#ffffff',
                  }}>
                  OutStanding Reports
                </Text>
              ),
              headerBackground: () => (
                <LinearGradient
                  colors={['#a9ddfaff', '#005696']} // light → dark
                  style={{flex: 1}}
                  start={{x: 0, y: 0}}
                  end={{x: 0, y: 1}}
                />
              ),
              headerTitleAlign: 'center', // ✅ center the title
              // headerLeft: () => (
              //   <TouchableOpacity
              //     onPress={() =>
              //       navigation.dispatch(
              //         CommonActions.reset({
              //           index: 0,
              //           routes: [{ name: 'SALES REPORT' }], // or whatever your main screen is
              //         }),
              //       )
              //     }>
              //     <Ionicons name="arrow-back" size={24} color="#005696" />
              //   </TouchableOpacity>
              // ),
            })}
            name="OutStanding Reports"
            component={OutStandingReports}
          />

          <Stack.Screen
            options={({navigation}) => ({
              headerBackTitleVisible: false,
              headerTintColor: '#005696',
              headerTitle: () => (
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: 'bold',
                    textAlign: 'center',
                    // flex: 1,
                    paddingRight: 30,
                    color: '#ffffff',
                  }}>
                  Stock Reports
                </Text>
              ),
              headerBackground: () => (
                <LinearGradient
                  colors={['#a9ddfaff', '#005696']} // light → dark
                  style={{flex: 1}}
                  start={{x: 0, y: 0}}
                  end={{x: 0, y: 1}}
                />
              ),
              headerTitleAlign: 'center', // ✅ center the title
              // headerLeft: () => (
              //   <TouchableOpacity
              //     onPress={() =>
              //       navigation.dispatch(
              //         CommonActions.reset({
              //           index: 0,
              //           routes: [{ name: 'SALES REPORT' }], // or whatever your main screen is
              //         }),
              //       )
              //     }>
              //     <Ionicons name="arrow-back" size={24} color="#005696" />
              //   </TouchableOpacity>
              // ),
            })}
            name="Stock Reports"
            component={StockReports}
          />

          <Stack.Screen
            options={({navigation}) => ({
              headerBackTitleVisible: false,
              headerTintColor: '#ffffff',
              headerTitle: () => (
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: 'bold',
                    textAlign: 'center',
                    // flex: 1,
                    paddingRight: 30,
                    color: '#ffffff',
                  }}>
                  Sales Order Transaction
                </Text>
              ),
              headerBackground: () => (
                <LinearGradient
                  colors={['#a9ddfaff', '#005696']} // light → dark
                  style={{flex: 1}}
                  start={{x: 0, y: 0}}
                  end={{x: 0, y: 1}}
                />
              ),
              headerTitleAlign: 'center', // ✅ center the title
              // headerLeft: () => (
              //   <TouchableOpacity
              //     onPress={() =>
              //       navigation.dispatch(
              //         CommonActions.reset({
              //           index: 0,
              //           routes: [{ name: 'SALES REPORT' }], // or whatever your main screen is
              //         }),
              //       )
              //     }>
              //     <Ionicons name="arrow-back" size={24} color="#005696" />
              //   </TouchableOpacity>
              // ),
            })}
            name="SalesOrderTransaction"
            component={SalesOrderTransaction}
          />
          <Stack.Screen
            options={({navigation}) => ({
              headerBackTitleVisible: false,
              headerTintColor: '#005696',
              headerTitle: () => (
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: 'bold',
                    textAlign: 'center',
                    flex: 1,
                    paddingRight: 50,
                    //headerTintColor:'#005696',
                    color: '#ffffff', // ✅ Add this line
                  }}>
                  Leave Approval
                </Text>
              ),
              headerBackground: () => (
                <LinearGradient
                  colors={['#a9ddfaff', '#005696']} // light → dark
                  style={{flex: 1}}
                  start={{x: 0, y: 0}}
                  end={{x: 0, y: 1}}
                />
              ),
              headerLeft: () => (
                <TouchableOpacity
                  onPress={() =>
                    navigation.dispatch(
                      CommonActions.reset({
                        index: 0,
                        routes: [{name: 'approvalDashboard'}], // or whatever your main screen is
                      }),
                    )
                  }>
                  <Ionicons name="arrow-back" size={24} color="#ffffff" />
                </TouchableOpacity>
              ),
            })}
            name="leaveApproval"
            component={LeaveApproval}
          />

          <Stack.Screen
            options={({navigation}) => ({
              headerBackTitleVisible: false,
              headerTintColor: '#005696',
              headerTitle: () => (
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: 'bold',
                    textAlign: 'center',
                    flex: 1,
                    paddingRight: 50,
                    color: '#ffffff',
                    //headerTintColor:'#005696',
                  }}>
                  Leave DashBoard
                </Text>
              ),
              headerBackground: () => (
                <LinearGradient
                  colors={['#a9ddfaff', '#005696']} // light → dark
                  style={{flex: 1}}
                  start={{x: 0, y: 0}}
                  end={{x: 0, y: 1}}
                />
              ),
              headerLeft: () => (
                <TouchableOpacity
                  onPress={() =>
                    navigation.dispatch(
                      CommonActions.reset({
                        index: 0,
                        routes: [{name: 'AppNavScreen'}], // or whatever your main screen is
                      }),
                    )
                  }>
                  <Ionicons name="arrow-back" size={24} color="#ffffff" />
                </TouchableOpacity>
              ),
            })}
            name="approvalDashboard"
            component={ApprovalDashboard}
          />
          <Stack.Screen
            options={({navigation}) => ({
              headerBackTitleVisible: false,
              headerTintColor: '#005696',
              headerTitle: () => (
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: 'bold',
                    textAlign: 'center',
                    flex: 1,
                    paddingRight: 50,
                    color: '#ffffff', // ✅ Add this line
                  }}>
                  Leave Status
                </Text>
              ),
              headerBackTitleVisible: false,
              headerTintColor: '#ffffff', // back arrow color
              headerBackground: () => (
                <LinearGradient
                  colors={['#a9ddfaff', '#005696']} // light → dark
                  style={{flex: 1}}
                  start={{x: 0, y: 0}}
                  end={{x: 0, y: 1}}
                />
              ),
              headerTitleAlign: 'center', // ✅ center the title
              headerTitleStyle: {
                color: 'white', // white title text
                fontWeight: 'bold',
              },
              headerLeft: () => (
                <TouchableOpacity
                  onPress={() =>
                    navigation.dispatch(
                      CommonActions.reset({
                        index: 0,
                        routes: [{name: 'approvalDashboard'}], // or whatever your main screen is
                      }),
                    )
                  }>
                  <Ionicons name="arrow-back" size={24} color="#ffffff" />
                </TouchableOpacity>
              ),
            })}
            name="leaveStatus"
            component={LeaveStatus}
          />
          <Stack.Screen
            options={({navigation}) => ({
              headerBackTitleVisible: false,
              headerTintColor: 'black',
              headerTitle: () => (
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: 'bold',
                    textAlign: 'center',
                    flex: 1,
                  }}>
                  Admin Others
                </Text>
              ),
              headerLeft: () => (
                <TouchableOpacity
                  onPress={() =>
                    navigation.dispatch(
                      CommonActions.reset({
                        index: 0,
                        routes: [{name: 'DcrAdminDashBoard'}], // or whatever your main screen is
                      }),
                    )
                  }>
                  <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
              ),
            })}
            name="AdminOthers"
            component={AdminOthers}
          />

          <Stack.Screen
            options={({navigation}) => ({
              headerBackTitleVisible: false,
              headerTintColor: 'black',
              headerTitle: () => (
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: 'bold',
                    textAlign: 'center',
                    flex: 1,
                  }}>
                  Admin Retailer
                </Text>
              ),
              headerLeft: () => (
                <TouchableOpacity
                  onPress={() =>
                    navigation.dispatch(
                      CommonActions.reset({
                        index: 0,
                        routes: [{name: 'DcrAdminDashBoard'}], // or whatever your main screen is
                      }),
                    )
                  }>
                  <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
              ),
            })}
            name="AdminRetailer"
            component={AdminRetailer}
          />

          <Stack.Screen
            options={({navigation}) => ({
              headerBackTitleVisible: false,
              headerTintColor: 'black',
              headerTitle: () => (
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: 'bold',
                    textAlign: 'center',
                    flex: 1,
                  }}>
                  Admin Doctor
                </Text>
              ),
              headerLeft: () => (
                <TouchableOpacity
                  onPress={() =>
                    navigation.dispatch(
                      CommonActions.reset({
                        index: 0,
                        routes: [{name: 'DcrAdminDashBoard'}], // or whatever your main screen is
                      }),
                    )
                  }>
                  <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
              ),
            })}
            name="AdminDoctor"
            component={AdminDoctor}
          />

          <Stack.Screen
            options={({navigation}) => ({
              headerBackTitleVisible: false,
              headerTintColor: 'black',
              headerTitleAlign: 'center',
              // headerTitle: () => (
              //   <Text
              //     style={{
              //       fontSize: 18,
              //       fontWeight: 'bold',
              //       textAlign: 'center',
              //       flex: 1,
              //     }}>
              //     Admin DCR Dashboard
              //   </Text>
              // ),
              headerLeft: () => (
                <TouchableOpacity
                  onPress={() =>
                    navigation.dispatch(
                      CommonActions.reset({
                        index: 0,
                        routes: [{name: 'AppNavScreen'}], // or whatever your main screen is
                      }),
                    )
                  }>
                  <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
              ),
            })}
            name="DcrAdminDashBoard"
            component={DcrAdminDashBoard}
          />
          <Stack.Screen
            options={({navigation}) => ({
              headerBackTitleVisible: false,
              headerTintColor: 'black',
              headerTitle: () => (
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: 'bold',
                    textAlign: 'center',
                    flex: 1,
                  }}>
                  Admin View Dcr
                </Text>
              ),
              headerLeft: () => (
                <TouchableOpacity
                  onPress={() =>
                    navigation.dispatch(
                      CommonActions.reset({
                        index: 0,
                        routes: [{name: 'DcrAdminDashBoard'}], // or whatever your main screen is
                      }),
                    )
                  }>
                  <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
              ),
            })}
            name="AdminViewDcr"
            component={AdminViewDcr}
          />
          <Stack.Screen
            options={({navigation}) => ({
              headerBackTitleVisible: false,
              headerTintColor: '#005696',
              headerTitle: () => (
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: 'bold',
                    textAlign: 'center',
                    flex: 1,
                    paddingRight: 50,
                    color: '#ffffff', // ✅ Add this line
                  }}>
                  Notice Board List
                </Text>
              ),
              headerBackTitleVisible: false,
              headerTintColor: '#ffffff', // back arrow color
              headerBackground: () => (
                <LinearGradient
                  colors={['#a9ddfaff', '#005696']} // light → dark
                  style={{flex: 1}}
                  start={{x: 0, y: 0}}
                  end={{x: 0, y: 1}}
                />
              ),
              headerTitleAlign: 'center', // ✅ center the title
              headerTitleStyle: {
                color: 'white', // white title text
                fontWeight: 'bold',
              },
              headerLeft: () => (
                <TouchableOpacity
                  onPress={() =>
                    navigation.dispatch(
                      CommonActions.reset({
                        index: 0,
                        routes: [{name: 'AppNavScreen'}], // or whatever your main screen is
                      }),
                    )
                  }>
                  <Ionicons name="arrow-back" size={24} color="#ffffff" />
                </TouchableOpacity>
              ),
            })}
            name="NoticeBoardList"
            component={NoticeBoardList}
          />
          <Stack.Screen
            options={({navigation}) => ({
              headerBackTitleVisible: false,
              headerTintColor: '#005696',
              headerTitle: () => (
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: 'bold',
                    textAlign: 'center',
                    flex: 1,
                    paddingRight: 50,
                    color: '#ffffff', // ✅ Add this line
                  }}>
                  Facebook Promotion
                </Text>
              ),
              headerBackTitleVisible: false,
              headerTintColor: '#ffffff', // back arrow color
              headerBackground: () => (
                <LinearGradient
                  colors={['#a9ddfaff', '#005696']} // light → dark
                  style={{flex: 1}}
                  start={{x: 0, y: 0}}
                  end={{x: 0, y: 1}}
                />
              ),
              headerTitleAlign: 'center', // ✅ center the title
              headerTitleStyle: {
                color: 'white', // white title text
                fontWeight: 'bold',
              },
              headerLeft: () => (
                <TouchableOpacity
                  onPress={() =>
                    navigation.dispatch(
                      CommonActions.reset({
                        index: 0,
                        routes: [{name: 'AppNavScreen'}], // or whatever your main screen is
                      }),
                    )
                  }>
                  <Ionicons name="arrow-back" size={24} color="#ffffff" />
                </TouchableOpacity>
              ),
            })}
            name="FacebookPromotion"
            component={FacebookUserShare}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App;
