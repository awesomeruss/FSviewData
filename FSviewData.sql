GO
/****** Object:  UserDefinedFunction [dbo].[process_hidden_column_list]    Script Date: 15/07/2019 16:56:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE function [dbo].[process_hidden_column_list](@input nvarchar(max), @suffix nvarchar(10)='_hhh') returns nvarchar(max) as
  begin
    declare @output nvarchar(max)
	set @output='';
	if @input='' return ''
	while CHARINDEX(',',@input)>0
	begin
		set @output=@output+',a.'+left(@input, CHARINDEX(',',@input)-1)+' as '+left(@input, CHARINDEX(',',@input)-1)+@suffix
		set @input=stuff(@input,1, CHARINDEX(',',@input),'')
	end
	return @output+', a.'+@input+' as '+@input+@suffix
  end

GO
/****** Object:  UserDefinedFunction [dbo].[split]    Script Date: 15/07/2019 16:56:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE function [dbo].[split](@s varchar(max), @d char(1)) returns @rtntable table(result varchar(1000)) as 
begin
	insert into @rtntable(result)
	select ltrim(rtrim(m.n.value('.[1]','varchar(1000)'))) as result from  (select cast('<XMLroot><Rowdata>'+replace(@s,@d,'</Rowdata><Rowdata>')+'</Rowdata></XMLroot>' as XML) as x )t 
	cross apply x.nodes('/XMLroot/Rowdata')m(n)
	return
end

GO
/****** Object:  UserDefinedFunction [dbo].[week_commencing]    Script Date: 15/07/2019 16:56:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
create function [dbo].[week_commencing](@input datetime) returns datetime as
begin
 return convert(date,DATEADD(dd, 0 - (@@DATEFIRST + 5 + DATEPART(dw, @input)) % 7, @input)) 
end
GO
/****** Object:  UserDefinedFunction [dbo].[WorkTime]    Script Date: 15/07/2019 16:56:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[WorkTime] 
(
    @StartDate DATETIME,
    @FinishDate DATETIME
)
RETURNS BIGINT
AS
BEGIN
    DECLARE @Temp BIGINT
    SET @Temp=0

    DECLARE @FirstDay DATE
    SET @FirstDay = CONVERT(DATE, @StartDate, 112)

    DECLARE @LastDay DATE
    SET @LastDay = CONVERT(DATE, @FinishDate, 112)

    DECLARE @StartTime TIME
    SET @StartTime = CONVERT(TIME, @StartDate)

    DECLARE @FinishTime TIME
    SET @FinishTime = CONVERT(TIME, @FinishDate)

    DECLARE @WorkStart TIME
    SET @WorkStart = '09:00'

    DECLARE @WorkFinish TIME
    SET @WorkFinish = '17:00'

    DECLARE @DailyWorkTime BIGINT
    SET @DailyWorkTime = DATEDIFF(MINUTE, @WorkStart, @WorkFinish)

    IF (@StartTime<@WorkStart)
    BEGIN
        SET @StartTime = @WorkStart
    END
    IF (@FinishTime>@WorkFinish)
    BEGIN
        SET @FinishTime=@WorkFinish
    END
    IF (@FinishTime<@WorkStart)
    BEGIN
        SET @FinishTime=@WorkStart
    END
    IF (@StartTime>@WorkFinish)
    BEGIN
        SET @StartTime = @WorkFinish
    END

    DECLARE @CurrentDate DATE
    SET @CurrentDate = @FirstDay
    DECLARE @LastDate DATE
    SET @LastDate = @LastDay

    WHILE(@CurrentDate<=@LastDate)
    BEGIN       
        IF (DATEPART(dw, @CurrentDate)!=1 AND DATEPART(dw, @CurrentDate)!=7)
        BEGIN
            IF (@CurrentDate!=@FirstDay) AND (@CurrentDate!=@LastDay)
            BEGIN
                SET @Temp = @Temp + @DailyWorkTime
            END
            --IF it starts at startdate and it finishes not this date find diff between work finish and start as minutes
            ELSE IF (@CurrentDate=@FirstDay) AND (@CurrentDate!=@LastDay)
            BEGIN
                SET @Temp = @Temp + DATEDIFF(MINUTE, @StartTime, @WorkFinish)
            END

            ELSE IF (@CurrentDate!=@FirstDay) AND (@CurrentDate=@LastDay)
            BEGIN
                SET @Temp = @Temp + DATEDIFF(MINUTE, @WorkStart, @FinishTime)
            END
            --IF it starts and finishes in the same date
            ELSE IF (@CurrentDate=@FirstDay) AND (@CurrentDate=@LastDay)
            BEGIN
                SET @Temp = DATEDIFF(MINUTE, @StartTime, @FinishTime)
            END
        END
        SET @CurrentDate = DATEADD(day, 1, @CurrentDate)
    END

    -- Return the result of the function
    IF @Temp<0
    BEGIN
        SET @Temp=0
    END
    RETURN @Temp

END

GO
/****** Object:  Table [dbo].[metadata_dimension]    Script Date: 15/07/2019 16:56:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[metadata_dimension](
	[table_name] [nvarchar](500) NOT NULL,
	[field_name] [nvarchar](500) NOT NULL
) ON [PRIMARY]

GO
/****** Object:  Table [dbo].[metadata_process]    Script Date: 15/07/2019 16:56:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[metadata_process](
	[process_tablename] [sysname] NOT NULL,
	[stage_tablename] [sysname] NOT NULL,
	[processid] [nvarchar](128) NULL,
	[process_name] [nvarchar](1000) NULL,
	[min_completed] [datetime] NULL,
	[max_completed] [datetime] NULL,
	[completed_row_count] [bigint] NULL,
	[active_row_count] [bigint] NULL,
	[min_incomplete_start] [datetime] NULL,
	[display_cols] [nvarchar](max) NULL,
	[hide_cols] [nvarchar](max) NULL,
	[user_emails] [nvarchar](max) NULL,
	[max_exported] [datetime] NULL
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

GO
/****** Object:  Table [dbo].[metadata_profile]    Script Date: 15/07/2019 16:56:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
SET ANSI_PADDING ON
GO
CREATE TABLE [dbo].[metadata_profile](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[table_name] [nvarchar](500) NOT NULL,
	[user_emails] [nvarchar](max) NOT NULL,
	[where_column] [nvarchar](max) NOT NULL,
	[where_values] [nvarchar](max) NOT NULL,
	[display_cols] [nvarchar](max) NULL,
	[hide_cols] [nvarchar](max) NULL,
	[profile_name] [varchar](100) NULL,
	[user_groups] [nvarchar](1000) NULL,
	[map] [varchar](10) NULL,
	[lat_field] [varchar](100) NULL,
	[lng_field] [varchar](100) NULL,
	[location_field] [varchar](100) NULL,
	[map_icon_field] [varchar](100) NULL,
	[map_icon_template] [varchar](200) NULL,
	[filter_cols] [nvarchar](max) NULL,
	[retention_days] [int] NULL,
	[b_view] [bit] NULL,
	[min_completed] [datetime] NULL,
	[max_completed] [datetime] NULL,
	[max_exported] [datetime] NULL,
	[completed_row_count] [int] NULL,
	[active_row_count] [int] NULL,
	[min_incomplete_start] [datetime] NULL
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

GO
SET ANSI_PADDING OFF
GO
/****** Object:  Table [dbo].[metadata_retention_log]    Script Date: 15/07/2019 16:56:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
SET ANSI_PADDING ON
GO
CREATE TABLE [dbo].[metadata_retention_log](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[profile_id] [int] NOT NULL,
	[profile_name] [varchar](100) NOT NULL,
	[table_name] [sysname] NOT NULL,
	[action_date] [datetime] NOT NULL,
	[rows] [int] NOT NULL,
	[minref] [varchar](50) NOT NULL,
	[maxref] [varchar](50) NOT NULL
) ON [PRIMARY]

GO
SET ANSI_PADDING OFF
GO
/****** Object:  Table [dbo].[metadata_stat]    Script Date: 15/07/2019 16:56:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[metadata_stat](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[table_name] [nvarchar](1000) NULL,
	[profile_id] [int] NULL,
	[week_commencing] [date] NULL,
	[creation_count] [int] NULL,
	[self_count] [int] NULL,
	[dash_count] [int] NULL,
	[service_count] [int] NULL,
	[forms_count] [int] NULL,
	[other_count] [int] NULL
) ON [PRIMARY]

GO
/****** Object:  Table [dbo].[metadata_superuser]    Script Date: 15/07/2019 16:56:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
SET ANSI_PADDING ON
GO
CREATE TABLE [dbo].[metadata_superuser](
	[email] [varchar](200) NOT NULL
) ON [PRIMARY]

GO
SET ANSI_PADDING OFF
GO
/****** Object:  View [dbo].[v_processes]    Script Date: 15/07/2019 16:56:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


CREATE view [dbo].[v_processes] as

select a.name as process_tablename
,b.name as stage_tablename
,SUBSTRING(a.name, charindex('AF-Process-',a.name),1000) as processid
,replace(SUBSTRING(a.name, 9,charindex('AF-Process-',a.name)-10),'_',' ') as process_name
from sysobjects a
left join sysobjects b
on substring(a.name,8,1000)=substring(b.name,6,1000)
where a.type='u' and a.name like 'process%' and (b.type is null or (b.type='u' and b.name like 'stage%')) 

GO
CREATE view [dbo].[v_metadata_stat_quarter] as
select concat(datepart(yy,week_commencing),' Q',datepart(qq,week_commencing)) as quarter,
  table_name, profile_id
  sum(creation_count) as created,
  sum(self_count) as self,
  sum(dash_count) as dash,
  sum(servie_count) as service,
  sum(forms_count) as forms,
  sum(other_count) as other
from metadata_stat group by table_name, profile_id, concat(datepart(yy,week_commencing),' Q',datepart(qq,week_commencing)) 


GO
/****** Object:  StoredProcedure [dbo].[buildstat]    Script Date: 15/07/2019 16:56:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE proc [dbo].[buildstat](@table nvarchar(1000)) as
begin
	declare @sql nvarchar(max)
	declare @profile int
	declare @where varchar(max)
	declare @email nvarchar(100)
	select top 1 @email=email from metadata_superuser
   
	delete from metadata_stat where table_name=@table
	set @sql=replace('select ''@table'', null, dbo.week_commencing(created_date), count(*) as total, 
		sum(case when product=''self'' then 1 else 0 end) as self_count, 
		sum(case when product=''dash'' then 1 else 0 end) as dash_count, 
		sum(case when product=''service'' then 1 else 0 end) as service_count, 
		sum(case when product=''forms'' then 1 else 0 end) as forms_count, 
		sum(case when product not in (''self'',''dash'',''service'',''forms'') then 1 else 0 end) as other_count
		from [@table] group by dbo.week_commencing(created_date)','@table',@table)
	print @sql
	insert into metadata_stat(table_name,profile_id,week_commencing,creation_count, self_count, dash_count, service_count, forms_count, other_count) exec (@sql)
	
	declare c cursor for select id from metadata_profile where table_name=@table
	open c
	fetch next from c into @profile
	while @@FETCH_STATUS=0
	begin
		exec getwhere @process_tablename=@table, @email=@email, @profile=@profile, @where=@where output
   		set @sql='select '''+@table+''', '+convert(varchar,@profile)+', dbo.week_commencing(created_date), count(*) as total, 
			sum(case when product=''self'' then 1 else 0 end) as self_count, 
			sum(case when product=''dash'' then 1 else 0 end) as dash_count, 
			sum(case when product=''service'' then 1 else 0 end) as service_count, 
			sum(case when product=''forms'' then 1 else 0 end) as forms_count, 
			sum(case when product not in (''self'',''dash'',''service'',''forms'') then 1 else 0 end) as other_count
			from ['+@table+'] a where '+@where+' group by dbo.week_commencing(created_date)'
		print @sql
		insert into metadata_stat(table_name,profile_id,week_commencing,creation_count, self_count, dash_count, service_count, forms_count, other_count) exec (@sql)	
		
		set @sql = 'update metadata_profile set
		min_completed = sq.min_completed, max_completed = sq.max_completed, max_exported=sq.max_exported, completed_row_count=sq.completed_row_count, active_row_count=sq.active_row_count, min_incomplete_start=sq.min_incomplete_start
		from metadata_profile mp,
			(select min(case when completed_date is null or completed_date=''1900-01-01 00:00'' then null else completed_date end) as min_completed,
			max(completed_date) as max_completed, max(date_exported) as max_exported,
			sum(case when completed_date is null or completed_date=''1900-01-01 00:00'' then 0 else 1 end) as completed_row_count,
			sum(case when completed_date is null or completed_date=''1900-01-01 00:00'' then 1 else 0 end) as active_row_count,
			min(case when completed_date is null or completed_date=''1900-01-01 00:00'' then null else created_date end) as min_incomplete_start
			from ['+@table+'] a where '+@where+') sq
			where mp.id='+convert(varchar,@profile)
		print @sql
		exec(@sql)

		fetch next from c into @profile	
	end
	close c
	deallocate c
end


GO
/****** Object:  StoredProcedure [dbo].[buildview]    Script Date: 15/07/2019 16:56:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE proc [dbo].[buildview](@t nvarchar(1000)) as
begin
	set nocount on
	declare @sql nvarchar(max)
	declare @csql nvarchar(max)
	declare @cmd nvarchar(max)
	declare @n nvarchar(1000)
	declare @c nvarchar(1000)
	declare @total bigint
	declare @distinct bigint
	declare @d2 bigint
	if @t like 'process_%' 
		set @n=replace(@t,'process_','pdate_')
	else
		set @n=replace(@t,'stage_','sdate_')
	set @sql= ''
	print 'creating view '+@n+' for table '+@t
	-- get the total rowcount for the table in a cunning way
	select @total = sum(rows) from sys.partitions where object_id = OBJECT_ID(@t) and index_id in (0,1)
	declare c cursor for select name from syscolumns where id=OBJECT_ID(@t) and name<>'id' and (@t like 'process_%' or @t like 'stage_%')
	open c
	create table #temp(id varchar(500))
	create table #tempdistinct(value varchar(max), total bigint)
	fetch next from c into @c
	while @@FETCH_STATUS=0
	begin

		-- some fields may be a 'dimension' that can control permissions and be used in graphs
		-- this only works for fields where many rows have identical values
		-- so we count the number of distinct values in the data. This must be less than 25% of the total rowcount
		-- we also check that there are at least 5% of rows with the same value
		set @csql='insert into #tempdistinct(value,total) select ['+@c+'], count(*) from ['+@t+'] group by ['+@c+'] order by 2 desc'
		exec(@csql)
		set @distinct=@@rowcount
		select @d2=max(total) from #tempdistinct where value is not null and value <> ''
--		print 'total is '+convert(varchar,@total)
--		print 'column is '+@c
--		print 'distinct is '+convert(varchar,@distinct)
--		print 'd2 is '+convert(varchar,@d2)
		delete from metadata_dimension where table_name=@t and field_name=@c
		if (@distinct * 4) < @total and (@d2*20)>@total 
		begin
			insert into metadata_dimension(table_name, field_name) values (@t,@c)
		end
		delete from #tempdistinct
		set @csql='insert into #temp(id) select top 1 id from ['+@t+'] where (datalength(['+@c+'])>100 or ISDATE(['+@c+'])=0) and ['+@c+'] is not null'
		-- print 'testing '+@t +' for ' +@c
		-- print @csql
		exec(@csql)
		if @@ROWCOUNT=0 -- there are only dates and nulls in the column, add a date conversion
			set @sql=@sql+', case when ['+@c+'] = ''1900-01-01 00:00:00.000'' then null else convert(datetime,['+@c+']) end as ['+@c+']'
		else			-- otherwise just add the column
		begin
			
			set @csql='insert into #temp(id) select top 1 id from ['+@t+'] where (datalength(['+@c+'])>100 or ISNUMERIC(['+@c+'])=0) and ['+@c+'] is not null'
			-- print 'testing '+@t +' for ' +@c
			-- print @csql
			exec(@csql)
			if @@ROWCOUNT=0 -- there are only numbers and nulls in the column, add a number conversion
				set @sql=@sql+', convert(decimal(20,10),['+@c+']) as ['+@c+']'
			else	
			begin
				set @csql='insert into #temp(id) select top 1 id from ['+@t+'] where datalength(['+@c+'])>1000 '
				-- print @csql
				exec(@csql)
				if @@ROWCOUNT=0 -- there are only short strings and nulls in the column, add a varchar(1000) conversion
					set @sql=@sql+', convert(varchar(1000),['+@c+']) as ['+@c+']'
				else
				begin
					set @csql='insert into #temp(id) select top 1 id from ['+@t+'] where datalength(['+@c+'])>5000 '
					-- print @csql
					exec(@csql)
					if @@ROWCOUNT=0 -- there are only medium strings and nulls in the column, add a varchar(5000) conversion
						set @sql=@sql+', convert(varchar(5000),['+@c+']) as ['+@c+']'
					else
					begin
						set @sql=@sql+', ['+@c+']'
					end
				end
			end
		end
		fetch next from c into @c
	end
	close c
	deallocate c
	drop table #temp
	set @cmd='if object_id('''+@n+''') IS NULL exec(''CREATE view ['+@n+'] as select 0 as id;'')'
	-- print @cmd
	exec(@cmd)
	set @cmd='alter view ['+@n +'] as select id ' + @sql+' from ['+@t+']'
	-- print @cmd
	exec(@cmd)
end

GO
/****** Object:  StoredProcedure [dbo].[buildviews]    Script Date: 15/07/2019 16:56:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE proc [dbo].[buildviews] as
begin
	set nocount on
	declare p cursor for select process_tablename, stage_tablename, process_name, processid from v_processes
	declare @pt nvarchar(1000)
	declare @ps nvarchar(1000)
	declare @pn nvarchar(1000)
	declare @pid nvarchar(1000)
	declare @cmd nvarchar(max)

	open p
	fetch next from p into @pt, @ps, @pn, @pid
	while @@FETCH_STATUS=0
	begin
		print 'processing '+@pn
		exec buildview @pt
		exec buildstat @pt
		if @ps is not null exec buildview @ps
		delete from metadata_process where process_tablename = @pt
		
		set @cmd = 'insert into metadata_process(process_tablename, stage_tablename, process_name, processid,
		min_completed, max_completed, max_exported, completed_row_count, active_row_count, min_incomplete_start)
		select '''+@pt+''', '''+@ps+''', '''+@pn+''', '''+@pid+''', min(case when completed_date is null or completed_date=''1900-01-01 00:00'' then null else completed_date end) as min_completed,
	max(completed_date) as max_completed,
	max(date_exported) as max_exported,
	sum(case when completed_date is null or completed_date=''1900-01-01 00:00'' then 0 else 1 end) as completed_row_count,
	sum(case when completed_date is null or completed_date=''1900-01-01 00:00'' then 1 else 0 end) as active_row_count,
	min(case when completed_date is null or completed_date=''1900-01-01 00:00'' then null else created_date end) as min_incomplete_start
	 from ['+@pt+']'
		-- print @cmd
		exec(@cmd)
		fetch next from p into @pt, @ps, @pn, @pid
	end
	close p
	deallocate p
  exec profile_retention                                                                                                   
end

GO
/****** Object:  StoredProcedure [dbo].[getADgroups]    Script Date: 15/07/2019 16:56:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
create proc [dbo].[getADgroups](@email nvarchar(500)='') as
begin
	declare @domain varchar(100)
	declare @groupfilter varchar(100)
	set @domain='int.YOURDOMAIN.gov.uk'
	set @groupfilter = 'AF%'
	declare @sql nvarchar(max)
	declare @path nvarchar(1024)
	if @email<>''
	begin
		set @sql=
			'select @path= distinguishedName from openquery(ADSI, ''
			select distinguishedName from ''''GC://'+@domain+'''''
			where objectCategory=''''Person''''
			and mail='''''+@email+ '''''
			'') as people'
		exec sp_executesql @sql, N'@path nvarchar(1024) output',@path=@path output
		set @sql='select cn from openquery(ADSI, ''<GC://DC='+replace(@domain,'.',',DC=')+'>;(&(objectClass=group)(member:1.2.840.113556.1.4.1941:='+@path+'));cn,adspath;subtree'') where cn like '''+@groupfilter+''' order by cn'
	end
	else
	begin
		-- set @sql='select cn from openquery(ADSI, ''<GC://DC='+replace(@domain,'.',',DC=')+'>;(objectClass=group);cn'') where cn like '''+@groupfilter+''' order by cn'
		set @sql='select cn as name, cn as display from openquery(ADSI, ''select cn from ''''GC://DC='+replace(@domain,'.',',DC=')+''''' where cn='''''+replace(@groupfilter,'%','*')+''''' and objectCategory=''''Group'''''') order by 1' 
	end
--	print @sql
	exec sp_executesql @sql
end

GO
/****** Object:  StoredProcedure [dbo].[getwhere]    Script Date: 15/07/2019 16:56:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


CREATE proc [dbo].[getwhere](@process_tablename varchar(100), @profile int, @email varchar(500), @where varchar(max) output) as
begin
	set nocount on
	declare @ok nvarchar(500)
	declare @s varchar(max)
	declare @d varchar(20)
	set @where='1=0'
	-- figure out what AD groups the user is a member of
	create table #usergroups(name nvarchar(1000))
	if @email<>'' insert into #usergroups(name) exec getADgroups @email
	select top 1
		@ok = table_name, 
		@where = case when coalesce(where_column,'')='' then '1=1' else 'a.['+where_column+'] in('''+replace(replace(where_values,'''',''''''),', ',''',''')+''')' end
		from metadata_profile
		where table_name = @process_tablename 
			and (id=@profile or @profile=0) 
			and ( --permissions checks
				user_emails like '%'+@email +'%'  -- email address is on the profile, grant access
				or exists(select 0 from #usergroups where ', '+user_groups+',' like '%, '+name+',%') -- if the user is in one of the listed groups, grant access
				-- or (coalesce(user_emails,'')='' and coalesce(user_groups,'')='') -- no permissions defined means everyone has access	
				or exists (select 0 from metadata_superuser where email=@email) --superusers have access
				)
	if @ok is null 
	begin
		-- no profile was found. see if the user is a superuser, in which case they get to see everything
		select @where='1=1' from metadata_superuser where email=@email
	end

end

GO
/****** Object:  StoredProcedure [dbo].[process_get_submission_data]    Script Date: 15/07/2019 16:56:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE proc [dbo].[process_get_submission_data](@process_tablename varchar(100), @strfrom varchar(30), @strto varchar(30),  @email varchar(500)='', @profile int=0) as
begin

	declare @s varchar(max)
	declare @where varchar(max)

	declare @from datetime
	declare @to datetime
	set dateformat ymd
	set @from=convert(datetime,@strfrom)
	set @to=convert(datetime,@strto)

	exec getwhere @process_tablename=@process_tablename, @email=@email, @profile=@profile, @where=@where output
	set nocount on

	set @s=	'select 
			convert(date,completed_date) as date, 
			count(id) as daily_submissions, 
			sum(case when product=''Dash'' then 1 else 0 end) as dash_submissions, 
			sum(case when product=''Self'' then 1 else 0 end) as self_submissions, 
			sum(case when product=''Service'' then 1 else 0 end) as service_submissions, 
			sum(case when product=''Forms'' then 1 else 0 end) as forms_submissions 
		from ['+@process_tablename+'] a
		where ('+@where+') and completed_date between '''+convert(varchar,@from,113)+''' and '''+convert(varchar,@to,113)+'''
		group by convert(date,completed_date)
		order by convert(date,completed_date) '
		exec(@s)
end

GO
/****** Object:  StoredProcedure [dbo].[process_get_submission_data_breakdown]    Script Date: 15/07/2019 16:56:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE proc [dbo].[process_get_submission_data_breakdown](@process_tablename varchar(100), @from date, @to date,  @email varchar(500)='', @profile int=0, @breakdown varchar(200)) as
begin
    if @breakdown is null or @breakdown=''
        set @breakdown='product';
    declare @s varchar(max)
    declare @where varchar(max)
    exec getwhere @process_tablename=@process_tablename, @email=@email, @profile=@profile, @where=@where output
    set nocount on

    set @s=    'select 
            convert(date,completed_date) as date, 
            count(id) as stat, 
            coalesce(['+@breakdown+'],''[BLANK]'') as breakdown
        from ['+@process_tablename+'] a
        where ('+@where+') and completed_date between '''+convert(varchar,@from,113)+''' and '''+convert(varchar,@to,113)+'''
        group by convert(date,completed_date), ['+@breakdown+']
        order by convert(date,completed_date), ['+@breakdown+']'

    set @s=    'select 
            convert(date,DATEADD(dd, 0 - (@@DATEFIRST + 5 + DATEPART(dw, completed_date)) % 7, completed_date)) as date, 
            count(id) as stat, 
            coalesce(['+@breakdown+'],''[BLANK]'') as breakdown
        from ['+@process_tablename+'] a
        where ('+@where+') and completed_date between '''+convert(varchar,@from,113)+''' and '''+convert(varchar,@to,113)+'''
        group by convert(date,DATEADD(dd, 0 - (@@DATEFIRST + 5 + DATEPART(dw, completed_date)) % 7, completed_date)) , ['+@breakdown+']
        order by convert(date,DATEADD(dd, 0 - (@@DATEFIRST + 5 + DATEPART(dw, completed_date)) % 7, completed_date)) , ['+@breakdown+']'
		print @s
        create table #results(x date, y int, series nvarchar(1000))
       insert into #results(x,y,series) exec(@s)
        insert into #results(x,y,series) 
            select xx.x, 0, ss.series 
            from (select distinct x from #results) as xx, 
                 (select distinct series from #results) as ss 
            where not exists(select 0 from #results a where a.x=xx.x and a.series=ss.series) 
        select * from #results order by x, series
		drop table #results
end

GO
/****** Object:  StoredProcedure [dbo].[process_get_submission_data_summary]    Script Date: 15/07/2019 16:56:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE proc [dbo].[process_get_submission_data_summary](@process_tablename varchar(100), @from date, @to date,  @email varchar(500)='', @profile int=0, @breakdown varchar(200)) as
begin
   if @breakdown is null or @breakdown=''
       set @breakdown='product';
   declare @s varchar(max)
   declare @where varchar(max)
   exec getwhere @process_tablename=@process_tablename, @email=@email, @profile=@profile, @where=@where output
   set nocount on

   set @s=    'select
           convert(date,completed_date) as date,
           count(id) as stat,
           coalesce(['+@breakdown+'],''[BLANK]'') as breakdown
       from ['+@process_tablename+'] a
       where ('+@where+') and completed_date between '''+convert(varchar,@from,113)+''' and '''+convert(varchar,@to,113)+'''
       group by convert(date,completed_date), ['+@breakdown+']
       order by convert(date,completed_date), ['+@breakdown+']'

   set @s=    'select
           convert(date,DATEADD(dd, 0 - (@@DATEFIRST + 5 + DATEPART(dw, completed_date)) % 7, completed_date)) as date,
           count(id) as stat,
           coalesce(['+@breakdown+'],''[BLANK]'') as breakdown
       from ['+@process_tablename+'] a
       where ('+@where+') and completed_date between '''+convert(varchar,@from,113)+''' and '''+convert(varchar,@to,113)+'''
       group by convert(date,DATEADD(dd, 0 - (@@DATEFIRST + 5 + DATEPART(dw, completed_date)) % 7, completed_date)) , ['+@breakdown+']
       order by convert(date,DATEADD(dd, 0 - (@@DATEFIRST + 5 + DATEPART(dw, completed_date)) % 7, completed_date)) , ['+@breakdown+']'
        print @s
       create table #results(x date, y int, series nvarchar(1000))
      insert into #results(x,y,series) exec(@s)
       insert into #results(x,y,series)
           select xx.x, 0, ss.series
           from (select distinct x from #results) as xx,
                (select distinct series from #results) as ss
           where not exists(select 0 from #results a where a.x=xx.x and a.series=ss.series)
       select 'Total' as x,sum(y) as y,series  from #results group by series order by series
        drop table #results
end

GO
/****** Object:  StoredProcedure [dbo].[process_get_weekly_stats]    Script Date: 15/07/2019 16:56:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE proc [dbo].[process_get_weekly_stats](@process_tablename varchar(100), @strfrom varchar(30), @strto varchar(30),  @email varchar(500)='', @profile int=0) as
begin
	set nocount on
	declare @ok nvarchar(500)
	declare @s varchar(max)
	declare @d varchar(20)
	declare @where varchar(max)
	declare @from datetime
	declare @to datetime
	set dateformat ymd
	set @from=convert(datetime,@strfrom)
	set @to=convert(datetime,@strto)
	
	exec getwhere @process_tablename=@process_tablename, @email=@email, @profile=@profile, @where=@where output
	create table #stats(wk varchar(50), value int, stat varchar(50))
	print @from
	print @to
	while @from < @to
	begin
		set @d=  concat(datepart(year,@from),' wk ',datepart(wk,@from))
		set @s=	'insert into #stats(wk, value, stat)
			select '''+@d +''', count(*),''created''			
			from ['+@process_tablename+'] a
			where ('+@where+') and concat(datepart(year,created_date),'' wk '',datepart(wk,created_date))='''+@d +''''
		exec(@s)
		set @s=	'insert into #stats(wk, value, stat)
			select '''+@d +''', count(*),''completed''			
			from ['+@process_tablename+'] a
			where ('+@where+') and concat(datepart(year,completed_date),'' wk '',datepart(wk,completed_date))='''+@d +''''
		exec(@s)
		set @s=	'insert into #stats(wk, value, stat)
			select '''+@d +''', count(*),''open''			
			from ['+@process_tablename+'] a
			where ('+@where+') and '''+convert(varchar,@from,121)+''' > created_date and (completed_date = ''1900-01-01'' or completed_date is null or completed_date>'''+convert(varchar,@from,113)+''')'
		print @s
		exec(@s)
		set @from= dateadd(wk,1,@from)
		
	end
	select a.wk, a.value as created, b.value as completed , c.value as [open]
		from #stats a 
		inner join #stats b on a.stat='created' and b.stat='completed' and a.wk=b.wk
		left join #stats c on a.stat='created' and c.stat='open' and a.wk=c.wk
	drop table #stats
end

GO
/****** Object:  StoredProcedure [dbo].[profile_retention]    Script Date: 15/07/2019 16:56:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
create proc [dbo].[profile_retention] as
begin
	set nocount on
	declare p cursor for select table_name, profile_name, where_column, where_values, retention_days, id from metadata_profile where coalesce(retention_days,0)>0
	declare @pt nvarchar(1000)
	declare @pn nvarchar(100)
	declare @pw nvarchar(1000)
	declare @pv nvarchar(1000)
	declare @pr int
	declare @pid int
	declare @cmd nvarchar(max)
	open p
	fetch next from p into @pt, @pn, @pw, @pv, @pr, @pid
	while @@fetch_status=0
	begin
		set @cmd = 'insert into metadata_retention_log(table_name, profile_id, profile_name, action_date, minref, maxref, rows) select '''+@pt+''','+convert(varchar,@pid)+','''+@pn+''',getdate(), min(reference), max(reference), count(*) from ['+@pt+'] where completed_date is not null and completed_date < dateadd(dd, -'+convert(varchar(10),@pr)+', getdate())'
		if @pw is not null and @pw<>''
			set @cmd=@cmd+' and ['+@pw+'] in ('''+replace(replace(@pv,'''',''''''),',',''',''')+''')' 
		print @cmd
		exec (@cmd)
		if @@ROWCOUNT>0
		begin
			set @cmd = 'delete from ['+@pt+'] where completed_date is not null and completed_date < dateadd(dd, -'+convert(varchar(10),@pr)+', getdate())'
			if @pw is not null and @pw<>''
				set @cmd=@cmd+' and ['+@pw+'] in ('''+replace(replace(@pv,'''',''''''),',',''',''')+''')' 
			print @cmd
			--  exec (@cmd)
		end

		fetch next from p into @pt, @pn, @pw, @pv, @pr, @pid
	end
	close p
	deallocate p

end

GO
/****** Object:  StoredProcedure [dbo].[reportdata]    Script Date: 15/07/2019 16:56:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE procedure [dbo].[reportdata](@process_tablename nvarchar(1000), @strstart varchar(30), @strend varchar(30), @email varchar(500), @profile int=0) as
begin
	set dateformat ymd
	declare @start datetime
	declare @end datetime
	set @start=convert(datetime,@strstart)
	set @end=convert(datetime,@strend)
	declare @cmd nvarchar(max)
	declare @cols nvarchar(max)
	declare @ok nvarchar(500)
	declare @b_view bit			
	declare @where nvarchar(max)
	set nocount on
	-- figure out what AD groups the user is a member of
	create table #usergroups(name nvarchar(1000))
	insert into #usergroups(name) exec getADgroups @email

	-- try to load a profile first, that matches the table name, and either contains the email address or has blank email (matches everyone)
	select top 1
		@b_view = b_view, 
		@ok = table_name, 
		@cols= 
			coalesce(stuff(dbo.[process_hidden_column_list]([filter_cols],'_rrr'),1,1,'')+',','')+
			case 
				when [display_cols] is null then 'a.*' 
				else stuff(replace(','+replace([display_cols],' ',''),',',',a.'),1,1,'')
				+ coalesce(dbo.process_hidden_column_list([hide_cols],'_hhh'),'')
			end
			+ case 
				when map='single' then ', [' + location_field + '] as ___maplocation_hhh'
				when map='separate' then ', concat([' + lat_field+'], '', '', ['+lng_field + ']) as ___maplocation_hhh'
				else '' 
			end
			+ case 
			    when coalesce(map_icon_field,'')<>'' and coalesce(map_icon_template,'')<>''
 			    then ', replace('''+map_icon_template+''',''ICONNAME'', ['+map_icon_field+']) as ___mapicon_hhh'
			    else ''
			end, 
		@where = case when coalesce(where_column,'')='' then '1=1' else 'a.['+where_column+'] in('''+replace(replace(where_values,'''',''''''),', ',''',''')+''')' end
		from metadata_profile
		where table_name = @process_tablename 
			and (id=@profile or @profile=0) 
			and ( --permissions checks
				user_emails like '%'+@email +'%'  -- email address is on the profile, grant access
				or exists(select 0 from #usergroups where ', '+user_groups+',' like '%, '+name+',%') -- if the user is in one of the listed groups, grant access
				-- or (coalesce(user_emails,'')='' and coalesce(user_groups,'')='') -- no permissions defined means everyone has access	
				or exists (select 0 from metadata_superuser where email=@email) --superusers have access
				)
	if @ok is null 
	begin
		-- no profile was found. see if the user is a superuser, in which case they get to see everything
		select @ok = 'yeah', @cols='a.*', @where='1=1' from metadata_superuser where email=@email
	end

	if @ok is null 
	begin
		select 'No data could be obtained. Please check your permissions' as result
		return
	end


	declare @stage_tablename nvarchar(1000)
	select @stage_tablename = 'stage_'+substring(@process_tablename,9,1000)
	set @cmd=' ORDER BY a.reference'
	-- if @cols is null set @cols='a.*'
	-- if the dates are null, we query all active records
	if @start is null or @end is null
		set @cmd= 'a.completed_date = ''1900-01-01'' or a.completed_date is null '+@cmd
	else
	    -- otherwise we get records that were completed within the specified dates
		set @cmd= 'a.completed_date between '''+convert(varchar,@start)+''' and '''+ convert(varchar, @end)+''' '+@cmd	
	if @ok is null or @b_view = 1
	begin
		set @cols=@cols+', ''/AchieveForms?service=R4&mode=view&task_id=''+a.reference+''&db_id=''+laststage.task_db_id as view_url'
	end
	select @cmd = 'select  '+@cols+' from ['+@process_tablename+'] a '
	+'left join  (select ROW_NUMBER() over(partition by reference order by completed_date desc) as r,reference, task_db_id '
	+' from ['+@stage_tablename+']) as laststage on r=1 and laststage.reference=a.reference'
	+' where ('+@where+') and '+@cmd
	-- select  @cmd  as sql, @where as whereclause, 'hello' as test, @start as start, @end as theend, @cols as cols
	print @cmd
	exec (@cmd)
end

GO
/****** Object:  StoredProcedure [dbo].[reportdata2]    Script Date: 15/07/2019 16:56:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE procedure [dbo].[reportdata2](@process_tablename nvarchar(1000), @start datetime, @end datetime, @email varchar(500), @profile int=0) as
begin
	declare @cmd nvarchar(max)
	declare @cols nvarchar(max)
	declare @ok nvarchar(500)
	declare @where nvarchar(max)

	-- figure out what AD groups the user is a member of
	create table #usergroups(name nvarchar(1000))
	insert into #usergroups(name) exec getADmemberships @email

	-- try to load a profile first, that matches the table name, and either contains the email address or has blank email (matches everyone)
	select top 1
		@ok = table_name, 
		@cols= case 
			when [display_cols] is null then 'a.*' 
			else stuff(replace(','+[display_cols],',',',a.'),1,1,'')
			+ coalesce(dbo.process_hidden_column_list([hide_cols]),'')
			end, 
		@where = case when where_column is null then '1=1' else 'a.['+where_column+'] in('''+replace(replace(where_values,'''',''''''),',',''',''')+''')' end
		from metadata_profile
		where table_name = @process_tablename 
			and (id=@profile or @profile=0) 
			and ( --permissions checks
				user_emails like '%'+@email +'%'  -- email address is on the profile, grant access
				or exists(select 0 from #usergroups where ','+user_groups+',' like '%,'+name+',%') -- if the user is in one of the listed groups, grant access
				or (coalesce(user_emails,'')='' and coalesce(user_groups,'')='') -- no permissions defined means everyone has access	
				or exists (select 0 from metadata_superuser where email=@email) --superusers have access
				)
	if @ok is null 
	begin
		-- no profile was found. see if the user is a superuser, in which case they get to see everything
		select @ok = 'yeah', @cols='a.*', @where='1=1' from metadata_superuser where email=@email
	end

	if @ok is null 
	begin
		select 'No data could be obtained. Please check your permissions' as result
		return
	end


	declare @stage_tablename nvarchar(1000)
	select @stage_tablename = 'stage_'+substring(@process_tablename,9,1000)
	set @cmd=' ORDER BY a.reference'
	-- if @cols is null set @cols='a.*'
	-- if the dates are null, we query all active records
	if @start is null or @end is null
		set @cmd= 'a.completed_date = ''1900-01-01'' or a.completed_date is null '+@cmd
	else
	    -- otherwise we get records that were completed within the specified dates
		set @cmd= 'a.completed_date between '''+convert(varchar,@start)+''' and '''+ convert(varchar, @end)+''' '+@cmd	

	set @cols=@cols+', ''/AchieveForms?service=R4&mode=view&task_id=''+a.reference+''&db_id=''+laststage.task_db_id as view_url'
	select @cmd = 'select  '+@cols+' from ['+@process_tablename+'] a '
	+'left join  (select ROW_NUMBER() over(partition by reference order by completed_date desc) as r,reference, task_db_id '
	+' from ['+@stage_tablename+']) as laststage on r=1 and laststage.reference=a.reference'
	+' where ('+@where+') and '+@cmd
	-- select  @cmd  as sql, @where as whereclause, 'hello' as test, @start as start, @end as theend, @cols as cols
	exec (@cmd)
end


GO
/****** Object:  StoredProcedure [dbo].[reportlist]    Script Date: 15/07/2019 16:56:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE procedure [dbo].[reportlist](@process_tablename nvarchar(1000), @field nvarchar(1000))
as
	declare @cmd nvarchar(max)
	set @cmd = 'select distinct ['+@field+'] as name, ['+@field+'] as display from ['+@process_tablename+'] where ['+@field+'] is not null and ['+@field+']<>'''' order by 1'
	exec(@cmd)
GO
/****** Object:  StoredProcedure [dbo].[reportprocesslist]    Script Date: 15/07/2019 16:56:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE proc [dbo].[reportprocesslist] @email nvarchar(500) as
begin
	-- figure out what AD groups the user is a member of
	create table #usergroups(name nvarchar(1000))
	insert into #usergroups(name) exec getADgroups @email



	select 
	process_tablename as process_tablename_hhh,
	stage_tablename as stage_tablename_hhh,
	processid as process_id_hhh,
	process_name,
	b.profile_name, 
	'/dataprocess?profileid='+coalesce(convert(varchar,b.id),'')+'&profilename='+coalesce(b.profile_name,'')+'&process_tablename='+process_tablename+'&process_name='+process_name as view_url, 
	case when exists(select 0 from metadata_superuser where email=@email) then '/service/Admin_view_data?profileid='+coalesce(convert(varchar,b.id),'')+'&process='+process_tablename else '' end as edit_url,
	coalesce(b.min_completed,a.min_completed) as min_completed,
	coalesce(b.max_completed,a.max_completed) as max_completed,
	coalesce(b.completed_row_count,a.completed_row_count) as completed_row_count_nnn,
	coalesce(b.active_row_count,a.active_row_count) as active_row_count_nnn,
	coalesce(b.min_incomplete_start,a.min_incomplete_start) as min_incomplete_start,
	coalesce(b.max_exported,a.max_exported) as max_exported,
	b.display_cols as display_cols_hhh,
	b.hide_cols as hide_cols_hhh,
	b.user_emails as user_emails_hhh
	 from metadata_process a --left join to the profile where we have permission
	 left join metadata_profile b on a.process_tablename=b.table_name
		and (b.user_emails like '%'+@email+'%' -- or b.user_emails='' 
			or exists (select 0 from metadata_superuser where email=@email)
			or exists(select 0 from #usergroups where ', '+user_groups+',' like '%, '+#usergroups.name+',%' ) 
			)
	 where 
	 exists (select 0 from metadata_superuser where email=@email) --user must be a superuser, or linked to the profile, or a member of the profile's groups
	 or exists (select 0 
		from metadata_profile 
		where table_name = a.process_tablename
		and (b.user_emails like '%'+@email+'%'  )) -- or user_emails=''
	 or exists(select 0 from #usergroups where ', '+b.user_groups+',' like '%, '+#usergroups.name+',%' ) 
	 
	 order by process_name
 
 end

GO
/****** Object:  StoredProcedure [dbo].[stage_stats_for_box_chart]    Script Date: 15/07/2019 16:56:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO



CREATE proc [dbo].[stage_stats_for_box_chart](@id nvarchar(100), @strmindate varchar(30), @strmaxdate varchar(30), @template varchar(max),  @email varchar(500)='', @profile int=0) as
begin
	declare @t nvarchar(100)
	declare @s nvarchar(1000)
	declare @stagename varchar(200)
	declare @reference varchar(100)
	declare @mins decimal
	declare @where varchar(max)
	set dateformat ymd
	declare @mindate datetime
	declare @maxdate datetime
	set @mindate=convert(datetime,@strmindate)
	set @maxdate=convert(datetime,@strmaxdate)

	exec getwhere @process_tablename=@id, @email=@email, @profile=@profile, @where=@where output

	create table #results(id int identity(1,1),stagename varchar(200), labels varchar(max), datas varchar(max))
	create table #datas(id int identity(1,1),stagename varchar(200), reference varchar(100), mins decimal)
	declare t cursor for select stage_tablename from v_processes where process_tablename=@id
	open t
	fetch next from t into @t
	while @@FETCH_STATUS=0
	begin
		print @t
		set @s = 'select distinct status,''[next]'',''[next]'' from ['+@t+'] b where b.reference in (select reference from ['+@id+'] a where '+@where+')'
		 
		print @s
		insert into #results(stagename, labels, datas)	exec(@s)
		--de duplicate, in case >1 table has the same stage name
		delete from #results where id in (select max(id) from #results group by stagename having count(*)>1)
		set @s='select status, reference, convert(decimal,sum(dbo.worktime(created_date, completed_date)))/60 as duration from ['+@t+'] b where b.reference in (select reference from ['+@id+'] a where '+@where+') and completed_date is not null and completed_date between '''+convert(varchar,@mindate,113)+''' and '''+ convert(varchar,@maxdate,113)+''' group by reference, status'
		print @s
		insert into #datas(stagename, reference, mins) exec(@s)
		fetch next from t into @t
	end
	close t
	deallocate t

	declare r cursor for select stagename, reference, mins from #datas
	open r
	fetch next from r into @stagename, @reference, @mins
	while @@FETCH_STATUS=0
	begin
		update #results set labels=replace(labels,'next','"'+@reference+'", next'), datas=replace(datas,'next',convert(varchar(10),round(@mins,2))+', next') where stagename=@stagename
		fetch next from r into @stagename, @reference, @mins
	end
	close r
	deallocate r
	delete from #results where labels='[next]'
	select 
		stagename, 
		replace(labels,', next','') as labels, 
		replace(datas,', next','') as datas,
		replace(replace(replace(@template,'[[datas]]',replace(datas,', next','')),'[[labels]]',replace(labels,', next','')),'[[stagename]]',stagename) as the_json 
	from #results

	drop table #results
	drop table #datas
end
GO

create function dbo.prevquarter(@q varchar(7)) returns varchar(7) as
begin
	declare @q0 varchar(7)
	select @q0=case 
		when substring(@q,7,1)='1' then concat(convert(int,left(@q,4))-1,' Q4')
		else concat(left(@q,6),convert(int,substring(@q,7,1))-1) END
	return @q0
end

GO
exec buildviews
go
print 'create a scheduled task to run "exec buildviews" nightly, after the Firmstep data dump is updated'
print 'also, update the getADgroups stored procedure to interact with your windows domain.'
