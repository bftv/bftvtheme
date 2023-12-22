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
              <th @click="sortData('type')" class="sortable">
                Type
                <span v-if="currentSortColumn === 'type'">
                  <span v-if="sortAscending">&#9650;</span>
                  <span v-else>&#9660;</span>
                </span>
              </th>
              <th>Description</th>
              <th @click="sortData('department')" class="sortable">
                Department
                <span v-if="currentSortColumn === 'department'">
                  <span v-if="sortAscending">&#9650;</span>
                  <span v-else>&#9660;</span>
                </span>
              </th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="listData.length > 5">
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>
                <select id="department_search" class="fs-6" v-model="searchDepartment">
                  <option value=""></option>
                  <option v-for="department in departments" :key="department" :value="department">{{ department }}</option>
                </select>
              </td>
              <td>&nbsp;</td>
            </tr>
            <tr v-for="temp in filteredData">
              <td class="text-capitalize">{{ temp.type }}</td>
              <td>{{ temp.description }}</td>
              <td>{{ temp.department }}</td>
              <td><a href="" @click="selectRecord(temp)" data-bs-toggle="modal" data-bs-target="#modal-edit-email" title="Edit e-mail template"><i class="fa-solid fa-pen-to-square"></i></a> <a href="" @click="selectRecord(temp)" data-bs-toggle="modal" data-bs-target="#modal-restore" title="Restore default template"><i class="fa-solid fa-arrow-rotate-right"></i></a></td>
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
    </div>
    <div v-else>
      <div class="alert alert--error">
        <i class="far fa-times-circle fa-2x alert--error-icon"></i> You are not authorized to view this page.
      </div>
    </div>
  </div>

  <!-- Modal Restore -->
  <div class="modal fade" id="modal-restore" tabindex="-1" aria-labelledby="modal-restore-label" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title fs-5" id="modal-restore-label">Restore E-mail Template</h3>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click="unsetSelectedRecord()"></button>
        </div>
        <form method="post" @submit.prevent="restoreEmail">
          <div class="modal-body">
            <div class="row m-2">
              <div class="col-md-12 mt-1">
                <span>Are you sure to restore the <strong>{{ selectedRecord.type }} email template</strong> for <strong>{{ selectedRecord.abbr }}</strong>?</span>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <input type="hidden" name="res_emailid" id="res_emailid" :value="selectedRecord.id" />
            <input type="hidden" name="res_emaildepid" id="res_emaildepid" :value="selectedRecord.depcode" />
            <input type="hidden" name="res_emailtype" id="res_emailtype" :value="selectedRecord.type" />
            <button type="button" class="btn btn-primary btn-sm" data-bs-dismiss="modal" @click="unsetSelectedRecord()">Cancel</button>
            <button type="submit" class="btn btn-primary btn-sm">Yes</button>
          </div>
        </form>
      </div>
    </div>
  </div>
  <!-- Modal Edit -->
  <div  v-if="accessLevels.level1" class="modal fade" id="modal-edit-email" tabindex="-1" aria-labelledby="modal-edit-email-label" aria-hidden="true">
    <div class="modal-dialog modal-xl">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title fs-5" id="modal-edit-email">Update E-mail Template</h3>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click="unsetSelectedRecord()"></button>
        </div>
        <form method="post" @submit.prevent="updateEmail">
          <div class="modal-body">
            <div class="row m-2">
              <div class="col-md-8">
                <div class="row m-2">
                  <div class="col-md-12">
                    <label class="required" for="upd_subject">Subject</label>
                    <input type="text" id="upd_subject" name="upd_subject" :value="selectedRecord.subject" @input="updateField('subject', $event)" required>
                  </div>
                  <div class="col-md-12 mt-2">
                    <label class="required" for="upd_body">Body</label>
                    <textarea type="text" id="upd_body" name="upd_body" rows="20" :value="selectedRecord.body" @input="updateField('body', $event)" required></textarea>
                  </div>
                </div>
              </div>
              <div class="col-md-4">
                <h5>Available Tokens</h5>
                [PI_FULL_NAME]<br/>[PI_INITIAL_LASTNAME]<br/>[PI_LASTNAME_INITIAL]<br/>[PI_DEPARTMENT]<br/>[PI_EMAIL]<br/>[GSR_FULLNAME]<br/>[GSR_FIRSTNAME]<br/>[GSR_LASTNAME]<br/>[GSR_EMAIL]<br/>[WORKSITE]<br/>[GSR_START_DATE]<br/>[GSR_END_DATE]<br/>[PEP_STATUS]<br/>[APPOINTMENT_TYPE]<br/>[FTE_PERCENTAGE]<br/>[STEP]<br/>[ACCOUNT]<br/>[APPOINTMENT_TERM]<br/>[SALARY]<br/>[JOB_DESCRIPTION]<br/>[TRAINING_GRANT]<br/>[GRAD_GROUP]<br/>[ADDITIONAL_FUNDING]<br/>[OFFER_PREVIEW_LINK]<br/>[APPLICATION_LINK]
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <input type="hidden" name="upd_emailid" id="upd_emailid" :value="selectedRecord.id" @input="updateField('id', $event)" />
            <input type="hidden" name="upd_emaildepid" id="upd_emaildepid" :value="selectedRecord.depcode" @input="updateField('depcode', $event)" />
            <button type="button" class="btn btn-primary btn-sm" data-bs-dismiss="modal" @click="unsetSelectedRecord()">Cancel</button>
            <button type="submit" class="btn btn-primary btn-sm">Update</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';;
import { globalMixin } from '../mixins/globalMixin.js';
export default {
  mixins: [globalMixin],
  name: 'EmailManagement',
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
      searchDepartment: ''
    };
  },

  mounted: function(){
    const url = 'https://web.bftv.ucdavis.edu/gsr/email-get.php'
    this.getDataList(url, 'department')
  },
  methods: {
    updateEmail(e) {
      e.preventDefault();
      this.loading = true;
      var modal = bootstrap.Modal.getInstance(document.getElementById('modal-edit-email'));
      var did = document.getElementById('upd_emailid').value;
      var depid = document.getElementById('upd_emaildepid').value;
      var es = document.getElementById('upd_subject').value;
      var eb = document.getElementById('upd_body').value;

      axios.post('https://web.bftv.ucdavis.edu/gsr/email-update.php', {
        crossDomain: true,
        myid: this.username,
        token: this.token,
        id: did, depid: depid, subject: es, body: eb,
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
    restoreEmail(e) {
      e.preventDefault();
      this.loading = true;
      var modal = bootstrap.Modal.getInstance(document.getElementById('modal-restore'));
      var did = document.getElementById('res_emailid').value;
      var depid = document.getElementById('res_emaildepid').value;
      var et = document.getElementById('res_emailtype').value;
      axios.post('https://web.bftv.ucdavis.edu/gsr/email-restore.php', {
        crossDomain: true,
        id: did, depid: depid, type: et,
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
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      let conditions = [];
      if(this.searchDepartment != ''){
        conditions.push(applicant => { return applicant.department == this.searchDepartment; });
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
/* Add component-specific styles here */
</style>
