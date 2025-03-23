import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import axios from 'axios';

const DrinkDetailAPI = "https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=";

export default function DrinkDetailScreen() {
  const { idDrink } = useLocalSearchParams(); // Get the dynamic idDrink from the URL
  const [drink, setDrink] = useState<any>(null); // State to store fetched drink details
  const [loading, setLoading] = useState(true); // State to track loading status

  // Fetch the drink details from the API
  useEffect(() => {
    if (idDrink) {
      const fetchDrinkDetails = async () => {
        try {
          const response = await axios.get(`${DrinkDetailAPI}${idDrink}`);
          setDrink(response.data.drinks[0] || null); // Store the fetched drink data
          setLoading(false); // Set loading to false once data is fetched
        } catch (error) {
          console.error('Error fetching drink details:', error);
          setLoading(false);
        }
      };

      fetchDrinkDetails();
    }
  }, [idDrink]);

  // Loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading drink details...</Text>
      </View>
    );
  }

  // If no drink is found
  if (!drink) {
    return (
      <View style={styles.container}>
        <Text style={styles.noResultsText}>Drink not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{drink.strDrink}</Text>
      <Image source={{ uri: drink.strDrinkThumb }} style={styles.image} />

      <Text style={styles.sectionTitle}>Category:</Text>
      <Text style={styles.text}>{drink.strCategory}</Text>

      <Text style={styles.sectionTitle}>Glass Type:</Text>
      <Text style={styles.text}>{drink.strGlass}</Text>

      <Text style={styles.sectionTitle}>Ingredients:</Text>
      {Array.from({ length: 15 }, (_, i) => i + 1)
        .map((i) => drink[`strIngredient${i}`])
        .filter((ingredient) => ingredient)
        .map((ingredient, index) => (
          <Text key={index} style={styles.text}>
            - {ingredient}
          </Text>
        ))}

      <Text style={styles.sectionTitle}>Instructions:</Text>
      <Text style={styles.text}>{drink.strInstructions}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    padding: 20,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: 300,
    borderRadius: 10,
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  text: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 5,
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
  noResultsText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
});
