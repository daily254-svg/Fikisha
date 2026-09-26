import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, StatusBar } from 'react-native';
import Svg, { Rect, Circle } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';

interface SplashScreenProps {
  onContinue: () => void;
}

export function SplashScreen({ onContinue }: SplashScreenProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F9FC" />
      <Animated.View
        style={[styles.content, { opacity, transform: [{ translateY }] }]}
      >
        <View style={styles.logoSquare}>
          <Svg width="36" height="36" viewBox="0 0 30 30" fill="none">
            <Rect x="2" y="10" width="22" height="13" rx="3" fill="#F5C542" />
            <Rect x="24" y="12" width="4" height="9" rx="2" fill="#F5C542" />
            <Rect x="4" y="12" width="5" height="5" rx="1.5" fill="#1B365D" />
            <Rect x="12" y="12" width="5" height="5" rx="1.5" fill="#1B365D" />
            <Circle cx="7" cy="23" r="3" fill="#F5C542" />
            <Circle cx="7" cy="23" r="1.5" fill="#1B365D" />
            <Circle cx="21" cy="23" r="3" fill="#F5C542" />
            <Circle cx="21" cy="23" r="1.5" fill="#1B365D" />
          </Svg>
        </View>

        <Text style={styles.title}>Fikisha</Text>
        <Text style={styles.subtitle}>Know exactly when your child's bus arrives</Text>
      </Animated.View>

      <Animated.View style={[styles.ctaWrapper, { opacity }]}>
        <TouchableOpacity onPress={onContinue} style={styles.button} activeOpacity={0.85}>
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  logoSquare: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: '#1B365D',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1B365D',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#6B7FA3',
    textAlign: 'center',
  },
  ctaWrapper: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  button: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: '#1B365D',
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
