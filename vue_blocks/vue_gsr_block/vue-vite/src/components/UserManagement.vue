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
      <div class="row mt-3">
        <div class="col-md-12 text-end">
          <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#modal-add-user">+ Add a User</button>
        </div>
      </div>
      <div v-if="!hidebody" class='table-responsive mt-2'>
        <table class='table table-bordered table-hover table-striped'>
          <thead class='thead-light'>
            <tr>
              <th>Name</th>
              <th>Department</th>
              <th>Role</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="person in listData">
              <td>{{ person.firstname }} {{ person.lastname }}</td>
              <td>{{ person.department }}</td>
              <td class="text-capitalize">{{ person.role }}</td>
              <td><span title="It shows user status." v-html="person.status == 1 ? '<i class=\'fa-solid fa-check color-green\'></i>' : '<i class=\'fa-solid fa-x color-red\'></i>'"></span></td>
              <td><a v-if="accesslevel1" href="" @click="selectRecord(person)" data-bs-toggle="modal" data-bs-target="#modal-user" title="Edit user"><i class="fa-solid fa-pen-to-square"></i></a> <a v-if="accesslevel1" href="" @click="selectRecord(person)" data-bs-toggle="modal" data-bs-target="#modal-del-user" title="Delete user"><i class="fa-solid fa-circle-xmark"></i></a></td>
            </tr>
          </tbody>
        </table>
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
                    <select name="userrole" id="userrole" required>
                      <option>-- select a role --</option>
                      <option v-if="accesslevel2" value="superadmin">SuperAdmin</option>
                      <option value="orgadmin">OrgAdmin</option>
                      <option value="editor">Editor</option>
                      <option value="viewer">Viewer</option>
                      <option value="submitter">Submitter</option>
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
                      <option v-if="accesslevel2" value="superadmin">SuperAdmin</option>
                      <option value="orgadmin">OrgAdmin</option>
                      <option value="editor">Editor</option>
                      <option value="viewer">Viewer</option>
                      <option value="submitter">Submitter</option>
                    </select>
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
  import { navmixin } from '../mixins/navMixin.js';
  import { globalMixin } from '../mixins/globalMixin.js';
  export default {
    mixins: [navmixin, globalMixin],
    name: 'UserManagement',

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
        axios.post('https://web.bftv.ucdavis.edu/gsr/user-add.php', {
          crossDomain: true,
          email: usremail, role: usrrole,
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
        var usrcfname = document.getElementById('usercfname').value;
        var usrclname = document.getElementById('userclname').value;
        var usrrole = document.getElementById('role').value;
        var usremail = document.getElementById('email').value;
        var usrdep = document.getElementById('department').value;
        var usrstatus = document.getElementById('status_check').checked;
        var usrname = document.getElementById('fullname').value;
        var action = '';
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
          cfname: usrcfname, clname: usrclname, role: usrrole, email: usremail, enabled: usrstatus, name: usrname, department: usrdep,
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
    }
  };
</script>

<style scoped>


</style>