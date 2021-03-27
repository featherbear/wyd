<script lang="ts">
  import type CalendarEntry from "../../types/CalendarEntry";
  export let data: CalendarEntry = {};
</script>

<p>{data.dtstart} - {data.dtend}</p>
