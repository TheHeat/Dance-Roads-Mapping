// **********************
// Empty/default arrays, objects and variables 
// 
// **********************

// Set up objects for organisations and networks
var orgMap = {};
var networkMap = {};
// Language option
var language = 'en';
// Array for collecting network names for validation and filtering
var networkNames = [];
// networkChoice controls what information is displayed on the map and in the network-info panel 
var networkChoice = "";

// **********************
// Functions: filters and constructors
// 
// **********************

// Check a value against array items
function isInArray(value, array) {
  return array.indexOf(value) > -1 ? true : false;
}


// Function for constructing nicely formatted links from a website address (no http://)
// Check if there is a website specified, then costruct a link
function linkBuilder(website){
  if(website != null){
            var linkFormat = '<p><a href="' + website + '">www</a></p>';
            return linkFormat;
          }else{
            var linkFormat = "";
            return linkFormat;
          }
}

// Function or creating icons
// 2 inputs: the icon class and the column

function iconBuilder(col, className, hovertext){
  var icon = "";
  if(col){
    icon = '<span id="' + className + '" title="' + hovertext + '" class="icon ' + className + '">' + col + '</span>';
    return icon;
  }else{
    icon = "";
    return icon;
  }
  
}

// **********************
// Miso.Dataset data
// Pulling in spreadsheet data
// http://misoproject.com/dataset/ 
// 
// **********************

// Define networks dataset

var networks = new Miso.Dataset({
  importer : Miso.Dataset.Importers.GoogleSpreadsheet,
  parser : Miso.Dataset.Parsers.GoogleSpreadsheet,
  key : "0AkU6ehGOEB2VdGE5YlA4bE43UE1vdWxEbmpzcnZPSHc",
  worksheet : 2
});


// Define organisations dataset

var organisations = new Miso.Dataset({
  importer : Miso.Dataset.Importers.GoogleSpreadsheet,
  parser : Miso.Dataset.Parsers.GoogleSpreadsheet,
  key : "0AkU6ehGOEB2VdGE5YlA4bE43UE1vdWxEbmpzcnZPSHc",
  worksheet : 1
});


// **********************
// Networks
// Fetch networks worksheet, format and structure objects
// 
// **********************

networks.fetch({
  success : function(){
    // console.log(networks.columnNames());
    // console.log("There are " + this.length + " networks");

    
    this.each(function(row){

       //Add names to networkNames array 
      networkNames.push(row.name);

      var link = linkBuilder(row.website);
      var membership = iconBuilder(row.membership, 'members', 'Approx. membership');

        networkMap[row._id] = {
          name:   row.name,
          content:  '<h2>' + row.name + '</h2>' +
                    '<p class="en">' + row.descEn + '</p>' + 
                    '<p class="fr">' + row.descFr + '</p>' + 
                    '<p class="de">' + row.descDe + '</p>' +
                    '<p class="it">' + row.descIt + '</p>' +
                    link +
                    '<div class="icons">' + membership + '</div>'
        };

        $(document).ready(function(){  
          $('#networkSelect').append('<option id="' + row._id + '">' + row.name + '</option>');
        });

      });

  
  },
  error : function() {
    console.log("Network data has not loaded");
  }
});

// Output the whole networkMap object to the console
// console.log(networkMap);

// **********************
// Organisations
// Fetch organisations worksheet, format and structure objects
// 
// **********************

organisations.fetch({ 
  success : function() {

    // console.log(organisations.columnNames());
    // console.log("There are " + this.length + " organisations");

    this.each(function(row){

      // Output organisation name and LatLng
      console.log(row.name);


      // Filter org size into s/m/l brackets as orgBraket

      var orgBracket = "";

      switch (row.orgSize){
        case "1":
        case "2 - 5":
          orgBracket = "S";
          break;
        case "6 - 15":
          orgBracket = "M";
          break;
        default:
          orgBracket = "L";
          break;
      }


      // Split venues into an array and return each as an icon

      var venues = "";

      if(row.venCap){
        var venString = row.venCap;
        var venArray = venString.split(" ");

        for (var i = 0; venArray.length > i ; i++) {

          venArray[i] = venArray[i].substr(1)
          venueIcon = iconBuilder(venArray[i], 'venue', 'Venue capacity');
          venues += venueIcon;
        
        };

      }

      // Check the memberOf column and split it into an array

      var memberOf = [];
      var memberships = "";
      var membershipArray = [];

      if(row.memberOf){
        var membershipString = row.memberOf;
        membershipArray = membershipString.split(", ");

        for (var i = 0; membershipArray.length > i ; i++) {

          // Filter out unknown networks by checking against the name column of the networkMap array 
          var valid = isInArray(membershipArray[i], networkNames);

          if(valid){
            memberOf.push('<span class="networklink">' + membershipArray[i] + '</span>');  
          }

        };
      }

      if(memberOf.length > 0){
        memberships =  '<p class="memberships">Member of: ' + memberOf.join(", ") + '</p>';
      }else{
        memberships = '';
      }

      var orgSize =  iconBuilder(orgBracket, 'org-size', 'Organisation size');
      var projects = iconBuilder(row.projects, 'projects', 'Annual Projects');
      var shows =    iconBuilder(row.shows, 'shows', 'Annual Performances');
      var link =     linkBuilder(row.website);

      // Populate orgMap object

      orgMap[row._id] = {
        address:  row.address,
        center:   new google.maps.LatLng(row.Lat , row.Long),
        name:     row.name,        
        content:  '<h2>' + row.name + '</h2>' +
                    '<p class="en">' + row.descEn + '</p>' + 
                    '<p class="fr">' + row.descFr + '</p>' + 
                    '<p class="de">' + row.descDe + '</p>' +
                    '<p class="it">' + row.descIt + '</p>' +
                    '<div class="icons">' + orgSize + projects + shows + venues + '</div>' + 
                    link + memberships,
        networks:   membershipArray
        
      }
    });
  },
  error : function() {
    console.log("Organisation data has not loaded");
  }
});




// *******************************************
// jQuery Magic
// 
// *******************************************


$(document).ready(function(){



  // ***************************
  // NETWORK CHOICES
  // Selecting a network either from the select menu or by clicking in an infoWindow fires a number of actions
  // 1. Loads the network info into the .network-info div
  // 2. Slides up the .project-info div if it is visible
  // 3. Slides down the .network-info div if it isn't visible
  // 4. Enables the ability to toggle project and network info

  // Update networkChoice
  // Loop through each object in networkMap looking for a match. If a match is found, ie it's not the title option: 
  // update var networkChoice, toggle info divs, load the content into the .network-info div and add class .link to the title 
  // initialize the Google map

  function updateNetworkChoice(){

    for(i in networkMap){

      if(networkMap[i].name === networkChoice){

        console.log("networkChoice = " + networkChoice);

        var networkBlurb = networkMap[i].content;

        $(".project-info").slideUp();

        $(".network-info").slideUp(function(){
          
          $(this).html(networkBlurb);
          $(this).slideDown();
          $(".content h1").addClass("link");
          
          initialize();

        });
        



        
        
        
        

      }
    }
    
  }

  // Clear the networkChoice
  // clear the var networkChoice, remove content from the network-info div, toggle info divs visibility and remove class .link from the title
  // initialize the Google mape 

  function clearNetworkChoice(){
    networkChoice = "";
    console.log("networkChoice has been cleared")
    $('.network-info').html("");
    $('.network-info').slideUp();
    $(".project-info").slideDown();
    $(".content h1").removeClass("link");
    initialize();
  }
  

  // When #networkSelect changes, update var networkChoice with the name selected

  $("#networkSelect").change(function(){
    $("#networkSelect option:selected").each(function(){

      var choice = $(this).text(); 

      if (choice === "Show All"){
        clearNetworkChoice();
      }else{
        networkChoice = choice;
        updateNetworkChoice();
      };

      
          
    });
  });

  // when a .networklink is clicked, update var networkChoice with the name selected
  // this has to exist in a google.maps listener: the infoWindow doesn't exist in the DOM until it opens

  google.maps.event.addListener(infowindow, "domready", function(){ 

    $(".networklink").click(function(){
      networkChoice = $(this).text();
      updateNetworkChoice();
      $("#networkSelect").val(networkChoice);
    });

  });

  // If networkChoice is defined, clicking the title toggles the project and network info divs

  $(".content h1").click(function(){

    if(networkChoice){
        $(".project-info , .network-info").slideToggle();

    }

  }); 


  // END NETWORK CHOICES





  // ***************************
  // LANGUAGE SWITCHER
  // Clicking a flag in the #switcher toggles classes in the body tag

  var langChoice = "";

  $('#switcher input').click(function(){

    langChoice = $(this).val();

    $('body').addClass(langChoice);

    console.log("langChoice: " + langChoice);

    switch (langChoice){

      case "fr":
        $('body').removeClass('de it en');
        break;
      case "de":
        $('body').removeClass('it en fr');
        break;
      case "it":
        $('body').removeClass('en fr de');
        break;
      default:
        $('body').removeClass('fr de it');
        break;
    }

  });


  




   

});

