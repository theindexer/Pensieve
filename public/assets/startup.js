     $(document).ready(function(){
        var func = function(arg){
          alert("hi");
        }
        var currentNode=0
        $('#viewport').width = $('#back').clientWidth;
        
        var dat = {"page":"Wikipedia"}
        $.ajax({
          url: "/wiki/fetch",
          dataType: 'text',
          data:dat,
          success: function(data){
            var text= $('<div/\>').html(data).text();
            startGraph(text.replace("\\","\\\\","g"),"#nodes");
          }
        });
        $("#search-wikipedia").dialog({
          autoOpen: false,
	  height: 400,
	  width: 600,
	  modal: true,
	  buttons: {
	    "Do Search!": function() {
              var searchData = {"page":$("#query").val().replace(new RegExp(" ","g"),"+")}
              $("#search-results").empty();
              $.ajax({
                url: "/wiki/doSearch",
                dataType: 'xml',
                data:searchData,
                success: function(data){
                  xmlDoc = data
                  var result=xmlDoc.getElementsByTagName("Item");
                  if(result.length==0){
                    $("#search-results").append("No results"); return;
                  }
                  var locali
                  for (i=0; i < result.length; i++){
                    var localResult = "<button id="+i+"button class='resultbutton'>"+result[i].getElementsByTagName("Text")[0].childNodes[0].nodeValue + "</button><br>";
                    localResult +=result[i].getElementsByTagName("Description")[0].childNodes[0].nodeValue+"<br>";
                  $("#search-results").append(localResult);
                    locali = i
                  $("#"+locali+"button").button().click(function(){
                    var url = result[this.id.substr(0,1)].getElementsByTagName("Url")[0].childNodes[0].nodeValue;
                    url = url.substr(url.indexOf("wiki/")+5)
                    initGraphFromUrl(url)
                    $( "#search-wikipedia" ).dialog( "close" );
                    emptyPath();
                    });

                  }
                }
              });
					
	     },
	     Cancel: function() {
	      $( this ).dialog( "close" );
	      }
           },
			close: function() {
				$('#query').val( "" );
                                $("#search-results").empty();
			}
        });


        $(".fancybutton").button()
        $("#checkbox").button()
        $("#do-search").click(function(){
          $("#search-wikipedia").dialog("open");
        });
        $("#open-new-tab").click(function(){
          window.open('http://en.wikipedia.org/wiki/'+globalurl);
          self.focus();
        });
        $("#open-path").click(function(){
          nodechilds = $("#nodes").children()
          var i
          for(i = 0; i < nodechilds.length; i++){
      
          window.open('http://en.wikipedia.org/wiki/'+$("#"+nodechilds[i].id).data("url"));
          self.focus();
          }
        });
        $("#save-path").click(function(){
          nodechilds = $("#nodes").children()
          var data = []
          var i
          for(i = 0; i < nodechilds.length; i++){
            var nodle = $("#"+nodechilds[i].id)
            data.push({"name":nodle.text(),"url":nodle.data("url")})
          }
          $.ajax({
          type: "POST", 
          url: "/paths/addpath", 
          data: {"path":JSON.stringify(data)},
          success: function(){ 
            alert("yay");
          }
          });
          
        });
        function emptyPath(){
          $('#nodes').empty();
        }
        });
        function colorblindMode(){
          var checkbox = $("#checkbox")
          colorblind = !colorblind 
        }

