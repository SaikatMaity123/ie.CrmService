import {
  View,
  Text,
  SafeAreaView,
  ImageBackground,
  Dimensions,
  FlatList,
  StyleSheet,
  Alert,
  TouchableWithoutFeedback,
  BackHandler,
  ActivityIndicator,
} from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import CRMImg from '../images/CRMNEW.svg';
import AntDesign from 'react-native-vector-icons/AntDesign';
import NetInfo from '@react-native-community/netinfo';
import { openDatabase } from 'react-native-sqlite-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '@env';
import ProgressDialog from '../components/custom/ProgressDialog';
import { useFocusEffect } from '@react-navigation/native';

//database connection
const db = openDatabase(
  {
    name: 'CRM_db',
    location: 'default',
  },
  () => {
    console.log('Database connected!');
  }, //on success
  error => console.log('Database error', error), //on error
);

const DATA = [
  {
    id: '0',
    title: 'DCR Sync....',
  },
  {
    id: '1',
    title: 'Master Data Sync....',
  },
  {
    id: '2',
    title: 'Order Booking Data Sync....',
  },
  {
    id: '3',
    title: 'Expense Booking Data Sync....',
  },
];

const SettingScreen = ({ navigation }) => {
  const [useBusinessID, setBusinessID] = useState('');
  const [useIDEmployee, setIDEmployee] = useState('');
  const [startDay, setStartDay] = useState('');
  const [startMDay, setMStartDay] = useState('');
  const [useOthers, setOthers] = useState('');
  const [doctorDCR, setDoctorDCR] = useState('');
  const [doctorManagerDCR, setMangerDoctorDCR] = useState('');
  const [useUnlistedDlist, setUnlistedDlist] = useState('');
  const [useMUnlistedDlist, setMUnlistedDlist] = useState('');
  const [useUnlistedRlist, setUnlistedRlist] = useState('');
  const [useMUnlistedRlist, setMUnlistedRlist] = useState('');
  const [doctorUnlisted, setDoctorUnlisted] = useState('');
  const [retailerUnlisted, setRetailerUnlisted] = useState('');
  const [retailerDCR, setRetailerDCR] = useState('');
  const [managerretailerDCR, setmanagerRetailerDCR] = useState('');
  const [doctorMaster, setDoctorMaster] = useState('');
  const [retailerMaster, setRetailerMaster] = useState('');
  const [useManagerAccess, setuseManagerAccess] = useState('');
  const [unlistedMDocData, setUnlistedMDocData] = useState('');
  const [unlistedMRetData, setUnlistedMRetData] = useState('');
  const [useStayData, setStayData] = useState('');
  const [useOrderData, setOrderData] = useState('');
  const [useExpenseData, setExpenseData] = useState('');
  const [useExpenseRequestData, setExpenseRequestData] = useState('');
  // loaders
  const [initialLoading, setInitialLoading] = useState(true); // 🔴 gate for showing buttons
  const [loading, setLoading] = useState(false); // existing action loader

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.navigate('AppNavScreen'); // <-- Your main screen
        return true; // prevent default back behavior
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () =>
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [navigation]),
  );

  // useEffect(() => {
  //   try {
  //     AsyncStorage.getItem('UserData').then(value => {
  //       if (value != null) {
  //         let user = JSON.parse(value);
  //         setBusinessID(user.BusinessID);
  //         setIDEmployee(user.IDEmployee);
  //         setuseManagerAccess(user.ManagerAccess);
  //       }
  //     });
  //   } catch (error) {
  //     console.log(error);
  //   }

  //   fetchJsonDataFromSQLite();
  // }, []);

  useEffect(() => {
    (async () => {
      try {
        const value = await AsyncStorage.getItem('UserData');
        if (value) {
          const user = JSON.parse(value);
          setBusinessID(user.BusinessID);
          setIDEmployee(user.IDEmployee);
          setuseManagerAccess(!!user.ManagerAccess);
        }
      } catch (e) {
        console.log(e);
      }

      // run the full table load and keep the UI gated
      await fetchJsonDataFromSQLite();
      setInitialLoading(false);
    })();
  }, []);


  // Function to fetch JSON data from SQLite
  // const fetchJsonDataFromSQLite = () => {
  //   //Fetch CRM_StartDay
  //   db.transaction(tx => {
  //     tx.executeSql(
  //       'SELECT * FROM CRM_StartDay',
  //       [],
  //       (_, results) => {
  //         if (results.rows.length > 0) {
  //           //console.warn('Table has data');
  //           var temp = [];
  //           for (let i = 0; i < results.rows.length; ++i) {
  //             temp.push(results.rows.item(i));
  //           }
  //           setStartDay(temp);
  //           //console.log(temp);
  //         }
  //       },
  //       (_, error) => {
  //         console.log('Error fetching data:', error);
  //       },
  //     );
  //   });

  //   //Fetch CRM_ManagerStartDay
  //   db.transaction(tx => {
  //     tx.executeSql(
  //       'SELECT * FROM CRM_ManagerStartDay',
  //       [],
  //       (_, results) => {
  //         if (results.rows.length > 0) {
  //           //console.warn('Table has data');
  //           var temp = [];
  //           for (let i = 0; i < results.rows.length; ++i) {
  //             temp.push(results.rows.item(i));
  //           }
  //           setMStartDay(temp);
  //           //console.log(temp);
  //         }
  //       },
  //       (_, error) => {
  //         console.log('Error fetching data:', error);
  //       },
  //     );
  //   });

  //   //Fetch CRM_DoctorDataSave
  //   db.transaction(tx => {
  //     tx.executeSql(
  //       'SELECT * FROM CRM_DoctorDataSave',
  //       [],
  //       (_, result) => {
  //         const rows = result.rows.raw();
  //         const jsonDataArray = rows.map(row => JSON.parse(row.data));
  //         //const jsonDataArray = rows.map(row => row.data);
  //         console.log('JSON data from the database:', jsonDataArray);
  //         setDoctorDCR(jsonDataArray);
  //       },
  //       (_, error) => {
  //         console.log('Error fetching data:', error);
  //       },
  //     );
  //   });

  //   //Fetch CRM_ManagerDoctorDataSave
  //   db.transaction(tx => {
  //     tx.executeSql(
  //       'SELECT * FROM CRM_ManagerDoctorDataSave',
  //       [],
  //       (_, result) => {
  //         const rows = result.rows.raw();
  //         const jsonDataArray = rows.map(row => JSON.parse(row.data));
  //         //const jsonDataArray = rows.map(row => row.data);
  //         //console.log('JSON data from the database:', jsonDataArray);
  //         setMangerDoctorDCR(jsonDataArray);
  //       },
  //       (_, error) => {
  //         console.log('Error fetching data:', error);
  //       },
  //     );
  //   });

  //   //Fetch CRM_RetailerDataSave
  //   db.transaction(tx => {
  //     tx.executeSql(
  //       'SELECT * FROM CRM_RetailerDataSave',
  //       [],
  //       (_, result) => {
  //         const rows = result.rows.raw();
  //         const jsonDataArray = rows.map(row => JSON.parse(row.data));
  //         //const jsonDataArray = rows.map(row => row.data);
  //         console.log('JSON data from the database:', jsonDataArray);
  //         setRetailerDCR(jsonDataArray);
  //       },
  //       (_, error) => {
  //         console.log('Error fetching data:', error);
  //       },
  //     );
  //   });

  //   //Fetch CRM_MangerRetailerDataSave
  //   db.transaction(tx => {
  //     tx.executeSql(
  //       'SELECT * FROM CRM_MangerRetailerDataSave',
  //       [],
  //       (_, result) => {
  //         const rows = result.rows.raw();
  //         const jsonDataArray = rows.map(row => JSON.parse(row.data));
  //         //const jsonDataArray = rows.map(row => row.data);
  //         console.log('JSON data from the database:', jsonDataArray);
  //         setmanagerRetailerDCR(jsonDataArray);
  //       },
  //       (_, error) => {
  //         console.log('Error fetching data:', error);
  //       },
  //     );
  //   });

  //   //Fetch CRM_MasterDoctorDataSave
  //   db.transaction(tx => {
  //     tx.executeSql(
  //       'SELECT * FROM CRM_MasterDoctorDataSave',
  //       [],
  //       (_, result) => {
  //         const rows = result.rows.raw();
  //         const jsonDataArray = rows.map(row => JSON.parse(row.data));
  //         //const jsonDataArray = rows.map(row => row.data);
  //         console.log('JSON data from the database:', jsonDataArray);
  //         setDoctorMaster(jsonDataArray);
  //       },
  //       (_, error) => {
  //         console.log('Error fetching data:', error);
  //       },
  //     );
  //   });

  //   //Fetch CRM_MasterRetailerDataSave
  //   db.transaction(tx => {
  //     tx.executeSql(
  //       'SELECT * FROM CRM_MasterRetailerDataSave',
  //       [],
  //       (_, result) => {
  //         const rows = result.rows.raw();
  //         const jsonDataArray = rows.map(row => JSON.parse(row.data));
  //         //const jsonDataArray = rows.map(row => row.data);
  //         console.log('JSON data from the database:', jsonDataArray);
  //         setRetailerMaster(jsonDataArray);
  //       },
  //       (_, error) => {
  //         console.log('Error fetching data:', error);
  //       },
  //     );
  //   });

  //   //Fetch CRM_Others
  //   db.transaction(tx => {
  //     tx.executeSql(
  //       'SELECT * FROM CRM_Others',
  //       [],
  //       (_, result) => {
  //         const rows = result.rows.raw();
  //         const jsonDataArray = rows.map(row => JSON.parse(row.data));
  //         //const jsonDataArray = rows.map(row => row.data);
  //         //console.log('JSON data from the database:', jsonDataArray);
  //         setOthers(jsonDataArray);
  //       },
  //       (_, error) => {
  //         console.log('Error fetching data:', error);
  //       },
  //     );
  //   });

  //   //Fetch CRM_UnlistedDoctor
  //   db.transaction(tx => {
  //     tx.executeSql(
  //       'SELECT * FROM CRM_UnlistedDoctor',
  //       [],
  //       (_, results) => {
  //         if (results.rows.length > 0) {
  //           //console.warn('Table has data');
  //           var temp = [];
  //           for (let i = 0; i < results.rows.length; ++i) {
  //             temp.push(results.rows.item(i));
  //           }
  //           setUnlistedDlist(temp);
  //           console.log(temp);
  //         }
  //       },
  //       (_, error) => {
  //         console.log('Error fetching data:', error);
  //       },
  //     );
  //   });

  //   //Fetch CRM_UnlistedRetailer
  //   db.transaction(tx => {
  //     tx.executeSql(
  //       'SELECT * FROM CRM_UnlistedRetailer',
  //       [],
  //       (_, results) => {
  //         if (results.rows.length > 0) {
  //           //console.warn('Table has data');
  //           var temp = [];
  //           for (let i = 0; i < results.rows.length; ++i) {
  //             temp.push(results.rows.item(i));
  //           }
  //           setUnlistedRlist(temp);
  //           console.log(temp);
  //         }
  //       },
  //       (_, error) => {
  //         console.log('Error fetching data:', error);
  //       },
  //     );
  //   });

  //   //Fetch CRM_ManagerUnlistedDoctor
  //   db.transaction(tx => {
  //     tx.executeSql(
  //       'SELECT * FROM CRM_ManagerUnlistedDoctor',
  //       [],
  //       (_, results) => {
  //         if (results.rows.length > 0) {
  //           //console.warn('Table has data');
  //           var temp = [];
  //           for (let i = 0; i < results.rows.length; ++i) {
  //             temp.push(results.rows.item(i));
  //           }
  //           setMUnlistedDlist(temp);
  //           //console.log(temp);
  //         }
  //       },
  //       (_, error) => {
  //         console.log('Error fetching data:', error);
  //       },
  //     );
  //   });

  //   //Fetch CRM_ManagerUnlistedRetailer
  //   db.transaction(tx => {
  //     tx.executeSql(
  //       'SELECT * FROM CRM_ManagerUnlistedRetailer',
  //       [],
  //       (_, results) => {
  //         if (results.rows.length > 0) {
  //           //console.warn('Table has data');
  //           var temp = [];
  //           for (let i = 0; i < results.rows.length; ++i) {
  //             temp.push(results.rows.item(i));
  //           }
  //           setMUnlistedRlist(temp);
  //           //console.log(temp);
  //         }
  //       },
  //       (_, error) => {
  //         console.log('Error fetching data:', error);
  //       },
  //     );
  //   });

  //   //Fetch CRM_DoctorUnlistedDataSave
  //   db.transaction(tx => {
  //     tx.executeSql(
  //       'SELECT * FROM CRM_DoctorUnlistedDataSave',
  //       [],
  //       (_, result) => {
  //         const rows = result.rows.raw();
  //         const jsonDataArray = rows.map(row => JSON.parse(row.data));
  //         //const jsonDataArray = rows.map(row => row.data);
  //         //console.log('JSON data from the database:', jsonDataArray);
  //         setDoctorUnlisted(jsonDataArray);
  //       },
  //       (_, error) => {
  //         console.log('Error fetching data:', error);
  //       },
  //     );
  //   });

  //   //Fetch CRM_RetailerUnlistedDataSave
  //   db.transaction(tx => {
  //     tx.executeSql(
  //       'SELECT * FROM CRM_RetailerUnlistedDataSave',
  //       [],
  //       (_, result) => {
  //         const rows = result.rows.raw();
  //         const jsonDataArray = rows.map(row => JSON.parse(row.data));
  //         //const jsonDataArray = rows.map(row => row.data);
  //         //console.log('JSON data from the database:', jsonDataArray);
  //         setRetailerUnlisted(jsonDataArray);
  //       },
  //       (_, error) => {
  //         console.log('Error fetching data:', error);
  //       },
  //     );
  //   });

  //   //Fetch CRM_ManagerDoctorUnlistedDataSave
  //   db.transaction(tx => {
  //     tx.executeSql(
  //       'SELECT * FROM CRM_ManagerDoctorUnlistedDataSave',
  //       [],
  //       (_, result) => {
  //         const rows = result.rows.raw();
  //         const jsonDataArray = rows.map(row => JSON.parse(row.data));
  //         //const jsonDataArray = rows.map(row => row.data);
  //         //console.log('JSON data from the database:', jsonDataArray);
  //         setUnlistedMDocData(jsonDataArray);
  //       },
  //       (_, error) => {
  //         console.log('Error fetching data:', error);
  //       },
  //     );
  //   });

  //   //Fetch CRM_ManagerRetailerUnlistedDataSave
  //   db.transaction(tx => {
  //     tx.executeSql(
  //       'SELECT * FROM CRM_ManagerRetailerUnlistedDataSave',
  //       [],
  //       (_, result) => {
  //         const rows = result.rows.raw();
  //         const jsonDataArray = rows.map(row => JSON.parse(row.data));
  //         //const jsonDataArray = rows.map(row => row.data);
  //         //console.log('JSON data from the database:', jsonDataArray);
  //         setUnlistedMRetData(jsonDataArray);
  //         //console.log(temp);
  //       },
  //       (_, error) => {
  //         console.log('Error fetching data:', error);
  //       },
  //     );
  //   });

  //   //Fetch CRM_StayDataSave
  //   db.transaction(tx => {
  //     tx.executeSql(
  //       'SELECT * FROM CRM_StayDataSave',
  //       [],
  //       (_, result) => {
  //         const rows = result.rows.raw();
  //         const jsonDataArray = rows.map(row => JSON.parse(row.data));
  //         //const jsonDataArray = rows.map(row => row.data);
  //         //console.log('JSON data from the database:', jsonDataArray);
  //         setStayData(jsonDataArray);
  //         //console.log(temp);
  //       },
  //       (_, error) => {
  //         console.log('Error fetching data:', error);
  //       },
  //     );
  //   });

  //   //Fetch OrderBookingDataSave
  //   db.transaction(tx => {
  //     tx.executeSql(
  //       'SELECT data FROM OrderBookingDataSave',
  //       [],
  //       (_, result) => {
  //         const rows = result.rows.raw();
  //         const jsonDataArray = rows.map(row => JSON.parse(row.data));
  //         //const jsonDataArray = rows.map(row => row.data);
  //         //setOrderData(jsonDataArray);
  //         // Flatten the array
  //         const flattenedArray = jsonDataArray.flat();

  //         // Set the flattened array to state
  //         setOrderData(flattenedArray);
  //         //console.log('JSON data from the database:', flattenedArray);
  //         //setDoctorDCR(jsonDataArray);
  //       },
  //       (_, error) => {
  //         console.log('Error fetching data:', error);
  //       },
  //     );
  //   });

  //   //Fetch CRM_ExpenseDataSave
  //   db.transaction(tx => {
  //     tx.executeSql(
  //       'SELECT data FROM CRM_ExpenseDataSave',
  //       [],
  //       (_, result) => {
  //         const rows = result.rows.raw();
  //         const jsonDataArray = rows.map(row => JSON.parse(row.data));
  //         //const jsonDataArray = rows.map(row => row.data);
  //         //setOrderData(jsonDataArray);
  //         // Flatten the array
  //         const flattenedArray = jsonDataArray.flat();
  //         // Set the flattened array to state
  //         setExpenseData(flattenedArray);
  //         console.log('JSON data from the database:', flattenedArray);
  //         //setDoctorDCR(jsonDataArray);
  //       },
  //       (_, error) => {
  //         console.log('Error fetching data:', error);
  //       },
  //     );
  //   });

  //   //Fetch CRM_ExpenseRequestSave
  //   db.transaction(tx => {
  //     tx.executeSql(
  //       'SELECT data FROM CRM_ExpenseRequestSave',
  //       [],
  //       (_, result) => {
  //         const rows = result.rows.raw();
  //         const jsonDataArray = rows.map(row => JSON.parse(row.data));
  //         //const jsonDataArray = rows.map(row => row.data);
  //         //setOrderData(jsonDataArray);
  //         // Flatten the array
  //         const flattenedArray = jsonDataArray.flat();
  //         // Using a Set to keep track of unique IDs
  //         const uniqueBookings = flattenedArray.filter(
  //           (booking, index, self) =>
  //             index === self.findIndex(b => b.IDBooking === booking.IDBooking),
  //         );
  //         // Set the flattened array to state
  //         //setExpenseData(flattenedArray);
  //         console.log('JSON data :', flattenedArray);
  //         console.log('JSON data from the database:', uniqueBookings);
  //         setExpenseRequestData(uniqueBookings);
  //       },
  //       (_, error) => {
  //         console.log('Error fetching data:', error);
  //       },
  //     );
  //   });
  // };

  //Suman Jana to  Fetch the Data from The Sqlite Database


  // ---------- SQLite helpers ----------


  const extractRows = (result) => {
    // Works whether rows.raw() exists or not
    try {
      const list = result?.rows;
      if (!list) return [];
      if (typeof list.raw === 'function') return list.raw();
      const arr = [];
      for (let i = 0; i < list.length; i++) arr.push(list.item(i));
      return arr;
    } catch {
      return [];
    }
  };

  const fetchTableData = (tableName, parser = JSON.parse) => {
    return new Promise((resolve) => {
      try {
        db.transaction(tx => {
          tx.executeSql(
            `SELECT * FROM ${tableName}`,
            [],
            (_, result) => {
              const rows = extractRows(result);
              if (!rows.length) {
                console.warn(`⚠️ No data in table: ${tableName}`);
                resolve([]);
                return;
              }
              const parsed = parser
                ? rows.map(row => parser(row.data ?? row))
                : rows;
              // console.log(`Fetched from ${tableName}:`, parsed);
              resolve(parsed);
            },
            (_, error) => {
              console.warn(`Skipped ${tableName}:`, error?.message || 'No details');
              resolve([]);
            },
          );
        });
      } catch (e) {
        console.warn(`Table ${tableName} failed silently:`, e?.message || e);
        resolve([]);
      }
    });
  };

  // const fetchJsonDataFromSQLite = async () => {
  //   try {
  //     const [
  //       startDayData,
  //       managerStartDayData,
  //       doctorDCRData,
  //       managerDoctorDCRData,
  //       retailerDCRData,
  //       managerRetailerDCRData,
  //       doctorMasterData,
  //       retailerMasterData,
  //       othersData,
  //       unlistedDoctor,
  //       unlistedRetailer,
  //       managerUnlistedDoctor,
  //       managerUnlistedRetailer,
  //       doctorUnlistedData,
  //       retailerUnlistedData,
  //       unlistedMDocData,
  //       unlistedMRetData,
  //       stayData,
  //       orderDataRaw,
  //       expenseDataRaw,
  //       expenseRequestRaw,
  //     ] = await Promise.all([
  //       fetchTableData('CRM_StartDay', null),
  //       fetchTableData('CRM_ManagerStartDay', null),
  //       fetchTableData('CRM_DoctorDataSave'),
  //       fetchTableData('CRM_ManagerDoctorDataSave'),
  //       fetchTableData('CRM_RetailerDataSave'),
  //       fetchTableData('CRM_MangerRetailerDataSave'),
  //       fetchTableData('CRM_MasterDoctorDataSave'),
  //       fetchTableData('CRM_MasterRetailerDataSave'),
  //       fetchTableData('CRM_Others'),
  //       fetchTableData('CRM_UnlistedDoctor', null),
  //       fetchTableData('CRM_UnlistedRetailer', null),
  //       fetchTableData('CRM_ManagerUnlistedDoctor', null),
  //       fetchTableData('CRM_ManagerUnlistedRetailer', null),
  //       fetchTableData('CRM_DoctorUnlistedDataSave'),
  //       fetchTableData('CRM_RetailerUnlistedDataSave'),
  //       fetchTableData('CRM_ManagerDoctorUnlistedDataSave'),
  //       fetchTableData('CRM_ManagerRetailerUnlistedDataSave'),
  //       fetchTableData('CRM_StayDataSave'),
  //       fetchTableData('OrderBookingDataSave'),
  //       fetchTableData('CRM_ExpenseDataSave'),
  //       fetchTableData('CRM_ExpenseRequestSave'),
  //     ]);

  //     // Flatten where needed
  //     setStartDay(startDayData);
  //     setMStartDay(managerStartDayData);
  //     setDoctorDCR(doctorDCRData);
  //     setMangerDoctorDCR(managerDoctorDCRData);
  //     setRetailerDCR(retailerDCRData);
  //     setmanagerRetailerDCR(managerRetailerDCRData);
  //     setDoctorMaster(doctorMasterData);
  //     setRetailerMaster(retailerMasterData);
  //     setOthers(othersData);
  //     setUnlistedDlist(unlistedDoctor);
  //     setUnlistedRlist(unlistedRetailer);
  //     setMUnlistedDlist(managerUnlistedDoctor);
  //     setMUnlistedRlist(managerUnlistedRetailer);
  //     setDoctorUnlisted(doctorUnlistedData);
  //     setRetailerUnlisted(retailerUnlistedData);
  //     setUnlistedMDocData(unlistedMDocData);
  //     setUnlistedMRetData(unlistedMRetData);
  //     setStayData(stayData);

  //     setOrderData(orderDataRaw.flat());
  //     setExpenseData(expenseDataRaw.flat());

  //     const uniqueExpenses = expenseRequestRaw
  //       .flat()
  //       .filter(
  //         (item, index, self) =>
  //           index === self.findIndex(i => i.IDBooking === item.IDBooking),
  //       );
  //     setExpenseRequestData(uniqueExpenses);
  //   } catch (err) {
  //     console.error('Error fetching data:', err);
  //   }
  // };


  const fetchJsonDataFromSQLite = async () => {
    try {
      const [
        startDayData,
        managerStartDayData,
        doctorDCRData,
        managerDoctorDCRData,
        retailerDCRData,
        managerRetailerDCRData,
        doctorMasterData,
        retailerMasterData,
        othersData,
        unlistedDoctor,
        unlistedRetailer,
        managerUnlistedDoctor,
        managerUnlistedRetailer,
        doctorUnlistedData,
        retailerUnlistedData,
        unlistedMDocDataRaw,
        unlistedMRetDataRaw,
        stayData,
        orderDataRaw,
        expenseDataRaw,
        expenseRequestRaw,
      ] = await Promise.all([
        fetchTableData('CRM_StartDay', null),
        fetchTableData('CRM_ManagerStartDay', null),
        fetchTableData('CRM_DoctorDataSave'),
        fetchTableData('CRM_ManagerDoctorDataSave'),
        fetchTableData('CRM_RetailerDataSave'),
        fetchTableData('CRM_MangerRetailerDataSave'),
        fetchTableData('CRM_MasterDoctorDataSave'),
        fetchTableData('CRM_MasterRetailerDataSave'),
        fetchTableData('CRM_Others'),
        fetchTableData('CRM_UnlistedDoctor', null),
        fetchTableData('CRM_UnlistedRetailer', null),
        fetchTableData('CRM_ManagerUnlistedDoctor', null),
        fetchTableData('CRM_ManagerUnlistedRetailer', null),
        fetchTableData('CRM_DoctorUnlistedDataSave'),
        fetchTableData('CRM_RetailerUnlistedDataSave'),
        fetchTableData('CRM_ManagerDoctorUnlistedDataSave'),
        fetchTableData('CRM_ManagerRetailerUnlistedDataSave'),
        fetchTableData('CRM_StayDataSave'),
        fetchTableData('OrderBookingDataSave'),
        fetchTableData('CRM_ExpenseDataSave'),
        fetchTableData('CRM_ExpenseRequestSave'),
      ]);

      // set state once all are loaded
      setStartDay(startDayData);
      setMStartDay(managerStartDayData);
      setDoctorDCR(doctorDCRData);
      setMangerDoctorDCR(managerDoctorDCRData);
      setRetailerDCR(retailerDCRData);
      setmanagerRetailerDCR(managerRetailerDCRData);
      setDoctorMaster(doctorMasterData);
      setRetailerMaster(retailerMasterData);
      setOthers(othersData);
      setUnlistedDlist(unlistedDoctor);
      setUnlistedRlist(unlistedRetailer);
      setMUnlistedDlist(managerUnlistedDoctor);
      setMUnlistedRlist(managerUnlistedRetailer);
      setDoctorUnlisted(doctorUnlistedData);
      setRetailerUnlisted(retailerUnlistedData);
      setUnlistedMDocData(unlistedMDocDataRaw);
      setUnlistedMRetData(unlistedMRetDataRaw);
      setStayData(stayData);

      setOrderData((orderDataRaw || []).flat());
      setExpenseData((expenseDataRaw || []).flat());

      const uniqueExpenses = (expenseRequestRaw || [])
        .flat()
        .filter((item, idx, self) => idx === self.findIndex(i => i.IDBooking === item.IDBooking));
      setExpenseRequestData(uniqueExpenses);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  //Suman Jana End for fetching the Data

  const syncData = async item => {
    // console.log(data);
    // db.transaction(tx => {
    //   tx.executeSql(
    //     'SELECT * FROM CRM_StartDay',
    //     [],
    //     (tx, results) =>  {
    //       // Check if there are rows in the result set
    //       if (results.rows.length > 0) {
    //         //console.warn('Table has data');
    //         var temp = [];
    //         for (let i = 0; i < results.rows.length; ++i) {
    //           temp.push(results.rows.item(i));
    //         }

    //         for (var i = 0; i < temp.length; i++) {
    //           Areas = temp[i].Areas;
    //           Visitwiths = temp[i].Visitwiths;
    //           dsr_remarks = temp[i].dsr_remarks;
    //           es_IDWorkingType = temp[i].es_IDWorkingType;
    //           ms_IDWorkingType = temp[i].ms_IDWorkingType;
    //           startLat = temp[i].startLat;
    //           startLong = temp[i].startLong;
    //           dcr_date = temp[i].dcr_date;
    //         }

    //         NetInfo.fetch().then(async state => {
    //           if (state.isConnected) {
    //             const url =
    //               BASE_URL +
    //               'DCR/StartDay?Businessid=' +
    //               useBusinessID +
    //               '&IDEmployee=' +
    //               useIDEmployee +
    //               '&DeviceType=MOBILE' +
    //               '&StartLat=' +
    //               startLat +
    //               '&StartLong=' +
    //               startLong +
    //               '&IDWorkingTypeMorning=' +
    //               ms_IDWorkingType +
    //               '&IDWorkingTypeEvening=' +
    //               es_IDWorkingType +
    //               '&Remark=' +
    //               dsr_remarks +
    //               '&Areas=' +
    //               Areas +
    //               '&Visitwiths=' +
    //               Visitwiths;

    //             console.log(url);

    //             let result = await fetch(url);
    //             result = await result.json();
    //             console.log(result);
    //             if (result.status === 'STARTED') {
    //               navigation.navigate('AppNavScreen');
    //               db.transaction(tx => {
    //                 tx.executeSql('DELETE from CRM_StartDay');
    //               });
    //             } else {
    //               Alert.alert('Else : ' + result.status);
    //             }
    //           } else {
    //             Alert.alert('No Internet');
    //           }
    //         }, []);
    //       } else {
    //         Alert.alert('Table is empty');
    //       }
    //     },
    //     error => console.error('Error executing SELECT query: ', error),
    //   );
    // });
    // console.warn(item.title);
    if (useManagerAccess === true) {
      if (item.title === 'DCR Sync....') {
        NetInfo.fetch().then(state => {
          if (state.isConnected) {
            startDayAPICall();
            doctorUnlistedAPICall();
            retailerUnlistedAPICall();
            setLoading(true);
            setTimeout(() => {
              setLoading(false);
            }, 3000); // Simulate a network request or any async task
            // doctorDCRAPICall();
            // retailerDCRAPICall();
            // othersDCRAPICall();
          } else {
            Alert.alert('No Internet');
          }
        }, []);
      } else if (item.title === 'Master Data Sync....') {
        NetInfo.fetch().then(state => {
          if (state.isConnected) {
            Alert.alert('Not Authorized');
          } else {
            Alert.alert('No Internet');
          }
        }, []);
      } else if (item.title === 'Order Booking Data Sync....') {
        NetInfo.fetch().then(state => {
          if (state.isConnected) {
            saveOrderBooking();
            //console.warn("Hi");
            setLoading(true);
            setTimeout(() => {
              setLoading(false);
            }, 3000); // Simulate a network request or any async task
          } else {
            Alert.alert('No Internet');
          }
        }, []);
      } else if (item.title === 'Expense Booking Data Sync....') {
        NetInfo.fetch().then(state => {
          if (state.isConnected) {
            saveExpenseBooking();
            saveExpenseReqBooking();
            //console.warn("Hi");
            setLoading(true);
            setTimeout(() => {
              setLoading(false);
            }, 3000); // Simulate a network request or any async task
          } else {
            Alert.alert('No Internet');
          }
        }, []);
      }
    } else {
      if (item.title === 'DCR Sync....') {
        NetInfo.fetch().then(state => {
          if (state.isConnected) {
            startDayAPICall();
            doctorUnlistedAPICall();
            retailerUnlistedAPICall();
            setLoading(true);
            setTimeout(() => {
              setLoading(false);
            }, 3000); // Simulate a network request or any async task
            // doctorDCRAPICall();
            // retailerDCRAPICall();
            // othersDCRAPICall();
          } else {
            Alert.alert('No Internet');
          }
        }, []);
      } else if (item.title === 'Master Data Sync....') {
        NetInfo.fetch().then(state => {
          if (state.isConnected) {
            doctorMasterAPICall();
            retailerMasterAPICall();
            setLoading(true);
            setTimeout(() => {
              setLoading(false);
            }, 3000); // Simulate a network request or any async task
          } else {
            Alert.alert('No Internet');
          }
        }, []);
      } else if (item.title === 'Order Booking Data Sync....') {
        NetInfo.fetch().then(state => {
          if (state.isConnected) {
            saveOrderBooking();
            //console.warn("Hi");
            setLoading(true);
            setTimeout(() => {
              setLoading(false);
            }, 3000); // Simulate a network request or any async task
          } else {
            Alert.alert('No Internet');
          }
        }, []);
      } else if (item.title === 'Expense Booking Data Sync....') {
        NetInfo.fetch().then(state => {
          if (state.isConnected) {
            saveExpenseBooking();
            saveExpenseReqBooking();
            //console.warn("Hi");
            setLoading(true);
            setTimeout(() => {
              setLoading(false);
            }, 3000); // Simulate a network request or any async task
          } else {
            Alert.alert('No Internet');
          }
        }, []);
      }
    }
  };

  const startDayAPICall = async () => {
    if (useManagerAccess === true) {
      if (startMDay.length === 0) {
        Alert.alert('Manager Start Day Data is Empty');
        doctorDCRAPICall();
        retailerDCRAPICall();
        othersDCRAPICall();
        stayDCRAPICall();
        navigation.navigate('AppNavScreen');
      } else {
        let result = await fetch(BASE_URL + 'data/sync/day', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(startMDay),
        });

        result = await result.json();
        result.map(item => {
          console.log(item.status);
          if (item.status === 'SUCCESS') {
            db.transaction(tx => {
              tx.executeSql('DELETE from CRM_ManagerStartDay');
              console.log('Manager Start Day Data Saved');
            });
            navigation.navigate('AppNavScreen');
            doctorDCRAPICall();
            retailerDCRAPICall();
            othersDCRAPICall();
            stayDCRAPICall();
          } else {
            db.transaction(tx => {
              tx.executeSql('DELETE from CRM_ManagerStartDay');
            });
            navigation.navigate('AppNavScreen');
            Alert.alert(item.srl + ' ' + item.status);
          }
        });
      }
      //Alert.alert('Manger');
    } else {
      if (startDay.length === 0) {
        Alert.alert('Start Day Data is Empty');
        navigation.navigate('AppNavScreen');
        doctorDCRAPICall();
        retailerDCRAPICall();
        othersDCRAPICall();
        stayDCRAPICall();
      } else {
        let result = await fetch(BASE_URL + 'data/sync/day', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(startDay),
        });

        result = await result.json();
        result.map(item => {
          console.log(item.status);
          if (item.status === 'SUCCESS') {
            db.transaction(tx => {
              tx.executeSql('DELETE from CRM_StartDay');
              console.log('Start Day Data Saved');
            });
            navigation.navigate('AppNavScreen');
            doctorDCRAPICall();
            retailerDCRAPICall();
            othersDCRAPICall();
            stayDCRAPICall();
          } else {
            db.transaction(tx => {
              tx.executeSql('DELETE from CRM_StartDay');
            });
            navigation.navigate('AppNavScreen');
            Alert.alert(item.srl + ' ' + item.status);
          }
        });
      }
      //Alert.alert('User');
    }
  };

  const doctorDCRAPICall = async () => {
    if (useManagerAccess === true) {
      if (doctorManagerDCR.length === 0) {
        Alert.alert('Manager Doctor DCR Data is Empty');
        navigation.navigate('AppNavScreen');
      } else {
        //let result = await fetch(BASE_URL + 'data/sync/Managerdcr', {
        let result = await fetch(BASE_URL + 'data/sync/Managerdcrnew', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(doctorManagerDCR),
        });

        result = await result.json();
        result.map(item => {
          console.log(item.status);
          if (item.status === 'SUCCESS') {
            db.transaction(tx => {
              tx.executeSql('DELETE from CRM_ManagerDoctorDataSave');
              console.log('Manager Doctor DCR Data Saved');
            });
            db.transaction(tx => {
              tx.executeSql('DELETE from CRM_ManagerOfflineViewDocDCR');
              console.log('Manager Doctor DCR Data Saved');
            });
            navigation.navigate('AppNavScreen');
          } else {
            Alert.alert(item.srl + ' ' + item.status);
            db.transaction(tx => {
              tx.executeSql('DELETE from CRM_ManagerDoctorDataSave');
            });
            db.transaction(tx => {
              tx.executeSql('DELETE from CRM_ManagerOfflineViewDocDCR');
            });
            navigation.navigate('AppNavScreen');
          }
        });
      }
    } else {
      if (doctorDCR.length === 0) {
        Alert.alert('Doctor DCR Data is Empty');
        navigation.navigate('AppNavScreen');
      } else {
        //let result = await fetch(BASE_URL + 'data/sync/dcr', {
        let result = await fetch(BASE_URL + 'data/sync/dcrnew', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(doctorDCR),
        });

        result = await result.json();
        result.map(item => {
          console.log(item.status);
          if (item.status === 'SUCCESS') {
            db.transaction(tx => {
              tx.executeSql('DELETE from CRM_DoctorDataSave');
              console.log('Doctor DCR Data Saved');
            });
            db.transaction(tx => {
              tx.executeSql('DELETE from CRM_OfflineViewDocDCR');
              console.log('Doctor DCR Data Saved');
            });
            navigation.navigate('AppNavScreen');
          } else {
            Alert.alert(item.srl + ' ' + item.status);
            db.transaction(tx => {
              tx.executeSql('DELETE from CRM_DoctorDataSave');
            });
            db.transaction(tx => {
              tx.executeSql('DELETE from CRM_OfflineViewDocDCR');
            });
            navigation.navigate('AppNavScreen');
          }
        });
      }
    }
  };

  const retailerDCRAPICall = async () => {
    if (useManagerAccess === true) {
      if (managerretailerDCR.length === 0) {
        Alert.alert('Manager Retailer DCR Data is Empty');
        navigation.navigate('AppNavScreen');
      } else {
        let result = await fetch(BASE_URL + 'data/sync/Managerdcr', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(managerretailerDCR),
        });

        result = await result.json();
        result.map(item => {
          console.log(item.status);
          if (item.status === 'SUCCESS') {
            db.transaction(tx => {
              tx.executeSql('DELETE from CRM_MangerRetailerDataSave');
              console.log('Manager Retailer DCR Data Saved');
            });
            db.transaction(tx => {
              tx.executeSql('DELETE from CRM_ManagerOfflineViewRetDCR');
              console.log('Manager Retailer DCR Data Saved');
            });
            navigation.navigate('AppNavScreen');
          } else {
            Alert.alert(item.srl + ' ' + item.status);
            db.transaction(tx => {
              tx.executeSql('DELETE from CRM_MangerRetailerDataSave');
              console.log('Manager Retailer DCR Data Saved');
            });
            db.transaction(tx => {
              tx.executeSql('DELETE from CRM_ManagerOfflineViewRetDCR');
              console.log('Manager Retailer DCR Data Saved');
            });
            navigation.navigate('AppNavScreen');
          }
        });
      }
    } else {
      if (retailerDCR.length === 0) {
        Alert.alert('Retailer DCR Data is Empty');
        navigation.navigate('AppNavScreen');
      } else {
        let result = await fetch(BASE_URL + 'data/sync/dcr', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(retailerDCR),
        });

        result = await result.json();
        result.map(item => {
          console.log(item.status);
          if (item.status === 'SUCCESS') {
            db.transaction(tx => {
              tx.executeSql('DELETE from CRM_RetailerDataSave');
              console.log('Retailer DCR Data Saved');
            });
            db.transaction(tx => {
              tx.executeSql('DELETE from CRM_OfflineViewRetDCR');
              console.log('Retailer DCR Data Saved');
            });
            navigation.navigate('AppNavScreen');
          } else {
            Alert.alert(item.srl + ' ' + item.status);
            db.transaction(tx => {
              tx.executeSql('DELETE from CRM_RetailerDataSave');
              console.log('Retailer DCR Data Saved');
            });
            db.transaction(tx => {
              tx.executeSql('DELETE from CRM_OfflineViewRetDCR');
              console.log('Retailer DCR Data Saved');
            });
            navigation.navigate('AppNavScreen');
          }
        });
      }
    }
  };
  const stayDCRAPICall = async () => {
    if (useStayData.length === 0) {
      Alert.alert('Stay Data is Empty');
      navigation.navigate('AppNavScreen');
    } else {
      let result = await fetch(BASE_URL + 'DCR/Sync/Stay', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(useStayData),
      });

      result = await result.json();
      result.result.map(item => {
        console.log(item.message);
        if (item.message === '') {
          db.transaction(tx => {
            tx.executeSql('DELETE from CRM_StayDataSave');
            console.log('Start Data Saved');
          });
          navigation.navigate('AppNavScreen');
        } else {
          Alert.alert(item.message);
          db.transaction(tx => {
            tx.executeSql('DELETE from CRM_StayDataSave');
            // console.log('Retailer DCR Data Saved');
          });
          navigation.navigate('AppNavScreen');
        }
      });
    }
  };

  const othersDCRAPICall = async () => {
    if (useManagerAccess === true) {
      if (useOthers.length === 0) {
        Alert.alert('Others DCR Data is Empty');
        navigation.navigate('AppNavScreen');
      } else {
        let result = await fetch(BASE_URL + 'data/sync/Managerdcr', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(useOthers),
        });

        result = await result.json();
        result.map(item => {
          console.log(item.status);
          if (item.status === 'SUCCESS') {
            db.transaction(tx => {
              tx.executeSql('DELETE from CRM_Others');
              console.log('Others DCR Data Saved');
            });
            navigation.navigate('AppNavScreen');
          } else {
            db.transaction(tx => {
              tx.executeSql('DELETE from CRM_Others');
            });
            navigation.navigate('AppNavScreen');
            Alert.alert(item.srl + ' ' + item.status);
          }
        });
      }
    } else {
      if (useOthers.length === 0) {
        Alert.alert('Others DCR Data is Empty');
        navigation.navigate('AppNavScreen');
      } else {
        let result = await fetch(BASE_URL + 'data/sync/dcr', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(useOthers),
        });

        result = await result.json();
        result.map(item => {
          console.log(item.status);
          if (item.status === 'SUCCESS') {
            db.transaction(tx => {
              tx.executeSql('DELETE from CRM_Others');
              console.log('Others DCR Data Saved');
            });
            navigation.navigate('AppNavScreen');
          } else {
            db.transaction(tx => {
              tx.executeSql('DELETE from CRM_Others');
            });
            navigation.navigate('AppNavScreen');
            Alert.alert(item.srl + ' ' + item.status);
          }
        });
      }
    }
  };

  const doctorMasterAPICall = async () => {
    if (doctorMaster.length === 0) {
      Alert.alert('Doctor Master Data is Empty');
      navigation.navigate('AppNavScreen');
    } else {
      let result = await fetch(BASE_URL + 'data/sync/doctor', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(doctorMaster),
      });

      result = await result.json();
      result.map(item => {
        console.log(item.status);
        if (item.status === 'SUCCESS') {
          db.transaction(tx => {
            tx.executeSql('DELETE from CRM_MasterDoctorDataSave');
            console.log('Doctor Master Data Saved');
          });
          //Alert.alert(item.status);
          navigation.navigate('AppNavScreen');
        } else {
          Alert.alert(item.srl + ' ' + item.status);
          db.transaction(tx => {
            tx.executeSql('DELETE from CRM_MasterDoctorDataSave');
          });
          navigation.navigate('AppNavScreen');
        }
      });
    }
  };

  const retailerMasterAPICall = async () => {
    if (retailerMaster.length === 0) {
      Alert.alert('Retailer Master Data is Empty');
      navigation.navigate('AppNavScreen');
    } else {
      let result = await fetch(BASE_URL + 'data/sync/retailer', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(retailerMaster),
      });

      result = await result.json();
      result.map(item => {
        console.log(item.status);
        if (item.status === 'SUCCESS') {
          db.transaction(tx => {
            tx.executeSql('DELETE from CRM_MasterRetailerDataSave');
            console.log('Retailer Master Data Saved');
          });
          //Alert.alert(item.status);
          navigation.navigate('AppNavScreen');
        } else {
          Alert.alert(item.srl + ' ' + item.status);
          db.transaction(tx => {
            tx.executeSql('DELETE from CRM_MasterRetailerDataSave');
          });
          //Alert.alert(item.status);
          navigation.navigate('AppNavScreen');
        }
      });
    }
  };

  const doctorUnlistedAPICall = async () => {
    if (useManagerAccess === true) {
      //Alert.alert('Manager');
      if (useMUnlistedDlist.length === 0) {
        Alert.alert('Doctor Data is Empty');
        navigation.navigate('AppNavScreen');
      } else {
        let result = await fetch(BASE_URL + 'data/sync/unlisteddoctor', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(useMUnlistedDlist),
        });

        result = await result.json();
        result.map(item => {
          console.log(item.status);
          if (item.status === 'SUCCESS') {
            db.transaction(tx => {
              tx.executeSql('DELETE from CRM_ManagerUnlistedDoctor');
              console.log('Doctor Data Saved');
            });
            //Alert.alert(item.status);
            //navigation.navigate('AppNavScreen');
          } else {
            Alert.alert(item.srl + ' ' + item.status);
            db.transaction(tx => {
              tx.executeSql('DELETE from CRM_ManagerUnlistedDoctor');
            });
          }
        });
        doctorUAPICall();
      }
    } else {
      if (useUnlistedDlist.length === 0) {
        Alert.alert('Doctor Data is Empty');
        navigation.navigate('AppNavScreen');
      } else {
        let result = await fetch(BASE_URL + 'data/sync/unlisteddoctor', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(useUnlistedDlist),
        });

        result = await result.json();
        result.map(item => {
          console.log(item.status);
          if (item.status === 'SUCCESS') {
            db.transaction(tx => {
              tx.executeSql('DELETE from CRM_UnlistedDoctor');
              console.log('Doctor Unlisted Data Saved');
            });
            //Alert.alert(item.status);
            //navigation.navigate('AppNavScreen');
          } else {
            Alert.alert(item.srl + ' ' + item.status);
            db.transaction(tx => {
              tx.executeSql('DELETE from CRM_UnlistedDoctor');
            });
          }
        });
        doctorUAPICall();
      }
    }
  };

  const retailerUnlistedAPICall = async () => {
    if (useManagerAccess === true) {
      if (useMUnlistedRlist.length === 0) {
        Alert.alert('Retailer Data is Empty');
        navigation.navigate('AppNavScreen');
      } else {
        let result = await fetch(BASE_URL + 'data/sync/unlistedretailer', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(useMUnlistedRlist),
        });

        result = await result.json();
        result.map(item => {
          console.log(item.status);
          if (item.status === 'SUCCESS') {
            db.transaction(tx => {
              tx.executeSql('DELETE from CRM_ManagerUnlistedRetailer');
              console.log('Retailer Data Saved');
            });
            //Alert.alert(item.status);
            //navigation.navigate('AppNavScreen');
          } else {
            Alert.alert(item.srl + ' ' + item.status);
            db.transaction(tx => {
              tx.executeSql('DELETE from CRM_ManagerUnlistedRetailer');
            });
          }
        });
        retailerUAPICall();
      }
    } else {
      if (useUnlistedRlist.length === 0) {
        Alert.alert('Retailer Data is Empty');
        navigation.navigate('AppNavScreen');
      } else {
        let result = await fetch(BASE_URL + 'data/sync/unlistedretailer', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(useUnlistedRlist),
        });

        result = await result.json();
        result.map(item => {
          console.log(item.status);
          if (item.status === 'SUCCESS') {
            db.transaction(tx => {
              tx.executeSql('DELETE from CRM_UnlistedRetailer');
              console.log('Retailer Unlisted Data Saved');
            });
            //Alert.alert(item.status);
            //navigation.navigate('AppNavScreen');
          } else {
            Alert.alert(item.srl + ' ' + item.status);
            db.transaction(tx => {
              tx.executeSql('DELETE from CRM_UnlistedRetailer');
            });
          }
        });
        retailerUAPICall();
      }
    }
  };

  const doctorUAPICall = async () => {
    if (useManagerAccess === true) {
      if (unlistedMDocData.length === 0) {
        Alert.alert('Doctor Unlisted Data is Empty');
        navigation.navigate('AppNavScreen');
      } else {
        let result = await fetch(BASE_URL + 'data/sync/UnlistedManagerdcr', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(unlistedMDocData),
        });

        result = await result.json();
        result.map(item => {
          console.log(item.status);
          if (item.status === 'SUCCESS') {
            db.transaction(tx => {
              tx.executeSql('DELETE from CRM_ManagerDoctorUnlistedDataSave');
              console.log('Doctor Unlisted Data Saved');
            });
            db.transaction(tx => {
              tx.executeSql('DELETE from CRM_OfflineMangerViewUnlistedDCR');
              console.log('Doctor Unlisted Data Saved');
            });
            navigation.navigate('AppNavScreen');
          } else {
            Alert.alert(item.srl + ' ' + item.status);
            db.transaction(tx => {
              tx.executeSql('DELETE from CRM_ManagerDoctorUnlistedDataSave');
              console.log('Doctor Unlisted Data Saved');
            });
            db.transaction(tx => {
              tx.executeSql('DELETE from CRM_OfflineMangerViewUnlistedDCR');
              console.log('Doctor Unlisted Data Saved');
            });
            navigation.navigate('AppNavScreen');
          }
        });
      }
    } else {
      if (doctorUnlisted.length === 0) {
        Alert.alert('Doctor Unlisted Data is Empty');
        navigation.navigate('AppNavScreen');
      } else {
        let result = await fetch(BASE_URL + 'data/sync/Unlisteddcr', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(doctorUnlisted),
        });

        result = await result.json();
        result.map(item => {
          console.log(item.status);
          if (item.status === 'SUCCESS') {
            db.transaction(tx => {
              tx.executeSql('DELETE from CRM_OfflineViewUnlistedDCR');
              console.log('Unlisted Doctor Data Saved');
            });
            db.transaction(tx => {
              tx.executeSql('DELETE from CRM_DoctorUnlistedDataSave');
              console.log('Unlisted Doctor Data Saved');
            });
            navigation.navigate('AppNavScreen');
          } else {
            Alert.alert(item.srl + ' ' + item.status);
            db.transaction(tx => {
              tx.executeSql('DELETE from CRM_OfflineViewUnlistedDCR');
              console.log('Unlisted Doctor Data Saved');
            });
            db.transaction(tx => {
              tx.executeSql('DELETE from CRM_DoctorUnlistedDataSave');
              console.log('Unlisted Doctor Data Saved');
            });
            navigation.navigate('AppNavScreen');
          }
        });
      }
    }
  };

  const retailerUAPICall = async () => {
    if (useManagerAccess === true) {
      if (unlistedMRetData.length === 0) {
        Alert.alert('Retailer Unlisted Data is Empty');
        navigation.navigate('AppNavScreen');
      } else {
        let result = await fetch(BASE_URL + 'data/sync/UnlistedManagerdcr', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(unlistedMRetData),
        });

        result = await result.json();
        result.map(item => {
          console.log(item.status);
          if (item.status === 'SUCCESS') {
            db.transaction(tx => {
              tx.executeSql('DELETE from CRM_ManagerRetailerUnlistedDataSave');
              console.log('Retailer Unlisted Data Saved');
            });
            db.transaction(tx => {
              tx.executeSql('DELETE from CRM_OfflineMangerViewUnlistedDCR');
              console.log('Retailer Unlisted Data Saved');
            });
            navigation.navigate('AppNavScreen');
          } else {
            Alert.alert(item.srl + ' ' + item.status);
            db.transaction(tx => {
              tx.executeSql('DELETE from CRM_ManagerRetailerUnlistedDataSave');
              console.log('Retailer Unlisted Data Saved');
            });
            db.transaction(tx => {
              tx.executeSql('DELETE from CRM_OfflineMangerViewUnlistedDCR');
              console.log('Retailer Unlisted Data Saved');
            });
            navigation.navigate('AppNavScreen');
          }
        });
      }
    } else {
      if (retailerUnlisted.length === 0) {
        Alert.alert('Retailer Data is Empty');
        navigation.navigate('AppNavScreen');
      } else {
        let result = await fetch(BASE_URL + 'data/sync/Unlisteddcr', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(retailerUnlisted),
        });

        result = await result.json();
        result.map(item => {
          console.log(item.status);
          if (item.status === 'SUCCESS') {
            db.transaction(tx => {
              tx.executeSql('DELETE from CRM_RetailerUnlistedDataSave');
              console.log('Unlisted Retailer Data Saved');
            });
            db.transaction(tx => {
              tx.executeSql('DELETE from CRM_OfflineViewUnlistedDCR');
              console.log('Unlisted Retailer Data Saved');
            });
            navigation.navigate('AppNavScreen');
          } else {
            Alert.alert(item.srl + ' ' + item.status);
            db.transaction(tx => {
              tx.executeSql('DELETE from CRM_RetailerUnlistedDataSave');
              console.log('Unlisted Retailer Data Saved');
            });
            db.transaction(tx => {
              tx.executeSql('DELETE from CRM_OfflineViewUnlistedDCR');
              console.log('Unlisted Retailer Data Saved');
            });
            navigation.navigate('AppNavScreen');
          }
        });
      }
    }
  };

  const saveOrderBooking = async () => {
    if (useOrderData.length === 0) {
      Alert.alert('Order Data is Empty');
      navigation.navigate('AppNavScreen');
    } else {
      try {
        let result = await fetch(BASE_URL + 'OrderBooking/Save', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(useOrderData),
        });

        result = await result.json();
        console.log(result.result);
        db.transaction(tx => {
          tx.executeSql('DELETE from OrderBookingDataSave');
          //console.log('Unlisted Retailer Data Saved');
        });
        if (result.result === '') {
          Alert.alert(
            'Success',
            'Record Successfully Saved',
            [
              {
                text: 'Ok',
                //onPress: () => navigation.navigate('Report DashBoard'),
                onPress: () => navigation.navigate('AppNavScreen'),
              },
            ],
            { cancelable: false },
          );
        } else if (
          result.result ===
          'Please Check Following : \r\nParty Code Not Found\r\nSales Order Series Not Found\r\n'
        ) {
          Alert.alert(
            'Success',
            'Record Successfully Saved',
            [
              {
                text: 'Ok',
                //onPress: () => navigation.navigate('Report DashBoard'),
                onPress: () => navigation.navigate('AppNavScreen'),
              },
            ],
            { cancelable: false },
          );
        } else {
          Alert.alert(result.result);
          navigation.navigate('AppNavScreen');
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  const saveExpenseBooking = async () => {
    if (useExpenseData.length === 0) {
      Alert.alert('Expense Data is Empty');
      navigation.navigate('AppNavScreen');
    } else {
      try {
        let result = await fetch(
          BASE_URL + 'ExpenseBooking/Mobile/OfflineSave',
          {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(useExpenseData),
          },
        );

        result = await result.json();
        console.log(result.result);
        db.transaction(tx => {
          tx.executeSql('DELETE from CRM_ExpenseDataSave');
          //console.log('Unlisted Retailer Data Saved');
        });
        db.transaction(tx => {
          tx.executeSql('DELETE from CRM_ExpenseDataShow');
          //console.log('Unlisted Retailer Data Saved');
        });
        if (result.result === '') {
          Alert.alert(
            'Success',
            'Record Successfully Saved',
            [
              {
                text: 'Ok',
                //onPress: () => navigation.navigate('Report DashBoard'),
                onPress: () => navigation.navigate('AppNavScreen'),
              },
            ],
            { cancelable: false },
          );
        } else {
          db.transaction(tx => {
            tx.executeSql('DELETE from CRM_ExpenseDataSave');
            //console.log('Unlisted Retailer Data Saved');
          });
          db.transaction(tx => {
            tx.executeSql('DELETE from CRM_ExpenseDataShow');
            //console.log('Unlisted Retailer Data Saved');
          });
          Alert.alert(result.result);
          navigation.navigate('AppNavScreen');
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  const saveExpenseReqBooking = async () => {
    if (useExpenseRequestData.length === 0) {
      Alert.alert('Expense Request Data is Empty');
      navigation.navigate('AppNavScreen');
    } else {
      try {
        let result = await fetch(
          BASE_URL + 'ExpenseBooking/Mobile/Requested/Save',
          {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(useExpenseRequestData),
          },
        );

        result = await result.json();
        console.log(result.result);
        db.transaction(tx => {
          tx.executeSql('DELETE from CRM_ExpenseRequestSave');
          //console.log('Unlisted Retailer Data Saved');
        });
        if (result.result === '') {
          Alert.alert(
            'Success',
            'Record Successfully Saved',
            [
              {
                text: 'Ok',
                //onPress: () => navigation.navigate('Report DashBoard'),
                onPress: () => navigation.navigate('AppNavScreen'),
              },
            ],
            { cancelable: false },
          );
        } else {
          Alert.alert(result.result);
          navigation.navigate('AppNavScreen');
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  // return (
  //   <SafeAreaView style={{ flex: 1 }}>
  //     <ImageBackground
  //       source={require('../images/bg2.png')}
  //       style={{ height: Dimensions.get('window').height }}>
  //       <SafeAreaView style={{ alignItems: 'center' }}>
  //         <CRMImg
  //           height={150}
  //           width={200}
  //         // style={{transform: [{rotate: '-5deg'}]}}
  //         />
  //       </SafeAreaView>
  //       <SafeAreaView style={{ marginTop: 100, marginLeft: 10, marginRight: 10 }}>
  //         <FlatList
  //           data={DATA}
  //           renderItem={({ item }) => (
  //             <TouchableWithoutFeedback onPress={() => syncData(item)}>
  //               <View style={[style.menu, { backgroundColor: '#FFA500' }]}>
  //                 <View
  //                   style={{
  //                     flexDirection: 'row',
  //                     justifyContent: 'flex-start',
  //                     marginLeft: 50,
  //                   }}>
  //                   <AntDesign
  //                     name="sync"
  //                     size={25}
  //                     color="#0048a7"
  //                     style={{ marginTop: 10 }}
  //                   />
  //                   <Text
  //                     style={[
  //                       style.menuItem,
  //                       {
  //                         color: '#fff',
  //                         marginLeft: 10,
  //                         fontFamily: 'Lato-Bold',
  //                       },
  //                     ]}>
  //                     {item.title}
  //                   </Text>
  //                 </View>
  //               </View>
  //             </TouchableWithoutFeedback>
  //           )}
  //           keyExtractor={item => item.id}
  //         />
  //       </SafeAreaView>
  //       <ProgressDialog visible={loading} message="Loading, please wait..." />
  //     </ImageBackground>
  //   </SafeAreaView>
  // );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ImageBackground
        source={require('../images/bg2.png')}
        style={{ height: Dimensions.get('window').height }}
      >
        <SafeAreaView style={{ alignItems: 'center' }}>
          <CRMImg height={150} width={200} />
        </SafeAreaView>

        {/* Initial loader gate – DO NOT render buttons until all tables are loaded */}
        {initialLoading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            {/* You can use your ProgressDialog or a simple ActivityIndicator */}
            <ActivityIndicator size="large" />
            <Text style={{ marginTop: 12, fontSize: 16 }}>Loading data, please wait...</Text>
          </View>
        ) : (
          <SafeAreaView style={{ marginTop: 100, marginLeft: 10, marginRight: 10 }}>
            <FlatList
              data={DATA}
              renderItem={({ item }) => (
                <TouchableWithoutFeedback onPress={() => syncData(item)}>
                  <View style={[style.menu, { backgroundColor: '#FFA500' }]}>
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-start', marginLeft: 50 }}>
                      <AntDesign name="sync" size={25} color="#0048a7" style={{ marginTop: 10 }} />
                      <Text
                        style={[
                          style.menuItem,
                          { color: '#fff', marginLeft: 10, fontFamily: 'Lato-Bold' },
                        ]}
                      >
                        {item.title}
                      </Text>
                    </View>
                  </View>
                </TouchableWithoutFeedback>
              )}
              keyExtractor={(item) => item.id}
            />
          </SafeAreaView>
        )}

        {/* Action loader (during sync calls) */}
        <ProgressDialog visible={loading || initialLoading} message="Loading, please wait..." />
      </ImageBackground>
    </SafeAreaView>
  );


};

export default SettingScreen;

const style = StyleSheet.create({
  container: { flex: 1, alignItems: 'center' },
  menu: { margin: 10, padding: 5, elevation: 5, borderRadius: 5 },
  menuItem: {
    fontSize: 18,
    fontFamily: 'Lato-Regular',
    color: '#000',
    margin: 5,
    padding: 5,
    textAlignVertical: 'center',
    textAlign: 'center',
    alignItems: 'center',
  },
  imageDesign: {
    width: 20,
    height: 20,
    padding: 20,
    justifyContent: 'center',
    alignSelf: 'center',
  },
});
