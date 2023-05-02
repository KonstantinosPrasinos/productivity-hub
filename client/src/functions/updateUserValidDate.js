export const updateUserValidDate = () => {
    const currentUser = JSON.parse(localStorage.getItem("user"));
    const currentDate = new Date();

    currentDate.setMonth(currentDate.getMonth() + 1);
    currentDate.setHours(currentDate.getHours() - 1);

    localStorage.setItem("user", JSON.stringify({...currentUser, validUntil: currentDate}));
}