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
			arrow: '',
			moment: moment,
			InitialURL: 'https://web.bftv.ucdavis.edu/crashplan/index.php',
			MainURL: 'https://web.bftv.ucdavis.edu/crashplan/reports.json',			
			sortdir: 'ASC',
			sortkey: '',
			loading: true
        }
    },
	
	mounted: function() {				
		this.getDevList(this.InitialURL, this.MainURL)
	},

    methods: {
        getDevList: async function(url1, url2){
				requestOne = axios.get(url1),
				setTimeout(() => { requestTwo = axios.get(url2); }, 1500);
				setTimeout(() => {
					axios.all([requestOne, requestTwo]).then(axios.spread((...responses) => {
						this.devData = responses[1].data.data,
						this.loading = false
						//this.devData = this.multisort(this.devData, ['deviceName'], ['ASC'])
					}));
				}, 2500);
				
		},
		multisort: function(arr, columns, order_by) {
			if(typeof columns == 'undefined') {
				columns = []
				for(x=0;x<arr[0].length;x++) {
					columns.push(x);
				}
			}

			if(typeof order_by == 'undefined') {
				order_by = []
				for(x=0;x<arr[0].length;x++) {
					order_by.push('ASC');
				}
			}

			function multisort_recursive(a,b,columns,order_by,index) {  
				var direction = order_by[index] == 'DESC' ? 1 : 0;

				var is_numeric = !isNaN(+a[columns[index]] - +b[columns[index]]);


				var x = is_numeric ? +a[columns[index]] : a[columns[index]].toLowerCase();
				var y = is_numeric ? +b[columns[index]] : b[columns[index]].toLowerCase();



				if(x < y) {
						return direction == 0 ? -1 : 1;
				}

				if(x == y)  {               
					return columns.length-1 > index ? multisort_recursive(a,b,columns,order_by,index+1) : 0;
				}

				return direction == 0 ? 1 : -1;
			}
			
			if(this.sortdir == 'ASC'){
				this.sortdir = 'DESC',
				this.arrow = '\u25B2';
				this.sortkey = columns[0];
			} else {
				this.sortdir = 'ASC',				
				this.arrow = '\u25BC';
				this.sortkey = columns[0];
			}
			
			return arr.sort(function (a,b) {
				return multisort_recursive(a,b,columns,order_by,0);
			});
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
