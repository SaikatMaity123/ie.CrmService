import React, {useCallback, useEffect, useState, useLayoutEffect} from 'react';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  Alert,
  BackHandler,
  StatusBar,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import RNPickerSelect from 'react-native-picker-select';
import {MultiSelect, Dropdown} from 'react-native-element-dropdown';
import {Sales_URL} from '@env';
import Ionicons from 'react-native-vector-icons/Ionicons';

const HierarchyWiseSale = ({route}) => {
  const employeeParam = route?.params?.employee || null;
  const [loading, setLoading] = useState(true);
  const [postList, setPostList] = useState([]);
  const [employeeList, setEmployeeList] = useState([]);
  const navigation = useNavigation(); // <-- Use the useNavigation hook
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedEmpNo, setSelectedEmpNo] = useState(null);
  const [selectedEmployeeData1, setSelectedEmployeeData] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => {
            // 🔁 Reset state before navigating back
            setSelectedPost(null);
            setSelectedEmployee(null);
            setSelectedEmpNo(null);
            setSelectedEmployeeData(null);
            setEmployeeList([]);
            setShowModal(false);
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
      // ✅ Reset state on every focus
      setSelectedPost(null);
      setSelectedEmployee(null);
      setSelectedEmpNo(null);
      setSelectedEmployeeData(null);
      setEmployeeList([]);
      setShowModal(false);

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

  // useEffect(() => {
  //     AsyncStorage.getItem('UserDataSales').then(value => {
  //         if (value !== null) {
  //             const user = JSON.parse(value);
  //             setUserInfo(user);
  //             const { Division, designationshortform, empno } = user;
  //             // const actualDivision = Division === "MPPL" ? "MAD" : Division;
  //             // const postParam = Designation === 'MFSO' ? 'MSR-MFSO' : Designation;
  //             const apiUrl = `${Sales_URL}DivDesigPost?division=${Division}&Action=Spost&empPost=${designationshortform}&empno=${empno}`;

  //             axios.post(apiUrl).then(response => {
  //                 const posts = response.data.map(item => ({
  //                     label: item.post,
  //                     value: item.post,
  //                 }));
  //                 setPostList(posts);
  //                 setLoading(false);
  //             }).catch(error => {
  //                 console.error('API Error:', error);
  //                 setLoading(false);
  //             });
  //         }
  //     });
  // }, []);

  // ✅ Fetch posts, and if employeeParam exists, preselect post & employee

  useEffect(() => {
    setSelectedPost(null);
    setSelectedEmployee(null);
    setSelectedEmpNo(null);
    setSelectedEmployeeData(null);
    setEmployeeList([]);
    setShowModal(false);

    const boot = async () => {
      // If an employee was passed, use that for ALL calls
      if (employeeParam) {
        const actualDivision =
          employeeParam.Division === 'MPPL' ? 'MAD' : employeeParam.Division;
        const basePost = employeeParam.POST || employeeParam.post;
        const baseEmpNo = employeeParam.EMP_NO || employeeParam.empno;

        // 1) Load posts for the passed employee
        const postsUrl = `${Sales_URL}DivDesigPost?division=${actualDivision}&Action=Spost&empPost=${basePost}&empno=${baseEmpNo}`;
        console.log('Spost (by param):', postsUrl);

        try {
          const res = await axios.post(postsUrl);
          const posts = (res.data || []).map(p => ({
            label: p.post,
            value: p.post,
          }));
          setPostList(posts);

          // Preselect the employee's own post
          setSelectedPost(basePost);

          // 2) Load employees under that post and preselect the same employee
          await fetchEmployeesByPost(
            basePost,
            actualDivision,
            baseEmpNo,
            employees => {
              const match = employees.find(
                e =>
                  e?.data?.EMP_NO === baseEmpNo || e?.data?.empno === baseEmpNo,
              );
              if (match) {
                setSelectedEmployee(match.value);
                setSelectedEmpNo(match.value);
                setSelectedEmployeeData(match.data);
              }
            },
          );
        } catch (e) {
          console.error('Spost (by param) error:', e);
          Alert.alert('Error', 'Failed to load posts for selected employee.');
        } finally {
          setLoading(false);
        }
        return;
      }

      // Fallback: same as your old flow (logged-in user)
      const value = await AsyncStorage.getItem('UserDataSales');
      if (value) {
        const user = JSON.parse(value);
        setUserInfo(user);
        const {Division, designationshortform, empno} = user;
        const postsUrl = `${Sales_URL}DivDesigPost?division=${Division}&Action=Spost&empPost=${designationshortform}&empno=${empno}`;
        console.log('Spost (by user):', postsUrl);
        try {
          const res = await axios.post(postsUrl);
          const posts = (res.data || []).map(p => ({
            label: p.post,
            value: p.post,
          }));
          setPostList(posts);
        } catch (e) {
          console.error('Spost (by user) error:', e);
          Alert.alert('Error', 'Failed to load posts.');
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    boot();
  }, []); // eslint-disable-line

  // const fetchEmployeesByPost = post => {
  //     if (!userInfo) return;
  //     const { Division, empno } = userInfo;
  //     //const actualDivision = Division === "MPPL" ? "MAD" : Division;
  //     const apiUrl = `${Sales_URL}DivDesigPost?division=${Division}&Action=SEMP&empno=${empno}&emppost=${post}`;
  //     console.log('Fetching employees with URL:', apiUrl);

  //     setLoading(true);
  //     axios.post(apiUrl).then(response => {
  //         const employees = response.data.map(emp => ({
  //             label: emp.NAME,
  //             value: emp.EMP_NO,
  //             data: emp, // Store full object
  //         }));

  //         setEmployeeList(employees);
  //         setSelectedEmployee(null);
  //         setSelectedEmpNo(null);
  //         setLoading(false);
  //     }).catch(error => {
  //         console.error('Employee API Error:', error);
  //         setLoading(false);
  //     });
  // };

  const fetchEmployeesByPost = async (
    post,
    baseDivision,
    baseEmpNo,
    afterLoad,
  ) => {
    try {
      const divisionToUse =
        baseDivision ??
        (employeeParam
          ? employeeParam.Division === 'MPPL'
            ? 'MAD'
            : employeeParam.Division
          : userInfo?.Division);

      const managerEmpNoToUse =
        baseEmpNo ??
        (employeeParam
          ? employeeParam.EMP_NO || employeeParam.empno
          : userInfo?.empno);

      if (!divisionToUse || !managerEmpNoToUse) return;

      const url = `${Sales_URL}DivDesigPost?division=${divisionToUse}&Action=SEMP&empno=${managerEmpNoToUse}&emppost=${post}`;
      console.log('SEMP:', url);

      setLoading(true);
      const res = await axios.post(url);
      const employees = (res.data || []).map(emp => ({
        label: emp.NAME,
        value: emp.EMP_NO,
        data: emp,
      }));

      setEmployeeList(employees);
      setSelectedEmployee(null);
      setSelectedEmpNo(null);

      if (typeof afterLoad === 'function') afterLoad(employees);
    } catch (e) {
      console.error('SEMP error:', e);
      Alert.alert('Error', 'Failed to load employees.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (selectedEmployee) {
      setShowModal(true);
    }
  };

  const handleNavigate = screenName => {
    setShowModal(false);

    if (Platform.OS === 'android') {
      // Android supports reset safely
      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [
            {
              name: screenName,
              params: {employee1: selectedEmployeeData1},
            },
          ],
        });
      }, 200); // small delay for modal close
    } else {
      // iOS must use navigate()
      setTimeout(() => {
        navigation.navigate(screenName, {
          employee1: selectedEmployeeData1,
        });
      }, 0);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#a9ddfaff" barStyle="light-content" />
      <Text style={styles.title}>Hierarchy Filter</Text>

      {loading && <ActivityIndicator size="large" color="#005696" />}

      {!loading && (
        <>
          {/* Post Dropdown */}
          {postList.length > 0 && (
            <Dropdown
              style={styles.picker}
              containerStyle={{borderRadius: 8}}
              data={postList} // format: [{ label, value }]
              labelField="label"
              valueField="value"
              placeholder="Select Post"
              search
              searchPlaceholder="Search post..."
              value={selectedPost}
              onChange={item => {
                setSelectedPost(item.value);
                fetchEmployeesByPost(item.value);
              }}
            />
          )}

          {/* Employee Dropdown */}
          {employeeList.length > 0 && (
            <Dropdown
              style={styles.picker}
              containerStyle={{borderRadius: 4}}
              data={employeeList} // [{ label, value, data }]
              labelField="label"
              valueField="value"
              placeholder="Select Employee"
              search
              searchPlaceholder="Search employee..."
              value={selectedEmployee}
              onChange={item => {
                const selected = item;

                if (
                  selected?.data?.EMP_NO === 0 ||
                  selected?.data?.empemail === null
                ) {
                  Alert.alert(
                    'Wrong Selection',
                    'This employee is not currently working.',
                  );
                  // ✅ Reset dropdown
                  setSelectedEmployee(null);
                  setSelectedEmpNo(null);
                  setSelectedEmployeeData(null);
                  return;
                }

                setSelectedEmployee(selected.value);
                setSelectedEmpNo(selected.value);
                setSelectedEmployeeData(selected.data);
              }}
            />
          )}

          {/* ✅ Apply Button */}
          {selectedEmployee && (
            <TouchableOpacity style={styles.button} onPress={handleApply}>
              <Text style={styles.buttonText}>Apply</Text>
            </TouchableOpacity>
          )}
        </>
      )}

      {/* ✅ Modal on Apply Click */}
      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Report Type</Text>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => handleNavigate('Comparative Sales')}>
              <Text style={styles.modalButtonText}>Comparative Sales</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => handleNavigate('ProductWise Sales')}>
              <Text style={styles.modalButtonText}>Product Wise Sales</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => handleNavigate('MY STATUS')}>
              <Text style={styles.modalButtonText}>Achievement</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowModal(false)}
              style={[styles.modalButton, {backgroundColor: '#ccc'}]}>
              <Text style={[styles.modalButtonText, {color: '#333'}]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default HierarchyWiseSale;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#005696',
    marginBottom: 20,
    textAlign: 'center',
  },
  picker: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1.3,
    borderColor: '#005696',
    borderRadius: 10,
    backgroundColor: '#fff',
    color: '#000000',
    marginBottom: 15,
    paddingRight: 30,

    // Shadow for iOS
    shadowColor: '#005696',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,

    // Shadow for Android
    elevation: 5,
  },

  button: {
    backgroundColor: '#005696',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    width: '80%',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#005696',
  },
  modalButton: {
    backgroundColor: '#005696',
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
});
