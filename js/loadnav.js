
var url_navlink_dict = {
    "": "index",
    "index.html": "index",
    "projects.html": "projects"
}

var USER_DATA_SHEET_NAME = "StudyTrackUserData"
var userdata_sheetID;
var GoogleAuth; // Google Auth object.
var isAuthorized = false;
var currentApiRequest = false;


$(document).ready(function(){

    $.get("navbar.html", function(navbarHtml){
        $("body").prepend(navbarHtml);
        $(".temp-navbar").remove();

        ///
        /// TODO: check if the user is logged in
        ///

            // TODO: if they are logged in show the nav bar links, and the log out button
            // TODO: if they are not logged in, show only the login button



        ///
        /// If logged in, set the current page as active in the navbar
        ///
        var urlPathPieces = window.location.pathname.split("/");
        var lastUrlPiece = urlPathPieces[urlPathPieces.length - 1];
        var activeLinkID = url_navlink_dict[lastUrlPiece];
        $("#" + activeLinkID).addClass("active");


        gapi.load('client:auth2', initClient);


        $("#login").click(function(){
            signinWrapper();
        });


    });

});

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
        //GoogleAuth.signIn();
        signinWrapper();
    }
}


///
/// Setup GoogleAuth object
///
function initClient() {

    gapi.client.init({
        'apiKey': 'AIzaSyDPpbEG8KS9Eu3-yrx9TAlCqaCaCVNCN48',
        'clientId': '794809467159-f7ngrrspdm6vkma7b6e898d7et7j4p1u.apps.googleusercontent.com',
        'scope': 'https://www.googleapis.com/auth/drive.file https://docs.google.com/feeds',
        'discoveryDocs': ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
    }).then(function () {
        GoogleAuth = gapi.auth2.getAuthInstance();

        //GoogleAuth.signIn(); //Google pop up will show up with this line uncommented, but this should be handled in the functions below
        

        // Listen for sign-in state changes.
        GoogleAuth.isSignedIn.listen(updateSigninStatus);
    });
}


/**
 * Listener called when user completes auth flow. If the currentApiRequest
 * variable is set, then the user was prompted to authorize the application
 * before the request executed. In that case, proceed with that API request.
 */
function updateSigninStatus(isSignedIn) {
    console.log("pls, why doesn' this get called when a user is done with the popup?")

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


function signinWrapper(){
    GoogleAuth.signIn()
    .then(function(isSignedIn){
        console.log(isSignedIn)
        var currentTime = (new Date).getTime();
        var expireTime = isSignedIn["Zi"]["expires_at"]


        if(currentTime < expireTime){
            //console.log("the user is probably logged in?")
            CheckForUserDataSheet();
            //LoadUserDataSheet();
            //TODO: open user data sheet.... this needs to happen in a callback or directly in CheckForUserDataSheet()
        }
        else{
            console.log("the user is not logged in")
        }
    });
}


function CheckForUserDataSheet(){
    var request = gapi.client.request({
        'method': 'GET',
        'path': '/drive/v3/files',
        'params': {}
    });



    var matches = 0;
    var lastFoundSheetID = "";
    // Execute the API request.
    request.execute(function(response) {
        console.log(response)
        console.log("----")

        for(var i in response.files){
            if(response.files[i].name == USER_DATA_SHEET_NAME){
                matches = matches + 1;
                lastFoundSheetID = response.files[i].id;
            }
        }

        if(matches > 1){
            console.error(matches + " sheets with name: " + USER_DATA_SHEET_NAME + " found! Uncertain what sheet will be loaded!");
        }


        if(matches == 0){
            console.log("Creating new user data sheet");
            CreateUserDataSheet(USER_DATA_SHEET_NAME);
        }
        else{
            userdata_sheetID = lastFoundSheetID;
            console.log("User data sheet already exists, no need to create it, we are going to use sheet: " + userdata_sheetID);

            console.log("Going to try to load worksheets...");
            LoadUserDataWorkSheets();
        }

    });

}


function CreateUserDataSheet(name){
    var request = gapi.client.request({
        'method': 'POST',
        'path': 'https://sheets.googleapis.com/v4/spreadsheets',
        'body': {
            'properties': {
                'title': name
            }
        },
    });

    // Execute the API request.
    request.execute(function(response) {
        console.log(response);
    });
}

function LoadUserDataSpreadSheet(){//TODO: this doesn't work yet
    var request = gapi.client.request({
        'method': 'POST',
        'path': 'https://spreadsheets.google.com/feeds/list/' + userdata_sheetID + '/' + "0"  + '/private/full',
        'body': {
            'properties': {
                'title': name
            }
        },
    });

    // Execute the API request.
    request.execute(function(response) {
        console.log(response);
    });
}

function LoadUserDataWorkSheets(){
    var access_token = gapi.client.getToken().access_token;
    console.log(access_token)
    var url = 'https://spreadsheets.google.com/feeds/worksheets/' + userdata_sheetID + '/private/full?access_token=' + access_token;


    // Execute the API request.
    $.get(url, function(data){
        console.log(data); 
    });
}