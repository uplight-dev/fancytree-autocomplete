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
		{ label: 'House.', value: '0' },
		{ label: 'House.rooms', value: '99' },
		{ label: 'House.price', value: '99' },
		{ label: 'AWS.', value: '1' },
		{ label: 'AWS.Product.', value: '2' },
		{ label: 'AWS.Product.price', value: '99' },
		{ label: 'AWS.Product.weight', value: '99' },
		{ label: 'AWS.Product.delivery.', value: '3' },
		{ label: 'AWS.Product.delivery.days', value: '99' },
		{ label: 'AWS.Product.delivery.price', value: '99' }
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
		ATC.atc = autocomplete({
			minLength: 0,
			showOnFocus: false,
			preventSubmit: true,
			input: ATC.input,
			fetch: function(text, update) {
				text = text.toLowerCase();
				
				// you can also use AJAX requests instead of preloaded data
				var idx;
				var suggestions = data.filter(n =>
						n.label.length > text.length &&
						(idx = n.label.toLowerCase().indexOf(text.toLowerCase()), 
							//
							(idx > 0) ||
							//
							(idx == 0 &&
							((idx = n.label.substring(text.length).indexOf("."), idx+1 && (idx += text.length),  
								idx == -1 || 
							(idx == n.label.length - 1)))
							)
						));
				update(suggestions);
			},
			render: function(item, v) {
				const im = {
					99: "https://www.wikipreneurs.be/uploads/img/tools/1529589473_Outils%2002.png",
					0:"https://png.pngtree.com/png-clipart/20200225/original/pngtree-house-vector-illustration-isolated-on-white-background-house-cartoon-house-clip-png-image_5261981.jpg",
					1:"https://addons.thunderbird.net/user-media/addon_icons/327/327423-64.png",
					2:"https://image.shutterstock.com/image-vector/open-flat-box-260nw-657694141.jpg",
					3:"https://png.pngtree.com/png-clipart/20200225/original/pngtree-clipart-of-the-large-goods-vehicle-truck-semi-tractor-trailers-png-image_5268760.jpg"
				};
				return $('<div><img style="height:48px" src="'+im[parseInt(item.value)]+'"></img>'+item.label+'</div>').get(0)
			},
			onSelect: function(item, input, isTab) {
				ATC.input.value = item.label;
				isTab && ATC.atc.startFetch();
			},
			onClose: function() {
				ATC.active = false;
				if (ATC.atc) {
					ATC.atc.destroy();
					ATC.atc = null;
				}
			}
		});
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
