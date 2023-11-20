<template>
  <div class="container-fluid">
    <div v-if="loading" id="loading" class="mt-3">
      <div class="spinner-border text-secondary loader" role="status">
        <span class="sr-only">Loading...</span>
      </div>
    </div>
    <div v-if="accesslevel1">
      <div v-if="screenmsg" class="mt-5">
        <div :class="'alert alert--'+screenmsgtype">
          <i :class="screenmsgicon"></i> {{ screenmsg }} <span v-if="screenmsgtype == 'error'"> Please contact one of the SuperAdmins through the Slack channel.</span>
        </div>
      </div>
      <div v-if="!hidebody" class="mt-3">
        <div class="alert alert--info">
          The system automatically syncs data every mid-night. You can also manually sync here.
        </div>
        <fieldset v-if="accesslevel2" class="form-group">
          <legend>Sync All ADGroups</legend>
          <div class="row">
            <div class="col-md-12">
              <form method="post" @submit.prevent="sync">
                <button type="submit" class="btn btn-primary">Sync All ADGroups</button>
              </form>
            </div>
          </div>
        </fieldset>
        <fieldset class="form-group">
          <legend>Sync Specific ADGroup</legend>
          <form method="post" @submit.prevent="syncOne">
            <div class="row">
              <div class="col-md-6">
                <select name="adgroup" id="adgroup" required>
                  <option>-- select an ADGroup --</option>
                  <option v-for="adgroup in listData" :key="adgroup.id" :value="adgroup.adgroup">{{ adgroup.adgroup }}</option>
                </select>
              </div>
              <div class="col-md-6">
                <button type="submit" class="btn btn-primary">Sync ADGroup</button>
              </div>
            </div>
          </form>
        </fieldset>
      </div>
    </div>
    <div v-else>
      <div class="alert alert--error">
        <i class="far fa-times-circle fa-2x alert--error-icon"></i> You are not authorized to view this page.
      </div>
    </div>
  </div>
</template>

<script>
import { navmixin } from '../mixins/navMixin.js';
import { globalMixin } from '../mixins/globalMixin.js';

export default {
  mixins: [navmixin, globalMixin],
  name: 'ADGroupSync',

  mounted: function(){
    const url = 'https://web.bftv.ucdavis.edu/reporting/adgroup-get.php'
    this.getDataList(url, 'adgroup')
  },
  methods: {
    sync(e) {
      e.preventDefault();
      this.loading = true;
      axios.post('https://web.bftv.ucdavis.edu/reporting/adgroup-sync.php', {
        crossDomain: true,
        myid: this.username,
        token: this.token,
        type: 'all',
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(response => {
        this.screenmsg = response.data.message,
        this.screenmsgtype = "success",
        this.screenmsgicon = this.successicon
      }).catch(error => {
        if(error.response.data.message){
          this.screenmsg = error.response.data.message
        } else if(error.data.message){
          this.screenmsg = error.data.message
        } else {
          this.screenmsg = error.message
        }
        this.screenmsgtype = "error",
        this.screenmsgicon = this.erroricon,
        this.code = error.response.status
      }).finally(() => {
        this.loading = false;
      });
      window.scrollTo(0, 400);
    },
    syncOne(e) {
      e.preventDefault();
      this.loading = true;
      axios.post('https://web.bftv.ucdavis.edu/reporting/adgroup-sync.php', {
        crossDomain: true,
        myid: this.username,
        token: this.token,
        type: 'one',
        adgroup: document.getElementById('adgroup').value,
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(response => {
        this.screenmsg = response.data.message,
        this.screenmsgtype = "success",
        this.screenmsgicon = this.successicon
      }).catch(error => {
        if(error.response.data.message){
          this.screenmsg = error.response.data.message
        } else if(error.data.message){
          this.screenmsg = error.data.message
        } else {
          this.screenmsg = error.message
        }
        this.screenmsgtype = "error",
        this.screenmsgicon = this.erroricon,
        this.code = error.response.status
      }).finally(() => {
        this.loading = false;
      });
      window.scrollTo(0, 400);
    },
  },
};
</script>

<style scoped>


</style>
