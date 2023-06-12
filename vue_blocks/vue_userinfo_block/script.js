/* Main URLs */
mainURL = 'https://web.bftv.ucdavis.edu/userinfo/';
const blockID = document.getElementsByClassName('vue-userinfo-block')[0].id;
/* End Main URLs */

/* Components */
var userinfoCmp = {
    template: '#userinfo',

    data: function() {
        return {
			loading: true,
			iframeurl: '',
			iframesrc: '',
			elframe: '',
			height: '1000px'
        }
    },

	mounted: function() {
		this.getURL();
		this.loading = false;
	},

    methods: {
		getURL: function(){
			this.iframesrc = mainURL
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
			component: userinfoCmp,
			props: true
		}
	]
});

/* End Router */

/* Initialize */

Vue.createApp({
	//el: '#userinfo-block',
	//router
}).use(router).mount('#userinfo-block')

/* End Initialize */
