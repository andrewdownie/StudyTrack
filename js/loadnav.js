/////                  Url mapped to id of navlinks
/////                           used to set the active navlink
/////
var url_navlink_dict = {
    "": "index",
    "index.html": "index",
    "projects.html": "projects"
}








/////                   Variables
/////
/////
var USER_DATA_SHEET_NAME = "StudyTrackUserData"
var OAUTH_TOKEN = "OAUTH_TOKEN";            // Name given to the users OAuth token cookie
var oauth_expireTime;
var USERDATA_SHEET_ID = "USERDATA_SHEET_ID"; // Name given to the users data sheet id cookie
var GoogleAuth; // Google Auth object.
var isAuthorized = false;
var currentApiRequest = false;








/////                   Document Ready
/////   
/////
$(document).ready(function(){
    //TODO: OAuth token is undefined.....................................................................
    var OAuthCookie = getCookie(OAUTH_TOKEN);


    if(OAuthCookie == "" && !CheckPath("login.html")){
        //window.location.replace("login.html");
        Redirect("login.html");
        return;
    }

    

    if(OAuthCookie != "" && typeof OAuthCookie != "undefined"){
        console.log("---- check for ss");
        CheckForSS();


        $.get("navbar.html", function(navbarHtml){
            $("body").prepend(navbarHtml);
            $(".temp-navbar").remove();


            ///
            /// If logged in, set the current page as active in the navbar
            ///
            //var activeLinkID = url_navlink_dict[window.location.pathname];
            //$("#" + activeLinkID).addClass("active");
            SetActiveLink();




            $("#logout").click(function(){
                setCookie(OAUTH_TOKEN, "", 0);
                //window.location.href = "/login.html";
                Redirect("login.html");
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
        oauth_expireTime = isSignedIn.Zi.expires_at


                //console.log(isSignedIn.Zi.access_token);

        if(currentTime < oauth_expireTime){
            setCookieEpoch(OAUTH_TOKEN, isSignedIn.Zi.access_token, isSignedIn.Zi.expires_at);
            var oauthCookie = getCookie(OAUTH_TOKEN);

            //if(oauthCookie != "" && typeof oauthCookie != 'undefined' && window.location.pathname == "/login.html"){
            if(oauthCookie != "" && typeof oauthCookie != 'undefined' && CheckPath("login.html")){
                //window.location.replace("index.html");
                Redirect("index.html");
                console.log("the user has signed in, go to index.html");
                return;
            }
            else{
                console.log("The user has failed to sign in.");
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

    var url = "https://content.googleapis.com/drive/v3/files?access_token=" + getCookie(OAUTH_TOKEN);
    var matches = 0;
    var lastFoundSheetID = "";

    $.ajax({
        contentType: 'application/json',
        dataType: 'json',
        type: 'GET',
        url: url, 
        success: function(data){
            console.log("Check for SS success");
            //console.log(data);
            for(var i in data.files){
                if(data.files[i].name == USER_DATA_SHEET_NAME){
                    matches = matches + 1;
                    lastFoundSheetID = data.files[i].id;
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
                //userdata_sheetID = lastFoundSheetID;
                setCookie(USERDATA_SHEET_ID, lastFoundSheetID, oauth_expireTime);
                console.log("User data sheet already exists, no need to create it, we are going to use sheet: " + getCookie(USERDATA_SHEET_ID));

                console.log("Loading worksheets...");
                ListSheets();
            }
        },
        error: function(data){
            console.log("Check for SS failure");
            console.log(data);
        },
    });





}








/////                   Create SS
/////                           Creates the user data spreadsheet
/////
function CreateSS(name){
    var url = "https://sheets.googleapis.com/v4/spreadsheets?access_token=" + getCookie(OAUTH_TOKEN);
    var ajax_data =
    `
    {
        "properties": {
            "title": "{name}"
        }
    }
    `;
    ajax_data = ajax_data.replace("{name}", name);
    console.log(ajax_data);

    $.ajax({
        contentType: 'application/json',
        dataType: 'json',
        data: ajax_data,
        type: 'POST',
        url: url, 
        success: function(data){
            console.log("Create spreadsheet success");
            console.log(data);
        },
        error: function(data){
            console.log("Create spreadsheet failure");
            console.log(data);
        },
    });
}








/////                   Insert Project Goals
/////                           Insert a new row into columns A, B, C and D
/////
function InsertProjectGoals(projectName, minimumGoal, idealGoal, callback){
    var url = "https://sheets.googleapis.com/v4/spreadsheets/" + getCookie(USERDATA_SHEET_ID) + "/values/" + SheetName() + "!A1:D1:append?valueInputOption=RAW&access_token=" + getCookie(OAUTH_TOKEN);

    console.log("the url is: " + url);

    var ajax_data = 
    `
    {
        "values": [["{projectID}", "{projectName}", "{minimumGoal}", "{idealGoal}"]]
    } 
    `;
    
    var projectID = (Math.random()*1e32).toString(36);
    console.log("Project ID is: " + projectID);

    ajax_data = ajax_data.replace("{projectID}", projectID);
    ajax_data = ajax_data.replace("{projectName}", projectName);
    ajax_data = ajax_data.replace("{minimumGoal}", minimumGoal);
    ajax_data = ajax_data.replace("{idealGoal}", idealGoal);


    // Execute the API request.
    $.ajax({
        contentType: 'application/json',
        dataType: 'json',
        data: ajax_data,
        type: 'POST',
        url: url, 
        success: function(ajaxData){
            console.log("Insert row into sheet success");
            console.log(ajaxData);
            callback(ajaxData, projectID, projectName, minimumGoal, idealGoal);
        },
        error: function(ajaxData){
            console.log("Insert row into sheet failure");
            console.log(ajaxData);
            callback(ajaxData, projectID, projectName, minimumGoal, idealGoal);
        },
    });
}








/////                   Insert Project Goals Header
/////                           Insert the header row into columns A, B, C and D 
/////
function InsertProjectGoalsHeader(){
    var url = "https://sheets.googleapis.com/v4/spreadsheets/" + getCookie(USERDATA_SHEET_ID) + "/values/" + SheetName() + "!A1:D1:append?valueInputOption=RAW&access_token=" + getCookie(OAUTH_TOKEN);


    var ajax_data = 
    `
    {
        "values": [["Project ID", "Project Name", "Minimum Goal", "Ideal Goal"]]
    } 
    `;
    


    // Execute the API request.
    $.ajax({
        contentType: 'application/json',
        dataType: 'json',
        data: ajax_data,
        type: 'POST',
        url: url, 
        success: function(ajaxData){
            console.log("Insert header row into sheet success");
            console.log(ajaxData);
        },
        error: function(ajaxData){
            console.log("Insert header row into sheet failure");
            console.log(ajaxData);
        },
    });
}








/////                   ReadProjectGoals
/////
/////
function ReadProjectGoals(callback){
    var access_token = getCookie(OAUTH_TOKEN);
    var url = "https://sheets.googleapis.com/v4/spreadsheets/" + getCookie(USERDATA_SHEET_ID) + "/values/" + SheetName() + "!A2:D?access_token=" + access_token;
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
            callback(data);
        },
        error: function(data){
            console.log("Get project goals failure");
            console.log(data);
            callback(data);
        },
    });
}








/////                   Insert Study Time
/////                           Inserts a new row into this weeks work sheet in columns A and B
/////
function InsertStudyTime(projectID, duration){
    var url = "https://sheets.googleapis.com/v4/spreadsheets/" + getCookie(USERDATA_SHEET_ID) + "/values/" + SheetName() + "!F1:G1:append?valueInputOption=RAW&access_token=" + getCookie(OAUTH_TOKEN);
    //console.log("the url is: " + url);
    var ajax_data = 
    `
    {
        "values": [["{projectID}", "{duration}"]]
    } 
    `;

    ajax_data = ajax_data.replace("{projectID}", projectID);
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








/////                   ReadStudyTime
/////
/////
function ReadStudyTime(callback){
    var access_token = getCookie(OAUTH_TOKEN);
    var url = "https://sheets.googleapis.com/v4/spreadsheets/" + getCookie(USERDATA_SHEET_ID) + "/values/" + SheetName() + "!F2:G?access_token=" + access_token;
    console.log("the url is: " + url);


    // Execute the API request.
    $.ajax({
        contentType: 'application/json',
        dataType: 'json',
        type: 'GET',
        url: url, 
        success: function(data){
            console.log("Read study time success");
            console.log(data);
            callback(data);
        },
        error: function(data){
            console.log("Read study time failure");
            console.log(data);
            callback(data);
        },
    });
}








/////                   List Sheets
/////                           List all the work sheets in the user data spreadsheet
/////
function ListSheets(){
    console.log("Loading user data work sheet...");
    var url = "https://sheets.googleapis.com/v4/spreadsheets/" + getCookie(USERDATA_SHEET_ID) + "?includeGridData=false&access_token=" + getCookie(OAUTH_TOKEN);



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
    var url = "https://sheets.googleapis.com/v4/spreadsheets/" + getCookie(USERDATA_SHEET_ID) + ":batchUpdate/?access_token=" + getCookie(OAUTH_TOKEN);
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
                        "columnCount": 7 
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
            InsertStudyTime("Project ID", "Study Duration (H:M:S)");
            InsertProjectGoalsHeader();
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








/////                   UpdateProjectGoal
/////
/////
function UpdateProjectGoal(projectID, newName, newMinTime, newIdealTime, projectRowNum, callback){
    var url = "https://sheets.googleapis.com/v4/spreadsheets/" + getCookie(USERDATA_SHEET_ID) + "/values/" + SheetName() + "!A" + projectRowNum + ":D" + projectRowNum + "?valueInputOption=RAW&access_token=" + getCookie(OAUTH_TOKEN);

    console.log("the update url is: " + url);

    var ajax_data = 
    `
    {
        "values": [["{projectID}", "{projectName}", "{minimumGoal}", "{idealGoal}"]]
    } 
    `;
    
    var projectID = (Math.random()*1e32).toString(36);
    console.log("Project ID is: " + projectID);

    ajax_data = ajax_data.replace("{projectID}", projectID);
    ajax_data = ajax_data.replace("{projectName}", newName);
    ajax_data = ajax_data.replace("{minimumGoal}", newMinTime);
    ajax_data = ajax_data.replace("{idealGoal}", newIdealTime);


    // Execute the API request.
    $.ajax({
        contentType: 'application/json',
        dataType: 'json',
        data: ajax_data,
        type: 'PUT',
        url: url, 
        success: function(ajaxData){
            console.log("Insert row into sheet success");
            console.log(ajaxData);
            callback(ajaxData, projectID, newName, newMinTime, newIdealTime);
        },
        error: function(ajaxData){
            console.log("Insert row into sheet failure");
            console.log(ajaxData);
            callback(ajaxData, projectID, newName, newMinTime, newIdealTime);
        },
    });



}








/////                   Redirect
/////                           : Redirects by changing the last part of the current url
/////
function Redirect(urlEnd){
    console.log("redirect pls");
    var path = window.location.pathname;
    var pathSplit = path.split("/");
    var pathRebuilt = "";

    for(var i = 0; i < pathSplit.length - 1; i++){
        pathRebuilt += pathSplit[i] + "/";
    }

    pathRebuilt += urlEnd;

    window.location.href = pathRebuilt;
}








/////                   CheckPage
/////                           : gets the last part of the current url, and checks the passed in string to see if they are the same.
/////
function CheckPath(checkUrl){
    var path = window.location.pathname;
    var pathSplit = path.split("/");
    var urlEnd = pathSplit[pathSplit.length - 1];

    if(urlEnd == checkUrl){
        return true;
    }

    return false;
}








/////                   Set Active Link
/////   
/////
function SetActiveLink(){
    var path = window.location.pathname;
    var pathSplit = path.split("/");
    var urlEnd = pathSplit[pathSplit.length - 1];

    var activeLinkID = url_navlink_dict[urlEnd];
    $("#" + activeLinkID).addClass("active");
}