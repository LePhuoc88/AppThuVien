import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Pressable, Image } from 'react-native';
import { TextInput } from 'react-native-paper';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import { launchImageLibrary } from 'react-native-image-picker';
import { Picker } from '@react-native-picker/picker';
import { ScrollView } from 'react-native-gesture-handler';

const EditBook = ({ route, navigation }) => {
  const { bookId } = route.params;

  const [book, setBook] = useState("");
  const [detail, setDetail] = useState("");
  const [author, setAuthor] = useState("");
  const [imageUri, setImageUri] = useState(null);
  const [publisher, setPublisher] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCategoryName, setSelectedCategoryName] = useState("");
  const [count, setCount] = useState("");

  useEffect(() => {
    const fetchBookData = async () => {
      try {
        const bookDoc = await firestore().collection('books').doc(bookId).get();
        const bookData = bookDoc.data();
        setBook(bookData.bookName);
        setDetail(bookData.detail);
        setAuthor(bookData.author);
        setPublisher(bookData.publisher);
        setCount(bookData.count);
        setSelectedCategory(bookData.categoryId);
        setSelectedCategoryName(bookData.categoryName);
        if (bookData.imageUrl) {
          setImageUri(bookData.imageUrl);
        }
      } catch (error) {
        console.error('Error fetching book data: ', error);
      }
    };

    fetchBookData();
  }, [bookId]);
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesSnapshot = await firestore().collection('category').get();
        const categoriesList = categoriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCategories(categoriesList);
      } catch (error) {
        console.error('Error fetching categories: ', error);
      }
    };

    fetchCategories();
  }, []);
  
  const updateBook = async () => {
    try {
      if (!book || !selectedCategory) {
        return;
      }

      let imageUrl = null;
      if (imageUri) {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        const storageRef = storage().ref(`Images/${book}-${Date.now()}`);
        await storageRef.put(blob);
        imageUrl = await storageRef.getDownloadURL();
      }

      await firestore().collection('books').doc(bookId).update({
        bookName: book,
        detail,
        author,
        publisher,
        imageUrl,
        count,
        categoryName: selectedCategoryName,
      });

      navigation.navigate('Home');
    } catch (error) {
      console.error('Error updating book:', error);
    }
  };

  const pickImage = () => {
    launchImageLibrary({ mediaType: 'photo' }, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else {
        setImageUri(response.assets[0].uri);
      }
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <Text style={styles.label}>Tên sách</Text>
        <TextInput
          style={styles.input}
          value={book}
          onChangeText={setBook}
        />
        <Text style={styles.label}>Chi tiết sách</Text>
        <TextInput
          style={styles.input}
          value={detail}
          onChangeText={setDetail}
        />
        <Text style={styles.label}>Tên tác giả</Text>
        <TextInput
          style={styles.input}
          value={author}
          onChangeText={setAuthor}
        />
        <Text style={styles.label}>Nhà xuất bản</Text>
        <TextInput
          style={styles.input}
          value={publisher}
          onChangeText={setPublisher}
        />
        <Text style={styles.label}>Số lượng sách</Text>
        <TextInput
          style={styles.input}
          value={count}
          onChangeText={setCount}
        />
        <Text style={styles.label}>Thể loại</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedCategory}
            onValueChange={(itemValue) => {
              setSelectedCategory(itemValue);
              const category = categories.find(cat => cat.id === itemValue);
              setSelectedCategoryName(category ? category.categoryName : '');
            }}
          >
            <Picker.Item label="Chọn thể loại" value="" />
            {categories.map(cat => (
              <Picker.Item key={cat.id} label={cat.categoryName} value={cat.id} />
            ))}
          </Picker>
        </View>
        <Pressable onPress={pickImage} style={styles.imagePicker}>
          <Text style={styles.imagePickerText}>Chọn ảnh sách</Text>
        </Pressable>
        {imageUri && (
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
          />
        )}
      </ScrollView>
      <View style={{...styles.buttonContainer, marginBottom:40}}>
        <Pressable onPress={updateBook} style={styles.addButton}>
          <Text style={styles.addButtonText}>Cập nhật sách</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    margin: 10,
    borderRadius: 20,
  },
  label: {
    marginLeft: 10,
    fontWeight: 'bold',
  },
  input: {
    margin: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'gray',
  },
  pickerContainer: {
    margin: 10,
    borderRadius: 10,
    borderColor: 'gray',
    borderWidth: 1,
  },
  imagePicker: {
    padding: 15,
    alignItems: 'center',
    backgroundColor: 'transparent',
    margin: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'gray',
  },
  imagePickerText: {
    color: '#333',
    fontSize: 15,
  },
  image: {
    width: 400,
    height: 200,
    borderRadius: 10,
    margin: 10,
  },
  buttonContainer: {
    justifyContent: 'center',
    padding: 10,
  },
  addButton: {
    backgroundColor: "red",
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});

export default EditBook;
