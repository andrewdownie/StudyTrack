$(document).ready(function(){
    ///
    /// Start Study Timer
    ///
    $("#start-timer").click(function(){
        console.log(gapi.client.getToken().access_token);

        var raw_duration = $("#hours").val() + ":" + $("#minutes").val() + ":" + $("#seconds").val();
        var project = $("#selected-project").val();

        if(project != "Select a project..."){
            InsertStudyTime(project, raw_duration);
        }
        else{
            alert("You must select a project");
        }
    });



    ///
    /// Project Choice
    ///
    $(".project-choice").click(function(){
        $("#selected-project").val($(this).text());
    });
});