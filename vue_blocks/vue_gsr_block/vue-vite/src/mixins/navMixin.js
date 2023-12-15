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
      curlTeam: '',
      authenticated: '',
      authText: '',
      accesslevel0r: false,
      accesslevel0: false,
      accesslevel1: false,
      accesslevel2: false,
      viewermode: false,
    }
  },
  beforeMount: function(){
    axios.post('https://web.bftv.ucdavis.edu/gsr/connector.php', {
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
          this.curlRole = response.data.userrole,
          this.curlName = response.data.username,
          this.curlDep = response.data.userdep,
          this.curlTeam = response.data.userteam,
          this.authenticated = response.data.authenticated,
          this.check_auth()
          if(this.curlRole == 'superadmin'){
            this.accesslevel0r = true;
            this.accesslevel0 = true;
            this.accesslevel1 = true;
            this.accesslevel2 = true;
          } else if(this.curlRole == 'orgadmin'){
            this.accesslevel0r = true;
            this.accesslevel0 = true;
            this.accesslevel1 = true;
            this.accesslevel2 = false;
          } else if(this.curlRole == 'editor'){
            this.accesslevel0r = false;
            this.accesslevel0 = true;
            this.accesslevel1 = false;
            this.accesslevel2 = false;
          } else if(this.curlRole == 'viewer'){
            this.accesslevel0r = true;
            this.accesslevel0 = false;
            this.accesslevel1 = false;
            this.accesslevel2 = false;
          }
          if(this.curlRole == 'orgreportadmin' || this.curlRole == 'labadmin' || this.curlRole == 'labreportadmin'){
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
    },
    roleAnalyser(role){
      var crole;
      if(role == 'superadmin'){
          crole = 'SuperAdmin'
      } else if(role == 'orgadmin'){
          crole = 'OrgAdmin'
      } else if(role == 'editor'){
          crole = 'Editor'
      } else if(role == 'viewer'){
          crole = 'Viewer'
      } else {
          crole = 'none'
      }
      return crole;
    },
    authenticate(){
      var w = 600;
      var h = 800;
      var url = 'https://web.bftv.ucdavis.edu/gsr/auth.php';
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