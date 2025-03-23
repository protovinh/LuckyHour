import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Text } from 'react-native';
import { Link } from 'expo-router';
import { Image } from 'expo-image'; // Import expo-image
import { storage } from '../../firebaseConfig'; // Import storage
import { getDownloadURL, ref } from 'firebase/storage'; // Firebase storage methods

const alcoholTypes = [
  { id: '1', name: 'Gin', imagePath: 'gin.jpg' },
  { id: '2', name: 'Whiskey', imagePath: 'whiskey.jpg' },
  { id: '3', name: 'Vodka', imagePath: 'vodka.jpg' },
  { id: '4', name: 'Rum', imagePath: 'rum.jpg' },
  { id: '5', name: 'Tequila', imagePath: 'tequila.jpg' },
  { id: '6', name: 'Non-Alcoholic', imagePath: 'non-alcohol.jpg' },
];

export default function MenuScreen() {
  const [imageUrls, setImageUrls] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true); // Properly handle loading state

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const urls = await Promise.all(
          alcoholTypes.map(async (item) => {
            const storageRef = ref(storage, `button-image/${item.imagePath}`);
            try {
              const url = await getDownloadURL(storageRef);
              return { name: item.name, url };
            } catch (error) {
              console.error(`Error fetching ${item.name}:`, error);
              return { name: item.name, url: null }; // Allow button to render without image
            }
          })
        );

        const imageMap = urls.reduce((acc, item) => {
          if (item.url) acc[item.name] = item.url;
          return acc;
        }, {} as { [key: string]: string });

        setImageUrls(imageMap);
        setLoading(false); // Set loading to false after fetching
      } catch (error) {
        console.error('Error fetching images:', error);
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  const renderItem = ({ item }: { item: { id: string; name: string } }) => {
    return (
      <Link href={`/menu/${item.name}`} asChild>
        <TouchableOpacity style={styles.box}>
          {imageUrls[item.name] ? (
            <Image
              source={{ uri: imageUrls[item.name] }}
              style={styles.image}
              contentFit="cover" // Content fit to cover the space
              transition={1000} // Optional transition effect on image load
            />
          ) : (
            <View style={styles.image} /> // Empty view for missing images
          )}
        </TouchableOpacity>
      </Link>
    );
  };

  return (
    <View style={styles.container}>
      {loading ? <Text style={styles.loadingText}>Loading...</Text> : null}
      <FlatList
        data={alcoholTypes}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2} // Ensure 2 columns in the grid layout
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.columnWrapper} // Added to control layout of columns
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  grid: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  columnWrapper: {
    justifyContent: 'space-between', // Distribute items evenly
  },
  box: {
    backgroundColor: '#394052',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    height: 160, // Height set to 150 for square shape
    width: 160,  // Width set to 150 for square shape
    margin: 12, // Increased margin for better spacing
  },
  image: {
    width: '100%',
    height: '100%', // Ensure the image covers the entire square button
    borderRadius: 8,
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});
