/////                   Document Ready
/////
/////
$(document).ready(function(){
    ReadProjectGoals(ReadProjectGoalsCallback);//TODO: this currently causes a 400 when called, "invalid json payload"

    $("#add-project").click(function(){
        SetupNewProject();
    });

    $("#projects-table").on("click", ".delete-project", function(){
        var id = this.id.split("-")[1];
        console.log(id);
    });

});








/////                   ReadProjectGoalsCallback
/////                           Takes the data from the read project goals call, parses said data, and adds it to the page
/////
function ReadProjectGoalsCallback(data){
    var rows = data.values;

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


        //TODO: regex check to make sure only alpha numeric characters are allowed
        var alphaNumeric = new RegExp("^[A-Za-z.\s_-]+$");
        var validCharactersOnly = alphaNumeric.test(projectName);

        if(validCharactersOnly == false){
            alert("Project names can only contain letters, numbers, underscores and dashes.");
            return;
        }


        console.log("adding project");
        InsertProjectGoals(projectName, minimumTime, idealTime, AddProjectRow);
}








/////                   AddProjectRow
/////
/////
function AddProjectRow(ajaxData, projectID, projectName, weeklyMin, weeklyGoal){
    var rowTemplate =    
    `<tr>
        <td class="project-name">{projectName}</td>
        <td>{weeklyMin}</td>
        <td>{weeklyGoal}</td>
        <td><button class="btn btn-danger btn-sm delete-project" id="{buttonID}">Delete</button></td>
    </tr>`;

    row = rowTemplate;
    row = row.replace("{projectName}", projectName);
    row = row.replace("{weeklyMin}", weeklyMin);
    row = row.replace("{weeklyGoal}", weeklyGoal);
    row = row.replace("{buttonID}", "delete-" + projectID);

    $("#projects-table").append(row);
}

