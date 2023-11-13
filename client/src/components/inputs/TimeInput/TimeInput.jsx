import React, {useCallback, useEffect, useRef, useState} from 'react';
import styles from "./TimeInput.module.scss";
import {TbClock} from "react-icons/all";
import IconButton from "@/components/buttons/IconButton/IconButton";
import {debounce} from "lodash";
import {createPortal} from "react-dom";

const TimeInput = ({hour = "11", setHour, minute = "11", setMinute, isDisabled = false}) => {
    const [pickerVisible, setPickerVisible] = useState(false);

    const pickerRef = useRef();
    const hourPickerRef = useRef();
    const minutePickerRef = useRef();
    const baseRef = useRef();

    const handleHourWheelEvent = useCallback(debounce((event) => {

        const emSize = parseInt(window.getComputedStyle(event.target).fontSize);

        if (!isNaN(emSize)) {
            let value = Math.round((event.target.scrollTop / emSize) * (1 / 1.4));

            setHour(value);
        }
    }, 100), []);

    const handleMinuteWheelEvent = useCallback(debounce((event) => {
        const emSize = parseInt(window.getComputedStyle(event.target).fontSize);

        let value = Math.round((event.target.scrollTop / emSize) * (1 / 1.4));

        if (value < 10) {
            value = `0${value}`
        }

        setMinute(value);
    }, 100), []);

    const setPickerPosition = () => {
        if (!pickerRef.current) return;

        const emSize = parseFloat(window.getComputedStyle(pickerRef.current).fontSize);
        let top, left;

        top = baseRef.current.getBoundingClientRect().top;
        left = baseRef.current.getBoundingClientRect().left;

        pickerRef.current.style.top = `${top - 1.4 * emSize + 0.8}px`;
        pickerRef.current.style.left = `${left}px`;
    }

    const collapsePicker = () => {
        pickerRef.current.classList.add(styles.collapsed);
        window.removeEventListener("resize", collapsePicker);
    }

    const expandPicker = () => {
        setPickerVisible(true);
        window.addEventListener("resize", collapsePicker);
    }

    const handleTransitionEnd = (event) => {
        if (event.target !== pickerRef.current) return;

        setPickerVisible(false);
    }

    useEffect(() => {
        if (!pickerVisible) return;

        setPickerPosition();

        const emSize = parseInt(window.getComputedStyle(pickerRef.current).fontSize);

        const hourTop = (parseFloat(hour) / (1 / 1.4)) * emSize;
        const minuteTop = (parseFloat(minute) / (1 / 1.4)) * emSize;

        hourPickerRef.current.scrollTo({
            top: hourTop,
            left: 0,
            behavior: "instant"
        })

        minutePickerRef.current.scrollTo({
            top: minuteTop,
            left: 0,
            behavior: "instant"
        })
    }, [pickerVisible]);

    useEffect(() => {
        return () => {
            window.removeEventListener("resize", collapsePicker);
        }
    }, []);

    const handleHourChange = (event) => {
        // Only allow numbers
        if (isNaN(event.target.value)) return;
        if (event.target.value.length > 2) return;
        if (parseInt(event.target.value) > 23) return;
        setHour(event.target.value);
    }
    const handleHourBlur = (event) => {
        if (event.target.value.length === 0) setHour("0");
    }

    const handleMinuteChange = (event) => {
        if (isNaN(event.target.value)) return;
        if (event.target.value.length > 2) return;
        if (parseInt(event.target.value) > 59) return;
        setMinute(event.target.value);
    }

    const handleMinuteBlur = (event) => {
        if (event.target.value.length === 0) setMinute("00");
        if (event.target.value.length === 1) setMinute(`0${minute}`);
    }

    const handleOverlayClick = (e) => {
        e.stopPropagation();
        collapsePicker();
    }

    const handlePickerClick = (e) => {
        e.stopPropagation();
    }

    return (
        <div className={styles.container}>
            <div className={styles.baseContainer} ref={baseRef}>
                <div className={styles.inputContainer}>
                    <input value={hour} onChange={handleHourChange} onBlur={handleHourBlur} disabled={isDisabled}/>
                    <div>:</div>
                    <input value={minute} onChange={handleMinuteChange} onBlur={handleMinuteBlur} disabled={isDisabled}/>
                </div>
                <IconButton
                    disabled={isDisabled}
                    onClick={expandPicker}
                >
                    <TbClock/>
                </IconButton>
            </div>
            {pickerVisible && createPortal(
                (<div className={styles.pickerOverlay} onClick={handleOverlayClick}>
                    <div ref={pickerRef} onClick={handlePickerClick} className={styles.floatingContainer}
                         onTransitionEnd={handleTransitionEnd}>
                        <div className={styles.relativeContainer}>
                            <div className={styles.inputContainer}>
                                <ul className={styles.pickerContainer} onScroll={handleHourWheelEvent} ref={hourPickerRef}>
                                    <li></li>
                                    <li>0</li>
                                    <li>1</li>
                                    <li>2</li>
                                    <li>3</li>
                                    <li>4</li>
                                    <li>5</li>
                                    <li>6</li>
                                    <li>7</li>
                                    <li>8</li>
                                    <li>9</li>
                                    <li>10</li>
                                    <li>11</li>
                                    <li>12</li>
                                    <li>13</li>
                                    <li>14</li>
                                    <li>15</li>
                                    <li>16</li>
                                    <li>17</li>
                                    <li>18</li>
                                    <li>19</li>
                                    <li>20</li>
                                    <li>21</li>
                                    <li>22</li>
                                    <li>23</li>
                                    <li></li>
                                </ul>
                                <div>:</div>
                                <ul className={styles.pickerContainer} onScroll={handleMinuteWheelEvent}
                                    ref={minutePickerRef}>
                                    <li></li>
                                    <li>00</li>
                                    <li>01</li>
                                    <li>02</li>
                                    <li>03</li>
                                    <li>04</li>
                                    <li>05</li>
                                    <li>06</li>
                                    <li>07</li>
                                    <li>08</li>
                                    <li>09</li>
                                    <li>10</li>
                                    <li>11</li>
                                    <li>12</li>
                                    <li>13</li>
                                    <li>14</li>
                                    <li>15</li>
                                    <li>16</li>
                                    <li>17</li>
                                    <li>18</li>
                                    <li>19</li>
                                    <li>20</li>
                                    <li>21</li>
                                    <li>22</li>
                                    <li>23</li>
                                    <li>24</li>
                                    <li>25</li>
                                    <li>26</li>
                                    <li>27</li>
                                    <li>28</li>
                                    <li>29</li>
                                    <li>30</li>
                                    <li>31</li>
                                    <li>32</li>
                                    <li>33</li>
                                    <li>34</li>
                                    <li>35</li>
                                    <li>36</li>
                                    <li>37</li>
                                    <li>38</li>
                                    <li>39</li>
                                    <li>40</li>
                                    <li>41</li>
                                    <li>42</li>
                                    <li>43</li>
                                    <li>44</li>
                                    <li>45</li>
                                    <li>46</li>
                                    <li>47</li>
                                    <li>48</li>
                                    <li>49</li>
                                    <li>50</li>
                                    <li>51</li>
                                    <li>52</li>
                                    <li>53</li>
                                    <li>54</li>
                                    <li>55</li>
                                    <li>56</li>
                                    <li>57</li>
                                    <li>58</li>
                                    <li>59</li>
                                    <li></li>
                                </ul>
                            </div>
                            <IconButton
                                disabled={isDisabled}
                                onClick={collapsePicker}
                            >
                                <TbClock/>
                            </IconButton>
                        </div>
                    </div>
                </div>),
                document.getElementById("app") ?? document.getElementById("root"))}
        </div>
    );
};

export default TimeInput;