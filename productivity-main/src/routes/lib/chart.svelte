<script>
  import Chart from "chart.js/auto";
  import { onMount } from "svelte";
  let chartInstance;
  export let data = {};
  $: {
    if (chartInstance !== undefined && data.length > 0) {
      chartInstance.data.datasets[0].data = data
        .map(([, { tasks }]) => tasks)
        .reverse();
      chartInstance.data.datasets[1].data = data
        .map(([, { points }]) => points)
        .reverse();
      chartInstance.data.labels = data
        .map(([date]) => formatDate(date))
        .reverse();
      chartInstance.update();
    }
  }

  function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${
      [
        "January",
        "Febuary",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ][month - 1]
    } ${day} ${year}`;
  }

  onMount(() => {
    const ctx = document.getElementById("tasksChart");

    const dates = data.map(([date]) => formatDate(date)).reverse();
    const tasks = data.map(([, { tasks }]) => tasks).reverse();
    const points = data.map(([, { points }]) => points).reverse();

    chartInstance = new Chart(ctx, {
      type: "line",
      data: {
        labels: dates,
        datasets: [
          {
            label: "Tasks",
            data: tasks,
            yAxisID: "left",
            borderWidth: 1,
            borderColor: "red",
            tension: 0.3,
          },
          {
            label: "Points",
            data: points,
            yAxisID: "right",
            borderWidth: 1,
            borderColor: "blue",
            tension: 0.3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          left: {
            type: "linear",
            position: "left",
            beginAtZero: true,
            title: {
              display: true,
              text: "Tasks completed",
            },
          },
          right: {
            grid: {
              drawOnChartArea: false, // only want the grid lines for one axis to show up
            },
            type: "linear",
            position: "right",
            beginAtZero: true,
            title: {
              display: true,
              text: "Points scored",
            },
          },
        },
      },
    });
  });
</script>

<div class="chartWrapper">
  <canvas id="tasksChart" />
</div>

<style>
  .chartWrapper {
    width: 100%;
    height: 100%;
  }
</style>
