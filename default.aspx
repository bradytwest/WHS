<!doctype html>
<html class="no-js">
<head>
    <base href="/{SurveyRoot}">
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=11" />
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="google" content="notranslate">
    <link rel="icon" type="image/x-icon" href="/{SurveyRoot}/favicon.ico">
    <script src="/{SurveyRoot}/scripts/modernizr.min.js"></script>
</head>
<body>
    <app-root></app-root>
    <!--$(VersionString)-->
    <script type="text/javascript">
        var postRuntimeParameters = { <%
        For Each Item In Request.Form
            Response.Write("""" & Item & """:""" & Request.Form(Item) & """,")
        Next
            %> }</script>
</body>
</html>
