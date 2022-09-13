import { createContext, useReducer } from "react";

export const ThemeContext = createContext();

export const themeReducer = (state, action) => {
    switch (action.type) {
        case 'SET_THEME':
            return action.payload;
        default:
            return state;
    }
}

const ThemeContextProvider = ({children}) => {
    const [state, dispatch] = useReducer(themeReducer, 'light');

    return (
        <ThemeContext.Provider value={{state, dispatch}}>
            {children}
        </ThemeContext.Provider>
    );
}
 
export default ThemeContextProvider;