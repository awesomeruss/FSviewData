## Settings for "Quarterly Stats" Pagebuilder

### Layout Components 
- "Row with Column"
- then paste in the HTML using the Tools>Source Code menu
```
<div style="padding: 4px;">
   <div id="lookup_config" class="config">[
   {"type":"table","nodata":"noquarterdata", "lookup":"5d2c8a94e3595","tab":"stats", "tablebuttons":["csv"], "tableconfig":"frlipBt"}, 
   { "type": "selectlist", "lookup": "5d2d93796eb7b", "tab": "quarter" }, 
   {"type":"table","nodata":"noweekdata", "lookup":"5ef9b94fcc81e","tab":"weekstats", "tablebuttons":["csv"], "tableconfig":"frlipBt"} 
   ]</div>
   <div id="daterangestart" class="config"></div>
   <div id="daterangeend" class="config"></div>
   <div id="quarter" class="config"></div>
   <div class="viewdata oco_pagebuilder">
      <div>
         <div class="oo_heading">
            <h2>Form stats</h2>
            <i>Statistics are based on whole weeks, which causes some variance in the period dates.</i>
         </div>
      </div>
      <ul id="myTab" class="nav nav-tabs">
         <li class="nav-item active"><a id="data-tab" class="nav-link" href="#tabquarter" data-toggle="tab">Quarterly stats</a></li>
         <li class="nav-item"><a id="rep1-tab" class="nav-link" href="#rep1" data-toggle="tab">Weekly Total for Date range</a></li>
      </ul>
      <div id="myTabContent" class="tab-content">
         <div id="tabquarter" class="tab-pane fade  active in">
            <div id="quarter_criteria">
               View stats for :
               <select id="quarter" class="newselectpicker">
                  <option value="blank">Please wait...</option>
               </select>
            </div>
            <div id="stats">
               <div class="spinner">
                  <img src="https://fs-filestore-eu.s3.amazonaws.com/crawley/resources/spinner.svg" />
                  <div class="msg">Loading...</div>
               </div>
               <div class="results" style="min-height: 500px;"></div>
               <div id="noquarterdata" class="hidden">No results found</div>
            </div>
         </div>
         <div id="rep1" class="tab-pane fade">
            <div class="daterange"><label>Completion date range (blank for all data): <input style="min-width: 270px;" name="daterange" type="text" value="" /></label></div>
            <div id="weekstats">
               <div class="spinner">
                  <img src="https://fs-filestore-eu.s3.amazonaws.com/crawley/resources/spinner.svg" />
                  <div class="msg">Loading...</div>
               </div>
               <div class="results" style="min-height: 500px;"></div>
               <div id="noweekdata" class="hidden">No results found</div>
            </div>
         </div>
      </div>
   </div>
</div>
```

### Settings - Page Settings
- Enabled: tick
- Title: "Submission stats"
- Heading: "Submission stats"
- Path: "stats"
- Create Navigation Item: tick
- Navigation Title: "Stats"

### Settings - Permissions
> Create a permissions group that contains all users who should have permission to use the high level stats screen. This will grant access to the screen, but not to all of the data - that permission is controlled in a more granular way.
- select: "[FAM-GROUP] FS Data"

### Settings - Tokens
- URL Parameters: None

### Settings - External sources

**Scripts:**
- https://fs-filestore-eu.s3.amazonaws.com/YOUR/path/here/livepackages/Core-Pagebuilder/oco.js

**Styles:**
- https://fs-filestore-eu.s3.amazonaws.com/YOUR/path/here/livepackages/Core-Pagebuilder/oco.css
