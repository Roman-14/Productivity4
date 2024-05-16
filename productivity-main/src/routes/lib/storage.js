import { writable, get } from 'svelte/store';
import { io } from 'socket.io-client'

const socket = io()


export let changeOverTime = { hours: 4, minutes: 0, todayOverride: "" };

export function getToday(daysAdded = 0) {
    let today;
    if (changeOverTime.todayOverride !== '') {
        today = new Date(changeOverTime.todayOverride);
    } else {
        today = new Date();

        if (today.getHours() < changeOverTime.hours ||
            (today.getHours() == changeOverTime.hours && today.getMinutes() < changeOverTime.minutes))
            today.setDate(today.getDate() - 1);
    }

    today.setDate(today.getDate() + daysAdded);

    return formatDateLocal(today);
}

export function formatDateLocal(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

export function formatDateUTC(date) {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

export const tasks = writable([]);
export const counts = writable({});

export const streak = writable(0);
export const streakfreezes = writable(0);
export const daysuntilfreeze = writable(3);
export const notes = writable([]);
const endpoints = { streak, streakfreezes, daysuntilfreeze, counts, tasks, notes };
for (let name in endpoints) {
    socket.on('update-' + name, (message) => {
        endpoints[name].set(message);
    });
}

socket.once('update-tasks', () => {
    // counts is guaranteed to have been initialized already
    simulateOfflineDayChangeovers();
    tasks.subscribe(storeTasks);
})
socket.once('update-notes', () => {
    notes.subscribe((notesVal) => socket.emit('set-notes', notesVal));
});
for (let name in endpoints) {
    socket.emit('get-' + name);
}


function storeTasks(tasksVal, day = getToday()) {
    console.debug("Storing tasks")

    let completed = 0;
    let points = 0;

    for (let task of tasksVal) {
        if (isTaskOnDay(task, day)) {
            completed += task.completed;
            points += task.points * task.completed;
        }
    }

    counts.update(countsVal => (countsVal[day] = { tasks: completed, points: points }, countsVal));

    socket.emit('set-counts', get(counts));
    socket.emit('set-tasks', tasksVal);
}

export function getData(counts, daysBack = 30) {
    const data = [];

    let day = new Date(getToday());
    for (let i = 0; i < daysBack; i++) {
        data.push([day, counts[formatDateUTC(day)] || { tasks: 0, points: 0 }]);
        day = new Date(day); // Create a new Date instance
        day.setUTCDate(day.getUTCDate() - 1);
    }

    return data;
}

export function simulateOfflineDayChangeovers() {
    const countsVal = get(counts)

    if (!countsVal[getToday()]) {
        const days = Math.round(
            (new Date(getToday()).getTime() -
                new Date(Object.keys(countsVal).sort().at(-1))) /
            86_400_000
        );
        console.debug("Offline DayChangeover: Simulating", days, "days")

        for (let i = 0; i < days; i++) {
            onDayChangeover();

            if (get(streak) == 0 && get(streakfreezes) == 0)
                break;
        }
    }
}

export function onDayChangeover() {
    const yesterday = getToday(-1);

    let points = 0;
    let totalpoints = 0;
    const newTasks = get(tasks).filter(task => {
        const shouldRemove = task.timeType == "Keep Until Complete" && task.completed == task.upto;
        if (task.timeType=="Keep Until Complete") {
            task.upto = task.upto - task.completed
        }
        if (isTaskOnDay(task, yesterday) && task.timeType !="Keep Until Complete") {
            totalpoints += task.points * task.upto;
            points += task.points * task.completed;
        }
        task.completed = false;

        return !shouldRemove;
    });
    const newCounts = get(counts);
    newCounts[getToday()] = { tasks: 0, points: 0 };

    let pointsPercent;
    if (totalpoints == 0)
        pointsPercent = 0;
    else
        pointsPercent = points / totalpoints;

    let newStreak = get(streak);
    let newStreakfreezes = get(streakfreezes);
    let newDaysuntilfreeze = get(daysuntilfreeze);

    if (pointsPercent >= 0.49) {
        newStreak += 1;
        newDaysuntilfreeze -= 1;
    } else if (newStreakfreezes >= 1) {
        newStreakfreezes -= 1;
    } else {
        newStreak = 0;
        newDaysuntilfreeze = 3;
    }
    if (newDaysuntilfreeze == 0 && newStreakfreezes < 3) {
        newDaysuntilfreeze = 3;
        newStreakfreezes += 1;
    } else if (newDaysuntilfreeze == 0) {
        newDaysuntilfreeze = 3;
    }

    console.debug(`Got ${points}/${totalpoints} (${pointsPercent}%), now we have: Streak: ${get(streak)}, StreakFreezes: ${get(streakfreezes)}, DaysTilNextFreeze: ${get(daysuntilfreeze)}`)

    socket.emit('do-daychangeover', {
        day: getToday(),
        streak: newStreak,
        streakfreezes: newStreakfreezes,
        daysuntilfreeze: newDaysuntilfreeze,
        counts: newCounts,
        tasks: newTasks,
    });
}


export function isTaskOnDay(task, day = getToday()) {
    if (task.paused) { return false }
    const days = Math.round(
        (new Date(day).getTime() - new Date(task.starting)) /
        86_400_000
    );

    if (task.every == 0) {
        return days == 0;
    } else {
        if (task.timeType == "Daily") {
            if (days % task.every == 0 && days >= 0) {
                return true;
            }
        } else if (task.timeType == "Weekly") {
            const daysTilMonday = days + ((new Date(task.starting).getUTCDay() + 6) % 7);
            const weeksBetween = Math.floor(daysTilMonday / 7);
            if (
                task.toggled.includes(
                    ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
                    new Date(day).getUTCDay()
                    ]
                ) &&
                days >= 0 &&
                weeksBetween % task.every == 0
            ) {
                return true;
            }
        } else if (task.timeType == "Monthly") {
            const monthsBetween =
                new Date(day).getUTCFullYear() * 12 +
                new Date(day).getUTCMonth() -
                new Date(task.starting).getUTCFullYear() * 12 -
                new Date(task.starting).getUTCMonth();
            if (
                task.toggled.includes(new Date(day).getUTCDate()) &&
                days >= 0 &&
                monthsBetween % task.every == 0
            ) {
                return true;
            }
        } else if (task.timeType == "Keep Until Complete") {
            if (days >= 0) {
                return true;
            }
        }
    }

    return false;
}