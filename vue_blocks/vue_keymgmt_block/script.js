/* Main URLs */
mainURL = 'https://web.bftv.ucdavis.edu/keycardmgmt/';
const blockID = document.getElementsByClassName('vue-keymgmt-block')[0].id;
window.onmessage = function(event){
    if (event.data[0] == 'pageHeight') {
	   document.getElementById('keymgmt-frame').height = event.data[1]+"px";
    }
};
/* End Main URLs */


/* Components */

var keymgmtCmp = {
    template: '#keymgmt',

    data: function() {
        return {
			iframeurl: '',
			iframesrc: '',
			height: '1000px'
        }
    },

	mounted: function() {
		this.getURL();
	},

    methods: {
		getURL: function(){
			this.iframeurl = this.$route.query.sid;
			if(this.iframeurl){
				this.iframesrc = mainURL+'index.php?sid='+this.iframeurl
			} else {
				this.iframesrc = mainURL
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
	//el: '#keymgmt-block',
	//router
}).use(router).mount('#keymgmt-block')

/* End Initialize */
