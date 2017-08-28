
var url_navlink_dict = {
    "": "index",
    "/index.html": "index",
    "/projects.html": "projects"
}



$(document).ready(function(){

    $.get("navbar.html", function(navbarHtml){
        $("body").prepend(navbarHtml);

        var urlpath = window.location.pathname;
        var activeLinkID = url_navlink_dict[urlpath];
        $("#" + activeLinkID).addClass("active");
    });

});