$( document ).ready(function() {
  
  // Initialize smoothScroll functionality
  smoothScroll.init();
  
  // Call jQuery text rotator
  $("#rotate").textrotator({
    animation: "flipUp", 
    separator: ",", 
    speed: 2000 
  });
  
  // Get random quote from Github API through XMLHttpRequest
  $("#quote").html(function() {
    var quotes = new XMLHttpRequest();
    quotes.onreadystatechange = function() {
       if (this.readyState == 4 && this.status == 200) {
           let banner_text = document.createElement("p");
           banner_text.classList.add("banner-text", "text-center");
           banner_text.textContent = quotes.responseText;
           document.querySelector("#quote").appendChild(banner_text);
       }
      };
    quotes.open('GET', 'https://api.github.com/zen', true)
    quotes.send()
    
  });
  
  var api = "https://api.github.com/users/ex0dus-0x/repos";
    $.get(api, function (data) {
        $.each(data, function (idx, obj) {
          
            if(obj.language == null){
              obj.language = "None";
            }
                      
            //$("#repos").append("<h3 class='section-heading'><a href='" + obj.html_url + "'>" + obj.name + "</a> <i class='fa fa-github'/></h3>");
           
           let repos = document.querySelector("#repos");
          
           // creating the h3 section-heading element 
           let section_heading = document.createElement("h3");
           section_heading.classList.add("section-heading");
            
           let section_heading_a_tag = document.createElement("a");
           section_heading_a_tag.href = obj.html_url;
           section_heading_a_tag.textContent = obj.name;
           section_heading.appendChild(section_heading_a_tag);
          
          
          let section_heading_i_tag = document.createElement("a");
          section_heading_i_tag.classList.add("fa","fa-github");
          section_heading.appendChild(section_heading_i_tag);
          
          
          //append main h3 tag to #repos element
          repos.appendChild(section_heading);
          
            if((obj.homepage != "") && (obj.homepage !== null)){
              //$("#repos").append("<h5><i class='fa fa-user'/> <a href='" + obj.homepage + "'> Homepage </a></h5>");

              let homepage_element = document.createElement("h5");

              let homepage_user_icon_i_tag = document.createElement("i");
              homepage_user_icon_i_tag.classList.add("fa", "fa-user");
              homepage_element.appendChild(homepage_user_icon_i_tag);
              
              let homepage_a_tag = document.createElement("a");
              homepage_a_tag.href = obj.homepage;
              homepage_a_tag.textContent = "Homepage";
              homepage_element.appendChild(homepage_a_tag);
              
              // append h5 to #repos element
              repos.appendChild(homepage_element);
            }

            if(obj.fork == true) {
              //$("#repos").append("<p style='font-size: 10px'> (this repo is a fork) </p>");
              let fork_repo = document.createElement("p");
              fork_repo.style.fontSize = "10px";
              fork_repo.textContent = "(this repo is a fork)";
              repos.appendChild(fork_repo);
            }
           //$("#repos").append("<p>" + obj.description + "</p>");
           let desc = document.createElement("p");
           desc.textContent = obj.description;
           repos.appendChild(desc);
          
           //$("#repos").append("<p style='font-weight: light'> <b>Stars:</b> " + obj.stargazers_count + " | <b>Forks:</b> " + obj.forks + " | <b>Issues:</b> " + obj.open_issues + " | <b>Language:</b> " + obj.language + "</p>");
          let other_details = document.createElement("p");
          other_details.style.fontWeight = "light";
          
          let things_to_append = {"Stats" : obj.stargazers_count, "Forks" : obj.forks, "Issues" : obj.open_issues, "Language" : obj.language};
          
          for(thing_to_append in things_to_append){
            let elem_b = document.createElement("b");
            elem_b.textContent = thing_to_append.toString();
            other_details.appendChild(elem_b); // append the bold key name ie: Forks , Issues 
            other_details.innerText += things_to_append[thing_to_append] + "|"; // append the key ie : the repos language and open issues
          }
          
          //append other_details element to the repos element
          repos.appendChild(other_details);
        });
    });
  
});



