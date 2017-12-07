/////                   Document Ready
/////
/////
$(document).ready(function(){
    CheckCookieStatus();
    $('[data-toggle="popover"]').popover();


    /*$('#weekly-daily').change(function() {
        var study_data = JSON.parse(getCookie("STUDY_DATA"));
        //console.log("STUDY DATA IS");
        //console.log(study_data);
        CalculateProjectTotals(study_data);
    });*/


    $("#weekly").click(function(){
        var study_data = JSON.parse(getCookie("STUDY_DATA"));
        CalculateProjectTotals(study_data, "weekly");
    });
    $("#daily").click(function(){
        var study_data = JSON.parse(getCookie("STUDY_DATA"));
        CalculateProjectTotals(study_data, "daily");
    });
    $("#catchup").click(function(){
        var study_data = JSON.parse(getCookie("STUDY_DATA"));
        CalculateProjectTotals(study_data, "catchup");
    });


});


/////                   CheckCookieStatus
/////
/////
function CheckCookieStatus(){

    //Simple way of making sure the cookie for current USERDATA_SHEET_ID is set before we try to use it.
    //... it's an active loop instead of an event call
    var sheet_id = getCookie("USERDATA_SHEET_ID");
    if(sheet_id == ""){
        setTimeout(CheckCookieStatus, 100);
    }
    else{
        LoadProjectTable();
    }

    $("#projects-table").on("click", ".project-name", function(){
        project_id = $(this).parent().parent().attr('id');
        project_name = $(this).text();
        InitProjectTimer(project_id, project_name);
    });

}


/////                   LoadIndexTable
/////
/////
function LoadProjectTable(){
    $(".project-choice").remove();

    ReadProjectGoals(function(data){

        console.log(data);

        for(var i in data.values){
            var id = data.values[i][0];
            var name = data.values[i][1];
            var minimumGoal = data.values[i][2];
            var idealGoal = data.values[i][3];
            $("#dropdown-insertion").append(BuildDropItem(id, name, minimumGoal, idealGoal));

        }

        ReadStudyTime(CalculateProjectTotals);

    });
}


/////                   BuildDropItem
/////
/////
function BuildDropItem(projectID, projectName, minimumGoal, idealGoal){
    var item = '<li><a class="dropdown-item project-choice" href="#" id="{id}" minimumGoal="{minimumGoal}" idealGoal="{idealGoal}">{projectName}</a></li>';
    item = item.replace("{id}", projectID);
    item = item.replace("{projectName}", projectName);
    item = item.replace("{minimumGoal}", minimumGoal);
    item = item.replace("{idealGoal}", idealGoal);

    return item;
}


/////                   AddProjectRows
/////
/////
function CalculateProjectTotals(projectData, dataDisplayOption){

    console.log("CalculateProjectTotals--------------");
    $(".project-row").remove();


    var projectArray = [];
    var currentProjectNum = 0;

    var msTodaysTotalStudyTime = 0;

    ///
    /// Total Study Time spent on each project
    ///
    $('#dropdown-insertion .project-choice').each(function () { 

        projectArray[currentProjectNum] = new Object();
        projectArray[currentProjectNum].name = $(this).text();
        projectArray[currentProjectNum].id = this.id;



        projectArray[currentProjectNum].totalTimeStudied = 0;
        projectArray[currentProjectNum].dailyTimeStudied = 0;

        if(dataDisplayOption == "weekly"){
            $("#displayOptionName").text("Weekly");
            $("#displayOptionDescription").attr("data-content", "Shows total amount of study time put in this week. Also shows how much study time is remaining.");

            projectArray[currentProjectNum].minimumGoal = $(this).attr("minimumGoal"); 
            projectArray[currentProjectNum].idealGoal = $(this).attr("idealGoal"); 

            for(var i in projectData.values){
                if(projectData.values[i][0] == this.id){
                    projectArray[currentProjectNum].totalTimeStudied += parseInt(projectData.values[i][1]);
                }
            }

        }
        else if(dataDisplayOption == "catchup"){
            $("#displayOptionName").text("Catch up");
            $("#displayOptionDescription").attr("data-content", "Shows amount of study time put in today. The daily amount of time needed to reach goals by  the end of the week.");


            projectArray[currentProjectNum].minimumGoal = $(this).attr("minimumGoal");
            projectArray[currentProjectNum].idealGoal = $(this).attr("idealGoal"); 

            for(var i in projectData.values){
                if(projectData.values[i][0] == this.id){
                    projectArray[currentProjectNum].totalTimeStudied += parseInt(projectData.values[i][1]);
                    var dayOfYear = DayOfYear();

                    if(projectData.values[i][2] == dayOfYear){
                        projectArray[currentProjectNum].dailyTimeStudied += parseInt(projectData.values[i][1]);
                    }
                }
            }
        }
        else if(dataDisplayOption == "daily"){
            $("#displayOptionName").text("Daily");
            $("#displayOptionDescription").attr("data-content", "Shows amount of study time put in today. Goal time divided by 7.");

            projectArray[currentProjectNum].minimumGoal = $(this).attr("minimumGoal") / 7;
            projectArray[currentProjectNum].idealGoal = $(this).attr("idealGoal") / 7; 

            var dayOfYear = DayOfYear();
            for(var i in projectData.values){
                if(projectData.values[i][0] == this.id && projectData.values[i][2] == dayOfYear){
                    projectArray[currentProjectNum].dailyTimeStudied += parseInt(projectData.values[i][1]);
                }
            }
        }

        var dayOfYear = DayOfYear();
        for(var i in projectData.values){
            if(projectData.values[i][0] == this.id && projectData.values[i][2] == dayOfYear){
                msTodaysTotalStudyTime += parseInt(projectData.values[i][1]);
            }
        }

        currentProjectNum += 1;
    });

    //console.log("Time spent on each project is:");
    //console.log(projectArray);

    if(projectArray.length == 0){
        $("#projects-table").after("No projects found...");
    }

    var todaysTotalStudyTime = moment.duration(msTodaysTotalStudyTime);
    var timeStudiedTodayStr = todaysTotalStudyTime.hours().toString().padStart(2, " ") + ":" + todaysTotalStudyTime.minutes().toString().padStart(2, "0"); 
    $("#time-studied-today").text(timeStudiedTodayStr);


    for(var i in projectArray){
        var projectID = projectArray[i].id;
        var projectName = projectArray[i].name;
        var msTotalStudied = projectArray[i].totalTimeStudied;
        var msDailyStudied = projectArray[i].dailyTimeStudied;


        var minimumGoal = projectArray[i].minimumGoal;
        var idealGoal = projectArray[i].idealGoal;
        






        var timeStudied; 
        if(dataDisplayOption == "daily"){
            timeStudied = moment.duration(msDailyStudied);
            minRemaining = (minimumGoal * 3600000) - msDailyStudied;
            idealRemaining = (idealGoal * 3600000) - msDailyStudied;
        }
        else if(dataDisplayOption == "weekly"){
            timeStudied = moment.duration(msTotalStudied);
            minRemaining = (minimumGoal * 3600000) - msTotalStudied;
            idealRemaining = (idealGoal * 3600000) - msTotalStudied;
        }
        else if(dataDisplayOption == "catchup"){
            timeStudied = moment.duration(msDailyStudied);

            var days_remaining = 7 - new Date().getDay() + 1;

            //First we calculate the amount of time that has been studied this week (not including today)
            //  and subtract it from this weeks goals
            minRemaining = (minimumGoal * 3600000) - msTotalStudied + msDailyStudied;
            idealRemaining = (idealGoal * 3600000) - msTotalStudied + msDailyStudied;

            //Then we divide the remaining goal time to study, by the number of days remaining in the week
            //  To get the amount of time needed to be spent to reach goals by the end of the week
            minRemaining = minRemaining / days_remaining;
            idealRemaining = idealRemaining / days_remaining;

            //Then we subtract the amount of time we have spent studying today
            minRemaining = minRemaining - msDailyStudied;
            idealRemaining = idealRemaining - msDailyStudied;
        }

        if(minRemaining < 0){
            minRemaining = 0;
        }

        if(idealRemaining < 0){
            idealRemaining = 0;
        }

        var minMoment = moment.duration(minRemaining);  
        var idealMoment = moment.duration(idealRemaining); 

        timeStudiedStr = timeStudied.hours().toString().padStart(2, " ") + ":" + timeStudied.minutes().toString().padStart(2, "0"); 
        minStr = minMoment.hours().toString().padStart(2, " ") + ":" + minMoment.minutes().toString().padStart(2, "0");
        idealStr = idealMoment.hours().toString().padStart(2, " ") + ":" + idealMoment.minutes().toString().padStart(2, "0");



        AddProjectRow(projectName, projectID, timeStudiedStr, minStr, idealStr);
    }
}


/////                   AddProjectRow
/////
/////
function AddProjectRow(projectName, projectID, timeStudied, minRemaining, idealRemaining){
    var rowTemplate =    
    `<tr class="project-row" id="{projectID}">
        <td><a class="project-name"><i class="fa fa-play-circle-o" aria-hidden="true">&nbsp;</i>{projectName}</a></td>
        <td><p class="time-studied">{timeStudied}</p></td>
        <td><p class="min-time">{minRemaining}</p></td>
        <td><p class="ideal-time">{idealRemaining}</p></td>
    </tr>`;

    row = rowTemplate;
    row = row.replace("{projectID}", projectID);
    row = row.replace("{timeStudied}", timeStudied);
    row = row.replace("{projectName}", projectName);
    row = row.replace("{minRemaining}", minRemaining);
    row = row.replace("{idealRemaining}", idealRemaining);

    $("#projects-table").append(row);
}