var tickSound30;
var alarmSound;


var lastLoginRefreshMinutes;

$(document).ready(function(){
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


        ///
        /// Start the timer right away, in case it should already be running
        ///
        if(getCookie("TIMER_STATUS") == "running"){
            lastLoginRefreshMinutes = -5;
            RunProjectTimer();
            $("#favicon").attr("href","clock.png");
        }
        else{
            $("#favicon").attr("href","favicon.png");
        }
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
                if(tickSound30 != null){
                    tickSound30.pause();
                }
            }
            else{
                $("#stop-timer-modal").modal('show');
            }
        });



        ///
        /// Stop Timer
        ///
        $("#stop-timer").click(function(){
            setCookie("TIMER_STATUS", "idle");
            $("#favicon").attr("href","favicon.png");
            DisplayTimerStatus();

            if(tickSound30 != null){
                tickSound30.pause();
            }
        });



        ///
        /// Resume Timer
        ///
        $("#resume-timer").click(function(){
            if(tickSound30 != null){
                tickSound30.play();
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
                

                $("#set-timer-modal").modal('hide');
                setCookie("TIMER_STATUS", "running");
                setCookie("TIMER_START_TIME", moment(new Date()));
                setCookie("TIMER_END_TIME", endTime);
                lastLoginRefreshMinutes = -5;
                RunProjectTimer();
                DisplayTimerStatus();


                $("#timer-project-name").text(getCookie("TIMER_PROJECT_NAME"));
                $("#favicon").attr("href","clock.png");
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


    //NOTE: this is from index.js
    LoadIndexTable();

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
        if(tickSound30 != null){
            tickSound30.play();
        }

    }
    else{
        $("#set-stop-timer").removeClass("btn-danger");
        $("#set-stop-timer").addClass("btn-primary");

        $("#set-stop-timer").text("Set Timer");
        $("#timer-project-name").text("");

        $("#timer-project-name").hide();
        $("#timer-time").hide();
        if(tickSound30 != null){
            tickSound30.pause();
        }
    }
}








/////                   ValidTimerInputs
/////
/////
function ValidTimerInputs(){
    var hours = $("#hours").val();
    var minutes = $("#minutes").val();

    if(hours == 0 && minutes == 0){
        $("#set-timer-error-message").text("Duration of timer cannot be zero.");
        return false;
    }

    if(hours < 10 && hours.length > 1){
        hours = hours.substr(hours.length - 1, 1);
    }

    var project = $("#selected-project").val();

    if(project == "Select a project..."){
        $("#set-timer-error-message").text("You must select a project.");
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
                $("#favicon").attr("href","favicon.png");
                console.log("RunProjectTimer ended");
                remainingTime = moment.duration(0);
                $("#timer-finished-modal").modal('show');
                RunEndTimer();
                if(tickSound30 != null){
                    tickSound30.pause();
                }
                if(alarmSound != null){
                    alarmSound.play();
                }
            }

            //
            // Expensive way to keep user logged in during a timer
            //
            var curMinutes = new Date().getMinutes();//TODO: lastLoginRefreshMinutes is always negative 5?
            if(lastLoginRefreshMinutes != curMinutes && Math.abs(lastLoginRefreshMinutes - curMinutes) >= 30){
                lastLoginRefreshMinutes = curMinutes;
                gapi.load('client:auth2', initClient);
                console.log("Refreshing google login now"); 
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

    var duration = endTime - startTime + 5;
    console.log("TimerDuration() returned: " + duration);
    return duration;
}
