import React, { useState, useEffect, useRef } from 'react';
import {
    SafeAreaView, ImageBackground, Dimensions, View, StyleSheet, Text,
    TouchableOpacity, TextInput, Alert, Modal, Platform
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DatePicker from 'react-native-date-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import NetInfo from '@react-native-community/netinfo';
import DeviceInfo from 'react-native-device-info';
import { useFocusEffect, StackActions } from '@react-navigation/native';
import { BackHandler } from 'react-native';
import { Hrms_URL, BASE_URL } from '@env';
import { MultiSelect, Dropdown } from 'react-native-element-dropdown';
import KeyboardAwareLayout from '../components/custom/KeyboardAwareLayout';

const FullDayLeaveScreen = ({ navigation }) => {
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
    const [leaveApplied, setLeaveApplied] = useState(false); //  Track apply status
    const [businessId, setBusinessId] = useState('');
    const [companyId, setCompanyId] = useState(null); // dynamic companyId
    const [selectedEncashment, setSelectedEncashment] = useState('0');



    //const companyId = '50';
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;             // 2026

    // const today = new Date();
    // const Current_Year = today.getFullYear();
    // console.log("Year:", Current_Year);
    // console.log("Day of the year:", today);

    useFocusEffect(
        React.useCallback(() => {
            const onBackPress = () => {
                if (!leaveApplied) {
                    Alert.alert('Hold On!', 'Please apply the leave before going back.');
                    return true; // Prevent default back
                }

                // Reset navigation if leave is applied
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'AppNavScreen' }],
                });
                return true; // Prevent default back
            };

            const beforeRemoveListener = (e) => {
                if (!leaveApplied) {
                    e.preventDefault();
                    Alert.alert('Hold On!', 'Please apply the leave before going back.');
                }
            };

            // Add listeners
            const backHandlerSubscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
            const beforeRemoveSubscription = navigation.addListener('beforeRemove', beforeRemoveListener);

            // Clean up
            return () => {
                backHandlerSubscription.remove();
                beforeRemoveSubscription();
            };
        }, [leaveApplied, navigation])
    );


    // 🔹 **Check Internet Connection**
    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            if (!state.isConnected) {
                setIsConnected(false);
                Alert.alert("No Internet Connection", "Your internet is off. Please turn it on to continue.");
                setAlertShown(true);   // ✅ Show Alert Only Once
            } else {
                setIsConnected(true);
                setAlertShown(false); // Reset alert flag when internet is back
            }
        });

        return () => unsubscribe(); // Cleanup
    }, []);

    useEffect(() => {
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
    }, []);

    useEffect(() => {

        const today = new Date();
        setFromDate(today); // sets today's date on initial load
        setToDate(today);
        setLeaveDays("1.00");

        if (leaveDurations.length > 0) {
            const fullDay = leaveDurations.find(d => d.LeaveDuration === "Full Day");
            if (fullDay) {
                setLeaveDuration(fullDay.DurationCode); // auto-set value
            }
        }
    }, [leaveDurations]);

    // useEffect(() => {
    //     const today = new Date();
    //     setFromDate(today); // sets today's date on initial load
    //     setToDate(today);
    //     setLeaveDays("1.00");
    // }, []);


    // Function to Retrieve `Empemail` and IdEmployee from AsyncStorage
    const getUserData = async () => {
        try {
            const jsonValue = await AsyncStorage.getItem('UserData');
            if (jsonValue !== null) {
                const userData = JSON.parse(jsonValue);
                const businessID = userData.BusinessID;

                setEmpEmail(userData.Empemail);
                setIDEmployee(userData.IDEmployee);
                setBusinessId(businessID);

                // 🔹 Set dynamic companyId based on BusinessID
                const normalizedBusinessID = businessID?.trim()?.toUpperCase();

                if (normalizedBusinessID === 'GENI-QST-536') {
                    setCompanyId(50);
                } else if (normalizedBusinessID === 'MEND-PVTL-890') {
                    setCompanyId(1);
                } else {
                    setCompanyId(0);
                    Alert.alert('Unknown Business', `Unsupported Business ID: ${normalizedBusinessID}`);
                }

                console.log("BusinessId:", normalizedBusinessID);
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



    const fetchLeaveBalance = async (email, year) => {
        //const companyId = 50;
        const url = `${Hrms_URL}RetrieveLeaveBalance?companyId=${companyId}&email=${email}&year=${year}`;

        console.log("API Link:", url);

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP status ${response.status}`);
            }
            const data = await response.json();

            console.log("API Response:", data); // Debugging

            // Store only leave types for Picker
            const leaveTypes = data.map(item => ({
                label: item.codedescription,
                value: item.leavetypeid,
                balance: item.balance // Store balance value
            }));

            setLeaveBalance(leaveTypes); // Set only relevant data

        } catch (error) {
            console.error('Error fetching leave balance:', error);
        }
    };

    const handleLeaveTypeChange = (value) => {
        setLeaveType(value);
        const selectedLeave = leaveBalance.find(item => item.value === value);
        setSelectedBalance(selectedLeave ? selectedLeave.balance : null);

        const normalizedBusinessId = businessId?.trim()?.toUpperCase();
        if (!(normalizedBusinessId === 'GENI-QST-536' && value === '2')) {
            setSelectedEncashment('0');
        }
        console.log("BusinessId Check:", businessId?.trim()?.toUpperCase());
        console.log("LeaveType Check:", value);

    };



    /**  Fetch Leave Durations from API */
    const fetchLeaveDurations = async () => {
        try {
            const apiUrl = `${Hrms_URL}LeaveDuration?companyId=${companyId}`;
            console.log("Fetching from API:", apiUrl); // Logs the API URL

            const response = await fetch(apiUrl);
            // console.log("Raw Response:", response); // Logs the raw response object

            const data = await response.json();
            console.log("API Data:", data); // Logs the actual API response data

            setLeaveDurations(data);
        } catch (error) {
            console.error('Error fetching leave durations:', error);
        }
    };


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
    }, [empEmail, companyId]);

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


    // Function to handle Apply Button Click
    const handleApply = async () => {
        if (!leaveType || !leaveDuration || !fromDate || !reason.trim()) {
            Alert.alert("Incomplete Form", "Please fill all fields before applying.", [{ text: "OK" }]);
            return;
        }

        // const companyId = 50; // Hardcoded company ID
        //const selectedEncashment = (selectedEncashment); // Selected Encashment
        console.log("Selected Encashment:", selectedEncashment);
        const email = (empEmail); // Employee Email from AsyncStorage
        const leaveId = encodeURIComponent(leaveType); // Leave ID (assuming it's the selected leaveType)
        const formattedStartDate = moment(fromDate).format("MM-DD-YYYY"); // Format start date
        const formattedEndDate = toDate ? moment(toDate).format("MM-DD-YYYY") : formattedStartDate; // Format end date or use startDate
        const encodedReason = encodeURIComponent(reason); // Encode reason to prevent API errors
        setLeaveApplied(true); // Mark as applied

        let apiUrl = "";
        console.log("Raw Email:", empEmail);
        // **Call the API based on Leave Duration selection**
        if (leaveDuration === "F") {
            if (businessId?.toString().trim().toUpperCase() === 'GENI-QST-536') {
                apiUrl = `${Hrms_URL}FullDayLeaveApplyGeniquest?companyId=${companyId}&leaveId=${leaveId}&startDate=${formattedStartDate}&endDate=${formattedEndDate}&email=${email}&leaveReason=${encodedReason}&isEncashed=${selectedEncashment}`;
                console.log("Full Day Leave API URL for Geniquest:", apiUrl); // Debugging
            } else {
                // API for Full Day Leave
                apiUrl = `${Hrms_URL}FullDayLeaveApply?companyId=${companyId}&leaveId=${leaveId}&startDate=${formattedStartDate}&endDate=${formattedEndDate}&email=${email}&leaveReason=${encodedReason}`;
                console.log("Full Day Leave API URL:", apiUrl); // Debugging
            }

        } else if (leaveDuration === "H") {
            // API for Half Day Leave
            apiUrl = `${Hrms_URL}HalfDayLeaveApply?companyId=${companyId}&leaveId=${leaveId}&startDate=${formattedStartDate}&email=${email}&leaveReason=${encodedReason}`;
        } else {
            Alert.alert("Invalid Selection", "Please select a valid Leave Duration.", [{ text: "OK" }]);
            return;
        }

        // console.log("API Request URL:", apiUrl); // Debugging

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP status ${response.status}`);
            }

            const responseData = await response.json();
            console.log("API Response:", responseData); // Debugging

            if (responseData.length > 0) {
                const status = responseData[0].Status;

                if (status === "1") {
                    // ✅ **Show full leave details in the modal**
                    setLeaveSummary(responseData[0]);
                    setShowSummary(true);

                } else {
                    //  **Show only the Status text in an alert**
                    Alert.alert("Leave Application Failed", status, [{ text: "OK" }]);
                }
            } else {
                Alert.alert("Error", "Unexpected response from server.", [{ text: "OK" }]);
            }
        } catch (error) {
            console.error("Error submitting leave:", error);
            Alert.alert("Error", "Failed to submit leave request. Please try again.", [{ text: "OK" }]);
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
        const currentYear = new Date().getFullYear();
        const nextYear = currentYear + 1;
        const FinancialYear = `${currentYear}-${nextYear}`;
        const email = empEmail;
        const leaveTypeName = leaveSummary.leavetype;
        const leaveDurationName = leaveSummary.duration;

        const formattedFromDate = moment(leaveSummary.leavestartdate, "MM-DD-YYYY").format("MM-DD-YYYY");
        const formattedToDate = moment(leaveSummary.leaveenddate, "MM-DD-YYYY").format("MM-DD-YYYY");
        const prefixFromDate = moment(leaveSummary.prefixfromdate, "MM-DD-YYYY").format("MM-DD-YYYY");
        const suffixToDate = moment(leaveSummary.sufixtodate, "MM-DD-YYYY").format("MM-DD-YYYY");
        const Applicationame = `ieCRM_Mobile - ${device}`;
        const formattedNoOfDays = leaveSummary.noofdays;

        let apiUrl = ""; // ✅ Declare apiUrl outside

        if (businessId?.toString().trim().toUpperCase() === 'GENI-QST-536') {
            apiUrl = `${Hrms_URL}ApplyLeaveGeniquest?companyId=${companyId}&email=${email}&leaveType=${leaveTypeName}&fromDate=${formattedFromDate}&toDate=${formattedToDate}&noOfDays=${formattedNoOfDays}&leaveReason=${encodeURIComponent(reason)}&duration=${leaveDurationName}&suffixToDate=${suffixToDate}&prefixFromDate=${prefixFromDate}&applicationType=${Applicationame}&FinancialYear=${FinancialYear}&isEncashed=${selectedEncashment}`;

            console.log("API Request URL for Geniquest:", apiUrl);
        } else {
            apiUrl = `${Hrms_URL}ApplyLeave?companyId=${companyId}&email=${email}&leaveType=${leaveTypeName}&fromDate=${formattedFromDate}&toDate=${formattedToDate}&noOfDays=${formattedNoOfDays}&leaveReason=${encodeURIComponent(reason)}&duration=${leaveDurationName}&suffixToDate=${suffixToDate}&prefixFromDate=${prefixFromDate}&applicationType=${Applicationame}`;

            console.log("API Request URL:", apiUrl);
        }

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP status ${response.status}`);
            }

            const responseData = await response.json();
            console.log("API Response:", responseData);

            if (responseData.length > 0) {
                const message = responseData[0].Message;
                if (!message || message.trim() === "") {
                    Alert.alert("Leave Submission Failed", "You Already Applied for the Leave", [{ text: "OK" }]);
                    await handleSaveCrm("Error");
                } else {
                    Alert.alert("Leave Submitted", message, [{ text: "OK" }]);
                    await handleSaveCrm("Success");
                }
            } else {
                Alert.alert("Error", "Unexpected response from server.", [{ text: "OK" }]);
                await handleSaveCrm("Error");
            }

            setShowSummary(false);
            resetForm();
        } catch (error) {
            console.error("Error submitting leave:", error);
            Alert.alert("Error", "Failed to submit leave request. Please try again.", [{ text: "OK" }]);
        }
    };


    // Function To Save Data In CRM Database 
    const handleSaveCrm = async (status) => {
        const IDApplication = 0;
        const EntryUser = empEmail; // Employee Email from AsyncStorage
        const IdEmployee = encodeURIComponent(IDEmployee); // Employee ID from AsyncStorage
        const leaveTypeName = leaveSummary.leavetype;
        const leaveDurationName = leaveSummary.duration;

        // Format Dates for API in "MM-DD-YYYY" format
        const formattedFromDate = moment(leaveSummary.leavestartdate, "MM-DD-YYYY").format("MM-DD-YYYY");
        const formattedToDate = moment(leaveSummary.leaveenddate, "MM-DD-YYYY").format("MM-DD-YYYY");
        const prefixFromDate = moment(leaveSummary.prefixfromdate, "MM-DD-YYYY").format("MM-DD-YYYY");
        const suffixToDate = moment(leaveSummary.sufixtodate, "MM-DD-YYYY").format("MM-DD-YYYY");

        // Ensure `noOfDays` is formatted correctly (e.g., 2.00)
        const formattedNoOfDays = leaveSummary.noofdays;
        const Remarks = leaveSummary.leavereason;
        const Businessid = businessId;

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
            Businessid: Businessid,
            Status: status
        };

        // Construct API URL
        const apiUrl = `${BASE_URL}LeaveApplication/Save`;

        console.log("API Request URL CRM :", apiUrl);
        console.log("Request Body:", JSON.stringify(requestBody)); // Debugging

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`HTTP status ${response.status}`);
            }

            const responseData = await response.json();
            console.log("API Response:", responseData); // Debugging

            // ✅ Check if response is {"result":""}
            if (responseData.result === "") {
                //Alert.alert("Success", "Leave Application Submitted Successfully.", [{ text: "OK" }]);
                setShowSummary(false); // Close modal
                resetForm(); // Reset form fields
                navigation.navigate('AppNavScreen');
            } else {
                Alert.alert("Error", responseData.result || "Unexpected error occurred.", [{ text: "OK" }]);
            }

        } catch (error) {
            console.error("Error submitting leave:", error);
            Alert.alert("Error", "Failed to submit leave request. Please try again.", [{ text: "OK" }]);
        }
    };


    return (
        <KeyboardAwareLayout>
            <ImageBackground
                source={require('../images/bg2.png')}
                style={styles.background}
                resizeMode="cover"
            >

                <KeyboardAwareScrollView
                    contentContainerStyle={styles.scrollContainer}
                    keyboardShouldPersistTaps="handled"
                    enableOnAndroid={true}
                    extraScrollHeight={Platform.OS === 'ios' ? 100 : 300}
                    enableAutomaticScroll={true}
                    ref={scrollRef}
                >

                    {/* Show Internet Warning when disconnected */}
                    {!isConnected && (
                        <View style={styles.noInternetContainer}>
                            <Text style={styles.noInternetText}>⚠ No Internet Connection</Text>
                        </View>
                    )}

                    {/* Title Overlay */}
                    {/* <View style={styles.titleOverlay}>
            <Text style={styles.title}>Leave Application</Text>
          </View> */}

                    {/* Add List Button at the Top-Right */}
                    <View style={styles.headerContainer}>
                        <TouchableOpacity
                            style={styles.listButton}
                            onPress={() => {
                                if (!isConnected) {
                                    Alert.alert("No Internet Connection", "Your internet is off. Please turn it on to continue.");
                                } else {
                                    navigation.navigate("Leave Application List");
                                }
                            }}>
                            <Text style={styles.listButtonText}>List</Text>
                        </TouchableOpacity>
                    </View>



                    <View style={styles.formContainer}>
                        {/* Leave Type Dropdown */}
                        <Text style={styles.label}>Select Leave Type</Text>

                        <View style={styles.dropdownContainer}>
                            {/* Dropdown for selecting Leave Type */}
                            <Dropdown
                                style={styles.picker1}
                                containerStyle={{ borderRadius: 8 }}
                                data={leaveBalance} // Should be [{ label, value, balance }]
                                labelField="label"
                                valueField="value"
                                placeholder="Select Leave Type"
                                search
                                searchPlaceholder="Search leave type..."
                                value={leaveType}
                                onChange={item => {
                                    handleLeaveTypeChange(item.value);

                                    const selected = leaveBalance.find(l => l.value === item.value);
                                    setSelectedBalance(selected ? selected.balance : null);
                                }}
                            />

                            {/* Display Leave Balance beside the selected Leave Type */}
                            {selectedBalance !== null && (
                                <View style={styles.balanceContainer}>
                                    <Text style={styles.balanceText}>Available Balance: {selectedBalance} </Text>
                                </View>
                            )}
                        </View>



                        {/* Leave Duration Dropdown */}
                        <Text style={styles.label}>Select Leave Duration</Text>
                        <View style={styles.dropdown}>
                            <Picker
                                selectedValue={leaveDuration}
                                onValueChange={() => { }} // keep it empty since we don't want it to be changeable
                                enabled={false} // disables the dropdown
                                style={styles.picker}
                            >
                                {leaveDurations.map((duration) => (
                                    <Picker.Item
                                        key={duration.DurationCode}
                                        label={duration.LeaveDuration}
                                        value={duration.DurationCode}
                                    />
                                ))}
                            </Picker>
                        </View>


                        {/* From Date Picker */}
                        <Text style={styles.label}>From Date</Text>
                        <View style={styles.dateButton}>
                            <View style={{ alignSelf: 'flex-start', paddingHorizontal: 10 }}>
                                <Text style={styles.dateText}>{fromDate?.toDateString() || "Loading..."}</Text>
                            </View>
                        </View>


                        {/* To Date Picker */}
                        <Text style={styles.label}>To Date</Text>
                        <View style={styles.dateButton}>
                            <View style={{ alignSelf: 'flex-start', paddingHorizontal: 10 }}>
                                <Text style={styles.dateText}>{toDate?.toDateString() || "Loading..."}</Text>
                            </View>
                        </View>

                        {/* Leave Days - Auto Calculated */}
                        <Text style={styles.label}>Leave Days</Text>
                        <TextInput
                            style={styles.input}
                            keyboardType="numeric"
                            value={leaveDays ? String(leaveDays) : ""} // Fixed syntax error
                            placeholder="No Of Days"
                            placeholderTextColor="#999"
                            editable={false}
                        />

                        {businessId?.toString().trim().toUpperCase() === 'GENI-QST-536' && leaveType?.toString() === '2' && (
                            <>
                                <Text style={styles.label}>Encashment</Text>
                                <Dropdown
                                    style={styles.picker1}
                                    containerStyle={{ borderRadius: 8 }}
                                    data={[
                                        { label: 'YES', value: '1' },
                                        { label: 'NO', value: '0' },
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
                            onFocus={() => scrollRef.current.scrollToEnd({ animated: true })}
                        />

                        {/* <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold' }}>User Email:</Text>
              <Text style={{ fontSize: 16, color: 'blue' }}>{empEmail || 'Loading...'}</Text>
            </View> */}

                        {/* Apply Button */}
                        <TouchableOpacity style={styles.applyButton} onPress={() => {
                            if (!isConnected) {
                                Alert.alert("No Internet Connection", "Your internet is off. Please turn it on to continue.");
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

                        <Text>Application Date: {leaveSummary?.applicationdate || "-"}</Text>
                        <Text>Leave Type: {leaveSummary?.leavetype || "-"}</Text>
                        <Text>Duration: {leaveSummary?.duration || "-"}</Text>
                        <Text>Start Date: {leaveSummary?.leavestartdate || "-"}</Text>
                        <Text>End Date: {leaveSummary?.leaveenddate || "-"}</Text>
                        <Text>No. of Days: {leaveSummary?.noofdays || "-"}</Text>
                        <Text>Reason: {leaveSummary?.leavereason || "-"}</Text>
                        <Text>Prefix Date: {leaveSummary?.prefixfromdate || "-"}</Text>
                        <Text>Suffix Date: {leaveSummary?.sufixtodate || "-"}</Text>

                        {/* Buttons */}
                        <View style={styles.buttonRow}>
                            <TouchableOpacity style={styles.saveButton} onPress={() => {
                                handleSave();
                                // handleSaveCrm();
                            }}>
                                <Text style={styles.buttonText}>Save</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowSummary(false)}>
                                <Text style={styles.buttonText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </KeyboardAwareLayout>
    );
};

export default FullDayLeaveScreen;

const styles = StyleSheet.create({
    background: {
        height: Dimensions.get('window').height,
        width: Dimensions.get('window').width,
        paddingRight: 20,
    },
    scrollContainer: {
        flexGrow: 1,
        alignItems: 'center',
        paddingVertical: 10,
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
    picker1: {
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

        // Shadow for iOS
        shadowColor: '#0E7777',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,

        // Shadow for Android
        elevation: 5,
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
        backgroundColor: '#33767C',
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
        //marginTop: 5,
    },
    headerContainer: {
        position: 'absolute',
        top: 10, // Adjust according to UI
        right: 20, // Position at the right
        zIndex: 10, // Ensure it stays on top
    },
    listButton: {
        backgroundColor: '#33767C', // Button Color
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
        alignItems: 'center'
    },

    noInternetText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16
    },

});
