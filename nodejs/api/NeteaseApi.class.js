class NeteaseApi{
    /**
     * 构造方法
     */
    constructor() {
        this.path = require('path');
        this.CLASS_PATH = this.path.resolve(__dirname, '../');
        this.RequestUtils = require(this.CLASS_PATH + '/utils/RequestUtils.class');
        this.urlEncode = require(this.CLASS_PATH + '/utils/netease-urlparamencode-utils');
        this.dataUtils = require(this.CLASS_PATH + '/utils/data-utils');
    }

    /**
     * 搜索歌曲列表
     * @param {键入内容} keyword 
     * @param {数量} limit 
     * @param {偏移量} offset 
     */
    async searchMusicList(keyword, limit, offset){
        let url = "http://music.163.com/weapi/cloudsearch/get/web?csrf_token=";
        let formData = this.urlEncode.searchMusicList(keyword, limit, (offset-1)*limit);
        formData = JSON.stringify(formData).replace("encText", "params");
        formData = JSON.parse(formData);
        let data = await this.RequestUtils.requestSync('POST', url, formData);
        return this.tranSongs(data);
    }

    /**
     * 获取歌曲链接
     * @param {歌曲id} id 
     */
    getMusicUrl(id){
        return "http://music.163.com/song/media/outer/url?id=" + id + ".mp3";
    }

    /**
     * 将返回结果转换为指定格式
     * @param {要转换的数据} data 
     */
    tranSongs(data){
        data = JSON.parse(data);
        data = data.result.songs;
        let songs = "";
        if(data == undefined || data == null || data.size == 0){
            return "-1";
        }
        for(let idx in data){
            let item = data[idx];
            songs += this.dataUtils.song(item.id, '', item.name, this.getArtists(item.ar), item.dt, item.al.name, item.al.picUrl, '', 0, 'netease') + ',';
        }
        songs += ',';
        songs = songs.replace(',,','');
        return this.dataUtils.songs(songs);
    }

    /**
     * 多个歌手
     */
    getArtists(data){
        let artists = '';
        for(let idx in data){
            let item = data[idx];
            artists += item.name + '、';
        }
        artists += '、';
        return artists.replace('、、','');
    }

}
module.exports = new NeteaseApi();