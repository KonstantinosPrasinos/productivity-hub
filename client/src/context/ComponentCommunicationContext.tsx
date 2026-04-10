import { createContext, useReducer, type ReactNode, type Dispatch } from "react";

export interface ComponentCommunicationState {
  searchScreenVisible: boolean,
  filters: any[],
  searchQuery: string
}

interface ReducerAction {
  type: string,
  payload: any,
}

export const ComponentCommunicationContext = createContext<{
  state: ComponentCommunicationState;
  dispatch: Dispatch<ReducerAction>;
}>({
  state: {
    searchScreenVisible: false,
    filters: [],
    searchQuery: "",
  },
  dispatch: () => undefined,
});

export const componentCommunicationReducer = (state: ComponentCommunicationState, action: ReducerAction) => {
  switch (action.type) {
    case "SET_SEARCH_SCREEN_VISIBLE":
      return { ...state, searchScreenVisible: action.payload };
    case "SET_TASK_FILTERS":
      return { ...state, filters: action.payload };
    case "SET_SEARCH_QUERY":
      return { ...state, searchQuery: action.payload };
    default:
      return state;
  }
};

const ComponentCommunicationContextProvider = ({ children }: { children: ReactNode }) => {
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
