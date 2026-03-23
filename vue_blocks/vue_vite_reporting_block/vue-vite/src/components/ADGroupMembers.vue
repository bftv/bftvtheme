<template>
  <div class="container-fluid">
    <div v-if="loading" id="loading" class="mt-3">
      <div class="spinner-border text-secondary loader" role="status">
        <span class="sr-only">Loading...</span>
      </div>
    </div>
    <div v-if="accessLevels.accesslevel0r">
      <div v-if="screenmsg" class="mt-5">
        <div :class="'alert alert--'+screenmsgtype">
          <i :class="screenmsgicon"></i> {{ screenmsg }} <span v-if="screenmsgtype == 'error'"> Please contact one of the SuperAdmins through the Slack channel.</span>
        </div>
      </div>
      <div v-if="getActiveFilterSummaries().length" class="filter-summary alert alert-info">
        <div class="d-flex justify-content-between align-items-start">
          <div>
            <div v-for="row in getActiveFilterSummaries()" :key="row.depid" class="mb-1">
              <strong>{{ row.departmentName }}</strong>: There {{ row.count === 1 ? 'is' : 'are' }} {{ row.count }} {{ row.count === 1 ? 'user' : 'users' }} with <strong>{{ row.attributeDp }}</strong> license.
            </div>
          </div>
          <a href="#" class="ms-3" @click.prevent="clearAllDeptFilters()">Clear filters</a>
        </div>
      </div>
      <div v-if="!hidebody && !loading" class="d-flex align-items-center gap-2 mt-4">
        <div class="filter-input-wrapper">
          <input type="text" name="filtertxt" id="filtertxt" v-model.trim="filtertxt" @keydown.esc="clearFilter" class="form-control filter-input" style="border-radius: 10px !important; height: 2em !important; font-size: 0.8rem" placeholder="Filter users">
          <span v-if="filtertxt" class="filter-clear" @click="clearFilter"><i class="fa-solid fa-xmark"></i></span>
        </div>
      </div>
      <div v-if="!hidebody" class="accordion accordion-flush mt-1 deptaccordion" id="deptAccordion">
        <div v-for="department in listData" class="accordion-item">
          <h2 class="accordion-header">
            <button class="accordion-button" type="button" data-bs-toggle="collapse" :data-bs-target="'#collapse-'+department.depid" aria-expanded="true" :aria-controls="'collapse-'+department.depid">
              {{ department.department }}
            </button>
          </h2>
          <div :id="'collapse-'+department.depid" class="accordion-collapse collapse show" data-bs-parent="#deptAccordion">
            <div class="accordion-body">
              <div v-if="department.adgroups" class="row">
                <template v-for="adgroup in department.adgroups">
                  <div v-if="hasVisibleMembers(department, adgroup) && getMembersForFilteredDisplay(department, adgroup).length > 0" :class="['table-responsive', 'mt-2', getAdgroupClass(department.adgroups.length)]">
                    <table class='table table-bordered table-hover table-striped'>
                      <thead class='thead-light'>
                        <tr>
                          <th>{{ adgroup.alias }}<small>&nbsp;({{ getMembersForFilteredDisplay(department, adgroup).length }} {{ getMembersForFilteredDisplay(department, adgroup).length > 1 ? 'members' : 'member' }})</small><span v-if="!this.viewmode">&nbsp;<i class="fa-solid fa-circle-info info-icon" :title="adgroup.adgroup"></i></span></th>
                          <th v-for="attributes in adgroup.attributes" class="attr-header">{{ attributes.dp }}<span v-if="!this.viewmode">&nbsp;<i class="fa-solid fa-circle-info info-icon" :title="attributes.adgroup"></i></span><a href="#" class="filter-link" :class="{ activated: isDeptAttrActive(department, attributes.adgroup) }" @click.prevent="toggleDeptAttrFilter(department, attributes.adgroup)" :title="isDeptAttrActive(department, attributes.adgroup) ? 'Clear filter (show all)' : `Filter department by: ${attributes.adgroup}`"><i  class="fa-solid" :class="isDeptAttrActive(department, attributes.adgroup) ? 'fa-filter-circle-xmark' : 'fa-filter'"></i></a></th>
                          <!--<th v-if="accessLevels.accesslevel1"></th>-->
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="member in getMembersForFilteredDisplay(department, adgroup)" :key="member.objectGuid || member.samAccountName">
                          <td><a :href="'mailto:'+member.mail">{{ member.displayName }}</a><span v-if="!viewmode"> ({{ member.samAccountName }})</span><span v-if="member.source !='Direct Member' && accessLevels.accesslevel1">&nbsp;<i class="fa-solid fa-circle-info info-icon" :title="'Source: '+member.source"></i></span>
                            <span v-if="member.peaksdocinfo && member.peaksdocinfo.length > 0"><span v-for="docs in member.peaksdocinfo.slice(0, 3)"><span v-if="docs.signed === true && docs.visibility === true" class="ms-1"><i :class=docs.icon :title="'Signed the (' + docs.title + ') on ' + docs.date" :style="'color: '+docs.color"></i></span></span></span>
                            <span v-if="member.iam_status == false">&nbsp;<i class="fa-solid fa-user-xmark td-red" title="IAM record not found. The user has either not been fully entered into the system, is separating, or has separated form the University."></i></span></td>
                          <td v-for="attr in adgroup.attributes" style="text-align: center;"><span v-if="member[attr.adgroup] === true"><i class="fa-solid fa-circle td-green"></i></span></td>
                          <!--<td v-if="accessLevels.accesslevel1"><a href="" @click="selectRecord(member)" data-bs-toggle="modal" data-bs-target="#modal-del-mem" title="Delete member"><i class="fa-solid fa-circle-xmark"></i></a></td>-->
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </template>
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
  name: 'ADGroupMembers',
  data: function() {
    return {
      deptAttrFilter: {},
    }
  },

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
    toggleDeptAttrFilter(department, attributeKey) {
      const depid = department.depid;
      this.deptAttrFilter[depid] = this.deptAttrFilter[depid] === attributeKey ? null : attributeKey;
    },
    getMembersForDisplay(department, adgroup) {
      const attrKey = this.deptAttrFilter[department.depid];
      if (!attrKey) return adgroup.members;
      return (adgroup.members || []).filter(m => m && m[attrKey] === true);
    },
    hasVisibleMembers(department, adgroup) {
      return this.getMembersForDisplay(department, adgroup).length > 0;
    },
    isDeptAttrActive(department, attributeKey) {
      return this.deptAttrFilter[department.depid] === attributeKey;
    },
    getAttrDpLabel(department, attributeKey) {
      if (!department?.adgroups?.length) return attributeKey;
      for (const g of department.adgroups) {
        if (!g?.attributes?.length) continue;
        const found = g.attributes.find(a => a.adgroup === attributeKey);
        if (found?.dp) return found.dp;
      }
      return attributeKey; // fallback
    },
    // Unique count of members in a department who have member[attributeKey] === true (an attribute license)
    countDeptUsersWithAttribute(department, attributeKey) {
      const seen = new Set();
      (department.adgroups || []).forEach(g => {
        (g.members || []).forEach(m => {
          if (m && m[attributeKey] === true) {
            // pick the best stable unique id you have
            const id = m.objectGuid || m.iam_id || m.samAccountName || m.mail;
            if (id) seen.add(id);
          }
        });
      });
      return seen.size;
    },
    getActiveFilterSummaries() {
      return (this.listData || [])
        .map(dept => {
          const key = this.deptAttrFilter?.[dept.depid];
          if (!key) return null;
          return {
            depid: dept.depid,
            departmentName: dept.department,
            attributeKey: key,
            attributeDp: this.getAttrDpLabel(dept, key),
            count: this.countDeptUsersWithAttribute(dept, key),
          };
        })
        .filter(Boolean);
    },
    getMembersForFilteredDisplay(department, adgroup) {
      const members = this.getMembersForDisplay(department, adgroup) || [];
      const keyword = (this.filtertxt || '').trim().toLowerCase();
      if (keyword.length < 3) {
        return members;
      }
      return members.filter(member => {
        const displayName = (member.displayName || '').toLowerCase();
        const samAccountName = (member.samAccountName || '').toLowerCase();

        return displayName.includes(keyword) || samAccountName.includes(keyword);
      });
    },
    expandAllAccordions() {
      this.$nextTick(() => {
        const accordionEls = document.querySelectorAll('#deptAccordion .accordion-collapse');
        accordionEls.forEach(el => {
          if (window.bootstrap && window.bootstrap.Collapse) {
            const instance = window.bootstrap.Collapse.getOrCreateInstance(el, { toggle: false });
            instance.show();
          }
        });
      });
    },
    collapseAllAccordions() {
      this.$nextTick(() => {
        const accordionEls = document.querySelectorAll('#deptAccordion .accordion-collapse');
        accordionEls.forEach(el => {
          if (window.bootstrap && window.bootstrap.Collapse) {
            const instance = window.bootstrap.Collapse.getOrCreateInstance(el, { toggle: false });
            instance.hide();
          }
        });
      });
    },
    clearAllDeptFilters() {
      // turns every department filter off
      Object.keys(this.deptAttrFilter || {}).forEach(k => (this.deptAttrFilter[k] = null));
    }
  },
  watch: {
    filtertxt(newValue){
      const keyword = (newValue || '').trim();

      if (keyword.length >= 3) {
        this.expandAllAccordions();
      }
    }
  }
};
</script>

<style scoped>


</style>
