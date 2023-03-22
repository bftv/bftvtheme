/* Main URLs */
mainURL = 'https://web.bftv.ucdavis.edu/assignments/get-singles.php';
const blockID = document.getElementsByClassName('vue-single-assignment-block')[0].id;
/* End Main URLs */

/* Components */
var singleAssignmentsComp = Vue.extend({
    template: '#single-assignment-template',

    data: function() {
        return {
			loading: true,
			infoPi: null,
			infoStaff: null,
			screenmsg: null,
			hidebody: false,
			mode: 'pi',
			uuid: drupalSettings.singleAssignments.uuid,
			fa: drupalSettings.singleAssignments.fa,
			fa_sub: drupalSettings.singleAssignments.faSub,
			is_pi: drupalSettings.singleAssignments.isPi[0].value,
			assignee: drupalSettings.singleAssignments.assignee[0].value
        }
    },

	mounted: function() {
		this.getURL();
	},

    methods: {
		getURL: function(){
			url = mainURL+'?uuid='+this.uuid+'&type=';
			if(this.is_pi == 1 && this.assignee == 1){
				this.mode = 'dual'
				url1 = url+'pi'
				url2 = url+'staff'+this.urlBuilder()
				axios.all([
					axios.get(url1),
					axios.get(url2)
				]).then(axios.spread((response1, response2) => {
					this.infoPi = response1.data.info[0];
					this.infoStaff = response2.data.info;
				})).finally(() => {
					this.loading = false
				});
			} else {
				if(this.is_pi == 1){
					this.mode = 'pi'
					url += 'pi'
				} else if(this.assignee == 1){
					this.mode = 'staff'
					url += 'staff'
					url += this.urlBuilder();
				}
				axios.get(url).then(response => {
					if(this.mode == 'pi'){
						this.infoPi = response.data.info[0]
					} else {
						this.infoStaff = response.data.info
						this.infoStaff.sort(this.sortFname)
					}
					this.message = response.data.message
				}).catch(error => {
					if(error.response.status == 404){
						this.screenmsg = error.response.data.message,
						this.hidebody = true
					}
				}).finally(() => {
					this.loading = false
				})

			}
		},
		getLink: function(list){
			if(list){
				if(list.name.startsWith("BFTV") || list.name.startsWith("BAE")){
					return 'mailto:'+list.email;
				} else {
					return list.link;
				}
			}
		},
		sortSection: function(a, b, col){
            if(a['a_type'] === b['a_type']){
                return 0;
            } else {
                return (a['a_type'] < b['a_type']) ? -1 : 1;
            }
        },
		sortFname: function(a, b){
            if(a['firstname'] === b['firstname']){
                return 0;
            } else {
                return (a['firstname'] < b['firstname']) ? -1 : 1;
            }
        },
		sortDep: function(a, b){
            if(a['department'] === b['department']){
                return 0;
            } else {
                return (a['department'] < b['department']) ? -1 : 1;
            }
        },
		urlBuilder: function(){
			if(this.fa_sub.length > 0){
				if(this.fa_sub[0].target_id == 3986){
					url = '&col=3986'
				} else if(this.fa_sub[0].target_id == 3976){
					url = '&col=3976'
				}
			} else {
				url = '&col='
				for(var i=0; i<this.fa.length; i++){
					url += this.fa[i].target_id;
					if(i != (this.fa.length)-1){
						url += ','
					}
				}
			}
			return url;
		}
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
			component: singleAssignmentsComp,
			props: true
		}
	]
});

/* End Router */

/* Initialize */

new Vue({
	el: '#single-assignment-block',
	router
})

/* End Initialize */
