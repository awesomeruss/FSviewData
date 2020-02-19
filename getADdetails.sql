USE [CBC_Firmstep_Live]
GO

/****** Object:  StoredProcedure [dbo].[getADdetails]    Script Date: 18/02/2020 15:48:33 ******/
DROP PROCEDURE [dbo].[getADdetails]
GO

/****** Object:  StoredProcedure [dbo].[getADdetails]    Script Date: 18/02/2020 15:48:33 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO



CREATE proc [dbo].[getADdetails](@email nvarchar(500)='', @option nvarchar(500)='me') as
begin
    declare @domain varchar(100)
    declare @groupfilter varchar(100)
    declare @linkedserver varchar(100)
    set @domain='int.crawley.gov.uk'
    set @linkedserver='ADSI'
    set @groupfilter = 'AF%'
    declare @sql nvarchar(max)
    declare @path nvarchar(1024)
        if @email='russ@awesomeconsulting.co.uk' set @email='alison.hunt@crawley.gov.uk'
    if @email<>''
    begin
                if @option='me'
                begin
                        set @sql=
                                'select physicalDeliveryOfficeName, distinguishedName, manager, displayName, sAMAccountName, sn, givenName, title, department, mail, ipPhone, employeeNumber, telephoneNumber, mobile, info, accountExpires FROM 
                                openquery('+@linkedserver+', ''
                                select physicalDeliveryOfficeName,  distinguishedName, manager, displayName, sAMAccountName, sn, givenName, title, department, mail, ipPhone, employeeNumber, telephoneNumber, mobile, info, accountExpires from ''''GC://'+@domain+'''''
                                where objectCategory=''''Person''''
                                and mail='''''+@email+ '''''
                                '') as people'
                end
                if @option='team'
                begin
                set @sql=
            'select @path= distinguishedName from openquery('+@linkedserver+', ''
            select distinguishedName from ''''GC://'+@domain+'''''
            where objectCategory=''''Person''''
            and mail='''''+@email+ '''''
            '') as people'
                        print @sql
                        exec sp_executesql @sql, N'@path nvarchar(1024) output',@path=@path output
                        print @path

                        set @sql=
                        'select displayName as display, mail as name, distinguishedName, manager, displayName, sAMAccountName, sn, givenName, title, department, mail, ipPhone, employeeNumber, telephoneNumber, mobile, info, accountExpires FROM 
                        openquery('+@linkedserver+', ''
                        select distinguishedName, manager, displayName, sAMAccountName, sn, givenName, title, department, mail, ipPhone, employeeNumber, telephoneNumber, mobile, info, accountExpires from ''''GC://'+@domain+'''''
                        where objectCategory=''''Person''''
                        and manager='''''+@path+ '''''
                        '') as people order by display'
                end
                if @option='manager'
                begin
                set @sql=
            'select @path= manager from openquery('+@linkedserver+', ''
            select manager from ''''GC://'+@domain+'''''
            where objectCategory=''''Person''''
            and mail='''''+@email+ '''''
            '') as people'
                        print @sql
                        exec sp_executesql @sql, N'@path nvarchar(1024) output',@path=@path output
                        print @path

                        set @sql=
                        'select 
                                distinguishedName as manager_dn, 
                                physicalDeliveryOfficeName as manager_office,
                                manager as manager_manager, 
                                displayName as manager_displayName,
                                sAMAccountName as manager_sAMAccountName, 
                                sn as manager_sn, 
                                givenName as manager_givenName, 
                                title as manager_title, 
                                department as manager_department, 
                                mail as manager_mail, 
                                ipPhone as manager_ipPhone, 
                                employeeNumber as manager_employeeNumber, 
                                telephoneNumber as manager_telephoneNumber, 
                                mobile as manager_mobile, 
                                info as manager_info, 
                                accountExpires as manager_accountExpires FROM 
                        openquery('+@linkedserver+', ''
                        select physicalDeliveryOfficeName, distinguishedName, manager, displayName, sAMAccountName, sn, givenName, title, department, mail, ipPhone, employeeNumber, telephoneNumber, mobile, info, accountExpires from ''''GC://'+@domain+'''''
                        where objectCategory=''''Person''''
                        and distinguishedName='''''+@path+ '''''
                        '') as people'

                end
            print @sql
            exec sp_executesql @sql

    end        
        else
        begin
                create table #tmpusers(display nvarchar(500), name nvarchar(500),sAMAccountName nvarchar(500),telephoneNumber nvarchar(500), distinguishedName nvarchar(500), manager nvarchar(500), title nvarchar(500), department nvarchar(500), office nvarchar(500))
                declare @ascii smallint
                set @ascii=65
                while @ascii<91
                begin
                        set @sql=
                                        'select displayName as display, mail as name,sAMAccountName, telephoneNumber,   distinguishedName, manager, title, department, physicalDeliveryOfficeName FROM 
                                        openquery('+@linkedserver+', ''
                                        select displayName, mail, sAMAccountName, telephoneNumber,distinguishedName, manager, title, department,physicalDeliveryOfficeName from ''''GC://'+@domain+'''''
                                        where objectCategory=''''Person'''' and mail=''''*'''' and displayName=''''*'''' and sAMAccountName = '''''+char(@ascii)+'*''''
                                        '') as people 
                                        order by displayName desc'
                        insert #tmpusers exec(@sql)
                        select @ascii=@ascii+1
                end
                if @option='all'
                        select * from #tmpusers order by display
                if @option='datatable'
                        select a.display as Name, a.name as email, a.telephoneNumber as Tel, a.sAMAccountName as Windows_Account, a.Office, a.Department as Department_rrr, a.Title, b.display as Manager_Name, b.name as Manager_email
                                from #tmpusers a  left join #tmpusers b on a.manager=b.distinguishedName order by 1
                drop table #tmpusers
        end
        
--    set @sql='select name from openquery(ADSI,''SELECT name FROM ''''LDAP://DC=crawley,DC=gov,DC=uk'''' where objectClass=''''Group'''' and member = '''''+@path+''''' '') order by name '
    --print @sql
end
GO

