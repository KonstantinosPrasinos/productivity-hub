import { createContext, useReducer } from "react";

export const ScreenSizeContext = createContext();

export const screenSizeReducer = (state, action) => {
    switch (action.type) {
        case 'SET_SIZE':
            return action.payload;
        default:
            return state;
    }
}

const ScreenSzieContextProvider = ({children}) => {
    const [state, dispatch] = useReducer(screenSizeReducer, 'light');

    return (
        <ScreenSizeContext.Provider value={{state, dispatch}}>
            {children}
        </ScreenSizeContext.Provider>
    );
}
 
export default ScreenSzieContextProvider;