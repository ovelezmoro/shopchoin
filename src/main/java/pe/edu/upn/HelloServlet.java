package pe.edu.upn;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.time.LocalDateTime;

/**
 * Minimal example servlet.
 *
 * Notice there is NO <servlet> / <servlet-mapping> entry in web.xml for this class —
 * the @WebServlet annotation is enough. This is what "Servlet 3+" buys you over the
 * old Servlet 2.5 style, where every servlet had to be declared by hand in web.xml.
 */
@WebServlet("/hello")
public class HelloServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        String name = request.getParameter("name");
        request.setAttribute("name", (name == null || name.isBlank()) ? "world" : name);
        request.setAttribute("now", LocalDateTime.now());

        // Forward (server-side) to a JSP kept under WEB-INF, so it can only ever be
        // reached through this servlet — never opened directly by a raw URL.
        request.getRequestDispatcher("/WEB-INF/views/hello.jsp").forward(request, response);
    }
}
