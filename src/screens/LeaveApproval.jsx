import {
    View,
    Text,
    BackHandler,
    StyleSheet,
    ActivityIndicator,
    Alert,
    TouchableOpacity,
    FlatList,
    TextInput,
    StatusBar,
} from 'react-native';
import React, { useEffect, useCallback, useState } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Hrms_URL } from '@env';
import { Dropdown } from 'react-native-element-dropdown';
import KeyboardAwareLayout from '../components/custom/KeyboardAwareLayout';
import { Picker } from '@react-native-picker/picker';
import Feather from 'react-native-vector-icons/Feather';


const LeaveApproval = () => {
    const navigation = useNavigation();
    const [employeeData, setEmployeeData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(null);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [isFetching, setIsFetching] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [empemail, setEmpemail] = useState('');
    const [businessID, setBusinessID] = useState('');
    const [companyId, setCompanyId] = useState('');
    const [selectedLeaveStatus, setSelectedLeaveStatus] = useState('');
    const [remarks, setRemarks] = useState('');
    const [isDataVisible, setIsDataVisible] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [leaveRequestToEdit, setLeaveRequestToEdit] = useState(null); // Store the leave request being edited
    const [expandedApplicationId, setExpandedApplicationId] = useState(null); // Track expanded leave application

    const months = [
        { label: 'January', value: '01' },
        { label: 'February', value: '02' },
        { label: 'March', value: '03' },
        { label: 'April', value: '04' },
        { label: 'May', value: '05' },
        { label: 'June', value: '06' },
        { label: 'July', value: '07' },
        { label: 'August', value: '08' },
        { label: 'September', value: '09' },
        { label: 'October', value: '10' },
        { label: 'November', value: '11' },
        { label: 'December', value: '12' }
    ];

    const years = [
        { label: new Date().getFullYear().toString(), value: new Date().getFullYear() }
    ];

    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'approvalDashboard' }],
                }); // <-- Your main screen
                return true;
            };

            BackHandler.addEventListener('hardwareBackPress', onBackPress);

            return () => {
                BackHandler.removeEventListener('hardwareBackPress', onBackPress);
            };
        }, [navigation]),
    );

    useEffect(() => {
        AsyncStorage.getItem('UserData').then(value => {
            if (value != null) {
                let user = JSON.parse(value);
                setEmpemail(user.Empemail);
                setBusinessID(user.BusinessID.trim());
                let companyId;
                const businessID = user.BusinessID.trim();

                if (businessID === 'MEND-PVTL-890') {
                    companyId = 1;
                    setCompanyId(companyId);
                } else if (businessID === 'GENI-QST-536') {
                    companyId = 50;
                    setCompanyId(companyId);
                }

                const email = user.Empemail;
                fetchEmployeeData(companyId, email);
            }
        });
    }, []);

    const fetchEmployeeData = async (companyId, email) => {
        setLoading(true);
        try {
            const url = `${Hrms_URL}EmployeeNameHierarchyWise?companyId=${companyId}&email=${email}`;
            const response = await axios.get(url);
            const data = response.data;
            const formattedData = data.map(emp => ({
                label: emp.empname,
                value: emp.empno,
            }));
            setEmployeeData(formattedData);
        } catch (error) {
            console.error('Error fetching employee data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleShowData = async () => {
        if (!selectedMonth || !selectedYear || !selectedEmployee) {
            Alert.alert("Please select all fields");
            return;
        }

        setIsFetching(true);

        const url = `${Hrms_URL}OnSearchLeaveRequest?companyId=${companyId}&email=${empemail}&monthId=${selectedMonth}&year=${selectedYear}&hierarchyEmpId=${selectedEmployee}`;
        console.log('Fetching leave data from URL:', url);
        try {
            const response = await axios.get(url);
            setLeaveRequests(response.data);
            setIsDataVisible(true); // Show data and hide form
        } catch (error) {
            console.error('Error fetching leave data:', error);
            Alert.alert('Error', 'Failed to fetch leave data');
        } finally {
            setIsFetching(false);
        }
    };


    const renderLeaveRequest = ({ item }) => {
        const isExpanded = item.applicationhdrid === expandedApplicationId; // Check if the current item is expanded

        return (
            <View style={styles.leaveRequestContainer}>
                {/* Show basic info for all leave applications */}
                <Text style={styles.leaveRequestText}>Applicant Name: {item.empname}</Text>
                <Text style={styles.leaveRequestText}>Leave Type: {item.codedescription}</Text>

                {/* Current Status */}
                <Text style={styles.leaveRequestText}>
                    Current Status:{' '}
                    <Text
                        style={[
                            styles.value,
                            item.applicationstatus === "Approved"
                                ? styles.approved
                                : item.applicationstatus === "Cancelled"
                                    ? styles.pending
                                    : item.applicationstatus === "Send For Modification"
                                        ? styles.sendForModification
                                        : item.applicationstatus === "Submitted"
                                            ? styles.submitted
                                            : item.applicationstatus === "Reject"
                                                ? styles.rejected
                                                : styles.defaultStatus,
                        ]}
                    >
                        {typeof item.applicationstatus === 'string' ? item.applicationstatus : 'N/A'}
                    </Text>
                </Text>

                {/* Show the From/To Date only for all applications */}
                <Text style={styles.leaveRequestText}>From Date: {item.leavestartdate}</Text>
                <Text style={styles.leaveRequestText}>To Date: {item.leaveenddate}</Text>

                {/* Down arrow to toggle details visibility */}
                <TouchableOpacity
                    onPress={() => handleExpandApplication(item.applicationhdrid)}
                    style={{ justifyContent: 'center', alignItems: 'center' }}
                >
                    <Feather name={isExpanded ? 'chevron-up' : 'chevron-down'} size={24} color="#000" />
                </TouchableOpacity>


                {/* Show detailed information only if the application is expanded */}
                {isExpanded && (
                    <>
                        {/* Conditional rendering for "Submitted" status */}
                        {item.applicationstatus === 'Submitted' ? (
                            <>
                                <Text style={styles.leaveRequestText}>Application Date: {item.applicationdate}</Text>
                                <Text style={styles.leaveRequestText}>Number of Days: {item.noofdays}</Text>
                                <Text style={styles.leaveRequestText}>Leave Reason: {item.leavereason}</Text>

                                <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 8 }}>
                                    <Text style={styles.label1}>Remarks:</Text>
                                    <TextInput
                                        style={[styles.textInput1, { flex: 1 }]}
                                        placeholder="Enter Remarks"
                                        value={remarks}
                                        onChangeText={setRemarks}
                                        placeholderTextColor="#999"
                                    />
                                </View>

                                <Text style={styles.label}>Change Status:</Text>
                                <View style={styles.statusSelection}>
                                    {/* Approve Button */}
                                    <TouchableOpacity
                                        style={[styles.checkbox, styles.approveSelected]}
                                        onPress={() => {
                                            setSelectedLeaveStatus('2');
                                            Alert.alert(
                                                'Confirmation',
                                                'Do you want to Approve?',
                                                [
                                                    {
                                                        text: 'Cancel',
                                                        style: 'cancel',
                                                    },
                                                    {
                                                        text: 'OK',
                                                        onPress: () => handleSubmit(item.applicationhdrid, '2'),

                                                    },
                                                ],
                                                { cancelable: true }
                                            );
                                        }}
                                    >
                                        <View style={styles.checkboxContent}>
                                            <Text style={[styles.checkboxText, styles.selectedText]}>Approve</Text>
                                            <Feather name="check" size={18} color="#fff" style={{ marginLeft: 6 }} />
                                        </View>
                                    </TouchableOpacity>


                                    {/* Reject Button */}
                                    <TouchableOpacity
                                        style={[styles.checkbox, styles.rejectSelected]}
                                        onPress={() => {
                                            setSelectedLeaveStatus('3');
                                            Alert.alert(
                                                'Confirmation',
                                                'Do you want to Reject?',
                                                [
                                                    {
                                                        text: 'Cancel',
                                                        style: 'cancel',
                                                    },
                                                    {
                                                        text: 'OK',
                                                        onPress: () => handleSubmit(item.applicationhdrid, '3'),
                                                    },
                                                ],
                                                { cancelable: true }
                                            );
                                        }}
                                    >
                                        <View style={styles.checkboxContent}>
                                            <Text style={[styles.checkboxText, styles.selectedText]}>Reject</Text>
                                            <Feather name="x" size={18} color="#fff" style={{ marginLeft: 6 }} />
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </>
                        ) : (
                            <>
                                <Text style={styles.leaveRequestText}>Application Date: {item.applicationdate}</Text>
                                <Text style={styles.leaveRequestText}>Number of Days: {item.noofdays}</Text>
                                <Text style={styles.leaveRequestText}>Leave Reason: {item.leavereason}</Text>
                                <Text style={styles.leaveRequestText}>
                                    Approver Remarks:{' '}
                                    {typeof item.approverremarks === 'string' && item.approverremarks.trim() !== ''
                                        ? item.approverremarks
                                        : 'No remarks'}
                                </Text>

                            </>
                        )
                        }
                    </>
                )}
            </View>
        );
    };

    const handleExpandApplication = (applicationId) => {
        // Toggle the expanded application ID (only one application can be expanded at a time)
        setExpandedApplicationId(prevId => (prevId === applicationId ? null : applicationId));
        setRemarks(''); // Reset remarks when expanding a new application
        setSelectedLeaveStatus(''); // Reset selected status when expanding a new application
    };

    const handleLeaveStatusChange = (leaveId, status) => {
        setSelectedLeaveStatus(status);  // Set selected status (Approve/Reject)
    };

    const getCurrentFinancialYear = () => {
        const year = new Date().getFullYear();
        return `${year}-${year + 1}`;
    };


    const handleSubmit = async (leaveId, statusId) => {
        console.log('Submitting leave request:', leaveId);
        console.log('Selected Leave Status:', statusId);
        console.log('BusinessId:', businessID);
        console.log('Remarks:', remarks);
        const financialYear = getCurrentFinancialYear();
        if (!statusId || !remarks) {
            Alert.alert('Validation Error', 'Please select a status and provide remarks');
            return;
        }

        try {

            let url = '';

            if (businessID === 'GENI-QST-536') {
                url = `${Hrms_URL}UpdateLeaveStatusGeniquest?companyId=${companyId}&FinancialYear=${financialYear}&leaveApplicationId=${leaveId}&statusId=${statusId}&approveRemarks=${remarks}&email=${empemail}&action=${selectedLeaveStatus === '2' ? 'approve' : 'reject'}`;
                console.log('Submitting leave status update Geniquest:', url);
            } else {
                // Make API call to update the leave request status and remarks
                url = `${Hrms_URL}UpdateLeaveStatus?companyId=${companyId}&leaveApplicationId=${leaveId}&statusId=${statusId}&approveRemarks=${remarks}&email=${empemail}`;
                console.log('Submitting leave status update:', url);
            }
            const response = await axios.post(url);
            const result = response.data && response.data[0];

            // Check if the response is successful (Message is empty)
            if (result && (result.StatusDescription === "Approved" || result.StatusDescription === "Reject")) {

                Alert.alert(
                    'Success',
                    `Leave ${result.StatusDescription} successfully`
                );

                setLeaveRequests(prevRequests =>
                    prevRequests.map(req =>
                        req.applicationhdrid === leaveId
                            ? { ...req, applicationstatus: selectedLeaveStatus, approverremarks: remarks }
                            : req
                    )
                );

                // Reset remarks and selected status after submission
                setRemarks('');
                setSelectedLeaveStatus('');

                // Navigate back to "approvalDashboard" after successful update
                //navigation.navigate('AppNavScreen');
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'approvalDashboard' }],
                }); // <-- Your ApprovalDashboard screen
            } else {
                // Alert.alert('Error', 'Failed to update leave status');
                Alert.alert('Failed to update leave status', 'Unexpected response from server');

            }
        } catch (error) {
            console.error('Error updating leave status:', error);
            Alert.alert('Error', 'Failed to update leave status');
        }
    };




    const handleGoBack = () => {
        setIsDataVisible(false); // Hide data and show the form again
        setSelectedEmployee(null);
        setSelectedMonth(null);
        setSelectedYear(new Date().getFullYear());
    };

    return (
        <KeyboardAwareLayout>
            <StatusBar barStyle="light-content" backgroundColor="#a9ddfaff" />
            {isDataVisible ? (
                <>
                    <TouchableOpacity style={styles.goBackButton} onPress={handleGoBack}>
                        <Text style={styles.buttonText}>Go Back</Text>
                    </TouchableOpacity>

                    {isFetching && <ActivityIndicator size="large" color="#33767C" />}

                    <FlatList
                        data={leaveRequests}
                        renderItem={renderLeaveRequest}
                        keyExtractor={item => item.applicationhdrid.toString()}
                    />
                </>
            ) : (
                <>
                    {loading ? (
                        <ActivityIndicator size="large" color="#005696" />
                    ) : (
                        <>
                            <View style={{
                                padding: 8,
                                margin: 5,
                                borderRadius: 8,
                                borderWidth: 1,
                                borderColor: 'lightgrey',
                                backgroundColor: 'white',
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.8,
                                shadowRadius: 2,
                                elevation: 5,
                            }}>
                                <Text style={styles.label}>Employee Name</Text>
                                <Dropdown
                                    style={styles.picker}
                                    containerStyle={{ borderRadius: 8 }}
                                    data={employeeData}
                                    labelField="label"
                                    valueField="value"
                                    placeholder="Select an Employee"
                                    search
                                    searchPlaceholder="Search employee..."
                                    onChange={item => setSelectedEmployee(item.value)}
                                />
                                <Text style={styles.label}>Month</Text>

                                <View style={styles.pickerContainer}>
                                    <Picker
                                        selectedValue={selectedMonth}
                                        style={styles.picker1}
                                        onValueChange={(itemValue) => setSelectedMonth(itemValue)}
                                    >
                                        {months.map((month) => (
                                            <Picker.Item key={month.value} label={month.label} value={month.value} />
                                        ))}
                                    </Picker>
                                </View>

                                <Text style={styles.label}>Year</Text>
                                <Dropdown
                                    style={styles.picker}
                                    containerStyle={{ borderRadius: 8 }}
                                    data={years}
                                    labelField="label"
                                    valueField="value"
                                    placeholder="Select Year"
                                    onChange={item => setSelectedYear(item.value)}
                                />

                                <TouchableOpacity style={styles.button} onPress={handleShowData}>
                                    <Text style={styles.buttonText}>Show Data</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}
                </>
            )}
        </KeyboardAwareLayout>
    );
};

const styles = StyleSheet.create({
    label: {
        fontSize: 16,
        marginBottom: 10,
        marginLeft: 10,
    },
    picker: {
        fontSize: 16,
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderWidth: 1.3,
        borderColor: '#0E7777',
        borderRadius: 10,
        backgroundColor: '#fff',
        color: '#000000',
        marginBottom: 15,
        paddingRight: 30,
    },
    button: {
        backgroundColor: '#005696',
        paddingVertical: 12,
        borderRadius: 10,
        marginBottom: 20,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
    leaveRequestContainer: {
        marginBottom: 15,
        marginLeft: 10,
        marginRight: 10,
        borderWidth: 0.2,
        padding: 10,
        backgroundColor: '#ffffff',
        borderRadius: 5,

        // Shadow for iOS
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.2,
        shadowRadius: 4,

        // Elevation for Android
        elevation: 5,
    },

    leaveRequestText: {
        fontSize: 14,
        marginBottom: 5,
    },
    approved: {
        color: 'green',
    },
    pending: {
        color: '#df65c0ff',
    },
    sendForModification: {
        color: '#a606d2',
    },
    submitted: {
        color: 'blue',
    },
    rejected: {
        color: '#f70e08',
    },
    defaultStatus: {
        color: 'gray',
    },
    textInput: {
        height: 40,
        borderColor: '#0E7777',
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 15,
        paddingLeft: 10,
    },
    statusSelection: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 10,
    },
    checkbox: {
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        margin: 5,
        backgroundColor: '#f9f9f9',
    },
    selectedCheckbox: {
        backgroundColor: '#0E7777',
    },
    checkboxContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },

    approveSelected: {
        backgroundColor: '#4CAF50', // Light green
        borderColor: '#4CAF50',
    },

    rejectSelected: {
        backgroundColor: '#F44336', // Light red
        borderColor: '#F44336',
    },

    selectedText: {
        color: '#fff',
    },
    goBackButton: {
        backgroundColor: '#005696',
        paddingVertical: 12,
        borderRadius: 10,
        marginBottom: 20,
        alignItems: 'center',
    },
    pickerContainer: {
        borderWidth: 1.3,
        borderColor: '#0E7777',
        borderRadius: 10,
        marginBottom: 15,
        overflow: 'hidden',
    },
    picker1: {
        fontSize: 16,
        paddingVertical: 12,
        paddingHorizontal: 10,
        backgroundColor: '#fff',
    },
    toggleText: {
        fontSize: 14,
        color: '#005696',
        textDecorationLine: 'underline',
        marginTop: 10,
    },
    label1: {
        width: 80,               // or flex: 0.3
        fontSize: 16,
        color: '#000',
        marginRight: 8,
    },
    textInput1: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        paddingHorizontal: 10,
        borderRadius: 6,
        fontSize: 16,
        color: '#000',
        backgroundColor: '#fff',
    },
});

export default LeaveApproval;
