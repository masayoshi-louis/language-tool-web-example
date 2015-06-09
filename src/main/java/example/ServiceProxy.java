package example;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.http.HttpEntity;
import org.apache.http.NameValuePair;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.message.BasicNameValuePair;
import org.apache.http.util.EntityUtils;

/**
 * Servlet implementation class ServiceProxy
 */
public class ServiceProxy extends HttpServlet {
	private static final long serialVersionUID = 1L;

	/**
	 * Default constructor.
	 */
	public ServiceProxy() {
	}

	@Override
	protected void service(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
		request.setCharacterEncoding("UTF-8");
		CloseableHttpClient httpclient = HttpClients.createDefault();
		HttpPost httpPost = new HttpPost("http://your_own_server");
		List<NameValuePair> nvps = new ArrayList<NameValuePair>();
		nvps.add(new BasicNameValuePair("language", request
				.getParameter("language")));
		nvps.add(new BasicNameValuePair("text", request.getParameter("text")));
		System.out.println(nvps);
		httpPost.setEntity(new UrlEncodedFormEntity(nvps, "UTF-8"));
		CloseableHttpResponse ltResp = httpclient.execute(httpPost);
		try {
			System.out.println(ltResp.getStatusLine());
			HttpEntity entity = ltResp.getEntity();
			String res = EntityUtils.toString(entity);
			response.setContentType("application/xml");
			response.setCharacterEncoding("UTF-8");
			response.getWriter().print(res);
		} finally {
			ltResp.close();
			httpclient.close();
		}
	}

}
