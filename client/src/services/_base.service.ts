
import axios from 'axios';
import StorageService from './storage.service';
const base_url = import.meta.env.VITE_SERVER_URL;

const axiosInstance = axios.create({
    baseURL: `${base_url}/api`,
    headers: {
        "Content-type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-cache"
    }
});

axiosInstance.interceptors.request.use(
    async (config) => {
        const token = StorageService.getAccessToken();

        const bearerToken = token;

        config.headers.Authorization = `Bearer ${bearerToken}`;

        return config;
    },
    (error) => {
        console.log("InterceptorError: ", error)
        return Promise.reject(error);
    }
);

export enum StatusCode {
    OK = 200,
    Created = 201,
    BadRequest = 400,
    Unauthorized = 401,
    Forbidden = 403,
    NotFound = 404,
    InternalServerError = 500,
    NotImplemented = 501,
    BadGateway = 502,
    ServiceUnavailable = 503,
}
export interface CustomResponse<T> {
    data?: T | T[];
    statusCode: StatusCode;
    message?: string;
}

export default axiosInstance;