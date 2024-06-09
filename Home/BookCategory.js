import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, FlatList, Pressable, Alert, Modal, TextInput } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { ScrollView } from 'react-native-virtualized-view';
import { UserContext } from '../context/UseContext';

const BookCategory = ({ navigation }) => {
    const [BookCategory, setBookCategory] = useState([]);
    const { userInfo } = useContext(UserContext);
    const [filterBookCategory, setfilterBookCategory] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState(''); // 'edit' or 'add'
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [newCategoryName, setNewCategoryName] = useState('');

    useEffect(() => {
        const unsubscribe = firestore().collection('category').onSnapshot((snapshot) => {
            const BookCategoryData = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setBookCategory(BookCategoryData);
            setfilterBookCategory(BookCategoryData);
        });

        return () => unsubscribe();
    }, []);

    const handleEdit = (BookCategory) => {
        setSelectedCategory(BookCategory);
        setNewCategoryName(BookCategory.categoryName);
        setModalType('edit');
        setModalVisible(true);
    };

    const handleAdd = () => {
        setSelectedCategory(null);
        setNewCategoryName('');
        setModalType('add');
        setModalVisible(true);
    };

    const handleSave = async () => {
        if (newCategoryName) {
            try {
                if (modalType === 'edit' && selectedCategory) {
                    await firestore().collection('category').doc(selectedCategory.id).update({
                        categoryName: newCategoryName,
                    });
                } else if (modalType === 'add') {
                    await firestore().collection('category').add({
                        categoryName: newCategoryName,
                    });
                }
                setModalVisible(false);
                setSelectedCategory(null);
                setNewCategoryName('');
            } catch (error) {
                console.error('Error saving BookCategory: ', error);
                Alert.alert('Error', 'An error occurred while saving the BookCategory');
            }
        }
    };

    const handleDelete = async (BookCategory) => {
        try {
            Alert.alert(
                '',
                'Bạn chắc chứ?',
                [
                    {
                        text: 'Hủy',
                        style: 'cancel',
                    },
                    {
                        text: 'Xóa',
                        onPress: async () => {
                            await firestore().collection('category').doc(BookCategory.id).delete();
                        },
                        style: 'destructive',
                    },
                ],
                { cancelable: false }
            );
        } catch (error) {
            console.error('Error deleting BookCategory: ', error);
            Alert.alert('Error', 'An error occurred while deleting the BookCategory');
        }
    };

    return (
       
                    <View style={{ backgroundColor: '#fff', height:'100%' }}>
            <View style={{flexDirection:'row', margin:5}}>
           
      
                <TouchableOpacity 
                style={{backgroundColor:'red', padding:15, width:'100%', alignItems: 'center', borderRadius:10}}
                onPress={handleAdd}>
                    <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#fff' }}>
                       Thêm mới thể loại
                    </Text>
                </TouchableOpacity>
          
            </View>
            <ScrollView>
                <FlatList
                    style={{ marginBottom: 150 }}
                    data={filterBookCategory}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={{ flexDirection: 'row', margin: 5 }}>
                            <View style={styles.item}>
                                <TouchableOpacity>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                        <View>
                                            <Text style={{ fontSize: 17, fontWeight: 'bold', color: 'black' }}>{item.categoryName}</Text>
                                        </View>
                                        <View style={{ flexDirection: 'row' }}>
                                            <Pressable onPress={() => handleEdit(item)}>
                                                <View style={{ backgroundColor: 'green', padding: 10, borderRadius: 50, marginRight: 10 }}>
                                                    <Text>
                                                        <Icon name="edit" size={20} style={{ color: 'white' }} />
                                                    </Text>
                                                </View>
                                            </Pressable>
                                            <Pressable onPress={() => handleDelete(item)}>
                                                <View style={{ backgroundColor: 'red', padding: 10, borderRadius: 50 }}>
                                                    <Text>
                                                        <Icon name="delete" size={20} style={{ color: 'white' }} />
                                                    </Text>
                                                </View>
                                            </Pressable>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                />
            </ScrollView>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(!modalVisible);
                }}
            >
                <View style={styles.modalView}>
                    <Text style={styles.modalText}>{modalType === 'edit' ? 'Chỉnh sửa thể loại' : 'Thêm thể loại'}</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Tên thể loại"
                        value={newCategoryName}
                        onChangeText={setNewCategoryName}
                    />
                    <View style={{ flexDirection: 'row' }}>
                        <TouchableOpacity style={[styles.button, styles.buttonClose]} onPress={handleSave}>
                            <Text style={styles.textStyle}>Lưu</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.button, styles.buttonClose]} onPress={() => setModalVisible(false)}>
                            <Text style={styles.textStyle}>Hủy</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
        backgroundColor:'white',
        height:'100%'
      
    },
    item: {
        width: '100%',
        borderWidth: 1,
        padding: 10,
        height: 80,
        borderColor: 'gray',
        borderRadius: 10,
        justifyContent: 'center',
        
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    button: {
        borderRadius: 5,
        padding: 10,
    },
    buttonClose: {
        backgroundColor: 'red',
        margin: 5
    },
    textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center'
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold'
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 10,
        width: '100%',
        padding: 10,
        borderRadius: 5
    }
});

export default BookCategory;
