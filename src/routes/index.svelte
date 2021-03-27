<script lang="ts">
  import successkid from "images/successkid.jpg";

  import CalendarContainer from "../components/Calendar/Container.svelte";
  import CalendarEntry from "../components/Calendar/Entry.svelte";
  import type CalendarEntryType from "../types/CalendarEntry";

  let schedule: Promise<CalendarEntryType[]>;

  import { onMount } from "svelte";
  onMount(() => {
    const doUpdateSchedule = async () =>
      (schedule = fetch("data/schedule.json").then((r) => r.json()));
    setInterval(() => doUpdateSchedule(), 5 * 60 * 1000);
    doUpdateSchedule();
  });
</script>

<svelte:head>
  <title>Sapper project template</title>
</svelte:head>

<h1>Great success!</h1>

{#await schedule}
  loading spinner goes here lol
{:then scheduleData}
  {#if scheduleData}
    <CalendarContainer>
      {#each scheduleData as data}
        <CalendarEntry {data} />
      {/each}
    </CalendarContainer>
  {/if}
{/await}

<figure>
  <img alt="Success Kid" src={successkid} />
  <figcaption>Have fun with Sapper!</figcaption>
</figure>

<p>
  <strong
    >Try editing this file (src/routes/index.svelte) to test live reloading.</strong
  >
</p>

<style>
  h1,
  figure,
  p {
    text-align: center;
    margin: 0 auto;
  }

  h1 {
    font-size: 2.8em;
    text-transform: uppercase;
    font-weight: 700;
    margin: 0 0 0.5em 0;
  }

  figure {
    margin: 0 0 1em 0;
  }

  img {
    width: 100%;
    max-width: 400px;
    margin: 0 0 1em 0;
  }

  p {
    margin: 1em auto;
  }

  @media (min-width: 480px) {
    h1 {
      font-size: 4em;
    }
  }
</style>
