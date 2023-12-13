import {getDateAddDetails} from "@/functions/getDateAddDetails.js";

export function dateIsProper(date, task) {
    const {functionName, timeToAdd} = getDateAddDetails(task.repeatRate.bigTimePeriod, task.repeatRate.number);
    const today = new Date();

    if (date.getTime() >= today.getTime()) {
        return false;
    }

    let startDate = new Date(task.repeatRate.startingDate[0]);

    while(startDate.getTime() < date.getTime()) {
        startDate[`set${functionName}`](startDate[`get${functionName}`]() + timeToAdd);
    }

    for (let index in task.repeatRate.startingDate) {
        if (index === "0") {
            if (startDate.getTime() === date.getTime()) {
                return true;
            }
        } else {
            const currentStartingDate = new Date(task.repeatRate.startingDate[index]);
            const previousStartingDate = new Date(task.repeatRate.startingDate[index - 1]);

            startDate.setTime(startDate.getTime() + (currentStartingDate.getTime() - previousStartingDate.getTime()));

            if (startDate.getTime() === date.getTime()) {
                return true;
            }
        }
    }

    return false;
}