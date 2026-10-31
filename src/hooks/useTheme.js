import { useContext } from "react";
import { ThemeContext } from "../context/contexts";

export const useTheme = () => useContext(ThemeContext);
