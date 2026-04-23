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
            attributeGroups: [],
            peaksTeam: [],
            globalSettings: [],
            selectedAdgroups: [],
            selectedUsers: [],
            selectedViewers: [],
            selectedRecord: {
                notification: 1,
            },
            searchValue: '',
            sortKey: null,
            sortDirection: 'asc',
            filtertxt: '',
            loading: true
        }
    },

    methods: {
        getDataList: function(url, type){
            axios.post(url, {
                myid: this.username,
                token: this.token,
                mask: this.maskeduser
            }).then(response => {console.log(response);
                if(response.status == 204){
                    this.screenmsg = "No records found.",
                    this.screenmsgtype = "error",
                    this.screenmsgicon = this.erroricon,
                    this.code = response.status,
                    this.hidebody = true
                } else {
                    if(type == 'data'){
                        this.listData = response.data.dataList;
                    } else if(type == 'users'){
                        this.listData = response.data.users,
                        this.departments = response.data.departments,
                        this.adgroups = response.data.adgroups,
                        this.adgroups.sort((a, b) => this.sortColumn('adgroup', a, b))
                    } else if(type == 'department'){
                        this.listData = response.data.dataList,
                        this.sortKey = 'department';
                        this.sortDirection = 'asc';
                        this.applySort('listData');
                        this.departments = response.data.departments,
                        this.departments.sort((a, b) => this.sortColumn('department', a, b)),
                        this.colleges = response.data.colleges,
                        this.colleges.sort((a, b) => this.sortColumn('college', a, b))
                    } else if(type == 'adgroup'){
                        this.listData = response.data.dataList,
                        this.sortKey = 'alias';
                        this.sortDirection = 'asc';
                        this.applySort('listData');
                        this.attributeGroups = response.data.attr_groups,
                        this.departments = response.data.departments,
                        this.departments.sort((a, b) => this.sortColumn('department', a, b)),
                        this.userList = response.data.userList,
                        this.userList.sort((a, b) => this.sortColumn('firstname', a, b)),
                        this.peaksTeam = response.data.peaksTeam
                        this.globalSettings = response.data.globalSettings[0]
                    } else {
                        this.listData = response.data.dataList
                    }
                    this.message = response.data.message,
                    this.success = response.data.success,
                    this.code = response.data.code
                }
            }).catch(error => {console.log(error);
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
        toggleSort(column, defaultDirection = 'asc') {
            if (this.sortKey === column) {
                this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
            } else {
                this.sortKey = column;
                this.sortDirection = defaultDirection;
            }
        },
        isSortActive(column) {
            return this.sortKey === column;
        },
        getSortIcon(column) {
            if (this.sortKey !== column || this.sortDirection === 'asc') {
                return 'fa-arrow-down-short-wide';
            }
            return 'fa-arrow-down-wide-short';
        },
        getSortValue(row, key) {
            if (!row || !key) return null;

            if (typeof key === 'function') {
                return key(row);
            }

            if (String(key).includes('.')) {
                return String(key).split('.').reduce((obj, part) => {
                return obj && obj[part] !== undefined ? obj[part] : null;
                }, row);
            }

            return row[key] ?? null;
        },
        compareSortValues(a, b, direction = 'asc') {
            const aEmpty = a === null || a === undefined || a === '';
            const bEmpty = b === null || b === undefined || b === '';

            if (aEmpty && bEmpty) return 0;
            if (aEmpty) return 1;
            if (bEmpty) return -1;

            const aNum = typeof a === 'number' || (!isNaN(a) && a !== '' && a !== false);
            const bNum = typeof b === 'number' || (!isNaN(b) && b !== '' && b !== false);

            let result = 0;

            if (aNum && bNum) {
                result = Number(a) - Number(b);
            } else {
                result = String(a).localeCompare(String(b), undefined, {
                numeric: true,
                sensitivity: 'base'
                });
            }

            return direction === 'asc' ? result : result * -1;
        },
        sortArray(array, sortKey = null, sortDirection = null) {
            if (!Array.isArray(array)) return [];

            const activeKey = sortKey ?? this.sortKey;
            const activeDirection = sortDirection ?? this.sortDirection;

            if (!activeKey) return [...array];

            return [...array].sort((a, b) => {
                const aVal = this.getSortValue(a, activeKey);
                const bVal = this.getSortValue(b, activeKey);
                return this.compareSortValues(aVal, bVal, activeDirection);
            });
        },
        applySort(arrayName, sortKey = null, sortDirection = null) {
            if (!Array.isArray(this[arrayName])) return;

            const activeKey = sortKey ?? this.sortKey;
            const activeDirection = sortDirection ?? this.sortDirection;

            if (!activeKey) return;

            this[arrayName] = [...this[arrayName]].sort((a, b) => {
                const aVal = this.getSortValue(a, activeKey);
                const bVal = this.getSortValue(b, activeKey);
                return this.compareSortValues(aVal, bVal, activeDirection);
            });
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
            if(this.selectedRecord.usrids){
                this.selectedRecord.usrids = JSON.parse(this.selectedRecord.usrids);
                this.selectedRecord.usrids = this.selectedRecord.usrids.map(String);
                this.selectedUsers = this.userOptions.filter(user =>
                    this.selectedRecord.usrids.includes(String(user.id)) &&
                    user.loginid !== this.selectedRecord.pi &&
                    user.adgroupDetails.some(detail =>
                        String(detail.grpid) === String(this.selectedRecord.id) &&
                        detail.role === 'labadmin'
                    )
                );

                this.selectedViewers = this.userOptions.filter(user =>
                    this.selectedRecord.usrids.includes(String(user.id)) &&
                    user.loginid !== this.selectedRecord.pi &&
                    user.adgroupDetails.some(detail =>
                        String(detail.grpid) === String(this.selectedRecord.id) &&
                        detail.role === 'labreportadmin'
                    )
                );
            }
        },
        unsetSelectedRecord: function(){
            this.selectedRecord = {};
            this.selectedAdgroups = [];
            this.selectedUsers = [];
            this.selectedViewers = [];
        },
        updateField(fieldName, event) {
            this.selectedRecord[fieldName] = event.target.value;
        },
        updateGlobalField(fieldName, event) {
            this.globalSettings[fieldName] = event.target.value;
        },
        updateMultipleValueField(fieldName, index, event, delimiter = ';') {
            const valuesArray = this.selectedRecord[fieldName]?.split(delimiter) || [];
            if (event.target.type === 'checkbox') {
                valuesArray[index] = event.target.checked ? 'true' : 'false';
            } else {
                valuesArray[index] = event.target.value;
            }
            this.selectedRecord[fieldName] = valuesArray.join(delimiter);
        },
        maskAndRedirect(loginid, role) {
            //const url = 'https://web.bftv.ucdavis.edu/reporting/get-specifics.php';
            if(this.$store.state.accesslevel1 && role != 'superadmin'  && role != 'colladmin' && role != 'collreportadmin'){
                this.maskeduser = loginid;
                this.$router.push('/');
            } else {
                this.screenmsg = "You cannot mask as "+loginid+"!";
                this.screenmsgtype = "error";
            }
        },
        roleAnalyser(role){
            var crole;
            if(role == 'superadmin'){
                crole = 'SuperAdmin'
            } else if(role == 'colladmin'){
                crole = 'CollAdmin'
            } else if(role == 'collreportadmin'){
                crole = 'CollReportAdmin'
            } else if(role == 'orgadmin'){
                crole = 'OrgAdmin'
            } else if(role == 'orgreportadmin'){
                crole = 'OrgReportAdmin'
            } else if(role == 'labadmin'){
                crole = 'LabAdmin'
            } else if(role == 'labreportadmin'){
                crole = 'LabReportAdmin'
            } else {
                crole = 'none'
            }
            return crole;
        },
        loader: function(){
            this.loading = true;
        },
        clearFilter() {
            this.filtertxt = '';
        },
        normalizeFilterValue(value) {
            if (value === null || value === undefined) return '';
            return String(value).toLowerCase().trim();
        },

        getNestedValue(obj, path) {
            if (!obj || !path) return null;

            if (typeof path === 'function') {
            return path(obj);
            }

            return String(path).split('.').reduce((acc, part) => {
            return acc && acc[part] !== undefined ? acc[part] : null;
            }, obj);
        },
        filterArray(items, fields = [], minChars = 3) {
            if (!Array.isArray(items)) return [];

            const keyword = this.normalizeFilterValue(this.filtertxt);

            if (keyword.length < minChars) {
            return items;
            }

            return items.filter(item => {
            return fields.some(field => {
                const rawValue = this.getNestedValue(item, field);
                const value = this.normalizeFilterValue(rawValue);
                return value.includes(keyword);
            });
            });
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
        curlColid: {
            get() {
                return this.$store.state.curlColid;
            },
            set(value) {
                this.$store.commit('setCurlColid', value);
            }
        },
        curlCol: {
            get() {
                return this.$store.state.curlCol;
            },
            set(value) {
                this.$store.commit('setCurlCol', value);
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
        curlColSize: {
            get() {
                return this.$store.state.curlColSize;
            },
            set(value) {
                this.$store.commit('setCurlColSize', value);
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
            accesslevel2: this.$store.state.accesslevel2,
            accesslevel2r: this.$store.state.accesslevel2r,
            accesslevel3: this.$store.state.accesslevel3
            };
        },
        viewmode() {
            return this.$store.state.viewmode;
        },
    },
}