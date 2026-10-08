import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    TextInput,
    Alert,
    Modal,
    ScrollView,
    ImageBackground,
    Animated,
    StatusBar,
    Platform,
    KeyboardAvoidingView
} from 'react-native';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import NetInfo from "@react-native-community/netinfo";
import { BASE_URL } from '@env';
import LottieView from 'lottie-react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BACKGROUND_IMAGE = require('../images/bg.png');

const ViewMaster = () => {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();

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
    
    const [selectedMap, setSelectedMap] = useState({});

    const getRowKey = (item, index) => {
        if (activeTab === 'Account' && item?.IDAccount) return `A-${item.IDAccount}`;
        if (activeTab === 'Product' && item?.IDProduct) return `P-${item.IDProduct}`;
        if (activeTab === 'Referrer' && item?.IDReferer) return `R-${item.IDReferer}`;
        return `${activeTab}-${index}`;
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

    const toggleSelect = (item) => {
        const key = getRowKey(item, 0);
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
            const url = `${BASE_URL}Account/List?HexKey=${hex}&UserName=${user}&UserType=${type}`;
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
            const url = `${BASE_URL}Product/List?HexKey=${hex}&BusinessID=${businessId}`;
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
            const url = `${BASE_URL}referrer/list?HexKey=${hex}`;
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
            const url = `${BASE_URL}Account/Detail?HexKey=${useHexKey}&IDAccount=${id}`;
            const res = await axios.get(url);

            if (res.data.Status === "SUCCESS" && res.data.DataList.length > 0) {
                setEditData(res.data.DataList[0]);
                fetchStateList();
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
                IDAccount: editData.IDAccount,
                Code: editData.Code,
                Name: editData.Name,
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

            if (result.Status === "SUCCESS") {
                Alert.alert("Success", "Account updated successfully");
                setEditModalVisible(false);
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
        }
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
                    label: item.Name,
                    value: Number(item.Code)
                }));
                setActiveList(formatted);
            }
        } catch (error) {
            console.log("Active API error:", error);
        }
    };

    const saveReferrer = async () => {
        if (!refEditData.Name || !refEditData.Phone || !refEditData.Email || !refEditData.Active || !refEditData.State || !refEditData.City || !refEditData.Country) {
            Alert.alert("Validation Error", "Please fill in all required fields");
            return;
        }

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

        const scaleAnim = new Animated.Value(1);

        const handlePressIn = () => {
            Animated.spring(scaleAnim, {
                toValue: 0.96,
                useNativeDriver: true,
            }).start();
        };

        const handlePressOut = () => {
            Animated.spring(scaleAnim, {
                toValue: 1,
                useNativeDriver: true,
            }).start();
        };

        const toggleCheck = async (item, index) => {
            const isChecked = item.Active === 1 || item.Active === true;
            const newStatus = !isChecked;

            try {
                setStatusLoading(true);
                let url = '';

                if (activeTab === 'Account') {
                    url = `${BASE_URL}Account/Deactivate?HexKey=${useHexKey}&IDAccount=${item.IDAccount}&Active=${newStatus}&UserName=${useUName}`;
                }

                if (activeTab === 'Referrer') {
                    url = `${BASE_URL}Referrer/Deactivate?HexKey=${useHexKey}&IDReferer=${item.IDReferer}&Active=${newStatus}&UserName=${useUName}`;
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
            <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
                <View style={{ flex: 1 }}>
                    <View style={styles.cardHeaderRow}>
                        <Text style={styles.name} numberOfLines={1}>{item.Name}</Text>
                        <View style={styles.codeBadge}>
                            <Text style={styles.codeText}>{item.Code}</Text>
                        </View>
                    </View>

                    {(activeTab === 'Account' || activeTab === 'Referrer') && (
                        <View style={styles.infoGroup}>
                            <View style={styles.row}>
                                <View style={styles.infoIconBg}>
                                    <Ionicons name="call" size={12} color="#3B82F6" />
                                </View>
                                <Text style={styles.info}>{item.Phone || 'N/A'}</Text>
                            </View>

                            <View style={styles.row}>
                                <View style={styles.infoIconBg}>
                                    <Ionicons name="mail" size={12} color="#3B82F6" />
                                </View>
                                <Text style={styles.info} numberOfLines={1}>{item.Email || 'N/A'}</Text>
                            </View>
                        </View>
                    )}

                    {activeTab === 'Product' && (
                        <View style={styles.infoGroup}>
                            <View style={styles.row}>
                                <View style={styles.infoIconBg}>
                                    <Ionicons name="cube" size={12} color="#6366F1" />
                                </View>
                                <Text style={styles.info} numberOfLines={2}>{item.Description || 'No Description'}</Text>
                            </View>
                        </View>
                    )}
                </View>

                {/* Right Side Actions */}
                <View style={styles.actionColumn}>
                    <TouchableOpacity
                        style={styles.iconBtn}
                        activeOpacity={0.7}
                        onPressIn={handlePressIn}
                        onPressOut={handlePressOut}
                        onPress={() => {
                            if (activeTab === 'Account') {
                                fetchAccountDetail(item.IDAccount);
                            } else if (activeTab === 'Product') {
                                fetchProductDetail(item.IDProduct);
                            } else if (activeTab === 'Referrer') {
                                fetchReferrerDetail(item.IDReferer);
                            }
                        }}
                    >
                        <Ionicons name="create-outline" size={18} color="#4F46E5" />
                    </TouchableOpacity>

                    {showCheckbox && (
                        <TouchableOpacity
                            activeOpacity={0.8}
                            style={[
                                styles.checkbox,
                                isChecked ? styles.checkboxChecked : styles.checkboxInactive
                            ]}
                            onPress={() => toggleCheck(item, index)}
                        >
                            <Ionicons
                                name={isChecked ? "checkmark-sharp" : "close-sharp"}
                                size={14}
                                color={isChecked ? "#FFFFFF" : "#94A3B8"}
                            />
                        </TouchableOpacity>
                    )}
                </View>
            </Animated.View>
        );
    };

    const TabButton = ({ title }) => {
        const getIcon = () => {
            if (title === 'Account') return 'business-outline';
            if (title === 'Product') return 'cube-outline';
            if (title === 'Referrer') return 'person-outline';
        };

        const isActive = activeTab === title;

        return (
            <TouchableOpacity
                onPress={() => handleTabChange(title)}
                activeOpacity={0.8}
                style={[
                    styles.tab,
                    isActive && styles.activeTab
                ]}
            >
                <Ionicons
                    name={getIcon()}
                    size={16}
                    color={isActive ? '#7C3AED' : '#64748B'}
                    style={{ marginRight: 6 }}
                />

                <Text
                    style={[
                        styles.tabText,
                        isActive && styles.activeTabText
                    ]}
                >
                    {title}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <ImageBackground
            source={BACKGROUND_IMAGE}
            style={styles.backgroundImage}
            resizeMode="cover"
        >
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
            <View style={[styles.container, { paddingTop: Math.max(insets.top, 20) }]}>
                
                {/* Header Bar with Back Button */}
                <View style={styles.headerBar}>
                    <TouchableOpacity
                        style={styles.backCircleBtn}
                        onPress={() => navigation.navigate('AppNavDash')}
                        activeOpacity={0.7}
                        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    >
                        <Ionicons name="chevron-back" size={20} color="#1E293B" />
                    </TouchableOpacity>
                    <Text style={styles.headerBarTitle}>View Master</Text>
                    <View style={{ width: 36 }} />
                </View>

                {/* Glassmorphic Tab Navigation Bar */}
                <View style={styles.tabContainer}>
                    <TabButton title="Account" />
                    <TabButton title="Product" />
                    <TabButton title="Referrer" />
                </View>

                {/* Search Bar */}
                <View style={styles.searchBox}>
                    <Ionicons name="search" size={18} color="#6366F1" style={{ marginRight: 8 }} />
                    <TextInput
                        placeholder={`Search ${activeTab}...`}
                        placeholderTextColor="#94A3B8"
                        style={styles.searchInput}
                        value={search}
                        onChangeText={handleSearch}
                    />
                    {search !== '' && (
                        <TouchableOpacity onPress={() => handleSearch('')} activeOpacity={0.7}>
                            <Ionicons name="close-circle" size={18} color="#94A3B8" />
                        </TouchableOpacity>
                    )}
                </View>

                {loading ? (
                    <View style={styles.loader}>
                        <LottieView
                            source={require('../assets/inside_page_loader.json')}
                            autoPlay
                            loop
                            style={{ width: 140, height: 140 }}
                        />
                        <Text style={styles.loaderText1}>Loading Master Data...</Text>
                    </View>
                ) : (
                    <FlatList
                        data={filteredList}
                        keyExtractor={(item, index) => getRowKey(item, index)}
                        renderItem={renderItem}
                        contentContainerStyle={{
                            paddingHorizontal: 16,
                            paddingBottom: Math.max(insets.bottom, 24) + 20
                        }}
                        showsVerticalScrollIndicator={false}
                    />
                )}

                {statusLoading && (
                    <View style={styles.loaderOverlay}>
                        <ActivityIndicator size="large" color="#6366F1" />
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

                {editLoading && (
                    <View style={styles.loaderOverlay}>
                        <ActivityIndicator size="large" color="#6366F1" />
                    </View>
                )}

                {productEditLoading && (
                    <View style={styles.loaderOverlay}>
                        <ActivityIndicator size="large" color="#6366F1" />
                    </View>
                )}

                {ReferrerEditLoading && (
                    <View style={styles.loaderOverlay}>
                        <ActivityIndicator size="large" color="#6366F1" />
                    </View>
                )}

                {/* for Account Edit Modal */}
                <Modal
                    visible={editModalVisible}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => setEditModalVisible(false)}
                >
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.modalOverlay}
                    >
                        <View style={styles.modalContainer}>
                            <View style={styles.modalHeaderRow}>
                                <View style={styles.modalTitleIconBox}>
                                    <Ionicons name="business-outline" size={20} color="#7C3AED" />
                                </View>
                                <Text style={styles.modalTitle}>Edit Account</Text>
                                <TouchableOpacity onPress={() => setEditModalVisible(false)} activeOpacity={0.7}>
                                    <Ionicons name="close" size={22} color="#64748B" />
                                </TouchableOpacity>
                            </View>

                            {editData && (
                                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 24) }}>
                                    <View style={styles.codePillModal}>
                                        <Text style={styles.codePillModalText}>Code: {editData.Code}</Text>
                                    </View>

                                    <Text style={styles.fieldLabel}>Name *</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Name"
                                        placeholderTextColor="#94A3B8"
                                        value={editData.Name}
                                        onChangeText={(text) => setEditData({ ...editData, Name: text })}
                                    />

                                    <Text style={styles.fieldLabel}>Phone *</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Phone"
                                        placeholderTextColor="#94A3B8"
                                        value={editData.Phone}
                                        onChangeText={(text) => setEditData({ ...editData, Phone: text })}
                                    />

                                    <Text style={styles.fieldLabel}>Email *</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Email"
                                        placeholderTextColor="#94A3B8"
                                        value={editData.Email}
                                        onChangeText={(text) => setEditData({ ...editData, Email: text })}
                                    />

                                    <Text style={styles.fieldLabel}>Address 1</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Address 1"
                                        placeholderTextColor="#94A3B8"
                                        value={editData.Address1}
                                        onChangeText={(text) => setEditData({ ...editData, Address1: text })}
                                    />

                                    <Text style={styles.fieldLabel}>Address 2</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Address 2"
                                        placeholderTextColor="#94A3B8"
                                        value={editData.Address2}
                                        onChangeText={(text) => setEditData({ ...editData, Address2: text })}
                                    />

                                    <Text style={styles.fieldLabel}>State</Text>
                                    <Dropdown
                                        style={styles.dropdown}
                                        data={stateList}
                                        labelField="label"
                                        valueField="label"
                                        placeholder="Select State"
                                        placeholderStyle={{ color: '#94A3B8', fontSize: 13 }}
                                        selectedTextStyle={{ color: '#0F172A', fontSize: 13 }}
                                        value={editData.State}
                                        onChange={item => {
                                            setEditData({ ...editData, State: item.label })
                                        }}
                                    />

                                    <Text style={styles.fieldLabel}>Pincode</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Pincode"
                                        placeholderTextColor="#94A3B8"
                                        value={editData.Pincode}
                                        onChangeText={(text) => setEditData({ ...editData, Pincode: text })}
                                    />

                                    <Text style={styles.fieldLabel}>GST No.</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="GST No"
                                        placeholderTextColor="#94A3B8"
                                        value={editData.GSTNo}
                                        onChangeText={(text) => setEditData({ ...editData, GSTNo: text })}
                                    />

                                    <Text style={styles.fieldLabel}>PAN No.</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="PAN No"
                                        placeholderTextColor="#94A3B8"
                                        value={editData.PANNo}
                                        onChangeText={(text) => setEditData({ ...editData, PANNo: text })}
                                    />

                                    <Text style={styles.fieldLabel}>Remarks</Text>
                                    <TextInput
                                        style={[styles.input, { height: 75, textAlignVertical: 'top' }]}
                                        placeholder="Remarks"
                                        placeholderTextColor="#94A3B8"
                                        numberOfLines={4}
                                        multiline
                                        value={editData.Remarks}
                                        onChangeText={(text) => setEditData({ ...editData, Remarks: text })}
                                    />

                                    <View style={styles.modalButtons}>
                                        <TouchableOpacity
                                            style={styles.cancelBtn}
                                            activeOpacity={0.7}
                                            onPress={() => setEditModalVisible(false)}
                                        >
                                            <Text style={styles.cancelBtnText}>Cancel</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={styles.saveBtn}
                                            activeOpacity={0.75}
                                            onPress={saveAccount}
                                        >
                                            <Text style={styles.saveBtnText}>Save Changes</Text>
                                        </TouchableOpacity>
                                    </View>
                                </ScrollView>
                            )}
                        </View>
                    </KeyboardAvoidingView>
                </Modal>

                {/* for Product Edit Modal */}
                <Modal
                    visible={productEditModalVisible}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => setProductEditModalVisible(false)}
                >
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.modalOverlay}
                    >
                        <View style={styles.modalContainer}>
                            <View style={styles.modalHeaderRow}>
                                <View style={[styles.modalTitleIconBox, { backgroundColor: '#FFEDD5' }]}>
                                    <Ionicons name="cube-outline" size={20} color="#F97316" />
                                </View>
                                <Text style={styles.modalTitle}>Edit Product</Text>
                                <TouchableOpacity onPress={() => setProductEditModalVisible(false)} activeOpacity={0.7}>
                                    <Ionicons name="close" size={22} color="#64748B" />
                                </TouchableOpacity>
                            </View>

                            {productEditData && (
                                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 24) }}>
                                    <View style={styles.codePillModal}>
                                        <Text style={styles.codePillModalText}>Code: {productEditData.Code}</Text>
                                    </View>

                                    <Text style={styles.fieldLabel}>Name *</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Name"
                                        placeholderTextColor="#94A3B8"
                                        value={productEditData.Name}
                                        onChangeText={(text) =>
                                            setProductEditData({ ...productEditData, Name: text })
                                        }
                                    />

                                    <Text style={styles.fieldLabel}>Select Group</Text>
                                    <Dropdown
                                        style={styles.dropdown}
                                        data={groupList}
                                        labelField="label"
                                        valueField="value"
                                        placeholder="Select Group"
                                        placeholderStyle={{ color: '#94A3B8', fontSize: 13 }}
                                        selectedTextStyle={{ color: '#0F172A', fontSize: 13 }}
                                        value={productEditData?.IDGroup}
                                        onChange={(item) => {
                                            setProductEditData({
                                                ...productEditData,
                                                IDGroup: item.value
                                            });
                                        }}
                                    />

                                    <Text style={styles.fieldLabel}>Select Category</Text>
                                    <Dropdown
                                        style={styles.dropdown}
                                        data={categoryList}
                                        labelField="label"
                                        valueField="value"
                                        placeholder="Select Category"
                                        placeholderStyle={{ color: '#94A3B8', fontSize: 13 }}
                                        selectedTextStyle={{ color: '#0F172A', fontSize: 13 }}
                                        value={productEditData?.IDCategory}
                                        onChange={(item) => {
                                            setProductEditData({
                                                ...productEditData,
                                                IDCategory: item.value
                                            });
                                        }}
                                    />

                                    <Text style={styles.fieldLabel}>HSN Code</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="HSN Code"
                                        placeholderTextColor="#94A3B8"
                                        value={productEditData.HSNCode}
                                        onChangeText={(text) =>
                                            setProductEditData({ ...productEditData, HSNCode: text })
                                        }
                                    />

                                    <Text style={styles.fieldLabel}>Maker</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Maker"
                                        placeholderTextColor="#94A3B8"
                                        value={productEditData.Maker}
                                        onChangeText={(text) =>
                                            setProductEditData({ ...productEditData, Maker: text })
                                        }
                                    />

                                    <Text style={styles.fieldLabel}>Bin No</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Bin No"
                                        placeholderTextColor="#94A3B8"
                                        value={productEditData.BinNo}
                                        onChangeText={(text) =>
                                            setProductEditData({ ...productEditData, BinNo: text })
                                        }
                                    />

                                    <Text style={styles.fieldLabel}>Part No</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Part No"
                                        placeholderTextColor="#94A3B8"
                                        value={productEditData.PartNo}
                                        onChangeText={(text) =>
                                            setProductEditData({ ...productEditData, PartNo: text })
                                        }
                                    />

                                    <Text style={styles.fieldLabel}>Part Code</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Part Code"
                                        placeholderTextColor="#94A3B8"
                                        value={productEditData.PartCode}
                                        onChangeText={(text) =>
                                            setProductEditData({ ...productEditData, PartCode: text })
                                        }
                                    />

                                    <Text style={styles.fieldLabel}>Reorder Level</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Reorder"
                                        placeholderTextColor="#94A3B8"
                                        keyboardType="numeric"
                                        value={String(productEditData.Reorder ?? "")}
                                        onChangeText={(text) =>
                                            setProductEditData({ ...productEditData, Reorder: text })
                                        }
                                    />

                                    <Text style={styles.fieldLabel}>Min Stock</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Min Stock"
                                        placeholderTextColor="#94A3B8"
                                        keyboardType="numeric"
                                        value={String(productEditData.MinStock ?? "")}
                                        onChangeText={(text) =>
                                            setProductEditData({ ...productEditData, MinStock: text })
                                        }
                                    />

                                    <Text style={styles.fieldLabel}>Max Stock</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Max Stock"
                                        placeholderTextColor="#94A3B8"
                                        keyboardType="numeric"
                                        value={String(productEditData.MaxStock ?? "")}
                                        onChangeText={(text) =>
                                            setProductEditData({ ...productEditData, MaxStock: text })
                                        }
                                    />

                                    <Text style={styles.fieldLabel}>Purchase Rate</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Purchase Rate"
                                        placeholderTextColor="#94A3B8"
                                        keyboardType="numeric"
                                        value={String(productEditData.PurchaseRate ?? "")}
                                        onChangeText={(text) =>
                                            setProductEditData({ ...productEditData, PurchaseRate: text })
                                        }
                                    />

                                    <Text style={styles.fieldLabel}>Sale Rate</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Sale Rate"
                                        placeholderTextColor="#94A3B8"
                                        keyboardType="numeric"
                                        value={String(productEditData.SaleRate ?? "")}
                                        onChangeText={(text) =>
                                            setProductEditData({ ...productEditData, SaleRate: text })
                                        }
                                    />

                                    <Text style={styles.fieldLabel}>Description</Text>
                                    <TextInput
                                        style={[styles.input, { height: 75, textAlignVertical: 'top' }]}
                                        placeholder="Description"
                                        placeholderTextColor="#94A3B8"
                                        multiline
                                        value={productEditData.Description}
                                        onChangeText={(text) =>
                                            setProductEditData({ ...productEditData, Description: text })
                                        }
                                    />

                                    <View style={styles.modalButtons}>
                                        <TouchableOpacity
                                            style={styles.cancelBtn}
                                            activeOpacity={0.7}
                                            onPress={() => setProductEditModalVisible(false)}
                                        >
                                            <Text style={styles.cancelBtnText}>Cancel</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={styles.saveBtn}
                                            activeOpacity={0.75}
                                            onPress={saveProduct}
                                        >
                                            <Text style={styles.saveBtnText}>Save Changes</Text>
                                        </TouchableOpacity>
                                    </View>
                                </ScrollView>
                            )}
                        </View>
                    </KeyboardAvoidingView>
                </Modal>

                {/* for Referrer Edit Modal */}
                <Modal
                    visible={refEditModalVisible}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => setRefEditModalVisible(false)}
                >
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.modalOverlay}
                    >
                        <View style={styles.modalContainer}>
                            <View style={styles.modalHeaderRow}>
                                <View style={[styles.modalTitleIconBox, { backgroundColor: '#DCFCE7' }]}>
                                    <Ionicons name="person-add-outline" size={20} color="#16A34A" />
                                </View>
                                <Text style={styles.modalTitle}>Edit Referrer</Text>
                                <TouchableOpacity onPress={() => setRefEditModalVisible(false)} activeOpacity={0.7}>
                                    <Ionicons name="close" size={22} color="#64748B" />
                                </TouchableOpacity>
                            </View>

                            {refEditData && (
                                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 24) }}>
                                    <View style={styles.codePillModal}>
                                        <Text style={styles.codePillModalText}>Code: {refEditData.Code}</Text>
                                    </View>

                                    <Text style={styles.fieldLabel}>Name *</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Name"
                                        placeholderTextColor="#94A3B8"
                                        value={refEditData.Name}
                                        onChangeText={(text) => setRefEditData({ ...refEditData, Name: text })}
                                    />

                                    <Text style={styles.fieldLabel}>Phone *</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Phone"
                                        placeholderTextColor="#94A3B8"
                                        value={refEditData.Phone}
                                        onChangeText={(text) => setRefEditData({ ...refEditData, Phone: text })}
                                    />

                                    <Text style={styles.fieldLabel}>Email *</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Email"
                                        placeholderTextColor="#94A3B8"
                                        value={refEditData.Email}
                                        onChangeText={(text) => setRefEditData({ ...refEditData, Email: text })}
                                    />

                                    <Text style={styles.fieldLabel}>Address 1</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Address 1"
                                        placeholderTextColor="#94A3B8"
                                        value={refEditData.Address1}
                                        onChangeText={(text) => setRefEditData({ ...refEditData, Address1: text })}
                                    />

                                    <Text style={styles.fieldLabel}>Address 2</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Address 2"
                                        placeholderTextColor="#94A3B8"
                                        value={refEditData.Address2}
                                        onChangeText={(text) => setRefEditData({ ...refEditData, Address2: text })}
                                    />

                                    <Text style={styles.fieldLabel}>State *</Text>
                                    <Dropdown
                                        style={styles.dropdown}
                                        data={stateList}
                                        labelField="label"
                                        valueField="label"
                                        placeholder="Select State"
                                        placeholderStyle={{ color: '#94A3B8', fontSize: 13 }}
                                        selectedTextStyle={{ color: '#0F172A', fontSize: 13 }}
                                        value={refEditData.State}
                                        onChange={(item) => {
                                            setRefEditData({ ...refEditData, State: item.label })
                                        }}
                                    />

                                    <Text style={styles.fieldLabel}>City *</Text>
                                    <Dropdown
                                        style={styles.dropdown}
                                        data={cityList}
                                        labelField="label"
                                        valueField="value"
                                        placeholder="Select City"
                                        placeholderStyle={{ color: '#94A3B8', fontSize: 13 }}
                                        selectedTextStyle={{ color: '#0F172A', fontSize: 13 }}
                                        value={refEditData.City}
                                        onChange={(item) => {
                                            setRefEditData({ ...refEditData, City: item.value })
                                        }}
                                    />

                                    <Text style={styles.fieldLabel}>Pincode</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Pincode"
                                        placeholderTextColor="#94A3B8"
                                        value={refEditData.Pincode}
                                        onChangeText={(text) => setRefEditData({ ...refEditData, Pincode: text })}
                                    />

                                    <Text style={styles.fieldLabel}>Country *</Text>
                                    <Dropdown
                                        style={styles.dropdown}
                                        data={countryList}
                                        labelField="label"
                                        valueField="value"
                                        placeholder="Select Country"
                                        placeholderStyle={{ color: '#94A3B8', fontSize: 13 }}
                                        selectedTextStyle={{ color: '#0F172A', fontSize: 13 }}
                                        value={refEditData.Country}
                                        onChange={(item) => {
                                            setRefEditData({ ...refEditData, Country: item.value })
                                        }}
                                    />

                                    <Text style={styles.fieldLabel}>Landmark</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Landmark"
                                        placeholderTextColor="#94A3B8"
                                        value={refEditData.Landmark}
                                        onChangeText={(text) => setRefEditData({ ...refEditData, Landmark: text })}
                                    />

                                    <Text style={styles.fieldLabel}>Social ID</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Social ID"
                                        placeholderTextColor="#94A3B8"
                                        value={refEditData.SocialID}
                                        onChangeText={(text) => setRefEditData({ ...refEditData, SocialID: text })}
                                    />

                                    <Text style={styles.fieldLabel}>GST No</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="GST No"
                                        placeholderTextColor="#94A3B8"
                                        value={refEditData.GSTNo}
                                        onChangeText={(text) => setRefEditData({ ...refEditData, GSTNo: text })}
                                    />

                                    <Text style={styles.fieldLabel}>PAN No</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="PAN No"
                                        placeholderTextColor="#94A3B8"
                                        value={refEditData.PANNo}
                                        onChangeText={(text) => setRefEditData({ ...refEditData, PANNo: text })}
                                    />

                                    <Text style={styles.fieldLabel}>Bank Name</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Bank Name"
                                        placeholderTextColor="#94A3B8"
                                        value={refEditData.BankName}
                                        onChangeText={(text) => setRefEditData({ ...refEditData, BankName: text })}
                                    />

                                    <Text style={styles.fieldLabel}>Bank Account</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Bank Account"
                                        placeholderTextColor="#94A3B8"
                                        value={refEditData.BankACNo}
                                        onChangeText={(text) => setRefEditData({ ...refEditData, BankACNo: text })}
                                    />

                                    <Text style={styles.fieldLabel}>IFSC</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="IFSC"
                                        placeholderTextColor="#94A3B8"
                                        value={refEditData.BankIDFCNo}
                                        onChangeText={(text) => setRefEditData({ ...refEditData, BankIDFCNo: text })}
                                    />

                                    <Text style={styles.fieldLabel}>Active Status *</Text>
                                    <Dropdown
                                        style={styles.dropdown}
                                        data={activeList}
                                        labelField="label"
                                        valueField="value"
                                        placeholder="Active Status"
                                        placeholderStyle={{ color: '#94A3B8', fontSize: 13 }}
                                        selectedTextStyle={{ color: '#0F172A', fontSize: 13 }}
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
                                            activeOpacity={0.7}
                                            onPress={() => setRefEditModalVisible(false)}
                                        >
                                            <Text style={styles.cancelBtnText}>Cancel</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={styles.saveBtn}
                                            activeOpacity={0.75}
                                            onPress={saveReferrer}
                                        >
                                            <Text style={styles.saveBtnText}>Save Changes</Text>
                                        </TouchableOpacity>
                                    </View>
                                </ScrollView>
                            )}
                        </View>
                    </KeyboardAvoidingView>
                </Modal>
            </View>
        </ImageBackground>
    );
};

export default ViewMaster;

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
    },
    container: {
        flex: 1,
    },
    headerBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginBottom: 4,
    },
    backCircleBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.95)',
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
       // elevation: 3,
    },
    headerBarTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#0F172A',
        letterSpacing: -0.3,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255, 255, 255, 0.75)',
        padding: 5,
        borderRadius: 22,
        marginHorizontal: 16,
        marginBottom: 10,
        borderWidth: 1.5,
        borderColor: 'rgba(255, 255, 255, 0.95)',
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 14,
        //elevation: 4,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 9,
        borderRadius: 18,
    },
    activeTab: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        shadowColor: '#7C3AED',
        shadowOpacity: 0.15,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 8,
        //elevation: 3,
    },
    tabText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#64748B',
    },
    activeTabText: {
        color: '#7C3AED',
        fontWeight: '800',
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.82)',
        marginHorizontal: 16,
        marginBottom: 12,
        paddingHorizontal: 14,
        borderRadius: 18,
        borderWidth: 1.5,
        borderColor: 'rgba(255, 255, 255, 0.95)',
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        //elevation: 2,
    },
    searchInput: {
        flex: 1,
        paddingHorizontal: 6,
        height: 42,
        fontSize: 13,
        color: '#0F172A',
        fontWeight: '500',
    },
    card: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        padding: 14,
        borderRadius: 20,
        marginBottom: 10,
        borderWidth: 1.5,
        borderColor: 'rgba(255, 255, 255, 0.95)',
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        //elevation: 3,
    },
    cardHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingRight: 8,
        marginBottom: 8,
    },
    name: {
        fontSize: 15,
        fontWeight: '800',
        color: '#0F172A',
        flex: 1,
        letterSpacing: -0.2,
    },
    codeBadge: {
        backgroundColor: '#EEF2FF',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#C7D2FE',
        marginLeft: 6,
    },
    codeText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#4F46E5',
    },
    infoGroup: {
        marginTop: 2,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    infoIconBg: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: '#EFF6FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    info: {
        fontSize: 12,
        color: '#475569',
        fontWeight: '500',
        flex: 1,
    },
    actionColumn: {
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingLeft: 8,
    },
    iconBtn: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: '#EEF2FF',
        borderWidth: 1,
        borderColor: '#C7D2FE',
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkbox: {
        width: 26,
        height: 26,
        borderRadius: 13,
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxChecked: {
        backgroundColor: '#10B981',
        borderColor: '#059669',
    },
    checkboxInactive: {
        backgroundColor: '#F1F5F9',
        borderColor: '#CBD5E1',
    },
    loaderOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.35)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999,
    },
    offlineBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#EF4444',
        padding: 8,
    },
    offlineText: {
        color: '#fff',
        marginLeft: 6,
        fontSize: 12,
        fontWeight: '600',
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loaderText1: {
        fontSize: 13,
        color: '#64748B',
        fontWeight: '600',
        marginTop: 6,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(15, 23, 42, 0.45)",
        justifyContent: "flex-end",
    },
    modalContainer: {
        backgroundColor: "rgba(255, 255, 255, 0.98)",
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: Platform.OS === 'ios' ? 24 : 16,
        maxHeight: '85%',
        borderWidth: 1.5,
        borderColor: 'rgba(255, 255, 255, 0.95)',
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        //elevation: 10,
    },
    modalHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    modalTitleIconBox: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#EEF2FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "800",
        color: '#0F172A',
        flex: 1,
    },
    codePillModal: {
        alignSelf: 'flex-start',
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    codePillModalText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#475569',
    },
    fieldLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: '#475569',
        marginBottom: 4,
        marginTop: 4,
    },
    input: {
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 9,
        fontSize: 13,
        color: '#0F172A',
        marginBottom: 8,
        fontWeight: '500',
    },
    dropdown: {
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 44,
        marginBottom: 8,
    },
    modalButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 16,
        marginBottom: 10,
    },
    cancelBtn: {
        flex: 1,
        backgroundColor: "#F1F5F9",
        paddingVertical: 12,
        borderRadius: 14,
        alignItems: 'center',
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    cancelBtnText: {
        color: "#64748B",
        fontWeight: '700',
        fontSize: 13,
    },
    saveBtn: {
        flex: 1.5,
        backgroundColor: "#4F46E5",
        paddingVertical: 12,
        borderRadius: 14,
        alignItems: 'center',
        marginLeft: 8,
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        //elevation: 4,
    },
    saveBtnText: {
        color: "#FFFFFF",
        fontWeight: '800',
        fontSize: 13,
    },
});