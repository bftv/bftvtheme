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
      <div v-if="!hidebody" class="row mt-3">
        <div  v-if="accesslevel2" class="col-md-12 text-end">
          <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#modal-add-dep">+ Add a Department</button>
        </div>
      </div>
      <div v-if="!hidebody" class='table-responsive mt-2'>
        <table class='table table-bordered table-hover table-striped'>
          <thead class='thead-light'>
            <tr>
              <th>Departments</th>
              <th>Parent</th>
              <th>Support E-mail</th>
              <th v-if="accesslevel2"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="department in listData">
              <td>{{ department.department }} ({{ department.abbr }})</td>
              <td><span v-if="department.parentdep">{{ getDepartmentById(department.parentdep) }}</span></td>
              <td>{{ department.support_email }}</td>
              <td v-if="accesslevel2"><a href="" @click="selectRecord(department)" data-bs-toggle="modal" data-bs-target="#modal-edit-dep" title="Edit department"><i class="fa-solid fa-pen-to-square"></i></a> <a href="" @click="selectRecord(department)" data-bs-toggle="modal" data-bs-target="#modal-del-dep" title="Delete department"><i class="fa-solid fa-circle-xmark"></i></a></td>
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
  <div  v-if="accesslevel2" class="modal fade" id="modal-add-dep" tabindex="-1" aria-labelledby="modal-add-dep-label" aria-hidden="true">
    <div class="modal-dialog modal-xl">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title fs-5" id="modal-add-dep-label">Add a New Department</h3>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <form method="post" @submit.prevent="addDep">
          <div class="modal-body">
            <div class="row m-2">
              <div class="col-md-4 fw-bold text-end required">
                Department
              </div>
              <div class="col-md-6">
                <input type="text" id="department" name="department" required>
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
            <div class="row m-2">
              <div class="col-md-4 fw-bold text-end">
                Parent
              </div>
              <div class="col-md-6">
                <select name="parentdep" id="parentdep">
                  <option>-- select an option --</option>
                  <option v-for="department in departments" :key="department" :value="department.id">{{ department.department }}</option>
                </select>
              </div>
            </div>
            <div class="row m-2">
              <div class="col-md-4 fw-bold text-end">
                Support E-mail
              </div>
              <div class="col-md-6">
                <input type="email" id="email" name="email">
              </div>
            </div>
            <div class="row m-2">
              <div class="col-md-6 offset-md-4">
                <input type="checkbox" id="maindep" name="maindep" />
                <label class="radio-check-label" for="maindep">Main Department</label>
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
  <div  v-if="accesslevel2" class="modal fade" id="modal-del-dep" tabindex="-1" aria-labelledby="modal-del-dep-label" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title fs-5" id="modal-del-dep-label">Delete Department</h3>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click="unsetSelectedRecord()"></button>
        </div>
        <form method="post" @submit.prevent="delDep">
          <div class="modal-body">
            <div class="row m-2">
              <div class="col-md-12 mt-1">
                <span>Are you sure to delete <strong>{{ selectedRecord.department }}</strong> from the system?</span>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <input type="hidden" name="del_depid" id="del_depid" :value="selectedRecord.id" />
            <button type="button" class="btn btn-primary btn-sm" data-bs-dismiss="modal" @click="unsetSelectedRecord()">Cancel</button>
            <button type="submit" class="btn btn-primary btn-sm">Yes</button>
          </div>
        </form>
      </div>
    </div>
  </div>
  <!-- Modal Edit -->
  <div  v-if="accesslevel2" class="modal fade" id="modal-edit-dep" tabindex="-1" aria-labelledby="modal-edit-dep-label" aria-hidden="true">
    <div class="modal-dialog modal-xl">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title fs-5" id="modal-edit-dep-label">Update Department</h3>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click="unsetSelectedRecord()"></button>
        </div>
        <form method="post" @submit.prevent="updateDep">
          <div class="modal-body">
            <div class="row m-2">
              <div class="col-md-4 fw-bold text-end required">
                Department
              </div>
              <div class="col-md-6">
                <input type="text" id="upd_department" name="upd_department" :value="selectedRecord.department" @input="updateField('department', $event)" required>
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
            <div class="row m-2">
              <div class="col-md-4 fw-bold text-end">
                Parent
              </div>
              <div class="col-md-6">
                <select name="upd_parentdep" id="upd_parentdep" v-model="selectedRecord.parentdep">
                  <option>-- select an option --</option>
                  <option v-for="department in departments" :key="department" :value="department.id">{{ department.department }}</option>
                </select>
              </div>
            </div>
            <div class="row m-2">
              <div class="col-md-4 fw-bold text-end">
                Support E-mail
              </div>
              <div class="col-md-6">
                <input type="email" id="upd_email" name="upd_email" :value="selectedRecord.support_email" @input="updateField('support_email', $event)">
              </div>
            </div>
            <div class="row m-2">
              <div class="col-md-6 offset-md-4">
                <input type="checkbox" id="upd_maindep" name="upd_maindep" :checked="selectedRecord.maindep == '1'" />
                <label class="radio-check-label" for="upd_maindep">Main Department</label>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <input type="hidden" name="upd_depid" id="upd_depid" :value="selectedRecord.id" @input="updateField('id', $event)" />
            <button type="button" class="btn btn-primary btn-sm" data-bs-dismiss="modal" @click="unsetSelectedRecord()">Cancel</button>
            <button type="submit" class="btn btn-primary btn-sm">Update</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { navmixin } from '../mixins/navMixin.js';
import { globalMixin } from '../mixins/globalMixin.js';
export default {
  mixins: [navmixin, globalMixin],
  name: 'DepartmentManagement',

  mounted: function(){
    const url = 'https://web.bftv.ucdavis.edu/reporting/dep-get.php'
    this.getDataList(url, 'department')
  },
  methods: {
    getDepartmentById(id) {
      const department = this.listData.find(item => item.id === id);
      if (department) {
        return department.department+" ("+department.abbr+")";
      } else {
        return null;
      }
    },
    addDep(e) {
      e.preventDefault();
      this.loading = true;
      var modal = bootstrap.Modal.getInstance(document.getElementById('modal-add-dep'));
      var dep = document.getElementById('department').value;
      var abb = document.getElementById('abbr').value;
      var pdep = document.getElementById('parentdep').value;
      var support = document.getElementById('email').value;
      var mdep = document.getElementById('maindep').checked;
      if(mdep == true){
        mdep = 1;
      } else {
        mdep = 0;
      }
      axios.post('https://web.bftv.ucdavis.edu/reporting/dep-add.php', {
        crossDomain: true,
        myid: this.username,
        token: this.token,
        department: dep, abbreviation: abb, parentdep: pdep, support_email: support, maindep: mdep,
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(response => {
        this.screenmsg = response.data.message,
        this.screenmsgtype = "success",
        this.screenmsgicon = this.successicon,
        this.listData = response.data.dataList,
        this.departments = response.data.departments
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
        document.getElementById('department').value = '';
        document.getElementById('abbr').value = '';
        document.getElementById('parentdep').value = '';
        document.getElementById('email').value = '';
        document.getElementById('maindep').checked = false;
        modal.hide();
        this.loading = false;
      });
      window.scrollTo(0, 400);
    },
    updateDep(e) {
      e.preventDefault();
      this.loading = true;
      var modal = bootstrap.Modal.getInstance(document.getElementById('modal-edit-dep'));
      var depid = document.getElementById('upd_depid').value;
      var dep = document.getElementById('upd_department').value;
      var abb = document.getElementById('upd_abbr').value;
      var pdep = document.getElementById('upd_parentdep').value;
      var support = document.getElementById('upd_email').value;
      var mdep = document.getElementById('upd_maindep').checked;
      if(mdep == true){
        mdep = 1;
      } else {
        mdep = 0;
      }

      axios.post('https://web.bftv.ucdavis.edu/reporting/dep-update.php', {
        crossDomain: true,
        myid: this.username,
        token: this.token,
        id: depid, department: dep, abbreviation: abb, parentdep: pdep, support_email: support, maindep: mdep,
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(response => {
        this.screenmsg = response.data.message,
        this.screenmsgtype = "success",
        this.screenmsgicon = this.successicon,
        this.listData = response.data.dataList,
        this.departments = response.data.departments
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
    delDep(e) {
      e.preventDefault();
      this.loading = true;
      var modal = bootstrap.Modal.getInstance(document.getElementById('modal-del-dep'));
      var depid = document.getElementById('del_depid').value;
      axios.post('https://web.bftv.ucdavis.edu/reporting/dep-delete.php', {
        crossDomain: true,
        depid: depid,
        myid: this.username,
        token: this.token,
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(response => {
        this.screenmsg = response.data.message,
        this.screenmsgtype = "success",
        this.screenmsgicon = this.successicon,
        this.listData = response.data.dataList,
        this.departments = response.data.departments
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
