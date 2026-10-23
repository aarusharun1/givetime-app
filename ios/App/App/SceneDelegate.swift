import UIKit
import Capacitor
import GoogleSignIn

class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        guard let windowScene = scene as? UIWindowScene else { return }

        window = UIWindow(windowScene: windowScene)
        window?.rootViewController = CAPBridgeViewController()
        window?.makeKeyAndVisible()

        SceneDelegateProxy.shared.scene(scene, willConnectTo: session, options: connectionOptions)
    }

    func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
        // With scenes on, iOS sends URLs here instead of to the AppDelegate.
        // Same order as before: Google Sign-In gets first refusal, and anything
        // it doesn't handle goes to Capacitor so co.givetime.app:// deep links
        // keep working.
        let remaining = URLContexts.filter { !GIDSignIn.sharedInstance.handle($0.url) }
        if !remaining.isEmpty {
            SceneDelegateProxy.shared.scene(scene, openURLContexts: remaining)
        }
    }

    func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
        SceneDelegateProxy.shared.scene(scene, continue: userActivity)
    }
}
