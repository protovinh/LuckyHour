import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Button } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios from 'axios';

const CocktailAPI = "https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=";
const nonCocktailAPI = "https://www.thecocktaildb.com/api/json/v1/1/filter.php?a=";


export default function AlcoholTypeScreen() {
  const { type } = useLocalSearchParams();
  const [drinks, setDrinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (type) {
      const fetchDrinks = async () => {
        try {
          let response;
          
          if (type === "Non-Alcoholic") {
            response = await axios.get(`${nonCocktailAPI}Non_Alcoholic`); // ✅ Fix API query
          } else {
            response = await axios.get(`${CocktailAPI}${type}`);
          }
          
          setDrinks(response.data.drinks || []); // ✅ Make sure drinks are set
          setLoading(false); // ✅ Stop loading indicator
        } catch (error) {
          console.error('Error fetching drinks:', error);
          setLoading(false);
        }
      };
  
      fetchDrinks();
    }
  }, [type]);
  

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => router.push(`/menu/drink/${item.idDrink}`)} // Navigate to drink page
    >
      {item.strDrinkThumb ? (
        <Image source={{ uri: item.strDrinkThumb }} style={styles.image} />
      ) : (
        <View style={styles.image} />
      )}
      <Text style={styles.text}>{item.strDrink}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Drinks with {type}</Text>
      
      {loading ? (
        <Text style={styles.loadingText}>Loading drinks...</Text>
      ) : drinks.length > 0 ? (
        <FlatList
          data={drinks}
          renderItem={renderItem}
          keyExtractor={(item) => item.idDrink}
          numColumns={2}
          contentContainerStyle={styles.grid}
        />
      ) : (
        <Text style={styles.noResultsText}>No drinks found for {type}.</Text>
      )}

      {/* <Button title="Go Back" onPress={() => router.back()} /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    padding: 10,
  },
  text: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  noResultsText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
  grid: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#394052',
    margin: 10,
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    width: 150,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginBottom: 10,
  },

});
