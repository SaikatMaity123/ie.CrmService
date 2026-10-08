import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  SafeAreaView,
  ImageBackground,
  Dimensions,
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Platform,
  StatusBar,
  BackHandler,
} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import DatePicker from 'react-native-date-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import NetInfo from '@react-native-community/netinfo';
import DeviceInfo from 'react-native-device-info';
import {
  navigation,
  useNavigation,
  useFocusEffect,
} from '@react-navigation/native';
import KeyboardAwareLayout from '../components/custom/KeyboardAwareLayout';
import Icon from 'react-native-vector-icons/Feather';
import {Hrms_URL, BASE_URL} from '@env';
import {MultiSelect, Dropdown} from 'react-native-element-dropdown';
import {showLocalNotification} from '../services/notifications';

const LeaveScreen = () => {
  const navigation = useNavigation();
  const [leaveType, setLeaveType] = useState('');
  const [leaveDuration, setLeaveDuration] = useState('');
  const [leaveDurations, setLeaveDurations] = useState([]); // State for fetched leave durations
  const [fromDate, setFromDate] = useState(null); // Set to null instead of new Date()
  const [toDate, setToDate] = useState(null); // Set to null instead of new Date()
  const [openFromDate, setOpenFromDate] = useState(false);
  const [openToDate, setOpenToDate] = useState(false);
  const [leaveDays, setLeaveDays] = useState(null);
  const [reason, setReason] = useState('');
  const [showSummary, setShowSummary] = useState(false); // Controls modal visibility
  const scrollRef = useRef(null);
  const [empEmail, setEmpEmail] = useState('');
  const [IDEmployee, setIDEmployee] = useState('');
  const [leaveBalance, setLeaveBalance] = useState([]); // Fetched leave balance
  const [selectedBalance, setSelectedBalance] = useState(null);
  const [leaveSummary, setLeaveSummary] = useState(null);
  const [isConnected, setIsConnected] = useState(true);
  const [alertShown, setAlertShown] = useState(false); // Prevent multiple alerts
  const [device, setDevice] = useState('');
  const [businessId, setBusinessId] = useState('');
  const [companyId, setCompanyId] = useState(null); // dynamic companyId
  const [selectedEncashment, setSelectedEncashment] = useState('0');
  const [accessToken, setAccessToken] = useState('');
  // For regenerating manager token
  const [empPassword, setusePassword] = useState('');
  const [username, setUsername] = useState('');
  const [useManagerToken, setuseManagerToken] = useState('');
  // const companyId = '1';
  const currentYear = new Date().getFullYear();

  // const today = new Date();
  // const Current_Year = today.getFullYear();
  // console.log("Year:", Current_Year);
  // console.log("Day of the year:", today);
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.reset({
          index: 0,
          routes: [{name: 'approvalDashboard'}],
        }); // <-- Your main screen
        return true; // prevent default back behavior
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () =>
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [navigation]),
  );

  /** 🔹 Load `Empemail` and then fetch API data */
  useEffect(() => {
    const initializeData = async () => {
      await getUserData();
    };
    initializeData();
  }, []);

  /** 🔹 Fetch API Data After Email is Retrieved */
  useEffect(() => {
    if (empEmail && companyId !== null) {
      fetchLeaveBalance(empEmail, currentYear);
      fetchLeaveDurations();
    }
    const fetchDeviceName = async () => {
      try {
        const deviceName = await DeviceInfo.getDeviceName();
        setDevice(deviceName);
        console.log('Device Name:', deviceName);
      } catch (error) {
        console.error('Error fetching device name:', error);
      }
    };
    fetchDeviceName();
  }, [empEmail, companyId]);

  // 🔹 **Check Internet Connection**
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      if (!state.isConnected) {
        setIsConnected(false);
        Alert.alert(
          'No Internet Connection',
          'Your internet is off. Please turn it on to continue.',
        );
        setAlertShown(true); // ✅ Show Alert Only Once
      } else {
        setIsConnected(true);
        setAlertShown(false); // Reset alert flag when internet is back
      }
    });
    return () => unsubscribe(); // Cleanup
  }, []);

  // useEffect(() => {
  //   const fetchDeviceName = async () => {
  //     try {
  //       const deviceName = await DeviceInfo.getDeviceName();
  //       setDevice(deviceName);
  //       console.log('Device Name:', deviceName);
  //     } catch (error) {
  //       console.error('Error fetching device name:', error);
  //     }
  //   };

  //   fetchDeviceName();
  // }, []);

  // Function to Retrieve `Empemail` and IdEmployee from AsyncStorage

  const getUserData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('UserData');
      if (jsonValue !== null) {
        const userData = JSON.parse(jsonValue);
        console.log('Full userData object:', userData);
        const businessID = userData.BusinessID;
        setEmpEmail(userData.Empemail); // Set Empemail in State
        setIDEmployee(userData.IDEmployee);
        setusePassword(userData.Password);
        setUsername(userData.Empname);
        setuseManagerToken(userData.ManagerToken);

        // 🔹 Set dynamic companyId based on BusinessID
        const normalizedBusinessID = businessID?.trim()?.toUpperCase();
        setBusinessId(normalizedBusinessID);
        if (normalizedBusinessID === 'GENI-QST-536') {
          setCompanyId(50);
        } else if (normalizedBusinessID === 'MEND-PVTL-890') {
          setCompanyId(1);
        } else {
          setCompanyId(0);
          Alert.alert(
            'Unknown Business',
            `Unsupported Business ID: ${normalizedBusinessID}`,
          );
        }
        console.log('BusinessId:', normalizedBusinessID);
        // Log in console
        console.log('Retrieved User Data:');
        console.log('Empemail:', userData.Empemail);
        console.log('IDEmployee:', userData.IDEmployee);
        //console.log("BisnessId:", userData.BusinessID);
      } else {
        Alert.alert('Error', 'User data not found.');
      }
    } catch (error) {
      console.error('Error retrieving data:', error);
    }
  };

  // Load `Empemail` when the screen loads
  // useEffect(() => {
  //   getUserData();
  // }, []);

  /**  Fetch Leave Durations from API */
  const fetchLeaveDurations = async () => {
    try {
      const apiUrl = `${Hrms_URL}LeaveDuration?companyId=${companyId}`;
      console.log('Fetching from API:', apiUrl); // Logs the API URL

      const response = await fetch(apiUrl);
      // console.log("Raw Response:", response); // Logs the raw response object

      const data = await response.json();
      console.log('API Data:', data); // Logs the actual API response data

      setLeaveDurations(data);
    } catch (error) {
      console.error('Error fetching leave durations:', error);
    }
  };

  const fetchLeaveBalance = async (email, year) => {
    const url = `${Hrms_URL}RetrieveLeaveBalance?companyId=${companyId}&email=${email}&year=${year}`;

    console.log('API Link:', url);

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP status ${response.status}`);
      }
      const data = await response.json();

      console.log('API Response:', data); // Debugging

      // Store only leave types for Picker
      const leaveTypes = data.map(item => ({
        label: item.codedescription,
        value: item.leavetypeid,
        balance: item.balance, // Store balance value
      }));

      setLeaveBalance(leaveTypes); // Set only relevant data
    } catch (error) {
      console.error('Error fetching leave balance:', error);
    }
  };

  const filteredLeaveTypes =
    leaveDuration === 'H' // use the actual `DurationCode` for Half Day
      ? leaveBalance.filter(
          item =>
            item.label.toLowerCase() === 'casual leave' ||
            item.label.toLowerCase() === 'special leave',
        )
      : leaveBalance;

  const handleLeaveTypeChange = value => {
    setLeaveType(value);

    // Find balance for selected leave type
    const selectedLeave = leaveBalance.find(item => item.value === value);
    setSelectedBalance(selectedLeave ? selectedLeave.balance : null);
  };

  // Fetch leave durations from the API
  // useEffect(() => {
  //   const fetchLeaveDurations = async () => {
  //     try {
  //       const response = await fetch('https://centralizedapi.iecsl.in/api/centralizedAPI/LeaveDuration?companyId=1');
  //       const data = await response.json();
  //       setLeaveDurations(data);
  //     } catch (error) {
  //       console.error('Error fetching leave durations:', error);
  //     }
  //   };

  //   fetchLeaveDurations();
  // }, []);

  // Function to calculate leave days

  const calculateLeaveDays = (from, to) => {
    return Math.ceil((to - from) / (1000 * 60 * 60 * 24));
  };

  // Function to handle From Date Selection
  const handleFromDateSelect = date => {
    setFromDate(date);
    setToDate(null); // Reset To Date when changing From Date
    setLeaveDays(null);
  };

  // Function to handle To Date Selection
  const handleToDateSelect = date => {
    if (!fromDate) {
      Alert.alert('Invalid Selection', "Please select 'From Date' first.", [
        {text: 'OK'},
      ]);
      return;
    }

    if (date < fromDate) {
      Alert.alert(
        'Invalid Date Selection',
        "From Date can't be greater than To Date",
        [{text: 'OK'}],
      );
      setToDate(null); // Reset To Date when changing From Date
      setLeaveDays(null);
      return;
    }
    if (date == fromDate) {
      setToDate(date);
      setLeaveDays(1.0);
    }
    if (leaveDuration === 'H') {
      // If Half Day is selected, set To Date same as From Date & leaveDays = 0.5
      setToDate(fromDate);
      setLeaveDays(0.5);
    } else {
      // Otherwise, set To Date as selected and calculate Leave Days normally
      setToDate(date);
      setLeaveDays(calculateLeaveDays(fromDate, date));
    }
  };

  // Function to handle Apply Button Click
  const handleApply = async () => {
    if (!leaveType || !leaveDuration || !fromDate || !reason.trim()) {
      Alert.alert(
        'Incomplete Form',
        'Please fill all fields before applying.',
        [{text: 'OK'}],
      );
      return;
    }

    //const companyId = 1; // Hardcoded company ID
    const email = empEmail; // Employee Email from AsyncStorage
    const leaveId = encodeURIComponent(leaveType); // Leave ID (assuming it's the selected leaveType)
    const formattedStartDate = moment(fromDate).format('MM-DD-YYYY'); // Format start date
    const formattedEndDate = toDate
      ? moment(toDate).format('MM-DD-YYYY')
      : formattedStartDate; // Format end date or use startDate
    const encodedReason = reason; // Encode reason to prevent API errors

    let apiUrl = '';
    console.log('Raw Email:', empEmail);
    // **Call the API based on Leave Duration selection**
    if (leaveDuration === 'F') {
      if (businessId?.toString().trim().toUpperCase() === 'GENI-QST-536') {
        apiUrl = `${Hrms_URL}FullDayLeaveApplyGeniquest?companyId=${companyId}&leaveId=${leaveId}&startDate=${formattedStartDate}&endDate=${formattedEndDate}&email=${email}&leaveReason=${encodedReason}&isEncashed=${selectedEncashment}`;
        console.log('Full Day Leave API URL for Geniquest:', apiUrl); // Debugging
      } else {
        // API for Full Day Leave
        apiUrl = `${Hrms_URL}FullDayLeaveApply?companyId=${companyId}&leaveId=${leaveId}&startDate=${formattedStartDate}&endDate=${formattedEndDate}&email=${email}&leaveReason=${encodedReason}`;
        console.log('Full Day Leave API URL:', apiUrl); // Debugging
      }
    } else if (leaveDuration === 'H') {
      if (businessId?.toString().trim().toUpperCase() === 'GENI-QST-536') {
        // API for Half Day Leave
        apiUrl = `${Hrms_URL}HalfDayLeaveApplyGeniquest?companyId=${companyId}&leaveId=${leaveId}&startDate=${formattedStartDate}&email=${email}&leaveReason=${encodedReason}`;
        console.log('Half Day Leave API URL for Geniquest:', apiUrl); // Debugging
      } else {
        // API for Half Day Leave
        apiUrl = `${Hrms_URL}HalfDayLeaveApply?companyId=${companyId}&leaveId=${leaveId}&startDate=${formattedStartDate}&email=${email}&leaveReason=${encodedReason}`;
        console.log('Half Day Leave API URL:', apiUrl); // Debugging
      }
    } else {
      Alert.alert(
        'Invalid Selection',
        'Please select a valid Leave Duration.',
        [{text: 'OK'}],
      );
      return;
    }

    // console.log("API Request URL:", apiUrl); // Debugging

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP status ${response.status}`);
      }

      const responseData = await response.json();
      console.log('API Response:', responseData); // Debugging

      if (responseData.length > 0) {
        const status = responseData[0].Status;

        if (status === '1') {
          // ✅ **Show full leave details in the modal**
          setLeaveSummary(responseData[0]);
          setShowSummary(true);
        } else {
          //  **Show only the Status text in an alert**
          Alert.alert('Leave Application Failed', status, [{text: 'OK'}]);
        }
      } else {
        Alert.alert('Error', 'Unexpected response from server.', [
          {text: 'OK'},
        ]);
      }
    } catch (error) {
      console.error('Error submitting leave:', error);
      Alert.alert(
        'Error',
        'Failed to submit leave request. Please try again.\n ' + error.message,
        [{text: 'OK'}],
      );
    }
  };

  const resetForm = () => {
    setLeaveType('');
    setLeaveDuration('');
    setFromDate(null);
    setToDate(null);
    setLeaveDays(null);
    setReason('');
    setSelectedBalance(null);
    setLeaveSummary(null);
  };

  // Function to Save Data IN HRMS  Database
  const handleSave = async () => {
    var date = moment().utcOffset('+05:30').format('YYYY-MM-DD hh:mm:ss A');
    // const companyId = 1; // Hardcoded Company ID
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;
    const FinancialYear = `${currentYear}-${nextYear}`;
    const email = empEmail; // Employee Email from AsyncStorage
    const leaveTypeName = leaveSummary.leavetype;
    const leaveDurationName = leaveSummary.duration;
    // Format Dates for API in "MM-DD-YYYY" format
    // const formattedFromDate = moment(leaveSummary.leavestartdate, "MM-DD-YYYY").format("MM-DD-YYYY");
    // const formattedToDate = moment(leaveSummary.leaveenddate, "MM-DD-YYYY").format("MM-DD-YYYY");
    // const prefixFromDate = moment(leaveSummary.prefixfromdate, "MM-DD-YYYY").format("MM-DD-YYYY");
    // const suffixToDate = moment(leaveSummary.sufixtodate, "MM-DD-YYYY").format("MM-DD-YYYY");
    const formattedFromDate = moment(
      leaveSummary.leavestartdate,
      'MM-DD-YYYY',
    ).format('YYYY-MM-DD');
    const formattedToDate = moment(
      leaveSummary.leaveenddate,
      'MM-DD-YYYY',
    ).format('YYYY-MM-DD');
    const prefixFromDate = moment(
      leaveSummary.prefixfromdate,
      'MM-DD-YYYY',
    ).format('YYYY-MM-DD');
    const suffixToDate = moment(leaveSummary.sufixtodate, 'MM-DD-YYYY').format(
      'YYYY-MM-DD',
    );

    const Applicationame = `ieCRM_Mobile - ${device}`;

    // Ensure noOfDays is formatted correctly (e.g., 2.00)
    const formattedNoOfDays = leaveSummary.noofdays;

    // Construct API URL with parameters
    let apiUrl = ''; // ✅ Declare apiUrl outside

    if (businessId?.toString().trim().toUpperCase() === 'GENI-QST-536') {
      apiUrl = `${Hrms_URL}ApplyLeaveGeniquest?companyId=${companyId}&email=${email}&leaveType=${leaveTypeName}&fromDate=${formattedFromDate}&toDate=${formattedToDate}&noOfDays=${formattedNoOfDays}&leaveReason=${reason}&duration=${leaveDurationName}&suffixToDate=${suffixToDate}&prefixFromDate=${prefixFromDate}&applicationType=${Applicationame}&FinancialYear=${FinancialYear}&isEncashed=${selectedEncashment}`;

      console.log('API Request URL for Geniquest:', apiUrl);
    } else {
      apiUrl = `${Hrms_URL}ApplyLeave?companyId=${companyId}&email=${email}&leaveType=${leaveTypeName}&fromDate=${formattedFromDate}&toDate=${formattedToDate}&noOfDays=${formattedNoOfDays}&leaveReason=${reason}&duration=${leaveDurationName}&suffixToDate=${suffixToDate}&prefixFromDate=${prefixFromDate}&applicationType=${Applicationame}`;

      console.log('API Request URL:', apiUrl);
    }

    try {
      const response = await fetch(apiUrl, {
        method: 'POST', // Use POST request
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP status ${response.status}`);
      }

      const responseData = await response.json();
      console.log('API Response:', responseData); // Debugging

      // ✅ **Handle Empty Message Case**
      if (responseData.length > 0) {
        const message = responseData[0].Message;
        if (!message || message.trim() === '') {
          Alert.alert(
            'Leave Submission Failed',
            'You Already Applied for the Leave',
            [{text: 'OK'}],
          );
          await handleSaveCrm('Error'); // 👈 Pass Error if duplicate
        } else {
          Alert.alert('Leave Submitted', message, [{text: 'OK'}]);
          await handleSaveCrm('Success'); // 👈 Pass Success
          // 🔔 Show local notification
          showLocalNotification(
            `Hi ${username}`,
            `Successfully submitted your ${leaveTypeName} from ${formattedFromDate} - ${formattedToDate} .\nDate & Time: ${
              date || 'N/A'
            }.`,
          );
          const token = await getAccessToken(); // get Bearer token
          const messageTitle = 'New Leave Submitted';
          const messageBody = `Employee ${username} submitted ${leaveTypeName} from ${formattedFromDate} - ${formattedToDate} successfully on ${date}`;
          await sendNotificationToManager(
            useManagerToken,
            messageTitle,
            messageBody,
            token,
          );
        }
      } else {
        Alert.alert('Error', 'Unexpected response from server.', [
          {text: 'OK'},
        ]);
        await handleSaveCrm('Error');
      }

      setShowSummary(false); // Close modal after saving
      resetForm(); // Reset form fields
    } catch (error) {
      console.error('Error submitting leave:', error);
      Alert.alert(
        'Error',
        'Failed to submit leave request. Please try again.',
        [{text: 'OK'}],
      );
      //await handleSaveCrm("Error");
    }
  };

  // Function To Save Data In CRM Database
  const handleSaveCrm = async status => {
    const IDApplication = 0;
    const EntryUser = empEmail; // Employee Email from AsyncStorage
    const IdEmployee = encodeURIComponent(IDEmployee); // Employee ID from AsyncStorage
    const leaveTypeName = leaveSummary.leavetype;
    const leaveDurationName = leaveSummary.duration;

    // Format Dates for API in "MM-DD-YYYY" format
    const formattedFromDate = moment(
      leaveSummary.leavestartdate,
      'MM-DD-YYYY',
    ).format('MM-DD-YYYY');
    const formattedToDate = moment(
      leaveSummary.leaveenddate,
      'MM-DD-YYYY',
    ).format('MM-DD-YYYY');
    const prefixFromDate = moment(
      leaveSummary.prefixfromdate,
      'MM-DD-YYYY',
    ).format('MM-DD-YYYY');
    const suffixToDate = moment(leaveSummary.sufixtodate, 'MM-DD-YYYY').format(
      'MM-DD-YYYY',
    );

    // Ensure `noOfDays` is formatted correctly (e.g., 2.00)
    const formattedNoOfDays = leaveSummary.noofdays;
    const Remarks = leaveSummary.leavereason;
    //const Businessid = "MEND-PVTL-890";

    // Construct Request Payload
    const requestBody = {
      IDApplication: IDApplication,
      LeaveType: leaveSummary.leavetype,
      IDEmployee: IdEmployee,
      LeaveFrom: formattedFromDate,
      LeaveTo: formattedToDate,
      LeaveDays: formattedNoOfDays,
      Remarks: leaveSummary.leavereason,
      DurationType: leaveSummary.duration,
      EntryUser: EntryUser,
      Businessid: businessId,
      Status: status,
    };

    // Construct API URL
    const apiUrl = `${BASE_URL}LeaveApplication/Save`;

    console.log('API Request URL CRM :', apiUrl);
    console.log('Request Body:', JSON.stringify(requestBody)); // Debugging

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP status ${response.status}`);
      }

      const responseData = await response.json();
      console.log('API Response:', responseData); // Debugging

      //  Check if response is {"result":""}
      if (responseData.result === '') {
        //Alert.alert("Success", "Leave Application Submitted Successfully.", [{ text: "OK" }]);
        setShowSummary(false); // Close modal
        resetForm(); // Reset form fields
        navigation.reset({
          index: 0,
          routes: [{name: 'approvalDashboard'}],
        }); // <-- Your ApprovalDashboard screen
      } else {
        Alert.alert(
          'Error',
          responseData.result || 'Unexpected error occurred.',
          [{text: 'OK'}],
        );
      }
    } catch (error) {
      console.error('Error submitting leave:', error);
      Alert.alert(
        'Error',
        'Failed to submit leave request. Please try again.',
        [{text: 'OK'}],
      );
    }
  };

  const getAccessToken = async () => {
    try {
      const response = await fetch(`${BASE_URL}Authentication/Generatetoken`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        console.error('Token request failed:', response.status);
        return null;
      }

      const data = await response.json();

      if (data && data.Token) {
        console.log('Access Token:', data.Token);

        // Optionally store in AsyncStorage or state
        // await AsyncStorage.setItem('AccessToken', data.Token);
        setAccessToken(data.Token);

        return data.Token;
      } else {
        console.warn('No token returned from API');
        return null;
      }
    } catch (error) {
      console.error('Error fetching access token:', error);
      return null;
    }
  };

  const sendNotificationToManager = async (
    managerToken,
    title,
    body,
    accessToken,
  ) => {
    if (!managerToken || managerToken.trim() === '') {
      console.warn(
        '⚠️ No manager FCM token available — skipping notification.',
      );
      return;
    }
    try {
      const url =
        'https://fcm.googleapis.com/v1/projects/iecrmnotificationapp-5ed0c/messages:send';

      const message = {
        message: {
          token: managerToken,
          notification: {title, body},
        },
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(message),
      });

      if (response.ok) {
        console.log('✅ Notification sent successfully');
        return;
      }

      // Parse FCM error response
      let err;
      try {
        err = await response.json();
      } catch {
        console.warn('⚠️ FCM error not JSON');
        return;
      }

      console.warn('❌ Notification failed:', JSON.stringify(err, null, 2));

      const isUnregistered = err?.error?.details?.some(
        d => d.errorCode === 'UNREGISTERED',
      );

      if (isUnregistered) {
        console.log('⚠️ Manager token invalid — attempting refresh.');
        await regenerateManagerTokenLocal(managerToken);
      }
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  const regenerateManagerTokenLocal = async oldToken => {
    try {
      const loginBody = {
        businessid: businessId,
        email: empEmail,
        password: empPassword,
      };

      const response = await fetch(`${BASE_URL}/login/validlogin`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(loginBody),
      });

      const data = await response.json();

      if (data?.Success && data?.Token) {
        const newToken = data.Token.trim();
        const oldTrimmed = oldToken?.trim();

        if (newToken === oldTrimmed) {
          console.log('ℹ️ New FCM token same as previous — skipping update.');
        } else {
          console.log('✅ New FCM token detected:', newToken);
          // Update locally only
          useManagerToken = newToken; // or setManagerToken(newToken);
        }
      } else {
        console.warn('⚠️ Failed to regenerate FCM token.');
      }
    } catch (error) {
      console.error('Error regenerating FCM token:', error);
    }
  };

  return (
    <KeyboardAwareLayout>
      <StatusBar barStyle="light-content" backgroundColor="#a9ddfaff" />
      <ImageBackground
        source={require('../images/bg2.png')}
        style={styles.background}
        resizeMode="cover">
        <KeyboardAwareScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          enableOnAndroid={true}
          extraScrollHeight={Platform.OS === 'ios' ? 100 : 100}
          enableAutomaticScroll={true}
          ref={scrollRef}>
          {/* Show Internet Warning when disconnected */}
          {!isConnected && (
            <View style={styles.noInternetContainer}>
              <Text style={styles.noInternetText}>
                ⚠ No Internet Connection
              </Text>
            </View>
          )}

          <View style={styles.formContainer}>
            {/* Leave Duration Dropdown */}
            <Text style={styles.label}>Select Leave Duration</Text>

            <Dropdown
              style={styles.picker1}
              data={leaveDurations.map(d => ({
                label: d.LeaveDuration,
                value: d.DurationCode,
              }))}
              labelField="label"
              valueField="value"
              placeholder="Select Leave Duration"
              value={leaveDuration}
              onChange={item => setLeaveDuration(item.value)}
              search
              searchPlaceholder="Search duration..."
              placeholderStyle={{color: '#999'}}
            />

            {/* Leave Type Dropdown */}
            <Text style={styles.label}>Select Leave Type</Text>

            <View style={styles.dropdownContainer}>
              {/* Picker for selecting Leave Type */}

              <Dropdown
                style={styles.picker1}
                data={filteredLeaveTypes.map(item => ({
                  label: item.label,
                  value: item.value,
                }))}
                labelField="label"
                valueField="value"
                placeholder="Select Leave Type"
                value={leaveType}
                onChange={item => handleLeaveTypeChange(item.value)}
                search
                searchPlaceholder="Search Leave Type..."
                placeholderStyle={{color: '#999'}}
              />

              {/* Display Leave Balance beside the selected Leave Type */}
              {selectedBalance !== null && (
                <View style={styles.balanceContainer}>
                  <Text style={styles.balanceText}>
                    Available Balance: {selectedBalance}{' '}
                  </Text>
                </View>
              )}
            </View>

            {/* From Date Picker */}
            <Text style={styles.label}>From Date</Text>
            <TouchableOpacity
              onPress={() => setOpenFromDate(true)}
              style={styles.dateButton}>
              <View style={{alignSelf: 'flex-start', paddingHorizontal: 10}}>
                <Text style={styles.dateText}>
                  {fromDate ? fromDate.toDateString() : 'Select Date'}
                </Text>
              </View>
            </TouchableOpacity>

            <DatePicker
              modal
              open={openFromDate}
              date={fromDate || new Date()}
              mode="date"
              onConfirm={date => {
                setOpenFromDate(false);
                handleFromDateSelect(date);
              }}
              onCancel={() => setOpenFromDate(false)}
            />

            {/* To Date Picker */}
            <Text style={styles.label}>To Date</Text>
            <TouchableOpacity
              onPress={() => setOpenToDate(true)}
              style={styles.dateButton}>
              <View style={{alignSelf: 'flex-start', paddingHorizontal: 10}}>
                <Text style={styles.dateText}>
                  {toDate ? toDate.toDateString() : 'Select Date'}
                </Text>
              </View>
            </TouchableOpacity>
            <DatePicker
              modal
              open={openToDate}
              date={toDate || new Date()}
              mode="date"
              onConfirm={date => {
                setOpenToDate(false);
                handleToDateSelect(date);
              }}
              onCancel={() => setOpenToDate(false)}
            />

            {/* Leave Days - Auto Calculated */}
            {/* <Text style={styles.label}>Leave Days</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={leaveDays ? String(leaveDays) : ""} // Fixed syntax error
                placeholder="No Of Days"
                placeholderTextColor="#999"
                editable={false}
              /> */}

            {businessId?.toString().trim().toUpperCase() === 'GENI-QST-536' &&
              leaveType?.toString() === '2' && (
                <>
                  <Text style={styles.label}>Encashment</Text>
                  <Dropdown
                    style={styles.picker1}
                    containerStyle={{borderRadius: 8}}
                    data={[
                      {label: 'YES', value: '1'},
                      {label: 'NO', value: '0'},
                    ]}
                    labelField="label"
                    valueField="value"
                    placeholder="Select Option"
                    search={false}
                    value={selectedEncashment}
                    onChange={item => setSelectedEncashment(item.value)}
                  />
                </>
              )}

            {/* Reason Input */}
            <Text style={styles.label}>Reason</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter reason for leave"
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
              value={reason}
              onChangeText={setReason}
              onFocus={() => scrollRef.current.scrollToEnd({animated: true})}
            />

            {/* <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold' }}>User Email:</Text>
              <Text style={{ fontSize: 16, color: 'blue' }}>{empEmail || 'Loading...'}</Text>
            </View> */}

            {/* Apply Button */}
            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => {
                if (!isConnected) {
                  Alert.alert(
                    'No Internet Connection',
                    'Your internet is off. Please turn it on to continue.',
                  );
                } else {
                  handleApply();
                }
              }}>
              <Text style={styles.applyButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAwareScrollView>
      </ImageBackground>
      {/* Summary Modal */}
      <Modal visible={showSummary} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.summaryTitle}>Leave Application Details</Text>

            <Text>
              Application Date: {leaveSummary?.applicationdate || '-'}
            </Text>
            <Text>Leave Type: {leaveSummary?.leavetype || '-'}</Text>
            <Text>Duration: {leaveSummary?.duration || '-'}</Text>
            <Text>Start Date: {leaveSummary?.leavestartdate || '-'}</Text>
            <Text>End Date: {leaveSummary?.leaveenddate || '-'}</Text>
            <Text>No. of Days: {leaveSummary?.noofdays || '-'}</Text>
            <Text>Reason: {leaveSummary?.leavereason || '-'}</Text>
            <Text>Prefix Date: {leaveSummary?.prefixfromdate || '-'}</Text>
            <Text>Suffix Date: {leaveSummary?.sufixtodate || '-'}</Text>

            {/* Buttons */}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={() => {
                  handleSave();
                  // handleSaveCrm();
                }}>
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowSummary(false)}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAwareLayout>
  );
};

export default LeaveScreen;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    justifyContent: 'space-between',

    backgroundColor: '#005696',
  },
  headerTitle: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginLeft: 10,
    marginRight: 10,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 10,
  },
  background: {
    height: Dimensions.get('window').height,
    width: Dimensions.get('window').width,
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 10,
    marginRight: 13,
  },
  titleOverlay: {
    backgroundColor: 'rgba(128, 77, 77, 0.7)',
    padding: 10,
    borderRadius: 10,
    marginTop: 8,
    width: '90%',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  formContainer: {
    width: '90%',
    paddingVertical: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 5,
    textAlign: 'left',
  },
  dateButton: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    width: '100%',
    marginTop: 5,
    borderColor: '#000',
    borderWidth: 1,
    alignItems: 'flex-start', // Ensures left alignment
  },
  dateText: {
    fontSize: 16,
    color: '#000',
  },
  dropdown: {
    backgroundColor: '#fff',
    borderRadius: 10,
    width: '100%',
    borderWidth: 1,
    borderColor: '#000',
    fontSize: 12,
    color: '#000',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    width: '100%',
    borderWidth: 1,
    borderColor: '#000',
    marginTop: 5,
    fontSize: 16,
    color: '#000',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  applyButton: {
    backgroundColor: '#005696',
    paddingVertical: 12,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  saveButton: {
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 5,
  },
  cancelButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  balanceContainer: {
    flex: 1,
    marginLeft: 10, // Add spacing between dropdown and balance text
  },
  balanceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'green',
    marginTop: 5,
  },
  headerContainer: {
    position: 'absolute',
    top: 10, // Adjust according to UI
    right: 20, // Position at the right
    zIndex: 10, // Ensure it stays on top
  },
  listButton: {
    backgroundColor: '#005696', // Button Color
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  listButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  noInternetContainer: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    width: '100%',
    alignItems: 'center',
  },

  noInternetText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  picker1: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1.3,
    borderColor: '#005696',
    borderRadius: 10,
    backgroundColor: '#fff',
    color: '#000000',
    marginBottom: 15,
    paddingRight: 30,

    // Shadow for iOS
    shadowColor: '#005696',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,

    // Shadow for Android
    elevation: 5,
  },
});
