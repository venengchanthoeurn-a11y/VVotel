"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type ContrastMode = "default" | "bw" | "by";

interface AccessibilityContextType {
  contrast: ContrastMode;
  setContrast: (mode: ContrastMode) => void;
  dyslexiaFont: boolean;
  setDyslexiaFont: (val: boolean) => void;
  largeSpacing: boolean;
  setLargeSpacing: (val: boolean) => void;
  resetAll: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType>({
  contrast: "default",
  setContrast: () => {},
  dyslexiaFont: false,
  setDyslexiaFont: () => {},
  largeSpacing: false,
  setLargeSpacing: () => {},
  resetAll: () => {},
});

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [contrast, setContrastState] = useState<ContrastMode>("default");
  const [dyslexiaFont, setDyslexiaFontState] = useState<boolean>(false);
  const [largeSpacing, setLargeSpacingState] = useState<boolean>(false);

  useEffect(() => {
    // Apply classes to document element
    const root = document.documentElement;

    root.classList.remove("contrast-bw", "contrast-by");
    if (contrast === "bw") root.classList.add("contrast-bw");
    if (contrast === "by") root.classList.add("contrast-by");

    if (dyslexiaFont) {
      root.classList.add("font-dyslexia");
    } else {
      root.classList.remove("font-dyslexia");
    }

    if (largeSpacing) {
      root.classList.add("spacing-large");
    } else {
      root.classList.remove("spacing-large");
    }
  }, [contrast, dyslexiaFont, largeSpacing]);

  const setContrast = (mode: ContrastMode) => setContrastState(mode);
  const setDyslexiaFont = (val: boolean) => setDyslexiaFontState(val);
  const setLargeSpacing = (val: boolean) => setLargeSpacingState(val);

  const resetAll = () => {
    setContrastState("default");
    setDyslexiaFontState(false);
    setLargeSpacingState(false);
  };

  return (
    <AccessibilityContext.Provider
      value={{
        contrast,
        setContrast,
        dyslexiaFont,
        setDyslexiaFont,
        largeSpacing,
        setLargeSpacing,
        resetAll,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => useContext(AccessibilityContext);
