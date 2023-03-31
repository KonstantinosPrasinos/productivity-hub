import {createContext, useEffect, useReducer} from "react";
import {useQueryClient} from "react-query";

export const UndoContext = createContext();

export const undoReducer = (state, action) => {
    switch (action.type) {
        case 'ADD_UNDO':
            const {type, id} = action.payload;
            if (type && id) {
                return {type, id};
            }
            return state;
        case 'REMOVE_UNDO':
            return {};
        default:
            return state;
    }
}

const UndoContextProvider = ({children}) => {
    const [state, dispatch] = useReducer(undoReducer, {});
    const queryClient = useQueryClient();
    let timeout;

    useEffect(() => {
        const removeUndo = () => {
            // Remove task and all it's entries from cache
            switch (state.type) {
                case 'task':
                    queryClient.setQueryData({queryKey: ["tasks"]}, (oldData) => {
                        return {tasks: [...oldData.tasks.filter(task => task._id !== state.id)]}
                    });
                    queryClient.invalidateQueries({queryKey: ["task-entries", state.id]});
                    break;
                default:
                    break;
            }
            dispatch({type: 'REMOVE_UNDO'});
        }

        if (state.type) {
            timeout = setTimeout(removeUndo, 10 * 1000);
        } else {
            clearTimeout(timeout);
        }

        return () => {
            clearTimeout(timeout);
        }
    }, [state])

    return (
        <UndoContext.Provider value={{state, dispatch}}>
            {children}
        </UndoContext.Provider>
    )
}

export default UndoContextProvider;