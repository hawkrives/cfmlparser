<cfabort>
<cfhttp url="https://httpbin.org/ip">
<cfdump var="#cfhttp#">
<cfhttp url="https://httpbin.org/headers">
	<cfhttpparam type="header" name="Authorization" value="GoogleLogin auth=#authdata.auth#">
</cfhttp>
<cfdump var="#cfhttp#">
