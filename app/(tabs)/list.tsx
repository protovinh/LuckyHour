import React, { useState, useEffect, useRef, useCallback } from "react";
import { View, Text, TextInput, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import axios from "axios";

const CocktailList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [cocktails, setCocktails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);

  // Map to store index of first occurrence of each letter
  const [cocktailIndexMap, setCocktailIndexMap] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    fetchCocktails();
  }, []);

  const fetchCocktails = async () => {
    setLoading(true);
    try {
      let allCocktails: any[] = [];
      const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");

      for (const letter of alphabet) {
        const response = await axios.get(`https://www.thecocktaildb.com/api/json/v1/1/search.php?f=${letter}`);
        if (response.data.drinks) {
          allCocktails = [...allCocktails, ...response.data.drinks];
        }
      }

      // Sort alphabetically by name
      allCocktails.sort((a, b) => a.strDrink.localeCompare(b.strDrink));
      setCocktails(allCocktails);
    } catch (error) {
      console.error("Error fetching cocktails:", error);
      setCocktails([]);
    }
    setLoading(false);
  };

  const filteredCocktails = cocktails.filter((drink) =>
    drink.strDrink.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Function to scroll to the correct section in the FlatList
  const scrollToLetter = (letter: string) => {
    setSelectedLetter(letter);
    const index = cocktailIndexMap[letter]; // Using the pre-calculated index map
    console.log(`Scrolling to letter: ${letter}, Index: ${index}`);  // Log for debugging

    if (index !== undefined && flatListRef.current) {
      flatListRef.current.scrollToIndex({ index, animated: true });
    }
  };

  // This function is called whenever the cocktails data is updated
  const generateCocktailIndexMap = useCallback(() => {
    const indexMap: { [key: string]: number } = {};
    let currentLetter: string | null = null;

    cocktails.forEach((cocktail, index) => {
      const firstLetter = cocktail.strDrink[0].toLowerCase();
      if (firstLetter !== currentLetter) {
        indexMap[firstLetter] = index;
        currentLetter = firstLetter;
      }
    });

    setCocktailIndexMap(indexMap); // Update the index map when cocktails are fetched/updated
  }, [cocktails]);

  // Ensure we generate the index map after cocktails are fetched
  useEffect(() => {
    if (cocktails.length > 0) {
      generateCocktailIndexMap();
    }
  }, [cocktails, generateCocktailIndexMap]);

  // Ensure proper item layout calculation for scrolling
  const getItemLayout = (data, index) => ({
    length: 80, // Item height
    offset: 80 * index, // Offset based on item index
    index,
  });

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search Cocktails..."
        placeholderTextColor="#aaa"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* Content: Drink List */}
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color="#ff6347" />
        ) : (
          <FlatList
            ref={flatListRef}
            data={filteredCocktails}
            keyExtractor={(item) => item.idDrink}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.listItem}
                onPress={() => router.push(`/homedrink/${item.idDrink}`)}
              >
                <Image source={{ uri: item.strDrinkThumb }} style={styles.listImage} />
                <View style={styles.textContainer}>
                  <Text style={styles.listText}>{item.strDrink}</Text>
                  <Text style={styles.listSubText}>{item.strCategory}</Text>
                </View>
              </TouchableOpacity>
            )}
            getItemLayout={getItemLayout} // Proper layout for scrollToIndex to work
          />
        )}
      </View>

      {/* Sidebar with alphabet letters */}
      <ScrollView style={styles.letterSidebar}>
        {"abcdefghijklmnopqrstuvwxyz".split("").map((letter) => (
          <TouchableOpacity
            key={letter}
            onPress={() => scrollToLetter(letter)}
            style={[
              styles.letterButton,
              selectedLetter === letter && styles.selectedLetter,
            ]}
          >
            <Text style={styles.letterText}>{letter.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#25292e",
    flexDirection: "column", // Stack the search bar and content vertically
    paddingTop: 20,
    paddingHorizontal: 10,
  },
  searchInput: {
    backgroundColor: "#394052",
    color: "#fff",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    fontSize: 16,
    paddingLeft: 40,
    position: "relative",
  },
  content: {
    flex: 1,
    marginBottom: 10,
    paddingLeft: 10,
  },
  listItem: {
    flexDirection: "row",
    backgroundColor: "#394052",
    marginVertical: 8,
    borderRadius: 15,
    padding: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  listImage: {
    width: 80,
    height: 80,
    borderRadius: 15,
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  listText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  listSubText: {
    color: "#aaa",
    fontSize: 14,
    marginTop: 5,
  },
  letterSidebar: {
    position: "absolute",  // Sidebar on the right side of the screen
    top: 60,               // Sidebar will start just below the search bar
    right: 0,              // Align to the right
    width: 30,             // Maintain small width for the sidebar
    backgroundColor: "#25292e",
    paddingVertical: 10,
  },
  letterButton: {
    paddingVertical: 8,   // Reduced padding for compactness
    alignItems: "center",
  },
  letterText: {
    color: "#fff",
    fontSize: 14,          // Smaller font size for the letters
    fontWeight: "500",
  },
  selectedLetter: {
    backgroundColor: "#ff6347",
    borderRadius: 8,
  },
});

export default CocktailList;
