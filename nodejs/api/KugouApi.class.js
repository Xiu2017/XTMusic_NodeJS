/**
 * 酷狗音乐api接口
 */
class KugouApi {

    /**
     * 构造方法
     */
    constructor() {
        this.path = require('path');
        this.CLASS_PATH = this.path.resolve(__dirname, '../');
        this.RequestUtils = require(this.CLASS_PATH + '/utils/RequestUtils.class');
        this.dataUtils = require(this.CLASS_PATH + '/utils/data-utils');
    }

    /**
     * 搜索歌词
     * @param {歌曲名称} name 
     * @param {歌曲时长(ms)} duration 
     */
    async searchLyric(name, duration) {
        let url = "http://lyrics.kugou.com/search?ver=1&man=yes&client=pc&keyword=" + name + "&duration=" + duration + "&hash=";
        //请求歌词列表
        let res = await this.RequestUtils.requestSync('GET', url);
        if (res != null && res != undefined && res != "") {
            res = JSON.parse(res);
            if (res.candidates[0] == undefined) {
                return '-1';
            }
            let id = res.candidates[0].id;
            let accesskey = res.candidates[0].accesskey;
            url = "http://lyrics.kugou.com/download?ver=1&client=pc&id=" + id + "&accesskey=" + accesskey + "&fmt=lrc&charset=utf8";
            //请求歌词(Base64)
            res = await this.RequestUtils.requestSync('GET', url);
            res = JSON.parse(res);
            if (res.content == undefined) {
                return '-1';
            }
            return res.content;
        }
    }

    /**
     * 搜索歌曲列表
     * @param {键入内容} keyword 
     * @param {数量} limit 
     * @param {偏移量} offset 
     */
    async searchMusicList(keyword, limit, offset) {
        let url = "http://mobilecdn.kugou.com/api/v3/search/song?format=jsonp&keyword=" + keyword + "&pagesize=" + limit + "&page=" + offset + "&showtype=1";
        let data = await this.RequestUtils.requestSync('GET', url);
        return await this.tranSongs(data);
    }

    /**
     * 获取歌曲链接
     * @param {歌曲hash值} hash 
     */
    async getMusicUrl(hash) {
        let url = "http://www.kugou.com/yy/index.php?r=play/getdata&hash=" + hash;
        let res = await this.RequestUtils.requestSync('POST', url);
        return JSON.parse(res).data.play_url;
    }

    /**
     * 获取专辑图片
     * @param {歌曲hash值} hash 
     */
    async getAlbumImg(hash) {
        let url = "http://www.kugou.com/yy/index.php?r=play/getdata&hash=" + hash;
        let res = await this.RequestUtils.requestSync('POST', url);
        return JSON.parse(res).data.img;
    }

    /**
     * 将返回结果转换为指定格式
     * @param {要转换的数据} data 
     */
    async tranSongs(data) {
        data = data.replace('({', '{').replace('})', '}');
        data = JSON.parse(data);
        data = data.data.info;
        let songs = '';
        if (data == undefined || data == null || data.size == 0) {
            return "-1";
        }
        for (let idx in data) {
            let item = data[idx];
            songs += this.dataUtils.song(item.hash, '', item.songname_original, item.singername, 0, item.album_name, '', '', item.filesize, 'kugou') + ',';
            //let musicInfo = await this.getMusicUrl(item.hash);
            //musicInfo = JSON.parse(musicInfo).data;
            //songs += this.dataUtils.song(musicInfo.hash, musicInfo.play_url, musicInfo.song_name, musicInfo.author_name, musicInfo.timelength, item.album_name, musicInfo.img, musicInfo.lyric, musicInfo.filesize, 'kugou') + ',';
        }
        songs += ',';
        songs = songs.replace(',,', '');
        return this.dataUtils.songs(songs);
    }

}
module.exports = new KugouApi();