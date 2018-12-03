const NETEASE_BASE_URL = "http://music.163.com/";

/**
 * 获取用户歌单
 * @param {用户uid} uid 
 * @param {数量} limit 
 * @param {偏移量} offset 
 */
function getPlayListOfUser(uid, limit, offset){
    let url = NETEASE_BASE_URL + "weapi/user/playlist?csrf_token=";
    let paras = {
        "uid" : uid,
        "limit" : limit,
        "offset" : offset,
        "csrf_token" : "nothing"
    };
    return UrlParamPair(url, JSON.stringify(paras));
}

/**
 * 获取歌曲评论
 * @param {歌曲id} id 
 * @param {数量} limit 
 * @param {偏移量} offset 
 */
function getDetailOfPlaylist(id, limit, offset){
    let paras ={
        "id" : id,
        "limit" : limit,
        "offset" : offset,
        "total" : "True",
        "n" : "1000",
        "csrf_token" : "nothing"
    };
    return UrlParamPair("", JSON.stringify(paras));
}

/**
 * 搜索歌曲列表
 * @param {键入内容} keyword 
 * @param {数量} limit 
 * @param {偏移量} offset 
 */
function searchMusicList(keyword, limit, offset){
    let paras = {
        "s":keyword,
        "limit":limit,
        "offset":offset,
        "total":"True",
        "n":"1000",
        "csrf_token":"nothing",
        "type":"1"
    };
    return UrlParamPair("", JSON.stringify(paras));
}

/**
 * 格式化请求参数
 */
function UrlParamPair(url, paras){
    let paramEncode = require('./netease-urlparamencode');
    return paramEncode.myFunc(paras);
}

module.exports = {
    getPlayListOfUser,
    getDetailOfPlaylist,
    searchMusicList
}