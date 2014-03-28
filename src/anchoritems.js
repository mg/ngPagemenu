	mod.directive('ngAnchoritems', function($window) {
		var linkfn = function(scope, elem, attrs) {
			if (!angular.isDefined(scope.selector)) {
				console.log('mvp:AnchorItems: no selector defined');
				return;
			}
			scope.spyElems = elem[0].getElementsByClassName(scope.selector);

			scope.spies = {};
			state.store({
				topMargin: function() {
					return scope.topmargin |  0;
				},
				addSpy: function(spyObj) {
					scope.spies[spyObj.id] = spyObj;
				},
				items: function() {
					return scope.spyElems;
				}
			});

			var spyElems = scope.spyElems;
			var topmargin = scope.topmargin | 0;
			scope.spies[scope.spyElems[0].id].set();
			angular.element($window).on('scroll', function() {
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

				if (highlightSpy === null) {
					highlightSpy = spies[spies.length - 1];
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