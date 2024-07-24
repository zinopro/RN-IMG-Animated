import React, { useEffect, useRef, useState } from 'react';
import { View, Animated, Dimensions, ActivityIndicator } from 'react-native';
import { db } from './firebaseConfig';

const { width, height } = Dimensions.get('window');

// Reduced image size by (70% of the original dimensions)
const imageWidth = width * 0.7;
const imageHeight = height * 0.7;

const fetchImagesFromFirestore = async () => {
  try {
    const images = [];
    const snapshot = await db.collection('images').orderBy('index').get();
    snapshot.forEach(doc => {
      images.push(doc.data().url);
    });
    return images;
  } catch (error) {
    console.error('Error fetching images:', error);
    return [];
  }
};

const ImageSequence = ({ duration }) => {
  const [images, setImages] = useState([]);
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const getImages = async () => {
      const fetchedImages = await fetchImagesFromFirestore();
      setImages(fetchedImages);
    };
    getImages();
  }, []);

  useEffect(() => {
    if (images.length > 0) {
      Animated.loop(
        Animated.timing(animatedValue, {
          toValue: images.length - 1,
          duration: duration * images.length,
          useNativeDriver: false
        })
      ).start();
    }

    // Cleanup function to stop the animation when the component unmounts
    return () => animatedValue.stopAnimation();
  }, [animatedValue, images.length, duration]);

  const interpolatedIndex = animatedValue.interpolate({
    inputRange: Array.from({ length: images.length }, (_, i) => i),
    outputRange: images,
  });

  if (images.length === 0) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View>
      <Animated.Image
        source={{ uri: interpolatedIndex }}
        style={{ width: imageWidth, height: imageHeight }} 
      />
    </View>
  );
};

const App = () => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ImageSequence duration={1000} />
    </View>
  );
};

export default App;
