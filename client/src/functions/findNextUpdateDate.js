import {getDateAddDetails} from "./getDateAddDetails.js";

export const findNextUpdateDate = (task, fakeCurrentDate) => {
    // In case something breaks in the back end
    if (!task.mostRecentProperDate && task?.repeatRate?.startingDate?.length === 0) {
        return false;
    }

    const date = new Date(task.mostRecentProperDate ?? task.repeatRate.startingDate[0]);
    date.setUTCHours(0, 0, 0, 0);

    let currentDate;

    if (fakeCurrentDate) {
        currentDate = fakeCurrentDate;
    } else {
        currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
    }

    // Get the time that should be added to each date for a repetition
    const {functionName, timeToAdd} = getDateAddDetails(task.repeatRate.bigTimePeriod, task.repeatRate.number);

    // Find next local date it should render
    while(currentDate.getTime() > date.getTime()) {
        let wentOver = false;

        if (task.repeatRate.startingDate.length > 1 && currentDate.getTime() > date.getTime()) {
            for (let index in task.repeatRate.startingDate) {
                if (index !== "0") {
                    const currentStartingDate = new Date(task.repeatRate.startingDate[index]);
                    const previousStartingDate = new Date(task.repeatRate.startingDate[index - 1]);

                    date.setTime(date.getTime() + (currentStartingDate.getTime() - previousStartingDate.getTime()));

                    if (date.getTime() >= currentDate.getTime()) {
                        wentOver = true;
                        break;
                    }
                }
            }
        }
        if (wentOver) break;
        date[`set${functionName}`](date[`get${functionName}`]() + timeToAdd);
    }
    return date;
}