	mod.directive('ngAnchormenu', function($compile, $location, $anchorScroll) {
		var postlinkfn = function(scope, element) {
			scope.padding |= 10;
			var stack = [];
			var itemConstruct = function(data) {
				var item = {
					link: data.id,
					text: data.innerText
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
					} else {
						item.pop = stacksize - 1 - j;
						while (stack.length > j + 1) {
							stack.pop();
						}
					}
				}
				item.padding = (stack.length - 1) * scope.padding;
				return item;
			};

			var items = state.items();
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
				markup += '<li mvp-anchormenu-spy="' + item.link + '">';
				markup += '<a style="padding-left: ' + item.padding + 'px" href="#' + item.link + '">';
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
					window.scrollTo(window.pageXOffset, window.pageYOffset - state.topMargin());
				}, 0);
			});
		};

		return {
			restrict: 'E',
			replace: true,
			scope: {
				padding: '@'
			},
			template: '<ul class="nav anchormenu"></ul>',
			link: function(scope, element) {
				state.setBuilder(function() {
					postlinkfn(scope, element);
				});
			}
		};
	});