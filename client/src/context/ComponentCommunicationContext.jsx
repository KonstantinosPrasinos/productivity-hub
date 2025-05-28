import { createContext, useReducer } from "react";

export const ComponentCommunicationContext = createContext();

export const componentCommunicationReducer = (state, action) => {
  switch (action.type) {
    case "SET_SEARCH_SCREEN_VISIBLE":
      return { ...state, searchScreenVisible: action.payload };
    case "SET_TASK_FILTERS":
      return { ...state, filters: action.payload };
    case "SET_SEARCH_QUERY":
      return {...state, searchQuery: action.payload};
    default:
      return state;
  }
};

const ComponentCommunicationContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(componentCommunicationReducer, {
    searchScreenVisible: false,
    filters: [],
    searchQuery: "",
  });

  return (
    <ComponentCommunicationContext.Provider value={{ state, dispatch }}>
      {children}
    </ComponentCommunicationContext.Provider>
  );
};

export default ComponentCommunicationContextProvider;
