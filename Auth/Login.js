import React, { useState, useContext } from 'react';
import { View, StyleSheet, Alert, Pressable, Text, Image, Modal } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import auth from '@react-native-firebase/auth';

import { UserContext } from '../context/UseContext';

const Login = ({ navigation }) => {
    const [email, setEmail] = useState("");
    const [pass, setPass] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [resetEmail, setResetEmail] = useState("");

    const { loginUser} = useContext(UserContext);

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleLogin = () => {
        if (email && pass) {
            loginUser(email, pass)
                .then(() => {
                    setEmail("");
                    setPass("");
                    navigation.navigate("Home");
                })
                .catch(error => {
                    Alert.alert("Lỗi", error);
                });
        } else {
            Alert.alert("", "Vui lòng nhập email và mật khẩu!");
        }
    };

    const handleResetPassword = (email) => {
        auth().sendPasswordResetEmail(email)
            .then(() => {
                Alert.alert("Thông báo", "Gửi mail khôi phục thành công");
                setModalVisible(false);
            })
            .catch(error => {
                Alert.alert("Error", error.message);
            });
    };

    return (
        <View style={{ flex: 1, justifyContent: 'center', margin: 10, borderRadius: 20 }}>
            <View style={{ alignItems: 'center', padding: 10 }}>
            <Image source = {require('../asset/LOGO_Library.png')}
               style={styles.tinyLogo}/>
            </View>
            <TextInput
                style={{ ...styles.TextInput, margin: 10, borderRadius: 10 }}
                label="Nhập vào Email"
                value={email}
                underlineColor="transparent"
                onChangeText={email => setEmail(email)}
            />
            <TextInput
                style={{ ...styles.TextInput, margin: 10, borderRadius: 10 }}
                label="Nhập vào Password"
                value={pass}
                underlineColor="transparent"
                onChangeText={pass => setPass(pass)}
                secureTextEntry={!showPassword}
                right={<TextInput.Icon icon={showPassword ? 'eye' : 'eye-off'} onPress={toggleShowPassword} />}
            />
            <View style={{ justifyContent: 'center', padding: 20, paddingTop: 10, paddingBottom: 10 }}>
                <Pressable
                    style={{
                        backgroundColor: "#2284ff",
                        alignItems: 'center',
                        padding: 15,
                        borderRadius: 10,
                    }}
                    onPress={handleLogin}>
                    <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>Đăng nhập</Text>
                </Pressable>
            </View>
            <View style={{ justifyContent: 'center', padding: 20, paddingTop: 0 }}>
                <Pressable
                    style={{
                        backgroundColor: "#2284ff",
                        alignItems: 'center',
                        padding: 15,
                        borderRadius: 10,
                    }}
                    onPress={() => navigation.navigate("SignUp")}>
                    <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>Đăng ký</Text>
                </Pressable>
                <Pressable
                    style={{
                        alignItems: 'center',
                        padding: 15,
                        borderRadius: 10,
                    }}
                    onPress={() => setModalVisible(true)}>
                    <Text style={{ color: '#2284ff', fontSize: 18, fontWeight: 'bold' }}>Quên mật khẩu</Text>
                </Pressable>
            </View>

            <ForgotPasswordModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onResetPassword={handleResetPassword}
            />
        </View>
    );
}

const ForgotPasswordModal = ({ visible, onClose, onResetPassword }) => {
    const [email, setEmail] = useState('');

    const handleResetPassword = () => {
        onResetPassword(email);
    };

    return (
        <Modal
            transparent={true}
            animationType="slide"
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalView}>
                    <Text style={styles.modalText}>Nhập vào email tài khoản</Text>
                    <TextInput
                        style={{ ...styles.TextInput, width: 250, backgroundColor: '#f3f3f3' }}
                        label="Email"
                        value={email}
                        underlineColor="transparent"
                        onChangeText={setEmail}
                    />
                    <Pressable
                        style={{
                            backgroundColor: "#2284ff",
                            alignItems: 'center',
                            padding: 10,
                            borderRadius: 10,
                            width: 250,
                            marginTop: 2,
                        }}
                        onPress={handleResetPassword}>
                        <Text style={{ color: '#fff', fontSize: 15, fontWeight: 'bold' }}>Gửi yêu cầu</Text>
                    </Pressable>
                    <Pressable
                        style={{
                            backgroundColor: "red",
                            alignItems: 'center',
                            padding: 10,
                            borderRadius: 10,
                            width: 250,
                            marginTop: 2,
                        }}
                        onPress={onClose}>
                        <Text style={{ color: '#fff', fontSize: 15, fontWeight: 'bold' }}>Đóng</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
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
        marginBottom: 5,
        backgroundColor: 'white',
    },
    tinyLogo: {
        width: '70%',
        height: 100,
        marginBottom: 30,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        width: 300,
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        alignItems: 'center',
    },
    modalText: {
        marginBottom: 10,
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default Login;
