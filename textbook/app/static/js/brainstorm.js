 var logged_in=''

 $( function() {

     //get the logged in user
        $.ajax({
            type:'GET',
            url:'http://'+ host_url +'/getUsername/',
            async: false, //wait for ajax call to finish, else logged_in is null in the following if condition
            success: function(e){
                logged_in  = e.name
                //console.log('logged in username (inside) :: ', logged_in)
            }
        })






  } );

var draggableConfig = {
    scroll: true
};

var setupBrainstorm = function(){
    // Make ideas draggable
    $('#idea-workspace .idea').draggable(draggableConfig);

    // Handle new idea popup
    $('#new-idea .toggle').click(function(){
        toggleNewIdeaButton();
    })

    // Handle color picker
    $('#new-idea .colorpicker').click(function(){
        $('#new-idea .colorpicker.active').removeClass('active');
        $(this).addClass('active');
    });

    // Handle submission
    $('#new-idea form .btn').click(function(){




        // TODO validate

        // Get values
        var form = $('#new-idea form');
        var idea = $('textarea', form).val();
        var color = $('.colorpicker.active', form).css('background-color');
        //var hideName = $('#hidename', form).is(':checked');

        // Calculate center position:
        var workspace = $('#idea-workspace');
        height = workspace.height();
        width = workspace.width();
        posTop = height / 2 - 85; // These modifier (85) should probably be calculated dynamically
        posLeft = width / 2 - 85;

        // Submit idea
        toggleNewIdeaButton();

        //send to database
        //saveBrainstormNote(idea, color, hideName, posTop, posLeft);
          $.post({
                url: '/brainstorm/save/',
                data: {
                'idea': idea,
                'color': color,
                'posTop': posTop,
                'posLeft': posLeft
                },
                success: function (data) {

                    noteID = data.id
                    addIdeaToWorkspace(idea, color, logged_in, {top:posTop,left:posLeft}, noteID, true);
                    //user logging
                    enterLogIntoDatabase('add note', 'brainstorm' , idea , current_pagenumber)

                }
        });
        return false; //why return false?
    });
};


var toggleNewIdeaButton = function(){
    // Toggle main class
    $('#new-idea').toggleClass('button');
    $('#new-idea').toggleClass('popup');
    // Show or hide form
    $('#new-idea form').toggle('fast');
}

/*
    idea: the idea text
    color: color of the idea block
    hideName: whether the diea should show the name or not
    position: object with top and left number positions (i.e. {top:10, left:20})
    animate: whether the idea should be added with an animation or not
*/
var addIdeaToWorkspace = function(idea, color, name, position, noteID, animate, isItYours){

    // Create idea
    var idea = $('<div class="idea new"></div>')
        .text(idea)
        .css('background', color)
        .css('top', position.top + 'px')
        .css('left', position.left + 'px')
        .data('noteid',noteID) //add id
        .append('<span class="brainstorm_name ">'+ name +'</span>'); //add username in the right end corner


        if(isItYours == true){

             idea.css({"border-color": "#000000",
             "border-width":"1px",
             "border-style":"solid"});

             //add delete button to notes
             idea.append('<span id="object_delete">&times;</span>')

        }




    // Add to workspace
    $('#idea-workspace').append(idea);
    // Make it draggable
    idea.draggable(draggableConfig);
    // Remove new class
    idea.removeClass('new');


    ideaDragPositionUpdate();


}

var ideaDragPositionUpdate = function(){

    //detect when an idea is stopped dragging to get the final location
    //and save it into the database
    //http://api.jqueryui.com/draggable/#event-start
    //console.log('total idea divs',$(".idea").length) //debug purpose - remove later

    $( ".idea" ).on( "dragstop", function( event, ui ) {

        //find the id of the note - which is used to update the note in the database
        noteID = $(this).data('noteid')
        //console.log(noteID)


        //user logging - printing log multiple times why?
        enterLogIntoDatabase('note dragged', 'brainstorm' , JSON.stringify(ui.position) , current_pagenumber)


         $.post({

           async: false,
           url:'/brainstorm/update/'+noteID+'/', //get all the image for the particular group
           data: {
                'left': ui.position.left,
                'top': ui.position.top
                },
           success: function(response){

        }

        });


     } );

}


var loadIdeaToWorkspace = function(){

    var notes

     $.get({

         url:'/brainstorm/get/', //get all the notes
         success: function(data){

                //console.log(data.success)
                notes = data.success;
                notes = jQuery.parseJSON(notes);

                //clear the workspace
                $('#idea-workspace').empty()

                //loop through and display notes
                $.each(notes, function(key, value){

                    var isItYours = ''

                    if(logged_in == value.fields['posted_by'][0]) {
                        console.log(logged_in)
                        isItYours = true
                    }else isItYours = false

                    addIdeaToWorkspace(value.fields['ideaText'], value.fields['color'], value.fields['posted_by'][0], {top:value.fields['position_top'],
                            left:value.fields['position_left']}, value.pk, true,  isItYours);

                })

                ideaDragPositionUpdate();

                // works only for the first fetched note

                $('#object_delete').on('click', function(e){
                    e.preventDefault();
                    console.log('here i am, want to delete everything')
                    $(this).parent().remove();
                    //TODO: remove from database as well
                    return false;
                });

            }

        });





}