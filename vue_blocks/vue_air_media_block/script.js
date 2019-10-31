/* Main URLs */
const blockID = document.getElementsByClassName('vue-air-media-block')[0].id;
/* End Main URLs */


/* Components */

var airMediaCmp = Vue.extend({
    template: '#air-media',

    data: function() {
        return {            
			loading: true,
			windows: false,
			macOs: false,
			//otherOs: false,
			force: false,
			manual: false,
			info: false,
			time: 5,
			interval: null,
			os: "",
			url: ""
			
        }
    },
	
	mounted: function() {		
		this.getOS();
		this.loading = false;
	},

    methods: {
        
		getOS: function(){
			userAgent = window.navigator.userAgent,
			platform = window.navigator.platform,
			macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'],
			windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'];
			//iosPlatforms = ['iPhone', 'iPad', 'iPod'];
			
			if (macosPlatforms.indexOf(platform) !== -1) {
				this.macOs = true;
				this.os = "mac";
				this.interval = setInterval(this.incrementTime, 1000);
			} else if (windowsPlatforms.indexOf(platform) !== -1) {
				this.windows = true;
				this.os = "win";
				this.interval = setInterval(this.incrementTime, 1000);				
			} 
			/* else {
				this.otherOs = true;
				this.os = "oth";
				this.interval = setInterval(this.incrementTime, 1000);
			} */
			/* else if (/Android/.test(userAgent)) {
				os = 'Android';
			} else if (!os && /Linux/.test(platform)) {
				os = 'Linux';
			} else if (iosPlatforms.indexOf(platform) !== -1) {
				os = 'iOS';
			} */
		},
		incrementTime: function() {
			if (this.time == 0){
				clearInterval(this.interval);
				this.force = true;
				if(this.os == "mac"){
					this.url = "https://www.bftv.ucdavis.edu/sites/g/files/dgvnsk1346/files/files/page/AirMedia_Mac.zip";
					this.download(this.url);					
				} else if (this.os == "win") {
					this.url = "https://www.bftv.ucdavis.edu/sites/g/files/dgvnsk1346/files/files/page/AirMedia_Windows.zip";
					this.download(this.url);
				} 
			} else {
				this.time = parseInt(this.time) - 1;
			}
		},
		download: function(url) {			
			window.location.href = url;
			this.info = true;
		},
		manualDownload: function() {
			this.loading = true;
			clearInterval(this.interval);
			this.windows = false;
			this.macOs = false;
			this.force = false;
			this.manual = true;
			this.loading = false;
		},
		manualDownloadOff: function() {
			location.reload();
		},
	},
})


/* End Components */

/* Router */

var router = new VueRouter({
	mode: 'history',	
	
	routes: [
		{ 
			path: '*', 
			component: airMediaCmp 
		}
	]
});

/* End Router */

/* Initialize */

new Vue({
	el: '#air-media-block',
	router
})

/* End Initialize */
