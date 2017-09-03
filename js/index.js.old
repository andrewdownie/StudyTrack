$(document).ready(function(){
    ///
    /// Setup GoogleAuth object
    ///
    var GoogleAuth; // Google Auth object.
    function initClient() {

        gapi.client.init({
            'apiKey': 'AIzaSyDPpbEG8KS9Eu3-yrx9TAlCqaCaCVNCN48',
            'clientId': '794809467159-f7ngrrspdm6vkma7b6e898d7et7j4p1u.apps.googleusercontent.com',
            'scope': 'https://www.googleapis.com/auth/drive.file',
            'discoveryDocs': ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
        }).then(function () {
            GoogleAuth = gapi.auth2.getAuthInstance();

            //GoogleAuth.signIn(); //Google pop up will show up with this line uncommented, but this should be handled in the functions below

            // Listen for sign-in state changes.
            GoogleAuth.isSignedIn.listen(updateSigninStatus);
        });
    }



    ///
    /// TODO: LABEL DIS STUFF (once you understand it)
    ///
    var isAuthorized = false;
    var currentApiRequest = false;

    /**
     * Store the request details. Then check to determine whether the user
     * has authorized the application.
     *   - If the user has granted access, make the API request.
     *   - If the user has not granted access, initiate the sign-in flow.
     */
    function sendAuthorizedApiRequest(requestDetails) {
        currentApiRequest = requestDetails;
        if (isAuthorized) {
            // Make API request
            // gapi.client.request(requestDetails)

            // Reset currentApiRequest variable.
            currentApiRequest = {};
        } 
        else {
            GoogleAuth.signIn();
        }
    }

    /**
     * Listener called when user completes auth flow. If the currentApiRequest
     * variable is set, then the user was prompted to authorize the application
     * before the request executed. In that case, proceed with that API request.
     */
    function updateSigninStatus(isSignedIn) {
        if (isSignedIn) {
            isAuthorized = true;
            if (currentApiRequest) {
                sendAuthorizedApiRequest(currentApiRequest);
            }
        } 
        else {
            isAuthorized = false;
        }
    }


    ///
    /// Initialize GoogleAuth object
    ///
    gapi.load('client:auth2', initClient);



});
