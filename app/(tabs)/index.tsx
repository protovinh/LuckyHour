import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, StyleSheet, Modal } from 'react-native';
import { Svg, Path } from 'react-native-svg';
import Animated, { Easing, withTiming, useSharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { doc, getDoc } from 'firebase/firestore';  // Firebase functions
import { db } from "../../firebaseConfig";  // Ensure db is correctly imported

// API URL to fetch random drinks
const randomCocktailAPI = "https://www.thecocktaildb.com/api/json/v1/1/random.php";

const HomeScreen = () => {
  const [randomDrinks, setRandomDrinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const [adjective, setAdjective] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState(false);  // State to control modal visibility
  const [dataFetched, setDataFetched] = useState(false);  // Track if data has been fetched
  const router = useRouter();

  // Fetching 5 random drinks from the API
  useEffect(() => {
    const fetchRandomDrinks = async () => {
      try {
        const drinks: any[] = [];
        for (let i = 0; i < 5; i++) {
          const response = await axios.get(randomCocktailAPI);
          if (response.data && response.data.drinks) {
            drinks.push(response.data.drinks[0]); // Get a random drink
          }
        }
        setRandomDrinks(drinks);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching random drinks:', error);
        setLoading(false);
      }
    };
    fetchRandomDrinks();
  }, []);

  // Spinning wheel logic
  const rotation = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        rotate: withTiming(`${rotation.value}deg`, {
          duration: 2000,
          easing: Easing.linear,
        }),
      },
    ],
  }), [rotation]);

  const startSpin = () => {
    if (!spinning) {
      // Reset previous data before starting the new spin
      setAdjective('');
      setName('');
      setIngredients([]);
      setDataFetched(false); // Ensure the modal shows loading state initially
      
      setSpinning(true);
      rotation.value += 360; // Increase the rotation by 360 degrees
  
      // Start fetching the data when the spin begins
      fetchRandomData();
  
      setTimeout(() => {
        setSpinning(false); // Stop spinning after 2 seconds
        setModalVisible(true);  // Show the modal after the spin and data fetching
      }, 2000);  // Wait for the spinning animation to finish
    }
  };
  
  // Fetch random adjective, name, and ingredients
  const fetchRandomData = async () => {
    try {
      // Get random adjective (1-6)
      const adjectiveId = Math.floor(Math.random() * 13) + 1;
      const adjectiveDocRef = doc(db, 'adjectives', adjectiveId.toString());
      const adjectiveDoc = await getDoc(adjectiveDocRef);
  
      if (adjectiveDoc.exists()) {
        setAdjective(adjectiveDoc.data()?.name || 'No adjective found');
      } else {
        console.log('No adjective found!');
      }
  
      // Get random name (1-3)
      const nameId = Math.floor(Math.random() * 8) + 1;
      const nameDocRef = doc(db, 'names', nameId.toString());
      const nameDoc = await getDoc(nameDocRef);
  
      if (nameDoc.exists()) {
        setName(nameDoc.data()?.name || 'No name found');
      } else {
        console.log('No name found!');
      }
  
      // Get random ingredients (3-6 items)
      const ingredientCount = Math.floor(Math.random() * 4) + 3; // Random number between 3-6
      const ingredientSet: Set<string> = new Set(); // Use a Set to avoid duplicates
  
      for (let i = 0; i < ingredientCount; i++) {
        const ingredientId = Math.floor(Math.random() * 18) + 1;
        const ingredientDocRef = doc(db, 'ingredients', ingredientId.toString());
        const ingredientDoc = await getDoc(ingredientDocRef);
  
        if (ingredientDoc.exists()) {
          ingredientSet.add(ingredientDoc.data()?.name || 'No ingredient found');
        } else {
          console.log(`No ingredient found for ID: ${ingredientId}`);
        }
      }
  
      setIngredients(Array.from(ingredientSet)); // Convert the Set back to an array
      setDataFetched(true); // Mark data fetching as complete
    } catch (error) {
      console.error('Error fetching random data:', error);
      setDataFetched(true); // Even if error occurs, ensure modal shows
    }
  };

  // Navigate to the drink detail page
  const navigateToDrinkDetail = (idDrink: string) => {
    router.push(`/homedrink/${idDrink}`); // This will navigate to the correct path
  };

  const renderSegments = (numSegments: number) => {
    const segments = [];
    const segmentAngle = 360 / numSegments;
    const radius = 140; // Radius of the wheel

    for (let i = 0; i < numSegments; i++) {
      const startAngle = i * segmentAngle;
      const endAngle = startAngle + segmentAngle;
      const largeArcFlag = segmentAngle > 180 ? 1 : 0;
      const color = i % 2 === 0 ? "#FFFFFF" : "#F1E2B8"; // Alternate colors

      segments.push(
        <Path
          key={i}
          d={`M${radius + 10},${radius + 10} L${radius + 10 + radius * Math.cos((Math.PI * startAngle) / 180)},${radius + 10 + radius * Math.sin((Math.PI * startAngle) / 180)} A${radius},${radius} 0 ${largeArcFlag} 1 ${radius + 10 + radius * Math.cos((Math.PI * endAngle) / 180)},${radius + 10 + radius * Math.sin((Math.PI * endAngle) / 180)} Z`}
          fill={color}
        />
      );
    }
    return segments;
  };

  return (
    <View style={styles.container}>
      {/* Spinning Wheel */}
      <Text style={styles.header}>Spinning Wheel</Text>
      <Animated.View style={[styles.wheel, animatedStyle]}>
        <Svg height="300" width="300" viewBox="0 0 300 300">
          {renderSegments(12)} {/* Number of segments */}
        </Svg>
      </Animated.View>
      <TouchableOpacity onPress={startSpin} style={styles.button}>
        <Text style={styles.buttonText}>Spin the Wheel</Text>
      </TouchableOpacity>

      {/* Random Drinks Display */}
      <Text style={styles.header}>Recommended Drinks</Text>
      {loading ? (
        <Text style={styles.loadingText}>Loading drinks...</Text>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {randomDrinks.map((item) => (
            <TouchableOpacity
              key={item.idDrink}
              style={styles.card}
              onPress={() => navigateToDrinkDetail(item.idDrink)}
            >
              {item.strDrinkThumb ? (
                <Image source={{ uri: item.strDrinkThumb }} style={styles.image} />
              ) : (
                <View style={styles.image} />
              )}
              <Text style={styles.text}>{item.strDrink}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Modal Popup with Random Adjective, Name, and Ingredients */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            {dataFetched ? (
              <>
                <Text style={styles.randomText}>{adjective} {name}</Text>
                <ScrollView>
                  {ingredients.map((ingredient, index) => (
                    <Text key={index} style={styles.randomText}>- {ingredient}</Text>
                  ))}
                </ScrollView>
              </>
            ) : (
              <Text style={styles.randomText}>Loading...</Text>
            )}

            <TouchableOpacity
              style={styles.button}
              onPress={() => setModalVisible(false)}  // Close the modal
            >
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    color: '#fff',
    fontSize: 24,
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
  text: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
  wheel: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 300,
    height: 300,
    borderRadius: 150,
    borderWidth: 5,
    borderColor: '#394052',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#394052',
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 8,
    alignSelf: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  randomText: {
    color: '#fff',
    fontSize: 18,
    marginTop: 10,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: '#394052',
    padding: 20,
    borderRadius: 8,
    width: 300,
    alignItems: 'center',
  },
});

export default HomeScreen;
