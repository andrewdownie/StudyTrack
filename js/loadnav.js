/////                   Url mapped to id of navlinks
/////                           used to set the active navlink
/////
var url_navlink_dict = {
    "": "index",
    "/index.html": "index",
    "/projects.html": "projects"
}





/////                   Variables
/////
/////
var USER_DATA_SHEET_NAME = "StudyTrackUserData"
var OAUTH_TOKEN = "OAUTH_TOKEN";    // Name given to the users OAuth token cookie
var userdata_sheetID;
var GoogleAuth; // Google Auth object.
var isAuthorized = false;
var currentApiRequest = false;





/////                   Document Ready
/////   
/////
$(document).ready(function(){
    //TODO: OAuth token is undefined.....................................................................
    console.log("Load nav ready, auth cookie val is: " + getCookie(OAUTH_TOKEN));

    var OAuthCookie = getCookie(OAUTH_TOKEN);

    if(OAuthCookie == "" && window.location.pathname != "/login.html"){
        console.log("The user is not logged in, go to login.html");
        window.location.replace("login.html");
        return;
    }

    

    if(OAuthCookie != "" && typeof OAuthCookie != "undefined"){
        console.log("---- check for ss");
        CheckForSS();


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
            var activeLinkID = url_navlink_dict[window.location.pathname];
            $("#" + activeLinkID).addClass("active");




            $("#logout").click(function(){
                setCookie(OAUTH_TOKEN, "", 0);
                window.location.replace("/login.html");
            });


        });
    }


});





/////                   Setup GoogleAuth object
/////                           Handles OAuth and signing the user in
/////
function initClient() {

    gapi.client.init({
        'apiKey': 'AIzaSyDPpbEG8KS9Eu3-yrx9TAlCqaCaCVNCN48',
        'clientId': '794809467159-f7ngrrspdm6vkma7b6e898d7et7j4p1u.apps.googleusercontent.com',
        'scope': 'https://www.googleapis.com/auth/drive.file',
        'discoveryDocs': ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
    }).then(function () {
        GoogleAuth = gapi.auth2.getAuthInstance();

        // Listen for sign-in state changes.
        GoogleAuth.isSignedIn.listen(updateSigninStatus);//This doesn't seem to work...
        
        SignInWrapper();
    });
}





/**
 * Listener called when user completes auth flow. If the currentApiRequest
 * variable is set, then the user was prompted to authorize the application
 * before the request executed. In that case, proceed with that API request.
 */
function updateSigninStatus(isSignedIn) {
    console.log("pls, why doesn' this get called when a user is done with the popup or ever?")

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





/////                   Sign in wrapper
/////                           Attempts to sign the user in, and then checks (in a sketchy manner) that the user successfully signed in.
/////
function SignInWrapper(){
    GoogleAuth.signIn()
    .then(function(isSignedIn){
        var currentTime = (new Date).getTime();
        var expireTime = isSignedIn.Zi.expires_at


        if(currentTime < expireTime){
            setCookieEpoch(OAUTH_TOKEN, isSignedIn.access_token, isSignedIn.Zi.expires_at);
            //console.log("the user is probably logged in?")
            //LoadUserDataSheet();
            //TODO: open user data sheet.... this needs to happen in a callback or directly in CheckForUserDataSheet()
            if(getCookie(OAUTH_TOKEN) != "" && window.location.pathname == "/login.html"){
                window.location.replace("index.html");
                console.log("the user has signed in, go to index.html");
                return;
            }
        }
        else{
            console.log("the user is not logged in")
        }
    });
}





/////                   Check SS 
/////                           Checks whether the user data spreadsheet already exists
/////
function CheckForSS(){
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
            CreateSS(USER_DATA_SHEET_NAME);
        }
        else{
            userdata_sheetID = lastFoundSheetID;
            console.log("User data sheet already exists, no need to create it, we are going to use sheet: " + userdata_sheetID);

            console.log("Loading worksheets...");
            ListSheets();
        }

    });

}





/////                   Create SS
/////                           Creates the user data spreadsheet
/////
function CreateSS(name){
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
        ListSheets();
    });
}





/////                   Insert Project Goals
/////                           Insert a new row into columns D, E and F
/////
function InsertProjectGoals(project, minimumGoal, idealGoal){
    var access_token = gapi.client.getToken().access_token;
    var url = "https://sheets.googleapis.com/v4/spreadsheets/" + userdata_sheetID + "/values/" + SheetName() + "!D1:F1:append?valueInputOption=RAW&access_token=" + access_token;
    console.log("the url is: " + url);
    var ajax_data = 
    `
    {
        "values": [["{project}", "{minimumGoal}", "{idealGoal}"]]
    } 
    `;

    ajax_data = ajax_data.replace("{project}", project);
    ajax_data = ajax_data.replace("{minimumGoal}", minimumGoal);
    ajax_data = ajax_data.replace("{idealGoal}", idealGoal);


    // Execute the API request.
    $.ajax({
        contentType: 'application/json',
        dataType: 'json',
        data: ajax_data,
        type: 'POST',
        url: url, 
        success: function(data){
            console.log("Insert row into sheet success");
            console.log(data);
        },
        error: function(data){
            console.log("Insert row into sheet failure");
            console.log(data);
        },
    });
}





/////                   ReadProjectGoals
/////
/////
function ReadProjectGoals(){
    var access_token = getCookie(OAUTH_TOKEN);
    var url = "https://sheets.googleapis.com/v4/spreadsheets/" + userdata_sheetID + "/values/" + SheetName() + "!D2:F30?valueInputOption=RAW&access_token=" + access_token;
    console.log("the url is: " + url);


    // Execute the API request.
    $.ajax({
        contentType: 'application/json',
        dataType: 'json',
        type: 'GET',
        url: url, 
        success: function(data){
            console.log("Get project goals success");
            console.log(data);
        },
        error: function(data){
            console.log("Get project goals failure");
            console.log(data);
        },
    });
}





/////                   Insert Study Time
/////                           Inserts a new row into this weeks work sheet in columns A and B
/////
function InsertStudyTime(project, duration){
    var access_token = gapi.client.getToken().access_token;
    var url = "https://sheets.googleapis.com/v4/spreadsheets/" + userdata_sheetID + "/values/" + SheetName() + "!A1:B1:append?valueInputOption=RAW&access_token=" + access_token;
    console.log("the url is: " + url);
    var ajax_data = 
    `
    {
        "values": [["{project}", "{duration}"]]
    } 
    `;

    ajax_data = ajax_data.replace("{project}", project);
    ajax_data = ajax_data.replace("{duration}", duration);


    // Execute the API request.
    $.ajax({
        contentType: 'application/json',
        dataType: 'json',
        data: ajax_data,
        type: 'POST',
        url: url, 
        success: function(data){
            console.log("Insert row into sheet success");
            console.log(data);
        },
        error: function(data){
            console.log("Insert row into sheet failure");
            console.log(data);
        },
    });
}





/////                   List Sheets
/////                           List all the work sheets in the user data spreadsheet
/////
function ListSheets(){
    console.log("Loading user data work sheet...");
    var access_token = gapi.client.getToken().access_token;
    //var url = 'https://spreadsheets.google.com/feeds/worksheets/' + userdata_sheetID + '/private/full?alt=json&access_token=' + access_token;
    var url = "https://sheets.googleapis.com/v4/spreadsheets/" + userdata_sheetID + "?includeGridData=false&access_token=" + access_token;



    var thisWeeksSheet = SheetName();
    var thisWeeksNameFound = false;

    $.ajax({
        url: url, 
        type: 'GET',
        success: function(data){
            console.log("List work sheets success:");
            console.log(data);


            var thisWeeksSheetFound = false;

            for(var i in data.sheets){
                if(data.sheets[i].properties.title == thisWeeksSheet)
                {
                    thisWeeksSheetFound = true;
                }
            }

            if(thisWeeksSheetFound == false){
                console.log("We didnt find this weeks sheet, create it now");
                CreateSheet();
            }
            else{
                console.log("This weeks work sheet already exists");
            }
        },
        error: function(data){
            console.log("List work sheets failed! Error info next:");
            console.log(data);
        },
    });

}





/////                   Create Sheet 
/////                           Create this weeks work sheet in the user data spreadsheet
/////
function CreateSheet(){
    console.log("Inserting new worksheet into user data spread sheet...");
    var access_token = gapi.client.getToken().access_token;
    //var url = 'https://spreadsheets.google.com/feeds/worksheets/' + userdata_sheetID + '/private/full?access_token=' + access_token;
    var url = "https://sheets.googleapis.com/v4/spreadsheets/" + userdata_sheetID + ":batchUpdate/?access_token=" + access_token;
    var ajax_data = 
        `
        {
            "requests": [{
                "addSheet": {
                    "properties": {
                      "title": "{title}",
                      "sheetType": "GRID",
                      "gridProperties": {
                        "rowCount": 50,
                        "columnCount": 6 
                      }
                    }
                }
            }],
          }
        `;

    ajax_data = ajax_data.replace("{title}", SheetName());

    console.log("attempting to create a new work sheet");

    // Execute the API request.
    $.ajax({
        contentType: 'application/json',
        dataType: 'json',
        data: ajax_data,
        type: 'POST',
        url: url, 
        success: function(data){
            console.log("Create work sheet success");
            console.log(data);
            InsertStudyTime("Project", "Study Duration (H:M:S)");
            InsertProjectGoals("Project", "Minimum Goal", "Ideal Goal");
        },
        error: function(data){
            console.log("create work sheet failed! Error info next:");
            console.log(data);
        },
    });
}





/////                   Week Of Month
/////                           Returns the week of the current month
/////
function WeekOfMonth(){
    ///
    /// Generate the name of this weeks sheet
    /// Source: https://stackoverflow.com/questions/3280323/get-week-of-the-month, user: https://stackoverflow.com/users/3276277/eric
    ///
    var d = new Date();
    var date = d.getDate();
    var day = d.getDay();

    var weekOfMonth = Math.ceil((date - 1 - day) / 7);
    return weekOfMonth;
}





/////                   Sheet Name
/////                           Generate the name that this weeks sheet will be given
/////
function SheetName(){
    var d = new Date();

    return d.getFullYear().toString() + "-" + (d.getMonth() + 1).toString().padStart(2, '0') + "week" + WeekOfMonth();
}




