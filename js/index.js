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


    ///
    /// Time Input Changed
    ///
    $("#hours, #minutes, #seconds").on('keydown mousedown keyup mouseup', function(){
        UpdateTimerInputs();
    });

    $("#hours, #minutes, #seconds").focusout(function(){
        if($("#hours").val().length == 0){
            $("#hours").val("0");
        }
        if($("#minutes").val().length == 0){
            $("#minutes").val("0");
        }
        if($("#seconds").val().length == 0){
            $("#seconds").val("0");
        }
    });

});

function UpdateTimerInputs(){
    var hours = $("#hours").val();
    var minutes = $("#minutes").val();
    var seconds = $("#seconds").val();

    if(hours > 12){
        $("#hours").val("12");
        hours = 12;
    }

    if(minutes > 59){
        $("#minutes").val("59");
        minutes = 59;
    }

    if(seconds > 59){
        $("#seconds").val("59");
        seconds = 59;
    }



    hours = hours.toString().padStart(1, "0");
    minutes = minutes.toString().padStart(2, "0");
    seconds = seconds.toString().padStart(2, "0");


    $("#time-remaining").text(hours + ":" + minutes + ":" + seconds);
}