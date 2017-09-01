$(document).ready(function(){
    $("#login").click(function(){
        gapi.load('client:auth2', initClient);

        //TODO: redirect in the gapi init method if the user logs in, to the track (currently index.html)
        //TODO: redirect the user to login screen when they log out
    });
});