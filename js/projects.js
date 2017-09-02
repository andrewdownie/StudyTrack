$(document).ready(function(){
    //ReadProjectGoals();
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