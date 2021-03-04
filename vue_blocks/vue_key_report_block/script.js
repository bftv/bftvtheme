/* Main URLs */
mainURL = 'https://web.bftv.ucdavis.edu/keyreport/index.php?page=home';
const blockID = document.getElementsByClassName('vue-key-report-block')[0].id;
/* End Main URLs */


/* Components */

var keyReportCmp = Vue.extend({
    template: '#key-report',

    data: function() {
        return {            
			loading: true,
			iframesrc: '',
			height: '1000px'			
        }
    },
	
	mounted: function() {		
		this.getURL();
		this.loading = false;
		
		
		document.onreadystatechange = () => { 
			if (document.readyState == "complete") {			
				//some code if needed
				
			}
		}
		
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
			component: keyReportCmp,
			props: true
		}
	]
});

/* End Router */

/* Initialize */

new Vue({
	el: '#key-report-block',
	router
})

/* End Initialize */
