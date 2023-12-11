import {useState} from 'react';
import styles from './Table.module.scss';
import {AnimatePresence, motion} from "framer-motion";
import {TbChevronDown, TbChevronLeft, TbChevronRight, TbChevronUp, TbEdit, TbMinus} from "react-icons/tb";
import LoadingIndicator from "@/components/indicators/LoadingIndicator/LoadingIndicator.jsx";
import IconButton from "@/components/buttons/IconButton/IconButton.jsx";

const SortIcon = ({sortOrder}) => {
    switch (sortOrder) {
        case 0:
            return <TbMinus/>
        case 1:
            return <TbChevronUp />
        case -1:
            return <TbChevronDown />
    }
}

const TableContents = ({entries, isLoading = false, sortOrderDate = 1, sortOrderValue = 0, handleEntryEdit, hasEditColumn, datesAreRange = false}) => {
    const [pageNumber, setPageNumber] = useState(0);
    const currentDate = new Date();
    currentDate.setUTCHours(0, 0, 0, 0);

    if (isLoading) return (
        <tbody className={styles.tableLoading}>
        <tr>
            <td colSpan={3}></td>
        </tr>
        <tr>
            <td colSpan={3}></td>
        </tr>
        <tr>
            <td colSpan={3} className={styles.loadingIndicatorContainer}>
                <LoadingIndicator size={"inline"} />
            </td>
        </tr>
        <tr>
            <td colSpan={3}></td>
        </tr>
        <tr>
            <td colSpan={3}></td>
        </tr>
        <tr>
            <td colSpan={3}></td>
        </tr>
        </tbody>
    )

    if (entries.length === 0) return (
        <tbody>
            <tr>
                <td colSpan={3}>No tasks to view</td>
            </tr>
            <tr>
                <td colSpan={3}></td>
            </tr>
            <tr>
                <td colSpan={3}></td>
            </tr>
            <tr>
                <td colSpan={3}></td>
            </tr>
            <tr>
                <td colSpan={3}></td>
            </tr>
        </tbody>
    )

    let sortedEntries;

    if (sortOrderDate !== 0) {
        sortedEntries = entries.sort((a, b) => {
            let dA, dB

            if (datesAreRange) {
                dA = Date.parse(a.date.substring(0, a.date.indexOf(" ")));
                dB = Date.parse(b.date.substring(0, b.date.indexOf(" ")));
            } else {
                dA = Date.parse(a.date);
                dB = Date.parse(b.date);
            }

            return sortOrderDate * (dA - dB);
        });
    } else {
        sortedEntries = entries.sort((a, b) => {
            return sortOrderValue * (parseFloat(a.value) - parseFloat(b.value));
        });
    }

    const lastEntryNumber = () => {
        if (entries.length - 5 * pageNumber > 5) return (pageNumber * 5  + 5);
        return entries.length;
    }

    const increasePageNumber = () => {
        setPageNumber(current => current + 1);
    }
    const decreasePageNumber = () => {
        setPageNumber(current => current - 1);
    }

    const n = 5;

    const numbersArray = Array.from({length: n}, (_, index) => index);

    return (
        <>
            <tbody className={styles.tBody} key={pageNumber}>
            {numbersArray.map(i => {
                if (pageNumber * 5 + i >= sortedEntries.length) {
                    return <tr key={`empty-row-${i}`}>
                        <td></td>
                        <td></td>
                        {hasEditColumn && <td></td>}
                    </tr>
                } else {
                    const entry = sortedEntries[pageNumber * 5 + i];

                    if (entry) {
                        return <tr
                            key={entry.date}
                        >
                            <td className={entry.isProperDate ? styles.isProperDate : ""}>{datesAreRange ? entry.date : (new Date(entry.date)).toLocaleDateString()}</td>
                            <td>{entry.value}</td>
                            {hasEditColumn && <td>
                                <IconButton onClick={() => handleEntryEdit(entry)}>
                                    <TbEdit/>
                                </IconButton>
                            </td>}
                        </tr>
                    }
                }
            })}
            </tbody>
            <tfoot>
            <tr>
                <td colSpan={hasEditColumn ? 3 : 2}>
                    <div className={"Horizontal-Flex-Container Space-Between"}>
                        <div>{pageNumber * 5 + 1}-{lastEntryNumber()} of {entries.length}</div>
                        <div>
                            <IconButton
                                onClick={decreasePageNumber}
                                disabled={pageNumber === 0}
                            >
                                <TbChevronLeft />
                            </IconButton>
                            <IconButton
                                onClick={increasePageNumber}
                                disabled={pageNumber === Math.floor((entries.length - 1) / 5)}
                            >
                                <TbChevronRight />
                            </IconButton>
                        </div>
                    </div>
                </td>
            </tr>
            </tfoot>
        </>
    )
}

const Table = ({entries, entriesLoading, setIsVisibleNewEntryModal, handleEditEntry, hasEditColumn = true, datesAreRange = false}) => {
    const [sortOrderDate, setSortOrderDate] = useState(-1); // -1 for most recent -> less recent, 1 for less recent -> most recent, 0 if sorting by other type.
    const [sortOrderValue, setSortOrderValue] = useState(0);

    const handleChangeSortOrderValue = () => {
        switch (sortOrderValue) {
            case 0:
                setSortOrderValue(-1);
                setSortOrderDate(0);
                break;
            case 1:
                setSortOrderValue(-1);
                break;
            case -1:
                setSortOrderValue(1);
                break;
            default:
                break;
        }
    }

    const handleChangeSortOrderDate = () => {
        switch (sortOrderDate) {
            case 0:
                setSortOrderDate(-1);
                setSortOrderValue(0);
                break;
            case 1:
                setSortOrderDate(-1);
                break;
            case -1:
                setSortOrderDate(1);
                break;
            default:
                break;
        }
    }

    return (
        <motion.table className={styles.table}>
            <thead>
            <tr>
                <th>
                    <button className={styles.tableButton} onClick={handleChangeSortOrderDate}>
                        Date:
                        <AnimatePresence mode={"wait"}>
                            <motion.div
                                key={sortOrderDate}
                                initial={{scale: 0}}
                                animate={{scale: 1}}
                                exit={{scale: 0}}
                                transition={{duration: 0.1}}
                            >
                                <SortIcon sortOrder={sortOrderDate}/>
                            </motion.div>
                        </AnimatePresence>
                    </button>
                </th>
                <th>
                    <button className={styles.tableButton} onClick={handleChangeSortOrderValue}>
                        Value:
                        <AnimatePresence mode={"wait"}>
                            <motion.div
                                key={sortOrderValue}
                                initial={{scale: 0}}
                                animate={{scale: 1}}
                                exit={{scale: 0}}
                                transition={{duration: 0.1}}
                            >
                                <SortIcon sortOrder={sortOrderValue}/>
                            </motion.div>
                        </AnimatePresence>
                    </button>
                </th>
                {hasEditColumn && <th></th>}
            </tr>
            </thead>
            <TableContents
                entries={entries}
                sortOrderDate={sortOrderDate}
                isLoading={entriesLoading}
                sortOrderValue={sortOrderValue}
                setIsVisibleNewEntryModal={setIsVisibleNewEntryModal}
                handleEntryEdit={handleEditEntry}
                hasEditColumn={hasEditColumn}
                datesAreRange={datesAreRange}
            />
        </motion.table>
    );
};

export default Table;