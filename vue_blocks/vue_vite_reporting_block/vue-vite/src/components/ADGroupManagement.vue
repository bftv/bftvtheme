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
          <div class="col-md-12 text-end">
            <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#modal-add-adg">+ Add an ADGroup</button>
          </div>
        </div>
        <div v-if="!hidebody" class='table-responsive mt-2'>
          <table class='table table-bordered table-hover table-striped'>
            <thead class='thead-light'>
              <tr>
                <th>ADGroup</th>
                <th>Alias</th>
                <th>Managed By</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="adgroup in listData">
                <td>{{ adgroup.adgroup }}</td>
                <td>{{ adgroup.alias }}</td>
                <td>{{ adgroup.department}}</td>
                <td><a href="" @click="selectRecord(adgroup)" data-bs-toggle="modal" data-bs-target="#modal-edit-adg" title="Edit ADGroup"><i class="fa-solid fa-pen-to-square"></i></a> <a href="" @click="selectRecord(adgroup)" data-bs-toggle="modal" data-bs-target="#modal-del-adg" title="Delete ADGroup"><i class="fa-solid fa-circle-xmark"></i></a></td>
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
    <div class="modal fade" id="modal-add-adg" tabindex="-1" aria-labelledby="modal-add-adg-label" aria-hidden="true">
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <h3 class="modal-title fs-5" id="modal-add-adg-label">Add a New ADGroup</h3>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <form method="post" @submit.prevent="addAdg">
            <div class="modal-body">
              <div class="row m-2">
                <div class="col-md-4 fw-bold text-end required">
                    ADGroup Name
                </div>
                <div class="col-md-6">
                  <input type="text" id="add_adgroup" name="add_adgroup" placeholder="ADGroup Title" required>
                  <small class="element-description">It should exactly match the name of the group on AD. It is case-sensitive.</small>
                </div>
              </div>
              <div class="row m-2">
                <div class="col-md-4 fw-bold text-end">
                  Alias
                </div>
                <div class="col-md-6">
                  <input type="text" id="add_alias" name="add_alias" placeholder="ADGroup Alias">
                </div>
              </div>
              <div class="row m-2">
                <div class="col-md-4 fw-bold text-end required">
                  Department
                </div>
                <div class="col-md-6">
                  <select name="add_dep" id="add_dep" required>
                    <option>-- select a department --</option>
                    <option v-for="department in departments" :key="department" :value="department.department">{{ department.department }}</option>
                  </select>
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
    <div class="modal fade" id="modal-del-adg" tabindex="-1" aria-labelledby="modal-del-adg-label" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h3 class="modal-title fs-5" id="modal-del-adg-label">Delete ADGroup</h3>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click="unsetSelectedRecord()"></button>
          </div>
          <form method="post" @submit.prevent="delAdg">
            <div class="modal-body">
              <div class="row m-2">
                <div class="col-md-12 mt-1">
                  <span>Are you sure to delete <strong>{{ selectedRecord.adgroup }}</strong> from the system?</span>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <input type="hidden" name="del_adgid" id="del_adgid" :value="selectedRecord.id" />
              <input type="hidden" name="del_adgdep" id="del_adgdep" :value="selectedRecord.department" />
              <button type="button" class="btn btn-primary btn-sm" data-bs-dismiss="modal" @click="unsetSelectedRecord()">Cancel</button>
              <button type="submit" class="btn btn-primary btn-sm">Yes</button>
            </div>
          </form>
        </div>
      </div>
    </div>
    <!-- Modal Edit -->
    <div class="modal fade" id="modal-edit-adg" tabindex="-1" aria-labelledby="modal-edit-adg-label" aria-hidden="true">
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <h3 class="modal-title fs-5" id="modal-edit-adg-label">Update ADGroup</h3>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click="unsetSelectedRecord()"></button>
          </div>
          <form method="post" @submit.prevent="updateAdg">
            <div class="modal-body">
              <div class="row m-2">
                <div class="col-md-10 text-end">
                  <button type="submit" class="btn btn-primary btn-sm" name="refresh-adgroup">Refresh from AD</button>
                </div>
              </div>
              <div class="row m-2">
                <div class="col-md-4 fw-bold text-end required">
                  ADGroup Name
                </div>
                <div class="col-md-6">
                  <input type="text" id="upd_adgroup" name="upd_adgroup" :value="selectedRecord.adgroup" @input="updateField('adgroup', $event)" required>
                  <small class="element-description">It should exactly match the name of the group on AD. It is case-sensitive.</small>
                </div>
              </div>
              <div class="row m-2">
                <div class="col-md-4 fw-bold text-end">
                  Alias
                </div>
                <div class="col-md-6">
                  <input type="text" id="upd_alias" name="upd_alias" :value="selectedRecord.alias" @input="updateField('alias', $event)">
                </div>
              </div>
              <div class="row m-2">
                <div class="col-md-4 fw-bold text-end required">
                  Department
                </div>
                <div class="col-md-6">
                  <select name="upd_dep" id="upd_dep" v-model="selectedRecord.department" required>
                    <option>-- select a department --</option>
                    <option v-for="department in departments" :key="department" :value="department.department">{{ department.department }}</option>
                  </select>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <input type="hidden" name="upd_adgid" id="upd_adgid" :value="selectedRecord.id" @input="updateField('id', $event)" />
              <input type="hidden" name="upd_guid" id="upd_guid" :value="selectedRecord.guid" @input="updateField('guid', $event)" />
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
    name: 'ADGroupManagement',

    mounted: function(){
      const url = 'https://web.bftv.ucdavis.edu/reporting/adgroup-get.php'
      this.getDataList(url, 'adgroup')
    },
    methods: {
      addAdg(e) {
        e.preventDefault();
        this.loading = true;
        var modal = bootstrap.Modal.getInstance(document.getElementById('modal-add-adg'));
        var grp = document.getElementById('add_adgroup').value;
        var als = document.getElementById('add_alias').value;
        var dep = document.getElementById('add_dep').value;
        axios.post('https://web.bftv.ucdavis.edu/reporting/adgroup-add.php', {
          crossDomain: true,
          myid: this.username,
          token: this.token,
          adgroup: grp, alias: als, department: dep,
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
          document.getElementById('add_adgroup').value = '';
          document.getElementById('add_alias').value = '';
          document.getElementById('add_dep').value = '';
          modal.hide();
          this.loading = false;
        });
        window.scrollTo(0, 400);
      },
      updateAdg(e) {
        e.preventDefault();
        this.loading = true;
        var modal = bootstrap.Modal.getInstance(document.getElementById('modal-edit-adg'));
        var adgid = document.getElementById('upd_adgid').value;
        var adgroup = document.getElementById('upd_adgroup').value;
        var als = document.getElementById('upd_alias').value;
        var adgdep = document.getElementById('upd_dep').value;
        var adguid = document.getElementById('upd_guid').value;
        var action = '';
        if(e.submitter.name == 'refresh-adgroup'){
          action = 'refresh'
        } else {
          action = 'save'
        }

        axios.post('https://web.bftv.ucdavis.edu/reporting/adgroup-update.php', {
          crossDomain: true,
          myid: this.username,
          token: this.token,
          id: adgid, adgroup: adgroup, alias: als, dep: adgdep, guid: adguid, mode: action,
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
      delAdg(e) {
        e.preventDefault();
        this.loading = true;
        var modal = bootstrap.Modal.getInstance(document.getElementById('modal-del-adg'));
        var adgid = document.getElementById('del_adgid').value;
        var adgdep = document.getElementById('del_adgdep').value;
        axios.post('https://web.bftv.ucdavis.edu/reporting/adgroup-delete.php', {
          crossDomain: true,
          adgid: adgid, adgdep: adgdep,
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
          modal.hide();
          this.loading = false;
        });
        window.scrollTo(0, 400);
      },
    },
  };
  </script>

  <style scoped>
.element-description {
  font-size: 0.85rem;
  padding: 0.2rem;
  opacity: 0.8;
}
  </style>
