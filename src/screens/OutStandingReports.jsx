import React, { useCallback, useEffect, useState, useLayoutEffect } from 'react';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import {
    View,
    Text,
    StyleSheet,
    Alert,
    ActivityIndicator,
    SafeAreaView,
    TouchableOpacity,
    ScrollView,
    Switch,
    Modal,
    FlatList,
    LogBox,
    BackHandler,
    StatusBar,
} from 'react-native';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Sales_URL } from '@env';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';

const OutStandingReports = ({ route }) => {
    const employeeParam = route?.params?.employee || null;
    const [postCode, setPostCode] = useState('');
    const [empNo, setEmpNo] = useState('');
    const [locations, setLocations] = useState([]);
    const [partyTypes, setPartyTypes] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState('');
    const [selectedPartyType, setSelectedPartyType] = useState('');
    const [loading, setLoading] = useState(true);
    const [isNPA, setIsNPA] = useState(false);
    const [outstandingData, setOutstandingData] = useState(null);
    const [fetching, setFetching] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalData, setModalData] = useState([]);
    const [modalTitle, setModalTitle] = useState('');
    const [modalLoading, setModalLoading] = useState(false);
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


    // useFocusEffect(
    //     useCallback(() => {
    //         const onBackPress = () => {
    //             navigation.reset({
    //                 index: 0,
    //                 routes: [{ name: 'SALES REPORT' }], // <-- Your main screen
    //                 params: { selectedEmployee: employeeParam },
    //             });
    //             return true; // prevent default back behavior
    //         };

    //         BackHandler.addEventListener('hardwareBackPress', onBackPress);

    //         return () =>
    //             BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    //     }, [navigation]),
    // );


    // useEffect(() => {
    //     //Disabling VirtualizedLists warning error start
    //     LogBox.ignoreLogs([
    //         'VirtualizedLists should never be nested',
    //         'Each child in a list should have a unique "key" prop.',
    //     ]);

    //     AsyncStorage.getItem('UserDataSales').then(value => {
    //         if (value) {
    //             const user = JSON.parse(value);
    //             const { designationshortform, empno } = user;
    //             if (empno) {
    //                 setEmpNo(empno);
    //                 fetchDropdownData(designationshortform, empno);
    //             } else {
    //                 Alert.alert("Error", "Emp No not found.");
    //             }
    //         }
    //     });
    // }, []);


    // Boot: decide source of empNo/post based on param or user


    // Back handler — keep passing employee back if you came with one


    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                navigation.reset({
                    index: 0,
                    routes: [
                        {
                            name: 'SALES REPORT',
                            // pass-through the same employee if you want it retained on return
                            params: employeeParam ? { selectedEmployee: employeeParam } : undefined,
                        },
                    ],
                });
                return true;
            };

            BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
        }, [navigation, employeeParam])
    );


    useEffect(() => {
        // Silence noisy warnings if you want to keep them suppressed
        LogBox.ignoreLogs([
            'VirtualizedLists should never be nested',
            'Each child in a list should have a unique "key" prop.',
        ]);

        const init = async () => {
            try {
                if (employeeParam) {
                    // Use the employee passed from SalesDashboard
                    const passedEmpNo = employeeParam.EMP_NO ?? employeeParam.empno ?? '';
                    const passedPost = employeeParam.POST ?? employeeParam.post ?? '';
                    if (!passedEmpNo || !passedPost) {
                        Alert.alert('Error', 'Required employee info missing (empno/post).');
                        setLoading(false);
                        return;
                    }
                    setEmpNo(String(passedEmpNo));
                    setPostCode(String(passedPost));

                    await fetchDropdownData(passedPost, passedEmpNo);
                    setLoading(false);
                    return;
                }

                // Fallback — logged-in user
                const value = await AsyncStorage.getItem('UserDataSales');
                if (!value) {
                    setLoading(false);
                    Alert.alert('Error', 'No user found in storage.');
                    return;
                }

                const user = JSON.parse(value);
                const { designationshortform, empno } = user || {};
                if (!empno || !designationshortform) {
                    setLoading(false);
                    Alert.alert('Error', 'Missing user post/empno.');
                    return;
                }

                setEmpNo(String(empno));
                setPostCode(String(designationshortform));
                await fetchDropdownData(designationshortform, empno);
            } catch (e) {
                console.error('Init error:', e);
                Alert.alert('Error', 'Failed to initialize.');
            } finally {
                setLoading(false);
            }
        };

        init();
    }, [employeeParam]);


    const fetchDropdownData = async (post, eNo) => {
        try {
            const locationUrl = `${Sales_URL}OutstdStklocationPersonwise?post=${post}&eNo=${eNo}&action=stk`;
            const partyUrl = `${Sales_URL}OutstdStklocationPersonwise?post=${post}&eNo=${eNo}&action=party`;

            const [locationRes, partyRes] = await Promise.all([
                axios.post(locationUrl),
                axios.post(partyUrl),
            ]);

            setLocations(locationRes.data || []);
            setPartyTypes(partyRes.data || []);
        } catch (error) {
            console.error('Dropdown API error:', error);
            Alert.alert('Error', 'Failed to load dropdown data');
        } finally {
            setLoading(false);
        }
    };

    const fetchOutstandingData = async (eNo) => {
        if (!selectedLocation || !selectedPartyType) {
            Alert.alert("Validation", "Please select both Location and Party Type.");
            return;
        }

        const npaStatus = isNPA ? "NPA" : "NON NPA";
        const url = `${Sales_URL}OutstandingTYPE?stklocation=${selectedLocation}&partytype=${selectedPartyType}&empno=${eNo}&npa=${npaStatus}`;
        console.log('Outstanding API:', url);

        setFetching(true);

        try {
            const response = await axios.post(url);
            if (response.data && response.data.length > 0) {
                setOutstandingData(response.data[0]);
            } else {
                setOutstandingData(null);
            }
        } catch (error) {
            console.error("Outstanding data fetch error:", error);
            if (error.response?.status === 500) {
                Alert.alert("Server Error", "Internal Server Error");
            } else {
                Alert.alert("Error", "Failed to fetch outstanding report.");
            }
            setOutstandingData(null);
        } finally {
            setFetching(false);
        }
    };

    const fetchModalData = async (category) => {
        setModalVisible(true);
        setModalLoading(true);
        setModalTitle(category);

        const url = `${Sales_URL}outstandingCatagory?catagory=${category}&npaa=${isNPA ? 'NPA' : 'NON NPA'}&stkloc=${selectedLocation}&enemployeeno=${empNo}&partytype=${selectedPartyType}`;
        console.log('Modal API:', url);
        try {
            const response = await axios.post(url);
            setModalData(response.data && response.data.length > 0 ? response.data : []);
        } catch (error) {
            console.error('Modal data fetch error:', error);
            setModalData([]);
        } finally {
            setModalLoading(false);
        }
    };

    const calculatePercentage = (value, total) => {
        if (total <= 0) return '0%';

        const percentage = (value / total) * 100;

        if (percentage < 1) {
            return percentage >= 0.5 ? '1%' : '0%';
        }

        return `${Math.round(percentage)}%`;
    };



    const renderCard = (label, value, color, percentage) => (
        <View style={styles.cardWrapper}>
            <TouchableOpacity onPress={() => fetchModalData(label)} activeOpacity={0.8}>
                <View style={[styles.card, { backgroundColor: color }]}>
                    <View style={styles.iconWrapper}>
                        <Feather name="trending-up" size={20} color="#fff" />
                    </View>
                    <Text style={styles.cardTitle}>{label}</Text>
                    <Text style={styles.cardValue}>Value: {value}</Text>
                    {percentage && <Text style={styles.cardPercentage}>{percentage}</Text>}
                </View>
            </TouchableOpacity>
        </View>
    );

    const getTotal = (data) => {
        const h = Number(data?.HEALTHY || 0);
        const s = Number(data?.SICK || 0);
        const d = Number(data?.DYING || 0);
        const de = Number(data?.DEAD || 0);
        return h + s + d + de;
    };

    const total = outstandingData && !isNPA ? getTotal(outstandingData) : 0;

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

                        <Text style={styles.label}>Select Party Type</Text>
                        <View style={styles.pickerWrapper}>
                            <Picker
                                selectedValue={selectedPartyType}
                                onValueChange={value => setSelectedPartyType(value)}
                                style={styles.picker}
                            >
                                <Picker.Item label="-- Select Party Type --" value="" />
                                {partyTypes.map((item, index) => (
                                    <Picker.Item key={index} label={item.Customertype} value={item.Customertype} />
                                ))}
                            </Picker>
                        </View>

                        <View style={styles.switchContainer}>
                            <Text style={styles.switchLabel}>{isNPA ? 'NPA' : 'NON NPA'}</Text>
                            <Switch
                                value={isNPA}
                                onValueChange={value => {
                                    setIsNPA(value);
                                    setOutstandingData(null); // Reset data when toggling NPA/NON NPA
                                }}
                                thumbColor={isNPA ? '#005696' : '#ccc'}
                                trackColor={{ false: '#ccc', true: '#a7e0df' }}
                            />
                        </View>

                        <TouchableOpacity style={styles.button} onPress={() => fetchOutstandingData(empNo)}>
                            <Text style={styles.buttonText}>Populate OutStanding Reports</Text>
                        </TouchableOpacity>
                    </View>
                    {fetching ? (
                        <ActivityIndicator size="large" color="#005696" style={{ marginTop: 20 }} />
                    ) : outstandingData ? (
                        <View style={styles.cardContainer}>
                            {renderCard(
                                'HEALTHY',
                                outstandingData.HEALTHY,
                                '#d4edda',
                                !isNPA ? calculatePercentage(outstandingData.HEALTHY, total) : null
                            )}
                            {renderCard(
                                'SICK',
                                outstandingData.SICK,
                                '#a8ddff',
                                !isNPA ? calculatePercentage(outstandingData.SICK, total) : null
                            )}
                            {renderCard(
                                'DYING',
                                outstandingData.DYING,
                                '#ffeeba',
                                !isNPA ? calculatePercentage(outstandingData.DYING, total) : null
                            )}
                            {renderCard(
                                'DEAD',
                                outstandingData.DEAD,
                                '#f8d7da',
                                !isNPA ? calculatePercentage(outstandingData.DEAD, total) : null
                            )}
                        </View>
                    ) : (
                        <Text style={styles.noDataText}>No Data Found</Text>
                    )}
                    <Modal visible={modalVisible} animationType="slide" transparent={false}>
                        <SafeAreaView style={{ flex: 1, padding: 20 }}>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                                <Text style={styles.closeBtnText}>Close</Text>
                            </TouchableOpacity>

                            <Text style={styles.modalTitle}>Details - {modalTitle}</Text>

                            {modalLoading ? (
                                <ActivityIndicator size="large" color="#005696" />
                            ) : modalData.length === 0 ? (
                                <Text style={{ textAlign: 'center', marginTop: 20 }}>No Data Found</Text>
                            ) : (
                                <View style={{ flex: 1 }}>
                                    <ScrollView horizontal>
                                        <View style={styles.tableContainer}>
                                            {/* Table Header */}
                                            <View style={styles.tableHeader}>
                                                <Text style={[styles.tableCell, styles.headerCell, { width: 100 }]}>Party Code</Text>
                                                <Text style={[styles.tableCell, styles.headerCell, { width: 150 }]}>Party Name</Text>
                                                <Text style={[styles.tableCell, styles.headerCell, { width: 120 }]}>Invoice Date</Text>
                                                <Text style={[styles.tableCell, styles.headerCell, { width: 120 }]}>Invoice No</Text>
                                                <Text style={[styles.tableCell, styles.headerCell, { width: 100 }]}>Due Amount</Text>
                                                <Text style={[styles.tableCell, styles.headerCell, { width: 100 }]}>Status</Text>
                                            </View>

                                            {/* Table Body */}
                                            <ScrollView style={{ height: '100%' }}>
                                                {modalData.map((item, index) => (
                                                    <View style={styles.tableRow} key={index}>
                                                        <Text style={[styles.tableCell, { width: 100 }]}>{item.PartyAlias}</Text>
                                                        <Text style={[styles.tableCell, { width: 150 }]}>{item.Party}</Text>
                                                        <Text style={[styles.tableCell, { width: 120 }]}>{item.InvoiceDate}</Text>
                                                        <Text style={[styles.tableCell, { width: 120 }]}>{item.InvoiceNo}</Text>
                                                        <Text style={[styles.tableCell, { width: 100 }]}>{item.DueAmt}</Text>
                                                        <Text style={[styles.tableCell, { width: 100 }]}>{item.status}</Text>
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

export default OutStandingReports;

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
    switchContainer: {
        marginTop: 25,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 10,
        borderWidth: 2,
        borderColor: '#005696',
        borderRadius: 10,
        height: 50,
        backgroundColor: '#f9f9f9',
    },
    switchLabel: {
        fontSize: 16,
        color: '#333',
    },
    button: {
        backgroundColor: '#005696',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 15,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    cardWrapper: {
        width: '48%',
        marginBottom: 15,
    },

    cardContainer: {
        marginTop: 25,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 10, // optional spacing for modern look (React Native 0.71+)
    },

    card: {
        borderRadius: 10,
        padding: 15,
        elevation: 3,
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 110, // Ensures uniform card height
    },

    iconWrapper: {
        position: 'absolute',
        top: 8,
        right: 8,
        fontWeight: 'bold',
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
        textAlign: 'center',
    },
    cardValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
        textAlign: 'center',
    },
    cardPercentage: {
        fontSize: 14,
        fontWeight: '500',
        color: '#666',
        marginTop: 4,
        textAlign: 'center',
    },
    noDataText: {
        marginTop: 20,
        textAlign: 'center',
        color: '#999',
        fontSize: 16,
    },
    tableContainer: {
        flex: 1,
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#005696',
        paddingVertical: 10,
        paddingHorizontal: 5,
        borderBottomWidth: 2,
        borderBottomColor: '#ccc',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        paddingVertical: 10,
        paddingHorizontal: 5,
    },
    tableCell: {
        textAlign: 'center',
        borderRightWidth: 1,
        borderRightColor: '#ccc',
        padding: 5,
        color: '#333',
    },
    headerCell: {
        fontWeight: 'bold',
        color: '#fff',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 15,
        textAlign: 'center',
    },
    closeBtn: {
        alignSelf: 'flex-end',
        backgroundColor: '#ccc',
        padding: 8,
        borderRadius: 5,
    },
    closeBtnText: {
        fontWeight: 'bold',
        color: '#000',
    },
});
