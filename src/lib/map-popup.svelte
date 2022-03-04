<script lang="ts">
  export let data: Market
</script>

<div>
  <h2>{data.title}</h2>
  <p>
    {data.address},<br />
    {data.postalCode}
    {data.city}
  </p>

  <h3>Heures silencieuse :</h3>
  <ul>
    {#each Object.entries(data.hours) as [day, hours] (day)}
      <li><strong>{day}</strong> : {hours}</li>
    {/each}
  </ul>
</div>

<style>
  h2,
  h3 {
    margin: 0;
  }

  p {
    margin-top: 0;
  }

  ul {
    margin: 0;
    padding: 0;
    list-style: inside;
  }

  li > strong {
    text-transform: capitalize;
  }
</style>
