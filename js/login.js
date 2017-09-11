$(document).ready(function(){
    $("#login").click(function(){
        alert(window.location);
        gapi.load('client:auth2', initClient);
    });
});