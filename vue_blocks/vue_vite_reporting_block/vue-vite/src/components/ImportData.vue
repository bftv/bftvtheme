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
          <i :class="screenmsgicon"></i> {{ screenmsg }} <span v-if="screenmsgtype == 'error'"> Please contact one of the SuperAdmins if you need more help.</span>
        </div>
      </div>
      <div v-if="!hidebody" class="mt-3">
        <div class="alert alert--info">
          Please make sure to import in the following sequence: <br/><small>(Click on each one to download a sample CSV file)</small>
          <ol>
            <li><a href="https://web.bftv.ucdavis.edu/reporting/import_samples/departments.csv">Import Departments</a> - <small>Only SuperAdmins allowed</small></li>
            <li><a href="https://web.bftv.ucdavis.edu/reporting/import_samples/adgroups.csv">Import ADGroups</a> - <small>Make sure the department column should be exactly the same as it is shown on AD.</small></li>
            <li><a href="https://web.bftv.ucdavis.edu/reporting/import_samples/users.csv">Import Users</a> - <small>Make sure the department column should be exactly the same as it is shown on AD. The role column can be superadmin, orgadmin, orgreportadmin, labadmin, or labreportadmin. OrgAdmins cannot import a user as superadmin. The adgroups column should be exactly as the ADGroup like CAES-BFTV-FST-MG-Lab-AXTaha.</small></li>
          </ol>
        </div>
        <fieldset v-if="accessLevels.accesslevel2" class="form-group">
          <legend>1- Import Departments</legend>
          <form method="post" @submit.prevent="importDep">
            <div class="row">
              <div class="col-md-6">
                <input type="file" id="impDEP" name="impDEP" accept=".csv" @change="handleFileDep">
              </div>
              <div class="col-md-6">
                <button type="submit" class="btn btn-primary">Import Departments</button>
              </div>
            </div>
          </form>
        </fieldset>
        <fieldset class="form-group">
          <legend>2- Import ADGroups</legend>
          <form method="post" @submit.prevent="importADG">
            <div class="row">
              <div class="col-md-6">
                <input type="file" id="impADG" name="impADG" accept=".csv" @change="handleFileADG">
              </div>
              <div class="col-md-6">
                <button type="submit" class="btn btn-primary">Import ADGroups</button>
              </div>
            </div>
          </form>
        </fieldset>
        <fieldset class="form-group">
          <legend>3- Import Users</legend>
          <form method="post" @submit.prevent="importUser">
            <div class="row">
              <div class="col-md-6">
                <input type="file" id="impUSR" name="impUSR" accept=".csv" @change="handleFileUser">
              </div>
              <div class="col-md-6">
                <button type="submit" class="btn btn-primary">Import Users</button>
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
//import { navmixin } from '../mixins/navMixin.js';
import { globalMixin } from '../mixins/globalMixin.js';
import axios from 'axios';

export default {
  mixins: [globalMixin],
  name: 'ImportData',

  data() {
    return {
      error: '',
      csvImport: [],
    };
  },

  mounted: function(){
    const url = 'https://web.bftv.ucdavis.edu/reporting/adgroup-get.php'
    this.getDataList(url, 'adgroup')
  },
  methods: {
    handleFileADG(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target.result;
          const rows = content.replace(/\r\n/g, '\n').split('\n').map(row => row.split(','));
          const headers = rows[0].map(header => header.trim());
          if (headers.length === 3) {
            this.csvImport = rows.slice(1).map(row => row.map(cell => cell.trim()));
          } else {
            this.error = 'CSV must have exactly three columns: adgroup, alias, department';
          }
        };
        reader.onerror = (e) => {
          this.error = 'Error reading the file: '+e;
        };
        reader.readAsText(file);
      }
    },
    handleFileUser(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target.result;
          const rows = content.replace(/\r\n/g, '\n').split('\n').map(row => row.split(','));
          const headers = rows[0].map(header => header.trim());
          if (headers.length === 4) {
            this.csvImport = rows.slice(1).map(row => row.map(cell => cell.trim()));
          } else {
            this.error = 'CSV must have exactly four columns: email, department, role, adgroups.';
          }
        };
        reader.onerror = (e) => {
          this.error = 'Error reading the file: '+e;
        };
        reader.readAsText(file);
      }
    },
    importADG(e) {
      e.preventDefault();
      this.loading = true;
      if(this.error != ''){
        this.screenmsg = this.error;
        this.screenmsgtype = "error",
        this.screenmsgicon = this.erroricon
        window.scrollTo(0, 400);
        this.loading = false;
      } else {
        this.loading = true;
        axios.post('https://web.bftv.ucdavis.edu/reporting/import.php', {
          crossDomain: true,
          myid: this.username,
          token: this.token,
          type: 'adgroup',
          importData: this.csvImport,
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
      }
    },
    importUser(e) {
      e.preventDefault();
      this.loading = true;
      if(this.error != ''){
        this.screenmsg = this.error;
        this.screenmsgtype = "error",
        this.screenmsgicon = this.erroricon
        window.scrollTo(0, 400);
        this.loading = false;
      } else {
        this.loading = true;
        axios.post('https://web.bftv.ucdavis.edu/reporting/import.php', {
          crossDomain: true,
          myid: this.username,
          token: this.token,
          type: 'user',
          importData: this.csvImport,
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
      }
    },
  },
};
</script>

<style scoped>


</style>
