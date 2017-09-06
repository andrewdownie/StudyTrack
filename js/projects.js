var rows; //A json array of rows holding project goals
var editProjectID; //The ID of the project currently being edited

/////                   Document Ready
/////
/////
$(document).ready(function(){
    ReadProjectGoals(ReadProjectGoalsCallback);

    $("#add-project").click(function(){
        SetupNewProject();
    });



    $("#projects-table").on("click", ".edit-project", function(){
        editProjectID = this.id.split("-")[1];

        var curName = $("#" + editProjectID + " .project-name").text();
        var curMinTime = parseInt($("#" + editProjectID + " .min-time").text());
        var curIdealTime = parseInt($("#" + editProjectID + " .ideal-time").text());

        $("#edit-project-name").val(curName);
        $("#edit-minimum-time").val(curMinTime);
        $("#edit-ideal-time").val(curIdealTime);

        $("#edit-project-modal").modal('show');


    });



    $("#delete-project").click(function(){
        var curName = $("#" + editProjectID + " .project-name").text();
        var curMinTime = parseInt($("#" + editProjectID + " .min-time").text());
        var curIdealTime = parseInt($("#" + editProjectID + " .ideal-time").text());


        if(curName.includes("(deleted)")){
            alert("This project has already been marked for deletion, it will be removed at the start of next week. To unmark it, removed (deleted) from its name");
            return;
        }

        var projectRow = FindProjectRowNum(editProjectID);
        UpdateProjectGoal(editProjectID, curName + " (deleted)", curMinTime, curIdealTime, projectRow, function(){
            $("#" + editProjectID + " .project-name").text(curName + " (deleted)");
        });
        $("#edit-project-modal").modal('hide');
    });




    $("#update-project").click(function(){
        var newName = $("#edit-project-name").val();
        var newMinTime = $("#edit-minimum-time").val();
        var newIdealTime = $("#edit-ideal-time").val();

        if(ValidProjectName(newName) == false){
            alert("Project names can only contain letters, numbers, underscores and dashes.");
            return;
        }

        var projectRow = FindProjectRowNum(editProjectID);
        UpdateProjectGoal(editProjectID, newName, newMinTime, newIdealTime, projectRow, function(){
            $("#" + editProjectID + " .project-name").text(newName);
            $("#" + editProjectID + " .min-time").text(newMinTime);
            $("#" + editProjectID + " .ideal-time").text(newIdealTime);
        });
        $("#edit-project-modal").modal('hide');
    });

});








/////                   FindProjectRowNum 
/////
/////
function FindProjectRowNum(projectID){
    for(var i in rows){
        if(rows[i][0] == projectID){
            return parseInt(i) + 2;
        }
    }
    return false;
}








/////                   ReadProjectGoalsCallback
/////                           Takes the data from the read project goals call, parses said data, and adds it to the page
/////
function ReadProjectGoalsCallback(data){
    rows = data.values;

    for(var i in rows){
        AddProjectRow(data, rows[i][0], rows[i][1], rows[i][2], rows[i][3]);
    }

}








/////                   SetupNewProject
/////
/////
function SetupNewProject(){
        var projectName = $("#project-name").val();
        var minimumTime = parseInt($("#minimum-time").val());
        var idealTime = parseInt($("#ideal-time").val());

        if(projectName == ""){
            alert("Project name cannot be blank");
            return;
        }


        if(minimumTime > idealTime){
            alert("Ideal time cannot be less than minimum time.");
            return;
        }


        var projectAlreadyExists = false;
        $(".project-name").each(function(){
            if(projectName == $(this).text()){
                projectAlreadyExists = true;
            }
        });

        if(projectAlreadyExists == true){
            alert("Project with this name already exists.");
            return;
        }



        if(ValidProjectName(projectName) == false){
            alert("Project names can only contain letters, numbers, spaces, underscores and dashes.");
            return;
        }


        console.log("adding project");
        InsertProjectGoals(projectName, minimumTime, idealTime, AddProjectRow);
        $("#add-project-modal").modal("hide");
}








/////                   ValidProjectName
/////
/////
function ValidProjectName(projectName){
        var alphaNumeric = new RegExp("^[A-Za-z0-9 _-]+$");
        return alphaNumeric.test(projectName);
}








/////                   AddProjectRow
/////
/////
function AddProjectRow(ajaxData, projectID, projectName, weeklyMin, weeklyGoal){
    var rowTemplate =    
    `<tr id="{projectID}">
        <td class="project-name">{projectName}</td>
        <td class="min-time">{weeklyMin}</td>
        <td class="ideal-time">{weeklyGoal}</td>
        <td><button class="btn btn-info btn-sm edit-project" id="{buttonID}">Edit</button></td>
    </tr>`;

    row = rowTemplate;
    row = row.replace("{projectID}", projectID);
    row = row.replace("{projectName}", projectName);
    row = row.replace("{weeklyMin}", weeklyMin);
    row = row.replace("{weeklyGoal}", weeklyGoal);
    row = row.replace("{buttonID}", "delete-" + projectID);

    $("#projects-table").append(row);
}

