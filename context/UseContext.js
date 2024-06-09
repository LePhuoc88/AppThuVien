import {createContext, useState} from 'react';
import firestore from '@react-native-firebase/firestore';

import auth from '@react-native-firebase/auth';


export const UserContext = createContext();

export const UserProvider = ({children}) => {
  const [userInfo, setUserInfo] = useState({email:""});
  const [errMessage, setErrMessage] = useState(null);
  const Users = firestore().collection('users');

  let loginUser = async (email, password) => {
    return new Promise((resolve, reject) => {
        Users.doc(email).onSnapshot(user => {
            if (!user.exists) {
                setErrMessage("Sai tài khoản hoặc mật khẩu.");
                reject("Sai tài khoản hoặc mật khẩu."); 
                return;
            }
            const res = user.data();
            setUserInfo(res);
            setErrMessage(null);
            resolve(res);
        });
    });
};

  let logoutUser = () => {
    setUserInfo(null);
   
  };
  let contextData = {
    setUserInfo,
    errMessage,
    userInfo,
    loginUser,
    logoutUser,
    updateUserInformation
  };

  const updateUserInformation = async (newInfo) => {
    try {
      const userId = Users.id; 
      await db.collection('users').doc(userId).update(newInfo);

      console.log('User information updated successfully!');
    } catch (error) {
      console.error('Error updating user information:', error);
    }
  };

  return (
    <UserContext.Provider value={{...contextData}}>{children}</UserContext.Provider>
  );
};