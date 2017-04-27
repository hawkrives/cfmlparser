<cfswitch expression="#url.animal#">
	<cfcase value="cow">
		moo
	</cfcase>
	<cfcase value="##">
		panda
	</cfcase>
	<cfdefaultcase>
		?
	</cfdefaultcase>
</cfswitch>