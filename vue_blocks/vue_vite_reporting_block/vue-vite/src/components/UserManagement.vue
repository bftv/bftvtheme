<template>
  <div class="container-fluid">
    <div v-if="loading" id="loading" class="mt-3">
      <div class="spinner-border text-secondary loader" role="status">
        <span class="sr-only">Loading...</span>
      </div>
    </div>
    <div v-if="accessLevels.accesslevel1r">
      <div v-if="screenmsg" class="mt-5">
        <div :class="'alert alert--'+screenmsgtype">
          <i :class="screenmsgicon"></i> {{ screenmsg }} <span v-if="screenmsgtype == 'error'"> Please contact one of the SuperAdmins through the Slack channel.</span>
        </div>
      </div>
      <div v-if="!hidebody && accessLevels.accesslevel1r" class="row mt-3">
        <div class="col-md-6">
          <div class="filter-input-wrapper">
            <input type="text" name="filtertxt" id="filtertxt" v-model.trim="filtertxt" @keydown.esc="clearFilter" class="form-control filter-input" style="border-radius: 10px !important; height: 2em !important; font-size: 0.8rem" placeholder="Filter users">
            <span v-if="filtertxt" class="filter-clear" @click="clearFilter"><i class="fa-solid fa-xmark"></i></span>
          </div>
        </div>
        <div v-if="accessLevels.accesslevel1" class="col-md-6 text-end">
          <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#modal-add-user">+ Add a User</button>
        </div>
      </div>
      <div v-if="!hidebody" class='table-responsive mt-2'>
        <table class='table table-bordered table-hover table-striped'>
          <thead class='thead-light'>
            <tr>
              <th class="table-header">Name<a href="#" class="filter-link" :class="{ activated: isSortActive('firstname') }" @click.prevent="toggleSort('firstname')"><i class="fa-solid" :class="getSortIcon('firstname')"></i></a></th>
              <th class="table-header">Department<a href="#" class="filter-link" :class="{ activated: isSortActive('department') }" @click.prevent="toggleSort('department')"><i class="fa-solid" :class="getSortIcon('department')"></i></a></th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="person in users">
              <td>{{ person.firstname }} {{ person.lastname }} <span class="user-data-role secondary-color">({{ roleAnalyser(person.specific_role) }})</span></td>
              <td>{{ person.department }}</td>
              <td><span title="User active status" v-html="person.status == 1 ? '<i class=\'fa-solid fa-check color-green\'></i>' : '<i class=\'fa-solid fa-x color-red\'></i>'"></span> | <span title="User e-mail notification status" v-html="person.notification == 1 ? '<i class=\'fa-regular fa-bell color-green\'></i>' : '<i class=\'fa-regular fa-bell-slash color-red\'></i>'"></span></td>
              <td>
                  <a v-if="accessLevels.accesslevel1" href="" @click="selectRecord(person)" data-bs-toggle="modal" data-bs-target="#modal-user" title="Edit user"><i class="fa-solid fa-pen-to-square"></i></a>
                  <a v-if="accessLevels.accesslevel1" href="" @click="selectRecord(person)" data-bs-toggle="modal" data-bs-target="#modal-del-user" title="Delete user"><i class="fa-solid fa-circle-xmark ms-1"></i></a>
                  <button class="btn btn-sm btn-link btn-resend" v-if="accessLevels.accesslevel1r && person.specific_role === 'labadmin' && dateOlderThan24Hours(person.last_report_sent)" @click="resendReport(person.loginid)" :title="'Send report to '+person.firstname+' '+person.lastname+'.'"><i class="fa-solid fa-paper-plane ms-1"></i></button>
                  <button class="btn btn-sm btn-link btn-resend" v-if="accessLevels.accesslevel1 && (person.specific_role == 'labadmin' || person.specific_role == 'labreportadmin')" @click="maskAndRedirect(person.loginid, person.specific_role)" :title="'Mask as '+person.firstname+' '+person.lastname+'.'"><i class="fa-solid fa-masks-theater ms-1"></i></button>
                </td>
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
  <div class="modal fade" id="modal-add-user" tabindex="-1" aria-labelledby="modal-add-user-label" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title fs-5" id="modal-add-user-label">Add a New User</h3>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <form method="post" @submit.prevent="addUser">
          <div class="modal-body">
            <div class="row m-2">
              <div class="col-md-12 mt-1">
                <input type="email" name="useremail" id="useremail" placeholder="email@ucdavis.edu" required>
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
  <div class="modal fade" id="modal-del-user" tabindex="-1" aria-labelledby="modal-del-user-label" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title fs-5" id="modal-add-user-label">Delete User</h3>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click="unsetSelectedRecord()"></button>
        </div>
        <form method="post" @submit.prevent="delUser">
          <div class="modal-body">
            <div class="row m-2">
              <div class="col-md-12 mt-1">
                <span>Are you sure to delete <strong>{{ selectedRecord.firstname }} {{ selectedRecord.lastname }}</strong> from the system?</span>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <input type="hidden" name="del_loginid" id="del_loginid" :value="selectedRecord.loginid" />
            <input type="hidden" name="department" id="department" :value="selectedRecord.department" />
            <button type="button" class="btn btn-primary btn-sm" data-bs-dismiss="modal" @click="unsetSelectedRecord()">Cancel</button>
            <button type="submit" class="btn btn-primary btn-sm">Yes</button>
          </div>
        </form>
      </div>
    </div>
  </div>
  <!-- Modal Edit -->
  <div class="modal fade" id="modal-user" tabindex="-1" aria-labelledby="modal-user-label" aria-hidden="true">
    <div class="modal-dialog modal-xl">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title fs-5" id="modal-user-label">Edit User {{ selectedRecord.firstname }} {{ selectedRecord.lastname }}</h3>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click="unsetSelectedRecord()"></button>
        </div>
        <form method="post" @submit.prevent="updateUser">
          <div class="modal-body">
            <div class="row m-2">
              <div class="col-md-10 text-end">
                <button type="submit" class="btn btn-primary btn-sm" name="refresh-user">Refresh from UC Directory</button>
              </div>
            </div>
            <div class="row m-2">
              <div class="col-md-4 fw-bold text-end">
                First Name
              </div>
              <div class="col-md-6">
                <input type="text" id="userfname" name="userfname" :value="selectedRecord.firstname" @input="updateField('firstname', $event)" disabled>
              </div>
            </div>
            <div class="row m-2">
              <div class="col-md-4 fw-bold text-end">
                Last Name
              </div>
              <div class="col-md-6">
                <input type="text" id="userlname" name="userlname" :value="selectedRecord.lastname" @input="updateField('lastname', $event)" disabled>
              </div>
            </div>
            <div class="row m-2">
              <div class="col-md-4 fw-bold text-end">
                Login ID
              </div>
              <div class="col-md-6">
                <input type="text" id="loginid" name="loginid" :value="selectedRecord.loginid" @input="updateField('loginid', $event)" disabled>
              </div>
            </div>
            <div class="row m-2">
              <div class="col-md-4 fw-bold text-end">
                E-mail
              </div>
              <div class="col-md-6">
                <input type="text" id="email" name="email" :value="selectedRecord.email" @input="updateField('email', $event)" disabled>
              </div>
            </div>
            <div class="row m-2">
              <div class="col-md-4 fw-bold text-end">
                Departments
              </div>
              <div class="col-md-6">
                <select name="department" id="department" v-model="selectedRecord.department">
                  <option>-- select an option --</option>
                  <option v-for="department in departments" :key="department" :value="department">{{ department }}</option>
                </select>
              </div>
            </div>
            <div class="row m-2">
              <div class="col-md-6 offset-md-4">
                <input type="checkbox" id="status_check" name="status_check" :value="selectedRecord.status" v-model="usr_status" />
                <label class="radio-check-label" for="status_check">Enable User</label>
              </div>
            </div>
            <div class="row m-2">
              <div class="col-md-8 offset-md-4">
                <small>Below options only apply to the LabAdmins or LabReportAdmins.</small>
              </div>
            </div>
            <div class="row m-2">
              <div class="col-md-6 offset-md-4">
                <input type="checkbox" id="notification" name="notification" v-model="usr_notification" />
                <label class="radio-check-label" for="notification">E-mail Notification</label>
              </div>
            </div>
            <div class="row m-2">
              <div class="col-md-4 fw-bold text-end">
                E-mail Frequency
              </div>
              <div class="col-md-6">
                <div class="col-md-9">
                  <input type="radio" id="freqmonthly" name="frequency" value="monthly" v-model="selectedRecord.frequency">
                  <label class="radio-check-label" for="freqmonthly">Monthly</label>
                  <input type="radio" id="freqquarterly" name="frequency" value="quarterly" v-model="selectedRecord.frequency">
                  <label class="radio-check-label" for="freqquarterly">Quarterly</label>
                  <input type="radio" id="freqannually" name="frequency" value="annually" v-model="selectedRecord.frequency">
                  <label class="radio-check-label" for="freqannually">Annually</label>
                </div>
              </div>
            </div>
            <div class="row m-2">
              <div class="col-md-4 fw-bold text-end">
                Lab/Group Relation
              </div>
              <div class="col-md-6">
                  <p v-for="group in selectedRecord.adgroupDetails" class="mb-1">
                    <span class="small">{{ group.alias }} <span class="user-data-role secondary-color">({{ roleAnalyser(group.role) }}<span v-if="group.is_pi == 1"> - PI/Supervisor</span>)</span></span>
                  </p>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <input type="hidden" name="fullname" id="fullname" :value="selectedRecord.firstname+' '+selectedRecord.lastname" />
            <button type="button" class="btn btn-primary btn-sm" data-bs-dismiss="modal" @click="unsetSelectedRecord()">Close</button>
            <button type="submit" class="btn btn-primary btn-sm" name="save-user">Save</button>
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

export default {
  mixins: [globalMixin],
  name: 'UserManagement',

  data() {
    return {
      sortKey: 'firstname',
      sortDirection: 'asc'
    }
  },
  created() {
    this.sortKey = 'firstname';
    this.sortDirection = 'asc';
  },

  mounted: function(){
    const url = 'https://web.bftv.ucdavis.edu/reporting/users-get.php'
    this.getDataList(url, 'users')
  },
  methods: {
    dateOlderThan24Hours(lastDate) {
      if (!lastDate) {
        return true;
      }
      const now = new Date();
      const lastUsedDate = new Date(lastDate);
      if (isNaN(lastUsedDate.getTime())) {
        return true;
      }
      const differenceInMs = now - lastUsedDate;
      const differenceInHours = differenceInMs / (1000 * 60 * 60);
      return differenceInHours > 24;
    },
    resendReport(loginid){
      this.loading = true;
      var mode = 'resend_report';
      axios.post('https://web.bftv.ucdavis.edu/reporting/user-resend-report.php', {
        crossDomain: true,
        myid: this.username,
        token: this.token,
        loginid: loginid,
        mode: mode,
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(response => {
        this.screenmsg = response.data.message,
        this.screenmsgtype = "success",
        this.screenmsgicon = this.successicon,
        this.listData = response.data.users
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
    addUser(e) {
      e.preventDefault();
      this.loading = true;
      var modal = bootstrap.Modal.getInstance(document.getElementById('modal-add-user'));
      var usremail = document.getElementById('useremail').value;
      axios.post('https://web.bftv.ucdavis.edu/reporting/user-add.php', {
        crossDomain: true,
        email: usremail,
        myid: this.username,
        token: this.token,
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(response => {
        this.screenmsg = response.data.message,
        this.screenmsgtype = "success",
        this.screenmsgicon = this.successicon,
        this.listData = response.data.users
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
        document.getElementById('useremail').value = '';
        modal.hide();
        this.loading = false;
      });
      window.scrollTo(0, 400);
    },
    updateUser(e) {
      e.preventDefault();
      this.loading = true;
      var modal = bootstrap.Modal.getInstance(document.getElementById('modal-user'));
      var usremail = document.getElementById('email').value;
      var usrdep = document.getElementById('department').value;
      var usrname = document.getElementById('fullname').value;
      var usrnotification = document.getElementById('notification').checked;
      var freq = null;
      if(document.querySelector('input[name="frequency"]:checked')){
        freq = document.querySelector('input[name="frequency"]:checked').value;
      }
      var usrstatus = document.getElementById('status_check').checked;
      var action = '';
      if(usrnotification == true){
        usrnotification = 1;
      } else {
        usrnotification = 0;
      }
      if(usrstatus == true){
        usrstatus = 1;
      } else {
        usrstatus = 0;
      }
      if(e.submitter.name == 'refresh-user'){
        action = 'refresh'
      } else {
        action = 'save'
      }

      axios.post('https://web.bftv.ucdavis.edu/reporting/user-update.php', {
        crossDomain: true,
        email: usremail, department: usrdep, name: usrname, notification: usrnotification, frequency: freq, enabled: usrstatus, mode: action,
        myid: this.username,
        token: this.token,
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(response => {
        this.screenmsg = response.data.message,
        this.screenmsgtype = "success",
        this.screenmsgicon = this.successicon,
        this.listData = response.data.users,
        this.departments = response.data.departments,
        this.adgroups = response.data.adgroups,
        this.adgroups.sort((a, b) => this.sortColumn('adgroup', a, b))
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
    delUser(e) {
      e.preventDefault();
      this.loading = true;
      var modal = bootstrap.Modal.getInstance(document.getElementById('modal-del-user'));
      var deluser = document.getElementById('del_loginid').value;
      var dep = document.getElementById('department').value;
      axios.post('https://web.bftv.ucdavis.edu/reporting/user-delete.php', {
        crossDomain: true,
        deluser: deluser,
        department: dep,
        myid: this.username,
        token: this.token,
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(response => {
        this.screenmsg = response.data.message,
        this.screenmsgtype = "success",
        this.screenmsgicon = this.successicon,
        this.listData = response.data.users,
        this.departments = response.data.departments,
        this.adgroups = response.data.adgroups,
        this.adgroups.sort((a, b) => this.sortColumn('adgroup', a, b))
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
    users() {
      const mappedUsers = this.listData.map(user => {
        const adgroups = typeof user.adgroups === 'string' ? user.adgroups.split(',') : [];
        const adgroups_alias = typeof user.adgroups_alias === 'string' ? user.adgroups_alias.split(',') : [];
        const grpids = typeof user.grpids === 'string' ? user.grpids.split(',').map(Number) : [];
        const roles = typeof user.roles === 'string' ? user.roles.split(',') : [];
        const is_pis = typeof user.is_pi === 'string' ? user.is_pi.split(',').map(Number) : [];

        const adgroupDetails = adgroups.map((adgroup, index) => ({
          adgroup: adgroup ?? null,
          alias: adgroups_alias[index] ?? null,
          grpid: grpids[index] ?? null,
          role: roles[index] ?? null,
          is_pi: is_pis[index] ?? null
        }));

        return {
          id: user.id,
          loginid: user.loginid,
          firstname: user.firstname ?? '',
          lastname: user.lastname ?? '',
          email: user.email ?? '',
          department: user.department ?? '',
          depid: user.depid ?? '',
          notification: user.notification ?? '',
          frequency: user.frequency ?? '',
          status: user.status ?? '',
          last_report_sent: user.last_report_sent ?? '',
          abbr: user.abbr ?? '',
          specific_role: user.specific_role ?? '',
          adgroupDetails
        };
      });

      const filteredUsers = this.filterArray(mappedUsers, [
        'firstname',
        'lastname',
        'loginid',
        'email',
        'department',
        row => this.roleAnalyser(row.specific_role)
      ]);
      return this.sortArray(filteredUsers);
    },
    usr_status: {
      get() {
        return this.selectedRecord && this.selectedRecord.status == '1';
      },
      set(val) {
        if (this.selectedRecord) {
          this.selectedRecord.status = val ? '1' : '0';
        }
      }
    },
    usr_notification: {
      get() {
        return this.selectedRecord && this.selectedRecord.notification == '1';
      },
      set(val) {
        if (this.selectedRecord) {
          this.selectedRecord.notification = val ? '1' : '0';
        }
      }
    }
  },
};
</script>

<style scoped>


</style>
