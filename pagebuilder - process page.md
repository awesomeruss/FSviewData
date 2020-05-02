## Settings for "Data Page - View Proces Data" Pagebuilder

### Layout Components 
- "Row with Column"
- then paste in the HTML using the Tools>Source Code menu
```
<div style="padding: 4px;">
   <div id="lookup_config" class="config">[ 
		{ "type": "table", "lookup": "5aa8f60a99314", "tab": "data","nodata":"data_nodata", "tablebuttons": [ "csv" ], "map": "mapdaddy", "tableconfig": "frlipBt" }, 
		{ "type": "plotly", "graph": "violin", "lookup": "5a7acb84ab7cb", "tab": "plotly_violin", "plotly_layout": { "title": "Stage timings", "yaxis": { "title": "Working hours open" }, "xaxis": { "visible": "false" } } }, 
		{ "type": "plotly", "graph": "bar", "lookup": "5bd72a50d3975", "tab": "plotly_bar", "plotly_layout": { "title": "Opened/Closed cases", "barmode": "group", "xaxis": { "tickangle": "-45" } } }, 
		{ "type": "selectlist", "lookup": "5ad6d991e80c0", "tab": "breakdown" }, 
		{ "type": "plotly", "graph": "generic", "plotly_tracedata": { "stackgroup": "scatter" }, "lookup": "5c2e2882a6096", "tab": "plotly_genericbar", 
			"plotly_layout": { "title": "Closed cases breakdown", "barmode": "stack",
				"xaxis": { "tickangle": "-45", "rangeslider": {},
					"rangeselector": { "buttons": [
						{ "count": 1, "label": "1m", "step": "month", "stepmode": "backward" }, 
						{ "count": 3, "label": "3m", "step": "month", "stepmode": "backward" }, 
						{ "count": 6, "label": "6m", "step": "month", "stepmode": "backward" }, 
						{ "step": "all" } ] } } } }, 
		{ "type": "plotly", "graph": "pie", "plotly_tracedata": { "type": "pie","sort":false,"direction":"clockwise" }, "lookup": "5c2f42fa67d22", "tab": "plotly_genericpie", "plotly_layout": { "title": "Total over period" } }
		]</div>
   <div id="profileid" class="config">0{profileid}</div>
   <div id="process_tablename" class="config">{process_tablename}</div>
   <div id="daterangestart" class="config">2018-01-01</div>
   <div id="daterangeend" class="config">2019-01-01</div>
   <div id="breakdown" class="config">product</div>
   <div class="viewdata oco_pagebuilder">
      <div>
         <div class="oo_heading">
            <h2><a target="_parent" href="/data">All data</a> - {process_name} {profilename} records</h2>
            <i>Analytics provides data, graphs and downloads for open and closed cases. Data is updated nightly. If you manage a process and would like analytics set up for it, please talk to the Digital Team.</i>
         </div>
         <div class="daterange"><label>Completion date range (blank for open cases): <input style="min-width: 270px;" name="daterange" type="text" value="" /></label></div>
      </div>
   </div>
   <ul id="myTab" class="nav nav-tabs">
      <li class="nav-item active"><a id="data-tab" class="nav-link" href="#data" data-toggle="tab">Data</a></li>
      <li class="nav-item"><a id="rep1-tab" class="nav-link" href="#rep1" data-toggle="tab">Creation/Completion stats</a></li>
      <li class="nav-item"><a id="rep2-tab" class="nav-link" href="#rep2" data-toggle="tab">Completed cases</a></li>
      <li class="nav-item"><a id="rep3-tab" class="nav-link" href="#rep3" data-toggle="tab">Workflow timings</a></li>
   </ul>
   <div id="myTabContent" class="tab-content">
      <div id="data" class="tab-pane fade  active in">
		 <div id="data_nodata" class="hidden">
			No matching records - try adjusting your criteria
		 </div>
         <div class="spinner">
            <img src="https://fs-filestore-eu.s3.amazonaws.com/crawley/resources/spinner.svg" />
            <div class="msg">Loading...</div>
         </div>
         <div id="mapdaddy">
            <div id="gmap" style="height: 500px;"></div>
         </div>
         <div class="results" style="min-height: 500px;"></div>
      </div>
      <div id="rep1" class="tab-pane fade">
         <div id="plotly_bar" style="min-height: 500px; width: 100%;">
            <div class="spinner">
               <img src="https://fs-filestore-eu.s3.amazonaws.com/crawley/resources/spinner.svg" />
               <div class="msg">Loading...</div>
            </div>
         </div>
      </div>
      <div id="rep2" class="tab-pane fade">
         <div id="breakdown_criteria">
            Break down by:
            <select id="breakdown" class="newselectpicker">
               <option value="blank">Please wait...</option>
            </select>
         </div>
         <div id="plotly_genericbar" style="min-height: 500px; width: 100%;">
            <div class="spinner">
               <img src="https://fs-filestore-eu.s3.amazonaws.com/crawley/resources/spinner.svg" />
               <div class="msg">Loading...</div>
            </div>
         </div>
         <div id="plotly_genericpie" style="min-height: 500px; width: 100%;">
            <div class="spinner">
               <img src="https://fs-filestore-eu.s3.amazonaws.com/crawley/resources/spinner.svg" />
               <div class="msg">Loading...</div>
            </div>
         </div>
      </div>
      <div id="rep3" class="tab-pane fade">
         <div id="plotly_violin" style="min-height: 500px; width: 100%;">
            <div class="spinner">
               <img src="https://fs-filestore-eu.s3.amazonaws.com/crawley/resources/spinner.svg" />
               <div class="msg">Loading...</div>
            </div>
         </div>
      </div>
   </div>
</div>
```

### Settings - Page Settings
- Enabled: tick
- Title: "Data"
- Heading: "Data"
- Path: "data"
- Create Navigation Item: tick
- Navigation Title: "Data"

### Settings - Permissions
> Create a permissions group that contains all users who should have permission to use the view data screen. This will grant access to the screen, but not to all of the data - that permission is controlled in a more granular way.
- select: "[FAM-GROUP] FS Data"

### Settings - Tokens
- URL Parameters: None

### Settings - External sources

**Scripts:**
- https://fs-filestore-eu.s3.amazonaws.com/YOUR/path/here/livepackages/Core-Pagebuilder/oco.js
- https://maps.google.com/maps/api/js?libraries=geometry&v=3.22&key=AIzaSyDtTfcN54kfBVp73QBDb_eCKMvUvVqL3Es
> The link above uses an Awesome Consulting API key for Google maps. It should work for testing, but please replace with your own for production.

**Styles:**
- https://fs-filestore-eu.s3.amazonaws.com/YOUR/path/here/livepackages/Core-Pagebuilder/oco.css
- https://fs-filestore-eu.s3.amazonaws.com/YOUR/path/here/livepackages/Core-Pagebuilder/daterangepicker/daterangepicker.css
- https://fs-filestore-eu.s3.amazonaws.com/YOUR/path/here/livepackages/Firmstep-CoreViewData/viewdata.css
