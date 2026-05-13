import React, { useEffect, useState, useCallback } from "react";
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import {
    View, Text, FlatList, ActivityIndicator, Alert, SafeAreaView, TouchableOpacity,
    TextInput, StyleSheet, BackHandler, StatusBar,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import moment from "moment";
import Icon from 'react-native-vector-icons/Ionicons'; // Import the icon library
import { Hrms_URL, BASE_URL } from '@env';

const LeaveStatus = ({ navigation }) => {
    const [leaveApplications, setLeaveApplications] = useState([]);
    const [filteredApplications, setFilteredApplications] = useState([]); // Filtered List
    const [loading, setLoading] = useState(true);
    const [empEmail, setEmpEmail] = useState("");
    const [searchQuery, setSearchQuery] = useState(""); // Search Query
    const [businessId, setBusinessId] = useState('');
    const [companyId, setCompanyId] = useState(null); // dynamic companyId

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
    // Fetch user email when screen loads
    useEffect(() => {
        getUserData();
        if (companyId && empEmail) {
            fetchLeaveApplications(empEmail, businessId);
        }
    }, [companyId, empEmail]);


    const getUserData = async () => {
        try {
            const jsonValue = await AsyncStorage.getItem("UserData");
            if (jsonValue !== null) {
                const userData = JSON.parse(jsonValue);
                const normalizedBusinessID = userData.BusinessID?.trim()?.toUpperCase();
                setBusinessId(normalizedBusinessID);
                setEmpEmail(userData.Empemail); // Set here

                if (normalizedBusinessID === 'GENI-QST-536') {
                    setCompanyId(50);
                } else if (normalizedBusinessID === 'MEND-PVTL-890') {
                    setCompanyId(1);
                } else {
                    setCompanyId(0);
                    Alert.alert('Unknown Business', `Unsupported Business ID: ${normalizedBusinessID}`);
                }
            } else {
                Alert.alert("Error", "User data not found.");
                setLoading(false);
            }
        } catch (error) {
            console.error("Error retrieving data:", error);
            setLoading(false);
        }
    };


    // Function to Fetch Leave Applications
    const fetchLeaveApplications = async (email, businessId) => {
        const currentYear = moment().format("YYYY");
        let apiUrl = ''; // Use `let` here so you can assign inside condition

        if (businessId === 'GENI-QST-536') {
            apiUrl = `${Hrms_URL}LeaveApplicationHistoryGeniquest?companyId=${companyId}&email=${email}&year=${currentYear}`;
        } else {
            apiUrl = `${Hrms_URL}LeaveApplicationHistory?companyId=${companyId}&email=${email}&year=${currentYear}`;
        }

        console.log("API Request URL List:", apiUrl);

        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`HTTP status ${response.status}`);
            }

            const data = await response.json();

            const cleanedData = data.map((item) => ({
                applicationhdrid: item.applicationhdrid || "-",
                leaveid: item.leaveid || "-",
                leavestartdate: typeof item.leavestartdate === "object" ? "-" : item.leavestartdate,
                leaveenddate: typeof item.leaveenddate === "object" ? "-" : item.leaveenddate,
                duration: item.duration || "-",
                noofdays: item.noofdays !== undefined ? item.noofdays : "-",
                applicationdate: item.applicationdate || "-",
                leavereason: item.leavereason || "-",
                createdby: item.createdby || "-",
                codedescription: item.codedescription || "-",
                Applicationstatus: item.Applicationstatus || "-",
                approverremarks: typeof item.approverremarks === "object" ? "-" : item.approverremarks,
            }));

            setLeaveApplications(cleanedData);
            setFilteredApplications(cleanedData);
        } catch (error) {
            console.error("Error fetching leave applications:", error);
            Alert.alert("Error", "Failed to fetch leave applications. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Function to Handle Search
    const handleSearch = (text) => {
        setSearchQuery(text);
        if (text.trim() === "") {
            setFilteredApplications(leaveApplications);
        } else {
            const filteredData = leaveApplications.filter((item) =>
                item.codedescription.toLowerCase().includes(text.toLowerCase()) ||
                item.applicationdate.toLowerCase().includes(text.toLowerCase()) ||
                item.leavestartdate.toLowerCase().includes(text.toLowerCase()) ||
                item.leaveenddate.toLowerCase().includes(text.toLowerCase()) ||
                item.Applicationstatus.toLowerCase().includes(text.toLowerCase())
            );
            setFilteredApplications(filteredData);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#a9ddfaff" />
            <Text style={styles.header}></Text>


            {/* 🔍 Search Bar */}
            <View style={styles.searchContainer}>
                <Icon name="search" size={20} color="#666" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchBar}
                    placeholder="Search by Leave Type, Date, or Status..."
                    placeholderTextColor="#666"
                    value={searchQuery}
                    onChangeText={handleSearch}
                />
            </View>

            {/* Refresh Button at the Top-Right */}
            <View style={styles.headerContainer}>
                <TouchableOpacity style={styles.refreshButton} onPress={() => fetchLeaveApplications(empEmail)}>
                    <Text style={styles.refreshButtonText}>Refresh</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#33767C" />
            ) : filteredApplications.length === 0 ? (
                <Text style={styles.noDataText}>No leave applications found</Text>
            ) : (
                // <FlatList
                //     data={filteredApplications}
                //     keyExtractor={(item) => item.applicationhdrid.toString()}
                //     renderItem={({ item }) => (
                //         <View style={styles.card}>
                //             <Text style={styles.label}>Application ID: <Text style={styles.value}>{item.applicationhdrid}</Text></Text>
                //             <Text style={styles.label}>Leave Type: <Text style={styles.value}>{item.codedescription}</Text></Text>
                //             <Text style={styles.label}>Duration: <Text style={styles.value}>{item.duration}</Text></Text>
                //             <Text style={styles.label}>From: <Text style={styles.value}>{item.leavestartdate}</Text></Text>
                //             <Text style={styles.label}>To: <Text style={styles.value}>{item.leaveenddate}</Text></Text>
                //             <Text style={styles.label}>Days: <Text style={styles.value}>{item.noofdays}</Text></Text>
                //             <Text style={styles.label}>Applied On: <Text style={styles.value}>{item.applicationdate}</Text></Text>
                //             <Text style={styles.label}>Reason: <Text style={styles.value}>{item.leavereason}</Text></Text>
                //             <Text style={styles.label}>Approver Remarks: <Text style={styles.value}>{item.approverremarks}</Text></Text>
                //             <Text style={styles.label}>
                //                 Status:
                //                 <Text
                //                     style={[
                //                         styles.value,
                //                         item.Applicationstatus === "Approved"
                //                             ? styles.approved
                //                             : item.Applicationstatus === "Cancelled"
                //                                 ? styles.pending
                //                                 : item.Applicationstatus === "Send For Modification"
                //                                     ? styles.sendForModification
                //                                     : item.Applicationstatus === "Submitted"
                //                                         ? styles.submitted
                //                                         : item.Applicationstatus === "Reject"
                //                                             ? styles.rejected
                //                                             : {},
                //                     ]}
                //                 >
                //                     {item.Applicationstatus}
                //                 </Text>
                //             </Text>
                //         </View>
                //     )}
                // />
                <FlatList
                    data={filteredApplications}
                    keyExtractor={(item) => item.applicationhdrid.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            {/* Header Row */}
                            <View style={styles.headerRow}>
                                <Text style={styles.leaveType}>{item.codedescription}</Text>
                                <View
                                    style={[
                                        styles.statusBadge,
                                        item.Applicationstatus === "Approved"
                                            ? styles.approvedBadge
                                            : item.Applicationstatus === "Reject"
                                                ? styles.rejectedBadge
                                                : item.Applicationstatus === "Cancelled"
                                                    ? styles.cancelledBadge
                                                    : item.Applicationstatus === "Send For Modification"
                                                        ? styles.modificationBadge
                                                        : item.Applicationstatus === "Submitted"
                                                            ? styles.submittedBadge
                                                            : styles.pendingBadge, // fallback (if any unexpected value)
                                    ]}
                                >
                                    <Text style={styles.statusText}>{item.Applicationstatus}</Text>
                                </View>

                            </View>

                            {/* Date Range */}
                            <Text style={styles.dateText}>
                                {item.leavestartdate} - {item.leaveenddate} ({item.duration})
                            </Text>

                            {/* Application Info */}
                            <Text style={styles.appIdText}>Application ID: {item.applicationhdrid}</Text>

                            {/* Reason */}
                            <Text style={styles.reasonText} numberOfLines={2}>
                                {item.leavereason || "No reason provided"}
                            </Text>

                            {/* Footer Date */}
                            <Text style={styles.footerDate}>{item.applicationdate}</Text>
                        </View>
                    )}
                />

            )}

            {/* Refresh Button */}
            {/* <TouchableOpacity style={styles.refreshButton} onPress={() => fetchLeaveApplications(empEmail)}>
                <Text style={styles.refreshButtonText}>Refresh</Text>
            </TouchableOpacity> */}
        </SafeAreaView>
    );
};
export default LeaveStatus;
// Styles
const styles = StyleSheet.create({
    container: { flex: 1, padding: 10, backgroundColor: "#f5f5f5" },
    header: { fontSize: 20, fontWeight: "bold", textAlign: "center", marginVertical: 10, color: "#333" },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0f0', // Light background
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 5,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    searchIcon: {
        marginRight: 10, // Space between icon and text input
    },
    searchBar: {
        flex: 1, // Allows input to expand fully
        fontSize: 16,
        color: '#333',
    },
    noDataText: { fontSize: 16, textAlign: "center", color: "gray", marginTop: 20 },
    // card: { backgroundColor: "#fff", padding: 15, marginVertical: 5, borderRadius: 8, elevation: 3 },
    // label: { fontSize: 14, fontWeight: "bold", color: "#555" },
    // value: { fontWeight: "normal", color: "#000" },
    // approved: {
    //     color: "green",
    //     fontWeight: "bold",
    // },
    // pending: {
    //     color: "darkred",
    //     fontWeight: "bold",
    // },
    // sendForModification: {
    //     color: '#FF8C00', // Dark Orange
    //     fontWeight: "bold",
    // },
    // submitted: {
    //     color: "blue",
    //     fontWeight: "bold",
    // },
    // rejected: {
    //     color: "red",
    //     fontWeight: "bold",
    // },
    card: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 12,
        marginVertical: 6,
        marginHorizontal: 10,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    leaveType: {
        fontFamily: 'Lato-Bold',
        fontSize: 16,
        color: '#222',
    },
    statusBadge: {
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 20,
        alignSelf: 'flex-start',
    },

    approvedBadge: {
        backgroundColor: '#00A86B', // ✅ Green
    },

    rejectedBadge: {
        backgroundColor: '#f12d51ff', // ❌ Red
    },

    cancelledBadge: {
        backgroundColor: '#e647a9ff', // ⚪ Grey
    },

    modificationBadge: {
        backgroundColor: '#FF8C00', // 🟠 Orange
    },

    submittedBadge: {
        backgroundColor: '#1E90FF', // 🔵 Blue
    },

    pendingBadge: {
        backgroundColor: '#A020F0', // 🟣 Purple (fallback for unknown)
    },

    statusText: {
        color: '#fff',
        fontSize: 13,
        fontFamily: 'Lato-Bold',
    },
    dateText: {
        color: '#444',
        fontSize: 14,
        marginBottom: 2,
    },
    appIdText: {
        color: '#666',
        fontSize: 13,
        marginBottom: 4,
    },
    reasonText: {
        color: '#777',
        fontSize: 13,
        marginBottom: 6,
    },
    footerDate: {
        fontSize: 12,
        color: '#999',
        textAlign: 'right',
    },
    refreshButton: { backgroundColor: "#005696", padding: 12, borderRadius: 8, alignItems: "center", marginTop: 10 },
    refreshButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
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
});
