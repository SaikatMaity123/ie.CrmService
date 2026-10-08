import React, { useCallback, useEffect, useState } from 'react';
import {
    View, Text, BackHandler, StyleSheet,
    Alert, ActivityIndicator, TouchableOpacity, FlatList, TextInput
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dropdown } from 'react-native-element-dropdown';
import axios from 'axios';
import { Sales_URL } from '@env';
import Feather from 'react-native-vector-icons/Feather'; // make sure this is imported
import { CommonActions } from '@react-navigation/native';

const AdminSalesDashboard = () => {
    const navigation = useNavigation();
    const [selectedDivision, setSelectedDivision] = useState(null);
    const [selectedDesignation, setSelectedDesignation] = useState(null);
    const [designationList, setDesignationList] = useState([]);
    const [employeeList, setEmployeeList] = useState([]);
    const [loadingDesignations, setLoadingDesignations] = useState(false);
    const [loadingEmployees, setLoadingEmployees] = useState(false);
    const [searchText, setSearchText] = useState('');

    const [divisionList] = useState([
        { label: 'PHOENIX', value: 'PHOENIX' },
        { label: 'MPPL', value: 'MAD' },
        { label: 'CONCORD', value: 'CONCORD' },
        { label: 'MCSO', value: 'MCSO' },
    ]);


    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                navigation.navigate('AppNavScreen');
                return true;
            };
            BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
        }, [navigation])
    );

    useEffect(() => {
        AsyncStorage.getItem('UserData').then(value => {
            if (value != null) {
                const user = JSON.parse(value);
               // console.log(user);
            }
        });
    }, []);

    const fetchDesignationList = async (division) => {
        try {
            setLoadingDesignations(true);
            const apiUrl = `${Sales_URL}DivisionwisePost`;
            const response = await axios.post(apiUrl, null, {
                params: { div: division, action: 'post' },
                headers: { 'Content-Type': 'application/json' }
            });

            const data = response.data;
            if (Array.isArray(data)) {
                const formatted = data.map(item => ({
                    label: item.post,
                    value: item.post,
                }));
                setDesignationList(formatted);
                setSelectedDesignation(null);
                setEmployeeList([]);
            } else {
                setDesignationList([]);
                Alert.alert('No designations found');
            }
        } catch (error) {
            console.error('Error fetching designations:', error);
            Alert.alert('Error fetching designation list');
        } finally {
            setLoadingDesignations(false);
        }
    };

    const fetchEmployeeList = async (division, post) => {
        try {
            setLoadingEmployees(true);
            const response = await axios.post(
                `${Sales_URL}DivisionwisePostPerson`,
                null,
                {
                    params: { div: division, post: post, action: 'emp' },
                    headers: { 'Content-Type': 'application/json' }
                }
            );

            const data = response.data;
            if (Array.isArray(data)) {
                setEmployeeList(data);
            } else {
                setEmployeeList([]);
                Alert.alert('No employees found');
            }
        } catch (error) {
            console.error('Error fetching employee list:', error);
            Alert.alert('Error fetching employee list');
        } finally {
            setLoadingEmployees(false);
        }
    };

    const handleDivisionChange = (item) => {
        setSelectedDivision(item.value);
        setSelectedDesignation(null);
        setEmployeeList([]);
        fetchDesignationList(item.value);
    };

    const handleDesignationChange = (item) => {
        setSelectedDesignation(item.value);
        if (selectedDivision) {
            fetchEmployeeList(selectedDivision, item.value);
        }
    };

    const filteredEmployeeList = employeeList.filter(emp => {
        const keyword = searchText.toLowerCase();
        return (
            (emp.empname?.toLowerCase() || '').includes(keyword) ||
            (emp.empemail?.toLowerCase() || '').includes(keyword) ||
            (emp.post?.toLowerCase() || '').includes(keyword) ||
            (emp.Division?.toLowerCase() || '').includes(keyword)
        );
    });


    const renderEmployee = ({ item }) => {
        const employeeData = {
            empname: item.empname,
            Division: item.Division,
            post: item.post,
            empemail: item.empemail,
            empno: item.empno,
        };
        console.log(employeeData);

        return (
            <TouchableOpacity
                style={styles.employeeCard}
                onPress={() => {
                    const employeePayload = {
                        empname: item.empname,
                        empemail: item.empemail,
                        Division: item.Division,
                        POST: item.post,
                        EMP_NO: item.empno
                    };

                    navigation.dispatch(
                        CommonActions.reset({
                            index: 0,
                            routes: [{ name: 'SALES REPORT', params: { selectedEmployee: employeePayload } }],
                        })
                    );
                }}

            >
                <View style={styles.employeeRow}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.empName}>{item.empname}</Text>
                        <Text style={styles.empEmail}>{item.empemail}</Text>
                        <Text style={styles.empPost}>
                            {item.post} | {item.Division === 'MAD' ? 'MPPL' : item.Division}
                        </Text>
                    </View>
                    <Feather name="chevron-right" size={24} color="#999" />
                </View>
            </TouchableOpacity>
        );
    };



    return (
        <View style={styles.container}>
            {/* <Text style={styles.title}>Admin Sales Dashboard</Text> */}

            <Text style={styles.label}>Select Division</Text>
            <Dropdown
                style={styles.dropdown}
                containerStyle={styles.dropdownContainer}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                itemTextStyle={styles.itemTextStyle}
                activeColor="#e0f7f5"
                data={divisionList}
                labelField="label"
                valueField="value"
                placeholder="Select Division"
                value={selectedDivision}
                onChange={handleDivisionChange}
            />

            <Text style={styles.label}>Select Designation</Text>
            {loadingDesignations ? (
                <ActivityIndicator size="small" color="#167d80" />
            ) : (
                <Dropdown
                    style={styles.dropdown}
                    containerStyle={styles.dropdownContainer}
                    placeholderStyle={styles.placeholderStyle}
                    selectedTextStyle={styles.selectedTextStyle}
                    itemTextStyle={styles.itemTextStyle}
                    activeColor="#e0f7f5"
                    data={designationList}
                    labelField="label"
                    valueField="value"
                    placeholder="Select Designation"
                    value={selectedDesignation}
                    onChange={handleDesignationChange}
                    disabled={!selectedDivision}
                />
            )}

            <Text style={styles.title}>Employee List</Text>
            {loadingEmployees ? (
                <>
                    <View style={{
                        flexDirection: 'column', alignItems: 'center',
                        justifyContent: 'center', marginTop: 20
                    }}>
                        <ActivityIndicator size="large" color="#167d80" />
                        <Text style={styles.label}>Loading...</Text>
                    </View>
                </>
            ) : (

                <>

                    {/* <Text style={styles.label}>Search Employee</Text> */}
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search by name, email, post..."
                        value={searchText}
                        onChangeText={setSearchText}
                        placeholderTextColor="#aaa"
                    />

                    <FlatList
                        data={filteredEmployeeList}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={renderEmployee}
                        ListEmptyComponent={<Text style={styles.noData}>No employees found</Text>}
                    />
                </>
            )}

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#ffffff',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#167d80',
        marginBottom: 10,
        marginTop: 10,
        textAlign: 'center',
    },
    label: {
        fontSize: 16,
        marginBottom: 5,
        color: '#333',
        marginTop: 10,
    },
    dropdown: {
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 12,
        backgroundColor: '#fff',
        marginBottom: 6,
    },
    dropdownContainer: {
        borderRadius: 12,
        backgroundColor: '#fff',
        borderColor: '#ddd',
        borderWidth: 1,
        elevation: 5,
    },
    placeholderStyle: {
        color: '#999',
        fontSize: 14,
        fontStyle: 'italic',
    },
    selectedTextStyle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#167d80',
    },
    itemTextStyle: {
        fontSize: 14,
        color: '#333',
    },
    employeeCard: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 12,
        marginVertical: 6,
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
    },
    empName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#222',
    },
    empEmail: {
        fontSize: 14,
        color: '#444',
    },
    empPost: {
        fontSize: 13,
        color: '#167d80',
        marginTop: 4,
    },
    noData: {
        textAlign: 'center',
        color: '#999',
        marginTop: 20,
    },
    searchInput: {
        height: 48,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 12,
        backgroundColor: '#fff',
        marginBottom: 16,
        color: '#333',
        fontSize: 14,
    },
    employeeRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },


});

export default AdminSalesDashboard;
