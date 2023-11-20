<template>
  <div class="container-fluid">
    <div v-if="loading" id="loading" class="mt-3">
      <div class="spinner-border text-secondary loader" role="status">
        <span class="sr-only">Loading...</span>
      </div>
    </div>
    <div v-if="accesslevel0">
      <div v-if="screenmsg" class="mt-5">
        <div :class="'alert alert--'+screenmsgtype">
          <i :class="screenmsgicon"></i> {{ screenmsg }} <span v-if="screenmsgtype == 'error'"> Please contact one of the SuperAdmins through the Slack channel.</span>
        </div>
      </div>
      <div v-if="!hidebody" class="accordion accordion-flush mt-4 deptaccordion" id="deptAccordion">
        <div v-for="department in listData" class="accordion-item">
          <h2 class="accordion-header">
            <button class="accordion-button" type="button" data-bs-toggle="collapse" :data-bs-target="'#collapse-'+department.depid" aria-expanded="true" :aria-controls="'collapse-'+department.depid">
              {{ department.department }}
            </button>
          </h2>
          <div :id="'collapse-'+department.depid" class="accordion-collapse collapse show" data-bs-parent="#deptAccordion">
            <div class="accordion-body">
              <div v-if="department.adgroups" class="row">
                <div v-for="adgroup in department.adgroups" :class="['table-responsive', 'mt-2', getAdgroupClass(department.adgroups.length)]">
                  <table class='table table-bordered table-hover table-striped'>
                    <thead class='thead-light'>
                      <tr>
                        <th colspan="4">{{ this.viewmode && adgroup.alias ? adgroup.alias : adgroup.adgroup }} <small>({{ adgroup.members.length }} members)</small></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="member in adgroup.members">
                        <td><a :href="'mailto:'+member.mail">{{ member.displayName }}</a> <span v-if="!viewmode">({{ member.samAccountName }})</span></td>
                        <td v-if="accesslevel0"><a href="" @click="selectRecord(member)" data-bs-toggle="modal" data-bs-target="#modal-del-mem" title="Delete member"><i class="fa-solid fa-circle-xmark"></i></a></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div v-else>
                There is no <strong>ADGroup</strong> associated with your account or your department.
              </div>
            </div>
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
            <input type="hidden" name="email" id="email" :value="selectedRecord.email" />
            <input type="hidden" name="department" id="department" :value="selectedRecord.department" />
            <button type="button" class="btn btn-primary btn-sm" data-bs-dismiss="modal" @click="unsetSelectedRecord()">Cancel</button>
            <button type="submit" class="btn btn-primary btn-sm">Yes</button>
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
  name: 'ADGroupMembers',

  mounted: function(){
    const url = 'https://web.bftv.ucdavis.edu/reporting/adgroup-members-get.php'
    this.getDataList(url, 'data')
  },
  methods: {
    getAdgroupClass(length) {
      if (length > 2) {
        return 'col-md-4';
      } else if (length === 2) {
        return 'col-md-6';
      } else {
        return 'col-md-12';
      }
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
    delUser(e) {
      e.preventDefault();
      this.loading = true;
      var modal = bootstrap.Modal.getInstance(document.getElementById('modal-del-user'));
      var usremail = document.getElementById('email').value;
      var dep = document.getElementById('department').value;
      axios.post('https://web.bftv.ucdavis.edu/reporting/user-delete.php', {
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
};
</script>

<style scoped>


</style>
