/*!
 * jquery.fancytree.autocomplete.js
 *
 * Having xxx.edit extension enabled. When a node is edited, allow user to press ctrl+space to autocomplete this node's value.
 * (Extension module for jquery.fancytree.js: https://github.com/mar10/fancytree/)
 *
 * Copyright (c) 2008-2019, Martin Wendt (https://wwWendt.de)
 *
 * Released under the MIT license
 * https://github.com/mar10/fancytree/wiki/LicenseInfo
 *
 * @version 1.0.0
 * @date 2020-03-20T23:24:00Z
 */

(function(factory) {
	if (typeof define === "function" && define.amd) {
		// AMD. Register as an anonymous module.
		define([
			"jquery",
			"./jquery.fancytree",
			"./jquery.fancytree.edit",
			"./accessible-autocomplete"
		], factory);
	} else if (typeof module === "object" && module.exports) {
		// Node/CommonJS
		require("./jquery.fancytree");
		require("./jquery.fancytree.edit");
		require("./accessible-autocomplete");
		module.exports = factory(require("jquery"));
	} else {
		// Browser globals
		factory(jQuery);
	}
})(function($) {
	"use strict";

	const editStartSuper = $.ui.fancytree._FancytreeNodeClass.prototype.editStart;
	const editEndSuper = $.ui.fancytree._FancytreeNodeClass.prototype.editEnd;

	$.ui.fancytree.AutoComplete = {};

	const countries = [
        'France',
        'Germany',
        'United Kingdom'
      ]

	$.ui.fancytree._FancytreeNodeClass.prototype.editStart = function() {
		editStartSuper.apply(this, arguments);

		var localEdit = this.tree.ext.edit,
			local = this.tree.ext.autocomplete,
			evData = localEdit.eventData,
			input = evData.input,
			_this = this;

		input && input.length == 1 &&
			  input.on('keydown', (e) => {
				  if (e.ctrlKey && e.keyCode == 32) {//Space
					  local.atcInput = input;

					  const ATC = $.ui.fancytree.AutoComplete;
					  var atc = ATC.atc;
					  if (atc == null) {
						var atcParent = $("<div></div>")
							.css('background-color', 'yellow')
							.css('border', "1px solid black")
							.css('position', 'absolute');

						$(document.body).append(atcParent);

						atc = completely(atcParent.get(0), {
							input: input.get(0),
							promptInnerHTML : '&gt;&gt;&gt;', 
							fontSize: '14px',
							fontFamily:'monospace'
						});
						atcParent.position({
							my: "left top",
							at: "left top",
							//each tree node has a Span element
							of: $(_this.span)
						});
						atc.options = ["Appartment", "Appartment.rooms", "Appartment.price"];
						atc.onEnter = () => {
							editEndSuper.bind(_this)(true, evData);
						};
						atc.onTab = () => {
							editEndSuper.bind(_this)(true, evData);
						};

						ATC.atcParent = atcParent;
						ATC.atc = atc;
					  }
					 
					  setTimeout(() => {
						ATC.atcParent.position({
							my: "left top",
							at: "left top",
							//each tree node has a Span element
							of: $(_this.span)
						});
						atc.repaint();
						atc.input.focus();
						atc.input.selectionStart = atc.input.selectionEnd = atc.input.value.length;
					  }, 100);
				  }
			  });
	}

	$.ui.fancytree._FancytreeNodeClass.prototype.editEnd = function(applyChanges, _event) {
		editEndSuper.apply(this, arguments);

		var local = this.tree.ext.autocomplete;
		var ATC = $.ui.fancytree.AutoComplete;

		var atcInput = ATC.atcInput;
		atcInput && $(atcInput).off('keydown');

		if (ATC.atc != null) {
			$(ATC.atc.wrapper).remove();
			ATC.atc = null;
		}
	}
	
	/*******************************************************************************
	 * Private functions and variables
	 */

	/*******************************************************************************
	 * Extension code
	 */
	$.ui.fancytree.registerExtension({
		name: "autocomplete",
		version: "1.0.0",

		// Vars
		atcInput: null, //Autocomplete input
		treeInit: function(ctx) {
			// gridnav requires the edit extension to be loaded before itself
			this._requireExtension("edit", true, true);
			this._superApply(arguments);
		}
	});
	// Value returned by `require('jquery.fancytree..')`
	return $.ui.fancytree;
}); // End of closure
