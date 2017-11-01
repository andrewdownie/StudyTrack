/////                   Document Ready
/////
/////
$(document).ready(function(){
    CheckCookieStatus();
});


/////                   CheckCookieStatus
/////
/////
function CheckCookieStatus(){

    //Janky way of making sure the cookie for current USERDATA_SHEET_ID is set before we try to use it.
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
function CalculateProjectTotals(data){
    console.log("CalculateProjectTotals--------------");
    $(".project-row").remove();


    var projectArray = [];
    var currentProjectNum = 0;

    ///
    /// Total Study Time spent on each project
    ///
    $('#dropdown-insertion .project-choice').each(function () { 

        projectArray[currentProjectNum] = new Object();
        projectArray[currentProjectNum].name = $(this).text();
        projectArray[currentProjectNum].id = this.id;
        projectArray[currentProjectNum].minimumGoal = $(this).attr("minimumGoal"); 
        projectArray[currentProjectNum].idealGoal = $(this).attr("idealGoal"); 



        projectArray[currentProjectNum].timeStudied = 0;

        for(var i in data.values){
            if(data.values[i][0] == this.id){
                projectArray[currentProjectNum].timeStudied += parseInt(data.values[i][1]);
            }
        }

        
        currentProjectNum += 1;
    });
    console.log("Time spent on each project is:");
    console.log(projectArray);


    for(var i in projectArray){
        var projectID = projectArray[i].id;
        var projectName = projectArray[i].name;
        var msStudied = projectArray[i].timeStudied;


        var minimumGoal = projectArray[i].minimumGoal;
        var idealGoal = projectArray[i].idealGoal;
        

        minRemaining = (minimumGoal * 3600000) - msStudied;
        idealRemaining = (idealGoal * 3600000) - msStudied;


        if(minRemaining < 0){
            minRemaining = 0;
        }

        if(idealRemaining < 0){
            idealRemaining = 0;
        }


        var minMoment = moment.duration(minRemaining);  
        var idealMoment = moment.duration(idealRemaining); 
        var timeStudied = moment.duration(msStudied);

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