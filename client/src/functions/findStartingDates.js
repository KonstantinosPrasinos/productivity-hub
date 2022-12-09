export function findStartingDates(timePeriod, smallTimePeriods) {
    let startingDates = [];

    smallTimePeriods.forEach(smallTimePeriod => {
        let startingDate = new Date();

        switch (timePeriod) {
            case 'Days':
                break;
            case 'Weeks':
                const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

                const weekDaysDifference = days.findIndex(day => day === smallTimePeriod) + 1 - startingDate.getDay();
                startingDate.setDate(startingDate.getDate() + weekDaysDifference);
                break;
            case 'Months':
                startingDate.setDate(smallTimePeriod?.getDate());
                break;
            case 'Years':
                startingDate.setTime(smallTimePeriod?.getTime());
                break;
        }
        startingDate.setUTCHours(0, 0, 0, 0);
        startingDates.push(startingDate.getTime());
    });

    return startingDates;
}