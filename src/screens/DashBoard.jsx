import React, { useEffect, useState, useRef, useMemo, memo, useCallback } from 'react';

import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    BackHandler,
    Alert,
    TouchableOpacity,
    PermissionsAndroid,
    ActivityIndicator,
    Image,
    ImageBackground,
    StatusBar,
    Platform,
    Linking,
    Animated,
    Easing,
    Modal,
    Pressable,
    TextInput,
} from 'react-native';

import AnimatedAlert from '../components/custom/AnimatedAlert';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
    useNavigation,
    DrawerActions,
    useFocusEffect,
} from '@react-navigation/native';

import { GOOGLE_MAPS_API_KEY, BASE_URL } from '@env';

import DeviceInfo from 'react-native-device-info';
import Geocoder from 'react-native-geocoding';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Geolocation from '@react-native-community/geolocation';

import {
    isLocationEnabled,
    promptForEnableLocationIfNeeded,
} from 'react-native-android-location-enabler';

import MapView, { Marker, Circle } from 'react-native-maps';

import Svg, {
    G,
    Path,
    Text as SvgText,
    Defs,
    LinearGradient,
    Stop,
    Rect,
} from 'react-native-svg';


Geocoder.init(GOOGLE_MAPS_API_KEY);

const IS_ANDROID = Platform.OS === 'android';
const AnimatedG = Animated.createAnimatedComponent(G);

const BACKGROUND_IMAGE = require('../images/bg.png');

const GIRL_AI_AVATAR =
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';

const BOY_AI_AVATAR =
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150';

const CLIENT_AVATAR =
    'https://cdn.phototourl.com/free/2026-08-06-5e0028ef-9e9b-407c-9fe0-2b1104d4a92e.webp';


const CHART_COLORS = [
    '#3B82F6',
    '#10B981',
    '#F59E0B',
    '#EF4444',
    '#8B5CF6',
    '#EC4899',
    '#06B6D4',
    '#6366F1',
    '#F97316',
    '#14B8A6',
    '#A855F7',
    '#84CC16',
];


const FEMALE_NAME_KEYWORDS = [
    'srijoni',
    'priya',
    'pooja',
    'neha',
    'ananya',
    'sneha',
    'ria',
    'riyan',
    'rita',
    'anita',
    'sunita',
    'shreya',
    'tanu',
    'tanya',
    'megha',
    'simran',
    'swati',
    'divya',
    'moumita',
];


/* =========================================================
   HELPERS
========================================================= */

const getUserAvatar = gender => {
    if (gender && gender.toUpperCase() === 'FEMALE') {
        return GIRL_AI_AVATAR;
    }

    return BOY_AI_AVATAR;
};



const CLIENT_IMAGE_BASE_URL = 'https://iecrmserviceapi.iecsl.in/';

const DashboardClientAvatar = ({ filePath }) => {
    const [imageError, setImageError] = useState(false);

    const cleanPath =
        typeof filePath === 'string'
            ? filePath.trim().replace(/^\/+/, '')
            : '';

    const imageUrl = cleanPath
        ? `${CLIENT_IMAGE_BASE_URL}${cleanPath}`
        : '';

    if (!imageUrl || imageError) {
        return (
            <View style={styles.dashboardClientAvatarFallback}>
                <Ionicons
                    name="image-outline"
                    size={20}
                    color="#94A3B8"
                />
                <Text style={styles.dashboardNoImageText}>
                    No Image
                </Text>
            </View>
        );
    }

    return (
        <Image
            source={{ uri: imageUrl }}
            style={styles.clientAvatar}
            resizeMode="cover"
            onError={() => setImageError(true)}
        />
    );
};

const getClientAvatar = name => {
    if (!name) {
        return CLIENT_AVATAR;
    }

    const firstName = name.trim().split(' ')[0].toLowerCase();

    const isFemale =
        FEMALE_NAME_KEYWORDS.includes(firstName) ||
        firstName.endsWith('a') ||
        firstName.endsWith('i') ||
        firstName.endsWith('ee');

    return isFemale ? GIRL_AI_AVATAR : CLIENT_AVATAR;
};


const getCurrentDateTime = () => {
    const now = new Date();

    return now.toLocaleString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
    });
};


const getDynamicGreeting = () => {
    const hour = new Date().getHours();

    if (hour >= 4 && hour < 12) {
        return 'Good Morning';
    }

    if (hour >= 12 && hour < 17) {
        return 'Good Afternoon';
    }

    if (hour >= 17 && hour < 21) {
        return 'Good Evening';
    }

    return 'Good Night';
};


const getSixMonthsBackDate = () => {
    const today = new Date();
    const currentDay = today.getDate();

    const sixMonthsBack = new Date(
        today.getFullYear(),
        today.getMonth() - 5,
        1,
    );

    const lastDay = new Date(
        sixMonthsBack.getFullYear(),
        sixMonthsBack.getMonth() + 1,
        0,
    ).getDate();

    sixMonthsBack.setDate(Math.min(currentDay, lastDay));

    return sixMonthsBack;
};


const formatApiDate = date => {
    if (!date) {
        return '';
    }

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
};


const formatDisplayDate = date => {
    if (!date) {
        return '';
    }

    return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
};


const getMaturityColor = level => {
    const value = Number(level);

    if (value >= 100) {
        return '#10B981';
    }

    if (value >= 80) {
        return '#3B82F6';
    }

    if (value >= 60) {
        return '#F59E0B';
    }

    if (value >= 40) {
        return '#F97316';
    }

    if (value >= 20) {
        return '#EF4444';
    }

    return '#94A3B8';
};


const LiveDateTimeText = memo(() => {
    const [dateTime, setDateTime] = useState(getCurrentDateTime());

    useEffect(() => {
        const timer = setInterval(() => {
            setDateTime(getCurrentDateTime());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return <Text style={styles.clockText}>{dateTime}</Text>;
});


/* =========================================================
   DASHBOARD
========================================================= */

const DashboardScreen = () => {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();

    const [visible, setVisible] = useState(false);
    const [leadModalVisible, setLeadModalVisible] = useState(false);
    const [selectedLeadOption, setSelectedLeadOption] = useState(null);

    const [masterModalVisible, setMasterModalVisible] = useState(false);
    const [selectedMasterOption, setSelectedMasterOption] = useState(null);

    const [empName, setEmpName] = useState('');
    const [placeName, setPlaceName] = useState('');
    const [userData, setUserData] = useState(null);

    const [visitList, setVisitList] = useState([]);
    const [selectedVisit, setSelectedVisit] = useState(null);

    const [loading, setLoading] = useState(true);

    const [currentTime, setCurrentTime] = useState('');
    const [currentDate, setCurrentDate] = useState('');
    const [greeting, setGreeting] = useState(getDynamicGreeting());

    const [empNo, setEmpNo] = useState('');
    const [device, setDevice] = useState('');
    const [accuracy, setAccuracy] = useState('10 m');

    const [dayStatus, setDayStatus] = useState('START');
    const [idDay, setIdDay] = useState(null);

    const [selectedSliceIndex, setSelectedSliceIndex] = useState(null);
    const [activeTab, setActiveTab] = useState('Home');


    /* =====================================================
       LEAD ANALYTICS
    ===================================================== */

    const [graphLoading, setGraphLoading] = useState(false);
    const [maturityData, setMaturityData] = useState([]);
    const [monthlyLeadData, setMonthlyLeadData] = useState([]);

    const [graphStartDate, setGraphStartDate] = useState(getSixMonthsBackDate());
    const [graphEndDate, setGraphEndDate] = useState(new Date());

    const [selectedMaturityIndex, setSelectedMaturityIndex] = useState(null);
    const [graphError, setGraphError] = useState('');


    /* =====================================================
       CUSTOM DATE MODAL
    ===================================================== */

    const [dateModalVisible, setDateModalVisible] = useState(false);
    const [dateSelectionType, setDateSelectionType] = useState('');
    const [tempDay, setTempDay] = useState('');
    const [tempMonth, setTempMonth] = useState('');
    const [tempYear, setTempYear] = useState('');


    /* =====================================================
       LOCATION
    ===================================================== */

    const [location, setLocation] = useState({
        latitude: 37.785834,
        longitude: -122.406417,
    });

    const [mapRegion, setMapRegion] = useState({
        latitude: 37.785834,
        longitude: -122.406417,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
    });


    /* =====================================================
       ANIMATIONS
    ===================================================== */

    const refreshSpin = useRef(new Animated.Value(0)).current;
    const cardScale = useRef(new Animated.Value(1)).current;
    const btnScale = useRef(new Animated.Value(1)).current;

    const chartAnim = useRef(new Animated.Value(0)).current;
    const leadGraphAnim = useRef(new Animated.Value(0)).current;

    const activeScale = useRef(new Animated.Value(1)).current;
    const avatarScale = useRef(new Animated.Value(1)).current;

    const backdropOpacity = useRef(new Animated.Value(0)).current;
    const sheetTranslateY = useRef(new Animated.Value(300)).current;
    const optionGenerationScale = useRef(new Animated.Value(1)).current;
    const optionFollowupScale = useRef(new Animated.Value(1)).current;
    const optionPendingFollowupScale = useRef(new Animated.Value(1)).current;
    const closeBtnScale = useRef(new Animated.Value(1)).current;
    const optionCardsOpacity = useRef(new Animated.Value(0)).current;

    const masterBackdropOpacity = useRef(new Animated.Value(0)).current;
    const masterSheetTranslateY = useRef(new Animated.Value(350)).current;
    const masterOptionAccountScale = useRef(new Animated.Value(1)).current;
    const masterOptionProductScale = useRef(new Animated.Value(1)).current;
    const masterOptionReferrScale = useRef(new Animated.Value(1)).current;
    const masterOptionViewScale = useRef(new Animated.Value(1)).current;
    const masterCloseBtnScale = useRef(new Animated.Value(1)).current;
    const masterOptionCardsOpacity = useRef(new Animated.Value(0)).current;


    /* =====================================================
       NAV ITEMS
    ===================================================== */

    const data = useMemo(() => [
        { label: 'Item 1', value: 'Home' },
        { label: 'Item 2', value: 'Attendance' },
        { label: 'Item 3', value: 'Master' },
        { label: 'Item 4', value: 'Lead Sourcing' },
        { label: 'Item 5', value: 'Reports' },
    ], []);


    /* =====================================================
       ALERT
    ===================================================== */

    const [alertConfig, setAlertConfig] = useState({
        visible: false,
        title: '',
        message: '',
        iconName: '',
        iconColor: '',
        onConfirm: null,
        isConfirmation: false,
        confirmText: 'YES',
        cancelText: 'Cancel',
    });


    const showAnimatedAlert = (
        title,
        message,
        iconName = 'alert-circle-outline',
        iconColor = '#E53935',
        onConfirm = null,
        isConfirmation = false,
        confirmText = 'OK',
        cancelText = 'Cancel',
    ) => {
        setAlertConfig({
            visible: true,
            title,
            message,
            iconName,
            iconColor,
            onConfirm,
            isConfirmation,
            confirmText,
            cancelText,
        });
    };


    /* =====================================================
       PRESS ANIMATION
    ===================================================== */

    const onPressIn = animatedValue => {
        Animated.timing(animatedValue, {
            toValue: 0.96,
            duration: 80,
            useNativeDriver: true,
        }).start();
    };


    const onPressOut = animatedValue => {
        Animated.timing(animatedValue, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
        }).start();
    };


    /* =====================================================
       LEAD MODAL
    ===================================================== */

    const openLeadModal = () => {
        setLeadModalVisible(true);
        setSelectedLeadOption(null);

        backdropOpacity.setValue(0);
        sheetTranslateY.setValue(300);
        optionCardsOpacity.setValue(0);

        Animated.parallel([
            Animated.timing(backdropOpacity, {
                toValue: 1,
                duration: 180,
                useNativeDriver: true,
            }),
            Animated.timing(sheetTranslateY, {
                toValue: 0,
                duration: 220,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }),
            Animated.timing(optionCardsOpacity, {
                toValue: 1,
                duration: 180,
                useNativeDriver: true,
            }),
        ]).start();
    };


    const closeLeadModal = callback => {
        Animated.parallel([
            Animated.timing(backdropOpacity, {
                toValue: 0,
                duration: 140,
                useNativeDriver: true,
            }),
            Animated.timing(sheetTranslateY, {
                toValue: 300,
                duration: 180,
                easing: Easing.in(Easing.ease),
                useNativeDriver: true,
            }),
        ]).start(() => {
            setLeadModalVisible(false);

            if (callback) {
                callback();
            }
        });
    };


    /* =====================================================
       MASTER MODAL
    ===================================================== */

    const openMasterModal = () => {
        setMasterModalVisible(true);
        setSelectedMasterOption(null);

        masterBackdropOpacity.setValue(0);
        masterSheetTranslateY.setValue(350);
        masterOptionCardsOpacity.setValue(0);

        Animated.parallel([
            Animated.timing(masterBackdropOpacity, {
                toValue: 1,
                duration: 180,
                useNativeDriver: true,
            }),
            Animated.timing(masterSheetTranslateY, {
                toValue: 0,
                duration: 220,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }),
            Animated.timing(masterOptionCardsOpacity, {
                toValue: 1,
                duration: 180,
                useNativeDriver: true,
            }),
        ]).start();
    };


    const closeMasterModal = callback => {
        Animated.parallel([
            Animated.timing(masterBackdropOpacity, {
                toValue: 0,
                duration: 140,
                useNativeDriver: true,
            }),
            Animated.timing(masterSheetTranslateY, {
                toValue: 350,
                duration: 180,
                easing: Easing.in(Easing.ease),
                useNativeDriver: true,
            }),
        ]).start(() => {
            setMasterModalVisible(false);

            if (callback) {
                callback();
            }
        });
    };


    /* =====================================================
       CHART FUNCTIONS
    ===================================================== */

    const getCoordinatesForPercent = percent => {
        const x = Math.cos(2 * Math.PI * percent);
        const y = Math.sin(2 * Math.PI * percent);

        return [x, y];
    };


    const getArcPath = (startPercent, endPercent, outerRadius, innerRadius) => {
        const [startX, startY] = getCoordinatesForPercent(startPercent);
        const [endX, endY] = getCoordinatesForPercent(endPercent);

        const largeArcFlag = endPercent - startPercent > 0.5 ? 1 : 0;

        const x1 = startX * outerRadius;
        const y1 = startY * outerRadius;

        const x2 = endX * outerRadius;
        const y2 = endY * outerRadius;

        const x3 = endX * innerRadius;
        const y3 = endY * innerRadius;

        const x4 = startX * innerRadius;
        const y4 = startY * innerRadius;

        return `M ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4} Z`;
    };


    const triggerDonutAnimation = () => {
        chartAnim.setValue(0);

        Animated.timing(chartAnim, {
            toValue: 1,
            duration: 250,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
        }).start();
    };


    const triggerLeadGraphAnimation = () => {
        leadGraphAnim.setValue(0);

        Animated.timing(leadGraphAnim, {
            toValue: 1,
            duration: 400,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
        }).start();
    };


    /* =====================================================
       VISIT API
    ===================================================== */

    const fetchDashboardData = async user => {
        try {
            const apiUrl =
                `${BASE_URL}Attendance/Site/Visit/List` +
                `?HexKey=${encodeURIComponent(user?.CompanyHexKey || '')}` +
                `&IDUser=${encodeURIComponent(user?.IDUser || '')}`;

            console.log('Visit API:', apiUrl);

            const visitResponse = await fetch(apiUrl);

            if (!visitResponse.ok) {
                throw new Error(`Visit API HTTP ${visitResponse.status}`);
            }

            const visitJson = await visitResponse.json();

            if (
                visitJson?.Status === 'SUCCESS' &&
                Array.isArray(visitJson?.Data)
            ) {
                setVisitList(visitJson.Data);
            } else {
                setVisitList([]);
            }

        } catch (error) {
            console.error('Visit API Error:', error);
            setVisitList([]);
        } finally {
            triggerDonutAnimation();
        }
    };


    /* =====================================================
       LEAD GRAPH API
    ===================================================== */

    const fetchLeadGraphData = async (
        user,
        startDate = graphStartDate,
        endDate = graphEndDate,
    ) => {
        try {
            if (!user) {
                return;
            }

            const hexKey = user?.CompanyHexKey;

            const businessId =
                user?.CompanyCode ||
                user?.BusinessID;

            const loginUser =
                user?.UserName ||
                user?.EntryUser ||
                user?.LoginName;

            if (!hexKey || !businessId || !loginUser) {
                console.log('Graph API Missing Parameters:', {
                    hexKey,
                    businessId,
                    loginUser,
                    user,
                });

                setGraphError('Required login information is missing.');
                return;
            }

            if (startDate > endDate) {
                Alert.alert(
                    'Invalid Date Range',
                    'Start Date cannot be greater than End Date.',
                );

                return;
            }

            setGraphLoading(true);
            setGraphError('');

            const sDate = formatApiDate(startDate);
            const eDate = formatApiDate(endDate);

            const graphUrl =
                `${BASE_URL}Dashboard/Graph/Data` +
                `?HexKey=${encodeURIComponent(hexKey)}` +
                `&Businessid=${encodeURIComponent(businessId)}` +
                `&User=${encodeURIComponent(loginUser)}` +
                `&SDate=${encodeURIComponent(sDate)}` +
                `&EDate=${encodeURIComponent(eDate)}`;

            console.log('Lead Graph API:', graphUrl);

            const response = await fetch(graphUrl, {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Graph API HTTP ${response.status}`);
            }

            const result = await response.json();

            console.log(
                'Lead Graph Response:',
                JSON.stringify(result, null, 2),
            );

            const maturityList = Array.isArray(result?.Maturity)
                ? result.Maturity
                : [];

            const monthList = Array.isArray(result?.Months6)
                ? result.Months6
                : [];

            setMaturityData(maturityList);
            setMonthlyLeadData(monthList);
            setSelectedMaturityIndex(null);

            triggerLeadGraphAnimation();

        } catch (error) {
            console.error('Lead Graph API Error:', error);

            setMaturityData([]);
            setMonthlyLeadData([]);

            setGraphError(
                'Unable to load lead analytics. Please try again.',
            );

        } finally {
            setGraphLoading(false);
        }
    };


    /* =====================================================
       INITIAL DATA
    ===================================================== */

    useEffect(() => {
        let isMounted = true;

        const checkMidnightReset = async () => {
            try {
                const now = new Date();

                const hours = now.getHours();
                const minutes = now.getMinutes();

                const todayDateStr = now.toISOString().split('T')[0];

                const lastResetDate = await AsyncStorage.getItem(
                    'LAST_RESET_DATE',
                );

                const isPast1201AM =
                    hours > 0 ||
                    (hours === 0 && minutes >= 1);

                if (
                    lastResetDate !== todayDateStr &&
                    isPast1201AM
                ) {
                    await AsyncStorage.multiRemove([
                        'AttendanceCheck',
                        'AttendanceEnd',
                        'ATTENDANCE_END_DATE',
                        'DAY_STARTED',
                        'DAY_INFO',
                    ]);

                    await AsyncStorage.setItem(
                        'LAST_RESET_DATE',
                        todayDateStr,
                    );

                    if (isMounted) {
                        setDayStatus('START');
                    }

                } else if (
                    lastResetDate === todayDateStr &&
                    isPast1201AM
                ) {
                    const endSavedDate = await AsyncStorage.getItem(
                        'ATTENDANCE_END_DATE',
                    );

                    if (
                        endSavedDate &&
                        endSavedDate !== todayDateStr
                    ) {
                        await AsyncStorage.multiRemove([
                            'AttendanceCheck',
                            'AttendanceEnd',
                            'ATTENDANCE_END_DATE',
                            'DAY_STARTED',
                            'DAY_INFO',
                        ]);

                        if (isMounted) {
                            setDayStatus('START');
                        }
                    }
                }

            } catch (error) {
                console.log('Midnight Reset Error:', error);
            }
        };


        const initializeData = async () => {
            try {
                await checkMidnightReset();

                const [
                    deviceName,
                    userDataString,
                    dayInfoString,
                ] = await Promise.all([
                    DeviceInfo.getDeviceName(),
                    AsyncStorage.getItem('UserData'),
                    AsyncStorage.getItem('DAY_INFO'),
                ]);

                if (!isMounted) {
                    return;
                }

                setDevice(deviceName || '');

                if (userDataString) {
                    const user = JSON.parse(userDataString);

                    console.log('Dashboard User Data:', user);

                    setUserData(user);

                    const cleanName = (
                        user?.UserFullName ||
                        user?.UserName ||
                        'User'
                    )
                        .replace(/[\/\\]/g, '')
                        .trim();

                    setEmpName(cleanName);
                    setEmpNo(user?.IDUser || '');

                    fetchDashboardData(user);

                    fetchLeadGraphData(
                        user,
                        getSixMonthsBackDate(),
                        new Date(),
                    );
                }

                if (dayInfoString) {
                    const dayInfo = JSON.parse(dayInfoString);
                    setIdDay(dayInfo?.IDDay);
                }

                setLoading(false);

            } catch (error) {
                console.error(
                    'Dashboard Initialization Error:',
                    error,
                );

                if (isMounted) {
                    setLoading(false);
                }
            }
        };


        initializeData();

        const now = new Date();

        setCurrentDate(
            now.toLocaleDateString('en-GB', {
                weekday: 'long',
                day: '2-digit',
                month: 'short',
                year: 'numeric',
            }),
        );


        const updateTimeState = () => {
            const nowTime = new Date();

            const hours = nowTime.getHours();
            const minutes = nowTime.getMinutes();

            const formattedMinutes = minutes
                .toString()
                .padStart(2, '0');

            const ampm = hours >= 12 ? 'PM' : 'AM';

            const formattedHours = (
                hours % 12 ||
                12
            )
                .toString()
                .padStart(2, '0');

            if (isMounted) {
                setCurrentTime(
                    `${formattedHours}:${formattedMinutes} ${ampm}`,
                );

                setGreeting(
                    getDynamicGreeting(),
                );
            }
        };


        updateTimeState();

        const timeTimer = setInterval(updateTimeState, 60000);
        const midnightTimer = setInterval(checkMidnightReset, 60000);

        return () => {
            isMounted = false;

            clearInterval(timeTimer);
            clearInterval(midnightTimer);
        };

    }, []);


    /* =====================================================
       CUSTOM DATE SELECTION
    ===================================================== */

    const openDateModal = type => {
        const selectedDate =
            type === 'START'
                ? graphStartDate
                : graphEndDate;

        setDateSelectionType(type);

        setTempDay(
            String(selectedDate.getDate()).padStart(2, '0'),
        );

        setTempMonth(
            String(selectedDate.getMonth() + 1).padStart(2, '0'),
        );

        setTempYear(
            String(selectedDate.getFullYear()),
        );

        setDateModalVisible(true);
    };


    const saveSelectedDate = () => {
        const day = Number(tempDay);
        const month = Number(tempMonth);
        const year = Number(tempYear);

        if (!day || !month || !year) {
            Alert.alert(
                'Invalid Date',
                'Please enter a complete date.',
            );

            return;
        }

        if (year < 2000 || year > 2100) {
            Alert.alert(
                'Invalid Year',
                'Please enter a valid year.',
            );

            return;
        }

        if (month < 1 || month > 12) {
            Alert.alert(
                'Invalid Month',
                'Month must be between 01 and 12.',
            );

            return;
        }

        const selectedDate = new Date(
            year,
            month - 1,
            day,
        );

        const isValidDate =
            selectedDate.getFullYear() === year &&
            selectedDate.getMonth() === month - 1 &&
            selectedDate.getDate() === day;

        if (!isValidDate) {
            Alert.alert(
                'Invalid Date',
                'Please enter a valid calendar date.',
            );

            return;
        }

        const today = new Date();

        today.setHours(
            23,
            59,
            59,
            999,
        );

        if (selectedDate > today) {
            Alert.alert(
                'Invalid Date',
                'Future dates are not allowed.',
            );

            return;
        }

        if (dateSelectionType === 'START') {
            if (selectedDate > graphEndDate) {
                Alert.alert(
                    'Invalid Date Range',
                    'Start Date cannot be greater than End Date.',
                );

                return;
            }

            setGraphStartDate(selectedDate);
        }

        if (dateSelectionType === 'END') {
            if (selectedDate < graphStartDate) {
                Alert.alert(
                    'Invalid Date Range',
                    'End Date cannot be less than Start Date.',
                );

                return;
            }

            setGraphEndDate(selectedDate);
        }

        setDateModalVisible(false);
    };


    const applyGraphDateFilter = () => {
        if (graphStartDate > graphEndDate) {
            Alert.alert(
                'Invalid Date Range',
                'Start Date cannot be greater than End Date.',
            );

            return;
        }

        fetchLeadGraphData(
            userData,
            graphStartDate,
            graphEndDate,
        );
    };


    /* =====================================================
       VISIT DATA
    ===================================================== */

    const uniqueVisitList = useMemo(() => {
        const uniqueMap = new Map();

        visitList.forEach(item => {
            const cleanName = item?.AccountName
                ? item.AccountName.trim()
                : 'Unknown';

            if (!uniqueMap.has(cleanName)) {
                uniqueMap.set(cleanName, item);
            }
        });

        return Array.from(uniqueMap.values());

    }, [visitList]);


    const pieData = useMemo(() => {
        const counts = {};

        visitList.forEach(item => {
            const locationKey = item?.SiteLocation
                ? item.SiteLocation.split(',')[0].trim()
                : 'Unknown';

            counts[locationKey] =
                (counts[locationKey] || 0) + 1;
        });

        return Object.keys(counts).map(
            (key, index) => ({
                location: key,
                count: counts[key],
                color:
                    CHART_COLORS[
                    index %
                    CHART_COLORS.length
                    ],
            }),
        );

    }, [visitList]);


    const totalVisits = visitList.length;


    const slices = useMemo(() => {
        let cumulativePercent = 0;

        return pieData.map(item => {
            const startPercent = cumulativePercent;

            const percent =
                item.count /
                (totalVisits || 1);

            cumulativePercent += percent;

            const endPercent =
                cumulativePercent;

            return {
                ...item,
                startPercent,
                endPercent,
                percentVal:
                    Math.round(
                        percent *
                        100,
                    ),
                path:
                    getArcPath(
                        startPercent,
                        endPercent,
                        72,
                        44,
                    ),
            };
        });

    }, [pieData, totalVisits]);


    /* =====================================================
       MATURITY PIE DATA
    ===================================================== */

    const maturityChartData = useMemo(() => {
        const maturityMap = new Map();

        maturityData.forEach(item => {
            const level =
                Number(
                    item?.MaturityLevel ||
                    0,
                );

            const currentCount =
                maturityMap.get(level) ||
                0;

            maturityMap.set(
                level,
                currentCount + 1,
            );
        });

        return Array.from(
            maturityMap.entries(),
        )
            .map(
                ([
                    level,
                    count,
                ]) => ({
                    level,
                    count,
                    color:
                        getMaturityColor(
                            level,
                        ),
                }),
            )
            .sort(
                (
                    first,
                    second,
                ) =>
                    second.level -
                    first.level,
            );

    }, [maturityData]);


    const totalMaturityLeads = useMemo(() => {
        return maturityChartData.reduce(
            (
                total,
                item,
            ) =>
                total +
                item.count,
            0,
        );

    }, [maturityChartData]);


    const maturitySlices = useMemo(() => {
        let cumulativePercent = 0;

        return maturityChartData.map(item => {
            const percent =
                item.count /
                (
                    totalMaturityLeads ||
                    1
                );

            const startPercent =
                cumulativePercent;

            cumulativePercent +=
                percent;

            const endPercent =
                cumulativePercent;

            return {
                ...item,
                startPercent,
                endPercent,
                percentage:
                    Math.round(
                        percent *
                        100,
                    ),
                path:
                    getArcPath(
                        startPercent,
                        endPercent,
                        70,
                        42,
                    ),
            };
        });

    }, [
        maturityChartData,
        totalMaturityLeads,
    ]);


    const maximumMonthlyLeadCount = useMemo(() => {
        if (
            monthlyLeadData.length ===
            0
        ) {
            return 1;
        }

        return Math.max(
            ...monthlyLeadData.map(
                item =>
                    Number(
                        item?.LeadCount ||
                        0,
                    ),
            ),
            1,
        );

    }, [monthlyLeadData]);


    /* =====================================================
       CONTACT
    ===================================================== */

    const handleCall = phoneNumber => {
        if (
            phoneNumber &&
            phoneNumber !== 'N/A'
        ) {
            Linking.openURL(
                `tel:${phoneNumber}`,
            ).catch(error => {
                console.error(
                    'Call Error:',
                    error,
                );
            });
        }
    };


    const handleEmail = email => {
        if (
            email &&
            email !== 'N/A'
        ) {
            Linking.openURL(
                `mailto:${email}`,
            ).catch(error => {
                console.error(
                    'Email Error:',
                    error,
                );
            });
        }
    };


    const handleOpenDrawer = () => {
        navigation.dispatch(
            DrawerActions.openDrawer(),
        );
    };


    /* =====================================================
       NAVIGATION
    ===================================================== */

    const submit = async item => {
        if (item.value === 'Attendance') {
            try {
                const [
                    attendanceEndValue,
                    endSavedDate,
                    attendanceCheckValue,
                ] = await Promise.all([
                    AsyncStorage.getItem('AttendanceEnd'),
                    AsyncStorage.getItem('ATTENDANCE_END_DATE'),
                    AsyncStorage.getItem('AttendanceCheck'),
                ]);

                const todayDateString =
                    new Date()
                        .toISOString()
                        .split('T')[0];

                if (
                    attendanceEndValue ===
                    'Day Ended' &&
                    endSavedDate ===
                    todayDateString
                ) {
                    setDayStatus(
                        'DISABLED',
                    );

                } else if (
                    attendanceCheckValue ===
                    'Day already started'
                ) {
                    setDayStatus(
                        'END',
                    );

                } else {
                    setDayStatus(
                        'START',
                    );
                }

                setVisible(true);

            } catch (error) {
                console.error(
                    'Attendance Storage Error:',
                    error,
                );

                setDayStatus('START');
                setVisible(true);
            }

        } else if (
            item.value ===
            'Client Visit Report'
        ) {
            navigation.navigate(
                'Client Visit List',
            );

        } else if (
            item.value ===
            'Master'
        ) {
            openMasterModal();

        } else if (
            item.value ===
            'Lead Sourcing'
        ) {
            openLeadModal();

        } else if (
            item.value ===
            'Reports'
        ) {
            const reportUrl =
                'https://iecrmservice.iecsl.in/Login';

            Linking.openURL(
                reportUrl,
            ).catch(error => {
                console.error(
                    'Report Link Error:',
                    error,
                );
            });

        } else if (
            item.value !==
            'Home'
        ) {
            Alert.alert(
                'Work In Progress',
            );
        }
    };


    const getNavItemIcon = value => {
        switch (value) {
            case 'Home':
                return 'home-outline';

            case 'Attendance':
                return 'calendar-outline';

            case 'Master':
                return 'layers-outline';

            case 'Lead Sourcing':
                return 'people-outline';

            case 'Reports':
                return 'bar-chart-outline';

            default:
                return 'ellipse-outline';
        }
    };


    const handleTabPress = item => {
        setActiveTab(item.value);
        activeScale.setValue(1);

        Animated.sequence([
            Animated.timing(activeScale, {
                toValue: 1.12,
                duration: 70,
                useNativeDriver: true,
            }),
            Animated.timing(activeScale, {
                toValue: 1,
                duration: 80,
                useNativeDriver: true,
            }),
        ]).start();

        submit(item);
    };


    const triggerAvatarBounce = () => {
        Animated.sequence([
            Animated.timing(avatarScale, {
                toValue: 0.94,
                duration: 70,
                useNativeDriver: true,
            }),
            Animated.timing(avatarScale, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();
    };


    /* =====================================================
       GPS
    ===================================================== */

    const ensureGpsEnabled = async () => {
        if (Platform.OS === 'android') {
            const enabled = await isLocationEnabled();
            if (!enabled) {
                Alert.alert('GPS Not Active');
                await promptForEnableLocationIfNeeded();
            }
        }
    };

    const getLastKnownLocation = () => {
        Geolocation.getCurrentPosition(
            async pos => {
                const { latitude, longitude, accuracy } = pos.coords;
                if (accuracy) {
                    setAccuracy(`${Math.round(accuracy)} m`);
                }
                setLocation({ latitude, longitude });
                setMapRegion({
                    latitude,
                    longitude,
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.005,
                });

                try {
                    const geo = await Geocoder.from(latitude, longitude);
                    if (geo.results?.length) {
                        setPlaceName(geo.results[0].formatted_address);
                    }
                } catch { }
            },
            () => { },
            {
                enableHighAccuracy: false,
                maximumAge: 300000,
                timeout: 3000,
            },
        );
    };

    useEffect(() => {
        if (!visible) return;

        let watchId = null;

        const startGps = async () => {
            await ensureGpsEnabled();

            if (Platform.OS === 'android') {
                await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                );
            }

            getLastKnownLocation();

            watchId = Geolocation.watchPosition(
                async position => {
                    const { latitude, longitude, accuracy } = position.coords;
                    if (accuracy) {
                        setAccuracy(`${Math.round(accuracy)} m`);
                    }
                    setLocation({ latitude, longitude });
                    setMapRegion({
                        latitude,
                        longitude,
                        latitudeDelta: 0.005,
                        longitudeDelta: 0.005,
                    });

                    try {
                        const geo = await Geocoder.from(latitude, longitude);
                        if (geo.results?.length) {
                            setPlaceName(geo.results[0].formatted_address);
                        }
                    } catch { }
                },
                error => console.log('GPS ERROR:', error),
                {
                    enableHighAccuracy: false,
                    distanceFilter: 5,
                    interval: 5000,
                    fastestInterval: 3000,
                    maximumAge: 0,
                },
            );
        };

        startGps();

        return () => {
            if (watchId !== null) {
                Geolocation.clearWatch(watchId);
            }
        };
    }, [visible]);


    const triggerRefreshAnimation = () => {
        refreshSpin.setValue(0);

        Animated.timing(refreshSpin, {
            toValue: 1,
            duration: 450,
            easing: Easing.linear,
            useNativeDriver: true,
        }).start();

        getLastKnownLocation();
    };


    const spin =
        refreshSpin.interpolate({
            inputRange: [
                0,
                1,
            ],
            outputRange: [
                '0deg',
                '360deg',
            ],
        });


    useEffect(() => {
        if (!visible) {
            return;
        }

        let watchId = null;
        let active = true;

        const startGps = async () => {
            try {
                await ensureGpsEnabled();

                if (!active) {
                    return;
                }

                if (
                    Platform.OS ===
                    'android'
                ) {
                    const permission =
                        await PermissionsAndroid.request(
                            PermissionsAndroid
                                .PERMISSIONS
                                .ACCESS_FINE_LOCATION,
                        );

                    if (
                        permission !==
                        PermissionsAndroid
                            .RESULTS
                            .GRANTED
                    ) {
                        return;
                    }
                }

                getLastKnownLocation();

                watchId =
                    Geolocation.watchPosition(
                        async position => {
                            if (!active) {
                                return;
                            }

                            const {
                                latitude,
                                longitude,
                                accuracy: gpsAccuracy,
                            } = position.coords;

                            if (gpsAccuracy) {
                                setAccuracy(
                                    `${Math.round(gpsAccuracy)} m`,
                                );
                            }

                            setLocation({
                                latitude,
                                longitude,
                            });

                            setMapRegion({
                                latitude,
                                longitude,
                                latitudeDelta: 0.005,
                                longitudeDelta: 0.005,
                            });

                            try {
                                const geo =
                                    await Geocoder.from(
                                        latitude,
                                        longitude,
                                    );

                                if (
                                    active &&
                                    geo?.results?.length
                                ) {
                                    setPlaceName(
                                        geo.results[0]
                                            .formatted_address,
                                    );
                                }

                            } catch (error) {
                                console.log(
                                    'GPS Geocoder Error:',
                                    error,
                                );
                            }
                        },

                        error => {
                            console.log(
                                'GPS Watch Error:',
                                error,
                            );
                        },

                        {
                            enableHighAccuracy: true,
                            distanceFilter: 5,
                            interval: 5000,
                            fastestInterval: 3000,
                            maximumAge: 0,
                        },
                    );

            } catch (error) {
                console.log(
                    'GPS Start Error:',
                    error,
                );
            }
        };

        startGps();

        return () => {
            active = false;

            if (watchId !== null) {
                Geolocation.clearWatch(
                    watchId,
                );
            }
        };

    }, [visible]);


    /* =====================================================
       START DAY
    ===================================================== */

    const startDay = async () => {
        try {
            const userDataString =
                await AsyncStorage.getItem(
                    'UserData',
                );

            if (!userDataString) {
                Alert.alert(
                    'User data not found. Please login again.',
                );

                return;
            }

            const user =
                JSON.parse(
                    userDataString,
                );

            if (
                !location.latitude ||
                !location.longitude
            ) {
                Alert.alert(
                    'Location not available. Please wait for GPS.',
                );

                return;
            }

            const payload = {
                IDUser: user.IDUser,
                StartLat: Number(location.latitude),
                StartLong: Number(location.longitude),
                StartLocation: placeName || '',
                DeviceID: device || '',
            };

            const response =
                await fetch(
                    `${BASE_URL}Attendance/Day/Start?HexKey=${user.CompanyHexKey}`,
                    {
                        method: 'POST',
                        headers: {
                            Accept:
                                'application/json',
                            'Content-Type':
                                'application/json',
                        },
                        body:
                            JSON.stringify(
                                payload,
                            ),
                    },
                );

            const result =
                await response.json();

            if (
                result?.Message ===
                'Day already started' ||
                result?.Status ===
                'SUCCESS'
            ) {
                await AsyncStorage.setItem(
                    'AttendanceCheck',
                    'Day already started',
                );

                const {
                    IDDay,
                    StartDate,
                } =
                    result?.Data ||
                    {};

                const todayKey =
                    new Date()
                        .toISOString()
                        .split('T')[0];

                const dayInfo = {
                    IDDay:
                        IDDay ||
                        idDay,
                    StartDate,
                    StartDateOnly:
                        todayKey,
                };

                await AsyncStorage.multiSet([
                    [
                        'DAY_STARTED',
                        'true',
                    ],
                    [
                        'DAY_INFO',
                        JSON.stringify(
                            dayInfo,
                        ),
                    ],
                ]);

                if (IDDay) {
                    setIdDay(
                        IDDay,
                    );
                }

                setDayStatus(
                    'END',
                );

                Alert.alert(
                    'Success',
                    result?.Message ||
                    'Day started successfully',
                );

                setVisible(false);

            } else {
                Alert.alert(
                    'Failed',
                    result?.Message ||
                    'Unable to start day',
                );
            }

        } catch (error) {
            console.log(
                'START DAY ERROR:',
                error,
            );

            Alert.alert(
                'Error',
                'Something went wrong while starting day.',
            );
        }
    };


    /* =====================================================
       END DAY (FIXED: Method set to POST)
    ===================================================== */

    const endDay = async () => {
        try {
            const [
                userDataString,
                dayInfoString,
            ] = await Promise.all([
                AsyncStorage.getItem('UserData'),
                AsyncStorage.getItem('DAY_INFO'),
            ]);

            if (!userDataString) {
                Alert.alert(
                    'User data not found. Please login again.',
                );

                return;
            }

            const user =
                JSON.parse(
                    userDataString,
                );

            const dayInfo =
                dayInfoString
                    ? JSON.parse(
                        dayInfoString,
                    )
                    : {};

            const payload = {
                DeviceID:
                    device ||
                    '',
                EndLat:
                    Number(
                        location.latitude,
                    ),
                EndLocation:
                    placeName ||
                    '',
                EndLong:
                    Number(
                        location.longitude,
                    ),
                IDDAY:
                    idDay ||
                    dayInfo?.IDDay ||
                    0,
                IDUser:
                    user.IDUser,
            };

            const response =
                await fetch(
                    `${BASE_URL}Attendance/Day/End?HexKey=${user.CompanyHexKey}`,
                    {
                        method: 'POST',
                        headers: {
                            Accept:
                                'application/json',
                            'Content-Type':
                                'application/json',
                        },
                        body:
                            JSON.stringify(
                                payload,
                            ),
                    },
                );

            const result =
                await response.json();

            if (
                result?.Status ===
                'SUCCESS'
            ) {
                const todayDateString =
                    new Date()
                        .toISOString()
                        .split('T')[0];

                await AsyncStorage.multiSet([
                    [
                        'AttendanceEnd',
                        'Day Ended',
                    ],
                    [
                        'ATTENDANCE_END_DATE',
                        todayDateString,
                    ],
                ]);

                setDayStatus(
                    'DISABLED',
                );

                Alert.alert(
                    'Success',
                    result?.Message ||
                    'Day ended successfully',
                );

                setVisible(false);

            } else {
                Alert.alert(
                    'Failed',
                    result?.Message ||
                    'Unable to end day',
                );
            }

        } catch (error) {
            console.log(
                'END DAY ERROR:',
                error,
            );

            Alert.alert(
                'Error',
                'Something went wrong while ending day.',
            );
        }
    };


    /* =====================================================
       BACK BUTTON
    ===================================================== */

    useFocusEffect(
        useCallback(() => {
            const backAction = () => {
                showAnimatedAlert(
                    'Hold on!',
                    'Do you want to Exit?',
                    'help-circle-outline',
                    '#E53935',
                    () =>
                        BackHandler.exitApp(),
                    true,
                    'YES',
                    'Cancel',
                );

                return true;
            };

            const backHandler =
                BackHandler.addEventListener(
                    'hardwareBackPress',
                    backAction,
                );

            return () =>
                backHandler.remove();

        }, []),
    );


    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator
                    size="large"
                    color="#4F46E5"
                />

                <Text style={styles.loaderText}>
                    Loading Dashboard...
                </Text>
            </View>
        );
    }


    const userEmail =
        userData?.CompanyEmail ||
        userData?.Email;

    const userPhone =
        userData?.UserMobile;


    return (
        <ImageBackground
            source={BACKGROUND_IMAGE}
            style={styles.backgroundImage}
            resizeMode="cover"
        >
            <StatusBar
                barStyle="dark-content"
                backgroundColor={
                    Platform.OS === 'android'
                        ? '#FFFFFF'
                        : 'transparent'
                }
                translucent={
                    Platform.OS === 'ios'
                }
            />


            <View style={styles.container}>
                <View style={styles.innerContainer}>
                    <ScrollView
                        style={{ flex: 1 }}
                        contentContainerStyle={[
                            styles.scrollContent,
                            {
                                paddingTop: Math.max(insets.top, 8),
                                paddingBottom:
                                    100 +
                                    Math.max(
                                        insets.bottom,
                                        16,
                                    ),
                            },
                        ]}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        overScrollMode="never"
                    >
                        {/* HEADER */}

                        <View style={styles.header}>
                            <TouchableOpacity
                                onPress={handleOpenDrawer}
                                hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                                activeOpacity={0.6}
                            >
                                <Ionicons name="menu-outline" size={30} color="#1E293B" />
                            </TouchableOpacity>

                            <Text style={styles.headerTitle}>Dashboard</Text>

                            <TouchableOpacity style={styles.notificationBtn} activeOpacity={0.7}>
                                <Ionicons name="notifications-outline" size={24} color="#1E293B" />
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>0</Text>
                                </View>
                            </TouchableOpacity>
                        </View>


                        {/* PROFILE */}

                        <View style={styles.profileCard}>
                            <View style={styles.profileInfoContainer}>
                                <View style={styles.greetingHeaderRow}>
                                    <Text style={styles.welcomeSub}>
                                        Welcome,
                                    </Text>

                                    <View style={styles.activePill}>
                                        <View style={styles.activeDot} />

                                        <Text style={styles.activeText}>
                                            Active
                                        </Text>
                                    </View>
                                </View>

                                <Text
                                    style={styles.userName}
                                    numberOfLines={1}
                                >
                                    {userData?.UserFullName || empName || 'User'} 👋
                                </Text>

                                <View style={styles.roleBadgeContainer}>
                                    <Ionicons
                                        name="person-outline"
                                        size={12}
                                        color="#2563EB"
                                    />

                                    <Text style={styles.roleBadgeText}>
                                        {userData?.UserType || 'ADMIN'}
                                    </Text>
                                </View>

                                <TouchableOpacity
                                    style={styles.infoRow}
                                    activeOpacity={0.75}
                                    onPress={() =>
                                        handleEmail(
                                            userEmail,
                                        )
                                    }
                                >
                                    <Ionicons
                                        name="mail-outline"
                                        size={15}
                                        color="#3B82F6"
                                    />

                                    <Text
                                        style={styles.infoRowText}
                                        numberOfLines={1}
                                    >
                                        {userEmail || 'N/A'}
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.infoRow}
                                    activeOpacity={0.75}
                                    onPress={() =>
                                        handleCall(
                                            userPhone,
                                        )
                                    }
                                >
                                    <Ionicons
                                        name="call-outline"
                                        size={15}
                                        color="#3B82F6"
                                    />

                                    <Text
                                        style={styles.infoRowText}
                                        numberOfLines={1}
                                    >
                                        {userPhone || 'N/A'}
                                    </Text>
                                </TouchableOpacity>

                                <View style={styles.clockRow}>
                                    <Ionicons
                                        name="time-outline"
                                        size={13}
                                        color="#059669"
                                    /> 

                                    <LiveDateTimeText />
                                </View>
                            </View>


                            <TouchableOpacity
                                onPress={triggerAvatarBounce}
                                activeOpacity={0.9}
                            >
                                <Animated.View
                                    style={[
                                        styles.avatarFrame,
                                        {
                                            transform: [
                                                {
                                                    scale:
                                                        avatarScale,
                                                },
                                            ],
                                        },
                                    ]}
                                >
                                    <Image
                                        source={{
                                            uri:
                                                getUserAvatar(
                                                    userData?.UserGender,
                                                ),
                                        }}
                                        style={styles.avatarImage}
                                    />
                                </Animated.View>
                            </TouchableOpacity>
                        </View>


                        {/* =================================================
                            LEAD ANALYTICS
                        ================================================= */}

                        <View style={styles.leadAnalyticsContainer}>
                            <View style={styles.leadAnalyticsHeader}>
                                <View style={styles.analyticsTitleRow}>
                                    <View style={styles.analyticsTitleIcon}>
                                        <Ionicons
                                            name="analytics-outline"
                                            size={20}
                                            color="#4F46E5"
                                        />
                                    </View>

                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.sectionTitle}>
                                            Lead Analytics
                                        </Text>

                                        <Text style={styles.graphSub}>
                                            Maturity and monthly lead performance
                                        </Text>
                                    </View>
                                </View>

                                <TouchableOpacity
                                    style={styles.refreshChartButton}
                                    activeOpacity={0.7}
                                    onPress={() =>
                                        fetchLeadGraphData(
                                            userData,
                                            graphStartDate,
                                            graphEndDate,
                                        )
                                    }
                                >
                                    <Ionicons
                                        name="refresh-outline"
                                        size={18}
                                        color="#2563EB"
                                    />
                                </TouchableOpacity>
                            </View>


                            {/* DATE FILTER */}

                            <View style={styles.analyticsFilterCard}>
                                <View style={styles.filterHeaderRow}>
                                    <View style={styles.filterHeaderLeft}>
                                        <Ionicons
                                            name="calendar-outline"
                                            size={16}
                                            color="#4F46E5"
                                        />

                                        <Text style={styles.filterTitle}>
                                            Analysis Period
                                        </Text>
                                    </View>

                                    <Text style={styles.filterRangeText}>
                                        {formatDisplayDate(graphStartDate)}
                                        {' - '}
                                        {formatDisplayDate(graphEndDate)}
                                    </Text>
                                </View>


                                <View style={styles.dateFilterRow}>
                                    <TouchableOpacity
                                        style={styles.dateInputButton}
                                        activeOpacity={0.75}
                                        onPress={() =>
                                            openDateModal(
                                                'START',
                                            )
                                        }
                                    >
                                        <View>
                                            <Text style={styles.dateInputLabel}>
                                                START DATE
                                            </Text>

                                            <Text style={styles.dateInputValue}>
                                                {formatDisplayDate(
                                                    graphStartDate,
                                                )}
                                            </Text>
                                        </View>

                                        <Ionicons
                                            name="calendar-clear-outline"
                                            size={18}
                                            color="#64748B"
                                        />
                                    </TouchableOpacity>


                                    <View style={styles.dateArrowContainer}>
                                        <Ionicons
                                            name="arrow-forward"
                                            size={16}
                                            color="#94A3B8"
                                        />
                                    </View>


                                    <TouchableOpacity
                                        style={styles.dateInputButton}
                                        activeOpacity={0.75}
                                        onPress={() =>
                                            openDateModal(
                                                'END',
                                            )
                                        }
                                    >
                                        <View>
                                            <Text style={styles.dateInputLabel}>
                                                END DATE
                                            </Text>

                                            <Text style={styles.dateInputValue}>
                                                {formatDisplayDate(
                                                    graphEndDate,
                                                )}
                                            </Text>
                                        </View>

                                        <Ionicons
                                            name="calendar-clear-outline"
                                            size={18}
                                            color="#64748B"
                                        />
                                    </TouchableOpacity>
                                </View>


                                <TouchableOpacity
                                    style={styles.applyFilterButton}
                                    activeOpacity={0.85}
                                    onPress={applyGraphDateFilter}
                                >
                                    <Ionicons
                                        name="options-outline"
                                        size={16}
                                        color="#FFFFFF"
                                    />

                                    <Text style={styles.applyFilterText}>
                                        Apply Date Range
                                    </Text>
                                </TouchableOpacity>
                            </View>


                            {graphLoading ? (
                                <View style={styles.graphLoadingContainer}>
                                    <ActivityIndicator
                                        size="small"
                                        color="#4F46E5"
                                    />

                                    <Text style={styles.graphLoadingText}>
                                        Updating analytics...
                                    </Text>
                                </View>

                            ) : graphError ? (
                                <View style={styles.graphErrorContainer}>
                                    <Ionicons
                                        name="alert-circle-outline"
                                        size={22}
                                        color="#EF4444"
                                    />

                                    <Text style={styles.graphErrorText}>
                                        {graphError}
                                    </Text>

                                    <TouchableOpacity
                                        activeOpacity={0.7}
                                        onPress={() =>
                                            fetchLeadGraphData(
                                                userData,
                                                graphStartDate,
                                                graphEndDate,
                                            )
                                        }
                                    >
                                        <Text style={styles.retryText}>
                                            Retry
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                            ) : (
                                <>
                                    {/* MATURITY */}

                                    <Animated.View
                                        style={[
                                            styles.analyticsChartCard,
                                            {
                                                opacity:
                                                    leadGraphAnim,
                                                transform: [
                                                    {
                                                        translateY:
                                                            leadGraphAnim.interpolate({
                                                                inputRange: [0, 1],
                                                                outputRange: [12, 0],
                                                            }),
                                                    },
                                                ],
                                            },
                                        ]}
                                    >
                                        <View style={styles.chartCardHeader}>
                                            <View>
                                                <Text style={styles.chartCardTitle}>
                                                    Lead Maturity
                                                </Text>

                                                <Text style={styles.chartCardSubtitle}>
                                                    Distribution by maturity level
                                                </Text>
                                            </View>

                                            <View style={styles.totalLeadBadge}>
                                                <Text style={styles.totalLeadBadgeNumber}>
                                                    {totalMaturityLeads}
                                                </Text>

                                                <Text style={styles.totalLeadBadgeLabel}>
                                                    Leads
                                                </Text>
                                            </View>
                                        </View>


                                        {maturitySlices.length === 0 ? (
                                            <View style={styles.analyticsEmptyContainer}>
                                                <Ionicons
                                                    name="pie-chart-outline"
                                                    size={30}
                                                    color="#CBD5E1"
                                                />

                                                <Text style={styles.analyticsEmptyText}>
                                                    No maturity data available
                                                </Text>
                                            </View>
                                        ) : (
                                            <View style={styles.maturityChartRow}>
                                                <Svg
                                                    height={170}
                                                    width={170}
                                                    viewBox="-85 -85 170 170"
                                                >
                                                    {maturitySlices.map(
                                                        (
                                                            slice,
                                                            index,
                                                        ) => {
                                                            const isSelected =
                                                                selectedMaturityIndex === index;

                                                            return (
                                                                <Path
                                                                    key={`maturity-${slice.level}-${index}`}
                                                                    d={slice.path}
                                                                    fill={slice.color}
                                                                    opacity={
                                                                        selectedMaturityIndex === null ||
                                                                            isSelected
                                                                            ? 1
                                                                            : 0.3
                                                                    }
                                                                    transform={
                                                                        isSelected
                                                                            ? 'scale(1.05)'
                                                                            : 'scale(1)'
                                                                    }
                                                                    onPress={() =>
                                                                        setSelectedMaturityIndex(
                                                                            isSelected
                                                                                ? null
                                                                                : index,
                                                                        )
                                                                    }
                                                                />
                                                            );
                                                        },
                                                    )}

                                                    <SvgText
                                                        x="0"
                                                        y="-5"
                                                        textAnchor="middle"
                                                        fontSize="20"
                                                        fontWeight="800"
                                                        fill="#0F172A"
                                                    >
                                                        {selectedMaturityIndex !== null
                                                            ? maturitySlices[
                                                                selectedMaturityIndex
                                                            ]?.count
                                                            : totalMaturityLeads}
                                                    </SvgText>

                                                    <SvgText
                                                        x="0"
                                                        y="13"
                                                        textAnchor="middle"
                                                        fontSize="9"
                                                        fontWeight="600"
                                                        fill="#64748B"
                                                    >
                                                        {selectedMaturityIndex !== null
                                                            ? `${maturitySlices[
                                                                selectedMaturityIndex
                                                            ]?.level}% Maturity`
                                                            : 'Total Leads'}
                                                    </SvgText>
                                                </Svg>


                                                <View style={styles.maturityLegend}>
                                                    {maturitySlices.map(
                                                        (
                                                            item,
                                                            index,
                                                        ) => {
                                                            const isSelected =
                                                                selectedMaturityIndex === index;

                                                            return (
                                                                <TouchableOpacity
                                                                    key={`maturity-legend-${item.level}-${index}`}
                                                                    style={[
                                                                        styles.maturityLegendItem,
                                                                        isSelected &&
                                                                        styles.maturityLegendSelected,
                                                                    ]}
                                                                    activeOpacity={0.7}
                                                                    onPress={() =>
                                                                        setSelectedMaturityIndex(
                                                                            isSelected
                                                                                ? null
                                                                                : index,
                                                                        )
                                                                    }
                                                                >
                                                                    <View
                                                                        style={[
                                                                            styles.maturityLegendDot,
                                                                            {
                                                                                backgroundColor:
                                                                                    item.color,
                                                                            },
                                                                        ]}
                                                                    />

                                                                    <View style={{ flex: 1 }}>
                                                                        <Text style={styles.maturityLegendTitle}>
                                                                            {item.level}% Maturity
                                                                        </Text>

                                                                        <Text style={styles.maturityLegendSub}>
                                                                            {item.count}{' '}
                                                                            {item.count === 1
                                                                                ? 'Lead'
                                                                                : 'Leads'}
                                                                        </Text>
                                                                    </View>

                                                                    <Text style={styles.maturityPercentage}>
                                                                        {item.percentage}%
                                                                    </Text>
                                                                </TouchableOpacity>
                                                            );
                                                        },
                                                    )}
                                                </View>
                                            </View>
                                        )}
                                    </Animated.View>


                                    {/* MONTHLY LEADS */}

                                    <Animated.View
                                        style={[
                                            styles.analyticsChartCard,
                                            {
                                                opacity:
                                                    leadGraphAnim,
                                                transform: [
                                                    {
                                                        translateY:
                                                            leadGraphAnim.interpolate({
                                                                inputRange: [0, 1],
                                                                outputRange: [15, 0],
                                                            }),
                                                    },
                                                ],
                                            },
                                        ]}
                                    >
                                        <View style={styles.chartCardHeader}>
                                            <View>
                                                <Text style={styles.chartCardTitle}>
                                                    Monthly Lead Trend
                                                </Text>

                                                <Text style={styles.chartCardSubtitle}>
                                                    Lead generation across selected period
                                                </Text>
                                            </View>

                                            <View style={styles.monthCountBadge}>
                                                <Ionicons
                                                    name="calendar-outline"
                                                    size={13}
                                                    color="#4F46E5"
                                                />

                                                <Text style={styles.monthCountText}>
                                                    {monthlyLeadData.length} Months
                                                </Text>
                                            </View>
                                        </View>


                                        {monthlyLeadData.length === 0 ? (
                                            <View style={styles.analyticsEmptyContainer}>
                                                <Ionicons
                                                    name="bar-chart-outline"
                                                    size={30}
                                                    color="#CBD5E1"
                                                />

                                                <Text style={styles.analyticsEmptyText}>
                                                    No monthly lead data available
                                                </Text>
                                            </View>
                                        ) : (
                                            <ScrollView
                                                horizontal
                                                nestedScrollEnabled
                                                showsHorizontalScrollIndicator={false}
                                                contentContainerStyle={styles.barChartScrollContent}
                                            >
                                                {monthlyLeadData.map(
                                                    (
                                                        item,
                                                        index,
                                                    ) => {
                                                        const leadCount =
                                                            Number(
                                                                item?.LeadCount ||
                                                                0,
                                                            );

                                                        const maximumHeight =
                                                            145;

                                                        const barHeight =
                                                            Math.max(
                                                                8,
                                                                (
                                                                    leadCount /
                                                                    maximumMonthlyLeadCount
                                                                ) *
                                                                maximumHeight,
                                                            );

                                                        const barColor =
                                                            CHART_COLORS[
                                                            index %
                                                            CHART_COLORS.length
                                                            ];

                                                        return (
                                                            <View
                                                                key={`${item.MonthDays}-${index}`}
                                                                style={styles.barItemContainer}
                                                            >
                                                                <View style={styles.barValueBubble}>
                                                                    <Text style={styles.barValueText}>
                                                                        {leadCount}
                                                                    </Text>
                                                                </View>

                                                                <View style={styles.barArea}>
                                                                    <View style={styles.barBackground}>
                                                                        <View
                                                                            style={[
                                                                                styles.barFill,
                                                                                {
                                                                                    height:
                                                                                        barHeight,
                                                                                    backgroundColor:
                                                                                        barColor,
                                                                                },
                                                                            ]}
                                                                        />
                                                                    </View>
                                                                </View>

                                                                <Text
                                                                    style={styles.barMonthText}
                                                                    numberOfLines={1}
                                                                >
                                                                    {item.MonthDays}
                                                                </Text>
                                                            </View>
                                                        );
                                                    },
                                                )}
                                            </ScrollView>
                                        )}
                                    </Animated.View>
                                </>
                            )}
                        </View>


                        {/* CLIENT VISITS */}

                        <View style={styles.listContainer}>
                            <View style={styles.sectionHeaderRow}>
                                <Text style={styles.sectionTitle}>
                                    Client Visit List
                                </Text>

                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    onPress={() =>
                                        navigation.navigate(
                                            'Client Visit List',
                                        )
                                    }
                                >
                                    <Text style={styles.seeAllText}>
                                        See All
                                    </Text>
                                </TouchableOpacity>
                            </View>


                            {uniqueVisitList.length === 0 ? (
                                <View style={styles.emptyClientCard}>
                                    <Ionicons
                                        name="people-outline"
                                        size={24}
                                        color="#94A3B8"
                                    />

                                    <Text style={styles.emptyClientText}>
                                        No client visits found.
                                    </Text>
                                </View>
                            ) : (
                                uniqueVisitList
                                    .slice(0, 5)
                                    .map(item => {
                                        const isSelected =
                                            selectedVisit?.IDVisit ===
                                            item.IDVisit;

                                        return (
                                            <TouchableOpacity
                                                key={String(
                                                    item.IDVisit,
                                                )}
                                                style={[
                                                    styles.clientCard,
                                                    isSelected &&
                                                    styles.selectedClientCard,
                                                ]}
                                                activeOpacity={0.8}
                                                onPress={() =>
                                                    setSelectedVisit(
                                                        item,
                                                    )
                                                }
                                            >
                                                <DashboardClientAvatar
                                                    filePath={item.FilePath}
                                                />

                                                <View style={styles.clientInfo}>
                                                    <Text
                                                        style={styles.clientName}
                                                        numberOfLines={1}
                                                    >
                                                        {item.AccountName}
                                                    </Text>

                                                    <Text
                                                        style={styles.clientSubtitle}
                                                        numberOfLines={1}
                                                    >
                                                        Client Account
                                                    </Text>

                                                    <View style={styles.locationRow}>
                                                        <Ionicons
                                                            name="location-sharp"
                                                            size={13}
                                                            color="#3B82F6"
                                                        />

                                                        <Text
                                                            style={styles.locationText}
                                                            numberOfLines={1}
                                                        >
                                                            {item.SiteLocation}
                                                        </Text>
                                                    </View>
                                                </View>


                                                <View style={styles.actionColumn}>
                                                    <TouchableOpacity
                                                        style={styles.callCircle}
                                                        activeOpacity={0.7}
                                                        onPress={() =>
                                                            handleCall(
                                                                item.AccountPhone,
                                                            )
                                                        }
                                                    >
                                                        <Ionicons
                                                            name="call-sharp"
                                                            size={16}
                                                            color="#3B82F6"
                                                        />
                                                    </TouchableOpacity>

                                                    <View style={styles.bottomStatusRow}>
                                                        <View style={styles.visitedTag}>
                                                            <Ionicons
                                                                name="checkmark-sharp"
                                                                size={11}
                                                                color="#16A34A"
                                                            />

                                                            <Text style={styles.visitedText}>
                                                                Visited
                                                            </Text>
                                                        </View>

                                                        <Ionicons
                                                            name="chevron-forward"
                                                            size={14}
                                                            color="#94A3B8"
                                                            style={{ marginLeft: 4 }}
                                                        />
                                                    </View>
                                                </View>
                                            </TouchableOpacity>
                                        );
                                    })
                            )}
                        </View>
                    </ScrollView>


                    {/* BOTTOM NAV */}

                    <View
                        style={[
                            styles.bottomNavContainer,
                            {
                                bottom:
                                    Math.max(
                                        insets.bottom,
                                        10,
                                    ),
                            },
                        ]}
                    >
                        <View style={styles.navCard}>
                            {data.map(
                                (
                                    item,
                                    index,
                                ) => {
                                    const isActive =
                                        activeTab === item.value;

                                    const iconName =
                                        getNavItemIcon(
                                            item.value,
                                        );

                                    const displayLabel =
                                        item.value === 'Lead Sourcing'
                                            ? 'Leads'
                                            : item.value;

                                    return (
                                        <React.Fragment
                                            key={item.value}
                                        >
                                            {index > 0 && (
                                                <View style={styles.navDivider} />
                                            )}

                                            <TouchableOpacity
                                                style={styles.navItem}
                                                activeOpacity={0.7}
                                                onPress={() =>
                                                    handleTabPress(
                                                        item,
                                                    )
                                                }
                                            >
                                                <Animated.View
                                                    style={[
                                                        styles.navItemContent,
                                                        {
                                                            transform: [
                                                                {
                                                                    scale:
                                                                        isActive
                                                                            ? activeScale
                                                                            : 1,
                                                                },
                                                            ],
                                                        },
                                                    ]}
                                                >
                                                    <Ionicons
                                                        name={iconName}
                                                        size={20}
                                                        color={
                                                            isActive
                                                                ? '#7C3AED'
                                                                : '#8B949E'
                                                        }
                                                    />

                                                    <Text
                                                        style={[
                                                            styles.navText,
                                                            isActive &&
                                                            styles.activeNavText,
                                                        ]}
                                                        numberOfLines={1}
                                                    >
                                                        {displayLabel}
                                                    </Text>
                                                </Animated.View>
                                            </TouchableOpacity>
                                        </React.Fragment>
                                    );
                                },
                            )}

                            <View style={styles.navDivider} />

                            <TouchableOpacity
                                style={styles.endFabContainer}
                                activeOpacity={0.85}
                                onPress={() =>
                                    showAnimatedAlert(
                                        'Work in Progress',
                                        'Working on this feature.',
                                        'construct-outline',
                                        '#6366F1',
                                    )
                                }
                            >
                                <View style={styles.endFab}>
                                    <Ionicons
                                        name="add"
                                        size={24}
                                        color="#FFFFFF"
                                    />
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>


                {/* ALERT */}

                <AnimatedAlert
                    visible={alertConfig.visible}
                    title={alertConfig.title}
                    message={alertConfig.message}
                    iconName={alertConfig.iconName}
                    iconColor={alertConfig.iconColor}
                    buttonText={alertConfig.confirmText}
                    isConfirmation={alertConfig.isConfirmation}
                    confirmText={alertConfig.confirmText}
                    cancelText={alertConfig.cancelText}
                    onConfirm={alertConfig.onConfirm}
                    onClose={() =>
                        setAlertConfig(previous => ({
                            ...previous,
                            visible: false,
                        }))
                    }
                />


                {/* =================================================
                    DATE MODAL
                ================================================= */}

                <Modal
                    visible={dateModalVisible}
                    transparent
                    animationType="fade"
                    statusBarTranslucent
                    onRequestClose={() =>
                        setDateModalVisible(
                            false,
                        )
                    }
                >
                    <View style={styles.dateModalOverlay}>
                        <View style={styles.dateModalCard}>
                            <View style={styles.dateModalHeader}>
                                <View style={styles.dateModalIcon}>
                                    <Ionicons
                                        name="calendar-outline"
                                        size={21}
                                        color="#4F46E5"
                                    />
                                </View>

                                <View style={{ flex: 1 }}>
                                    <Text style={styles.dateModalTitle}>
                                        {dateSelectionType === 'START'
                                            ? 'Select Start Date'
                                            : 'Select End Date'}
                                    </Text>

                                    <Text style={styles.dateModalSubtitle}>
                                        Enter date in DD / MM / YYYY
                                    </Text>
                                </View>

                                <TouchableOpacity
                                    style={styles.dateModalClose}
                                    activeOpacity={0.7}
                                    onPress={() =>
                                        setDateModalVisible(
                                            false,
                                        )
                                    }
                                >
                                    <Ionicons
                                        name="close"
                                        size={18}
                                        color="#64748B"
                                    />
                                </TouchableOpacity>
                            </View>


                            <View style={styles.dateFieldsRow}>
                                <View style={styles.dateFieldContainer}>
                                    <Text style={styles.dateFieldLabel}>
                                        DAY
                                    </Text>

                                    <TextInput
                                        value={tempDay}
                                        keyboardType="number-pad"
                                        maxLength={2}
                                        placeholder="DD"
                                        placeholderTextColor="#94A3B8"
                                        onChangeText={text =>
                                            setTempDay(
                                                text.replace(
                                                    /[^0-9]/g,
                                                    '',
                                                ),
                                            )
                                        }
                                        style={styles.dateFieldInput}
                                    />
                                </View>

                                <Text style={styles.dateSeparator}>
                                    /
                                </Text>

                                <View style={styles.dateFieldContainer}>
                                    <Text style={styles.dateFieldLabel}>
                                        MONTH
                                    </Text>

                                    <TextInput
                                        value={tempMonth}
                                        keyboardType="number-pad"
                                        maxLength={2}
                                        placeholder="MM"
                                        placeholderTextColor="#94A3B8"
                                        onChangeText={text =>
                                            setTempMonth(
                                                text.replace(
                                                    /[^0-9]/g,
                                                    '',
                                                ),
                                            )
                                        }
                                        style={styles.dateFieldInput}
                                    />
                                </View>

                                <Text style={styles.dateSeparator}>
                                    /
                                </Text>

                                <View
                                    style={[
                                        styles.dateFieldContainer,
                                        {
                                            flex: 1.4,
                                        },
                                    ]}
                                >
                                    <Text style={styles.dateFieldLabel}>
                                        YEAR
                                    </Text>

                                    <TextInput
                                        value={tempYear}
                                        keyboardType="number-pad"
                                        maxLength={4}
                                        placeholder="YYYY"
                                        placeholderTextColor="#94A3B8"
                                        onChangeText={text =>
                                            setTempYear(
                                                text.replace(
                                                    /[^0-9]/g,
                                                    '',
                                                ),
                                            )
                                        }
                                        style={styles.dateFieldInput}
                                    />
                                </View>
                            </View>


                            <View style={styles.datePreviewCard}>
                                <Ionicons
                                    name="information-circle-outline"
                                    size={17}
                                    color="#4F46E5"
                                    />

                                <Text style={styles.datePreviewText}>
                                    Selected Date: {tempDay || 'DD'}-{tempMonth || 'MM'}-{tempYear || 'YYYY'}
                                </Text>
                            </View>


                            <View style={styles.dateModalActions}>
                                <TouchableOpacity
                                    style={styles.dateCancelButton}
                                    activeOpacity={0.8}
                                    onPress={() =>
                                        setDateModalVisible(
                                            false,
                                        )
                                    }
                                >
                                    <Text style={styles.dateCancelText}>
                                        Cancel
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.dateSaveButton}
                                    activeOpacity={0.85}
                                    onPress={saveSelectedDate}
                                >
                                    <Ionicons
                                        name="checkmark"
                                        size={17}
                                        color="#FFFFFF"
                                    />

                                    <Text style={styles.dateSaveText}>
                                        Select Date
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>


                {/* =================================================
                    ATTENDANCE MODAL
                ================================================= */}

                <Modal
                    visible={visible}
                    transparent
                    animationType="fade"
                    hardwareAccelerated
                    statusBarTranslucent
                    onRequestClose={() =>
                        setVisible(false)
                    }
                >
                    <View style={attendanceStyles.modalOverlay}>
                        <View style={attendanceStyles.sheetContainer}>
                            <View style={attendanceStyles.sheetHeader}>
                                <View style={attendanceStyles.dragIndicator} />

                                <TouchableOpacity
                                    style={attendanceStyles.closeBtn}
                                    activeOpacity={0.7}
                                    onPress={() =>
                                        setVisible(false)
                                    }
                                >
                                    <Ionicons
                                        name="close"
                                        size={20}
                                        color="#64748B"
                                    />
                                </TouchableOpacity>
                            </View>


                            <ScrollView
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={attendanceStyles.scrollBody}
                                overScrollMode="never"
                            >
                                <Animated.View
                                    style={{
                                        transform: [
                                            {
                                                scale:
                                                    cardScale,
                                            },
                                        ],
                                    }}
                                >
                                    <TouchableOpacity
                                        activeOpacity={0.92}
                                        style={attendanceStyles.timeCard}
                                        onPressIn={() =>
                                            onPressIn(
                                                cardScale,
                                            )
                                        }
                                        onPressOut={() =>
                                            onPressOut(
                                                cardScale,
                                            )
                                        }
                                    >
                                        <View
                                            style={StyleSheet.absoluteFillObject}
                                            pointerEvents="none"
                                        >
                                            <Svg
                                                height="100%"
                                                width="100%"
                                                viewBox="0 0 300 130"
                                            >
                                                <Defs>
                                                    <LinearGradient
                                                        id="cardBgGrad"
                                                        x1="0%"
                                                        y1="0%"
                                                        x2="100%"
                                                        y2="100%"
                                                    >
                                                        <Stop
                                                            offset="0%"
                                                            stopColor="#E0F2FE"
                                                            stopOpacity="1"
                                                        />

                                                        <Stop
                                                            offset="100%"
                                                            stopColor="#BAE6FD"
                                                            stopOpacity="1"
                                                        />
                                                    </LinearGradient>
                                                </Defs>

                                                <Rect
                                                    x="0"
                                                    y="0"
                                                    width="100%"
                                                    height="100%"
                                                    rx="20"
                                                    ry="20"
                                                    fill="url(#cardBgGrad)"
                                                />

                                                <G>
                                                    <Path
                                                        d="M-20,80 C40,40 100,120 160,80 C220,40 280,120 340,80"
                                                        fill="none"
                                                        stroke="rgba(2,132,199,0.18)"
                                                        strokeWidth="2"
                                                    />

                                                    <Path
                                                        d="M-20,95 C40,55 100,135 160,95 C220,55 280,135 340,95"
                                                        fill="none"
                                                        stroke="rgba(56,189,248,0.18)"
                                                        strokeWidth="1.5"
                                                    />
                                                </G>
                                            </Svg>
                                        </View>


                                        <View style={{ zIndex: 2 }}>
                                            <View style={attendanceStyles.timeRow}>
                                                <Text style={attendanceStyles.timeText}>
                                                    {currentTime
                                                        ? currentTime.split(' ')[0]
                                                        : '--:--'}
                                                </Text>

                                                <Text style={attendanceStyles.ampmText}>
                                                    {currentTime
                                                        ? currentTime.split(' ')[1]
                                                        : ''}
                                                </Text>
                                            </View>

                                            <Text style={attendanceStyles.dateText}>
                                                {currentDate}
                                            </Text>

                                            <Text style={attendanceStyles.greetingText}>
                                                {greeting}, {empName}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                </Animated.View>


                                <View style={attendanceStyles.locationCard}>
                                    <View style={attendanceStyles.locationHeaderRow}>
                                        <Text style={attendanceStyles.locTitle}>
                                            Current Location
                                        </Text>

                                        <View style={attendanceStyles.livePill}>
                                            <View style={attendanceStyles.pulseDot} />

                                            <Text style={attendanceStyles.liveText}>
                                                GPS Active
                                            </Text>
                                        </View>
                                    </View>

                                    <Text
                                        style={attendanceStyles.addressText}
                                        numberOfLines={2}
                                    >
                                        {placeName ||
                                            'Fetching current location...'}
                                    </Text>

                                    <View style={attendanceStyles.accuracyRow}>
                                        <Text style={attendanceStyles.accuracyText}>
                                            Accuracy : {accuracy}
                                        </Text>

                                        <TouchableOpacity
                                            style={attendanceStyles.refreshBtn}
                                            activeOpacity={0.7}
                                            onPress={triggerRefreshAnimation}
                                        >
                                            <Animated.View
                                                style={{
                                                    transform: [
                                                        {
                                                            rotate:
                                                                spin,
                                                        },
                                                    ],
                                                }}
                                            >
                                                <Ionicons
                                                    name="reload"
                                                    size={13}
                                                    color="#0284C7"
                                                />
                                            </Animated.View>

                                            <Text style={attendanceStyles.refreshText}>
                                                Refresh
                                            </Text>
                                        </TouchableOpacity>
                                    </View>

                                    <View style={attendanceStyles.mapContainer}>
                                        <MapView
                                            style={StyleSheet.absoluteFillObject}
                                            region={mapRegion}
                                            loadingEnabled
                                        >
                                            <Marker
                                                coordinate={location}
                                            />

                                            <Circle
                                                center={location}
                                                radius={80}
                                                strokeColor="rgba(2,132,199,0.4)"
                                                fillColor="rgba(56,189,248,0.15)"
                                            />
                                        </MapView>
                                    </View>
                                </View>
                            </ScrollView>


                            <View
                                style={[
                                    attendanceStyles.bottomContainer,
                                    {
                                        paddingBottom: Math.max(
                                            insets.bottom,
                                            16,
                                        ),
                                    },
                                ]}
                            >
                                <Animated.View
                                    style={{
                                        transform: [
                                            {
                                                scale:
                                                    btnScale,
                                            },
                                        ],
                                    }}
                                >
                                    <TouchableOpacity
                                        style={[
                                            attendanceStyles.startBtnWrapper,
                                            dayStatus === 'DISABLED' &&
                                            attendanceStyles.disabledBtnWrapper,
                                        ]}
                                        disabled={
                                            dayStatus ===
                                            'DISABLED'
                                        }
                                        activeOpacity={
                                            dayStatus ===
                                                'DISABLED'
                                                ? 1
                                                : 0.9
                                        }
                                        onPressIn={() => {
                                            if (
                                                dayStatus !==
                                                'DISABLED'
                                            ) {
                                                onPressIn(
                                                    btnScale,
                                                );
                                            }
                                        }}
                                        onPressOut={() => {
                                            if (
                                                dayStatus !==
                                                'DISABLED'
                                            ) {
                                                onPressOut(
                                                    btnScale,
                                                );
                                            }
                                        }}
                                        onPress={
                                            dayStatus ===
                                                'DISABLED'
                                                ? null
                                                : dayStatus ===
                                                    'END'
                                                    ? endDay
                                                    : startDay
                                        }
                                    >
                                        <Svg
                                            height="50"
                                            width="100%"
                                            style={StyleSheet.absoluteFillObject}
                                        >
                                            <Defs>
                                                <LinearGradient
                                                    id="btnGradient"
                                                    x1="0%"
                                                    y1="0%"
                                                    x2="100%"
                                                    y2="0%"
                                                >
                                                    <Stop
                                                        offset="0%"
                                                        stopColor={
                                                            dayStatus === 'DISABLED'
                                                                ? '#94A3B8'
                                                                : dayStatus === 'END'
                                                                    ? '#EF4444'
                                                                    : '#3B82F6'
                                                        }
                                                        stopOpacity="1"
                                                    />

                                                    <Stop
                                                        offset="100%"
                                                        stopColor={
                                                            dayStatus === 'DISABLED'
                                                                ? '#CBD5E1'
                                                                : dayStatus === 'END'
                                                                    ? '#F87171'
                                                                    : '#C084FC'
                                                        }
                                                        stopOpacity="1"
                                                    />
                                                </LinearGradient>
                                            </Defs>

                                            <Rect
                                                x="0"
                                                y="0"
                                                width="100%"
                                                height="100%"
                                                rx="18"
                                                ry="18"
                                                fill="url(#btnGradient)"
                                            />
                                        </Svg>

                                        <Text style={attendanceStyles.startDayText}>
                                            {dayStatus === 'DISABLED'
                                                ? 'Start Day'
                                                : dayStatus === 'END'
                                                    ? 'End Day'
                                                    : 'Start Day'}
                                        </Text>
                                    </TouchableOpacity>
                                </Animated.View>
                            </View>
                        </View>
                    </View>
                </Modal>


                {/* =================================================
                    LEAD MODAL
                ================================================= */}

                <Modal
                    visible={leadModalVisible}
                    transparent
                    animationType="none"
                    hardwareAccelerated
                    statusBarTranslucent
                    onRequestClose={() =>
                        closeLeadModal()
                    }
                >
                    <View style={leadModalStyles.modalOverlay}>
                        <Animated.View
                            style={[
                                StyleSheet.absoluteFillObject,
                                leadModalStyles.backdrop,
                                {
                                    opacity:
                                        backdropOpacity,
                                },
                            ]}
                        >
                            <Pressable
                                style={StyleSheet.absoluteFillObject}
                                onPress={() =>
                                    closeLeadModal()
                                }
                            />
                        </Animated.View>


                        <Animated.View
                            style={[
                                leadModalStyles.sheetContainer,
                                {
                                    paddingBottom:
                                        Math.max(
                                            insets.bottom,
                                            20,
                                        ) + 10,
                                    transform: [
                                        {
                                            translateY:
                                                sheetTranslateY,
                                        },
                                    ],
                                },
                            ]}
                        >
                            <View style={leadModalStyles.dragIndicator} />

                            <View style={leadModalStyles.headerTitleRow}>
                                <View style={leadModalStyles.headerIconContainer}>
                                    <Ionicons
                                        name="git-network-outline"
                                        size={24}
                                        color="#5B5FC7"
                                    />
                                </View>

                                <View
                                    style={{
                                        flex: 1,
                                        marginLeft: 14,
                                    }}
                                >
                                    <Text style={leadModalStyles.headerTitle}>
                                        Lead Source
                                    </Text>

                                    <Text style={leadModalStyles.headerSubtitle}>
                                        Manage lead source data
                                    </Text>
                                </View>

                                <Pressable
                                    onPress={() =>
                                        closeLeadModal()
                                    }
                                    onPressIn={() =>
                                        onPressIn(
                                            closeBtnScale,
                                        )
                                    }
                                    onPressOut={() =>
                                        onPressOut(
                                            closeBtnScale,
                                        )
                                    }
                                >
                                    <Animated.View
                                        style={[
                                            leadModalStyles.closeBtn,
                                            {
                                                transform: [
                                                    {
                                                        scale:
                                                            closeBtnScale,
                                                    },
                                                ],
                                            },
                                        ]}
                                    >
                                        <Ionicons
                                            name="close"
                                            size={18}
                                            color="#64748B"
                                        />
                                    </Animated.View>
                                </Pressable>
                            </View>


                            <Animated.View
                                style={[
                                    leadModalStyles.optionsContainer,
                                    {
                                        opacity:
                                            optionCardsOpacity,
                                    },
                                ]}
                            >
                                <Pressable
                                    onPressIn={() =>
                                        onPressIn(
                                            optionGenerationScale,
                                        )
                                    }
                                    onPressOut={() =>
                                        onPressOut(
                                            optionGenerationScale,
                                        )
                                    }
                                    onPress={() => {
                                        setSelectedLeadOption(
                                            'Generation',
                                        );

                                        closeLeadModal(
                                            () =>
                                                navigation.navigate(
                                                    'Lead Generation',
                                                ),
                                        );
                                    }}
                                >
                                    <Animated.View
                                        style={[
                                            leadModalStyles.optionCard,
                                            {
                                                transform: [
                                                    {
                                                        scale:
                                                            optionGenerationScale,
                                                    },
                                                ],
                                            },
                                        ]}
                                    >
                                        <View
                                            style={[
                                                leadModalStyles.optionIconBox,
                                                {
                                                    backgroundColor:
                                                        '#E0E7FF',
                                                },
                                            ]}
                                        >
                                            <Ionicons
                                                name="flash-outline"
                                                size={22}
                                                color="#4F46E5"
                                            />
                                        </View>

                                        <View style={leadModalStyles.optionTextContainer}>
                                            <Text style={leadModalStyles.optionTitle}>
                                                Lead Generation
                                            </Text>

                                            <Text style={leadModalStyles.optionSubtitle}>
                                                Manage lead generation data
                                            </Text>
                                        </View>

                                        <Ionicons
                                            name="chevron-forward"
                                            size={18}
                                            color="#94A3B8"
                                        />
                                    </Animated.View>
                                </Pressable>


                                <Pressable
                                    onPressIn={() =>
                                        onPressIn(
                                            optionFollowupScale,
                                        )
                                    }
                                    onPressOut={() =>
                                        onPressOut(
                                            optionFollowupScale,
                                        )
                                    }
                                    onPress={() => {
                                        setSelectedLeadOption(
                                            'Followup',
                                        );

                                        closeLeadModal(
                                            () =>
                                                navigation.navigate(
                                                    'Lead Followup',
                                                ),
                                        );
                                    }}
                                >
                                    <Animated.View
                                        style={[
                                            leadModalStyles.optionCard,
                                            {
                                                transform: [
                                                    {
                                                        scale:
                                                            optionFollowupScale,
                                                    },
                                                ],
                                            },
                                        ]}
                                    >
                                        <View
                                            style={[
                                                leadModalStyles.optionIconBox,
                                                {
                                                    backgroundColor:
                                                        '#D1FAE5',
                                                },
                                            ]}
                                        >
                                            <Ionicons
                                                name="sync-outline"
                                                size={22}
                                                color="#10B981"
                                            />
                                        </View>

                                        <View style={leadModalStyles.optionTextContainer}>
                                            <Text style={leadModalStyles.optionTitle}>
                                                Lead Followup
                                            </Text>

                                            <Text style={leadModalStyles.optionSubtitle}>
                                                Manage lead followup data
                                            </Text>
                                        </View>

                                        <Ionicons
                                            name="chevron-forward"
                                            size={18}
                                            color="#94A3B8"
                                        />
                                    </Animated.View>
                                </Pressable>

                                <Pressable
                                    onPressIn={() => onPressIn(optionPendingFollowupScale)}
                                    onPressOut={() => onPressOut(optionPendingFollowupScale)}
                                    onPress={() => {
                                        setSelectedLeadOption('PendingFollowup');

                                        closeLeadModal(() =>
                                            navigation.navigate('Pending Follow Up'),
                                        );
                                    }}
                                >
                                    <Animated.View
                                        style={[
                                            leadModalStyles.optionCard,
                                            {
                                                transform: [
                                                    {
                                                        scale: optionPendingFollowupScale,
                                                    },
                                                ],
                                            },
                                        ]}
                                    >
                                        <View
                                            style={[
                                                leadModalStyles.optionIconBox,
                                                {
                                                    backgroundColor: '#FEF3C7',
                                                },
                                            ]}
                                        >
                                            <Ionicons
                                                name="time-outline"
                                                size={22}
                                                color="#D97706"
                                            />
                                        </View>

                                        <View style={leadModalStyles.optionTextContainer}>
                                            <Text style={leadModalStyles.optionTitle}>
                                                Pending Follow Up
                                            </Text>

                                            <Text style={leadModalStyles.optionSubtitle}>
                                                View and manage pending lead follow-ups
                                            </Text>
                                        </View>

                                        <Ionicons
                                            name="chevron-forward"
                                            size={18}
                                            color="#94A3B8"
                                        />
                                    </Animated.View>
                                </Pressable>
                            </Animated.View>
                        </Animated.View>
                    </View>
                </Modal>


                {/* =================================================
                    MASTER MODAL
                ================================================= */}

                <Modal
                    visible={masterModalVisible}
                    transparent
                    animationType="none"
                    hardwareAccelerated
                    statusBarTranslucent
                    onRequestClose={() =>
                        closeMasterModal()
                    }
                >
                    <View style={masterModalStyles.modalOverlay}>
                        <Animated.View
                            style={[
                                StyleSheet.absoluteFillObject,
                                masterModalStyles.backdrop,
                                {
                                    opacity:
                                        masterBackdropOpacity,
                                },
                            ]}
                        >
                            <Pressable
                                style={StyleSheet.absoluteFillObject}
                                onPress={() =>
                                    closeMasterModal()
                                }
                            />
                        </Animated.View>


                        <Animated.View
                            style={[
                                masterModalStyles.sheetContainer,
                                {
                                    paddingBottom:
                                        Math.max(
                                            insets.bottom,
                                            20,
                                        ) + 10,
                                    transform: [
                                        {
                                            translateY:
                                                masterSheetTranslateY,
                                        },
                                    ],
                                },
                            ]}
                        >
                            <View style={masterModalStyles.dragIndicator} />

                            <View style={masterModalStyles.headerTitleRow}>
                                <View style={masterModalStyles.headerIconContainer}>
                                    <Ionicons
                                        name="layers-outline"
                                        size={24}
                                        color="#6366F1"
                                    />
                                </View>

                                <View
                                    style={{
                                        flex: 1,
                                        marginLeft: 14,
                                    }}
                                >
                                    <Text style={masterModalStyles.headerTitle}>
                                        Masters
                                    </Text>

                                    <Text style={masterModalStyles.headerSubtitle}>
                                        Manage all master data
                                    </Text>
                                </View>

                                <Pressable
                                    onPress={() =>
                                        closeMasterModal()
                                    }
                                    onPressIn={() =>
                                        onPressIn(
                                            masterCloseBtnScale,
                                        )
                                    }
                                    onPressOut={() =>
                                        onPressOut(
                                            masterCloseBtnScale,
                                        )
                                    }
                                >
                                    <Animated.View
                                        style={[
                                            masterModalStyles.closeBtn,
                                            {
                                                transform: [
                                                    {
                                                        scale:
                                                            masterCloseBtnScale,
                                                    },
                                                ],
                                            },
                                        ]}
                                    >
                                        <Ionicons
                                            name="close"
                                            size={18}
                                            color="#64748B"
                                        />
                                    </Animated.View>
                                </Pressable>
                            </View>


                            <Animated.View
                                style={[
                                    masterModalStyles.optionsContainer,
                                    {
                                        opacity:
                                            masterOptionCardsOpacity,
                                    },
                                ]}
                            >
                                <MasterOption
                                    title="Master Account"
                                    subtitle="Add, edit and manage accounts"
                                    icon="business-outline"
                                    iconColor="#7C3AED"
                                    iconBackground="#EDE9FE"
                                    scaleValue={masterOptionAccountScale}
                                    onPressIn={onPressIn}
                                    onPressOut={onPressOut}
                                    onPress={() => {
                                        setSelectedMasterOption(
                                            'Account',
                                        );

                                        closeMasterModal(
                                            () =>
                                                navigation.navigate(
                                                    'Master Account',
                                                ),
                                        );
                                    }}
                                />

                                <MasterOption
                                    title="Master Product"
                                    subtitle="Add, edit and manage products"
                                    icon="cube-outline"
                                    iconColor="#F97316"
                                    iconBackground="#FFEDD5"
                                    scaleValue={masterOptionProductScale}
                                    onPressIn={onPressIn}
                                    onPressOut={onPressOut}
                                    onPress={() => {
                                        setSelectedMasterOption(
                                            'Product',
                                        );

                                        closeMasterModal(
                                            () =>
                                                navigation.navigate(
                                                    'Master Product',
                                                ),
                                        );
                                    }}
                                />

                                <MasterOption
                                    title="Master Referr"
                                    subtitle="Add, edit and manage referrers"
                                    icon="person-add-outline"
                                    iconColor="#16A34A"
                                    iconBackground="#DCFCE7"
                                    scaleValue={masterOptionReferrScale}
                                    onPressIn={onPressIn}
                                    onPressOut={onPressOut}
                                    onPress={() => {
                                        setSelectedMasterOption(
                                            'Referr',
                                        );

                                        closeMasterModal(
                                            () =>
                                                navigation.navigate(
                                                    'Master Referr',
                                                ),
                                        );
                                    }}
                                />

                                <MasterOption
                                    title="View Master"
                                    subtitle="View and search all master records"
                                    icon="document-text-outline"
                                    iconColor="#0284C7"
                                    iconBackground="#E0F2FE"
                                    scaleValue={masterOptionViewScale}
                                    onPressIn={onPressIn}
                                    onPressOut={onPressOut}
                                    onPress={() => {
                                        setSelectedMasterOption(
                                            'ViewMaster',
                                        );

                                        closeMasterModal(
                                            () =>
                                                navigation.navigate(
                                                    'View Master',
                                                ),
                                        );
                                    }}
                                />
                            </Animated.View>
                        </Animated.View>
                    </View>
                </Modal>
            </View>
        </ImageBackground>
    );
};


/* =========================================================
   MASTER OPTION
========================================================= */

const MasterOption = ({
    title,
    subtitle,
    icon,
    iconColor,
    iconBackground,
    scaleValue,
    onPress,
    onPressIn,
    onPressOut,
}) => {
    return (
        <Pressable
            onPress={onPress}
            onPressIn={() =>
                onPressIn(
                    scaleValue,
                )
            }
            onPressOut={() =>
                onPressOut(
                    scaleValue,
                )
            }
        >
            <Animated.View
                style={[
                    masterModalStyles.optionCard,
                    {
                        transform: [
                            {
                                scale:
                                    scaleValue,
                            },
                        ],
                    },
                ]}
            >
                <View
                    style={[
                        masterModalStyles.optionIconBox,
                        {
                            backgroundColor:
                                iconBackground,
                        },
                    ]}
                >
                    <Ionicons
                        name={icon}
                        size={22}
                        color={iconColor}
                    />
                </View>

                <View style={masterModalStyles.optionTextContainer}>
                    <Text style={masterModalStyles.optionTitle}>
                        {title}
                    </Text>

                    <Text style={masterModalStyles.optionSubtitle}>
                        {subtitle}
                    </Text>
                </View>

                <Ionicons
                    name="chevron-forward"
                    size={18}
                    color="#94A3B8"
                />
            </Animated.View>
        </Pressable>
    );
};


export default DashboardScreen;


/* =========================================================
   MAIN STYLES
========================================================= */

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
    },

    container: {
        flex: 1,
    },

    innerContainer: {
        flex: 1,
        position: 'relative',
    },

    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
    },

    loaderText: {
        fontSize: 13,
        color: '#64748B',
        fontWeight: '600',
        marginTop: 10,
    },

    scrollContent: {
        paddingHorizontal: 0,
    },


    /* HEADER */

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 12,
    },

    headerTitle: {
        fontSize: 19,
        fontWeight: '800',
        color: '#0F172A',
    },

    notificationBtn: {
        width: 40,
        height: 40,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.75)',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },

    badge: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: '#EF4444',
        borderRadius: 7,
        minWidth: 14,
        height: 14,
        paddingHorizontal: 3,
        justifyContent: 'center',
        alignItems: 'center',
    },

    badgeText: {
        color: '#FFFFFF',
        fontSize: 8,
        fontWeight: '800',
    },


    /* PROFILE */

    profileCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        backgroundColor: 'rgba(255, 255, 255, 0.55)',
        marginHorizontal: 16,
        marginTop: 8,
        padding: 16,
        borderRadius: 28,
        borderWidth: 1.5,
        borderColor: 'rgba(255, 255, 255, 0.95)',
        shadowColor: '#2563EB',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.12,
        shadowRadius: 20,
    },

    profileInfoContainer: {
        flex: 1,
        paddingRight: 12,
    },

    greetingHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    welcomeSub: {
        fontSize: 12,
        color: '#64748B',
        fontWeight: '500',
    },

    activePill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ECFDF5',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#A7F3D0',
    },

    activeDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#10B981',
        marginRight: 4,
    },

    activeText: {
        fontSize: 10,
        color: '#047857',
        fontWeight: '700',
    },

    userName: {
        fontSize: 18,
        fontWeight: '800',
        color: '#0F172A',
        marginVertical: 5,
    },

    roleBadgeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: '#EEF2FF',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        marginBottom: 8,
    },

    roleBadgeText: {
        fontSize: 11,
        color: '#2563EB',
        fontWeight: '700',
        marginLeft: 4,
    },

    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: 32,
        marginTop: 4,
    },

    infoRowText: {
        fontSize: 12,
        color: '#334155',
        fontWeight: '600',
        flex: 1,
        marginLeft: 7,
    },

    clockRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },

    clockText: {
        fontSize: 11,
        color: '#059669',
        marginLeft: 6,
        fontWeight: '700',
    },

    avatarFrame: {
        padding: 3,
        borderRadius: 34,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#DBEAFE',
    },

    avatarImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#F1F5F9',
    },


    /* ANALYTICS */

    refreshChartButton: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: '#EFF6FF',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#DBEAFE',
    },

    sectionTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#0F172A',
    },

    graphSub: {
        fontSize: 11,
        color: '#64748B',
        marginTop: 2,
    },


    /* LEAD ANALYTICS */

    leadAnalyticsContainer: {
        backgroundColor: 'rgba(255,255,255,0.82)',
        marginHorizontal: 16,
        marginTop: 14,
        padding: 16,
        borderRadius: 22,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },

    leadAnalyticsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 14,
    },

    analyticsTitleRow: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },

    analyticsTitleIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#EEF2FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },


    /* FILTER */

    analyticsFilterCard: {
        backgroundColor: '#F8FAFC',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        padding: 12,
        marginBottom: 14,
    },

    filterHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 11,
    },

    filterHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    filterTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: '#334155',
        marginLeft: 6,
    },

    filterRangeText: {
        fontSize: 9,
        color: '#64748B',
        fontWeight: '600',
    },

    dateFilterRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    dateInputButton: {
        flex: 1,
        minHeight: 58,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        paddingHorizontal: 11,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    dateInputLabel: {
        fontSize: 8,
        fontWeight: '700',
        color: '#94A3B8',
        letterSpacing: 0.5,
    },

    dateInputValue: {
        fontSize: 11,
        fontWeight: '700',
        color: '#1E293B',
        marginTop: 4,
    },

    dateArrowContainer: {
        width: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },

    applyFilterButton: {
        marginTop: 11,
        minHeight: 43,
        borderRadius: 12,
        backgroundColor: '#4F46E5',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },

    applyFilterText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700',
        marginLeft: 6,
    },


    /* GRAPH */

    graphLoadingContainer: {
        minHeight: 120,
        alignItems: 'center',
        justifyContent: 'center',
    },

    graphLoadingText: {
        fontSize: 11,
        color: '#64748B',
        fontWeight: '600',
        marginTop: 8,
    },

    graphErrorContainer: {
        minHeight: 120,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },

    graphErrorText: {
        fontSize: 11,
        color: '#64748B',
        marginTop: 7,
        textAlign: 'center',
    },

    retryText: {
        color: '#4F46E5',
        fontSize: 12,
        fontWeight: '700',
        marginTop: 8,
    },

    analyticsChartCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 17,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        padding: 13,
        marginBottom: 13,
    },

    chartCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },

    chartCardTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: '#0F172A',
    },

    chartCardSubtitle: {
        fontSize: 9.5,
        color: '#64748B',
        marginTop: 2,
    },

    totalLeadBadge: {
        minWidth: 55,
        backgroundColor: '#EEF2FF',
        borderRadius: 11,
        alignItems: 'center',
        paddingHorizontal: 9,
        paddingVertical: 6,
    },

    totalLeadBadgeNumber: {
        fontSize: 14,
        fontWeight: '800',
        color: '#4F46E5',
    },

    totalLeadBadgeLabel: {
        fontSize: 8,
        color: '#6366F1',
        fontWeight: '600',
    },


    /* MATURITY */

    maturityChartRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    maturityLegend: {
        flex: 1,
        marginLeft: 6,
    },

    maturityLegendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 7,
        paddingVertical: 6,
        borderRadius: 9,
        marginBottom: 3,
    },

    maturityLegendSelected: {
        backgroundColor: '#F1F5F9',
    },

    maturityLegendDot: {
        width: 9,
        height: 9,
        borderRadius: 5,
        marginRight: 7,
    },

    maturityLegendTitle: {
        fontSize: 10,
        fontWeight: '700',
        color: '#334155',
    },

    maturityLegendSub: {
        fontSize: 8,
        color: '#94A3B8',
        marginTop: 1,
    },

    maturityPercentage: {
        fontSize: 10,
        color: '#475569',
        fontWeight: '700',
    },

    analyticsEmptyContainer: {
        minHeight: 130,
        alignItems: 'center',
        justifyContent: 'center',
    },

    analyticsEmptyText: {
        fontSize: 10.5,
        color: '#94A3B8',
        marginTop: 7,
    },


    /* BAR */

    monthCountBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EEF2FF',
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 6,
    },

    monthCountText: {
        fontSize: 9,
        color: '#4F46E5',
        fontWeight: '700',
        marginLeft: 4,
    },

    barChartScrollContent: {
        paddingTop: 10,
        paddingBottom: 5,
        paddingHorizontal: 4,
        minHeight: 220,
        alignItems: 'flex-end',
    },

    barItemContainer: {
        width: 40,
        alignItems: 'center',
        marginRight: 8,
    },

    barValueBubble: {
        minWidth: 28,
        height: 24,
        borderRadius: 8,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 5,
        marginBottom: 5,
    },

    barValueText: {
        fontSize: 9,
        fontWeight: '800',
        color: '#334155',
    },

    barArea: {
        height: 155,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'flex-end',
    },

    barBackground: {
        width: 27,
        height: 150,
        borderRadius: 9,
        backgroundColor: '#F1F5F9',
        overflow: 'hidden',
        justifyContent: 'flex-end',
    },

    barFill: {
        width: '100%',
        borderTopLeftRadius: 9,
        borderTopRightRadius: 9,
        borderBottomLeftRadius: 5,
        borderBottomRightRadius: 5,
    },

    barMonthText: {
        marginTop: 7,
        fontSize: 8,
        color: '#64748B',
        fontWeight: '700',
        textAlign: 'center',
        width: 60,
    },


    /* DATE MODAL */

    dateModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15,23,42,0.48)',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },

    dateModalCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 22,
        padding: 18,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        //elevation: 8,
    },

    dateModalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    dateModalIcon: {
        width: 42,
        height: 42,
        borderRadius: 13,
        backgroundColor: '#EEF2FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 11,
    },

    dateModalTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#0F172A',
    },

    dateModalSubtitle: {
        fontSize: 10,
        color: '#64748B',
        marginTop: 2,
    },

    dateModalClose: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
    },

    dateFieldsRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginTop: 22,
    },

    dateFieldContainer: {
        flex: 1,
    },

    dateFieldLabel: {
        fontSize: 8,
        fontWeight: '700',
        color: '#94A3B8',
        marginBottom: 5,
        letterSpacing: 0.6,
    },

    dateFieldInput: {
        height: 50,
        borderWidth: 1,
        borderColor: '#CBD5E1',
        borderRadius: 12,
        backgroundColor: '#F8FAFC',
        color: '#0F172A',
        fontSize: 15,
        fontWeight: '700',
        textAlign: 'center',
        paddingHorizontal: 5,
    },

    dateSeparator: {
        fontSize: 20,
        color: '#94A3B8',
        fontWeight: '600',
        marginHorizontal: 7,
        marginBottom: 12,
    },

    datePreviewCard: {
        marginTop: 14,
        minHeight: 42,
        borderRadius: 11,
        backgroundColor: '#EEF2FF',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 11,
    },

    datePreviewText: {
        fontSize: 10.5,
        color: '#4F46E5',
        fontWeight: '600',
        marginLeft: 6,
    },

    dateModalActions: {
        flexDirection: 'row',
        marginTop: 20,
    },

    dateCancelButton: {
        flex: 1,
        height: 46,
        borderRadius: 12,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 6,
    },

    dateCancelText: {
        color: '#475569',
        fontSize: 12,
        fontWeight: '700',
    },

    dateSaveButton: {
        flex: 1.4,
        height: 46,
        borderRadius: 12,
        backgroundColor: '#4F46E5',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 6,
    },

    dateSaveText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700',
        marginLeft: 5,
    },


    /* CLIENTS */

    listContainer: {
        marginTop: 18,
        paddingHorizontal: 16,
    },

    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 11,
    },

    seeAllText: {
        fontSize: 13,
        color: '#3B82F6',
        fontWeight: '700',
    },

    clientCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: IS_ANDROID
            ? '#FFFFFF'
            : 'rgba(255,255,255,0.9)',
        padding: 13,
        borderRadius: 18,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },

    selectedClientCard: {
        borderColor: '#3B82F6',
        backgroundColor: '#EFF6FF',
    },

    clientAvatar: {
        width: 64,
        height: 64,
        borderRadius: 18,
        backgroundColor: '#F1F5F9',
    },

    dashboardClientAvatarFallback: {
        width: 64,
        height: 64,
        borderRadius: 18,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
    },

    dashboardNoImageText: {
        marginTop: 2,
        fontSize: 8,
        lineHeight: 10,
        fontWeight: '600',
        color: '#94A3B8',
        textAlign: 'center',
    },

    clientInfo: {
        flex: 1,
        marginLeft: 12,
        marginRight: 8,
    },

    clientName: {
        fontSize: 15,
        fontWeight: '700',
        color: '#0F172A',
    },

    clientSubtitle: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 1,
    },

    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },

    locationText: {
        fontSize: 11,
        color: '#64748B',
        marginLeft: 3,
        flex: 1,
    },

    actionColumn: {
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        minHeight: 52,
    },

    callCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#EFF6FF',
        justifyContent: 'center',
        alignItems: 'center',
    },

    bottomStatusRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    visitedTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#DCFCE7',
        paddingHorizontal: 7,
        paddingVertical: 3,
        borderRadius: 10,
    },

    visitedText: {
        fontSize: 10,
        color: '#16A34A',
        fontWeight: '600',
        marginLeft: 3,
    },

    emptyClientCard: {
        minHeight: 90,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },

    emptyClientText: {
        fontSize: 12,
        color: '#94A3B8',
        marginTop: 5,
        fontWeight: '500',
    },


    /* BOTTOM NAV */

    bottomNavContainer: {
        position: 'absolute',
        left: 12,
        right: 12,
        zIndex: 20,
    },

    navCard: {
        height: 66,
        borderRadius: 26,
        backgroundColor: IS_ANDROID
            ? '#FFFFFF'
            : 'rgba(255,255,255,0.96)',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 4,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },

    navItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
    },

    navItemContent: {
        alignItems: 'center',
        justifyContent: 'center',
    },

    navDivider: {
        width: 1,
        height: 26,
        backgroundColor: '#E2E8F0',
    },

    navText: {
        fontSize: 9,
        color: '#8B949E',
        marginTop: 3,
        fontWeight: '500',
    },

    activeNavText: {
        color: '#7C3AED',
        fontWeight: '700',
    },

    endFabContainer: {
        width: 44,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 4,
    },

    endFab: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#6366F1',
        justifyContent: 'center',
        alignItems: 'center',
    },
});


/* =========================================================
   ATTENDANCE STYLES
========================================================= */

const attendanceStyles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15,23,42,0.42)',
        justifyContent: 'flex-end',
    },

    sheetContainer: {
        maxHeight: '84%',
        backgroundColor: IS_ANDROID
            ? '#F0F9FF'
            : 'rgba(240,249,255,0.97)',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#E0F2FE',
    },

    sheetHeader: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 12,
        position: 'relative',
    },

    dragIndicator: {
        width: 38,
        height: 5,
        borderRadius: 3,
        backgroundColor: '#CBD5E1',
    },

    closeBtn: {
        position: 'absolute',
        right: 0,
        top: 6,
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },

    scrollBody: {
        paddingTop: 4,
        paddingBottom: 10,
    },

    timeCard: {
        position: 'relative',
        borderRadius: 20,
        padding: 18,
        marginBottom: 14,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#BAE6FD',
        minHeight: 130,
    },

    timeRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },

    timeText: {
        fontSize: 34,
        fontWeight: '800',
        color: '#0369A1',
    },

    ampmText: {
        fontSize: 17,
        fontWeight: '700',
        color: '#0284C7',
        marginLeft: 6,
    },

    dateText: {
        fontSize: 13,
        color: '#0369A1',
        fontWeight: '600',
        marginTop: 2,
    },

    greetingText: {
        fontSize: 14,
        color: '#0C4A6E',
        fontWeight: '700',
        marginTop: 10,
    },

    locationCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 14,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },

    locationHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },

    locTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1E293B',
    },

    livePill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#DCFCE7',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
    },

    pulseDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#16A34A',
        marginRight: 4,
    },

    liveText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#15803D',
    },

    addressText: {
        fontSize: 13,
        color: '#475569',
        lineHeight: 18,
    },

    accuracyRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 10,
    },

    accuracyText: {
        fontSize: 11,
        color: '#64748B',
        fontWeight: '500',
    },

    refreshBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
    },

    refreshText: {
        fontSize: 12,
        color: '#0284C7',
        fontWeight: '600',
        marginLeft: 4,
    },

    mapContainer: {
        height: 150,
        borderRadius: 14,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },

    bottomContainer: {
        paddingTop: 10,
    },

    startBtnWrapper: {
        height: 50,
        borderRadius: 18,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },

    disabledBtnWrapper: {
        opacity: 0.6,
    },

    startDayText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },
});


/* =========================================================
   LEAD MODAL STYLES
========================================================= */

const leadModalStyles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },

    backdrop: {
        backgroundColor: 'rgba(15,23,42,0.25)',
    },

    sheetContainer: {
        backgroundColor: IS_ANDROID
            ? '#FFFFFF'
            : 'rgba(255,255,255,0.97)',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: 20,
        paddingTop: 10,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },

    dragIndicator: {
        width: 44,
        height: 5,
        borderRadius: 3,
        backgroundColor: '#C7D2FE',
        alignSelf: 'center',
        marginBottom: 16,
    },

    headerTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },

    headerIconContainer: {
        width: 52,
        height: 52,
        borderRadius: 18,
        backgroundColor: '#EEF2FF',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E0E7FF',
    },

    headerTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#0F172A',
    },

    headerSubtitle: {
        fontSize: 13,
        color: '#64748B',
        marginTop: 2,
    },

    closeBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
    },

    optionsContainer: {
        marginTop: 4,
    },

    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        paddingVertical: 14,
        paddingHorizontal: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },

    optionIconBox: {
        width: 48,
        height: 48,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },

    optionTextContainer: {
        flex: 1,
        marginLeft: 14,
    },

    optionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0F172A',
    },

    optionSubtitle: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 2,
    },
});


/* =========================================================
   MASTER MODAL STYLES
========================================================= */

const masterModalStyles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },

    backdrop: {
        backgroundColor: 'rgba(15,23,42,0.25)',
    },

    sheetContainer: {
        backgroundColor: IS_ANDROID
            ? '#FFFFFF'
            : 'rgba(255,255,255,0.97)',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: 20,
        paddingTop: 10,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },

    dragIndicator: {
        width: 44,
        height: 5,
        borderRadius: 3,
        backgroundColor: '#C7D2FE',
        alignSelf: 'center',
        marginBottom: 16,
    },

    headerTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },

    headerIconContainer: {
        width: 52,
        height: 52,
        borderRadius: 18,
        backgroundColor: '#EEF2FF',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E0E7FF',
    },

    headerTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#0F172A',
    },

    headerSubtitle: {
        fontSize: 13,
        color: '#64748B',
        marginTop: 2,
    },

    closeBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
    },

    optionsContainer: {
        marginTop: 4,
    },

    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        paddingVertical: 14,
        paddingHorizontal: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },

    optionIconBox: {
        width: 48,
        height: 48,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },

    optionTextContainer: {
        flex: 1,
        marginLeft: 14,
    },

    optionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0F172A',
    },

    optionSubtitle: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 2,
    },
});