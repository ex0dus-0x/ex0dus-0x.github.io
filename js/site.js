$( document ).ready(function() {
  $("#rotate").textrotator({
    animation: "flipUp", 
    separator: ",", 
    speed: 2000 
  });
});




// Random GIF Display

var image = ["img/heading.gif"];

var size = image.length
var x = Math.floor(size * Math.random())

$('#random').attr('src',image[x]);