import React, {useCallback, useEffect, useState, useLayoutEffect} from 'react';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  BackHandler,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {Sales_URL, BASE_URL} from '@env';
import Ionicons from 'react-native-vector-icons/Ionicons';
import XLSX from 'xlsx';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import RNBlobUtil from 'react-native-blob-util';
import Feather from 'react-native-vector-icons/Feather';
import FastImage from 'react-native-fast-image';
import {CheckBox} from 'react-native-elements';
// ✅ helper to format date as YYYY-MM-DD
const formatDate = date => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// ✅ helper to get month name
const getMonthName = date => {
  return date.toLocaleString('default', {month: 'long'}).toUpperCase();
};

const ComparativeSales = ({route}) => {
  const employeeParam =
    route?.params?.employee || route?.params?.employee1 || null;
  const [salesData, setSalesData] = useState([]);
  const [SaleDataRSE, setSaleDataRSE] = useState([]);
  const [designation, setDesignation] = useState('');
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const [showRawData, setShowRawData] = useState(false);
  const [filteredRSEData, setFilteredRSEData] = useState([]); // FILTERED

  const today = new Date();
  const currentYear = today.getFullYear();
  const shortYear = currentYear.toString().slice(-2);
  const lastYear = currentYear - 1;
  const lastYear1 = shortYear - 1;
  const twoYearsAgo = currentYear - 2;
  const twoYearsAgo1 = shortYear - 2;

  const currentMonth = today.toLocaleString('default', {month: 'long'});
  const previousMonth = new Date(
    today.setMonth(today.getMonth() - 1),
  ).toLocaleString('default', {month: 'long'});
  const currentMonth1 = currentMonth.slice(0, 3).toUpperCase();

  const [activeMonth, setActiveMonth] = useState(currentMonth); // month used for rendering

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
                  params: {selectedEmployee: employeeParam},
                },
              ],
            });
          }}
          style={{marginLeft: 15}}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, employeeParam]);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.reset({
          index: 0,
          routes: [
            {name: 'SALES REPORT', params: {selectedEmployee: employeeParam}},
          ],
        });
        return true;
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () =>
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [navigation, employeeParam]),
  );

  useEffect(() => {
    if (employeeParam) {
      const {Division, POST, EMP_NO} = employeeParam;
      if (POST === 'RSE') {
        setDesignation(POST);
        fetchComparativeSalesDataRSE(EMP_NO);
      } else {
        fetchComparativeSalesData(Division, POST, EMP_NO);
      }
    } else {
      AsyncStorage.getItem('UserDataSales').then(value => {
        if (value !== null) {
          const user = JSON.parse(value);
          const {Division, designationshortform, empno} = user;
          setDesignation(designationshortform);
          if (designationshortform === 'RSE') {
            fetchComparativeSalesDataRSE(empno);
          } else {
            fetchComparativeSalesData(Division, designationshortform, empno);
          }
        }
      });
    }
  }, []);

  const fetchComparativeSalesData = async (division, post, empno) => {
    const actualDivision = division === 'MPPL' ? 'MAD' : division;
    let apiUrl = '';
    console.log('url:', apiUrl);
    if (division === 'MCSO') {
      apiUrl = `${Sales_URL}TotalSales?division=MAD&product=&post=${actualDivision}&empno=${empno}`;
    } else {
      apiUrl = `${Sales_URL}TotalSales?division=${actualDivision}&product=&post=${post}&empno=${empno}`;
    }
    console.log('url:', apiUrl);
    try {
      const response = await axios.post(apiUrl);
      const data = response.data || [];

      // Detect if current month keys exist; else use previous month
      const testItem = data?.[0] || {};
      const testKey = `Actualvalue${currentMonth}${currentYear}`;
      const fallbackKey = `Actualvalue${previousMonth}${currentYear}`;
      if (!testItem[testKey] && testItem[fallbackKey])
        setActiveMonth(previousMonth);

      setSalesData(data);
    } catch (error) {
      console.error('API Error:', error);
      Alert.alert('Error', 'Failed to load comparative sales data.');
    } finally {
      setLoading(false);
    }
  };

  //code for RSE Data
  // const fetchComparativeSalesDataRSE = async (empno) => {
  //     try {
  //         const businessId = "MEND-PVTL-890";
  //         const today = new Date();

  //         const sDate = formatDate(new Date(today.getFullYear(), today.getMonth(), 1));
  //         const eDate = formatDate(today);
  //         const month = getMonthName(today);
  //         const year = today.getFullYear();

  //         const url = `${BASE_URL}RSE/Sales/Report/ComparativeSales?Businessid=${businessId}&EmployeeNo=${empno}`;

  //         console.log("RSE API URL →", url);

  //         const response = await fetch(url);
  //         const result = await response.json();
  //         // console.log("RSE API Response →", result);

  //         // ✅ Fix: Handle both array and object responses
  //         const data = Array.isArray(result) ? result : result.data || [];

  //         if (data.length === 0) {
  //             console.log("⚠️ RSE API returned empty");
  //             setSaleDataRSE([]);
  //         } else {
  //             setSaleDataRSE(data);
  //         }

  //         setLoading(false);
  //     } catch (error) {
  //         console.error("Error fetching RSE data:", error);
  //         Alert.alert("Error", "Failed to load comparative sales data.");
  //         setSaleDataRSE([]);
  //         setLoading(false);
  //     }
  // };
  const fetchComparativeSalesDataRSE = async empno => {
    try {
      const businessId = 'MEND-PVTL-890';
      const today = new Date();

      const url = `${BASE_URL}RSE/Sales/Report/ComparativeSales?Businessid=${businessId}&EmployeeNo=${empno}`;

      const response = await fetch(url);
      const result = await response.json();

      // Ensure raw data is always an array
      const raw = Array.isArray(result)
        ? result
        : Array.isArray(result.data)
        ? result.data
        : [];

      // Save RAW data
      setSaleDataRSE(raw);

      // FILTER → keep only rows where ANY sales value is non-zero
      const filtered = raw.filter(
        item =>
          (item.SaleQtyThisMonthYear ?? 0) !== 0 ||
          (item.SaleValueThisMonthYear ?? 0) !== 0 ||
          (item.SaleQtyLastMonthYear ?? 0) !== 0 ||
          (item.SaleValueLastMonthYear ?? 0) !== 0 ||
          (item.SaleQtyLastPreviousMonthYear ?? 0) !== 0 ||
          (item.SaleValueLastPreviousMonthYear ?? 0) !== 0,
      );

      // Save filtered data
      setFilteredRSEData(filtered);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching RSE data:', error);

      // Reset states on error
      setSaleDataRSE([]);
      setFilteredRSEData([]);
      setLoading(false);
    }
  };

  const getKeys = (month, year) => ({
    actualUnitKey: `Actualunit${month}${year}`,
    actualValueKey: `Actualvalue${month}${year}`,
    unitLastYearKey: `unit${month}${year - 1}`,
    valueLastYearKey: `Value${month}${year - 1}`,
    unitTwoYearsAgoKey: `unit${month}${year - 2}`,
    valueTwoYearsAgoKey: `Value${month}${year - 2}`,
  });

  const keys = getKeys(activeMonth, currentYear);

  const renderTableHeader = () => (
    <View style={[styles.row, styles.headerRow]}>
      <Text style={[styles.headerCell, {width: 150}]}>Product Name</Text>
      <Text style={[styles.headerCell, {width: 60}]}>Pack</Text>
      <Text style={[styles.headerCell, {width: 120}]}>
        {currentMonth1}'{shortYear} IN UNITS{' '}
      </Text>
      <Text style={[styles.headerCell, {width: 120}]}>
        {currentMonth1}'{shortYear} IN VALUES{' '}
      </Text>
      <Text style={[styles.headerCell, {width: 100}]}>
        {currentMonth1}'{lastYear1} IN UNITS{' '}
      </Text>
      <Text style={[styles.headerCell, {width: 100}]}>
        {currentMonth1}'{lastYear1} IN VALUES{' '}
      </Text>
      <Text style={[styles.headerCell, {width: 100}]}>
        {currentMonth1}'{twoYearsAgo1} IN UNITS{' '}
      </Text>
      <Text style={[styles.headerCell, {width: 100}]}>
        {currentMonth1}'{twoYearsAgo1} IN VALUES{' '}
      </Text>
    </View>
  );

  const renderItem = ({item, index}) => (
    <View
      style={[
        styles.row,
        {backgroundColor: index % 2 === 0 ? '#fff' : '#f0f0f0'},
      ]}>
      <View style={styles.row}>
        <Text style={[styles.cell, {width: 150}]}>{item.Column1}</Text>
        <Text style={[styles.cell, {width: 60}]}>{item.Pack}</Text>
        <Text style={[styles.cell, {width: 120}]}>
          {(item[keys.actualUnitKey] ?? 0).toFixed(2)}
        </Text>
        <Text style={[styles.cell, {width: 120}]}>
          {(item[keys.actualValueKey] ?? 0).toFixed(2)}
        </Text>
        <Text style={[styles.cell, {width: 100}]}>
          {(item[keys.unitLastYearKey] ?? 0).toFixed(2)}
        </Text>
        <Text style={[styles.cell, {width: 100}]}>
          {(item[keys.valueLastYearKey] ?? 0).toFixed(2)}
        </Text>
        <Text style={[styles.cell, {width: 100}]}>
          {(item[keys.unitTwoYearsAgoKey] ?? 0).toFixed(2)}
        </Text>
        <Text style={[styles.cell, {width: 100}]}>
          {(item[keys.valueTwoYearsAgoKey] ?? 0).toFixed(2)}
        </Text>
      </View>
    </View>
  );

  const renderItemRSE = ({item, index}) => (
    <View
      style={[
        styles.row,
        {backgroundColor: index % 2 === 0 ? '#fff' : '#f0f0f0'},
      ]}>
      <View style={styles.row}>
        <Text style={[styles.cell, {width: 150}]}>{item.Product}</Text>
        <Text style={[styles.cell, {width: 60}]}>{item.Pack}</Text>
        <Text style={[styles.cell, {width: 120}]}>
          {(item.SaleQtyThisMonthYear ?? 0).toFixed(2)}
        </Text>
        <Text style={[styles.cell, {width: 120}]}>
          {(item.SaleValueThisMonthYear ?? 0).toFixed(2)}
        </Text>
        <Text style={[styles.cell, {width: 100}]}>
          {(item.SaleQtyLastMonthYear ?? 0).toFixed(2)}
        </Text>
        <Text style={[styles.cell, {width: 100}]}>
          {(item.SaleValueLastMonthYear ?? 0).toFixed(2)}
        </Text>
        <Text style={[styles.cell, {width: 100}]}>
          {(item.SaleQtyLastPreviousMonthYear ?? 0).toFixed(2)}
        </Text>
        <Text style={[styles.cell, {width: 100}]}>
          {(item.SaleValueLastPreviousMonthYear ?? 0).toFixed(2)}
        </Text>
      </View>
    </View>
  );

  // ---------- helpers to build workbook once ----------
  const buildWorkbookBase64 = () => {
    const formattedData = salesData.map(item => ({
      'Product Name': item.Column1,
      Pack: item.Pack,
      [`${currentMonth1}'${shortYear} IN UNITS`]: item[keys.actualUnitKey] ?? 0,
      [`${currentMonth1}'${shortYear} IN VALUES`]:
        item[keys.actualValueKey] ?? 0,
      [`${currentMonth1}'${lastYear1} IN UNITS`]:
        item[keys.unitLastYearKey] ?? 0,
      [`${currentMonth1}'${lastYear1} IN VALUES`]:
        item[keys.valueLastYearKey] ?? 0,
      [`${currentMonth1}'${twoYearsAgo1} IN UNITS`]:
        item[keys.unitTwoYearsAgoKey] ?? 0,
      [`${currentMonth1}'${twoYearsAgo1} IN VALUES`]:
        item[keys.valueTwoYearsAgoKey] ?? 0,
    }));

    const ws = XLSX.utils.json_to_sheet(formattedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Comparative Sales');
    const b64 = XLSX.write(wb, {type: 'base64', bookType: 'xlsx'});
    return b64;
  };

  const RSEbuildWorkbookBase64 = () => {
    const formattedData = SaleDataRSE.map(item => ({
      'Product Name': item.MPHARMPDNAME,
      Pack: item.Pack,
      [`${currentMonth1}'${shortYear} IN UNITS`]: item[keys.actualUnitKey] ?? 0,
      [`${currentMonth1}'${shortYear} IN VALUES`]:
        item[keys.actualValueKey] ?? 0,
      [`${currentMonth1}'${lastYear1} IN UNITS`]:
        item[keys.unitLastYearKey] ?? 0,
      [`${currentMonth1}'${lastYear1} IN VALUES`]:
        item[keys.valueLastYearKey] ?? 0,
      [`${currentMonth1}'${twoYearsAgo1} IN UNITS`]:
        item[keys.unitTwoYearsAgoKey] ?? 0,
      [`${currentMonth1}'${twoYearsAgo1} IN VALUES`]:
        item[keys.valueTwoYearsAgoKey] ?? 0,
    }));

    const ws = XLSX.utils.json_to_sheet(formattedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Comparative Sales');
    const b64 = XLSX.write(wb, {type: 'base64', bookType: 'xlsx'});
    return b64;
  };

  const MIME_XLSX =
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

  // ---------- Share flow (cache + share + Android intent fallback) ----------
  const shareExcel = async () => {
    if (designation === 'RSE') {
      try {
        if (!SaleDataRSE?.length) {
          Alert.alert('No data to export');
          return;
        }

        const b64 = RSEbuildWorkbookBase64();
        const fileName = `ComparativeSales_${Date.now()}.xlsx`;
        const cachePath = `${RNFS.CachesDirectoryPath}/${fileName}`;
        await RNFS.writeFile(cachePath, b64, 'base64');

        const exists = await RNFS.exists(cachePath);
        if (!exists) throw new Error('File not created');

        const fileUrl =
          Platform.OS === 'android' ? `file://${cachePath}` : cachePath;

        try {
          await Share.open({
            url: fileUrl,
            type: MIME_XLSX,
            filename: fileName,
            failOnCancel: false,
            showAppsToView: true,
            saveToFiles: true, // iOS Files app
          });
        } catch (shareErr) {
          // Fallback for some Android ROMs
          if (Platform.OS === 'android') {
            try {
              await RNBlobUtil.android.actionViewIntent(cachePath, MIME_XLSX);
            } catch (intentErr) {
              console.error('Intent open error:', intentErr);
              throw shareErr;
            }
          } else {
            throw shareErr;
          }
        }
      } catch (e) {
        console.error('Excel Share Error:', e);
        Alert.alert('Error', 'Failed to share Excel file');
      }
    } else {
      try {
        if (!salesData?.length) {
          Alert.alert('No data to export');
          return;
        }

        const b64 = buildWorkbookBase64();
        const fileName = `ComparativeSales_${Date.now()}.xlsx`;
        const cachePath = `${RNFS.CachesDirectoryPath}/${fileName}`;
        await RNFS.writeFile(cachePath, b64, 'base64');

        const exists = await RNFS.exists(cachePath);
        if (!exists) throw new Error('File not created');

        const fileUrl =
          Platform.OS === 'android' ? `file://${cachePath}` : cachePath;

        try {
          await Share.open({
            url: fileUrl,
            type: MIME_XLSX,
            filename: fileName,
            failOnCancel: false,
            showAppsToView: true,
            saveToFiles: true, // iOS Files app
          });
        } catch (shareErr) {
          // Fallback for some Android ROMs
          if (Platform.OS === 'android') {
            try {
              await RNBlobUtil.android.actionViewIntent(cachePath, MIME_XLSX);
            } catch (intentErr) {
              console.error('Intent open error:', intentErr);
              throw shareErr;
            }
          } else {
            throw shareErr;
          }
        }
      } catch (e) {
        console.error('Excel Share Error:', e);
        Alert.alert('Error', 'Failed to share Excel file');
      }
    }
  };

  // ---------- Download flow (Android Downloads / iOS Save to Files) ----------
  const downloadExcel = async () => {
    if (designation === 'RSE') {
      try {
        if (!SaleDataRSE?.length) {
          Alert.alert('No data to export');
          return;
        }

        const b64 = RSEbuildWorkbookBase64();
        const fileName = `ComparativeSales_${Date.now()}.xlsx`;

        if (Platform.OS === 'android') {
          // Android < 10 needs WRITE_EXTERNAL_STORAGE
          if (Platform.Version < 29) {
            const granted = await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
              {
                title: 'Storage Permission',
                message: 'Allow saving Excel to your Downloads folder.',
                buttonPositive: 'OK',
              },
            );
            if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
              Alert.alert(
                'Permission denied',
                'Cannot save without storage permission.',
              );
              return;
            }
          }

          const downloadsDir = RNFS.DownloadDirectoryPath; // public Downloads
          const destPath = `${downloadsDir}/${fileName}`;
          await RNFS.writeFile(destPath, b64, 'base64');

          // Register the download so it shows in the Downloads app/notification
          try {
            await RNBlobUtil.android.addCompleteDownload({
              title: fileName,
              description: 'Excel exported from the ie.CRM app',
              mime: MIME_XLSX,
              path: destPath,
              showNotification: true,
              scannable: true,
            });
          } catch {
            try {
              await RNBlobUtil.fs.scanFile([{path: destPath, mime: MIME_XLSX}]);
            } catch {}
          }

          Alert.alert('Saved', `File saved to Downloads\n${destPath}`);
        } else {
          // iOS — open Files sheet so user chooses iCloud/On My iPhone
          const cachePath = `${RNFS.CachesDirectoryPath}/${fileName}`;
          await RNFS.writeFile(cachePath, b64, 'base64');
          await Share.open({
            url: `file://${cachePath}`,
            type: MIME_XLSX,
            filename: fileName,
            saveToFiles: true,
            failOnCancel: false,
          });
        }
      } catch (e) {
        console.error('Excel Download Error:', e);
        Alert.alert('Error', 'Failed to save Excel file');
      }
    } else {
      try {
        if (!salesData?.length) {
          Alert.alert('No data to export');
          return;
        }

        const b64 = buildWorkbookBase64();
        const fileName = `ComparativeSales_${Date.now()}.xlsx`;

        if (Platform.OS === 'android') {
          // Android < 10 needs WRITE_EXTERNAL_STORAGE
          if (Platform.Version < 29) {
            const granted = await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
              {
                title: 'Storage Permission',
                message: 'Allow saving Excel to your Downloads folder.',
                buttonPositive: 'OK',
              },
            );
            if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
              Alert.alert(
                'Permission denied',
                'Cannot save without storage permission.',
              );
              return;
            }
          }

          const downloadsDir = RNFS.DownloadDirectoryPath; // public Downloads
          const destPath = `${downloadsDir}/${fileName}`;
          await RNFS.writeFile(destPath, b64, 'base64');

          // Register the download so it shows in the Downloads app/notification
          try {
            await RNBlobUtil.android.addCompleteDownload({
              title: fileName,
              description: 'Excel exported from the ie.CRM app',
              mime: MIME_XLSX,
              path: destPath,
              showNotification: true,
              scannable: true,
            });
          } catch {
            try {
              await RNBlobUtil.fs.scanFile([{path: destPath, mime: MIME_XLSX}]);
            } catch {}
          }

          Alert.alert('Saved', `File saved to Downloads\n${destPath}`);
        } else {
          // iOS — open Files sheet so user chooses iCloud/On My iPhone
          const cachePath = `${RNFS.CachesDirectoryPath}/${fileName}`;
          await RNFS.writeFile(cachePath, b64, 'base64');
          await Share.open({
            url: `file://${cachePath}`,
            type: MIME_XLSX,
            filename: fileName,
            saveToFiles: true,
            failOnCancel: false,
          });
        }
      } catch (e) {
        console.error('Excel Download Error:', e);
        Alert.alert('Error', 'Failed to save Excel file');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#a9ddfaff" barStyle="light-content" />
      <Text style={styles.title}>Comparative Sales Report</Text>
      {/* <View>
        <CheckBox
          title="Raw Data"
          checked={showRawData}
          onPress={() => setShowRawData(!showRawData)}
          containerStyle={{backgroundColor: 'transparent', borderWidth: 0}}
        />

        {(showRawData ? SaleDataRSE : filteredRSEData).map((item, index) =>
          renderItemRSE({item, index}),
        )}
      </View> */}

      {/* Share & Download buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.primaryButton} onPress={shareExcel}>
          <Feather
            name="share-2"
            size={18}
            color="#fff"
            style={{marginRight: 6}}
          />
          <Text style={styles.buttonText}>Share</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={downloadExcel}>
          <Feather
            name="download"
            size={18}
            color="#fff"
            style={{marginRight: 6}}
          />
          <Text style={styles.buttonText}>Download</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        // <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        //     <ActivityIndicator size="large" color="#0E7777" />
        //     <Text style={{ marginTop: 10, fontSize: 16 }}>Loading...</Text>
        // </View>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#ffffff',
          }}>
          <FastImage
            source={require('../images/cellphone_19016610.gif')} // 👈 put your gif here
            style={{width: 250, height: 200}}
            resizeMode={FastImage.resizeMode.contain}
          />
          <Text style={{marginTop: 10, fontSize: 16, color: '#0E7777'}}>
            Loading...
          </Text>
        </View>
      ) : (
        <ScrollView horizontal>
          <View>
            {designation === 'RSE' ? (
              <>
                {/* 🔹 Raw Data Checkbox */}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 10,
                  }}>
                  <CheckBox
                    checked={showRawData}
                    onPress={() => setShowRawData(!showRawData)}
                  />
                  <Text style={{fontSize: 16}}>Display 0 value Data</Text>
                </View>

                {renderTableHeader()}

                {/* 🔹 Select Data Source Based on Checkbox */}
                {showRawData ? (
                  SaleDataRSE.length > 0 ? (
                    <FlatList
                      data={SaleDataRSE}
                      renderItem={renderItemRSE}
                      keyExtractor={(_, index) => index.toString()}
                    />
                  ) : (
                    <Text style={{marginTop: 20, textAlign: 'center'}}>
                      No Data Found
                    </Text>
                  )
                ) : filteredRSEData.length > 0 ? (
                  <FlatList
                    data={filteredRSEData}
                    renderItem={renderItemRSE}
                    keyExtractor={(_, index) => index.toString()}
                  />
                ) : (
                  <Text style={{marginTop: 20, textAlign: 'center'}}>
                    No Data Found
                  </Text>
                )}
              </>
            ) : (
              <>
                {renderTableHeader()}
                {salesData.length > 0 ? (
                  <FlatList
                    data={salesData}
                    renderItem={renderItem}
                    keyExtractor={(_, index) => index.toString()}
                  />
                ) : (
                  <Text style={{marginTop: 20, textAlign: 'center'}}>
                    No Data Found
                  </Text>
                )}
              </>
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default ComparativeSales;

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#ffffff', padding: 10},
  title: {
    fontSize: 18,
    color: '#005696',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 0.8,
    borderBottomColor: '#bbb',
  },
  headerRow: {backgroundColor: '#005696'},
  cell: {
    padding: 8,
    fontSize: 12,
    textAlign: 'center',
    color: '#333',
    borderRightWidth: 1,
    borderRightColor: '#ccc',
  },
  headerCell: {
    padding: 8,
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#fff',
    borderRightWidth: 1,
    borderRightColor: '#fff',
  },

  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#005696',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 100,
    flexDirection: 'row',
  },
  secondaryButton: {
    backgroundColor: '#005696',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 130,
    flexDirection: 'row',
  },
  buttonText: {color: '#fff', fontWeight: 'bold'},
});
