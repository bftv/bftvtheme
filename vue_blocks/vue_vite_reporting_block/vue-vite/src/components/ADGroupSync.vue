<template>
  <div class="container-fluid">
    <div v-if="loading" id="loading" class="mt-3">
      <div class="spinner-border text-secondary loader" role="status">
        <span class="sr-only">Loading...</span>
      </div>
    </div>
    <div v-if="accessLevels.accesslevel1">
      <div v-if="screenmsg" class="mt-5">
        <div :class="'alert alert--'+screenmsgtype">
          <i :class="screenmsgicon"></i> {{ screenmsg }} <span v-if="screenmsgtype == 'error'"> Please contact one of the SuperAdmins through the Slack channel.</span>
        </div>
      </div>
      <div v-if="!hidebody" class="mt-3">
        <div class="alert alert--info">
          The system automatically syncs data every mid-night. You can also manually sync here.
        </div>
        <fieldset class="form-group">
          <legend>Sync ADGroups</legend>
          <div v-if="accessLevels.accesslevel2" class="row">
            <div class="col-md-12">
              <form method="post" @submit.prevent="sync">
                <button type="submit" class="btn btn-primary" name="all-adg">Sync All ADGroups</button>
              </form>
            </div>
          </div>
          <div class="row mt-3">
            <form method="post" @submit.prevent="syncOne">
              <div class="col-md-12">
                <label for="adgroup" class="required">Sync Specific ADGroup</label>
                <select name="adgroup" id="adgroup" style="width: 50% !important" required>
                  <option>-- select an ADGroup --</option>
                  <option v-for="adgroup in listData" :key="adgroup.id" :value="adgroup.adgroup">{{ adgroup.adgroup }}</option>
                </select>
                <button type="submit" class="btn btn-primary m-1" name="sync-adg">Sync ADGroup</button>
              </div>
            </form>
          </div>
        </fieldset>
        <fieldset class="form-group">
          <legend>Sync Devices from PEAKS</legend>
          <div v-if="accessLevels.accesslevel2" class="row">
            <div class="col-md-12">
              <form method="post" @submit.prevent="sync">
                <button type="submit" class="btn btn-primary" name="all-peaksdevices">Sync Devices For All Teams</button>
              </form>
            </div>
          </div>
          <div class="row mt-3">
            <form method="post" @submit.prevent="syncOne">
              <div class="col-md-12">
                <label for="team-devices" class="required">Sync Devices for Specific Team</label>
                <select name="team-devices" id="team-devices" style="width: 50% !important" required>
                  <option>-- select a team --</option>
                  <option v-for="team in peaksTeam" :key="team.id" :value="team.peaksteam">{{ team.peaksteam }}</option>
                </select>
                <button type="submit" class="btn btn-primary m-1" name="sync-peaksdevices">Sync Devices</button>
              </div>
            </form>
          </div>
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
//import { navmixin } from '../mixins/navMixin.js';
import { globalMixin } from '../mixins/globalMixin.js';

export default {
  mixins: [globalMixin],
  name: 'ADGroupSync',

  mounted: function(){
    const url = 'https://web.bftv.ucdavis.edu/reporting/adgroup-get.php'
    this.getDataList(url, 'adgroup')
  },
  methods: {
    sync(e) {
      e.preventDefault();
      this.loading = true;
      var mode = '';
      if(e.submitter.name == 'all-adg'){
        mode = 'adgroup'
      } else if(e.submitter.name == 'all-peaksdevices') {
        mode = 'peaksdevice'
      }
      axios.post('https://web.bftv.ucdavis.edu/reporting/adgroup-sync.php', {
        crossDomain: true,
        myid: this.username,
        token: this.token,
        type: 'all',
        mode: mode,
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(response => {console.log(response);
        this.screenmsg = response.data.message,
        this.screenmsgtype = "success",
        this.screenmsgicon = this.successicon
      }).catch(error => {console.log(error);
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
      var mode = '';
      if(e.submitter.name == 'sync-adg'){
        mode = 'adgroup'
      } else if(e.submitter.name == 'sync-peaksdevices') {
        mode = 'peaksdevice'
      }
      axios.post('https://web.bftv.ucdavis.edu/reporting/adgroup-sync.php', {
        crossDomain: true,
        myid: this.username,
        token: this.token,
        type: 'one',
        mode: mode,
        adgroup: document.getElementById('adgroup').value,
        peaksteam: document.getElementById('team-devices').value,
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(response => {console.log(response);
        this.screenmsg = response.data.message,
        this.screenmsgtype = "success",
        this.screenmsgicon = this.successicon
      }).catch(error => {console.log(error);
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
