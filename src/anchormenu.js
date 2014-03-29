	mod.directive('anchormenu', function($compile, $location, $anchorScroll) {
		var postlinkfn = function(scope, element) {
			scope.baseindent= scope.baseindent || "20";
			scope.baseindent= +scope.baseindent;
			scope.indent= scope.indent || "10";
			var number= '';
			var suffix= '';
			for(var i= 0; i < scope.indent.length; i++) {
				var c= scope.indent[i];
				if(isNaN(c)) suffix += c;
				else number += c;
			}
			if(suffix === '') suffix= 'px';
			scope.indent= +number;
			if(scope.direction != 'right') {
				scope.direction= 'left';
			}
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
				item.indent = scope.baseindent + (stack.length - 1) * scope.indent;
				lastitem= item.link;
				return item;
			};

			var items = state.items();
			var markup = '';
			for (i = 0; i < items.length; i++) {
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
				markup += '<li anchormenuspy="' + item.link + '" parent="' + item.parent + '">';
				markup += '<a style="padding-' + scope.direction + ': ' + item.indent + suffix + '" href="#' + item.link + '">';
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
				baseindent: '@',
				indent: '@',
				direction: '@'
			},
			template: '<ul class="nav anchormenu"></ul>',
			link: function(scope, element) {
				state.setBuilder(function() {
					postlinkfn(scope, element);
				});
			}
		};
	});