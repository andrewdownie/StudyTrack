/////                   Document Ready
/////
/////
$(document).ready(function(){
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






});








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
    //TODO: i need to save min and ideal goals to the drop down during the get project info request


    var projectArray = [];
    var currentProjectNum = 0;

    $('#dropdown-insertion .project-choice').each(function () { 
        //console.log($(this).text() + " : " + this.id);

        //TODO: save the min and ideal times
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
    // create dictionary 
    //
    // foreach projectID, 
    //      create dictionary entry for each projectID
    //      save the min and ideal times to this entry
    //
    //      foreach project row, 
    //          add to the project time, that have matching projectID
    //
    //  once all the projects / rows have been exhausted:
    //      call the addproject row function for each dictionary entry



    for(var i in projectArray){
        var projectID = projectArray[i].id;
        var projectName = projectArray[i].name;
        var msStudied = projectArray[i].timeStudied;//TODO: this hides really small fractions, such as 1/60th
        //alert(msStudied)

        var secStudied = msStudied / 1000;
        var minutesStudied = secStudied / 60;
        var hoursStudied = (minutesStudied / 60).toFixed(3);
        

        var minimumGoal = projectArray[i].minimumGoal;
        var idealGoal = projectArray[i].idealGoal;


        var minRemaining = minimumGoal; 
        var idealRemaining = idealGoal;


        minRemaining = minimumGoal - hoursStudied;
        idealRemaining = idealGoal - hoursStudied;

        if(minRemaining < 0){
            minRemaining = 0;
        }

        if(idealRemaining < 0){
            idealRemaining = 0;
        }

        AddProjectRow(projectName, projectID, hoursStudied, minRemaining, idealRemaining);
    }
}








/////                   AddProjectRow
/////
/////
function AddProjectRow(projectName, projectID, timeStudied, minRemaining, idealRemaining){
    var rowTemplate =    
    `<tr id="{projectID}">
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









