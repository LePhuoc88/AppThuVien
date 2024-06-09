import React, { useEffect, useState, useContext } from 'react';
import { FlatList, Text, View, StyleSheet, ActivityIndicator, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { UserContext } from '../context/UseContext';

const Approve = ({ navigation }) => {
  const [checkouts, setCheckouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { userInfo } = useContext(UserContext);
  const userEmail = userInfo && userInfo.email ? userInfo.email : null;
  const [returningBookId, setReturningBookId] = useState(null);

  const fetchCheckouts = async () => {
    try {
      const checkoutData = [];
      const snapshot = await firestore().collection('checkout').get();

      snapshot.forEach(doc => {
        const data = doc.data();
        let borrowTime = null;
        if (data.borrowTime && typeof data.borrowTime.toDate === 'function') {
          borrowTime = data.borrowTime.toDate();
        }

        const checkoutInfo = {
          id: doc.id,
          email: data.email,
          bookName: data.bookName,
          author: data.author,
          borrowTime: data.borrowTime,
          borrowCode: data.borrowCode,
          status: data.status,
          bookId: data.bookId,
        };
        checkoutData.push(checkoutInfo);
      });

      setCheckouts(checkoutData);
    } catch (error) {
      console.error('Lỗi khi lấy thông tin mượn sách: ', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (userEmail) {
      fetchCheckouts();
    }
  }, [userEmail]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCheckouts();
  };

  const updateBookCount = async (bookId, increment) => {
    const bookRef = firestore().collection('books').doc(bookId);
    await firestore().runTransaction(async (transaction) => {
      const bookDoc = await transaction.get(bookRef);
      if (!bookDoc.exists) {
        throw new Error('Sách không tồn tại!');
      }
      const newCount = bookDoc.data().count + increment;
      transaction.update(bookRef, { count: newCount });
    });
  };

  const handleApproveBorrow = async (checkoutId, bookId) => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc muốn duyệt trả sách này?',
      [
        {
          text: 'Hủy',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel'
        },
        {
          text: 'Duyệt',
          onPress: async () => {
            try {
                await firestore().collection('checkout').doc(checkoutId).update({ 
                    status: 1,
                  });
              
              Alert.alert('Thành công', 'Duyệt trả sách thành công.');
              fetchCheckouts();
            } catch (error) {
              console.error('Lỗi khi duyệt trả sách: ', error);
              Alert.alert('Lỗi', error.message || 'Duyệt trả sách thất bại.');
            }
          }
        }
      ],
      { cancelable: false }
    );
};


  const handleReturnBook = async (checkoutId, bookId) => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc muốn trả sách này?',
      [
        {
          text: 'Hủy',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel'
        },
        {
          text: 'Trả',
          onPress: async () => {
            setReturningBookId(checkoutId); 
            try {
              await firestore().collection('checkout').doc(checkoutId).update({ 
                status: 3,
              });
              await updateBookCount(bookId, 1);
              Alert.alert('Thành công', 'Trả sách thành công.');
              fetchCheckouts();
            } catch (error) {
              console.error('Lỗi khi trả sách: ', error);
              Alert.alert('Lỗi', error.message || 'Trả sách thất bại.');
            } finally {
              setReturningBookId(null); 
            }
          }
        }
      ],
      { cancelable: false }
    );
  };
  

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.text}>Tên sách: {item.bookName}</Text>
      <Text style={styles.text}>Tác giả: {item.author}</Text>
      <Text style={styles.text}>Thời gian mượn: {item.borrowTime.toLocaleString()}</Text>
      <Text style={styles.text}>Mã mượn sách: {item.borrowCode}</Text>
      <Text style={styles.text}>Tài khoản mượn: {item.email}</Text>
      {item.status === 0 ? (
        <TouchableOpacity
          style={styles.button}
          onPress={() => handleApproveBorrow(item.id, item.bookId)}
          disabled={returningBookId === item.id} 
        >
          <Text style={styles.buttonText}>Duyệt mượn sách</Text>
        </TouchableOpacity>
      ) : item.status === 1 ? (
        <TouchableOpacity
          onPress={() => handleReturnBook(item.id, item.bookId)}
          style={[styles.button, {backgroundColor: "#4CAF50"}]}
          disabled={true} 
        >
          <Text style={styles.buttonText}>Đã duyệt mượn</Text>
        </TouchableOpacity>
      ) : item.status === 2 ? (
        <TouchableOpacity
        onPress={() => handleReturnBook(item.id, item.bookId)}
          style={[styles.button]}
          disabled={returningBookId === item.id} 
        >
          <Text style={styles.buttonText}>Đang chờ duyệt trả sách</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[styles.button, {backgroundColor: "#4CAF50"}]}
          disabled={true} 
        >
          <Text style={styles.buttonText}>Hoàn thành trả sách</Text>
        </TouchableOpacity>
      )}
    </View>
  );
  
  
  

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <FlatList
      data={checkouts}
      renderItem={renderItem}
      keyExtractor={(item, index) => index.toString()}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      }
    />
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    padding: 10,
    backgroundColor: '#F0F0F0',
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  text: {
    fontSize: 13,
    marginBottom: 5,
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: "#f44336",
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});


export default Approve;