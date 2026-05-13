module.exports = {
  // dependencies: {
  //   'react-native-vector-icons': {
  //     platforms: {
  //       ios: null,
  //     },
  //   },
  // },
  dependencies: {
    "react-native-push-notification": {
      platforms: {
        ios: null, // prevent iOS autolinking
      },
    },
  },
  project: {
    ios: {},
    android: {},
  },
  assets: ['./assets/fonts'],
};

