<script>
  import { tasks,counts,notes,daysuntilfreeze,streak,streakfreezes } from "../lib/storage";
  
  import src from "../images/logo.png";
  import TaskGUI from "../lib/gui.svelte";
  import { get } from "svelte/store";

</script>

<div class="center-container">
  <img {src} alt="The Logo" />
  <table>
    <thead>
      <tr>
        <th>Pause</th>
        <th>Task Name</th>
        <th>Points</th>
        <th>Every</th>
        <th>Starting</th>
        <th>Counter</th>
        <th>Toggled</th>
        <th>Time Type</th>
        <th>Delete</th>
      </tr>
    </thead>
    <tbody>
      {#each $tasks as task}
        <tr>
          <td><input bind:checked={task.paused} type="checkbox"/></td>
          <td>{task.value}</td>
          <td>{task.points}</td>
          <td>{task.every}</td>
          <td>{task.starting}</td>
          <td>{task.upto}</td>
          <td>
            {#if /^\d+$/.test(task.toggled)}
              {Number(task.toggled)+1}
            {:else}
              {task.toggled}
            {/if}
          </td>
          <td>{task.timeType}</td>
          <td>
            <button
              class="delete-button"
              on:click={() => {
                $tasks.splice($tasks.indexOf(task), 1);
                $tasks = $tasks;
              }}
            >
              Delete
            </button>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
  <TaskGUI
    on:task-created={(event) => {
      $tasks = [...$tasks, event.detail];
    }}
  />
  <br>



<button
  on:click={(_) => {
    let a = document.createElement("a");
    a.setAttribute("download", "tasks.json");
    a.setAttribute(
      "href",
      "data:application/json;base64," + btoa(JSON.stringify(get(tasks)))
    );
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    a = document.createElement("a");
    a.setAttribute("download", "counts.json");
    a.setAttribute(
      "href",
      "data:application/json;base64," + btoa(JSON.stringify(get(counts)))
    );
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    a = document.createElement("a");
    a.setAttribute("download", "daysuntilfreeze.json");
    a.setAttribute(
      "href",
      "data:application/json;base64," + btoa(JSON.stringify(get(daysuntilfreeze)))
    );
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    a = document.createElement("a");
    a.setAttribute("download", "notes.json");
    a.setAttribute(
      "href",
      "data:application/json;base64," + btoa(JSON.stringify(get(notes)))
    );
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    a = document.createElement("a");
    a.setAttribute("download", "streak.json");
    a.setAttribute(
      "href",
      "data:application/json;base64," + btoa(JSON.stringify(get(streak)))
    );
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    a = document.createElement("a");
    a.setAttribute("download", "streakfreezes.json");
    a.setAttribute(
      "href",
      "data:application/json;base64," + btoa(JSON.stringify(get(streakfreezes)))
    );
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }}
>
  Download data
</button>
  <br>
  <a href="./">Go back to the page</a>
  
</div>

<style>
  .center-container {

    display: flex;
    flex-direction: column;
    align-items: center;
  }

  table {
    border-collapse: collapse;
    width: 80%;
    max-width: 800px;
    margin-bottom: 30px;
  }

  th,
  td {
    padding: 10px;
    text-align: left;
    border: 1px solid #ddd;
  }

  th {
    background-color: #f5f5f5;
    font-weight: bold;
  }

  tr:nth-child(even) {
    background-color: #f9f9f9;
  }

  .delete-button {
    padding: 5px;
    background-color: #ff6961;
    color: white;
    border: none;
  }
</style>
