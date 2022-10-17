import { createContext, useReducer } from "react";

export const ModalContext = createContext();

export const modalReducer = (state, action) => {
    switch (action.type) {
        case 'TOGGLE_MODAL':
            return !state;
        default:
            return state;
    }
}

const ModalContextProvider = ({children}) => {
    const [state, dispatch] = useReducer(modalReducer, false);

    return (
        <ModalContext.Provider value={{state, dispatch}}>
            {children}
        </ModalContext.Provider>
    );
}

export default ModalContextProvider;