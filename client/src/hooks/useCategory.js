import {useContext, useEffect, useState} from "react";
import {AlertsContext} from "../context/AlertsContext";
import {useDispatch, useSelector} from "react-redux";
import {addCategory, setCategories} from "../state/categoriesSlice";
import {useGroup} from "./useGroup";

export function useCategory () {
    const categories = useSelector((state) => state?.categories.categories);
    const dispatch = useDispatch();
    const alertsContext = useContext(AlertsContext);
    const {addGroupToServer} = useGroup();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (categories === false) {
            let ignore = false;

            setIsLoading(true);

            fetch('http://localhost:5000/api/category', {
                method: 'GET',
                headers: {'Content-Type': 'application/json'},
                credentials: 'include'
            })
                .then(response => {
                    if (response.ok) {
                        return response.json()
                    }

                    return Promise.reject(response);
                })
                .then(json => {
                    if (!ignore) {
                        dispatch(setCategories(json.categories));
                    }

                    setIsLoading(false);
                })
                .catch(error => alertsContext.dispatch({
                    type: 'ADD_ALERT',
                    payload: {type: 'error', message: error.message}
                }))

            return () => {
                ignore = true;
            }
        }
    }, [])

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

    return {isLoading, addCategoryToServer};
}