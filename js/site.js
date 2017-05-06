$( document ).ready(function() {
  smoothScroll.init();
  $("#rotate").textrotator({
    animation: "flipUp", 
    separator: ",", 
    speed: 2000 
  });
  
  $("#quote").html(function() {
    var quotes = new XMLHttpRequest();
    quotes.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      document.getElementById("quote").innerHTML =
        '<p class="banner-text text-center"> "' + quotes.responseText + '"</p>' 
          }
        };
    quotes.open('GET', 'https://api.github.com/zen', true)
    quotes.send()
    
  });
  
});



