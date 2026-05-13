import React, {useCallback, useEffect, useState, useLayoutEffect} from 'react';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  Alert,
  ScrollView,
  BackHandler,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import {PieChart} from 'react-native-gifted-charts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Sales_URL} from '@env';
import axios from 'axios';
import Ionicons from 'react-native-vector-icons/Ionicons';
const {width} = Dimensions.get('window');

const MyStatusScreen = ({route}) => {
  const employeeParam =
    route?.params?.employee || route?.params?.employee1 || null;
  // const employeeParam1 = route?.params?.employee1 || null;
  const [percentage, setPercentage] = useState(0);
  const [targetValue, setTargetValue] = useState(0);
  const [saleValue, setSaleValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [cumulativePercentage, setCumulativePercentage] = useState(0);
  const [cumulativeTarget, setCumulativeTarget] = useState(0);
  const [cumulativeSale, setCumulativeSale] = useState(0);
  const navigation = useNavigation(); // <-- Use the useNavigation hook
  const currentDate = new Date();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => {
            navigation.reset({
              index: 0,
              routes: [
                {
                  name: 'SALES REPORT',
                  params: {selectedEmployee: employeeParam}, // ✅ keep it
                },
              ],
            });
          }}
          style={{marginLeft: 15}}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, employeeParam]); // ✅ include employeeParam in dependencies

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.reset({
          index: 0,
          routes: [
            {
              name: 'SALES REPORT',
              params: {selectedEmployee: employeeParam}, // ← keep passing it
            },
          ],
        });
        return true; // prevent default back behavior
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () =>
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [navigation]),
  );

  useEffect(() => {
    if (employeeParam) {
      const {empemail, Division, POST, EMP_NO} = employeeParam;
      const actualDivision = Division === 'MPPL' ? 'MAD' : Division;
      fetchTargetAchieveData(actualDivision, empemail);
      fetchCumulativeAchievementData(POST, EMP_NO, actualDivision);
    } else {
      AsyncStorage.getItem('UserDataSales').then(value => {
        if (value != null) {
          let user = JSON.parse(value);
          const {empemail, Division, designationshortform, empno} = user;

          //const actualDivision = Division === "MPPL" ? "MAD" : Division;
          fetchTargetAchieveData(Division, empemail);
          if (empno) {
            fetchCumulativeAchievementData(
              designationshortform,
              empno,
              Division,
            );
          } else {
            Alert.alert(
              'Error',
              'Emp No not found for cumulative achievement.',
            );
          }
        }
      });
    }
  }, []);

  const fetchTargetAchieveData = (division, email) => {
    const apiUrl = `${Sales_URL}TargetAchieve?div=${division}&email=${email}`;
    console.log('fetchTargetAchieveData', apiUrl);

    axios
      .post(apiUrl)
      .then(response => {
        const apiData = response.data || [];

        // Handle empty or null data
        if (!apiData.length || apiData[0] == null) {
          setTargetValue(0);
          setSaleValue(0);
          setPercentage(0);
          setLoading(false);
          Alert.alert('Notice', 'No monthly achievement data available.');
          return;
        }

        const target = apiData[0].TargetValue ?? 0;
        const achieved = apiData[0].SaleValue ?? 0;

        setTargetValue(target);
        setSaleValue(achieved);

        // Prevent division by zero
        const percent = target > 0 ? (achieved / target) * 100 : 0;
        setPercentage(percent);

        setLoading(false);
      })
      .catch(error => {
        console.error('Monthly API error:', error);
        setLoading(false);
        Alert.alert('Error', 'Failed to fetch data from the API.');
      });
  };

  const fetchCumulativeAchievementData = (designation, empno, division) => {
    if (!designation || !empno || !division) {
      Alert.alert(
        'Error',
        'Required parameters are missing for cumulative achievement.',
      );
      return;
    }

    const isMCSO = division === 'MCSO';

    const apiUrl = isMCSO
      ? `${Sales_URL}CumulativeSaleTargetBYDIV?div=${division}&post=${designation}&empno=${empno}`
      : `${Sales_URL}CumulativeSaleTarget?post=${designation}&empno=${empno}`;

    console.log('fetchCumulativeAchievementData', apiUrl);

    axios
      .post(apiUrl)
      .then(response => {
        const resData = response.data;

        // Handle empty or invalid response
        if (
          !resData ||
          !Array.isArray(resData) ||
          resData.length === 0 ||
          !resData[0]
        ) {
          setCumulativeTarget(0);
          setCumulativeSale(0);
          setCumulativePercentage(0);
          Alert.alert('Notice', 'No cumulative achievement data available.');
          return;
        }

        const data = resData[0];
        const target = data.CumulativeTargetsale ?? 0;
        const achieved = data.CumulativeSalesvalue ?? 0;

        setCumulativeTarget(target);
        setCumulativeSale(achieved);
        const percent = target > 0 ? (achieved / target) * 100 : 0;
        setCumulativePercentage(percent);
      })
      .catch(error => {
        console.error('Cumulative API error:', error);
        Alert.alert('Error', 'Failed to fetch cumulative achievement.');
      });
  };

  const pieData = [
    {
      value: percentage,
      color: '#93C83D',
    },
    {
      value: 100 - percentage,
      color: '#4fabf1ff',
    },
  ];
  const cumulativePieData = [
    {value: cumulativePercentage, color: '#93C83D'},
    {value: 100 - cumulativePercentage, color: '#4fabf1ff'},
  ];

  return (
    <>
      <StatusBar backgroundColor="#a9ddfaff" barStyle="light-content" />
      <SafeAreaView style={styles.container}>
        <Text style={styles.dateText}>
          As on {currentDate.toLocaleDateString()}
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardHeader}>Monthly Achievement</Text>

          <View style={styles.chartContainer}>
            <PieChart
              data={pieData}
              radius={80}
              innerRadius={55}
              showText={false}
              donut
              animated
              animationDuration={1000} // duration in ms
              showGradient
            />

            <View style={styles.percentageTextContainer}>
              <Text style={styles.percentageText}>
                {Math.round(percentage)}%
              </Text>
            </View>
          </View>

          <View style={styles.bottomRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Target</Text>
              <Text style={styles.statValue}>{targetValue.toFixed(2)}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Achievement</Text>
              <Text style={styles.statValue}>{saleValue.toFixed(2)}</Text>
            </View>
          </View>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardHeader}>Cumulative Achievement</Text>

          <View style={styles.chartContainer}>
            <PieChart
              data={cumulativePieData}
              radius={80}
              innerRadius={55}
              showText={false}
              donut
              animated
              animationDuration={1000}
              showGradient
            />

            <View style={styles.percentageTextContainer}>
              <Text style={styles.percentageText}>
                {Math.round(cumulativePercentage)}%
              </Text>
            </View>
          </View>

          <View style={styles.bottomRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Target</Text>
              <Text style={styles.statValue}>
                {cumulativeTarget.toFixed(2)}
              </Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Achievement</Text>
              <Text style={styles.statValue}>{cumulativeSale.toFixed(2)}</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
};

export default MyStatusScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6f7',
    alignItems: 'center',
    paddingTop: 20,
  },
  dateText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  card: {
    width: width - 40,
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 25,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    marginBottom: 15,
  },
  cardHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
    marginBottom: 15,
  },
  chartContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 170,
    width: 170,
    position: 'relative',
  },
  percentageTextContainer: {
    position: 'absolute',
    backgroundColor: '#005696',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderColor: '#ffffff',
    borderWidth: 1,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },

  percentageText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },

  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 15,
    marginHorizontal: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4, // For Android shadow
  },

  statLabel: {
    fontSize: 14,
    color: '#888',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#005696',
    marginTop: 4,
  },
});
