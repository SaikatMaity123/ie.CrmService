import React, { useEffect, useState, useCallback } from "react";
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import {
    Text,
    View,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    Alert,
    TouchableOpacity,
    LayoutAnimation,
    UIManager,
    Platform,
    StatusBar,
    BackHandler,
} from "react-native";
import { BASE_URL } from "@env";
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Ionicons from "react-native-vector-icons/Ionicons";
import LinearGradient from 'react-native-linear-gradient';
import { set } from "date-fns";

// Enable smooth expand animation on Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const NoticeBoardList = () => {
    const [businessId, setBusinessID] = useState("");
    const [division, setDivision] = useState("");
    const [noticeBoardData, setNoticeBoardData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [expandedId, setExpandedId] = useState(null);
    const navigation = useNavigation();


    // HW back
    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'AppNavScreen' }],
                });
                return true;
            };
            BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
        }, [navigation])
    );

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener((state) => {
            if (!state.isConnected) {
                Alert.alert("No Internet", "Please connect to the internet.");
            }
        });

        AsyncStorage.getItem("UserData").then(async (value) => {
            if (value != null) {
                let user = JSON.parse(value);
                setBusinessID(user.BusinessID);
                setDivision(user.IDDivision);
                fetchNoticeBoard(user.BusinessID, user.IDDivision);
            }
        });
        return () => unsubscribe();
    }, []);

    const fetchNoticeBoard = (businessId, IDDivision) => {
        const url = `${BASE_URL}Dashboard/NoticeBoard?Businessid=${businessId}&IDDivision=${IDDivision}`;
        console.log("🔗 NoticeBoard API URL:", url);

        setLoading(true);
        fetch(url)
            .then((res) => res.json())
            .then((data) => {
                setNoticeBoardData(data.data || []);
                setLoading(false);
            })
            .catch((error) => {
                console.error("❌ API Error:", error);
                setLoading(false);
            });
    };

    const toggleExpand = (id) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedId(expandedId === id ? null : id);
    };

    const parseGradientColors = (bg) => {
        try {
            if (!bg || !bg.startsWith("linear-gradient")) return null;

            const inside = bg.substring(
                bg.indexOf("(") + 1,
                bg.lastIndexOf(")")
            );

            const parts = inside.split(",");

            // Remove angle (first part if contains "deg")
            const colors = parts
                .map(p => p.trim())
                .filter(p => p.startsWith("#"));

            return colors.length >= 2 ? colors : null;
        } catch (e) {
            return null;
        }
    };


    const renderItem = ({ item }) => {
        const isExpanded = expandedId === item.IDNotice;
        return (
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => toggleExpand(item.IDNotice)}
                style={styles.card}
            >
                <View style={styles.headerRow}>
                    <Ionicons name="paper-plane-outline" size={30} color="#005696" />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={styles.title}>{item.ShortNotice}</Text>
                        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 3 }}>
                            <Ionicons name="calendar-outline" size={14} color="#777" style={{ marginRight: 4 }} />
                            <Text style={styles.date}>{item.NoticeDate}</Text>
                        </View>
                    </View>
                    <Ionicons
                        name={isExpanded ? "chevron-up" : "chevron-down"}
                        size={22}
                        color="#333"
                    />
                </View>

                {/* {isExpanded && (
                    <View style={styles.content}>
                        <Text style={styles.longText}>{item.LongNotice}</Text>
                        <View style={styles.footer}>
                            <Text style={styles.footerText1}>By: {item.Employee}</Text>
                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                <Ionicons name="calendar-outline" size={13} color="#555" style={{ marginRight: 4 }} />
                                <Text style={styles.footerText}>
                                    {item.StartDate} - {item.EndDate}
                                </Text>
                            </View>
                        </View>
                    </View>
                )} */}

                {isExpanded && (() => {
                    const gradientColors = parseGradientColors(item.Backgroundcolor);

                    if (gradientColors) {
                        return (
                            <LinearGradient
                                colors={gradientColors}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={[styles.content, { borderRadius: 8, padding: 10 }]}
                            >
                                <Text style={[styles.longText, { color: item.Fontcolor || "#fff" }]}>
                                    {item.LongNotice}
                                </Text>

                                <View style={styles.footer}>
                                    <Text style={[styles.footerText1, { color: item.Fontcolor || "#fff" }]}>
                                        By: {item.Employee}
                                    </Text>

                                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                                        <Ionicons
                                            name="calendar-outline"
                                            size={13}
                                            color={item.Fontcolor || "#fff"}
                                            style={{ marginRight: 4 }}
                                        />
                                        <Text style={[styles.footerText, { color: item.Fontcolor || "#fff" }]}>
                                            {item.StartDate} - {item.EndDate}
                                        </Text>
                                    </View>
                                </View>
                            </LinearGradient>
                        );
                    }

                    return (
                        <View
                            style={[
                                styles.content,
                                {
                                    backgroundColor: item.Backgroundcolor || "#f0f6ff",
                                    borderRadius: 8,
                                    padding: 10
                                }
                            ]}
                        >
                            <Text style={[styles.longText, { color: item.Fontcolor || "#000" }]}>
                                {item.LongNotice}
                            </Text>

                            <View style={styles.footer}>
                                <Text style={[styles.footerText1, { color: item.Fontcolor || "#005696" }]}>
                                    By: {item.Employee}
                                </Text>

                                <View style={{ flexDirection: "row", alignItems: "center" }}>
                                    <Ionicons
                                        name="calendar-outline"
                                        size={13}
                                        color={item.Fontcolor || "#555"}
                                        style={{ marginRight: 4 }}
                                    />
                                    <Text style={[styles.footerText, { color: item.Fontcolor || "#555" }]}>
                                        {item.StartDate} - {item.EndDate}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    );
                })()}

            </TouchableOpacity>
        );
    };


    if (loading) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" color="#005696" />
                <Text>Loading Notices...</Text>
            </View>
        );
    }

    return (
        <>
            <StatusBar barStyle="light-content" backgroundColor="#a9ddfaff" />
            <View style={styles.container}>
                {noticeBoardData.length > 0 ? (
                    <FlatList
                        data={noticeBoardData}
                        keyExtractor={(item) => item.IDNotice.toString()}
                        renderItem={renderItem}
                        contentContainerStyle={{ paddingBottom: 20 }}
                    />
                ) : (
                    <Text style={styles.emptyText}>No Notices Found</Text>
                )}
            </View>
        </>
    );
};

export default NoticeBoardList;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f7f9fb",
        padding: 10,
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 12,
        marginVertical: 8,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    title: {
        fontFamily: "Lato-Bold",
        fontSize: 14,
        color: "#000",
    },
    date: {
        fontFamily: "Lato-Regular",
        fontSize: 12,
        color: "#777",
        marginTop: 3,
    },
    content: {
        marginTop: 8,
        borderTopWidth: 1,
        borderTopColor: "#e0e0e0",
        paddingTop: 8,
    },
    longText: {
        fontFamily: "Lato-Regular",
        fontSize: 13,
        color: "#333",
        lineHeight: 20,
    },
    footer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 10,
    },
    footerText: {
        fontFamily: "Lato-Italic",
        fontSize: 14,
        color: "#555",
        fontStyle: "bold",
    },
    footerText1: {
        fontFamily: "Lato-Italic",
        fontSize: 14,
        color: "#005696",
        fontStyle: "bold",
    },
    loader: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    emptyText: {
        textAlign: "center",
        color: "#777",
        marginTop: 50,
        fontFamily: "Lato-Regular",
    },
});
