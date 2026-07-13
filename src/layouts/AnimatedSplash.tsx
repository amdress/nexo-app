import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View, Text, Animated, Dimensions } from "react-native";
import { AnimatedSplashProps } from "./interfaces/splash";
import { useTheme } from '@/shared/context/ThemeContext';

const FULL_NEXO = "NEXO";
const FULL_SUB = "Controle de Jornadas e Equipes";

export default function AnimatedSplash({
  onAnimationComplete,
}: AnimatedSplashProps) {
  const [visibleCharsCount, setVisibleCharsCount] = useState<number>(0);
  const [subText, setSubText] = useState<string>("");
const { theme } = useTheme();
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const footerOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let nexoInterval: ReturnType<typeof setInterval>; 
    let subInterval: ReturnType<typeof setInterval>; 
    let timeoutExit: ReturnType<typeof setTimeout>; 

    // 1. Entrada suave del Isotipo
    Animated.timing(logoOpacity, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      // 2. Máquina de escribir exacta para "NEXO"
      let nexoIndex = 0;
      nexoInterval = setInterval(() => {
        if (nexoIndex < FULL_NEXO.length) {
          nexoIndex++;
          setVisibleCharsCount(nexoIndex);
        } else {
          clearInterval(nexoInterval);

          // 3. Máquina de escribir controlada para el Subtítulo (Evita duplicados)
          let subIndex = 0;
          let currentSubString = "";
          subInterval = setInterval(() => {
            if (subIndex < FULL_SUB.length) {
              currentSubString += FULL_SUB.charAt(subIndex);
              setSubText(currentSubString);
              subIndex++;
            } else {
              clearInterval(subInterval);

              // 4. Aparición del Footer
              Animated.timing(footerOpacity, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
              }).start(() => {
                timeoutExit = setTimeout(() => {
                  if (onAnimationComplete) onAnimationComplete();
                }, 3000);
              });
            }
          }, 30);
        }
      }, 120);
    });

    return () => {
      clearInterval(nexoInterval);
      clearInterval(subInterval);
      clearTimeout(timeoutExit);
    };
  }, []);

  return (
    <View style={styles.container}>
      {/* CAJA PRINCIPAL CONTENEDORA (Distribución Horizontal) */}
      <View style={styles.mainWrapper}>
        {/* Bloque Izquierdo: El Isotipo de la Marca */}
        <Animated.View style={{ opacity: logoOpacity }}>
          <Animated.Image
            source={require("../../assets/icon.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Bloque Derecho: Contenedor Vertical de Textos */}
        <View style={styles.textColumn}>
          {/* Fila superior interna: Palabra NEXO con tus COLORS */}
          <View style={styles.titleRow}>
            {FULL_NEXO.split("").map((char, index) => {
              const isVisible = index < visibleCharsCount;
              return (
                <Text
                  key={index}
                  style={[
                    styles.titleText,
                    {
                      color:
                        theme.colors.NEXO_COLORS?.[index] ||
                        theme.colors.primary ||
                        "#235bb1",
                      opacity: isVisible ? 1 : 0,
                    },
                  ]}
                >
                  {char}
                </Text>
              );
            })}
          </View>

          {/* Fila inferior interna: Subtítulo Descriptivo */}
          <View style={styles.subTextRow}>
            <Text style={styles.subText} numberOfLines={1}>
              {subText}
            </Text>
          </View>
        </View>
      </View>

      {/* Sello Corporativo Sólido abajo */}
      <Animated.View style={[styles.footer, { opacity: footerOpacity }]}>
        <Text style={styles.footerBrand}>DRUNKCODE-KUBIX</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  mainWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 2,
    width: "100%",
  },
  logo: {
    width: 130,
    height: 130,
    marginRight: 1,
  },
  textColumn: {
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "center",
    flexShrink: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop:20,
    marginBottom: 1,
  },
  titleText: {
    fontSize: 56,
    fontWeight: "800",
    letterSpacing: 15,
    lineHeight: 45,
  },
  subTextRow: {
    minHeight: 22,
    justifyContent: "center",
  },
  subText: {
    fontSize: 15,
    color: "#000000",
    fontWeight: "900",
    letterSpacing: -0.2,
  },
  footer: {
    position: "absolute",
    bottom: 40,
    alignItems: "center",
  },
  footerBrand: {
    fontSize: 11,
    color: "#000000",
    letterSpacing: 2,
    fontWeight: "900",
    marginBottom: 5, 
  },
});
