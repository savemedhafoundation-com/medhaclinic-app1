import "expo-router";

declare module "expo-router" {
  namespace ExpoRouter {
    interface __routes {
      href: string;
      hrefInputParams: { pathname: string; params?: Record<string, string> };
      hrefOutputParams: { pathname: string; params?: Record<string, string> };
    }
  }
}
