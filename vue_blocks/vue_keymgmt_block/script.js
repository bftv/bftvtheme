/* Main URLs */
const host = window.location.hostname;console.log(host);

if (host === 'www.bftv.ucdavis.edu') {
  mainURL = 'https://web.bftv.ucdavis.edu/keycardmgmt/';
} else if(host === 'bftv.local') {
	mainURL = 'https://web-dev.bftv.ucdavis.edu/keycardmgmt-dev/';
}console.log(mainURL);
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
			const hashParams = new URLSearchParams(window.location.search);
			//console.log(hashParams.has('sid'));
			//console.log(hashParams.get('sid'));
			this.iframeurl = hashParams.get('sid');
			if(this.iframeurl){
				this.iframesrc = mainURL+'index.php?sid='+this.iframeurl
			} else {
				this.iframesrc = mainURL
			}console.log(this.iframesrc);
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
