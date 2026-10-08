#import "AppDelegate.h"

#import <React/RCTBundleURLProvider.h>
#import <FirebaseCore/FirebaseCore.h>
#import <GoogleMaps/GoogleMaps.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application
    didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
    /*
     * =========================================================
     * Firebase
     * =========================================================
     */
    if ([FIRApp defaultApp] == nil) {
        [FIRApp configure];
    }

    /*
     * =========================================================
     * Google Maps
     * =========================================================
     *
     * IMPORTANT:
     * Keep your existing Google Maps API key here.
     *
     * Example:
     *
     * [GMSServices provideAPIKey:@"YOUR_EXISTING_API_KEY"];
     *
     */
    
    [GMSServices provideAPIKey:@"AIzaSyAK6U3-x1ro826D0T0P1_gShb4rst_ka2c"];


    /*
     * =========================================================
     * React Native
     * =========================================================
     */

    self.moduleName = @"AwesomeProject";

    self.initialProps = @{};


    return [super application:application
        didFinishLaunchingWithOptions:launchOptions];
}


/*
 * =============================================================
 * React Native JavaScript Bundle
 * =============================================================
 *
 * This method is REQUIRED.
 *
 * DEBUG:
 *     Metro bundler provides the JavaScript bundle.
 *
 * RELEASE:
 *     React Native loads main.jsbundle from the application.
 *
 * =============================================================
 */

- (NSURL *)bundleURL
{
#if DEBUG

    return [[RCTBundleURLProvider sharedSettings]
            jsBundleURLForBundleRoot:@"index"];

#else

    return [[NSBundle mainBundle]
            URLForResource:@"main"
            withExtension:@"jsbundle"];

#endif
}


/*
 * =============================================================
 * Optional Bridge Source URL
 * =============================================================
 *
 * Keeping this method makes the AppDelegate compatible with
 * React Native bridge-based initialization.
 *
 * =============================================================
 */

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
    return [self bundleURL];
}

@end