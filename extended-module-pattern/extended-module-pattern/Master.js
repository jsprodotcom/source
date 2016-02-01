var MyClass = (function()
{

	//public supported flag, based on feature detection
	this.supported = typeof(document.getElementById) != 'undefined';
	
	//if the browser isn't supported then we may as well exit here
	//but defined and return the public data, so the flag remains available
	//and so that subsequent calls to define don't cause an error
	if(!this.supported) 
	{ 
		this.define = function(){};
		return this; 
	}



	//protected and privileged config dictionary
	var config =
	{
		sample1	: 'xyz'
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



	//=> test for the presence of sample config
	alert('Master.js:\n\n' + config.sample1);



	//extend protected members and return the resulting public data
	return utils.extend(this, 
	{
		config	: config,
		utils	: utils
	});

})();	
