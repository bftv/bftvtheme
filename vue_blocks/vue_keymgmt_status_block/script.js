/* Main URLs */
mainURL = 'https://web.bftv.ucdavis.edu/keycardmgmt/status/';
const blockID = document.getElementsByClassName('vue-keymgmt-status-block')[0].id;
window.onmessage = function(event){
    if (event.data[0] == 'pageHeight') {
	   document.getElementById('keymgmt-status-frame').height = event.data[1]+"px";
    }
};
/* End Main URLs */


/* Components */

var keymgmtCmp = {
    template: '#keymgmt',

    data: function() {
        return {
			iframeurl: '',
      iframeln: '',
			iframesrc: '',
			height: '1000px'
        }
    },

	mounted: function() {
		this.getURL();
	},

    methods: {
		getURL: function(){
			this.iframeurl = this.$route.query.ksid;
      this.iframeln = this.$route.query.lastname;
			if(this.iframeurl && this.iframeln){
				this.iframesrc = mainURL+'status.php?ksid='+this.iframeurl+'&&lastname='+this.iframeln;
			} else {
				this.iframesrc = mainURL+'status.php';
			}
		},
	}
}


/* End Components */

/* Router */

var router = VueRouter.createRouter({
	history: VueRouter.createWebHashHistory(),
	scrollBehavior() {
		return { x: 0, y: 0 };
	},

	routes: [
		{
			path: '/:pathMatch(.*)*',
			component: keymgmtCmp,
			props: true
		}
	]
});

/* End Router */

/* Initialize */

Vue.createApp({
	//el: '#keymgmt-status-block',
	//router
}).use(router).mount('#keymgmt-status-block')

/* End Initialize */
