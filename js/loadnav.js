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
    var OAuthCookie = getCookie(OAUTH_TOKEN);

    /*if(CheckUrlEnd("oauth2.html")){
        var tokenFromQuery = loadPageVar("id_token");
        alert(tokenFromQuery);
        setCookie(OAUTH_TOKEN, tokenFromQuery); 
    }*/


    if(OAuthCookie == "" && !CheckUrlEnd("login.html")){
        Redirect("login.html");
        return;
    }

    

    if(OAuthCookie != "" && typeof OAuthCookie != "undefined"){
        //console.log("---- check for ss");
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
    var OAuthCookie = getCookie(OAUTH_TOKEN);
    if(OAuthCookie != "" && typeof OAuthCookie != "undefined"){
        return;
    }

    var API_KEY = 'AIzaSyDPpbEG8KS9Eu3-yrx9TAlCqaCaCVNCN48';
    var CLIENT_ID = encodeURI('794809467159-f7ngrrspdm6vkma7b6e898d7et7j4p1u.apps.googleusercontent.com');
    var SCOPE = encodeURI('https://www.googleapis.com/auth/drive.file');
    var DISCOVERY_DOC = encodeURI('https://www.googleapis.com/discovery/v1/apis/drive/v3/rest');


    gapi.client.init({
        'apiKey': API_KEY,
        'clientId': CLIENT_ID,
        'scope': SCOPE,
        'discoveryDocs': [DISCOVERY_DOC]
    }).then(function () {
        GoogleAuth = gapi.auth2.getAuthInstance();
        
    });

}








/////                   Sign in wrapper
/////                           Attempts to sign the user in, and then checks (in a sketchy manner) that the user successfully signed in.
/////
function SignInWrapper(){
    GoogleAuth.signIn()
    .then(function(isSignedIn){
        var oauth_expireTime = isSignedIn.Zi.expires_at

        setCookieEpoch(OAUTH_TOKEN, isSignedIn.Zi.access_token, oauth_expireTime);
        console.log("Login expires: " + oauth_expireTime);
        var oauthCookie = getCookie(OAUTH_TOKEN);

        if(oauthCookie != "" && typeof oauthCookie != 'undefined' && CheckUrlEnd("login.html")){
            Redirect("index.html");
            console.log("the user has signed in, go to index.html");
            return;
        }
        else{
            console.log("The user has failed to sign in.");
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
/////                           Insert a new row into columns A, B, C, D and E
/////
function InsertProjectGoals(projectName, minimumGoal, idealGoal, deleted, callback){
    var url = "https://sheets.googleapis.com/v4/spreadsheets/" + getCookie(USERDATA_SHEET_ID) + "/values/" + SheetName() + "!A1:E1:append?valueInputOption=RAW&access_token=" + getCookie(OAUTH_TOKEN);

    console.log("the url is: " + url);

    var ajax_data = 
    `
    {
        "values": [["{projectID}", "{projectName}", "{minimumGoal}", "{idealGoal}", "{deleted}"]]
    } 
    `;
    
    var projectID = (Math.random()*1e32).toString(36);
    projectID = projectID.replace("(", "");
    projectID = projectID.replace(")", "");
    console.log("Project ID is: " + projectID);

    ajax_data = ajax_data.replace("{projectID}", projectID);
    ajax_data = ajax_data.replace("{projectName}", projectName);
    ajax_data = ajax_data.replace("{minimumGoal}", minimumGoal);
    ajax_data = ajax_data.replace("{idealGoal}", idealGoal);
    ajax_data = ajax_data.replace("{deleted}", deleted.toString());


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
            callback(ajaxData, projectID, projectName, minimumGoal, idealGoal, deleted);
        },
        error: function(ajaxData){
            console.log("Insert row into sheet failure");
            console.log(ajaxData);
            callback(ajaxData, projectID, projectName, minimumGoal, idealGoal, deleted);
        },
    });
}








/////                   Insert Last Weeks Project Goals
/////                           Insert non-deleted rows into columns A, B, C, D and E
/////
function InsertLastWeeksProjectGoals(ajaxData){
    console.log("++ajax data");
    console.log(ajaxData);
    rows = ajaxData.values;

    var rowCount = 0;
    var newRows = [];

    for(var i in rows){
        if(rows[i][4] == "FALSE"){
            newRows[rowCount] = rows[i];
            rowCount ++;
        }
    }

    if(rowCount == 0){
        console.log("Last week had zero projects, nothing to bring over.");
    }
    console.log(newRows);

    // TODO: how do I batch insert?
    var url = "https://sheets.googleapis.com/v4/spreadsheets/" + getCookie(USERDATA_SHEET_ID) + "/values/" + SheetName() + "!A1:E" + rowCount + ":append?valueInputOption=RAW&access_token=" + getCookie(OAUTH_TOKEN);

    console.log("the url is: " + url);

    var front = 
    `
    {
        "values": 
            [\n`;
    var end=
    `
            ]
    }`;

    var ajax_data = front;

    for(var i in newRows){
        ajax_data += '                  [';
        ajax_data += '"' + newRows[i][0] + '", ';
        ajax_data += '"' + newRows[i][1] + '", ';
        ajax_data += '"' + newRows[i][2] + '", ';
        ajax_data += '"' + newRows[i][3] + '", ';
        ajax_data += '"' + newRows[i][4] + '"';
        ajax_data += ']';
        if(i < rowCount - 1){
            ajax_data += ',\n';
        }
    }

    //var row= `       ["{projectID}", "{projectName}", "{minimumGoal}", "{idealGoal}", "{deleted}"]`
    ajax_data += end;
    console.log("ajax data created is:");
    console.log(ajax_data);

    // Execute the API request.
    $.ajax({
        contentType: 'application/json',
        dataType: 'json',
        data: ajax_data,
        type: 'POST',
        url: url, 
        success: function(ajaxData){
            console.log("Insert last weeks projects into sheet success");
            console.log(ajaxData);
        },
        error: function(ajaxData){
            console.log("Insert last weeks projects into sheet failure");
            console.log(ajaxData);
        },
    });
}








/////                   Insert Project Goals Header
/////                           Insert the header row into columns A, B, C, D and E
/////
function InsertProjectGoalsHeader(){
    var url = "https://sheets.googleapis.com/v4/spreadsheets/" + getCookie(USERDATA_SHEET_ID) + "/values/" + SheetName() + "!A1:E1:append?valueInputOption=RAW&access_token=" + getCookie(OAUTH_TOKEN);


    var ajax_data = 
    `
    {
        "values": [["Project ID", "Project Name", "Minimum Goal", "Ideal Goal", "Deleted Status"]]
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
            ReadLastWeeksProjectGoals(InsertLastWeeksProjectGoals); 
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
    var url = "https://sheets.googleapis.com/v4/spreadsheets/" + getCookie(USERDATA_SHEET_ID) + "/values/" + SheetName() + "!A2:E?access_token=" + access_token;
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








/////                   ReadLastWeeksProjectGoals
/////
/////
function ReadLastWeeksProjectGoals(insertionCallback){
    var access_token = getCookie(OAUTH_TOKEN);
    var url = "https://sheets.googleapis.com/v4/spreadsheets/" + getCookie(USERDATA_SHEET_ID) + "/values/" + LastWeeksSheetName() + "!A2:E?access_token=" + access_token;
    console.log("the url is: " + url);


    // Execute the API request.
    $.ajax({
        contentType: 'application/json',
        dataType: 'json',
        type: 'GET',
        url: url, 
        success: function(data){
            console.log("Get last weeks project goals success, sheetname: " + LastWeeksSheetName());
            console.log(data);
            insertionCallback(data);
        },
        error: function(data){
            console.log("Get last weeks project goals failure, sheetname: " + LastWeeksSheetName());
            console.log(data);
        },
    });
}








/////                   Insert Study Time
/////                           Inserts a new row into this weeks work sheet in columns G and H
/////
function InsertStudyTime(projectID, duration){
    var url = "https://sheets.googleapis.com/v4/spreadsheets/" + getCookie(USERDATA_SHEET_ID) + "/values/" + SheetName() + "!G1:H1:append?valueInputOption=RAW&access_token=" + getCookie(OAUTH_TOKEN);

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
    var url = "https://sheets.googleapis.com/v4/spreadsheets/" + getCookie(USERDATA_SHEET_ID) + "/values/" + SheetName() + "!G2:H?access_token=" + access_token;
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
                        "columnCount": 8 
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
            InsertStudyTime("Project ID", "Study Duration (H:M:S)");
            InsertProjectGoalsHeader();
        },
        error: function(data){
            console.log("create work sheet failed! Error info next:");
            console.log(data);
        },
    });
}








/////                   LastSunday
/////                       Returns the day of the month for the most recent sunday 
/////
function LastSunday(){
    var d = new Date();
    d.setDate(d.getDate() - d.getDay());//TODO: use the setting the user wanted for start of the week here
    return d.getDate();
}








/////                   LastSunday
/////                           Returns the sunday previous to last sunday
/////
function LastLastSunday(){
    var d = new Date();
    d.setDate(d.getDate() - d.getDay() - 7);
    return d.getDate();
}








/////                   LastWeeksSheetName
/////                           Generate last weeks sheet name
/////
function LastWeeksSheetName(){
    var d = new Date();
    return d.getFullYear().toString() + "-" + (d.getMonth() + 1).toString().padStart(2, '0') + "-" + LastLastSunday();
}








/////                   Sheet Name
/////                           Generate the name that this weeks sheet will be given
/////
function SheetName(){
    var d = new Date();
    return d.getFullYear().toString() + "-" + (d.getMonth() + 1).toString().padStart(2, '0') + "-" + LastSunday();
}








/////                   UpdateProjectGoal
/////
/////
function UpdateProjectGoal(projectID, newName, newMinTime, newIdealTime, newDeleted, projectRowNum, callback){
    var url = "https://sheets.googleapis.com/v4/spreadsheets/" + getCookie(USERDATA_SHEET_ID) + "/values/" + SheetName() + "!A" + projectRowNum + ":E" + projectRowNum + "?valueInputOption=RAW&access_token=" + getCookie(OAUTH_TOKEN);

    console.log("the update url is: " + url);

    var ajax_data = 
    `
    {
        "values": [["{projectID}", "{projectName}", "{minimumGoal}", "{idealGoal}", {deleted}]]
    } 
    `;
    
    var projectID = (Math.random()*1e32).toString(36);
    console.log("Project ID is: " + projectID);

    ajax_data = ajax_data.replace("{projectID}", projectID);
    ajax_data = ajax_data.replace("{projectName}", newName);
    ajax_data = ajax_data.replace("{minimumGoal}", newMinTime);
    ajax_data = ajax_data.replace("{idealGoal}", newIdealTime);
    ajax_data = ajax_data.replace("{deleted}", newDeleted.toString());


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








/////                   BuildRedirectString
/////
/////
function BuildRedirectString(urlEnd){
    var path = window.location.toString();
    var pathSplit = path.split("/");
    var pathRebuilt = "";

    for(var i = 0; i < pathSplit.length - 1; i++){
        pathRebuilt += pathSplit[i] + "/";
    }

    pathRebuilt += urlEnd;

    return pathRebuilt;
}








/////                   Redirect
/////                           : Redirects by changing the last part of the current url
/////
function Redirect(urlEnd){
    window.location.href = BuildRedirectString(urlEnd);
}








/////                   CheckPage
/////                           : gets the last part of the current url, and checks the passed in string to see if they are the same.
/////
function CheckUrlEnd(checkUrl){
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








/////                   ShowMessageModal
/////
/////
function ShowMessageModal(modalTitle, modalMessage){
    $("#message-modal .modal-title").text(modalTitle); 
    $("#message-modal .modal-body").text(modalMessage); 
    $("#message-modal").modal("show");
}








/////                   HideMessageModal
/////
/////
function HideMessageModal(){
    $("#message-modal").modal("hide");
}








/////                   loadPageVar
/////
///// https://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript#answer-14810325
function loadPageVar (sVar) {
    return unescape(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + escape(sVar).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));
}