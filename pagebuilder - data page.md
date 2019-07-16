## Settings for "Data Page - View Data" Pagebuilder

### Layout Components 
- "Row with Column"
- then paste in the HTML using the Tools>Source Code menu
```
<div style="padding: 4px;">
   <div id="lookup_config" class="config">[ {"type":"table", "lookup":"5a993d324b636","tab":"data", "tablebuttons":["csv"], "tableconfig":"frlipBt"}, {"type":"table", "lookup":"5d2c8a94e3595","tab":"rep1", "tablebuttons":["csv"], "tableconfig":"frlipBt"}, {"type":"global","lookup":"5d2c86d0156ab"} ]</div>
   <div class="viewdata oco_pagebuilder">
      <div>
         <div class="oo_heading">
            <h2>View data</h2>
            <i>Analytics provides data, graphs and downloads for open and closed cases. Data is updated nightly. If you manage a process and would like analytics set up for it, please talk to the Digital Team.</i>
         </div>
      </div>
      <ul id="myTab" class="nav nav-tabs">
         <li class="nav-item active"><a id="data-tab" class="nav-link" href="#data" data-toggle="tab">Processes</a></li>
         <li class="nav-item"><a id="rep1-tab" class="nav-link" href="#rep1" data-toggle="tab">Top submissions</a></li>
      </ul>
      <div id="myTabContent" class="tab-content">
         <div id="data" class="tab-pane fade in active">
            <div class="spinner">
               <img src="https://fs-filestore-eu.s3.amazonaws.com/crawley/resources/spinner.svg" />
               <div class="msg">Loading...</div>
            </div>
            <div class="results" style="min-height: 500px;"></div>
         </div>
         <div id="rep1" class="tab-pane fade">
            <h2>Submission stats for week commencing ###Week###</h2>
            <div class="spinner">
               <img src="https://fs-filestore-eu.s3.amazonaws.com/crawley/resources/spinner.svg" />
               <div class="msg">Loading...</div>
            </div>
            <div class="results" style="min-height: 500px;"></div>
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
