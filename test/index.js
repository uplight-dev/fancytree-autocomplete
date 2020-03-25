$(function(){
  $("#tree").fancytree({
      extensions: ["edit", "autocomplete", "wide"],
      checkbox: true,
      source: [
          {title: "House"},
          {title: "AWS", key: "id2"},
          {title: "Lorem", folder: true, children: [
              {title: "Neque porro"},
              {title: "quisquam est qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit"},
              {title: "qui dolorem"},
              {title: "ipsum quia"},
              {title: "dolor sit amet, consectetur, adipisci velit"}
          ]}
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

