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
    StatusBar,
} from 'react-native';
import React, { useEffect, useState, useCallback, useRef } from 'react';
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
    { name: 'CRM_db', location: 'default' },
    () => console.log('Database connected!'),
    error => console.log('Database error', error),
);

const DATA = [
    { id: '0', title: 'DCR Sync....' },
    { id: '1', title: 'Master Data Sync....' },
    { id: '2', title: 'Order Booking Data Sync....' },
    { id: '3', title: 'Expense Booking Data Sync....' },
];

const SettingScreenNew = ({ navigation }) => {
    const [useBusinessID, setBusinessID] = useState('');
    const [useIDEmployee, setIDEmployee] = useState('');
    // make these ARRAYS, not strings
    const [startDay, setStartDay] = useState([]);
    const [startMDay, setMStartDay] = useState([]);
    const [useOthers, setOthers] = useState([]);
    const [doctorDCR, setDoctorDCR] = useState([]);
    const [doctorManagerDCR, setMangerDoctorDCR] = useState([]);
    const [useUnlistedDlist, setUnlistedDlist] = useState([]);
    const [useMUnlistedDlist, setMUnlistedDlist] = useState([]);
    const [useUnlistedRlist, setUnlistedRlist] = useState([]);
    const [useMUnlistedRlist, setMUnlistedRlist] = useState([]);
    const [doctorUnlisted, setDoctorUnlisted] = useState([]);
    const [retailerUnlisted, setRetailerUnlisted] = useState([]);
    const [retailerDCR, setRetailerDCR] = useState([]);
    const [managerretailerDCR, setmanagerRetailerDCR] = useState([]);
    const [doctorMaster, setDoctorMaster] = useState([]);
    const [retailerMaster, setRetailerMaster] = useState([]);
    //const [useManagerAccess, setuseManagerAccess] = useState(false);
    const [unlistedMDocData, setUnlistedMDocData] = useState([]);
    const [unlistedMRetData, setUnlistedMRetData] = useState([]);
    const [useStayData, setStayData] = useState([]);
    const [useOrderData, setOrderData] = useState([]);
    const [useExpenseData, setExpenseData] = useState([]);
    const [useExpenseRequestData, setExpenseRequestData] = useState([]);
    const [useManagerAccess, setuseManagerAccess] = useState('');
    // loaders
    const [initialLoading, setInitialLoading] = useState(true); // block buttons until all tables read
    const [loading, setLoading] = useState(false);              // action loader during sync
    const [progressNote, setProgressNote] = useState('');       // show “Loading x/y …” text

    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                navigation.navigate('AppNavScreen');
                return true;
            };
            BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
        }, [navigation]),
    );

    // useEffect(() => {
    //     (async () => {
    //         try {
    //             const value = await AsyncStorage.getItem('UserData');
    //             if (value) {
    //                 const user = JSON.parse(value);
    //                 setBusinessID(user.BusinessID);
    //                 setIDEmployee(user.IDEmployee);
    //                 setuseManagerAccess(!!user.ManagerAccess);
    //             }
    //         } catch (e) {
    //             console.log(e);
    //         }

    //         // load all tables with progress; keep the UI gated
    //         await fetchJsonDataFromSQLite();
    //         setInitialLoading(false);
    //     })();
    // }, []);

    // ---------- SQLite helpers ----------


    useEffect(() => {
        const loadData = async () => {
            try {
                // Load user data from AsyncStorage
                const value = await AsyncStorage.getItem('UserData');
                if (value) {
                    let user = JSON.parse(value);
                    setBusinessID(user.BusinessID);
                    setIDEmployee(user.IDEmployee);
                    setuseManagerAccess(user.ManagerAccess);
                }

                // Load all data from SQLite
                await fetchJsonDataFromSQLite1();

            } catch (error) {
                console.log("Error while loading initial data:", error);
            } finally {
                // Hide loader once everything is done
                setInitialLoading(false);
            }
        };

        loadData();
    }, []);


    // const extractRows = (result) => {
    //     try {
    //         const list = result?.rows;
    //         if (!list) return [];
    //         if (typeof list.raw === 'function') return list.raw();
    //         const arr = [];
    //         for (let i = 0; i < list.length; i++) arr.push(list.item(i));
    //         return arr;
    //     } catch {
    //         return [];
    //     }
    // };

    // /** Read a table, return parsed array; logs count nicely */
    // const readTable = (tableName, parser = JSON.parse) => {
    //     return new Promise((resolve) => {
    //         db.transaction(tx => {
    //             tx.executeSql(
    //                 `SELECT * FROM ${tableName}`,
    //                 [],
    //                 (_, result) => {
    //                     const rows = extractRows(result);
    //                     if (!rows.length) {
    //                         console.log(`— ${tableName}: empty`);
    //                         resolve([]);
    //                         return;
    //                     }
    //                     const parsed = parser ? rows.map(r => parser(r.data ?? r)) : rows;
    //                     console.log(`✅ ${tableName}: ${rows.length} rows`);
    //                     resolve(parsed);
    //                 },
    //                 (_, error) => {
    //                     console.warn(`⚠️ ${tableName}: ${error?.message || 'read error'}`);
    //                     resolve([]);
    //                 },
    //             );
    //         });
    //     });
    // };

    // Function to fetch JSON data from SQLite

    // Helper to wrap SQL in a Promise

    // Helper function to wrap tx.executeSql into a Promise


    // const executeSqlAsync = (query, params = []) => {
    //     return new Promise((resolve, reject) => {
    //         db.transaction(tx => {
    //             tx.executeSql(
    //                 query,
    //                 params,
    //                 (_, results) => resolve(results),
    //                 (_, error) => reject(error)
    //             );
    //         });
    //     });
    // };

    // const fetchJsonDataFromSQLite = async () => {
    //     try {
    //         // CRM_StartDay
    //         const startDayResults = await executeSqlAsync('SELECT * FROM CRM_StartDay');
    //         setStartDay(startDayResults.rows.raw());

    //         // CRM_ManagerStartDay
    //         const mStartDayResults = await executeSqlAsync('SELECT * FROM CRM_ManagerStartDay');
    //         setMStartDay(mStartDayResults.rows.raw());

    //         // CRM_DoctorDataSave
    //         const doctorResults = await executeSqlAsync('SELECT * FROM CRM_DoctorDataSave');
    //         setDoctorDCR(doctorResults.rows.raw().map(row => JSON.parse(row.data)));

    //         // CRM_ManagerDoctorDataSave
    //         const mDoctorResults = await executeSqlAsync('SELECT * FROM CRM_ManagerDoctorDataSave');
    //         setMangerDoctorDCR(mDoctorResults.rows.raw().map(row => JSON.parse(row.data)));

    //         // CRM_RetailerDataSave
    //         const retailerResults = await executeSqlAsync('SELECT * FROM CRM_RetailerDataSave');
    //         setRetailerDCR(retailerResults.rows.raw().map(row => JSON.parse(row.data)));

    //         // CRM_MangerRetailerDataSave
    //         const mRetailerResults = await executeSqlAsync('SELECT * FROM CRM_MangerRetailerDataSave');
    //         setmanagerRetailerDCR(mRetailerResults.rows.raw().map(row => JSON.parse(row.data)));

    //         // CRM_MasterDoctorDataSave
    //         const doctorMasterResults = await executeSqlAsync('SELECT * FROM CRM_MasterDoctorDataSave');
    //         setDoctorMaster(doctorMasterResults.rows.raw().map(row => JSON.parse(row.data)));

    //         // CRM_MasterRetailerDataSave
    //         const retailerMasterResults = await executeSqlAsync('SELECT * FROM CRM_MasterRetailerDataSave');
    //         setRetailerMaster(retailerMasterResults.rows.raw().map(row => JSON.parse(row.data)));

    //         // CRM_Others
    //         const othersResults = await executeSqlAsync('SELECT * FROM CRM_Others');
    //         setOthers(othersResults.rows.raw().map(row => JSON.parse(row.data)));

    //         // CRM_UnlistedDoctor
    //         const unlistedDoctorResults = await executeSqlAsync('SELECT * FROM CRM_UnlistedDoctor');
    //         setUnlistedDlist(unlistedDoctorResults.rows.raw());

    //         // CRM_UnlistedRetailer
    //         const unlistedRetailerResults = await executeSqlAsync('SELECT * FROM CRM_UnlistedRetailer');
    //         setUnlistedRlist(unlistedRetailerResults.rows.raw());

    //         // CRM_ManagerUnlistedDoctor
    //         const mUnlistedDoctorResults = await executeSqlAsync('SELECT * FROM CRM_ManagerUnlistedDoctor');
    //         setMUnlistedDlist(mUnlistedDoctorResults.rows.raw());

    //         // CRM_ManagerUnlistedRetailer
    //         const mUnlistedRetailerResults = await executeSqlAsync('SELECT * FROM CRM_ManagerUnlistedRetailer');
    //         setMUnlistedRlist(mUnlistedRetailerResults.rows.raw());

    //         // CRM_DoctorUnlistedDataSave
    //         const doctorUnlistedResults = await executeSqlAsync('SELECT * FROM CRM_DoctorUnlistedDataSave');
    //         setDoctorUnlisted(doctorUnlistedResults.rows.raw().map(row => JSON.parse(row.data)));

    //         // CRM_RetailerUnlistedDataSave
    //         const retailerUnlistedResults = await executeSqlAsync('SELECT * FROM CRM_RetailerUnlistedDataSave');
    //         setRetailerUnlisted(retailerUnlistedResults.rows.raw().map(row => JSON.parse(row.data)));

    //         // CRM_ManagerDoctorUnlistedDataSave
    //         const mDoctorUnlistedResults = await executeSqlAsync('SELECT * FROM CRM_ManagerDoctorUnlistedDataSave');
    //         setUnlistedMDocData(mDoctorUnlistedResults.rows.raw().map(row => JSON.parse(row.data)));

    //         // CRM_ManagerRetailerUnlistedDataSave
    //         const mRetailerUnlistedResults = await executeSqlAsync('SELECT * FROM CRM_ManagerRetailerUnlistedDataSave');
    //         setUnlistedMRetData(mRetailerUnlistedResults.rows.raw().map(row => JSON.parse(row.data)));

    //         // CRM_StayDataSave
    //         const stayResults = await executeSqlAsync('SELECT * FROM CRM_StayDataSave');
    //         setStayData(stayResults.rows.raw().map(row => JSON.parse(row.data)));

    //         // OrderBookingDataSave
    //         const orderResults = await executeSqlAsync('SELECT data FROM OrderBookingDataSave');
    //         setOrderData(orderResults.rows.raw().map(row => JSON.parse(row.data)).flat());

    //         // CRM_ExpenseDataSave
    //         const expenseResults = await executeSqlAsync('SELECT data FROM CRM_ExpenseDataSave');
    //         setExpenseData(expenseResults.rows.raw().map(row => JSON.parse(row.data)).flat());

    //         // CRM_ExpenseRequestSave
    //         const expenseReqResults = await executeSqlAsync('SELECT data FROM CRM_ExpenseRequestSave');
    //         const flattened = expenseReqResults.rows.raw().map(row => JSON.parse(row.data)).flat();
    //         const uniqueBookings = flattened.filter(
    //             (booking, index, self) =>
    //                 index === self.findIndex(b => b.IDBooking === booking.IDBooking)
    //         );
    //         setExpenseRequestData(uniqueBookings);

    //         console.log("✅ All SQLite data loaded.");
    //     } catch (error) {
    //         console.log("❌ SQLite load error:", error);
    //     }
    // };

    const fetchJsonDataFromSQLite = () => {
        //Fetch CRM_StartDay
        db.transaction(tx => {
            tx.executeSql(
                'SELECT * FROM CRM_StartDay',
                [],
                (_, results) => {
                    if (results.rows.length > 0) {
                        //console.warn('Table has data');
                        var temp = [];
                        for (let i = 0; i < results.rows.length; ++i) {
                            temp.push(results.rows.item(i));
                        }
                        setStartDay(temp);
                        //console.log(temp);
                    }
                },
                (_, error) => {
                    console.log('Error fetching data:', error);
                },
            );
        });

        //Fetch CRM_ManagerStartDay
        db.transaction(tx => {
            tx.executeSql(
                'SELECT * FROM CRM_ManagerStartDay',
                [],
                (_, results) => {
                    if (results.rows.length > 0) {
                        //console.warn('Table has data');
                        var temp = [];
                        for (let i = 0; i < results.rows.length; ++i) {
                            temp.push(results.rows.item(i));
                        }
                        setMStartDay(temp);
                        //console.log(temp);
                    }
                },
                (_, error) => {
                    console.log('Error fetching data:', error);
                },
            );
        });

        //Fetch CRM_DoctorDataSave
        db.transaction(tx => {
            tx.executeSql(
                'SELECT * FROM CRM_DoctorDataSave',
                [],
                (_, result) => {
                    const rows = result.rows.raw();
                    const jsonDataArray = rows.map(row => JSON.parse(row.data));
                    //const jsonDataArray = rows.map(row => row.data);
                    //console.log('JSON data from the database:', jsonDataArray);
                    setDoctorDCR(jsonDataArray);
                },
                (_, error) => {
                    console.log('Error fetching data:', error);
                },
            );
        });

        //Fetch CRM_ManagerDoctorDataSave
        db.transaction(tx => {
            tx.executeSql(
                'SELECT * FROM CRM_ManagerDoctorDataSave',
                [],
                (_, result) => {
                    const rows = result.rows.raw();
                    const jsonDataArray = rows.map(row => JSON.parse(row.data));
                    //const jsonDataArray = rows.map(row => row.data);
                    console.log('JSON data from the database:', jsonDataArray);
                    setMangerDoctorDCR(jsonDataArray);
                },
                (_, error) => {
                    console.log('Error fetching data:', error);
                },
            );
        });

        //Fetch CRM_RetailerDataSave
        db.transaction(tx => {
            tx.executeSql(
                'SELECT * FROM CRM_RetailerDataSave',
                [],
                (_, result) => {
                    const rows = result.rows.raw();
                    const jsonDataArray = rows.map(row => JSON.parse(row.data));
                    //const jsonDataArray = rows.map(row => row.data);
                    //console.log('JSON data from the database:', jsonDataArray);
                    setRetailerDCR(jsonDataArray);
                },
                (_, error) => {
                    console.log('Error fetching data:', error);
                },
            );
        });

        //Fetch CRM_MangerRetailerDataSave
        db.transaction(tx => {
            tx.executeSql(
                'SELECT * FROM CRM_MangerRetailerDataSave',
                [],
                (_, result) => {
                    const rows = result.rows.raw();
                    const jsonDataArray = rows.map(row => JSON.parse(row.data));
                    //const jsonDataArray = rows.map(row => row.data);
                    //console.log('JSON data from the database:', jsonDataArray);
                    setmanagerRetailerDCR(jsonDataArray);
                },
                (_, error) => {
                    console.log('Error fetching data:', error);
                },
            );
        });

        //Fetch CRM_MasterDoctorDataSave
        db.transaction(tx => {
            tx.executeSql(
                'SELECT * FROM CRM_MasterDoctorDataSave',
                [],
                (_, result) => {
                    const rows = result.rows.raw();
                    const jsonDataArray = rows.map(row => JSON.parse(row.data));
                    //const jsonDataArray = rows.map(row => row.data);
                    //console.log('JSON data from the database:', jsonDataArray);
                    setDoctorMaster(jsonDataArray);
                },
                (_, error) => {
                    console.log('Error fetching data:', error);
                },
            );
        });

        //Fetch CRM_MasterRetailerDataSave
        db.transaction(tx => {
            tx.executeSql(
                'SELECT * FROM CRM_MasterRetailerDataSave',
                [],
                (_, result) => {
                    const rows = result.rows.raw();
                    const jsonDataArray = rows.map(row => JSON.parse(row.data));
                    //const jsonDataArray = rows.map(row => row.data);
                    //console.log('JSON data from the database:', jsonDataArray);
                    setRetailerMaster(jsonDataArray);
                },
                (_, error) => {
                    console.log('Error fetching data:', error);
                },
            );
        });

        //Fetch CRM_Others
        db.transaction(tx => {
            tx.executeSql(
                'SELECT * FROM CRM_Others',
                [],
                (_, result) => {
                    const rows = result.rows.raw();
                    const jsonDataArray = rows.map(row => JSON.parse(row.data));
                    //const jsonDataArray = rows.map(row => row.data);
                    //console.log('JSON data from the database:', jsonDataArray);
                    setOthers(jsonDataArray);
                },
                (_, error) => {
                    console.log('Error fetching data:', error);
                },
            );
        });

        //Fetch CRM_UnlistedDoctor
        db.transaction(tx => {
            tx.executeSql(
                'SELECT * FROM CRM_UnlistedDoctor',
                [],
                (_, results) => {
                    if (results.rows.length > 0) {
                        //console.warn('Table has data');
                        var temp = [];
                        for (let i = 0; i < results.rows.length; ++i) {
                            temp.push(results.rows.item(i));
                        }
                        setUnlistedDlist(temp);
                        console.log(temp);
                    }
                },
                (_, error) => {
                    console.log('Error fetching data:', error);
                },
            );
        });

        //Fetch CRM_UnlistedRetailer
        db.transaction(tx => {
            tx.executeSql(
                'SELECT * FROM CRM_UnlistedRetailer',
                [],
                (_, results) => {
                    if (results.rows.length > 0) {
                        //console.warn('Table has data');
                        var temp = [];
                        for (let i = 0; i < results.rows.length; ++i) {
                            temp.push(results.rows.item(i));
                        }
                        setUnlistedRlist(temp);
                        console.log(temp);
                    }
                },
                (_, error) => {
                    console.log('Error fetching data:', error);
                },
            );
        });

        //Fetch CRM_ManagerUnlistedDoctor
        db.transaction(tx => {
            tx.executeSql(
                'SELECT * FROM CRM_ManagerUnlistedDoctor',
                [],
                (_, results) => {
                    if (results.rows.length > 0) {
                        //console.warn('Table has data');
                        var temp = [];
                        for (let i = 0; i < results.rows.length; ++i) {
                            temp.push(results.rows.item(i));
                        }
                        setMUnlistedDlist(temp);
                        //console.log(temp);
                    }
                },
                (_, error) => {
                    console.log('Error fetching data:', error);
                },
            );
        });

        //Fetch CRM_ManagerUnlistedRetailer
        db.transaction(tx => {
            tx.executeSql(
                'SELECT * FROM CRM_ManagerUnlistedRetailer',
                [],
                (_, results) => {
                    if (results.rows.length > 0) {
                        //console.warn('Table has data');
                        var temp = [];
                        for (let i = 0; i < results.rows.length; ++i) {
                            temp.push(results.rows.item(i));
                        }
                        setMUnlistedRlist(temp);
                        //console.log(temp);
                    }
                },
                (_, error) => {
                    console.log('Error fetching data:', error);
                },
            );
        });

        //Fetch CRM_DoctorUnlistedDataSave
        db.transaction(tx => {
            tx.executeSql(
                'SELECT * FROM CRM_DoctorUnlistedDataSave',
                [],
                (_, result) => {
                    const rows = result.rows.raw();
                    const jsonDataArray = rows.map(row => JSON.parse(row.data));
                    //const jsonDataArray = rows.map(row => row.data);
                    //console.log('JSON data from the database:', jsonDataArray);
                    setDoctorUnlisted(jsonDataArray);
                },
                (_, error) => {
                    console.log('Error fetching data:', error);
                },
            );
        });

        //Fetch CRM_RetailerUnlistedDataSave
        db.transaction(tx => {
            tx.executeSql(
                'SELECT * FROM CRM_RetailerUnlistedDataSave',
                [],
                (_, result) => {
                    const rows = result.rows.raw();
                    const jsonDataArray = rows.map(row => JSON.parse(row.data));
                    //const jsonDataArray = rows.map(row => row.data);
                    //console.log('JSON data from the database:', jsonDataArray);
                    setRetailerUnlisted(jsonDataArray);
                },
                (_, error) => {
                    console.log('Error fetching data:', error);
                },
            );
        });

        //Fetch CRM_ManagerDoctorUnlistedDataSave
        db.transaction(tx => {
            tx.executeSql(
                'SELECT * FROM CRM_ManagerDoctorUnlistedDataSave',
                [],
                (_, result) => {
                    const rows = result.rows.raw();
                    const jsonDataArray = rows.map(row => JSON.parse(row.data));
                    //const jsonDataArray = rows.map(row => row.data);
                    //console.log('JSON data from the database:', jsonDataArray);
                    setUnlistedMDocData(jsonDataArray);
                },
                (_, error) => {
                    console.log('Error fetching data:', error);
                },
            );
        });

        //Fetch CRM_ManagerRetailerUnlistedDataSave
        db.transaction(tx => {
            tx.executeSql(
                'SELECT * FROM CRM_ManagerRetailerUnlistedDataSave',
                [],
                (_, result) => {
                    const rows = result.rows.raw();
                    const jsonDataArray = rows.map(row => JSON.parse(row.data));
                    //const jsonDataArray = rows.map(row => row.data);
                    //console.log('JSON data from the database:', jsonDataArray);
                    setUnlistedMRetData(jsonDataArray);
                    //console.log(temp);
                },
                (_, error) => {
                    console.log('Error fetching data:', error);
                },
            );
        });

        //Fetch CRM_StayDataSave
        db.transaction(tx => {
            tx.executeSql(
                'SELECT * FROM CRM_StayDataSave',
                [],
                (_, result) => {
                    const rows = result.rows.raw();
                    const jsonDataArray = rows.map(row => JSON.parse(row.data));
                    //const jsonDataArray = rows.map(row => row.data);
                    //console.log('JSON data from the database:', jsonDataArray);
                    setStayData(jsonDataArray);
                    //console.log(temp);
                },
                (_, error) => {
                    console.log('Error fetching data:', error);
                },
            );
        });

        //Fetch OrderBookingDataSave
        db.transaction(tx => {
            tx.executeSql(
                'SELECT data FROM OrderBookingDataSave',
                [],
                (_, result) => {
                    const rows = result.rows.raw();
                    const jsonDataArray = rows.map(row => JSON.parse(row.data));
                    //const jsonDataArray = rows.map(row => row.data);
                    //setOrderData(jsonDataArray);
                    // Flatten the array
                    const flattenedArray = jsonDataArray.flat();

                    // Set the flattened array to state
                    setOrderData(flattenedArray);
                    //console.log('JSON data from the database:', flattenedArray);
                    //setDoctorDCR(jsonDataArray);
                },
                (_, error) => {
                    console.log('Error fetching data:', error);
                },
            );
        });

        //Fetch CRM_ExpenseDataSave
        db.transaction(tx => {
            tx.executeSql(
                'SELECT data FROM CRM_ExpenseDataSave',
                [],
                (_, result) => {
                    const rows = result.rows.raw();
                    const jsonDataArray = rows.map(row => JSON.parse(row.data));
                    //const jsonDataArray = rows.map(row => row.data);
                    //setOrderData(jsonDataArray);
                    // Flatten the array
                    const flattenedArray = jsonDataArray.flat();
                    // Set the flattened array to state
                    setExpenseData(flattenedArray);
                    console.log('JSON data from the database:', flattenedArray);
                    //setDoctorDCR(jsonDataArray);
                },
                (_, error) => {
                    console.log('Error fetching data:', error);
                },
            );
        });

        //Fetch CRM_ExpenseRequestSave
        db.transaction(tx => {
            tx.executeSql(
                'SELECT data FROM CRM_ExpenseRequestSave',
                [],
                (_, result) => {
                    const rows = result.rows.raw();
                    const jsonDataArray = rows.map(row => JSON.parse(row.data));
                    //const jsonDataArray = rows.map(row => row.data);
                    //setOrderData(jsonDataArray);
                    // Flatten the array
                    const flattenedArray = jsonDataArray.flat();
                    // Using a Set to keep track of unique IDs
                    const uniqueBookings = flattenedArray.filter(
                        (booking, index, self) =>
                            index === self.findIndex(b => b.IDBooking === booking.IDBooking),
                    );
                    // Set the flattened array to state
                    //setExpenseData(flattenedArray);
                    console.log('JSON data :', flattenedArray);
                    console.log('JSON data from the database:', uniqueBookings);
                    setExpenseRequestData(uniqueBookings);
                },
                (_, error) => {
                    console.log('Error fetching data:', error);
                },
            );
        });
    };

    const fetchJsonDataFromSQLite1 = () => {
        return Promise.all([

            //Fetch CRM_StartDay
            new Promise((resolve, reject) => {
                //Fetch CRM_StartDay
                db.transaction(tx => {
                    tx.executeSql(
                        'SELECT * FROM CRM_StartDay',
                        [],
                        (_, results) => {
                            if (results.rows.length > 0) {
                                //console.warn('Table has data');
                                var temp = [];
                                for (let i = 0; i < results.rows.length; ++i) {
                                    temp.push(results.rows.item(i));
                                }
                                setStartDay(temp);
                                //console.log(temp);
                                resolve();
                            }
                        },
                        (_, error) => {
                            console.log('Error fetching data:', error);
                            reject(error);
                        },
                    );
                });
            }),

            //Fetch CRM_ManagerStartDay
            new Promise((resolve, reject) => {
                db.transaction(tx => {
                    tx.executeSql(
                        'SELECT * FROM CRM_ManagerStartDay',
                        [],
                        (_, results) => {
                            let temp = [];
                            for (let i = 0; i < results.rows.length; ++i) {
                                temp.push(results.rows.item(i));
                            }
                            setMStartDay(temp);
                            resolve();
                        },
                        (_, error) => {
                            console.log('Error fetching CRM_ManagerStartDay:', error);
                            reject(error);
                        }
                    );
                });
            }),

            //Fetch CRM_DoctorDataSave
            new Promise((resolve, reject) => {
                //Fetch CRM_DoctorDataSave
                db.transaction(tx => {
                    tx.executeSql(
                        "SELECT * FROM CRM_DoctorDataSave",
                        [],
                        (_, result) => {
                            const rows = result.rows.raw();
                            const jsonDataArray = rows.map(row => {
                                let obj = JSON.parse(row.data);

                                // flatten nested arrays like [[{...}]] -> [{...}]
                                ["products", "productsCurrentStatus", "productsFinalStatus"].forEach(key => {
                                    if (
                                        Array.isArray(obj[key]) &&
                                        obj[key].length === 1 &&
                                        Array.isArray(obj[key][0])
                                    ) {
                                        obj[key] = obj[key][0];
                                    }
                                });

                                return obj;
                            });

                            console.log("Clean JSON from DB:", JSON.stringify(jsonDataArray, null, 2));

                            setDoctorDCR(jsonDataArray);
                            resolve();
                        },
                        (_, error) => {
                            console.log("Error fetching data:", error);
                            reject(error);
                        }
                    );
                });


            }),

            //Fetch CRM_ManagerDoctorDataSave
            new Promise((resolve, reject) => {
                db.transaction(tx => {
                    tx.executeSql(
                        'SELECT * FROM CRM_ManagerDoctorDataSave',
                        [],
                        (_, result) => {
                            const rows = result.rows.raw();
                            const jsonDataArray = rows.map(row => JSON.parse(row.data));
                            //const jsonDataArray = rows.map(row => row.data);
                            console.log('JSON data from the database:', jsonDataArray);
                            setMangerDoctorDCR(jsonDataArray);
                            resolve();
                        },
                        (_, error) => {
                            console.log('Error fetching data:', error);
                            reject(error);
                        },
                    );
                });
            }),


            //Fetch CRM_RetailerDataSave
            new Promise((resolve, reject) => {
                db.transaction(tx => {
                    tx.executeSql(
                        'SELECT * FROM CRM_RetailerDataSave',
                        [],
                        (_, result) => {
                            const rows = result.rows.raw();
                            const jsonDataArray = rows.map(row => JSON.parse(row.data));
                            //const jsonDataArray = rows.map(row => row.data);
                            //console.log('JSON data from the database:', jsonDataArray);
                            setRetailerDCR(jsonDataArray);
                            resolve();
                        },
                        (_, error) => {
                            console.log('Error fetching data:', error);
                            reject(error);
                        },
                    );
                });
            }),

            //Fetch CRM_MangerRetailerDataSave
            new Promise((resolve, reject) => {
                db.transaction(tx => {
                    tx.executeSql(
                        'SELECT * FROM CRM_MangerRetailerDataSave',
                        [],
                        (_, result) => {
                            const rows = result.rows.raw();
                            const jsonDataArray = rows.map(row => JSON.parse(row.data));
                            //const jsonDataArray = rows.map(row => row.data);
                            //console.log('JSON data from the database:', jsonDataArray);
                            setmanagerRetailerDCR(jsonDataArray);
                            resolve();
                        },
                        (_, error) => {
                            console.log('Error fetching data:', error);
                            reject(error);
                        },
                    );
                });
            }),

            //Fetch CRM_MasterDoctorDataSave
            new Promise((resolve, reject) => {
                db.transaction(tx => {
                    tx.executeSql(
                        'SELECT * FROM CRM_MasterDoctorDataSave',
                        [],
                        (_, result) => {
                            const rows = result.rows.raw();
                            const jsonDataArray = rows.map(row => JSON.parse(row.data));
                            //const jsonDataArray = rows.map(row => row.data);
                            //console.log('JSON data from the database:', jsonDataArray);
                            setDoctorMaster(jsonDataArray);
                            resolve();
                        },
                        (_, error) => {
                            console.log('Error fetching data:', error);
                            reject(error);
                        },
                    );
                });
            }),

            //Fetch CRM_MasterRetailerDataSave
            new Promise((resolve, reject) => {
                db.transaction(tx => {
                    tx.executeSql(
                        'SELECT * FROM CRM_MasterRetailerDataSave',
                        [],
                        (_, result) => {
                            const rows = result.rows.raw();
                            const jsonDataArray = rows.map(row => JSON.parse(row.data));
                            //const jsonDataArray = rows.map(row => row.data);
                            //console.log('JSON data from the database:', jsonDataArray);
                            setRetailerMaster(jsonDataArray);
                            resolve();
                        },
                        (_, error) => {
                            console.log('Error fetching data:', error);
                            reject(error);
                        },
                    );
                });

            }),

            //Fetch CRM_Others
            new Promise((resolve, reject) => {
                db.transaction(tx => {
                    tx.executeSql(
                        'SELECT * FROM CRM_Others',
                        [],
                        (_, result) => {
                            const rows = result.rows.raw();
                            const jsonDataArray = rows.map(row => JSON.parse(row.data));
                            //const jsonDataArray = rows.map(row => row.data);
                            //console.log('JSON data from the database:', jsonDataArray);
                            setOthers(jsonDataArray);
                            resolve();
                        },
                        (_, error) => {
                            console.log('Error fetching data:', error);
                            reject(error);
                        },
                    );
                });
            }),

            //Fetch CRM_UnlistedDoctor
            new Promise((resolve, reject) => {
                db.transaction(tx => {
                    tx.executeSql(
                        'SELECT * FROM CRM_UnlistedDoctor',
                        [],
                        (_, results) => {
                            if (results.rows.length > 0) {
                                //console.warn('Table has data');
                                var temp = [];
                                for (let i = 0; i < results.rows.length; ++i) {
                                    temp.push(results.rows.item(i));
                                }
                                setUnlistedDlist(temp);
                                //console.log(temp);
                                resolve();
                            }
                        },
                        (_, error) => {
                            console.log('Error fetching data:', error);
                            reject(error);
                        },
                    );
                });
            }),

            //Fetch CRM_UnlistedRetailer
            new Promise((resolve, reject) => {
                db.transaction(tx => {
                    tx.executeSql(
                        'SELECT * FROM CRM_UnlistedRetailer',
                        [],
                        (_, results) => {
                            if (results.rows.length > 0) {
                                //console.warn('Table has data');
                                var temp = [];
                                for (let i = 0; i < results.rows.length; ++i) {
                                    temp.push(results.rows.item(i));
                                }
                                setUnlistedRlist(temp);
                                resolve();
                                //console.log(temp);
                            }
                        },
                        (_, error) => {
                            console.log('Error fetching data:', error);
                            reject(error);
                        },
                    );
                });
            }),

            //Fetch CRM_ManagerUnlistedDoctor
            new Promise((resolve, reject) => {
                db.transaction(tx => {
                    tx.executeSql(
                        'SELECT * FROM CRM_ManagerUnlistedDoctor',
                        [],
                        (_, results) => {
                            if (results.rows.length > 0) {
                                //console.warn('Table has data');
                                var temp = [];
                                for (let i = 0; i < results.rows.length; ++i) {
                                    temp.push(results.rows.item(i));
                                }
                                setMUnlistedDlist(temp);
                                //console.log(temp);
                                resolve();
                            }
                        },
                        (_, error) => {
                            console.log('Error fetching data:', error);
                            reject(error);
                        },
                    );
                });
            }),

            //Fetch CRM_ManagerUnlistedRetailer
            new Promise((resolve, reject) => {
                db.transaction(tx => {
                    tx.executeSql(
                        'SELECT * FROM CRM_ManagerUnlistedRetailer',
                        [],
                        (_, results) => {
                            if (results.rows.length > 0) {
                                //console.warn('Table has data');
                                var temp = [];
                                for (let i = 0; i < results.rows.length; ++i) {
                                    temp.push(results.rows.item(i));
                                }
                                setMUnlistedRlist(temp);
                                //console.log(temp);
                                resolve();
                            }
                        },
                        (_, error) => {
                            console.log('Error fetching data:', error);
                            reject(error);
                        },
                    );
                });
            }),

            //Fetch CRM_DoctorUnlistedDataSave
            new Promise((resolve, reject) => {
                db.transaction(tx => {
                    tx.executeSql(
                        'SELECT * FROM CRM_DoctorUnlistedDataSave',
                        [],
                        (_, result) => {
                            const rows = result.rows.raw();
                            const jsonDataArray = rows.map(row => JSON.parse(row.data));
                            //const jsonDataArray = rows.map(row => row.data);
                            //console.log('JSON data from the database:', jsonDataArray);
                            setDoctorUnlisted(jsonDataArray);
                            resolve();
                        },
                        (_, error) => {
                            console.log('Error fetching data:', error);
                            reject(error);
                        },
                    );
                });
            }),

            //Fetch CRM_RetailerUnlistedDataSave
            new Promise((resolve, reject) => {
                db.transaction(tx => {
                    tx.executeSql(
                        'SELECT * FROM CRM_RetailerUnlistedDataSave',
                        [],
                        (_, result) => {
                            const rows = result.rows.raw();
                            const jsonDataArray = rows.map(row => JSON.parse(row.data));
                            //const jsonDataArray = rows.map(row => row.data);
                            //console.log('JSON data from the database:', jsonDataArray);
                            setRetailerUnlisted(jsonDataArray);
                            resolve();
                        },
                        (_, error) => {
                            console.log('Error fetching data:', error);
                            reject(error);
                        },
                    );
                });
            }),

            //Fetch CRM_ManagerDoctorUnlistedDataSave
            new Promise((resolve, reject) => {
                db.transaction(tx => {
                    tx.executeSql(
                        'SELECT * FROM CRM_ManagerDoctorUnlistedDataSave',
                        [],
                        (_, result) => {
                            const rows = result.rows.raw();
                            const jsonDataArray = rows.map(row => JSON.parse(row.data));
                            //const jsonDataArray = rows.map(row => row.data);
                            //console.log('JSON data from the database:', jsonDataArray);
                            setUnlistedMDocData(jsonDataArray);
                            resolve();
                        },
                        (_, error) => {
                            console.log('Error fetching data:', error);
                            reject(error);
                        },
                    );
                });
            }),

            //Fetch CRM_ManagerRetailerUnlistedDataSave
            new Promise((resolve, reject) => {
                db.transaction(tx => {
                    tx.executeSql(
                        'SELECT * FROM CRM_ManagerRetailerUnlistedDataSave',
                        [],
                        (_, result) => {
                            const rows = result.rows.raw();
                            const jsonDataArray = rows.map(row => JSON.parse(row.data));
                            //const jsonDataArray = rows.map(row => row.data);
                            //console.log('JSON data from the database:', jsonDataArray);
                            setUnlistedMRetData(jsonDataArray);
                            //console.log(temp);
                            resolve();
                        },
                        (_, error) => {
                            console.log('Error fetching data:', error);
                            reject(error);
                        },
                    );
                });
            }),

            //Fetch CRM_StayDataSave
            new Promise((resolve, reject) => {
                db.transaction(tx => {
                    tx.executeSql(
                        'SELECT * FROM CRM_StayDataSave',
                        [],
                        (_, result) => {
                            const rows = result.rows.raw();
                            const jsonDataArray = rows.map(row => JSON.parse(row.data));
                            //const jsonDataArray = rows.map(row => row.data);
                            //console.log('JSON data from the database:', jsonDataArray);
                            setStayData(jsonDataArray);
                            resolve();
                        },
                        (_, error) => {
                            console.log('Error fetching data:', error);
                            reject(error);
                        },
                    );
                });
            }),

            //Fetch OrderBookingDataSave
            new Promise((resolve, reject) => {
                db.transaction(tx => {
                    tx.executeSql(
                        'SELECT data FROM OrderBookingDataSave',
                        [],
                        (_, result) => {
                            const rows = result.rows.raw();
                            const jsonDataArray = rows.map(row => JSON.parse(row.data));
                            //const jsonDataArray = rows.map(row => row.data);
                            //setOrderData(jsonDataArray);
                            // Flatten the array
                            const flattenedArray = jsonDataArray.flat();

                            // Set the flattened array to state
                            setOrderData(flattenedArray);
                            //console.log('JSON data from the database:', flattenedArray);
                            //setDoctorDCR(jsonDataArray);
                            resolve();
                        },
                        (_, error) => {
                            console.log('Error fetching data:', error);
                            reject(error);
                        },
                    );
                });
            }),

            //Fetch CRM_ExpenseDataSave
            new Promise((resolve, reject) => {
                db.transaction(tx => {
                    tx.executeSql(
                        'SELECT data FROM CRM_ExpenseDataSave',
                        [],
                        (_, result) => {
                            const rows = result.rows.raw();
                            const jsonDataArray = rows.map(row => JSON.parse(row.data));
                            //const jsonDataArray = rows.map(row => row.data);
                            //setOrderData(jsonDataArray);
                            // Flatten the array
                            const flattenedArray = jsonDataArray.flat();
                            // Set the flattened array to state
                            setExpenseData(flattenedArray);
                            console.log('JSON data from the database:', flattenedArray);
                            //setDoctorDCR(jsonDataArray);
                            resolve();
                        },
                        (_, error) => {
                            console.log('Error fetching data:', error);
                            reject(error);
                        },
                    );
                });
            }),

            //Fetch CRM_ExpenseRequestSave
            new Promise((resolve, reject) => {
                db.transaction(tx => {
                    tx.executeSql(
                        'SELECT data FROM CRM_ExpenseRequestSave',
                        [],
                        (_, result) => {
                            const rows = result.rows.raw();
                            const jsonDataArray = rows.map(row => JSON.parse(row.data));
                            //const jsonDataArray = rows.map(row => row.data);
                            //setOrderData(jsonDataArray);
                            // Flatten the array
                            const flattenedArray = jsonDataArray.flat();
                            // Using a Set to keep track of unique IDs
                            const uniqueBookings = flattenedArray.filter(
                                (booking, index, self) =>
                                    index === self.findIndex(b => b.IDBooking === booking.IDBooking),
                            );
                            // Set the flattened array to state
                            //setExpenseData(flattenedArray);
                            console.log('JSON data :', flattenedArray);
                            console.log('JSON data from the database:', uniqueBookings);
                            setExpenseRequestData(uniqueBookings);
                            resolve();
                        },
                        (_, error) => {
                            console.log('Error fetching data:', error);
                            reject(error);
                        },
                    );
                });
            }),


            // Add more tables here in the same way...

        ]);
    };


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

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <StatusBar backgroundColor="#a9ddfaff" barStyle="light-content" />
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
                        <ActivityIndicator size="large" />
                        <Text style={{ marginTop: 10, fontSize: 15 }}>{progressNote || 'Loading data...'}</Text>
                    </View>
                ) : (
                    <SafeAreaView style={{ marginTop: 100, marginLeft: 10, marginRight: 10 }}>
                        <FlatList
                            data={DATA}
                            renderItem={({ item }) => (
                                <TouchableWithoutFeedback onPress={() => syncData(item)}>
                                    <View style={[style.menu, { backgroundColor: '#005696' }]}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'flex-start', marginLeft: 50 }}>
                                            <AntDesign name="sync" size={25} color='#ffffff' style={{ marginTop: 10 }} />
                                            <Text style={[style.menuItem, { color: '#ffffff', marginLeft: 10, fontFamily: 'Lato-Bold' }]}>
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

export default SettingScreenNew;

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


