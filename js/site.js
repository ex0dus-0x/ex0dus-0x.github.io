$( document ).ready(function() {
  smoothScroll.init();
  $("#rotate").textrotator({
    animation: "flipUp", 
    separator: ",", 
    speed: 2000 
  });
  
  $("#quote").html(function() {
    var quotes = [
      {text: "/usr/bin"},
      {text: "cd $GOPATH"},
      {text: "~/"}
    ];
    var quote = quotes[Math.floor(Math.random() * quotes.length)];
    document.getElementById("quote").innerHTML =
      '<p class="banner-text text-center">' + quote.text + '</p>' 
  });
  
});



