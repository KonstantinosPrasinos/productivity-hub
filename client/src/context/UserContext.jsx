import { createContext, useReducer } from "react";

export const UserContext = createContext();

export const userReducer = (state, action) => {
    switch (action.type) {
        case 'SET_USER':
            return action.payload;
        case 'REMOVE_USER':
            return null;
        default:
            return state;
    }
}

const UserContextProvider = ({children}) => {
    const [state, dispatch] = useReducer(userReducer, {isLoading: true});

    return (
        <UserContext.Provider value={{state, dispatch}}>
            {children}
        </UserContext.Provider>
    );
}

export default UserContextProvider;