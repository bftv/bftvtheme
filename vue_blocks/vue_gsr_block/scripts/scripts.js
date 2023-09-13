//Authenticate users if needed
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        let originalRequest = error.config;
        if(error.code == 'ERR_NETWORK' || error.response.status == 401){
            w = 600;
            h = 800;
            url = 'https://web.bftv.ucdavis.edu/gsr/auth.php';
            LeftPosition = (screen.width) ? (screen.width-w)/2 : 0;
            TopPosition = (screen.height) ? (screen.height-h)/2 : 0;
            settings = 'height='+h+',width='+w+',top='+TopPosition+',left='+LeftPosition+',scrollbars=yes,resizable';
            popupWindow = window.open(url,"CAS - Central Authentication Service",settings);
            window.addEventListener('message', function(e) {
                // e.data hold the message from child
                if(e.data == "Authenticated."){
                    popupWindow.close();
                    originalRequest._retry = true;
                    //return axios(originalRequest);
                    this.location.reload();
                } else if (e.data == "Authentication failed."){
                    popupWindow.close();
                    originalRequest._retry = false;
                    return Promise.reject(e.data);
                }
            } , false);
            //return Promise.reject();
        }
        return Promise.reject(error);
    }
);

/* Global Functions */
var navmixin = {
    data: function() {
        return {
            username: drupalSettings.assignments.username,
            email: drupalSettings.assignments.useremail,
            role: drupalSettings.assignments.role,
            token: drupalSettings.assignments.token,
            curlCode: '',
            curlRole: '',
            authenticated: '',
            authText: '',
            accesslevel1: false,
            accesslevel2: false,
            viewermode: false,
        }
    },
    beforeMount: function(){console.log(this.loginid);
        axios.post('https://web.bftv.ucdavis.edu/gsr/connector.php', {
            crossDomain: true,
            loginid: this.username,
            token: this.token,
            email: this.email,
            headers: {
                'Content-Type': 'application/json'
                }
        }).then(response => {console.log(response);
            this.curlCode = response.data.response
            if(this.curlCode == 1 || this.curlCode == 3){
                this.curlRole = response.data.userrole,
                this.authenticated = response.data.authenticated,
                this.check_auth()
                if(this.curlRole == 'admin'){
                    this.accesslevel1 = true;
                    this.accesslevel2 = true;
                    this.viewermode = false;
                } else if(this.curlRole == 'editor'){
                    this.accesslevel1 = true;
                    this.viewermode = false;
                } else {
                    this.viewermode = true;
                }
            } else {
                this.curlRole = 'anonymous'
            }
        }).catch(error => {
            console.log(error)
        });
    },
    methods: {
        check_auth(){
            if(this.authenticated){
                this.authText = 'Authenticated'
            } else {
                this.authText = 'not authenticated'
            }
        }
    }
}
var mixin = {
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
            loading: true
        }
    },

    methods: {
        getDataList: function(url, type, section=null){
            axios.get(url).then(response => {
                if(type == 'data'){
                    this.listData = response.data.data,
                    id = this.$route.query.sid
                    if(id){
                        this.filterObjectByKeyValue("sid", id);
                    } else {
                        if(section == 'new'){
                            this.filterObjectByKeyValue("status", "new");
                        } else if (section == 'pending'){
                            this.filterObjectByKeyValue("status", "pending");
                        } else if (section == 'completed'){
                            this.filterObjectByKeyValue("status", "completed");
                        } else if (section == 'rejected'){
                            this.filterObjectByKeyValue("status", "rejected");
                        }
                    }
                } else if(type == 'users'){
                    this.listData = response.data.users,
                    this.listData.sort(this.sortFname)
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
                    if(time){
                        return `${month}/${day}/${year} | `+hours+`:`+minutes+`:`+seconds;
                    } else {
                        return `${month}/${day}/${year}`;
                    }
                } else {
                    return 'Invalid date format';
                }
            }
        },
        removeAllBackslashes(inputString) {
            return inputString.replace(/\\/g, "");
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
        loader: function(){
            this.loading = true;
        },
        addUser(e) {
            e.preventDefault();
            this.loading = true;
            modal = bootstrap.Modal.getInstance(document.getElementById('modal-add-user'));
            usrloginid = document.getElementById('usrloginid').value;
            usremail = document.getElementById('useremail').value;
            axios.post('https://web.bftv.ucdavis.edu/gsr/user-add.php', {
                crossDomain: true,
                loginid: usrloginid,
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
                this.screenmsg = error.data.message,
                this.screenmsgtype = "error",
                this.screenmsgicon = this.erroricon,
                this.code = error.response.status
            }).finally(() => {
                modal.hide();
                this.loading = false;
            });
            window.scrollTo(0, 400);
        },
        updateUser(e) {
            e.preventDefault();
            this.loading = true;
            modal = bootstrap.Modal.getInstance(document.getElementById('modal-user'));
            usrloginid = document.getElementById('loginid').value;
            usrrole = document.getElementById('role').value;
            usremail = document.getElementById('email').value;
            usrstatus = document.getElementById('status_check').checked;
            usrname = document.getElementById('fullname').value;
            if(usrstatus == true){
                usrstatus = 1;
            } else {
                usrstatus = 0;
            }
            if(e.submitter.name == 'refresh-user'){
                action = 'refresh'
            } else {
                action = 'save'
            }
            axios.post('https://web.bftv.ucdavis.edu/gsr/user-update.php', {
                crossDomain: true,
                loginid: usrloginid,
                role: usrrole,
                email: usremail,
                enabled: usrstatus,
                name: usrname,
                myid: this.username,
                token: this.token,
                mode: action,
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
                this.screenmsg = error.response.data.message,
                this.screenmsgtype = "error",
                this.screenmsgicon = this.erroricon,
                this.code = error.response.data.status
            }).finally(() => {
                modal.hide();
                this.loading = false;
            });
            window.scrollTo(0, 400);
        },
        updateApplicant(e) {
            e.preventDefault();
            this.loading = true;
            modal = bootstrap.Modal.getInstance(document.getElementById('modal-applicant'));
            sid = document.getElementById('sid').value;
            pfn = document.getElementById('pi_fname').value;
            pln = document.getElementById('pi_lname').value;
            pt = document.getElementById('pi_title').value;
            pe = document.getElementById('pi_email').value;
            pd = document.querySelector('input[name="pi_dept"]:checked').value;
            gfn = document.getElementById('gsr_fname').value;
            gln = document.getElementById('gsr_lname').value;
            ge = document.getElementById('gsr_email').value;
            gw = document.getElementById('worksite').value;
            apt = document.querySelector('input[name="appt_type"]:checked').value;
            fte = document.getElementById('fte_percentage').value;
            st = document.getElementById('step').value;
            ac = document.getElementById('account').value;
            sd = document.getElementById('start_date').value;
            ed = document.getElementById('end_date').value;
            //gn = document.getElementById('grant_name').value;
            //fa = document.getElementById('fund_agency').value;
            jd = document.getElementById('job_description').value;
            tg = document.querySelector('input[name="training_grant"]:checked').value;
            if(document.querySelector('input[name="grad_group"]:checked').value == 'Other'){
                sgg = document.getElementById('grad_group_other_text').value;
            } else {
                sgg = document.querySelector('input[name="grad_group"]:checked').value;
            }

            adf = document.querySelectorAll('input[name="additional_funding[]"]:checked');
            selectedadf = [];
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

            apam = document.getElementById('approved_am').checked;
            apad = document.getElementById('approved_advising').checked;
            apfname = document.getElementById('fullname').value;
            ps = document.getElementById('salary').value;
            gsradd = document.getElementById('gsr_address').value;
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
            if(e.submitter.name == 'docusign-app'){
                action = 'docusign'
            } else if(e.submitter.name == 'send-pi-app'){
                action = 'send_preview'
            } else {
                action = 'save'
            }
            axios.post('https://web.bftv.ucdavis.edu/gsr/data-update.php', {
                crossDomain: true,
                myid: this.username,
                token: this.token,
                mode: action,
                sid: sid, pi_fname: pfn, pi_lname: pln, pi_title: pt, pi_email: pe, pi_dept: pd,
                gsr_fname: gfn, gsr_lname: gln, gsr_fullname: apfname, gsr_email: ge, worksite: gw,
                appt_type: apt, fte_percentage: fte, step: st, account: ac, start_date: sd, end_date: ed, job_description: jd, training_grant: tg, grad_group: sgg,
                additional_funding: selectedadf, ta_percentage: tap, approved_am: apam, approved_ad: apad, salary: ps, gsr_address: gsradd,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(response => {//console.log(response);
                this.screenmsg = response.data.message,
                this.screenmsgtype = "success",
                this.screenmsgicon = this.successicon,
                this.listData = response.data.updated_data.data,
                this.filterObjectByKeyValue("status", "new")
            }).catch(error => {console.log(error);
                this.screenmsg = error.response.data.message,
                this.screenmsgtype = "error",
                this.screenmsgicon = this.erroricon,
                this.code = error.response.data.status
            }).finally(() => {
                modal.hide();
                this.loading = false;
            });
            window.scrollTo(0, 150);
        },
        rejectApp(e) {
            e.preventDefault();
            this.loading = true;
            modal = bootstrap.Modal.getInstance(document.getElementById('modalRejectApp'));
            sid = document.getElementById('sid').value;
            reason = document.getElementById('rejectreason').value;
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
                this.screenmsg = error.response.data.message,
                this.screenmsgtype = "error",
                this.screenmsgicon = this.erroricon,
                this.code = error.response.data.status
            }).finally(() => {
                modal.hide();
                this.loading = false;
            });
            window.scrollTo(0, 400);
        },
    },
    computed: {
        hasApplicants() {
          return Object.keys(this.listData).length > 0;
        },
    }
}
/* End Global Functions */

const newApps = {
    mixins: [navmixin, mixin],
    template: '#data-template',

    mounted: function(){
        url = 'https://web.bftv.ucdavis.edu/gsr/data-get.php',
        this.getDataList(url, 'data', 'new')
        this.$nextTick(() => {
            if (typeof $ !== 'undefined') {
              $(this.$refs.appEditModal).on('hidden.bs.modal', this.unsetSelectedRecord);
            }
        });
    },
}

const penApps = {
    mixins: [navmixin, mixin],
    template: '#data-template',

    mounted: function(){
        url = 'https://web.bftv.ucdavis.edu/gsr/data-get.php',
        this.getDataList(url, 'data', 'pending')
        this.$nextTick(() => {
            if (typeof $ !== 'undefined') {
              $(this.$refs.appEditModal).on('hidden.bs.modal', this.unsetSelectedRecord);
            }
        });
    },
}

const comApps = {
    mixins: [navmixin, mixin],
    template: '#data-template',

    mounted: function(){
        url = 'https://web.bftv.ucdavis.edu/gsr/data-get.php',
        this.getDataList(url, 'data', 'completed')
        this.$nextTick(() => {
            if (typeof $ !== 'undefined') {
              $(this.$refs.appEditModal).on('hidden.bs.modal', this.unsetSelectedRecord);
            }
        });
    },
}

const rejApps = {
    mixins: [navmixin, mixin],
    template: '#data-template',

    mounted: function(){
        url = 'https://web.bftv.ucdavis.edu/gsr/data-get.php',
        this.getDataList(url, 'data', 'rejected')
        this.$nextTick(() => {
            if (typeof $ !== 'undefined') {
              $(this.$refs.appEditModal).on('hidden.bs.modal', this.unsetSelectedRecord);
            }
        });
    },
}

const listUsers = {
    mixins: [navmixin, mixin],
    template: '#list-users-template',

    mounted: function(){
        url = 'https://web.bftv.ucdavis.edu/gsr/users-get.php',
        this.getDataList(url, 'users')
    },
}

/* Router */
var router = VueRouter.createRouter({
	history: VueRouter.createWebHashHistory(),
    linkExactActiveClass: "active",

	routes: [
        {
            path: '/new-apps',
            name: 'new-apps',
            component: newApps
        },
        {
            path: '/view:id',
            name: 'GsrMgmtFiltered',
            component: newApps,
        },
        {
            path: '/pen-apps',
            name: 'pen-apps',
            component: penApps
        },
        {
            path: '/com-apps',
            name: 'com-apps',
            component: comApps
        },
        {
            path: '/rej-apps',
            name: 'rej-apps',
            component: rejApps
        },
        {
            path: '/users-list',
            name: 'users-list',
            component: listUsers
        },
        {
			path: '/:pathMatch(.*)*',
            name: 'new-apps',
			component: newApps,
            props: true
		},
	]
});
/* End Router */

/* Components */
const TheNavigation = {
    mixins: [navmixin],
    template: '#nav-template',
    methods: {
        loader() {
          this.loading = true;
        }
      }
};
/* End Components */

/* Initialize */
const app = Vue.createApp({});
app.component('the-navigation', TheNavigation);
app.use(router).mount('#gsr-block');
/* End Initialize */