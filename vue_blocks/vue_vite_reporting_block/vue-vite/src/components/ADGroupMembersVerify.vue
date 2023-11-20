<template>
  <div class="container-fluid">
    <div v-if="loading" id="loading" class="mt-3">
      <div class="spinner-border text-secondary loader" role="status">
        <span class="sr-only">Loading...</span>
      </div>
    </div>
    <div v-if="accesslevel1">
      <div class="alert alert--error">
        <i class="far fa-times-circle fa-2x alert--error-icon"></i> This page can only viewed by a LabAdmin.
      </div>
    </div>
    <div v-else-if="accesslevel0">
      <div v-if="screenmsg" class="mt-5">
        <div :class="'alert alert--'+screenmsgtype">
          <i :class="screenmsgicon"></i> {{ screenmsg }} <span v-if="screenmsgtype == 'error'"> Please contact one of the SuperAdmins through the Slack channel.</span>
        </div>
      </div>
      <div v-if="!hidebody" class="mt-4">
        <form method="post" @submit.prevent="verify">
          <div v-for="row in listData">
            <div v-for="adgroup in row.adgroups" class="table-responsive mt-2 col-md-12">
              <table class='table table-bordered table-hover table-striped' style="width: 99%;">
                <thead class='thead-light'>
                  <tr>
                    <th colspan="2">{{ adgroup.alias ? adgroup.alias : adgroup.adgroup }} <small>({{ adgroup.members.length }} members)</small></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="member in adgroup.members">
                    <td><a :href="'mailto:'+member.mail">{{ member.displayName }}</a> <span v-if="!viewmode">({{ member.samAccountName }})</span></td>
                    <td>
                      <input type="radio" :id="`k-${adgroup.adgroup}-${member.objectGuid}`" :value="`k-${adgroup.adgroup}=${member.samAccountName}`" :name="`${adgroup.adgroup}-${member.objectGuid}`" checked>
                      <label class="radio-check-label" :for="`k-${adgroup.adgroup}-${member.objectGuid}`">Keep</label>
                      <input type="radio" :id="`r-${adgroup.adgroup}-${member.objectGuid}`" :value="`r-${adgroup.adgroup}=${member.samAccountName}`" :name="`${adgroup.adgroup}-${member.objectGuid}`">
                      <label class="radio-check-label" :for="`r-${adgroup.adgroup}-${member.objectGuid}`">Remove</label>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="text-center">
              <button type="submit" class="btn btn-primary btn-lg">Submit</button>
            </div>
          </div>
        </form>
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
  name: 'ADGroupMembersVerify',

  mounted: function(){
    const url = 'https://web.bftv.ucdavis.edu/reporting/adgroup-members-get.php'
    this.getDataList(url, 'data')
  },
  methods: {
    transformArray(initialArray) {
      const keep = {};
      initialArray.forEach(item => {
        const [fullKey, name] = item.split('=');
        const key = fullKey.substring(2); // Remove 'k-' and 'r-' prefix
        if (!keep[key]) {
          keep[key] = [];
        }
        keep[key].push(name);
      });
      return keep;
    },
    verify(e) {
      e.preventDefault();
      this.loading = true;
      const keepRadios = document.querySelectorAll('input[type="radio"][id^="k-"]:checked');
      var keep = Array.from(keepRadios).map(radio => radio.value);
      keep = this.transformArray(keep);
      const removeRadios = document.querySelectorAll('input[type="radio"][id^="r-"]:checked');
      var remove = Array.from(removeRadios).map(radio => radio.value);
      remove = this.transformArray(remove);
      axios.post('https://web.bftv.ucdavis.edu/reporting/reminder-verify.php', {
        crossDomain: true,
        myid: this.username,
        token: this.token,
        keepList: keep, removeList: remove,
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(response => {console.log(response);
        this.screenmsg = response.data.message,
        this.screenmsgtype = "success",
        this.screenmsgicon = this.successicon
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
        this.loading = false;
      });
      window.scrollTo(0, 400);
    },
  },
};
</script>

<style scoped>


</style>
