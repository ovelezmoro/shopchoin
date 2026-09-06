<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Hello</title>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/css/style.css">
</head>
<body>
<main>
    <h1>Hello, <c:out value="${name}"/>!</h1>
    <p>
        This page lives under <code>/WEB-INF/views</code>, so it can't be opened by typing
        its URL directly — only <code>HelloServlet</code> can reach it, via
        <code>getRequestDispatcher(...).forward(...)</code>.
    </p>
    <p>Server time: <c:out value="${now}"/></p>
    <p><a href="${pageContext.request.contextPath}/">&larr; back home</a></p>
</main>
</body>
</html>
