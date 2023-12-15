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
      <div v-if="!hidebody" class="mt-5">
        <div class="row">
          <div v-if="!authenticated" class="col-md-12 mb-3">
            <div class="alert alert--error">
              <i class="far fa-times-circle fa-2x alert--error-icon"></i> Your changes will not be saved as you are not authenticated to the server. <a href="#" @click="authenticate()">Click here</a> to authenticate.
            </div>
          </div>
          <div v-if="pendingTab" class="col-md-12 mb-3">
            <div class="alert alert--warning">
              <i class="fa-regular fa-clock fa-2x alert--error-icon"></i> <span class="text-muted"><small>There is an up to <strong>20-minute delay</strong> with the status updates. This results in not showing status updates for the newly created DocuSign applications.</small></span><br/><span class="fs-6">Last updated: {{ metaData.lastupdated }}</span>
            </div>
          </div>
          <div class="col-md-12">
            <div v-if="hasApplicants" class='table-responsive mt-2'>
              <table class='table table-bordered table-hover table-striped'>
                <thead class='thead-light'>
                  <tr>
                    <th>#</th>
                    <th>Date</th>
                    <th>Period / Apptmt Type</th>
                    <th>Applicant</th>
                    <th>PI/Supervisor</th>
                    <th v-if="pendingTab">Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="applicant in listData">
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
                    <td><a href="" @click="selectRecord(applicant)" data-bs-toggle="modal" data-bs-target="#modal-applicant"><i class="fa-solid fa-pen-to-square"></i></a><span v-if="statusChecker(applicant.status) === 'rejectable'"> | <a data-bs-toggle="modal" href="" @click="selectRecord(applicant)" data-bs-target="#modalRejectApp"><i class="fa-solid fa-circle-xmark" title="Reject this application."></i></a></span><span v-if="statusChecker(applicant.status) === 'voidable'"> | <a data-bs-toggle="modal" href="" @click="selectRecord(applicant)" data-bs-target="#modalVoidApp"><i class="fa-solid fa-ban" title="Cancel DocuSign for this application."></i></a></span></td>
                  </tr>
                </tbody>
              </table>
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
  import { navmixin } from '../mixins/navMixin.js';
  import { globalMixin } from '../mixins/globalMixin.js';
  export default {
    mixins: [navmixin, globalMixin],
    name: 'Apps',
    watch: {
      '$route': {
        immediate: true, // to run the handler immediately when the component is created
        handler(to, from) {
          const url = 'https://web.bftv.ucdavis.edu/gsr/data-get.php';
          let status;

          switch (to.name) { // 'to' is the target Route Object being navigated to.
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
            default:
              status = 'new'; // default status or any other default you want to set
          }

          this.getDataList(url, 'data', status);
        }
      }
    },
    mounted: function(){
      this.$nextTick(() => {
        setTimeout(() => {
            const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]');
            const popoverList = [...popoverTriggerList].map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl));
        }, 2000); // Delay of 2 second
      });
    },
    methods: {
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
        }).then(response => {console.log(response);
          this.screenmsg = response.data.message,
          this.screenmsgtype = "success",
          this.screenmsgicon = this.successicon,
          this.listData = response.data.updated_data.data,
          this.filterObjectByKeyValue("status", "pending")
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
          this.listData = response.data.updated_data.data,
          this.filterObjectByKeyValue("status", "pending")
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
          this.code = error.response.data.status
        }).finally(() => {
          this.loading = false;
        });
        window.scrollTo(0, 400);
      }
    },
    computed: {
      hasApplicants() {
        return Object.keys(this.listData).length > 0;
      },
    }
  };
</script>

<style scoped>


</style>