import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  BackHandler,
  Alert,
  Keyboard,
} from 'react-native';
import axios from 'axios';
import KeyboardAwareLayout from '../components/custom/KeyboardAwareLayout';
import moment from 'moment';
import Share from 'react-native-share';
import NetInfo from '@react-native-community/netinfo';
import {MGSP_URL_NEW} from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import ImageViewing from 'react-native-image-viewing';


const {width} = Dimensions.get('window');
const CARD_WIDTH = width / 2 - 20;

const FacebookUserShare = ({navigation}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [useIDEmployee, setIDEmployee] = useState('');
  const [visible, setVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  useEffect(() => {
    try {
      AsyncStorage.getItem('UserData').then(value => {
        if (value != null) {
          let user = JSON.parse(value);
          setIDEmployee(user.IDEmployee);
          NetInfo.fetch().then(state => {
            if (state.isConnected) {
              fetchPromotions(user.IDEmployee);
            } else {
              Alert.alert('No Internet Connection');
            }
          }, []);
        }
      });
    } catch (error) {
      Alert.alert(error);
    }
  }, []);

  const fetchPromotions = async IDEmployee => {
    try {
      const response = await axios.get(
        MGSP_URL_NEW + 'GetFBPromotedataShowALL?EmpID=' + IDEmployee,
      );
      setData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Called when user pulls down
  //   const onRefresh = useCallback(() => {
  //     setRefreshing(true);
  //     fetchPromotions(useIDEmployee).then(() => setRefreshing(false));
  //   }, []);

  const handleShare = async (
    promoPostName,
    promoPostDescription,
    createdOn,
    documentId,
  ) => {
    try {
      // 🟦 1️⃣ Share on Facebook
      const shareOptions = {
        title: promoPostName,
        message: `${promoPostName}\n\n${promoPostDescription}`,
        social: Share.Social.FACEBOOK,
        url: promoPostDescription,
      };

      await Share.shareSingle(shareOptions);

      const isoDate = createdOn;
      const formattedDate = isoDate.replace('T', ' ');
      console.log(formattedDate);

      // 🟩 2️⃣ Call your API via POST after successful share
      const apiUrl = MGSP_URL_NEW + 'FacebookImageShared';

      const params = new URLSearchParams({
        DocumentId: documentId,
        EmpID: useIDEmployee,
        CreatedOn: formattedDate,
        Status: 'Shared',
      });

      const response = await fetch(`${apiUrl}?${params.toString()}`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
        },
      });

      const result = await response.json();
      console.log('✅ API Response:', result);

      // ✅ Check the API response
      if (
        Array.isArray(result) &&
        result[0]?.result === 'Post Shared Successfully'
      ) {
        // ✅ Navigate to next page
        navigation.navigate('AppNavScreen'); // <-- change this to your screen name
      } else {
        Alert.alert('Failed', 'Something went wrong.');
      }
    } catch (error) {
      console.error('❌ API Error:', error);
      Alert.alert('Error', 'Unable to share post.');
    }
  };

  useFocusEffect(
          useCallback(() => {
              const onBackPress = () => {
                  navigation.navigate('AppNavScreen');
                  return true;
              };
              BackHandler.addEventListener('hardwareBackPress', onBackPress);
              return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
          }, [navigation]),
      );

      const openImage = (imgUrl) => {
    setSelectedImage([{ uri: imgUrl }]);
    setVisible(true);
  };

  const renderItem = ({item}) => {
    const formattedDate = moment(item.createdOn).format('DD-MM-YYYY');
    const imageUrl = `https://coreapitest.hr.mendine.co.in/Images/${item.dataFiles}`;

    return (
      <View style={styles.card}>
        {/* Date Badge */}
        <View style={styles.dateBadge}>
          <Text style={styles.dateText}>{formattedDate}</Text>
        </View>

        {/* Image */}
         <TouchableOpacity onPress={() => openImage(imageUrl)}>
        <Image
          source={{uri: imageUrl}}
          style={styles.image}
          resizeMode="cover"
        />
        </TouchableOpacity>

        {/* Title */}
        <Text style={styles.title} numberOfLines={2}>
          {item.promoPostName}
        </Text>

        {/* Share Button */}
        <TouchableOpacity
          style={styles.shareButton}
          onPress={() =>
            handleShare(
              item.promoPostName,
              item.promoPostDescription,
              item.createdOn,
              item.documentId,
            )
          }>
          <Text style={styles.shareText}>Share Image</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#0057e7" />
      </View>
    );
  }

  return (
     <KeyboardAwareLayout>
    <View style={styles.container}>
      {/* <View style={styles.header}>
        <Text style={styles.headerTitle}>Facebook Promotion</Text>
      </View> */}

      <FlatList
        data={data.sort(
          (a, b) => new Date(b.createdOn) - new Date(a.createdOn),
        )}
        numColumns={2}
        renderItem={renderItem}
        keyExtractor={item => item.documentId.toString()}
        contentContainerStyle={{padding: 10}}
        // 👇 Add RefreshControl here
        // refreshControl={
        //   <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        // }
        ListEmptyComponent={<Text style={{textAlign: 'center'}}>No data</Text>}
      />
      {/* Zoomable full-screen viewer */}
      <ImageViewing
        images={selectedImage || []}
        imageIndex={0}
        visible={visible}
        onRequestClose={() => setVisible(false)}
      />
    </View>
    </KeyboardAwareLayout>
  );
};

export default FacebookUserShare;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#0b0b77',
    paddingVertical: 15,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    margin: 5,
    width: CARD_WIDTH,
    overflow: 'hidden',
    elevation: 5,
  },
  dateBadge: {
    position: 'absolute',
    zIndex: 1,
    backgroundColor: '#007bff',
    borderBottomRightRadius: 20,
    borderTopLeftRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    top: 8,
    left: 8,
  },
  dateText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  image: {
    width: '100%',
    height: 150,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  title: {
    backgroundColor: '#007bff',
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 14,
    paddingVertical: 5,
  },
  shareButton: {
    backgroundColor: '#0057e7',
    alignItems: 'center',
    paddingVertical: 10,
  },
  shareText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
});
