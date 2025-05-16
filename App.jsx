import { View, Text, Alert, Linking, Platform } from 'react-native';
import React, { useEffect, useState } from 'react';
import Splashscreen from './src/screens/Splashscreen';
import LogIn from './src/screens/LogIn';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
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
import QuizDashboard from './src/screens/QuizDashboard';
import EmployeeQuizScreen from './src/screens/EmployeeQuizScreen';
import DoctorQuizScreen from './src/screens/DoctorQuizScreen';
import MarketSurveyScreen from './src/screens/MarketSurveyScreen';
import HalfDayLeaveScreen from './src/screens/HalfDayLeaveScreen';
import FullDayLeaveScreen from './src/screens/FullDayLeaveScreen';
import UserInfoScreen from './src/screens/UserInfoScreen';
import DCRDoctor from './src/screens/DCRDoctor';
import ClientDashBoard from './src/screens/ClientDashBoard';
import ClientMSRList from './src/screens/ClientMSRList';
const Stack = createNativeStackNavigator();

const App = () => {
  const [showSplashScreen, setShowSplashScreen] = useState(true);

  useEffect(() => {
    //requestTracking();
    // console.warn('hello Saikat');

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
  }, []);

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
            message: 'There is a new version of the app available on the App Store. Do you want to update it?',
            buttonUpgradeText: 'Update',
            buttonCancelText: 'Cancel',
          };
        }

        // Add status update listener for download progress
        const statusListener = (downloadStatus) => {
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
          component={LogIn}
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
          options={{
            //headerShown: false,
            headerBackTitleVisible: false,
            headerTintColor: 'black',
            //headerBackVisible: false,
          }}
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
          options={{
            //headerShown: false,
            headerBackTitleVisible: false,
            headerTintColor: 'black',
            //headerBackVisible: false,
          }}
          name="Tour Program"
          //component={TourNavScreen}
          component={TourProgScreen}
        />
        <Stack.Screen
          options={{
            //headerShown: false,
            headerBackTitleVisible: false,
            headerTintColor: 'black',
            //headerBackVisible: false,
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
          name="Request Approval"
          component={RequestApprovalScreen}
        />
        <Stack.Screen
         options={{
          headerShown: true,
          headerBackTitleVisible: false,
          headerBackVisible: false,
          headerTitleAlign:'center'
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
          options={{
            //headerShown: false,
            headerBackTitleVisible: false,
            headerTintColor: 'black',
            //headerBackVisible: false,
          }}
          name="SettingScreen"
          component={SettingScreen}
        />
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
            //headerShown: false,
            headerBackTitleVisible: false,
            headerTintColor: 'black',
            //headerBackVisible: false,
          }}
          name="Master Doctor"
          component={MasterDoctor}
        />
        <Stack.Screen
          options={{
            //headerShown: false,
            headerBackTitleVisible: false,
            headerTintColor: 'black',
            //headerBackVisible: false,
          }}
          name="Master Retailer"
          component={MasterRetailer}
        />
        <Stack.Screen
          options={{
            //headerShown: false,
            headerBackTitleVisible: false,
            headerTintColor: 'black',
            //headerBackVisible: false,
          }}
          name="View Master Data"
          component={ViewMasterData}
        />
        <Stack.Screen
          options={{
            //headerShown: false,
            headerBackTitleVisible: false,
            headerTintColor: 'black',
            //headerBackVisible: false,
          }}
          name="Universal Search"
          component={UniversalSearch}
        />
        <Stack.Screen
          options={{
            //headerShown: false,
            headerBackTitleVisible: false,
            headerTintColor: 'black',
            //headerBackVisible: false,
          }}
          name="DCR Session"
          component={DCRScreen}
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
          options={{
            //headerShown: false,
            headerBackTitleVisible: false,
            headerTintColor: 'black',
            //headerBackVisible: false,
          }}
          name="Doctor Daily Call Report"
          //component={DoctorDCRScreen}
          component={DCRDoctor}
        />
        <Stack.Screen
          options={{
            //headerShown: false,
            headerBackTitleVisible: false,
            headerTintColor: 'black',
            //headerBackVisible: false,
          }}
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
          options={{
            //headerShown: false,
            headerBackTitleVisible: false,
            headerTintColor: 'black',
            //headerBackVisible: false,
          }}
          name="Doctor Activities"
          component={DoctorActivities}
        />
        <Stack.Screen
          options={{
            //headerShown: false,
            headerBackTitleVisible: false,
            headerTintColor: 'black',
            //headerBackVisible: false,
          }}
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
          options={{
            //headerShown: false,
            headerBackTitleVisible: false,
            headerTintColor: 'black',
            //headerBackVisible: false,
          }}
          name="Unlisted Screen"
          component={UnlistedScreen}
        />
        <Stack.Screen
          options={{
            //headerShown: false,
            headerBackTitleVisible: false,
            headerTintColor: 'black',
            //headerBackVisible: false,
          }}
          name="Others"
          component={OtherScreen}
        />
        <Stack.Screen
          options={{
            //headerShown: false,
            headerBackTitleVisible: false,
            headerTintColor: 'black',
            //headerBackVisible: false,
          }}
          name="Stay"
          component={StayScreen}
        />
        <Stack.Screen
          options={{
            //headerShown: false,
            headerBackTitleVisible: false,
            headerTintColor: 'black',
            //headerBackVisible: false,
          }}
          name="RCPA"
          component={RCPAN}
        />
        <Stack.Screen
          options={{
            //headerShown: false,
            headerBackTitleVisible: false,
            headerTintColor: 'black',
            //headerBackVisible: false,
          }}
          name="View DCR"
          component={ViewDCRScreen}
        />
        <Stack.Screen
          options={{
            //headerShown: false,
            headerBackTitleVisible: false,
            headerTintColor: 'black',
            //headerBackVisible: false,
          }}
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
            //headerShown: false,
            headerBackTitleVisible: false,
            headerTintColor: 'black',
            //headerBackVisible: false,
          }}
          name="Leave Application"
          component={LeaveScreen}
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

        <Stack.Screen
          options={{
            //headerShown: false,
            headerBackTitleVisible: false,
            headerTintColor: 'black',
            //headerBackVisible: false,s
          }}
          name="Quiz Dashboard"
          component={QuizDashboard}
        />

        <Stack.Screen
          options={{
            //headerShown: false,
            headerBackTitleVisible: false,
            headerTintColor: 'black',
            //headerBackVisible: false,s
          }}
          name="Employee Survey"
          component={EmployeeQuizScreen}
        />

        <Stack.Screen
          options={{
            //headerShown: false,
            headerBackTitleVisible: false,
            headerTintColor: 'black',
            //headerBackVisible: false,s
          }}
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
          name="Market Survey"
          component={MarketSurveyScreen}
        />



      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
