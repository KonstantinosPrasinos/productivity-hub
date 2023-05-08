const {assembleEntryHistory, getDateAddDetails, findMostRecentDate} = require('../controllers/taskController');


describe("Test getDateAddDetails", () => {
    test("Success from 2 weeks to Date 14", () => {
        expect(getDateAddDetails("Weeks", 2)).toMatchObject({functionName: 'Date', timeToAdd: 14});
    })
})

describe("Test findMostRecentDate", () => {
    test("Test if it goes over current date", () => {
        const mockTask = {
            repeatRate: {
                number: 2,
                bigTimePeriod: "Weeks"
            },
            mostRecentProperDate: new Date(1682121600000) // Sat 22/4/23
        }

        const mockCurrentDate = new Date(1683331200000) // Sat 6/5/23

        expect(findMostRecentDate(mockTask, mockCurrentDate).getTime()).toBe(1683331200000) // Sat 6/5/23
    })
})

describe("Test assembleEntryHistory", () => {
    test("Success single day selected, checkbox", () => {
        const mockTask = {
            type: "Checkbox",
            repeatRate: {
                number: 2,
                bigTimePeriod: "Weeks",
                smallTimePeriod: ["Saturday"],
                startingDate: [1680912000000]
            },
            mostRecentProperDate: new Date(1683331200000) // Sat 6/5/23
        }

        const mockEntries = [
            {date: new Date(1680912000000), value: 1}, // Sat 8/4/23
            {date: new Date(1682121600000), value: 1} // Sat 22/4/23
        ]

        const mockCurrentDate = new Date(1683331200000) // Sat 6/5/23
        expect(assembleEntryHistory(mockEntries, mockTask, mockCurrentDate)).toBe(2);
    })

    test("Fail single day selected, checkbox", () => {
        const mockTask = {
            type: "Checkbox",
            repeatRate: {
                number: 2,
                bigTimePeriod: "Weeks",
                smallTimePeriod: ["Saturday"],
                startingDate: [1680912000000]
            },
            mostRecentProperDate: new Date(1683331200000)
        }

        const mockEntries = [
            {date: new Date(1680912000000), value: 1}, // Sat 8/4/23
        ]

        const mockCurrentDate = new Date(1683331200000) // Sat 6/5/23

        expect(assembleEntryHistory(mockEntries, mockTask, mockCurrentDate)).toBe(0);
    })

    test("Success multiple days selected, checkbox", () => {
        const mockTask = {
            type: "Checkbox",
            repeatRate: {
                number: 2,
                bigTimePeriod: "Weeks",
                smallTimePeriod: ["Saturday", "Sunday"],
                startingDate: [1680912000000, 1680998400000]
            },
            mostRecentProperDate: new Date(1683331200000)
        }

        const mockEntries = [
            {date: new Date(1680998400000), value: 1}, // Sun 9/4/23
            {date: new Date(1682121600000), value: 1}, // Sat 22/5/23
            {date: new Date(1682208000000), value: 1} // Sun 23/5/23
        ]

        const mockCurrentDate = new Date(1683331200000) // Sat 6/5/23

        expect(assembleEntryHistory(mockEntries, mockTask, mockCurrentDate)).toBe(3);
    })

    test("Fail multiple days selected, checkbox", () => {
        const mockTask = {
            type: "Checkbox",
            repeatRate: {
                number: 2,
                bigTimePeriod: "Weeks",
                smallTimePeriod: ["Saturday", "Sunday"],
                startingDate: [1680912000000, 1680998400000]
            },
            mostRecentProperDate: new Date(1683331200000)
        }

        const mockEntries = [
            {date: new Date(1680998400000), value: 1}, // Sun 9/4/23
            {date: new Date(1682121600000), value: 1} // Sat 22/5/23
        ]

        const mockCurrentDate = new Date(1683331200000) // Sat 6/5/23

        expect(assembleEntryHistory(mockEntries, mockTask, mockCurrentDate)).toBe(0);
    })

    test("Success single day selected, number", () => {
        const mockTask = {
            type: "Number",
            repeatRate: {
                number: 2,
                bigTimePeriod: "Weeks",
                smallTimePeriod: ["Saturday"],
                startingDate: [1680912000000]
            },
            goal: {
                type: "At least",
                number: 10
            },
            mostRecentProperDate: new Date(1683331200000)
        }

        const mockEntries = [
            {date: new Date(1680912000000), value: 10}, // Sat 8/4/23
            {date: new Date(1682121600000), value: 10} // Sat 22/5/23
        ]

        const mockCurrentDate = new Date(1683331200000) // Sat 6/5/23

        expect(assembleEntryHistory(mockEntries, mockTask, mockCurrentDate)).toBe(2);
    })

    test("Fail single day selected, number", () => {
        const mockTask = {
            type: "Number",
            repeatRate: {
                number: 2,
                bigTimePeriod: "Weeks",
                smallTimePeriod: ["Saturday"],
                startingDate: [1680912000000]
            },
            goal: {
                type: "At least",
                number: 10
            },
            mostRecentProperDate: new Date(1683331200000)
        }

        const mockEntries = [
            {date: new Date(1680912000000), value: 5}, // Sat 8/4/23
            {date: new Date(1682121600000), value: 10} // Sat 22/5/23
        ]

        const mockCurrentDate = new Date(1683331200000) // Sat 6/5/23

        expect(assembleEntryHistory(mockEntries, mockTask, mockCurrentDate)).toBe(1);
    })
})