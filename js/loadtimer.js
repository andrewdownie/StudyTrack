$(document).ready(function(){
    $.get("timerbar.html", function(navbarHtml){
        $("body").append(navbarHtml);
        TimerStatusChanged();

        RunTimer();

    ///
    /// Project Choice
    ///
    $("#dropdown-insertion").on('click', '.project-choice', function(){
        var timerStatus = getCookie("TIMER_STATUS");

        if(timerStatus == "idle"){
            $("#selected-project").val($(this).text());
        
            setCookie("TIMER_PROJECT_NAME", $(this).text());
            setCookie("TIMER_PROJECT_ID", this.id);
        }

    });


    ///
    /// Set Timer
    ///
    $("#set-stop-timer").click(function(){
        var timerStatus = getCookie("TIMER_STATUS");

        if(timerStatus != "running"){
            $("#set-timer-modal").modal('show');
        }
        else{
            setCookie("TIMER_STATUS", "idle");
            TimerStatusChanged();
        }
    });


    ///
    /// Start Timer
    ///
    $("#start-timer").click(function(){

        if(ValidTimerInputs() == true){
            //var time = $("#hours").val() + ":"  + $("#minutes").val().toString().padStart(2, "0") + ":00";
            var endTime = moment(new Date());
            endTime = moment(endTime).add($("#hours").val(), 'h');
            endTime = moment(endTime).add($("#minutes").val(), 'm');
            endTime = moment(endTime).add($("#seconds").val(), 's');
            
            console.log("End time: " + endTime);


            $("#set-timer-modal").modal('hide');
            setCookie("TIMER_STATUS", "running");
            setCookie("TIMER_START_TIME", moment(new Date()));
            setCookie("TIMER_END_TIME", endTime); //TODO: add selection duration here
            TimerStatusChanged();

            //$("#timer-time").text(time);
            $("#timer-project-name").text(getCookie("TIMER_PROJECT_NAME"));
        }

    });


    ///
    /// Time Input Changed
    ///
    $("#hours, #minutes").on('keydown mousedown keyup mouseup', function(){
        UpdateTimerInputs();
    });

    $("#hours, #minutes").focusout(function(){
        TrimTimerInputs();
    });


    });

});







/////                   SetStopButton
/////
/////
function TimerStatusChanged(){
    var timerStatus = getCookie("TIMER_STATUS");

    if(timerStatus == "running"){
        $("#set-stop-timer").text("Stop Timer");
        $("#set-stop-timer").removeClass("btn-primary");
        $("#set-stop-timer").addClass("btn-danger");
        $("#timer-project-name").show();
        $("#timer-project-name").text(getCookie("TIMER_PROJECT_NAME"));
        //$("#timer-time").text(getCookie("TIMER_END_TIME"));
        $("#timer-time").show();

    }
    else{
        $("#set-stop-timer").text("Set Timer");
        $("#set-stop-timer").removeClass("btn-danger");
        $("#set-stop-timer").addClass("btn-primary");
        $("#timer-project-name").hide();
        $("#timer-project-name").text("");
        $("#timer-time").hide();

    }
}








/////                   ValidTimerInputs
/////
/////
function ValidTimerInputs(){
    var hours = $("#hours").val();
    var minutes = $("#minutes").val();

    if(hours == 0 && minutes == 0){
        alert("Duration of timer cannot be zero.");
        return false;
    }

    if(hours < 10 && hours.length > 1){
        hours = hours.substr(hours.length - 1, 1);
    }

    var project = $("#selected-project").val();

    if(project == "Select a project..."){
        alert("You must select a project");
        return false;
    }

    return true;
}








/////                   TrimTimerInputs
/////
/////
function TrimTimerInputs(){
    var hours = $("#hours").val();
    var minutes = $("#minutes").val();

    if(hours.length == 0){
        $("#hours").val("0");
    }
    if($("#minutes").val().length == 0){
        $("#minutes").val("0");
    }

    if(hours < 10 && hours.length > 1){
        hours = hours.substr(hours.length - 1,1);
        $("#hours").val(hours);
    }
    if(hours <= 12 && hours.length > 2){
        hours = hours.substr(hours.length - 2, 2);
        $("#hours").val(hours);
    }

    if(minutes < 10 && minutes.length > 1){
        minutes = minutes.substr(minutes.length - 1,1);
        $("#minutes").val(minutes);
    }
    if(minutes <= 12 && minutes.length > 2){
        minutes = minutes.substr(minutes.length - 2, 2);
        $("#minutes").val(minutes);
    }
}








/////                   UpdateTimerInputs
/////
/////
function UpdateTimerInputs(){
    var hours = $("#hours").val();
    var minutes = $("#minutes").val();

    hours = hours.replace("-", "");
    hours = hours.replace(".", "");
    minutes = minutes.replace("-", "");
    minutes = minutes.replace(".", "");



    if(hours > 12){
        $("#hours").val("12");
        hours = 12;
    }

    if(minutes > 59){
        $("#minutes").val("59");
        minutes = 59;
    }
    


    if(hours < 10 && hours.length > 1){
        hours = hours.substr(hours.length - 1, 1);
    }

    if(hours <= 12 && hours.length > 2){
        hours = hours.substr(hours.length - 2, 2);
    }



    hours = hours.toString().padStart(1, "0");
    minutes = minutes.toString().padStart(2, "0");


    $("#time-remaining").text(hours + ":" + minutes + ":" + seconds);
}








/////                   CurrentTimerTime
/////
/////
function RemainingTimerTime(){
    var startTime = getCookie("TIMER_START_TIME");
    var endTime = getCookie("TIMER_END_TIME");
    var currentTime = new Date();

    var timePassed = currentTime - startTime;
    var duration = endTime - startTime

    var timeRemaining = moment.duration(duration - timePassed);

    return timeRemaining.hours() + ":" + timeRemaining.minutes() + ":" + timeRemaining.seconds();
} 








/////                   RunTimer
/////
/////
function RunTimer(){
    setTimeout(function(){
        if(getCookie("TIMER_STATUS") == "running"){
            $("#timer-time").text(RemainingTimerTime());
        }
        RunTimer();

    }, 1000);
}






