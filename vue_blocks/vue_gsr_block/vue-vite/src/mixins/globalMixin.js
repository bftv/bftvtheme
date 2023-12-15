export var globalMixin = {
  data: function() {
    return {
      message: "",
      screenmsg: "",
      screenmsgtype: "",
      screenmsgicon: "",
      erroricon: "far fa-times-circle fa-2x alert--error-icon",
      successicon: "far fa-check-circle fa-2x alert--success-icon",
      hidebody: false,
      success: null,
      code: null,
      listData: [],
      metaData: [],
      pendingTab:  false,
      departments: [],
      selectedRecord: '',
      initialState: {},
      selectedFunding: [],
      searchValue: '',
      selectedpis: [],
      otherAdditionalFunding: 0,
      otherAdditionalFundingText: '',
      approvedAM: 0,
      approvedAdvising: 0,
      approvedPI: 0,
      inherit: false,
      loading: true
    }
  },

  methods: {
    getDataList: function(url, type, section=null){
      axios.post(url, {
        myid: this.username,
        token: this.token
      }).then(response => {
        if(type == 'data'){
          this.listData = response.data.data;
          this.metaData = response.data.metadata;
          this.departments = response.data.departments;
          var id = false;
          if(this.$route.query.sid){
            id = this.$route.query.sid
          }
          if(id){
              this.filterObjectByKeyValue("sid", id);
          } else {
            if(section == 'new'){
              this.filterObjectByKeyValue("status", "new");
              this.pendingTab = false;
              this.screenmsg = '';
            } else if (section == 'pending'){
              this.filterObjectByKeyValue("status", "pending");
              this.pendingTab = true;
              this.screenmsg = '';
            } else if (section == 'completed'){
              this.filterObjectByKeyValue("status", "completed");
              this.pendingTab = false;
              this.screenmsg = '';
            } else if (section == 'rejected'){
              this.filterObjectByKeyValue("status", "rejected");
              this.pendingTab = false;
              this.screenmsg = '';
            }
          }
        } else if(type == 'users'){
          this.listData = response.data.users,
          this.departments = response.data.departments,
          this.listData.sort(this.sortFname)
        } else {
          this.listData = response.data.dataList,
          this.departments = response.data.departments
        }
        this.message = response.data.message,
        this.success = response.data.success,
        this.code = response.data.code
      }).catch(error => {
          if(error.response.status == 404 || error.response.status == 403 || error.response.status == 401 || error.response.status == 400){
            this.screenmsg = error.response.data.message,
            this.screenmsgtype = "error",
            this.screenmsgicon = this.erroricon,
            this.code = error.response.status,
            this.hidebody = true
          }
      }).finally(() => {
        this.loading = false
      })
    },
    sortFname: function(a, b){
      if(a['firstname'] === b['firstname']){
        return 0;
      } else {
        return (a['firstname'] < b['firstname']) ? -1 : 1;
      }
    },
    convertDateFormat(dateString, type, time=false) {
      if(type == 'date'){
        const dateParts = dateString.split('-');
        if (dateParts.length === 3) {
          const year = dateParts[0];
          const month = dateParts[1];
          const day = dateParts[2];
          return `${month}/${day}/${year}`;
        } else {
          return 'Invalid date format';
        }
      } else if(type == 'datetime'){
        const [datePart, timePart] = dateString.split(' ');
        const dateParts = datePart.split('-');
        const [hours, minutes, seconds] = timePart.split(':');
        if (dateParts.length === 3 && hours && minutes && seconds) {
          const year = dateParts[0];
          const month = dateParts[1];
          const day = dateParts[2];
          let hour = parseInt(hours, 10);
          const ampm = hour >= 12 ? 'PM' : 'AM';
          hour = hour % 12;
          hour = hour ? hour : 12;
          if(time){
            return `${month}/${day}/${year} | ${hour.toString().padStart(2, '0')}:${minutes}:${seconds} ${ampm}`;
          } else {
            return `${month}/${day}/${year}`;
          }
        } else {
          return 'Invalid date format';
        }
      }
    },
    filterObjectByKeyValue(key, value) {
      if(value != 'pending'){
        this.listData = Object.fromEntries(
          Object.entries(this.listData).filter(([_, obj]) => obj[key] === value)
        );
      } else {
        this.listData = Object.fromEntries(
          Object.entries(this.listData).filter(([_, obj]) => obj[key] === value || obj.status === "reviewed" || obj.status === "pi_approved")
        );
      }
    },
    selectRecord: function(row){
      this.selectedRecord = { ...row };
      if(this.selectedRecord.grad_group){
        if(!['GBSE', 'GFSC', 'GVEN'].includes(this.selectedRecord.grad_group)){
          if (this.selectedRecord.grad_group !== 'Other') {
            this.selectedRecord.other_grad_group = this.selectedRecord.grad_group
          }
          this.selectedRecord.grad_group = 'Other'
        }
      }
      if(this.selectedRecord.additional_funding){
        this.selectedFunding = this.selectedRecord.additional_funding.split(',').map(item => item.trim());
        const predefinedOptions = ['None', 'External Fellowship', 'Internal Fellowship', 'TAship'];
        const otherOptions = this.selectedFunding.filter(item => !predefinedOptions.includes(item));
        if(otherOptions.length > 0){
          this.otherAdditionalFunding = 1;
          this.otherAdditionalFundingText = otherOptions.join(', ');
        }
      }
      if(this.selectedRecord.user_history){
        var users = this.selectedRecord.user_history.split(';');
        var datesArray = this.selectedRecord.affected_dates.split(';');
        var actions = this.selectedRecord.history_notes.split(';');
        this.selectedRecord.history = [];
        for (var i = 0; i < users.length; i++) {
          this.selectedRecord.history.push({
            user: i < users.length ? users[i] : '',
            date: i < datesArray.length ? datesArray[i] : '',
            action: i < actions.length ? actions[i] : ''
          });
        }
      }
      if(this.selectedRecord.approved_am){
        this.approvedAM = 1
      }
      if(this.selectedRecord.approved_advising){
        this.approvedAdvising = 1
      }
      if(this.selectedRecord.status == 'pi_approved'){
        this.approvedPI = 1
      }
    },
    unsetSelectedRecord: function(){
      this.selectedFunding = [];
      this.selectedRecord = {};
      this.otherAdditionalFunding = 0;
      this.otherAdditionalFundingText = '';
      this.approvedAM = 0;
      this.approvedAdvising = 0;
      this.approvedPI = 0;
    },
    updateField(fieldName, event) {
      this.selectedRecord[fieldName] = event.target.value;
    },
    statusAnalyzer(status, sent=0, piapproved=0, change_request=0){
      if(status == 'new'){
        return 'Pending AM Review';
      } else if(status == 'reviewed'){
        if(sent == 0 && change_request == 0){
          return 'Pending Advising Review';
        } else if(sent == 1 && change_request == 0){
          return 'Waiting PI Review';
        } else if(sent == 0 && change_request == 1){
          return 'PI Requested Change';
        }
      } else if(status == 'pi_approved'){
        return 'PI Approved - Waiting DocuSign Initiation';
      } else if(status == 'pending'){
        return 'Pending Signature';
      } else if(status == 'completed'){
        return 'Completed';
      } else if(status == 'rejected'){
        return 'Rejected';
      }
    },
    loader: function(){
      this.loading = true;
    },
  },
  computed: {
    inheritSettings: {
      get() {
        return this.selectedRecord.inherit_settings === '1';
      },
      set(value) {
        this.selectedRecord.inherit_settings = value ? '1' : '0';
      }
    }
  }
}