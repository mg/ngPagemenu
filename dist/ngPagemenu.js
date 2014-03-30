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
			var stack = [];
			var parentstack= [];
			var lastitem;
			var itemConstruct = function(data) {
				var item = {
					link: data.id,
					text: data.innerText,
					parent: ''
				};
				var level = data.tagName;
				for (var i = 0; i < data.classList.length; i++) {
					level += ',' + data.classList[i];
				}
				var stacksize = stack.length;
				if (stacksize === 0) {
					stack.push(level);
				} else if (level !== stack[stacksize - 1]) {
					for (var j = stacksize - 1; j >= 0; j--) {
						if (level == stack[j]) {
							break;
						}
					}
					if (j < 0) {
						stack.push(level);
						item.push = true;
						parentstack.push(lastitem);
					} else {
						item.pop = stacksize - 1 - j;
						while (stack.length > j + 1) {
							stack.pop();
							parentstack.pop();
						}
					}
				}
				if(parentstack.length > 0) {
					item.parent= parentstack[parentstack.length-1];
				}
				lastitem= item.link;
				return item;
			};

			var items = getState().items();
			var markup = '';
			for (var i = 0; i < items.length; i++) {
				var item = itemConstruct(items[i]);
				if (item.push) {
					markup += '<ul class="nav">';
				} else if (item.pop) {
					for (var j = 0; j < item.pop; j++) {
						markup += '</li></ul>';
					}
				} else if (i !== 0) {
					markup += '</li>';
				}
				markup += '<li pagemenuspy="' + item.link + '" parent="' + item.parent + '">';
				markup += '<a href="#' + item.link + '">';
				markup += item.text;
				markup += '</a>';
			}
			markup += '</li>';
			element.append($compile(markup)(scope));

			element.on('click', function(e) {
				var hash = e.target.hash.substring(1);
				$location.hash(hash);
				$anchorScroll();
				setTimeout(function() {
					window.scrollTo(window.pageXOffset, window.pageYOffset - getState().topMargin());
				}, 0);
			});
		};

		return {
			restrict: 'E',
			replace: true,
			template: '<ul class="nav pagemenu"></ul>',
			link: function(scope, element) {
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
					id: attrs.pagemenuspy,
					parent: attrs.parent,
					set: function() {
						elem.addClass('active');
						var parent= getState().getSpy(this.parent);
						if(parent) parent.set();
					},
					clear: function() {
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
			scope.spyElems = elem[0].getElementsByClassName(scope.selector);
			scope.spies = {};
			getState().onRun= function() {
				scope.spies[scope.spyElems[0].id].set();
			};
			getState().store({
				topMargin: function() {
					return scope.topmargin |  0;
				},
				addSpy: function(spyObj) {
					scope.spies[spyObj.id] = spyObj;
				},
				getSpy: function(id) {
					return scope.spies[id];
				},
				items: function() {
					return scope.spyElems;
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