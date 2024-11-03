import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';

class ApiClient {
  private instance: AxiosInstance;

  constructor(baseURL: string) {
    this.instance = axios.create({
      baseURL,
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = Cookies.get('token');
        if (token) {
          config.headers = config.headers || {};
          config.headers.Token = `${token}`;
        }
        if (config.url?.includes('/login')) {
          config.headers = config.headers || {};
          config.headers['Content-Type'] = 'application/x-www-form-urlencoded';
        } else {
          config.headers = config.headers || {};
          config.headers['Content-Type'] = 'application/json';
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    this.instance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          // 清除 Cookies 中的 token
          Cookies.remove('token', { path: '/' });
          
          // 注意：这里不能直接使用 useUserStore 和 router
          // 我们将在组件中处理重定向和清除用户信息
          if (typeof window !== 'undefined') {
            // 客户端重定向
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // 公共方法来访问 axios 实例
  public get<T>(url: string, config = {}): Promise<T> {
    return this.instance.get(url, config);
  }

  public post<T>(url: string, data = {}, config = {}): Promise<T> {
    return this.instance.post(url, data, config);
  }

  public put<T>(url: string, data = {}, config = {}): Promise<T> {
    return this.instance.put(url, data, config);
  }

  public delete<T>(url: string, config = {}): Promise<T> {
    return this.instance.delete(url, config);
  }

  public patch<T>(url: string, data = {}, config = {}): Promise<T> {
    return this.instance.patch(url, data, config);
  }
}

const apiClient = new ApiClient('http://localhost:8080');

export default apiClient;