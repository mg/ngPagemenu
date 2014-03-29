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