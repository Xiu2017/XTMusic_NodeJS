class RequestUtils{

    /**
     * 同步请求
     * @param {请求方法 GET/POST} method 
     * @param {请求地址} url 
     * @param {表单数据} formData 
     */
    async requestSync(method, url, formData){
        return await this.request(method, url, formData);
    }

    /**
     * 通过Promise让request变为同步请求
     * @param {请求方法 GET/POST} method 
     * @param {请求地址} url 
     * @param {表单数据} formData 
     */
    request(method, url, formData){
        return new Promise((resolve, reject) => {
            let request = require('request');
            url = this.urlEncode(url);
            request({
                "url": url,
                "method": method,
                "form": formData
            },function(error, response, body){
                resolve(body);
            });
        });
    }

    /**
     * URL编码
     * @param {要编码的URL} url 
     */
    urlEncode(url){
        url = encodeURIComponent(url);
        url = url.replace(/\%3A/g, ":");
        url = url.replace(/\%2F/g, "/");
        url = url.replace(/\%3F/g, "?");
        url = url.replace(/\%3D/g, "=");
        url = url.replace(/\%26/g, "&");
        return url;
    }
}
module.exports = new RequestUtils;