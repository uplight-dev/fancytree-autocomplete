$(function(){
  $("#tree").fancytree({
      extensions: ["edit", "autocomplete"]
      checkbox: true,
      source: [
          {title: "Node 1"},
          {title: "Node 2", key: "id2"},
          {title: "Folder 3", folder: true, children: [
              {title: "Node 3.1"},
              {title: "Node 3.2"}
          ]},
          {title: "Folder 2", folder: true}
      ],
      activate: function(event, data){
          $("#status").text("Activate: " + data.node);
      }
  });
  
  // Activate a node, on button click
  $("#button1").click(function(){
      var tree = $("#tree").fancytree("getTree"),
          node2 = tree.getNodeByKey("id2");
      node2.toggleSelected();
  });
  $("#version").text("Fancytree " + $.ui.fancytree.version
      + " / jQuery " + $.fn.jquery);
});

