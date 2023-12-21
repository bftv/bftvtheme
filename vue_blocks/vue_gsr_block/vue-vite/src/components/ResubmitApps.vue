<template>
  <div class="container-fluid">
    <the-navigation></the-navigation>
    <div>{{ curlName }}</div>
  </div>
</template>

<script>
  //import { navmixin } from '../mixins/navMixin.js';
  import { globalMixin } from '../mixins/globalMixin.js';
  export default {
    mixins: [globalMixin],
    name: 'Resubmit',

  };
</script>

<style scoped>


</style>