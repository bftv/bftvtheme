/* Popup Function */
var popupWindow = null;
function centeredPopup(url,w,h,scroll){
	LeftPosition = (screen.width) ? (screen.width-w)/2 : 0;
	TopPosition = (screen.height) ? (screen.height-h)/2 : 0;
	settings = 'height='+h+',width='+w+',top='+TopPosition+',left='+LeftPosition+',scrollbars='+scroll+',resizable'
	popupWindow = window.open(url,"1207 Emergency Form",settings)
}
/* End Popup Function */

/* Main URLs */
const blockID = document.getElementsByClassName('vue-air-media-block')[0].id;
/* End Main URLs */


/* Components */

var airMediaCmp = Vue.extend({
    template: '#air-media',

    data: function() {
        return {            
			loading: true,
			splash: false,
			windows: false,
			macOs: false,
			chromeOs: false,
			iOs: false,
			andriod: false,
			force: false,
			manual: false,
			info: false,
			airmediainfo: false,
			zoomroominfo: false,
			time: 5,
			interval: null,
			os: "",
			url: ""
			
        }
    },
	
	mounted: function() {		
		this.getOS();
		this.loading = false;
		this.splash = true;
		//this.airmediainfo = true;
	},

    methods: {
        
		getOS: function(){
			userAgent = window.navigator.userAgent,
			platform = window.navigator.platform,
			macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'],
			windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'],
			iosPlatforms = ['iPhone', 'iPad', 'iPod'],
			chromePlatforms = ['CrOS'];
			
			if (macosPlatforms.indexOf(platform) !== -1) {
				this.macOs = true;
				this.os = "mac";
				//this.interval = setInterval(this.incrementTime, 1000);
				this.url = "https://web.bftv.ucdavis.edu/airmedia/1207-RMI-S_AirMedia_169.237.216.129.dmg";
			} else if (windowsPlatforms.indexOf(platform) !== -1) {
				this.windows = true;
				this.os = "win";
				//this.interval = setInterval(this.incrementTime, 1000);
				this.url = "https://www.bftv.ucdavis.edu/sites/g/files/dgvnsk1346/files/files/page/AirMedia_Windows.zip";				
			} else if (chromePlatforms.indexOf(platform) !== -1) {
				this.chromeOs = true;
				this.os = "ChromeOS";
				//this.interval = setInterval(this.incrementTime, 1000);
				this.url = 'https://chrome.google.com/webstore/detail/airmedia-sender/ljophmlbljnjodcbogmdogcpclifenpk';				
			} else if (/Android/.test(userAgent)) {
				this.andriod = true;
				this.os = 'Android';
				//this.interval = setInterval(this.incrementTime, 1000);
				this.url = 'https://play.google.com/store/apps/details?id=com.crestron.airmedia&hl=en_US';
			} else if (iosPlatforms.indexOf(platform) !== -1) {
				this.iOs = true;
				this.os = 'iOS';
				//this.interval = setInterval(this.incrementTime, 1000);
				this.url = 'https://itunes.apple.com/us/app/crestron-airmedia/id685412055';
			} 
			
			/* else if (!os && /Linux/.test(platform)) {
				os = 'Linux';
			} */
		},
		incrementTime: function() {
			if (this.time == 0){
				/* clearInterval(this.interval);
				this.force = true;
				if(this.os == "mac"){
					this.url = "https://web.bftv.ucdavis.edu/airmedia/1207-RMI-S_AirMedia_169.237.216.129.dmg";
					this.download(this.url);					
				} else if (this.os == "win") {
					this.url = "https://www.bftv.ucdavis.edu/sites/g/files/dgvnsk1346/files/files/page/AirMedia_Windows.zip";
					this.download(this.url);
				} else if (this.os == "ChromeOS") {
					window.location.href ='https://chrome.google.com/webstore/detail/airmedia-sender/ljophmlbljnjodcbogmdogcpclifenpk';
				} else if (this.os == "Android") {
					window.location.href='https://play.google.com/store/apps/details?id=com.crestron.airmedia&hl=en_US';
				} else if (this.os == "iOS") {
					window.location.href='https://itunes.apple.com/us/app/crestron-airmedia/id685412055';
				}  */
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
			this.force = false;
			this.airmediainfo = false;
			this.zoomroominfo = false;
			this.splash = false;
			this.manual = true;
			this.loading = false;
		},
		backToSplash: function() {
			this.loading = true;
			this.force = false;
			this.airmediainfo = false;
			this.zoomroominfo = false;
			this.splash = true;
			this.manual = false;
			this.loading = false;
		},
		airMediaIns: function() {
			this.loading = true;
			this.force = false;
			this.airmediainfo = true;
			this.zoomroominfo = false;
			this.splash = false;
			this.manual = false;
			this.loading = false;
		},
		zoomRoomIns: function() {
			this.loading = true;
			this.force = false;
			this.airmediainfo = false;
			this.zoomroominfo = true;
			this.splash = false;
			this.manual = false;
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
	//mode: 'history',	
	
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
