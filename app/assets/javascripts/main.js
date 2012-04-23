//
//  main.js
//
//  A project template for using arbor.js
//
var colorblind = false 
var globalurl
(function($){
  var maxLinks = 20
  var maxSubLinks = 25
  var rootNode
  var splitText = function(string) {
    var charlimit = 14
  }
  var Renderer = function(canvas, nodediv){
    var canvas = $(canvas).get(0)
    var ctx = canvas.getContext("2d");
    var particleSystem
    var NodeDiv = nodediv
    var currentNode = 0
    var canvasOffset = arbor.Point(0,0)
    var prevPoint;
    var that = {
      init:function(system){
        //
        // the particle system will call the init function once, right before the
        // first frame is to be drawn. it's a good place to set up the canvas and
        // to pass the canvas size to the particle system
        //
        // save a reference to the particle system for use in the .redraw() loop
        particleSystem = system

        // inform the system of the screen dimensions so it can map coords for us.
        // if the canvas is ever resized, screenSize should be called again with
        // the new dimensions
        particleSystem.screenSize(canvas.width, canvas.height) 
        particleSystem.screenPadding(80) // leave an extra 80px of whitespace per side
        
        // set up some event handlers to allow for node-dragging
        that.initMouseHandling()
      },
      
      redraw:function(){
        // 
        // redraw will be called repeatedly during the run whenever the node positions
        // change. the new positions for the nodes can be accessed by looking at the
        // .p attribute of a given node. however the p.x & p.y values are in the coordinates
        // of the particle system rather than the screen. you can either map them to
        // the screen yourself, or use the convenience iterators .eachNode (and .eachEdge)
        // which allow you to step through the actual node objects but also pass an
        // x,y point in the screen's coordinate system
        // 
        ctx.fillStyle = "white"
        ctx.fillRect(0,0, canvas.width, canvas.height)
        var Color = function(red, green, blue){
          this.red = red
          this.green = green
          this.blue = blue
          this.string = red+","+green+","+blue
        }
        var invert = function(color){
          return Color(255-color.red,255-color.green,255-color.blue)
        }
        particleSystem.eachEdge(function(edge, pt1, pt2){
          // edge: {source:Node, target:Node, length:#, data:{}}
          // pt1:  {x:#, y:#}  source position in screen coords
          // pt2:  {x:#, y:#}  target position in screen coords
          // draw a line from pt1 to pt2
          var white = new Color(0,0,0)
          ctx.strokeStyle = "rgba("+white.string+", .666)"
          ctx.strokeStyle = (edge.data.color) ? edge.data.color : ctx.strokeStyle
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.moveTo(pt1.x, pt1.y)
          ctx.lineTo(pt2.x, pt2.y)
          ctx.stroke()
        })

        particleSystem.eachNode(function(node, pt){
          // node: {mass:#, p:{x,y}, name:"", data:{}}
          // pt:   {x:#, y:#}  node position in screen coords
          var w = 30
          var rootColor = new Color(255,255,20)
          var rootText = new Color(0,0,235)
          var sectColor = new Color(100,0,100)
          var sectText = new Color(155,255,155)
          var moreColor = new Color(100,0,200)
          ctx.fillStyle = (node.data.root) ? "rgb("+rootColor.string+")" : (node.data.holder) ? "rgb("+moreColor.string+")" : "rgb("+sectColor.string+")"
          if(node.data.link){
            w=30
            ctx.fillStyle = "blue"
          }
          if(colorblind){
            ctx.fillStyle = "rgb(0,0,0)"
          }
          ctx.font = "12pt Arial"
          var metrics = ctx.measureText(node.data.text);
          var width = Math.max(metrics.width,80);
          if(!colorblind || (colorblind && node.data.link)){
          ctx.fillRect(pt.x-width/2, pt.y-w/2, width,w);
          ctx.beginPath();
          ctx.arc(pt.x-width/2+1,pt.y,w/2,Math.PI/2,3*Math.PI/2,false);
          ctx.closePath();
          ctx.fill();
          ctx.beginPath()
          ctx.arc(pt.x+width/2-1,pt.y,w/2,Math.PI/2,3*Math.PI/2,true);
          ctx.closePath();
          ctx.fill();
          } else {
            if(node.data.root){
              ctx.fillRect(pt.x-width/2, pt.y-w/2,width,w);
              ctx.beginPath();
              ctx.moveTo(pt.x-10,pt.y-w/2+1)
              ctx.lineTo(pt.x,pt.y-w/2-9)
              ctx.lineTo(pt.x+10,pt.y-w/2+1)
              ctx.closePath();
              ctx.fill();
              ctx.beginPath();
              ctx.moveTo(pt.x-10,pt.y+w/2-1)
              ctx.lineTo(pt.x,pt.y+w/2+9)
              ctx.lineTo(pt.x+10,pt.y+w/2-1)
              ctx.closePath();
              ctx.fill();

            } else {
              ctx.fillRect(pt.x-width/2,pt.y-w/2,width,w);
              ctx.beginPath();
              ctx.moveTo(pt.x-width/2+1,pt.y-10)
              ctx.lineTo(pt.x-width/2-9,pt.y)
              ctx.lineTo(pt.x-width/2+1,pt.y+10)
              ctx.closePath();
              ctx.fill();
              ctx.beginPath();
              ctx.moveTo(pt.x+width/2-1,pt.y-10)
              ctx.lineTo(pt.x+width/2+9,pt.y)
              ctx.lineTo(pt.x+width/2-1,pt.y+10)
              ctx.closePath();
              ctx.fill();

            }
          }          
          if(node.data.root){
            ctx.fillStyle = "rgb("+rootText.string+")"
          } else {
            ctx.fillStyle = "rgb(" + sectText.string+")"
          }
          if(colorblind){
            ctx.fillStyle="rgb(255,255,255)"
          }
          ctx.fillText(node.data.text.replace(new RegExp("_","g")," "), pt.x-metrics.width/2, pt.y+5)
        })    			
      },
      
      initMouseHandling:function(){
        // no-nonsense drag and drop (thanks springy.js)
        var dragged = null;
        var start = 0
        // set up a handler object that will initially listen for mousedowns then
        // for moves and mouseups while dragging
        var handler = {
          clicked:function(e){
            var pos = $(canvas).offset();
            start = e.timeStamp
            _mouseP = arbor.Point(e.pageX-pos.left, e.pageY-pos.top).subtract(canvasOffset)
            prevPoint = arbor.Point(e.pageX,e.pageY)
            dragged = particleSystem.nearest(_mouseP);
            if(dragged.distance > 50){
              dragged = null
            }
            if (dragged && dragged.node !== null){
              // while we're dragging, don't let physics move the node
              dragged.node.fixed = true
              /*if(!dragged.node.data.link){
                if(!dragged.node.data.expanded){
                  expandOnce(dragged.node,particleSystem)
                } else {
                  implode(dragged.node, particleSystem)
                }
              }*/
            }

            $(canvas).bind('mousemove', handler.dragged)
            $(window).bind('mouseup', handler.dropped)

            return false
          },
          dragged:function(e){
            var pos = $(canvas).offset();
            var s = arbor.Point(e.pageX-pos.left, e.pageY-pos.top).subtract(canvasOffset)
            if(dragged==null){
              var curPoint = arbor.Point(e.pageX,e.pageY)
              var newPoint = curPoint.subtract(prevPoint)
              //ctx.translate(newPoint.x,newPoint.y)
              //canvasOffset = canvasOffset.add(newPoint)
              prevPoint = curPoint
            }
            if (dragged && dragged.node !== null){
              var p = particleSystem.fromScreen(s)
              dragged.node.p = p
            }

            return false
          },

          actualClick:function(e){
            var pos = $(canvas).offset();
            _mouseP = arbor.Point(e.pageX-pos.left, e.pageY-pos.top).subtract(canvasOffset)
            dragged = particleSystem.nearest(_mouseP);
            if (dragged && dragged.node !== null && dragged.distance < 50){
                if(!dragged.node.data.link){
                if(!dragged.node.data.expanded){
                  expandOnce(dragged.node,particleSystem)
                } else {
                  implode(dragged.node, particleSystem)
                }
              }
            }
            return false;
          },
          dropped:function(e){
            $(canvas).unbind('mousemove', handler.dragged)
            $(window).unbind('mouseup', handler.dropped)
            if (dragged===null || dragged.node===undefined) return
            if (dragged.node !== null) dragged.node.fixed = false
            var end = e.timeStamp
            var myNode = dragged.node
            dragged.node.tempMass = 1000
            dragged = null
            $(canvas).unbind('mousemove', handler.dragged)
            $(window).unbind('mouseup', handler.dropped)
            _mouseP = null
            console.log("FUCK THIS SHIT");
            if((end-start) < 200){
              if(!myNode.data.link){
                if(!myNode.data.expanded){
                  expandOnce(myNode,particleSystem,myNode)

                } else {
                  if(!myNode.data.root){
                  implode(myNode, particleSystem,myNode)
                  }
                }
              } else {
                $('#back').block({message:null})
                var link = myNode.data.url
                  var oldLink = rootNode.data.url
                  $(NodeDiv).prepend("<li class='node' id='"+currentNode+"'>"+rootNode.data.text.replace(new RegExp("_","g")," ")+"</li>");
                  var nodeID = currentNode
                  $("#"+currentNode).data("url",oldLink)
                  $("#"+currentNode).click(function(e){
                  $('#back').block({message:null})
                  console.log(oldLink+"yay")
                  $.ajax({
                  url: "/wiki/fetch",
                  dataType: 'text',
                  data: "page="+oldLink,
                  processData: false,
                  success: function(data){
                    $('#back').unblock()
                    while ($("#"+nodeID).remove().length!=0){
                      nodeID++
                    }
                    var text= $('<div/>').html(data).text().replace(new RegExp("\\\\","g"),"\\\\");
                    initNodes(text,particleSystem);
                  }
                });

                  });
                  $("#"+currentNode).mouseover(function(e){
                  $(e.currentTarget).css("background-color","yellow");
                  });
                  $("#"+currentNode).mouseout(function(e){
                    $(e.currentTarget).css("background-color","white");
                  });
                  currentNode++


                link = link.replace(new RegExp( " ", "g" ), "_")
                $.ajax({
                  url: "/wiki/fetch",
                  dataType: 'text',
                  data: "page="+link,
                  processData: false,
                  success: function(data){
                    $('#back').unblock()
                    var text= $('<div/>').html(data).text().replace(new RegExp("\\\\","g"),"\\\\");
                    initNodes(text,particleSystem);
                  }
                });
              }
            }
            return false
          }
        }
        
        // start listening
        $(canvas).mousedown(handler.clicked);

      },
      
    }
    return that
  }   

  function expandOnce(node, sys,opt) {
    /*node.expanded = true
    edges = sys.getEdgesFrom(node)
    for (var i =0; i < edges.length; i++){
      edges[i].target.data.visible = true
    }*/

    var thisNode = node
    var edges = sys.getEdgesTo(node);
   // if(opt){
   //   if(opt.data.oldRoot){
   //     opt.data.oldRoot=false
   //     opt.data.root = true
   //   }
   // }
    if(edges.length!=0){
      var parent = edges[0].source;
      edges[0].data.color="orange"
      implode(parent,sys,thisNode);
    }
    implode(thisNode,sys);
    node.data.expanded=true;
    for (var i = 0; i < node.data.sections.length; i++){
      var nodule=sys.addNode("__s__"+node.data.sections[i].title,{link:false,mass:50,text:decodeURI(node.data.sections[i].title),fixed:false,expanded:false,sections:node.data.sections[i].sections,links:node.data.sections[i].links})
      sys.addEdge(node,nodule)
    }
    if(node.data.links && node.data.links.length>0){
      var max = node.data.links.length
      var newLinks
      for (var j = 0; j < max; j++){
       if (j<maxLinks){
        var nodule=sys.addNode("__l__"+node.data.links[j].name,{link:true,mass:50,text:decodeURI(node.data.links[j].name),url:node.data.links[j].url,fixed:false,expanded:false})
        sys.addEdge(node,nodule,{color:"blue"})
        console.log(node.data.links)
       } else {
        /*if (j==maxLinks){
          newLinks = new Array();
        }
        newLinks[j-maxLinks] = node.data.links[j]
        if(j==max-1){
          var nodule = sys.addNode("__s__"+"more"+node.data.text,{link:false,holder:true,mass:50,text:"More Links",fixed:false,expanded:false,sections:new Array(),links:newLinks})
          sys.addEdge(node,nodule)

        }*/
        if (j % maxLinks == 0){
          newLinks = new Array();
        }
        newLinks[j%maxLinks] = node.data.links[j]
        if (j == max-1 || j % (maxLinks-1) ==0) {
          var nodule = sys.addNode("__s__"+"more"+j,{link:false,holder:true,mass:50,text:"More Links "+Math.floor((j+maxSubLinks-maxLinks)/maxSubLinks),fixed:false,expanded:false,sections:new Array(),links:newLinks})
          sys.addEdge(node,nodule)
        }
       }
      }
    }
  }

  function implode(node, sys, opt) {
 
    node.data.expanded = false
    var edges = sys.getEdgesFrom(node)
    console.log(edges)
    for (var i = 0; i < edges.length; i++){
      if(!opt || edges[i].target!=opt){
        implode(edges[i].target,sys)
        sys.pruneNode(edges[i].target)
      }
    }

  }
  var drawNodes = function(node, sys){

    for (var i = 0; i < node.sections.length; i++){
      sys.addNode(node.sections[i].title,{mass:50,text:node.sections[i].title,expanded:false})
      sys.addEdge(node.title,node.sections[i].title)
      drawNodes(node.sections[i],sys)
    }
  }

  startGraph = function(arraystuff,nodeDiv){
    sys = arbor.ParticleSystem(500, 100, 0.0,true) // create the system with sensible repulsion/stiffness/friction
    sys.renderer = Renderer("#viewport",nodeDiv) // our newly created renderer will have its .init() method called shortly by sys...
    initNodes(arraystuff,sys);
  }
  initNodes = function(arraystuff,sys){
    var oldNode
    sys.eachNode(function(node, pt){

      if(node){
         sys.pruneNode(node)
       }
    })    		
    var myobj = JSON.parse(arraystuff)
    globalurl = myobj.url
    console.log(globalurl+"hiii")
    var title = decodeURI(myobj.title)
    // add some nodes to the graph and watch it go...
    sys.addNode(title,{mass:50,fixed:true, text:title,expanded:false,root:true,sections:myobj.sections,links:myobj.links,url:myobj.title,unkillable:true})
    rootNode = sys.getNode(title)
    expandOnce(sys.getNode(title),sys)
    
  }

  initGraphFromUrl = function(url){
    $('#back').block({message:null});
    $.ajax({
                  url: "/wiki/fetch",
                  dataType: 'text',
                  data: "page="+url,
                  processData: false,
                  success: function(data){
                    $('#back').unblock()
                    var text= $('<div/>').html(data).text().replace(new RegExp("\\\\","g"),"\\\\");
                    initNodes(text,sys);
                  }
                });
  }
})(this.jQuery)
