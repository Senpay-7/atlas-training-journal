import { Tabs } from 'expo-router';
import { TabBar } from '../../design-system/TabBar';
export default function Layout() {
  return <Tabs initialRouteName="index" screenOptions={{ headerShown: false }} tabBar={props => <TabBar {...props} />}>
    <Tabs.Screen name="explore" /><Tabs.Screen name="plans" /><Tabs.Screen name="index" /><Tabs.Screen name="tracker" /><Tabs.Screen name="profile" />
  </Tabs>;
}
