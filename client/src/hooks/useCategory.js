import {useContext, useState} from "react";
import {AlertsContext} from "../context/AlertsContext";
import {useDispatch} from "react-redux";
import {addCategory, setCategories} from "../state/categoriesSlice";
import {useGroup} from "./useGroup";

export function useCategory () {
    const dispatch = useDispatch();
    const alertsContext = useContext(AlertsContext);
    const {addGroupToServer} = useGroup();
    const [isLoading, setIsLoading] = useState(false);

    const getCategories = async () => {
        setIsLoading(true);

        const response = await fetch('http://localhost:5000/api/category', {
            method: 'GET',
            headers: {'Content-Type': 'application/json'},
            credentials: 'include'
        });

        const data = await response.json();
        setIsLoading(false);

        if (!response.ok) {
            alertsContext.dispatch({type: 'ADD_ALERT', payload: {type: 'error', message: data.message}})
            return false;
        }

        dispatch(setCategories(data.tasks));
        return true;
    }

    const addCategoryToServer = async (category, groups) => {
        const response = await fetch('http://localhost:5000/api/category/create', {
            method: 'POST',
            body: JSON.stringify({category}),
            headers: {'Content-Type': 'application/json'},
            credentials: 'include'
        });

        const data = await response.json();

        if (!response.ok) {
            console.log(data);
        } else {
            for (const group of groups) {
                const groupWithParent = {...group, parent: data._id};
                await addGroupToServer(groupWithParent);
            }

            dispatch(addCategory(data));
        }
    }

    return {isLoading, getCategories, addCategoryToServer};
}