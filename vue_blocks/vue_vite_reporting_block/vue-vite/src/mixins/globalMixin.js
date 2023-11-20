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
            adgroups: [],
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
                token: this.token
            }).then(response => {
                if(type == 'data'){
                    this.listData = response.data.dataList
                } else if(type == 'users'){
                    this.listData = response.data.users,
                    this.listData.sort(this.sortFname),
                    this.departments = response.data.departments,
                    this.adgroups = response.data.adgroups
                } else{
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
        loader: function(){
            this.loading = true;
        }
    }
}