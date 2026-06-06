import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import Svg, { Rect, Circle, Path } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onContinue: () => void;
}

export function SplashScreen({ onContinue }: SplashScreenProps) {
  const logoScale = useRef(new Animated.Value(0.6)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const titleY = useRef(new Animated.Value(20)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const busY = useRef(new Animated.Value(40)).current;
  const busOpacity = useRef(new Animated.Value(0)).current;
  const ctaY = useRef(new Animated.Value(30)).current;
  const ctaOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      // Logo animation
      Animated.parallel([
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      // Title animation
      Animated.parallel([
        Animated.timing(titleY, {
          toValue: 0,
          duration: 500,
          delay: 100,
          useNativeDriver: true,
        }),
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 500,
          delay: 100,
          useNativeDriver: true,
        }),
      ]),
      // Bus illustration
      Animated.parallel([
        Animated.timing(busY, {
          toValue: 0,
          duration: 600,
          delay: 100,
          useNativeDriver: true,
        }),
        Animated.timing(busOpacity, {
          toValue: 1,
          duration: 600,
          delay: 100,
          useNativeDriver: true,
        }),
      ]),
      // CTA button
      Animated.parallel([
        Animated.timing(ctaY, {
          toValue: 0,
          duration: 500,
          delay: 100,
          useNativeDriver: true,
        }),
        Animated.timing(ctaOpacity, {
          toValue: 1,
          duration: 500,
          delay: 100,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5C542" translucent />
      <View style={styles.background}>
        {/* Background circles */}
        <View style={styles.circleTopRight} />
        <View style={styles.circleBottomLeft} />

        <View style={styles.content}>
          {/* Logo mark */}
          <Animated.View
            style={[
              styles.logoContainer,
              {
                transform: [{ scale: logoScale }],
                opacity: logoOpacity,
              },
            ]}
          >
            <View style={styles.logoSquare}>
              <Svg width="52" height="52" viewBox="0 0 52 52" fill="none">
                {/* Bus body */}
                <Rect x="4" y="18" width="38" height="22" rx="4" fill="#F5C542" />
                {/* Bus front */}
                <Rect x="42" y="22" width="6" height="14" rx="2" fill="#F5C542" />
                {/* Windows */}
                <Rect x="8" y="22" width="8" height="8" rx="2" fill="#1B365D" />
                <Rect x="20" y="22" width="8" height="8" rx="2" fill="#1B365D" />
                <Rect x="32" y="22" width="6" height="8" rx="2" fill="#1B365D" />
                {/* Wheels */}
                <Circle cx="13" cy="40" r="5" fill="#1B365D" />
                <Circle cx="13" cy="40" r="2.5" fill="#F5C542" />
                <Circle cx="35" cy="40" r="5" fill="#1B365D" />
                <Circle cx="35" cy="40" r="2.5" fill="#F5C542" />
                {/* Location ping */}
                <Circle cx="42" cy="10" r="7" fill="#22C55E" />
                <Path d="M42 6v4M40 8h4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </Svg>
            </View>
          </Animated.View>

          {/* Title */}
          <Animated.View
            style={[
              styles.titleContainer,
              {
                transform: [{ translateY: titleY }],
                opacity: titleOpacity,
              },
            ]}
          >
            <Text style={styles.title}>Fikisha</Text>
            <Text style={styles.subtitle}>School Transport, Reimagined</Text>
          </Animated.View>

          {/* Bus illustration */}
          <Animated.View
            style={[
              styles.busContainer,
              {
                transform: [{ translateY: busY }],
                opacity: busOpacity,
              },
            ]}
          >
            <BusIllustration />
          </Animated.View>
        </View>

        {/* CTA Section */}
        <Animated.View
          style={[
            styles.ctaWrapper,
            {
              transform: [{ translateY: ctaY }],
              opacity: ctaOpacity,
            },
          ]}
        >
          <Text style={styles.tagline}>
            "Know exactly when your child's bus arrives"
          </Text>
          <TouchableOpacity
            onPress={onContinue}
            style={styles.button}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
          <Text style={styles.trustedText}>
            Trusted by 500+ schools across Africa
          </Text>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

function BusIllustration() {
  return (
    <Svg width="280" height="140" viewBox="0 0 280 140" fill="none">
      {/* Road */}
      <Rect x="0" y="110" width="280" height="30" rx="4" fill="rgba(27,54,93,0.15)" />
      <Rect x="30" y="122" width="40" height="6" rx="3" fill="rgba(27,54,93,0.2)" />
      <Rect x="120" y="122" width="40" height="6" rx="3" fill="rgba(27,54,93,0.2)" />
      <Rect x="210" y="122" width="40" height="6" rx="3" fill="rgba(27,54,93,0.2)" />
      {/* Bus body */}
      <Rect x="40" y="40" width="180" height="75" rx="12" fill="#1B365D" />
      {/* Bus top curve */}
      <Rect x="55" y="25" width="150" height="30" rx="10" fill="#1B365D" />
      {/* Front panel */}
      <Rect x="220" y="55" width="25" height="50" rx="8" fill="#1B365D" />
      {/* Windshield */}
      <Rect x="60" y="30" width="130" height="28" rx="6" fill="#3B82F6" opacity="0.5" />
      {/* Windows */}
      <Rect x="55" y="68" width="32" height="24" rx="6" fill="#2B4D7E" />
      <Rect x="97" y="68" width="32" height="24" rx="6" fill="#2B4D7E" />
      <Rect x="139" y="68" width="32" height="24" rx="6" fill="#2B4D7E" />
      <Rect x="181" y="68" width="28" height="24" rx="6" fill="#2B4D7E" />
      {/* Door */}
      <Rect x="42" y="68" width="8" height="40" rx="4" fill="#F5C542" />
      {/* Yellow stripe */}
      <Rect x="40" y="60" width="205" height="6" rx="3" fill="#F5C542" />
      {/* Headlights */}
      <Rect x="222" y="60" width="18" height="10" rx="3" fill="#FEF3C7" />
      <Rect x="222" y="80" width="18" height="8" rx="3" fill="#FCA5A5" />
      {/* Wheels */}
      <Circle cx="85" cy="110" r="18" fill="#374151" />
      <Circle cx="85" cy="110" r="9" fill="#6B7280" />
      <Circle cx="85" cy="110" r="4" fill="#F5C542" />
      <Circle cx="195" cy="110" r="18" fill="#374151" />
      <Circle cx="195" cy="110" r="9" fill="#6B7280" />
      <Circle cx="195" cy="110" r="4" fill="#F5C542" />
      {/* Location pin */}
      <Circle cx="140" cy="12" r="10" fill="#22C55E" />
      <Path d="M140 8v6M137 11h6" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    backgroundColor: '#F5C542',
    // Simulating gradient with solid color (gradient primary)
    // For true gradient, use expo-linear-gradient
  },
  circleTopRight: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 256,
    height: 256,
    borderRadius: 128,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  circleBottomLeft: {
    position: 'absolute',
    bottom: height * 0.25,
    left: -60,
    width: 192,
    height: 192,
    borderRadius: 96,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 64,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoSquare: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: '#1B365D',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 40,
    fontWeight: '800',
    color: '#1B365D',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 17,
    fontWeight: '500',
    color: '#1B365D',
    opacity: 0.75,
  },
  busContainer: {
    marginTop: 48,
  },
  ctaWrapper: {
    paddingHorizontal: 32,
    paddingBottom: 48,
  },
  tagline: {
    textAlign: 'center',
    color: 'rgba(27,54,93,0.7)',
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 32,
  },
  button: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#1B365D',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: {
    color: '#F5C542',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  trustedText: {
    textAlign: 'center',
    marginTop: 16,
    color: 'rgba(27,54,93,0.55)',
    fontSize: 13,
  },
});