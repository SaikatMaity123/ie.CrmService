import React, { useEffect, useState, useLayoutEffect, useCallback } from "react";
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import {
  Text,
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Image,
  Alert,
  TouchableOpacity,
} from "react-native";
import { BASE_URL, url } from '@env';
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import BirthdayImg from '../images/bdd_bg1.svg';
import { Linking } from "react-native";
const Base_Url = `https://apitest.mendine.co.in/api/crm/`;


const BirthDayScreen = () => {
  const [birthdays, setBirthdays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [IDEmployee, setIDEmployee] = useState(null);
  const [BusinessID, setBusinessID] = useState(null);
  const [EmployeeName, setEmployeeName] = useState(null);
  const navigation = useNavigation(); // <-- Use the useNavigation hook


  //  headerRight: () => (
  //             <TouchableOpacity
  //               //onPress={() => navigation.goBack()}
  //               onPress={() => navigation.navigate('AppNavScreen')}
  //               style={{ marginRight: 15 }}>
  //               <Ionicons name="arrow-back" size={24} color="#333333" />
  //             </TouchableOpacity>
  //           ),


  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => {
            navigation.reset({
              index: 0,
              routes: [
                {
                  name: 'AppNavScreen'
                },
              ],
            });
          }}
          style={{ marginLeft: 15 }}
        >
          <Ionicons name="arrow-back" size={24} color="#333333" style={{ marginRight: 10 }} />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);


  useEffect(() => {
    // ✅ Check internet connection
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (!state.isConnected) {
        Alert.alert("No Internet", "Please connect to the internet.");
      }
    });

    // ✅ Get BusinessID from AsyncStorage and then fetch birthdays
    AsyncStorage.getItem("UserData").then(async (value) => {
      if (value != null) {
        let user = JSON.parse(value);
        setBusinessID(user.BusinessID);
        setIDEmployee(user.IDEmployee);
        setEmployeeName(user.Empname);

        // call method to fetch birthdays
        fetchBirthdays(user.BusinessID);
      }
    });

    return () => unsubscribe();
  }, []);

  // ✅ Separate method to fetch birthdays
  const fetchBirthdays = (businessId) => {
    setLoading(true);
    fetch(`${BASE_URL}Dashboard/UpcomingBirthday?Businessid=${businessId}`)
      .then((res) => res.json())
      .then((data) => {
        setBirthdays(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  };

  // ✅ Function to calculate days until birthday
  const getDaysUntilBirthday = (dobString) => {
    if (!dobString) return "";

    try {
      // Extract month/day safely from API format: "9/10/1980 12:00:00 AM"
      const [month, day] = dobString.split(" ")[0].split("/"); // ["9","10","1980"]
      const today = new Date();
      const currentYear = today.getFullYear();

      // Create this year's birthday
      let nextBirthday = new Date(currentYear, parseInt(month) - 1, parseInt(day));

      // If birthday already passed, take next year
      if (nextBirthday < today.setHours(0, 0, 0, 0)) {
        nextBirthday = new Date(currentYear + 1, parseInt(month) - 1, parseInt(day));
      }

      // Difference in days
      const diffTime = nextBirthday - new Date();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return "🎉 Today";
      if (diffDays === 1) return "Tomorrow";
      return `In ${diffDays} days`;
    } catch (error) {
      console.error("DOB parsing error:", dobString, error);
      return "";
    }
  };

  const onWish = (item) => {
    if (!item.Phone) {
      Alert.alert("Phone number not available");
      return;
    }

    let phone = item.Phone;

    // ✅ Ensure correct format (India example: add +91 if not present)
    if (!phone.startsWith("+")) {
      phone = `+91${phone}`;
    }
    const employeeName = item.Employee ? item.Employee.trim() : "";
    const senderName = EmployeeName ? EmployeeName.trim() : "";
    // insert name right after "Happy Birthday!"
    let birthdayMsg = item.BirthdayMassage || "Happy Birthday!";
    if (birthdayMsg.startsWith("Happy Birthday!")) {
      // birthdayMsg = birthdayMsg.replace(
      //   "Happy Birthday!",
      //   `Happy Birthday! ${employeeName},`
      // );
    }

    const message = `*Hi , ${employeeName}* 🎉 ${birthdayMsg} – *${senderName}*.\n\n*ieCRM Team*`;

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;


    Linking.openURL(url).catch(() => {
      Alert.alert("Error", "WhatsApp not installed on this device.");
    });
  };


  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#005696" />
        <Text>Loading...</Text>
      </View>
    );
  }

  // const renderItem = ({ item }) => (
  //   <View style={styles.card}>
  //     {/* Background SVG */}
  //     <View style={styles.backgroundSvg}>
  //       <BirthdayImg width="100%" height="100%" preserveAspectRatio="xMidYMid slice" />
  //     </View>

  //     {/* Foreground content */}
  //     <View style={styles.cardContent}>
  //       {item.ProfilePicPath ? (
  //         <Image
  //           source={{ uri: `${url}/${item.ProfilePicPath}` }}
  //           style={styles.avatar}
  //           resizeMode="cover"
  //         />
  //       ) : (
  //         <Ionicons name="person-circle-outline" size={60} color="#ccc" />
  //       )}

  //       <View style={styles.info}>
  //         <Text style={styles.name}>{item.Employee}</Text>
  //         <Text style={styles.detail}>
  //           {item.Designation} • {item.Division}
  //         </Text>
  //         <Text style={styles.dob}>
  //           🎂 {item.FormattedDOB}
  //         </Text>
  //         <Text style={styles.dob}>
  //           ({getDaysUntilBirthday(item.DOB)})
  //         </Text>
  //       </View>

  //       {/* ✅ Show Wish button only if Phone exists */}
  //       {item.Phone && daysUntil === "🎉 Today" ? (
  //         <TouchableOpacity
  //           style={styles.whatsappButton}
  //           onPress={() => onWish(item)}
  //         >
  //           <View style={styles.iconContainer}>
  //             <Ionicons name="logo-whatsapp" size={20} color="#fff" />
  //           </View>
  //           <Text style={styles.whatsappText}>
  //             Wish {item.Gender === "FEMALE" ? "Her" : "Him"}
  //           </Text>
  //         </TouchableOpacity>
  //       ) : (
  //         <View style={styles.noPhoneContainer}>
  //           <Text style={styles.noPhoneText}>No Phone{'\n'}Number Available</Text>
  //         </View>

  //       )}

  //     </View>
  //   </View>
  // );

  const renderItem = ({ item }) => {
    const daysUntil = getDaysUntilBirthday(item.DOB);

    return (
      <View style={styles.card}>
        {/* Background SVG */}
        <View style={styles.backgroundSvg}>
          <BirthdayImg width="100%" height="100%" preserveAspectRatio="xMidYMid slice" />
        </View>

        {/* Foreground content */}
        <View style={styles.cardContent}>
          {item.ProfilePicPath ? (
            <Image
              source={{ uri: `${url}/${item.ProfilePicPath}` }}
              style={styles.avatar}
              resizeMode="cover"
            />
          ) : (
            <Ionicons name="person-circle-outline" size={60} color="#ccc" />
          )}

          <View style={styles.info}>
            <Text style={styles.name}>{item.Employee}</Text>
            <Text style={styles.detail}>
              {item.Designation} • {item.Division}
            </Text>
            <Text style={styles.dob}>🎂 {item.FormattedDOB}</Text>
            {/* <Text style={styles.dob}>({daysUntil})</Text> */}
            <Text style={styles.detail}>
              Phone : {item.Phone || 'N/A'}
            </Text>

          </View>

          {/* ✅ Show Wish button only if Phone exists AND it's Today */}
          {item.Phone && daysUntil === "🎉 Today" ? (
            <TouchableOpacity
              style={styles.whatsappButton}
              onPress={() => onWish(item)}
            >
              <View style={styles.iconContainer}>
                <Ionicons name="logo-whatsapp" size={20} color="#fff" />
              </View>
              <Text style={styles.whatsappText}>
                Wish {item.Gender === "FEMALE" ? "Her" : "Him"}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.noPhoneContainer}>
              <Text style={styles.noPhoneText}>
                {daysUntil === "🎉 Today" ? "No Phone \nNumber Available" : `Wish ${daysUntil}`}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };



  return (
    <View style={styles.container}>
      <FlatList
        data={birthdays}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};

export default BirthDayScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    padding: 10,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    height: 150,
    position: "relative",
    overflow: "hidden",
    borderRadius: 29,
    marginVertical: 12,   // ⬅️ More gap between cards
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    backgroundColor: "#fff",
    borderWidth: 0.7,
    borderColor: "#444",
  },

  backgroundSvg: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.9,  // ⬅️ lighter bg so text is clearer


  },

  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,   // ⬅️ more padding inside card
    flex: 1,
  },

  avatar: {
    width: 65,
    height: 65,
    borderRadius: 35,
    marginRight: 10,
    borderWidth: 2,
    borderColor: "#005696",  // ⬅️ highlight avatar with border
    alignItems: "flex-start",
    display: "flex",
  },

  info: {
    flex: 1,
    justifyContent: "center",
    marginLeft: 10,

  },

  name: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 4,
  },

  detail: {
    fontSize: 14,
    color: "#555",
    marginBottom: 4,
  },

  dob: {
    fontSize: 13,
    color: "#005696",
    fontWeight: "800",
    fontFamily: "Poppins_600SemiBold",
  },

  whatsappButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "#0E7777",  // dark teal like your sample
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 15,
    marginTop: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },

  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 16,
    backgroundColor: "#25D366",   // WhatsApp green
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    marginLeft: -30,
  },

  whatsappText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
  },

  noPhoneContainer: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#f8d7da",
    marginTop: 10,
    alignItems: "center",       // ⬅️ centers children horizontally
    justifyContent: "center",   // ⬅️ centers children vertically (if you give height)
  },

  noPhoneText: {
    color: "#721c24",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",        // ⬅️ centers multiline text
  },


});
