	mod.directive('anchormenuspy', function($location, $anchorScroll) {
		return {
			restrict: "A",
			link: function(scope, elem, attrs) {
				state.addSpy({
					id: attrs.anchormenuspy,
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