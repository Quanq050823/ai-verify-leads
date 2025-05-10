"use client";
import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	ReactNode,
} from "react";

interface ThemeContextProps {
	isDarkMode: boolean;
	toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

interface ThemeProviderProps {
	children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
	const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

	useEffect(() => {
		// Retrieve the user's preference from local storage
		const storedPreference = localStorage.getItem("theme");
		if (storedPreference === "dark") {
			setIsDarkMode(true);
		}
	}, []);

	const toggleTheme = () => {
		setIsDarkMode(!isDarkMode);
	};

	useEffect(() => {
		// Update the user's preference in local storage
		localStorage.setItem("theme", isDarkMode ? "dark" : "light");

		// Update the class on the <html> element to apply the selected mode
		const htmlElement = document.querySelector("html");
		if (htmlElement) {
			if (isDarkMode) {
				htmlElement.classList.add("dark-theme");
			} else {
				htmlElement.classList.remove("dark-theme");
			}
		}
	}, [isDarkMode]);

	return (
		<ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
			{children}
		</ThemeContext.Provider>
	);
};

export const useTheme = (): ThemeContextProps => {
	const context = useContext(ThemeContext);
	if (context === undefined) {
		throw new Error("useTheme must be used within a ThemeProvider");
	}
	return context;
};
