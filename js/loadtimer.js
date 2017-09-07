var tickSound30;
var alarmSound;

$(document).ready(function(){
    $.get("timerbar.html", function(navbarHtml){
        $("body").append(navbarHtml);

        tickSound30 = new Audio("tickSound30.mp3");
        alarmSound = new Audio("alarmSound.mp3");


        ///
        /// Start the timer right away, in case it should already be running
        ///
        //$("#timer-time").text(FormatTimerTime(RemainingTimeMS()));
        RunProjectTimer();
        DisplayTimerStatus();

        ///
        /// Project Choice
        ///
        $("#dropdown-insertion").on('click', '.project-choice', function(){
            var timerStatus = getCookie("TIMER_STATUS");

            if(timerStatus != "running"){
                $("#selected-project").val($(this).text());
            
                setCookie("TIMER_PROJECT_NAME", $(this).text());
                setCookie("TIMER_PROJECT_ID", this.id);
            }

        });

        ///
        /// Timer end: Not Focused
        $("#not-focused").click(function(){
            $("#timer-finished-modal").modal("hide");
            setCookie("TIMER_STATUS", "IDLE");
            DisplayTimerStatus();
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
                DisplayTimerStatus();
            }
             tickSound30.pause();
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
                

                $("#set-timer-modal").modal('hide');
                setCookie("TIMER_STATUS", "running");
                setCookie("TIMER_START_TIME", moment(new Date()));
                setCookie("TIMER_END_TIME", endTime);
                RunProjectTimer();
                DisplayTimerStatus();


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


        /// 
        /// Timer End: Rate Your Focus
        ///
        $("#fully-focused").click(function(){
            AddFocusTime(1); 
        });
        $("#less-than-fully-focused").click(function(){
            AddFocusTime(0.25);
        });



    });

});








/////                   AddFocusTime
/////
/////
function AddFocusTime(focusFactor){
    var effectiveDuration = Math.ceil(TimerDuration() * focusFactor);
    //console.log("Effective duration is: " + effectiveDuration);

    InsertStudyTime(getCookie("TIMER_PROJECT_ID"), effectiveDuration);

    $("#timer-finished-modal").modal("hide");
    setCookie("TIMER_STATUS", "IDLE");
    DisplayTimerStatus();
}








/////                   DisplayTimerStatus 
/////
/////
function DisplayTimerStatus(){
    $("#timer-time").text(FormatTimerTime(RemainingTimeMS()));
    var timerStatus = getCookie("TIMER_STATUS");

    if(timerStatus == "running"){
        $("#set-stop-timer").removeClass("btn-primary");
        $("#set-stop-timer").addClass("btn-danger");

        $("#timer-project-name").text(getCookie("TIMER_PROJECT_NAME"));
        $("#set-stop-timer").text("Stop Timer");
        //$("#timer-time").text(getCookie("TIMER_END_TIME"));

        $("#timer-project-name").show();
        $("#timer-time").show();
        tickSound30.play();

    }
    else{
        $("#set-stop-timer").removeClass("btn-danger");
        $("#set-stop-timer").addClass("btn-primary");

        $("#set-stop-timer").text("Set Timer");
        $("#timer-project-name").text("");

        $("#timer-project-name").hide();
        $("#timer-time").hide();
        tickSound30.pause();
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


    $("#time-remaining").text(hours + ":" + minutes + ":00");
}








/////                   RemainingTimerTime
/////
/////
function RemainingTimeMS(){
    var startTime = getCookie("TIMER_START_TIME");
    var endTime = getCookie("TIMER_END_TIME");
    var currentTime = new Date();

    var timePassed = currentTime - startTime;
    var duration = endTime - startTime

    var diff = duration - timePassed;
    if(diff < 0){
        diff = 0;
    }
    var timeRemaining = moment.duration(diff);

    return timeRemaining;
} 








/////                   FormatTimerTime
/////
/////
function FormatTimerTime(remainingTime){
    var hours = remainingTime.hours();
    var minutes = remainingTime.minutes();
    var seconds = remainingTime.seconds();

    if(hours == 0){
        minutes = minutes.toString().padStart(1, "0") + ":";
        hours = "   ";
    }
    else{
        minutes = minutes.toString().padStart(2, "0") + ":";
        hours = hours + ":";
    }

    seconds = seconds.toString().padStart(2, "0");

    var timerForattedTime = hours + minutes + seconds;
    return timerForattedTime;
}








/////                   RunProjectTimer
/////
/////
function RunProjectTimer(){
    setTimeout(function(){
        if(getCookie("TIMER_STATUS") == "running"){

            var remainingTime = RemainingTimeMS();

            if(remainingTime.as('milliseconds') <= 0){
                console.log("RunProjectTimer ended");
                remainingTime = moment.duration(0);
                $("#timer-finished-modal").modal('show');
                RunEndTimer();
                tickSound30.pause();
            }


            $("#timer-time").text(FormatTimerTime(remainingTime));

            if(remainingTime.as('milliseconds') > 0){
                RunProjectTimer();
            }
        }

    }, 1000);
}








/////                   RunEndTimer
/////
/////
function RunEndTimer(){
    setTimeout(function(){
        if(getCookie("TIMER_STATUS") == "running"){

            var endTime = getCookie("TIMER_END_TIME");
            var curTime = moment(new Date);

            var timePassed = moment.duration(curTime - endTime);
            var duration = moment.duration(120 * 1000);//TODO: get this from a cookie that gets set in the settings part of the site
            var remaining = moment.duration(duration - timePassed);


            if(remaining.as('milliseconds') <= 0){
                $("#timer-finished-modal").modal("hide");
                setCookie("TIMER_STATUS", "IDLE");
                DisplayTimerStatus();
            }


            $("#end-timer-time").text(FormatTimerTime(remaining));


            if(remaining.as('milliseconds') > 0){
                RunEndTimer();
            }
        }

    }, 1000);
}








/////                   TimerDuration
/////
/////
function TimerDuration(){
    var startTime = getCookie("TIMER_START_TIME");
    var endTime = getCookie("TIMER_END_TIME");

    var duration = endTime - startTime;
    console.log("TimerDuration() returned: " + duration);
    return duration;
}