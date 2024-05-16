<script>
  import {
    counts,
    tasks,
    streak,
    streakfreezes,
    daysuntilfreeze,
    notes,
    isTaskOnDay,
    getToday,
    changeOverTime,
    onDayChangeover,
    getData,
    simulateOfflineDayChangeovers,
  } from "./lib/storage";
  import src from "./images/logo.png";
  import fireStreak from "./images/fire.png";
  import streak0 from "./images/streak0.png";
  import streakI from "./images/streak1.png";
  import streakII from "./images/streak2.png";
  import streakIII from "./images/streak3.png";
  import three from "./images/three.png";
  import two from "./images/two.png";
  import one from "./images/one.png";
  import Chart from "./lib/chart.svelte";
  import TaskGUI from "./lib/gui.svelte";
  import ProgressBar from "@okrad/svelte-progressbar";
  import Trash from "./images/trash.jpg";
  import { onDestroy } from "svelte";
  let series = [{ perc: 0, color: "#000000" }];

  $: {
    let points = 0;
    let totalpoints = 0;

    const yesterday = getToday();
    for (let task of $tasks) {
      if (isTaskOnDay(task, yesterday) && task.timeType !="Keep Until Complete") {
        totalpoints += task.points * task.upto;
        points += task.points * task.completed;
      }
    }

    series[0].perc = Math.floor(
      totalpoints === 0 ? 0 : (100 * points) / totalpoints
    );
    series[0].color = series[0].perc >= 50 ? "#00FF00" : "#FF0000";
  }
  function setTimespan(num) {
    switch (num) {
      case 0:
        Xlength = 7;
        break;
      case 1:
        const today = new Date(getToday());
        today.setDate(-1);
        Xlength = today.getDate();

        break;
      case 2:
        Xlength = (new Date(getToday()).getFullYear() - 1) % 4 == 0 ? 366 : 365;

        break;
      case 3:
        let oldestDate = Object.entries($counts)
          .sort()
          .find((count) => count[1].tasks > 0);
        Xlength =
          Math.round(
            (new Date(getToday()) - new Date(oldestDate[0])) / 86_400_000
          ) + 1;
        break;
    }
  }

  let Xlength = 7;
  const nextDayChangeover = new Date();

  if (
    nextDayChangeover.getHours() > changeOverTime.hours ||
    (nextDayChangeover.getHours() == changeOverTime.hours &&
      nextDayChangeover.getMinutes() >= changeOverTime.minutes)
  )
    nextDayChangeover.setDate(nextDayChangeover.getDate() + 1);

  nextDayChangeover.setHours(
    changeOverTime.hours,
    changeOverTime.minutes,
    0,
    0
  );

  function changeOver() {
    console.debug("Online DayChangeover:", getToday(-1))
    onDayChangeover();

    nextDayChangeover.setDate(nextDayChangeover.getDate() + 1);
    console.debug("Next DayChangeover scheduled on", nextDayChangeover)
    timeout = setTimeout(changeOver, nextDayChangeover - Date.now());
  }
  let timeout = setTimeout(changeOver, nextDayChangeover - Date.now());
  onDestroy(() => {
    clearTimeout(timeout);
  });

  let draggedItem = 0;
  const TEST_GUI = false;
</script>

<title>Productivity</title>

{#if TEST_GUI}
  Current Date
  <input
    on:change={(e) => {
      changeOverTime.todayOverride = e.currentTarget.value;
      $tasks = $tasks;
    }}
    type="date"
  />
  <button
    on:click={(_) => {
      for (const key in $counts) {
        if (key > changeOverTime.todayOverride) {
          delete $counts[key];
        }
      }
      const day = changeOverTime.todayOverride;
      changeOverTime.todayOverride = "";
      simulateOfflineDayChangeovers();
      changeOverTime.todayOverride = day;
    }}>OfflineChangeover</button
  >
{/if}

<br /><br />
<div class="container">
  <div class="logo">
    <img {src} alt="The Logo" />
  </div>
  <div class="streaks">
    <img
      class="streak1"
      src={fireStreak}
      width="100"
      height="100"
      alt="Streak:"
    />
    <b><t style="font-size: 100px" class="streak12">{$streak}</t></b>
    <img
      class="streak2"
      src={[streak0, streakI, streakII, streakIII][$streakfreezes]}
      width="100"
      height="100"
      alt="Streak Freezes:{$streakfreezes}"
    />
    <img
      class="streak3"
      src={[one, two, three][$daysuntilfreeze - 1]}
      width="100"
      height="100"
      alt="DAYS UNTIL FREEZE:{$daysuntilfreeze}"
    />
  </div>
  <div class="buttons">
    <button on:click={(_) => setTimespan(0)}>Past Week</button>
    <button on:click={(_) => setTimespan(1)}>Past Month</button>
    <button on:click={(_) => setTimespan(2)}>Past Year</button>
    <button on:click={(_) => setTimespan(3)}>All time</button>
  </div>

  <div class="graph">
    <Chart data={getData($counts, Xlength)} />
  </div>
  <div class="progression">
    <ProgressBar {series} />
  </div>
  <div class="theTasks">
    <TaskGUI
      on:task-created={(event) => {
        $tasks = [...$tasks, event.detail];
      }}
    /><br />
  </div>

  <div class="input">
    {#each $tasks.filter(task => task.timeType!="Keep Until Complete" ) as task (task)}
      {#if isTaskOnDay(task)}
        <div class="task">
          <button
            on:click={(_) => {
              $tasks.splice($tasks.indexOf(task), 1);
              $tasks = $tasks;
            }}
          >
            -
          </button>

          <span style="overflow-wrap: break-word; flex-grow: 1; min-width: 0">{task.value}</span>
          <span style="margin-top: 2px">{task.points}</span>
          {#if task.upto == 1}
            <input bind:checked={task.completed} on:change={() => task = task} type="checkbox"/>
          {:else}
          <span style="margin-top: 2px"><strong>{+task.completed}/{task.upto}</strong></span>
          <button
          on:click={() => {
            if (task.completed > 0) {
              task.completed -= 1;
            }
          }}>-</button
        >
            <button
              on:click={() => {
                if (task.completed < task.upto) {
                  task.completed += 1;
                }
              }}>+</button
            >

            
          {/if}
          
        </div>
      {/if}
    {/each}
    {#if ($tasks.filter(task => task.timeType=="Keep Until Complete" && isTaskOnDay(task) ).length > 0)}
    <br>
    <b><span style="display: flex; justify-content: center;">Keep Until Complete:</span></b>
    <br>
    {/if}
    {#each $tasks.filter(task => task.timeType=="Keep Until Complete" ) as task (task)}
    {#if isTaskOnDay(task)}
      <div class="task">
        <button
          on:click={(_) => {
            $tasks.splice($tasks.indexOf(task), 1);
            $tasks = $tasks;
          }}
        >
          -
        </button>

        <span style="overflow-wrap: break-word; flex-grow: 1; min-width: 0">{task.value}</span>
        <span style="margin-top: 2px">{task.points}</span>
        {#if task.upto == 1}
          <input bind:checked={task.completed} on:change={() => task = task} type="checkbox"/>
        {:else}
        <span style="margin-top: 2px"><strong>{+task.completed}/{task.upto}</strong></span>
        <button
        on:click={() => {
          if (task.completed > 0) {
            task.completed -= 1;
          }
        }}>-</button
      >
          <button
            on:click={() => {
              if (task.completed < task.upto) {
                task.completed += 1;
              }
            }}>+</button
          >

          
        {/if}
        
      </div>
    {/if}
  {/each}

  </div>
  <br>
  <a href="/tasks">View all tasks...</a>
</div>
<button
  style="position:fixed; left: 10px; bottom: 10px"
  on:click={() => {
    $notes = [
      ...$notes,
      { x: 200, y: 300, width: 100, height: 100, text: "", title: "" },
    ];
  }}>+</button
>
{#each $notes as note (note)}
  <div
    bind:clientWidth={note.width}
    bind:clientHeight={note.height}
    style="position: absolute; display: inline-block; top: {note.y}px; left: {note.x}px"
  >
    <textarea
    placeholder="Add text here..."
      on:dragstart={(_) => (draggedItem = note)}
      bind:value={note.text}
      on:dragend={(event) => {
        note.x += event.layerX;
        note.y += event.layerY;
      }}
      style="width: {note.width}px; height: {note.height}px; box-sizing: border-box; display: block; margin: 0"
      draggable="true"
    />
  </div>
{/each}


<img
  src={Trash}
  style="position:fixed; bottom: 10px; right: 10px; width: 5%; height: 10%;"
  on:dragover|preventDefault
  on:drop={() => {
    $notes.splice($notes.indexOf(draggedItem), 1);
    $notes = $notes;
  }}
  alt="Trash"
/>

<style>
  textarea {
    background-color: yellow;
  }
  .progression {
    width: 50%;
  }
  .container {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
  }
  .streaks {
    color: red;
  }
  .streak1 {
    position: relative;
    right: 200px;
    top: 10px;
  }
  .streak12 {
    position: relative;
    right: 200px;
  }
  .streak2 {
    position: relative;
    right: 10px;
  }
  .streak3 {
    position: relative;
    left: 250px;
  }
  .graph {
    width: 50%;
    height: 400px;
  }
  .task {
    width: 20rem;
    padding: 0.5rem;
    background-color: whitesmoke;
    border-radius: 0.5rem;
    border: 1px solid gray;
    display: flex;
    align-items: center;
    gap: 5px;
  }
</style>
