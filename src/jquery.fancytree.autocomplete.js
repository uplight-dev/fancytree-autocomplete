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
		], factory);
	} else if (typeof module === "object" && module.exports) {
		// Node/CommonJS
		require("./jquery.fancytree");
		module.exports = factory(require("jquery"));
	} else {
		// Browser globals
		factory(jQuery);
	}
})(function($) {
	"use strict";

	const data = [
		{ label: 'House', value: 'HS' },
		{ label: 'House.rooms', value: 'HSR' },
		{ label: 'House.price', value: 'HSP' }
	];

	function _getATC(tree) {
		return tree.ext.autocomplete;
	}

	function _fnExt(baseFn, fn) {
		this._superFn = baseFn;
		return function() {
			return fn.apply(arguments);
		}
	}

	var FN = $.ui.fancytree._FancytreeNodeClass.prototype.editStart = _fnExt(
		FN,
		function() {
		FN._superFn.apply(this, arguments);

		const ATC = _getATC(this.tree);
		var evData = localEdit.eventData,
			input = evData.input.get(0),
			_this = this;

		 $(input).on('keydown', (e) => {
				  if (e.ctrlKey && e.keyCode == 32) {//Space
					  if (ATC.atc == null) {
						var atcParent = $("<div></div>")
							.css('background-color', 'yellow')
							.css('border', "1px solid black")
							.css('position', 'absolute');

						$(document.body).append(atcParent);

						ATC.atc = autocomplete({
							input: input,
							fetch: function(text, update) {
								text = text.toLowerCase();
								// you can also use AJAX requests instead of preloaded data
								var suggestions = data.filter(n => n.label.toLowerCase().indexOf(text) >= 0)
								update(suggestions);
							},
							onSelect: function(item) {
								atc.value = item.label;
							}
						});

						ATC.atcInput = input;
						ATC.atcParent = atcParent;
						ATC.atc = atc;
					  }					 
				  }
			  });
	});

	$.ui.fancytree._FancytreeNodeClass.prototype.editEnd = function(applyChanges, _event) {
		const ATC = _getATC(this.tree);

		ATC.editEndSuper.apply(this, arguments);
		
		ATC.atcInput && $(ATC.atcInput).off('keydown');
		if (ATC.value != null) {
			ATC.atcInput.value = ATC.value;
			ATC.value = null;
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

		treeInit: function(ctx) {
			const ATC = _getATC(ctx.tree);

			this._requireExtension("edit", true, true);
			this._superApply(arguments);
		}
	});

	return $.ui.fancytree;
});
