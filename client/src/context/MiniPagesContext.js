import { createContext, useReducer } from "react";

export const MiniPagesContext = createContext();

export const miniPagesReducer = (state, action) => {
    switch (action.type) {
        case 'ADD_PAGE':
            if (state.filter(page => page.type === action.payload.type && page.id === action.payload._id).length === 0){
                return [...state, action.payload];
            }
            return state;
        case 'REMOVE_PAGE':
            return state.filter((_, i) => i !== state.length - 1)
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