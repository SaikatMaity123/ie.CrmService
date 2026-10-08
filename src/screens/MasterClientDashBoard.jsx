import React from 'react';
import {
  View,
  Text,
  ImageBackground,
  FlatList,
  Pressable,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  Alert,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import {
  UserCheck,
  Package,
  UserPlus,
  Eye,
  ChevronRight,
} from 'lucide-react-native'; // Install lucide-react-native
import CRMImg from '../images/CRMNEW.svg'; // Retained CRM Image

const { width, height } = Dimensions.get('window'); //[cite: 1]
const CARD_WIDTH = (width - 48) / 2; // Dynamic 2-column sizing with padding

// Configurable menu data with unique icons and screens[cite: 1]
const MENU_DATA = [
  { id: '1', title: 'Master Account', screen: 'Master Account', Icon: UserCheck, color: '#4F46E5' },
  { id: '2', title: 'Master Product', screen: 'Master Product', Icon: Package, color: '#0EA5E9' },
  { id: '3', title: 'Master Referr', screen: 'Master Referr', Icon: UserPlus, color: '#8B5CF6' },
  { id: '4', title: 'View Master', screen: 'View Master', Icon: Eye, color: '#10B981' },
];

// Interactive Card Component with Animated Press Feedback
const MenuCard = ({ item, onPress }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 10, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 10, stiffness: 300 });
  };

  const { Icon, title, color } = item;

  return (
    <Animated.View style={[styles.cardWrapper, animatedStyle]}>
      <Pressable
        style={styles.card}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        android_ripple={{ color: 'rgba(0,0,0,0.05)' }}
      >
        <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
          <Icon size={26} color={color} />
        </View>
        <Text style={styles.cardTitle}>{title}</Text>
        <View style={styles.cardFooter}>
          <Text style={[styles.actionText, { color }]}>Manage</Text>
          <ChevronRight size={14} color={color} />
        </View>
      </Pressable>
    </Animated.View>
  );
};

const MasterClientDashBoard = ({ navigation }) => {
  const handleNavigation = (screen) => {
    if (screen) {
      navigation.navigate(screen); // Clean dynamic routing[cite: 1]
    } else {
      Alert.alert('Work In Progress'); //[cite: 1]
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground
        source={require('../images/bg2.png')} //[cite: 1]
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.container}>
          {/* Header Illustration */}
          <View style={styles.headerContainer}>
            <CRMImg height={160} width={200} /> 
          </View>

          {/* Interactive Grid Menu */}
          <FlatList
            data={MENU_DATA}
            keyExtractor={(item) => item.id}
            numColumns={2} //[cite: 1]
            contentContainerStyle={styles.gridContainer}
            columnWrapperStyle={styles.columnWrapper}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <MenuCard
                item={item}
                onPress={() => handleNavigation(item.screen)}
              />
            )}
          />
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

export default MasterClientDashBoard;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1, //[cite: 1]
  },
  backgroundImage: {
    height: height,
    width: width,
  },
  container: {
    flex: 1, //[cite: 1]
    paddingHorizontal: 16,
  },
  headerContainer: {
    alignItems: 'center', //[cite: 1]
    marginVertical: 20,
  },
  gridContainer: {
    paddingBottom: 40,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardWrapper: {
    width: CARD_WIDTH,
  },
  card: {
    backgroundColor: '#FFFFFF', //[cite: 1]
    borderRadius: 16,
    padding: 16,
    height: 140,
    justifyContent: 'space-between',
    // Modern Elevation/Shadow
    elevation: 4, //[cite: 1]
    shadowColor: '#000', //[cite: 1]
    shadowOffset: { width: 0, height: 2 }, //[cite: 1]
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center', //[cite: 1]
    alignItems: 'center', //[cite: 1]
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 8,
  },
  cardFooter: {
    flexDirection: 'row', //[cite: 1]
    alignItems: 'center', //[cite: 1]
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    marginRight: 2,
  },
});