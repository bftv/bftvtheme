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
        <fieldset v-if="accessLevels.accesslevel3" class="form-group">
          <legend>SuperAdmins Control</legend>
          <form method="post" @submit.prevent="syncSAgrp">
            <div class="row mt-3">
              <div class="col-md-4">
                <label for="superAdminGrp" class="required">SuperAdmin AD Group</label>
                <input type="text" id="superAdminGrp" name="superAdminGrp" :value="globalSettings.superadmin_ad" @input="updateGlobalField('superadmin_ad', $event)" required>
                <div><small class="element-description">It should exactly match the name of the group on AD. It is case-sensitive.</small></div>
              </div>
              <div class="col-md-4">
                <label for="attr_cols" class="required">Attribute Columns</label>
                <input type="number" id="attr_cols" name="attr_cols" max="10" :value="globalSettings.attr_cols" @input="updateGlobalField('attr_cols', $event)" required>
                <div><small class="element-description">Recommended number of diplayed columns is 4.</small></div>
              </div>
              <div class="col-md-4">
                <label for="recurs_loop" class="required">Recursive Loop Protection</label>
                <input type="number" id="recurs_loop" name="recurs_loop" :value="globalSettings.recurs_loop" @input="updateGlobalField('recurs_loop', $event)" required>
                <div><small class="element-description">This is for nested AD Groups.</small></div>
              </div>
              <div class="col-md-12 text-end">
                <button type="submit" class="btn btn-primary m-1" name="sync-sagrp">Save/Sync Settings</button>
              </div>
            </div>
          </form>
        </fieldset>
        <fieldset class="form-group">
          <legend>Sync ADGroups and Attribute Groups</legend>
           <div class="alert alert--info">
            The system automatically syncs data every mid-night. You can manually sync here.
          </div>
          <div v-if="accessLevels.accesslevel3" class="row mt-3">
            <div class="col-md-12 d-flex gap-2">
              <form method="post" @submit.prevent="sync">
                <button type="submit" class="btn btn-primary" name="all-adg">Sync All ADGroups and All Attributes</button>
              </form>
              <form method="post" @submit.prevent="sync">
                <button type="submit" class="btn btn-primary" name="sync-iam">Sync IAM Data</button>
              </form>
              <form method="post" @submit.prevent="sync">
                <button type="submit" class="btn btn-primary" name="sync-ldap">Sync LDAP Data</button>
              </form>
            </div>
          </div>
          <form method="post" @submit.prevent="syncOne">
            <div class="row mt-3">
              <div class="col-md-6">
                <label for="adgroup" class="required">Sync Specific ADGroup</label>
                <div class="d-flex gap-2">
                  <select name="adgroup" id="adgroup" required>
                    <option>-- select an ADGroup --</option>
                    <option v-for="adgroup in listData" :key="adgroup.id" :value="adgroup.adgroup">{{ adgroup.adgroup }}</option>
                  </select>
                  <button type="submit" class="btn btn-primary btn-sm" name="sync-adg">Sync ADGroup</button>
                </div>
              </div>
              <div class="col-md-6">
                <label for="attr_group" class="required">Sync Attribute Groups</label>
                <div class="d-flex gap-2">
                  <select name="attr_group" id="attr_group" required>
                    <option>-- select an Attribute Group --</option>
                    <option v-for="attr in attributeGroups" :key="attr.index" :value="attr">{{ attr }}</option>
                  </select>
                  <button type="submit" class="btn btn-primary btn-sm" name="sync-attr">Sync Attribute</button>
                </div>
              </div>
            </div>
          </form>
        </fieldset>
        <fieldset class="form-group">
          <legend>Sync PEAKS Information</legend>
          <div v-if="accessLevels.accesslevel3" class="row">
            <div class="col-md-12">
              <form method="post" @submit.prevent="sync">
                <button type="submit" class="btn btn-primary" name="all-peaksdevices">Sync Devices For All Teams</button>
                <button type="submit" class="btn btn-primary ms-1" name="all-peaksdocs">Sync Documents For All Teams</button>
              </form>
            </div>
          </div>
          <div class="row mt-3">
            <form method="post" @submit.prevent="syncOne">
              <div class="row mt-3">
                <div class="col-md-6">
                  <label for="adgroup" class="required">Sync Devices for Specific Team</label>
                  <div class="d-flex gap-2">
                    <select name="team-devices" id="team-devices" required>
                      <option>-- select a team --</option>
                      <option v-for="team in peaksTeam" :key="team.id" :value="team.peaksteam">{{ team.peaksteam }}</option>
                    </select>
                      <button type="submit" class="btn btn-primary btn-sm" name="sync-peaksdevices">Sync Devices</button>
                    </div>
                  </div>
                  <div class="col-md-6">
                  <label for="attr_group" class="required">Sync Documents for Specific Team</label>
                    <div class="d-flex gap-2">
                      <select name="team-docs" id="team-docs" required>
                        <option>-- select a team --</option>
                        <option v-for="team in peaksTeam" :key="team.id" :value="team.peaksteam">{{ team.peaksteam }}</option>
                      </select>
                      <button type="submit" class="btn btn-primary btn-sm" name="sync-peaksdocs">Sync Documents</button>
                    </div>
                  </div>
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
import axios from 'axios';

export default {
  mixins: [globalMixin],
  name: 'GlobalSettings',

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
      } else if(e.submitter.name == 'all-peaksdocs') {
        mode = 'peaksdocs'
      } else if(e.submitter.name == 'sync-iam') {
        mode = 'iam'
      } else if(e.submitter.name == 'sync-ldap') {
        mode = 'ldap'
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
      var mode = '';
      var adgroup = '';
      var peaksteam = '';
      if(e.submitter.name == 'sync-adg'){
        mode = 'adgroup';
        adgroup = document.getElementById('adgroup').value;
      } else if(e.submitter.name == 'sync-attr'){
        mode = 'adgroup';
        adgroup = document.getElementById('attr_group').value
      } else if(e.submitter.name == 'sync-peaksdevices') {
        mode = 'peaksdevice';
        peaksteam = document.getElementById('team-devices').value
      } else if(e.submitter.name == 'sync-peaksdocs') {
        mode = 'peaksdocs';
        peaksteam = document.getElementById('team-docs').value
      }
      axios.post('https://web.bftv.ucdavis.edu/reporting/adgroup-sync.php', {
        crossDomain: true,
        myid: this.username,
        token: this.token,
        type: 'one',
        mode: mode,
        adgroup: adgroup,
        peaksteam: peaksteam,
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
    syncSAgrp(e) {
      e.preventDefault();
      this.loading = true;
      axios.post('https://web.bftv.ucdavis.edu/reporting/globalsettings-update.php', {
        crossDomain: true,
        myid: this.username,
        token: this.token,
        SAgrp: document.getElementById('superAdminGrp').value,
        attr: document.getElementById('attr_cols').value,
        recurs: document.getElementById('recurs_loop').value,
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(response => {
        this.screenmsg = response.data.message,
        this.screenmsgtype = "success",
        this.screenmsgicon = this.successicon,
        this.globalSettings = response.data.globalSettings[0]
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
