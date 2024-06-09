import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, FlatList, Pressable, Alert, Image } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { Searchbar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { ScrollView } from 'react-native-virtualized-view'
import { UserProvider, UserContext } from '../context/UseContext';

const Service = ({ navigation }) => {
    const [services, setServices] = useState([]);
    const { userInfo } = useContext(UserContext);
    const [filterServices, setfilterServices] = useState([]);
    const [book, setBook] = useState([]);
    const [detail, setDetail] = useState("");
    const [author, setAuthor] = useState("");
    const [imageUri, setImageUri] = useState(null);
    const [publisher, setPublisher] = useState("");
    const [categories, setCategories] = useState([]);


    useEffect(() => {
        const unsubscribe = firestore().collection('books').onSnapshot((snapshot) => {
            const servicesData = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setServices(servicesData);
            setfilterServices(servicesData);
        });

        return () => unsubscribe();
    }, []);

    const handleDetails = (book) => {
        navigation.navigate('DetailsService', {
            bookName:book.bookName,
            detail: book.detail,
            author: book.author,
            publisher: book.publisher,
            imageUrl: book.imageUrl,
            categoryName: book.categoryName,
            count: book.count,
            bookId: book.id, 
        });
    };

    const handleEdit = (book, categories) => {
        navigation.navigate('EditService', { 
          bookId: book.id, 
          categories 
        });
      };
      

    const handleDelete = async (service) => {
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
                            await firestore().collection('books').doc(service.id).delete();
                        },
                        style: 'destructive',
                    },
                ],
                { cancelable: false }
            );
        } catch (error) {
            console.error('Error deleting service: ', error);
            Alert.alert('Error', 'An error occurred while deleting the service');
        }
    };

    const handleSearch = (query) => {
        const filterData = services.filter((book) =>
            book.bookName.toLowerCase().includes(query.toLowerCase())
        );
        setfilterServices(filterData);
    };


    return (
        <View style={{backgroundColor:'#fff', height:'100%'}}>
             <View style={{flexDirection:'row', margin:5}}>
          {userInfo && userInfo.role === 'admin'&&(
             <TouchableOpacity 
             style={{backgroundColor:'red', padding:15, width:'100%', alignItems: 'center', borderRadius:10}}
             onPress={() => navigation.navigate("AddService")}>
                 <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#fff' }}>
                    Thêm mới sách
                 </Text>
             </TouchableOpacity>
          )}
        </View>
            <View style={{ width: "95%", alignItems: 'center', alignSelf: 'center', margin: 10 }}>
                <Searchbar
                    style={{
                        ...styles.item,
                        padding: 2,
                        backgroundColor: 'transparent',
                        margin: 0,
                        height: 60,
                        justifyContent: 'center',
                    }}
                    placeholder="Tìm kiếm sách..."
                    onChangeText={handleSearch}
                />
            </View>
            
            <ScrollView>
                <FlatList
                    style={{ marginBottom: 150 }}
                    data={filterServices}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={{ flexDirection: 'row', margin: 10 }}>
                            <View style={styles.item}>
                                <TouchableOpacity 
                                onPress={() => handleDetails(item)}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between'}}>
                                        <View style={{padding:10}}>
                                            <Text style={{ fontSize: 17, fontWeight: 'bold', color: 'black' }}>{item.bookName}</Text>
                                            <Text style={{ fontSize: 12, fontWeight: 'bold', color: 'black' }}>{item.publisher}</Text>
                                        </View>
                                     
                                          {
                                           userInfo &&  userInfo.role === 'admin' &&(
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
                                            )
                                          }
                                       
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
       
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
       

    },
    item: {
        width: '100%',
        borderWidth: 1,
        padding: 10,
        height: 80,
        borderColor: 'gray',
        borderRadius: 10,
        justifyContent: 'center',
        
    }
});

export default Service;
