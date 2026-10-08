import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    Alert,
    BackHandler,
    TouchableOpacity,
    ActivityIndicator,
    TextInput,
    RefreshControl,
} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation, CommonActions } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { BASE_URL } from '@env';

const AdminViewDcr = () => {
    const navigation = useNavigation();
    const [bisnessId, setBisnessId] = useState(null);
    const [IDEmployee, setIDEmployee] = useState(null);
    const [dcrList, setDcrList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [isConnected, setIsConnected] = useState(true);
    const [type, setType] = useState('DOCTOR'); // 'DOCTOR' or 'RETAILER'
    const [refreshing, setRefreshing] = useState(false);


    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                navigation.dispatch(
                    CommonActions.reset({
                        index: 0,
                        routes: [{ name: 'DcrAdminDashBoard' }],
                    }),
                );
                return true;
            };
            BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
        }, [navigation])
    );

    useEffect(() => {
        const initialize = async () => {
            try {
                const userData = await AsyncStorage.getItem('UserData');
                if (userData) {
                    const user = JSON.parse(userData);
                    setBisnessId(user.BusinessID?.trim());
                    setIDEmployee(user.IDEmployee);
                }
            } catch (e) {
                console.log('❌ Error reading AsyncStorage:', e);
            }
        };
        initialize();
        // Check network connectivity
        const unsubscribe = NetInfo.addEventListener(state => {
            setIsConnected(state.isConnected);
        });
        return () => unsubscribe(); // Cleanup
    }, []);

    useEffect(() => {
        if (bisnessId && IDEmployee) {
            fetchDcrList(bisnessId, IDEmployee, type);
        }
    }, [bisnessId, IDEmployee, type]);

    const fetchDcrList = async (businessId, employeeId, dcrType) => {
        setLoading(true);
        const state = await NetInfo.fetch();
        if (!state.isConnected) {
            Alert.alert('Offline', 'You are currently offline.');
            setLoading(false);
            return;
        }

        try {
            const url = `${BASE_URL}DCR/Mobile/Manager/DCRList?Businessid=${businessId}&IDEmployee=${employeeId}&Type=${dcrType}`;
            const response = await axios.get(url);
            const data = response?.data?.d || [];
            setDcrList(data);
        } catch (error) {
            console.error('Error fetching DCR:', error);
            Alert.alert('Error', 'Failed to fetch DCR list.');
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }) => {
        const isRetailer = item.CustomerType?.toUpperCase() === 'RETAILER';
        const rawDate = item.DCRDate || '';
        const [datePart, timePartWithBracket] = rawDate.split('(');
        const timePart = timePartWithBracket ? timePartWithBracket.replace(')', '') : null;

        return (
            <View style={styles.card}>
                <View style={styles.headerRow}>
                    {isRetailer ? (
                        <FontAwesome5 name="store" size={18} color="#167d80" />
                    ) : (
                        <Feather name="user" size={18} color="#167d80" />
                    )}
                    <Text style={styles.customerName}>{item.Customer}</Text>
                </View>
                <Text style={styles.code}>Code: {item.Code}</Text>
                <Text style={styles.date}>Date: {datePart?.trim() || 'Not Available'}</Text>
                <Text style={styles.date}>Time: {timePart?.trim() || 'Not Available'}</Text>
                <Text style={styles.type}>Type: {item.CustomerType}</Text>
                <Text style={styles.area}>Area: {item.Area}</Text>
            </View>
        );
    };

    const filteredList = dcrList.filter(item => {
        const keyword = searchText.toLowerCase();
        return (
            item.Customer?.toLowerCase().includes(keyword) ||
            item.Area?.toLowerCase().includes(keyword)
        );
    });

    const handleRefresh = async () => {
        const netState = await NetInfo.fetch();
        if (!netState.isConnected) {
            Alert.alert('No Internet', 'Please connect to the internet to refresh the list.');
            return;
        }

        setRefreshing(true);
        await fetchDcrList(bisnessId, IDEmployee, type);
        setRefreshing(false);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.toggleContainer}>
                    <TouchableOpacity
                        style={[styles.toggleBtn, type === 'DOCTOR' && styles.activeBtn]}
                        onPress={() => setType('DOCTOR')}
                    >
                        <Text style={type === 'DOCTOR' ? styles.activeText : styles.inactiveText}>Doctor</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.toggleBtn, type === 'RETAILER' && styles.activeBtn]}
                        onPress={() => setType('RETAILER')}
                    >
                        <Text style={type === 'RETAILER' ? styles.activeText : styles.inactiveText}>Retailer</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#167d80" style={{ marginTop: 30 }} />
            ) : (
                <>
                    {dcrList.length === 0 ? (
                        <Text style={styles.noData}>No DCR records found.</Text>
                    ) : (
                        <FlatList
                            data={filteredList}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={renderItem}
                            contentContainerStyle={{ paddingBottom: 20 }}
                            refreshControl={
                                <RefreshControl
                                    refreshing={refreshing}
                                    onRefresh={handleRefresh}
                                    colors={['#167d80']} // Android indicator
                                    tintColor="#167d80" // iOS indicator
                                />
                            }
                            ListHeaderComponent={
                                <>
                                    {!isConnected && (
                                        <Text style={styles.offlineBanner}>
                                            ⚠️ Internet is required to load DCR records.
                                        </Text>
                                    )}
                                    <TextInput
                                        placeholder="Search by customer or area"
                                        value={searchText}
                                        onChangeText={setSearchText}
                                        style={styles.searchInput}
                                        placeholderTextColor="#888"
                                    />
                                </>
                            }
                        />


                    )}
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f9f9f9',
    },
    header: {
        marginBottom: 10,
    },
    toggleContainer: {
        flexDirection: 'row',
        gap: 10,
    },
    toggleBtn: {
        flex: 1,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#167d80',
        alignItems: 'center',
    },
    activeBtn: {
        backgroundColor: '#167d80',
    },
    activeText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    inactiveText: {
        color: '#167d80',
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 14,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 6, // Android 3D-like elevation
        borderWidth: 1,
        borderColor: '#eee',
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    customerName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
        color: '#333',
    },
    code: {
        fontSize: 14,
        color: '#444',
        marginBottom: 2,
    },
    date: {
        fontSize: 14,
        color: '#444',
        marginBottom: 2,
    },
    type: {
        fontSize: 14,
        color: '#444',
        marginBottom: 2,
    },
    area: {
        fontSize: 14,
        color: '#167d80',
        fontWeight: '500',
    },
    noData: {
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
        color: '#999',
    },
    searchInput: {
        backgroundColor: '#fff',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 8,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#ccc',
        color: '#333',
    },
    offlineBanner: {
        backgroundColor: '#ffe5e5',
        color: '#d60000',
        padding: 10,
        marginBottom: 10,
        borderRadius: 8,
        textAlign: 'center',
        fontWeight: '600',
    },

});

export default AdminViewDcr;
