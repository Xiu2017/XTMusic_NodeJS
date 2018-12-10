var lastli = -1;  //上一首播放的歌曲的索引
var num = 0;  //当前播放的歌曲的索引
var mode = 1;  //播放模式：1 列表循环 2 单曲循环 3 随机播放

/**
 * 页面加载完成时初始化监听事件等
 */
$(function () {
    //播放错误时跳到下一首
    $("#audio")[0].onerror = function () {
        window.parent.play_next();
    };

    //列表滚动到底部时加载下一页
    $(window).scroll(function () {
        let htmlHeight = $(document).height();
        //clientHeight是网页在浏览器中的可视高度，
        let clientHeight = $(window).height();
        //scrollTop滚动条到顶部的垂直高度
        let scrollTop = $(document).scrollTop();
        //通过判断滚动条的top位置与可视网页之和与整个网页的高度是否相等来决定是否加载内容；
        let he = scrollTop + clientHeight;
        if (he >= htmlHeight * 0.98 && !window.parent.endOffset && table.songs != null && table.songs != undefined && table.songs.length < 200) {
            window.parent.nextPage();
        }
    });

    //定时器时间选择框和播放模式选择框的隐藏
    document.onclick = function () {
        window.parent.$("#selecttime,#selectmode").css("display", "none");
    };

    //按下空格键时，触发暂停/播放操作
    document.onkeydown = function (event) {
        let e = event || window.event || arguments.callee.caller.arguments[0];
        //触发播放/暂停功能，并禁用浏览器默认操作
        if (e && e.keyCode == 32) {
            play_pause();
            e.preventDefault();
        }
    };

    //搜索默认列表
    window.parent.$('#search_button').click();
});

/**
 * 音乐列表数据的绑定
 */
var table = new Vue({
    el: '#list',
    data: {
        songs: {}
    },
    methods: {
        toTime: function (sec) {
            return convertTime(sec / 1000);
        },
        playSong: function (mode, idx) {
            changeSrc(mode, idx);
        },
        page: function (arg) {
            offset = $("#page").text();
            if (arg == 'last' && offset > 1) {
                offset--;
                getMusicList();
            } else if (arg == 'next') {
                offset++;
                getMusicList();
            }
        }
    }
});

/**
 * 播放音乐
 * @param {要播放音乐的id} id 
 */
function playSong(id) {
    let type = window.parent.type;
    let url = encodeURI('/getMusicUrl?param=' + id + '&type=' + type);
    $.ajax({
        url: url,
        success: function (result) {
            if (result == "-1" || !(result.indexOf('mp3') >= 0 || result.indexOf('m4a') >= 0)) {
                window.parent.play_next();
            } else {
                $("#audio").attr("src", result);
                $('#audio')[0].pause();
                window.parent.play_pause();
                getLyric(num);
                window.parent.ended = false;
            }
        }
    });
}

/**
 * 双击歌曲执行的操作
 * @param {播放模式} mode 
 * @param {索引} num 
 */
function changeSrc(mode, num) {
    if (table.songs == undefined) return;

    let vinylimg = window.parent.$("#vinylimg");
    let bg = window.parent.$('#bg');
    let bgLow = window.parent.$('#bg-low');

    if (mode != 0) {
        playmode(this.mode, num);
        num = this.num;
    }

    let song = table.songs[num];
    window.parent.$("#song_name").html('<marquee behavior="alternate" truespeed="truespeed" scrolldelay="100" scrollamount="2">' + song.artist + ' - ' + song.title + '</marquee>');
    if (song.image) {
        bgLow.css('background-image', 'url(\"' + song.image + '\")');
        bg.css('background-image', 'url(\"' + song.image + '\")');
        vinylimg.attr('src', song.image);
    } else if (window.parent.type == 'kugou') {
        getAlbumImg(song.id);
    } else {
        bgLow.css('background-image', null);
        bg.css('background-image', null);
        vinylimg.attr('src', '../image/novinyl.png');
        window.parent.$('#vinyl').css('backgroundImage', 'url(../image/Vinyl_' + window.parent.type + '.png)');
    }

    //改变当前播放歌曲列表的显示样式
    if (lastli != -1) {
        $("#li" + (lastli + 1) + " td:eq(1)").removeAttr("style");
        $("#li" + (lastli + 1) + " td:eq(0)").removeAttr("value");
    }
    $("#li" + (num + 1) + " td:eq(1)").css("color", "rgb(" + window.parent.color + ")");
    $("#li" + (num + 1) + " td:eq(0)").attr("value", "gif_" + window.parent.type);

    this.num = num;
    lastli = num;

    playSong(song.id);
}

/**
 * 获取专辑图片
 * @param {歌曲id} id 
 */
function getAlbumImg(id) {
    let url = encodeURI('/getAlbumImg?param=' + id);
    $.ajax({
        url: url,
        success: function (result) {
            let bg = window.parent.$('#bg');
            let bgLow = window.parent.$('#bg-low');
            let vinylimg = window.parent.$("#vinylimg");
            if (result != null && result != '' && result != -1) {
                bgLow.css('background-image', 'url(\"' + result + '\")');
                bg.css('background-image', 'url(\"' + result + '\")');
                vinylimg.attr('src', result);
            } else {
                bgLow.css('background-image', null);
                bg.css('background-image', null);
                vinylimg.attr('src', '../image/novinyl.png');
                window.parent.$('#vinyl').css('backgroundImage', 'url(../image/Vinyl_' + window.parent.type + '.png)');
            }
        }
    });
}

/**
 * 获取歌词
 * @param {歌曲索引} idx 
 */
function getLyric(idx) {
    let duration = $('#audio')[0].duration;
    setTimeout(function () {
        if (isNaN(duration)) {
            getLyric(idx);
        } else {
            duration = Math.round(duration) * 1000;
            let song = table.songs[idx];
            let url = urlEncode('/getLyric?name=' + song.artist + ' - ' + song.title + '&duration=' + duration);
            $.ajax({
                url: url,
                success: function (result) {
                    if (result != '-1') {
                        result = new Base64().decode(result);
                        window.parent[1].songlrc = result;
                        window.parent[1].parseLyric();
                    } else {
                        window.parent[1].songlrc = "";
                        window.parent[1].clearplay();
                    }
                }
            });
        }
    }, 100);
}

/**
 * 根据播放模式计算下一索引
 * @param {播放模式} mode 
 * @param {当前索引} num 
 */
function playmode(mode, num) {
    let length = 0;
    switch (mode) {
        case 1:
        case 2: length = table.songs.length;
            if (num > length - 1) {
                num = 0;
                lastli = length - 1;
            } else if (num < 0) {
                num = length - 1;
                lastli = 0;
            }
            this.num = num;
            break;
        case 3: length = table.songs.length;
            this.num = Math.round(Math.random() * (length - 1));
            $("html,body").animate({ "scrollTop": this.num * 39 - 196 });
            break;
        default: break;
    }
}

/**
 * 切换播放图标状态
 * @param {是否播放图标} val 
 */
function playgif(val) {
    if (val) {
        $("#li" + (num + 1) + " td:eq(0)").attr("value", "gif_" + window.parent.type);
    } else {
        $("#li" + (num + 1) + " td:eq(0)").attr("value", "png_" + window.parent.type);
    }
}

/**
 * 时间格式化00:00:00，将秒数转换为时分秒格式
 * @param {秒} time 
 */
function convertTime(time) {
    var hou = Math.floor(time / 3600);
    if (hou == 0) hou = "";
    else if (hou < 10) hou = "0" + hou + ":";
    else if (hou >= 10) hou = hou + ":";
    var min = Math.floor(time / 60 - Math.floor(time / 3600) * 60);
    if (min < 10) min = "0" + min;
    var sec = Math.round(time) % 60;
    if (sec < 10) sec = "0" + sec;
    return hou + "" + min + ":" + sec;
}

/**
 * URL编码
 * @param {要编码的URL} url 
 */
function urlEncode(url) {
    url = encodeURIComponent(url);
    url = url.replace(/\%3A/g, ":");
    url = url.replace(/\%2F/g, "/");
    url = url.replace(/\%3F/g, "?");
    url = url.replace(/\%3D/g, "=");
    url = url.replace(/\%26/g, "&");
    return url;
}
