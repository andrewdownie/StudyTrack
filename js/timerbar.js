var tickSound30;
var alarmSound;

var timePassedMS;


$(document).ready(function(){

    if(getCookie("OAUTH_TOKEN") != "" && getCookie("EFFECTIVE_DURATION") != ""){
        alert("Adding time from previous session...");
        AddFocusTime();
    }

    $.get("timerbar.html", function(navbarHtml){
        $("body").append(navbarHtml);


        if(tickSound30 == null){
            tickSound30 = document.getElementById("audio-tickSound30");
            tickSound30.addEventListener('ended', function() {
                this.currentTime = 0;
                this.play();
            }, false);
        }

        // Set timer volume to whats saved in the cookie
        var vol = getCookie("TIMER_VOLUME");
        if(vol == ""){
            vol = 0.5;
            setCookie("TIMER_VOLUME", vol);
        }
        $("#timer-volume-slider").val(vol);
        tickSound30.volume = vol;

        if(alarmSound == null){
            alarmSound = document.getElementById("audio-alarmSound");
            alarmSound.addEventListener('ended', function() {
                this.currentTime = 0;
                this.play();
            }, false);
        }


        ///
        ///
        ///
        $("#timer-volume-slider").on("change", function(){
            setCookie("TIMER_VOLUME", $(this).val());
            tickSound30.volume = $(this).val();
        });

        $("#end-timer").click(function(){
            var timePassed = TimePassed();

            if(timePassed > 600000){
                $("#end-timer-modal").modal("show");
                return;
            }
            else{
                StoreFocusTime(1);
            }
        });


        ///
        /// Start the timer right away, in case it should already be running
        ///
        if(getCookie("TIMER_STATUS") == "running"){
            StartProjectTimer();
        }


        $("#confirm-end-timer").click(function(){
            EndTimer();
        });

    });

});


/////                   StoreFocusTime
/////
/////
function StoreFocusTime(focusFactor){
    var timePassed = TimePassed();

    var effectiveDuration = Math.ceil(timePassed * focusFactor);
    setCookie("EFFECTIVE_DURATION", effectiveDuration);

    EndTimer();

    var oauth_token = getCookie("OAUTH_TOKEN");

    if(oauth_token == ""){
        alert("You have been signed out :(\n\nYou must sign back in to save your progress.");
        location.reload();
    }
    else{
        AddFocusTime();
        LoadProjectTable();
    }

}
function AddFocusTime(){
    //NOTE: this is from loadnav.js
    alert('meow meow')
    InsertStudyTime(getCookie("TIMER_PROJECT_ID"), getCookie("EFFECTIVE_DURATION"), DayOfYear());

    $("#timer-finished-modal").modal("hide");
    setCookie("TIMER_STATUS", "IDLE");
    setCookie("EFFECTIVE_DURATION", "");
    setCookie("TIMER_PROJECT_ID", "");
    setCookie("TIMER_PROJECT_NAME", "");
    DisplayTimerStatus();
}


/////                   DisplayTimerStatus 
/////
/////
function DisplayTimerStatus(){
    $("#timer-time").text(FormatTimerTime(TimePassed()));
    var timerStatus = getCookie("TIMER_STATUS");

    if(timerStatus == "running"){
        $("#timer-project-name").text(getCookie("TIMER_PROJECT_NAME"));

        $("#timer-project-name").show();
        $("#timer-time").show();
        if(tickSound30 != null){
            tickSound30.play();
        }

    }
    else{
        $("#timer-project-name").text("");

        $("#timer-project-name").hide();
        $("#timer-time").hide();
        if(tickSound30 != null){
            tickSound30.pause();
        }
    }
}


/////                   TimePassed
/////
/////
function TimePassed(){
    return moment.duration(new Date() - getCookie("TIMER_START_TIME"));
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


/////                   StartProjectTimer
/////
/////
function InitProjectTimer(project_id, project_name){
    if(getCookie("TIMER_STATUS") != "running"){
        //var win = window.open('https://www.brain.fm/app#!/player/35', '_blank');
        timePassedMS = 0;

        setCookie("TIMER_STATUS", "running");
        setCookie("TIMER_PROJECT_ID", project_id);
        setCookie("TIMER_PROJECT_NAME", project_name);
        setCookie("TIMER_START_TIME", moment(new Date()));

        StartProjectTimer();
    }
    else{
        console.log("E> Timer is already running.");
    }
}


function StartProjectTimer(){
    $(".fa-play-circle-o").hide();
    $(".timer-bar-container").show();
    $("#favicon").attr("href","clock.png");
    $("#timer-project-name").text(getCookie("TIMER_PROJECT_NAME"));
    RunProjectTimer();
    DisplayTimerStatus();
    $(".project-name").addClass("project-in-progress");
}


/////                   RunProjectTimer
/////
/////
function RunProjectTimer(){
    setTimeout(function(){
        if(getCookie("TIMER_STATUS") == "running"){

            $("#timer-time").text(FormatTimerTime(TimePassed()));

            RunProjectTimer();
        }
        else{
            $("#favicon").attr("href","favicon.png");
        }
    }, 1000);
}

function EndTimer(){
    setCookie("TIMER_STATUS", "IDLE");
    $(".fa-play-circle-o").show();
    $(".timer-bar-container").hide();
    $("#favicon").attr("href","favicon.png");
    $(".project-name").removeClass("project-in-progress");
    if(tickSound30 != null){
        tickSound30.pause();
    }
}
