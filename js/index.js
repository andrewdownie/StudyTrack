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









