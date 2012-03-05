//
//  main.js
//
//  A project template for using arbor.js
//

(function($){

  var Renderer = function(canvas, noode){
    var canvas = $(canvas).get(0)
    var ctx = canvas.getContext("2d");
    var particleSystem
    var noodle = noode
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
        
        particleSystem.eachEdge(function(edge, pt1, pt2){
          // edge: {source:Node, target:Node, length:#, data:{}}
          // pt1:  {x:#, y:#}  source position in screen coords
          // pt2:  {x:#, y:#}  target position in screen coords
          // draw a line from pt1 to pt2
          ctx.strokeStyle = "rgba(0,0,0, .666)"
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

          // draw a rectangle centered at pt
          var w = 20
          ctx.fillStyle = (node.data.root) ? "orange" : (node.data.oldRoot) ? "purple" : "black"
          if(node.data.link){
            w=40
            ctx.fillStyle = "blue"
          }
          ctx.font = "12pt Arial"
          var metrics = ctx.measureText(node.data.text);
          var width = metrics.width;
          ctx.fillRect(pt.x-width/2, pt.y-w/2, width,w);
          ctx.fillStyle = "red";
          ctx.fillText(node.data.text.replace(new RegExp("_","g")," "), pt.x-width/2, pt.y+5)
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
                var link = myNode.data.text
                link = link.replace(new RegExp( " ", "g" ), "_")
                var dat = {"page":link}
                $.ajax({
                  url: "wiki/fetch",
                  dataType: 'text',
                  data:dat,
                  success: function(data){
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
    if(opt){
      if(opt.data.oldRoot){
        opt.data.oldRoot=false
        opt.data.root = true
      }
    }
    if(edges.length!=0){
      var parent = edges[0].source;
      edges[0].data.color="orange"
      implode(parent,sys,node);
    }
    implode(node,sys);
    node.data.expanded=true;
    for (var i = 0; i < node.data.sections.length; i++){
      var nodule=sys.addNode(node.data.sections[i].title,{link:false,mass:50,text:node.data.sections[i].title,fixed:false,expanded:false,sections:node.data.sections[i].sections,links:node.data.sections[i].links})
      sys.addEdge(node,nodule)
    }
    if(node.data.links && node.data.links.length){
    for (var i = 0; i < node.data.links.length; i++){
      var nodule=sys.addNode(node.data.links[i].name,{link:true,mass:50,text:node.data.links[i].name,fixed:false,expanded:false})
      sys.addEdge(node,nodule,{color:"blue"})
    }
    }
  }

  function implode(node, sys, opt) {
 
    node.data.expanded = false
    var edges = sys.getEdgesFrom(node)
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

  startGraph = function(arraystuff){
    var sys = arbor.ParticleSystem(500, 100, 0.0,true) // create the system with sensible repulsion/stiffness/friction
    sys.renderer = Renderer("#viewport","fuuu") // our newly created renderer will have its .init() method called shortly by sys...
    initNodes(arraystuff,sys);
  }
  initNodes = function(arraystuff,sys){
    var oldNode
    sys.eachNode(function(node, pt){

      if(node){
        if(!node.data.unkillable){
           sys.pruneNode(node)
         } else {
           oldNode = node
           oldNode.data.root = false
           oldNode.data.oldRoot=true
         }
       }
    })    		
    var myobj = JSON.parse(arraystuff)


    // add some nodes to the graph and watch it go...
    sys.addNode(myobj.title,{mass:50,fixed:true, text:myobj.title,expanded:false,root:true,sections:myobj.sections,unkillable:true})
    if(oldNode){
      sys.addEdge(oldNode,myobj.title)
    }
    //drawNodes(myobj,sys)
    expandOnce(sys.getNode(myobj.title),sys)
    // or, equivalently:
    //
    // sys.graft({
    //   nodes:{
    //     f:{alone:true, mass:.25}
    //   }, 
    //   edges:{
    //     a:{ b:{},
    //         c:{},
    //         d:{},
    //         e:{}
    //     }
    //   }
    // })
    
  }

})(this.jQuery)
