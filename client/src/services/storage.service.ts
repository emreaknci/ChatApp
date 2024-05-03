
const StorageService = {

    setItem(key: string, value: string) {
        localStorage.setItem(key, value);
    },

    getItem(key: string) {
        return localStorage.getItem(key);
    },

    removeItem(key: string) {
        localStorage.removeItem(key);
    },

    clear() {
        localStorage.clear();
    },

    getAccessToken() {
        return localStorage.getItem("access_token");
    },

    getExpTime() {
        return localStorage.getItem("exp_time");
    },

    setAccessToken(token: string) {
        localStorage.setItem("access_token", token);
    },

    setExpTime(expTime: string) {
        localStorage.setItem("exp_time", expTime);
    },


    clearAccessToken() {
        localStorage.removeItem("access_token");
        localStorage.removeItem("exp_time");
    }
}

export default StorageService;