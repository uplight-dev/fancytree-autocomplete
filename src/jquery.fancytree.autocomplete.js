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
		return function() {
			this._superFn = baseFn;
			return fn.apply(this, arguments);
		}
	}

	$.ui.fancytree._FancytreeNodeClass.prototype.editStart = _fnExt(
		$.ui.fancytree._FancytreeNodeClass.prototype.editStart,
		function() {
			var ret = this._superFn.apply(this, arguments);

			const ATC = _getATC(this.tree);
			const localEdit = this.tree.ext.edit;
			var evData = localEdit.eventData,
				input = evData.input.get(0),
				_this = this;

			ATC.active = false;

			$(input).on('keydown', (e) => {
					if (e.ctrlKey && e.keyCode == 32) {//Space
						ATC.input = input;
						ATC.active = true;
						ATC.atc = autocomplete({
							minLength: 0,
							showOnFocus: false,
							preventSubmit: true,
							input: input,
							fetch: function(text, update) {
								text = text.toLowerCase();
								// you can also use AJAX requests instead of preloaded data
								var suggestions = data.filter(n => n.label.toLowerCase().indexOf(text) >= 0)
								update(suggestions);
							},
							render: function(item, v) {
								return $('<div><img src="https://addons.thunderbird.net/user-media/addon_icons/327/327423-64.png"></img>'+item.label+'</div>').get(0)
							},
							onSelect: function(item) {
								ATC.input.value = item.label;
							},
							onClose: function() {
								ATC.active = false;
								ATC.atc.destroy();
								ATC.atc = null;
							}
						});
					}
			});

			return ret;
		}
	);

	$.ui.fancytree._FancytreeNodeClass.prototype.editEnd = _fnExt(
		$.ui.fancytree._FancytreeNodeClass.prototype.editEnd,
		function(applyChanges, _event) {
			const ATC = _getATC(this.tree);

			if (!ATC.active) {
				if (ATC.atc) {
					ATC.input && $(ATC.input).off('keydown');
				}
				return this._superFn.apply(this, arguments);
			}
		}
	);
	
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
