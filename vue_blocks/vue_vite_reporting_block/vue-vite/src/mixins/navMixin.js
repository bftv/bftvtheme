export var navmixin = {
    data: function() {
        return {
            username: drupalSettings.assignments.username,
            email: drupalSettings.assignments.useremail,
            role: drupalSettings.assignments.role,
            token: drupalSettings.assignments.token,
            curlCode: '',
            curlRole: '',
            curlName: '',
            curlDep: '',
            curlGrp: '',
            curlNotify: 0,
            curlFreq: '',
            authenticated: '',
            authText: '',
            accesslevel0: false,
            accesslevel0r: false,
            accesslevel1: false,
            accesslevel1r: false,
            accesslevel2: false,
            viewmode: false,
            navscreenmsg: "",
            navscreenmsgtype: "",
            navscreenmsgicon: "",
            naverroricon: "far fa-times-circle fa-2x alert--error-icon",
            navsuccessicon: "far fa-check-circle fa-2x alert--success-icon",
            maskeduser: null
        }
    },
    beforeMount: function(){//console.log(this.username);
        axios.post('https://web.bftv.ucdavis.edu/reporting/connector.php', {
            crossDomain: true,
            loginid: this.username,
            token: this.token,
            email: this.email,
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(response => {//console.log(response);
            this.curlCode = response.data.response
            if(this.curlCode == 1 || this.curlCode == 3){
                this.curlRole = response.data.userrole,
                this.curlName = response.data.username,
                this.curlDep = response.data.userdep,
                this.curlGrp = response.data.usergrps,
                this.curlNotify = response.data.usernotify,
                this.curlFreq = response.data.userfreq,
                this.authenticated = response.data.authenticated,
                this.check_auth()
                if(this.curlRole == 'superadmin'){
                    this.accesslevel0 = true;
                    this.accesslevel0r = true;
                    this.accesslevel1 = true;
                    this.accesslevel1r = true;
                    this.accesslevel2 = true;
                } else if(this.curlRole == 'orgadmin'){
                    this.accesslevel0 = true;
                    this.accesslevel0r = true;
                    this.accesslevel1 = true;
                    this.accesslevel1r = true;
                    this.accesslevel2 = false;
                } else if(this.curlRole == 'orgreportviewer'){
                    this.accesslevel0 = false;
                    this.accesslevel0r = true;
                    this.accesslevel1 = false;
                    this.accesslevel1r = true;
                    this.accesslevel2 = false;
                } else if(this.curlRole == 'labadmin'){
                    this.accesslevel0 = true;
                    this.accesslevel0r = true;
                    this.accesslevel1 = false;
                    this.accesslevel1r = false;
                    this.accesslevel2 = false;
                } else if(this.curlRole == 'labreportviewer'){
                    this.accesslevel0 = false;
                    this.accesslevel0r = true;
                    this.accesslevel1 = false;
                    this.accesslevel1r = false;
                    this.accesslevel2 = false;
                }
                if(this.curlRole == 'orgreportviewer' || this.curlRole == 'labadmin' || this.curlRole == 'labreportviewer'){
                    this.viewmode = true;
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
        authenticate(){
            var w = 600;
            var h = 800;
            var url = 'https://web.bftv.ucdavis.edu/reporting/auth.php';
            var LeftPosition = (screen.width) ? (screen.width-w)/2 : 0;
            var TopPosition = (screen.height) ? (screen.height-h)/2 : 0;
            var settings = 'height='+h+',width='+w+',top='+TopPosition+',left='+LeftPosition+',scrollbars=yes,resizable';
            var popupWindow = window.open(url,"CAS - Central Authentication Service",settings);
            window.addEventListener('message', function(e) {
                // e.data hold the message from child
                if(e.data == "Authenticated."){
                    popupWindow.close();
                    //return axios(originalRequest);
                    this.location.reload();
                } else if (e.data == "Authentication failed."){
                    popupWindow.close();
                    return Promise.reject(e.data);
                }
            } , false);
        }
    }
}