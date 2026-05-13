import React, { useCallback, useEffect, useState, useLayoutEffect } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    Alert,
    TouchableOpacity,
    ScrollView,
    Modal,
    FlatList,
    BackHandler,
    StatusBar,
} from 'react-native';
import { MultiSelect, Dropdown } from 'react-native-element-dropdown';
import { Sales_URL } from '@env';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
// Helper to normalize division names when needed later (not used in HQ fetch now, but handy)
const toActualDivision = (div) => (div === 'MPPL' ? 'MAD' : div || '');


const SalesOrderTransaction = ({ route }) => {
    const employeeParam = route?.params?.employee || null;
    const [hqOptions, setHqOptions] = useState([]);
    const [selectedHq, setSelectedHq] = useState([]);
    const [selectedPartyType, setSelectedPartyType] = useState(null);
    const [loading, setLoading] = useState(true);
    const [empNo, setEmpNo] = useState('');
    const [post, setPost] = useState('');
    const [orderStatus, setOrderStatus] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalData, setModalData] = useState([]);
    const [modalTitle, setModalTitle] = useState('');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const navigation = useNavigation(); // <-- Use the useNavigation hook       
    const partyTypeOptions = [
        { label: 'ALL', value: 'ALL' },
        { label: 'RETAILER', value: 'RETAILER' },
        { label: 'WHOLESALER', value: 'WHOLESALER' },
    ];


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

    // Boot: prefer params, else storage

    useEffect(() => {
        const init = async () => {
            try {
                if (employeeParam) {
                    const passedEmpNo = String(employeeParam.EMP_NO ?? employeeParam.empno ?? '');
                    const passedPost = String(employeeParam.POST ?? employeeParam.post ?? '');
                    if (!passedEmpNo || !passedPost) {
                        setLoading(false);
                        Alert.alert('Error', 'Missing employee parameters (empno/post).');
                        return;
                    }
                    setEmpNo(passedEmpNo);
                    setPost(passedPost);
                    await fetchHQ(passedPost, passedEmpNo);
                    setLoading(false);
                    return;
                }

                const value = await AsyncStorage.getItem('UserDataSales');
                if (!value) {
                    setLoading(false);
                    Alert.alert('Error', 'No user found in storage.');
                    return;
                }
                const user = JSON.parse(value);
                const storedEmpNo = String(user?.empno ?? '');
                const storedPost = String(user?.designationshortform ?? '');
                if (!storedEmpNo || !storedPost) {
                    setLoading(false);
                    Alert.alert('Error', 'Missing stored user info (empno/post).');
                    return;
                }
                setEmpNo(storedEmpNo);
                setPost(storedPost);
                await fetchHQ(storedPost, storedEmpNo);
            } catch (e) {
                console.error('Init error:', e);
                Alert.alert('Error', 'Failed to initialize.');
            } finally {
                setLoading(false);
            }
        };

        // clear transient state on entry
        setSelectedHq([]);
        setSelectedPartyType(null);
        setOrderStatus(null);
        setModalVisible(false);
        init();
    }, [employeeParam]);


    const fetchHQ = async (post, empNo) => {
        setLoading(true);
        try {
            const HQUrl = `${Sales_URL}Hqlistbyuser?post=${post}&emp_no=${empNo}&action=HQ`;
            const response = await axios.post(HQUrl);
            const options = (response.data || []).map(item => ({
                label: item.HQ,
                value: item.HQ,
            }));
            setHqOptions(options);
        } catch (error) {
            console.error('HQ fetch error:', error);
            Alert.alert('Error', 'Failed to load HQ data');
        } finally {
            setLoading(false);
        }
    };

    const populateSaleOrder = async () => {
        if (selectedHq.length === 0 || !selectedPartyType) {
            Alert.alert('Validation', 'Please select HQ(s) and Party Type.');
            return;
        }

        setSubmitting(true);
        setOrderStatus(null);
        const apiUrl = `${Sales_URL}Salesorderstatus?hqlist=${selectedHq.join(',')}&action=orderstatus&custtype=${selectedPartyType}`;

        try {
            const response = await axios.post(apiUrl);
            if (!response.data || response.data.length === 0) {
                setOrderStatus(null);
                return;
            }
            setOrderStatus(response.data?.[0]);
        } catch (error) {
            console.error('Order status API error:', error);
            Alert.alert('Error', 'Failed to load sale order status.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCardClick = async (type) => {
        try {
            const apiUrl = `${Sales_URL}SalesorderPartylist?hqlist=${selectedHq.join(',')}&Transactionstatus=${type}&action=details&custtype=${selectedPartyType}`;
            const response = await axios.post(apiUrl);
            setModalTitle(type);
            setModalData(response.data);
            setModalVisible(true);
        } catch (error) {
            console.error('Detail fetch error:', error);
            Alert.alert('Error', 'Failed to load party list.');
        }
    };

    const renderModalContent = () => (
        <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
            <View style={{ flex: 1, backgroundColor: '#fff', paddingTop: 16 }}>
                <Text style={styles.modalTitle}>{modalTitle} Details</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                    <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>

                {modalData.length === 0 ? (
                    <Text style={styles.noDataText}>No Data Found</Text>
                ) : (
                    <ScrollView horizontal>
                        <View>
                            <View style={[styles.row, styles.headerRow]}>
                                <Text style={[styles.headerCell, { width: 120 }]}>HQ</Text>
                                <Text style={[styles.headerCell, { width: 180 }]}>Customer Name</Text>
                                <Text style={[styles.headerCell, { width: 120 }]}>Code</Text>
                                <Text style={[styles.headerCell, { width: 120 }]}>Customer Type</Text>
                                <Text style={[styles.headerCell, { width: 120 }]}>Order Status</Text>
                                <Text style={[styles.headerCell, { width: 150 }]}>Product</Text>
                                <Text style={[styles.headerCell, { width: 80 }]}>Pack</Text>
                                <Text style={[styles.headerCell, { width: 120 }]}>Entry Date</Text>
                                <Text style={[styles.headerCell, { width: 80 }]}>Quantity</Text>
                                <Text style={[styles.headerCell, { width: 100 }]}>Free Quantity</Text>
                                <Text style={[styles.headerCell, { width: 120 }]}>Gross Amount</Text>
                            </View>

                            <FlatList
                                data={modalData}
                                keyExtractor={(_, index) => index.toString()}
                                renderItem={({ item, index }) => (
                                    <View style={[styles.row, { backgroundColor: index % 2 === 0 ? '#fff' : '#f0f0f0' }]}>
                                        <Text style={[styles.cell, { width: 120 }]}>{item.HQ}</Text>
                                        <Text style={[styles.cell, { width: 180 }]}>{item.CUSTNAME}</Text>
                                        <Text style={[styles.cell, { width: 120 }]}>{item.CODE}</Text>
                                        <Text style={[styles.cell, { width: 120 }]}>{item.CUSTTYPE}</Text>
                                        <Text style={[styles.cell, { width: 120 }]}>{item.ORDERSTATUS}</Text>
                                        <Text style={[styles.cell, { width: 150 }]}>{item.PRODUCT}</Text>
                                        <Text style={[styles.cell, { width: 80 }]}>{item.PACK}</Text>
                                        <Text style={[styles.cell, { width: 120 }]}>{item.ENTRYDATE}</Text>
                                        <Text style={[styles.cell, { width: 80 }]}>{item.QTY}</Text>
                                        <Text style={[styles.cell, { width: 100 }]}>{item.FREEQTY}</Text>
                                        <Text style={[styles.cell, { width: 120 }]}>{item.GROSSAMT}</Text>
                                    </View>
                                )}
                            />
                        </View>
                    </ScrollView>
                )}
            </View>
        </Modal>
    );

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#a9ddfaff" />
            <Text style={styles.title}>Enter Details</Text>

            {loading ? (
                <View style={styles.loader}>
                    <ActivityIndicator color="#005696" size="large" />
                    <Text>Loading...</Text>
                </View>
            ) : (
                <>
                    <View style={{ 
                        padding: 8,
                        margin: 2,
                        marginBottom: 10,
                        paddingBottom: 15,
                        paddingLeft: 15,
                        paddingRight: 15,
                        paddingTop: 15,
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
                        <MultiSelect
                            style={styles.dropdown}
                            placeholder="Select HQ(s)"
                            search
                            searchPlaceholder="Search HQ"
                            data={hqOptions}
                            labelField="label"
                            valueField="value"
                            value={selectedHq}
                            onChange={item => setSelectedHq(item)}
                            selectedStyle={styles.selectedStyle}
                            containerStyle={styles.dropdownContainer}
                            itemTextStyle={styles.itemText}
                            activeColor="#e0f7f7"
                            selectedTextStyle={styles.selectedTextStyle}
                            renderItem={(item, selected) => (
                                <View style={styles.itemRow}>
                                    <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
                                        {selected && <Icon name="check" size={15} color="#000000" />}
                                    </View>
                                    <Text style={styles.itemLabel}>{item.label}</Text>
                                </View>
                            )}
                            onFocus={() => setDropdownOpen(true)}
                            onBlur={() => setDropdownOpen(false)}
                            renderRightIcon={() => (
                                <Icon
                                    name={dropdownOpen ? 'x' : 'chevron-down'}
                                    size={16}
                                    style={styles.icon}
                                />
                            )}
                        />

                        <View style={{ marginTop: 20 }} />

                        <Dropdown
                            style={styles.dropdown}
                            placeholder="Select Party Type"
                            data={partyTypeOptions}
                            labelField="label"
                            valueField="value"
                            value={selectedPartyType}
                            onChange={item => setSelectedPartyType(item.value)}
                            containerStyle={styles.dropdownContainer}
                            itemTextStyle={styles.itemText}
                            selectedTextStyle={styles.singleSelectedText}
                            activeColor="#e0f7f7"
                        />

                        <TouchableOpacity
                            onPress={populateSaleOrder}
                            style={styles.button}
                            disabled={submitting}
                        >
                            <Text style={styles.buttonText}>
                                {submitting ? 'Loading...' : 'Populate Sale Order'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    {orderStatus === null && !submitting && (
                        <Text style={styles.noDataText}>No Sale Order Data Found</Text>
                    )}

                    {orderStatus && (
                        <View style={styles.cardWrapper}>
                            <View style={styles.cardRow}>
                                <TouchableOpacity
                                    style={[styles.card, { backgroundColor: '#13a1a1' }]}
                                    onPress={() => handleCardClick('Execute')}
                                >
                                    <View style={styles.iconWrapper}>
                                        <Icon name="trending-up" size={24} color="#fff" />
                                    </View>
                                    <Text style={styles.cardTitle}>Execute</Text>
                                    <Text style={styles.cardValue}>{orderStatus.Execute?.toFixed(2) || '0.00'}</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.card, { backgroundColor: '#FFA500' }]}
                                    onPress={() => handleCardClick('Pending')}
                                >
                                    <View style={styles.iconWrapper}>
                                        <Icon name="clock" size={24} color="#fff" />
                                    </View>
                                    <Text style={styles.cardTitle}>Pending</Text>
                                    <Text style={styles.cardValue}>{orderStatus.Pending?.toFixed(2) || '0.00'}</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.singleCardRow}>
                                <TouchableOpacity
                                    style={[styles.card, { backgroundColor: '#e56c77' }]}
                                    onPress={() => handleCardClick('Cancel')}
                                >
                                    <View style={styles.iconWrapper}>
                                        <Icon name="trending-down" size={22} color="#fff" />
                                    </View>
                                    <Text style={styles.cardTitle}>Cancel</Text>
                                    <Text style={styles.cardValue}>{orderStatus.Cancel?.toFixed(2) || '0.00'}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    {renderModalContent()}
                </>
            )}
        </ScrollView>
    );
};

export default SalesOrderTransaction;

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: '#ffffff',
        flexGrow: 1,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#005696',
        marginBottom: 16,
        textAlign: 'center',
    },
    dropdown: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 10,
        backgroundColor: '#fff',
    },
    dropdownContainer: {
        backgroundColor: '#ffffff',
        borderRadius: 8,
    },
    itemText: {
        color: '#333',
        fontSize: 14,
    },
    selectedStyle: {
        backgroundColor: '#005696',
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 5,
        margin: 4,
    },
    selectedTextStyle: {
        color: '#fff',
        fontWeight: '500',
        fontSize: 13,
    },
    singleSelectedText: {
        color: '#005696',
        fontWeight: '600',
        fontSize: 14,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },

    checkbox: {
        height: 18,
        width: 18,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#005696',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },

    checkboxSelected: {
        backgroundColor: '#ffffff',
    },

    checkMark: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
        lineHeight: 14,
    },

    itemLabel: {
        fontSize: 14,
        color: '#333',
    },

    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    button: {
        marginTop: 20,
        backgroundColor: '#005696',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    cardWrapper: {
        marginTop: 24,
        paddingHorizontal: 8,
    },

    cardRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },

    singleCardRow: {
        marginTop: 16,
        alignItems: 'center',
    },

    card: {
        width: '47%', // consistent width for Execute and Pending
        paddingVertical: 28,
        paddingHorizontal: 16,
        borderRadius: 16,
        alignItems: 'center',
        elevation: 4,
    },

    cardTitle: {
        color: '#fff',
        fontSize: 18,
        marginBottom: 10,
        fontWeight: '600',
    },

    cardValue: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },

    noDataText: {
        textAlign: 'center',
        marginTop: 24,
        fontSize: 16,
        color: '#999',
        fontStyle: 'italic',
    },
    modalContainer: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f9f9f9',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#005696',
        marginBottom: 10,
    },
    closeButton: {
        backgroundColor: '#005696',
        alignSelf: 'flex-end',
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 8,
        marginBottom: 12,
        marginRight: 16,
    },
    closeButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    row: {
        flexDirection: 'row',
        borderBottomWidth: 0.8,
        borderBottomColor: '#ccc',
    },
    headerRow: {
        backgroundColor: '#005696',
    },
    headerCell: {
        padding: 8,
        fontSize: 12,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        borderRightWidth: 1,
        borderRightColor: '#fff',
    },
    cell: {
        padding: 8,
        fontSize: 12,
        color: '#333',
        textAlign: 'center',
        borderRightWidth: 1,
        borderRightColor: '#ccc',
    },
    noDataText: {
        textAlign: 'center',
        fontSize: 16,
        fontStyle: 'italic',
        color: '#888',
        marginTop: 30,
    },
    icon: {
        fontSize: 12,
        color: '#282929',
        marginRight: 10,
    },
    iconWrapper: {
        position: 'absolute',
        top: 8,
        right: 8,
    },


});
