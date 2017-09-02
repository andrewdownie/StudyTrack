$(document).ready(function(){
    $("#login").click(function(){
        gapi.load('client:auth2', initClient);
    });
});