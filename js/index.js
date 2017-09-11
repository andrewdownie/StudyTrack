/////                   Document Ready
/////
/////
$(document).ready(function(){
    LoadIndexTable();

});








/////                   LoadIndexTable
/////
/////
function LoadIndexTable(){
    $(".project-row").remove();
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


    var projectArray = [];
    var currentProjectNum = 0;

    ///
    /// Total Study Time spent on each project
    ///
    $('#dropdown-insertion .project-choice').each(function () { 
        //console.log($(this).text() + " : " + this.id);

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
        <td class="project-name">{projectName}</td>
        <td class="time-studied">{timeStudied}</td>
        <td class="min-time">{minRemaining}</td>
        <td class="ideal-time">{idealRemaining}</td>
    </tr>`;

    row = rowTemplate;
    row = row.replace("{projectID}", projectID);
    row = row.replace("{timeStudied}", timeStudied);
    row = row.replace("{projectName}", projectName);
    row = row.replace("{minRemaining}", minRemaining);
    row = row.replace("{idealRemaining}", idealRemaining);

    $("#projects-table").append(row);
}









