import React, { useCallback, useEffect, useState, useLayoutEffect } from 'react';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import {
    View,
    Text,
    StyleSheet,
    Alert,
    TouchableOpacity,
    ActivityIndicator,
    SafeAreaView,
    Modal,
    FlatList,
    Platform,
    ScrollView,
    BackHandler,
    PermissionsAndroid,
    StatusBar,
} from 'react-native';
import axios from 'axios';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Sales_URL } from '@env';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
//import PushNotification from 'react-native-push-notification';
import { showLocalNotification } from './NotificationService';
import messaging from '@react-native-firebase/messaging';

const toActualDivision = (div) => (div === 'MPPL' ? 'MAD' : div || '');
const StockReports = ({ route }) => {
    const employeeParam = route?.params?.employee || null;
    const [empNo, setEmpNo] = useState('');
    const [division, setDivision] = useState('');
    const [locations, setLocations] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState('');
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [loading, setLoading] = useState(true);
    const [stockData, setStockData] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalData, setModalData] = useState([]);
    const [modalLoading, setModalLoading] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [fetching, setFetching] = useState(false);
    const navigation = useNavigation(); // <-- Use the useNavigation hook  



    useLayoutEffect(() => {
        navigation.setOptions({
            headerLeft: () => (
                <TouchableOpacity
                    onPress={() => {
                        navigation.reset({
                            index: 0,
                            routes: [
                                {
                                    name: 'SALES REPORT',
                                    params: { selectedEmployee: employeeParam }, // ✅ keep it
                                },
                            ],
                        });
                    }}
                    style={{ marginLeft: 15 }}
                >
                    <Ionicons name="arrow-back" size={24} color="#ffffff" />
                </TouchableOpacity>
            ),
        });
    }, [navigation, employeeParam]);


    // HW back
    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'SALES REPORT', params: employeeParam ? { selectedEmployee: employeeParam } : undefined }],
                });
                return true;
            };
            BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
        }, [navigation, employeeParam])
    );

    // useEffect(() => {
    //     AsyncStorage.getItem('UserDataSales').then(value => {
    //         if (value) {
    //             const user = JSON.parse(value);
    //             const { empno, Division, designationshortform } = user;
    //             setEmpNo(empno);
    //             setDivision(Division);
    //             fetchLocations(designationshortform, empno);
    //         }
    //     });
    // }, []);


    // useEffect(() => {
    //     const unsubscribe = messaging().onMessage(async remoteMessage => {
    //         const title = remoteMessage?.notification?.title ?? "No Title";
    //         const body = remoteMessage?.notification?.body ?? "No Body";
    //         Alert.alert(title, body);
    //     });
    //     return unsubscribe;
    // }, []);

    useEffect(() => {
        // code by suman jana 30/05/2025
        // requestNotificationPermission();
        // getFcmToken();
        const boot = async () => {
            try {
                // 🔹 Use param if provided
                if (employeeParam) {
                    const passedEmpNo = String(employeeParam.EMP_NO ?? employeeParam.empno ?? '');
                    const passedDivision = toActualDivision(employeeParam.Division);
                    const passedPost = String(employeeParam.POST ?? employeeParam.post ?? '');

                    if (!passedEmpNo || !passedDivision || !passedPost) {
                        setLoading(false);
                        Alert.alert('Error', 'Missing employee parameters (empno/post/division).');
                        return;
                    }

                    setEmpNo(passedEmpNo);
                    setDivision(passedDivision);
                    await fetchLocations(passedPost, passedEmpNo);
                    setLoading(false);
                    return;
                }

                // 🔹 Fallback: stored user
                const value = await AsyncStorage.getItem('UserDataSales');
                if (!value) {
                    setLoading(false);
                    Alert.alert('Error', 'No user found in storage.');
                    return;
                }
                const user = JSON.parse(value);
                const storedEmpNo = String(user?.empno ?? '');
                const storedDivision = toActualDivision(user?.Division);
                const post = String(user?.designationshortform ?? '');

                if (!storedEmpNo || !storedDivision || !post) {
                    setLoading(false);
                    Alert.alert('Error', 'Missing stored user info (empno/post/division).');
                    return;
                }

                setEmpNo(storedEmpNo);
                setDivision(storedDivision);
                await fetchLocations(post, storedEmpNo);
            } catch (e) {
                console.error('Init error:', e);
                Alert.alert('Error', 'Failed to initialize.');
            } finally {
                setLoading(false);
            }
        };

        // clear transient selections when you land
        setSelectedLocation('');
        setStockData(null);
        setModalVisible(false);
        boot();

        //push notification channel creaction by Suman Jana
        // PushNotification.createChannel(
        //     {
        //         channelId: 'default-channel-id',
        //         channelName: 'Default Channel',
        //         importance: 4,
        //         vibrate: true,
        //         smallIcon: 'ic_notification', // name without file extension
        //         largeIcon: 'ic_notification', // optional, uses your app icon
        //     },
        //     created => console.log(`Channel created: ${created}`)
        // );
    }, [employeeParam]);


    // code by  suman jana -30/05/2025
    // const requestNotificationPermission = async () => {
    //     if (Platform.OS === 'ios') {
    //         const authStatus = await messaging().requestPermission();
    //         const enabled =
    //             authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    //             authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    //         if (!enabled) {
    //             Alert.alert('Notification permission not granted');
    //         }
    //     } else if (Platform.OS === 'android') {
    //         const granted = await PermissionsAndroid.request(
    //             PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
    //         );
    //         if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
    //             Alert.alert('Notification permission denied');
    //         }
    //     }
    // };
    // const requestNotificationPermission = async () => {
    //     if (Platform.OS === 'android') {
    //         if (Platform.Version >= 33) {
    //             try {
    //                 const hasPermission = await PermissionsAndroid.check(
    //                     PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
    //                 );
    //                 if (!hasPermission) {
    //                     const result = await PermissionsAndroid.request(
    //                         PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    //                         {
    //                             title: 'Notification Permission',
    //                             message: 'This app wants to send you notifications',
    //                             buttonNeutral: 'Ask Me Later',
    //                             buttonNegative: 'Cancel',
    //                             buttonPositive: 'OK',
    //                         }
    //                     );
    //                     if (result === PermissionsAndroid.RESULTS.GRANTED) {
    //                         console.log('Permission granted');
    //                     } else {
    //                         Alert.alert('Notification permission denied');
    //                     }
    //                 }
    //             } catch (err) {
    //                 console.warn('Permission request error:', err);
    //             }
    //         }
    //     }
    // };

    // const getFcmToken = async () => {
    //     try {
    //         // Register the device (important for iOS)
    //         await messaging().registerDeviceForRemoteMessages();

    //         const token = await messaging().getToken();
    //         console.log('FCM Token:', token);

    //         //  Save token to your backend or SQLite
    //         // saveTokenToDatabase(token); // Your own implementation
    //     } catch (error) {
    //         console.error('Failed to get FCM token:', error);
    //     }
    // };


    const fetchLocations = async (post, eNo) => {
        setLoading(true);
        try {
            const locationUrl = `${Sales_URL}OutstdStklocationPersonwise?post=${post}&eNo=${eNo}&action=stk`;
            const response = await axios.post(locationUrl);
            setLocations(response.data || []);
        } catch (error) {
            setLoading(false);
            console.error('Location fetch error:', error);
            Alert.alert('Error', 'Failed to load location data');
        } finally {
            setLoading(false);
        }
    };

    const handleDateChange = (event, selectedDate) => {
        if (Platform.OS === 'android') setShowDatePicker(false);
        if (selectedDate) setDate(selectedDate);
    };

    const formatDateToMMDDYYYY = (date) => {
        const month = String(date.getMonth() + 1).padStart(2, '0'); // months are 0-based
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
    };

    const fetchStockData = async () => {
        if (!selectedLocation) {
            Alert.alert("Validation", "Please select a location.");
            return;
        }
        try {
            setFetching(true);
            const formattedDate = formatDateToMMDDYYYY(date);
            const url = `${Sales_URL}ProductClosingstockTYPE?div=${division}&date=${formattedDate}&pdt=&location=${selectedLocation}`;
            console.log("Fetching stock data from URL:", url);

            const response = await axios.post(url);
            setStockData(response.data);
        } catch (error) {
            console.error("Stock data fetch error:", error);
            Alert.alert("Error", "Failed to fetch stock report.");
        } finally {
            setFetching(false);
        }
    };

    const fetchModalData = async (category) => {
        setModalVisible(true);
        setModalTitle(category);
        setModalLoading(true);
        try {
            const formattedDate = formatDateToMMDDYYYY(date);
            const url = `${Sales_URL}ProductClosingstockCatagory?div=${division}&date=${formattedDate}&catagory=${category}&location=${selectedLocation}`;
            const response = await axios.post(url);
            setModalData(response.data || []);
        } catch (error) {
            console.error("Modal data fetch error:", error);
            setModalData([]);
        } finally {
            setModalLoading(false);
        }
    };

    const renderCard = (label, valueObj, color) => (
        <TouchableOpacity onPress={() => {
            // 🔔 Show local notification
            showLocalNotification(
                `${label} Report`,
                `Value: ${valueObj?.value || 0}, Unit: ${valueObj?.unit || 0}`
            );

            // existing modal fetch
            fetchModalData(label);
        }}
            style={[styles.card, { backgroundColor: color }]}>
            <View style={styles.iconWrapper}>
                <Feather name="trending-up" size={20} color="#ffffff" />
            </View>
            <Text style={styles.cardTitle}>{label}</Text>
            <Text style={styles.cardValue}>Value: {valueObj?.value || 0}</Text>
            <Text style={styles.cardValue}>Unit: {valueObj?.unit || 0}</Text>
        </TouchableOpacity>
    );

    const cardData = stockData ? {
        HEALTHY: {
            value: stockData[0]?.HEALTHY ?? 0,
            unit: stockData[1]?.HEALTHY ?? 0
        },
        SICK: {
            value: stockData[0]?.SICK ?? 0,
            unit: stockData[1]?.SICK ?? 0
        },
        DYING: {
            value: stockData[0]?.DYING ?? 0,
            unit: stockData[1]?.DYING ?? 0
        },
        DEAD: {
            value: stockData[0]?.DEAD ?? 0,
            unit: stockData[1]?.DEAD ?? 0
        },
    } : {};

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#a9ddfaff" />
            {loading ? (
                <View style={styles.loader}>
                    <ActivityIndicator size="large" color="#005696" />
                    <Text style={{ marginTop: 10, color: '#005696' }}>Loading...</Text>
                </View>
            ) : (

                <ScrollView>
                    <Text style={styles.title}>Enter Details</Text>

                    <View style={{
                        padding: 8,
                        margin: 2,
                        marginBottom: 10,
                        paddingBottom: 15,
                        paddingLeft: 15,
                        paddingRight: 15,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: 'lightgrey',
                        backgroundColor: 'white',
                        shadowColor: '#000',
                        shadowOffset: { width: 2, height: 2 },
                        shadowOpacity: 0.8,
                        shadowRadius: 2,
                        elevation: 5,

                    }}>
                        <Text style={styles.label}>Select Location</Text>
                        <View style={styles.pickerWrapper}>
                            <Picker
                                selectedValue={selectedLocation}
                                onValueChange={value => setSelectedLocation(value)}
                                style={styles.picker}
                            >
                                <Picker.Item label="-- Select Location --" value="" />
                                {locations.map((item, index) => (
                                    <Picker.Item key={index} label={item.Location} value={item.Location} />
                                ))}
                            </Picker>
                        </View>

                        <Text style={styles.label}>Select Date</Text>
                        <TouchableOpacity
                            style={styles.datePickerButton}
                            onPress={() => setShowDatePicker(true)}
                        >
                            <Feather name="calendar" size={30} color="#005696" style={{ marginRight: 8 }} />
                            <Text style={styles.dateText}>{date.toDateString()}</Text>
                        </TouchableOpacity>

                        {showDatePicker && (
                            <DateTimePicker
                                value={date}
                                mode="date"
                                display="default"
                                onChange={handleDateChange}
                            />
                        )}

                        <TouchableOpacity style={styles.button} onPress={fetchStockData}>
                            <Text style={styles.buttonText}>Populate Closing Stock</Text>
                        </TouchableOpacity>
                    </View>

                    {fetching ? (
                        <View style={styles.loader}>
                            <ActivityIndicator size="large" color="#005696" />
                            <Text style={{ textAlign: 'center', marginTop: 10 }}>Loading data...</Text>
                        </View>
                    ) : stockData && (
                        <View style={styles.cardContainer}>
                            {renderCard('HEALTHY', cardData.HEALTHY, '#d4edda')}
                            {renderCard('SICK', cardData.SICK, '#a8ddff')}
                            {renderCard('DYING', cardData.DYING, '#ffeeba')}
                            {renderCard('DEAD', cardData.DEAD, '#f8d7da')}
                        </View>
                    )}

                    <Modal visible={modalVisible} animationType="slide">
                        <SafeAreaView style={{ flex: 1, margin: 10 }}>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                                <Text style={styles.closeBtnText}>Close</Text>
                            </TouchableOpacity>

                            <Text style={styles.modalTitle}>Details - {modalTitle}</Text>

                            {modalLoading ? (
                                <View style={styles.loader}>
                                    <ActivityIndicator size="large" color="#005696" />
                                    <Text style={{ textAlign: 'center', marginTop: 10 }}>Loading data...</Text>
                                </View>
                            ) : modalData.length === 0 ? (
                                <Text style={{ textAlign: 'center', marginTop: 20 }}>No Data Found</Text>
                            ) : (
                                <View style={{ flex: 1 }}>
                                    <ScrollView horizontal>
                                        <View>
                                            <View style={styles.tableRow}>
                                                <Text style={[styles.tableHeaderCell, { width: 150 }]}>Product Name</Text>
                                                <Text style={[styles.tableHeaderCell, { width: 100 }]}>Batch</Text>
                                                <Text style={[styles.tableHeaderCell, { width: 120 }]}>Expiry Date</Text>
                                                <Text style={[styles.tableHeaderCell, { width: 140 }]}>Closing Balance</Text>
                                                <Text style={[styles.tableHeaderCell, { width: 100 }]}>Status</Text>
                                            </View>

                                            <ScrollView style={{ height: '100%' }}>
                                                {modalData.map((item, index) => (
                                                    <View style={styles.tableRow} key={index}>
                                                        <Text style={[styles.tableCell, { width: 150 }]}>{item.PRODUCTNAME}</Text>
                                                        <Text style={[styles.tableCell, { width: 100 }]}>{item.BATCH}</Text>
                                                        <Text style={[styles.tableCell, { width: 120 }]}>{item.EXPDATE}</Text>
                                                        <Text style={[styles.tableCell, { width: 140 }]}>{item.CLOSINGBALANCE}</Text>
                                                        <Text style={[styles.tableCell, { width: 100 }]}>{item.TYPE}</Text>
                                                    </View>
                                                ))}
                                            </ScrollView>
                                        </View>
                                    </ScrollView>
                                </View>
                            )}
                        </SafeAreaView>
                    </Modal>

                </ScrollView>
            )}
        </SafeAreaView>
    );
};

export default StockReports;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#ffffff',
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        color: '#005696',
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    label: {
        fontSize: 16,
        marginTop: 15,
        marginBottom: 5,
        color: '#333',
    },
    pickerWrapper: {
        borderWidth: 2,
        borderColor: '#005696',
        borderRadius: 10,
        backgroundColor: '#fff',
        overflow: 'hidden',
    },
    picker: {
        height: 50,
        color: '#000',
    },
    datePickerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderWidth: 2,
        borderColor: '#005696',
        borderRadius: 8,
        backgroundColor: '#fff',
        marginTop: 15,
        justifyContent: 'center',
    },
    dateText: {
        fontSize: 16,
        color: '#333',
    },
    button: {
        backgroundColor: '#005696',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    cardContainer: {
        marginTop: 25,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    card: {
        width: '48%',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        elevation: 3,
    },
    iconWrapper: {
        position: 'absolute',
        top: 8,
        right: 8,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
        textAlign: 'center',
    },
    cardValue: {
        fontSize: 16,
        //fontWeight: 'bold',
        color: '#000',
        textAlign: 'center',
    },
    closeBtn: {
        alignSelf: 'flex-end',
        backgroundColor: '#ccc',
        padding: 8,
        borderRadius: 5,
        marginRight: 20,
        marginTop: 20,
    },
    closeBtnText: {
        fontWeight: 'bold',
        color: '#000',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 15,
        textAlign: 'center',
        color: '#005696',
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#005696',
        borderBottomWidth: 1,
        borderColor: '#ccc',
    },
    tableRow: {
        flexDirection: 'row',
    },

    tableHeaderCell: {
        paddingVertical: 10,
        paddingHorizontal: 5,
        backgroundColor: '#005696',
        color: '#fff',
        fontWeight: 'bold',
        borderWidth: 1,
        borderColor: '#ccc',
        textAlign: 'center',
    },

    tableCell: {
        paddingVertical: 10,
        paddingHorizontal: 5,
        borderWidth: 1,
        borderColor: '#ccc',
        textAlign: 'center',
    },

});
