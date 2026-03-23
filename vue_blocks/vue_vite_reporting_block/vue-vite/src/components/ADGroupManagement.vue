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
        <div v-if="!hidebody && !loading" class="row mt-3">
          <div class="col-md-6">
            <div class="filter-input-wrapper">
              <input type="text" name="filtertxt" id="filtertxt" v-model.trim="filtertxt" @keydown.esc="clearFilter" class="form-control filter-input" style="border-radius: 10px !important; height: 2em !important; font-size: 0.8rem" placeholder="Filter ADGroups">
              <span v-if="filtertxt" class="filter-clear" @click="clearFilter"><i class="fa-solid fa-xmark"></i></span>
            </div>
          </div>
          <div class="col-md-6 text-end">
            <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#modal-add-adg">+ Add a New Lab/Group</button>
          </div>
        </div>
        <div v-if="!hidebody" class='table-responsive mt-2'>
          <table class='table table-bordered table-hover table-striped'>
            <thead class='thead-light'>
              <tr>
                <th class="table-header">Lab/Group<a href="#" class="filter-link" :class="{ activated: isSortActive('alias') }" @click.prevent="toggleSort('alias'); applySort('listData')"><i class="fa-solid" :class="getSortIcon('alias')"></i></a></th>
                <th class="table-header">ADGroup<a href="#" class="filter-link" :class="{ activated: isSortActive('adgroup') }" @click.prevent="toggleSort('adgroup'); applySort('listData')"><i class="fa-solid" :class="getSortIcon('adgroup')"></i></a></th>
                <th class="table-header">Managed By<a href="#" class="filter-link" :class="{ activated: isSortActive('department') }" @click.prevent="toggleSort('department'); applySort('listData')"><i class="fa-solid" :class="getSortIcon('department')"></i></a></th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="adgroup in filteredAdGroups">
                <td>{{ adgroup.alias }}</td>
                <td>{{ adgroup.adgroup }}</td>
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
            <h3 class="modal-title fs-5" id="modal-add-adg-label">Add a New Lab/Group</h3>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <form method="post" @submit.prevent="addAdg">
            <div class="modal-body">
              <fieldset class="form-group">
                <legend>Lab/Group Configuration</legend>
                <div class="row m-2">
                  <div class="col-md-4 fw-bold text-end">
                    Lab/Group Name
                  </div>
                  <div class="col-md-6">
                    <input type="text" id="add_alias" name="add_alias" placeholder="Lab Name">
                  </div>
                </div>
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
                <div class="row m-2">
                  <div class="col-md-4 fw-bold text-end">
                    PI/Supervisor
                  </div>
                  <div class="col-md-6">
                    <select name="add_pi" id="add_pi">
                      <option>-- select a user --</option>
                      <option v-for="user in userList" :key="user" :value="user.loginid">{{ user.firstname }} {{ user.lastname }}</option>
                    </select>
                    <small class="element-description">If the user is not listed, add the user first.</small>
                  </div>
                </div>
                <div class="row m-2">
                  <div class="col-md-4 fw-bold text-end">
                    Secondary Approver
                  </div>
                  <div class="col-md-6">
                    <select name="add_secondapprover" id="add_secondapprover">
                      <option>-- select a user --</option>
                      <option v-for="user in userList" :key="user" :value="user.loginid">{{ user.firstname }} {{ user.lastname }}</option>
                    </select>
                    <small class="element-description">Secondary Approver is a multi-choice list.</small>
                  </div>
                </div>
              </fieldset>
              <fieldset class="form-group mt-2">
                <legend>Attributes</legend>
                <div class="row">
                  <div class="col-md-12">
                    <input type="checkbox" id="inherit" name="inherit" v-model="isInherited">
                    <label class="radio-check-label" for="inherit">Inherit attribute settings from department</label>
                  </div>
                </div>
                <div v-if="!isInherited">
                  <div class="row mt-3">
                    <div class="col-md-4">
                      <label>ADGroup</label>
                    </div>
                    <div class="col-md-4">
                      <label>Display Name</label>
                    </div>
                    <div class="col-md-2">
                      <label>Visible</label>
                    </div>
                    <div class="col-md-2">
                      <label>Remove</label>
                    </div>
                  </div>
                  <div class="row" v-for="(attribute, index) in attributes" :key="index">
                    <div class="col-md-4 mt-1">
                      <div>
                        <input type="text" :name="'adgroup-' + (index + 1)" v-model="attribute.adgroup" :id="'adgroup-' + (index + 1)" required>
                      </div>
                    </div>
                    <div class="col-md-4 mt-1">
                      <div>
                        <input type="text" :name="'adgroup-dp-' + (index + 1)" v-model="attribute.displayName" :id="'adgroup-dp-' + (index + 1)" required>
                      </div>
                    </div>
                    <div class="col-md-2 mt-1">
                      <div class="mt-1">
                        <input type="checkbox" :name="'adgroup-visible-' + (index + 1)" v-model="attribute.visible" :id="'adgroup-visible-' + (index + 1)" value="1" style="transform: scale(2.5); margin-left: 0.5em;">
                      </div>
                    </div>
                    <div class="col-md-2 mt-1">
                      <div>
                        <a href="#" @click.prevent="removeAttribute(index)"><i class="fa-solid fa-circle-minus align-middle fa-2x"></i></a>
                      </div>
                    </div>
                  </div>
                  <div>
                    <a href="#" @click.prevent="addAttribute"><span v-if="attributes.length === 0">Add an attribute</span><span v-else>Add another attribute</span></a>
                  </div>
                </div>
              </fieldset>
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
            <h3 class="modal-title fs-5" id="modal-del-adg-label">Delete Lab/Group</h3>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click="unsetSelectedRecord()"></button>
          </div>
          <form method="post" @submit.prevent="delAdg">
            <div class="modal-body">
              <div class="row m-2">
                <div class="col-md-12 mt-1">
                  <span>Are you sure to delete <strong>{{ selectedRecord.alias }}</strong> from the system?</span>
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
            <h3 class="modal-title fs-5" id="modal-edit-adg-label">Update Lab/Group</h3>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click="unsetSelectedRecord()"></button>
          </div>
          <form method="post" @submit.prevent="updateAdg">
            <div class="modal-body">
              <fieldset class="form-group">
                <legend>Lab Configuration</legend>
                <div class="row m-2">
                  <div class="col-md-10 text-end">
                    <button type="submit" class="btn btn-primary btn-sm" name="refresh-adgroup">Refresh from AD</button>
                  </div>
                </div>
                <div class="row m-2">
                  <div class="col-md-4 fw-bold text-end">
                    Lab/Group Name
                  </div>
                  <div class="col-md-6">
                    <input type="text" id="upd_alias" name="upd_alias" :value="selectedRecord.alias" @input="updateField('alias', $event)">
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
                <div class="row m-2">
                  <div class="col-md-4 fw-bold text-end">
                    PI/Supervisor
                  </div>
                  <div class="col-md-6">
                    <select name="upd_pi" id="upd_pi" v-model="selectedRecord.pi">
                      <option value="">-- select a user --</option>
                      <option v-for="user in userList" :key="user" :value="user.loginid">{{ user.firstname }} {{ user.lastname }}</option>
                    </select>
                    <small class="element-description">If the user is not listed, add the user first.</small>
                  </div>
                </div>
                <div class="row m-2">
                  <div class="col-md-4 fw-bold text-end">
                    Secondary Approver
                  </div>
                  <div class="col-md-6">
                    <v-select
                      multiple
                      :options="filteredUserOptions"
                      label="userName"
                      v-model="selectedUsers"
                      placeholder="-- select an option --"
                      :taggable="false"
                      :close-on-select="false"
                    />
                  </div>
                </div>
                <div class="row m-2">
                  <div class="col-md-4 fw-bold text-end">
                    Viewer
                  </div>
                  <div class="col-md-6">
                    <v-select
                      multiple
                      :options="filteredUserOptions"
                      label="userName"
                      v-model="selectedViewers"
                      placeholder="-- select an option --"
                      :taggable="false"
                      :close-on-select="false"
                    />
                    <small class="element-description">Secondary Approver and Viewer are a multi-choice lists.</small>
                  </div>
                </div>
                <div class="row m-2">
                  <div class="col-md-4 fw-bold text-end">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                  </div>
                  <div class="col-md-6">
                    <small>Choosing the same person for multiple roles will grant them the least privileged role.</small>
                  </div>
                </div>
              </fieldset>
              <fieldset class="form-group mt-2">
                <legend>Attributes</legend>
                <div class="row">
                  <div class="col-md-12">
                    <input type="checkbox" id="upd_inherit" name="upd_inherit" v-model="isInherited">
                    <label class="radio-check-label" for="upd_inherit">Inherit attribute settings from department</label>
                  </div>
                </div>
                <div v-if="!isInherited">
                  <div class="row mt-3">
                    <div class="col-md-4">
                      <label>ADGroup</label>
                    </div>
                    <div class="col-md-4">
                      <label>Display Name</label>
                    </div>
                    <div class="col-md-2">
                      <label>Visible</label>
                    </div>
                    <div class="col-md-2">
                      <label>Remove</label>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-md-4">
                      <div v-for="(adgroup, index) in atrAdgroups" :key="index" class="mt-1">
                        <input type="text" :id="`adgroup-${index}`" :name="`adgroup-${index}`" :value="adgroup" @input="updateMultipleValueField('atr_adgroups', index, $event)" required>
                      </div>
                    </div>
                    <div class="col-md-4 mt-1">
                      <div v-for="(adgroupdp, index) in atrAdgroupsdp" :key="index" class="mt-1">
                        <input type="text" :id="`adgroup-dp-${index}`" :name="`adgroup-dp-${index}`" :value="adgroupdp" @input="updateMultipleValueField('atr_adgroupsdp', index, $event)" required>
                      </div>
                    </div>
                    <div class="col-md-2">
                      <div v-for="(adgroupv, index) in atrAdgroupsv" :key="index" class="mt-1" style="height: 2.5em; padding-top: 0.25em;">
                        <input type="checkbox" :name="`adgroup-visible-${index}`" :id="`adgroup-visible-${index}`" v-model="atrAdgroupsv[index]" @change="updateMultipleValueField('atr_adgroupsvisiblity', index, $event)" style="transform: scale(2.5); margin-left: 0.5em;">
                      </div>
                    </div>
                    <div class="col-md-2">
                      <div v-for="(adgroup, index) in atrAdgroups" :key="index" class="mt-1" style="height: 2.5em; padding-top: 0.2em;">
                        <a href="#" @click.prevent="removeUpdateAttribute(index)"><i class="fa-solid fa-circle-minus align-middle fa-2x"></i></a>
                      </div>
                    </div>
                  </div>
                  <div>
                    <a href="#" @click.prevent="addUpdateAttribute"><span v-if="attributes.length === 0">Add an attribute</span><span v-else>Add another attribute</span></a>
                  </div>
                </div>
              </fieldset>
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
  //import { navmixin } from '../mixins/navMixin.js';
  import { globalMixin } from '../mixins/globalMixin.js';
  import axios from 'axios';
  import vSelect from 'vue-select';
  export default {
    components: {
      'v-select': vSelect
    },
    mixins: [globalMixin],
    name: 'ADGroupManagement',

    data() {
      return {
        isInherited: false,
        attributes: [
          { adgroup: '', displayName: '', visible: false }
        ]
      };
    },
    created() {
      this.sortKey = 'alias';
      this.sortDirection = 'asc';
    },
    mounted: function(){
      const url = 'https://web.bftv.ucdavis.edu/reporting/adgroup-get.php'
      this.getDataList(url, 'adgroup')
    },
    methods: {
      addAttribute() {
        this.attributes.push({ adgroup: '', displayName: '', visible: false });
      },
      removeAttribute(index) {
        this.attributes.splice(index, 1);
      },
      clearAttributes() {
        this.attributes = [{ adgroup: '', displayName: '', visible: false }];
      },
      addUpdateAttribute() {
        this.atrAdgroups = [...this.atrAdgroups, ''];
        this.atrAdgroupsdp = [...this.atrAdgroupsdp, ''];
        this.atrAdgroupsv = [...this.atrAdgroupsv, 'false'];
      },
      removeUpdateAttribute(index) {
        this.atrAdgroups = this.atrAdgroups.filter((_, i) => i !== index);
        this.atrAdgroupsdp = this.atrAdgroupsdp.filter((_, i) => i !== index);
        this.atrAdgroupsv = this.atrAdgroupsv.filter((_, i) => i !== index);
      },
      addAdg(e) {
        e.preventDefault();
        this.loading = true;
        var modal = bootstrap.Modal.getInstance(document.getElementById('modal-add-adg'));
        var grp = document.getElementById('add_adgroup').value;
        var als = document.getElementById('add_alias').value;
        var dep = document.getElementById('add_dep').value;
        var pi = document.getElementById('add_pi').value;
        var sap = document.getElementById('add_secondapprover').value;
        var adgs = 'none';
        var adgsdp = 'none';
        var adgsv = 'none';
        var inh = document.getElementById('inherit').checked;
        if(inh == true){
          inh = 1;
        } else {
          inh = 0;
          adgs = this.attributes.map(attribute => attribute.adgroup).join(';');
          adgsdp = this.attributes.map(attribute => attribute.displayName).join(';');
          adgsv = this.attributes.map(attribute => attribute.visible).join(';');
        }
        axios.post('https://web.bftv.ucdavis.edu/reporting/adgroup-add.php', {
          crossDomain: true,
          myid: this.username,
          token: this.token,
          adgroup: grp, alias: als, department: dep, pi: pi, secondap: sap, inherit: inh, adgroups: adgs, adgroupsdp: adgsdp, adgroupsvisibility: adgsv,
          headers: {
            'Content-Type': 'application/json'
          }
        }).then(response => {
          this.screenmsg = response.data.message,
          this.screenmsgtype = "success",
          this.screenmsgicon = this.successicon,
          this.listData = response.data.dataList,
          this.sortKey = 'alias';
          this.sortDirection = 'asc';
          this.applySort('listData');
          this.departments = response.data.departments,
          this.departments.sort((a, b) => this.sortColumn('department', a, b))
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
          this.clearAttributes();
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
        var pi = document.getElementById('upd_pi').value;
        var adgs = 'none';
        var adgsdp = 'none';
        var adgsv = 'none';
        var inh = document.getElementById('upd_inherit').checked;
        if(inh == true){
          inh = 1;
        } else {
          inh = 0;
          adgs = this.selectedRecord.atr_adgroups;
          adgsdp = this.selectedRecord.atr_adgroupsdp;
          adgsv = this.selectedRecord.atr_adgroupsvisiblity;
        }
        var action = '';
        if(e.submitter.name == 'refresh-adgroup'){
          action = 'refresh'
        } else {
          action = 'save'
        }
        const userids = this.selectedUsers.map(item => item.loginid);
        const viewerids = this.selectedViewers.map(item => item.loginid);

        axios.post('https://web.bftv.ucdavis.edu/reporting/adgroup-update.php', {
          crossDomain: true,
          myid: this.username,
          token: this.token,
          id: adgid, adgroup: adgroup, alias: als, dep: adgdep, guid: adguid, pi: pi, secondap: userids, viewers: viewerids, inherit: inh, adgroups: adgs, adgroupsdp: adgsdp, adgroupsvisibility: adgsv, mode: action,
          headers: {
            'Content-Type': 'application/json'
          }
        }).then(response => {
          this.screenmsg = response.data.message,
          this.screenmsgtype = "success",
          this.screenmsgicon = this.successicon,
          this.listData = response.data.dataList,
          this.sortKey = 'alias';
          this.sortDirection = 'asc';
          this.applySort('listData');
          this.departments = response.data.departments,
          this.departments.sort((a, b) => this.sortColumn('department', a, b)),
          this.userList = response.data.userList,
          this.userList.sort((a, b) => this.sortColumn('firstname', a, b)),
          this.peaksTeam = response.data.peaksTeam
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
          this.sortKey = 'alias';
          this.sortDirection = 'asc';
          this.applySort('listData');
          this.departments = response.data.departments,
          this.departments.sort((a, b) => this.sortColumn('department', a, b))
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
          modal.hide();
          this.loading = false;
        });
        window.scrollTo(0, 400);
      },
    },
    computed: {
      atrAdgroups: {
        get() {
          return this.selectedRecord?.atr_adgroups?.split(';') || [];
        },
        set(value) {
          this.selectedRecord.atr_adgroups = value.join(';');
        }
      },
      atrAdgroupsdp: {
        get() {
          return this.selectedRecord?.atr_adgroupsdp?.split(';') || [];
        },
        set(value) {
          this.selectedRecord.atr_adgroupsdp = value.join(';');
        }
      },
      atrAdgroupsv: {
        get() {
          return this.selectedRecord?.atr_adgroupsvisiblity?.split(';') || [];
        },
        set(value) {
          this.selectedRecord.atr_adgroupsvisiblity = value.join(';');
        }
      },
      userOptions() {
        return this.userList.map(user => {
          const adgroups = typeof user.adgroups === 'string' ? user.adgroups.split(',') : [];
          const grpids = typeof user.grpids === 'string' ? user.grpids.split(',').map(Number) : [];
          const roles = typeof user.roles === 'string' ? user.roles.split(',') : [];
          const is_pis = typeof user.is_pi === 'string' ? user.is_pi.split(',').map(Number) : [];

          const adgroupDetails = adgroups.map((adgroup, index) => ({
            adgroup: adgroup ?? null,
            grpid: grpids[index] ?? null,
            role: roles[index] ?? null,
            is_pi: is_pis[index] ?? null
          }));

          return {
            id: user.id,
            loginid: user.loginid,
            userName: `${user.firstname} ${user.lastname}`,
            adgroupDetails
          };
        });
      },
      filteredUserOptions() {
        return this.userOptions.filter(user => user.loginid !== this.selectedRecord.pi);
      },
      filteredAdGroups() {
        return this.filterArray(this.listData, ['alias', 'adgroup', 'department']);
      }
    },
    watch: {
      selectedRecord(newValue) {
        if (newValue && newValue.inherit !== undefined) {
          this.isInherited = Number(newValue.inherit) === 1;
        }
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
