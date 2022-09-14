import { createContext, useReducer } from "react";

export const AlertsContext = createContext();

export const alertsReducer = (state, action) => {
    switch (action.type) {
        case 'ADD_ALERT':
            if (state.length < 10) {
                for (let i=0; i < 10; i++) {
                    if (!state.find(alert => alert.id === i)) {
                        let obj = {id: i};
                        return [...state, {...action.payload, ...obj}];
                    }
                }
                
            }
            return state;
        case 'DELETE_ALERT':
            return state.slice(1);
        default:
            return state;
    }
}

const AlertsContextProvider = ({children}) => {
    const [state, dispatch] = useReducer(alertsReducer, []);

    return (
        <AlertsContext.Provider value={{state, dispatch}}>
            {children}
        </AlertsContext.Provider>
    );
}
 
export default AlertsContextProvider;