/* Main URLs */
mainURL = 'https://caes-cp-reports.caes.ucdavis.edu/cpweb/';
const blockID = document.getElementsByClassName('vue-cpsite-block')[0].id;

window.onmessage = function(event){
    if (event.data[0] == 'pageHeight') {
		var h = event.data[1] + 700;
		document.getElementById('cpsite-frame').height = h+"px";
    }
};

/* End Main URLs */


/* Components */

var cpsiteCmp = Vue.extend({
    template: '#cpsite',

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
		
		
		/* document.onreadystatechange = () => { 
			if (document.readyState == "complete") {			
				//some code if needed				
				var yPos = window.scrollY;
				const iframe = document.getElementById('cpsite-frame');
				iframe.contentWindow.postMessage(yPos, '*');
				console.log("hi from vue block "+yPos);
			}
		} */
		
		document.onscroll = () => { 
			//if (document.readyState == "complete") {			
				//some code if needed				
				var yPos = window.scrollY;
				const iframe = document.getElementById('cpsite-frame');
				iframe.contentWindow.postMessage(yPos, '*');
			//}
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
			component: cpsiteCmp,
			props: true
		}
	]
});

/* End Router */

/* Initialize */

new Vue({
	el: '#cpsite-block',
	router
})

/* End Initialize */
