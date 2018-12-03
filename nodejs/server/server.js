var express = require('express');
var app = express();
var path = require('path');
const HTML_PATH = path.resolve(__dirname, '../../webapps');
const CLASS_PATH = path.resolve(__dirname, '../');

//设置静态资源目录
app.use(express.static(path.join(__dirname, '../../webapps')));

/**
 * 访问首页
 */
app.get('/', function(req,res){
    res.sendfile(HTML_PATH + '/main.html');
});

/**
 * 获取歌词(酷狗)
 */
app.get('/getLyric', async function(req,res){
    let name = req.query.name;
    let duration = req.query.duration;
    let Kugou = require(CLASS_PATH + '/api/KugouApi.class');
    let lyric = await Kugou.searchLyric(name, duration);
    res.status(200).send(lyric);
});

/**
 * 获取歌曲列表
 */
app.get('/getMusicList', async function (req,res) {
    let keyword = req.query.keyword;
    let limit = req.query.limit;
    let offset = req.query.offset;
    let type = req.query.type;
    let api, musicList;
    switch(type){
        case 'kugou':
            api = require(CLASS_PATH + '/api/KugouApi.class');
            break;
        case 'netease':
            api = require(CLASS_PATH + '/api/NeteaseApi.class');
            break;
        case 'qq':
            api = require(CLASS_PATH + '/api/QQApi.class');
            break;
    }
    musicList = await api.searchMusicList(keyword, limit, offset);
    //musicList = new Buffer.from(musicList).toString('base64');
    //console.log(musicList);
    res.status(200).send(musicList);
});

/**
 * 获取歌曲连接
 */
app.get('/getMusicUrl', async function (req,res) {
    let param = req.query.param;
    let type = req.query.type;
    let api, musicUrl;
    switch(type){
        case 'kugou':
            api = require(CLASS_PATH + '/api/KugouApi.class');
            break;
        case 'netease':
            api = require(CLASS_PATH + '/api/NeteaseApi.class');
            break;
        case 'qq':
            api = require(CLASS_PATH + '/api/QQApi.class');
            break;
    }
    musicUrl = await api.getMusicUrl(param);
    res.status(200).send(musicUrl);
});

/**
 * 开启服务
 */
app.listen(3000);
console.log('服务开启：http://127.0.0.1:3000');
