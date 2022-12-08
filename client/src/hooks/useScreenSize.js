import {useEffect, useState} from "react";

const getScreenSize = () => {
    if (window.innerWidth > 768) return 'big';
    return 'small'
}

export function useScreenSize() {

    const [screenSize, setScreenSize] = useState(getScreenSize());

    const handleResize = () => {
        setScreenSize(getScreenSize())
    }

    useEffect(() => {
        console.log(screenSize);
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize)
        }
    }, [])

    return {screenSize};
}