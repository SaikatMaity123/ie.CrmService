import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    FlatList,
    ActivityIndicator,
    Alert,
    RefreshControl,
    TextInput,
    LayoutAnimation,
    Platform,
    UIManager,
    ImageBackground,
} from 'react-native';

import React, {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import axios from 'axios';
import { BASE_URL } from '@env';

import DatePicker from 'react-native-date-picker';
import Feather from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';

const BACKGROUND_IMAGE = require('../images/bg.png');

if (
    Platform.OS === 'android' &&
    UIManager.setLayoutAnimationEnabledExperimental
) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const PendingFollowUpDrillDown = ({ navigation }) => {
    /*
     * Start Date:
     * 1st January of current year.
     */
    const [startDate, setStartDate] = useState(() => {
        const today = new Date();
        return new Date(today.getFullYear(), 0, 1);
    });

    /*
     * End Date: Always today.
     */
    const endDate = new Date();
    const [datePickerOpen, setDatePickerOpen] = useState(false);
    const [pendingFollowUpList, setPendingFollowUpList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [isOffline, setIsOffline] = useState(false);

    /*
     * Drilldown state.
     */
    const [expandedMonths, setExpandedMonths] = useState({});
    const [expandedDates, setExpandedDates] = useState({});

    /*
     * ======================================================
     * NETWORK LISTENER
     * ======================================================
     */
    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            const offline =
                state.isConnected === false ||
                state.isInternetReachable === false;
            setIsOffline(offline);
        });

        NetInfo.fetch().then(state => {
            const offline =
                state.isConnected === false ||
                state.isInternetReachable === false;
            setIsOffline(offline);
        });

        return () => {
            unsubscribe();
        };
    }, []);

    /*
     * ======================================================
     * DISPLAY DATE
     * ======================================================
     */
    const formatDisplayDate = date => {
        if (!date) return '--';
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    /*
     * ======================================================
     * API DATE (DD-MM-YYYY)
     * ======================================================
     */
    const formatApiDate = date => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    /*
     * ======================================================
     * PARSE YYYY-MM-DD
     * ======================================================
     */
    const parseResponseDate = dateString => {
        if (!dateString) return null;
        const parts = dateString.split('-');
        if (parts.length !== 3) return null;

        const year = Number(parts[0]);
        const month = Number(parts[1]) - 1;
        const day = Number(parts[2]);

        return new Date(year, month, day);
    };

    /*
     * ======================================================
     * FORMAT RESPONSE DATE
     * ======================================================
     */
    const formatResponseDate = dateString => {
        const date = parseResponseDate(dateString);
        if (!date) return dateString || '--';

        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    /*
     * ======================================================
     * GET MONTH LABEL (e.g., AUGUST 2026)
     * ======================================================
     */
    const getMonthLabel = dateString => {
        const date = parseResponseDate(dateString);
        if (!date) return 'UNKNOWN DATE';

        return date
            .toLocaleDateString('en-GB', {
                month: 'long',
                year: 'numeric',
            })
            .toUpperCase();
    };

    /*
     * ======================================================
     * GET MONTH KEY (e.g., 2026-08)
     * ======================================================
     */
    const getMonthKey = dateString => {
        if (!dateString) return 'unknown';
        const parts = dateString.split('-');
        if (parts.length !== 3) return 'unknown';
        return `${parts[0]}-${parts[1]}`;
    };

    /*
     * ======================================================
     * START DATE CONFIRM
     * ======================================================
     */
    const handleStartDateConfirm = date => {
        setDatePickerOpen(false);

        if (date > new Date()) {
            Alert.alert(
                'Invalid Date',
                'Start Date cannot be greater than today.',
            );
            return;
        }

        setStartDate(date);
        setPendingFollowUpList([]);
        setSearchText('');
        setExpandedMonths({});
        setExpandedDates({});
        setHasSearched(false);
    };

    /*
     * ======================================================
     * END DATE NOTICE
     * ======================================================
     */
    const showEndDateNotice = () => {
        Alert.alert(
            'End Date is Fixed',
            `End Date is always set to today's date (${formatDisplayDate(endDate)}) and cannot be changed.`,
        );
    };

    /*
     * ======================================================
     * FETCH PENDING FOLLOWUPS
     * ======================================================
     */
    const fetchPendingFollowUps = useCallback(
        async (isRefresh = false) => {
            const networkState = await NetInfo.fetch();
            const offline =
                networkState.isConnected === false ||
                networkState.isInternetReachable === false;

            if (offline) {
                setIsOffline(true);
                Alert.alert(
                    'No Internet Connection',
                    'You are currently offline. Please check your internet connection and try again.',
                );
                return;
            }

            setIsOffline(false);

            try {
                if (isRefresh) {
                    setRefreshing(true);
                } else {
                    setLoading(true);
                    setSearchText('');
                    setExpandedMonths({});
                    setExpandedDates({});
                }

                const userDataStr = await AsyncStorage.getItem('UserData');
                if (!userDataStr) {
                    Alert.alert(
                        'User Information Missing',
                        'Logged-in user information was not found.',
                    );
                    return;
                }

                let userData;
                try {
                    userData = JSON.parse(userDataStr);
                } catch (error) {
                    Alert.alert(
                        'User Data Error',
                        'Unable to read logged-in user information.',
                    );
                    return;
                }

                const hexKey =
                    userData?.CompanyHexKey ||
                    userData?.HexKey ||
                    userData?.HEXKEY;

                const businessID =
                    userData?.CompanyCode ||
                    userData?.BusinessID ||
                    userData?.BusinessId ||
                    userData?.Businessid;

                const userName =
                    userData?.UserName ||
                    userData?.Username ||
                    userData?.userName ||
                    userData?.LoginName;

                const userType =
                    userData?.UserType ||
                    userData?.userType ||
                    userData?.Type;

                if (!hexKey || !businessID || !userName || !userType) {
                    Alert.alert('Incomplete Profile', 'Missing profile details.');
                    return;
                }

                const fromDate = formatApiDate(startDate);
                const toDate = formatApiDate(new Date());
                const url = `${BASE_URL}report/FollowUp/Pending`;

                const params = {
                    HexKey: hexKey,
                    Businessid: businessID,
                    UserName: userName,
                    UserType: userType,
                    fromDate: fromDate,
                    toDate: toDate,
                };

                const response = await axios.get(url, {
                    params,
                    timeout: 30000,
                });

                const list = Array.isArray(response.data) ? response.data : [];
                setPendingFollowUpList(list);
                setHasSearched(true);
            } catch (error) {
                setPendingFollowUpList([]);
                setHasSearched(true);

                let errorMessage =
                    'Unable to fetch pending follow-ups. Please try again.';
                if (error?.response?.data?.Message) {
                    errorMessage = error.response.data.Message;
                } else if (typeof error?.response?.data === 'string') {
                    errorMessage = error.response.data;
                } else if (error?.message) {
                    errorMessage = error.message;
                }

                Alert.alert('Unable to Load', errorMessage);
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        [startDate],
    );

    const onRefresh = useCallback(() => {
        fetchPendingFollowUps(true);
    }, [fetchPendingFollowUps]);

    /*
     * ======================================================
     * TEXT SEARCH
     * ======================================================
     */
    const filteredFollowUpList = useMemo(() => {
        const search = searchText.trim().toLowerCase();
        if (!search) return pendingFollowUpList;

        return pendingFollowUpList.filter(item => {
            const companyName = item?.Name?.toString().toLowerCase() || '';
            const leadNo = item?.LeadNo?.toString().toLowerCase() || '';
            const followUpNo = item?.LeadFollowUpNo?.toString().toLowerCase() || '';
            const status = item?.Status?.toString().toLowerCase() || '';
            const followUpDate = item?.FollowUPDate?.toString().toLowerCase() || '';
            const nextFollowDate = item?.NextFollowDate?.toString().toLowerCase() || '';

            return (
                companyName.includes(search) ||
                leadNo.includes(search) ||
                followUpNo.includes(search) ||
                status.includes(search) ||
                followUpDate.includes(search) ||
                nextFollowDate.includes(search)
            );
        });
    }, [pendingFollowUpList, searchText]);

    /*
     * ======================================================
     * CREATE DRILLDOWN DATA
     * ======================================================
     */
    const drillDownData = useMemo(() => {
        const sortedList = [...filteredFollowUpList].sort((a, b) => {
            const dateA = parseResponseDate(a?.NextFollowDate);
            const dateB = parseResponseDate(b?.NextFollowDate);

            if (!dateA && !dateB) return 0;
            if (!dateA) return 1;
            if (!dateB) return -1;
            return dateA.getTime() - dateB.getTime();
        });

        const monthMap = {};

        sortedList.forEach(item => {
            const monthKey = getMonthKey(item?.NextFollowDate);
            const monthLabel = getMonthLabel(item?.NextFollowDate);

            if (!monthMap[monthKey]) {
                monthMap[monthKey] = {
                    monthKey,
                    monthLabel,
                    count: 0,
                    dateMap: {},
                };
            }

            monthMap[monthKey].count += 1;
            const dateKey = item?.NextFollowDate || 'unknown';

            if (!monthMap[monthKey].dateMap[dateKey]) {
                monthMap[monthKey].dateMap[dateKey] = {
                    dateKey,
                    dateLabel: formatResponseDate(dateKey),
                    count: 0,
                    items: [],
                };
            }

            monthMap[monthKey].dateMap[dateKey].count += 1;
            monthMap[monthKey].dateMap[dateKey].items.push(item);
        });

        return Object.values(monthMap)
            .sort((a, b) => {
                if (a.monthKey === 'unknown') return 1;
                if (b.monthKey === 'unknown') return -1;
                return a.monthKey.localeCompare(b.monthKey);
            })
            .map(month => {
                const dates = Object.values(month.dateMap).sort((a, b) => {
                    if (a.dateKey === 'unknown') return 1;
                    if (b.dateKey === 'unknown') return -1;
                    return a.dateKey.localeCompare(b.dateKey);
                });

                return {
                    monthKey: month.monthKey,
                    monthLabel: month.monthLabel,
                    count: month.count,
                    dates,
                };
            });
    }, [filteredFollowUpList]);

    useEffect(() => {
        if (!searchText.trim()) return;

        const months = {};
        const dates = {};

        drillDownData.forEach(month => {
            months[month.monthKey] = true;
            month.dates.forEach(dateItem => {
                const key = `${month.monthKey}_${dateItem.dateKey}`;
                dates[key] = true;
            });
        });

        setExpandedMonths(months);
        setExpandedDates(dates);
    }, [searchText, drillDownData]);

    const toggleMonth = monthKey => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedMonths(prev => ({
            ...prev,
            [monthKey]: !prev[monthKey],
        }));
    };

    const toggleDate = (monthKey, dateKey) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        const key = `${monthKey}_${dateKey}`;
        setExpandedDates(prev => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    /*
     * ======================================================
     * FOLLOWUP CARD
     * ======================================================
     */
    const renderFollowUpCard = (item, index) => {
        return (
            <View
                key={`${item?.IDLead || 'lead'}-${item?.LeadFollowUpNo || index}`}
                style={styles.followUpCard}
            >
                <View style={styles.cardTopRow}>
                    <View style={styles.companyIcon}>
                        <Feather name="briefcase" size={18} color="#005696" />
                    </View>

                    <View style={styles.companyInfo}>
                        <Text style={styles.companyName} numberOfLines={2}>
                            {item?.Name?.trim() || 'Unknown Account'}
                        </Text>
                        <Text style={styles.leadNumber}>
                            {item?.LeadNo || '--'}
                        </Text>
                    </View>

                    <View style={styles.pendingBadge}>
                        <View style={styles.pendingDot} />
                        <Text style={styles.pendingBadgeText}>
                            {item?.Status || 'Pending'}
                        </Text>
                    </View>
                </View>

                <View style={styles.cardDivider} />

                <View style={styles.followUpDetailRow}>
                    <View style={styles.detailColumn}>
                        <Text style={styles.detailLabel}>Follow Up No.</Text>
                        <Text style={styles.detailValue}>
                            {item?.LeadFollowUpNo || '--'}
                        </Text>
                    </View>

                    <View style={styles.followUpDateSection}>
                        <Feather name="calendar" size={14} color="#6E7D8E" />
                        <View style={styles.followUpDateTextContainer}>
                            <Text style={styles.detailLabel}>Last Follow Up</Text>
                            <Text style={styles.detailDate}>
                                {formatResponseDate(item?.FollowUPDate)}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        );
    };

    /*
     * ======================================================
     * RENDER MONTH
     * ======================================================
     */
    const renderMonth = ({ item: month }) => {
        const monthExpanded = expandedMonths[month.monthKey];

        return (
            <View style={styles.monthSection}>
                <TouchableOpacity
                    style={[
                        styles.monthHeader,
                        monthExpanded && styles.monthHeaderExpanded,
                    ]}
                    activeOpacity={0.8}
                    onPress={() => toggleMonth(month.monthKey)}
                >
                    <View style={styles.monthIcon}>
                        <Feather name="calendar" size={18} color="#005696" />
                    </View>

                    <View style={styles.monthInformation}>
                        <Text style={styles.monthTitle}>{month.monthLabel}</Text>
                        <Text style={styles.monthSubtitle}>
                            {month.count} pending follow up{month.count !== 1 ? 's' : ''}
                        </Text>
                    </View>

                    <View style={styles.monthCount}>
                        <Text style={styles.monthCountText}>{month.count}</Text>
                    </View>

                    <View style={styles.expandIcon}>
                        <Feather
                            name={monthExpanded ? 'chevron-up' : 'chevron-down'}
                            size={18}
                            color="#005696"
                        />
                    </View>
                </TouchableOpacity>

                {monthExpanded && (
                    <View style={styles.dateDrillDownContainer}>
                        {month.dates.map(dateItem => {
                            const dateExpandKey = `${month.monthKey}_${dateItem.dateKey}`;
                            const dateExpanded = expandedDates[dateExpandKey];

                            return (
                                <View key={dateExpandKey} style={styles.dateGroup}>
                                    <TouchableOpacity
                                        style={[
                                            styles.dateHeader,
                                            dateExpanded && styles.dateHeaderExpanded,
                                        ]}
                                        activeOpacity={0.8}
                                        onPress={() =>
                                            toggleDate(
                                                month.monthKey,
                                                dateItem.dateKey,
                                            )
                                        }
                                    >
                                        <View style={styles.timelineSection}>
                                            <View style={styles.timelineDot} />
                                            <View style={styles.timelineLine} />
                                        </View>

                                        <View style={styles.dateIconContainer}>
                                            <Feather name="clock" size={15} color="#005696" />
                                        </View>

                                        <View style={styles.dateInformation}>
                                            <Text style={styles.dateDrillTitle}>
                                                {dateItem.dateLabel}
                                            </Text>
                                            <Text style={styles.dateDrillSubtitle}>
                                                Next follow-up date
                                            </Text>
                                        </View>

                                        <View style={styles.dateCountBadge}>
                                            <Text style={styles.dateCountText}>
                                                {dateItem.count}
                                            </Text>
                                        </View>

                                        <Feather
                                            name={dateExpanded ? 'minus' : 'plus'}
                                            size={16}
                                            color="#647483"
                                        />
                                    </TouchableOpacity>

                                    {dateExpanded && (
                                        <View style={styles.followUpItemsContainer}>
                                            {dateItem.items.map((followUpItem, idx) =>
                                                renderFollowUpCard(followUpItem, idx),
                                            )}
                                        </View>
                                    )}
                                </View>
                            );
                        })}
                    </View>
                )}
            </View>
        );
    };

    /*
     * ======================================================
     * HEADER / FILTER
     * ======================================================
     */
    const renderHeader = () => {
        return (
            <>
                {isOffline && (
                    <View style={styles.offlineBanner}>
                        <View style={styles.offlineIcon}>
                            <Feather name="wifi-off" size={18} color="#C62828" />
                        </View>
                        <View style={styles.offlineTextContainer}>
                            <Text style={styles.offlineTitle}>You're Offline</Text>
                            <Text style={styles.offlineMessage}>
                                Connect to the internet to load pending follow-ups.
                            </Text>
                        </View>
                    </View>
                )}

                <View style={styles.dateContainer}>
                    <TouchableOpacity
                        style={styles.dateCard}
                        activeOpacity={0.8}
                        onPress={() => setDatePickerOpen(true)}
                    >
                        <View style={styles.dateIconBox}>
                            <Feather name="calendar" size={18} color="#005696" />
                        </View>

                        <View style={styles.dateDetails}>
                            <Text style={styles.dateLabel}>Start Date</Text>
                            <Text style={styles.dateValue}>
                                {formatDisplayDate(startDate)}
                            </Text>
                        </View>

                        <View style={styles.rightAction}>
                            <View style={styles.changeBadge}>
                                <Text style={styles.changeBadgeText}>Change</Text>
                            </View>
                            <Feather name="chevron-down" size={16} color="#8996A4" />
                        </View>
                    </TouchableOpacity>

                    <View style={styles.dateConnector}>
                        <View style={styles.connectorLine} />
                        <View style={styles.connectorCircle}>
                            <Feather name="arrow-down" size={12} color="#005696" />
                        </View>
                        <View style={styles.connectorLine} />
                    </View>

                    <TouchableOpacity
                        style={[styles.dateCard, styles.endDateCard]}
                        activeOpacity={0.8}
                        onPress={showEndDateNotice}
                    >
                        <View style={styles.dateIconBox}>
                            <Feather name="calendar" size={18} color="#005696" />
                        </View>

                        <View style={styles.dateDetails}>
                            <View style={styles.endDateLabelRow}>
                                <Text style={styles.dateLabel}>End Date</Text>
                                <View style={styles.todayBadge}>
                                    <Text style={styles.todayBadgeText}>TODAY</Text>
                                </View>
                            </View>
                            <Text style={styles.dateValue}>
                                {formatDisplayDate(endDate)}
                            </Text>
                        </View>

                        <View style={styles.lockBox}>
                            <Feather name="lock" size={14} color="#8898AA" />
                        </View>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={styles.searchButtonWrapper}
                    activeOpacity={0.85}
                    disabled={loading}
                    onPress={() => fetchPendingFollowUps(false)}
                >
                    <LinearGradient
                        colors={
                            isOffline
                                ? ['#AAB3BB', '#8D979F']
                                : ['#005696', '#048EF7']
                        }
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.searchButton}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <Feather
                                name={isOffline ? 'wifi-off' : 'search'}
                                size={18}
                                color="#FFFFFF"
                            />
                        )}

                        <Text style={styles.searchButtonText}>
                            {loading ? 'Loading...' : 'View Pending Follow Ups'}
                        </Text>
                    </LinearGradient>
                </TouchableOpacity>

                {hasSearched && !loading && (
                    <>
                        <View style={styles.resultHeader}>
                            <View style={styles.resultTitleContainer}>
                                <Text style={styles.resultTitle}>
                                    Follow Up Summary
                                </Text>
                                <Text style={styles.resultSubtitle}>
                                    Grouped by Next Follow-up Date
                                </Text>
                            </View>

                            <View style={styles.totalBadge}>
                                <Text style={styles.totalBadgeNumber}>
                                    {filteredFollowUpList.length}
                                </Text>
                                <Text style={styles.totalBadgeLabel}>Total</Text>
                            </View>
                        </View>

                        {pendingFollowUpList.length > 0 && (
                            <View style={styles.listSearchContainer}>
                                <Feather name="search" size={18} color="#81909F" />
                                <TextInput
                                    style={styles.listSearchInput}
                                    value={searchText}
                                    onChangeText={setSearchText}
                                    placeholder="Search company, lead or follow up..."
                                    placeholderTextColor="#A0AAB4"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                                {searchText.length > 0 && (
                                    <TouchableOpacity
                                        style={styles.clearSearchButton}
                                        activeOpacity={0.7}
                                        onPress={() => setSearchText('')}
                                    >
                                        <Feather name="x" size={16} color="#687785" />
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}

                        {drillDownData.length > 0 && (
                            <View style={styles.drillDownHint}>
                                <Feather name="info" size={14} color="#005696" />
                                <Text style={styles.drillDownHintText}>
                                    Tap a month, then tap a date to view follow-up details.
                                </Text>
                            </View>
                        )}
                    </>
                )}
            </>
        );
    };

    /*
     * ======================================================
     * EMPTY STATE
     * ======================================================
     */
    const renderEmpty = () => {
        if (loading || !hasSearched) return null;

        if (searchText.trim() && pendingFollowUpList.length > 0) {
            return (
                <View style={styles.emptyContainer}>
                    <View style={styles.emptyIcon}>
                        <Feather name="search" size={28} color="#005696" />
                    </View>
                    <Text style={styles.emptyTitle}>No Matching Follow Ups</Text>
                    <Text style={styles.emptyMessage}>
                        No records match "{searchText}".
                    </Text>
                    <TouchableOpacity
                        style={styles.clearFilterButton}
                        onPress={() => setSearchText('')}
                    >
                        <Text style={styles.clearFilterText}>Clear Search</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return (
            <View style={styles.emptyContainer}>
                <View style={styles.emptyIcon}>
                    <Feather name="check-circle" size={30} color="#005696" />
                </View>
                <Text style={styles.emptyTitle}>No Pending Follow Ups</Text>
                <Text style={styles.emptyMessage}>
                    No pending follow-ups were found for the selected date range.
                </Text>
            </View>
        );
    };

    return (
        <ImageBackground
            source={BACKGROUND_IMAGE}
            style={styles.backgroundImage}
            resizeMode="cover"
        >
            <SafeAreaView style={styles.container}>
                <StatusBar
                    barStyle="dark-content"
                    backgroundColor="transparent"
                    translucent
                />

                <View style={styles.customHeader}>
                    <TouchableOpacity
                        style={styles.backBtn}
                        activeOpacity={0.7}
                        onPress={() => navigation.goBack()}
                    >
                        <Feather name="chevron-left" size={22} color="#1E293B" />
                    </TouchableOpacity>

                    <Text style={styles.headerTitleText}>Pending Follow Up</Text>

                    <View style={styles.rightHeaderSpace} />
                </View>

                <FlatList
                    data={drillDownData}
                    keyExtractor={item => item.monthKey}
                    renderItem={renderMonth}
                    ListHeaderComponent={renderHeader}
                    ListEmptyComponent={renderEmpty}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        hasSearched ? (
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                colors={['#005696']}
                                tintColor="#005696"
                            />
                        ) : undefined
                    }
                />

                <DatePicker
                    modal
                    open={datePickerOpen}
                    date={startDate}
                    mode="date"
                    maximumDate={new Date()}
                    title="Select Start Date"
                    confirmText="Select"
                    cancelText="Cancel"
                    onConfirm={handleStartDateConfirm}
                    onCancel={() => setDatePickerOpen(false)}
                />
            </SafeAreaView>
        </ImageBackground>
    );
};

export default PendingFollowUpDrillDown;

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
    },
    container: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    customHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 8 : 8,
        paddingBottom: 10,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        //elevation: 3,
    },
    headerTitleText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0F172A',
        letterSpacing: -0.2,
    },
    rightHeaderSpace: {
        width: 40,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 50,
        flexGrow: 1,
    },
    offlineBanner: {
        backgroundColor: 'rgba(255,242,242,0.92)',
        borderWidth: 1,
        borderColor: '#FFD1D1',
        borderRadius: 14,
        padding: 11,
        marginBottom: 15,
        flexDirection: 'row',
        alignItems: 'center',
    },
    offlineIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#FFE1E1',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    offlineTextContainer: {
        flex: 1,
    },
    offlineTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#B71C1C',
    },
    offlineMessage: {
        fontSize: 10.5,
        color: '#806060',
        marginTop: 2,
    },
    dateContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.92)',
        borderRadius: 20,
        padding: 14,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.7)',
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 14,
        //elevation: 3,
    },
    dateCard: {
        minHeight: 62,
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#EEF2F6',
        borderRadius: 14,
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
    },
    endDateCard: {
        backgroundColor: '#F8FAFC',
    },
    dateIconBox: {
        width: 38,
        height: 38,
        borderRadius: 10,
        backgroundColor: '#E6F2FA',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    dateDetails: {
        flex: 1,
    },
    dateLabel: {
        fontSize: 11,
        fontWeight: '500',
        color: '#64748B',
        marginBottom: 2,
    },
    dateValue: {
        fontSize: 14,
        fontWeight: '700',
        color: '#0F172A',
    },
    rightAction: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    changeBadge: {
        backgroundColor: '#E0F2FE',
        borderRadius: 6,
        paddingHorizontal: 7,
        paddingVertical: 3,
    },
    changeBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#0284C7',
    },
    dateConnector: {
        height: 24,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    connectorLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#E2E8F0',
    },
    connectorCircle: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: '#E0F2FE',
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 8,
    },
    endDateLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    todayBadge: {
        paddingHorizontal: 5,
        paddingVertical: 1,
        backgroundColor: '#E0F2FE',
        borderRadius: 4,
    },
    todayBadgeText: {
        fontSize: 9,
        fontWeight: '800',
        color: '#0284C7',
    },
    lockBox: {
        width: 30,
        height: 30,
        borderRadius: 8,
        backgroundColor: '#EEF2F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchButtonWrapper: {
        marginTop: 14,
        borderRadius: 14,
        shadowColor: '#0284C7',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        //elevation: 4,
    },
    searchButton: {
        height: 50,
        borderRadius: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    searchButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
    },
    resultHeader: {
        marginTop: 22,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
    },
    resultTitleContainer: {
        flex: 1,
    },
    resultTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1D2C3A',
    },
    resultSubtitle: {
        fontSize: 11,
        color: '#84919E',
        marginTop: 2,
    },
    totalBadge: {
        minWidth: 48,
        paddingHorizontal: 9,
        paddingVertical: 5,
        borderRadius: 10,
        backgroundColor: '#E5F2FC',
        alignItems: 'center',
    },
    totalBadgeNumber: {
        fontSize: 13,
        fontWeight: '800',
        color: '#005696',
    },
    totalBadgeLabel: {
        fontSize: 8.5,
        color: '#708596',
        marginTop: 1,
    },
    listSearchContainer: {
        height: 46,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E1E8EE',
        borderRadius: 12,
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        //elevation: 1,
    },
    listSearchInput: {
        flex: 1,
        height: 44,
        paddingVertical: 0,
        marginLeft: 8,
        fontSize: 12.5,
        color: '#263544',
    },
    clearSearchButton: {
        width: 28,
        height: 28,
        borderRadius: 8,
        backgroundColor: '#F0F3F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    drillDownHint: {
        backgroundColor: '#EDF7FD',
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 8,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    drillDownHintText: {
        flex: 1,
        fontSize: 10.5,
        color: '#627787',
        marginLeft: 7,
    },
    monthSection: {
        marginBottom: 10,
    },
    monthHeader: {
        minHeight: 64,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E7EDF2',
        borderRadius: 14,
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
        //elevation: 1,
    },
    monthHeaderExpanded: {
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
        borderColor: '#CBE4F5',
        backgroundColor: '#F9FCFE',
    },
    monthIcon: {
        width: 38,
        height: 38,
        borderRadius: 10,
        backgroundColor: '#E5F2FB',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    monthInformation: {
        flex: 1,
    },
    monthTitle: {
        fontSize: 13,
        fontWeight: '800',
        color: '#213241',
    },
    monthSubtitle: {
        fontSize: 9.5,
        color: '#8593A0',
        marginTop: 2,
    },
    monthCount: {
        minWidth: 32,
        height: 26,
        borderRadius: 8,
        backgroundColor: '#E5F2FC',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 6,
    },
    monthCountText: {
        fontSize: 11,
        fontWeight: '800',
        color: '#005696',
    },
    expandIcon: {
        width: 28,
        height: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 4,
    },
    dateDrillDownContainer: {
        paddingLeft: 10,
        paddingTop: 6,
    },
    dateGroup: {
        marginBottom: 6,
    },
    dateHeader: {
        minHeight: 54,
        backgroundColor: '#F7F9FB',
        borderWidth: 1,
        borderColor: '#E6ECF1',
        borderRadius: 12,
        paddingHorizontal: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    dateHeaderExpanded: {
        backgroundColor: '#EDF7FD',
        borderColor: '#D2E8F6',
    },
    timelineSection: {
        width: 12,
        alignSelf: 'stretch',
        alignItems: 'center',
        marginRight: 6,
    },
    timelineDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#005696',
        marginTop: 24,
        zIndex: 2,
    },
    timelineLine: {
        position: 'absolute',
        width: 1,
        top: 0,
        bottom: -10,
        backgroundColor: '#D7E4EC',
    },
    dateIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: '#E2EFF8',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    dateInformation: {
        flex: 1,
    },
    dateDrillTitle: {
        fontSize: 11.5,
        fontWeight: '700',
        color: '#314252',
    },
    dateDrillSubtitle: {
        fontSize: 9,
        color: '#8794A0',
        marginTop: 1,
    },
    dateCountBadge: {
        minWidth: 26,
        height: 24,
        borderRadius: 7,
        paddingHorizontal: 5,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    dateCountText: {
        fontSize: 9.5,
        fontWeight: '800',
        color: '#005696',
    },
    followUpItemsContainer: {
        paddingLeft: 16,
        paddingTop: 6,
    },
    followUpCard: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E9EEF2',
        borderRadius: 12,
        padding: 11,
        marginBottom: 8,
        //elevation: 1,
    },
    cardTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    companyIcon: {
        width: 34,
        height: 34,
        borderRadius: 9,
        backgroundColor: '#E7F3FC',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    companyInfo: {
        flex: 1,
        paddingRight: 4,
    },
    companyName: {
        fontSize: 12,
        fontWeight: '700',
        color: '#293947',
    },
    leadNumber: {
        fontSize: 9,
        color: '#83919E',
        marginTop: 2,
    },
    pendingBadge: {
        backgroundColor: '#FFF4DD',
        borderRadius: 6,
        paddingHorizontal: 6,
        paddingVertical: 3,
        flexDirection: 'row',
        alignItems: 'center',
    },
    pendingDot: {
        width: 5,
        height: 5,
        borderRadius: 3,
        backgroundColor: '#DB9314',
        marginRight: 4,
    },
    pendingBadgeText: {
        fontSize: 8,
        fontWeight: '700',
        color: '#B77810',
    },
    cardDivider: {
        height: 1,
        backgroundColor: '#EEF2F5',
        marginVertical: 8,
    },
    followUpDetailRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    detailColumn: {
        flex: 1,
    },
    detailLabel: {
        fontSize: 8,
        color: '#8B97A3',
        marginBottom: 2,
    },
    detailValue: {
        fontSize: 10,
        fontWeight: '700',
        color: '#43515E',
    },
    followUpDateSection: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F8FA',
        borderRadius: 8,
        padding: 6,
    },
    followUpDateTextContainer: {
        marginLeft: 5,
    },
    detailDate: {
        fontSize: 9,
        fontWeight: '700',
        color: '#4D5B68',
    },
    emptyContainer: {
        paddingVertical: 40,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    emptyIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#E7F3FC',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    emptyTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#2B3A47',
    },
    emptyMessage: {
        fontSize: 11,
        lineHeight: 16,
        color: '#84919E',
        textAlign: 'center',
        marginTop: 4,
    },
    clearFilterButton: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        backgroundColor: '#E6F3FC',
        borderRadius: 8,
        marginTop: 12,
    },
    clearFilterText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#005696',
    },
});