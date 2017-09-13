$(document).ready(function(){
    $("#login").click(function(){
        //somehow I need to call window.open here, and then pass the google popup into that?
        //window.open("", "");
        //window.setTimeout(gapi.auth.init,1); 
        //gapi.auth2.getAuthInstance().signIn();

        // v This is what I had before v
        gapi.load('client:auth2', initClient);

    });
});