/* Main URLs */
newsSiteURL = "https://news.bftv.ucdavis.edu";
APIurl = newsSiteURL+"/jsonapi/node/news_article?sort=-created";
gDiffPage = false;
const blockID = document.getElementsByClassName('vue-news-block')[0].id;
/* End Main URLs */

/* Global Filters */

Vue.filter('imgstriptruncate', function (text, stop, clamp) {
	var content = text.slice(0, stop) + (stop < text.length ? clamp || '...' : '');
	return content.replace(/<img[^>"']*((("[^"]*")|('[^']*'))[^"'>]*)*>/g,"");
});
Vue.filter('fiximg', function (text) {
	var content = text;
	return content.replace(new RegExp('src="/sites', 'g'), 'class="inline-img" src="'+newsSiteURL+'/sites');
});

/* End Global Filters */


/* Components */

var newsList = Vue.extend({
    template: '#news-list-template',

    data: function() {
        return {
            newsData: null,
			thumbnails: '',
			moment: moment,
			loading: true,
			itemsShown: 10,
			listShow: false,
			department: 'bftv',
			diffPage: false,
			mainNewsPage: ''
        }
    },

	mounted: function() {
		this.itemsShown = drupalSettings.pdb.configuration[blockID].itemsPerPage,
		this.listShow = drupalSettings.pdb.configuration[blockID].ShowListing,
		this.department = drupalSettings.pdb.configuration[blockID].Department,
		this.diffPage = drupalSettings.pdb.configuration[blockID].DiffPage,
		gDiffPage = this.diffPage,
		this.mainNewsPage = drupalSettings.pdb.configuration[blockID].MainNewsPage,
		firstURL = this.URLBuilder(this.department),
		finalURL = APIurl+firstURL+'&page[limit]='+this.itemsShown,
		this.getNewsList(finalURL)
	},

    methods: {
        getNewsList: function(url){
				axios.get(url).then(response => {
				this.newsData = response.data.data,
				this.thumbnails = response.data.included,
				this.loading = false
			})
		},
		findthumbnail: function(imgid) {
			for(var i=0; i < this.thumbnails.length; i++){
				if(this.thumbnails[i].id == imgid){
					return newsSiteURL+"/sites/g/files/dgvnsk1131/files/styles/sf_thumbnail/public"+this.thumbnails[i].attributes.uri.value.substr(8)+"?"
				}
			}
		},
		goNewsLink: function(uuid) {
			window.location.href = this.mainNewsPage+'#/news/'+uuid
		},
		URLBuilder: function(path){
			if(path == 'bftv'){
				return '&include=field_sf_primary_image'
			}
			else if(path == 'bae'){
				return '&filter[category][condition][path]=field_fbtv_news_for.id&filter[category][condition][operator]=%3D&filter[category][condition][value]=9a04d3a5-d0b8-4c0b-8649-11fb9179759a&include=field_sf_primary_image'
			}
			else if(path == 'fst'){
				return '&filter[category][condition][path]=field_fbtv_news_for.id&filter[category][condition][operator]=%3D&filter[category][condition][value]=ce16a904-890b-4ddd-8954-41b13dea0b3d&include=field_sf_primary_image'
			}
			else if (path == 'ven'){
				return '&filter[category][condition][path]=field_fbtv_news_for.id&filter[category][condition][operator]=%3D&filter[category][condition][value]=a136800e-308a-4672-a42d-141b4cb9e594&include=field_sf_primary_image'
			}
			else if (path == 'txc'){
				return '&filter[category][condition][path]=field_fbtv_news_for.id&filter[category][condition][operator]=%3D&filter[category][condition][value]=4eed687e-715b-405f-b5fb-1a32039ec0f3&include=field_sf_primary_image'
			}
		}
	},
})

var singleNews = Vue.extend({
    template: '#single-news-template',

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
	if(gDiffPage){
		mode: 'history'
	},

	scrollBehavior() {
		return { x: 0, y: 0 };
	},

	routes: [
		{
			path: '*',
			component: newsList
		},
		{
			path: '/news/:newsID',
			name: 'news',
			component: singleNews
		}
	]
});

/* End Router */

/* Initialize */

new Vue({
	el: '#news-block',
	router
})

/* End Initialize */
