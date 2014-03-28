	mod.directive('anchormenuspy', function($location, $anchorScroll) {
		return {
			restrict: "A",
			link: function(scope, elem, attrs) {
				state.addSpy({
					id: attrs.anchormenuspy,
					parent: attrs.parent,
					set: function() {
						elem.addClass('active');
						var parent= state.getSpy(this.parent);
						if(parent) parent.set();
					},
					clear: function() {
						elem.removeClass('active');
					}
				});
			}
		};
	});