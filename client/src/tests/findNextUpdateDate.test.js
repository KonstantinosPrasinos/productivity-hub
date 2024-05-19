import {findNextUpdateDate} from "../functions/findNextUpdateDate.js/index.js";

test("1 day different day, no smallTimePeriod", () => {
    const mockToday = new Date("2023-11-29T00:00:00.000Z")

    const mockTask = {
        repeatRate: {
            bigTimePeriod: "Days",
            number: 1,
            startingDate: [new Date("2023-11-27T00:00:00.000Z")]
        }
    };

    expect(findNextUpdateDate(mockTask, mockToday)).toStrictEqual(new Date("2023-11-29T00:00:00.000Z"));
})

test("1 week different day, no smallTimePeriod", () => {
    const mockToday = new Date("2023-11-28T00:00:00.000Z")

    const mockTask = {
        repeatRate: {
            bigTimePeriod: "Week",
            number: 1,
            startingDate: [new Date("2023-11-27T00:00:00.000Z")]
        }
    };

    expect(findNextUpdateDate(mockTask, mockToday)).toStrictEqual(new Date("2023-11-28T00:00:00.000Z"));
})

test("1 month different day, no smallTimePeriod", () => {
    const mockToday = new Date("2023-11-30T00:00:00.000Z")

    const mockTask = {
        repeatRate: {
            bigTimePeriod: "Month",
            number: 1,
            startingDate: [new Date("2023-11-27T00:00:00.000Z")]
        }
    };

    expect(findNextUpdateDate(mockTask, mockToday)).toStrictEqual(new Date("2023-11-30T00:00:00.000Z"));
})

test("1 week same day, with small time period", () => {
    const mockToday = new Date("2023-12-07T00:00:00.000Z")

    const mockTask = {
        repeatRate: {
            bigTimePeriod: "Weeks",
            number: 1,
            smallTimePeriod: ["Thursday"],
            startingDate: [new Date("2023-11-30T00:00:00.000Z")]
        }
    };

    expect(findNextUpdateDate(mockTask, mockToday)).toStrictEqual(new Date("2023-12-07T00:00:00.000Z"));
})

test("1 week different day, with small time period", () => {
    const mockToday = new Date("2023-12-06T00:00:00.000Z")

    const mockTask = {
        repeatRate: {
            bigTimePeriod: "Weeks",
            number: 1,
            smallTimePeriod: ["Thursday"],
            startingDate: [new Date("2023-11-30T00:00:00.000Z")]
        }
    };

    expect(findNextUpdateDate(mockTask, mockToday)).toStrictEqual(new Date("2023-12-07T00:00:00.000Z"));
})