import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView, Alert } from 'react-native';
import { UserContext } from '../context/UseContext';
import firestore from '@react-native-firebase/firestore';
import axios from 'axios';

const DetailBook = ({ route, navigation }) => {
  const { bookName, author, publisher, imageUrl, detail, categoryName, count, bookId } = route.params;
  const { userInfo } = useContext(UserContext);

  const generateBorrowCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

  const formatDateTime = (date) => {
    const pad = (num) => (num < 10 ? `0${num}` : num);
    const day = pad(date.getDate());
    const month = pad(date.getMonth() + 1);
    const year = date.getFullYear();
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  };

  const sendAppointmentEmail = async (borrowTime, borrowCode) => {
    try {
      const bookCheckout = {
        email: userInfo.email,
        bookName: bookName,
        author: author,
        borrowTime: borrowTime.toLocaleDateString(),
        borrowCode: borrowCode,
      };

      const htmlContent = `
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              background-color: #f0f0f0;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #fff;
              border-radius: 10px;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            .content {
              padding: 20px;
            }
            h1 {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 20px;
              color: #007bff;
            }
            p {
              margin-bottom: 10px;
              font-size: 16px;
              line-height: 1.6;
            }
            .highlight {
              font-weight: bold;
              color: black;
            }
            .info {
              margin-top: 20px;
              border-top: 1px solid #ccc;
              padding-top: 20px;
            }
            .text{
              font-style: italic;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div style="padding: 10px; background:#bad5e4">
              <h1 style="text-align:center;color:black">PHIẾU MƯỢN SÁCH THƯ VIỆN</h1>
            </div>
            <div class="content">
              <p><span class="highlight">Tên Sách:</span> ${bookCheckout.bookName}</p>
              <p><span class="highlight">Tác giả:</span> ${bookCheckout.author}</p>
              <p><span class="highlight">Thời gian mượn:</span> ${bookCheckout.borrowTime}</p>
              <p><span class="highlight">Code mượn sách:</span> ${bookCheckout.borrowCode}</p>
              <p><span class="highlight">Email:</span> ${bookCheckout.email}</p>
              <p><span class="text">Đọc giả vui lòng đến thư viện để nhận sách trong thời gian sớm nhất. Xin cảm ơn!</span></p>
            </div>
          </div>
        </body>
      </html>
      `;

      const response = await axios.post('http://192.168.2.12:3001/send-email', {
        recipient: userInfo.email,
        subject: 'Xác nhận thông tin đặt sách',
        html: htmlContent,
      });

      console.log(response.data);
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };

  const checkBorrowedStatus = async () => {
    try {
      const borrowedBooksRef = firestore().collection('checkout')
        .where('email', '==', userInfo.email)
        .where('bookId', '==', bookId)
        .where('status', '!=', 3);

      const borrowedBooks = await borrowedBooksRef.get();

      if (!borrowedBooks.empty) {
        Alert.alert('Lỗi', 'Bạn đã mượn cuốn sách này và chưa trả lại.');
        return true;
      }

      return false;
    } catch (error) {
      if (error.code === 'firestore/not-found') {
        console.log('Collection does not exist. Bypassing status check.');
        return false;
      } else {
        console.error('Error checking borrowed status:', error);
        return true; // Trả về true để ngăn chặn việc mượn sách nếu có lỗi xảy ra
      }
    }
  };

  const CheckOut = async () => {
    const hasBorrowedBook = await checkBorrowedStatus();

    if (hasBorrowedBook === false) {
      // Nếu chưa có sách được mượn, tiếp tục quá trình mượn sách
      Alert.alert(
        'Xác nhận mượn sách',
        'Bạn có chắc chắn muốn mượn cuốn sách này không?',
        [
          {
            text: 'Hủy',
            style: 'cancel',
          },
          {
            text: 'Mượn',
            onPress: async () => {
              try {
                const bookRef = firestore().collection('books').doc(bookId);
                const bookDoc = await bookRef.get();

                if (!bookDoc.exists) {
                  Alert.alert('Lỗi', 'Cuốn sách không tồn tại.');
                  return;
                }

                const currentCount = bookDoc.data().count;

                if (currentCount <= 0) {
                  Alert.alert('Lỗi', 'Không còn sách để mượn.');
                  return;
                }

                const borrowCode = generateBorrowCode();
                const borrowTime = new Date();

                await firestore().runTransaction(async (transaction) => {
                  const updatedBookDoc = await transaction.get(bookRef);

                  if (!updatedBookDoc.exists) {
                    throw 'Cuốn sách không tồn tại.';
                  }

                  const updatedCount = updatedBookDoc.data().count;

                  if (updatedCount <= 0) {
                    throw 'Không còn sách để mượn.';
                  }

                  transaction.set(firestore().collection('checkout').doc(), {
                    email: userInfo.email,
                    bookName: bookName,
                    author: author,
                    borrowTime: borrowTime.toLocaleDateString(),
                    borrowCode: borrowCode,
                    status: 0,
                    bookId: bookId,
                  });

                  transaction.update(bookRef, {
                    count: updatedCount - 1,
                  });
                });

                await sendAppointmentEmail(borrowTime, borrowCode);
                Alert.alert('Thành công', 'Bạn đã mượn sách thành công.');
              } catch (error) {
                console.error(error);
                Alert.alert('Lỗi', `Đã xảy ra lỗi khi mượn sách: ${error}`);
              }
            },  
          },
        ],
        { cancelable: false }
      );
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.infoContainer}>
        <Text style={styles.title}>Tên sách:</Text>
        <Text style={styles.text}>{bookName}</Text>
        <Text style={styles.title}>Chi tiết sách:</Text>
        <Text style={styles.text}>{detail}</Text>
        <Text style={styles.title}>Tác giả:</Text>
        <Text style={styles.text}>{author}</Text>
        <Text style={styles.title}>Nhà xuất bản:</Text>
        <Text style={styles.text}>{publisher}</Text>
        <Text style={styles.title}>Thể loại:</Text>
        <Text style={styles.text}>{categoryName}</Text>
        <Text style={styles.title}>Số lượng sách:</Text>
        <Text style={styles.text}>{count + " " + "cuốn"}</Text>
      </View>

      <Image source={{ uri: imageUrl }} style={styles.image} />

      {userInfo && userInfo.role !== 'admin' && (
        <TouchableOpacity onPress={CheckOut} style={styles.button}>
          <Text style={styles.buttonText}>Mượn sách</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  infoContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  text: {
    fontSize: 16,
    color: '#555',
    marginBottom: 10,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#f44336",
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default DetailBook;
