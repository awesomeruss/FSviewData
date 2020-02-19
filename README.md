# FSviewData
Display and analyse submission data from the data-dump in Dash. Includes row-security, retention, CSV download, quarterly stats, and graphs.

To get it working you will need to:
1. Database stuff
- Run the SQL script on your Firmstep data dump database. 
- Setup a linked server to your Windows domain called `ADSI`. See https://blog.sqlauthority.com/2016/03/30/sql-server-query-active-directory-data-using-adsi-ldap-linked-server/
- Update the 'getADgroups' stored procedure with your windows domain name. 
- Setup a scheduled task to run `exec buildviews` nightly after Firmstep upload new data. 
- Put your email address into the `metadata_superuser` table. This will bypass the normal security checks and allow you to view ALL data via Dash.

2. Import the integrations into Forms. They use the af-data-dump connection
3. Import the admin process. Use this to setup 'Profiles' that allow granular access to the data. You can pick one or more AD groups or individual users, choose a process, and choose which fields and rows of process data to be displayed. You can also set a 'retention policy' on the data to automatically *delete* data from the Data Dump after a period of time.
4. Copy all the `Core-Pagebuilder` bits to Amazon S3, or some other internet-facing store. These files are referenced by the pagebuilder pages.
5. Create a spinner image (at https://loading.io/) and save it to S3.
6. Setup the pagebuilder pages. There are three - one that shows a list of processes and high-level stats, one shows data and stats for a single process. THe final page shows high level stats across all processes. Update the HTML content to reference your spinner image.

