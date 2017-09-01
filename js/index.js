$(document).ready(function(){
    ///
    /// Start Study Timer
    ///
    $("#start-timer").click(function(){
        console.log(gapi.client.getToken().access_token);

        var hours = $("#hours").val();
        var minutes = $("#minutes").val();
        var seconds = $("#seconds").val();

        minutes = minutes.toString().padStart(2, "0");
        seconds = seconds.toString().padStart(2, "0");

        if(hours < 10 && hours.length > 1){
            hours = hours.substr(hours.length - 1, 1);
        }

        var raw_duration = hours + ":" + minutes + ":" + seconds;
        var project = $("#selected-project").val();

        if(project == "Select a project..."){
            alert("You must select a project");
            return;
        }

        if($("#time-remaining").text() == "0:00:00"){
            alert("Timer must be set to more than zero");
            return;
        }

        InsertStudyTime(project, raw_duration);
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
        var hours = $("#hours").val();
        if(hours.length == 0){
            $("#hours").val("0");
        }
        if(hours < 10 && hours.length > 1){
            $("#hours").val(hours.substr(hours.length - 1,1));
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

    if(hours < 10 && hours.length > 1){
        hours = hours.substr(hours.length - 1, 1);
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