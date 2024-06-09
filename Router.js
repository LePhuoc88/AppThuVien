import 'react-native-gesture-handler';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import SignUp from './Auth/SignUp';
import Login from './Auth/Login';
import Home from './Home/Home';

import Service from './Home/Books';
import AddService from './Home/AddBook';
import DetailService from './Home/DetailBook';
import EditService from './Home/EditBook';

import CheckOutOrReturn from './Home/CheckOutOrReturn';
import Approve from './Home/Approve';

const Stack = createStackNavigator();

const Router = ({ navigation }) => {
  return (
    // <AddService/>
    <Stack.Navigator>
      <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
      <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
      <Stack.Screen name="Service" component={Service} />
      <Stack.Screen name="AddService" component={AddService} options={{ title: "Thêm sách" }}  />
      <Stack.Screen name="DetailsService" component={DetailService} options={{ title: "Chi tiết sách" }}  />
      <Stack.Screen name="EditService" component={EditService} options={{ title: "Chỉnh sửa sách" }}  />
      <Stack.Screen name="SignUp" component={SignUp} options={{ headerShown: false }} />
      <Stack.Screen name="CheckOutOrReturn" component={CheckOutOrReturn} />
      <Stack.Screen name="Approve" component={Approve} />

    </Stack.Navigator>


  );
}

const styles = StyleSheet.create({})

export default Router;
