<cfif structKeyExists(url, "name")>
	<cfoutput>Hello #encodeForHTML(url.name)#</cfoutput>
<cfelse>
	What is your name?
</cfif>