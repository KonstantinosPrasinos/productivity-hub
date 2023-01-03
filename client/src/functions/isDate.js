export function isDate(string) {
    const date = new Date(string)
    return isNaN(date.getDate());
}