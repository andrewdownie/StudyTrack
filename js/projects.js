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
        var curDeleted = $("#" + editProjectID).hasClass("text-red");

        $("#edit-project-name").val(curName);
        $("#edit-minimum-time").val(curMinTime);
        $("#edit-ideal-time").val(curIdealTime);
        $("#delete-project").prop('checked', curDeleted).change();

        $("#edit-project-modal").modal('show');


    });


    //TODO: moving this to #update-project
    /*$("#delete-project").change(function(){
        var curName = $("#" + editProjectID + " .project-name").text();
        var curMinTime = parseInt($("#" + editProjectID + " .min-time").text());
        var curIdealTime = parseInt($("#" + editProjectID + " .ideal-time").text());
        var deleted = $("#delete-project").is(":checked");



        var projectRow = FindProjectRowNum(editProjectID);
        UpdateProjectGoal(editProjectID, curName, curMinTime, curIdealTime, deleted.toString(), projectRow, function(){
            if(deleted.toString() == "true"){
                $("#" + editProjectID).addClass("text-red");
            }
            else{
                $("#" + editProjectID).removeClass("text-red");
            }
        });

        $("#edit-project-modal").modal('hide');
    });*/




    $("#update-project").click(function(){
        var newName = $("#edit-project-name").val();
        var newMinTime = parseInt($("#edit-minimum-time").val());
        var newIdealTime = parseInt($("#edit-ideal-time").val());
        var deleted = $("#delete-project").is(":checked");
        var projectRow = FindProjectRowNum(editProjectID);


        if(newName == ""){
            $("#edit-project-error-message").text("Project name cannot be blank");
            return;
        }


        if(newMinTime > newIdealTime){
            $("#edit-project-error-message").text("Ideal time cannot be less than minimum time.");
            return;
        }


        if(ValidProjectName(newName) == false){
            $("#edit-project-error-message").text("Project names can only contain letters, number, spaces, underscores and dashes.");
            return;
        }




        UpdateProjectGoal(editProjectID, newName, newMinTime, newIdealTime, deleted.toString(), projectRow, function(){
            $("#" + editProjectID + " .project-name").text(newName);
            $("#" + editProjectID + " .min-time").text(newMinTime);
            $("#" + editProjectID + " .ideal-time").text(newIdealTime);
        });

        if(deleted.toString() == "true"){
            $("#" + editProjectID).addClass("text-red");
        }
        else{
            $("#" + editProjectID).removeClass("text-red");
        }

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
        AddProjectRow(data, rows[i][0], rows[i][1], rows[i][2], rows[i][3], rows[i][4]);
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
            $("#add-project-error-message").text("Project name cannot be blank");
            return;
        }


        if(minimumTime > idealTime){
            $("#add-project-error-message").text("Ideal time cannot be less than minimum time.");
            return;
        }


        var projectAlreadyExists = false;
        $(".project-name").each(function(){
            if(projectName == $(this).text()){
                projectAlreadyExists = true;
            }
        });

        if(projectAlreadyExists == true){
            $("#add-project-error-message").text("Project with this name already exists.");
            return;
        }



        if(ValidProjectName(projectName) == false){
            $("#add-project-error-message").text("Project names can only contain letters, number, spaces, underscores and dashes.");
            return;
        }


        console.log("adding project");
        InsertProjectGoals(projectName, minimumTime, idealTime, "FALSE", AddProjectRow);

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
function AddProjectRow(ajaxData, projectID, projectName, weeklyMin, weeklyGoal, deleted){
    var rowTemplate =    
    `<tr {deleted} id="{projectID}">
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

    if(deleted == "TRUE" || deleted == "true"){
        row = row.replace("{deleted}", 'class="text-red"');
    }
    else{
        row = row.replace("{deleted}", "");
    }

    $("#projects-table").append(row);
}

