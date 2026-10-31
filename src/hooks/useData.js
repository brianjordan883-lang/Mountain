import { useContext } from "react";
import { DataContext } from "../context/contexts";

export const useData = () => useContext(DataContext);
