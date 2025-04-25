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
      <div class="row mt-3">
        <div  v-if="accessLevels.accesslevel2 && authenticated" class="col-md-12 text-end">
          <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#modal-add-college">+ Add a College</button>
        </div>
      </div>
      <div v-if="!hidebody" class='table-responsive mt-2'>
        <table class='table table-bordered table-hover table-striped'>
          <thead class='thead-light'>
            <tr>
              <th>College</th>
              <th>Abbr</th>
              <th v-if="accessLevels.accesslevel2"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="college in listData">
              <td>{{ college.college }}</td>
              <td>{{ college.abbr }}</td>
              <td v-if="accessLevels.accesslevel2"><a href="" @click="selectRecord(college)" data-bs-toggle="modal" data-bs-target="#modal-edit-college" title="Edit College"><i class="fa-solid fa-pen-to-square"></i></a> <a href="" @click="selectRecord(college)" data-bs-toggle="modal" data-bs-target="#modal-del-college" title="Delete College"><i class="fa-solid fa-circle-xmark"></i></a></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div v-else>
      <div class="alert alert--error">
        <i class="far fa-times-circle fa-2x alert--error-icon"></i> You are not authorized to view this page.
      </div>
    </div>
  </div>
  <!-- Modal Add -->
  <div  v-if="accessLevels.accesslevel2" class="modal fade" id="modal-add-college" tabindex="-1" aria-labelledby="modal-add-college-label" aria-hidden="true">
    <div class="modal-dialog modal-xl">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title fs-5" id="modal-add-college-label">Add a New College</h3>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <form method="post" @submit.prevent="addCollege">
          <div class="modal-body">
            <div class="row m-2">
              <div class="col-md-4 fw-bold text-end required">
                College
              </div>
              <div class="col-md-6">
                <input type="text" id="college" name="college" required>
              </div>
            </div>
            <div class="row m-2">
              <div class="col-md-4 fw-bold text-end">
                Abbreviation
              </div>
              <div class="col-md-6">
                <input type="text" id="abbr" name="abbr">
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-primary btn-sm" data-bs-dismiss="modal">Close</button>
            <button type="submit" class="btn btn-primary btn-sm">Add</button>
          </div>
        </form>
      </div>
    </div>
  </div>
  <!-- Modal Delete -->
  <div  v-if="accessLevels.accesslevel2" class="modal fade" id="modal-del-college" tabindex="-1" aria-labelledby="modal-del-college-label" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title fs-5" id="modal-del-college-label">Delete College</h3>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click="unsetSelectedRecord()"></button>
        </div>
        <form method="post" @submit.prevent="delCollege">
          <div class="modal-body">
            <div class="row m-2">
              <div class="col-md-12 mt-1">
                <span>Are you sure to delete <strong>{{ selectedRecord.college }}</strong> from the system?</span>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <input type="hidden" name="del_colid" id="del_colid" :value="selectedRecord.id" />
            <button type="button" class="btn btn-primary btn-sm" data-bs-dismiss="modal" @click="unsetSelectedRecord()">Cancel</button>
            <button type="submit" class="btn btn-primary btn-sm">Yes</button>
          </div>
        </form>
      </div>
    </div>
  </div>
  <!-- Modal Edit -->
  <div  v-if="accessLevels.accesslevel2" class="modal fade" id="modal-edit-college" tabindex="-1" aria-labelledby="modal-edit-college-label" aria-hidden="true">
    <div class="modal-dialog modal-xl">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title fs-5" id="modal-edit-college-label">Update College</h3>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click="unsetSelectedRecord()"></button>
        </div>
        <form method="post" @submit.prevent="updateCollege">
          <div class="modal-body">
            <div class="row m-2">
              <div class="col-md-4 fw-bold text-end required">
                College
              </div>
              <div class="col-md-6">
                <input type="text" id="upd_college" name="upd_college" :value="selectedRecord.college" @input="updateField('college', $event)" required>
              </div>
            </div>
            <div class="row m-2">
              <div class="col-md-4 fw-bold text-end">
                Abbreviation
              </div>
              <div class="col-md-6">
                <input type="text" id="upd_abbr" name="upd_abbr" :value="selectedRecord.abbr" @input="updateField('abbr', $event)">
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <input type="hidden" name="upd_colid" id="upd_colid" :value="selectedRecord.id" @input="updateField('id', $event)" />
            <button type="button" class="btn btn-primary btn-sm" data-bs-dismiss="modal" @click="unsetSelectedRecord()">Cancel</button>
            <button type="submit" class="btn btn-primary btn-sm">Update</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
//import { navmixin } from '../mixins/navMixin.js';
import { globalMixin } from '../mixins/globalMixin.js';
export default {
  mixins: [globalMixin],
  name: 'CollegeManagement',

  mounted: function(){
    const url = 'https://web.bftv.ucdavis.edu/reporting/col-get.php'
    this.getDataList(url, 'college')
  },
  methods: {
    addCollege(e) {
      e.preventDefault();
      this.loading = true;
      var modal = bootstrap.Modal.getInstance(document.getElementById('modal-add-college'));
      var col = document.getElementById('college').value;
      var abb = document.getElementById('abbr').value;
      axios.post('https://web.bftv.ucdavis.edu/reporting/col-add.php', {
        crossDomain: true,
        myid: this.username,
        token: this.token,
        college: col, abbreviation: abb,
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(response => {
        this.screenmsg = response.data.message,
        this.screenmsgtype = "success",
        this.screenmsgicon = this.successicon,
        this.listData = response.data.dataList
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
        document.getElementById('college').value = '';
        document.getElementById('abbr').value = '';
        modal.hide();
        this.loading = false;
      });
      window.scrollTo(0, 400);
    },
    updateCollege(e) {
      e.preventDefault();
      this.loading = true;
      var modal = bootstrap.Modal.getInstance(document.getElementById('modal-edit-college'));
      var colid = document.getElementById('upd_colid').value;
      var col = document.getElementById('upd_college').value;
      var abb = document.getElementById('upd_abbr').value;

      axios.post('https://web.bftv.ucdavis.edu/reporting/col-update.php', {
        crossDomain: true,
        myid: this.username,
        token: this.token,
        id: colid, college: col, abbreviation: abb,
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(response => {
        this.screenmsg = response.data.message,
        this.screenmsgtype = "success",
        this.screenmsgicon = this.successicon,
        this.listData = response.data.dataList
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
        this.unsetSelectedRecord();
        modal.hide();
        this.loading = false;
      });
      window.scrollTo(0, 400);
    },
    delCollege(e) {
      e.preventDefault();
      this.loading = true;
      var modal = bootstrap.Modal.getInstance(document.getElementById('modal-del-college'));
      var colid = document.getElementById('del_colid').value;
      axios.post('https://web.bftv.ucdavis.edu/reporting/col-delete.php', {
        crossDomain: true,
        colid: colid,
        myid: this.username,
        token: this.token,
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(response => {
        this.screenmsg = response.data.message,
        this.screenmsgtype = "success",
        this.screenmsgicon = this.successicon,
        this.listData = response.data.dataList
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
        this.unsetSelectedRecord();
        modal.hide();
        this.loading = false;
      });
      window.scrollTo(0, 400);
    },
  },
};
</script>

<style scoped>
/* Add component-specific styles here */
</style>
