var list = document.getElementById("list");
var audio = window.parent.document.getElementById("audio");
var song_name = window.parent.document.getElementById("song_name");
var lyric = new Array();
var musicname = new Array();
var musictags = new Array();
var musictitle = new Array();
var singer = new Array();
var album = new Array();
var albumimg = new Array();
var dataexist = new Array();
var isRuning = false;
var lastli = -1;
var mode = 1;
var num = 0;

function init() {
    document.getElementById("audio").volume = 0.5;// The scroll event.

    document.getElementById("audio").onerror = function () {
        window.parent.play_next();
    };
    $(window).scroll(function () {
        // When scroll at bottom, invoked getData() function.

        var htmlHeight = $(document).height();
        //clientHeight是网页在浏览器中的可视高度，
        var clientHeight = $(window).height();
        //scrollTop滚动条到顶部的垂直高度
        var scrollTop = $(document).scrollTop();
        //通过判断滚动条的top位置与可视网页之和与整个网页的高度是否相等来决定是否加载内容；
        var he = scrollTop + clientHeight;
        if (he >= htmlHeight * 0.98 && !window.parent.endOffset && table.songs != null && table.songs != undefined && table.songs.length < 200) {
            window.parent.nextPage();
        }
    });
}

var table = new Vue({
    el: '#list',
    data: {
        songs: null
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

function playSong(id) {
    let type = window.parent.type;
    $.ajax({
        url: '/getMusicUrl?param=' + id + '&type=' + type,
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

document.onkeydown = function spacePlay(event) {
    var e = event || window.event || arguments.callee.caller.arguments[0];
    if (e && e.keyCode == 32) {
        window.parent.play_pause();
        e.preventDefault();
    }
};

function changeSrc(mode, num) {
    if (table.songs == undefined) return;
    var vinylimg = window.parent.document.getElementById("vinylimg");
    var audioinfo = window.parent[1].document.getElementById("audioinfo");

    if (mode != 0) {
        playmode(this.mode, num);
        num = this.num;
    }

    let song = table.songs[num];

    song_name.innerHTML = '<marquee behavior="alternate" truespeed="truespeed" scrolldelay="100" scrollamount="2">' + song.artist + ' - ' + song.title + '</marquee>';

    $(audioinfo).find('.span1').html(song.title);
    $(audioinfo).find('.span2').html('歌手：<span onclick="jumplink(this)">' + (song.artist || '未知歌手') + '</span>');
    $(audioinfo).find('.span3').html('专辑：<span onclick="jumplink(this)">' + (song.album || '未知专辑') + '</span>');
    if (song.album) {
        window.parent.document.getElementById('bg-low').style.backgroundImage = 'url(\"' + song.image + '\")';
        window.parent.document.getElementById('bg').style.backgroundImage = 'url(\"' + song.image + '\")';
        // window.parent.document.getElementById('bg').style.backgroundSize = '100% auto';
        // window.parent.document.getElementById('bg').style.backgroundPosition = 'center center';
        vinylimg.setAttribute('src', song.image);
    } else {
        window.parent.document.getElementById('bg-low').style.backgroundImage = null;
        window.parent.document.getElementById('bg').style.backgroundImage = null;
        vinylimg.setAttribute('src', '../image/novinyl.png');
    }


    // if(lyric[num]){
    //     window.parent[1].songlrc = lyric[num];
    //     window.parent[1].parseLyric();
    // }else{
    //     window.parent[1].songlrc = "";
    //     window.parent[1].clearplay();
    // }

    //改变当前播放歌曲列表的显示样式
    if (lastli != -1) {
        $("#li" + (lastli + 1) + " td:eq(1)").removeAttr("style");
        $("#li" + (lastli + 1) + " td:eq(0)").removeAttr("value");
    }
    $("#li" + (num + 1) + " td:eq(1)").css("color", "#D13A31");
    $("#li" + (num + 1) + " td:eq(0)").attr("value", "gif");

    this.num = num;
    lastli = num;
    if (document.body.scrollTop > num * 39 - 436 && document.body.scrollTop < num * 39 + 44 || num == 0 || num == table.songs.size - 1) {
        now();
    }

    playSong(song.id);
}

//获取歌词
function getLyric(idx) {
    let duration = $('#audio')[0].duration;
    setTimeout(function () {
        if (isNaN(duration)) {
            getLyric(idx);
        } else {
            duration = Math.round(duration) * 1000;
            let song = table.songs[idx];
            $.ajax({
                url: '/getLyric?name=' + song.artist + ' - ' + song.title + '&duration=' + duration,
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

//定位当前歌曲
function now() {
    if (document.body.scrollTop <= num * 39 - 396 || document.body.scrollTop >= num * 39 + 4) {
        $("html,body").animate({ "scrollTop": this.num * 39 - 196 });
    }
}

function playmode(mode, num) {
    //var nowli = document.getElementById("li"+num);
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
function playgif(val) {
    if (val == 1) {
        $("#li" + (num + 1) + " td:eq(0)").attr("value", "gif");
    } else {
        $("#li" + (num + 1) + " td:eq(0)").attr("value", "png");
    }
}

//时间格式化00:00:00，将秒数转换为时分秒格式
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

/*function hiddenNow(num){
    if(num == 1){
        $('.now').css('display','block');
    }else{
        $('.now').css('display','none');
    }
}*/