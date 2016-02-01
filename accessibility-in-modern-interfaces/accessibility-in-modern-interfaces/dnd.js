/*******************************************************************************
 html5+aria drag and drop scripting
 ------------------------------------------------------------------------------
*******************************************************************************/
(function()
{


	//-- private universal object references --//
	var $this = this, 



	//-- private data constants --//
	
	//define the two drag and drop event models
	//either the HTML5 API or legacy implementation
	DRAGMODEL_LEGACY		= 1,
	DRAGMODEL_HTML5			= 0;



	//-- public data properties --//
	
	//which of the drag and drop event models are we using
	//this is undefined by default until its value has been set in init() 
	this.dragmodel;



	



	//-- public methods --//
	
	//drag and drop initialization method 
	this.init = function()
	{
		
		//get and iterate through the collection of draggable items, 
		//which are all the items with the "listitem" role
		this.dragitems = utils.get('li', null, { role : 'listitem' });
		utils.forevery(this.dragitems, function(i, dragitem)
		{
			//draggable items have the "draggable" attribute, 
			//but only browsers that supported the HTML5 API will return a "draggable" property
			//so read that property and set the global "dragmodel" flag accordingly 
			if(!utils.defined($this.dragmodel))
			{
				$this.dragmodel = utils.defined(dragitem.draggable) ? DRAGMODEL_HTML5 : DRAGMODEL_LEGACY;
			}
			
			
			//then if we're using the HTML5 model
			if($this.dragmodel == DRAGMODEL_HTML5)
			{
				//define a dragstart listener for the item, 
				//which binds the drag behavior and specifies the drag-store data to use
				//we're using the item's ID for this reference, which is itself generated
				//on the fly by this event, so we don't have to give them hard-coded ID attributes
				utils.listen(dragitem, 'dragstart', function(e, target)
				{
					dragitem.id = 'i' + new Date().getTime();
					e.dataTransfer.setData('text/plain', dragitem.id);  
				});
			}
			
			
			//otherwise we're using the legacy model
			else
			{
				//create a global "dragclone" object, if we haven't done so yet 
				//which is used both a flag for detecting when a drag action has been initiated
				//and a reference to the cloned item you're dragging
				if(!utils.defined($this.dragclone))
				{
					$this.dragclone = null;
				}
							
				//then define a mousedown to intiate a drag action 
				//nb. only respond to the left mouse-button when initiating a drag action
				//so that we don't interfere with context-menu actions
				utils.listen(dragitem, 'mousedown', function(e, target)
				{
					if(utils.leftMouseButton(e))
					{
						//clone the item and insert it at the end of the containing list
						$this.dragclone = dragitem.parentNode.appendChild(dragitem.cloneNode(true));
						
						//give it an additional class name to fix the focus styles
						//(so they don't flicker off when the mouse veers outside its boundary)
						utils.addClass($this.dragclone, 'dragclone');
						
						//get the item's offsets to use as the start position
						//nb. saving this in advance rather than 
						//re-getting it every time we move the clone
						//creates a much smoother, less skittish drag action
						$this.dragclone.start = {
							x : dragitem.offsetLeft,
							y : dragitem.offsetTop
							};
						
						//add a touch of opacity, and set to its start position
						$this.dragclone.setAttribute(
							'style', 
							'opacity:0.75;'
							+ 'position:absolute;'
							+ 'left:'+ $this.dragclone.start.x + 'px;'
							+ 'top:'+ $this.dragclone.start.y + 'px;'
							);
							
						//we also have to set a z-index on each of the droptarget lists
						//giving the higher value to the current parent list 
						//otherwise the clone would not be able to go above 
						//any next-sibling lists, because z-index is contextual 
						utils.forevery($this.droptargets, function(i, droptarget)
						{
							droptarget.style.zIndex = (droptarget == dragitem.parentNode ? '200' : '100');
						});
						
						//then save a reference to the original item 
						//and the starting mouse co-ordinates, as a properties of the clone
						$this.dragclone.progenitor = dragitem;
						$this.dragclone.coords = { 
							x : e.clientX,
							y : e.clientY
							};
					}
				});
			}
		});
		
		
		//now get and iterate through the collection of drop-targets
		//which are all the items with the "list" role
		this.droptargets = utils.get('ul', null, { role : 'list' });
		utils.forevery(this.droptargets, function(i, droptarget)
		{
			
			//if we're using the HTML5 model
			if($this.dragmodel == DRAGMODEL_HTML5)
			{
				//define a dragover listener for each target
				//which cancels the default behavior of not being a drag target,
				//and this has the effect of making it a drag target!
				//weird way of looking at it if you ask me, that you have to 
				//cancel the behavior of a "drag" event to get drag behavior! 
				//surely it should be the other way round -- you cancel to prevent it?
				//nb. there's no need to set the "effectAllowed" property
				//because ... er ... it doesn't do anything
				//(not in this context anyway, though it might do something with 
				//native drag and drop, and binary or base64-encoded data transfer(?))
				utils.listen(droptarget, 'dragover', function(e, target)
				{
					return false;
				});

				//then define a drop listener for each target for the actual drop action
				//which is to insert the item into the drop-target, as the 
				//previous-sibling of whichever item is nearest to the mouse when you drop it
				//we know which one to move because its ID was saved to the 
				//data-store in the dragtsart event, so we just have to read that value back 
				//nb. there's no need to define the "dropEffect" property either
				//as with "effectAllowed", it doesn't actually do anything here
				utils.listen(droptarget, 'drop', function(e, target)
				{
					//get the item we're dropping
					var dragitem = utils.get('#' + e.dataTransfer.getData('text/plain'));
	
					//the event target we get here will be 1) the drop-target itself, 
					//or 2) one of the draggable items inside it, or 3) an element inside a draggable item
					//for the former case we insert the item at the end of the list
					//otherwise we convert any inner references upward to the item
					//then insert the drag-item as previous-sibling of the drop-item
					if(target.getAttribute('role') == 'list')
					{
						target.appendChild(dragitem);
					}
					else 
					{
						while(target.getAttribute('role') != 'listitem')
						{
							target = target.parentNode;
						}
						target.parentNode.insertBefore(dragitem, target);
					}
	
					//we also have to prevent default here, to cancel the default 
					//behavior of not being a drop target, and thereby make it a drop target!
					return false;
				});
			}
			
			
			//otherwise we're using the legacy model
			else
			{
				//define a single document mouseup listener, filtered by the presence of the dragclone
				//to cancel the drag and do the actual drop action, same as in the drop event above
				utils.listen(document, 'mouseup', function(e)
				{
					if($this.dragclone !== null)
					{
						//in this case we can use elementFromPoint to identify which (if any) 
						//drop target (list or listitem) is currently under the mouse 
						//but we have to temporarily undisplay the dragclone to do this
						//otherwise it will always return the clone itself!
						var display = window.getComputedStyle($this.dragclone, '').getPropertyValue('display');
						$this.dragclone.style.display = 'none';
						var droptarget = document.elementFromPoint(e.clientX, e.clientY);
						$this.dragclone.style.display = display;

						//the reference we get back could be any element on the page
						//so we need to conditionalize the actions same as in the drop event
						//except that finding the parent dragitem of an inner element
						//requires iteration through all dragitems until (if) we find the right one
						//providing additional logic to handle that situation, 
						//or the situation where we don't get a valid droptarget at all
						if(droptarget.getAttribute('role') == 'list')
						{
							droptarget.appendChild($this.dragclone.progenitor);
						}
						else if(droptarget.getAttribute('role') == 'listitem')
						{
							droptarget.parentNode.insertBefore($this.dragclone.progenitor, droptarget);
						}
						else
						{
							utils.forevery($this.dragitems, function(i, dragitem)
							{
								if(utils.contains(dragitem, droptarget))
								{
									while(droptarget !== dragitem)
									{
										droptarget = droptarget.parentNode;
									}
									droptarget.parentNode.insertBefore($this.dragclone.progenitor, droptarget);
								
									//nb. this is a break command 
									return false;
								}
							});
						}
						
						//then finally, whether or not we found a droptarget, 
						//remove the clone and nullify the references
						$this.dragclone.parentNode.removeChild($this.dragclone);
						$this.dragclone = null;
						
						//it may not be necessary to cancel default here
						//but I reckon we should do it anyway, JiC™
						return false;
					}
					return true;
				});
			}
			
		});


		//if we're using the legacy model
		if(this.dragmodel == DRAGMODEL_LEGACY)
		{

			//we need a single document mousemove listener, filtered by the presence of the dragclone
			//so it only responds when a drag action has been initiated
			utils.listen(document, 'mousemove', function(e)
			{
				if($this.dragclone !== null)
				{
					//move the clone to match the mouse movement
					$this.dragclone.style.left = ($this.dragclone.start.x + (e.clientX - $this.dragclone.coords.x)) + 'px';
					$this.dragclone.style.top = ($this.dragclone.start.y + (e.clientY - $this.dragclone.coords.y)) + 'px';
					
					//nb. prevent default is critical here to make the drag action robust
					//and stop it from misfiring, or from selecting text underneath
					//however the latter is not entirely succesful, so we also 
					//brute-force remove any residual selection while dragging
					try { window.getSelection().removeAllRanges(); } catch(ex){}
					return false;
				}
				return true;
			});
			
		}
		
		
		
		
		//now we need to implement keyboard support and match that with ARIA states
		//there's nothing in the HTML5 API to handle this 
		//so everything we're doing here is custom scripting
		//(we didn't really need the HTML5 API at all, 
		// but it does produce smoother drag-images ... usually)
		
		//create a global "ariadrag" object, if we haven't done so yet 
		//which is used both a flag for detecting when a drag action has been initiated
		//and a reference to the cloned item you're dragging
		//nb. this has to be a separate object from the mouse-controlled dragclone reference
		//so that we don't get any conflicts between the two interactions modes
		if(!utils.defined($this.ariadrag))
		{
			$this.ariadrag = null;
		}
					
		//the bind a document a keydown listener to capture the drag-action keystrokes 
		utils.listen(document, 'keydown', function(e, target)
		{
			//capture the selection key (space) on any dragitem 
			if(e.keyCode == 32 && target.getAttribute('role') == 'listitem')
			{
				//save this item reference to the ariadrag object
				$this.ariadrag = target;
				
				//set the aria-grabbed attribute to "true", to select the item
				target.setAttribute('aria-grabbed', 'true');
				
				//set all the droptarget aria-dropeffect attributes to "move"
				utils.forevery($this.droptargets, function(i, droptarget)
				{
					droptarget.setAttribute('aria-dropeffect', 'move');
				});

				//now switch the roving tabindex attributes to point to the droptargets
				//ie. remove all the dragitem tabindices, and set all the droptarget 
				//tabindices to "0", so that tabbing from here will only move to 
				//target elements, not to other draggable elements, which makes it 
				//easier to find the target, and (for now) prevents multi-selection
				//nb. if we supported multi-selection we'd do something 
				//else at this point, but to keep this demo simple for now, we don't!
				setRovingTabindex('droptargets');
				
				//block any native action
				return false;
			}
			
			//capture the cancel key (esc) anywhere, 
			//or the drop-action key on a droptarget if a drag has been initiated
			//nb. the recommended drop-action keystroke is "Ctrl + M" 
			//but that conflicts with the Mac OS shortcut to minimize windows
			//also Opera has several long-standing bugs with accelerator combinations and key events
			//=> on the mac, it doens't fire keydown at all if cmd (e.metaKey) is held down
			//   it also reports e.metaKey instead of e.ctrlKey when ctrl is held down
			//=> on windows it does report ctrl events, but you can't block the default action
			//so what I'm going to do is implement the keystroke for ctrl or cmd, on either platform
			//and I'm also going to back that up by implementing it from the Enter key
			//I can see the logic of using M -- it's conceptually similar to paste, 
			//so it does kinda make sense to have a closely related keystroke 
			//but it seems to me that the Enter key is a far more intuitive choice 
			//at the very least, when used for discreet drag and drop functionality 
			//like this, that isn't anything to do with clipboard operations
			else if
			(
				(
					e.keyCode == 27
					||
					(
						(
							(e.keyCode == 77 && (e.ctrlKey || e.metaKey)) 
							|| 
							e.keyCode == 13
						) 
						&& 
						target.getAttribute('role') == 'list'
					)
				)
				&& 
				$this.ariadrag !== null
			)
			{
				//set all the droptarget aria-dropeffect attributes back to "none"
				utils.forevery($this.droptargets, function(i, droptarget)
				{
					droptarget.setAttribute('aria-dropeffect', 'none');
				});

				//switch the roving tabindex to point back to the dragitems
				setRovingTabindex('dragitems');
				
				//if this was the drop action rather than cancel 
				//(which is easiest to specify as a not-cancel condition)
				if(e.keyCode != 27)
				{
					target.appendChild($this.ariadrag);
				}

				//set focus back on the selected dragitem, 
				//which is the most useful place to put it, rather than leaving it
				//on a droptarget where it serves no useful function at this point
				$this.ariadrag.focus();
				
				//set the aria-grabbed attribute back to false on the selected item
				//nb. we wait until after it's moved before we do this 
				//so we can do a yellowfade-esque transition to indicate the change
				//without the distraction of it moving at the same time
				$this.ariadrag.setAttribute('aria-grabbed', 'false');

				//then nullify the ariadrag reference
				$this.ariadrag = null;
				
				//block any native action
				return false;
			}
		});

	};







	//-- private utility functions --//
	
	//implement roving tabindex on the dragitems and droptargets 
	//the active argument specifies whether to set the active tabindex "0"
	//on the "dragitem" elements or the "droptarget" elements
	//and therefore to set the passive tabindex "-1" on the other collection
	function setRovingTabindex(active)
	{
		var passive = (active == 'dragitems' ? 'droptargets' : 'dragitems');
		
		utils.forevery($this[active], function(i, target)
		{
			target.setAttribute('tabindex', '0');
		});

		utils.forevery($this[passive], function(i, target)
		{
			target.removeAttribute('tabindex');
		});
	}
		
		
		




	//-- return and instantiate --//
	return this;
	
}).apply({}).init();
