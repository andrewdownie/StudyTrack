$(document).ready(function(){
    if(getCookie("OAUTH_TOKEN") != ""){
        Redirect("index.html");
    }


    gapi.load('client:auth2', initClient);
    var project_name = getCookie("TIMER_PROJECT_NAME");
    var duration = getCookie("EFFECTIVE_DURATION");

    if(project_name != "" && duration != ""){
        $("#unsaved-progress").html("<br>Unsaved progress on project: " + project_name + ", of: " + (parseInt(duration) / 1000) + " seconds.");
    }

});

function LoginPopup(){
    SignInWrapper();
}