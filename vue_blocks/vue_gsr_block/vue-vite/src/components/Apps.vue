<template>
  <div class="container-fluid">
    <the-navigation></the-navigation>
    <div v-if="loading" id="loading" class="mt-3">
      <div class="spinner-border text-secondary loader" role="status">
        <span class="sr-only">Loading...</span>
      </div>
    </div>
    <div v-if="curlRole !== 'anonymous'">
      <div v-if="screenmsg" class="mt-5">
        <div :class="'alert alert--'+screenmsgtype">
          <i :class="screenmsgicon"></i> {{ screenmsg }} <span v-if="code == 401">Please <a href="/assignments">click here</a> to refresh the page.</span><span v-if="screenmsgtype == 'error'">If the problem persists, please contact <a href="mailto:bftvtech@ucdavis.edu">bftvtech@ucdavis.edu</a>.</span>
        </div>
      </div>
      <div v-if="!hidebody" class="mt-3">
        <div class="row">
          <div v-if="!authenticated && !viewermode" class="col-md-12 mb-3">
            <div class="alert alert--error">
              <i class="far fa-times-circle fa-2x alert--error-icon"></i> Your changes will not be saved as you are not authenticated to the server. <a href="#" @click="authenticate()">Click here</a> to authenticate.
            </div>
          </div>
          <div class="col-md-12 text-end">
            <button class="btn btn-primary btn-sm" style="padding-top: 0.4rem !important" type="button" data-bs-toggle="collapse" data-bs-target="#collapseSearch" aria-expanded="false" aria-controls="collapseExample"><i class="fa-solid fa-magnifying-glass"></i></button>
          </div>
          <div class="col-md-12 collapse mt-2" id="collapseSearch">
            <div class="row">
              <div class="col-md-3">
                <input type="text" class="search-input" name="sid_search" id="sid_search" placeholder="Key App ID" />
                <input type="text" class="search-input" name="pi_name_search" id="pi_name_search" placeholder="Supervisor/PI Name" />
                <input type="text" class="search-input" name="pi_email_search" id="pi_email_search" placeholder="Supervisor/PI E-mail" />
                <input type="text" class="search-input" name="gsr_name_search" id="gsr_name_search" placeholder="GSR Name" />
                <input type="text" class="search-input" name="gsr_email_search" id="gsr_email_search" placeholder="GSR E-mail" />
              </div>
              <div class="col-md-3">
                <select class="search-input" name="department_search" id="department_search">
                  <option value="">-- Department --</option>
                  <option v-for="department in departments" :key="department.id" :value="department.id">{{ department.department }}</option>
                </select>
                <select class="search-input" name="status_search" id="status_search">
                  <option value="">-- Status --</option>
                  <option value="1">New/Pending AM Review</option>
                  <option value="2">Pending Advising Review</option>
                  <option value="3">Pending PI Review</option>
                  <option value="4">PI Requested Change</option>
                  <option value="5">Waiting DocuSign Initiation</option>
                  <option value="6">Pending Signatures</option>
                  <option value="7">Completed</option>
                  <option value="8">Rejected</option>
                </select>
                <select class="search-input" name="appt_term_search" id="appt_term_search">
                  <option value="">-- Appointment Term --</option>
                  <option value="Academic Year">Academic Year</option>
                  <option value="Summer">Summer</option>
                </select>
                <div class="input-group input-group-sm input-group-custom">
                  <span class="input-group-text input-group-text-custom" id="sd-label">Start</span>
                  <select class="form-select select-wrap" name="sd_equalizer" id="sd_equalizer">
                    <option value="on" selected>on</option>
                    <option value="before">before</option>
                    <option value="after">after</option>
                    <option value="not">not</option>
                  </select>
                  <input type="date" class="form-control input-wrap" name="start_date_search" id="start_date_search" aria-label="Start Date" aria-describedby="sd-label">
                </div>
                <div class="input-group input-group-sm input-group-custom">
                  <span class="input-group-text input-group-text-custom" id="sd-label">End&nbsp;</span>
                  <select class="form-select select-wrap" name="ed_equalizer" id="ed_equalizer">
                    <option value="on" selected>on</option>
                    <option value="before">before</option>
                    <option value="after">after</option>
                    <option value="not">not</option>
                  </select>
                  <input type="date" class="form-control input-wrap" name="end_date_search" id="end_date_search" aria-label="End Date" aria-describedby="ed-label">
                </div>
              </div>
              <div class="col-md-3">
                <select class="search-input" name="appt_type_search" id="appt_type_search">
                  <option value="">-- Appointment Type --</option>
                  <option value="New">New</option>
                  <option value="Extension">Extension</option>
                </select>
                <input type="text" class="search-input" name="fte_search" id="fte_search" placeholder="FTE Percentage - don't add %" />
                <input type="text" class="search-input" name="step_search" id="step_search" placeholder="Salary Point" />
                <input type="text" class="search-input" name="account_search" id="account_search" placeholder="Account Number" />
                <input type="text" class="search-input" name="grad_group_search" id="grad_group_search" placeholder="Grad Group" />
              </div>
              <div class="col-md-3">
                <select class="search-input" name="training_grant_search" id="training_grant_search">
                  <option value="">-- Training Grant --</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
                <input type="text" class="search-input" name="additional_funding_search" id="additional_funding_search" placeholder="Additional Funding" />
                <input type="text" class="search-input" name="salary_search" id="salary_search" placeholder="Proposed Salary" />
                <select class="search-input" name="pep_search" id="pep_search">
                  <option value="">-- PEP Status --</option>
                  <option value="Required">Required</option>
                  <option value="Not Required">Not Required</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
            </div>
            <div class="row">
              <div class="col-md-12 text-end">
                  <button type="button" class="btn btn-primary btn-sm" @click="clearSearch" :disabled="!search">Reset</button>
                  <button type="button" class="btn btn-primary btn-sm" style="margin-left: 0.25rem;" @click="searchAp">Search</button>
                </div>
            </div>
          </div>
          <div class="col-md-12">
            <div v-if="hasApplicants && pendingTab && !search" class="alert alert--warning">
              <i class="fa-regular fa-clock fa-2x alert--error-icon"></i> <span class="text-muted"><small>There is an up to <strong>20-minute delay</strong> with the status updates. This results in not showing status updates for the newly created DocuSign applications.</small></span><br/><span class="fs-6">Last updated: {{ metaData.lastupdated }}</span>
            </div>
            <div v-if="search" class="alert alert--info">
              <small><strong>{{ listData.length }} {{ listData.length === 1 ? 'row' : 'rows' }}</strong> returned.</small>
            </div>
            <div v-if="hasApplicants" class='table-responsive mt-2'>
              <div class="text-end">
                <button class="btn btn-sm btn-link btn-resend" title="Exports current view to CSV." @click="exportToCSV">Export to CSV</button>
              </div>
              <table class='table table-bordered table-hover table-striped'>
                <thead class='thead-light'>
                  <tr>
                    <th @click="sortData('sid')" class="sortable">
                      #
                      <span v-if="currentSortColumn === 'sid'">
                        <span v-if="sortAscending">&#9650;</span>
                        <span v-else>&#9660;</span>
                      </span>
                    </th>
                    <th @click="sortData('created')" class="sortable">
                      Date
                      <span v-if="currentSortColumn === 'created'">
                        <span v-if="sortAscending">&#9650;</span>
                        <span v-else>&#9660;</span>
                      </span>
                    </th>
                    <th @click="sortData('start_date')" class="sortable">
                      Period / Apptmt Type
                      <span v-if="currentSortColumn === 'start_date'">
                        <span v-if="sortAscending">&#9650;</span>
                        <span v-else>&#9660;</span>
                      </span>
                    </th>
                    <th @click="sortData('gsr_fname')" class="sortable">
                      Applicant
                      <span v-if="currentSortColumn === 'gsr_fname'">
                        <span v-if="sortAscending">&#9650;</span>
                        <span v-else>&#9660;</span>
                      </span>
                    </th>
                    <th @click="sortData('pi_fname')" class="sortable">
                      PI/Supervisor
                      <span v-if="currentSortColumn === 'pi_fname'">
                        <span v-if="sortAscending">&#9650;</span>
                        <span v-else>&#9660;</span>
                      </span>
                    </th>
                    <th v-if="pendingTab" @click="sortData('status_sort')" class="sortable">
                      Status
                      <span v-if="currentSortColumn === 'status_sort'">
                        <span v-if="sortAscending">&#9650;</span>
                        <span v-else>&#9660;</span>
                      </span>
                    </th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="currentOriginalListData.length > 5">
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                    <td><input type="text" id="gsr_name_search" class="fs-6" v-model="searchTextGsr"></td>
                    <td><input type="text" id="pi_name_search" class="fs-6" v-model="searchTextPi"></td>
                    <td v-if="pendingTab">
                      <select id="status_search" class="fs-6" v-model="searchStatus">
                        <option value=""></option>
                        <option value="1">Pending Advising Review</option>
                        <option value="2">Pending PI Review</option>
                        <option value="3">PI Requested Change</option>
                        <option value="4">Waiting DocuSign Initiation</option>
                        <option value="5">Pending Signature</option>
                      </select>
                    </td>
                    <td>&nbsp;</td>
                  </tr>
                  <tr v-for="applicant in filteredData" :key="applicant.sid">
                    <td>{{ applicant.sid }}</td>
                    <td>{{ convertDateFormat(applicant.created, 'datetime') }}</td>
                    <td>{{ convertDateFormat(applicant.start_date, 'date') }} - {{ convertDateFormat(applicant.end_date, 'date') }}<br/><span class="text-muted fs-t">{{ applicant.appt_type }}</span></td>
                    <td><a :href="'mailto:'+applicant.gsr_email">{{ applicant.gsr_fname }} {{ applicant.gsr_lname }}</a></td>
                    <td><a :href="'mailto:'+applicant.pi_email">{{ applicant.pi_fname }} {{ applicant.pi_lname }}</a><br/><span class="text-muted fs-6">{{ applicant.department }} ({{ applicant.abbr }})</span></td>
                    <td v-if="pendingTab" class="text-muted fs-6">
                      {{ statusAnalyzer(applicant.status, applicant.sent_preview, applicant.approved_pi, applicant.change_request) }}
                      <span v-if="applicant.status == 'pending'">
                        <a tabindex="0" role="button" data-bs-toggle="popover" data-bs-trigger='focus' data-bs-html="true" :data-bs-content="popoverContent(applicant.signers)">
                          <i class="fa-solid fa-circle-info"></i>
                        </a>
                      </span>
                      <div v-if="applicant.status == 'pending'">
                        <span v-if="applicant.signers.signers == 'NR'">Status not received yet.</span>
                        <span v-else>
                          <span v-for="signer in applicant.signers">
                            <span v-if="signer.status == 'sent' || signer.status == 'delivered'">
                              <a :href="'mailto:'+signer.email">{{ signer.name }}</a><span v-if="signer.currentresend == 1 && isGreaterThan24Hours(applicant.sent_pdate)" class="text-muted"> | <button class="btn btn-sm btn-link btn-resend" @click="resendDS(applicant.sid)" title="Resend DocuSign to the pending recepient."><i class="fa-solid fa-paper-plane"></i></button></span>
                              <span class="status_date">{{ signer.date }}</span>
                            </span>
                            <span v-if="signer.status == 'declined'">
                              <a :href="'mailto:'+signer.email">{{ signer.name }}</a> - <span class="text-uppercase fw-bold">DECLINED</span><br/>
                              <span class="status_date">{{ signer.date }}</span>
                            </span>
                          </span>
                        </span>
                      </div>
                      <div v-if="applicant.status == 'reviewed' && applicant.sent_preview == 1 && applicant.change_request == 0">
                        <span class="popper-text">{{ convertDateFormat(applicant.sent_pdate, 'datetime', true) }}</span><span v-if="isGreaterThan24Hours(applicant.sent_pdate)"> | <button class="btn btn-sm btn-link btn-resend" @click="resendPI(applicant.sid)" title="Resend offer letter preview to the PI."><i class="fa-solid fa-paper-plane"></i></button></span>
                      </div>
                    </td>
                    <td><a href="" @click="selectRecord(applicant)" data-bs-toggle="modal" data-bs-target="#modal-applicant"><i class="fa-solid fa-pen-to-square"></i></a><span v-if="statusChecker(applicant.status) === 'rejectable' && !viewermode"> | <a data-bs-toggle="modal" href="" @click="selectRecord(applicant)" data-bs-target="#modalRejectApp"><i class="fa-solid fa-circle-xmark" title="Reject this application."></i></a></span><span v-if="statusChecker(applicant.status) === 'voidable' && !viewermode"> | <a data-bs-toggle="modal" href="" @click="selectRecord(applicant)" data-bs-target="#modalVoidApp"><i class="fa-solid fa-ban" title="Cancel DocuSign for this application."></i></a> | <a data-bs-toggle="modal" href="" @click="selectRecord(applicant)" data-bs-target="#modalCompApp"><i class="fa-solid fa-circle-check" title="Manually mark application complete."></i></a></span><span v-if="applicant.status == 'completed'"> | <a :href="linkGenerator(applicant)"><i class="fa-solid fa-rotate-right" title="Resubmit/extend this application."></i></a></span></td>
                  </tr>
                </tbody>
              </table>
              <nav v-if="fullLength > pageSize" aria-label="Page navigation">
                <ul class="pagination pagination-sm justify-content-center">
                  <li class="page-item"><button class="page-link" @click="firstPage"><i class="fa-solid fa-angles-left"></i></button></li>
                  <li class="page-item"><button class="page-link" @click="prevPage"><i class="fa-solid fa-angle-left"></i></button></li>
                  <li class="page-item" v-for="n in totalPages" :key="n">
                    <button class="page-link" @click="goToPage(n)">{{ n }}</button>
                  </li>
                  <li class="page-item"><button class="page-link" @click="nextPage"><i class="fa-solid fa-angle-right"></i></button></li>
                  <li class="page-item"><button class="page-link" @click="lastPage"><i class="fa-solid fa-angles-right"></i></button></li>
                </ul>
              </nav>
            </div>
            <div v-else>
              <div class="alert alert--info">There is currently no record in this section.</div>
            </div>
          </div>
        </div>
      </div>
      <!--Reject App Modal-->
      <div class="modal fade" id="modalRejectApp">
        <div class="modal-dialog">
          <div class="modal-content">
            <!-- Modal body -->
            <form method="post" @submit.prevent="rejectApp">
              <div class="modal-body">
                <div class="row">
                  <div class="col-md-12">
                    <p>Are you sure you want to reject the application# <strong><span id="modalRejectAppNO">{{ selectedRecord.sid }}</span></strong> for <strong>{{ selectedRecord.gsr_fname }} {{ selectedRecord.gsr_lname }}</strong>?</p>
                  </div>
                  <div class="col-md-12 mt-3">
                    <input type="text" id="rejectreason" name="rejectreason" placeholder="Optional Reason" />
                  </div>
                  <div class="col-md-12">
                    <p class="text-muted small">The PI or the Submitter will not be notified.</p>
                  </div>
                </div>
              </div>
              <!-- Modal footer -->
              <div class="modal-footer">
                <button type="button" class="btn btn-primary btn-sm" data-bs-dismiss="modal" @click="unsetSelectedRecord()">No</button>
                <button type="submit" class="btn btn-primary btn-sm">Yes</button>
                <input type="hidden" name="mode" value="rejectapp" />
                <input type="hidden" name="sid" id="modalRejectAppsid" :value="selectedRecord.sid" />
              </div>
            </form>
          </div>
        </div>
      </div>
      <!--Void App Modal-->
      <div class="modal fade" id="modalVoidApp">
        <div class="modal-dialog">
          <div class="modal-content">
            <!-- Modal body -->
            <form method="post" @submit.prevent="voidApp">
              <div class="modal-body">
                <div class="row">
                  <div class="col-md-12">
                    <p>Are you sure you want to void the application# <strong><span id="modalVoidAppNO">{{ selectedRecord.sid }}</span></strong> for <strong>{{ selectedRecord.gsr_fname }} {{ selectedRecord.gsr_lname }}</strong>?</p>
                  </div>
                  <div class="col-md-12">
                    <input type="checkbox" id="restart_app" name="restart_app" value="Restart" />
                    <label class="radio-check-label" for="restart_app">Restart this application</label>
                  </div>
                  <div class="col-md-12 mt-3">
                    <input type="text" id="voidreason" name="voidreason" placeholder="Reason (required)" required/>
                  </div>
                  <div class="col-md-12">
                    <p class="text-muted small">The PI or the Submitter will not be notified.</p>
                  </div>
                </div>
              </div>
              <!-- Modal footer -->
              <div class="modal-footer">
                <button type="button" class="btn btn-primary btn-sm" data-bs-dismiss="modal" @click="unsetSelectedRecord()">No</button>
                <button type="submit" class="btn btn-primary btn-sm">Yes</button>
                <input type="hidden" name="mode" value="voidapp" />
                <input type="hidden" name="sid" id="modalVoidAppsid" :value="selectedRecord.sid" />
                <input type="hidden" name="envid" id="envid" :value="selectedRecord.envelope_id" />
              </div>
            </form>
          </div>
        </div>
      </div>
      <!--Complete App Modal-->
      <div class="modal fade" id="modalCompApp">
        <div class="modal-dialog">
          <div class="modal-content">
            <!-- Modal body -->
            <form method="post" @submit.prevent="compApp">
              <div class="modal-body">
                <div class="row">
                  <div class="col-md-12">
                    <p>Are you sure you want to manually mark complete the application# <strong><span id="modalCompAppNO">{{ selectedRecord.sid }}</span></strong> for <strong>{{ selectedRecord.gsr_fname }} {{ selectedRecord.gsr_lname }}</strong>?</p>
                  </div>
                  <div class="col-md-12">
                    <p class="text-muted small">This action cannot be undone.</p>
                  </div>
                </div>
              </div>
              <!-- Modal footer -->
              <div class="modal-footer">
                <button type="button" class="btn btn-primary btn-sm" data-bs-dismiss="modal" @click="unsetSelectedRecord()">No</button>
                <button type="submit" class="btn btn-primary btn-sm">Yes</button>
                <input type="hidden" name="mode" value="compapp" />
                <input type="hidden" name="sid" id="modalCompAppsid" :value="selectedRecord.sid" />
              </div>
            </form>
          </div>
        </div>
      </div>
      <!--Edit Modal-->
      <div class="modal fade" id="modal-applicant" tabindex="-1" aria-labelledby="modal-applicant-label" aria-hidden="true" ref="appEditModal" data-bs-backdrop="static">
        <div class="modal-dialog modal-xl">
          <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title fs-5" id="modal-applicant-label">Edit Application for {{ selectedRecord.gsr_fname }} {{ selectedRecord.gsr_lname }}</h3>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click="unsetSelectedRecord()"></button>
            </div>
            <form method="post" @submit.prevent="updateApplicant">
              <div class="modal-body">
                <fieldset class="form-group mt-2">
                  <legend  class="w-auto">PI Information</legend>
                  <div class="row">
                    <div class="col-md-4">
                      <label for="pi_fname" class="input-label required" id="pi_fname-title">PI First Name</label>
                      <input type="text" id="pi_fname" name="pi_fname" :value="selectedRecord.pi_fname" @input="updateField('pi_fname', $event)" :disabled="selectedRecord.status === 'completed' || selectedRecord.status === 'rejected'" required>
                    </div>
                    <div class="col-md-4">
                      <label for="pi_lname" class="input-label required" id="pi_lname-title">PI Last Name</label>
                      <input type="text" id="pi_lname" name="pi_lname" :value="selectedRecord.pi_lname" @input="updateField('pi_lname', $event)" :disabled="selectedRecord.status === 'completed' || selectedRecord.status === 'rejected'" required>
                    </div>
                    <div class="col-md-4">
                      <label for="pi_title" class="input-label required" id="pi_title-title">PI Title</label>
                      <input type="text" id="pi_title" name="pi_title" :value="selectedRecord.pi_title" @input="updateField('pi_title', $event)" :disabled="selectedRecord.status === 'completed' || selectedRecord.status === 'rejected'" required>
                    </div>
                  </div>
                  <div class="row mt-4">
                    <div class="col-md-6">
                      <label for="pi_email" class="input-label required" id="pi_email-title">PI E-mail</label>
                      <input type="email" id="pi_email" name="pi_email" :value="selectedRecord.pi_email" @input="updateField('pi_email', $event)" :disabled="selectedRecord.status === 'completed' || selectedRecord.status === 'rejected'" required>
                    </div>
                    <div class="col-md-6">
                      <label class="input-label required" id="pi_dept-title">Department</label>
                      <select name="pi_dept" id="pi_dept" v-model="selectedRecord.depid" :disabled="selectedRecord.status === 'completed' || selectedRecord.status === 'rejected'">
                        <option>-- select an option --</option>
                        <option v-for="department in departments" :key="department.id" :value="department.id">{{ department.department }}</option>
                      </select>
                    </div>
                  </div>
                </fieldset>
                <fieldset class="form-group mt-2">
                  <legend  class="w-auto">Applicant Information</legend>
                  <div class="row">
                    <div class="col-md-6">
                      <label for="gsr_fname" class="input-label required" id="gsr_fname-title">First Name</label>
                      <input type="text" id="gsr_fname" name="gsr_fname" :value="selectedRecord.gsr_fname" @input="updateField('gsr_fname', $event)" :disabled="selectedRecord.status === 'completed' || selectedRecord.status === 'rejected'" required>
                    </div>
                      <div class="col-md-6">
                        <label for="gsr_lname" class="input-label required" id="gsr_lname-title">Last Name</label>
                        <input type="text" id="gsr_lname" name="gsr_lname" :value="selectedRecord.gsr_lname" @input="updateField('gsr_lname', $event)" :disabled="selectedRecord.status === 'completed' || selectedRecord.status === 'rejected'" required>
                      </div>
                  </div>
                  <div class="row mt-4">
                    <div class="col-md-6">
                      <label for="gsr_email" class="input-label required" id="gsr_email-title">E-mail</label>
                      <input type="email" id="gsr_email" name="gsr_email" :value="selectedRecord.gsr_email" @input="updateField('gsr_email', $event)" :disabled="selectedRecord.status === 'completed' || selectedRecord.status === 'rejected'" required>
                    </div>
                    <div class="col-md-6">
                      <label for="worksite" class="input-label required" id="worksite-title">Worksite</label>
                      <input type="text" id="worksite" name="worksite" :value="selectedRecord.worksite" @input="updateField('worksite', $event)" :disabled="selectedRecord.status === 'completed' || selectedRecord.status === 'rejected'" required>
                    </div>
                  </div>
                </fieldset>
                <fieldset class="form-group mt-2">
                  <legend  class="w-auto">Recruitment Information</legend>
                  <div class="row">
                    <div class="col-md-4">
                      <div>
                        <label class="radio-check-main-label required" id="appt_type-title">Appointment Type</label>
                      </div>
                      <div>
                        <input type="radio" id="appt_type_new" name="appt_type" value="New" v-model="selectedRecord.appt_type" :disabled="selectedRecord.status === 'completed' || selectedRecord.status === 'rejected'">
                        <label class="radio-check-label" for="appt_type_new">New</label>
                        <input type="radio" id="appt_type_extension" name="appt_type" value="Extension" v-model="selectedRecord.appt_type" :disabled="selectedRecord.status === 'completed' || selectedRecord.status === 'rejected'">
                        <label class="radio-check-label" for="appt_type_extension">Extension</label>
                      </div>
                    </div>
                    <div class="col-md-4">
                      <label for="fte_percentage" class="input-label required" id="fte_percentage-title">FTE Percentage</label>
                      <input type="text" id="fte_percentage" name="fte_percentage" :value="selectedRecord.fte_percentage" @input="updateField('fte_percentage', $event)" :disabled="selectedRecord.status === 'completed' || selectedRecord.status === 'rejected'" required>
                    </div>
                    <div class="col-md-4">
                      <label for="step" class="input-label" :class="{'required': curlRole === 'editor' && curlTeam === 'adv'}" id="step-title">Salary Point</label>
                      <input type="text" id="step" name="step" :value="selectedRecord.step" @input="updateField('step', $event)" :disabled="selectedRecord.status === 'completed' || selectedRecord.status === 'rejected'" :required="curlRole === 'editor' && curlTeam === 'adv'">
                    </div>
                  </div>
                  <div class="row mt-4">
                    <div class="col-md-4">
                      <div>
                        <label class="radio-check-main-label required" id="appt_term-title">Appointment Term</label>
                      </div>
                      <div>
                        <input type="radio" id="appt_term_academic" name="appt_term" value="Academic Year" v-model="selectedRecord.appt_term" :disabled="selectedRecord.status === 'completed' || selectedRecord.status === 'rejected'">
                        <label class="radio-check-label" for="appt_term_academic">Academic Year</label>
                        <input type="radio" id="appt_term_summer" name="appt_term" value="Summer" v-model="selectedRecord.appt_term" :disabled="selectedRecord.status === 'completed' || selectedRecord.status === 'rejected'">
                        <label class="radio-check-label" for="appt_term_summer">Summer</label>
                      </div>
                    </div>
                    <div class="col-md-8">
                      <label for="account" class="input-label" :class="{'required': curlRole === 'editor' && curlTeam === 'am'}" id="account-title">Account</label>
                      <input type="text" id="account" name="account" :value="selectedRecord.account" @input="updateField('account', $event)" :disabled="selectedRecord.status === 'completed' || selectedRecord.status === 'rejected'" :required="curlRole === 'editor' && curlTeam === 'am'">
                    </div>
                  </div>
                  <div class="row mt-4">
                    <div class="col-md-6">
                      <label for="start_date" class="input-label required" id="start_date-title">Start Date</label>
                      <input type="date" id="start_date" name="start_date" :value="selectedRecord.start_date" @input="updateField('start_date', $event)" :disabled="selectedRecord.status === 'completed' || selectedRecord.status === 'rejected'" required>
                    </div>
                    <div class="col-md-6">
                      <label for="end_date" class="input-label required" id="end_date-title">End Date</label>
                      <input type="date" id="end_date" name="end_date" :value="selectedRecord.end_date" @input="updateField('end_date', $event)" :disabled="selectedRecord.status === 'completed' || selectedRecord.status === 'rejected'" required>
                    </div>
                  </div>
                  <div class="row mt-4">
                    <div class="col-md-12">
                      <label for="job_description" class="input-label required" id="job_description-title">Job Description</label>
                      <textarea id="job_description" name="job_description" rows="7" :value="selectedRecord.job_description" @input="updateField('job_description', $event)" :disabled="selectedRecord.status === 'completed' || selectedRecord.status === 'rejected'" required></textarea>
                    </div>
                  </div>
                  <div class="row mt-4">
                    <div class="col-md-6">
                      <div>
                        <label class="radio-check-main-label required" id="training_grant-title">Is this a training grant?</label>
                      </div>
                      <div>
                        <input type="radio" id="training_grant_yes" name="training_grant" value="Yes" v-model="selectedRecord.training_grant" :disabled="selectedRecord.status === 'completed' || selectedRecord.status === 'rejected'">
                        <label class="radio-check-label" for="training_grant_yes">Yes</label>
                        <input type="radio" id="training_grant_no" name="training_grant" value="No" v-model="selectedRecord.training_grant" :disabled="selectedRecord.status === 'completed' || selectedRecord.status === 'rejected'">
                        <label class="radio-check-label" for="training_grant_no">No</label>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div>
                        <label class="radio-check-main-label required" id="grad_group-title">Student Grad Group</label>
                      </div>
                      <div>
                        <input type="radio" id="grad_group_gbse" name="grad_group" value="GBSE" v-model="selectedRecord.grad_group" :disabled="selectedRecord.status === 'completed' || selectedRecord.status === 'rejected'">
                        <label class="radio-check-label" for="grad_group_gbse">GBSE</label>
                        <input type="radio" id="grad_group_gfsc" name="grad_group" value="GFSC" v-model="selectedRecord.grad_group" :disabled="selectedRecord.status === 'completed' || selectedRecord.status === 'rejected'">
                        <label class="radio-check-label" for="grad_group_gfsc">GFSC</label>
                        <input type="radio" id="grad_group_gven" name="grad_group" value="GVEN" v-model="selectedRecord.grad_group" :disabled="selectedRecord.status === 'completed' || selectedRecord.status === 'rejected'">
                        <label class="radio-check-label" for="grad_group_gven">GVEN</label>
                        <input type="radio" id="grad_group_other" name="grad_group" value="Other" v-model="selectedRecord.grad_group" :disabled="selectedRecord.status === 'completed' || selectedRecord.status === 'rejected'">
                        <label class="radio-check-label" for="grad_group_other">Other</label>
                      </div>
                      <div>
                        <input v-if="selectedRecord.grad_group === 'Other'" type="text" id="grad_group_other_text" name="grad_group_other_text" :value="selectedRecord.other_grad_group" @input="updateField('other_grad_group', $event)">
                      </div>
                    </div>
                  </div>
                  <div class="row mt-4">
                    <div class="col-md-8">
                      <div>
                        <label class="radio-check-main-label required" id="additional_funding-title">Is the student recieving any additional funding?
                        </label>
                      </div>
                      <div>
                        <input type="checkbox" id="additional_funding_none" name="additional_funding[]" value="None" v-model="selectedFunding" :disabled="selectedRecord.status === 'completed' || selectedRecord.status === 'rejected'">
                        <label class='radio-check-label' for='additional_funding_none'>None</label>
                        <input type="checkbox" id="additional_funding_ext_fel" name="additional_funding[]" value="External Fellowship" v-model="selectedFunding" :disabled="selectedRecord.status === 'completed' || selectedRecord.status === 'rejected'">
                        <label class='radio-check-label' for='additional_funding_ext_fel'>External Fellowship</label>
                        <input type="checkbox" id="additional_funding_int_fel" name="additional_funding[]" value="Internal Fellowship" v-model="selectedFunding" :disabled="selectedRecord.status === 'completed' || selectedRecord.status === 'rejected'">
                        <label class='radio-check-label' for='additional_funding_int_fel'>Internal Fellowship</label>
                        <input type="checkbox" id="additional_funding_taship" name="additional_funding[]" value="TAship" v-model="selectedFunding" :disabled="selectedRecord.status === 'completed' || selectedRecord.status === 'rejected'">
                        <label class='radio-check-label' for='additional_funding_taship'>TAship</label>
                        <input type="checkbox" id="additional_funding_other" name="additional_funding[]" value="Other" v-model="otherAdditionalFunding" :checked="otherAdditionalFunding" :disabled="selectedRecord.status === 'completed' || selectedRecord.status === 'rejected'">
                        <label class='radio-check-label' for='additional_funding_other'>Other</label>
                      </div>
                      <div v-if="otherAdditionalFunding" class="mt-2">
                        <input v-if="otherAdditionalFunding" type="text" id="additional_funding_other_text" name="additional_funding_other_text" :value="otherAdditionalFundingText" :disabled="selectedRecord.status === 'completed' || selectedRecord.status === 'rejected'">
                      </div>
                    </div>
                    <div class="col-md-4" v-if="selectedFunding.includes('TAship')">
                      <label for="ta_percentage" class="input-label" id="ta_percentage-title">TAShip Percentage</label>
                      <input v-if="selectedFunding.includes('TAship')" type="text" id="ta_percentage" name="ta_percentage" :value="selectedRecord.ta_percentage" @input="updateField('ta_percentage', $event)" :disabled="selectedRecord.status === 'completed' || selectedRecord.status === 'rejected'">
                    </div>
                  </div>
                </fieldset>
                <fieldset class="form-group mt-2">
                  <legend  class="w-auto">Advising Use Only</legend>
                  <div class="row">
                    <div class="col-md-6">
                      <label for="salary" class="input-label" :class="{'required': curlRole === 'editor' && curlTeam === 'adv'}" id="salary-title">Proposed Salary</label>
                      <input type="text" id="salary" name="salary" :value="selectedRecord.salary" @input="updateField('salary', $event)" :disabled="selectedRecord.status === 'completed' || selectedRecord.status === 'rejected' || selectedRecord.status === 'pi_approved'" :required="curlRole === 'editor' && curlTeam === 'adv'">
                    </div>
                    <div class="col-md-6">
                      <div>
                        <label class="radio-check-main-label" :class="{'required': curlRole === 'editor' && curlTeam === 'adv'}" id="pep_status-title">PEP Status</label>
                      </div>
                      <div>
                        <input type="radio" id="pep_required" name="pep" value="Required" v-model="selectedRecord.pep_status" :disabled="selectedRecord.status === 'completed' || selectedRecord.status === 'rejected'" :required="curlRole === 'editor' && curlTeam === 'adv'">
                        <label class="radio-check-label" for="pep_required">Required</label>
                        <input type="radio" id="pep_notrequired" name="pep" value="Not Required" v-model="selectedRecord.pep_status" :disabled="selectedRecord.status === 'completed' || selectedRecord.status === 'rejected'" :required="curlRole === 'editor' && curlTeam === 'adv'">
                        <label class="radio-check-label" for="pep_notrequired">Not Required</label>
                        <input type="radio" id="pep_pending" name="pep" value="Pending" v-model="selectedRecord.pep_status" :disabled="selectedRecord.status === 'completed' || selectedRecord.status === 'rejected'" :required="curlRole === 'editor' && curlTeam === 'adv'">
                        <label class="radio-check-label" for="pep_pending">Pending</label>
                      </div>
                    </div>
                  </div>
                  <div class="row mt-4">
                    <div class="col-md-6">
                      <label for="gsr_address" class="input-label" id="gsr_address-title">GSR Address</label>
                      <textarea id="gsr_address" name="gsr_address" rows="3" :value="selectedRecord.gsr_address" @input="updateField('gsr_address', $event)" :disabled="selectedRecord.status === 'completed' || selectedRecord.status === 'rejected' || selectedRecord.status === 'pi_approved'"></textarea>
                    </div>
                    <div class="col-md-6">
                      <label for="pep_comment" class="input-label" id="pep_comment-title">Additional Comment for PEP</label>
                      <textarea id="pep_comment" name="pep_comment" rows="3" :value="selectedRecord.pep_comment" @input="updateField('pep_comment', $event)" :disabled="selectedRecord.status === 'completed' || selectedRecord.status === 'rejected'"></textarea>
                    </div>
                  </div>
                </fieldset>
                <fieldset class="form-group mt-2" v-if="selectedRecord.comments">
                  <legend  class="w-auto">User Comment</legend>
                  <div class="row">
                    <div class="col-md-12">
                      {{ selectedRecord.comments }}
                    </div>
                  </div>
                </fieldset>
                <fieldset class="form-group mt-2">
                  <legend  class="w-auto">History Logs</legend>
                  <div class="row">
                    <div class="col-md-12 table-responsive">
                      <table class='table text-muted log-table'>
                        <tr v-for="history in selectedRecord.history">
                          <td style='width: 200px'>{{ convertDateFormat(history.date, 'datetime', true) }}</td>
                          <td><span v-if="history.user">{{ history.user }}&nbsp;</span><span v-html="removeAllBackslashes(history.action)"></span></td>
                        </tr>
                      </table>
                    </div>
                  </div>
                </fieldset>
                <fieldset class="form-group mt-2">
                  <legend  class="w-auto">Admin Use</legend>
                  <div class="row">
                    <div class="col-md-12">
                      <input type="checkbox" id="approved_am" name="approved_am" value="1" v-model="approvedAM" :checked="approvedAM" :disabled="selectedRecord.status === 'completed' || selectedRecord.status === 'rejected'">
                      <label class='radio-check-label' for='approved_am'>Approved by Account Management Team</label>
                      <input type="checkbox" id="approved_advising" name="approved_advising" value="1" v-model="approvedAdvising" :checked="approvedAdvising" :disabled="selectedRecord.status === 'completed' || selectedRecord.status === 'rejected'">
                      <label class='radio-check-label' for='approved_advising'>Approved by Advising Section</label>
                      <input type="checkbox" id="approved_pi" name="approved_pi" value="1" v-model="approvedPI" :checked="approvedPI" :disabled="(curlRole === 'editor' && curlTeam !== 'adv') || selectedRecord.status === 'completed' || selectedRecord.status === 'rejected'">
                      <label class='radio-check-label' for='approved_pi'>PI Approved</label>
                    </div>
                  </div>
                </fieldset>
              </div>
              <div class="modal-footer">
                <input type="hidden" name="fullname" id="fullname" :value="selectedRecord.gsr_fname+' '+selectedRecord.gsr_lname" />
                <input type="hidden" name="sid" id="sid" :value="selectedRecord.sid" />
                <button type="button" class="btn btn-primary btn-sm" data-bs-dismiss="modal" @click="unsetSelectedRecord()">Close</button>
                <button v-if="!viewermode &&  selectedRecord.status !== 'pending' &&  selectedRecord.status !== 'completed' && selectedRecord.status !== 'rejected'" type="submit" class="btn btn-primary btn-sm" name="save-app" :disabled="!approvedAM && !approvedAdvising">Save</button>
                <a v-if="!viewermode &&  selectedRecord.status === 'reviewed' && selectedRecord.sent_preview === '0' && selectedRecord.orgsalary !== null && selectedRecord.orgsalary !== ''" class="btn btn-primary btn-sm" :href="'https://web.bftv.ucdavis.edu/gsr/app-preview.php?sid='+selectedRecord.sid+'&pi=false'" target="_blank">Preview Offer Letter</a>
                <button v-if="!viewermode &&  selectedRecord.status === 'reviewed' && selectedRecord.sent_preview === '0' && selectedRecord.orgsalary !== null && selectedRecord.orgsalary !== ''" type="submit" class="btn btn-primary btn-sm" name="send-pi-app" >Send Offer Letter Preview to PI</button>
                <button v-if="!viewermode &&  (selectedRecord.status === 'reviewed' || selectedRecord.status === 'pi_approved')" type="submit" class="btn btn-primary btn-sm" name="docusign-app" :disabled="!approvedPI">Save & Initiate DocuSign</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="mt-5">
      <div class="alert alert--error">
        <i class="far fa-times-circle fa-2x alert--error-icon"></i> You are not authorized to view this page.
      </div>
    </div>
  </div>
</template>

<script>
  import axios from 'axios';
  //import { navmixin } from '../mixins/navMixin.js';
  import { globalMixin } from '../mixins/globalMixin.js';
  export default {
    mixins: [globalMixin],
    name: 'Apps',
    watch: {
      listData(newList) {
        this.totalPages = Math.ceil(newList.length / this.pageSize);
      }
    },
    data() {
      return {
        searchTextGsr: '',
        searchTextPi: '',
        searchStatus: '',
        search: false,
        routeWatcher: null,
      }
    },
    mounted: function(){
      /* this.$nextTick(() => {
        setTimeout(() => {
            const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]');
            const popoverList = [...popoverTriggerList].map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl));
        }, 2000); // Delay of 2 second
      }); */
      this.routeWatcher = Vue.watch(
        () => this.$route,
        (to, from) => {
          if (this.$store.state.username) {
            this.processRouteChange(to);
          }
        },
        { immediate: true }
      );
      this.userNameWatcher = Vue.watch(
        () => this.$store.state.username,
        (newUserName) => {
          if (newUserName) {
            this.processRouteChange(this.$route);
          }
        }
      );
    },
    beforeUnmount() {
      if (this.routeWatcher) {
        this.routeWatcher(); // This stops the watcher
      }
      if (this.userNameWatcher) {
        this.userNameWatcher(); // This stops the watcher
      }
    },
    methods: {
      processRouteChange(to) {
        const url = 'https://web.bftv.ucdavis.edu/gsr/data-get.php';
        let status;
        switch (to.name) {
          case 'pen-apps':
            status = 'pending';
            break;
          case 'new-apps':
            status = 'new';
            break;
          case 'rej-apps':
            status = 'rejected';
            break;
          case 'com-apps':
            status = 'completed';
            break;
          case 'my-apps':
            status = 'all';
            break;
          default:
            status = 'new';
        }
        this.getDataList(url, 'data', status);
      },
      searchAp() {
        var searched = false;
        this.search = true;
        let conditions = [];
        var sid = document.getElementById('sid_search').value;
        var piname = document.getElementById('pi_name_search').value;
        var piemail = document.getElementById('pi_email_search').value;
        var gsrname = document.getElementById('gsr_name_search').value;
        var gsremail = document.getElementById('gsr_email_search').value;
        var department = document.getElementById('department_search').value;
        var appointment_type = document.getElementById('appt_type_search').value;
        var status = document.getElementById('status_search').value;
        var appointment_term = document.getElementById('appt_term_search').value;
        var sd_eq = document.getElementById('sd_equalizer').value;
        var startdate = document.getElementById('start_date_search').value;
        var ed_eq = document.getElementById('ed_equalizer').value;
        var enddate = document.getElementById('end_date_search').value;
        var fte = document.getElementById('fte_search').value;
        var step = document.getElementById('step_search').value;
        var account = document.getElementById('account_search').value;
        var gradgroup = document.getElementById('grad_group_search').value;
        var traininggrant = document.getElementById('training_grant_search').value;
        var addtionalfunding = document.getElementById('additional_funding_search').value;
        var salary = document.getElementById('salary_search').value;
        var pepstatus = document.getElementById('pep_search').value;
        let newConditions;
        if(sid != ''){
          if(!searched){
            newConditions = this.allListData.filter(e => e.sid.includes(sid));
            searched = true;
          } else {
            newConditions = newConditions.filter(e => e.sid.includes(sid));
          }
        } else if(piname != ''){
          if(!searched){
            newConditions = this.allListData.filter(e => e.pi_fname.toLowerCase().includes(piname.toLowerCase()) || e.pi_lname.toLowerCase().includes(piname.toLowerCase()));
            searched = true;
          } else {
            newConditions = newConditions.filter(e => e.pi_fname.toLowerCase().includes(piname.toLowerCase()) || e.pi_lname.toLowerCase().includes(piname.toLowerCase()));
          }
        }
        if(piemail != ''){
          if(!searched){
            newConditions = this.allListData.filter(e => e.pi_email.toLowerCase().includes(piemail.toLowerCase()));
            searched = true;
          } else {
            newConditions = newConditions.filter(e => e.pi_email.toLowerCase().includes(piemail.toLowerCase()));
          }
        }
        if(gsrname != ''){
          if(!searched){
            newConditions = this.allListData.filter(e => e.gsr_fname.toLowerCase().includes(gsrname.toLowerCase()) || e.gsr_lname.toLowerCase().includes(gsrname.toLowerCase()));
            searched = true;
          } else {
            newConditions = newConditions.filter(e => e.gsr_fname.toLowerCase().includes(gsrname.toLowerCase()) || e.gsr_lname.toLowerCase().includes(gsrname.toLowerCase()));
          }
        }
        if(gsremail != ''){
          if(!searched){
            newConditions = this.allListData.filter(e => e.gsr_email.toLowerCase().includes(gsremail.toLowerCase()));
            searched = true;
          } else {
            newConditions = newConditions.filter(e => e.gsr_email.toLowerCase().includes(gsremail.toLowerCase()));
          }
        }
        if(department != ''){
          if(!searched){
            newConditions = this.allListData.filter(e => e.depid && e.depid == department);
            searched = true;
          } else {
            newConditions = newConditions.filter(e => e.depid && e.depid == department);
          }
        }
        if(appointment_type != ''){
          if(!searched){
            newConditions = this.allListData.filter(e => e.appt_type && e.appt_type.toLowerCase().includes(appointment_type.toLowerCase()));
            searched = true;
          } else {
            newConditions = newConditions.filter(e => e.appt_type && e.appt_type.toLowerCase().includes(appointment_type.toLowerCase()));
          }
        }
        if(status != ''){
          switch (status) {
            case '1':
              if(!searched){
                newConditions = this.allListData.filter(e => e.status_sort == 1);
                searched = true;
              } else {
                newConditions = newConditions.filter(e => e.status_sort == 1);
              }
              break;
            case '2':
              if(!searched){
                newConditions = this.allListData.filter(e => e.status_sort == 2);
                searched = true;
              } else {
                newConditions = newConditions.filter(e => e.status_sort == 2);
              }
              break;
            case '3':
              if(!searched){
                newConditions = this.allListData.filter(e => e.status_sort == 3);
                searched = true;
              } else {
                newConditions = newConditions.filter(e => e.status_sort == 3);
              }
              break;
            case '4':
              if(!searched){
                newConditions = this.allListData.filter(e => e.status_sort == 4);
                searched = true;
              } else {
                newConditions = newConditions.filter(e => e.status_sort == 4);
              }
              break;
            case '5':
              if(!searched){
                newConditions = this.allListData.filter(e => e.status_sort == 5);
                searched = true;
              } else {
                newConditions = newConditions.filter(e => e.status_sort == 5);
              }
              break;
            case '6':
              if(!searched){
                newConditions = this.allListData.filter(e => e.status_sort == 6);
                searched = true;
              } else {
                newConditions = newConditions.filter(e => e.status_sort == 6);
              }
              break;
            case '7':
              if(!searched){
                newConditions = this.allListData.filter(e => e.status_sort == 7);
                searched = true;
              } else {
                newConditions = newConditions.filter(e => e.status_sort == 7);
              }
              break;
            case '8':
              if(!searched){
                newConditions = this.allListData.filter(e => e.status_sort == 8);
                searched = true;
              } else {
                newConditions = newConditions.filter(e => e.status_sort == 8);
              }
              break;
          }
        }
        if(appointment_term != ''){
          if(!searched){
            newConditions = this.allListData.filter(e => e.appt_term && e.appt_term.toLowerCase().includes(appointment_term.toLowerCase()));
            searched = true;
          } else {
            newConditions = newConditions.filter(e => e.appt_term && e.appt_term.toLowerCase().includes(appointment_term.toLowerCase()));
          }
        }
        if(startdate != ''){
          startdate = new Date(startdate);
          if(!searched){
            if(sd_eq == 'on'){
              newConditions = this.allListData.filter(e => {
                let startDate = new Date(e.start_date);
                return startDate.getTime() === startdate.getTime();
              });
            } else if(sd_eq == 'before'){
              newConditions = this.allListData.filter(e => {
                let startDate = new Date(e.start_date);
                return startDate < startdate;
              });
            } else if(sd_eq == 'after'){
              newConditions = this.allListData.filter(e => {
                let startDate = new Date(e.start_date);
                return startDate > startdate;
              });
            } else if(sd_eq == 'not'){
              newConditions = this.allListData.filter(e => {
                let startDate = new Date(e.start_date);
                return startDate.getTime() !== startdate.getTime();
              });
            }
            searched = true;
          } else {
            if(sd_eq == 'on'){
              newConditions = newConditions.filter(e => {
                let startDate = new Date(e.start_date);
                return startDate.getTime() === startdate.getTime();
              });
            } else if(sd_eq == 'before'){
              newConditions = newConditions.filter(e => {
                let startDate = new Date(e.start_date);
                return startDate < startdate;
              });
            } else if(sd_eq == 'after'){
              newConditions = newConditions.filter(e => {
                let startDate = new Date(e.start_date);
                return startDate > startdate;
              });
            } else if(sd_eq == 'not'){
              newConditions = newConditions.filter(e => {
                let startDate = new Date(e.start_date);
                return startDate.getTime() !== startdate.getTime();
              });
            }
          }
        }
        if(enddate != ''){
          enddate = new Date(enddate);
          if(!searched){
            if(ed_eq == 'on'){
              newConditions = this.allListData.filter(e => {
                let endDate = new Date(e.end_date);
                return endDate.getTime() === enddate.getTime();
              });
            } else if(ed_eq == 'before'){
              newConditions = this.allListData.filter(e => {
                let endDate = new Date(e.end_date);
                return endDate < enddate;
              });
            } else if(ed_eq == 'after'){
              newConditions = this.allListData.filter(e => {
                let endDate = new Date(e.end_date);
                return endDate > enddate;
              });
            } else if(ed_eq == 'not'){
              newConditions = this.allListData.filter(e => {
                let endDate = new Date(e.end_date);
                return endDate.getTime() !== enddate.getTime();
              });
            }
            searched = true;
          } else {
            if(ed_eq == 'on'){
              newConditions = newConditions.filter(e => {
                let endDate = new Date(e.end_date);
                return endDate.getTime() === enddate.getTime();
              });
            } else if(ed_eq == 'before'){
              newConditions = newConditions.filter(e => {
                let endDate = new Date(e.end_date);
                return endDate < enddate;
              });
            } else if(ed_eq == 'after'){
              newConditions = newConditions.filter(e => {
                let endDate = new Date(e.end_date);
                return endDate > enddate;
              });
            } else if(ed_eq == 'not'){
              newConditions = newConditions.filter(e => {
                let endDate = new Date(e.end_date);
                return startendDateDate.getTime() !== enddate.getTime();
              });
            }
          }
        }
        if(fte != ''){
          if(!searched){
            newConditions = this.allListData.filter(e => e.fte_percentage && e.fte_percentage.toLowerCase().includes(fte.toLowerCase()));
            searched = true;
          } else {
            newConditions = newConditions.filter(e => e.fte_percentage && e.fte_percentage.toLowerCase().includes(fte.toLowerCase()));
          }
        }
        if(step != ''){
          if(!searched){
            newConditions = this.allListData.filter(e => e.step && e.step.toLowerCase().includes(step.toLowerCase()));
            searched = true;
          } else {
            newConditions = newConditions.filter(e => e.step && e.step.toLowerCase().includes(step.toLowerCase()));
          }
        }
        if(account != ''){
          if(!searched){
            newConditions = this.allListData.filter(e => e.account && e.account.toLowerCase().includes(account.toLowerCase()));
            searched = true;
          } else {
            newConditions = newConditions.filter(e => e.account && e.account.toLowerCase().includes(account.toLowerCase()));
          }
        }
        if(gradgroup != ''){
          if(!searched){
            newConditions = this.allListData.filter(e => e.grad_group && (e.grad_group.toLowerCase().includes(gradgroup.toLowerCase()) || e.other_grad_group.toLowerCase().includes(gradgroup.toLowerCase())));
            searched = true;
          } else {
            newConditions = newConditions.filter(e => e.grad_group && (e.grad_group.toLowerCase().includes(gradgroup.toLowerCase()) || e.other_grad_group.toLowerCase().includes(gradgroup.toLowerCase())));
          }
        }
        if(traininggrant != ''){
          if(!searched){
            newConditions = this.allListData.filter(e => e.training_grant && e.training_grant.toLowerCase().includes(traininggrant.toLowerCase()));
            searched = true;
          } else {
            newConditions = newConditions.filter(e => e.training_grant && e.training_grant.toLowerCase().includes(traininggrant.toLowerCase()));
          }
        }
        if(addtionalfunding != ''){
          if(!searched){
            newConditions = this.allListData.filter(e => e.additional_funding && e.additional_funding.toLowerCase().includes(addtionalfunding.toLowerCase()));
            searched = true;
          } else {
            newConditions = newConditions.filter(e => e.additional_funding && e.additional_funding.toLowerCase().includes(addtionalfunding.toLowerCase()));
          }
        }
        if(salary != ''){
          if(!searched){
            newConditions = this.allListData.filter(e => e.salary && e.salary.toLowerCase().includes(salary.toLowerCase()));
            searched = true;
          } else {
            newConditions = newConditions.filter(e => e.salary && e.salary.toLowerCase().includes(salary.toLowerCase()));
          }
        }
        if(pepstatus != ''){
          if(!searched){
            newConditions = this.allListData.filter(e => e.pep_status && e.pep_status.toLowerCase().includes(pepstatus.toLowerCase()));
            searched = true;
          } else {
            newConditions = newConditions.filter(e => e.pep_status && e.pep_status.toLowerCase().includes(pepstatus.toLowerCase()));
          }
        }
        if(searched){
          conditions.push(...newConditions);
          this.listData = conditions;
        } else {
          this.search = false;
        }
      },
      clearSearch() {
        this.search = false;
        document.getElementById('sid_search').value = '';
        document.getElementById('pi_name_search').value = '';
        document.getElementById('pi_email_search').value = '';
        document.getElementById('gsr_name_search').value = '';
        document.getElementById('gsr_email_search').value = '';
        document.getElementById('department_search').value = '';
        document.getElementById('appt_type_search').value = '';
        document.getElementById('status_search').value = '';
        document.getElementById('appt_term_search').value = '';
        document.getElementById('sd_equalizer').value = 'on';
        document.getElementById('start_date_search').value = '';
        document.getElementById('ed_equalizer').value = 'on';
        document.getElementById('end_date_search').value = '';
        document.getElementById('fte_search').value = '';
        document.getElementById('step_search').value = '';
        document.getElementById('account_search').value = '';
        this.listData = this.currentOriginalListData;
      },
      removeAllBackslashes(inputString) {
        return inputString.replace(/\\/g, "");
      },
      statusChecker: function(status){
        if(status == 'new' || status == 'reviewed' || status == 'pi_approved'){
          return 'rejectable';
        } else if(status == 'pending'){
          return 'voidable';
        } else if(status == 'completed'){
          return 'completed';
        } else if(status == 'rejected'){
          return 'rejected';
        }
      },
      popoverContent(signers) {
        var content = '<ul>';
        for(var i=0; i<signers.length; i++){
          content += '<li class="popper-text"><a href="mailto:'+signers[i]['email']+'">'+signers[i]['name']+'</a> - <span class="text-uppercase fw-bold text-muted">'+signers[i]['status']+'</span><br/><span class="text-muted">'+signers[i]['date']+'</span></li>';
        }
        content += '</ul>';
        return content;
      },
      isGreaterThan24Hours(datetimeString) {
        const givenDateTime = new Date(datetimeString);
        const currentDateTime = new Date();
        const differenceInMilliseconds = currentDateTime - givenDateTime;
        const hoursDifference = differenceInMilliseconds / (1000 * 60 * 60);
        return hoursDifference > 24;
      },
      linkGenerator(app){
        var webform_url = "https://bftv.ucdavis.edu/gsr";
        var pifname = app.pi_fname;
        var pilname = app.pi_lname;
        var pititle = app.pi_title;
        var piemail = app.pi_email;
        var pidep = app.depcode;
        var gsrfname = app.gsr_fname;
        var gsrlname = app.gsr_lname;
        var gsremail = app.gsr_email;
        var worksite = app.worksite;
        var appttype = 'Extension';
        var jobdescription = app.job_description;
        var url = "faculty_pi_firstname="+pifname+"&faculty_pi_lastname="+pilname+"&title="+pititle+"&faculty_pi_email="+piemail+"&faculty_pi_department="+pidep+"&first_name="+gsrfname+"&last_name="+gsrlname+"&e_mail_address="+gsremail+"&worksite="+worksite+"&appointment_type="+appttype+"&job_description="+jobdescription;
        var finalUrl = webform_url+"?data="+btoa(unescape(encodeURIComponent(url)));
        return finalUrl;
      },
      updateApplicant(e) {
        e.preventDefault();
        this.loading = true;
        var modal = bootstrap.Modal.getInstance(document.getElementById('modal-applicant'));
        var sid = document.getElementById('sid').value;
        var pfn = document.getElementById('pi_fname').value;
        var pln = document.getElementById('pi_lname').value;
        var pt = document.getElementById('pi_title').value;
        var pe = document.getElementById('pi_email').value;
        //var pd = document.querySelector('input[name="pi_dept"]:checked').value;
        var pd = document.getElementById('pi_dept').value;
        var gfn = document.getElementById('gsr_fname').value;
        var gln = document.getElementById('gsr_lname').value;
        var ge = document.getElementById('gsr_email').value;
        var gw = document.getElementById('worksite').value;
        var apt = document.querySelector('input[name="appt_type"]:checked').value;
        var fte = document.getElementById('fte_percentage').value;
        var st = document.getElementById('step').value;
        var apter = document.querySelector('input[name="appt_term"]:checked').value;
        var ac = document.getElementById('account').value;
        var sd = document.getElementById('start_date').value;
        var ed = document.getElementById('end_date').value;
        var jd = document.getElementById('job_description').value;
        var tg = document.querySelector('input[name="training_grant"]:checked').value;
        var sgg = '';
        var adfo = '';
        var tap = '';
        if(document.querySelector('input[name="grad_group"]:checked').value == 'Other'){
          sgg = document.getElementById('grad_group_other_text').value;
        } else {
          sgg = document.querySelector('input[name="grad_group"]:checked').value;
        }

        var adf = document.querySelectorAll('input[name="additional_funding[]"]:checked');
        var selectedadf = [];
        adf.forEach((checkbox) => {
          selectedadf.push(checkbox.value);
        });
        if(selectedadf.includes('Other')){
          adfo = document.getElementById('additional_funding_other_text').value;
          selectedadf = selectedadf.map((value) => (value === 'Other' ? adfo : value));
        }
        if(selectedadf.includes('TAship')){
          tap = document.getElementById('ta_percentage').value;
        } else {
          tap = '';
        }
        selectedadf = selectedadf.join(', ');

        var ps = document.getElementById('salary').value;
        var gsradd = document.getElementById('gsr_address').value;
        var peps = '';
        if(document.querySelector('input[name="pep"]:checked')){
          peps = document.querySelector('input[name="pep"]:checked').value;
        }
        var pepc = document.getElementById('pep_comment').value;
        var apam = document.getElementById('approved_am').checked;
        var apad = document.getElementById('approved_advising').checked;
        var apfname = document.getElementById('fullname').value;
        if(apam == true){
            apam = 1;
        } else {
          apam = 0;
        }
        if(apad == true){
          apad = 1;
        } else {
          apad = 0;
        }
        var action = '';
        if(e.submitter.name == 'docusign-app'){
          action = 'docusign'
        } else if(e.submitter.name == 'send-pi-app'){
          action = 'send_preview'
        } else {
          action = 'save'
        }
        modal.hide();
        axios.post('https://web.bftv.ucdavis.edu/gsr/data-update.php', {
          crossDomain: true,
          myid: this.username,
          token: this.token,
          mode: action,
          sid: sid, pi_fname: pfn, pi_lname: pln, pi_title: pt, pi_email: pe, pi_dept: pd,
          gsr_fname: gfn, gsr_lname: gln, gsr_fullname: apfname, gsr_email: ge, worksite: gw,
          appt_type: apt, fte_percentage: fte, step: st, appt_term: apter, account: ac, start_date: sd, end_date: ed, job_description: jd, training_grant: tg, grad_group: sgg, additional_funding: selectedadf, ta_percentage: tap, approved_am: apam, approved_ad: apad, salary: ps, gsr_address: gsradd, pep_status: peps, pep_comment: pepc,
          headers: {
            'Content-Type': 'application/json'
          }
        }).then(response => {
          this.screenmsg = response.data.message,
          this.screenmsgtype = "success",
          this.screenmsgicon = this.successicon,
          this.allListData = response.data.updated_data.data,
          this.listData = response.data.updated_data.data,
          this.filterObjectByKeyValue("status", "pending")
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
          this.loading = false;
        });
        window.scrollTo(0, 150);
      },
      rejectApp(e) {
        e.preventDefault();
        this.loading = true;
        var modal = bootstrap.Modal.getInstance(document.getElementById('modalRejectApp'));
        var sid = document.getElementById('modalRejectAppsid').value;
        var reason = document.getElementById('rejectreason').value;
        axios.post('https://web.bftv.ucdavis.edu/gsr/data-reject.php', {
          crossDomain: true,
          myid: this.username,
          token: this.token,
          sid: sid,
          reason: reason,
          headers: {
            'Content-Type': 'application/json'
          }
        }).then(response => {
          this.screenmsg = response.data.message,
          this.screenmsgtype = "success",
          this.screenmsgicon = this.successicon,
          this.allListData = response.data.updated_data.data,
          this.listData = response.data.updated_data.data,
          this.filterObjectByKeyValue("status", "new")
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
      voidApp(e) {
        e.preventDefault();
        this.loading = true;
        var modal = bootstrap.Modal.getInstance(document.getElementById('modalVoidApp'));
        var sid = document.getElementById('modalVoidAppsid').value;
        var reason = document.getElementById('voidreason').value;
        var envid = document.getElementById('envid').value;
        var restart = document.getElementById('restart_app').checked;
        if(restart == true){
          restart = 1;
        } else {
          restart = 0;
        }
        axios.post('https://web.bftv.ucdavis.edu/gsr/data-void.php', {
          crossDomain: true,
          myid: this.username,
          token: this.token,
          sid: sid,
          reason: reason,
          envid: envid,
          restart: restart,
          headers: {
            'Content-Type': 'application/json'
          }
        }).then(response => {
          this.screenmsg = response.data.message,
          this.screenmsgtype = "success",
          this.screenmsgicon = this.successicon,
          this.allListData = response.data.updated_data.data,
          this.listData = response.data.updated_data.data,
          this.filterObjectByKeyValue("status", "pending")
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
      compApp(e) {
        e.preventDefault();
        this.loading = true;
        var modal = bootstrap.Modal.getInstance(document.getElementById('modalCompApp'));
        var sid = document.getElementById('modalCompAppsid').value;
        axios.post('https://web.bftv.ucdavis.edu/gsr/data-complete.php', {
          crossDomain: true,
          myid: this.username,
          token: this.token,
          sid: sid,
          headers: {
            'Content-Type': 'application/json'
          }
        }).then(response => {
          this.screenmsg = response.data.message,
          this.screenmsgtype = "success",
          this.screenmsgicon = this.successicon,
          this.allListData = response.data.updated_data.data,
          this.listData = response.data.updated_data.data,
          this.filterObjectByKeyValue("status", "pending")
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
      resendDS(id){
        this.loading = true;
        var mode = 'docusign';
        axios.post('https://web.bftv.ucdavis.edu/gsr/app-reminder.php', {
          crossDomain: true,
          myid: this.username,
          token: this.token,
          sid: id,
          mode: mode,
          headers: {
            'Content-Type': 'application/json'
          }
        }).then(response => {
          this.screenmsg = response.data.message,
          this.screenmsgtype = "success",
          this.screenmsgicon = this.successicon,
          this.allListData = response.data.updated_data.data,
          this.listData = response.data.updated_data.data,
          this.filterObjectByKeyValue("status", "pending")
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
          this.loading = false;
        });
        window.scrollTo(0, 400);
      },
      resendPI(id){
        this.loading = true;
        var mode = 'resend_preview';
        axios.post('https://web.bftv.ucdavis.edu/gsr/data-update.php', {
          crossDomain: true,
          myid: this.username,
          token: this.token,
          sid: id,
          mode: mode,
          headers: {
            'Content-Type': 'application/json'
          }
        }).then(response => {
          this.screenmsg = response.data.message,
          this.screenmsgtype = "success",
          this.screenmsgicon = this.successicon,
          this.allListData = response.data.updated_data.data,
          this.listData = response.data.updated_data.data,
          this.filterObjectByKeyValue("status", "pending")
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
          this.loading = false;
        });
        window.scrollTo(0, 400);
      },
      exportToCSV() {
        let csvContent = '';
        const header_row = ['Key App ID', 'PI First Name', 'PI Last Name', 'PI Title', 'PI E-mail', 'Department', 'GSR First Name', 'GSR Last Name', 'GSR E-mail', 'Worksite', 'Appointment Term', 'Start Date', 'End Date', 'Appointment Type', 'FTE%', 'Step', 'Account', 'Salary', 'Status', 'PEP Status'];

        const fields = ['sid', 'pi_fname', 'pi_lname', 'pi_title', 'pi_email', 'department', 'gsr_fname', 'gsr_lname', 'gsr_email', 'worksite', 'appt_term', 'start_date', 'end_date', 'appt_type', 'fte_percentage', 'step', 'account', 'salary', 'status_exp', 'pep_status'];

        csvContent += header_row.join(",") + "\r\n";

        this.filteredData.forEach(row => {
          let rowData = fields.map(field => JSON.stringify(row[field] || '', this.replacer));
          csvContent += rowData.join(",") + "\r\n";
        });

        // Create Blob for CSV content
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'GSR_Data.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      },
      replacer(key, value) {
        if (value === null || value === undefined) {
          return '';
        }
        return value;
      }
    },
    computed: {
      hasApplicants() {
        return Object.keys(this.currentOriginalListData).length > 0;
      },
      filteredData() {
        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        let conditions = [];
        if (this.searchTextGsr.length >= 3) {
          conditions.push(applicant => this.matchesSearch(applicant.gsr_fname, this.searchTextGsr) || this.matchesSearch(applicant.gsr_lname, this.searchTextGsr));
        }
        if (this.searchTextPi.length >= 3) {
          conditions.push(applicant => this.matchesSearch(applicant.pi_fname, this.searchTextPi) || this.matchesSearch(applicant.pi_lname, this.searchTextPi));
        }
        if(this.searchStatus != ''){
          if(this.searchStatus == 1){
            conditions.push(applicant => { return applicant.status_sort == 2 });
          } else if(this.searchStatus == 2){
            conditions.push(applicant => { return applicant.status_sort == 3 });
          } else if(this.searchStatus == 3){
            conditions.push(applicant => { return applicant.status_sort == 4 });
          } else if(this.searchStatus == 4){
            conditions.push(applicant => { return applicant.status_sort == 5 });
          } else if(this.searchStatus == 5){
            conditions.push(applicant => { return applicant.status_sort == 6 });
          }
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