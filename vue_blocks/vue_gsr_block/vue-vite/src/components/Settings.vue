<template>
  <div class="container-fluid">
    <the-navigation></the-navigation>
    <div v-if="loading" id="loading" class="mt-3">
      <div class="spinner-border text-secondary loader" role="status">
        <span class="sr-only">Loading...</span>
      </div>
    </div>
    <div v-if="accessLevels.level2">
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
      <div v-if="!hidebody" class="row">
        <div class="col-md-6">
          <fieldset  class="form-group">
            <legend>Global Settings</legend>
            <div class="text-center"><small>Only the <strong>developer</strong> can change the URL and the GSR Form Link.</small></div>
            <form method="post" @submit.prevent="updateSettings">
              <div class="row m-2">
                <div class="col-md-4 fw-bold text-end required">
                  Base URL <span class="fs-6">(Back-End)</span>
                </div>
                <div v-if="curlDev == 1" class="col-md-6">
                  <input type="text" id="baseurl" name="baseurl" :value="listData.base_url" required>
                </div>
                <div v-else class="col-md-6">
                  <span>{{ listData.base_url }}</span>
                </div>
              </div>
              <div class="row m-2">
                <div class="col-md-4 fw-bold text-end required">
                  GSR Portal <span class="fs-6">(Front-End)</span>
                </div>
                <div v-if="curlDev == 1" class="col-md-6">
                  <input type="text" id="gsrmgmt" name="gsrmgmt" :value="listData.gsr_mgmt_link" required>
                </div>
                <div v-else class="col-md-6">
                  <span>{{ listData.gsr_mgmt_link }}</span>
                </div>
              </div>
              <div class="row m-2">
                <div class="col-md-4 fw-bold text-end required">
                  GSR Form
                </div>
                <div v-if="curlDev == 1" class="col-md-6">
                  <input type="text" id="gsrform" name="gsrform" :value="listData.gsr_form_link" required>
                </div>
                <div v-else class="col-md-6">
                  <span>{{ listData.gsr_form_link }}</span>
                </div>
              </div>
              <div class="row m-2">
                <div class="col-md-4 fw-bold text-end required">
                  Generic E-mail
                </div>
                <div class="col-md-6">
                  <input type="email" id="genericemail" name="genericemail" :value="listData.generic_email" required>
                </div>
              </div>
              <div class="row m-2 text-end">
                <div class="col-md-10">
                  <input type="hidden" name="settingid" id="settingid" :value="listData.id" />
                  <button type="submit" class="btn btn-primary btn-sm">Update</button>
                </div>
              </div>
            </form>
          </fieldset>
        </div>
        <div class="col-md-6">
          <fieldset  class="form-group">
            <legend>Global Email Templates</legend>
            <div v-if="!hidebody" class='table-responsive mt-2'>
              <table class='table table-bordered table-hover table-striped'>
                <thead class='thead-light'>
                  <th>Type</th>
                  <th>Description</th>
                  <th></th>
                </thead>
                <tbody>
                  <tr v-for="temp in defaultEmails">
                    <td class="text-capitalize">{{ temp.type }}</td>
                    <td>{{ temp.description }}</td>
                    <td><a href="" @click="selectRecord(temp)" data-bs-toggle="modal" data-bs-target="#modal-edit-email" title="Edit e-mail template"><i class="fa-solid fa-pen-to-square"></i></a></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </fieldset>
        </div>
      </div>
    </div>
    <div v-else>
      <div class="alert alert--error">
        <i class="far fa-times-circle fa-2x alert--error-icon"></i> You are not authorized to view this page.
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
  import axios from 'axios';
  import { globalMixin } from '../mixins/globalMixin.js';
  export default {
    mixins: [globalMixin],
    name: 'Settings',

    mounted: function(){
      const url = 'https://web.bftv.ucdavis.edu/gsr/settings-get.php'
      this.getDataList(url, 'settings')
    },
    methods: {
      updateSettings(e) {
        e.preventDefault();
        this.loading = true;
        var burl = '';
        var gurl = '';
        var gfrm = '';
        if(document.getElementById('baseurl')){
          burl = document.getElementById('baseurl').value;
        }
        if(document.getElementById('gsrmgmt')){
          gurl = document.getElementById('gsrmgmt').value;
        }
        if(document.getElementById('gsrform')){
          gfrm = document.getElementById('gsrform').value;console.log(gfrm);
        }
        var gemail = document.getElementById('genericemail').value;
        var sid = document.getElementById('settingid').value;
        axios.post('https://web.bftv.ucdavis.edu/gsr/settings-update.php', {
          crossDomain: true,
          myid: this.username,
          token: this.token,
          id: sid, baseurl: burl, gsrurl: gurl, gsrform: gfrm, genericemail: gemail,
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
          this.loading = false;
        });
        window.scrollTo(0, 400);
      },
      updateEmail(e) {
        e.preventDefault();
        this.loading = true;
        var modal = bootstrap.Modal.getInstance(document.getElementById('modal-edit-email'));
        var did = document.getElementById('upd_emailid').value;
        var depid = null;
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
          this.defaultEmails = response.data.dataList
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
      }
    }
  };
</script>

<style scoped>


</style>