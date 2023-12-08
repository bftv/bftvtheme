//Authenticate users if needed
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        let originalRequest = error.config;
        if(error.code == 'ERR_NETWORK' || error.response.status == 401){
            w = 600;
            h = 800;
            url = 'https://web.bftv.ucdavis.edu/gsr/auth.php';
            LeftPosition = (screen.width) ? (screen.width-w)/2 : 0;
            TopPosition = (screen.height) ? (screen.height-h)/2 : 0;
            settings = 'height='+h+',width='+w+',top='+TopPosition+',left='+LeftPosition+',scrollbars=yes,resizable';
            popupWindow = window.open(url,"CAS - Central Authentication Service",settings);
            window.addEventListener('message', function(e) {
                // e.data hold the message from child
                if(e.data == "Authenticated."){
                    popupWindow.close();
                    originalRequest._retry = true;
                    //return axios(originalRequest);
                    this.location.reload();
                } else if (e.data == "Authentication failed."){
                    popupWindow.close();
                    originalRequest._retry = false;
                    return Promise.reject(e.data);
                }
            } , false);
            //return Promise.reject();
        }
        return Promise.reject(error);
    }
);

document.addEventListener('DOMContentLoaded', function() {
    // Your code goes here
    //console.log("Document is ready!");
    //const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]');
    //const popoverList = [...popoverTriggerList].map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl));
});
