import React, { createContext, useContext, useEffect } from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  // We strictly enforce the 'dark' professional theme now.
  const theme = "dark";

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("dark");
    // Ensure light class is never present
    root.classList.remove("light");
    
    // Optional: Persist just in case other logic checks localStorage
    localStorage.setItem("iqrat_theme", "dark");
  }, []);

  // No toggle function provided anymore
  const value = { theme };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}