/* Main URLs */
mainURL = 'https://web.bftv.ucdavis.edu/calendar/';
const blockID = document.getElementsByClassName('vue-ems-block')[0].id;
window.onmessage = function(event){
    if (event.data[0] == 'pageHeight') {	   
	   document.getElementById('ems-frame').height = event.data[1]+"px";
    } else if (event.data[0] == 'modal') {	   
	    window.scrollTo({
		    top: 100,
		    left: 0,
		    behavior: 'smooth'
	    });
    } else if (event.data[0] == 'confirm') {
	    btntype = event.data[1];
	    action = event.data[2];
	    type = event.data[3];
	    rid = event.data[4];
	    bid = event.data[5];
	    commentbox = event.data[6];
	    sendcomment = event.data[7];
	    if(event.data[1] == 'quick'){
		 msg = 'Are you sure to '+action+' all bookings in this reservation?';
		 if(confirm(msg)){
			document.getElementById('ems-frame').contentWindow.postMessage(['response', action, type, rid, bid, commentbox, sendcomment], '*');	 
		 }		 
	    } else if(event.data[1] == 'single'){
		 msg = 'Are you sure to '+action+' this booking?';
		 if(confirm(msg)){
			document.getElementById('ems-frame').contentWindow.postMessage(['response', action, type, rid, bid, commentbox, sendcomment], '*');	 
		 }		 
	    } else if(event.data[1] == 'all'){
		 msg = 'Are you sure to '+action+' all bookings in this reservation?';
		 if(confirm(msg)){
			document.getElementById('ems-frame').contentWindow.postMessage(['response', action, type, rid, bid, commentbox, sendcomment], '*');	 
		 }		 
	    }
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
