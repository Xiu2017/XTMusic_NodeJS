class QQApi{
    
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
     * 搜索歌曲列表
     * @param {键入内容} keyword 
     * @param {数量} limit 
     * @param {偏移量} offset 
     */
    async searchMusicList(keyword, limit, offset){
        let url = "https://c.y.qq.com/soso/fcgi-bin/client_search_cp?t=0&aggr=1&cr=1&loginUin=0&format=json&inCharset=GB2312&outCharset=utf-8&platform=jqminiframe.json&needNewCode=0&catZhida=0&remoteplace=sizer.newclient.next_song" +
            "&w=" + keyword + "&n=" + limit + "&p=" + offset;
        let data = await this.RequestUtils.requestSync('GET', url);
        return this.tranSongs(data);
    }

    /**
     * 获取歌曲链接
     * @param {歌曲mid} mid 
     */
    async getMusicUrl(mid){
        //优先到douqq获取高音质链接
        let url = "http://www.douqq.com/qqmusic/qqapi.php?mid=" + mid;
        let res = await this.RequestUtils.requestSync('GET', url);
        res = JSON.parse(res);
        res = JSON.parse(res);
        if(res.mp3_l == ""){
            return "-1"
            //下列方式已失效
            //如果在douqq找不到高音质链接，从官网获取试听链接
            // let url = "http://base.music.qq.com/fcgi-bin/fcg_musicexpress.fcg?json=3&loginUin=0&format=jsonp&inCharset=GB2312&outCharset=GB2312&notice=0&platform=yqq&needNewCode=0";
            // let res = await this.RequestUtils.requestSync('GET', url);
            // res = res.replace("jsonCallback(", "").replace(");", "");
            // //根据获取到的key值拼接音乐链接
            // res = JSON.parse(res);
            // let urls = res.sip;
            // let key = res.key;
            // let musicUrl = urls[1] + "C100" + mid + ".m4a?vkey=" + key + "&fromtag=0";
            // console.log(musicUrl);
            // return musicUrl;
        }else{
            return res.mp3_l;
        }
    }


    /**
     * 将返回结果转换为指定格式
     * @param {要转换的数据} data 
     */
    tranSongs(data){
        data = JSON.parse(data);
        data = data.data.song.list;
        let songs = '';
        if(data == undefined || data == null || data.size == 0){
            return "-1";
        }
        for(let idx in data){
            let item = data[idx];
            songs += this.dataUtils.song(item.media_mid, '', item.songname, this.getArtists(item.singer), 0, item.albumname, this.getAlbumImg(item.albummid), '', item.size128, 'qq') + ',';
            //let musicInfo = await this.getMusicUrl(item.hash);
            //musicInfo = JSON.parse(musicInfo).data;
            //songs += this.dataUtils.song(musicInfo.hash, musicInfo.play_url, musicInfo.song_name, musicInfo.author_name, musicInfo.timelength, item.album_name, musicInfo.img, musicInfo.lyric, musicInfo.filesize, 'kugou') + ',';
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

    /**
     * 拼接专辑图片链接
     */
    getAlbumImg(albummid){
        if(albummid.length > 2){
            let albumUrl = "http://imgcache.qq.com/music/photo/mid_album_500/"
                    + albummid.substring(albummid.length - 2, albummid.length - 1) + "/"
                    + albummid.substring(albummid.length - 1, albummid.length) + "/"
                    + albummid + ".jpg";
            return albumUrl;
        }
    }

}
module.exports = new QQApi();