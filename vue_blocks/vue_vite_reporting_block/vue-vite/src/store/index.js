// store.js
import { createStore } from 'vuex'
import axios from 'axios'

export default createStore({
  state: {
    username: drupalSettings.assignments.username,
    email: drupalSettings.assignments.useremail,
    role: drupalSettings.assignments.role,
    token: drupalSettings.assignments.token,
    curlCode: '',
    curlRole: '',
    curlName: '',
    curlColid: '',
    curlCol: '',
    curlDep: '',
    curlGrp: '',
    curlNotify: 0,
    curlFreq: '',
    curlColSize: '',
    authenticated: '',
    authText: '',
    accesslevel0: false,
    accesslevel0r: false,
    accesslevel1: false,
    accesslevel1r: false,
    accesslevel2: false,
    accesslevel2r: false,
    accesslevel3: false,
    viewmode: false,
    maskeduser: null
},
mutations: {
  setCurlData(state, payload) {
    state.curlCode = payload.curlCode;
    state.curlRole = payload.curlRole;
    state.curlName = payload.curlName;
    state.curlColid = payload.curlColid;
    state.curlCol = payload.curlCol;
    state.curlDep = payload.curlDep;
    state.curlGrp = payload.curlGrp;
    state.curlNotify = payload.curlNotify;
    state.curlFreq = payload.curlFreq;
    state.curlColSize = payload.curlColSize;
    state.authenticated = payload.authenticated;
    state.accesslevel0 = payload.accesslevel0;
    state.accesslevel0r = payload.accesslevel0r;
    state.accesslevel1 = payload.accesslevel1;
    state.accesslevel1r = payload.accesslevel1r;
    state.accesslevel2 = payload.accesslevel2;
    state.accesslevel2r = payload.accesslevel2r;
    state.accesslevel3 = payload.accesslevel3;
    state.viewmode = payload.viewmode;
  },
  setAuthText(state, text) {
    state.authText = text;
  },
  setCurlCode(state, value) {
    state.curlCode = value;
  },
  setCurlRole(state, value) {
    state.curlRole = value;
  },
  setCurlName(state, value) {
    state.curlName = value;
  },
  setCurlColid(state, value) {
    state.curlColid = value;
  },
  setCurlCol(state, value) {
    state.curlCol = value;
  },
  setCurlDep(state, value) {
    state.curlDep = value;
  },
  setCurlGrp(state, value) {
    state.curlGrp = value;
  },
  setCurlNotify(state, value) {
    state.curlNotify = value;
  },
  setCurlFreq(state, value) {
    state.curlFreq = value;
  },
  setCurlColSize(state, value) {
    state.curlColSize = value;
  },
  setMaskedUser(state, value) {
    state.maskeduser = value;
  }
},
actions: {
    fetchCurlData({ commit, state, dispatch }) {
      axios.post('https://web.bftv.ucdavis.edu/reporting/connector.php', {
        crossDomain: true,
        loginid: state.username,
        token: state.token,
        email: state.email,
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(response => {
        if (response.data.response == 1 || response.data.response == 3) {
          let payload = {
            curlCode: response.data.response,
            curlRole: response.data.userrole,
            curlName: response.data.username,
            curlCol: response.data.usercol,
            curlColid: response.data.usercolid,
            curlDep: response.data.userdep,
            curlGrp: response.data.usergrps,
            curlNotify: response.data.usernotify,
            curlFreq: response.data.userfreq,
            curlColSize: response.data.colsize,
            authenticated: response.data.authenticated,
            accesslevel0: response.data.userrole == 'superadmin' || response.data.userrole == 'colladmin' || response.data.userrole == 'orgadmin' || response.data.userrole == 'labadmin',
            accesslevel0r: response.data.userrole == 'superadmin' || response.data.userrole == 'colladmin' || response.data.userrole == 'collreportadmin' || response.data.userrole == 'orgadmin' || response.data.userrole == 'labreportadmin' || response.data.userrole == 'labadmin' || response.data.userrole == 'labreportadmin',
            accesslevel1: response.data.userrole == 'superadmin' || response.data.userrole == 'colladmin' || response.data.userrole == 'orgadmin',
            accesslevel1r: response.data.userrole == 'superadmin' || response.data.userrole == 'colladmin' || response.data.userrole == 'collreportadmin' || response.data.userrole == 'orgadmin' || response.data.userrole == 'labreportadmin',
            accesslevel2: response.data.userrole == 'superadmin' || response.data.userrole == 'colladmin',
            accesslevel2r: response.data.userrole == 'superadmin' || response.data.userrole == 'colladmin' || response.data.userrole == 'collreportadmin',
            accesslevel3: response.data.userrole == 'superadmin',
            viewmode: ['labadmin', 'labreportadmin'].includes(response.data.userrole)
          };
          commit('setCurlData', payload);
          dispatch('checkAuth');
        }
      }).catch(error => {
          console.log(error);
      });
    },
    checkAuth({ commit, state }) {
      if (state.authenticated) {
        commit('setAuthText', 'Authenticated');
      } else {
        commit('setAuthText', 'Not Authenticated');
      }
    }
  }
});
