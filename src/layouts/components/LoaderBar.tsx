import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  Dimensions,
  Animated,
  Easing,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemedStyles } from "@/shared/hooks/useThemedStyles";

interface LoaderBarProps {
  visible: boolean;
  message?: string;
  onAnimationComplete: () => void;
}

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.8;

export function LoaderBar({
  visible,
  message,
  onAnimationComplete,
}: LoaderBarProps) {
  const animatedProgress = useRef(new Animated.Value(0)).current;
  const flashAnim = useRef(new Animated.Value(1)).current;
const [styles, COLORS] = useThemedStyles(getStyles);
  const [currentPercent, setCurrentPercent] = useState(0);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    let intervalId: any;

    if (visible) {
      // 1. Forzar reinicio total de estados al abrirse
      animatedProgress.setValue(0);
      flashAnim.setValue(1);
      setCurrentPercent(0);
      setIsDone(false);

      // --- 🛠️ AJUSTE DE TIEMPOS PARA APRECIAR EL ARTE ---
      const duration = 2000; // 2000ms = 2 segundos completos de carga (para ver bien el semáforo)
      const stepTime = duration / 100;

      intervalId = setInterval(() => {
        setCurrentPercent((prev) => {
          if (prev >= 100) {
            clearInterval(intervalId);
            return 100;
          }
          return prev + 1;
        });
      }, stepTime);

      // 3. Secuencia de animaciones visuales
      Animated.sequence([
        // Animación de la barra física (ahora dura 2 segundos)
        Animated.timing(animatedProgress, {
          toValue: 100,
          duration: duration,
          easing: Easing.out(Easing.quad),
          useNativeDriver: false,
        }),
        Animated.delay(100),
        // Triple parpadeo al terminar (un poquito más lento el ritmo para que se note el "Concluído")
        Animated.loop(
          Animated.sequence([
            Animated.timing(flashAnim, {
              toValue: 0.2,
              duration: 250,
              useNativeDriver: true,
            }),
            Animated.timing(flashAnim, {
              toValue: 1,
              duration: 250,
              useNativeDriver: true,
            }),
          ]),
          { iterations: 3 },
        ),
        Animated.delay(1500), // ← ¡EL TRUCO! 1.5 segundos clavado en pantalla antes de cerrarse
      ]).start(() => {
        // 4. Cerramos el estado de manera segura llamando al padre
        onAnimationComplete();
      });
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      animatedProgress.stopAnimation();
      flashAnim.stopAnimation();
    };
  }, [visible]);

  // Cambiar a modo éxito al tocar el 100
  useEffect(() => {
    if (currentPercent >= 100) {
      setIsDone(true);
    }
  }, [currentPercent]);

  // Si la propiedad de afuera dice falso, se destruye el render inmediatamente
  if (!visible) return null;

  // Sistema de Semáforo
  let trafficLightColor = "#FF4D4D";
  if (currentPercent >= 40 && currentPercent < 80) {
    trafficLightColor = "#FFC107";
  } else if (currentPercent >= 80) {
    trafficLightColor = "#4CAF50";
  }

  const activeColor = isDone ? "#4CAF50" : trafficLightColor;

  const widthInterpolate = animatedProgress.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={styles.fullscreenOverlay} pointerEvents="none">
      <View style={[styles.centerCard, { borderColor: activeColor }]}>
        <View style={styles.headerRow}>
          <Text style={[styles.progressText, { color: activeColor }]}>
            {currentPercent}%
          </Text>
          <Text style={styles.statusLabel}>
            {isDone ? "SINCRO FINALIZADA" : "OPERACIÓN EN CURSO"}
          </Text>
        </View>

        <View style={[styles.track, isDone && styles.trackHidden]}>
          <Animated.View
            style={[
              styles.bar,
              {
                width: widthInterpolate,
                backgroundColor: activeColor,
              },
            ]}
          />
        </View>

        <Animated.View style={[styles.footerContent, { opacity: flashAnim }]}>
          {isDone ? (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              <Text
                style={[
                  styles.messageText,
                  { color: "#4CAF50", fontWeight: "700" },
                ]}
              >
                Concluído com sucesso!
              </Text>
            </>
          ) : (
            <>
              <View style={[styles.dot, { backgroundColor: activeColor }]} />
              <Text style={styles.messageText}>
                {message || "Processando..."}
              </Text>
            </>
          )}
        </Animated.View>
      </View>
    </View>
  );
}

const getStyles = (COLORS: any) => StyleSheet.create({
  fullscreenOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 99999,
    elevation: 99999,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  centerCard: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.surface || "#1E1E1E",
    borderRadius: 16,
    borderWidth: 2,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 12,
  },
  progressText: {
    fontSize: 28,
    fontWeight: "700",
  },
  statusLabel: {
    color: COLORS.textMuted || "#8E8E93",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
  },
  track: {
    width: "100%",
    height: 8,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 999,
    overflow: "hidden",
    marginBottom: 14,
    opacity: 1,
  },
  trackHidden: {
    opacity: 0.15,
  },
  bar: {
    height: "100%",
    borderRadius: 999,
  },
  footerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  messageText: {
    color: COLORS.text || "#FFFFFF",
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 18,
    flex: 1,
  },
});
