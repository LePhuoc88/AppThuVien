import React, { useState } from 'react';
import { View, StyleSheet, Alert, Pressable, Text, Image } from 'react-native';
import { TextInput } from 'react-native-paper';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [passrp, setPassrp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigation = useNavigation();

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSignUp = async () => {
    if (!email || !pass || !passrp) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }

    if (pass !== passrp) {
      Alert.alert('Lỗi', 'Mật khẩu không khớp');
      return;
    }

    try {
      const { user } = await auth().createUserWithEmailAndPassword(email, pass);
      await firestore().collection('users').doc(user.email).set({
        email: user.email,
        age: '0',
        address: 'abc',
        role: 'user',
      });
      navigation.navigate("Login");
      Alert.alert('Thành công', 'Tạo tài khoản thành công');
    } catch (error) {
      Alert.alert('Lỗi', 'Đã xảy ra lỗi khi tạo tài khoản');
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', margin: 10, borderRadius: 20 }}>
      <View style={{ alignItems: 'center' }}>
        <Image source = {require('../asset/LOGO_Library.png')}
                style={styles.tinyLogo}/>
      </View>
      <TextInput
        style={styles.TextInput}
        label="Nhập Email"
        value={email}
        onChangeText={(email) => setEmail(email)}
        underlineColor="transparent"
      />
      <TextInput
        style={styles.TextInput}
        label="Nhập mật khẩu"
        value={pass}
        onChangeText={(pass) => setPass(pass)}
        secureTextEntry={!showPassword}
        right={<TextInput.Icon icon={showPassword ? 'eye' : 'eye-off'} onPress={toggleShowPassword} />}
        underlineColor="transparent"
      />
      <TextInput
        style={styles.TextInput}
        label="Nhập lại mật khẩu"
        value={passrp}
        onChangeText={(passrp) => setPassrp(passrp)}
        secureTextEntry={!showPassword}
        right={<TextInput.Icon icon={showPassword ? 'eye' : 'eye-off'} onPress={toggleShowPassword} />}
        underlineColor="transparent"
      />
      <View style={{ justifyContent: 'center', padding: 20, paddingTop: 0, paddingBottom: 10 }}>
        <Pressable
          style={{
            backgroundColor: "#2284ff",
            alignItems: 'center',
            padding: 15,
            borderRadius: 10,
          }}
          onPress={handleSignUp}>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>Đăng ký</Text>
        </Pressable>
      </View>
      <View style={{ justifyContent: 'center', padding: 20, paddingTop: 0, paddingBottom: 10 }}>
        <Pressable
          style={{
            backgroundColor: "#2284ff",
            alignItems: 'center',
            padding: 15,
            borderRadius: 10,
          }}
          onPress={() => navigation.navigate("Login")}>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>Đăng nhập</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  TextInput: {
    width: 350,
    alignSelf: 'center',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    marginBottom: 10,
    backgroundColor: 'white',
  },
  tinyLogo: {
    width: '70%',
    height: 100,
    marginBottom: 30,
  },
});

export default SignUp;
