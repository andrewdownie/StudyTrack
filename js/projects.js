$(document).ready(function(){
    //ReadProjectGoals();//TODO: this currently causes a 400 when called, "invalid json payload"

    $("#add-project").click(function(){
        var projectName = $("#project-name").val();
        var minimumTime = parseInt($("#minimum-time").val());
        var idealTime = parseInt($("#ideal-time").val());

        if(projectName == ""){
            alert("project name is blank");
            return;
        }


        if(minimumTime > idealTime){
            alert("Ideal time cannot be less than minimum time.");
            return;
        }


        console.log("adding project");
        InsertProjectGoals(projectName, minimumTime, idealTime);
    });
});


function ConstructProjectRow(projectName, weeklyMin, weeklyGoal){
    var base =    
    `<tr>
        <td>{projectName}</td>
        <td>{weeklyMin}</td>
        <td>{weeklyGoal}</td>
        <td><button class="btn btn-danger" id="{buttonID}">Delete</button></td>
    </tr>`;

    base = base.replace("{projectName}", projectName);
    base = base.replace("{weeklyMin}", weeklyMin);
    base = base.replace("{weeklyGoal}", weeklyGoal);
    base = base.replace("{buttonID}", "delete-" + projectName);

    return base;
}
