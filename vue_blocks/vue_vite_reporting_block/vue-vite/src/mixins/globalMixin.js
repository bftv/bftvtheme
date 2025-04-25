import axios from 'axios';
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
            departments: [],
            colleges: [],
            userList: [],
            adgroups: [],
            peaksTeam: [],
            selectedAdgroups: [],
            selectedRecord: {
                notification: 1,
            },
            searchValue: '',
            loading: true
        }
    },

    methods: {
        getDataList: function(url, type){
            axios.post(url, {
                myid: this.username,
                token: this.token,
                mask: this.maskeduser
            }).then(response => { //console.log (response);
                if(response.status == 204){
                    this.screenmsg = "No records found.",
                    this.screenmsgtype = "error",
                    this.screenmsgicon = this.erroricon,
                    this.code = response.status,
                    this.hidebody = true
                } else {
                    if(type == 'data'){
                        this.listData = response.data.dataList
                    } else if(type == 'users'){
                        this.listData = response.data.users,
                        this.listData.sort((a, b) => this.sortColumn('firstname', a, b)),
                        this.departments = response.data.departments,
                        this.adgroups = response.data.adgroups,
                        this.adgroups.sort((a, b) => this.sortColumn('adgroup', a, b))
                    } else if(type == 'department'){
                        this.listData = response.data.dataList,
                        this.listData.sort((a, b) => this.sortColumn('department', a, b)),
                        this.departments = response.data.departments,
                        this.departments.sort((a, b) => this.sortColumn('department', a, b)),
                        this.colleges = response.data.colleges,
                        this.colleges.sort((a, b) => this.sortColumn('college', a, b))
                    } else if(type == 'adgroup'){
                        this.listData = response.data.dataList,
                        this.listData.sort((a, b) => this.sortColumn('alias', a, b)),
                        this.departments = response.data.departments,
                        this.departments.sort((a, b) => this.sortColumn('department', a, b)),
                        this.userList = response.data.userList,
                        this.userList.sort((a, b) => this.sortColumn('firstname', a, b)),
                        this.peaksTeam = response.data.peaksTeam
                    } else {
                        this.listData = response.data.dataList
                    }
                    this.message = response.data.message,
                    this.success = response.data.success,
                    this.code = response.data.code
                }
            }).catch(error => { console.log(error);
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
        sortColumn: function(column, a, b) {
            if (a[column] === b[column]) {
                return 0;
            } else {
                return (a[column] < b[column]) ? -1 : 1;
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
        selectRecord: function(row){
            this.selectedRecord = { ...row };
            if(this.selectedRecord.grpids){
                this.selectedRecord.grpids = JSON.parse(this.selectedRecord.grpids);
                this.selectedRecord.grpids = this.selectedRecord.grpids.map(String);
                this.selectedAdgroups = this.adgroups.filter(adgroup =>
                    this.selectedRecord.grpids.includes(adgroup.id)
                );
            }
        },
        unsetSelectedRecord: function(){
            this.selectedRecord = {};
            this.selectedAdgroups = [];
        },
        updateField(fieldName, event) {
            this.selectedRecord[fieldName] = event.target.value;
        },
        updateMultipleValueField(fieldName, index, event, delimiter = ';') {
            //const valuesArray = this.selectedRecord[fieldName].split(delimiter);
            const valuesArray = this.selectedRecord[fieldName]?.split(delimiter) || [];
            if (event.target.type === 'checkbox') {
                valuesArray[index] = event.target.checked ? 'true' : 'false';
            } else {
                valuesArray[index] = event.target.value;
            }
            this.selectedRecord[fieldName] = valuesArray.join(delimiter);
        },
        maskAndRedirect(loginid) {
            this.maskeduser = loginid;
            this.$router.push('/');
        },
        roleAnalyser(role){
            var crole;
            if(role == 'superadmin'){
                crole = 'SuperAdmin'
            } else if(role == 'orgadmin'){
                crole = 'OrgAdmin'
            } else if(role == 'orgreportviewer'){
                crole = 'OrgReportViewer'
            } else if(role == 'labadmin'){
                crole = 'LabAdmin'
            } else if(role == 'labreportviewer'){
                crole = 'LabReportViewer'
            } else {
                crole = 'none'
            }
            return crole;
        },
        loader: function(){
            this.loading = true;
        }
    },
    computed: {
        curlRole: {
            get() {
            return this.$store.state.curlRole;
            },
            set(value) {
            this.$store.commit('setCurlRole', value);
            }
        },
        curlName: {
            get() {
            return this.$store.state.curlName;
            },
            set(value) {
            this.$store.commit('setCurlName', value);
            }
        },
        curlCode: {
            get() {
            return this.$store.state.curlCode;
            },
            set(value) {
            this.$store.commit('setCurlCode', value);
            }
        },
        curlDep: {
            get() {
            return this.$store.state.curlDep;
            },
            set(value) {
            this.$store.commit('setCurlDep', value);
            }
        },
        curlGrp: {
            get() {
            return this.$store.state.curlGrp;
            },
            set(value) {
            this.$store.commit('setCurlGrp', value);
            }
        },
        curlNotify: {
            get() {
            return this.$store.state.curlNotify;
            },
            set(value) {
            this.$store.commit('setCurlNotify', value);
            }
        },
        curlFreq: {
            get() {
            return this.$store.state.curlFreq;
            },
            set(value) {
            this.$store.commit('setCurlFreq', value);
            }
        },
        maskeduser: {
            get() {
            return this.$store.state.maskeduser;
            },
            set(value) {
            this.$store.commit('setMaskedUser', value);
            }
        },
        username() {
            return this.$store.state.username;
        },
        token() {
            return this.$store.state.token;
        },
        authenticated() {
            return this.$store.state.authenticated;
        },
        authText() {
            return this.$store.state.authText;
        },
        email() {
            return this.$store.state.email;
        },
        accessLevels() {
            return {
            accesslevel0: this.$store.state.accesslevel0,
            accesslevel0r: this.$store.state.accesslevel0r,
            accesslevel1: this.$store.state.accesslevel1,
            accesslevel1r: this.$store.state.accesslevel1r,
            accesslevel2: this.$store.state.accesslevel2
            };
        },
        viewmode() {
            return this.$store.state.viewmode;
        },
    },
}