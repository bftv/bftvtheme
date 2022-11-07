/* Main URLs */
mainURL = 'https://web.bftv.ucdavis.edu/keycardmgmt/';
const blockID = document.getElementsByClassName('vue-keymgmt-block')[0].id;
/* End Main URLs */


/* Components */

var keymgmtCmp = Vue.extend({
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
})


/* End Components */

/* Router */

var router = new VueRouter({
	mode: 'history',
	scrollBehavior() {
		return { x: 0, y: 0 };
	},

	routes: [
		{
			path: '*',
			component: keymgmtCmp,
			props: true
		}
	]
});

/* End Router */

/* Initialize */

new Vue({
	el: '#keymgmt-block',
	router
})

/* End Initialize */
