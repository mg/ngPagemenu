/*
Copyright (c) 2014 Magnús Örn Gylfason
Licence: MIT
*/
;(function(angular) {
	'use strict';

	var mod= angular.module('ngPagemenu', []);

	var state = {
		onRun: null,
		state: null,
		store: function(s) {
			for (var k in s) {
				this[k] = s[k];
			}
			this.state = true;
			this.run();
		},
		builder: null,
		setBuilder: function(builder) {
			this.builder = builder;
			this.run();
		},
		run: function() {
			if (this.builder && this.state) {
				this.builder();
				this.builder= null;
				this.state= null;
				if(this.onRun) {
					this.onRun();
					this.onRun= null;
				}
			}
		}
	};
	mod.directive('pagemenu', function($compile, $location, $anchorScroll) {
		var postlinkfn = function(scope, element) {
			var stack = []; // stack to build tree
			var parentstack= []; // current ancestry
			var lastitem; // used to build the tree

			var itemConstruct = function(data) {
				// parse basic info from the dom item
				var item = {
					link: data.id,
					text: data.innerText,
					parent: ''
				};

				// build type identifier
				var level = data.tagName;
				for (var i = 0; i < data.classList.length; i++) {
					level += ',' + data.classList[i];
				}

				// here be dragons
				var stacksize = stack.length;
				if (stacksize === 0) {
					// we are at the top level and will stay there
					stack.push(level);
				} else if (level !== stack[stacksize - 1]) {
					// traverse the ancestry, looking for a match
					for (var j = stacksize - 1; j >= 0; j--) {
						if (level == stack[j]) {
							break; // found an ancestor
						}
					}
					if (j < 0) {
						// this is a new submenu item, lets push the stack
						stack.push(level);
						item.push = true;
						parentstack.push(lastitem);
					} else {
						// we are either a sibling or higher up the tree,
						// lets pop the stack if needed
						item.pop = stacksize - 1 - j;
						while (stack.length > j + 1) {
							stack.pop();
							parentstack.pop();
						}
					}
				}

				// if we have a parent, lets record it
				if(parentstack.length > 0) {
					item.parent= parentstack[parentstack.length-1];
				}

				// for next iteration
				lastitem= item.link;
				return item;
			};

			// dom items to build menu from
			var items = getState().items();
			var markup = '';
			for (var i = 0; i < items.length; i++) {
				var item = itemConstruct(items[i]);
				if (item.push) {
					// new submenu
					markup += '<ul class="nav">';
				} else if (item.pop) {
					// closing submenu, maybe more than one
					for (var j = 0; j < item.pop; j++) {
						markup += '</li></ul>';
					}
				} else if (i !== 0) {
					// sibling
					markup += '</li>';
				}

				// basic markup
				markup += '<li pagemenuspy="' + item.link + '" parent="' + item.parent + '">';
				markup += '<a href="#' + item.link + '">';
				markup += item.text;
				markup += '</a>';
			}
			markup += '</li>';
			element.append($compile(markup)(scope));

			element.on('click', function(e) {
				// menu item clicked, lets scroll to the associated dom item
				var hash = e.target.hash.substring(1);
				$location.hash(hash);
				$anchorScroll();
				if(getState().topMargin() !== 0 ) {
					setTimeout(function() {
						// scroll the extra top margin
						window.scrollTo(
							window.pageXOffset,
							window.pageYOffset - getState().topMargin()
						);
					}, 0);
				}
			});
		};

		return {
			restrict: 'E',
			replace: true,
			template: '<ul class="nav pagemenu"></ul>',
			link: function(scope, element) {
				// We can't create menu if pageitems element hasn't traversed the dom.
				// For now we simply hook hour linking function. If pageitems has already
				// traversed the dom it will called right away, otherwise it will be called
				// once the dom has been traversed. This means we can include the menu in
				// the dom either before the items are queried, or after. There is no
				// positional dependency between the pageitems directive and the
				// pagemenu directive.
				getState().setBuilder(function() {
					postlinkfn(scope, element);
				});
			}
		};
	});
	mod.directive('pagemenuspy', function($location, $anchorScroll) {
		return {
			restrict: "A",
			link: function(scope, elem, attrs) {
				getState().addSpy({
					id: attrs.pagemenuspy, // my id
					parent: attrs.parent, // my parent spy
					set: function() {
						// higlight me and and parent if I have a parent
						elem.addClass('active');
						var parent= getState().getSpy(this.parent);
						if(parent) parent.set();
					},
					clear: function() {
						// clear my highight
						elem.removeClass('active');
					}
				});
			}
		};
	});
	mod.directive('pageitems', function($window, $document) {
		var linkfn = function(scope, elem, attrs) {
			if (!angular.isDefined(scope.selector)) {
				void 0;
				return;
			}
			scope.spyElems = elem[0].getElementsByClassName(scope.selector); // dom items
			scope.spies = {}; // menu items

			// this function will be called once dom is parsed and menu is created
			getState().onRun= function() {
				scope.spies[scope.spyElems[0].id].set(); // highlight first element
			};

			// Store my state that pagemenu will use to build the menu
			getState().store({
				topMargin: function() {
					return scope.topmargin |  0; // so that pagemenu can correctly offset scrolling
				},
				addSpy: function(spyObj) {
					scope.spies[spyObj.id] = spyObj; // each item in menu calls this function to register itself with pageitems
				},
				getSpy: function(id) {
					return scope.spies[id]; // return the spy associated with id
				},
				items: function() {
					return scope.spyElems; // return a list of dom items to be used to build menu
				}
			});

			var spyElems = scope.spyElems;
			var topmargin = scope.topmargin | 0;
			var w = angular.element($window);
			w.on('scroll', function() {
				var highlightSpy = null;
				var spies = scope.spies;

				// cycle through `spy` elements to find which to highlight
				for (var i = 0; i < spyElems.length; i++) {
					var spyElem = spyElems[i];
					var spy = spies[spyElem.id];
					spy.clear();

					if (spyElem.getBoundingClientRect().top === undefined) {
						continue;
					}

					var pos = spyElem.getBoundingClientRect().top;
					if (pos <= topmargin) {
						// the window has been scrolled past the top of a spy element
						spy.pos = pos;

						if (highlightSpy === null) {
							highlightSpy = spy;
						}
						if (highlightSpy.pos < spy.pos) {
							highlightSpy = spy;
						}
					} else if (highlightSpy === null) {
						highlightSpy = spy;
					}
				}

				// if we are at the bottom of the page, higlight last spy
				if (($window.innerHeight + $window.scrollY) >= $document[0].body.offsetHeight) {
					highlightSpy = spies[spyElems[spyElems.length-1].id];
				}

				highlightSpy.set();
			});
		};

		return {
			restrict: 'A',
			scope: {
				selector: '@',
				topmargin: '@'
			},
			link: linkfn
		};
	});

	function getState() { return state; }
})(angular);