import 'react-native-gesture-handler';
import React, { useContext } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { UserContext } from '../context/UseContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Service from './Books';
import BookCategory from './BookCategory';
import CheckOutOrReturn from './CheckOutOrReturn';
import Setting from './Setting';
import Approve from './Approve';
const Tab = createBottomTabNavigator();

const getTabBarIcon = icon => ({ tintColor }) => (
  <Icon name={icon} size={26} style={{ color: "black" }} />
);

const MyTabs = () => {
  const { userInfo } = useContext(UserContext);

  return (
    <Tab.Navigator
      initialRouteName='Service'
      barStyle={{ backgroundColor: "red" }}
      labeled={false}
      activeTintColor={{ color: "red" }}
      inactiveColor={{ color: "red" }}
    >
      <Tab.Screen
        name="Quản lý sách"
        component={Service}
        options={{
          tabBarIcon: getTabBarIcon('house'),
        }}
      />
      
      {userInfo && userInfo.role === 'admin' && (
        <Tab.Screen
          name="Thể loại sách"
          component={BookCategory}
          options={{
            tabBarIcon: getTabBarIcon('supervised-user-circle'),
          }}
        />
      )}
      {userInfo && userInfo.role !== 'admin' && (
        <Tab.Screen
          name="Mượn/Trả sách"
          component={CheckOutOrReturn}
          options={{
            tabBarIcon: getTabBarIcon('pending'),
          }}
        />
      )}
      {userInfo && userInfo.role === 'admin' && (
        <Tab.Screen
          name="Duyệt"
          component={Approve}
          options={{
            tabBarIcon: getTabBarIcon('offline-pin'),
          }}
        />
      )}
      <Tab.Screen
        name="Cá nhân"
        component={Setting}
        options={{
          tabBarIcon: getTabBarIcon('account-circle'),
        }}
      />
    </Tab.Navigator>
  );
}

export default MyTabs;
