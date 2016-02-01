var Widget = (function()
{

	//public supported flag, based on feature detection
	this.supported = typeof(document.getElementById) != 'undefined';
	
	//if the browser isn't supported then we may as well exit here
	//but define all the public data, so the flag remains available
	//and so that calls to public functions don't cause an error
	if(!this.supported) 
	{ 
		this.define = function(){};
		this.DeveloperInterface = function(){};
		this.DeveloperInterface.prototype = { load : function(){}, save : function(){} };
		return this; 
	}



	//protected instances dictionary
	var instances = {},



	//protected and privileged config dictionary
	config = 
	{
	},
	
	
	
	//protected utility functions
	utils =
	{
		//add properties to an object
		extend : function(root, props)
		{
			for(var key in props)
			{
				if(props.hasOwnProperty(key))
				{
					root[key] = props[key];
				}
			}
			return root;
		},
		
		//copy an object property then delete the original 
		privatise : function(root, prop)
		{
			var data = root[prop];
			try 		{ delete root[prop]; } 
			catch(ex) 	{ root[prop] = null; }
			return data;
		}
	};
	


	//public config definition function
	this.define = function(key, value)
	{
		if(typeof config[key] == 'undefined')
		{
			alert('There is no config option "' + key + '"');
		}
		else
		{
			config[key] = value;
		}
	};
	


	//sample global interface click event
	document.addEventListener('click', function(e)
	{
		var target = e.target;
		do
		{
			if(typeof(target.instance) !== 'undefined')
			{
				break;
			}
		}
		while(target = target.parentNode);
		
		if(target)
		{
			alert(target.instance.key);
			alert(target === instances[target.instance.key].question);
		}
	
	}, false);



	//extend protected members and return the resulting public data
	return utils.extend(this, 
	{
		instances : instances,
		config    : config,
		utils     : utils
	});

})();
