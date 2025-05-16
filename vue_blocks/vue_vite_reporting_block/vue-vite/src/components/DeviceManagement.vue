<template>
  <div class="container-fluid">
    <div v-if="loading" id="loading" class="mt-3">
      <div class="spinner-border text-secondary loader" role="status">
        <span class="sr-only">Loading...</span>
      </div>
    </div>
    <div v-if="accessLevels.accesslevel0">
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
                        <th>{{ adgroup.alias }}<small>&nbsp;({{ adgroup.members.length }} {{ adgroup.members.length > 1 ? 'members' : 'member' }})</small><span v-if="!this.viewmode">&nbsp;<i class="fa-solid fa-circle-info info-icon" :title="adgroup.adgroup"></i></span></th>
                        <th v-for="attributes in adgroup.attributes" style="text-align: center;">{{ attributes.dp }}<span v-if="!this.viewmode">&nbsp;<i class="fa-solid fa-circle-info info-icon" :title="attributes.adgroup"></i></span></th>
                        <th v-if="accessLevels.accesslevel1 && !maskeduser"></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="member in adgroup.members">
                        <td><a :href="'mailto:'+member.mail">{{ member.displayName }}</a><span v-if="!viewmode"> ({{ member.samAccountName }})</span><span v-if="member.itguideline && member.itguideline.signed === true">&nbsp;<i class="fa-solid fa-file-signature td-green" :title="'Signed the (' + member.itguideline.title + ') on ' + member.itguideline.date"></i></span></td>
                        <td v-for="attributes in adgroup.attributes" style="text-align: center;"><span v-if="member[attributes.adgroup] === true"><i class="fa-solid fa-circle td-green"></i></span></td>
                        <td v-if="accessLevels.accesslevel1  && !maskeduser"><a href="" @click="selectRecord(member)" data-bs-toggle="modal" data-bs-target="#modal-del-mem" title="Delete member"><i class="fa-solid fa-circle-xmark"></i></a></td>
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
</template>

<script>
import { globalMixin } from '../mixins/globalMixin.js';
import axios from 'axios';
export default {
  mixins: [globalMixin],
  name: 'DeviceManagement',

  mounted: function(){
    const url = 'https://web.bftv.ucdavis.edu/reporting/adgroup-members-get.php'
    this.getDataList(url, 'data')
  },
  methods: {
    getAdgroupClass(length) {
      //if (length > 2) {
      //  return 'col-md-4';
      //} else if (length === 2) {
      //  return 'col-md-6';
      //} else {
        return 'col-md-12';
      //}
    },
  },
};
</script>

<style scoped>


</style>
