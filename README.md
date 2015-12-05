#ngPagemenu

##ATTENTION: This is AbandonWare. The author (me) has stopped using AngularJS in both private life and work life. If you are interested in maintain this and develop it further, contact me and I will link to your repo.

###What is it?
A feature focused implementation of Bootstrap's [ScrollSpy](http://getbootstrap.com/javascript/#scrollspy) functionality.

###Feature focused?
Yes. There are various versions of ScrollSpys available, in the example linked we have a menu version and in Bootstrap's documentation we have a side menu. This version is focused on implementing the side menu version with some dynamic properties. This is inicdently why I choose to call it ngPagemenu and not ngScrollSpy. If someone wants to implement the more generic version the name is available.

###Dynamic properties?
The idea is to generate the menu dynamicly from the DOM according to certain selection rules.

###How does it work?
The module provides two directives, *pageitems* attribute and *<pagemenu>* tag. The *pageitems* tag will parse the included HTML and query for items with a certain class. The menu will then be generated in the DOM where you put the *<pagemenu>* tag from that list of items. 

###How do I use it?
Install with bower:

    bower install ngPagemenu --save

Add a &lt;script&gt; to your index.html:

    <script src="/bower_components/ngPaemenu/dist/ngPagemenu.js"></script>

And add ngPagemeu as a dependency for your app:

    angular.module('myApp', ['ngPagemenu']);

###Any customization?
The *pageitems* attribute accepts two parameters, *selector* and *topmargin*. The *selector* specifies the class used to query the DOM for menu items. The *topmargin* specifies a scrolling offset that is useful if you contain a static header and don't want your items to be under that static header when you click on the menu to scroll to them.

###The pageitems thing generates a list but the pagemenu can be a tree. How does that work?
The list is mapped to a tree using the following heuristic. A type is generated for the item based on the tag name and classes. The type is compared to the previous item's type. If they are equal this new item is a sibling of the previous item. Otherwise we traverse a stack of parents. If a matching type is found the stack is popped to that level and the new item becomes a sibling at that level. If no parent is found the stack is pushed and the new item becomes a child of the last item.

For a more visual demonstration, consider the following list of items:

    <h2 id="1" class="item">Item 1</h2>
    <h2 id="2" class="item">Item 2</h2>
    <h3 id="3" class="item">Item 3</h3>
    <h4 id="4" class="item">Item 4</h4>
    <h4 id="5" class="item">Item 5</h4>
    <h2 id="6" class="item">Item 6</h2>
    <h2 id="7" class="item subitem">Item 7</h2>

This will be mapped to the following tree:

    Item 1
    Item 2
        Item 3
            Item 4
            Item 5
    Item 6
        Item 7

###Dependencies?
Only AngularJS. This does not in any way depend on jQuery, Bootstrap's js or css, or AngularUI.

###Example?
The *demo* directory contains *demo.html*. Clone the repo and open that in a browser to see a fully working example.

###Credits?
Aside for the Bootstrap people for the obvious inspiration, this code was inspired by Evil Closet Monkey's answere to a question on [StackExchange](http://stackoverflow.com/questions/17470370/how-to-implement-a-scrollspy-in-angular-js-the-right-way).

###And you are?
Magnús Örn Gylfason, a web programmer working in the banking industry in Iceland. You can contact me at

+ Twitter: [@mgns74](https://www.twitter.com/mgns74)
+ Google+: [Magnús Örn Gylfason](https://plus.google.com/u/0/+MagnúsÖrnGylfason/posts)

###Is it done?
Yes! Obviously if you find some devilish bug, create an issue or contact me. But as far as features goes, this is finished.

###Licence
The MIT License (MIT)

Copyright (c) 2014 Magnús Örn Gylfason

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
