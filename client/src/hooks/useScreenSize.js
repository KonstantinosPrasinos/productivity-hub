import {useEffect, useState} from "react";

const getScreenSize = () => {
    if (window.innerWidth >= 930) return 'big';
    if (window.innerWidth < 500) return 'small';
    return 'medium';
}

export function useScreenSize() {
    const [screenSize, setScreenSize] = useState(getScreenSize());

    const handleResize = () => {
        setScreenSize(getScreenSize())
    }

    useEffect(() => {
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize)
        }
    }, [])

    return {screenSize};
}