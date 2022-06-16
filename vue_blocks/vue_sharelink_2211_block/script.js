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
const blockID = document.getElementsByClassName('vue-sharelink-2211-block')[0].id;
/* End Main URLs */


/* Components */

var shareLink = Vue.extend({
    template: '#sharelink',

    data: function() {
        return {            
			loading: true,
			windows: false,
			macOs: false,
			chromeOs: false,
			iOs: false,
			andriod: false,
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
			windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'],
			iosPlatforms = ['iPhone', 'iPad', 'iPod'],
			chromePlatforms = ['CrOS'];
			
			if (macosPlatforms.indexOf(platform) !== -1) {
				this.macOs = true;
				this.os = "mac";
				//this.interval = setInterval(this.incrementTime, 1000);
				this.url = "https://web.bftv.ucdavis.edu/airmedia/ShareLink_2211_.169.237.216.131.dmg";
			} else if (windowsPlatforms.indexOf(platform) !== -1) {
				this.windows = true;
				this.os = "win";
				//this.interval = setInterval(this.incrementTime, 1000);
				this.url = "https://web.bftv.ucdavis.edu/airmedia/ShareLink_2211_.169.237.216.131.exe";				
			} else if (chromePlatforms.indexOf(platform) !== -1) {
				this.chromeOs = true;
				this.os = "ChromeOS";
				//this.interval = setInterval(this.incrementTime, 1000);
				this.url ='https://play.google.com/store/apps/details?id=com.extron.sharelink&hl=en';				
			} else if (/Android/.test(userAgent)) {
				this.andriod = true;
				this.os = 'Android';
				//this.interval = setInterval(this.incrementTime, 1000);
				this.url ='https://play.google.com/store/apps/details?id=com.extron.sharelink&hl=en';
			} else if (iosPlatforms.indexOf(platform) !== -1) {
				this.iOs = true;
				this.os = 'iOS';
				//this.interval = setInterval(this.incrementTime, 1000);
				this.url ='https://apps.apple.com/us/app/mirrorop-for-extron-sharelink/id959814935';
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
					this.url = "https://web.bftv.ucdavis.edu/airmedia/ShareLink_2211_.169.237.216.131.dmg";
					this.download(this.url);					
				} else if (this.os == "win") {
					this.url = "https://web.bftv.ucdavis.edu/airmedia/ShareLink_2211_.169.237.216.131.exe";
					this.download(this.url);
				} else if (this.os == "ChromeOS") {
					window.location.href ='https://play.google.com/store/apps/details?id=com.extron.sharelink&hl=en';
				} else if (this.os == "Android") {
					window.location.href='https://play.google.com/store/apps/details?id=com.extron.sharelink&hl=en';
				} else if (this.os == "iOS") {
					window.location.href='https://apps.apple.com/us/app/mirrorop-for-extron-sharelink/id959814935';
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
			//clearInterval(this.interval);
			this.windows = false;
			this.macOs = false;
			this.chromeOs = false;
			this.iOs = false;
			this.android = false;
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
			component: shareLink 
		}
	]
});

/* End Router */

/* Initialize */

new Vue({
	el: '#sharelink-block',
	router
})

/* End Initialize */
