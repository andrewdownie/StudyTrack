$(document).ready(function(){
    $.get("timerbar.html", function(navbarHtml){
        $("body").append(navbarHtml);
        //$(".temp-navbar").remove();


        //TODO: get cookies related to the timer

    });

});