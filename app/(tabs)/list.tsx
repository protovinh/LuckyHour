import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import axios from "axios";

const CocktailList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [cocktails, setCocktails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);

  const [cocktailIndexMap, setCocktailIndexMap] = useState<{
    [key: string]: number;
  }>({});

  useEffect(() => {
    fetchCocktails();
  }, []);

  const fetchCocktails = async () => {
    setLoading(true);
    try {
      let allCocktails: any[] = [];
      const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");

      for (const letter of alphabet) {
        const response = await axios.get(
          `https://www.thecocktaildb.com/api/json/v1/1/search.php?f=${letter}`
        );
        if (response.data.drinks) {
          allCocktails = [...allCocktails, ...response.data.drinks];
        }
      }

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

  const scrollToLetter = (letter: string) => {
    setSelectedLetter(letter);
    const index = cocktailIndexMap[letter];
    if (index !== undefined && flatListRef.current) {
      flatListRef.current.scrollToIndex({ index, animated: true });
    }
  };

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

    setCocktailIndexMap(indexMap);
  }, [cocktails]);

  useEffect(() => {
    if (cocktails.length > 0) {
      generateCocktailIndexMap();
    }
  }, [cocktails, generateCocktailIndexMap]);

  const getItemLayout = (_: any, index: number) => ({
    length: 116, // height estimate for each list item
    offset: 116 * index,
    index,
  });

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search Cocktails..."
        placeholderTextColor="#aaa"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

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
                <Image
                  source={{ uri: item.strDrinkThumb }}
                  style={styles.listImage}
                />
                <View style={styles.textContainer}>
                  <Text style={styles.listText}>{item.strDrink}</Text>
                  <Text style={styles.listSubText}>{item.strCategory}</Text>
                </View>
              </TouchableOpacity>
            )}
            getItemLayout={getItemLayout}
            initialNumToRender={50}
            onScrollToIndexFailed={(info) => {
              flatListRef.current?.scrollToOffset({
                offset: info.averageItemLength * info.index,
                animated: true,
              });
            }}
          />
        )}
      </View>

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
    flexDirection: "column",
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
    position: "absolute",
    top: 60,
    right: 0,
    width: 30,
    backgroundColor: "#25292e",
    paddingVertical: 10,
  },
  letterButton: {
    paddingVertical: 8,
    alignItems: "center",
  },
  letterText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  selectedLetter: {
    backgroundColor: "#ff6347",
    borderRadius: 8,
  },
});

export default CocktailList;
