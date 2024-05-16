<script>
    import { createEventDispatcher } from "svelte";

    import { getToday, formatDateUTC } from "./storage";
    const dispatch = createEventDispatcher();
    let timeType = "Daily";
    let counter = 0;
    let monthToggles = new Array(31).fill(false);
    let weekToggles = new Array(7).fill(false);
    let name = "";
    let points = 50;
    let every_day = 0;
    let starting_day = getToday();
    let starting_keep = getToday();
    let every_week = 0;
    let starting_week = "";
    let every_month = 0;
    let starting_month = "";
    let counterToggled = false;
    let upto = 1;
    function clicked(direction) {
        if (direction == "left") {
            counter -= 1;
        } else {
            counter += 1;
        }

        timeType = ["Daily", "Weekly", "Monthly","Keep Until Complete"][((counter % 4) + 4) % 4];
    }
</script>

<form
    class="calendar-box"
    on:submit|preventDefault={(_) => {
        let obtainWeeks = [];
        let obtainMonths = [];
        for (let i = 0; i < monthToggles.length; i++) {
            if (monthToggles[i]) {
                obtainMonths.push(i+1);
            }
        }
        for (let i = 0; i < weekToggles.length; i++) {
            if (weekToggles[i]) {
                obtainWeeks.push(
                    ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]
                );
            }
        }
        if (!counterToggled) {
            upto = 1;
        }
        if (timeType == "Daily") {
            dispatch("task-created", {
                value: name,
                completed: 0,
                points: points,
                every: every_day,
                starting: starting_day,
                timeType: timeType,
                upto: upto,
                paused: false,
            });
        }
        if (timeType == "Weekly") {
            if (obtainWeeks.length == 0) return;
            dispatch("task-created", {
                value: name,
                completed: 0,
                points: points,
                every: every_week,
                starting: formatDateUTC(starting_week.valueAsDate),
                toggled: obtainWeeks,
                timeType: timeType,
                upto: upto,
                paused: false,
            });
        }
        if (timeType == "Monthly") {
            if (obtainMonths.length == 0) return;
            dispatch("task-created", {
                value: name,
                completed: 0,
                points: points,
                every: every_month,
                starting: starting_month,
                toggled: obtainMonths,
                timeType: timeType,
                upto: upto,
                paused: false,
            });
        }
        if (timeType=="Keep Until Complete") {
            dispatch("task-created", {
                value: name,
                completed: 0,
                points: points,
                starting: starting_keep,
                timeType: timeType,
                upto: upto,
                paused: false,
            });
        }
        name = "";
    }}
>
    <div class="wrapper">
        <button style="display:none" />
        <button on:click|preventDefault={(_) => clicked("left")}>&lt;</button>
        <span>{timeType}</span>
        <button on:click|preventDefault={(_) => clicked("right")}>&gt;</button>
    </div>
    <input placeholder="Add task..." autocomplete="off" bind:value={name} id="textBox" />
    <center><span>Points ({points}):</span></center>
    <center>
        <input
            bind:value={points}
            type="range"
            min="1"
            max="100"
            class="points"
            id="points"
        /><br>
        <center><span>Add counter:</span></center>
        <label class="switch">
            <input bind:checked={counterToggled} type="checkbox">
            <span class="slider round"></span>
          </label><br>
    </center>
    {#if counterToggled}
    <center><span>Up to:</span>
    <input bind:value = {upto} style="" type="number" min=1 max=99 required/>
    <span>times.</span></center>
    {/if}
    {#if timeType == "Daily"}
        <div>
            <span>Every:</span>
            <input required min="0" bind:value={every_day} type="number" />
            <span>days.</span>
            <br />
            <span>Starting from:</span>
            <input required bind:value={starting_day} type="date" /><br />
        </div>
    {:else if timeType == "Weekly"}
        <div>
            <div class="buttons2">
                {#each [...["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]] as day, i}
                    <button
                        on:click|preventDefault={(_) => {
                            weekToggles[i] = !weekToggles[i];
                        }}
                        class:selected={weekToggles[i]}>{day}</button
                    >
                {/each}
                <br />
            </div>
            <span>Every:</span>
            <input required min="0" bind:value={every_week} type="number" />
            <span>weeks.</span><br />
            <span>Starting from:</span>
            <input bind:this={starting_week} type="week" required /><br />
        </div>
    {:else if timeType == "Monthly"}
        <div>
            <div class="buttons" style="width:300px;">
                {#each [...Array(31).keys()] as day, i}
                    <button
                        on:click|preventDefault={(_) => {
                            monthToggles[i] = !monthToggles[i];
                        }}
                        class:selected2={monthToggles[i]}>{i + 1}</button
                    >
                {/each}
            </div>
            <span>Every:</span><input
                required
                bind:value={every_month}
                min="0"
                type="number"
            /><span>months.</span><br />
            <span>Starting from:</span>
            <input bind:value={starting_month} type="month" required/>
        </div>
    {:else if timeType == "Keep Until Complete"}
        <div>
            <span>Starting from:</span>
            <input bind:value={starting_keep} type="date" required/>
        </div>
    {/if}
</form>

<style>
    .selected2,
    .selected {
        border-color: black;
        border-radius: 30px;
        border: 1px solid #000;
    }
    .calendar-box {
        display: flex;
        flex-direction: column;
        align-items: center;
        border: 1px solid #ccc;
        padding: 20px;
        border-radius: 5px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    button {
        margin: 1px;
        padding: 3px 3px;
        background-color: #f5f5f5;
        border: 0px solid #ccc;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
    }
    .buttons,
    .buttons2 {
        margin: 1px;
        padding: 3px 3px;
        background-color: #f5f5f5;
        border: 1px solid #ccc;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
    }
    .calendar-box span:not(.slider) {
        margin: 5px;
        font-size: 16px;
    }

    .calendar-box input {
        margin: 5px;
        padding: 6px;
        font-size: 14px;
    }
</style>
