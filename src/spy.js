	mod.directive('ngAnchormenuSpy', function($location, $anchorScroll) {
		return {
			restrict: "A",
			link: function(scope, elem, attrs) {
				state.addSpy({
					id: attrs.mvpAnchormenuSpy,
					set: function() {
						elem.addClass('active');
					},
					clear: function() {
						elem.removeClass('active');
					}
				});
			}
		};
	});