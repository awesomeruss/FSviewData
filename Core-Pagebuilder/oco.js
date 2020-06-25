    // uses  https://datatables.net
    // the $( document ).ready function obtains the SID and config array, and calls get_data for each config JSON
	// example config JSON:
	/* [	//the outer element is an array, so that multiple lookups can be configured in a single page 
		{
			"type":"table", 				// type is either "table" or "template". "table" will render the results using DataTables.
			"lookup":"5b4dec0e8c88a", 		// the ID of the Firmstep Forms lookup to run. Any columns that end in _hhh are hidden. Any columns that end in _sss can have associated _cls (styling class), _url and _icn (fontawesome icon). A "rowclass_hhh" column can also apply a styling class to the row.
			"tab":"tab_opportunity",  		// the HTML element that will contain the lookup data. Is also expected to contain a ".spinner" and a ".spinner .msg"
			"counter":"count_opportunity", 	// ID of a counter that should be set with the rowcount
			"nodata":"NoResultsBox", 	// ID of a 'no results' error message element which will be .show() if there are no results.
			"tablebuttons":["csv"],  		// See DataTables docs, "buttons" option. Controls the buttons that are displayed
			"tableconfig":"frlipBt"			// See DataTables docs, "dom" option. Controls which datatables elements are used, and their sequence 
		},
		{
			"type":"template", 				// template configs will clone an existing chunk of HTML for every record returned.
			"lookup":"5b27870074f34",
			"tab":"tab_topper", 
			"template":"template_topper"	// the HTML ID of the template HTML structure. This will be cloned once for every row returned by the lookup, substituting all occurencess of ###columnname### with the corresponding row value.
											// any columns that end in "..._md" will be converted from markdown to HTML.
		}
		
		]
	*/
	//  
	// get_data pulls together the input parameters and calls run_lookup
    // run_lookup runs a Forms lookup. It takes the lookup id, token object, success function and error function as parameters
    // draw_results is used as the success function. It takes the results of the lookup, and the config object.
	//		it manipulates the results into the format required by datatables, creates the datatable and hides the spinner
    
	var maplace;
	
	//setup a function that loads a single script
	function load_a_script(scripts) {
	
		//make sure the current index is still a part of the array
		if (scripts.length>0) {
			var myscript=scripts.pop();
			console.log('Loading: ' + myscript);
			$.getScript(myscript, function () {
				console.log('Loaded: ' + myscript);
				if(scripts.length>0)
					load_a_script(scripts);
				else
					start();
			});
		}
	}
	

    $( document ).ready(function() {
		// load the scripts we need
		if($('#pagetitle').text()!=='') window.parent.document.title=$('#pagetitle').text();
		
        var sid;
        if (typeof parent.FS === 'undefined' ) 
        {
            $('#console').append("Unable to find AchieveForms session id<br/>");
			return;
		} 
		//load the 'type' values from the config, to check what scripts we need
		var config=JSON.parse($('#lookup_config').text());
		var types=config.map(x => x.type);
		
				
		//load all the scripts we need
		var scripts=[];
		var jsfolder=$('script[src$="oco.js"]').attr('src').replace('oco.js', '');
		if (jsfolder=='')
		{
			jsfolder=$('script[src$="oco-beta.js"]').attr('src').replace('oco-beta.js', '');
		}
		if (jsfolder=='')
		{
			jsfolder=$('script[src$="oco.min.js"]').attr('src').replace('oco.min.js', '');
		}
		$.ajaxSetup({cache: true});

		scripts.push(jsfolder+'moment/moment.min.js');
		scripts.push(jsfolder+'showdown/showdown.min.js');
		if(types.includes('calendar'))
		{
			// load some css
			$('<link/>', {rel: 'stylesheet', type: 'text/css', href: jsfolder+'fullcal/scheduler/packages/core/main.css'}).appendTo('head');	
			$('<link/>', {rel: 'stylesheet', type: 'text/css', href: jsfolder+'fullcal/scheduler/packages/daygrid/main.css'}).appendTo('head');	
			$('<link/>', {rel: 'stylesheet', type: 'text/css', href: jsfolder+'fullcal/scheduler/packages/timegrid/main.css'}).appendTo('head');		
			$('<link/>', {rel: 'stylesheet', type: 'text/css', href: jsfolder+'fullcal/scheduler/packages-premium/timeline/main.css'}).appendTo('head');		
			$('<link/>', {rel: 'stylesheet', type: 'text/css', href: jsfolder+'fullcal/scheduler/packages-premium/resource-timeline/main.css'}).appendTo('head');
			scripts.push(jsfolder+ "fullcal/scheduler/packages/core/main.js");
			scripts.push(jsfolder+ "fullcal/scheduler/packages/interaction/main.js");
			scripts.push(jsfolder+ "fullcal/scheduler/packages/daygrid/main.js");
			scripts.push(jsfolder+ "fullcal/scheduler/packages/timegrid/main.js");
			scripts.push(jsfolder+ "fullcal/scheduler/packages-premium/timeline/main.js");
			scripts.push(jsfolder+ "fullcal/scheduler/packages-premium/resource-common/main.js");
			scripts.push(jsfolder+ "fullcal/scheduler/packages-premium/resource-timeline/main.js");		
		}
		if(types.includes('plotly'))
		{
			scripts.push(jsfolder+'plotly/plotly-latest.min.js');
		//	scripts.push(jsfolder+'plotly/plotly-finance-latest.js');
		//	scripts.push(jsfolder+'plotly/plotly-cartesian-latest.js');		
		}
		if(types.includes('table'))
		{
			scripts.push(jsfolder+'datatables/datatables.min.js');
			scripts.push(jsfolder+'datatables/datetime-moment.js');
			scripts.push(jsfolder+'datatables/select2.min.js');
			scripts.push(jsfolder+'datatables/ellipsis.js');
			scripts.push(jsfolder+'datatables/jquery.dataTables.yadcf.js');			
		}
		scripts.push(jsfolder+'maplace/maplace.min.js');
		scripts.push(jsfolder+'daterangepicker/daterangepicker.js');
		console.log('loading scripts');
		load_a_script(scripts.reverse())
	});
	
	function start()
	{
		var config=JSON.parse($('#lookup_config').text());
		var types=config.map(x => x.type);

		console.log('all scripts loaded.');
		// setup datatables for sorting date columns properly
		if(types.includes('table'))
		{
			$.fn.dataTable.moment( 'DD/MM/YYYY' );
			$.fn.dataTable.moment( 'YYYY-MM-DD' );
			$.fn.dataTable.moment( 'DD MMM YYYY' );
			$.fn.dataTable.moment( 'DD/MM/YYYY HH:mm:ss' );
		}
		//if we have a graph, bind a resize event
		if(types.includes('plotly'))
		{
			window.onresize = function() {
					// todo - change this for a jquery each()
					Plotly.Plots.resize('plotly_box');
					Plotly.Plots.resize('plotly_violin');    
				}
		};
		//setup date range picker if available
		$('#daterangestart').html(moment().subtract(30,'days').format('YYYY-MM-DD'));
		$('#daterangeend').html(moment().format('YYYY-MM-DD'));

		$('input[name="daterange"]').val( moment().subtract(30,'days').format('DD MMM YYYY HH:mm')+' - '+ moment().format('DD MMM YYYY HH:mm'));
		$('input[name="daterange"]').daterangepicker({
			
			timePicker: true,
			timePicker24Hour: true,
			timePickerIncrement: 1,
			locale: {format: 'DD MMM YYYY HH:mm',  cancelLabel: 'Clear (Show open cases)'},
			showCustomRangeLabel:true,
			ranges: {
				"Last 24h": [
					moment().subtract(1,'days').format('DD MMM YYYY HH:mm'),
					moment().format('DD MMM YYYY HH:mm')
				],
				"Last 7 days": [
					moment().subtract(7,'days').format('DD MMM YYYY HH:mm'),
					moment().format('DD MMM YYYY HH:mm')
				],
				"Last 30 days": [
					moment().subtract(30,'days').format('DD MMM YYYY HH:mm'),
					moment().format('DD MMM YYYY HH:mm')
				],
				"Last month": [
					moment().subtract(moment().date()-1,'days').subtract(1,'month').format('DD MMM YYYY 00:00'),
					moment().subtract(moment().date()-1,'days').format('DD MMM YYYY 00:00')
				],
				"Last quarter": [
					moment().startOf('quarter').subtract(3,'month').format('DD MMM YYYY 00:00'),
					moment().startOf('quarter').format('DD MMM YYYY 00:00')
				]
				}
	
			},pickdate);
			$('input[name="daterange"]').on('cancel.daterangepicker', function(ev, picker) {
				$(this).val('');
				$('#daterangestart').html('');
				$('#daterangeend').html('');
				refreshLookups();
			});
		
		//bind the print button
		//$('#printhelp div.unbound').on('click', function(){togglePrint();}).removeClass("unbound");
		 $('body').on('change','.selectpicker',function(){ picklist(this)   }); // better way of binding events to controls 
		 $('body').on('click','a.buttonpusher.selectall',function(){ allbuttonpush(this)   }); // better way of binding events to controls 
		setTimeout(function(){
			console.log('binding');
			console.log($('#printhelp div.newprintmode'));
			$('.print.unbound').on('click', function(){window.print();}).removeClass("unbound");
			$('#printhelp div.newprintmode').on('click', function(){togglePrint();}).removeClass("newprintmode").addClass("printmode");
		//	$('.newselectpicker').on('change',function(){picklist(this)}).removeClass('newselectpicker').addClass('selectpicker');
			$('.newselectpicker').removeClass('newselectpicker').addClass('selectpicker');
			},3000);
		//bind calendar events
		for (var i=0; i < config.length; i++)
		{
			if(config[i].type='calendar')
			{
				setupCalendar(config[i]);
			}
		}

		//run the lookups
		refreshLookups();
		// bind events to redraw plotly graphs when tabs are changed
		$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) { 
			$(e.target.hash+' .js-plotly-plot').each(function(){console.log(this.id);Plotly.relayout(this.id,{}) })
			})
	
	}
	
	function check_calendar_save(responsedata, revertfunction, successfunction){
		//if there is an error response or an error message in the data, call the revert function. otherwise call the successfunction
		console.log('checking save response...');
		console.log(responsedata);
		var error = (responsedata.transformed.error?responsedata.transformed.error:'');
		if(error == '' && responsedata.transformed.rows_data[0] && responsedata.transformed.rows_data[0].error){
			error=responsedata.transformed.rows_data[0].error;
		}
		if(error)
		{
			revertfunction(responsedata);
			alert(error);
		}
		else
			(successfunction?successfunction(responsedata):void 0);
		
		//if the event was passed in, then we're adding a new event. we need to change the ID from the one assigned by fullcalendar to the one the back end understands
	//	if(e && responsedata.transformed.rows_data[0] && responsedata.transformed.rows_data[0].eventID ){
	//		event.setProp('id',responsedata.transformed.rows_data[0].eventID);
	//	}
		return;
	}
	
	function setupCalendar(configitem){
		var calendarEl = $('#'+configitem.tab+' .fullcalendar')[0];
		var trashEl = $('#'+configitem.tab+' .trashcan')[0];
		
		
		
		if (typeof(calendarEl)!='undefined'){	 
			var calendarObj = configitem.fullcalendar;
			//some event feed adding goes here to map the integrations to functions in calendarObj
			if(typeof(configitem.lookup_event) != 'undefined')
			{
				calendarObj.events=  function(info, successCallback, failureCallback) {
				//	$(info.event._calendar.el).parent().find('.status').html('Loading events...')
					run_lookup(configitem.lookup_event,get_config(info), function(responsedata){
						successCallback(Object.values(responsedata.transformed.rows_data));
				//		$(info.event._calendar.el).parent().find('.status').html('Ready');
						}, failureCallback );
				};
			}
			if(typeof(configitem.lookup_resources) != 'undefined')
			{
				calendarObj.resources=  function(info, successCallback, failureCallback) {
					run_lookup(configitem.lookup_resources,get_config(info), function(responsedata){successCallback(Object.values(responsedata.transformed.rows_data))}, failureCallback );
				};
			}
			if(typeof(configitem.lookup_eventchange) != 'undefined')
			{
				calendarObj.eventDrop=  function(info) {
					console.log('saving eventDrop or eventResize change');
					$(info.event._calendar.el).parent().find('.status').html('Saving...')
					//all we need is - event id, old resource id, new resource id, new start, new end
					var d={ eventID:info.event.id, start:info.event.start, end: info.event.end, oldResource:(info.oldResource?info.oldResource.id:null), newResource:(info.newResource?info.newResource.id:null)};
					//need to run the lookup, on failure call revert, on success call a function to check result and revert if not ok 
					run_lookup(configitem.lookup_eventchange,get_config(d), function(responsedata){
						check_calendar_save(responsedata,function(){info.revert()});
						$(info.event._calendar.el).parent().find('.status').html('Ready');
						}, function(){info.revert() });
				};
				calendarObj.eventResize=  calendarObj.eventDrop;
			}

			if($('#'+configitem.tab+' .trashcan').length=1 && configitem.lookup_eventdelete)
			{
				//add a delete handler for dragging onto the trashcan
				calendarObj.eventDragStop= function(info) {

					var trashEl = $('#'+configitem.tab+' .trashcan');
					var ofs = trashEl.offset();

					var x1 = ofs.left;
					var x2 = ofs.left + trashEl.outerWidth(true);
					var y1 = ofs.top;
					var y2 = ofs.top + trashEl.outerHeight(true);

					if (info.jsEvent.pageX >= x1 && info.jsEvent.pageX<= x2 &&
						info.jsEvent.pageY >= y1 && info.jsEvent.pageY <= y2) {
						var d={ eventID:info.event.id};
						$(info.event._calendar.el).parent().find('.status').html('Deleting...')

						//run lookup to delete the event. only actually delete if it succeeds 
						run_lookup(configitem.lookup_eventdelete,get_config(d), function(responsedata){
							check_calendar_save(responsedata,
								function(){return 0},
								function(args){info.event.remove();$(info.event._calendar.el).parent().find('.status').html('Ready');})}, function(){return 0} );
					
					//info.event.remove();
//						$('#'+configitem.tab+' .fullcalendar').fullCalendar('removeEvents', info.event.id);
					}
				};

				
			}
			if(calendarObj.droppable)
			{
				calendarObj.eventReceive=function(info) {
					var d={ eventID:info.event.id, start:info.event.start, end: info.event.end, title:info.event.title};
					rs=info.event.getResources();
					d.resourceId=(rs.length>0?rs[0].id:'');
					run_lookup(configitem.lookup_eventreceive,get_config(d), function(responsedata){
						check_calendar_save(responsedata,
							function(){info.event.remove()},
							function(args){ 
								info.event.setProp('id',args.transformed.rows_data[0].eventID);
								(args.transformed.rows_data[0].resourceId?info.event.setResources(args.transformed.rows_data[0].resourceId):void 0);
								})}
						, function(){info.event.remove()} );
					
				}
			   var Draggable = FullCalendarInteraction.Draggable;

				/* initialize the external events
				-----------------------------------------------------------------*/

				var containerEl = document.getElementById('external-events');
				new Draggable(containerEl, {
				  itemSelector: '.fc-event',
				  eventData: function(eventEl) {
					 
					return (eventEl.getAttribute('data-event')?JSON.parse(eventEl.getAttribute('data-event')):{
					  title: eventEl.innerText.trim()
					})
				  }
				});
			}
			
			//similarly for get resources, eventdrop, etc
			var calendar = new FullCalendar.Calendar(calendarEl,calendarObj);
			calendar.render();
			$('#'+configitem.tab+' .spinner').hide();
		}

	}

		function oldstuff(){
		$.when(
			$.getScript(jsfolder+'moment/moment.min.js'),
			$.Deferred(function(deferred){
				$(deferred.resolve);
			})
		).done(function(){
			$.when(
				console.log('done loading scripts'),
				$.getScript(jsfolder+'daterangepicker/daterangepicker.js'),
				$.getScript(jsfolder+'datatables/datetime-moment.js'),
				$.getScript(jsfolder+'datatables/select2.min.js'),
				$.getScript(jsfolder+'datatables/ellipsis.js'),
				$.getScript(jsfolder+'datatables/jquery.dataTables.yadcf.js'),
				// calendar stuff
				// this should really detect what is required. instead for right now we're just loading the css and js for the example
				$.Deferred(function(deferred){
					$(deferred.resolve);
				})
			).done(function(){
		
				$.fn.dataTable.moment( 'DD/MM/YYYY' );
				$.fn.dataTable.moment( 'YYYY-MM-DD' );
				$.fn.dataTable.moment( 'DD MMM YYYY' );
				$.fn.dataTable.moment( 'DD/MM/YYYY HH:mm:ss' );
				//plotly stuff
				if(typeof(Plotly)=='undefined'&&$('#plotly').length>0)
				{
					$.getScript("/plotly/plotly-finance-latest.js",function() {
						console.log('loaded plotly');
						$.getScript("/plotly/plotly-cartesian-latest.js",function() { console.log('loaded plotly cartesian');
						window.onresize = function() {
							// todo - change this for a jquery each()
							Plotly.Plots.resize('plotly_box');
							Plotly.Plots.resize('plotly_violin');    
							};
						});
					});
				}
				
			});	        
		});	        
		$.ajaxSetup({cache: false});
	}

	function refreshLookups(){
		$('.modal').remove(); //prevent build up of out-of-date modals
		$('.nodatamsg').hide(); //hide any visible 'no data' messages
		var ocotabs=JSON.parse($('#lookup_config').text());
		for (var i=0; i < ocotabs.length; i++)
		{
			if(ocotabs[i].type=='calendar')
			{
				// calendar.refreshEvents()
			}
			else
				get_data(ocotabs[i]);
			
		}
		
	}
	
	function buttonpush(field){
		//did we push or unpush?
		var c = $('#'+field.getAttribute('config')+'.config');
		var selected=c.html().split(',');
		if($(field).hasClass('active'))
		{
			//remove element from array
			selected.splice(selected.indexOf(field.value),1);
			//unselect the select-all button, if it exists			
			$(field).parent().find('.selectall').removeClass('active');
		}
		else
		{
			selected.push(field.value);
		}
		c.html(selected.toString());
	}
	
	// any 'select all' buttons will be bound to this function
	function allbuttonpush(field){
		$(field).addClass('active');
		$(field).parent().find('a:not(.active)').each(function(){buttonpush(this)}).addClass('active');
		refreshLookups();		
	}
	
	function picklist(field){
		$('#'+field.id+'.config').html(field.value);
		refreshLookups();
	}
	function pickdate(start, end,label) {
		$('#daterangestart').html(start.format('YYYY-MM-DD'));
		$('#daterangeend').html(end.format('YYYY-MM-DD'));
		refreshLookups();
    }
	
	function hideswitch(element) {		
		// console.log('running hideswitch to toggle .'+$(element).attr('id'));
		if($(element).hasClass('on'))
		{
			$('.'+$(element).attr('id')).hide(500);
			$(element).removeClass('on');
		}
		else
		{
			$('.'+$(element).attr('id')).show(500);
			$(element).addClass('on');
		}
	}
	function tablefilter(element){
		console.log(element);	
		console.log($(element).attr('data-tableid'));	
		console.log($(element).attr('data-tablefilter'));	
		
		$('#'+$(element).attr('data-tableid')+' .results th select').val($(element).attr('data-tablefilter')).trigger('change');
	}
	
	function copyToClipboard(element) {
		var $temp = $("<input>");
		$("body").append($temp);
		$temp.val($(element).text().trim()).select();
		console.log('copying '+$(element).text().trim());
		document.execCommand("copy");
		$temp.remove();
	}   

	function escapeHtml(unsafe) {
		return unsafe
			 .replace(/&/g, "&amp;")
			 .replace(/</g, "&lt;")
			 .replace(/>/g, "&gt;")
			 .replace(/"/g, "&quot;")
			 .replace(/'/g, "&#039;");
	}
	
	function escapeRegExp(s) {
		return s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
	}
	
	function unpack(rows, key) {
		return $.map(rows,function(row) { return row[key]; });
	}
	
	function get_config(extraconfig){
		//return a config object suitable for passing into run_lookup, merging the supplied extraconfig with other tokens from the page and user session
	    var t={}; 
		sid = typeof parent.FS !== "undefined" && parent.FS !== null ? (ref = parent.FS.Auth) !== null ? ref.session['auth-session'] : void 0 : void 0;
		if((typeof parent.FS.Auth.session.user =='undefined')&&($('#ucrn.config').length==0 || $('#ucrn.config').html().replace(/&nbsp;$/, '') !=''))
		{
			//reload the page if there is no sid
			parent.location.reload();
			return;
		}
		var e = typeof sid !== "undefined" ? typeof parent.FS.Auth.session.user  !== "undefined" && parent.FS.Auth.session.user !== null ? parent.FS.Auth.session.user.email : '' :  '';
		var ucrn = typeof sid !== "undefined" ? typeof parent.FS.Auth.session.user  !== "undefined" && parent.FS.Auth.session.user !== null ? parent.FS.Auth.session.user.attributes.ucrn : '' :  '';
	    if(typeof(extraconfig)=='object')
		{
			t=extraconfig;
		}
		$('.config').map(function() {
			if(this.id!='lookup_config') t[this.id]=$(this).html().replace(/&nbsp;$/, ""); //if there is an &nbsp; at the end, remove it - workaround for a bug in FS token substitution. 
		});
		t['Email_Address']=e;			
		t['user_email']=e;
		t['ucrn']=ucrn;
		return(t);
	}
	
    function get_data(x, extraconfig) {	
		//run the lookup x with the config provided, and call draw_results with the results
		//bind the refresh button event
		$('.'+x.tab+'.refreshbutton.unbound').on('click', function(){get_data(x);  $('i', this).rotate({ count:4, duration:0.6, easing:'ease-out' });}).removeClass("unbound");
		// bind any unbound print mode buttons

		var pt=$('#'+x.table).html()
		if( typeof pt =='undefined') pt='';
		// get an object of name/value config pairs
	    var t=get_config(extraconfig); 
	//    console.log('running lookup...'+x.lookup+' for '+x.tab+' with data:');
	//    console.log(t);
		$('#'+x.tab+' .spinner').show();
		$('#'+x.tab+' .spinner .msg').html('Getting data...').show();
		run_lookup(x.lookup,t, function(data){draw_results(data, x)}, function(a){log_error(x.tab,a)} );
    }
   
    function render_url(data, type, row,meta){
        // formats a column to be a hyperlink, using the url stored in column 0
        var caption=meta.settings.aoColumns[meta.col].title;
		var style="";
		var target="_parent";
        if(caption.toLowerCase()=='view')
		{
			caption='<i class="fas fa-eye"></i>'; //custom overrides to use fontawesome icons instead of boring words.
			caption='<button type="button" class="btn btn-info btn-sm"><i class="fas fa-eye"> </i>  View</button>'
			style='font-size:150%';
		}
        if(caption.toLowerCase()=='edit')
		{
			if(caption=='EDIT') // it's a bit hacky, but EDIT_url will open a new tab, edit_url will target the iframe parent in this tab
			{
				target="_BLANK";
			}
			// caption='<i class="fas fa-edit"></i>';
			caption='<button type="button" class="btn btn-success btn-sm"><i class="far fa-file-alt"> </i> Edit</button>'
			style='font-size:150%';
		}
        if(caption.toLowerCase()=='new')
		{
			// caption='<i class="fas fa-plus-square"></i>';
			caption='<button type="button" class="btn btn-success btn-sm"><i class="fas fa-plus-square"></i> New</button>'
			style='font-size:150%';
			target='_BLANK';
		} 	
		if(type === 'display' && (data===0 || data==='' || data ===null)) 
            return data
        else
            return '<a title="'+meta.settings.aoColumns[meta.col].title+'"style="'+style+'" target="'+target+'" href="'+data+'">'+caption + '</a>'
    
    }
	function render_response(data, type, row, meta) {
		var o=data;
		if(type === 'display'){
			var ref
			var a = new $.fn.dataTable.Api( meta.settings );
			ref=((typeof(a.column('Ref:name').index())=='number')?row[a.column('Ref:name').index()]:'')
			ref=((ref=='' && typeof(a.column('Reference:name').index())=='number')?row[a.column('Reference:name').index()]:ref)
			ref=((ref=='' && typeof(a.column('ref:name').index())=='number')?row[a.column('ref:name').index()]:ref)
			ref=((ref=='' && typeof(a.column('reference:name').index())=='number')?row[a.column('reference:name').index()]:ref)
			ref=((ref=='')?meta.settings.sInstance+'_row_'+meta.row:ref);
			
			if($('#ModalResponse'+ref).length==0)
			{
				$('body #app-content').append('<div id="ModalResponse'+ref+'" class="modal fade pagebreakafter"><div class="modal-dialog modal-lg"><div class="modal-content"><div class="modal-header"><button class="close" type="button" data-dismiss="modal">&times;</button><h4 class="modal-title">Case '+ref+'</h4></div><div class="modal-body"></div><div class="modal-footer"><button type="button" class="btn btn-default print_no" onclick="print_this(\'#ModalResponse'+ref+' .modal-content\')">Print</button><button class="btn btn-default" type="button" data-dismiss="modal">Close</button></div></div></div></div>');
			}
			$('#ModalResponse'+ref+' .modal-body').html('<div class="htmlsummary">'+data+'</div>');

			o='<button class="btn btn-info btn-sm" type="button" data-toggle="modal" data-target="#ModalResponse'+ref+'"><i class="fab fa-readme"> </i> Read</button>';
		}
		// console.log('rendering '+type+'-'+data +' as '+o);
		return o;	   
	}

	function render_xml(data, type, row, meta) {
		var o=data;
		if(type === 'display'){
			o='<small>'+$('<div>').text(o).html()+'</small>';											    
		}
		// console.log('rendering '+type+'-'+data +' as '+o);
		return o;	   
	}

	function render_markdown(data, type, row, meta) {
		var o=data;
		if(type === 'display'){
			var myShowdown = new showdown.Converter({tables: true, strikethrough: true}); 
			o=myShowdown.makeHtml(o);
			if(o!=='')
			{
				var x = $('<span>'+o+'</span>');
				$('a:not(target)',x).attr('target','_blank');				
				o=x.html(); //make all links open in a new tab 
			}
			//o='<small>'+$('<div>').text(o).html()+'</small>';
			//o='<small>'+o+'</small>';
		}
		// console.log('rendering '+type+'-'+data +' as '+o);
		return o;	   
	}

	function print_this(id){
		console.log(id);
		
		var WinPrint = window.open('', '', 'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0');
		
		WinPrint.document.write('<link rel="stylesheet" type="text/css" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">');
		
		// To keep styling
		$('head link').clone().each(function(){ 
			if(this.type='text/css')
			{
				WinPrint.document.head.appendChild(this);
			}
			console.log(this);
		});
/*		var file = WinPrint.document.createElement("link");
		file.setAttribute("rel", "stylesheet");
		file.setAttribute("type", "text/css");
		file.setAttribute("href", 'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css');
		WinPrint.document.head.appendChild(file);
*/
		
		WinPrint.document.write($(id)[0].innerHTML);
		WinPrint.document.close();
		WinPrint.setTimeout(function(){
		  WinPrint.focus();
		  WinPrint.print();
		  WinPrint.close();
		}, 1000);
	}
		
	
	function render_ref(data, type, row, meta) {
		var o=data;
		if(type === 'display'){
			var ref=data;
			o='<i title="Case notes - pending" class="fas fa-comment-alt hidden case-note-pending"></i> '+data;
			if($('#ModalCaseNote'+ref).length==0)
			{
				$('body #app-content').append('<div id="ModalCaseNote'+ref+'" class="modal fade"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><button class="close" type="button" data-dismiss="modal">&times;</button><h4 class="modal-title">Case notes for '+ref+'</h4></div><div class="modal-body"></div><div class="modal-footer"><button type="button" class="btn btn-default print_no" onclick="print_this(\'#ModalCaseNote'+ref+' .modal-content\')">Print</button><button class="btn btn-default" type="button" data-dismiss="modal">Close</button></div></div></div></div>')
			}
		}
		// console.log('rendering '+type+'-'+data +' as '+o);
		return o;	   
	}
   
   function render_special(data, type, row,meta){
        // renders a 'special' column. If the column is called "fred" then there may be "fred url", "fred_cls", "fred_ttp" (tooltip) and "fred_icn" hidden columns which can augment the appearance of the column.
	//	console.log("Rendering a special col");
	//	console.log(type);
		if(type=='display')
		{
			var api = new $.fn.dataTable.Api( meta.settings );
			var title=meta.settings.aoColumns[meta.col].title;
			var caption=meta.settings.aoColumns[meta.col].title;
			var output=data;
			var icn="";
			var cls="";
			var url="";
			if(typeof api.column(title+' icn:name').index() !== 'undefined')
			{
				icn=row[api.column(title+' icn:name').index()];
				output='<i style="font-size:150%" class="fas fa-'+icn+'">&nbsp;</i> '+output;
			}
			if(typeof api.column(title+' ttp:name').index() !== 'undefined')
			{
				caption=row[api.column(title+' ttp:name').index()];
			//	console.log('caption set to' + caption);
				
			}
			if(typeof api.column(title+' cls:name').index() !== 'undefined')
			{
				cls=row[api.column(title+' cls:name').index()];
			}
			if(typeof api.column(title+' url:name').index() !== 'undefined')
			{
				url=row[api.column(title+' url:name').index()];
				if(url!='')
				  output='<a target="_parent" title="'+caption+'"class="'+cls+'" href="'+url+'">'+output + '</a>';
			}
			else
			{
				if(cls!=="")
				{
					output='<div title="'+caption+'" class="'+cls+'">'+output+'</div>'
				}
			}
		//	console.log(data); // the value for the field, e.g. OPP-00000001
		//	console.log(row);  // an array of the row data
		//	console.log(meta);
		//	console.log('title is '+title);
		//	console.log('url index is: ');
		//	console.log(api.column(title+' url:name').index());
		//	console.log('url value is: ');
		//	console.log(row[api.column(title+' url:name').index()]);
			return output;
		}
		else
			return data;
    }	

	function loadnotes(){
		var sid= typeof parent.FS !== "undefined" && parent.FS !== null ? (ref = parent.FS.Auth) !== null ? ref.session['auth-session'] : void 0 : void 0;
		var notescount=$('.case-note-pending').length;
		$('.case-note-pending').each(function(index)
		{
			var obj=$(this);
			var ref=obj.parent().text().trim();
			
			if($('#ModalCaseNote'+ref).length==0)
			{
				$('body #app-content').append('<div id="ModalCaseNote'+ref+'" class="modal fade"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><button class="close" type="button" data-dismiss="modal">&times;</button><h4 class="modal-title">Case notes for '+ref+'</h4></div><div class="modal-body"></div><div class="modal-footer"><button class="btn btn-default" type="button" data-dismiss="modal">Close</button></div></div></div></div>')
			}
			if($('#ModalCaseNote'+ref+' .modal-body').html()=='')
			{	
				var url=document.location.origin+'/api/cdb/case-notes/get?case_id='+ref+'&sid='+sid;
				obj.addClass('case-note-fetching').removeClass('case-note-pending');
				console.log(url);
				$.ajax(url).done(function(data){
					console.log(data.data.notes.length);
					if(data.data.notes.length>0)
					{
						//put the content into the modal
						var content=$.map(data.data.notes,function(row){
							
							return '<div class="alert alert-'
								+(row.action_required==-1?'info':(row.action_required==1?'warning':'success'))
								+'" role="alert"><h4 class="alert-heading">'+row.user_display_name+', '+moment(row.date_created).fromNow() +'</h4>'
								+(row.action_required==0?'<strong>Actioned by '+row.actioned_user_display_name+' '+moment(row.actioned_date).fromNow()+'</strong><br/>':'')
								+(row.action_required==1?'<strong>Action Outstanding!</strong><br/>':'')
								+row.note
								+'</div>'; 
						}).reverse().join('<hr/>');
						$('#ModalCaseNote'+ref+' .modal-body').html(content);
						if(obj.parent().is(':visible')){
							$('#ModalCaseNote'+ref).removeClass('DO-NOT-PRINT');
						}
						console.log(data.data.notes);
						//add the button to the cell
						obj.parent().empty().append('<button class="btn btn-info btn-sm" type="button" data-toggle="modal" data-target="#ModalCaseNote'+ref+'">'+ref+' '+data.data.notes.length.toString()+' Notes</button>');
						// remove the pending class
					}
					else
					{
						$('#ModalCaseNote'+ref+' .modal-body').html('No notes recorded.');
						
					}
					
					obj.addClass('case-note-done').removeClass('case-note-fetching');
				});					
			}
			
		});
		// console.log('loadnotes is done');
		// console.log($('.case-note-pending').length);
		return notescount;
	}
	
	/*
	
<!-- Trigger the modal with a button -->
<p><button class="btn btn-info" type="button" data-toggle="modal" data-target="#myModal">Open Modal</button></p>
<!-- Modal -->
<div id="myModal" class="modal fade">
<div class="modal-dialog"><!-- Modal content-->
<div class="modal-content">
<div class="modal-header"><button class="close" type="button" data-dismiss="modal">&times;</button>
<h4 class="modal-title">Modal Header</h4>
</div>
<div class="modal-body">
<p>Some text in the modal.</p>
</div>
<div class="modal-footer"><button class="btn btn-default" type="button" data-dismiss="modal">Close</button></div>
</div>
</div>
</div>
*/
	
	function draw_results_table(data,config) {
		var filtercols=[];
		var rows;
        var cols;

		if(typeof config.tableconfig =='undefined')
		{
			config.tableconfig='frlipBt'; // default sequence of datatables elements- filtering, processing display, length changer, info, pagination, buttons, table
		}
		if(typeof config.tablebuttons =='undefined')
		{
			config.tablebuttons=['csv','colvis']; // default sequence of buttons elements- CSV download, Column visibility.
		}
		var $t = $('<table>');
		$t.addClass('display').addClass('compact');
		$('#'+config.tab+' .results').empty().append($t);

		var rr_function;
		if(!$.isEmptyObject(data.transformed.rows_data))
		{
			//data.transformed.rows_data will be an array-like object that contains an object of name:value pairs. we need to abstract this to a nested array of rows data.
			rows=$.map(data.transformed.rows_data, function(value, index) {return [$.map(value,function(value,index){return [value]})];});
			//the Object.keys thing below will get the first row object from the returned data. We then create a list of titles from it.
			cols=$.map(data.transformed.rows_data[Object.keys(data.transformed.rows_data)[0]],function(value,index){
				var v = true; //visible
				var o = true; //orderable
				var r = $.fn.dataTable.render.ellipsis( 200, true ) //default to clip after 200 chars
				var cc;
				if(index.toLowerCase()=='response')
				{
					r=render_response;
					index='';
					o=false;
				}
				if(index.toLowerCase()=='reference'||index.toLowerCase()=='ref')
				{
					r=render_ref;
				}
				if(index=='rowclass_hhh')
				{
					// we need to bind a custom render function to add the data as a class to the row.
					rr_function= function(row,data,dataIndex){
						$(row).addClass(data[this.api().column('rowclass:name').index()]);
						};
				}
				// if((index=="process_tablename")||(index=="view_url")||(index=="id")||(index=="stage_tablename")||(index=="processid")){v=false}
				if(index.slice(-4)=="_xml") //special columns
				{
					index=index.slice(0,-4); //take off the _xml
					r=render_xml;
				}			
				if(index.slice(-3)=="_md") //markdown columns
				{
					index=index.slice(0,-3); //take off the _md
					r=render_markdown;
				}	
				if(index.slice(-4)=="_sss") //special columns
				{
					index=index.slice(0,-4); //take off the _sss
					r=render_special;
				}
				if(index.slice(-4)=="_url") //columns that end in _url should be rendered as buttons
				{
					v=true;
					index=index.slice(0,-4); //take off the _url
					r=render_url;
					o=false;
				}
				if(index.slice(-4)=="_nnn") //columns that should have range number slider filter criteria are suffixed with _nnn
				{
					index=index.slice(0,-4);
					filtercols.push({
						column_name: index,
						filter_type: 'range_number_slider'
					});
				}
				if(index.slice(-4)=="_rrr") //columns that should have picklist filter criteria are suffixed with _rrr
				{
					index=index.slice(0,-4);
					filtercols.push({
						column_name: index,
						filter_type: 'multi_select',
						select_type: 'select2',
						case_insensitive: 'true'
					});
				}
				if(index.slice(-4)=="_ddd") //columns that should have date range filter criteria are suffixed with _ddd
				{
					index=index.slice(0,-4);
					filtercols.push({
						column_name: index,
						filter_type: 'range_date',
						date_format: 'dd MM yyyy'
				
					});
				}
				if(index.slice(-4)=="_dtf") //columns that should have date time filter criteria are suffixed with _dtf
				{
					index=index.slice(0,-4);
					filtercols.push({
						column_name: index,
						filter_type: 'range_date',
						date_format: 'dd/mm/yyyy',
						moment_date_format: 'DD/MM/YYYY HH:mm:ss'
            

					});
				}
				
				if(index.slice(-4)=="_hhh") //columns that should be hidden are suffixed with _hhh
				{
					v=false;
					index=index.slice(0,-4);
				}
				//if((index=='reference')||(index=='process_name')) r=format_url; //use a custom rendering function to make the column a hyperlink
				return {"title":index.replace(/_/g,' ').trim(),"name":index.replace(/_/g,' ').trim(),"visible":v, "render":r, "orderable": o, "createdCell":cc}
			});
			console.log('cols');
			console.log(cols);
			console.log('got how many rows?'+rows.length);
			if(config.counter) $('#'+config.counter).html(rows.length);
			$('#'+config.tab+' .spinner .msg').html('Drawing results...').show();
			
					
			
			var myTable=$t.DataTable( {dom: config.tableconfig, data: rows, columns: cols, "scrollX": true, 
				buttons:config.tablebuttons, 
				"createdRow":rr_function, 
				"configtab":config.tab, 
				"sScrollX": "100%", 
				"sScrollXInner": "100%",
				drawCallback:(config.map?function(a){update_map(a,this.api(),config)}:null),
				"order":(config.order?config.order:[[0, "desc"]])	}			);
			myTable.on( 'draw.dt', function () {
				// add the DO-NOT-PRINT class to all the modals, then remove from those that are still in the table
				$('[id^=ModalCase]').addClass('DO-NOT-PRINT')
				$('[id^=ModalResponse]').addClass('DO-NOT-PRINT')
				$('button[data-target]:visible').each(function(){
					var t=$(this).data("target"); 
					$(t).removeClass('DO-NOT-PRINT');
				});
				if(loadnotes()>0 && $(this).dataTable().columns)
				{
					$(this).dataTable().columns.adjust();	//fnAdjustColumnSizing(); 
				}
				;
				
			} );
			
			filtercols.forEach(function(x){x.column_number=myTable.column(x.column_name.replace(/_/g,' ')+':name').index()});           
			setTimeout(function(){
				if(filtercols.length>0) 
				{
						yadcf.init(myTable, filtercols,'header');
						console.log('resizing');
						myTable.columns.adjust();	
				}
			//	loadnotes();
			//	$('#'+config.tab+' th:first').trigger('click');
			}, 2000);	
			
			// Add event listener clicking on table and showing on map
             $('#'+config.tab).on('click', 'td', function () {
                 console.log('update map on table click');
                var tr = $(this).closest('tr');
                var row = myTable.row(tr);
                // This is our class-populated row number
                var idx = Number(tr.attr('class').match(/(?:row-)(\d+)/)[1]) + 1;
                // Zoom to clicked record on map
                console.log('centre on '+idx);
                maplace.ViewOnMap(idx);
            }); 
			

		}
		else
		{
			$('#'+config.tab+' .spinner').hide();
		//	$('#'+config.tab+' .spinnermsg').html('No data').show();
		//	$('#'+config.tab+' .nodatamsg').show();
		}
	}
	function draw_results_list(data,config) {
		// put name and display into a html select field
		var $dropdown = $('select#'+config.tab);
		var x= $('#'+config.tab).text();
		//$dropdown.val();
		$dropdown.find('option').remove().end()
		$.each(data.transformed.rows_data, function() {
			$dropdown.append($("<option />").val(this.name).text(this.display));
		});
		$dropdown.val(x);
	}
	
	function draw_results_buttons(data,config) {
		// put name and display into a bootstrap button list
		var $buttonbox = $('#'+config.tab);
		var selected= $('#'+config.variable).text(); //data must be comma separated list of selected buttons - NO SPACES
		$buttonbox.find('a:not(.selectall)').remove().end(); //remove existing buttons
		$.each(data.transformed.rows_data, function() {
			//if this.name is present within selected, set the button to be active
			var active= selected.split(',').includes(this.name);
			 
			$buttonbox.append($('<a role="button" class="buttonpusher" type="button" data-toggle="button" />').val(this.name).text(this.display).addClass(config.class+' '+(active?' active':'')).attr('config',config.variable).attr('aria-pressed',active.toString()).click(function(){buttonpush(this);refreshLookups();	}));
		});
		// 
	}
	
	function draw_results_template(data,config) {
		// search+replace here
		var myShowdown = new showdown.Converter({tables: true, strikethrough: true}); 
		var rowcount=0;
		if(config.type==="template")
		{
			// $('#'+config.tab+' .results').empty()
			$('#'+config.tab+' .results').children().not('.keep').empty().remove();	
		}
		// loop through rows, appending a template copy
		for (var rec in data.transformed.rows_data) {
			if (data.transformed.rows_data.hasOwnProperty(rec)) {
				// do stuff
				rowcount++;
				if(config.type==="template")
				{
					var $t = $('#'+config.template).clone();	//either clone a template, or grab the body for a GLOBAL replacement
				}
				else
				{
					var $t=$('body');
				}
				for( var prop in data.transformed.rows_data[rec]) {
					if (data.transformed.rows_data.hasOwnProperty(rec)) {
						// console.log('replace '+prop+' with '+data.transformed.rows_data[rec][prop]);
						var fieldVal=data.transformed.rows_data[rec][prop];
						$t.html($t.html().split('####'+prop+'####').join(fieldVal));
						if(prop.slice(-3)=='_md') //markdown content in column	
							fieldVal = myShowdown.makeHtml(fieldVal);
						else if(prop.slice(-3)=='_rw') //raw content in column	
							fieldVal = fieldVal;
						else fieldVal=escapeHtml(fieldVal);
						$t.html($t.html().split('###'+prop+'###').join(fieldVal)); 
								/* global templates will break dynamic event bindings on anything inside the body. Use something like this to avoid the problem:
								$('body').on('click','.childDiv', {} ,function(e){
								//insert your code here
								})
								*/
					}
				}
				$t.html($t.html().split('###rownum###').join(rowcount));
				if(config.type==="template")
				{
					$t.removeClass('oco_template').attr('id','result_'+rec.split(' ').join('_'));
		//						console.log('removing class from result div');
					$('#'+config.tab+' .results').append($t);
					$('#'+config.tab+' .results .keep').insertAfter($t); //bubble the keep elements down, if they exist
				}
				if(data.transformed.rows_data[rec].step_num)
				{
					var stepnum=data.transformed.rows_data[rec].step_num-1;
					// add the 'done' class to the first ###stagenum###-1 elements of the progress bar
					$('#'+config.tab+' .results .arrow-steps .step').slice(0,stepnum).addClass('done');
					// add the 'current' class to the ###stagenum### element of the progress bar
					$('#'+config.tab+' .results .arrow-steps .step:eq('+stepnum+')').addClass('current');
				}
			}
		}
		// post processing - format dates using moment, format money fields to locale strings
		var selector='';
		if(config.type==="template") { selector='#'+config.tab+' .results'}
		else {
			selector='body';
			if(typeof(config.sub)=='undefined') $('.hideuntilglobal').removeClass('hideuntilglobal');
		}
		$(selector+' .momentfromnow').each(function(i,v){
			var d=moment($(v).html(),['YYYY-MM-DD','DD/MM/YYYY HH:mm:ss'],true);
			if(d.isValid()){
				$(v).html(d.fromNow()).attr('title',d.format('LLLL')).removeClass('momentfromnow');
			}
			});
		$(selector+' .momenttonow').each(function(i,v){
			var d = moment($(v).html());
			if(!d.isValid()) d=moment($(v).html(),'DD/MM/YYYY HH:mm:ss');
			if(d.isValid())  $(v).html(d.toNow()).attr('title',d.format('LLLL')).removeClass('momenttonow')
			});
		$(selector+' .momentlocaldatetime').each(function(i,v){
			var d = moment($(v).html());
			if(!d.isValid()) d=moment($(v).html(),'DD/MM/YYYY HH:mm:ss');
			if(d.isValid())  $(v).html(d.format('LLLL')).removeClass('momentlocaldatetime')
			});					
		$(selector+' .momentlocaldate').each(function(i,v){
			var d = moment($(v).html());
			if(!d.isValid()) d=moment($(v).html(),'DD/MM/YYYY HH:mm:ss');
			if(d.isValid())  $(v).html(d.format('ddd D MMM YYYY')).removeClass('momentlocaldate')
			});
		$(selector+' .momentlocaldatenoyear').each(function(i,v){
			var d = moment($(v).html());
			if(!d.isValid()) d=moment($(v).html(),'DD/MM/YYYY HH:mm:ss');
			if(d.isValid())  $(v).html(d.format('ddd D MMM')).removeClass('momentlocaldate')
			});
		// if there is a slick carousel, initialise it
		if($(selector+'.slickcarousel').length > 0)
		{
			// $(selector+'.slickcarousel').slick('unslick')
			$(selector+'.slickcarousel').slick();
		}
		// format money fields
		$(selector+' .results .money').not(':contains(###)').each(function(i,v){$(v).text(Number($(v).text()).toLocaleString('en'))}).removeClass('money');
		if(typeof(config.sub)=='undefined')
		{
			// add 'copy to clipboard' script to anything that has the copycursor class
			$(selector+' .copycursor.unbound').not(':contains(###)').click(function(){copyToClipboard(this);}).removeClass('unbound');
			// bind the hideswitch function to any controls that need it
			$(selector+' .hideswitch.unbound').not(':contains(###)').click(function(){hideswitch(this);}).removeClass('unbound');
			// bind the tablefilter function to any controls that need it
			$(selector+' .tablefilter.unbound').not(':contains(###)').click(function(){tablefilter(this);}).removeClass('unbound');
			// rewrite any markdown inside oco_country_list to include flags
			$(selector+' div.oco_country_list.unbound table td:first-child').not(':contains(###)').each(function(){$(this).addClass('flag-icon-'+$(this).html().substring(0,2));$(this).html($(this).html().slice(2));});
			$(selector+' div.oco_country_list.unbound').not(':contains(###)').removeClass('unbound');
		}
		// set the counter to be the rowcount
		if(config.counter){
			$('.'+config.counter).each(function(){$(this).html(rowcount)}); 
			$('#'+config.counter).html(rowcount); // old code to add preceding zero: ('0'+rowcount).slice(-2));
		}
	}

	
    function draw_results_plotly(data, config) {
		var r,i,j,outputdata;
		var layout = {};
		$.extend(layout, config.plotly_layout);
		r=data.transformed.rows_data;
		console.log(r);
		$('#'+config.tab).empty();
		switch(config.graph){
		case "violin":
			outputdata=$.map(r,function(row){return JSON.parse(row.the_json); });
			//console.log(outputdata);
			Plotly.newPlot(config.tab, outputdata, layout,{responsive: true});
			break;
		case "stackedbar": // see https://github.com/plotly/plotly.js/issues/1835 for info and simple example
			console.log('plotly debug');
			console.log(config);
			console.log(r);
			
			outputdata=$.map(r,function(row){
				var x = {
				  x: ["Created", "Completed", "Open"],
				  y: [row.created, row.completed, row.open],
				  type: "bar",
				  name: row.breakdown, 
				  wk: row.wk,
				  barmode: 'stack', marker: {color: '#FFC'}
				}
				return x; 
				});
			// get a distinct list of the weeks. Use the old steam method for IE support
			// var axes=[...new Set($.map(outputdata,function(row){return row.wk}))];
			//var names=[...new Set($.map(outputdata,function(row){return row.name}))];			
			var axes=$.map(outputdata,function(r){return r.wk}).filter(function(value,index,self){return self.indexOf(value)===index;})
			
			var names=$.map(outputdata,function(r){return r.name}).filter(function(value,index,self){return self.indexOf(value)===index;})

			var coolors = [
				{"index":0, "name":"tangelo", data:['#efa876', '#ed9c62', '#eb8f4f', '#e9833b', '#e77728', '#d26d25', '#be6221', '#a9571e', '#934c1a', '#7e4116']},
				{"index":1, "name":"light sea green", data:['#89d3d3', '#76cccc', '#62c4c5', '#4fbdbe', '#3bb6b7', '#28afb0', '#25a0a0', '#219091', '#1e8081', '#1a7071']},
				{"index":2, "name":"meat brown", data:['#f5d58e', '#f3ce7b', '#f1c768', '#f0c055', '#eeb942', '#edb230', '#d8a22c', '#c29228', '#ad8223', '#97721f']},
				{"index":3, "name":"queen blue", data:['#81aab8', '#6c9cac', '#578ea1', '#428095', '#2d7289', '#19647e', '#175b73', '#155268', '#13495c', '#104051']}
			]	
			// need to translate the xaxis from week name and set colour array based on name		
			$.each(outputdata,function(index,value){
				console.log(value);
				console.log(axes.findIndex(function(el,ind,arr){return el==value.wk}));
				value.xaxis='x'+(1+axes.findIndex(function(el,ind,arr){return el==value.wk}));
				value.marker.color=coolors[names.findIndex(function(el,ind,arr){return el==value.name})%4].data;
				value.showlegend=(value.xaxis=='x1');
				});
			var subplotwidth=(1/axes.length); 
			console.log(subplotwidth);
			console.log(outputdata);
			layout.barmode= "stack";
			
			$.each(axes,function(index,value){
				layout['xaxis'+(index==0?'':index+1)]={
				  domain: [subplotwidth*index, (subplotwidth*index)+subplotwidth],
				  tickangle: -45,
				  anchor: 'x'+(index+1), //(index==0?'':index), 
				  title: value     
				};
			});
			console.log('my layout is');
			console.log(layout);
			/*layout={
				barmode: "stack",
				xaxis: {
				  domain: [0, 0.25],
				  tickangle: 70,
				  anchor: 'x1', title: '2018 wk46'      
				},
				xaxis2: {
				  domain: [0.25, 0.5],
				  tickangle: 70,
				  anchor: 'x2', title: '2018 wk47'
				},
				xaxis3: {
				  domain: [0.5, 0.75],
				  tickangle: 70,
				  anchor: 'x3', title: '2018 wk48'
				},
				xaxis4: {
				  domain: [0.75, 1],
				  tickangle: 70,
				  anchor: 'x4', title: '2018 wk49'
			}};*/
			
			Plotly.newPlot(config.tab, outputdata, layout,{responsive: true});
			break;
		case "debug":
			console.log('plotly debug');
			console.log(config);
			console.log(r);
			break;
		case "generic":
			// we have 3 columns. these are the x, y and trace. The names are not important but the sequence is.
			var tracedata=(config.plotly_tracedata?config.plotly_tracedata:{'type':'bar'});
			//this will set traces to be an array of the distinct values found in the 3rd column
			var traces=$.map(r,function(row){return row[Object.keys(row)[2]] ;}).filter(function(value,index,self){return self.indexOf(value)===index;});
			// this sets up the x and y arrays for each trace in the outputdata variable
			outputdata=$.map(traces,function(row){ return $.extend({'x':[], 'y':[], 'name':row},tracedata)});
			// this will push each stat onto the x and y arrays in the appropriate trace
			$.map(r, function(row) {
				outputdata[traces.indexOf(row[Object.keys(row)[2]])].x.push(row[Object.keys(row)[0]]);
				outputdata[traces.indexOf(row[Object.keys(row)[2]])].y.push(row[Object.keys(row)[1]]);
			});
			Plotly.newPlot(config.tab, outputdata, layout,{responsive: true});			
			break;
		case "pie":
			var tracedata=(config.plotly_tracedata?config.plotly_tracedata:{'type':'pie'});
			outputdata=[$.extend({values:$.map(r,function(row){return row.y}),labels:$.map(r,function(row){return row.series})},tracedata)]
			Plotly.newPlot(config.tab, outputdata, layout,{responsive: true});			
			break;
		case "bar":
			// setup outputdata
			var trace1 = {
			  x: $.map(r,function(row){return row.wk}),
			  y: $.map(r,function(row){return row.created}),
			  name: 'Created',
			  type: 'bar'
			};

			var trace2 = {
			  x: $.map(r,function(row){return row.wk}),
			  y: $.map(r,function(row){return row.completed}),
			  name: 'Completed',
			  type: 'bar'
			};

			var trace3 = {
			  x: $.map(r,function(row){return row.wk}),
			  y: $.map(r,function(row){return row.open}),
			  name: 'Open',
			  type: 'bar'
			};

			//			console.log r;
			outputdata = [trace1, trace2, trace3];
			
			Plotly.newPlot(config.tab, outputdata, layout,{responsive: true});
			break
		case "line":
			var linedata = [
				{type:"scatter",mode:"lines",name:"Total submissions", x:unpack(r,'date'), y:unpack(r,'daily_submissions')},
				{type:"scatter",mode:"lines",name:"Dash submissions", x:unpack(r,'date'), y:unpack(r,'dash_submissions')},
				{type:"scatter",mode:"lines",name:"Self submissions", x:unpack(r,'date'), y:unpack(r,'self_submissions')},
				{type:"scatter",mode:"lines",name:"Service submissions", x:unpack(r,'date'), y:unpack(r,'service_submissions')},
				{type:"scatter",mode:"lines",name:"Forms submissions", x:unpack(r,'date'), y:unpack(r,'forms_submissions')}]
			layout= {
				  title: 'Completed cases volume trend', 
				  xaxis: {
					autorange: true,
					range: [$('#daterangestart').html(),$('#daterangeend').html()], 
					rangeselector: {buttons: [
						{
						  count: 1, 
						  label: '1w', 
						  step: 'week', 
						  stepmode: 'backward'
						}, 
						{
						  count: 1, 
						  label: '1m', 
						  step: 'month', 
						  stepmode: 'backward'
						}, 
						{
						  count: 6, 
						  label: '6m', 
						  step: 'month', 
						  stepmode: 'backward'
						}, 
						{step: 'all'}
					  ]}, 
					rangeslider: {range: [$('#daterangestart').html().substring(6,10)+'-'+$('#daterangestart').html().substring(3,5)+'-'+$('#daterangestart').html().substring(0,2),
										  $('#daterangeend').html().substring(6,10)+'-'+$('#daterangeend').html().substring(3,5)+'-'+$('#daterangeend').html().substring(0,2)]}, 
					type: 'date'
				  }, 
				  yaxis: {
					autorange: true, 
					type: 'linear'
				  }
				};		
			Plotly.newPlot(config.tab, linedata, layout,{responsive: true});
			break;
		default:
			$('#'+config.tab+' .spinner .msg').html('Invalid plotly graph type: '+config.graph).show();
		}
	
	}
	
	function postprocess(h) {
		// takes a html string and returns a string following processing of momentfromnow, markdown and other directives specified in css classes
		var x = jQuery.parseHTML(h);
		
		$(x).find('.momentfromnow').each(function(i,v){
			var d=moment($(v).html(),['YYYY-MM-DD','DD/MM/YYYY HH:mm:ss'],true);
			if(d.isValid()){
				$(v).html(d.fromNow()).attr('title',d.format('LLLL')).removeClass('momentfromnow');
			}
			});
		$(x).find('.momenttonow').each(function(i,v){
			var d = moment($(v).html());
			if(!d.isValid()) d=moment($(v).html(),'DD/MM/YYYY HH:mm:ss');
			if(d.isValid())  $(v).html(d.toNow()).attr('title',d.format('LLLL')).removeClass('momenttonow')
			});
		$(x).find('.momentlocaldatetime').each(function(i,v){
			var d = moment($(v).html());
			if(!d.isValid()) d=moment($(v).html(),'DD/MM/YYYY HH:mm:ss');
			if(d.isValid())  $(v).html(d.format('LLLL')).removeClass('momentlocaldatetime')
			});					
		$(x).find('.momentlocaldate').each(function(i,v){
			var d = moment($(v).html());
			if(!d.isValid()) d=moment($(v).html(),'DD/MM/YYYY HH:mm:ss');
			if(d.isValid())  $(v).html(d.format('ddd D MMM YYYY')).removeClass('momentlocaldate')
			});
		$(x).find('.momentlocaldatenoyear').each(function(i,v){
			var d = moment($(v).html());
			if(!d.isValid()) d=moment($(v).html(),'DD/MM/YYYY HH:mm:ss');
			if(d.isValid())  $(v).html(d.format('ddd D MMM')).removeClass('momentlocaldate')
			});
		// if there is a slick carousel, initialise it
	//	if($(x,'.slickcarousel').length > 0)
	//	{
	//		// $(selector+'.slickcarousel').slick('unslick')
	//		$(x,'.slickcarousel').slick();
	//	}
		// format money fields
		$(x).find('.results .money').not(':contains(###)').each(function(i,v){$(v).text(Number($(v).text()).toLocaleString('en'))}).removeClass('money');
		//if(typeof(config.sub)=='undefined')
		//{
			// add 'copy to clipboard' script to anything that has the copycursor class
			$(x).find('.copycursor.unbound').not(':contains(###)').click(function(){copyToClipboard(this);}).removeClass('unbound');
			// bind the hideswitch function to any controls that need it
			$(x).find('.hideswitch.unbound').not(':contains(###)').click(function(){hideswitch(this);}).removeClass('unbound');
			// bind the tablefilter function to any controls that need it
			$(x).find('.tablefilter.unbound').not(':contains(###)').click(function(){tablefilter(this);}).removeClass('unbound');
			// rewrite any markdown inside oco_country_list to include flags
			$(x).find('div.oco_country_list.unbound table td:first-child').not(':contains(###)').each(function(){$(this).addClass('flag-icon-'+$(this).html().substring(0,2));$(this).html($(this).html().slice(2));});
			$(x).find('div.oco_country_list.unbound').not(':contains(###)').removeClass('unbound');
		//}
		var myShowdown = new showdown.Converter({tables: true, strikethrough: true}); 			
		$(x).find('.newmarkdown').each(function(i,v){
			
			o=myShowdown.makeHtml($(v).html());
			if(o!=='')
			{
				var xx = $('<span>'+o+'</span>');
				$('a:not(target)',x).attr('target','_blank');				
				o=xx.html(); //make all links open in a new tab 
			}
			$(v).html(o).removeClass('newmarkdown')			
		});
		
		return $(x).html();
	}
    function update_map(settings,api,config){
        console.log('update map');
		

        //var api = this.api();
        var linkIdx= api.column('view:name').index();
        var locIdx= api.column('maplocation:name').index();
        var iconIdx= api.column('mapicon:name').index();
        if(typeof(locIdx)!='undefined')
        {
            // it's on. we've found a location column so we're gonna build a map.
            var markers = {
                'locations': []
            };
            $('#'+config.map).show();  
            // Page: all / search: applied - makes sure all pages are used with the applied filter
			var mycols=[];
			api.columns().every(function() {mycols.push( $(this.header()).children('.DataTables_sort_wrapper').text())})
            api.rows({page: 'all', search: 'applied'}).every(function(rowIdx, tableLoop, rowLoop) {
                var data = this.data();
                if((data[locIdx].split(', ').length==2) && (data[locIdx]!="0, 0")&& (data[locIdx]!=", ")) //the location field's content must be in the format "lat, lng" and not be "0, 0"
                {    
                    // console.log(data[linkIdx]);
                    var loc = {
                        
                        'lat': data[locIdx].split(', ')[0],
                        'lon': data[locIdx].split(', ')[1],
                        'html': '<a target="_parent" href="'+data[linkIdx]+'">'+data[0]+'</a>',
                        'icon':  (typeof(iconIdx)!='undefined' ? data[iconIdx] : '')
                    };
					if(config.maptemplate){
						loc.html = $('#'+config.maptemplate).html();
						mycols.forEach(function(c,i){
							loc.html =loc.html.split('###'+c+'###').join(data[i]);
						});						
					}
					else
					{
						mycols.forEach(function(c,i){
							loc.html=loc.html+'<br/><b>'+c+'</b>: '+data[i];
						});
					}
					// do postprocssing on loc to handle markdown, momentfromnow, etc
				   loc.html=postprocess(loc.html);
				   markers.locations.push(loc); 
                   var row = this.node();
                    // Hack that adds a class with the row number to the tr (using rowLoop since that's the "natural"
                    // order and not the fixed rowIdx one used by dataTables). Whenever we sort or filter rows change
                    // but this way we keep a natural order of 0, 1, 2... (i.e. first item of the table will always be 0).
                    // The map markers array contains the visibile data only, and this allows us to always link record 0
                    // in the table with item 0 in the markers array
                    $(row).removeClass (function (index, css) {
                        // Remove all classes matching a string
                        // http://stackoverflow.com/questions/2644299/jquery-removeclass-wildcard/5182103#5182103
                        return (css.match (/\brow-\d+/g) || []).join(' ');
                    });
                    $(row).addClass('row-'+ rowLoop);
                }

            });
            if(maplace.Loaded){
                maplace.SetLocations(markers.locations,true); 
            }   
            else 
                maplace.Load({locations: markers.locations}); 
        }
        else
        {
            $('#'+config.map).hide();
        }

  }  

	function draw_results(data, config) {
//		console.log('drawing results');
        $('#'+config.tab+' .spinner .msg').html('Processing results...').show();
//		console.log("got results!");
        //console.log(data);
	   $('#'+config.tab+' .results').children().not('.keep').empty().remove();	
		if(config.map && typeof(maplace)=='undefined')
		{
			maplace = new Maplace({
				shared: {zoom: 16},
				directions_options: {
					travelMode: google.maps.TravelMode.DRIVING,
					unitSystem: google.maps.UnitSystem.METRIC,
					optimizeWaypoints: false,
					provideRouteAlternatives: false,
					avoidHighways: false,
					avoidTolls: false
				},
				map_options: {set_center: config.map.center, zoom:config.map.zoom}
				}).Load();
		}
	
	   if(!$.isEmptyObject(data.transformed.rows_data))
	   {
		   (config.nodata)?$('#'+config.nodata).hide().addClass('hidden'):void 0;
			switch(config.type){
				case "global":
					draw_results_template(data,config);
					break;
				case "table":
					draw_results_table(data,config);
					break;
				case "template":
					draw_results_template(data,config);
					break;
				case "selectlist":
					draw_results_list(data,config);
					break;
				case "buttons":
					draw_results_buttons(data,config);
					break;
				case "plotly":
					draw_results_plotly(data,config);
					break;
				default:
					$('#'+config.tab+' .spinner .msg').html('Invalid configuration template - '+config.type).show();
			}
			if(typeof(config.sub)=='object')
			{
				// for every sub, for every row, call get_data.
				
				for (var i=0; i < config.sub.length; i++)
				{
					for (var j=0; j < data.transformed.select_data.length; j++)
					{
						// need to clear the target once, then suppress clearing out when each bit of the results come back.
						
						get_data(config.sub[i], data.transformed.rows_data[j]);
					}
				}		
			}
	   }
	   else
	   {
			$('#'+config.tab+' .spinner .msg').html('No data').show();
			(config.nodata)?$('#'+config.nodata).show().removeClass('hidden'):void 0;
			(config.map)?$('#'+config.map).hide():void 0;
	   }
		$('#'+config.tab+' .spinner').hide();

	}

    function log_error(c,e) {
        $('#spinnermsg').html('Error attempting '+c+' : '+e).show();
    }
    
    
    function run_lookup(lookup_id, tokens, on_success, on_error) {
  
  //Pass in:
  //lookup_id - the ID of the Forms lookup you want to run. To get this, edit the lookup and look at the end of the URL
  //tokens - JS object of name-value pairs, e.g. var T={"mytoken":"myvalue"};
  //on_success - function that receives the JSON data as an argument
  //on_error - function that recieves the inevitable errors.
  
  var lookup_body, ref, sid;
  if (typeof parent.FS === 'undefined' ) {
    return alert("Unable to find AchieveForms session id");
  } else {
    sid = typeof parent.FS !== "undefined" && parent.FS !== null ? (ref = parent.FS.Auth) !== null ? ref.session['auth-session'] : void 0 : void 0;
    if (!sid) {
        alert("Unable to find AchieveForms session id");
        return;
    }
    lookup_body = {
      stopOnFailure: true,
      usePHPIntegrations: true,

      user: { },
      formId: "",
      formValues: {
        "Section 1": { }
      },
      isPublished: false,
      formName: "",
      tokens: {
        port: "",
        host: "",
        site_url: "",
        site_path: "",
        site_origin: "",
        user_agent: "",
        site_protocol: "",
        session_id: "",
        product: "",
        formLanguage: "",
        authenticationType: "",
        isAuthenticated: true,
        api_url: "",
        transactionReference: "",
        transaction_status: "",
        published: false,
        timeZone: ""
      },
      env_tokens: {
        weburl: ""
      },
      site: "",
      created: "",
      reference: "",
      formUri: ""
    };
    $.extend(lookup_body.tokens, tokens);
    var tt = {};
    $.each(tokens,function(a,b){tt[a]={'name':a,'value':b}; })
    $.extend(lookup_body.formValues['Section 1'],tt);
//   console.log(lookup_body);
    return $.ajax({
      type: 'POST',
      contentType: 'application/json',
      url: "/apibroker/runLookup?app_name=AchieveForms&sid=" + sid + "&id=" + lookup_id,
// v1 method
//      url: "/apibroker/?api=RunLookup&app_name=AchieveForms&sid=" + sid + "&id=" + lookup_id,


      data: JSON.stringify(lookup_body),
      success: function(data) {
        var e, ref1, ref2, ref3, response_data;
        response_data=data.integration;
//        try {
//          response_data = JSON.parse((ref1 = data.integration) != null ? ref1.response : void 0);
//        } catch (error1) {
//          e = error1;
//          console.log("Couldn't parse JSON: ", (ref2 = data.integration) != null ? ref2.response : void 0);
//          response_data = null;
//        }

        console.log(response_data);
        if (!response_data) {
          return on_error();
        } else if(response_data.transformed){
          return on_success(response_data);
        }
        else {
          return on_error();
        
//        } else if ((response_data.messages !== null) && (response_data !== null ? (ref3 = response_data.messages[0]) !== null ? ref3.type : void 0 : void 0) === 'ERROR') {
//          return on_error(response_data.messages[0].message);
//        } else {
//          return on_success(response_data);
        }
      },
      error: function(error) {
        console.log(error);
        return on_error();
      }
    });
  }
} 


// enable/disable print mode
var tablepages = {}; //local var to remember pagination settings so we can change back later
		
function togglePrint()
{
	if($('.oco_pagebuilder.printready').length==0)
	{
		$('#printhelp div.printmode').addClass("on");
		//remove the bootstrap stuff that breaks the background colours. There is a rule in bootstrap.min.css that 
		for(var i=0; i<document.styleSheets.length; i++) {
			var sheet = document.styleSheets[i];
			if(sheet.href && sheet.href.indexOf('bootstrap')>0 ) {
				for(var j=0; j<sheet.rules.length; j++) {
					var rule = sheet.rules[j];
					if(rule.conditionText && rule.conditionText=='print'){
						for(var k=0; k<rule.cssRules.length; k++) {
							var cssrule = rule.cssRules[k];
							if(cssrule.selectorText=='*'){
								// console.log(cssrule);
								rule.deleteRule(k);
							}
						}
					}
				}
			}
		}
		// set all dataTables to have 5000 records per page
		$.fn.dataTable.tables().forEach(function(x){
			var t = $('#'+x.id).DataTable();
			var o = {};
			if(typeof(t.page.info())!='undefined'){
				tablepages[x.id]=t.page.info().length;
				t.page.len(5000).draw();
			}
			});

		// hide the parent navbar stuff
		$(parent.document).find('#toolbar').hide();
		$(parent.document).find('#header').hide();
		$(parent.document).find('#navigation').hide();
		$(parent.document).find('.footer').hide();
		
		// add the printready class to outer object
		$('.oco_pagebuilder').addClass('printready')
		
		// make the tab-content go full width
		$('.tab-content').removeClass('col-md-10').addClass('col-md-12');
		//window.print();
	}
	else
	{
		$('#printhelp div.printmode').removeClass("on");
		// restore dataTables pagination
		$.fn.dataTable.tables().forEach(function(x){
			var t = $('#'+x.id).DataTable();
			if(typeof(t.page.info())!='undefined'){
				t.page.len(tablepages[x.id]).draw();
			}
			});
			
		// show the parent navbar stuff
		$(parent.document).find('#toolbar').show();
		$(parent.document).find('#header').show();
		$(parent.document).find('#navigation').show();
		$(parent.document).find('.footer').show();
		// remove the printready class to outer object
		$('.oco_pagebuilder').removeClass('printready')

		// make the tab-content go 10 col
		$('.tab-content').removeClass('col-md-12').addClass('col-md-10');

	}
}	

// rotate animation thing
/*
jQuery-Rotate-Plugin v0.2 by anatol.at
http://jsfiddle.net/Anatol/T6kDR/
*/
$.fn.rotate=function(options) {
  var $this=$(this), prefixes, opts, wait4css=0;
  prefixes=['-Webkit-', '-Moz-', '-O-', '-ms-', ''];
  opts=$.extend({
    startDeg: false,
    endDeg: 360,
    duration: 1,
    count: 1,
    easing: 'linear',
    animate: {},
    forceJS: false
  }, options);

  function supports(prop) {
    var can=false, style=document.createElement('div').style;
    $.each(prefixes, function(i, prefix) {
      if (style[prefix.replace(/\-/g, '')+prop]==='') {
        can=true;
      }
    });
    return can;
  }

  function prefixed(prop, value) {
    var css={};
    if (!supports.transform) {
      return css;
    }
    $.each(prefixes, function(i, prefix) {
      css[prefix.toLowerCase()+prop]=value || '';
    });
    return css;
  }

  function generateFilter(deg) {
    var rot, cos, sin, matrix;
    if (supports.transform) {
      return '';
    }
    rot=deg>=0 ? Math.PI*deg/180 : Math.PI*(360+deg)/180;
    cos=Math.cos(rot);
    sin=Math.sin(rot);
    matrix='M11='+cos+',M12='+(-sin)+',M21='+sin+',M22='+cos+',SizingMethod="auto expand"';
    return 'progid:DXImageTransform.Microsoft.Matrix('+matrix+')';
  }

  supports.transform=supports('Transform');
  supports.transition=supports('Transition');

  opts.endDeg*=opts.count;
  opts.duration*=opts.count;

  if (supports.transition && !opts.forceJS) { // CSS-Transition
    if ((/Firefox/).test(navigator.userAgent)) {
      wait4css=(!options||!options.animate)&&(opts.startDeg===false||opts.startDeg>=0)?0:25;
    }
    $this.queue(function(next) {
      if (opts.startDeg!==false) {
        $this.css(prefixed('transform', 'rotate('+opts.startDeg+'deg)'));
      }
      setTimeout(function() {
        $this
          .css(prefixed('transition', 'all '+opts.duration+'s '+opts.easing))
          .css(prefixed('transform', 'rotate('+opts.endDeg+'deg)'))
          .css(opts.animate);
      }, wait4css);

      setTimeout(function() {
        $this.css(prefixed('transition'));
        if (!opts.persist) {
          $this.css(prefixed('transform'));
        }
        next();
      }, (opts.duration*1000)-wait4css);
    });

  } else { // JavaScript-Animation + filter
    if (opts.startDeg===false) {
      opts.startDeg=$this.data('rotated') || 0;
    }
    opts.animate.perc=100;

    $this.animate(opts.animate, {
      duration: opts.duration*1000,
      easing: $.easing[opts.easing] ? opts.easing : '',
      step: function(perc, fx) {
        var deg;
        if (fx.prop==='perc') {
          deg=opts.startDeg+(opts.endDeg-opts.startDeg)*perc/100;
          $this
            .css(prefixed('transform', 'rotate('+deg+'deg)'))
            .css('filter', generateFilter(deg));
        }
      },
      complete: function() {
        if (opts.persist) {
          while (opts.endDeg>=360) {
            opts.endDeg-=360;
          }
        } else {
          opts.endDeg=0;
          $this.css(prefixed('transform'));
        }
        $this.css('perc', 0).data('rotated', opts.endDeg);
      }
    });
  }

  return $this;
};
