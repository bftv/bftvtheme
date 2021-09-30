/* Main URLs */
mainURL = 'https://web.bftv.ucdavis.edu/userinfo/';
const blockID = document.getElementsByClassName('vue-userinfo-block')[0].id;
/* End Main URLs */

/* Components */
var userinfoCmp = Vue.extend({
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
			component: userinfoCmp,
			props: true
		}
	]
});

/* End Router */

/* Initialize */

new Vue({
	el: '#userinfo-block',
	router
})

/* End Initialize */
