## Settings for "Data Page - View Data" Pagebuilder

### Layout Components 
- "Row with Column"
- then paste in the HTML using the Tools>Source Code menu
```
<div style="padding: 4px;">
   <div id="lookup_config" class="config">[ {"type":"table", "lookup":"5d2c8a94e3595","tab":"stats", "tablebuttons":["csv"], "tableconfig":"frlipBt"}, { "type": "selectlist", "lookup": "5d2d93796eb7b", "tab": "quarter" } ]</div>
   <div id="quarter" class="config"></div>
   <div class="viewdata oco_pagebuilder">
      <div>
         <div class="oo_heading">
            <h2>Quarterly stats</h2>
            <i>Statistics are based on whole weeks, which causes some variance in the period dates.</i>
         </div>
      </div>
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
