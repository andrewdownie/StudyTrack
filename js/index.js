/////                   Document Ready
/////
/////
$(document).ready(function(){
    ReadProjectGoals(function(data){
        console.log(data);

        for(var i in data.values){
            var id = data.values[i][0];
            var name = data.values[i][1];
            $("#dropdown-insertion").append(BuildDropItem(id, name));

        }

        ReadStudyTime(AddProjectRows);

    });






});








/////                   BuildDropItem
/////
/////
function BuildDropItem(projectID, projectName){
    var item = '<li><a class="dropdown-item project-choice" href="#" id="{id}">{projectName}</a></li>';
    item = item.replace("{id}", projectID);
    item = item.replace("{projectName}", projectName);

    return item;
}








/////                   AddProjectRows
/////
/////
function AddProjectRows(data){
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



    for(var i in data.values){
        var projectID = data.values[i][0];
        var minRemaining = data.values[i][0];
        var idealRemaining = data.values[i][0];
        var projectName = "";

        //loop through each drop down item,
        //  if current id in rows == id in drop down
        //      then save that name to that id


        AddProjectRow(projectName, projectID, minRemaining, idealRemaining);
    }
}








/////                   AddProjectRow
/////
/////
function AddProjectRow(projectName, projectID, minRemaining, idealRemaining){
    var rowTemplate =    
    `<tr id="{projectID}">
        <td class="project-name">{projectName}</td>
        <td class="min-time">{minRemaining}</td>
        <td class="ideal-time">{idealRemaining}</td>
    </tr>`;

    row = rowTemplate;
    row = row.replace("{projectID}", projectID);
    row = row.replace("{projectName}", projectName);
    row = row.replace("{minRemaining}", minRemaining);
    row = row.replace("{idealRemaining}", idealRemaining);

    $("#projects-table").append(row);
}









