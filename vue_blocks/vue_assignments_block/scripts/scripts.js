const blockID = document.getElementsByClassName('vue-assignments-block')[0].id;

/* const api = axios.create({
    baseURL: 'https://web.bftv.ucdavis.edu/assignments/test.php',
}); */

axios.interceptors.response.use(
    (response) => response,
    (error) => {
        let originalRequest = error.config;
        if(error.code == 'ERR_NETWORK' || error.response.status == 401){
            w = 600;
            h = 800;
            url = 'https://web.bftv.ucdavis.edu/assignments/auth.php';
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
            curlCode: '',//drupalSettings.assignments.curlCode,
            curlRole: '',//drupalSettings.assignments.curlRole,
            accesslevel1: false,
            accesslevel2: false,
        }
    },
    beforeMount: function(){
        axios.post('https://web.bftv.ucdavis.edu/assignments/connector.php', {
            crossDomain: true,
            loginid: this.username,
            token: this.token,
            email: this.email,
            headers: {
                'Content-Type': 'application/json'
                }
        }).then(response => {
            this.curlCode = response.data.response
            if(this.curlCode == 1 || this.curlCode == 3){
                this.curlRole = response.data.userrole
                if(this.curlRole == 'admin'){
                    this.accesslevel1 = true;
                    this.accesslevel2 = true;
                } else if(this.curlRole == 'editor'){
                    this.accesslevel1 = true;
                }
            } else {
                this.curlRole = 'anonymous'
            }
        }).catch(error => {
            console.log(error)
        });
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
            listData: null,
            selectedRecord: '',
            searchValue: '',
            selectedpis: [],
            loading: true
        }
    },

    methods: {
        getDataList: function(url, type){
            axios.get(url).then(response => {
                if(type == 'people'){
                    this.listData = response.data.people
                } else if(type == 'users'){
                    this.listData = response.data.users
                }
                this.listData.sort(this.sortFname),
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
        checkDept: function(dept){
            arr = this.listData.filter(d => (typeof d.department !== "undefined") && d.department.includes(dept));
            if(arr.length > 0){
                return true;
            }
            return false;
        },
        sortFname: function(a, b){
            if(a['firstname'] === b['firstname']){
                return 0;
            } else {
                return (a['firstname'] < b['firstname']) ? -1 : 1;
            }
        },
        filterStaff: function(arr, col, val){
            for(var i=0; i<arr.length; i++){
                if(arr[i][col].includes(val)){
                    return arr[i];
                }
            }
            return false;
        },
        compareAssignee: function(uuid, col, returnee, arrlist = ''){
            if(arrlist == ''){
                arrlist = this.selectedRecord;
            }
            if(col == 'am' && uuid == arrlist.account_manager){
                return returnee;
            } else if(col == 'purchaser' && uuid == arrlist.purchasing_reimburse){
                return returnee;
            } else if(col == 'advising' && uuid == arrlist.advising){
                return returnee;
            } else if(col == 'hr' && uuid == arrlist.hr){
                return returnee;
            } else if(col == 'ap' && uuid == arrlist.academic_personal){
                return returnee;
            } else if(col == 'it' && uuid == arrlist.it_support){
                return returnee;
            } else if(col == 'pay' && uuid == arrlist.payroll){
                return returnee;
            }
        },
        checkSelectedBoxes: function(uuid, col){
            this.selectedpis = [];
            if(col == 'am'){
                pi = this.listPi.filter(p => p.account_manager == uuid);
            } else if(col == 'pr'){
                pi = this.listPi.filter(p => p.purchasing_reimburse == uuid);
            } else if(col == 'adv'){
                pi = this.listPi.filter(p => p.advising == uuid);
            } else if(col == 'hr'){
                pi = this.listPi.filter(p => p.hr == uuid);
            } else if(col == 'ap'){
                pi = this.listPi.filter(p => p.academic_personal == uuid);
            } else if(col == 'it'){
                pi = this.listPi.filter(p => p.it_support == uuid);
            } else if(col == 'pay'){
                pi = this.listPi.filter(p => p.payroll == uuid);
            }
            for(var i=0; i<pi.length; i++){
                this.selectedpis.push(pi[i]['uuid']);
            }
        },
        boxChecked: function(uuid){
            if(this.selectedpis.includes(uuid)){
                return true;
            }
            return false;
        },
        selectedSearch: function(e){
            element = e.srcElement.id;
            el = document.getElementById(element);
            if(el.checked){
                this.selectedpis.push(el.value);
            } else {
                if(this.selectedpis){
                    this.selectedpis = this.selectedpis.filter(item => item !== el.value);
                }
            }
        },
        clearSearch: function(){
            document.getElementById('searchbox').value = '';
            this.searchValue = '';
        },
        expandAll: function(){
            if(this.searchValue.trim().length > 0){
                document.querySelectorAll('.accordion-collapse').forEach(x=>x.classList.add('show'))
            } else {
                document.querySelectorAll('.accordion-collapse').forEach(x=>x.classList.remove('show'))
            }
        },
        sendPI: function(pi){
            this.selectedRecord = pi;
        },
        inputValidate: function(rolerequired){
            if(rolerequired == 'editor'){
                if(this.curlRole == 'admin' || this.curlRole == 'editor'){
                    return undefined;
                }
            } else if(rolerequired == 'admin'){
                if(this.curlRole == 'admin'){
                    return undefined;
                }
            }
            return 'disabled';
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
            axios.post('https://web.bftv.ucdavis.edu/assignments/users-add.php', {
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
                this.screenmsg = error.response.data.message,
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
            axios.post('https://web.bftv.ucdavis.edu/assignments/users-update.php', {
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
                this.code = error.response.status
            }).finally(() => {
                modal.hide();
                this.loading = false;
            });
            window.scrollTo(0, 400);
        },
        updatePi(e) {
            e.preventDefault();
            this.loading = true;
            modal = bootstrap.Modal.getInstance(document.getElementById('modal-faculty'));
            axios.post('https://web.bftv.ucdavis.edu/assignments/pi-update.php', {
                crossDomain: true,
                myid: this.username,
                token: this.token,
                name: document.getElementById('fullname').value,
                uuid: document.getElementById('uuid').value,
                am: document.getElementById('am_drop').value,
                pr: document.getElementById('purchasing_drop').value,
                adv: document.getElementById('advising_drop').value,
                hr: document.getElementById('hr_drop').value,
                ap: document.getElementById('ap_drop').value,
                it: document.getElementById('it_drop').value,
                pay: document.getElementById('payroll_drop').value,
                headers: {
                    'Content-Type': 'application/json'
                  }
            }).then(response => {
                this.screenmsg = response.data.message,
                this.screenmsgtype = "success",
                this.screenmsgicon = this.successicon,
                this.listData = response.data.people,
                this.listData.sort(this.sortFname)
            }).catch(error => {
                this.screenmsg = error.response.data.message,
                this.screenmsgtype = "error",
                this.screenmsgicon = this.erroricon,
                this.code = error.response.status
            }).finally(() => {
                modal.hide();
                this.loading = false;
            });
            window.scrollTo(0, 400);
        },
        updateStaff(e) {
            e.preventDefault();
            this.loading = true;
            this.clearSearch();
            formname = e.srcElement.name;
            collapsename = formname.replace("form", "collapse");
            collapse = new bootstrap.Collapse(document.getElementById(collapsename));
            form = document.forms[formname];
            staffname = form.querySelectorAll('input[name="assigned_person_name"]');
            staffname = staffname[0]['value'];
            staffuuid = form.querySelectorAll('input[name="assigned_person"]');
            staffuuid = staffuuid[0]['value'];
            checkedpis = '';
            col = ''
            for(var i=0; i<this.selectedpis.length; i++){
                checkedpis += this.selectedpis[i]+',';
            }
            if(formname.includes('form-am-')){
                col = 'am';
            } else if (formname.includes('form-pr-')){
                col = 'pr';
            } else if (formname.includes('form-adv-')){
                col = 'adv';
            } else if (formname.includes('form-hr-')){
                col = 'hr';
            } else if (formname.includes('form-ap-')){
                col = 'ap';
            } else if (formname.includes('form-it-')){
                col = 'it';
            } else if (formname.includes('form-pay-')){
                col = 'pay';
            }

            axios.post('https://web.bftv.ucdavis.edu/assignments/staff-update.php', {
                crossDomain: true,
                myid: this.username,
                token: this.token,
                pis: checkedpis,
                uuid: staffuuid,
                name: staffname,
                mode: col,
                headers: {
                    'Content-Type': 'application/json'
                  }
            }).then(response => {
                this.screenmsg = response.data.message,
                this.screenmsgtype = "success",
                this.screenmsgicon = this.successicon,
                this.listData = response.data.people,
                this.listData.sort(this.sortFname)
            }).catch(error => {
                this.screenmsg = error.response.data.message,
                this.screenmsgtype = "error",
                this.screenmsgicon = this.erroricon,
                this.code = error.response.status
            }).finally(() => {
                collapse.hide();
                this.loading = false;
            });
            window.scrollTo(0, 400);
        }
    }
}

var listmixin = {
    computed: {
        listBAE: function(){
            if(this.searchValue.trim().length > 0){
                return this.listData.filter(el => {
                    return ((typeof el.department !== "undefined") && (el.department.includes("Biological and Agricultural Engineering")) && (el.name.toLowerCase().includes(this.searchValue.trim().toLowerCase())));
                })
            }
            if(this.listData){
                return this.listData.filter(el => {
                    return ((typeof el.department !== "undefined") && (el.department.includes("Biological and Agricultural Engineering")));
                })
            }
        },
        listBFTV: function(){
            if(this.searchValue.trim().length > 0){
                return this.listData.filter(el => {
                    return ((typeof el.department !== "undefined") && (el.department.includes("BFTV Cluster")) && (el.name.toLowerCase().includes(this.searchValue.trim().toLowerCase())));
                })
            }
            return this.listData.filter(el => {
                return ((typeof el.department !== "undefined") && (el.department.includes("BFTV Cluster")));
            })
        },
        listFST: function(){
            if(this.searchValue.trim().length > 0){
                return this.listData.filter(el => {
                    return ((typeof el.department !== "undefined") && (el.department.includes("Food Science and Technology")) && (el.name.toLowerCase().includes(this.searchValue.trim().toLowerCase())));
                })
            }
            return this.listData.filter(el => {
                return ((typeof el.department !== "undefined") && (el.department.includes("Food Science and Technology")));
            })
        },
        listVEN: function(){
            if(this.searchValue.trim().length > 0){
                return this.listData.filter(el => {
                    return ((typeof el.department !== "undefined") && (el.department.includes("Viticulture and Enology")) && (el.name.toLowerCase().includes(this.searchValue.trim().toLowerCase())));
                })
            }
            return this.listData.filter(el => {
                return ((typeof el.department !== "undefined") && (el.department.includes("Viticulture and Enology")));
            })
        },
        listStaff: function(){
            if(this.listData){
                return this.listData.filter((el) => {
                    return (typeof el.functional_area !== "undefined");
                })
            }
        },
        listPi: function(){
            if(this.listData){
                return this.listData.filter((el) => {
                    return (typeof el.department !== "undefined");
                })
            }
        },
        listAM: function(){
            if(this.listData){
                return this.listData.filter(el => {
                    return ((typeof el.functional_area !== "undefined") && (el.functional_area.includes("Account Management")));
                })
            }
        },
        listPurchasing: function(){
            if(this.listData){
                return this.listData.filter(el => {
                    return ((typeof el.functional_area !== "undefined") && (el.functional_area.includes("Purchasing")));
                })
            }
        },
        listAdvising: function(){
            if(this.listData){
                return this.listData.filter(el => {
                    return ((typeof el.functional_area !== "undefined") && (el.functional_area.includes("Advising")));
                })
            }
        },
        listHR: function(){
            if(this.listData){
                return this.listData.filter(el => {
                    return ((typeof el.functional_area !== "undefined") && (el.functional_area.includes("Human")) && (el.lastname != "Payroll"));
                })
            }
        },
        listAP: function(){
            if(this.listData){
                return this.listData.filter(el => {
                    return ((typeof el.functional_area !== "undefined") && (el.functional_area.includes("Academic")));
                })
            }
        },
        listIT: function(){
            if(this.listData){
                return this.listData.filter(el => {
                    return ((typeof el.functional_area !== "undefined") && (el.functional_area.includes("IT Support")));
                })
            }
        },
        listPay: function(){
            if(this.listData){
                return this.listData.filter(el => {
                    return ((typeof el.functional_area !== "undefined") && (el.functional_area.includes("Payroll")) && (el.lastname != "HR & Academic Personnel"));
                })
            }
        }
    }
}
/* End Global Functions */

const listPI = Vue.extend({
    mixins: [navmixin, mixin, listmixin],
    template: '#list-pi-template',

    mounted: function(){
        url = 'https://web.bftv.ucdavis.edu/assignments/data-get.php',
        this.getDataList(url, 'people')
    },

    methods: {

    }
})

const listStaff = Vue.extend({
    mixins: [navmixin, mixin, listmixin],
    template: '#list-staff-template',

    mounted: function(){
        url = 'https://web.bftv.ucdavis.edu/assignments/data-get.php',
        this.getDataList(url, 'people')
    },
})

const listUsers = Vue.extend({
    mixins: [navmixin, mixin],
    template: '#list-users-template',

    mounted: function(){
        url = 'https://web.bftv.ucdavis.edu/assignments/users-get.php',
        this.getDataList(url, 'users')
    },
})

const syncData = Vue.extend({
    mixins: [navmixin, mixin],
    template: '#sync-data-template',

    mounted: function(){
        this.loading = false
    },

    methods: {
        syncData: function(type) {
            this.loading = true;
            if(type == 'pi'){
                url = 'https://web.bftv.ucdavis.edu/assignments/sync.php?mode=pi';
            } else if(type == 'staff'){
                url = 'https://web.bftv.ucdavis.edu/assignments/sync.php?mode=staff';
            }
            axios.get(url).then(response => {
                this.screenmsg = response.data.message,
                this.screenmsgtype = "success",
                this.screenmsgicon = this.successicon
            }).catch(error => {
                this.screenmsg = error.response.data.message,
                this.screenmsgtype = "error",
                this.screenmsgicon = this.erroricon,
                this.code = error.response.status
            }).finally(() => {
                this.loading = false;
            });
        }
    }
})


/* Router */
var router = new VueRouter({
	history: true,
    //mode: 'history',
    linkExactActiveClass: "active",

	routes: [
		{
			path: '*',
			component: listStaff,
            props: true
		},
        {
			path: '/',
            name: 'staff-list',
			component: listStaff
		},
        {
            path: '/faculty-list',
            name: 'faculty-list',
            component: listPI
        },
        {
            path: '/users-list',
            name: 'users-list',
            component: listUsers
        },
        {
            path: '/sync-data',
            name: 'sync-data',
            component: syncData
        }
	]
});
/* End Router */

/* Components */
Vue.component('the-navigation', {
    mixins: [navmixin],
    template: '#nav-template'
});
/* End Components */

/* Initialize */
new Vue({
	el: '#assignment-block',
	router
})
/* End Initialize */
