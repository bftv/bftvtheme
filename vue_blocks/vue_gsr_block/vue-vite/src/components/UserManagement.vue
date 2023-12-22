<template>
  <div class="container-fluid">
    <the-navigation></the-navigation>
    <div v-if="loading" id="loading" class="mt-3">
      <div class="spinner-border text-secondary loader" role="status">
        <span class="sr-only">Loading...</span>
      </div>
    </div>
    <div v-if="accessLevels.level1">
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
      <div class="row mt-3">
        <div class="col-md-12 text-end">
          <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#modal-add-user">+ Add a User</button>
        </div>
      </div>
      <div v-if="!hidebody" class='table-responsive mt-2'>
        <div class="text-end">
          <span style="font-size: 0.75rem;">
            Records Per Page
            <select id="parent_search" class="fs-6 rpp" v-model="pageSize">
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="250">250</option>
              <option value="500">500</option>
            </select>
          </span>
        </div>
        <table class='table table-bordered table-hover table-striped'>
          <thead class='thead-light'>
            <tr>
              <th @click="sortData('firstname')" class="sortable">
                Name
                <span v-if="currentSortColumn === 'firstname'">
                  <span v-if="sortAscending">&#9650;</span>
                  <span v-else>&#9660;</span>
                </span>
              </th>
              <th @click="sortData('department')" class="sortable">
                Department
                <span v-if="currentSortColumn === 'department'">
                  <span v-if="sortAscending">&#9650;</span>
                  <span v-else>&#9660;</span>
                </span>
              </th>
              <th @click="sortData('role')" class="sortable">
                Role
                <span v-if="currentSortColumn === 'role'">
                  <span v-if="sortAscending">&#9650;</span>
                  <span v-else>&#9660;</span>
                </span>
              </th>
              <th @click="sortData('status')" class="sortable">
                Status
                <span v-if="currentSortColumn === 'status'">
                  <span v-if="sortAscending">&#9650;</span>
                  <span v-else>&#9660;</span>
                </span>
              </th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="listData.length > 5">
              <td><input type="text" id="user_name_search" class="fs-6" v-model="searchTextUser"></td>
              <td>
                <select id="department_search" class="fs-6" v-model="searchDepartment">
                  <option value=""></option>
                  <option v-for="department in departments" :key="department" :value="department">{{ department }}</option>
                </select>
              </td>
              <td>
                <select id="role_search" class="fs-6" v-model="searchRole">
                  <option value=""></option>
                  <option v-if="accessLevels.level2" value="superadmin">SuperAdmin</option>
                  <option value="orgadmin">OrgAdmin</option>
                  <option value="editor">Editor</option>
                  <option value="viewer">Viewer</option>
                  <option value="submitter">Submitter</option>
                </select>
              </td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
            </tr>
            <tr v-for="person in filteredData">
              <td>{{ person.firstname }} {{ person.lastname }}</td>
              <td>{{ person.department }}</td>
              <td class="text-capitalize">{{ person.role }}</td>
              <td><span title="It shows user status." v-html="person.status == 1 ? '<i class=\'fa-solid fa-check color-green\'></i>' : '<i class=\'fa-solid fa-x color-red\'></i>'"></span></td>
              <td><a v-if="accessLevels.level1" href="" @click="selectRecord(person)" data-bs-toggle="modal" data-bs-target="#modal-user" title="Edit user"><i class="fa-solid fa-pen-to-square"></i></a> <a v-if="accessLevels.level1" href="" @click="selectRecord(person)" data-bs-toggle="modal" data-bs-target="#modal-del-user" title="Delete user"><i class="fa-solid fa-circle-xmark"></i></a></td>
            </tr>
          </tbody>
        </table>
        <nav v-if="fullLength > pageSize" aria-label="Page navigation">
          <ul class="pagination pagination-sm justify-content-center">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <button class="page-link" @click="firstPage" :disabled="currentPage === 1"><i class="fa-solid fa-angles-left"></i></button>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <button class="page-link" @click="prevPage" :disabled="currentPage === 1"><i class="fa-solid fa-angle-left"></i></button>
            </li>
            <li class="page-item" v-for="n in totalPages" :key="n" :class="{ active: currentPage === n }">
              <button class="page-link" @click="goToPage(n)">{{ n }}</button>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
              <button class="page-link" @click="nextPage" :disabled="currentPage === totalPages"><i class="fa-solid fa-angle-right"></i></button>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
              <button class="page-link" @click="lastPage" :disabled="currentPage === totalPages"><i class="fa-solid fa-angles-right"></i></button>
            </li>
          </ul>
        </nav>
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
                  <div class="col-md-12 mt-1">
                    <select name="userrole" id="userrole" v-model="selectedRole" required>
                      <option value="">-- select a role --</option>
                      <option v-if="accessLevels.level2" value="superadmin">SuperAdmin</option>
                      <option value="orgadmin">OrgAdmin</option>
                      <option value="editor">Editor</option>
                      <option value="viewer">Viewer</option>
                      <option value="submitter">Submitter</option>
                    </select>
                  </div>
                </div>
                <div class="row m-2">
                  <div class="col-md-12 fw-bold" :class="{'required': selectedRole === 'editor'}">
                      Team
                  </div>
                  <div class="col-md-12">
                    <input type="radio" id="userteam_am" name="userteam" value="am" :required="selectedRole === 'editor'">
                    <label class="radio-check-label" for="userteam_am">Account Management</label>
                    <input type="radio" id="userteam_adv" name="userteam" value="adv" :required="selectedRole === 'editor'">
                    <label class="radio-check-label" for="userteam_adv">Advising</label>
                    <div><small>Team is only required if the role is set to Editor.</small></div>
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
                <input type="hidden" name="email" id="email" :value="selectedRecord.email" />
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
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
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
                    <input type="text" name="userfname" id="userfname" :value="selectedRecord.firstname" disabled>
                  </div>
                </div>
                <div class="row m-2">
                  <div class="col-md-4 fw-bold text-end">
                    Last Name
                  </div>
                  <div class="col-md-6">
                    <input type="text" name="userlname" id="userlname" :value="selectedRecord.lastname" disabled>
                  </div>
                </div>
                <div class="row m-2">
                  <div class="col-md-4 fw-bold text-end">
                    Custom First Name
                  </div>
                  <div class="col-md-6">
                    <input type="text" name="usercfname" id="usercfname" :value="selectedRecord.cfname">
                  </div>
                </div>
                <div class="row m-2">
                  <div class="col-md-4 fw-bold text-end">
                    Custom Last Name
                  </div>
                  <div class="col-md-6">
                    <input type="text" name="userclname" id="userclname" :value="selectedRecord.clname">
                  </div>
                </div>
                <div class="row m-2">
                  <div class="col-md-4 fw-bold text-end">
                    Login ID
                  </div>
                  <div class="col-md-6">
                    <input type="text" name="loginid" id="loginid" :value="selectedRecord.loginid" disabled>
                  </div>
                </div>
                <div class="row m-2">
                  <div class="col-md-4 fw-bold text-end">
                    E-mail
                  </div>
                  <div class="col-md-6">
                    <input type="text" name="email" id="email" :value="selectedRecord.email" disabled>
                  </div>
                </div>
                <div class="row m-2">
                  <div class="col-md-4 fw-bold text-end">
                    Work Phone
                  </div>
                  <div class="col-md-6">
                    <input type="tel" name="phone" id="phone" pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}" placeholder="000-000-0000" :value="selectedRecord.phone">
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
                  <div class="col-md-4 fw-bold text-end">
                      Role
                  </div>
                  <div class="col-md-6">
                    <select name="role" id="role" v-model="selectedRecord.role">
                      <option>-- select an option --</option>
                      <option v-if="accessLevels.level2" value="superadmin">SuperAdmin</option>
                      <option value="orgadmin">OrgAdmin</option>
                      <option value="editor">Editor</option>
                      <option value="viewer">Viewer</option>
                      <option value="submitter">Submitter</option>
                    </select>
                  </div>
                </div>
                <div class="row m-2">
                  <div class="col-md-4 fw-bold text-end" :class="{'required': selectedRecord.role === 'editor'}">
                      Team
                  </div>
                  <div class="col-md-6">
                    <input type="radio" id="team_am" name="team" value="am" v-model="selectedRecord.team" :required="selectedRecord.role === 'editor'">
                    <label class="radio-check-label" for="team_am">Account Management</label>
                    <input type="radio" id="team_adv" name="team" value="adv" v-model="selectedRecord.team" :required="selectedRecord.role === 'editor'">
                    <label class="radio-check-label" for="team_adv">Advising</label>
                    <div><small>Team is only required if the role is set to Editor.</small></div>
                  </div>
                </div>
                <div class="row m-2">
                  <div class="col-md-4 fw-bold text-end">
                      Data Source
                  </div>
                  <div class="col-md-6">
                    <textarea id="data_source" name="data_source" rows="4" :value="selectedRecord.data_source" @input="updateField('data_source', $event)"></textarea>
                    <div><small>Default source is the user's loginid. But you can add other PI email addresses here separated by '; ' to show the user the relevant applications.</small></div>
                  </div>
                </div>
                <div class="row m-2">
                  <div class="col-md-6 offset-md-4">
                    <input type="checkbox" id="status_check" name="status_check" :value="selectedRecord.status" :checked="selectedRecord.status == '1'" />
                    <label class="radio-check-label" for="status_check">Enable User</label>
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                <input type="hidden" name="fullname" id="fullname" :value="selectedRecord.firstname+' '+selectedRecord.lastname" />
                <button type="button" class="btn btn-primary btn-sm" data-bs-dismiss="modal">Close</button>
                <button type="submit" class="btn btn-primary btn-sm" name="save-user">Save</button>
              </div>
            </form>
          </div>
        </div>
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
  import axios from 'axios';
  import { globalMixin } from '../mixins/globalMixin.js';
  export default {
    mixins: [globalMixin],
    name: 'UserManagement',
    watch: {
      pageSize(newSize) {console.log(newSize);
        newSize = parseInt(newSize);
        if (newSize > 0) {
          this.totalPages = Math.ceil(this.fullLength / newSize);
          this.currentPage = 1; // Reset to first page
        }
      }
    },

    data() {
      return {
        selectedRole: '',
        searchTextUser: '',
        searchDepartment: '',
        searchRole: ''
      };
    },

    mounted: function(){
      var url = 'https://web.bftv.ucdavis.edu/gsr/users-get.php';
      this.getDataList(url, 'users')
    },
    methods: {
      addUser(e) {
        e.preventDefault();
        this.loading = true;
        var modal = bootstrap.Modal.getInstance(document.getElementById('modal-add-user'));
        var usremail = document.getElementById('useremail').value;
        var usrrole = document.getElementById('userrole').value;
        var team = '';
        if(document.querySelector('input[name="userteam"]:checked')){
          team = document.querySelector('input[name="userteam"]:checked').value;
        }
        axios.post('https://web.bftv.ucdavis.edu/gsr/user-add.php', {
          crossDomain: true,
          email: usremail, role: usrrole, team: team,
          myid: this.username,
          token: this.token,
          headers: {
            'Content-Type': 'application/json'
          }
        }).then(response => {console.log(response);
          this.screenmsg = response.data.message,
          this.screenmsgtype = "success",
          this.screenmsgicon = this.successicon,
          this.listData = response.data.users,
          this.listData.sort(this.sortFname)
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
          document.getElementById('useremail').value = '';
          document.querySelector('input[name="userteam"]').checked = false;
          this.selectedRole = '';
          modal.hide();
          this.loading = false;
        });
        window.scrollTo(0, 400);
      },
      updateUser(e) {
        e.preventDefault();
        this.loading = true;
        var modal = bootstrap.Modal.getInstance(document.getElementById('modal-user'));
        var usrcfname = document.getElementById('usercfname').value;
        var usrclname = document.getElementById('userclname').value;
        var usrrole = document.getElementById('role').value;
        var usremail = document.getElementById('email').value;
        var usrphone = document.getElementById('phone').value;
        var usrdep = document.getElementById('department').value;
        var usrstatus = document.getElementById('status_check').checked;
        var usrname = document.getElementById('fullname').value;
        var usrsrc = document.getElementById('data_source').value;
        var team = '';
        var action = '';
        if(document.querySelector('input[name="team"]:checked')){
          team = document.querySelector('input[name="team"]:checked').value;
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
        axios.post('https://web.bftv.ucdavis.edu/gsr/user-update.php', {
          crossDomain: true,
          cfname: usrcfname, clname: usrclname, role: usrrole, team: team, email: usremail, phone: usrphone, enabled: usrstatus, name: usrname, department: usrdep, datasource: usrsrc,
          myid: this.username,
          token: this.token,
          mode: action,
          headers: {
            'Content-Type': 'application/json'
          }
        }).then(response => {
          this.screenmsg = response.data.message,
          this.screenmsgtype = "success",
          this.screenmsgicon = this.successicon,
          this.listData = response.data.users,
          this.listData.sort(this.sortFname)
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
          this.code = error.response.data.status
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
        var usremail = document.getElementById('email').value;
        var dep = document.getElementById('department').value;
        axios.post('https://web.bftv.ucdavis.edu/gsr/user-delete.php', {
          crossDomain: true,
          email: usremail,
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
          this.listData.sort(this.sortFname)
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
        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        let conditions = [];
        if (this.searchTextUser.length >= 3) {
          conditions.push(applicant => this.matchesSearch(applicant.firstname, this.searchTextUser) || this.matchesSearch(applicant.lastname, this.searchTextUser));
        }
        if(this.searchDepartment != ''){
          conditions.push(applicant => { return applicant.department == this.searchDepartment; });
        }
        if(this.searchRole != ''){
          conditions.push(applicant => this.matchesSearch(applicant.role, this.searchRole));
        }
        if (conditions.length === 0) {
          return this.listData.slice(start, end);
        }
        return this.listData.filter(applicant => conditions.every(condition => condition(applicant))).slice(start, end);
      }
    }
  };
</script>

<style scoped>


</style>