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
	$.ui.fancytree.AutoComplete.autocomplete = null;

	const countries = [
        'France',
        'Germany',
        'United Kingdom'
      ]

	$.ui.fancytree._FancytreeNodeClass.prototype.editStart = function() {
		editStartSuper.call(this);

		var localEdit = this.tree.ext.edit,
			local = this.tree.ext.autocomplete,
			input = localEdit.eventData.input,
			_this = this;

		input && input.length == 1 &&
			  input.on('keydown', (e) => {
				  if (e.ctrlKey && e.keyCode == 32) {//Space
					  local.atcInput = input;

					  /*var atcParent = $.ui.fancytree.AutoComplete.atcParent;
					  if (atcParent == null) {
						atcParent = $("<div></div>")
							.css('background-color', 'yellow')
							.css('position', 'absolute')
							.position({
								my: "left top",
								at: "left bottom",
								//each tree node has a Span element
								of: $(_this.span)
							});
						$(document.body).append(atcParent);
						$.ui.fancytree.AutoComplete.atcParent = atcParent;
					  }*/
					  var atc = $( input ).autocomplete({
						autofocus: true,
						minLength: 0,
						source: [ "c++", "java", "php", "coldfusion", "javascript", "asp", "ruby" ]
					  });
					  atc.autocomplete("search", "ja");
				  }
			  });
	}

	$.ui.fancytree._FancytreeNodeClass.prototype.editEnd = function(applyChanges, _event) {
		editEndSuper.call(this, applyChanges, _event);

		var local = this.tree.ext.autocomplete;

		var atcInput = local.atcInput;
		atcInput && $(atcInput).off('keydown');
		$( input ).autocomplete("close");
		local.atcInput = null;
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
