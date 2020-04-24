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

	function _getAnnotatorNS(tree) {
		return tree.ext.annotator;
	}

	function _fnExt(baseFn, fn) {
		return function() {
			this._superFn = baseFn;
			return fn.apply(this, arguments);
		}
	}

	$.ui.fancytree._FancytreeNodeClass.prototype.annotate = function() {
		const annotatorNS = _getAnnotatorNS(this.tree);
		const _this = this;
		const node = this;
		const $title = $(".fancytree-title", node.span);
		var app = new annotator.App();

		app.include(annotator.ui.main, {
			element: $title[0],
			viewerExtensions: [
				annotator.ui.markdown.viewerExtension,
				annotator.ui.tags.viewerExtension
			]
		});
	
		app.start();

		annotatorNS.app = app;
	}
	
	/*******************************************************************************
	 * Private functions and variables
	 */

	/*******************************************************************************
	 * Extension code
	 */
	$.ui.fancytree.registerExtension({
		name: "annotator",
		version: "1.0.0",

		treeInit: function(ctx) {
			this._superApply(arguments);
		},

		nodeKeydown: function(ctx) {
			switch (ctx.originalEvent.which) {
				case 190: // [.]
					ctx.node.annotate();
					return false;
			}
			return this._superApply(arguments);
		},
	});

	return $.ui.fancytree;
});
