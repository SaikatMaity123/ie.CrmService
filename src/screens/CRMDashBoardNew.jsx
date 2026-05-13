import {
  View,
  Text,
  SafeAreaView,
  ImageBackground,
  Dimensions,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  BackHandler,
  Linking,
  Modal,
  TextInput,
  Keyboard,
  ScrollView,
  RefreshControl,
  Animated,
  Easing,
  ActivityIndicator,
  StatusBar,
  LogBox,
  Image,
} from 'react-native';
import React, {useEffect, useState, useRef, useCallback} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import {BASE_URL, Sales_URL, url} from '@env';
import {openDatabase} from 'react-native-sqlite-storage';
import axios from 'axios';
import moment from 'moment';
import {useFocusEffect} from '@react-navigation/native';
import Voice from '@react-native-voice/voice';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {BarChart, LineChart} from 'react-native-gifted-charts';
import CustomViewMaster from '../components/custom/CustomViewMaster';
import CRMImg from '../images/CRMNEW.svg';
import ProgressDialog from '../components/custom/ProgressDialog';
import HomeImg from '../images/home.svg';
import {CommonActions} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import {format} from 'date-fns';
//database connection
const db = openDatabase(
  {
    name: 'CRM_db',
    location: 'default',
  },
  () => {
    //console.log('Database connected!');
  }, //on success
  error => console.log('Database error', error), //on error
);

const CRMDashBoardNew = ({navigation}) => {
    const insets = useSafeAreaInsets();
      const [useIDEmployee, setIDEmployee] = useState('');
      const [useBusinessID, setBusinessID] = useState('');
      const [useEmpname, setEmpname] = useState('');
      const [useManagerAccess, setuseManagerAccess] = useState('');
      const [useMobileAccess, setuseMobileAccess] = useState('');
      const [useAdminAcess, setAdminAcess] = useState('');
      const [useTrackingTime, setTrackingTime] = useState('');
      const [data, setData] = useState([]);
      //const [dashboarddata, setDashBoardData] = useState([]);
      const [DoctorVisitFrequency, setDoctorDVisitFrequencyata] = useState([]);
      const [RetailerVisitFrequency, setRetailerDVisitFrequencyata] = useState([]);
      const [loading, setLoading] = useState(false);
      const [useDivision, setDivision] = useState('');
      const [useSecurityKey, setSecurityKey] = useState('');
      const [useEmpemail, setEmpemail] = useState('');
      const [speed, setSpeed] = useState(null);
      const [isPoorConnection, setIsPoorConnection] = useState(false);
      const [chatVisible, setChatVisible] = useState(false);
      const [chatInput, setChatInput] = useState('');
      const [chatMessages, setChatMessages] = useState([]);
      const [isTyping, setIsTyping] = useState(false);
      const [isListening, setIsListening] = useState(false);
      const [isKeyboardVisible, setKeyboardVisible] = useState(false);
      const [netState, setNetState] = useState({isConnected: true});
      const scrollViewRef = useRef(null);
      const [refreshing, setRefreshing] = useState(false);
      const [todayDashboardData, setTodayDashboardData] = useState([]);
      const [avgDashboardData, setAvgDashboardData] = useState([]);
      const [modules, setModules] = useState([]);
      const [gamesTab, setGamesTab] = useState(1);
      const [isModalVisible, setModalVisible] = useState(false);
      const [salesLoading, setSalesLoading] = useState(false);
      const [useModalMessage, setModalMessage] = useState('');
      const [birthdays, setBirthdays] = useState([]);
      const [noticeboard, setNoticeBoard] = useState([]);
      const DashboardCard = ({title, count, backgroundColor}) => (
        <View style={[styles.card, {backgroundColor}]}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.count}>{count}</Text>
        </View>
      );

      const onSelectSwitch = value => setGamesTab(value);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const measureSpeed = async () => {
    let poorCount = 0;

    for (let i = 0; i < 5; i++) {
      const netState = await NetInfo.fetch();
      if (!netState.isConnected) {
        console.log('No connection. Skipping speed check.');
        setIsPoorConnection(true);
        return;
      } const startTime = Date.now();
      try {
        const response = await fetch(
          'https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png',
        );
        const data = await response.blob();
        const endTime = Date.now();

        const duration = (endTime - startTime) / 1000;
        const fileSizeInBytes = data.size;
        const speedInKbps = fileSizeInBytes / duration / 1024;

        setSpeed(speedInKbps);
        // console.log(Check ${i + 1}: ${speedInKbps.toFixed(2)} KB/s);

        if (speedInKbps < 50.0) {
          poorCount++;
        }
      } catch (err) {
        console.log('Speed check failed.');
        setSpeed(null);
      }

      await new Promise(resolve => setTimeout(resolve, 1000)); // wait 1 second before next check
    }

    if (poorCount === 5) {
      setIsPoorConnection(true);
    } else {
      setIsPoorConnection(false);
    }
  };
  useEffect(() => {
    LogBox.ignoreAllLogs();
    // Get the current connection type and check if connected
    // Monitor network changes
    const unsubscribe = NetInfo.addEventListener(state => {
      setNetState(state);

      // Update poor connection logic
      if (!state.isConnected) {
        setIsPoorConnection(false); // No internet is not the same as poor
      } else {
        // Mark cellular or unknown networks as poor (custom logic)
        const poorTypes = ['cellular', 'unknown'];
        setIsPoorConnection(poorTypes.includes(state.type));
      }
    });

    // Set interval to refresh speed every 5 seconds if connected
    const intervalId = setInterval(() => {
      NetInfo.fetch().then(state => {
        if (state.isConnected) {
          measureSpeed();
        }
      });
    }, 5000); // 5000 milliseconds = 5 seconds

    // Cleanup the event listener and interval on unmount
    return () => {
      unsubscribe();
      clearInterval(intervalId);
    };
  }, []);

  //Get Current Month Name
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const d = new Date();
  const month = monthNames[d.getMonth()];
  const cYear = moment().year();
  //console.log(month + ' ' + cYear);
  var cdate = moment().format('D/MMM/YYYY');
  var ctdate = moment().format('DD/MM/YYYY');
  //code  by  suman Jana
  const sDate = moment().startOf('month').format('YYYY/MM/DD'); // 2025/05/01
  const eDate = moment().subtract(1, 'days').format('YYYY/MM/DD'); // yesterday
  //end here

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 5000);
    try {
      AsyncStorage.getItem('UserData').then(async value => {
        if (value != null) {
          let user = JSON.parse(value);
          console.log('User Data from AsyncStorage : ', user);
          setIDEmployee(user.IDEmployee);
          setBusinessID(user.BusinessID);
          setEmpname(user.Empname);
          setuseManagerAccess(user.ManagerAccess);
          setuseMobileAccess(user.MobileAccess);
          setAdminAcess(user.AdminAccess);
          setTrackingTime(user.TrackingTime);
          setDivision(user.Division);
          setSecurityKey(user.SecurityKey);
          setEmpemail();
          fetchModules(user.BusinessID, user.Designation);
          //if (user.Designation !== 'DY_ZSM' && user.Designation !== 'ZSM') {
          NetInfo.fetch().then(state => {
            if (state.isConnected) {
              if (user.AdminAccess === true) {
              } else {
                if (
                  user.Designation !== 'DY_ZSM' &&
                  user.Designation !== 'ZSM'
                ) {
                  if (user.ManagerAccess === true) {
                    managerEmployeeWiseOfflineAreaList(
                      user.BusinessID,
                      user.IDEmployee,
                    );
                    managerEmployeeWiseOfflineDoctorList(
                      user.BusinessID,
                      user.IDEmployee,
                    );
                    managerEmployeeWiseOfflineRetailerList(
                      user.BusinessID,
                      user.IDEmployee,
                    );
                    offlineOrderBookingCustomerListForManager(
                      user.BusinessID,
                      user.IDDivision,
                      user.IDEmployee,
                    );
                  } else {
                    docList(user.BusinessID, user.IDEmployee);
                    retList(user.BusinessID, user.IDEmployee);
                    doctorProductMappingOfflineList(
                      user.BusinessID,
                      user.Empemail,
                      user.IDEmployee,
                    );
                    productMasterDoctor(user.BusinessID, user.IDDivision);
                    areaMaster(user.BusinessID, user.IDDivision, user.IDHQ);
                    typeAPI(user.BusinessID);
                    employeeWiseAreaList(user.BusinessID, user.IDEmployee);
                    offlineOrderBookingCustomerList(
                      user.BusinessID,
                      user.IDEmployee,
                    );
                  }
                  areaList(user.BusinessID, user.IDHQ);
                  visitWithList(user.BusinessID, user.IDEmployee);
                  wtDDOpen(user.BusinessID);
                  getfinalSatge(user.BusinessID);
                  qualificationDDOpen(user.BusinessID);
                  specialityDDOpen(user.BusinessID);
                  categoryDDOpen(user.BusinessID);
                  unlistedtypeAPI(user.BusinessID);
                  tourdateCheck(user.BusinessID, month, cYear, user.IDEmployee);
                  expenseRequestList(user.BusinessID, user.IDEmployee);
                  orderBookingPrice(user.BusinessID);
                  orderBookingBillingSeries(user.BusinessID);
                  orderBookingProductList(user.BusinessID);
                  masterDoctorType(user.BusinessID);
                  productGift(user.BusinessID, user.IDDivision);
                  productSample(user.BusinessID, user.IDDivision);
                  ExpenseHead(user.BusinessID);
                  doctorViewDCR(user.BusinessID, user.IDEmployee);
                  retailerViewDCR(user.BusinessID, user.IDEmployee);
                  unlistedViewDCR(user.BusinessID, user.IDEmployee);
                  employeeWiseDashboardData(
                    user.BusinessID,
                    user.IDEmployee,
                    sDate,
                    eDate,
                  );
                  employeewiseDoctorVisitFrequency(
                    user.BusinessID,
                    user.IDEmployee,
                  );
                  employeewiseRetailerVisitFrequency(
                    user.BusinessID,
                    user.IDEmployee,
                  );
                  fetchBirthdays(user.BusinessID);
                  fetchNoticeBoard(user.BusinessID);
                  campaignData(user.BusinessID, user.IDEmployee);
                  campaignproductData(user.BusinessID, user.IDEmployee);
                  offlinePendingDCRDate(user.BusinessID, user.IDEmployee);
                  fetchGeofencingData(user.BusinessID, user.IDEmployee);
                  //expenseBookingList(user.BusinessID, user.IDEmployee);
                  //orderbookingRetailerList(user.BusinessID, user.IDEmployee);
                  //expenseList(user.BusinessID, user.IDEmployee);
                  //orderList(user.BusinessID, user.IDEmployee);
                } else {
                  employeeWiseDashboardData(
                    user.BusinessID,
                    user.IDEmployee,
                    sDate,
                    eDate,
                  );
                  employeewiseDoctorVisitFrequency(
                    user.BusinessID,
                    user.IDEmployee,
                  );
                  employeewiseRetailerVisitFrequency(
                    user.BusinessID,
                    user.IDEmployee,
                  );
                  offlinePendingDCRDate(user.BusinessID, user.IDEmployee);
                  fetchGeofencingData(user.BusinessID, user.IDEmployee);
                  masterDoctorType(user.BusinessID);
                  productGift(user.BusinessID, user.IDDivision);
                  productSample(user.BusinessID, user.IDDivision);
                  campaignData(user.BusinessID, user.IDEmployee);
                  campaignproductData(user.BusinessID, user.IDEmployee);
                  wtDDOpen(user.BusinessID);
                  getfinalSatge(user.BusinessID);
                  qualificationDDOpen(user.BusinessID);
                  specialityDDOpen(user.BusinessID);
                  categoryDDOpen(user.BusinessID);
                  unlistedtypeAPI(user.BusinessID);
                  tourdateCheck(user.BusinessID, month, cYear, user.IDEmployee);
                  expenseRequestList(user.BusinessID, user.IDEmployee);
                  orderBookingPrice(user.BusinessID);
                  orderBookingBillingSeries(user.BusinessID);
                  orderBookingProductList(user.BusinessID);
                  ExpenseHead(user.BusinessID);
                  doctorViewDCR(user.BusinessID, user.IDEmployee);
                  retailerViewDCR(user.BusinessID, user.IDEmployee);
                  unlistedViewDCR(user.BusinessID, user.IDEmployee);
                  //Code by Suman Jana
                  fetchBirthdays(user.BusinessID);
                  fetchNoticeBoard(user.BusinessID);
                }
              }

              //Alert.alert('Hello Dadu');
              fetchQuizModules(user.BusinessID, user.IDEmployee);
              fetchMasterModules(user.BusinessID, user.IDEmployee);
              fetchDCRModules(user.BusinessID, user.IDEmployee);
              checkCompanyValidation(user.BusinessID);
              const formattedDate = format(new Date(), 'yyyy-MM-dd');
              console.log(formattedDate); // "2025-10-03"
              checkStartDayCheck(
                user.BusinessID,
                user.IDEmployee,
                formattedDate,
              );
            } else {
              Alert.alert('No Internet');
            }
          }, []);
        }
      });
    } catch (error) {
      Alert.alert(error);
    }
  }, []);

  // code by suman jana date - 24/05/2025
  const onRefresh = useCallback(() => {
    setRefreshing(true);

    AsyncStorage.getItem('UserData')
      .then(value => {
        if (value != null) {
          const user = JSON.parse(value);

          //code by Suman
          employeeWiseDashboardData(
            user.BusinessID,
            user.IDEmployee,
            sDate,
            eDate,
          );
          employeewiseDoctorVisitFrequency(user.BusinessID, user.IDEmployee);
          employeewiseRetailerVisitFrequency(user.BusinessID, user.IDEmployee);
          //Code by Suman Jana
          fetchBirthdays(user.BusinessID);
          fetchNoticeBoard(user.BusinessID);
          //end
        }
      })
      .catch(error => {
        console.error('Error fetching user data from AsyncStorage:', error);
      })
      .finally(() => {
        setTimeout(() => {
          setRefreshing(false);
        }, 1000); // shorter refresh delay for better UX
      });
  }, []);
  // end here

  useFocusEffect(
    React.useCallback(() => {
      const backAction = () => {
        Alert.alert('Hold on!', 'Are you sure you want to go back?', [
          {
            text: 'Cancel',
            onPress: () => null,
            style: 'cancel',
          },
          {text: 'YES', onPress: () => BackHandler.exitApp()},
        ]);
        return true;
      };

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        backAction,
      );

      return () => backHandler.remove();
    }, []),
  );

  const botResponses = {
    hello: 'Hi there! How can I help you?',
    hi: "Hey! What's up?",
    help: 'Sure! Ask me anything.',
    bye: 'Goodbye! Have a great day.',
    thanks: "You're welcome!",
    who: "I'm your offline and Online assistant chatbot.",
    'what is ie.crm':
      "it's a Mendine Group internal app to handel there field Employee.",
    'how do i log in to the crm':
      "Open the app and enter your Business ID, Email ID, and Password on the Login screen. If the credentials are valid, you'll be redirected to the dashboard.",
    'what can i access from the crm dashboard':
      'From the dashboard, you can access DCR, Expense, Orders, Tour Program, Reports, Master Data, and Settings.',
    'how do i start filling a daily call report (dcr)':
      'Navigate to the DCR module, select the client type (Doctor, Retailer, or Others), choose the area, and start entering interaction details, location, samples, and remarks.',
    'what details should i fill in a doctor dcr':
      'You must enter location (captured via GPS), select the doctor, enter remarks, choose samples/gifts given, and update product stages using the Doctor Product Stage Interface.',
    'how can i record doctor feedback during visits':
      'Use the Doctor Product Stage Interface within the DCR to log doctor feedback, product interest, objections, and stage of discussion (TG, CVT, SCT, RX).',
    'can i enter expenses during visits':
      'Yes. In the Expense module, select the expense head (e.g., Travel), enter the amount and remarks, and submit.',
    'how do i log a new customer if they are not listed':
      'Go to the Unlisted section in the DCR module, fill in customer name, mobile, work type, and remarks, then save the record.',
    'what is the use of the order module':
      'The Order module helps you record customer orders. Select the customer, add products with quantity and amount, and submit the order.',
    'how do i plan and track visits using tour program':
      'Use the Tour Program module to add planned visits. You can schedule daily/weekly visits with specific objectives and receive reminders.',
    'what is rcpa in crm':
      'RCPA (Retail Chemist Prescription Audit) tracks prescriptions at chemist shops. You can log doctor prescriptions, check availability, record alternate brands, and get chemist feedback.',
    'what details do i enter in the rcpa module':
      'Enter doctor name, chemist, prescribed product, availability, competitor brand (if any), and save the data for syncing.',
    'how can i track marketing activities in crm':
      'Go to the Activity Tracking module to log events like doctor meetings, CMEs, or detailing activities. Include time, location, and discussion outcomes.',
    'how do i generate my daily activity (da) report':
      'After entering all DCRs, visit logs, and activity records, the DA report is automatically generated and can be submitted for manager review.',
    'can i use the crm app offline':
      'Yes. All modules (DCR, Orders, Expenses, Tour Program) work offline. Data syncs automatically when you regain internet access.',
    'what happens after i submit a dcr':
      'It is stored locally (offline) and will be synchronized with the CRM backend when online. Managers can then review it for compliance and reporting.',
    'what is the purpose of the doctor product stage interface':
      'It allows you to track the stage of discussion for each product (TG, CVT, SCT, RX) during doctor visits for better targeting and reporting.',
    'how do i know if my data is synchronized':
      'Open the Settings module and check the Sync Status. You can also initiate manual sync for DCRs, Orders, and Expenses.',
    'how do managers review field activities':
      'Once data is synced, managers can access real-time reports on visits, expenses, orders, and activities for performance tracking.',
    'what analytics can i see in reports':
      'Reports show doctor visit frequency, order trends, expense summaries, RCPA analytics, and regional activity insights.',
  };

  const GEMINI_API_KEY = 'AIzaSyCeD80CDM501fhJuWrO7ddNSqyupEKDQlI'; // Replace with your real Gemini API Key

  const handleSendChat = async () => {
    try {
      if (!chatInput || chatInput.trim() === '') return;

      const userInput = chatInput.trim();
      const cleaned = userInput.toLowerCase();
      const userMsg = {sender: 'user', text: userInput};
      setChatMessages(prev => [...prev, userMsg]);
      setIsTyping(true);
      setChatInput('');

      const net = await NetInfo.fetch();

      // ✅ Try to get response from predefined botResponses first
      if (botResponses[cleaned]) {
        const botMsg = {sender: 'bot', text: botResponses[cleaned]};
        setIsTyping(false);
        setChatMessages(prev => [...prev, botMsg]);
        return;
      }

      // 🌐 If online and not in botResponses → call Gemini API
      if (net.isConnected) {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [{text: userInput}],
                },
              ],
            }),
          },
        );

        const data = await response.json();

        const botText =
          data?.candidates?.[0]?.content?.parts?.[0]?.text ||
          "Sorry, I couldn't generate a response.";

        const botMsg = {sender: 'bot', text: botText};
        setIsTyping(false);
        setChatMessages(prev => [...prev, botMsg]);
      } else {
        // 🔴 Offline and not in predefined list
        const botMsg = {
          sender: 'bot',
          text: "I'm offline and can't answer this question right now.",
        };
        setIsTyping(false);
        setChatMessages(prev => [...prev, botMsg]);
      }
    } catch (error) {
      console.log('Gemini Chat Error:', error);
      const botMsg = {
        sender: 'bot',
        text: 'Oops! Something went wrong while connecting to Gemini.',
      };
      setIsTyping(false);
      setChatMessages(prev => [...prev, botMsg]);
    }
  };

  useEffect(() => {
    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const startListening = async () => {
    try {
      setIsListening(true);

      Voice.onSpeechResults = e => {
        const speech = e.value[0];
        setChatInput(speech);
        setIsListening(false);
        Voice.stop();
      };

      await Voice.start('en-US');

      // ⏳ Auto stop after 5 seconds
      setTimeout(() => {
        if (isListening) {
          Voice.stop();
          setIsListening(false);
        }
      }, 5000); // 5 seconds
    } catch (error) {
      console.error('Voice Error:', error);
      setIsListening(false);
    }
  };
  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const chectTourPlanData = () => {
    db.transaction(tx => {
      tx.executeSql(
        // 'SELECT * FROM CRM_ManagerStartDay where StartDate=?',
        //'SELECT * FROM CRM_TourPlanDate where TourDate=?',
        'SELECT * FROM CRM_TourPlanDate where TourDate=? AND Approved = ?',
        [ctdate, true],
        (tx, results) => {
          // Check if there are rows in the result set
          if (results.rows.length > 0) {
            console.warn('Tour Program Approved');
            db.transaction(tx => {
              // Execute a query to retrieve table information
              tx.executeSql(
                //"SELECT name FROM sqlite_master WHERE type='table' AND name='CRM_StartDay'",
                "SELECT name FROM sqlite_master WHERE type='table' AND name='CRM_StartDayDummy'",
                [],
                (tx, results) => {
                  // Check if any rows are returned
                  if (results.rows.length > 0) {
                    // Table exists
                    console.warn('Table exists');
                    //navigation.navigate('AppNavDCRScreen');
                    checkTableData();
                  } else {
                    // Table does not exist
                    console.warn('Table does not exists');
                    //navigation.navigate('DCR Session');
                    navigation.dispatch(
                      CommonActions.reset({
                        index: 0,
                        routes: [{name: 'DCR Session'}], // or whatever your main screen is
                      }),
                    );
                  }
                },
                error => {
                  // Error occurred while executing the query
                  console.log(error);
                },
              );
            });
          } else {
            console.log('Table is empty');
            Alert.alert('Tour Program not found on this day: ' + ctdate);
            // navigation.dispatch(
            //   CommonActions.reset({
            //     index: 0,
            //     routes: [{name: 'AppNavScreen'}], // or whatever your main screen is
            //   }),
            // );
          }
        },
        error => console.error('Error executing SELECT query: ', error),
      );
    });
    //}
  };

  const checkTableData = () => {
    db.transaction(tx => {
      tx.executeSql(
        //'SELECT * FROM CRM_StartDay where StartDate=?',
        'SELECT * FROM CRM_StartDayDummy where StartDate=?',
        [cdate],
        (tx, results) => {
          // Check if there are rows in the result set
          if (results.rows.length > 0) {
            console.log('Table has data');
            //navigation.navigate('AppNavDCRScreen');
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{name: 'AppNavDCRScreen'}], // or whatever your main screen is
              }),
            );
          } else {
            console.log('Table is empty');
            //navigation.navigate('DCR Session');
            // navigation.dispatch(
            //   CommonActions.reset({
            //     index: 0,
            //     routes: [{name: 'DCR Session'}], // or whatever your main screen is
            //   }),
            // );
          }
        },
        error => console.error('Error executing SELECT query: ', error),
      );
    });
  };

  const areaList = (businessID, hqID) => {
    const aturl =
      BASE_URL +
      'Employee/EmpAreaList?Businessid=' +
      businessID +
      '&IDHQ=' +
      hqID;
    console.log('aturl ' + aturl);
    var config = {
      method: 'get',
      url: aturl,
    };
    axios(config)
      .then(function (response) {
        //CREATE TABLE for CRM_AreaList
        db.transaction(txn => {
          txn.executeSql('DROP TABLE IF EXISTS CRM_AreaList', []);
          txn.executeSql(
            'CREATE TABLE IF NOT EXISTS CRM_AreaList(IDArea INTEGER,Name VARCHAR,AreaType VARCHAR)',
            [],
          );
        });

        //SQLITE INSERT AreaListTBL
        var _value = [];
        _value = response.data;
        for (var j = 0; j < _value.length; j++) {
          const array = _value[j];
          let sql =
            'INSERT INTO CRM_AreaList(IDArea,Name,AreaType) VALUES (?,?,?)';
          let params = [array.IDArea, array.Name, array.AreaType]; //storing user data in an array
          db.executeSql(sql, params);
        }
      })
      .catch(function (error) {
        Alert.alert(error);
      });
  };
  const docList = (businessID, empID) => {
    const docurl =
      BASE_URL +
      'Doctor/OfflineDoctorList?Businessid=' +
      businessID +
      '&IDEmployee=' +
      empID;
    console.log('docurl ' + docurl);
    var config = {
      method: 'get',
      url: docurl,
    };
    axios(config)
      .then(function (response) {
        //console.log(response.data);
        //CREATE TABLE for CRM_DocList
        db.transaction(txn => {
          txn.executeSql('DROP TABLE IF EXISTS CRM_DocList', []);
          txn.executeSql(
            'CREATE TABLE IF NOT EXISTS CRM_DocList(IDDoctor INTEGER,Code INTEGER,IDArea INTEGER,Latitude NUMERIC,Longitude NUMERIC,Name VARCHAR)',
            [],
          );
        });

        //SQLITE INSERT AreaListTBL
        var _value = [];
        _value = response.data.data;
        for (var j = 0; j < _value.length; j++) {
          const array = _value[j];
          //let duplicateData = 'DELETE from CRM_DocList';
          let sql =
            'INSERT INTO CRM_DocList(IDDoctor,Code,IDArea,Latitude,Longitude,Name) VALUES (?,?,?,?,?,?)';
          let params = [
            array.IDDoctor,
            array.Code,
            array.IDArea,
            array.Latitude1,
            array.Longitude1,
            array.Name,
          ]; //storing user data in an array

          db.executeSql(sql, params);
        }
        //console.log(_value);
      })
      .catch(function (error) {
        Alert.alert(error);
      });
  };
  const retList = (businessID, empID) => {
    const returl =
      BASE_URL +
      'Retailer/OfflineRetailerList?Businessid=' +
      businessID +
      '&IDEmployee=' +
      empID;
    console.log('returl ' + returl);
    var config = {
      method: 'get',
      url: returl,
    };
    axios(config)
      .then(function (response) {
        //console.log(response.data);
        //CREATE TABLE for CRM_RetList
        db.transaction(txn => {
          txn.executeSql('DROP TABLE IF EXISTS CRM_RetList', []);
          txn.executeSql(
            'CREATE TABLE IF NOT EXISTS CRM_RetList(IDRetailer INTEGER,Code INTEGER,Latitude NUMERIC,Longitude NUMERIC,Name TEXT,Area TEXT,OtherCode TEXT)',
            [],
          );
        });

        //SQLITE INSERT AreaListTBL
        var _value = [];
        _value = response.data.data;
        for (var j = 0; j < _value.length; j++) {
          const array = _value[j];
          //let duplicateData = 'DELETE from CRM_DocList';
          let sql =
            'INSERT INTO CRM_RetList(IDRetailer,Code,Latitude,Longitude,Name,Area,OtherCode) VALUES (?,?,?,?,?,?,?)';
          let params = [
            array.IDRetailer,
            array.Code,
            array.Latitude,
            array.Longitude,
            array.Name,
            array.Area.IDArea,
            array.OtherCode,
          ]; //storing user data in an array

          db.executeSql(sql, params);
        }
        //console.log(_value);
      })
      .catch(function (error) {
        Alert.alert(error);
      });
  };
  const doctorProductMappingOfflineList = (businessID, empEmail, idEmp) => {
    const returl =
      BASE_URL +
      'Doctor/DoctorProductMappingOfflineList?Businessid=' +
      businessID +
      '&employeeEmail=' +
      empEmail +
      '&IDEmployee=' +
      idEmp;
    console.log('returl ' + returl);
    var config = {
      method: 'get',
      url: returl,
    };
    axios(config)
      .then(function (response) {
        //console.log(response.data.d);
        //CREATE TABLE for CRM_RetList
        db.transaction(txn => {
          txn.executeSql(
            'DROP TABLE IF EXISTS CRM_DoctorProductMappingListt',
            [],
          );
          txn.executeSql(
            'CREATE TABLE IF NOT EXISTS CRM_DoctorProductMappingListt(IDDoctor INTEGER,IDProduct INTEGER,IDStage INTEGER,ProductName VARCHAR,StageName VARCHAR)',
            [],
          );
        });

        //SQLITE INSERT CRM_DoctorProductMappingListt
        var _value = [];
        _value = response.data.d;
        for (var j = 0; j < _value.length; j++) {
          const array = _value[j];
          //let duplicateData = 'DELETE from CRM_DocList';
          let sql =
            'INSERT INTO CRM_DoctorProductMappingListt(IDDoctor,IDProduct,IDStage,ProductName,StageName) VALUES (?,?,?,?,?)';
          let params = [
            array.IDDoctor,
            array.IDProduct,
            array.IDStage,
            array.ProductName,
            array.StageName,
          ]; //storing user data in an array

          db.executeSql(sql, params);
        }
        //console.log(_value);
      })
      .catch(function (error) {
        Alert.alert(error);
      });
  };

  const visitWithList = (businessID, idemp) => {
    const vwturl =
      BASE_URL +
      'Employee/EmployeeUpwardManagerList?Businessid=' +
      businessID +
      '&IDEmployee=' +
      idemp;
    console.log(vwturl);
    var config = {
      method: 'get',
      url: vwturl,
    };
    axios(config)
      .then(function (response) {
        // console.log(JSON.stringify(response.data));

        //CREATE TABLE for CRM_VisitWithList
        db.transaction(txn => {
          txn.executeSql('DROP TABLE IF EXISTS CRM_VisitWithList', []);
          txn.executeSql(
            'CREATE TABLE IF NOT EXISTS CRM_VisitWithList(IDEmployee INTEGER,Name VARCHAR)',
            [],
          );
        });

        //SQLITE INSERT CRM_VisitWithList
        var _value = [];
        _value = response.data;
        for (var j = 0; j < _value.length; j++) {
          const array = _value[j];
          let sql =
            'INSERT INTO CRM_VisitWithList(IDEmployee,Name) VALUES (?,?)';
          let params = [array.IDEmployee, array.Name]; //storing user data in an array
          db.executeSql(sql, params);
        }
      })
      .catch(function (error) {
        Alert.alert(error);
      });
  };

  const employeeWiseAreaList = (businessID, idemp) => {
    const areaurl =
      BASE_URL +
      'Area/EmployeeWiseAreaList?Businessid=' +
      businessID +
      '&IDEmployee=' +
      idemp;
    console.log('returl ' + areaurl);
    var config = {
      method: 'get',
      url: areaurl,
    };
    axios(config)
      .then(function (response) {
        //CREATE TABLE for CRM_VisitWithList
        db.transaction(txn => {
          txn.executeSql('DROP TABLE IF EXISTS CRM_EmployeeWiseAreaList', []);
          txn.executeSql(
            'CREATE TABLE IF NOT EXISTS CRM_EmployeeWiseAreaList(IDArea INTEGER,Name VARCHAR,AreaType VARCHAR)',
            [],
          );
        });

        //SQLITE INSERT CRM_VisitWithList
        var _value = [];
        _value = response.data;
        for (var j = 0; j < _value.length; j++) {
          const array = _value[j];
          let sql =
            'INSERT INTO CRM_EmployeeWiseAreaList(IDArea,Name,AreaType) VALUES (?,?,?)';
          let params = [array.IDArea, array.Name, array.AreaType]; //storing user data in an array
          db.executeSql(sql, params);
        }
      })
      .catch(function (error) {
        Alert.alert(error);
      });
  };

  //code by suman jana Date - 24/08/2025
  const employeeWiseDashboardData = async (businessID, idemp, sDate, eDate) => {
    try {
      // 🟢 First API - Today's Tour Program Dashboard
      const url1 = `${BASE_URL}Dashboard/TourProgram/Today?Businessid=${businessID}&IDEmployee=${idemp}`;
      // console.log('TourProgram URL:', url1);
      const response1 = await axios.get(url1);
      setTodayDashboardData(response1.data);
    } catch (error) {
      console.error('TourProgram API Error:', error);
    }

    try {
      // 🟢 Second API - Average Doctor/Retailer Call
      const url2 = `${BASE_URL}user/DoctorAndRetailerCallAverageList?Businessid=${businessID}&IDEmployee=${idemp}&SDate=${sDate}&EDate=${eDate}`;
      //console.log('CallAverage URL:', url2);
      const response2 = await axios.get(url2);
      setAvgDashboardData(response2.data);
    } catch (error) {
      console.error('CallAverage API Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const employeewiseDoctorVisitFrequency = async (businessID, idemp) => {
    const DashbourdDoctorVisitFrequencyurl =
      BASE_URL +
      'DCR/DoctorVisitFrequency?Businessid=' +
      businessID +
      '&IDEmployee=' +
      idemp +
      '&Type=DOCTOR';
    console.log('Dashbourdaurl ' + DashbourdDoctorVisitFrequencyurl);
    try {
      const response = await axios.get(DashbourdDoctorVisitFrequencyurl);
      setDoctorDVisitFrequencyata(response.data);
    } catch (error) {
      console.error('API error:', error);
    } finally {
      setLoading(false);
    }
  };
  const screenWidth = Dimensions.get('window').width;

  const sortedDoctorData = [...DoctorVisitFrequency].sort(
    (a, b) => Number(a.MonthsName) - Number(b.MonthsName),
  );

  const last10Data = sortedDoctorData.slice(-10);

  const barData = last10Data.map(item => ({
    value: item.Visit,
    label: item.MonthsName,
    frontColor: '#6a1b9a',
    gradientColor: '#d1c4e9',
    topLabelComponent: () => (
      <Text style={{color: '#6a1b9a', fontSize: 12, fontWeight: 'bold'}}>
        {item.Visit}
      </Text>
    ),
  }));

  const employeewiseRetailerVisitFrequency = async (businessID, idemp) => {
    const DashbourdRetailerVisitFrequencyurl =
      BASE_URL +
      'DCR/PartyVisitFrequency?Businessid=' +
      businessID +
      '&IDEmployee=' +
      idemp +
      '&Type=RETAILER';
    console.log('Dashbourdaurl ' + DashbourdRetailerVisitFrequencyurl);
    try {
      const response = await axios.get(DashbourdRetailerVisitFrequencyurl);
      setRetailerDVisitFrequencyata(response.data);
    } catch (error) {
      console.error('API error:', error);
    } finally {
      setLoading(false);
    }
  };

  const sortedRetailerData = [...RetailerVisitFrequency].sort(
    (a, b) => Number(a.MonthsName) - Number(b.MonthsName),
  );

  const last10DataRe = sortedRetailerData.slice(-10);

  const chartDataretailer = last10DataRe.map(item => ({
    value: item.Visit,
    label: item.MonthsName,
    frontColor: '#2939f0',
    gradientColor: '#d1c4e9',
    topLabelComponent: () => (
      <Text style={{color: '#4c59ed', fontSize: 12, fontWeight: 'bold'}}>
        {item.Visit}
      </Text>
    ),
  }));

  // ✅ Separate method to fetch birthdays
  const fetchBirthdays = businessId => {
    setLoading(true);
    fetch(`${BASE_URL}Dashboard/UpcomingBirthday?Businessid=${businessId}`)
      .then(res => res.json())
      .then(data => {
        setBirthdays(data);
        setLoading(false);
      })
      .catch(error => {
        console.error(error);
        setLoading(false);
      });
  };

  // ✅ Function to calculate days until birthday
  const getDaysUntilBirthday = dobString => {
    if (!dobString) return '';

    try {
      // Extract month/day safely from API format: "9/10/1980 12:00:00 AM"
      const [month, day] = dobString.split(' ')[0].split('/'); // ["9","10","1980"]
      const today = new Date();
      const currentYear = today.getFullYear();

      // Create this year's birthday
      let nextBirthday = new Date(
        currentYear,
        parseInt(month) - 1,
        parseInt(day),
      );

      // If birthday already passed, take next year
      if (nextBirthday < today.setHours(0, 0, 0, 0)) {
        nextBirthday = new Date(
          currentYear + 1,
          parseInt(month) - 1,
          parseInt(day),
        );
      }

      // Difference in days
      const diffTime = nextBirthday - new Date();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return '🎉 Today';
      if (diffDays === 1) return 'Tomorrow';
      return `In ${diffDays} days`;
    } catch (error) {
      console.error('DOB parsing error:', dobString, error);
      return '';
    }
  };

  const onWish = item => {
    if (!item.Phone) {
      Alert.alert('Phone number not available');
      return;
    }

    let phone = item.Phone;

    // ✅ Ensure correct format (India example: add +91 if not present)
    if (!phone.startsWith('+')) {
      phone = `+91${phone}`;
    }
    const employeeName = item.Employee ? item.Employee.trim() : '';
    const senderName = useEmpname ? useEmpname.trim() : '';
    // insert name right after "Happy Birthday!"
    let birthdayMsg = item.BirthdayMassage || 'Happy Birthday!';
    if (birthdayMsg.startsWith('Happy Birthday!')) {
      // birthdayMsg = birthdayMsg.replace(
      //   "Happy Birthday!",
      //   `Happy Birthday! ${employeeName},`
      // );
    }

    const message = `*Hi , ${employeeName}* 🎉 ${birthdayMsg} – *${senderName}*.\n\n*ieCRM Team*`;

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'WhatsApp not installed on this device.');
    });
  };

  // ✅ Separate method to fetch NoticeBoard
  const fetchNoticeBoard = businessId => {
    const url = `${BASE_URL}Dashboard/NoticeBoard?Businessid=${businessId}`;
    console.log('🔗 NoticeBoard API URL:', url);

    setLoading(true);
    fetch(url)
      .then(res => res.json())
      .then(data => {
        // console.log("📥 API Response:", data);
        setNoticeBoard(data.data || []); // 👈 pick the array inside
        setLoading(false);
      })

      .catch(error => {
        console.error('❌ API Error:', error);
        setLoading(false);
      });
  };

  // suman jana code End here .

  const offlineOrderBookingCustomerListForManager = (
    businessID,
    idDiv,
    idemp,
  ) => {
    const areaurl =
      BASE_URL +
      'OrderBooking/OfflineOrderBookingCustomerListForManager?Businessid=' +
      businessID +
      '&IDDivision=' +
      idDiv +
      '&IDEmployee=' +
      idemp;
    console.log('returl ' + areaurl);
    var config = {
      method: 'get',
      url: areaurl,
    };
    axios(config)
      .then(function (response) {
        //CREATE TABLE for CRM_VisitWithList
        db.transaction(txn => {
          txn.executeSql(
            'DROP TABLE IF EXISTS CRM_offlineOrderBookingCustomerListForManager',
            [],
          );
          txn.executeSql(
            'CREATE TABLE IF NOT EXISTS CRM_offlineOrderBookingCustomerListForManager(IDRetailer INTEGER,IDEmployee INTEGER,IDArea INTEGER,Name VARCHAR)',
            [],
          );
        });

        //SQLITE INSERT CRM_VisitWithList
        var _value = [];
        _value = response.data;
        for (var j = 0; j < _value.length; j++) {
          const array = _value[j];
          let sql =
            'INSERT INTO CRM_offlineOrderBookingCustomerListForManager(IDRetailer,IDEmployee,IDArea,Name) VALUES (?,?,?,?)';
          let params = [
            array.IDRetailer,
            array.IDEmployee,
            array.IDArea,
            array.Name,
          ]; //storing user data in an array
          db.executeSql(sql, params);
          //Alert.alert(sql + ' ' + params);
        }
      })
      .catch(function (error) {
        Alert.alert(error);
      });
  };

  const offlineOrderBookingCustomerList = (businessID, idemp) => {
    const areaurl =
      BASE_URL +
      'OrderBooking/OfflineOrderBookingCustomerList?Businessid=' +
      businessID +
      '&IDEmployee=' +
      idemp;
    console.log('returl ' + areaurl);
    var config = {
      method: 'get',
      url: areaurl,
    };
    axios(config)
      .then(function (response) {
        //CREATE TABLE for CRM_VisitWithList
        db.transaction(txn => {
          txn.executeSql(
            'DROP TABLE IF EXISTS CRM_offlineOrderBookingCustomerList',
            [],
          );
          txn.executeSql(
            'CREATE TABLE IF NOT EXISTS CRM_offlineOrderBookingCustomerList(IDRetailer INTEGER,Code VARCHAR,OtherCode VARCHAR,Name VARCHAR,IDArea INTEGER)',
            [],
          );
        });

        //SQLITE INSERT CRM_VisitWithList
        var _value = [];
        _value = response.data;
        for (var j = 0; j < _value.length; j++) {
          const array = _value[j];
          let sql =
            'INSERT INTO CRM_offlineOrderBookingCustomerList(IDRetailer,Code,OtherCode,Name,IDArea) VALUES (?,?,?,?,?)';
          let params = [
            array.IDRetailer,
            array.Code,
            array.OtherCode,
            array.Name,
            array.IDArea,
          ]; //storing user data in an array
          db.executeSql(sql, params);
        }
      })
      .catch(function (error) {
        Alert.alert(error);
      });
  };
  const campaignData = (businessID, idemp) => {
    const campurl =
      BASE_URL +
      'Campaign/EmployeeWiseCampaignList?Businessid=' +
      businessID +
      '&IDEmployee=' +
      idemp;
    console.log(campurl);
    var config = {
      method: 'get',
      url: campurl,
    };

    axios(config)
      .then(function (response) {
        db.transaction(txn => {
          txn.executeSql('DROP TABLE IF EXISTS CRM_Campaign', []);
          txn.executeSql(
            'CREATE TABLE IF NOT EXISTS CRM_Campaign(IDCampaign VARCHAR,Campaign VARCHAR)',
            [],
          );
        });

        //SQLITE INSERT CRM_VisitWithList
        var _value = [];
        _value = response.data;
        for (var j = 0; j < _value.length; j++) {
          const array = _value[j];
          let sql =
            'INSERT INTO CRM_Campaign(IDCampaign,Campaign) VALUES (?,?)';
          let params = [array.IDCampaign, array.Campaign]; //storing user data in an array
          db.executeSql(sql, params);
        }
      })
      .catch(function (error) {
        Alert.alert(error);
      });
  };
  const campaignproductData = (businessID, idemp) => {
    const produrl =
      BASE_URL +
      'Campaign/EmployeeWiseCampaignList?Businessid=' +
      businessID +
      '&IDEmployee=' +
      idemp;
    console.log(produrl);
    var config = {
      method: 'get',
      url: produrl,
    };

    axios(config)
      .then(function (response) {
        db.transaction(txn => {
          txn.executeSql('DROP TABLE IF EXISTS CRM_CampaignProduct', []);
          txn.executeSql(
            'CREATE TABLE IF NOT EXISTS CRM_CampaignProduct(IDProduct VARCHAR,Product VARCHAR)',
            [],
          );
        });

        //SQLITE INSERT CRM_VisitWithList
        var _value = [];
        _value = response.data;
        for (var j = 0; j < _value.length; j++) {
          const array = _value[j];
          let sql =
            'INSERT INTO CRM_CampaignProduct(IDProduct,Product) VALUES (?,?)';
          let params = [array.IDProduct, array.Product]; //storing user data in an array
          db.executeSql(sql, params);
        }
      })
      .catch(function (error) {
        Alert.alert(error);
      });
  };
  const offlinePendingDCRDate = (businessID, idemp) => {
    const produrl =
      BASE_URL +
      'Configuration/OfflinePendingDCRDate?Businessid=' +
      businessID +
      '&IDEmployee=' +
      idemp;
    console.log(produrl);
    var config = {
      method: 'get',
      url: produrl,
    };

    axios(config)
      .then(function (response) {
        db.transaction(txn => {
          txn.executeSql('DROP TABLE IF EXISTS CRM_offlinePendingDCRDate', []);
          txn.executeSql(
            'CREATE TABLE IF NOT EXISTS CRM_offlinePendingDCRDate(DCRDate VARCHAR)',
            [],
          );
        });

        //SQLITE INSERT CRM_offlinePendingDCRDate
        var _value = [];
        _value = response.data;
        console.log('_value', _value);

        for (var j = 0; j < _value.length; j++) {
          const array = _value[j];
          let sql = 'INSERT INTO CRM_offlinePendingDCRDate(DCRDate) VALUES (?)';
          let params = [array.DCRDate]; //storing user data in an array
          db.executeSql(sql, params);
        }
      })
      .catch(function (error) {
        Alert.alert(error);
      });
  };

  const fetchGeofencingData = async (businessID, idemp) => {
    const produrl =
      BASE_URL +
      'Configuration/MobileGeofencing?Businessid=' +
      businessID +
      '&IDEmployee=' +
      idemp;
    console.log(produrl);
    try {
      const response = await fetch(produrl);
      const data = await response.json();

      db.transaction(tx => {
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS Geofencing (
            IDEmployee INTEGER PRIMARY KEY,
            Geofencing TEXT,
            EmployeeName TEXT,
            DoctorGeoFencing INTEGER,
            RetailerGeoFencing INTEGER
          );`,
        );
      });
      // Save to SQLite
      if (data.length > 0) {
        const item = data[0];
        db.transaction(tx => {
          tx.executeSql(
            `INSERT OR REPLACE INTO Geofencing (IDEmployee, Geofencing, EmployeeName, DoctorGeoFencing, RetailerGeoFencing) VALUES (?, ?, ?, ?, ?)`,
            [
              item.IDEmployee,
              item.Geofencing,
              item.EmployeeName,
              item.DoctorGeoFencing,
              item.RetailerGeoFencing,
            ],
          );
        });
      }
    } catch (error) {
      console.error('Error fetching geofencing data:', error);
    }
  };

  const wtDDOpen = businessID => {
    //console.log(useBusinessID);
    const wturl =
      BASE_URL + 'Misc/List?Businessid=' + businessID + '&Type=WORKTYPE';
    console.log(wturl);
    var config = {
      method: 'get',
      url: wturl,
    };
    axios(config)
      .then(function (response) {
        //console.log(response.data);
        //CREATE TABLE for WorkTypeTBL
        db.transaction(txn => {
          txn.executeSql('DROP TABLE IF EXISTS CRM_WorkTypeList', []);
          txn.executeSql(
            'CREATE TABLE IF NOT EXISTS CRM_WorkTypeList(IDMisc INTEGER,Name VARCHAR)',
            [],
          );
        });

        //SQLITE INSERT WorkTypeTBL
        var _value = [];
        _value = response.data;
        for (var j = 0; j < _value.length; j++) {
          const array = _value[j];
          let sql = 'INSERT INTO CRM_WorkTypeList(IDMisc,Name) VALUES (?,?)';
          let params = [array.IDMisc, array.Name]; //storing user data in an array
          db.executeSql(sql, params);
        }
      })
      .catch(function (error) {
        Alert.alert(error);
      });
  };

  const masterDoctorType = businessID => {
    const empurl =
      BASE_URL + 'Misc/List?Businessid=' + businessID + '&Type=DOCTORTYPE';
    console.log(empurl);
    var config = {
      method: 'get',
      url: empurl,
    };
    axios(config)
      .then(function (response) {
        db.transaction(tx => {
          tx.executeSql('DROP TABLE IF EXISTS MasterDoctorType', []);
          tx.executeSql(
            'CREATE TABLE IF NOT EXISTS MasterDoctorType(IDMisc INTEGER,Code VARCHAR,Name VARCHAR)',
            [],
            (tx, results) => {
              //console.log('Table created successfully');
            },
            error => {
              Alert.alert('Error creating table:', error);
            },
          );
        });

        //SQLITE INSERT CRM_productList
        var _value = [];
        _value = response.data;
        for (var i = 0; i < _value.length; i++) {
          const array = _value[i];

          let sql =
            'INSERT INTO MasterDoctorType(IDMisc,Code,Name) VALUES (?,?,?)';
          let params = [array.IDMisc, array.Code, array.Name]; //storing user data in an array
          db.executeSql(sql, params);
          //console.log(params);
        }
      })
      .catch(function (error) {
        Alert.alert(error);
      });
  };
  const productGift = (businessID, idDiv) => {
    const prdurl =
      BASE_URL +
      'Product/ProductDivisionSampleGiftList?Businessid=' +
      businessID +
      '&IDDivision=' +
      idDiv +
      '&Type=GIFT';
    console.log(prdurl);
    var config = {
      method: 'get',
      url: prdurl,
    };

    axios(config)
      .then(function (response) {
        //console.log(response.data);

        db.transaction(tx => {
          tx.executeSql('DROP TABLE IF EXISTS CRM_GIFT', []);
          tx.executeSql(
            'CREATE TABLE IF NOT EXISTS CRM_GIFT(IDProduct INTEGER,Code VARCHAR,Name VARCHAR)',
            [],
            (tx, results) => {
              //console.log('Table created successfully');
            },
            error => {
              Alert.alert('Error creating table:', error);
            },
          );
        });

        //SQLITE INSERT CRM_productList
        var _value = [];
        _value = response.data;
        for (var i = 0; i < _value.length; i++) {
          const array = _value[i];

          let sql = 'INSERT INTO CRM_GIFT(IDProduct,Code,Name) VALUES (?,?,?)';
          let params = [array.IDProduct, array.Code, array.Name]; //storing user data in an array
          db.executeSql(sql, params);
          //console.log(params);
        }
      })
      .catch(function (error) {
        Alert.alert(error);
      });
  };
  const productSample = (businessID, idDiv) => {
    const prdurl =
      BASE_URL +
      'Product/ProductDivisionSampleGiftList?Businessid=' +
      businessID +
      '&IDDivision=' +
      idDiv +
      '&Type=DOCTORPRODUCT';
    console.log(prdurl);
    var config = {
      method: 'get',
      url: prdurl,
    };

    axios(config)
      .then(function (response) {
        //console.log(response.data);

        db.transaction(tx => {
          tx.executeSql('DROP TABLE IF EXISTS CRM_SAMPLE', []);
          tx.executeSql(
            'CREATE TABLE IF NOT EXISTS CRM_SAMPLE(IDProduct INTEGER,Code VARCHAR,Name VARCHAR)',
            [],
            (tx, results) => {
              //console.log('Table created successfully');
            },
            error => {
              Alert.alert('Error creating table:', error);
            },
          );
        });

        //SQLITE INSERT CRM_productList
        var _value = [];
        _value = response.data;
        for (var i = 0; i < _value.length; i++) {
          const array = _value[i];

          let sql =
            'INSERT INTO CRM_SAMPLE(IDProduct,Code,Name) VALUES (?,?,?)';
          let params = [array.IDProduct, array.Code, array.Name]; //storing user data in an array
          db.executeSql(sql, params);
          //console.log(params);
        }
      })
      .catch(function (error) {
        Alert.alert(error);
      });
  };

  const getfinalSatge = async businessID => {
    const finalurl =
      BASE_URL + 'Misc/List?Businessid=' + businessID + '&Type=TARGET';
    console.log(finalurl);
    var config = {
      method: 'get',
      url: finalurl,
    };
    axios(config)
      .then(function (response) {
        // console.log(JSON.stringify(response.data));
        db.transaction(tx => {
          tx.executeSql('DROP TABLE IF EXISTS CRM_finalStageList', []);
          tx.executeSql(
            'CREATE TABLE IF NOT EXISTS CRM_finalStageList(IDMisc INTEGER,Name VARCHAR)',
            [],
            (tx, results) => {
              //console.log('Table created successfully');
            },
            error => {
              Alert.alert('Error creating table:', error);
            },
          );
        });

        //SQLITE INSERT CRM_finalStageList
        var _value = [];
        _value = response.data;
        for (var i = 0; i < _value.length; i++) {
          const array = _value[i];

          let sql = 'INSERT INTO CRM_finalStageList(IDMisc,Name) VALUES (?,?)';
          let params = [array.IDMisc, array.Name]; //storing user data in an array
          db.executeSql(sql, params);
          //console.log(params);
        }
      })
      .catch(function (error) {
        Alert.alert(error);
      });
  };

  const qualificationDDOpen = businessID => {
    //console.log(useBusinessID);
    const qurl =
      BASE_URL + 'Qualification/QualificationList?Businessid=' + businessID;
    console.log(qurl);
    var config = {
      method: 'get',
      url: qurl,
    };
    axios(config)
      .then(function (response) {
        //console.log(response.data);
        db.transaction(tx => {
          tx.executeSql('DROP TABLE IF EXISTS CRM_Qualification', []);
          tx.executeSql(
            'CREATE TABLE IF NOT EXISTS CRM_Qualification(IDQualification INTEGER,Name VARCHAR)',
            [],
            (tx, results) => {
              //console.log('Table created successfully');
            },
            error => {
              Alert.alert('Error creating table:', error);
            },
          );
        });

        //SQLITE INSERT CRM_Qualification
        var qualificationArray = [];
        qualificationArray = response.data;
        for (var i = 0; i < qualificationArray.length; i++) {
          const array = qualificationArray[i];

          let sql =
            'INSERT INTO CRM_Qualification(IDQualification,Name) VALUES (?,?)';
          let params = [array.IDQualification, array.Name]; //storing user data in an array
          db.executeSql(sql, params);
          //console.log(params);
        }
      })
      .catch(function (error) {
        Alert.alert(error);
      });
  };
  const specialityDDOpen = businessID => {
    //console.log(useBusinessID);
    const surl =
      BASE_URL + 'Speciality/SpecialityList?Businessid=' + businessID;
    console.log(surl);
    var config = {
      method: 'get',
      url: surl,
    };
    axios(config)
      .then(function (response) {
        //console.log(response.data);
        db.transaction(tx => {
          tx.executeSql('DROP TABLE IF EXISTS CRM_Speciality', []);
          tx.executeSql(
            'CREATE TABLE IF NOT EXISTS CRM_Speciality(IDSpeciality INTEGER,Name VARCHAR)',
            [],
            (tx, results) => {
              //console.log('Table created successfully');
            },
            error => {
              console.error('Error creating table:', error);
            },
          );
        });

        //SQLITE INSERT CRM_Qualification
        var specialityArray = [];
        specialityArray = response.data;
        for (var i = 0; i < specialityArray.length; i++) {
          const array = specialityArray[i];
          let sql =
            'INSERT INTO CRM_Speciality(IDSpeciality,Name) VALUES (?,?)';
          let params = [array.IDSpeciality, array.Name]; //storing user data in an array
          db.executeSql(sql, params);
          //console.log(params);
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  };
  const categoryDDOpen = businessID => {
    //console.log(useBusinessID);
    const surl =
      BASE_URL + 'Misc/List?Businessid=' + businessID + '&Type=PRODUCTCLASS';
    console.log(surl);
    var config = {
      method: 'get',
      url: surl,
    };
    axios(config)
      .then(function (response) {
        //console.log(response.data);
        db.transaction(tx => {
          tx.executeSql('DROP TABLE IF EXISTS CRM_Category', []);
          tx.executeSql(
            'CREATE TABLE IF NOT EXISTS CRM_Category(IDMisc INTEGER,Name VARCHAR)',
            [],
            (tx, results) => {
              //console.log('Table created successfully');
            },
            error => {
              Alert.alert('Error creating table:', error);
            },
          );
        });

        //SQLITE INSERT CRM_Qualification
        var specialityArray = [];
        specialityArray = response.data;
        for (var i = 0; i < specialityArray.length; i++) {
          const array = specialityArray[i];
          let sql = 'INSERT INTO CRM_Category(IDMisc,Name) VALUES (?,?)';
          let params = [array.IDMisc, array.Name]; //storing user data in an array
          db.executeSql(sql, params);
          //console.log(params);
        }
      })
      .catch(function (error) {
        Alert.alert(error);
      });
  };

  const productMasterDoctor = (businessID, IDDivision) => {
    //console.log(useBusinessID);
    const surl =
      BASE_URL +
      //'Product/ProductListDivisionWise?Businessid=' +
      'Product/ProductDivisionTypeList?Businessid=' +
      businessID +
      '&IDDivision=' +
      IDDivision +
      '&Type=DOCTORPRODUCT';
    console.log(surl);
    var config = {
      method: 'get',
      url: surl,
    };
    axios(config)
      .then(function (response) {
        //console.log(response.data);
        db.transaction(tx => {
          tx.executeSql('DROP TABLE IF EXISTS CRM_Master_Doctor_Product', []);
          tx.executeSql(
            'CREATE TABLE IF NOT EXISTS CRM_Master_Doctor_Product(IDProduct INTEGER,Name VARCHAR)',
            [],
            (tx, results) => {
              //console.log('Table created successfully');
            },
            error => {
              Alert.alert('Error creating table:', error);
            },
          );
        });

        //SQLITE INSERT CRM_Qualification
        var specialityArray = [];
        specialityArray = response.data;
        for (var i = 0; i < specialityArray.length; i++) {
          const array = specialityArray[i];
          let sql =
            'INSERT INTO CRM_Master_Doctor_Product(IDProduct,Name) VALUES (?,?)';
          let params = [array.IDProduct, array.Name]; //storing user data in an array
          db.executeSql(sql, params);
          //console.log(params);
        }
      })
      .catch(function (error) {
        Alert.alert(error);
      });
  };
  const areaMaster = (businessID, empEmail, IDHQ) => {
    const surl =
      BASE_URL +
      'Area/DivisionAndHQWiseAreaList?Businessid=' +
      businessID +
      '&IDDivision=' +
      empEmail +
      '&IDHQ=' +
      IDHQ;
    console.log('surllll', surl);
    var config = {
      method: 'get',
      url: surl,
    };
    axios(config)
      .then(function (response) {
        //console.log(response.data);
        db.transaction(tx => {
          tx.executeSql('DROP TABLE IF EXISTS CRM_Master_Area', []);
          tx.executeSql(
            'CREATE TABLE IF NOT EXISTS CRM_Master_Area(IDArea INTEGER,Name VARCHAR)',
            [],
            (tx, results) => {
              //console.log('Table created successfully');
            },
            error => {
              Alert.alert('Error creating table:', error);
            },
          );
        });

        //SQLITE INSERT CRM_Qualification
        var specialityArray = [];
        specialityArray = response.data;
        for (var i = 0; i < specialityArray.length; i++) {
          const array = specialityArray[i];
          let sql = 'INSERT INTO CRM_Master_Area(IDArea,Name) VALUES (?,?)';
          let params = [array.IDArea, array.Name]; //storing user data in an array
          db.executeSql(sql, params);
          //console.log(params);
        }
      })
      .catch(function (error) {
        Alert.alert(error);
      });
  };

  const typeAPI = businessID => {
    const turl =
      BASE_URL + 'Misc/List?Businessid=' + businessID + '&Type=RETAILERTYPE';
    console.log(turl);
    var config = {
      method: 'get',
      url: turl,
    };
    axios(config)
      .then(function (response) {
        //console.log(response.data);
        db.transaction(tx => {
          tx.executeSql('DROP TABLE IF EXISTS CRM_Master_Type', []);
          tx.executeSql(
            'CREATE TABLE IF NOT EXISTS CRM_Master_Type(IDMisc INTEGER,Name VARCHAR)',
            [],
            (tx, results) => {
              //console.log('Table created successfully');
            },
            error => {
              Alert.alert('Error creating table:', error);
            },
          );
        });

        //SQLITE INSERT CRM_Master_Type
        var specialityArray = [];
        specialityArray = response.data;
        for (var i = 0; i < specialityArray.length; i++) {
          const array = specialityArray[i];
          let sql = 'INSERT INTO CRM_Master_Type(IDMisc,Name) VALUES (?,?)';
          let params = [array.IDMisc, array.Name]; //storing user data in an array
          db.executeSql(sql, params);
          //console.log(params);
        }
      })
      .catch(function (error) {
        Alert.alert(error);
      });
  };

  const unlistedtypeAPI = businessID => {
    const turl =
      BASE_URL + 'Misc/List?Businessid=' + businessID + '&Type=UNLISTED';
    console.log(turl);
    var config = {
      method: 'get',
      url: turl,
    };
    axios(config)
      .then(function (response) {
        //console.log(response.data);
        db.transaction(tx => {
          tx.executeSql('DROP TABLE IF EXISTS CRM_Unlisted_Type', []);
          tx.executeSql(
            'CREATE TABLE IF NOT EXISTS CRM_Unlisted_Type(IDMisc INTEGER,Name VARCHAR)',
            [],
            (tx, results) => {
              //console.log('Table created successfully');
            },
            error => {
              Alert.alert('Error creating table:', error);
            },
          );
        });

        //SQLITE INSERT CRM_Master_Type
        var specialityArray = [];
        specialityArray = response.data;
        for (var i = 0; i < specialityArray.length; i++) {
          const array = specialityArray[i];
          let sql = 'INSERT INTO CRM_Unlisted_Type(IDMisc,Name) VALUES (?,?)';
          let params = [array.IDMisc, array.Name]; //storing user data in an array
          db.executeSql(sql, params);
          //console.log(params);
        }
      })
      .catch(function (error) {
        Alert.alert(error);
      });
  };
  const managerEmployeeWiseOfflineAreaList = (businessID, IDEmployee) => {
    //console.log(useBusinessID);
    const empurl =
      BASE_URL +
      'Area/ManagerEmployeeWiseOfflineAreaList?Businessid=' +
      businessID +
      '&IDManager=' +
      IDEmployee;
    console.log(empurl);
    var config = {
      method: 'get',
      url: empurl,
    };
    axios(config)
      .then(function (response) {
        //CREATE TABLE for MangerVisitWithTBL
        db.transaction(txn => {
          txn.executeSql(
            'DROP TABLE IF EXISTS ManagerEmployeeWiseAreaList',
            [],
          );
          txn.executeSql(
            'CREATE TABLE IF NOT EXISTS ManagerEmployeeWiseAreaList(Name VARCHAR,IDArea VARCHAR,IDEmployee VARCHAR)',
            [],
          );
        });

        //SQLITE INSERT ManagerEmployeeWiseAreaList
        var _value = [];
        _value = response.data;
        for (var j = 0; j < _value.length; j++) {
          const array = _value[j];
          let sql =
            'INSERT INTO ManagerEmployeeWiseAreaList(Name,IDArea,IDEmployee) VALUES (?,?,?)';
          let params = [array.Name, array.IDArea, array.IDEmployee]; //storing user data in an array
          db.executeSql(sql, params);
        }
      })
      .catch(function (error) {
        Alert.alert(error);
      });
  };
  const managerEmployeeWiseOfflineDoctorList = (businessID, IDEmployee) => {
    //console.log(useBusinessID);
    const empurl =
      BASE_URL +
      'Doctor/ManagerEmployeeWiseOfflineDoctorList?Businessid=' +
      businessID +
      '&IDManager=' +
      IDEmployee;
    console.log(empurl);
    var config = {
      method: 'get',
      url: empurl,
    };
    axios(config)
      .then(function (response) {
        //CREATE TABLE for MangerVisitWithTBL
        db.transaction(txn => {
          txn.executeSql(
            'DROP TABLE IF EXISTS ManagerEmployeeWiseDoctorList',
            [],
          );
          txn.executeSql(
            'CREATE TABLE IF NOT EXISTS ManagerEmployeeWiseDoctorList(IDDoctor INTEGER,IDArea INTEGER,Name VARCHAR,AreaName VARCHAR,IDEmployee VARCHAR,Code VARCHAR,Latitude1 VARCHAR,Longitude1 VARCHAR)',
            [],
          );
        });

        //SQLITE INSERT ManagerEmployeeWiseAreaList
        var _value = [];
        _value = response.data;
        for (var j = 0; j < _value.length; j++) {
          const array = _value[j];
          let sql =
            'INSERT INTO ManagerEmployeeWiseDoctorList(IDDoctor,IDArea,Name,AreaName,IDEmployee,Code,Latitude1,Longitude1) VALUES (?,?,?,?,?,?,?,?)';
          let params = [
            array.IDDoctor,
            array.IDArea,
            array.Name,
            array.AreaName,
            array.IDEmployee,
            array.Code,
            array.Latitude1,
            array.Longitude1,
          ]; //storing user data in an array
          db.executeSql(sql, params);
          //console.log('ProductName',array.Product.ProductName);
        }
      })
      .catch(function (error) {
        Alert.alert(error);
      });
  };
  const managerEmployeeWiseOfflineRetailerList = (businessID, IDEmployee) => {
    //console.log(useBusinessID);
    const empurl =
      BASE_URL +
      'Retailer/ManagerEmployeeWiseOfflineRetailerList?Businessid=' +
      businessID +
      '&IDManager=' +
      IDEmployee;
    console.log(empurl);
    var config = {
      method: 'get',
      url: empurl,
    };
    axios(config)
      .then(function (response) {
        //CREATE TABLE for MangerVisitWithTBL
        db.transaction(txn => {
          txn.executeSql(
            'DROP TABLE IF EXISTS ManagerEmployeeWiseRetailerList',
            [],
          );
          txn.executeSql(
            'CREATE TABLE IF NOT EXISTS ManagerEmployeeWiseRetailerList(IDRetailer INTEGER,IDArea INTEGER,Name VARCHAR,AreaName VARCHAR,IDEmployee VARCHAR,Code VARCHAR,Latitude VARCHAR,Longitude VARCHAR)',
            [],
          );
        });
        var _value = [];
        _value = response.data;
        for (var j = 0; j < _value.length; j++) {
          const array = _value[j];
          let sql =
            'INSERT INTO ManagerEmployeeWiseRetailerList(IDRetailer,IDArea,Name,AreaName,IDEmployee,Code,Latitude,Longitude) VALUES (?,?,?,?,?,?,?,?)';
          let params = [
            array.IDRetailer,
            array.IDArea,
            array.Name,
            array.AreaName,
            array.IDEmployee,
            array.Code,
            array.Latitude,
            array.Longitude,
          ]; //storing user data in an array
          db.executeSql(sql, params);
        }
      })
      .catch(function (error) {
        Alert.alert(error);
      });
  };
  const orderBookingPrice = businessID => {
    const wturl =
      BASE_URL + 'Misc/List?Businessid=' + businessID + '&Type=ORDERPRICETYPE';
    console.log(wturl);
    var config = {
      method: 'get',
      url: wturl,
    };
    axios(config)
      .then(function (response) {
        db.transaction(txn => {
          txn.executeSql('DROP TABLE IF EXISTS OrderBookingPrice', []);

          txn.executeSql(
            'CREATE TABLE IF NOT EXISTS OrderBookingPrice(Code VARCHAR,Name VARCHAR)',
            [],
          );
        });

        var _value = [];
        _value = response.data;
        for (var j = 0; j < _value.length; j++) {
          const array = _value[j];
          let sql = 'INSERT INTO OrderBookingPrice(Code,Name) VALUES (?,?)';
          let params = [array.Code, array.Name]; //storing user data in an array
          db.executeSql(sql, params);
        }
      })
      .catch(function (error) {
        Alert.alert(error);
      });
  };
  const orderBookingBillingSeries = businessID => {
    const wturl =
      BASE_URL + 'Misc/List?Businessid=' + businessID + '&Type=BILLINGSERIES';
    console.log(wturl);
    var config = {
      method: 'get',
      url: wturl,
    };
    axios(config)
      .then(function (response) {
        db.transaction(txn => {
          txn.executeSql('DROP TABLE IF EXISTS OrderBookingBillingSeries', []);

          txn.executeSql(
            'CREATE TABLE IF NOT EXISTS OrderBookingBillingSeries(Code VARCHAR,Name VARCHAR)',
            [],
          );
        });
        var _value = [];
        _value = response.data;
        for (var j = 0; j < _value.length; j++) {
          const array = _value[j];
          let sql =
            'INSERT INTO OrderBookingBillingSeries(Code,Name) VALUES (?,?)';
          let params = [array.Code, array.Name]; //storing user data in an array
          db.executeSql(sql, params);
        }
      })
      .catch(function (error) {
        Alert.alert(error);
      });
  };

  const orderBookingProductList = async businessID => {
    try {
      const url = BASE_URL + 'Product/Order/List?Businessid=' + businessID;
      console.log(url);
      let result = await fetch(url);
      result = await result.json();

      db.transaction(tx => {
        tx.executeSql('DROP TABLE IF EXISTS OrderBookingProductList', []);
        tx.executeSql(
          'CREATE TABLE IF NOT EXISTS OrderBookingProductList(IDProduct INTEGER,Code VARCHAR,Name VARCHAR,PackSize VARCHAR,MRP VARCHAR,PurRate VARCHAR)',
          [],
          (tx, results) => {
            //console.log('Table created successfully');
          },
          error => {
            Alert.alert('Error creating table:', error);
          },
        );
      });
      var _value = [];
      _value = result;
      for (var i = 0; i < _value.length; i++) {
        const array = _value[i];

        let sql =
          'INSERT INTO OrderBookingProductList(IDProduct,Code,Name,PackSize,MRP,PurRate) VALUES (?,?,?,?,?,?)';
        let params = [
          array.IDProduct,
          array.Code,
          array.Name,
          array.PackSize,
          array.MRP,
          array.PurRate,
        ]; //storing user data in an array
        db.executeSql(sql, params);
        //console.log(params);
      }
    } catch (error) {
      Alert.alert(error);
    }
  };

  const ExpenseHead = businessID => {
    const wturl = BASE_URL + 'Expensehead/List?Businessid=' + businessID;
    console.log(wturl);
    var config = {
      method: 'get',
      url: wturl,
    };
    axios(config)
      .then(function (response) {
        db.transaction(txn => {
          txn.executeSql('DROP TABLE IF EXISTS CRM_ExpenseHead', []);

          txn.executeSql(
            'CREATE TABLE IF NOT EXISTS CRM_ExpenseHead(IDExpenseHead VARCHAR,Name VARCHAR)',
            [],
          );
        });
        var _value = [];
        _value = response.data;
        //console.log('Expense HEAD', _value);
        for (var j = 0; j < _value.length; j++) {
          const array = _value[j];
          let sql =
            'INSERT INTO CRM_ExpenseHead(IDExpenseHead,Name) VALUES (?,?)';
          let params = [array.IDExpenseHead, array.Name]; //storing user data in an array
          db.executeSql(sql, params);
        }
      })
      .catch(function (error) {
        Alert.alert(error);
      });
  };

  const expenseRequestList = async (businessID, idEmp) => {
    const url =
      BASE_URL +
      'ExpenseBooking/Mobile/Requested/List?Businessid=' +
      businessID +
      '&IDEmployee=' +
      idEmp;
    console.log(url);
    let result = await fetch(url);
    result = await result.json();

    db.transaction(txn => {
      txn.executeSql('DROP TABLE IF EXISTS CRM_ExpenseRequestList', []);

      txn.executeSql(
        'CREATE TABLE IF NOT EXISTS CRM_ExpenseRequestList(IDBooking INTEGER,Bookingno VARCHAR,BookingDate VARCHAR,BookingAmount VARCHAR,ExpenseHeadName VARCHAR,Requested NUMERIC,Approved VARCHAR,Rejected VARCHAR,RejectedReason VARCHAR,MonthName VARCHAR)',
        [],
      );
    });

    for (var j = 0; j < result.length; j++) {
      const array = result[j];
      //console.log('result',array);
      let sql =
        'INSERT INTO CRM_ExpenseRequestList(IDBooking,Bookingno,BookingDate,BookingAmount,ExpenseHeadName,Requested,Approved,Rejected,RejectedReason,MonthName) VALUES (?,?,?,?,?,?,?,?,?,?)';
      let params = [
        array.IDBooking,
        array.Bookingno,
        array.BookingDate,
        array.BookingAmount,
        array.ExpenseHeadName,
        array.Requested,
        array.Approved,
        array.Rejected,
        array.RejectedReason,
        array.MonthName,
      ]; //storing user data in an array
      db.executeSql(sql, params);
    }
  };

  const doctorViewDCR = (businessID, idEmp) => {
    if (useManagerAccess === true) {
      const wturl =
        BASE_URL +
        'DCR/Mobile/Manager/DCRList?Businessid=' +
        businessID +
        '&IDEmployee=' +
        idEmp +
        '&Type=Doctor';
      console.log(wturl);
      var config = {
        method: 'get',
        url: wturl,
      };
      axios(config)
        .then(function (response) {
          db.transaction(txn => {
            txn.executeSql(
              'DROP TABLE IF EXISTS CRM_ManagerOnlineViewDocDCR',
              [],
            );

            txn.executeSql(
              'CREATE TABLE IF NOT EXISTS CRM_ManagerOnlineViewDocDCR(Customer VARCHAR,Code VARCHAR,DCRDate VARCHAR,CustomerType VARCHAR)',
              [],
            );
          });
          var _value = [];
          _value = response.data.d;
          //console.log('doctorViewDCR', _value);
          for (var j = 0; j < _value.length; j++) {
            const array = _value[j];
            let sql =
              'INSERT INTO CRM_ManagerOnlineViewDocDCR(Customer,Code,DCRDate,CustomerType) VALUES (?,?,?,?)';
            let params = [
              array.Customer,
              array.Code,
              array.DCRDate,
              array.CustomerType,
            ]; //storing user data in an array
            db.executeSql(sql, params);
          }
        })
        .catch(function (error) {
          Alert.alert(error);
        });
    } else {
      const wturl =
        BASE_URL +
        'DCR/Mobile/Msr/DCRList?Businessid=' +
        businessID +
        '&IDEmployee=' +
        idEmp +
        '&Type=Doctor';
      console.log(wturl);
      var config = {
        method: 'get',
        url: wturl,
      };
      axios(config)
        .then(function (response) {
          db.transaction(txn => {
            txn.executeSql('DROP TABLE IF EXISTS CRM_OnlineViewDocDCR', []);

            txn.executeSql(
              'CREATE TABLE IF NOT EXISTS CRM_OnlineViewDocDCR(Customer VARCHAR,Code VARCHAR,DCRDate VARCHAR,CustomerType VARCHAR)',
              [],
            );
          });
          var _value = [];
          _value = response.data.d;
          //console.log('doctorViewDCR', _value);
          for (var j = 0; j < _value.length; j++) {
            const array = _value[j];
            let sql =
              'INSERT INTO CRM_OnlineViewDocDCR(Customer,Code,DCRDate,CustomerType) VALUES (?,?,?,?)';
            let params = [
              array.Customer,
              array.Code,
              array.DCRDate,
              array.CustomerType,
            ]; //storing user data in an array
            db.executeSql(sql, params);
          }
        })
        .catch(function (error) {
          Alert.alert(error);
        });
    }
  };

  const retailerViewDCR = (businessID, idEmp) => {
    if (useManagerAccess === true) {
      const wturl =
        BASE_URL +
        'DCR/Mobile/Manager/DCRList?Businessid=' +
        businessID +
        '&IDEmployee=' +
        idEmp +
        '&Type=Retailer';
      console.log(wturl);
      var config = {
        method: 'get',
        url: wturl,
      };
      axios(config)
        .then(function (response) {
          db.transaction(txn => {
            txn.executeSql(
              'DROP TABLE IF EXISTS CRM_ManagerOnlineViewRetDCR',
              [],
            );

            txn.executeSql(
              'CREATE TABLE IF NOT EXISTS CRM_ManagerOnlineViewRetDCR(Customer VARCHAR,Code VARCHAR,DCRDate VARCHAR,CustomerType VARCHAR)',
              [],
            );
          });
          var _value = [];
          _value = response.data.d;
          //console.log('retailerViewDCR', _value);
          for (var j = 0; j < _value.length; j++) {
            const array = _value[j];
            let sql =
              'INSERT INTO CRM_ManagerOnlineViewRetDCR(Customer,Code,DCRDate,CustomerType) VALUES (?,?,?,?)';
            let params = [
              array.Customer,
              array.Code,
              array.DCRDate,
              array.CustomerType,
            ]; //storing user data in an array
            db.executeSql(sql, params);
          }
        })
        .catch(function (error) {
          Alert.alert(error);
        });
    } else {
      const wturl =
        BASE_URL +
        'DCR/Mobile/Msr/DCRList?Businessid=' +
        businessID +
        '&IDEmployee=' +
        idEmp +
        '&Type=Retailer';
      console.log(wturl);
      var config = {
        method: 'get',
        url: wturl,
      };
      axios(config)
        .then(function (response) {
          db.transaction(txn => {
            txn.executeSql('DROP TABLE IF EXISTS CRM_OnlineViewRetDCR', []);

            txn.executeSql(
              'CREATE TABLE IF NOT EXISTS CRM_OnlineViewRetDCR(Customer VARCHAR,Code VARCHAR,DCRDate VARCHAR,DCRDate VARCHAR,CustomerType VARCHAR)',
              [],
            );
          });
          var _value = [];
          _value = response.data.d;
          //console.log('retailerViewDCR', _value);
          for (var j = 0; j < _value.length; j++) {
            const array = _value[j];
            let sql =
              'INSERT INTO CRM_OnlineViewRetDCR(Customer,Code,DCRDate,CustomerType) VALUES (?,?,?,?)';
            let params = [
              array.Customer,
              array.Code,
              array.DCRDate,
              array.CustomerType,
            ]; //storing user data in an array
            db.executeSql(sql, params);
          }
        })
        .catch(function (error) {
          Alert.alert(error);
        });
    }
  };

  const unlistedViewDCR = (businessID, idEmp) => {
    if (useManagerAccess === true) {
      const wturl =
        BASE_URL +
        'DCR/Mobile/Manager/DCRList?Businessid=' +
        businessID +
        '&IDEmployee=' +
        idEmp +
        '&Type=Unlisted';
      console.log(wturl);
      var config = {
        method: 'get',
        url: wturl,
      };
      axios(config)
        .then(function (response) {
          db.transaction(txn => {
            txn.executeSql(
              'DROP TABLE IF EXISTS CRM_OnlineMangerViewUnlistedDCR',
              [],
            );

            txn.executeSql(
              'CREATE TABLE IF NOT EXISTS CRM_OnlineMangerViewUnlistedDCR(Customer VARCHAR,Code VARCHAR,DCRDate VARCHAR,CustomerType VARCHAR)',
              [],
            );
          });
          var _value = [];
          _value = response.data.d;
          //console.log('unlistedViewDCR', _value);
          for (var j = 0; j < _value.length; j++) {
            const array = _value[j];
            let sql =
              'INSERT INTO CRM_OnlineMangerViewUnlistedDCR(Customer,Code,DCRDate,CustomerType) VALUES (?,?,?,?)';
            let params = [
              array.Customer,
              array.Code,
              array.DCRDate,
              array.CustomerType,
            ]; //storing user data in an array
            db.executeSql(sql, params);
          }
        })
        .catch(function (error) {
          Alert.alert(error);
        });
    } else {
      const wturl =
        BASE_URL +
        'DCR/Mobile/Msr/DCRList?Businessid=' +
        businessID +
        '&IDEmployee=' +
        idEmp +
        '&Type=Unlisted';
      console.log(wturl);
      var config = {
        method: 'get',
        url: wturl,
      };
      axios(config)
        .then(function (response) {
          db.transaction(txn => {
            txn.executeSql(
              'DROP TABLE IF EXISTS CRM_OnlineViewUnlistedDCR',
              [],
            );

            txn.executeSql(
              'CREATE TABLE IF NOT EXISTS CRM_OnlineViewUnlistedDCR(Customer VARCHAR,Code VARCHAR,DCRDate VARCHAR,CustomerType VARCHAR)',
              [],
            );
          });
          var _value = [];
          _value = response.data.d;
          //console.log('unlistedViewDCR', _value);
          for (var j = 0; j < _value.length; j++) {
            const array = _value[j];
            let sql =
              'INSERT INTO CRM_OnlineViewUnlistedDCR(Customer,Code,DCRDate,CustomerType) VALUES (?,?,?,?)';
            let params = [
              array.Customer,
              array.Code,
              array.DCRDate,
              array.CustomerType,
            ]; //storing user data in an array
            db.executeSql(sql, params);
          }
        })
        .catch(function (error) {
          Alert.alert(error);
        });
    }
  };

  const tourdateCheck = async (businessID, month, year, idEmp) => {
    const url =
      BASE_URL +
      'TourProgram/List?Businessid=' +
      businessID +
      '&Month=' +
      month +
      '&Year=' +
      year +
      '&IDEmployee=' +
      idEmp;
    console.log('tourdateCheck', url);
    let result = await fetch(url);
    result = await result.json();

    //CREATE TABLE for CRM_TourPlanDate
    db.transaction(txn => {
      txn.executeSql('DROP TABLE IF EXISTS CRM_TourPlanDate', []);
      txn.executeSql(
        'CREATE TABLE IF NOT EXISTS CRM_TourPlanDate(TourDate VARCHAR,Approved VARCHAR)',
        [],
      );
    });

    //SQLITE INSERT CRM_TourPlanDate
    var _value = [];
    _value = result;
    //console.log(_value);
    for (var j = 0; j < _value.length; j++) {
      const array = _value[j];
      let sql = 'INSERT INTO CRM_TourPlanDate(TourDate,Approved) VALUES (?,?)';
      let params = [array.TourDate, array.Approved]; //storing user data in an array
      db.executeSql(sql, params);
    }
  };

  const fetchQuizModules = async (businessID, IDEmployee) => {
    try {
      const url =
        BASE_URL +
        'user/MobileSubMenuList?Businessid=' +
        businessID +
        '&IDEmployee=' +
        IDEmployee +
        '&Module=SURVEY';
      const response = await axios.get(url);
      const dashBoardJsonArray = response.data;
      //CREATE TABLE for CRM_TourPlanDate
      db.transaction(txn => {
        txn.executeSql('DROP TABLE IF EXISTS SURVEYModuleData', []);
        txn.executeSql(
          'CREATE TABLE IF NOT EXISTS SURVEYModuleData(SubMenu VARCHAR,SubMenuSRL VARCHAR)',
          [],
        );
      });

      //SQLITE INSERT CRM_TourPlanDate
      var _value = [];
      _value = dashBoardJsonArray;
      //console.log(_value);
      for (var j = 0; j < _value.length; j++) {
        const array = _value[j];
        let sql =
          'INSERT INTO SURVEYModuleData(SubMenu,SubMenuSRL) VALUES (?,?)';
        let params = [array.SubMenu, array.SubMenuSRL]; //storing user data in an array
        db.executeSql(sql, params);
      }
    } catch (error) {
      console.error('Failed to fetch modules:', error);
    }
  };

  const fetchMasterModules = async (businessID, IDEmployee) => {
    try {
      const url =
        BASE_URL +
        'user/MobileSubMenuList?Businessid=' +
        businessID +
        '&IDEmployee=' +
        IDEmployee +
        '&Module=MASTER';
      const response = await axios.get(url);
      const dashBoardJsonArray = response.data;
      //CREATE TABLE for CRM_TourPlanDate
      db.transaction(txn => {
        txn.executeSql('DROP TABLE IF EXISTS MasterModuleData', []);
        txn.executeSql(
          'CREATE TABLE IF NOT EXISTS MasterModuleData(SubMenu VARCHAR,SubMenuSRL VARCHAR)',
          [],
        );
      });

      //SQLITE INSERT CRM_TourPlanDate
      var _value = [];
      _value = dashBoardJsonArray;
      //console.log(_value);
      for (var j = 0; j < _value.length; j++) {
        const array = _value[j];
        let sql =
          'INSERT INTO MasterModuleData(SubMenu,SubMenuSRL) VALUES (?,?)';
        let params = [array.SubMenu, array.SubMenuSRL]; //storing user data in an array
        db.executeSql(sql, params);
      }
    } catch (error) {
      console.error('Failed to fetch modules:', error);
    }
  };

  const fetchDCRModules = async (businessID, IDEmployee) => {
    try {
      const url =
        BASE_URL +
        'user/MobileSubMenuList?Businessid=' +
        businessID +
        '&IDEmployee=' +
        IDEmployee +
        '&Module=DCR';
      const response = await axios.get(url);
      const dashBoardJsonArray = response.data;
      //CREATE TABLE for CRM_TourPlanDate
      db.transaction(txn => {
        txn.executeSql('DROP TABLE IF EXISTS DCRModuleData', []);
        txn.executeSql(
          'CREATE TABLE IF NOT EXISTS DCRModuleData(SubMenu VARCHAR,SubMenuSRL VARCHAR)',
          [],
        );
      });

      //SQLITE INSERT CRM_TourPlanDate
      var _value = [];
      _value = dashBoardJsonArray;
      //console.log(_value);
      for (var j = 0; j < _value.length; j++) {
        const array = _value[j];
        let sql = 'INSERT INTO DCRModuleData(SubMenu,SubMenuSRL) VALUES (?,?)';
        let params = [array.SubMenu, array.SubMenuSRL]; //storing user data in an array
        db.executeSql(sql, params);
      }
    } catch (error) {
      console.error('Failed to fetch modules:', error);
    }
  };

  const fetchModules = (businessID, useDesig) => {
    NetInfo.fetch().then(async state => {
      if (state.isConnected) {
        if (useDesig !== 'DY_ZSM' && useDesig !== 'ZSM') {
          try {
            const url =
              BASE_URL + 'user/MobileModuleList?Businessid=' + businessID;
            const response = await axios.get(url);
            setModules(response.data);
            console.log('if', url);
            console.warn('if', url);
            const dashBoardJsonArray = response.data;

            //CREATE TABLE for CRM_TourPlanDate
            db.transaction(txn => {
              txn.executeSql('DROP TABLE IF EXISTS DashboardData', []);
              txn.executeSql(
                'CREATE TABLE IF NOT EXISTS DashboardData(Module VARCHAR,IDMenu VARCHAR,MainModuleSRL VARCHAR)',
                [],
              );
            });

            //SQLITE INSERT CRM_TourPlanDate
            var _value = [];
            _value = dashBoardJsonArray;
            //console.log(_value);
            for (var j = 0; j < _value.length; j++) {
              const array = _value[j];
              let sql =
                'INSERT INTO DashboardData(Module,IDMenu,MainModuleSRL) VALUES (?,?,?)';
              let params = [array.Module, array.IDMenu, array.MainModuleSRL]; //storing user data in an array
              db.executeSql(sql, params);
            }
          } catch (error) {
            console.error('Failed to fetch modules: fetchModules', error);
          }
        } else {
          try {
            const url =
              BASE_URL + 'user/MobileModuleList?Businessid=' + businessID;
            const response = await axios.get(url);
            setModules(response.data);
            console.log('else', url);
            console.warn('else', url);
            const dashBoardJsonArray = response.data;

            //CREATE TABLE for CRM_TourPlanDate
            db.transaction(txn => {
              txn.executeSql('DROP TABLE IF EXISTS DashboardData', []);
              txn.executeSql(
                'CREATE TABLE IF NOT EXISTS DashboardData(Module VARCHAR,IDMenu VARCHAR,MainModuleSRL VARCHAR)',
                [],
              );
            });

            //SQLITE INSERT CRM_TourPlanDate
            var _value = [];
            _value = dashBoardJsonArray;
            //console.log(_value);
            for (var j = 0; j < _value.length; j++) {
              const array = _value[j];
              let sql =
                'INSERT INTO DashboardData(Module,IDMenu,MainModuleSRL) VALUES (?,?,?)';
              let params = [array.Module, array.IDMenu, array.MainModuleSRL]; //storing user data in an array
              db.executeSql(sql, params);
            }
          } catch (error) {
            console.error('Failed to fetch modules:', error);
          }
        }
      } else {
        if (useDesig !== 'DY_ZSM' && useDesig !== 'ZSM') {
          db.transaction(tx => {
            tx.executeSql(
              'SELECT Module, IDMenu, MainModuleSRL FROM DashboardData',
              [],
              (tx, results) => {
                const rows = results.rows;
                let temp = [];

                for (let i = 0; i < rows.length; i++) {
                  temp.push(rows.item(i));
                }
                console.log('Hi ' + temp);

                setModules(temp);
              },
              error => {
                console.log('Error fetching modules: ', error);
              },
            );
          });
        } else {
          db.transaction(tx => {
            tx.executeSql(
              'SELECT Module, IDMenu, MainModuleSRL FROM DashboardData',
              [],
              (tx, results) => {
                const rows = results.rows;
                let temp = [];

                for (let i = 0; i < rows.length; i++) {
                  temp.push(rows.item(i));
                }
                console.log('Hello ' + temp);

                setModules(temp);
              },
              error => {
                console.log('Error fetching modules: ', error);
              },
            );
          });
        }
      }
    }, []);
  };

  const checkCompanyValidation = async businessID => {
    try {
      const response = await fetch(
        BASE_URL + 'login/CheckCompanyValidation?Businessid=' + businessID,
      );
      const data = await response.json();

      if (data.result === '') {
        console.log('✅ Success');
      } else {
        console.log('❌ Failed:', data.result);
        try {
          await AsyncStorage.clear();
          navigation.navigate('LogIn');
          //setModalVisible(false);
        } catch (error) {
          console.log(error);
        }
      }
    } catch (error) {
      console.error('Error calling API:', error);
    }
  };

  const checkStartDayCheck = async (businessID, idEmp, date) => {
    try {
      const response = await fetch(
        BASE_URL +
          'DCR/LockDCR/StartDayCheck/StayCheck/TourProgramList?Businessid=' +
          businessID +
          '&IDEmployee=' +
          idEmp +
          '&CurrentDate=' +
          date,
      );
      const json = await response.json();
      setData(json);
      console.log('StartDayCheck', json);
      const isLockDcrEmpty = json.LockDCR === '';
      const isStartDayStarted = json?.StartDayCheck?.message === 'STARTED';
      const isNotStartDayStarted =
        json?.StartDayCheck?.message === 'NOTSTARTED';
      const isStayCheckFalse = json.StayCheck === 'False';

      // ✅ Check all conditions
      if (isLockDcrEmpty && isStartDayStarted && isStayCheckFalse) {
        navigation.navigate('AppNavDCRScreen');
      } else if (isLockDcrEmpty && isNotStartDayStarted && isStayCheckFalse) {
        navigation.navigate('DCR Session');
      } else {
        Alert.alert(
          'LockDCR: ' +
            `${isLockDcrEmpty}` +
            ' ' +
            'StartDayCheck: ' +
            `${isStartDayStarted}` +
            ' ' +
            'StartDayCheck: ' +
            `${isNotStartDayStarted}` +
            ' ' +
            'StayCheck: ' +
            `${isStayCheckFalse}`,
        );
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({item}) => (
    <TouchableOpacity onPress={() => submit(item)}>
      <View style={[styles.menu, {backgroundColor: '#ecf0f1'}]}>
        <HomeImg
          height={30}
          width={30}
          style={styles.imageDesign}
          // style={{transform: [{rotate: '-5deg'}]}}
        />
        <Text style={styles.menuItem}>{item.Module}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#33767C" />
      </View>
    );
  }
const submit = async module => {
    switch (module.Module) {
      case 'TOUR PROGRAM':
        NetInfo.fetch().then(state => {
          if (state.isConnected) {
            //navigation.navigate('Quiz Dashboard');
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{name: 'Tour Plan Submission'}], // or whatever your main screen is
              }),
            );
          } else {
            Alert.alert('Internet Is Required!');
            // navigation.dispatch(
            //   CommonActions.reset({
            //     index: 0,
            //     routes: [{name: 'AppNavScreen'}], // or whatever your main screen is
            //   }),
            // );
          }
        });
        break;
      case 'DCR':
        if (useMobileAccess === 'ONLINE') {
          NetInfo.fetch().then(state => {
            if (state.isConnected) {
              if (useAdminAcess === true) {
                navigation.dispatch(
                  CommonActions.reset({
                    index: 0,
                    routes: [{name: 'DcrAdminDashBoard'}], // or whatever your main screen is
                  }),
                );
              } else {
                //checkDCRData();
                checkStartDayCheck();
              }
              //checkStartDay();
            } else {
              Alert.alert('Contact With Administrator!');
            }
          }, []);
        } else if (useMobileAccess === 'ONLINE & OFFLINE') {
          NetInfo.fetch().then(state => {
            if (state.isConnected) {
              //checkStartDay();
              if (useAdminAcess === true) {
                //Alert.alert('Admin!');
                navigation.dispatch(
                  CommonActions.reset({
                    index: 0,
                    routes: [{name: 'DcrAdminDashBoard'}], // or whatever your main screen is
                  }),
                );
              } else {
                //checkDCRData();
                checkStartDayCheck();
              }
            } else {
              if (useAdminAcess === true) {
                Alert.alert('No Internet Connection! Admin!');
              }
              // else {
              //   if (useManagerAccess === true) {
              //     db.transaction(tx => {
              //       // Execute a query to retrieve table information
              //       tx.executeSql(
              //         //"SELECT name FROM sqlite_master WHERE type='table' AND name='CRM_StartDay'",
              //         "SELECT name FROM sqlite_master WHERE type='table' AND name='CRM_ManagerStartDayDummy'",
              //         [],
              //         (tx, results) => {
              //           // Check if any rows are returned
              //           if (results.rows.length > 0) {
              //             db.transaction(tx => {
              //               tx.executeSql(
              //                 'SELECT * FROM CRM_ManagerStartDayDummy where StartDate=?',
              //                 [cdate],
              //                 (tx, results) => {
              //                   // Check if there are rows in the result set
              //                   if (results.rows.length > 0) {
              //                     console.log('Table has data');
              //                     //navigation.navigate('AppNavDCRScreen');
              //                     navigation.dispatch(
              //                       CommonActions.reset({
              //                         index: 0,
              //                         routes: [{name: 'AppNavDCRScreen'}], // or whatever your main screen is
              //                       }),
              //                     );
              //                   } else {
              //                     console.log('Table is empty');
              //                     //navigation.navigate('DCR Session');
              //                     Alert.alert(
              //                       'Start Your Day By Connecting Internet.',
              //                     );
              //                     // navigation.dispatch(
              //                     //   CommonActions.reset({
              //                     //     index: 0,
              //                     //     routes: [{name: 'AppNavScreen'}], // or whatever your main screen is
              //                     //   }),
              //                     // );
              //                   }
              //                 },
              //                 error =>
              //                   console.error(
              //                     'Error executing SELECT query: ',
              //                     error,
              //                   ),
              //               );
              //             });
              //           } else {
              //             // Table does not exist
              //             //console.warn('Table does not exists');
              //             //navigation.navigate('DCR Session');
              //             Alert.alert('Start Your Day By Connecting Internet.');
              //             // navigation.dispatch(
              //             //   CommonActions.reset({
              //             //     index: 0,
              //             //     routes: [{name: 'AppNavScreen'}], // or whatever your main screen is
              //             //   }),
              //             // );
              //           }
              //         },
              //         error => {
              //           // Error occurred while executing the query
              //           console.log(error);
              //         },
              //       );
              //     });
              //   } 
              //   else {
              //     // console.log(ctdate);
              //     db.transaction(tx => {
              //       tx.executeSql(
              //         // 'SELECT * FROM CRM_ManagerStartDay where StartDate=?',
              //         'SELECT * FROM CRM_offlinePendingDCRDate',
              //         [],

              //         (tx, results) => {
              //           // Check if there are rows in the result set
              //           if (results.rows.length > 0) {
              //             console.log('Table has data');
              //             Alert.alert(
              //               'Go to Reports and clear your pending DCR',
              //             );
              //           } else {
              //             console.log('Table is empty');
              //             db.transaction(tx => {
              //               // Execute a query to retrieve table information
              //               tx.executeSql(
              //                 "SELECT name FROM sqlite_master WHERE type='table' AND name='Stay_Table'",
              //                 [],
              //                 (tx, results) => {
              //                   // Check if any rows are returned
              //                   if (results.rows.length > 0) {
              //                     // Table exists
              //                     console.warn('Stay_Table exists');
              //                     db.transaction(tx => {
              //                       tx.executeSql(
              //                         // 'SELECT * FROM CRM_ManagerStartDay where StartDate=?',
              //                         'SELECT * FROM Stay_Table where StayDate=?',
              //                         [cdate],
              //                         (tx, results) => {
              //                           // Check if there are rows in the result set
              //                           if (results.rows.length > 0) {
              //                             console.log('Table has data');
              //                             Alert.alert(
              //                               useEmpname +
              //                                 ' stay already exist on this date : ' +
              //                                 cdate,
              //                             );
              //                           } else {
              //                             console.log('Table is empty');
              //                             chectTourPlanData();
              //                           }
              //                         },
              //                         error =>
              //                           console.error(
              //                             'Error executing SELECT query: ',
              //                             error,
              //                           ),
              //                       );
              //                     });
              //                   } else {
              //                     // Table does not exist
              //                     console.warn('Stay_Table does not exists');
              //                     chectTourPlanData();
              //                   }
              //                 },
              //                 error => {
              //                   // Error occurred while executing the query
              //                   Alert.alert(error);
              //                 },
              //               );
              //             });
              //           }
              //         },
              //         error =>
              //           console.error('Error executing SELECT query: ', error),
              //       );
              //     });
              //   }
              // }
              else {
                if (useManagerAccess === true) {
                  db.transaction(tx => {
                    // Execute a query to retrieve table information
                    tx.executeSql(
                      "SELECT name FROM sqlite_master WHERE type='table' AND name='CRM_ManagerStartDayDummy'",
                      [],
                      (tx, results) => {
                        // Check if any rows are returned
                        if (results.rows.length > 0) {
                          db.transaction(tx => {
                            tx.executeSql(
                              'SELECT * FROM CRM_ManagerStartDayDummy where StartDate=?',
                              [cdate],
                              (tx, results) => {
                                // Check if there are rows in the result set
                                if (results.rows.length > 0) {
                                  console.log('Table has data');
                                  navigation.dispatch(
                                    CommonActions.reset({
                                      index: 0,
                                      routes: [{name: 'AppNavDCRScreen'}], // or whatever your main screen is
                                    }),
                                  );
                                } else {
                                  console.log('Table is empty');
                                  Alert.alert(
                                    'Start Your Day By Connecting Internet.',
                                  );
                                }
                              },
                              error =>
                                console.error(
                                  'Error executing SELECT query: ',
                                  error,
                                ),
                            );
                          });
                        } else {
                          Alert.alert('Start Your Day By Connecting Internet.');
                        }
                      },
                      error => {
                        // Error occurred while executing the query
                        console.log(error);
                      },
                    );
                  });
                }
                else {
                  // console.log(ctdate);
                  db.transaction(tx => {
                    tx.executeSql(
                      // 'SELECT * FROM CRM_ManagerStartDay where StartDate=?',
                      'SELECT * FROM CRM_offlinePendingDCRDate',
                      [],

                      (tx, results) => {
                        // Check if there are rows in the result set
                        if (results.rows.length > 0) {
                          console.log('Table has data');
                          Alert.alert(
                            'Go to Reports and clear your pending DCR',
                          );
                        } else {
                          console.log('Table is empty');
                          db.transaction(tx => {
                            // Execute a query to retrieve table information
                            tx.executeSql(
                              "SELECT name FROM sqlite_master WHERE type='table' AND name='Stay_Table'",
                              [],
                              (tx, results) => {
                                // Check if any rows are returned
                                if (results.rows.length > 0) {
                                  // Table exists
                                  console.warn('Stay_Table exists');
                                  db.transaction(tx => {
                                    tx.executeSql(
                                      // 'SELECT * FROM CRM_ManagerStartDay where StartDate=?',
                                      'SELECT * FROM Stay_Table where StayDate=?',
                                      [cdate],
                                      (tx, results) => {
                                        // Check if there are rows in the result set
                                        if (results.rows.length > 0) {
                                          console.log('Table has data');
                                          Alert.alert(
                                            useEmpname +
                                              ' stay already exist on this date : ' +
                                              cdate,
                                          );
                                        } else {
                                          console.log('Table is empty');
                                          chectTourPlanData();
                                        }
                                      },
                                      error =>
                                        console.error(
                                          'Error executing SELECT query: ',
                                          error,
                                        ),
                                    );
                                  });
                                } else {
                                  // Table does not exist
                                  console.warn('Stay_Table does not exists');
                                  chectTourPlanData();
                                }
                              },
                              error => {
                                // Error occurred while executing the query
                                Alert.alert(error);
                              },
                            );
                          });
                        }
                      },
                      error =>
                        console.error('Error executing SELECT query: ', error),
                    );
                  });
                }
              }
            }
          }, []);
        } else {
          Alert.alert('Contact With Administrator!');
        }
        break;
      case 'SETTING':
        NetInfo.fetch().then(state => {
          if (state.isConnected) {
            //navigation.navigate('Quiz Dashboard');
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{name: 'SettingScreen'}], // or whatever your main screen is
                //routes: [{name: 'RX-Survey'}], // or whatever your main screen is
              }),
            );
          } else {
            Alert.alert('Internet Is Required!');
            // navigation.dispatch(
            //   CommonActions.reset({
            //     index: 0,
            //     routes: [{name: 'AppNavScreen'}], // or whatever your main screen is
            //   }),
            // );
          }
        });
        break;
      case 'MASTER':
        if (useManagerAccess === true) {
          // navigation.dispatch(
          //   CommonActions.reset({
          //     index: 0,
          //     routes: [{name: 'AppNavScreen'}], // or whatever your main screen is
          //   }),
          // );
          Alert.alert('You are not authorized');
        } else {
          setLoading(true);
          setTimeout(() => {
            setLoading(false);
          }, 5000);
          //console.warn(useManagerAccess);
          NetInfo.fetch().then(state => {
            if (state.isConnected) {
              //navigation.navigate('Quiz Dashboard');
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{name: 'AppNavMaster'}], // or whatever your main screen is
                }),
              );
            } else {
              //Alert.alert('Internet Is Required!');
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{name: 'AppNavMaster'}], // or whatever your main screen is
                }),
              );
            }
          });
        }
        break;
      case 'REPORTS':
        NetInfo.fetch().then(state => {
          if (state.isConnected) {
            const base =
              useBusinessID.trim() === 'MEND-PVTL-890'
                ? 'https://crmfieldforceui.mendine.co.in/Login/MobileWebAccess'
                : 'https://iecrm.iecsl.in/Login/MobileWebAccess';

            const url = `${base}?BusinessID=${useBusinessID}&email=${useEmpemail}&securitykey=${useSecurityKey}`;
            console.log(url);

            Linking.openURL(url).catch(err =>
              console.error('An error occurred', err),
            );
            // navigation.dispatch(
            //   CommonActions.reset({
            //     index: 0,
            //     routes: [
            //       {
            //         name: 'ReportsWebView',
            //         params: {url},
            //       },
            //     ],
            //   }),
            // );
          } else {
            Alert.alert('Internet Is Required!');
            // navigation.dispatch(
            //   CommonActions.reset({
            //     index: 0,
            //     routes: [{name: 'AppNavScreen'}], // or whatever your main screen is
            //   }),
            // );
          }
        });
        // if (useBusinessID.trim() === 'MEND-PVTL-890') {
        //         const url =
        //           'https://crmfieldforceui.mendine.co.in/Login/MobileWebAccess?BusinessID=' +
        //           useBusinessID +
        //           '&email=' +
        //           useEmpemail +
        //           '&securitykey=' +
        //           useSecurityKey;
        //         console.log(url);

        //         Linking.openURL(url).catch(err =>
        //           console.error('An error occurred', err),
        //         );
        //       } else {
        //         const url =
        //           'https://iecrm.iecsl.in/Login/MobileWebAccess?BusinessID=' +
        //           useBusinessID +
        //           '&email=' +
        //           useEmpemail +
        //           '&securitykey=' +
        //           useSecurityKey;
        //         console.log(url);

        //         Linking.openURL(url).catch(err =>
        //           console.error('An error occurred', err),
        //         );
        //       }

        break;
      case 'ORDER':
        setLoading(true);
        setTimeout(() => setLoading(false), 5000);

        if (['GENI-QST-536', 'DEV-GENI-536'].includes(useBusinessID.trim())) {
          Alert.alert('You are not authorized to access the module');
        } else {
          db.transaction(txn => {
            txn.executeSql('DROP TABLE IF EXISTS CRM_ProductOrder', []);
          });

          NetInfo.fetch().then(state => {
            if (state.isConnected) {
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{name: 'AppNavOrder'}], // or whatever your main screen is
                }),
              );
            } else {
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{name: 'AppNavOrder'}], // or whatever your main screen is
                }),
              );
            }
          });
        }
        break;
      case 'ACTIVITIES':
        if (useBusinessID.trim() === 'GENI-QST-536') {
          Alert.alert('You are not authorized to access the module');
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{name: 'AppNavScreen'}], // or whatever your main screen is
            }),
          );
        } else if (useBusinessID.trim() === 'DEV-GENI-536') {
          Alert.alert('You are not authorized to access the module');
          // navigation.dispatch(
          //   CommonActions.reset({
          //     index: 0,
          //     routes: [{name: 'AppNavScreen'}], // or whatever your main screen is
          //   }),
          // );
        } else {
          NetInfo.fetch().then(async state => {
            if (state.isConnected) {
              if (useDivision === 'MARKETING') {
                navigation.dispatch(
                  CommonActions.reset({
                    index: 0,
                    routes: [{name: 'AppNavActivity'}], // or whatever your main screen is
                  }),
                );
              } else {
                // navigation.dispatch(
                //   CommonActions.reset({
                //     index: 0,
                //     routes: [{name: 'AppNavScreen'}], // or whatever your main screen is
                //   }),
                // );
                Alert.alert('You are not authorized');
              }
            } else {
              Alert.alert('No Internet');
              // navigation.dispatch(
              //   CommonActions.reset({
              //     index: 0,
              //     routes: [{name: 'AppNavScreen'}], // or whatever your main screen is
              //   }),
              // );
            }
          }, []);
        }
        break;
      case 'SURVEY':
        if (['GENI-QST-536', 'DEV-GENI-536'].includes(useBusinessID.trim())) {
          Alert.alert('You are not authorized to access the module');
          // navigation.dispatch(
          //   CommonActions.reset({
          //     index: 0,
          //     routes: [{name: 'AppNavScreen'}], // or whatever your main screen is
          //   }),
          // );
        } else {
          NetInfo.fetch().then(state => {
            if (state.isConnected) {
              //navigation.navigate('Quiz Dashboard');
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{name: 'AppNavQuiz'}], // or whatever your main screen is
                }),
              );
            } else {
              Alert.alert('Internet Is Required!');
              // navigation.dispatch(
              //   CommonActions.reset({
              //     index: 0,
              //     routes: [{name: 'AppNavScreen'}], // or whatever your main screen is
              //   }),
              // );
            }
          });
        }
        break;
      case 'EXPENSE':
        NetInfo.fetch().then(state => {
          if (state.isConnected) {
            setLoading(true);
            setTimeout(() => {
              setLoading(false);
            }, 5000);
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{name: 'AppNavExpense'}], // or whatever your main screen is
              }),
            );
          } else {
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{name: 'AppNavExpense'}], // or whatever your main screen is
              }),
            );
          }
        });
        break;
      case 'SECONDARY STOCK':
        NetInfo.fetch().then(async state => {
          try {
            AsyncStorage.getItem('UserData').then(async value => {
              if (value != null) {
                let user = JSON.parse(value);
                const apiUrl = Sales_URL + 'UserNamePwdcheck';
                const username = user.Empemail;
                const password = user.Password;

                NetInfo.fetch().then(async state => {
                  if (state.isConnected) {
                    try {
                      const response = await fetch(
                        `${apiUrl}?uname=${username}&pwd=${password}`,
                        {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                        },
                      );

                      if (!response.ok) {
                        throw new Error('Network response was not ok');
                      }

                      const jsonData = await response.json();

                      if (Array.isArray(jsonData) && jsonData.length > 0) {
                        const userData = jsonData[0];

                        // Store entire user object
                        await AsyncStorage.setItem(
                          'SalesLogin',
                          JSON.stringify(userData),
                        );
                        setLoading(true);
                        setTimeout(() => {
                          setLoading(false);
                        }, 5000);
                        navigation.dispatch(
                          CommonActions.reset({
                            index: 0,
                            routes: [{name: 'Secondary Closing Stock Entry'}], // or whatever your main screen is
                          }),
                        );
                      } else {
                        Alert.alert(
                          'Login Failed',
                          'Invalid credentials or empty response',
                        );
                      }
                    } catch (error) {
                      console.error('Login error:', error);
                      Alert.alert(
                        'Error',
                        'Failed to login. Please try again.',
                      );
                    }
                  } else {
                    Alert.alert('No Internet');
                    //fetchDashboardFromSQLite(); // fatch the Data From the Sqlite
                  }
                }, []);
              }
            });
          } catch (error) {
            Alert.alert(error);
          }
        });
        break;
      case 'SALES REPORT':
        NetInfo.fetch().then(async state => {
          if (state.isConnected) {
            try {
              setSalesLoading(true);
              const storedUser = await AsyncStorage.getItem('UserData');
              if (!storedUser) {
                setSalesLoading(false);
                Alert.alert('User data not found.');
                return;
              }

              const user = JSON.parse(storedUser);
              const email = user.Empemail;
              const password = user.Password;

              if (!email || !password) {
                setSalesLoading(false);
                Alert.alert(
                  'Missing email or password. Please Logout and Login again.',
                );
                return;
              }

              const apiUrl = `${Sales_URL}UserNamePwdcheck?uname=${email}&pwd=${password}`;

              const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                  Accept: 'application/json',
                  'Content-Type': 'application/json',
                },
              });

              const result = await response.json();
              console.log('SALES REPORT API RESPONSE:', result);

              if (Array.isArray(result) && result.length > 0) {
                const userData = result[0];
                await AsyncStorage.setItem(
                  'UserDataSales',
                  JSON.stringify(userData),
                );
                setSalesLoading(false);

                // ✅ Redirect based on Division
                if (userData.Division?.toUpperCase() === 'ADMIN') {
                  navigation.dispatch(
                    CommonActions.reset({
                      index: 0,
                      routes: [{name: 'ADMIN SALES REPORT'}],
                    }),
                  );
                } else {
                  navigation.dispatch(
                    CommonActions.reset({
                      index: 0,
                      routes: [{name: 'SALES REPORT'}],
                    }),
                  );
                }
              } else {
                setSalesLoading(false);
                Alert.alert('Invalid response from server.');
              }
            } catch (error) {
              setSalesLoading(false);
              console.error('Sales Login Error:', error);
              Alert.alert('Error while logging into Sales Report.');
            }
          } else {
            Alert.alert('Internet Is Required!');
          }
        });
        break;
      case 'DPC':
        NetInfo.fetch().then(async state => {
          if (state.isConnected) {
            // navigation.dispatch(
            //   CommonActions.reset({
            //     index: 0,
            //     routes: [{name: 'AppNavDPC'}], // or whatever your main screen is
            //   }),
            // );
            navigation.navigate('AppNavDPC');
          } else {
            Alert.alert('No Internet');
            //fetchDashboardFromSQLite(); // fatch the Data From the Sqlite
          }
        }, []);
        break;
      case 'RX SURVEY':
        NetInfo.fetch().then(async state => {
          if (state.isConnected) {
            // navigation.dispatch(
            //   CommonActions.reset({
            //     index: 0,
            //     routes: [{name: 'AppNavDPC'}], // or whatever your main screen is
            //   }),
            // );
            navigation.navigate('RX-Survey');
          } else {
            Alert.alert('No Internet');
            //fetchDashboardFromSQLite(); // fatch the Data From the Sqlite
          }
        }, []);
        break;
      case 'LEAVE':
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{name: 'approvalDashboard'}], // or whatever your main screen is
          }),
        );
        // navigation.dispatch(
        //   CommonActions.reset({
        //     index: 0,
        //     routes: [{name: 'Test GPS'}], // or whatever your main screen is
        //   }),
        // );
        break; // The break should be inside the case block
      default:
        Alert.alert('Working On');
    }
  };

  const BirthdayRenderItem = ({item}) => {
    // 🔹 Find closest 3 birthdays (sorted)
    const topThree = birthdays
      .map(b => ({
        ...b,
        daysLeft:
          new Date(new Date(b.DOB).setFullYear(new Date().getFullYear())) <
          new Date()
            ? Math.ceil(
                (new Date(
                  new Date(b.DOB).setFullYear(new Date().getFullYear() + 1),
                ) -
                  new Date()) /
                  (1000 * 60 * 60 * 24),
              )
            : Math.ceil(
                (new Date(
                  new Date(b.DOB).setFullYear(new Date().getFullYear()),
                ) -
                  new Date()) /
                  (1000 * 60 * 60 * 24),
              ),
      }))
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 3);

    // 🔹 Skip rendering if item not in top 3
    if (!topThree.find(b => b.Employee === item.Employee)) {
      return null;
    }

    const daysUntil = getDaysUntilBirthday(item.DOB);

    return (
      <View style={styles.BirthdayCard}>
        {/* Foreground content */}
        <View style={styles.cardContent}>
          {item.ProfilePicPath ? (
            <Image
              source={{uri: `${url}/${item.ProfilePicPath}`}}
              style={styles.avatar}
              resizeMode="cover"
            />
          ) : (
            <Ionicons name="person-circle-outline" size={60} color="#ccc" />
          )}

          <View style={styles.info}>
            <Text style={styles.name}>{item.Employee}</Text>
            <Text style={styles.detail}>
              {item.Designation} • {item.Division}
            </Text>
            <Text style={styles.dob}>🎂 {item.FormattedDOB}</Text>
            {/* <Text style={styles.dob}>({daysUntil})</Text> */}
            <Text style={styles.detail}>Phone : {item.Phone || 'N/A'}</Text>
          </View>

          {/* ✅ Show Wish button only if Phone exists AND it's Today */}
          {item.Phone && daysUntil === '🎉 Today' ? (
            <TouchableOpacity
              style={styles.whatsappButton}
              onPress={() => onWish(item)}>
              <View style={styles.iconContainerBirthday}>
                <Ionicons name="logo-whatsapp" size={20} color="#fff" />
              </View>
              <Text style={styles.whatsappText}>
                Wish {item.Gender === 'FEMALE' ? 'Her' : 'Him'}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.noPhoneContainer}>
              <Text style={styles.noPhoneText}>
                {daysUntil === '🎉 Today'
                  ? 'No Phone \nNumber Available'
                  : `Wish ${daysUntil}`}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const NoticeBoardRenderItem = ({item}) => {
    return (
      <View style={styles.noticeCard}>
        {/* Card Content */}
        <View style={styles.cardContent}>
          {/* Left Icon */}
          <Ionicons
            name="paper-plane-outline"
            size={40}
            color="#3b82f6"
            style={{marginRight: 12}}
          />

          {/* Info Section */}
          <View style={styles.noticeInfo}>
            <Text style={{fontSize: 14, fontWeight: 'bold', color: '#222222'}}>
              {item.ShortNotice}
            </Text>
            <Text
              style={{fontSize: 13, color: '#555555', marginVertical: 4}}
              numberOfLines={3}>
              {item.LongNotice}
            </Text>
            <Text style={{fontSize: 13, color: '#3b82f6', fontWeight: '600'}}>
              {item.NoticeDate} • By {item.Employee}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        paddingBottom: insets.bottom, // prevents overlap with system navigation bar
      }}>
      <StatusBar
        translucent={true}
        backgroundColor="transparent"
        barStyle="dark-content" // or 'light-content' depending on your theme
      />
      {salesLoading && (
        <View style={styles.loaderOverlay}>
          <ActivityIndicator size="large" color="#005696" />
          <Text style={styles.Lodertext}>Loading Sale Data....</Text>
        </View>
      )}
      <View style={{marginLeft: 10, marginRight: 10, marginTop: 10}}>
        <CustomViewMaster
          selectionMode={1}
          option1="Module"
          option2="Dashboard"
          onSelectSwitch={onSelectSwitch}
        />
      </View>
      {gamesTab === 1 ? (
        <View style={styles.container}>
          {!netState.isConnected && (
            <Text style={styles.warningText}>No Internet connection!</Text>
          )}
          {netState.isConnected && isPoorConnection && (
            // <Text style={styles.warningText}>Poor Internet connection!</Text>
            <Text style={styles.warningText}></Text>
          )}
          <CRMImg height={100} width={100} />

          <FlatList
            data={modules}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderItem}
            numColumns={2}
            contentContainerStyle={styles.list}
          />
        </View>
      ) : (
        <ScrollView
          style={{flex: 1, paddingHorizontal: 10}}
          contentContainerStyle={{paddingBottom: 30}}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }>
          <View style={styles.container}>
            {!netState.isConnected && (
              <Text style={styles.warningText}>
                No Internet connection! & No Data Found!
              </Text>
            )}
            {/* <Text style={styles.noData}>No Data Found</Text> */}
            <View style={styles.row}>
              <DashboardCard
                title="RCPA AVG"
                count={avgDashboardData.RCPAAvg}
                backgroundColor="#ffb74d"
              />
              <DashboardCard
                title="POB"
                count={avgDashboardData.POB}
                backgroundColor="#81c784"
              />
            </View>
            <View style={styles.row}>
              <DashboardCard
                title="DCR Doctor"
                count={todayDashboardData.DCRDoctors}
                backgroundColor="#64b5f6"
              />
              <DashboardCard
                title="DCR Party"
                count={todayDashboardData.DCRParties}
                backgroundColor="#ba68c8"
              />
            </View>
            <View style={styles.row}>
              <DashboardCard
                title="DCA"
                count={avgDashboardData.DCall}
                //backgroundColor="#1ff2be"
                backgroundColor="#097969"
              />
              <DashboardCard
                title="RCA"
                count={avgDashboardData.RCall}
                backgroundColor="#fa623c"
              />
            </View>

            {DoctorVisitFrequency.length > 0 && (
              <>
                <Text
                  style={{
                    fontSize: 16,
                    //fontWeight: 'bold',
                    fontFamily: 'Roboto-Medium',
                    marginTop: 20,
                    marginBottom: 10,
                  }}>
                  📊 Doctor Visit Frequency (By Day of Month)
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                  <View style={{padding: 10}}>
                    <BarChart
                      data={barData}
                      barWidth={25}
                      spacing={10}
                      initialSpacing={5}
                      showValuesOnTopOfBars={true}
                      roundedTop
                      showGradient
                      isAnimated
                      noOfSections={5}
                      maxValue={50}
                      height={250}
                      width={screenWidth - 32}
                      yAxisColor="#ccc"
                      xAxisColor="#ccc"
                      xAxisLabelTextStyle={{color: '#444', fontSize: 12}}
                      yAxisTextStyle={{color: '#444', fontSize: 10}}
                    />
                  </View>
                </ScrollView>

                <Text
                  style={{
                    fontSize: 16,
                    //fontWeight: 'bold',
                    fontFamily: 'Roboto-Medium',
                    marginTop: 20,
                    marginBottom: 10,
                  }}>
                  📊 Party Visit Frequency (By Day of Month)
                </Text>

                <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                  <View style={{padding: 10}}>
                    <BarChart
                      data={chartDataretailer}
                      barWidth={25}
                      spacing={10}
                      initialSpacing={5}
                      showValuesOnTopOfBars={true}
                      roundedTop
                      showGradient
                      isAnimated
                      noOfSections={5}
                      maxValue={100}
                      height={250}
                      width={screenWidth - 32}
                      yAxisColor="#ccc"
                      xAxisColor="#ccc"
                      xAxisLabelTextStyle={{color: '#444', fontSize: 12}}
                      yAxisTextStyle={{color: '#444', fontSize: 10}}
                    />
                  </View>
                </ScrollView>
              </>
            )}

            {/* 🔹 BirthDay List Section */}
            <View
              style={{
                flex: 1,
                backgroundColor: '#ffffff',
                padding: 10,
                marginTop: 20,
              }}>
              {/* 🔹 Header Row with Title + See All */}
              <View
                style={{
                  //flexDirection: "row",
                  // justifyContent: "space-between",
                  // alignItems: "center",
                  marginBottom: 10,
                  backgroundColor: '#ffffff',
                  borderRadius: 12,
                  padding: 10,
                  shadowColor: '#000',
                  shadowOffset: {width: 0, height: 4},
                  shadowOpacity: 0.2,
                  shadowRadius: 6,
                  elevation: 5, // Android shadow
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                  <Text style={{fontSize: 16, fontWeight: 'bold'}}>
                    Upcoming BirthDays
                  </Text>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('BirthDay List')}>
                    <Text
                      style={{fontSize: 14, color: 'blue', fontWeight: '600'}}>
                      See All
                    </Text>
                  </TouchableOpacity>
                </View>
                {/* 🔹 Birthday list inside a 3D Card */}
                <FlatList
                  data={birthdays}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={BirthdayRenderItem}
                  contentContainerStyle={{paddingBottom: 10}}
                />
              </View>
            </View>

            {/* 🔹 Notice Board Section */}

            <View
              style={{
                flex: 1,
                backgroundColor: '#ffffff',
                padding: 10,
                marginTop: 20,
              }}>
              {/* 🔹 Header Row with Title + See All */}
              <View
                style={{
                  marginBottom: 10,
                  backgroundColor: '#ffffff',
                  borderRadius: 12,
                  padding: 10,
                  shadowColor: '#000',
                  shadowOffset: {width: 0, height: 4},
                  shadowOpacity: 0.2,
                  shadowRadius: 6,
                  elevation: 5, // Android shadow
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                  <Text style={{fontSize: 16, fontWeight: 'bold'}}>
                    Notice Board
                  </Text>
                  {/* <TouchableOpacity onPress={() => navigation.navigate("NoticeBoardList")}> */}
                  {/* <Text style={{ fontSize: 14, color: "blue", fontWeight: "600" }}>
                    See All
                  </Text> */}
                  {/* </TouchableOpacity> */}
                </View>

                {/* 🔹 NoticeBoard list inside a 3D Card */}
                <FlatList
                  data={noticeboard}
                  keyExtractor={item => item.IDNotice.toString()}
                  renderItem={({item}) => <NoticeBoardRenderItem item={item} />}
                  contentContainerStyle={{paddingBottom: 10}}
                />
              </View>
            </View>
          </View>
        </ScrollView>
      )}
      <Modal
        transparent={true}
        animationType="fade"
        visible={isModalVisible}
        onRequestClose={toggleModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* <View style={styles.iconContainer}>
                    <Text style={styles.errorIcon}>✖</Text>
                  </View>
                  <Text style={styles.modalTitle}>Error</Text> */}
            <Text style={styles.modalMessage}>
              {useModalMessage}.Go to Reports and clear your pending DCR.
            </Text>
            <TouchableOpacity onPress={toggleModal} style={styles.okButton}>
              <Text style={styles.okButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <ProgressDialog visible={loading} message="Please Wait..." />
      {/* 🟢 ChatBot Icon Floating */}
      <TouchableOpacity
        style={[styles.chatIcon, {bottom: insets.bottom + 14}]}
        onPress={() => setChatVisible(true)}>
        <AntDesign name="message1" size={28} color="white" />
      </TouchableOpacity>
      {/* 💬 ChatBot Modal */}
      <Modal
        visible={chatVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setChatVisible(false)}>
        <View style={styles.chatModalWrapper}>
          <View
            style={[
              styles.chatModal,
              {height: isKeyboardVisible ? '80%' : '50%'},
            ]}>
            {/* Header */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 10,
              }}>
              <Text style={{fontWeight: 'bold', fontSize: 16}}>
                🤖 H.A.R.U.
              </Text>
              <TouchableOpacity onPress={() => setChatVisible(false)}>
                <Text style={{fontSize: 18, color: 'red'}}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Messages */}
            <ScrollView
              ref={scrollViewRef}
              style={styles.chatBox}
              contentContainerStyle={{paddingBottom: 10}}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={() =>
                scrollViewRef.current?.scrollToEnd({animated: true})
              }>
              {chatMessages.map((msg, i) => (
                <Text
                  key={i}
                  style={
                    msg.sender === 'user' ? styles.userMsg : styles.botMsg
                  }>
                  {msg.sender === 'user' ? '🧑: ' : '🤖: '}
                  {msg.text}
                </Text>
              ))}
              {isTyping && (
                <Text
                  style={{
                    color: 'gray',
                    fontStyle: 'italic',
                    marginVertical: 8,
                  }}>
                  🤖 H.A.R.U is typing...
                </Text>
              )}
            </ScrollView>

            {/* Input Row */}
            <View style={styles.inputRow}>
              <TextInput
                style={styles.chatInput}
                value={chatInput}
                onChangeText={setChatInput}
                placeholder="Type a message"
              />
              <TouchableOpacity onPress={handleSendChat} style={styles.sendBtn}>
                <Text style={{color: 'white'}}>Send</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={startListening} style={styles.micBtn}>
                <Text style={{color: 'white'}}>
                  {isListening ? '🎙️' : '🎤'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
 
}

export default CRMDashBoardNew

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  menu: {
    margin: 5,
    padding: 5,
    width: 150,
    height: 130,
    elevation: 5,
    borderRadius: 5,
  },
  warningText: {
    color: 'red',
    fontSize: 18,
    marginBottom: 10,
    fontFamily: 'Lato-Regular',
  },

  menuItem: {
    fontSize: 16,
    fontFamily: 'Lato-Regular',
    color: '#000',
    margin: 5,
    padding: 5,
    textAlignVertical: 'center',
    textAlign: 'center',
    alignItems: 'center', // Centered horizontally
  },
  imageDesign: {
    width: 40,
    height: 40,
    marginTop: 15,
    padding: 5,
    justifyContent: 'center', //Centered vertically
    alignSelf: 'center', // Centered horizontally
  },
  card: {
    height: 150,
    width: Dimensions.get('window').width,
    padding: 5,
    backgroundColor: '#fff',
    elevation: 5,
    justifyContent: 'center', //Centered vertically
    alignItems: 'center', // Centered horizontally
  },

  gridView: {
    marginTop: 10,
    flex: 1,
    color: '',
  },
  itemContainer: {
    justifyContent: 'flex-end',
    borderRadius: 5,
    padding: 10,
    height: 150,
  },
  itemName: {
    fontSize: 16,
    color: '#000',
    fontWeight: '600',
  },
  itemCode: {
    fontWeight: '600',
    fontSize: 12,
    color: '#fff',
  },

  button: {
    backgroundColor: '#6200ee',
    padding: 15,
    borderRadius: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: 300,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 10,
    elevation: 5,
  },
  iconContainer: {
    backgroundColor: '#fbe4e4',
    borderRadius: 50,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  errorIcon: {
    fontSize: 30,
    color: '#ff5252',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  okButton: {
    backgroundColor: '#00796b',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 5,
  },
  okButtonText: {
    color: '#ffffff',
    fontSize: 16,
  },
  chatIcon: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#007aff',
    padding: 15,
    borderRadius: 30,
    elevation: 5,
    zIndex: 1000,
  },

  chatModalWrapper: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },

  chatModal: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 15,
    //height: '50%',
  },

  chatBox: {
    flex: 1,
    marginVertical: 5,
  },

  userMsg: {
    textAlign: 'right',
    color: '#007aff',
    marginVertical: 4,
  },

  botMsg: {
    textAlign: 'left',
    color: '#34c759',
    marginVertical: 4,
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  chatInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginRight: 10,
  },

  sendBtn: {
    backgroundColor: '#007aff',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  micBtn: {
    backgroundColor: '#ff8c00',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 5,
  },
  noData: {
    fontFamily: 'Roboto-BoldItalic',
    fontSize: 18,
    color: '#FF0000',
    textAlign: 'center',
    marginTop: 20,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
  },
  card: {
    backgroundColor: '#e3f2fd',
    flex: 0.48,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4,
    elevation: 3,
    marginRight: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fafafa',
    marginBottom: 8,
  },
  count: {
    fontSize: 24,
    color: '#fafafa',
  },
  list: {
    justifyContent: 'center',
  },
  moduleText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  Lodertext: {
    fontSize: 16,
    color: '#005696',
    marginTop: 10,
    fontStyle: 'italic',
    fontWeight: 'bold',
  },
  BirthdayCard: {
    height: 110,
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 12,
    marginVertical: 12, // ⬅️ More gap between cards
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 3},
    backgroundColor: '#fff',
    borderWidth: 0.5,
    borderColor: '#444',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10, // ⬅️ more padding inside card
    flex: 1,
  },
  whatsappButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#0E7777', // dark teal like your sample
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginTop: 10,
    marginLeft: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  iconContainerBirthday: {
    width: 28,
    height: 28,
    borderRadius: 16,
    backgroundColor: '#25D366', // WhatsApp green
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginLeft: -25,
  },
  whatsappText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },

  noPhoneContainer: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#f8d7da',
    marginTop: 10,
    alignItems: 'center', // ⬅️ centers children horizontally
    justifyContent: 'center', // ⬅️ centers children vertically (if you give height)
  },

  noPhoneText: {
    color: '#721c24',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center', // ⬅️ centers multiline text
  },
  noticeCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  name: {
    fontSize: 16,
    //fontWeight: "bold",
    color: '#222',
    marginBottom: 4,
  },
  avatar: {
    width: 65,
    height: 65,
    borderRadius: 35,
    marginRight: 10,
    borderWidth: 2,
    borderColor: '#005696', // ⬅️ highlight avatar with border
    alignItems: 'flex-start',
    display: 'flex',
  },
});