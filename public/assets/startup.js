     $(document).ready(function(){
       $('[id!="down"]').click(function(){
         $("#history_scroller").hide('fast')
       });
       $("#backwards").click(function(){
         if(window.history_location-1 >=0 && window.history_location-1 < window.history_array.length){
           curPlace = window.history_location-1
           newcenter = window.history_array[curPlace]["url"]
           initGraphFromUrl(newcenter)
           window.history_location-=1;
         }

       });
       $("#forwards").click(function(){
         if(window.history_location+1 >=0 && window.history_location+1 < window.history_array.length){
           curPlace = window.history_location+1
           newcenter = window.history_array[curPlace]["url"]
           initGraphFromUrl(newcenter)
           window.history_location+=1
         }
       });
       $("#down").click(function(event){
         event.stopPropagation();
         var hist = $("#history_scroller")
         hist[0].innerHTML="";
         for (var i=0; i < window.history_array.length; i++){
           item = "<a class='faux-link' target='_blank' href='http://en.wikipedia.org/wiki/"+window.history_array[i]["url"]+"'>Open in new tab</a>"
           item += "<span class='history-span'><a class='history-span' href='javascript:openFromHistory(\""+window.history_array[i]["url"]+"\","+i+")'>"+window.history_array[i]["name"]+"</a></span><br>"
           hist.prepend(item)
         }
         $("#history_scroller").toggle('fast')
       });

        function doSearch() {
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
                    window.history_array = new Array();
                    window.history_location = -1
                    addToHistory({"url":url,"name":result[this.id.substr(0,1)].getElementsByTagName("Text")[0].childNodes[0].nodeValue})
                    $( "#search-wikipedia" ).dialog( "close" );
                    emptyPath();
                    });

                  }
                }
              });
					
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
            addToHistory({"name":"Wikipedia","url":"Wikipedia"})
          }
        });
        $('#search-wikipedia').keypress(function (e) {
  if (e.which == 13) {
    doSearch()
    return false
  }
});
        $("#search-wikipedia").dialog({
          autoOpen: false,
	  height: 400,
	  width: 600,
	  modal: true,
	  buttons: {
	    "Do search!": function(){ doSearch(); },
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
          sys.eachNode(function(node,pt){
            if (node.data.link){
              window.open('http://en.wikipedia.org/wiki/'+node.data.url);
              self.focus();
            }
          });
        });
        $("#save-path").click(function(){
          var data = window.history_array.slice(0)
          data.reverse() 
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

        function openFromHistory(url,newval){
         $("#history_scroller").toggle()
         initGraphFromUrl(url)
         window.history_location=newval
       }

        function addToHistory(item) {/*
          var canvas = $("#history_canvas").get(0)
          var ctx = canvas.getContext("2d")
          history.push(item)
          canvas.height = history.length*30
          ctx.fillStyle = "white"
          ctx.fillRect(0,0, canvas.width, canvas.height)
          ctx.fillStyle = "black"
          for (var i=history.length-1; i >=0; i--){
            ctx.font = "12pt Arial"
            ctx.fillText(history[i]["name"],0,15+((-i+history.length-1)*30))
          }*/
          window.history_array=window.history_array.slice(0,window.history_location+1)
          window.history_array.push(item)
          window.history_location++
          var selecter = $("#history_select")
          selecter.prepend("<option selected='true' value="+item["url"]+">"+item["name"]+"</option>")
        }
