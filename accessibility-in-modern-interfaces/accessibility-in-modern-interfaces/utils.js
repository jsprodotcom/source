/*******************************************************************************
 general utility functions
 ------------------------------------------------------------------------------
*******************************************************************************/
var utils = (function(){


	//-- private utilities object --//
	return {
		
		//shortcut function for testing whether something exists
		//with a secondary control value test
		defined : function(testvalue, controlvalue)
		{
			if(typeof testvalue == 'undefined')
			{
				return false;
			}
			if(typeof controlvalue == 'undefined')
			{
				return true;
			}
			return testvalue !== controlvalue;
		},
	
		//general type-testing functions, return true or false 
		//by whether the specified data is the particular type;
		//beginning with simple function, boolean, string and number (int or float) tests
		is_function : function(data)	{ return typeof data == 'function'; },
		is_boolean : function(data)		{ return typeof data == 'boolean'; },
		is_string : function(data)		{ return typeof data == 'string'; },
		is_number : function(data)		{ return typeof data == 'number'; },
	
		//create an integer-specific test as well, which we can use literally 
		//to detect an int, or in combination to detect a float, ie. (is_number(n) && !is_integer(n))
		is_integer : function(data)		{ return parseInt(data, 10) === data; },
	
		//arrays and objects share a literal data-type, so these tests discriminate:
		//is_array returns true for an array, but not for an object-literal;
		//is_object returns true for an object-literal, but not for array  
		//(or for null, which is also an object-type datum)
		is_array : function(data)		{ return (data instanceof Array); },
		is_object : function(data)		
		{ 
			return typeof data == 'object' && data !== null && (!(data instanceof Array)); 
		},


		//shortcut abstraction for iterating:
		//	=> for the number of iterations specified by an integer [0 to (n-1)];
		//	=> through the members of an array or nodelist
		//	   or the individual characters of a string;
		//	=> through the enumerable members of an object;
		//calling oninstance on each iteration, and breaking if it returns  
		forevery : function(data, oninstance)
		{
			if(typeof data == 'number')
			{
				for(var n=parseInt(data, 10), i=0; i<n; i++)
				{
					if(this.defined(oninstance(i, n))) { break; }
				}
			}
			else if(this.defined(data.length))
			{
				for(var l=data.length, i=0; i<l; i++)
				{
					if(this.defined(oninstance(i, data[i], l))) { break; }
				}
			}
			else
			{
				for(var i in data)
				{
					if(data.hasOwnProperty(i) || data.propertyIsEnumerable(i))
					{
						if(this.defined(oninstance(i, data[i]))) { break; }
					}
				}
			}
		},
	

		//shortcut abstraction for counting:
		// => the number of members in an array or nodelist, 
		//    or the characters in a string;
		// => the number of enumerable members in an object
		count : function(data)
		{
			var n;
			if(!this.defined((n = data.length)))
			{
				n = 0;
				this.forevery(data, function(i) { n ++; }); 
			}
			return n;
		},

		//return whether a variable is empty, which is essentially just an abstraction 
		//for its count() returning zero, but with an advance test for undefined or null
		//nb. this method is not designed for numbers or booleans, as it would return 
		//confusing values, so for safety it will always return false for those data types
		empty : function(data)
		{
			if(this.is_number(data) || this.is_boolean(data))	{ return false; }
			else if(!this.defined(data, null))					{ return true; }
			else												{ return this.count(data) <= 0; }
		},


		//get a single element identified with an ID-selector;
		//or a static array of elements identified by one or more tag-names, 
		//optionally within a particular context and/or filtered by attribute-match conditions
		get : function(find, context, conditions)
		{
			//if the find argument is an ID selector 
			//just return the element with that ID (or null if it doesn't exist) 
			if((find = this.trim(find)).indexOf('#') >= 0)
			{
				return document.getElementById(find.substr(1));
			}
			else
			{
				//create a reference to this for the inner functions, 
				//and define an empty array for the collection we're going to build
				//then set the context to document if a context is not defined
				var 
				utils = this, 
				collection = []; 
				if(!this.defined(context, null))
				{
					context = document;
				}
				
				//split the tag by commas (including any surrounding whitespace)
				//then get the collection of elements for each tag
				//concatting each collection onto the master collection array
				this.forevery(find.split(/\s*,\s*/g), function(i, tag)
				{
					collection = collection.concat(utils.arrayifize(context.getElementsByTagName(tag.toLowerCase())));
				});
				
				//then if there are no conditions specified, 
				//just return the whole collection and we're done
				if(!this.defined(conditions))
				{
					return collection;
				}
				
				//otherwise create a filtered array, initially empty, 
				//then run through the collection and add each item that 
				//passes all the conditions to the filtered array; then return it
				//nb. the conditions argument is an object of attr-name/attr-value matches
				//=> each value is compiled into a regex and tested as a boundaried sub-string 
				//   so you can pass any value that would make sense as a regex, eg. "(foo|bar)"
				//=> you can also define negative conditions by adding "!" at the start of the key
				//   eg. { "!class" : "(foo|bar)" } would match elements that DON'T have either of those classes
				//=> *** if you want to match an entire string rather than a substring, 
				//   *** you can use regex start/end markers in the value, eg. "^(foo)$"
				//=> if the conditions object contains multiple conditions, all of them must be met
				var filtered = [];
				this.forevery(collection, function(i, node)
				{
					var add = true;
					utils.forevery(conditions, function(key, value)
					{
						var unmatch = false;
						if(key.charAt(0) == '!')
						{
							unmatch = true;
							key = key.substr(1);
						}
						switch(key)
						{
							case 'class' : 
								var attr = node.className;
								break;
							case 'for' : 
								attr = node.htmlFor;
								break;
							default :
								attr = node.getAttribute(key);
						}
						if(utils.empty(attr) || new RegExp('\\b(' + value + ')\\b', '').test(attr) === unmatch)
						{
							add = false;
						}
					});
					if(add === true)
					{
						filtered.push(node);
					}
				});
				return filtered;
			}
		},
	
		//convert a DOM nodelist to an array
		arrayifize : function(nodelist)
		{
			var ary = [];
			this.forevery(nodelist, function(i, node)
			{
				ary[i] = node;
			});
			return ary;
		},
		
	
		//convert line-breaks to spaces, minimize contiguous tabs and spaces
		//to a single space, and trim all leading and trailing whitespace
		//nb. for safety, if it's not a string just return it straight back
		flatten : function(str)
		{
			if(!this.is_string(str)) 
			{ 
				return str; 
			}
			return this.trim(str.replace(/[\r\n]*\s*[\r\n]+/g, ' ').replace(/[ \t]+/g, ' '));
		},
	
		//trim leading and trailing whitespace from a string
		//nb. for safety, if it's not a string just return it straight back
		trim : function(str)
		{
			if(!this.is_string(str)) 
			{ 
				return str; 
			}
			return str.replace(/^\s+|\s+$/g, '');
		},
		
	
		//add an encapsulated event-listener and control its native action
		//with a callback that automatically includes a target node reference
		listen : function(context, type, handler)
		{
			//we''ll need a reference to this for inner scopes, and although
			//the utils reference won't be available when the object is building
			//we can still use the same name since it will be private here 
			var utils = this;
			
			//branch for addEventListener support [all browsers except IE]
			if(this.defined(context.addEventListener))
			{
				//bind the listener and save the handler wrapper reference
				context.addEventListener(type, handler.__wrapper = function(e)
				{
					//call the handler and save what it returns
					//then if it returns strictly false, block default and return false, 
					//otherwise if it returns anything at all, return that
					//(therefore if it doesn't return, this doesn't either)
					if(utils.defined(handler.__result = handler(e, utils.getTarget(e))))
					{
						if(handler.__result === false)
						{
							try { e.preventDefault(); } catch(ex){}
							return false;
						}
						else { return handler.__result; }
					}
	
				}, false);
			}
	
			//else branch for attachEvent support [IE]
			//and do the same stuff with its syntax
			else if(this.defined(context.attachEvent))
			{
				context.attachEvent('on' + type, function(e)
				{
					if(utils.defined(handler.__result = handler(e, utils.getTarget(e))))
					{ 
						return handler.__result; 
					}
				});
			}
	
			//compile and return an object containing the context and event-type,
			//and the saved wrapper reference; then when we want to cancel it,
			//we can just pass the object as a whole to the silence function
			//nb. the opening-brace in this object declaration has to be on the 
			//same line as the "return" statement itself, to avoid semi-colon insertion
			return {
				context	: context,
				type	: type,
				wrapper	: handler.__wrapper
			};
		},
	
		//remove an event listener, with reference to 
		//the data object returned by the listen function
		silence : function(listendata)
		{
			if(this.defined(listendata.context.removeEventListener))
			{
				listendata.context.removeEventListener(listendata.type, listendata.wrapper, false);
			}
			else if(this.defined(listendata.context.detachEvent))
			{
				listendata.context.detachEvent('on' + listendata.type, listendata.wrapper);  
			}
		},	
	
		//get and convert the target of an event, converted to parent if it's a text node
		//(because events can come from text nodes in safari)
		//or upwards to a specific target element, if the tag argument is specified 
		//(returning null if the target was not inside any such element)
		//the e argument itself can be an event, or it can be an existing target
		getTarget : function(e, tag)
		{
			if(this.defined(e.nodeType))
			{
				var target = e;
			}
			else
			{
				target = e.target || e.srcElement;
				while(target.nodeType == 3)
				{ 
					target = target.parentNode; 
				}
			}
			if(this.defined(tag) && target.nodeName.toLowerCase() != (tag = tag.toLowerCase()))
			{
				while(target = target.parentNode)
				{
					if(target.nodeName.toLowerCase() == tag) 
					{ 
						break; 
					}
				}
				if(!target) { return null; }
			}
			return target;
		},
		
		//contains method evaluates whether one node contains the other
		//as in "does primary node contain event target"
		//this is used to differentiate events such as the
		//mouseover that fires when the mouse leaves an inner element
		contains : function(primary, target)
		{
			if(target === primary)	{ return true; }
			if(target === null)		{ return false; }
			else 					{ return this.contains(primary, target.parentNode); }
		},
		
		//evaluate a mouse button event to confirm that it came from the left button
		//nb. most browsers support both "button" and "which" and agree on what their numbers are
		//but IE only supports the "button" model and uses different numbers 
		//so we can work out which number is good according to which model is supported
		leftMouseButton : function(e)
		{
			return this.defined(e.which) ? e.which === 1 : e.button === 1;
		},
			
	
		//test an element for a class name
		//nb. the value only accepts a string, but it's evaluated as a regex
		//so you can pass complex interpretive values like "(yes|no)"
		//as well as multiple space-separated values like "yes no"
		hasClass : function(node, value)
		{
			return !this.empty(node.className)
					&& 
					new RegExp('( |^)' + this.flatten(value) + '( |$)').test(node.className);
		},
	
		//add a class name, maintaining neat spacing
		//nb. this also only accepts a regex evaluated value string
		//then the value is only added if not already present, to prevent duplication
		//and will overwrite or append the value depending on the overwrite flag
		addClass : function(node, value, overwrite)
		{
			if(this.empty(node.className) || this.defined(overwrite, false))
			{
				node.className = this.flatten(value);
			}
			else if(!this.hasClass(node, value))
			{
				node.className = this.flatten(node.className + ' ' + value);
			}
		},
	
		//remove a class name, maintaining neat spacing
		//nb. this also only accepts a regex evaluated value string
		//or if the value is undefined, empty or null, the class will be cleared completely
		removeClass : function(node, value)
		{
			if(this.empty(this.flatten(value)))
			{
				node.className = '';
			}
			else
			{
				node.className = this.flatten(
					node.className.replace(
						new RegExp('(( )' + this.flatten(value) + ')|((^)' + this.flatten(value) + '( |$))', 'g'),
						''
						)
					);
			}
		},

		//exchange one class name for another, maintaining neat spacing
		//nb. the value can accept a string or a regex, including backreferences;
		//so swap with an empty string would equate to remove with a regex
		swapClass : function(node, oldvalue, newvalue)
		{
			node.className = this.flatten(node.className.replace(oldvalue, newvalue));
		}


	};


}).apply({});
