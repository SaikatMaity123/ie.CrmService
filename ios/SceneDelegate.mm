#import <UIKit/UIKit.h>
#import "AppDelegate.h"

@interface SceneDelegate : UIResponder <UIWindowSceneDelegate>

@property (nonatomic, strong) UIWindow *window;

@end

@implementation SceneDelegate

- (void)scene:(UIScene *)scene
    willConnectToSession:(UISceneSession *)session
                 options:(UISceneConnectionOptions *)connectionOptions
{
    if (![scene isKindOfClass:[UIWindowScene class]]) {
        return;
    }

    UIWindowScene *windowScene = (UIWindowScene *)scene;

    AppDelegate *appDelegate =
        (AppDelegate *)UIApplication.sharedApplication.delegate;

    self.window = appDelegate.window;

    if (self.window == nil) {
        self.window = [[UIWindow alloc] initWithWindowScene:windowScene];
    } else {
        self.window.windowScene = windowScene;
    }

    [self.window makeKeyAndVisible];
}

- (void)sceneDidBecomeActive:(UIScene *)scene
{
}

- (void)sceneWillResignActive:(UIScene *)scene
{
}

- (void)sceneWillEnterForeground:(UIScene *)scene
{
}

- (void)sceneDidEnterBackground:(UIScene *)scene
{
}

@end
