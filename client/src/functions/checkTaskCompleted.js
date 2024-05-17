export const checkTaskCompleted = (task, entry) => {
    // Checks if a task is completed
    // For checkbox return true when value is not zero
    // For number if it has goal return false always
    // Else look for if it completes goal
    if (task.type === "Checkbox") {
        return entry.value !== 0;
    } else {
        if (!task?.goal) {
            return false;
        } else {
            switch (task.goal.limit) {
                case "At least":
                    return entry.value >= task.goal.number;
                case "At most":
                    return entry.value <= task.goal.number;
                case "Exactly":
                    return entry.value === task.goal.number;
            }
        }
    }
}