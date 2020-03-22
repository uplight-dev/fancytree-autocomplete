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

	$.ui.fancytree._FancytreeNodeClass.prototype.editStart = function() {
		this._superApply(arguments);

		var localEdit = this.tree.ext.edit,
		  	input = localEdit.eventData.input;

		
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

		_getAtcInput: function() {
			var extOpts = this._local._extOpts();
			return extOpts.atcInput;
		},

		_setAtcInput: function(atcInput) {
			var extOpts = this._local._extOpts();
			extOpts.atcInput = atcInput;
		},

		_extOpts: function() {
			return this.tree.ext.autocomplete;
		},

		// Default options for this extension.
		options: {
			edit: {
				close: (e, data) => {
					var atcInput = this._local._getAtcInput();
					atcInput && $(atcInput).off('keydown');
					this._local._setAtcInput(null);
				},
				edit: (e,data) => {
					data.input && data.input.length == 1 &&
							(ed = data.input) && ed.on('keydown', (e) => {
								if (e.ctrlKey && e.keyCode == 32) {//Space
									setAtcInput(ed.get(0));
								}
							});
				}
			}
		},

		treeInit: function(ctx) {
			// gridnav requires the edit extension to be loaded before itself
			this._requireExtension("edit", true, true);
			this._superApply(arguments);
		}
	});
	// Value returned by `require('jquery.fancytree..')`
	return $.ui.fancytree;
}); // End of closure
