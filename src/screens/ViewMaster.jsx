import {
    View,
    Text,
    SafeAreaView,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    TextInput,
    Alert,
    Modal,
    ScrollView
} from 'react-native';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import NetInfo from "@react-native-community/netinfo";
import { BASE_URL } from '@env';
import LottieView from 'lottie-react-native';
import { Dropdown } from 'react-native-element-dropdown';
import KeyboardAwareLayout from '../components/custom/KeyboardAwareLayout';

const ViewMaster = () => {
    const [activeTab, setActiveTab] = useState('Account');
    const [dataList, setDataList] = useState([]);
    const [filteredList, setFilteredList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [statusLoading, setStatusLoading] = useState(false);
    const [useUName, setUName] = useState('');
    const [useHexKey, setHexKey] = useState('');
    const [useBusinessID, setBusinessID] = useState('');
    const [userType, setUserType] = useState('');
    const [isOffline, setIsOffline] = useState(false);
    // add near your useState hooks
    const [selectedMap, setSelectedMap] = useState({});
    // helper: unique key per tab/item
    const getRowKey = (item) => {
        if (activeTab === 'Account') return `A-${item.IDAccount}`;
        if (activeTab === 'Product') return `P-${item.IDProduct}`;
        if (activeTab === 'Referrer') return `R-${item.IDReferer}`;
        return `${activeTab}-${Math.random()}`;
    };
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editData, setEditData] = useState(null);
    const [editLoading, setEditLoading] = useState(false);
    const [stateList, setStateList] = useState([]);
    const [productEditModalVisible, setProductEditModalVisible] = useState(false);
    const [productEditData, setProductEditData] = useState(null);
    const [productEditLoading, setProductEditLoading] = useState(false);
    const [groupList, setGroupList] = useState([]);
    const [categoryList, setCategoryList] = useState([]);
    const [refEditModalVisible, setRefEditModalVisible] = useState(false);
    const [refEditData, setRefEditData] = useState(null);
    const [ReferrerEditLoading, setReferrerEditLoading] = useState(false);
    const [cityList, setCityList] = useState([]);
    const [countryList, setCountryList] = useState([]);
    const [activeList, setActiveList] = useState([]);

    // const activeList = [
    //     { label: "Active", value: 1 },
    //     { label: "Inactive", value: 0 }
    // ];

    const toggleSelect = (item) => {
        const key = getRowKey(item);
        setSelectedMap((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    useEffect(() => {
        loadUserData();
        const unsubscribe = NetInfo.addEventListener(state => {
            const offline = !(state.isConnected && state.isInternetReachable);
            setIsOffline(offline);
        });

        return () => unsubscribe();
    }, []);

    const loadUserData = async () => {

        const userDataStr = await AsyncStorage.getItem('UserData');

        if (!userDataStr) return;

        const user = JSON.parse(userDataStr);

        setHexKey(user.CompanyHexKey);
        setUName(user.UserName);
        setBusinessID(user.CompanyCode);
        setUserType(user.UserType);

        fetchAccountList(user.CompanyHexKey, user.UserName, user.UserType);
    };

    const fetchAccountList = async (hex, user, type) => {
        if (isOffline) {
            Alert.alert("Offline", "You are offline. Unable to fetch data.");
            return;
        }

        try {

            setLoading(true);

            const url =
                `${BASE_URL}Account/List?HexKey=${hex}&UserName=${user}&UserType=${type}`;

            const res = await axios.get(url);

            if (res.data.Status === 'SUCCESS') {
                setDataList(res.data.DataList);
                setFilteredList(res.data.DataList);
            }

        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchProductList = async (hex, businessId) => {

        if (isOffline) {
            Alert.alert("Offline", "You are offline. Unable to fetch data.");
            return;
        }

        try {

            setLoading(true);

            const url =
                `${BASE_URL}Product/List?HexKey=${hex}&BusinessID=${businessId}`;

            const res = await axios.get(url);

            if (res.data.Status === 'SUCCESS') {
                setDataList(res.data.DataList);
                setFilteredList(res.data.DataList);
            }

        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchReferrerList = async (hex) => {

        if (isOffline) {
            Alert.alert("Offline", "You are offline. Unable to fetch data.");
            return;
        }
        try {

            setLoading(true);

            const url =
                `${BASE_URL}referrer/list?HexKey=${hex}`;

            const res = await axios.get(url);

            if (res.data?.data) {
                setDataList(res.data.data);
                setFilteredList(res.data.data);
            }

        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchStateList = async () => {
        try {

            const url = `${BASE_URL}Misc/MiscList?HexKey=${useHexKey}&type=STATE`;

            const res = await axios.get(url);

            if (res.data?.data) {

                const formatted = res.data.data.map(item => ({
                    label: item.Name,
                    value: item.IDMisc
                }));

                setStateList(formatted);
            }

        } catch (err) {
            console.log("State API error:", err);
        }
    };

    const fetchAccountDetail = async (id) => {
        try {

            setEditLoading(true);

            const url =
                `${BASE_URL}Account/Detail?HexKey=${useHexKey}&IDAccount=${id}`;

            const res = await axios.get(url);
            console.log('url:', url);

            if (res.data.Status === "SUCCESS" && res.data.DataList.length > 0) {

                setEditData(res.data.DataList[0]);
                fetchStateList();   // load states
                setEditModalVisible(true);

            }

        } catch (err) {

            console.log(err);
            Alert.alert("Error", "Unable to load account details");

        } finally {

            setEditLoading(false);

        }
    };

    const saveAccount = async () => {
        if (!editData.Name || !editData.Phone || !editData.Email) {
            Alert.alert("Validation Error", "Please fill in all required fields");
            return;
        }
        try {

            const params = {

                IDAccount: editData.IDAccount,     // existing account id
                Code: editData.Code,               // readonly but must send
                Name: editData.Name,               // readonly but must send
                Phone: editData.Phone,
                Email: editData.Email,
                Address1: editData.Address1,
                Address2: editData.Address2 || "",
                State: String(editData.State),
                City: editData.City,
                Pincode: editData.Pincode,
                GSTNo: editData.GSTNo,
                PANNo: editData.PANNo,
                Remarks: editData.Remarks,
                EntryUser: useUName,
                BusinessID: useBusinessID
            };

            console.log("Save Params:", params);

            const url = `${BASE_URL}Account/Save?HexKey=${useHexKey}`;

            const res = await fetch(url, {

                method: "POST",

                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(params)

            });

            const result = await res.json();

            console.log("Save Result:", result);

            if (result.Status === "SUCCESS") {

                Alert.alert("Success", "Account updated successfully");

                setEditModalVisible(false);

                // refresh list
                fetchAccountList(useHexKey, useUName, userType);

            } else {

                Alert.alert(result.Message || "Update failed");

            }

        } catch (error) {

            console.log("Save Error:", error);
            Alert.alert("Error", "Unable to save account");

        }
    };

    const fetchProductDetail = async (id) => {
        try {

            setProductEditLoading(true);

            const url = `${BASE_URL}Product/Detail?HexKey=${useHexKey}&IDProduct=${id}`;
            console.log("Product Detail URL:", url);
            const res = await axios.get(url);

            if (res.data.Status === "SUCCESS" && res.data.DataList?.length > 0) {
                setProductEditData(res.data.DataList[0]);
                fetchProductGroupList();
                fetchProductCategoryList();
                setProductEditModalVisible(true);
            } else {
                Alert.alert("Error", "Product details not found");
            }

        } catch (err) {
            console.log("Product detail error:", err);
            Alert.alert("Error", "Unable to load product details");
        } finally {
            setProductEditLoading(false);
        }
    };

    const fetchProductGroupList = async () => {

        try {

            const url = `${BASE_URL}ProductGroup/List?HexKey=${useHexKey}&BusinessID=${useBusinessID}`;

            const res = await axios.get(url);

            if (res.data.Status === "SUCCESS") {

                const formatted = res.data.DataList.map(item => ({
                    label: item.Name,
                    value: item.IDGroup
                }));

                setGroupList(formatted);
            }

        } catch (error) {

            console.log("Group API Error:", error);

        }
    };

    const fetchProductCategoryList = async () => {

        try {

            const url = `${BASE_URL}ProductCategory/List?HexKey=${useHexKey}&BusinessID=${useBusinessID}`;

            const res = await axios.get(url);

            if (res.data.Status === "SUCCESS") {

                const formatted = res.data.DataList.map(item => ({
                    label: item.Name,
                    value: item.IDCategory
                }));

                setCategoryList(formatted);
            }

        } catch (error) {

            console.log("Category API Error:", error);

        }
    };

    const saveProduct = async () => {
        if (!productEditData.Name || !productEditData.Code) {
            Alert.alert("Validation Error", "Please fill in all required fields");
            return;
        };
        try {

            const params = {
                IDProduct: productEditData.IDProduct,
                Code: productEditData.Code,
                Name: productEditData.Name,
                IDGroup: Number(productEditData.IDGroup) || 0,
                IDCategory: Number(productEditData.IDCategory) || 0,
                HSNCode: productEditData.HSNCode || "",
                Maker: productEditData.Maker || "",
                BinNo: productEditData.BinNo || "",
                PartNo: productEditData.PartNo || "",
                PartCode: productEditData.PartCode || "",
                Reorder: Number(productEditData.Reorder) || 0,
                MinStock: Number(productEditData.MinStock) || 0,
                MaxStock: Number(productEditData.MaxStock) || 0,
                PurchaseRate: Number(productEditData.PurchaseRate) || 0,
                SaleRate: Number(productEditData.SaleRate) || 0,
                MaintainInventory: productEditData.MaintainInventory,
                Description: productEditData.Description || "",
                EntryUser: useUName,
                BusinessID: useBusinessID
            };

            console.log("Product Save Params:", params);

            const url = `${BASE_URL}Product/Save?HexKey=${useHexKey}`;

            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(params),
            });

            const result = await res.json();

            console.log("Product Save Result:", result);

            if (result.Status === "SUCCESS") {
                Alert.alert("Success", "Product updated successfully");
                setProductEditModalVisible(false);
                fetchProductList(useHexKey, useBusinessID);
            } else {
                Alert.alert("Error", result.Message || "Failed to save product");
            }

        } catch (error) {
            console.log("Product Save Error:", error);
            Alert.alert("Error", "Unable to save product");
        }
    };

    const fetchReferrerDetail = async (id) => {

        try {
            setReferrerEditLoading(true);
            const url = `${BASE_URL}Referrer/Detail?HexKey=${useHexKey}&IDReferer=${id}`;

            const res = await axios.get(url);

            if (res.data.Status === "SUCCESS" && res.data.DataList?.length > 0) {

                setRefEditData(res.data.DataList[0]);

                fetchStateList();
                fetchCityList();
                fetchCountryList();
                fetchActiveList();

                setRefEditModalVisible(true);
            }

        } catch (err) {

            console.log(err);
            Alert.alert("Error", "Unable to load referrer");
        } finally {
            setReferrerEditLoading(false);
        }
    };

    const fetchCityList = async () => {

        const url = `${BASE_URL}Misc/MiscList?HexKey=${useHexKey}&type=City`;

        const res = await axios.get(url);

        if (res.data?.data) {

            const formatted = res.data.data.map(x => ({
                label: x.Name,
                value: x.Code
            }));

            setCityList(formatted);
        }
    };

    const fetchCountryList = async () => {

        const url = `${BASE_URL}Misc/MiscList?HexKey=${useHexKey}&type=Country`;

        const res = await axios.get(url);

        if (res.data?.data) {

            const formatted = res.data.data.map(x => ({
                label: x.Name,
                value: x.Code
            }));

            setCountryList(formatted);
        }
    };

    const fetchActiveList = async () => {

        try {

            const url = `${BASE_URL}Misc/MiscList?HexKey=${useHexKey}&type=ACTIVE`;

            const res = await axios.get(url);

            if (res.data?.data) {

                const formatted = res.data.data.map(item => ({
                    label: item.Name,     // YES / NO
                    value: Number(item.Code) // 1 / 0
                }));

                setActiveList(formatted);
            }

        } catch (error) {

            console.log("Active API error:", error);

        }
    };

    const saveReferrer = async () => {
        // console.log("Method called: saveReferrer");
        if (!refEditData.Name || !refEditData.Phone || !refEditData.Email || !refEditData.Active || !refEditData.State || !refEditData.City || !refEditData.Country) {
            Alert.alert("Validation Error", "Please fill in all required fields");
            return;
        };

        const params = {

            IDReferer: refEditData.IDReferer,
            Code: refEditData.Code,
            Name: refEditData.Name,
            Phone: refEditData.Phone,
            Email: refEditData.Email,

            Address1: refEditData.Address1,
            Address2: refEditData.Address2,

            State: String(refEditData.State),
            City: refEditData.City,
            Pincode: refEditData.Pincode,
            Country: refEditData.Country,

            Landmark: refEditData.Landmark,
            SocialID: refEditData.SocialID,

            GSTNo: refEditData.GSTNo,
            PANNo: refEditData.PANNo,

            BankName: refEditData.BankName,
            BankACNo: refEditData.BankACNo,
            BankIDFCNo: refEditData.BankIDFCNo,

            Active: refEditData.Active,

            EntryUser: useUName,
            CompanyCode: useBusinessID
        };
        console.log("Save Referrer Params:", params);
        const url = `${BASE_URL}Referrer/Save?HexKey=${useHexKey}`;

        const res = await fetch(url, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(params)
        });

        const result = await res.json();

        if (result.Status === "SUCCESS") {
            Alert.alert("Success", "Referrer updated");
            setRefEditModalVisible(false);
            fetchReferrerList(useHexKey);
        }
    };

    const handleTabChange = (tab) => {

        setActiveTab(tab);
        setSearch('');

        if (tab === 'Account') {
            fetchAccountList(useHexKey, useUName, userType);
        }

        if (tab === 'Product') {
            fetchProductList(useHexKey, useBusinessID);
        }
        if (tab === 'Referrer') {
            fetchReferrerList(useHexKey);
        }
    };

    const handleSearch = (text) => {

        setSearch(text);

        const filtered = dataList.filter(item => {

            if (activeTab === 'Account') {
                return (
                    item.Name?.toLowerCase().includes(text.toLowerCase()) ||
                    item.Code?.toLowerCase().includes(text.toLowerCase()) ||
                    item.Phone?.includes(text) ||
                    item.Email?.toLowerCase().includes(text.toLowerCase())
                );
            }

            if (activeTab === 'Product') {
                return (
                    item.Name?.toLowerCase().includes(text.toLowerCase()) ||
                    item.Code?.toLowerCase().includes(text.toLowerCase()) ||
                    item.Description?.toLowerCase().includes(text.toLowerCase())
                );
            }

            if (activeTab === 'Referrer') {
                return (
                    item.Name?.toLowerCase().includes(text.toLowerCase()) ||
                    item.Code?.toLowerCase().includes(text.toLowerCase()) ||
                    item.Phone?.includes(text) ||
                    item.Email?.toLowerCase().includes(text.toLowerCase())
                );
            }

            return true;
        });

        setFilteredList(filtered);
    };

    const renderItem = ({ item, index }) => {

        const showCheckbox = activeTab === 'Account' || activeTab === 'Referrer';
        const isChecked = item.Active === 1 || item.Active === true;

        const toggleCheck = async (item, index) => {

            const isChecked = item.Active === 1 || item.Active === true;
            const newStatus = !isChecked;

            try {

                setStatusLoading(true);

                let url = '';

                if (activeTab === 'Account') {

                    url =
                        `${BASE_URL}Account/Deactivate?HexKey=${useHexKey}&IDAccount=${item.IDAccount}&Active=${newStatus}&UserName=${useUName}`;

                }

                if (activeTab === 'Referrer') {

                    url =
                        `${BASE_URL}Referrer/Deactivate?HexKey=${useHexKey}&IDReferer=${item.IDReferer}&Active=${newStatus}&UserName=${useUName}`;

                }

                const res = await axios.get(url);

                if (res.data.Status === "SUCCESS" || res.data.result === true) {

                    const newList = [...filteredList];

                    newList[index].Active = newStatus ? 1 : 0;

                    setFilteredList(newList);
                    setDataList(newList);

                    Alert.alert(
                        "Success",
                        newStatus ? "Activated successfully." : "Deactivated successfully."
                    );
                }

            } catch (error) {

                console.log(error);
                Alert.alert("Error", "Failed to update status.");

            } finally {

                setStatusLoading(false);

            }
        };

        return (
            <View style={styles.card}>

                <View style={{ flex: 1 }}>

                    <Text style={styles.name}>{item.Name}</Text>
                    <Text style={styles.code}>{item.Code}</Text>

                    {(activeTab === 'Account' || activeTab === 'Referrer') && (
                        <>
                            <View style={styles.row}>
                                <Ionicons name="call-outline" size={14} color="#777" />
                                <Text style={styles.info}>{item.Phone}</Text>
                            </View>

                            <View style={styles.row}>
                                <Ionicons name="mail-outline" size={14} color="#777" />
                                <Text style={styles.info}>{item.Email}</Text>
                            </View>
                        </>
                    )}

                    {activeTab === 'Product' && (
                        <View style={styles.row}>
                            <Ionicons name="cube-outline" size={14} color="#777" />
                            <Text style={styles.info}>{item.Description}</Text>
                        </View>
                    )}

                </View>

                {/* Right Side Actions */}
                <View style={styles.actionColumn}>

                    {/* Edit Icon */}
                    <TouchableOpacity
                        style={styles.iconBtn}
                        onPress={() => {
                            if (activeTab === 'Account') {
                                fetchAccountDetail(item.IDAccount);
                            } else if (activeTab === 'Product') {
                                fetchProductDetail(item.IDProduct);
                            } else if (activeTab === 'Referrer') {
                                //Alert.alert('Edit', 'Referrer edit functionality coming soon!');
                                fetchReferrerDetail(item.IDReferer);
                            }
                        }}
                    >
                        <Ionicons name="create-outline" size={20} color="#005696" />
                    </TouchableOpacity>

                    {/* Checkbox */}
                    {showCheckbox && (
                        <TouchableOpacity
                            style={[styles.checkbox, isChecked && styles.checkboxChecked]}
                            onPress={() => toggleCheck(item, index)}
                        >
                            {isChecked && (
                                <Ionicons name="checkmark" size={16} color="#fff" />
                            )}
                        </TouchableOpacity>
                    )}

                </View>

            </View>
        );
    };

    const TabButton = ({ title }) => {

        const getIcon = () => {
            if (title === 'Account') return 'business-outline';
            if (title === 'Product') return 'cube-outline';
            if (title === 'Referrer') return 'person-outline';
        };

        return (
            <TouchableOpacity
                onPress={() => handleTabChange(title)}
                activeOpacity={0.85}
                style={[
                    styles.tab,
                    activeTab === title && styles.activeTab
                ]}
            >

                <Ionicons
                    name={getIcon()}
                    size={16}
                    color={activeTab === title ? '#fff' : '#555'}
                    style={{ marginRight: 6 }}
                />

                <Text
                    style={[
                        styles.tabText,
                        activeTab === title && styles.activeTabText
                    ]}
                >
                    {title}
                </Text>

            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>

            <View style={styles.tabContainer}>
                <TabButton title="Account" />
                <TabButton title="Product" />
                <TabButton title="Referrer" />
            </View>

            {/* <KeyboardAwareLayout> */}
            <View style={styles.searchBox}>
                <Ionicons name="search-outline" size={20} color="#666" />

                <TextInput
                    placeholder={`Search ${activeTab}...`}
                    style={styles.searchInput}
                    value={search}
                    onChangeText={handleSearch}
                />

                {search !== '' &&
                    <TouchableOpacity onPress={() => handleSearch('')}>
                        <Ionicons name="close-circle" size={20} color="#999" />
                    </TouchableOpacity>
                }

            </View>


            {loading ? (
                // <ActivityIndicator size="large" color="#005696" />
                <View style={styles.loader}>
                    <LottieView
                        source={require('../assets/inside_page_loader.json')}
                        autoPlay
                        loop
                        style={{ width: 150, height: 150 }}
                    />
                    <Text style={styles.loaderText1}>Loading Data...</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredList}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={{ padding: 15 }}
                />
            )}

            {statusLoading && (
                <View style={styles.loaderOverlay}>
                    <ActivityIndicator size="large" color="#005696" />
                </View>
            )}

            {isOffline && (
                <View style={styles.offlineBanner}>
                    <Ionicons name="cloud-offline-outline" size={16} color="#fff" />
                    <Text style={styles.offlineText}>
                        You are offline. Unable to fetch data.
                    </Text>
                </View>
            )}
            {/* </KeyboardAwareLayout> */}

            {editLoading && (
                <View style={styles.loaderOverlay}>
                    <ActivityIndicator size="large" color="#005696" />
                </View>)}

            {productEditLoading && (
                <View style={styles.loaderOverlay}>
                    <ActivityIndicator size="large" color="#005696" />
                </View>)}
                
            {ReferrerEditLoading && (
                <View style={styles.loaderOverlay}>
                    <ActivityIndicator size="large" color="#005696" />
                </View>
            )}

            {/* for Account Edit Modal */}
            <Modal
                visible={editModalVisible}
                animationType="slide"
                transparent={true}
            >
                <KeyboardAwareLayout>
                    <View style={styles.modalOverlay}>

                        <View style={styles.modalContainer}>

                            <Text style={styles.modalTitle}>Edit Account</Text>


                            {editData && (

                                <>

                                    <Text style={{ fontSize: 16, color: "#555", marginBottom: 10 }}>
                                        Code : {editData.Code}
                                    </Text>

                                    <Text style={{ fontSize: 14, color: "#555", marginBottom: 5 }}>
                                        Name *
                                    </Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Name"
                                        value={editData.Name}
                                        onChangeText={(text) => setEditData({ ...editData, Name: text })}
                                    />

                                    <Text style={{ fontSize: 14, color: "#555", marginBottom: 5 }}>
                                        Phone *
                                    </Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Phone"
                                        value={editData.Phone}
                                        onChangeText={(text) => setEditData({ ...editData, Phone: text })}
                                    />
                                    <Text style={{ fontSize: 14, color: "#555", marginBottom: 5 }}>
                                        Email *
                                    </Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Email"
                                        value={editData.Email}
                                        onChangeText={(text) => setEditData({ ...editData, Email: text })}
                                    />

                                    <Text style={{ fontSize: 14, color: "#555", marginBottom: 5 }}>
                                        Address 1
                                    </Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Address 1"
                                        value={editData.Address1}
                                        onChangeText={(text) => setEditData({ ...editData, Address1: text })}
                                    />

                                    <Text style={{ fontSize: 14, color: "#555", marginBottom: 5 }}>
                                        Address 2
                                    </Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Address 2"
                                        value={editData.Address2}
                                        onChangeText={(text) => setEditData({ ...editData, Address2: text })}
                                    />

                                    {/* STATE DROPDOWN */}
                                    <Text style={{ fontSize: 14, color: "#555", marginBottom: 5 }}>
                                        State
                                    </Text>
                                    <Dropdown
                                        style={styles.dropdown}
                                        data={stateList}
                                        labelField="label"
                                        valueField="label"
                                        placeholder="Select State"
                                        value={editData.State}
                                        onChange={item => {
                                            setEditData({ ...editData, State: item.label })
                                        }}
                                    />

                                    {/* <TextInput
                                        style={styles.input}
                                        placeholder="City"
                                        value={editData.City}
                                        onChangeText={(text) => setEditData({ ...editData, City: text })}
                                    /> */}
                                    <Text style={{ fontSize: 14, color: "#555", marginBottom: 5 }}>
                                        Pincode
                                    </Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Pincode"
                                        value={editData.Pincode}
                                        onChangeText={(text) => setEditData({ ...editData, Pincode: text })}
                                    />

                                    <Text style={{ fontSize: 14, color: "#555", marginBottom: 5 }}>
                                        Gst No.
                                    </Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="GST No"
                                        value={editData.GSTNo}
                                        onChangeText={(text) => setEditData({ ...editData, GSTNo: text })}
                                    />

                                    <Text style={{ fontSize: 14, color: "#555", marginBottom: 5 }}>
                                        PAN No.
                                    </Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="PAN No"
                                        value={editData.PANNo}
                                        onChangeText={(text) => setEditData({ ...editData, PANNo: text })}
                                    />

                                    <Text style={{ fontSize: 14, color: "#555", marginBottom: 5 }}>
                                        Remarks
                                    </Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Remarks"
                                        numberOfLines={4}
                                        multiline
                                        value={editData.Remarks}
                                        onChangeText={(text) => setEditData({ ...editData, Remarks: text })}
                                    />

                                    <View style={styles.modalButtons}>

                                        <TouchableOpacity
                                            style={styles.cancelBtn}
                                            onPress={() => setEditModalVisible(false)}
                                        >
                                            <Text style={{ color: "#fff" }}>Cancel</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={styles.saveBtn}
                                            onPress={saveAccount}
                                        >
                                            <Text style={{ color: "#fff" }}>Save</Text>
                                        </TouchableOpacity>

                                    </View>

                                </>
                            )}

                        </View>

                    </View>
                </KeyboardAwareLayout>
            </Modal>

            {/* for Product Edit Modal */}
            <Modal
                visible={productEditModalVisible}
                animationType="slide"
                transparent={true}
            >
                <KeyboardAwareLayout>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContainer}>

                            <Text style={styles.modalTitle}>Edit Product</Text>

                            {productEditData && (
                                <>
                                    <Text style={{ fontSize: 16, color: "#555", marginBottom: 10 }}>
                                        Code : {productEditData.Code}
                                    </Text>

                                    <Text style={{ fontSize: 14, color: "#555", marginBottom: 5 }}>
                                        Name *
                                    </Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Name"
                                        value={productEditData.Name}
                                        onChangeText={(text) =>
                                            setProductEditData({ ...productEditData, Name: text })
                                        }
                                    />

                                    <Text style={{ fontSize: 14, color: "#555", marginBottom: 5 }}>
                                        Select Group
                                    </Text>
                                    <Dropdown
                                        style={styles.dropdown}
                                        data={groupList}
                                        labelField="label"
                                        valueField="value"
                                        placeholder="Select Group"
                                        value={productEditData?.IDGroup}
                                        onChange={(item) => {
                                            setProductEditData({
                                                ...productEditData,
                                                IDGroup: item.value
                                            });
                                        }}
                                    />
                                    <Text style={{ fontSize: 14, color: "#555", marginBottom: 5 }}>
                                        Select Category
                                    </Text>
                                    <Dropdown
                                        style={styles.dropdown}
                                        data={categoryList}
                                        labelField="label"
                                        valueField="value"
                                        placeholder="Select Category"
                                        value={productEditData?.IDCategory}
                                        onChange={(item) => {
                                            setProductEditData({
                                                ...productEditData,
                                                IDCategory: item.value
                                            });
                                        }}
                                    />
                                    <Text style={{ fontSize: 14, color: "#555", marginBottom: 5 }}>
                                        HSN Code
                                    </Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="HSN Code"
                                        value={productEditData.HSNCode}
                                        onChangeText={(text) =>
                                            setProductEditData({ ...productEditData, HSNCode: text })
                                        }
                                    />

                                    <Text style={{ fontSize: 14, color: "#555", marginBottom: 5 }}>
                                        Maker
                                    </Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Maker"
                                        value={productEditData.Maker}
                                        onChangeText={(text) =>
                                            setProductEditData({ ...productEditData, Maker: text })
                                        }
                                    />

                                    <Text style={{ fontSize: 14, color: "#555", marginBottom: 5 }}>
                                        Bin No
                                    </Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Bin No"
                                        value={productEditData.BinNo}
                                        onChangeText={(text) =>
                                            setProductEditData({ ...productEditData, BinNo: text })
                                        }
                                    />
                                    <Text style={{ fontSize: 14, color: "#555", marginBottom: 5 }}>
                                        Part No
                                    </Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Part No"
                                        value={productEditData.PartNo}
                                        onChangeText={(text) =>
                                            setProductEditData({ ...productEditData, PartNo: text })
                                        }
                                    />
                                    <Text style={{ fontSize: 14, color: "#555", marginBottom: 5 }}>
                                        Part Code
                                    </Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Part Code"
                                        value={productEditData.PartCode}
                                        onChangeText={(text) =>
                                            setProductEditData({ ...productEditData, PartCode: text })
                                        }
                                    />
                                    <Text style={{ fontSize: 14, color: "#555", marginBottom: 5 }}>
                                        Reorder Level
                                    </Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Reorder"
                                        keyboardType="numeric"
                                        value={String(productEditData.Reorder ?? "")}
                                        onChangeText={(text) =>
                                            setProductEditData({ ...productEditData, Reorder: text })
                                        }
                                    />
                                    <Text style={{ fontSize: 14, color: "#555", marginBottom: 5 }}>
                                        Min Stock
                                    </Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Min Stock"
                                        keyboardType="numeric"
                                        value={String(productEditData.MinStock ?? "")}
                                        onChangeText={(text) =>
                                            setProductEditData({ ...productEditData, MinStock: text })
                                        }
                                    />
                                    <Text style={{ fontSize: 14, color: "#555", marginBottom: 5 }}>
                                        Max Stock
                                    </Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Max Stock"
                                        keyboardType="numeric"
                                        value={String(productEditData.MaxStock ?? "")}
                                        onChangeText={(text) =>
                                            setProductEditData({ ...productEditData, MaxStock: text })
                                        }
                                    />
                                    <Text style={{ fontSize: 14, color: "#555", marginBottom: 5 }}>
                                        Purchase Rate
                                    </Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Purchase Rate"
                                        keyboardType="numeric"
                                        value={String(productEditData.PurchaseRate ?? "")}
                                        onChangeText={(text) =>
                                            setProductEditData({ ...productEditData, PurchaseRate: text })
                                        }
                                    />

                                    <Text style={{ fontSize: 14, color: "#555", marginBottom: 5 }}>
                                        Sale Rate
                                    </Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Sale Rate"
                                        keyboardType="numeric"
                                        value={String(productEditData.SaleRate ?? "")}
                                        onChangeText={(text) =>
                                            setProductEditData({ ...productEditData, SaleRate: text })
                                        }
                                    />
                                    <Text style={{ fontSize: 14, color: "#555", marginBottom: 5 }}>
                                        Description
                                    </Text>
                                    <TextInput
                                        style={[styles.input, { height: 90, textAlignVertical: 'top' }]}
                                        placeholder="Description"
                                        multiline
                                        value={productEditData.Description}
                                        onChangeText={(text) =>
                                            setProductEditData({ ...productEditData, Description: text })
                                        }
                                    />

                                    <View style={styles.modalButtons}>
                                        <TouchableOpacity
                                            style={styles.cancelBtn}
                                            onPress={() => setProductEditModalVisible(false)}
                                        >
                                            <Text style={{ color: "#fff" }}>Cancel</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={styles.saveBtn}
                                            onPress={saveProduct}
                                        >
                                            <Text style={{ color: "#fff" }}>Save</Text>
                                        </TouchableOpacity>
                                    </View>
                                </>
                            )}
                        </View>
                    </View>
                </KeyboardAwareLayout>
            </Modal>

            {/* for Referrer Edit Modal */}
            <Modal
                visible={refEditModalVisible}
                animationType="slide"
                transparent={true}
            >
                <KeyboardAwareLayout>
                    <View style={styles.modalOverlay}>

                        <View style={styles.modalContainer}>

                            <Text style={styles.modalTitle}>Edit Referrer</Text>

                            {refEditData && (

                                <ScrollView showsVerticalScrollIndicator={false}>

                                    <Text style={{ marginBottom: 10 }}>
                                        Code : {refEditData.Code}
                                    </Text>

                                    <Text style={{ fontSize: 14, color: "#555", marginBottom: 5 }}>
                                        Name *
                                    </Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Name"
                                        value={refEditData.Name}
                                        onChangeText={(text) => setRefEditData({ ...refEditData, Name: text })}
                                    />
                                    <Text style={{ fontSize: 14, color: "#555", marginBottom: 5 }}>
                                        Phone *
                                    </Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Phone"
                                        value={refEditData.Phone}
                                        onChangeText={(text) => setRefEditData({ ...refEditData, Phone: text })}
                                    />

                                    <Text style={{ fontSize: 14, color: "#555", marginBottom: 5 }}>
                                        Email *
                                    </Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Email"
                                        value={refEditData.Email}
                                        onChangeText={(text) => setRefEditData({ ...refEditData, Email: text })}
                                    />

                                    <Text style={{ fontSize: 14, color: "#555", marginBottom: 5 }}>
                                        Address1
                                    </Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Address1"
                                        value={refEditData.Address1}
                                        onChangeText={(text) => setRefEditData({ ...refEditData, Address1: text })}
                                    />

                                    <Text style={{ fontSize: 14, color: "#555", marginBottom: 5 }}>
                                        Address2
                                    </Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Address2"
                                        value={refEditData.Address2}
                                        onChangeText={(text) => setRefEditData({ ...refEditData, Address2: text })}
                                    />

                                    {/* STATE */}
                                    <Text style={{ fontSize: 16, color: "#555", marginBottom: 6 }}>
                                        State *
                                    </Text>
                                    <Dropdown
                                        style={styles.dropdown}
                                        data={stateList}
                                        labelField="label"
                                        valueField="label"
                                        placeholder="Select State"
                                        value={refEditData.State}
                                        onChange={(item) => {
                                            setRefEditData({ ...refEditData, State: item.label })
                                        }}
                                    />

                                    {/* CITY */}
                                    <Text style={{ fontSize: 16, color: "#555", marginBottom: 6 }}>
                                        City *
                                    </Text>
                                    <Dropdown
                                        style={styles.dropdown}
                                        data={cityList}
                                        labelField="label"
                                        valueField="value"
                                        placeholder="Select City"
                                        value={refEditData.City}
                                        onChange={(item) => {
                                            setRefEditData({ ...refEditData, City: item.value })
                                        }}
                                    />
                                    <Text style={{ fontSize: 14, color: "#555", marginBottom: 5 }}>
                                        Pincode
                                    </Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Pincode"
                                        value={refEditData.Pincode}
                                        onChangeText={(text) => setRefEditData({ ...refEditData, Pincode: text })}
                                    />

                                    {/* COUNTRY */}
                                    <Text style={{ fontSize: 16, color: "#555", marginBottom: 6 }}>
                                        Country *
                                    </Text>
                                    <Dropdown
                                        style={styles.dropdown}
                                        data={countryList}
                                        labelField="label"
                                        valueField="value"
                                        placeholder="Select Country"
                                        value={refEditData.Country}
                                        onChange={(item) => {
                                            setRefEditData({ ...refEditData, Country: item.value })
                                        }}
                                    />

                                    <Text style={{ fontSize: 16, color: "#555", marginBottom: 6 }}>
                                        Landmark
                                    </Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Landmark"
                                        value={refEditData.Landmark}
                                        onChangeText={(text) => setRefEditData({ ...refEditData, Landmark: text })}
                                    />

                                    <Text style={{ fontSize: 16, color: "#555", marginBottom: 6 }}>
                                        Social ID
                                    </Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Social ID"
                                        value={refEditData.SocialID}
                                        onChangeText={(text) => setRefEditData({ ...refEditData, SocialID: text })}
                                    />

                                    <Text style={{ fontSize: 16, color: "#555", marginBottom: 6 }}>
                                        GST No
                                    </Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="GST No"
                                        value={refEditData.GSTNo}
                                        onChangeText={(text) => setRefEditData({ ...refEditData, GSTNo: text })}
                                    />

                                    <Text style={{ fontSize: 16, color: "#555", marginBottom: 6 }}>
                                        PAN No
                                    </Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="PAN No"
                                        value={refEditData.PANNo}
                                        onChangeText={(text) => setRefEditData({ ...refEditData, PANNo: text })}
                                    />

                                    <Text style={{ fontSize: 16, color: "#555", marginBottom: 6 }}>
                                        Bank Name
                                    </Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Bank Name"
                                        value={refEditData.BankName}
                                        onChangeText={(text) => setRefEditData({ ...refEditData, BankName: text })}
                                    />

                                    <Text style={{ fontSize: 16, color: "#555", marginBottom: 6 }}>
                                        Bank Account
                                    </Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Bank Account"
                                        value={refEditData.BankACNo}
                                        onChangeText={(text) => setRefEditData({ ...refEditData, BankACNo: text })}
                                    />

                                    <Text style={{ fontSize: 16, color: "#555", marginBottom: 6 }}>
                                        IFSC
                                    </Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="IFSC"
                                        value={refEditData.BankIDFCNo}
                                        onChangeText={(text) => setRefEditData({ ...refEditData, BankIDFCNo: text })}
                                    />

                                    {/* ACTIVE */}
                                    <Text style={{ fontSize: 16, color: "#555", marginBottom: 6 }}>
                                        Active Status *
                                    </Text>
                                    <Dropdown
                                        style={styles.dropdown}
                                        data={activeList}
                                        labelField="label"
                                        valueField="value"
                                        placeholder="Active Status"
                                        value={refEditData?.Active}
                                        onChange={(item) => {
                                            setRefEditData({
                                                ...refEditData,
                                                Active: item.value
                                            });
                                        }}
                                    />

                                    <View style={styles.modalButtons}>

                                        <TouchableOpacity
                                            style={styles.cancelBtn}
                                            onPress={() => setRefEditModalVisible(false)}
                                        >
                                            <Text style={{ color: "#fff" }}>Cancel</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={styles.saveBtn}
                                            onPress={saveReferrer}
                                        >
                                            <Text style={{ color: "#fff" }}>Save</Text>
                                        </TouchableOpacity>

                                    </View>

                                </ScrollView>

                            )}

                        </View>

                    </View>
                </KeyboardAwareLayout>
            </Modal>

        </SafeAreaView>
    );
};

export default ViewMaster;

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: '#F4F6F9'
    },

    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#f1f5f9',
        padding: 6,
        borderRadius: 12,
        marginHorizontal: 12,
        marginTop: 10,
        elevation: 2
    },

    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        borderRadius: 10
    },

    activeTab: {
        backgroundColor: '#005696',
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 4
    },

    tabText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#444'
    },

    activeTabText: {
        color: '#fff'
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        margin: 12,
        paddingHorizontal: 12,
        borderRadius: 10,
        elevation: 2
    },

    searchInput: {
        flex: 1,
        paddingHorizontal: 10,
        height: 40
    },

    card: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 12,
        elevation: 2
    },

    name: {
        fontSize: 16,
        fontWeight: '700',
        color: '#222'
    },

    code: {
        fontSize: 12,
        color: '#888',
        marginBottom: 6
    },

    row: {
        flexDirection: 'row',
        alignItems: 'center'
    },

    info: {
        fontSize: 13,
        color: '#555',
        marginLeft: 6
    },
    status: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 5,
        alignSelf: 'flex-start',
    },

    statusText: {
        fontSize: 10,
        color: '#fff',
        fontWeight: '600',
    },
    actionColumn: {
        justifyContent: 'space-between',
        alignItems: 'center',
        marginLeft: 10
    },

    iconBtn: {
        padding: 6,
        borderRadius: 8,
        backgroundColor: '#eef4ff',
        borderWidth: 1,
        borderColor: '#005696',
        alignItems: 'center',
        justifyContent: 'center'
    },

    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 1.5,
        borderColor: '#ccc',
        alignItems: 'center',
        justifyContent: 'center'
    },

    checkboxChecked: {
        backgroundColor: '#27ae60',
        borderColor: '#27ae60'
    },
    loaderOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999
    },
    offlineBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#e74c3c',
        padding: 8
    },

    offlineText: {
        color: '#fff',
        marginLeft: 6,
        fontSize: 12,
        fontWeight: '600'
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        // backgroundColor: '#ffffff',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        padding: 20
    },

    modalContainer: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 20
    },

    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 15
    },

    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        padding: 10,
        marginBottom: 10
    },

    modalButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 10
    },

    cancelBtn: {
        backgroundColor: "#999",
        padding: 10,
        borderRadius: 6
    },
    dropdown: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        paddingHorizontal: 10,
        height: 45,
        marginBottom: 10
    },
    saveBtn: {
        backgroundColor: "#005696",
        padding: 10,
        borderRadius: 6
    }
});