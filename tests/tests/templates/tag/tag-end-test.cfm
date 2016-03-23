<cfif c IS "##">
				<cfif NOT inExpression>
					<!--- start of expr --->
					<cfif pos LT len(arguments.string)>
						<cfset next = Mid(arguments.string, pos+1, 1)>
					<cfelse>
						<cfset next = "">
					</cfif>
					<cfif next IS NOT "##">
						<cfset inExpression = true>
						<cfset expr = createObject("java", "java.lang.StringBuilder").init(c)>
						<cfset expressionStartPos = pos>
					</cfif>
				<cfelseif bracketStack EQ 0 AND parenStack EQ 0>
					<!--- end of expr --->
					<cfset inExpression = false>
					<cfset arrayAppend(result, {"expression"=expr.toString(), "position"=expressionStartPos})>
				</cfif>
</cfif>