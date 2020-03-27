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
		{ value: 'House.', type: '0' },
		{ value: 'House.rooms', type: '99' },
		{ value: 'House.price', type: '99' },
		{ value: 'AWS.', type: '1' },
		{ value: 'AWS.Product.', type: '2' },
		{ value: 'AWS.Product.price', type: '99' },
		{ value: 'AWS.Product.weight', type: '99' },
		{ value: 'AWS.Product.delivery.', type: '3' },
		{ value: 'AWS.Product.delivery.days', type: '99' },
		{ value: 'AWS.Product.delivery.price', type: '99' }
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
	$.ui.fancytree._FancytreeNodeClass.prototype.autocomplete = function() {
		const ATC = _getATC(this.tree);
		const _this = this;

		ATC.active = true;

		var tagify = new Tagify(ATC.input, {
			whitelist: data,
			enforceWhitelist: false,
			maxTags: 10,
			mode: 'mix',
			pattern: /@|#/,
			autocomplete: {
				rightKey: true
			},
			dropdown: {
				maxItems: 10,           // <- mixumum allowed rendered suggestions
				classname: "tags-look", // <- custom classname for this dropdown, so it could be targeted
				enabled: 0,             // <- show suggestions on focus
				closeOnSelect: false,    // <- do not hide the suggestions dropdown once an item has been selected
				position: 'text',
				highlightFirst: true,
				fuzzySearch: true
			},
			templates: {
				tag(value, tagData){
					return `<tag title='${tagData.value || value}'
							  contenteditable='false'
							  spellcheck='false'
							  tabIndex="-1"
							  class='tagify__tag ${tagData.class ? tagData.class : ""}'
							  ${this.getAttributes(tagData)}>
						<x title='' class='tagify__tag__removeBtn' role='button' aria-label='remove tag'></x>
						<div>
							<span class='tagify__tag-text'>${value}</span>
						</div>
					</tag>`
				}
			}
			// 	dropdownItem: function(tagData) {

			// 	}
			// }
		}).on('blur', e => {
			ATC.active = false;
			if (ATC.atc) {
				//ATC.atc.destroy();
				//ATC.atc = null;
			}
		});
		
		ATC.atc = tagify;
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
			ATC.input = input;

			$(input).on('keydown', (e) => {
					if (e.ctrlKey && e.keyCode == 32) {//Space
						_this.autocomplete();
					}
			});

			return ret;
		}
	);

	$.ui.fancytree._FancytreeNodeClass.prototype.editEnd = _fnExt(
		$.ui.fancytree._FancytreeNodeClass.prototype.editEnd,
		function(applyChanges, _event) {
			const ATC = _getATC(this.tree);

			ATC.input && $(ATC.input).off('keydown');
			/*if (ATC.atc) {
				ATC.input && $(ATC.input).off('keydown');
				ATC.atc.destroy();
				ATC.atc = null;
			}*/
			//return this._superFn.apply(this, arguments);
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
