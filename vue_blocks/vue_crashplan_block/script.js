var url_string = window.location.href;
var url = new URL(url_string);
var sortvalue = url.searchParams.get("sortkey");
var sortdirection = url.searchParams.get("sortdirection");

/* Get Block ID */
//MainURL = 'https://crashplan.caes.ucdavis.edu:4285/api/DeviceBackupReport';
const blockID = document.getElementsByClassName('vue-crashplan-block')[0].id;
/* End Get Block ID */
 

/* Components */

var devList = Vue.extend({
    template: '#device-list-template',

    data: function() {
        return {
            activeItem: false,			
			devData: null,	
			test: null,
			moment: moment,
			InitialURL: 'https://web.bftv.ucdavis.edu/crashplan/index.php',
			MainURL: 'https://web.bftv.ucdavis.edu/crashplan/reports.json',
			sortkey: '',
			sortdir: '',
			sortdiropp: '',
			delimator: '',
			loading: true
        }
    },
	
	mounted: function() {		
		/* this.activeItem = drupalSettings.pdb.configuration[blockID].ShowActive		
		if(this.activeItem == 1){
			this.MainURL += '?active=true'
		} */
		//axios.get('https://web.bftv.ucdavis.edu/crashplan/index.php'),
		this.getDevList(this.InitialURL, this.MainURL),
		
		this.sortkey = sortvalue,
		this.sortdir = sortdirection
		
		if(this.sortkey == null){
			this.sortkey = 'deviceName'
		}
		
		if(this.sortdir == null){
			this.sortdir = 'ASC',
			this.sortdiropp = 'ASC'
		} else if(this.sortdir == 'ASC') {
			this.sortdiropp = 'DESC'
		} else if(this.sortdir == 'DESC'){
			this.sortdiropp = 'ASC'
		}
	},

    methods: {
        getDevList: async function(url1, url2){
				requestOne = axios.get(url1),
				setTimeout(() => { requestTwo = axios.get(url2); }, 1500);
				setTimeout(() => {
					axios.all([requestOne, requestTwo]).then(axios.spread((...responses) => {
						this.devData = responses[1].data.data,
						this.loading = false
					}));
				}, 2500);
		}
		/* getDevList: async function(url){
				
			const err = await axios.
			get(url, {
				crossDomain: true,
				auth: {
					username: 'samtest',
					password: 'SamTest' // Bad password
				},
				headers: {
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Methods': 'GET',
					'Access-Control-Allow-Headers': 'x-csrf-token,authorization,contenttype,accept,origin,x-requested-with',
					'Content-Type': 'application/json'
				}
			}).then(response => {			
				this.devData = response.data.data,
				this.loading = false
			}).catch(err => err);
		} */
	}
})

var singleDev = Vue.extend({
    template: '#single-dev-template',

    data: function(){
        return {		
			newsItem: null,
			imgsrc: '',
			newsdocurl: '',
			newsdocname: '',
			moment: moment,
			loading: true
        }
    },

    mounted: function(){
        this.getTheNews();
    },

    methods: {
        getTheNews: function(){
            newsURL = newsSiteURL+"/jsonapi/node/news_article/"+this.$route.params.newsID+"?include=field_sf_primary_image",
			axios.get(newsURL).then(response => {
				this.newsItem = response.data.data,
				this.imgsrc = response.data.included ? newsSiteURL+response.data.included[0].attributes.uri.url : '',				
				this.loading = false				
			})
        },
		loadNewsDoc: function(docID){
			newsURL = newsSiteURL+"/jsonapi/file/file/"+docID,
			axios.get(newsURL).then(response => {
				this.newsdocurl = newsSiteURL+response.data.data.attributes.uri.url,
				this.newsdocname = response.data.data.attributes.filename
			})
		},
		goBack: function(){
			router.go(-1)
		}
    }
})


/* End Components */

/* Router */

var router = new VueRouter({
	
	routes: [
		{ 
			path: '*', 
			component: devList 
		},
		{ 
			path: '/dev/:devID', 
			name: 'dev', 
			component: singleDev
		}
	]
});

/* End Router */

/* Initialize */

new Vue({
	el: '#device-block',
	router
})

/* End Initialize */
