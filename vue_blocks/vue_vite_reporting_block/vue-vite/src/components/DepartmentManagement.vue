<template>
  <div class="container-fluid">
    <div v-if="loading" id="loading" class="mt-3">
      <div class="spinner-border text-secondary loader" role="status">
        <span class="sr-only">Loading...</span>
      </div>
    </div>
    <div v-if="accessLevels.accesslevel1">
      <div v-if="screenmsg" class="mt-5">
        <div :class="'alert alert--'+screenmsgtype">
          <i :class="screenmsgicon"></i> {{ screenmsg }} <span v-if="screenmsgtype == 'error'"> Please contact one of the SuperAdmins through the Slack channel.</span>
        </div>
      </div>
      <div v-if="!hidebody" class="row mt-3">
        <div class="col-md-6">
          <div class="filter-input-wrapper">
            <input type="text" name="filtertxt" id="filtertxt" v-model.trim="filtertxt" @keydown.esc="clearFilter" class="form-control filter-input" style="border-radius: 10px !important; height: 2em !important; font-size: 0.8rem" placeholder="Filter departments">
            <span v-if="filtertxt" class="filter-clear" @click="clearFilter"><i class="fa-solid fa-xmark"></i></span>
          </div>
        </div>
        <div v-if="accessLevels.accesslevel2" class="col-md-6 text-end">
          <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#modal-add-dep">+ Add a Department</button>
        </div>
      </div>
      <div v-if="!hidebody" class='table-responsive mt-2'>
        <table class='table table-bordered table-hover table-striped'>
          <thead class='thead-light'>
            <tr>
              <th class="table-header">Departments<a href="#" class="filter-link" :class="{ activated: isSortActive('department') }" @click.prevent="toggleSort('department'); applySort('listData')"><i class="fa-solid" :class="getSortIcon('department')"></i></a></th>
              <th class="table-header">Parent<a href="#" class="filter-link" :class="{ activated: isSortActive('parentdep') }" @click.prevent="toggleSort('parentdep'); applySort('listData')"><i class="fa-solid" :class="getSortIcon('parentdep')"></i></a></th>
              <th>College</th>
              <th>Support E-mail</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="department in filteredDepartments">
              <td>{{ department.department }} <span v-if="department.abbr">({{ department.abbr }})</span></td>
              <td><span v-if="department.parentdep">{{ getDepartmentById(department.parentdep) }}</span></td>
              <td><span v-if="department.colid">{{ getCollegeById(department.colid) }}</span></td>
              <td>{{ department.support_email }}</td>
              <td><a href="" @click="selectRecord(department)" data-bs-toggle="modal" data-bs-target="#modal-edit-dep" title="Edit department"><i class="fa-solid fa-pen-to-square"></i></a> <a v-if="accessLevels.accesslevel2" href="" @click="selectRecord(department)" data-bs-toggle="modal" data-bs-target="#modal-del-dep" title="Delete department"><i class="fa-solid fa-circle-xmark"></i></a></td>
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
  <div v-if="accessLevels.accesslevel2" class="modal fade" id="modal-add-dep" tabindex="-1" aria-labelledby="modal-add-dep-label" aria-hidden="true">
    <div class="modal-dialog modal-xl">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title fs-5" id="modal-add-dep-label">Add a New Department</h3>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <form method="post" @submit.prevent="addDep">
          <div class="modal-body">
            <fieldset class="form-group">
              <legend>Department Configuration</legend>
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
                  College
                </div>
                <div class="col-md-6">
                  <select name="college" id="college" required>
                    <option>-- select an option --</option>
                    <option v-for="college in colleges" :key="college" :value="college.id">{{ college.college }}</option>
                  </select>
                </div>
              </div>
              <div class="row m-2">
                <div class="col-md-4 fw-bold text-end" :class="{ required: isInherited || isManagedGroupInherited }">
                  Parent
                </div>
                <div class="col-md-6">
                  <select name="parentdep" id="parentdep" :required="isInherited || isManagedGroupInherited">
                    <option value="">-- select an option --</option>
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
                <div class="col-md-4 fw-bold text-end" :class="{ required: !isManagedGroupInherited }">
                  IT Managed Group
                </div>
                <div class="col-md-6">
                  <input type="text" id="itgrp" name="itgrp" :required="!isManagedGroupInherited" :disabled="isManagedGroupInherited" placeholder="Case-sensitive - AD Group Name">
                </div>
              </div>
              <div class="row m-2">
                <div class="col-md-4 fw-bold text-end">
                  Viewer Managed Group
                </div>
                <div class="col-md-6">
                  <input type="text" id="viewergrp" name="viewergrp" :disabled="isManagedGroupInherited" placeholder="Case-sensitive - AD Group Name">
                </div>
              </div>
              <div class="row m-2">
                <div class="col-md-6 offset-md-4">
                  <input type="checkbox" id="inheritmggrp" name="inheritmggrp" v-model="isManagedGroupInherited" />
                  <label class="radio-check-label" for="inheritmggrp">Inherit managed group settings from parent department</label>
                </div>
              </div>
              <div class="row m-2">
                <div class="col-md-6 offset-md-4">
                  <input type="checkbox" id="maindep" name="maindep" />
                  <label class="radio-check-label" for="maindep">Main Department</label>
                </div>
              </div>
            </fieldset>
            <fieldset class="form-group mt-2">
              <legend>Attributes</legend>
              <div class="row" v-if="attributes.length > 0">
                <div class="col-md-4">
                  <label>ADGroup</label>
                </div>
                <div class="col-md-4">
                  <label>Display Name</label>
                </div>
                <div class="col-md-2">
                  <label>Visible</label>
                </div>
                <div class="col-md-2">
                  <label>Remove</label>
                </div>
              </div>
              <div class="row" v-for="(attribute, index) in attributes" :key="index">
                <div class="col-md-4 mt-1">
                  <div>
                    <input type="text" :name="'adgroup-' + (index + 1)" v-model="attribute.adgroup" :id="'adgroup-' + (index + 1)" required>
                  </div>
                </div>
                <div class="col-md-4 mt-1">
                  <div>
                    <input type="text" :name="'adgroup-dp-' + (index + 1)" v-model="attribute.displayName" :id="'adgroup-dp-' + (index + 1)" required>
                  </div>
                </div>
                <div class="col-md-2 mt-1">
                  <div class="mt-1">
                    <input type="checkbox" :name="'adgroup-visible-' + (index + 1)" v-model="attribute.visible" :id="'adgroup-visible-' + (index + 1)" value="1" style="transform: scale(2); margin-left: 0.5em;">
                  </div>
                </div>
                <div class="col-md-2 mt-1">
                  <div>
                    <a href="#" @click.prevent="removeAttribute(index)"><i class="fa-solid fa-circle-minus align-middle fa-15x"></i></a>
                  </div>
                </div>
              </div>
              <div>
                <a href="#" @click.prevent="addAttribute"><span v-if="attributes.length === 0">Add an attribute</span><span v-else>Add another attribute</span></a>
              </div>
            </fieldset>
            <fieldset class="form-group">
              <legend>PEAKS Configuration</legend>
              <div class="row">
                <div class="col-md-12">
                  <input type="checkbox" id="inherit" name="inherit" v-model="isInherited">
                  <label class="radio-check-label" for="inherit">Inherit PEAKS configuration from parent department</label>
                </div>
              </div>
              <div v-if="!isInherited">
                <div class="row mt-3">
                  <div class="col-md-6 fw-bold required">
                    PEAKS Team Name
                  </div>
                </div>
                <div class="row">
                  <div class="col-md-6 mt-1">
                    <div>
                      <input type="text" name="peakstn" id="peakstn" required>
                    </div>
                  </div>
                </div>
                <div class="row mt-3">
                  <div class="col-md-6 fw-bold">
                    Documents
                  </div>
                </div>
                <div class="row" v-if="peaks_attributes.length > 0">
                  <div class="col-md-3 fs-6">
                    <label>Title</label>
                  </div>
                  <div class="col-md-3 fs-6">
                    <label>ID</label>
                  </div>
                  <div class="col-md-3 fs-6">
                    <label>Icon <i class="fa-solid fa-circle-info info-icon" title="FontAwesome Icons: Add only the class names (e.g. fa-solid fa-file)"></i></label>
                  </div>
                  <div class="col-md-1 fs-6">
                    <label>Color <i class="fa-solid fa-circle-info info-icon" title="This is the color for the icon."></i></label>
                  </div>
                  <div class="col-md-1 fs-6">
                    <label>Visible</label>
                  </div>
                  <div class="col-md-1 fs-6">
                    <label>Remove</label>
                  </div>
                </div>
                <div class="row" v-for="(item, index) in peaks_attributes" :key="index">
                  <div class="col-md-3">
                    <div class="mt-1">
                      <input type="text" :id="'pdtitle-' + (index + 1)" :name="'pdtitle-' + (index + 1)" v-model="item.title" required>
                    </div>
                  </div>
                  <div class="col-md-3">
                    <div class="mt-1">
                      <input type="text" :id="'pdid-' + (index + 1)" :name="'pdid-' + (index + 1)" v-model="item.id" required>
                    </div>
                  </div>
                  <div class="col-md-3">
                    <div class="mt-1">
                      <input type="text" :id="'pdicon-' + (index + 1)" :name="'pdicon-' + (index + 1)" v-model="item.icon" required>
                    </div>
                  </div>
                  <div class="col-md-1">
                    <div class="mt-1 peaks-color-row">
                      <input type="color" :id="'pdcolor-' + (index + 1)" :name="'pdcolor-' + (index + 1)" v-model="item.color" required>
                    </div>
                  </div>
                  <div class="col-md-1">
                    <div class="mt-1" style="height: 2.5em; padding-top: 0.25em;">
                      <input type="checkbox" :name="'pdvisible-' + (index + 1)" :id="'pdvisible-' + (index + 1)" v-model="item.visible" value="1" style="transform: scale(2); margin-left: 0.5em;">
                    </div>
                  </div>
                  <div class="col-md-1">
                    <div class="mt-1" style="height: 2.5em; padding-top: 0.2em;">
                      <a href="#" @click.prevent="removePeaksDoc(index)"><i class="fa-solid fa-circle-minus align-middle fa-15x"></i></a>
                    </div>
                  </div>
                </div>
                <div>
                  <a href="#" @click.prevent="addPeaksDoc"><span v-if="peaks_attributes.length === 0">Add a document</span><span v-else>Add another document</span></a>
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
  <div v-if="accessLevels.accesslevel2" class="modal fade" id="modal-del-dep" tabindex="-1" aria-labelledby="modal-del-dep-label" aria-hidden="true">
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
  <div  v-if="accessLevels.accesslevel1" class="modal fade" id="modal-edit-dep" tabindex="-1" aria-labelledby="modal-edit-dep-label" aria-hidden="true">
    <div class="modal-dialog modal-xl">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title fs-5" id="modal-edit-dep-label">Update Department</h3>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click="unsetSelectedRecord()"></button>
        </div>
        <form method="post" @submit.prevent="updateDep">
          <div class="modal-body">
            <fieldset class="form-group">
              <legend>Department Configuration</legend>
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
                <div class="col-md-4 fw-bold text-end">
                  College
                </div>
                <div class="col-md-6">
                  <select name="upd_college" id="upd_college" v-model="selectedRecord.colid">
                    <option>-- select an option --</option>
                    <option v-for="college in colleges" :key="college" :value="college.id">{{ college.college }}</option>
                  </select>
                </div>
              </div>
              <div class="row m-2">
                <div class="col-md-4 fw-bold text-end" :class="{ required: isInherited || isManagedGroupInherited }">
                  Parent
                </div>
                <div class="col-md-6">
                  <select name="upd_parentdep" id="upd_parentdep" v-model="selectedRecord.parentdep" :required="isInherited || isManagedGroupInherited">
                    <option disabled value="">-- select an option --</option>
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
                <div class="col-md-4 fw-bold text-end"  :class="{ required: !isManagedGroupInherited }">
                  IT Managed Group
                </div>
                <div class="col-md-6">
                  <input type="text" id="upd_itgrp" name="upd_itgrp" :value="selectedRecord.goto_orgadgrp" @input="updateField('orgadgrp', $event)" :disabled="isManagedGroupInherited" :required="!isManagedGroupInherited" placeholder="Case-sensitive - AD Group Name">
                </div>
              </div>
              <div class="row m-2">
                <div class="col-md-4 fw-bold text-end">
                  Viewer Managed Group
                </div>
                <div class="col-md-6">
                  <input type="text" id="upd_viewergrp" name="upd_viewergrp" :value="selectedRecord.goto_vieweradgrp" @input="updateField('vieweradgrp', $event)" :disabled="isManagedGroupInherited" placeholder="Case-sensitive - AD Group Name">
                </div>
              </div>
              <div class="row m-2">
                <div class="col-md-6 offset-md-4">
                  <input type="checkbox" id="upd_inheritmggrp" name="upd_inheritmggrp" v-model="isManagedGroupInherited" />
                  <label class="radio-check-label" for="upd_inheritmggrp">Inherit managed group settings from parent department</label>
                </div>
              </div>
              <div class="row m-2">
                <div class="col-md-6 offset-md-4">
                  <input type="checkbox" id="upd_maindep" name="upd_maindep" :checked="selectedRecord.maindep == '1'" />
                  <label class="radio-check-label" for="upd_maindep">Main Department</label>
                </div>
              </div>
            </fieldset>
            <fieldset class="form-group mt-2">
              <legend>Attributes</legend>
              <div class="row" v-if="atrAdgroups.length">
                <div class="col-md-4">
                  <label>ADGroup</label>
                </div>
                <div class="col-md-4">
                  <label>Display Name</label>
                </div>
                <div class="col-md-2">
                  <label>Visible</label>
                </div>
                <div class="col-md-2">
                  <label>Remove</label>
                </div>
              </div>
              <div class="row" v-if="atrAdgroups.length">
                <div class="col-md-4">
                  <div v-for="(adgroup, index) in atrAdgroups" :key="index" class="mt-1">
                    <input type="text" :id="`adgroup-${index}`" :name="`adgroup-${index}`" :value="adgroup" @input="updateMultipleValueField('atr_adgroups', index, $event)" required>
                  </div>
                </div>
                <div class="col-md-4">
                  <div v-for="(adgroupdp, index) in atrAdgroupsdp" :key="index" class="mt-1">
                    <input type="text" :id="`adgroup-dp-${index}`" :name="`adgroup-dp-${index}`" :value="adgroupdp" @input="updateMultipleValueField('atr_adgroupsdp', index, $event)" required>
                  </div>
                </div>
                <div class="col-md-2">
                  <div v-for="(adgroupv, index) in atrAdgroupsv" :key="index" class="mt-1" style="height: 2.5em; padding-top: 0.25em;">
                    <input type="checkbox" :name="`adgroup-visible-${index}`" :id="`adgroup-visible-${index}`" v-model="atrAdgroupsv[index]" @change="updateMultipleValueField('atr_adgroupsvisiblity', index, $event)" style="transform: scale(2); margin-left: 0.5em;">
                  </div>
                </div>
                <div class="col-md-2">
                  <div v-for="(adgroup, index) in atrAdgroups" :key="index" class="mt-1" style="height: 2.5em; padding-top: 0.2em;">
                    <a href="#" @click.prevent="removeUpdateAttribute(index)"><i class="fa-solid fa-circle-minus align-middle fa-15x"></i></a>
                  </div>
                </div>
              </div>
              <div>
                <a href="#" @click.prevent="addUpdateAttribute"><span v-if="atrAdgroups.length === 0">Add an attribute</span><span v-else>Add another attribute</span></a>
              </div>
            </fieldset>
            <fieldset class="form-group">
              <legend>PEAKS Configuration</legend>
              <div class="row">
                <div class="col-md-12">
                  <input type="checkbox" id="upd_inherit" name="upd_inherit" v-model="isInherited">
                  <label class="radio-check-label" for="inherit">Inherit PEAKS configuration from parent department</label>
                </div>
              </div>
              <div v-if="!isInherited">
                <div class="row mt-3">
                  <div class="col-md-6 fw-bold required">
                    PEAKS Team Name
                  </div>
                </div>
                <div class="row">
                  <div class="col-md-6 mt-1">
                    <div>
                      <input type="text" id="upd_peakstn" name="upd_peakstn" :value="selectedRecord.peaksteam" @input="updateField('peaksteam', $event)" required>
                    </div>
                  </div>
                </div>
                <div class="row mt-3">
                  <div class="col-md-6 fw-bold">
                    Documents
                  </div>
                </div>
                <div class="row" v-if="peaksDocTitle.length">
                  <div class="col-md-3 fs-6">
                    <label>Title</label>
                  </div>
                  <div class="col-md-3 fs-6">
                    <label>ID</label>
                  </div>
                  <div class="col-md-3 fs-6">
                    <label>Icon <i class="fa-solid fa-circle-info info-icon" title="FontAwesome Icons: Add only the class names (e.g. fa-solid fa-file)"></i></label>
                  </div>
                  <div class="col-md-1 fs-6">
                    <label>Color <i class="fa-solid fa-circle-info info-icon" title="This is the color for the icon."></i></label>
                  </div>
                  <div class="col-md-1 fs-6">
                    <label>Visible</label>
                  </div>
                  <div class="col-md-1 fs-6">
                    <label>Remove</label>
                  </div>
                </div>
                <div class="row" v-if="peaksDocTitle.length">
                  <div class="col-md-3">
                    <div v-for="(title, index) in peaksDocTitle" :key="index" class="mt-1">
                      <input type="text" :id="`pdtitle-${index}`" :name="`pdtitle-${index}`" :value="title" @input="updateMultipleValueField('peaks_doc_title', index, $event)" required>
                    </div>
                  </div>
                  <div class="col-md-3">
                    <div v-for="(id, index) in peaksDocId" :key="index" class="mt-1">
                      <input type="text" :id="`pdid${index}`" :name="`pdid${index}`" :value="id" @input="updateMultipleValueField('peaks_doc_id', index, $event)" required>
                    </div>
                  </div>
                  <div class="col-md-3">
                    <div v-for="(icon, index) in peaksDocIcon" :key="index" class="mt-1">
                      <input type="text" :id="`pdicon${index}`" :name="`pdicon${index}`" :value="icon" @input="updateMultipleValueField('peaks_doc_icon', index, $event)" required>
                    </div>
                  </div>
                  <div class="col-md-1">
                    <div v-for="(color, index) in peaksDocColor" :key="index" class="mt-1 peaks-color-row">
                      <input type="color" :id="`pdcolor${index}`" :name="`pdcolor${index}`" :value="color" @input="updateMultipleValueField('peaks_doc_color', index, $event)" required>
                    </div>
                  </div>
                  <div class="col-md-1">
                    <div v-for="(visible, index) in peaksDocV" :key="index" class="mt-1" style="height: 2.5em; padding-top: 0.25em;">
                      <input type="checkbox" :name="`pdvisible-${index}`" :id="`pdvisible-${index}`" v-model="peaksDocV[index]" @change="updateMultipleValueField('peaks_doc_visibility', index, $event)" style="transform: scale(2); margin-left: 0.5em;">
                    </div>
                  </div>
                  <div class="col-md-1">
                    <div v-for="(title, index) in peaksDocTitle" :key="index" class="mt-1" style="height: 2.5em; padding-top: 0.2em;">
                      <a href="#" @click.prevent="removeUpdatePeaksDoc(index)"><i class="fa-solid fa-circle-minus align-middle fa-15x"></i></a>
                    </div>
                  </div>
                </div>
                <div>
                  <a href="#" @click.prevent="addUpdatePeaksDoc"><span v-if="peaksDocTitle.length === 0">Add a document</span><span v-else>Add another document</span></a>
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
//import { navmixin } from '../mixins/navMixin.js';
import { globalMixin } from '../mixins/globalMixin.js';
import axios from 'axios';
export default {
  mixins: [globalMixin],
  name: 'DepartmentManagement',

  data() {
    return {
      isInherited: false,
      isManagedGroupInherited: false,
      attributes: [
        { adgroup: '', displayName: '', visible: false }
      ],
      peaks_attributes: [
        { title: '', id: '', icon: '', color: '', visible: false }
      ],
      sortKey: 'department',
      sortDirection: 'asc',
    };
  },
  created() {
    this.sortKey = 'department';
    this.sortDirection = 'asc';
  },
  mounted: function(){
    const url = 'https://web.bftv.ucdavis.edu/reporting/dep-get.php'
    this.getDataList(url, 'department')
  },
  methods: {
    getDepartmentById(id) {
      const department = this.listData.find(item => Number(item.id) === Number(id));
      if (department) {
        return department.department+" ("+department.abbr+")";
      } else {
        return null;
      }
    },
    getCollegeById(id) {
      const college = this.colleges.find(item => Number(item.id) === Number(id));
      if (college) {
        return college.college+" ("+college.abbr+")";
      } else {
        return null;
      }
    },
    addAttribute() {
      this.attributes.push({ adgroup: '', displayName: '', visible: false });
    },
    removeAttribute(index) {
      this.attributes.splice(index, 1);
    },
    clearAttributes() {
      this.attributes = [{ adgroup: '', displayName: '', visible: false }];
    },
    addUpdateAttribute() {
      this.atrAdgroups = [...this.atrAdgroups, ''];
      this.atrAdgroupsdp = [...this.atrAdgroupsdp, ''];
      this.atrAdgroupsv = [...this.atrAdgroupsv, 'true'];
    },
    removeUpdateAttribute(index) {
      const newAdgroups = this.atrAdgroups.filter((_, i) => i !== index);
      const newAdgroupsdp    = this.atrAdgroupsdp.filter((_, i) => i !== index);
      const newAdgroupsv  = this.atrAdgroupsv.filter((_, i) => i !== index);
      if (newAdgroups.length > 0) {
        this.atrAdgroups = newAdgroups;
        this.atrAdgroupsdp    = newAdgroupsdp;
        this.atrAdgroupsv  = newAdgroupsv;
        return;
      }
      this.selectedRecord.atr_adgroups = null;
      this.selectedRecord.atr_adgroupsdp = null;
      this.selectedRecord.atr_adgroupsvisiblity = null;
    },
    addPeaksDoc() {
      this.peaks_attributes.push({ title: '', id: '', icon: '', color: '', visible: false });
    },
    removePeaksDoc(index) {
      this.peaks_attributes.splice(index, 1);
    },
    clearPeaksDoc() {
      this.peaks_attributes = [{ title: '', id: '', icon: 'fa-solid fa-file-signature', color: '3dae2b', visible: false }];
    },
    addUpdatePeaksDoc() {
      this.peaksDocTitle = [...this.peaksDocTitle, ''];
      this.peaksDocId = [...this.peaksDocId, ''];
      this.peaksDocIcon = [...this.peaksDocIcon, 'fa-solid fa-file-signature'];
      this.peaksDocColor = [...this.peaksDocColor, '3dae2b'];
      this.peaksDocV = [...this.peaksDocV, 'true'];
    },
    removeUpdatePeaksDoc(index) {
      const newTitles = this.peaksDocTitle.filter((_, i) => i !== index);
      const newIds    = this.peaksDocId.filter((_, i) => i !== index);
      const newIcons  = this.peaksDocIcon.filter((_, i) => i !== index);
      const newColors = this.peaksDocColor.filter((_, i) => i !== index);
      const newVis    = this.peaksDocV.filter((_, i) => i !== index);
      if (newTitles.length > 0) {
        this.peaksDocTitle = newTitles;
        this.peaksDocId    = newIds;
        this.peaksDocIcon  = newIcons;
        this.peaksDocColor = newColors;
        this.peaksDocV     = newVis;
        return;
      }
      this.selectedRecord.peaks_doc_title = null;
      this.selectedRecord.peaks_doc_id = null;
      this.selectedRecord.peaks_doc_icon = null;
      this.selectedRecord.peaks_doc_color = null;
      this.selectedRecord.peaks_doc_visibility = null;
    },
    addDep(e) {
      e.preventDefault();
      this.loading = true;
      var modal = bootstrap.Modal.getInstance(document.getElementById('modal-add-dep'));
      var dep = document.getElementById('department').value;
      var abb = document.getElementById('abbr').value;
      var colid = document.getElementById('college').value;
      var pdep = document.getElementById('parentdep').value;
      var support = document.getElementById('email').value;
      var orgad = 'none';
      var viewad = 'none';
      var inhmg = document.getElementById('inheritmggrp').checked;
      if(inhmg == true){
        inhmg = 1;
      } else {
        inhmg = 0;
        orgad = document.getElementById('itgrp').value;
        viewad = document.getElementById('viewergrp').value;;
      }
      var ptn = 'none';
      var peakstitle = null;
      var peaksid = null;
      var peaksicon = null;
      var peakscolor = null;
      var peaksvisiblity = null;
      var inh = document.getElementById('inherit').checked;
      if(inh == true){
        inh = 1;
      } else {
        inh = 0;
        ptn = document.getElementById('peakstn').value;
        peakstitle = this.peaks_attributes.map(item => item.title).join(';');
        peaksid = this.peaks_attributes.map(item => item.id).join(';');
        peaksicon = this.peaks_attributes.map(item => item.icon).join(';');
        peakscolor = this.peaks_attributes.map(item => item.color).join(';');
        peaksvisiblity = this.peaks_attributes.map(item => item.visible).join(';');
      }
      var mdep = document.getElementById('maindep').checked;
      if(mdep == true){
        mdep = 1;
      } else {
        mdep = 0;
      }
      var adgs = this.attributes.map(attribute => attribute.adgroup).join(';');
      var adgsdp = this.attributes.map(attribute => attribute.displayName).join(';');
      var adgsv = this.attributes.map(attribute => attribute.visible).join(';');
      axios.post('https://web.bftv.ucdavis.edu/reporting/dep-add.php', {
        crossDomain: true,
        myid: this.username,
        token: this.token,
        department: dep, abbreviation: abb, colid: colid, parentdep: pdep, support_email: support, inherit_ad: inhmg, orgadgrp: orgad, vieweradgrp: viewad, inherit: inh, peakstn: ptn, maindep: mdep, adgroups: adgs, adgroupsdp: adgsdp, adgroupsvisibility: adgsv, peakstitle: peakstitle, peaksid: peaksid, peaksicon: peaksicon, peakscolor: peakscolor, peaksvisiblity: peaksvisiblity,
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(response => {
        this.screenmsg = response.data.message,
        this.screenmsgtype = "success",
        this.screenmsgicon = this.successicon,
        this.listData = response.data.dataList,
        this.sortKey = 'department';
        this.sortDirection = 'asc';
        this.applySort('listData');
        this.departments = response.data.departments,
        this.colleges = response.data.colleges
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
        document.getElementById('maindep').checked = false;
        this.clearAttributes();
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
      var col = document.getElementById('upd_college').value;
      var pdep = document.getElementById('upd_parentdep').value;
      var support = document.getElementById('upd_email').value;
      var orgad = 'none';
      var viewad = 'none';
      var inhmg = document.getElementById('upd_inheritmggrp').checked;
      if(inhmg == true){
        inhmg = 1;
      } else {
        inhmg = 0;
        orgad = document.getElementById('upd_itgrp').value;
        viewad = document.getElementById('upd_viewergrp').value;;
      }
      var ptn = 'none';
      var peakstitle = null;
      var peaksid = null;
      var peaksicon = null;
      var peakscolor = null;
      var peaksvisiblity = null;
      var inh = document.getElementById('upd_inherit').checked;
      if(inh == true){
        inh = 1;
      } else {
        inh = 0;
        ptn = this.selectedRecord.peaksteam;
        peakstitle = this.selectedRecord.peaks_doc_title;
        peaksid = this.selectedRecord.peaks_doc_id;
        peaksicon = this.selectedRecord.peaks_doc_icon;
        peakscolor = this.selectedRecord.peaks_doc_color;
        peaksvisiblity = this.selectedRecord.peaks_doc_visibility;
      }
      var mdep = document.getElementById('upd_maindep').checked;
      if(mdep == true){
        mdep = 1;
      } else {
        mdep = 0;
      }
      var adgs = this.selectedRecord.atr_adgroups;
      var adgsdp = this.selectedRecord.atr_adgroupsdp;
      var adgsv = this.selectedRecord.atr_adgroupsvisiblity;

      axios.post('https://web.bftv.ucdavis.edu/reporting/dep-update.php', {
        crossDomain: true,
        myid: this.username,
        token: this.token,
        id: depid, department: dep, abbreviation: abb, colid: col, parentdep: pdep, support_email: support, inherit_ad: inhmg, orgadgrp: orgad, vieweradgrp: viewad, inherit: inh, peakstn: ptn, maindep: mdep, adgroups: adgs, adgroupsdp: adgsdp, adgroupsvisibility: adgsv, peakstitle: peakstitle, peaksid: peaksid, peaksicon: peaksicon, peakscolor: peakscolor, peaksvisiblity: peaksvisiblity,
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(response => {
        this.screenmsg = response.data.message,
        this.screenmsgtype = "success",
        this.screenmsgicon = this.successicon,
        this.listData = response.data.dataList,
        this.sortKey = 'department';
        this.sortDirection = 'asc';
        this.applySort('listData');
        this.departments = response.data.departments,
        this.colleges = response.data.colleges
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
    delDep(e) {
      e.preventDefault();
      this.loading = true;
      var modal = bootstrap.Modal.getInstance(document.getElementById('modal-del-dep'));
      var depid = document.getElementById('del_depid').value;
      axios.post('https://web.bftv.ucdavis.edu/reporting/dep-delete.php', {
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
        this.sortKey = 'department';
        this.sortDirection = 'asc';
        this.applySort('listData');
        this.departments = response.data.departments,
        this.colleges = response.data.colleges
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
    atrAdgroups: {
      get() {
        return this.selectedRecord?.atr_adgroups?.split(';') || [];
      },
      set(value) {
        this.selectedRecord.atr_adgroups = value.join(';');
      }
    },
    atrAdgroupsdp: {
      get() {
        return this.selectedRecord?.atr_adgroupsdp?.split(';') || [];
      },
      set(value) {
        this.selectedRecord.atr_adgroupsdp = value.join(';');
      }
    },
    atrAdgroupsv: {
      get() {
        return this.selectedRecord?.atr_adgroupsvisiblity?.split(';') || [];
      },
      set(value) {
        this.selectedRecord.atr_adgroupsvisiblity = value.join(';');
      }
    },
    peaksDocTitle: {
      get() {
        return this.selectedRecord?.peaks_doc_title?.split(';') || [];
      },
      set(value) {
        this.selectedRecord.peaks_doc_title = value.join(';');
      }
    },
    peaksDocId: {
      get() {
        return this.selectedRecord?.peaks_doc_id?.split(';') || [];
      },
      set(value) {
        this.selectedRecord.peaks_doc_id = value.join(';');
      }
    },
    peaksDocIcon: {
      get() {
        return this.selectedRecord?.peaks_doc_icon?.split(';') || [];
      },
      set(value) {
        this.selectedRecord.peaks_doc_icon = value.join(';');
      }
    },
    peaksDocColor: {
      get() {
        return this.selectedRecord?.peaks_doc_color?.split(';') || [];
      },
      set(value) {
        this.selectedRecord.peaks_doc_color = value.join(';');
      }
    },
    peaksDocV: {
      get() {
        return this.selectedRecord?.peaks_doc_visibility?.split(';') || [];
      },
      set(value) {
        this.selectedRecord.peaks_doc_visibility = value.join(';');
      }
    },
    filteredDepartments() {
      return this.filterArray(this.listData, ['department', 'abbr']);
    }
  },
  watch: {
    selectedRecord(newValue) {
      if (newValue && newValue.inheritpeaks !== undefined) {
        this.isInherited = String(newValue.inheritpeaks) === '1';
      }
      if (newValue && newValue.inheritmggrp !== undefined) {
        this.isManagedGroupInherited = String(newValue.inheritmggrp) === '1';
      }
    },
  },
};
</script>

<style scoped>
/* Add component-specific styles here */
</style>
