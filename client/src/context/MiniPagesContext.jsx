import { createContext, useReducer } from "react";

export const MiniPagesContext = createContext();

export const miniPagesReducer = (state, action) => {
    switch (action.type) {
        case 'ADD_PAGE':
            // Only allow one page of the same type at a time
            if (state.find(page => page.type === action.payload.type)) {
                return [...state.filter(page => page.type !== action.payload.type), action.payload]
            } else {
                return [...state, action.payload];
            }
        case 'REMOVE_PAGE':
            return state.filter((_, i) => i !== state.length - 1)
        case 'REMOVE_SPECIFIC_PAGE':
            return state.filter(page => action.payload.type !== page.type && action.payload.id !== page.id);
        default:
            return state;
    }
}

const MiniPagesContextProvider = ({children}) => {
    const [state, dispatch] = useReducer(miniPagesReducer, []);

    return (
        <MiniPagesContext.Provider value={{state, dispatch}}>
            {children}
        </MiniPagesContext.Provider>
    );
}

export default MiniPagesContextProvider;