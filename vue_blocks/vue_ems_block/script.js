/* Main URLs */
mainURL = 'https://web.bftv.ucdavis.edu/calendar/';
const blockID = document.getElementsByClassName('vue-ems-block')[0].id;
window.onmessage = function(event){
    if (event.data[0] == 'pageHeight') {	   
	   document.getElementById('ems-frame').height = event.data[1]+"px";
    }
};
/* End Main URLs */


/* Components */

var emsCmp = Vue.extend({
    template: '#ems',

    data: function() {
        return {            
			loading: true,
			iframeurl: '',
			iframesrc: '',
			elframe: '',
			height: '1000px',
			test: '2'
			
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
			this.iframeurl = this.$route.query.rid;			
			if(this.iframeurl){
				this.iframesrc = mainURL+'index.php?reservation='+this.iframeurl				
			} else {
				this.iframesrc = mainURL
			}			
		},
		getCookie: function(name){
			matches = document.cookie.match(new RegExp(
				"(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
			));
			return matches ? decodeURIComponent(matches[1]) : undefined;
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
			component: emsCmp,
			props: true
		}
	]
});

/* End Router */

/* Initialize */

new Vue({
	el: '#ems-block',
	router
})

/* End Initialize */
