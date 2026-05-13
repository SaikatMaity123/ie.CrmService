import React, { useCallback, useEffect, useState, useLayoutEffect } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
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
  PermissionsAndroid,
  Platform,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Sales_URL, BASE_URL } from '@env';
import Ionicons from 'react-native-vector-icons/Ionicons';
import XLSX from 'xlsx';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import RNBlobUtil from 'react-native-blob-util';
import Feather from 'react-native-vector-icons/Feather';
import FastImage from 'react-native-fast-image';
// ✅ helper to format date as YYYY-MM-DD
const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// ✅ helper to get month name
const getMonthName = (date) => {
  return date.toLocaleString("default", { month: "long" }).toUpperCase();
};

const ProductWiseSale = ({ route }) => {
  const employeeParam = route?.params?.employee || route?.params?.employee1 || null;
  const [salesData, setSalesData] = useState([]);
  const [SaleDataRSE, setSaleDataRSE] = useState([]);
  const [designation, setDesignation] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeMonth, setActiveMonth] = useState('');
  const [monthSuffix, setMonthSuffix] = useState('');
  const navigation = useNavigation();

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentYearShort = currentYear.toString().slice(-2);
  const lastYear = currentYear - 1;
  const lastYearShort = (parseInt(currentYearShort) - 1).toString();

  const currentMonth = today.toLocaleString('default', { month: 'long' });
  const currentMonthShort = today.toLocaleString('default', { month: 'short' }).toUpperCase();

  const previousMonthDate = new Date();
  previousMonthDate.setMonth(previousMonthDate.getMonth() - 1);
  const previousMonth = previousMonthDate.toLocaleString('default', { month: 'long' });

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'SALES REPORT', params: { selectedEmployee: employeeParam } }],
            });
          }}
          style={{ marginLeft: 15 }}
        >
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
            { name: 'SALES REPORT', params: employeeParam ? { selectedEmployee: employeeParam } : undefined },
          ],
        });
        return true;
      };
      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [navigation, employeeParam]),
  );

  useEffect(() => {
    if (employeeParam) {
      const { Division, POST, EMP_NO } = employeeParam;
      if (POST === "RSE") {
        setDesignation(POST);
        fetchProductSalesDataRSE(EMP_NO);
      } else {
        fetchProductSalesData(Division, POST, EMP_NO);
      }
    } else {
      AsyncStorage.getItem('UserDataSales').then(value => {
        if (value !== null) {
          const user = JSON.parse(value);
          const { Division, designationshortform, empno } = user;
          setDesignation(designationshortform);
          const postParam = getPostParam(designationshortform);
          if (designationshortform === "RSE") {
            fetchProductSalesDataRSE(empno);
          } else {
            fetchProductSalesData(Division, postParam, empno);
          }
        }
      });
    }
  }, []);

  const getPostParam = designation =>
    designation === 'MFSO' ? 'MSR-MFSO' : designation === 'ASM' ? 'DSO-ASM' : designation;

  const fetchProductSalesData = (division, post, empno) => {
    const actualDivision = division === 'MPPL' ? 'MAD' : division;
    let apiUrl = '';
    if (division === 'MCSO') {
      apiUrl = `${Sales_URL}TotalSales?division=MAD&product=&post=${actualDivision}&empno=${empno}`;
    } else {
      apiUrl = `${Sales_URL}TotalSales?division=${actualDivision}&product=&post=${post}&empno=${empno}`;
    }
    axios
      .post(apiUrl)
      .then(response => {
        const data = response.data || [];
        const firstItem = data?.[0] || {};
        const testKey = `Actualunit${currentMonth}${currentYear}`;
        const fallbackKey = `Actualunit${previousMonth}${currentYear}`;

        const useMonth = firstItem[testKey] != null ? currentMonth : previousMonth;
        setActiveMonth(useMonth);
        setMonthSuffix(`${useMonth}${currentYear}`);
        setSalesData(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('API Error:', error);
        Alert.alert('Error', 'Failed to load product-wise sales data.');
        setLoading(false);
      });
  };

  const fetchProductSalesDataRSE = async (empno) => {
    try {
      const businessId = "MEND-PVTL-890";
      const today = new Date();

      const sDate = formatDate(new Date(today.getFullYear(), today.getMonth(), 1));
      const eDate = formatDate(today);
      const month = getMonthName(today);
      const year = today.getFullYear();

      const url = `${BASE_URL}RSE/Sales/Report/ProductWiseSales?Businessid=${businessId}&EmployeeNo=${empno}`;

      console.log("RSE API URL →", url);

      const response = await fetch(url);
      const result = await response.json();
      // console.log("RSE API Response →", result);

      // ✅ Fix: Handle both array and object responses
      const data = Array.isArray(result) ? result : result.data || [];

      if (data.length === 0) {
        console.log("⚠️ RSE API returned empty");
        setSaleDataRSE([]);
      } else {
        const firstItem = data?.[0] || {};
        const testKey = `Actualunit${currentMonth}${currentYear}`;
        const fallbackKey = `Actualunit${previousMonth}${currentYear}`;

        const useMonth = firstItem[testKey] != null ? currentMonth : previousMonth;
        setActiveMonth(useMonth);
        setMonthSuffix(`${useMonth}${currentYear}`);
        setSaleDataRSE(data);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching RSE data:", error);
      Alert.alert("Error", "Failed to load comparative sales data.");
      setSaleDataRSE([]);
      setLoading(false);
    }
  }

  const renderTableHeader = () => (
    <View style={[styles.row, styles.headerRow]}>
      <Text style={[styles.headerCell, { width: 150 }]}>Product Name</Text>
      <Text style={[styles.headerCell, { width: 60 }]}>Pack</Text>
      <Text style={[styles.headerCell, { width: 100 }]}>
        TGT {currentMonthShort}'{currentYearShort}
      </Text>
      <Text style={[styles.headerCell, { width: 120 }]}>
        MENDINE {currentMonthShort}'{currentYearShort}
      </Text>
      <Text style={[styles.headerCell, { width: 100 }]}>
        MENDINE {currentMonthShort}'{lastYearShort}
      </Text>
      <Text style={[styles.headerCell, { width: 100 }]}>ACH</Text>
    </View>
  );

  const renderItem = ({ item, index }) => {
    const tgtValue = item?.[`TGTVALUE${monthSuffix}`] || 0;
    const actualValue = item?.[`Actualvalue${monthSuffix}`] || 0;
    let achievementPercent = tgtValue > 0 ? (actualValue / tgtValue) * 100 : 0;
    if (achievementPercent > 0 && achievementPercent < 1) achievementPercent = 1;
    else if (achievementPercent < 1) achievementPercent = 0;

    return (
      <View style={[styles.row, { backgroundColor: index % 2 === 0 ? '#fff' : '#f0f0f0' }]}>
        <Text style={[styles.cell, { width: 150 }]}>{item.Column1}</Text>
        <Text style={[styles.cell, { width: 60 }]}>{item.Pack}</Text>
        <Text style={[styles.cell, { width: 100 }]}>
          {item[`TGTUNIT${monthSuffix}`]?.toFixed(2) || '0.00'}
        </Text>
        <Text style={[styles.cell, { width: 120 }]}>
          {item[`Actualunit${monthSuffix}`]?.toFixed(2) || '0.00'}
        </Text>
        <Text style={[styles.cell, { width: 100 }]}>
          {item[`unit${activeMonth}${lastYear}`]?.toFixed(2) || '0.00'}
        </Text>
        <Text style={[styles.cell, { width: 100 }]}>{Math.round(achievementPercent)}%</Text>
      </View>
    );
  };

  const getValue = (obj, key) => {
    if (!obj) return 0;
    // try exact
    if (obj[key] !== undefined) return obj[key];
    // fallback: case-insensitive search
    const foundKey = Object.keys(obj).find(k => k.toLowerCase() === key.toLowerCase());
    return foundKey ? obj[foundKey] : 0;
  };

  const renderItemRSE = ({ item, index }) => {
    const tgtValue = getValue(item, `TargetValueThisMonthYear`);
    const actualValue = getValue(item, `ActualSaleValueThisMonthYear`);
    let achievementPercent = tgtValue > 0 ? (actualValue / tgtValue) * 100 : 0;
    if (achievementPercent > 0 && achievementPercent < 1) achievementPercent = 1;
    else if (achievementPercent < 1) achievementPercent = 0;

    return (
      <View style={[styles.row, { backgroundColor: index % 2 === 0 ? '#fff' : '#f0f0f0' }]}>
        <Text style={[styles.cell, { width: 150 }]}>{item.Product}</Text>
        <Text style={[styles.cell, { width: 60 }]}>{item.Pack}</Text>
        <Text style={[styles.cell, { width: 100 }]}>
          {(item.TargetQtyThisMonthYear ?? 0).toFixed(2)}
        </Text>
        <Text style={[styles.cell, { width: 120 }]}>
          {(item.ActualSaleQtyThisMonthYear ?? 0).toFixed(2)}
        </Text>
        <Text style={[styles.cell, { width: 100 }]}>
          {(item.ActualSaleQtyThisMonthYear ?? 0).toFixed(2)}
        </Text>
        <Text style={[styles.cell, { width: 100 }]}>{Math.round(achievementPercent)}%</Text>
      </View>
    );
  };


  // ---------- Build workbook once (base64) ----------
  const MIME_XLSX =
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

  const buildWorkbookBase64 = () => {
    const formattedData = salesData.map(item => {
      const tgtValue = item?.[`TGTVALUE${monthSuffix}`] || 0;
      const actualValue = item?.[`Actualvalue${monthSuffix}`] || 0;
      const lastYearValue = item?.[`unit${activeMonth}${lastYear}`] || 0;
      let ach = tgtValue > 0 ? (actualValue / tgtValue) * 100 : 0;
      if (ach > 0 && ach < 1) ach = 1;
      else if (ach < 1) ach = 0;

      return {
        'Product Name': item.Column1,
        Pack: item.Pack,
        [`TGT ${currentMonthShort}'${currentYearShort}`]:
          item[`TGTUNIT${monthSuffix}`] || 0,
        [`MENDINE ${currentMonthShort}'${currentYearShort}`]:
          item[`Actualunit${monthSuffix}`] || 0,
        [`MENDINE ${currentMonthShort}'${lastYearShort}`]: lastYearValue,
        'ACH %': Math.round(ach),
      };
    });

    const ws = XLSX.utils.json_to_sheet(formattedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sales Report');
    return XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
  };

  const RSEbuildWorkbookBase64 = () => {
    const formattedData = SaleDataRSE.map(item => {
      const tgtValue = getValue(item, `TGTVALUE${monthSuffix}`);
      const actualValue = getValue(item, `Actualvalue${monthSuffix}`);
      const lastYearValue = getValue(item, `unit${activeMonth}${lastYear}`);

      let ach = tgtValue > 0 ? (actualValue / tgtValue) * 100 : 0;
      if (ach > 0 && ach < 1) ach = 1;
      else if (ach < 1) ach = 0;

      return {
        'Product Name': item.MPHARMPDNAME,
        Pack: item.Pack,
        [`TGT ${currentMonthShort}'${currentYearShort}`]: getValue(item, `TGTUNIT${monthSuffix}`),
        [`MENDINE ${currentMonthShort}'${currentYearShort}`]: getValue(item, `Actualunit${monthSuffix}`),
        [`MENDINE ${currentMonthShort}'${lastYearShort}`]: lastYearValue,
        'ACH %': Math.round(ach),
      };
    });

    const ws = XLSX.utils.json_to_sheet(formattedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sales Report');
    return XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
  };


  // ---------- Share ----------
  const shareExcel = async () => {
    if (designation === "RSE") {
      try {
        if (!SaleDataRSE?.length) {
          Alert.alert('No data to export');
          return;
        }
        const b64 = RSEbuildWorkbookBase64();
        const fileName = `ProductWiseSalesReport_${Date.now()}.xlsx`;
        const cachePath = `${RNFS.CachesDirectoryPath}/${fileName}`;

        await RNFS.writeFile(cachePath, b64, 'base64');
        const exists = await RNFS.exists(cachePath);
        if (!exists) throw new Error('File not created');

        const fileUrl = Platform.OS === 'android' ? `file://${cachePath}` : cachePath;

        try {
          await Share.open({
            url: fileUrl,
            type: MIME_XLSX,
            filename: fileName,
            failOnCancel: false,
            showAppsToView: true,
            saveToFiles: true,
          });
        } catch (shareErr) {
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
        const fileName = `ProductWiseSalesReport_${Date.now()}.xlsx`;
        const cachePath = `${RNFS.CachesDirectoryPath}/${fileName}`;

        await RNFS.writeFile(cachePath, b64, 'base64');
        const exists = await RNFS.exists(cachePath);
        if (!exists) throw new Error('File not created');

        const fileUrl = Platform.OS === 'android' ? `file://${cachePath}` : cachePath;

        try {
          await Share.open({
            url: fileUrl,
            type: MIME_XLSX,
            filename: fileName,
            failOnCancel: false,
            showAppsToView: true,
            saveToFiles: true,
          });
        } catch (shareErr) {
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

  // ---------- Download ----------
  const downloadExcel = async () => {

    if (designation === "RSE") {
      try {
        if (!SaleDataRSE?.length) {
          Alert.alert('No data to export');
          return;
        }
        const b64 = RSEbuildWorkbookBase64();
        const fileName = `ProductWiseSalesReport_${Date.now()}.xlsx`;

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
              Alert.alert('Permission denied', 'Cannot save without storage permission.');
              return;
            }
          }

          const downloadsDir = RNFS.DownloadDirectoryPath;
          const destPath = `${downloadsDir}/${fileName}`;
          await RNFS.writeFile(destPath, b64, 'base64');

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
            try { await RNBlobUtil.fs.scanFile([{ path: destPath, mime: MIME_XLSX }]); } catch { }
          }

          Alert.alert('Saved', `File saved to Downloads\n${destPath}`);
        } else {
          // iOS — open Files sheet
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
        const fileName = `ProductWiseSalesReport_${Date.now()}.xlsx`;

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
              Alert.alert('Permission denied', 'Cannot save without storage permission.');
              return;
            }
          }

          const downloadsDir = RNFS.DownloadDirectoryPath;
          const destPath = `${downloadsDir}/${fileName}`;
          await RNFS.writeFile(destPath, b64, 'base64');

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
            try { await RNBlobUtil.fs.scanFile([{ path: destPath, mime: MIME_XLSX }]); } catch { }
          }

          Alert.alert('Saved', `File saved to Downloads\n${destPath}`);
        } else {
          // iOS — open Files sheet
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
      <Text style={styles.title}>ProductWise Sales Report</Text>

      {/* Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.primaryButton} onPress={shareExcel}>
          <Feather name="share-2" size={18} color="#fff" style={{ marginRight: 6 }} />
          <Text style={styles.buttonText}>Share</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={downloadExcel}>
          <Feather name="download" size={18} color="#fff" style={{ marginRight: 6 }} />
          <Text style={styles.buttonText}>Download</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        // <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        //   <ActivityIndicator size="large" color="#0E7777" />
        //   <Text style={{ marginTop: 10, fontSize: 16 }}>Loading...</Text>
        // </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' }}>
          <FastImage
            source={require('../images/cellphone_19016610.gif')} // 👈 put your gif here
            style={{ width: 250, height: 200 }}
            resizeMode={FastImage.resizeMode.contain}
          />
          <Text style={{ marginTop: 10, fontSize: 16, color: '#005696' }}>
            Loading...
          </Text>
        </View>
      ) : (
        <ScrollView horizontal>
          {/* <View>
            {renderTableHeader()}
            {salesData.length > 0 ? (
              <FlatList
                data={salesData}
                renderItem={renderItem}
                keyExtractor={(_, index) => index.toString()}
              />
            ) : (
              <Text style={{ marginTop: 20, textAlign: 'center' }}>No Data Found</Text>
            )}
          </View> */}
          <View>
            {designation === "RSE" ? (
              <>
                {renderTableHeader()}
                {SaleDataRSE.length > 0 ? (
                  <FlatList
                    data={SaleDataRSE}
                    renderItem={renderItemRSE}
                    keyExtractor={(_, index) => index.toString()}
                  />
                ) : (
                  <Text style={{ marginTop: 20, textAlign: "center" }}>
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
                  <Text style={{ marginTop: 20, textAlign: "center" }}>
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

export default ProductWiseSale;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff', padding: 10 },
  title: {
    fontSize: 18,
    color: '#005696',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  row: { flexDirection: 'row', borderBottomWidth: 0.8, borderBottomColor: '#bbb' },
  headerRow: { backgroundColor: '#005696' },
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
  buttonText: { color: '#fff', fontWeight: 'bold' },
});
