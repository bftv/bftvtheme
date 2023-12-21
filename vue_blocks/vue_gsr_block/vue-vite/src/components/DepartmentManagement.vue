<template>
  <div class="container-fluid">
    <the-navigation></the-navigation>
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
      <div class="row mt-3">
        <div v-if="!authenticated" class="col-md-12 mb-3">
          <div class="alert alert--error">
            <i class="far fa-times-circle fa-2x alert--error-icon"></i> Your changes will not be saved as you are not authenticated to the server. <a href="#" @click="authenticate()">Click here</a> to authenticate.
          </div>
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
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="listData.length > 3">
              <td><input type="text" id="department_search" class="fs-6" v-model="searchTextDep"></td>
              <td>
                <select id="parent_search" class="fs-6" v-model="searchParent">
                  <option value=""></option>
                  <option v-for="department in departments" :key="department" :value="department.id">{{ department.department }}</option>
                </select>
              </td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
            </tr>
            <tr v-for="department in filteredData">
              <td>{{ department.department }} ({{ department.abbr }})</td>
              <td><span v-if="department.parentdep">{{ getDepartmentById(department.parentdep) }}</span></td>
              <td>{{ department.support_email }}</td>
              <td><a href="" @click="selectRecord(department)" data-bs-toggle="modal" data-bs-target="#modal-edit-dep" title="Edit department"><i class="fa-solid fa-pen-to-square"></i></a> <a v-if="accesslevel2" href="" @click="selectRecord(department)" data-bs-toggle="modal" data-bs-target="#modal-del-dep" title="Delete department"><i class="fa-solid fa-circle-xmark"></i></a></td>
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
            <fieldset  class="form-group">
              <legend>Information</legend>
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
                <div class="col-md-4 fw-bold text-end required">
                  PPS Code
                </div>
                <div class="col-md-6">
                  <input type="text" id="depcode" name="depcode" required>
                </div>
              </div>
              <div class="row m-2">
                <div class="col-md-4 fw-bold text-end"  :class="{ 'required': inherit }">
                  Parent
                </div>
                <div class="col-md-6">
                  <select name="parentdep" id="parentdep" :required="inherit">
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
            </fieldset>
            <fieldset class="form-group">
              <legend>Settings</legend>
              <div class="row m-2">
                <div class="col-md-6 offset-md-4">
                  <input type="checkbox" id="inherit" name="inherit" v-model="inherit" />
                  <label class="radio-check-label" for="inherit">Inherit settings from parent department</label>
                </div>
              </div>
              <div class="row m-2">
                <div class="col-md-4 fw-bold text-end" :class="{ 'required': !inherit }">
                  Communication Type
                </div>
                <div class="col-md-6">
                  <div class="col-md-9">
                    <input type="radio" id="comrt" name="com" value="rt" v-model="comtype" :required="!inherit">
                    <label class="radio-check-label" for="comrt">RT</label>
                    <input type="radio" id="comemail" name="com" value="email" v-model="comtype" :required="!inherit">
                    <label class="radio-check-label" for="comemail">Regular E-mail</label>
                  </div>
                </div>
              </div>
              <div class="row m-2">
                <div class="col-md-4 fw-bold text-end" :class="{ 'required': comtype == 'rt' }">
                  RT URL
                </div>
                <div class="col-md-6">
                  <input type="text" id="rturl" name="rturl" :required="comtype == 'rt'">
                </div>
              </div>
              <div class="row m-2">
                <div class="col-md-4 fw-bold text-end" :class="{ 'required': comtype == 'rt' }">
                  RT API URL
                </div>
                <div class="col-md-6">
                  <input type="text" id="rtapiurl" name="rtapiurl" :required="comtype == 'rt'">
                </div>
              </div>
              <div class="row m-2">
                <div class="col-md-4 fw-bold text-end" :class="{ 'required': !inherit }">
                  Account Managers RT Queue/E-mail
                </div>
                <div class="col-md-6">
                  <input type="text" id="amqemail" name="amqemail" :required="!inherit">
                </div>
              </div>
              <div class="row m-2">
                <div class="col-md-4 fw-bold text-end" :class="{ 'required': !inherit }">
                  Advising RT Queue/E-mail
                </div>
                <div class="col-md-6">
                  <input type="text" id="advqemail" name="advqemail" :required="!inherit">
                </div>
              </div>
              <div class="row m-2">
                <div class="col-md-4 fw-bold text-end" :class="{ 'required': !inherit }">
                  Payroll E-mail
                </div>
                <div class="col-md-6">
                  <input type="text" id="payemail" name="payemail" :required="!inherit">
                </div>
              </div>
              <div class="row m-2">
                <div class="col-md-4 fw-bold text-end">
                  From E-mail
                </div>
                <div class="col-md-6">
                  <input type="email" id="fromemail" name="fromemail">
                  <div><small>By default the from e-mail address is the one who initiates the DocuSign.</small></div>
                </div>
              </div>
              <div class="row m-2">
                <div class="col-md-4 fw-bold text-end" :class="{ 'required': comtype == 'rt' }">
                  RT API Token
                </div>
                <div class="col-md-6">
                  <input type="text" id="rttoken" name="rttoken" :required="comtype == 'rt'">
                </div>
              </div>
              <div class="row m-2">
                <div class="col-md-4 fw-bold text-end" :class="{ 'required': !inherit }">
                  DocuSign User
                </div>
                <div class="col-md-6">
                  <input type="text" id="dsuser" name="dsuser" :required="!inherit">
                </div>
              </div>
              <div class="row m-2">
                <div class="col-md-4 fw-bold text-end" :class="{ 'required': !inherit }">
                  DocuSign User ID
                </div>
                <div class="col-md-6">
                  <input type="text" id="dsuserid" name="dsuserid" :required="!inherit">
                </div>
              </div>
              <div class="row m-2">
                <div class="col-md-4 fw-bold text-end" :class="{ 'required': !inherit }">
                  DocuSign Template ID
                </div>
                <div class="col-md-6">
                  <input type="text" id="dstempid" name="dstempid" :required="!inherit">
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
  <div  v-if="accesslevel1" class="modal fade" id="modal-edit-dep" tabindex="-1" aria-labelledby="modal-edit-dep-label" aria-hidden="true">
    <div class="modal-dialog modal-xl">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title fs-5" id="modal-edit-dep-label">Update Department</h3>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click="unsetSelectedRecord()"></button>
        </div>
        <form method="post" @submit.prevent="updateDep">
          <div class="modal-body">
            <fieldset class="form-group">
              <legend>Information</legend>
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
                <div class="col-md-4 fw-bold text-end required">
                  PPS Code
                </div>
                <div class="col-md-6">
                  <input type="text" id="upd_depcode" name="upd_depcode" :value="selectedRecord.depcode" @input="updateField('depcode', $event)" required>
                  <div><small>Only SuperAdmins can update the PPS Code.</small></div>
                </div>
              </div>
              <div class="row m-2">
                <div class="col-md-4 fw-bold text-end" :class="{ 'required': inheritSettings }">
                  Parent
                </div>
                <div class="col-md-6">
                  <select name="upd_parentdep" id="upd_parentdep" v-model="selectedRecord.parentdep" :required="inheritSettings">
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
            </fieldset>
            <fieldset class="form-group">
              <legend>Settings</legend>
              <div class="row m-2">
                <div class="col-md-6 offset-md-4">
                  <input type="checkbox" id="upd_inherit" name="upd_inherit" v-model="inheritSettings" />
                  <label class="radio-check-label" for="upd_inherit">Inherit settings from parent department</label>
                </div>
              </div>
              <div class="row m-2">
                <div class="col-md-4 fw-bold text-end" :class="{ 'required': !inheritSettings }">
                  Communication Type
                </div>
                <div class="col-md-6">
                  <div class="col-md-9">
                    <input type="radio" id="updcomrt" name="upd_com" value="rt" v-model="selectedRecord.com_type" :required="!inheritSettings">
                    <label class="radio-check-label" for="updcomrt">RT</label>
                    <input type="radio" id="updcomemail" name="upd_com" value="email" v-model="selectedRecord.com_type" :required="!inheritSettings">
                    <label class="radio-check-label" for="updcomemail">Regular E-mail</label>
                  </div>
                </div>
              </div>
              <div class="row m-2">
                <div class="col-md-4 fw-bold text-end" :class="{ 'required': selectedRecord.com_type == 'rt' }">
                  RT URL
                </div>
                <div class="col-md-6">
                  <input type="text" id="upd_rturl" name="upd_rturl" :value="selectedRecord.rturl" @input="updateField('rturl', $event)" :required="selectedRecord.com_type == 'rt'">
                </div>
              </div>
              <div class="row m-2">
                <div class="col-md-4 fw-bold text-end" :class="{ 'required': selectedRecord.com_type == 'rt' }">
                  RT API URL
                </div>
                <div class="col-md-6">
                  <input type="text" id="upd_rtapiurl" name="upd_rtapiurl" :value="selectedRecord.rtapiurl" @input="updateField('rtapiurl', $event)" :required="selectedRecord.com_type == 'rt'">
                </div>
              </div>
              <div class="row m-2">
                <div class="col-md-4 fw-bold text-end" :class="{ 'required': !inheritSettings }">
                  Account Managers RT Queue/E-mail
                </div>
                <div class="col-md-6">
                  <input type="text" id="upd_amqemail" name="upd_amqemail" :value="selectedRecord.am_channel" @input="updateField('am_channel', $event)" :required="!inheritSettings">
                </div>
              </div>
              <div class="row m-2">
                <div class="col-md-4 fw-bold text-end" :class="{ 'required': !inheritSettings }">
                  Advising RT Queue/E-mail
                </div>
                <div class="col-md-6">
                  <input type="text" id="upd_advqemail" name="upd_advqemail" :value="selectedRecord.adv_channel" @input="updateField('adv_channel', $event)" :required="!inheritSettings">
                </div>
              </div>
              <div class="row m-2">
                <div class="col-md-4 fw-bold text-end" :class="{ 'required': !inheritSettings }">
                  Payroll E-mail
                </div>
                <div class="col-md-6">
                  <input type="text" id="upd_payemail" name="upd_payemail" :value="selectedRecord.pay_channel" @input="updateField('pay_channel', $event)" :required="!inheritSettings">
                </div>
              </div>
              <div class="row m-2">
                <div class="col-md-4 fw-bold text-end">
                  From E-mail
                </div>
                <div class="col-md-6">
                  <input type="email" id="upd_fromemail" name="upd_fromemail" :value="selectedRecord.from_email" @input="updateField('from_email', $event)">
                  <div><small>By default the from e-mail address is the one who initiates the DocuSign.</small></div>
                </div>
              </div>
              <div class="row m-2">
                <div class="col-md-4 fw-bold text-end" :class="{ 'required': selectedRecord.com_type == 'rt' }">
                  RT API Token
                </div>
                <div class="col-md-6">
                  <input type="text" id="upd_rttoken" name="upd_rttoken" :value="selectedRecord.rt_token" @input="updateField('rt_token', $event)" :required="selectedRecord.com_type == 'rt'">
                </div>
              </div>
              <div class="row m-2">
                <div class="col-md-4 fw-bold text-end" :class="{ 'required': !inheritSettings }">
                  DocuSign User
                </div>
                <div class="col-md-6">
                  <input type="text" id="upd_dsuser" name="upd_dsuser" :value="selectedRecord.ds_user" @input="updateField('ds_user', $event)" :required="!inheritSettings" :disabled="curlRole !== 'superadmin'">
                </div>
              </div>
              <div class="row m-2">
                <div class="col-md-4 fw-bold text-end" :class="{ 'required': !inheritSettings }">
                  DocuSign User ID
                </div>
                <div class="col-md-6">
                  <input type="text" id="upd_dsuserid" name="upd_dsuserid" :value="selectedRecord.ds_userid" @input="updateField('ds_userid', $event)" :required="!inheritSettings" :disabled="curlRole !== 'superadmin'">
                </div>
              </div>
              <div class="row m-2">
                <div class="col-md-4 fw-bold text-end" :class="{ 'required': !inheritSettings }">
                  DocuSign Template ID
                </div>
                <div class="col-md-6">
                  <input type="text" id="upd_dstempid" name="upd_dstempid" :value="selectedRecord.ds_tempid" @input="updateField('ds_tempid', $event)" :required="!inheritSettings" :disabled="curlRole !== 'superadmin'">
                  <div><small>Only SuperAdmins can update DocuSign settings. They need to validate the DocuSign user and template.</small></div>
                </div>
              </div>
            </fieldset>
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

  data: function() {
    return {
      searchTextDep: '',
      searchParent: '',
      comtype: ''
    }
  },

  mounted: function(){
    const url = 'https://web.bftv.ucdavis.edu/gsr/dep-get.php'
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
      var dcode = document.getElementById('depcode').value;
      var pdep = document.getElementById('parentdep').value;
      var support = document.getElementById('email').value;
      var mdep = document.getElementById('maindep').checked;
      var inh = document.getElementById('inherit').checked;
      var rurl = document.getElementById('rturl').value;
      var rapiurl = document.getElementById('rtapiurl').value;
      var amqe = document.getElementById('amqemail').value;
      var advqe = document.getElementById('advqemail').value;
      var payqe = document.getElementById('payemail').value;
      var fe = document.getElementById('fromemail').value;
      var rttok = document.getElementById('rttoken').value;
      var dsu = document.getElementById('dsuser').value;
      var dsui = document.getElementById('dsuserid').value;
      var dsti = document.getElementById('dstempid').value;
      var ctype = '';
      if(mdep == true){
        mdep = 1;
      } else {
        mdep = 0;
      }
      if(inh == true){
        inh = 1;
      } else {
        inh = 0;
        ctype = document.querySelector('input[name="com"]:checked').value;
      }
      axios.post('https://web.bftv.ucdavis.edu/gsr/dep-add.php', {
        crossDomain: true,
        myid: this.username,
        token: this.token,
        department: dep, abbreviation: abb, depcode: dcode, parentdep: pdep, support_email: support, maindep: mdep, inherit: inh, comtype: ctype, rturl: rurl, rtapiurl: rapiurl, amqemail: amqe, advqemail: advqe, payemail: payqe, fromemail: fe, rt_token: rttok, ds_user: dsu, ds_userid: dsui, ds_tempid: dsti,
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
        document.getElementById('depcode').value = '';
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
      var dcode = document.getElementById('upd_depcode').value;
      var pdep = document.getElementById('upd_parentdep').value;
      var support = document.getElementById('upd_email').value;
      var mdep = document.getElementById('upd_maindep').checked;
      var inh = document.getElementById('upd_inherit').checked;
      var rurl = document.getElementById('upd_rturl').value;
      var rapiurl = document.getElementById('upd_rtapiurl').value;
      var amqe = document.getElementById('upd_amqemail').value;
      var advqe = document.getElementById('upd_advqemail').value;
      var payqe = document.getElementById('upd_payemail').value;
      var fe = document.getElementById('upd_fromemail').value;
      var rttok = document.getElementById('upd_rttoken').value;
      var dsu = document.getElementById('upd_dsuser').value;
      var dsui = document.getElementById('upd_dsuserid').value;
      var dsti = document.getElementById('upd_dstempid').value;
      var ctype = '';
      if(mdep == true){
        mdep = 1;
      } else {
        mdep = 0;
      }
      if(inh == true){
        inh = 1;
      } else {
        inh = 0;
        ctype = document.querySelector('input[name="upd_com"]:checked').value;
      }

      axios.post('https://web.bftv.ucdavis.edu/gsr/dep-update.php', {
        crossDomain: true,
        myid: this.username,
        token: this.token,
        id: depid, department: dep, abbreviation: abb, depcode: dcode, parentdep: pdep, support_email: support, maindep: mdep, inherit: inh, comtype: ctype, rturl: rurl, rtapiurl: rapiurl, amqemail: amqe, advqemail: advqe, payemail: payqe, fromemail: fe, rt_token: rttok, ds_user: dsu, ds_userid: dsui, ds_tempid: dsti,
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
      axios.post('https://web.bftv.ucdavis.edu/gsr/dep-delete.php', {
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
  computed: {
    filteredData() {
      let conditions = [];
      if (this.searchTextDep.length >= 3) {
        conditions.push(applicant => this.matchesSearch(applicant.department, this.searchTextDep) || this.matchesSearch(applicant.abbr, this.searchTextDep));
      }
      if(this.searchParent != ''){
        conditions.push(applicant => { return applicant.parentdep == this.searchParent; });
      }
      if (conditions.length === 0) {
        return this.listData;
      }
      return this.listData.filter(applicant => conditions.every(condition => condition(applicant)));
    }
  }
};
</script>

<style scoped>
/* Add component-specific styles here */
</style>
