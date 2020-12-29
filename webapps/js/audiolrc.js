var nolrc = $("#nolrc"); //找不到歌词界面节点
var lrctime = new Array(); //用于保存歌词的时间轴
var liarray = new Array(); //用于保存歌词的Y坐标
var playing = null; //用于保存同步歌词定时器的变量
var slogan = null; //用于保存标语定时器的变量
var songlrc = ""; //保存歌词
var geci = "rgb(223,59,59)"; //默认歌词颜色

//以下变量仅用于playlrc()方法和父页面的showLrc()方法
var setDelayTime = 0; //设置歌词同步的延时
var num = 0; //初始化歌词从第0行开始同步
var minsize = 14; //设置最小字体
var maxsize = 14; //设置最大字体

$(function () {
    //定时器时间选择框和播放模式选择框的隐藏
    document.onclick = function () {
        window.parent.$("#selecttime,#selectmode").css("display", "none");
    };
    //空格键执行暂停/播放操作
    document.onkeydown = function spacePlay(event) {
        var e = event || window.event || arguments.callee.caller.arguments[0];
        if (e && e.keyCode == 32) {
            window.parent.play_pause();
            e.preventDefault();
        }
    };
    //窗口大小改变时重新计算歌词position
    window.onresize = function () {
        positionLrc();
    };
    //鼠标在歌词界面时显示收起歌词界面按钮
    $(".delrc").mouseover(function () {
        window.parent.openlrc(0);
    });
    //点击歌词提前
    $(".de1").click(function () {
        delrc(-0.2);
    });
    //点击歌词延后
    $(".de2").click(function () {
        delrc(0.2);
    });
});

/**
 * 歌词列表数据绑定
 */
var lyricList = new Vue({
    el: "#audiolrc",
    data: {
        lyricData: {}
    }
});

/**
 * 歌词的处理
 */
function parseLyric() {
    //清空歌词界面
    nolrc.text("");
    lrctime = [];
    lyricList.lyricData = new Array();
    //如果audiolist.html页面传过来的歌词为空，则跳出
    if (!songlrc) {
        return;
    }
    //将歌词按段落切割存入数组当中
    let lyric = songlrc.split('\r\n');
    //遍历每行歌词
    for (const item of lyric) {
        //提取出时间
        var d = item.match(/\[\d{2}:\d{2}((\.|\:)\d{2})\]/g);
        //提取出歌词内容
        var t = item.split(d);
        t = $.trim(t[1]);
        if (d != null) {
            //将时间进行处理
            var dt = String(d).split(':');
            var _t = parseInt(dt[0].split('[')[1]) * 60 + parseFloat(dt[1].split(']')[0]);
            lrctime.push(Math.round(_t * 100) / 100);
            //将歌词内容写入列表
            lyricList.lyricData.push(t);
        }
    }

    //歌词行定位
    positionLrc();
    //开始同步歌词
    playlrc();
}

/**
 * 歌词行定位
 */
function positionLrc() {
    if (lrctime.length > 0) {
        setTimeout(function () {
            //清空歌词坐标，并重新计算新的坐标
            liarray = new Array();
            liarray[0] = parseInt($("ul li:eq(0)").get(0).offsetHeight);
            for (var i = 1; i <= lrctime.length - 1; i++) {
                liarray[i] = liarray[i - 1] + parseInt($("ul li:eq(" + i + ")").get(0).offsetHeight);
            }
        }, 500);
    }
}

/**
 * 同步歌词
 * @param {是否点击了进度条进行歌词跳转} jump 
 */
function playlrc(jump) {
    var audio = window.parent[0].$("#audio")[0];
    //进行停止滚动动画并清空歌词同步定时器的操作
    $("html,body").stop(true);
    clearInterval(playing);
    clearTimeout(slogan);

    //如果点击了进度条，将停止字体动画，清空所有歌词样式
    if (jump == 1) {
        $("ul li:eq(" + num + ")").stop(true);
        $("ul li:eq(" + (num - 1) + ")").stop(true);
        $("ul li").removeAttr("style");
        //重新计算当前位置歌词的索引
        num = 0;
        while (audio.currentTime >= (lrctime[num + 1] + setDelayTime - 0.2)) { num++; }
        if (num == 0) {
            document.body.scrollTop = 0;
            document.documentElement.scrollTop = 0;
        } else {
            $("ul li:eq(" + num + ")").css('fontSize', maxsize + "px");
            $("ul li:eq(" + (num - 1) + ")").css('fontSize', minsize + "px");
        }
        //如果不是跳转操作，则让歌词开始从头播放
    } else {
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
        num = 0;
    }

    //用于同步歌词的定时器
    playing = setInterval(function () {
        //如果歌词列表是空的，则清除当前定时器，显示标语，并跳出
        if (!songlrc) {
            clearInterval(playing);
            if (nolrc.text() == "找不到歌词") {
                clearplay();
            }
            return;
        }
        //如果歌曲时间存在，按时间遍历歌词
        if (audio.currentTime && audio.currentTime >= (lrctime[num] + setDelayTime - 0.2)) {
            //当前歌词滚动动画，字体变大动画，字体颜色的设置
            if (window.parent.isShow == 1) {
                $("html,body").animate({ "scrollTop": liarray[num] + 10 + (num / 3) }, 200);
            } else {
                $("html,body").animate({ "scrollTop": liarray[num] + 40 + (num / 6) }, 200);
            }
            $("ul li:eq(" + num + ")").animate({ fontSize: maxsize + "px" }, 200);
            $("#li" + num).css("color", geci);

            //如果存在上一句歌词，则执行字体变小动画，还原字体颜色
            if (num != 0) {
                $("ul li:eq(" + (num - 1) + ")").animate({ fontSize: minsize + "px" }, 200);
                $("#li" + (num - 1)).css("color", "#666666");
            }
            num++;
        }
    }, 10);
}

/**
 * 提示用户找不到歌词
 */
function clearplay() {
    //进行停止滚动动画并清空歌词同步定时器的操作
    $("html,body").stop(true);
    clearInterval(playing);
    clearTimeout(slogan);

    //清空歌词界面，并定位到顶部，提示用户找不到歌词文件
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
    nolrc.text("找不到歌词");
    lrctime = [];
    lyricList.lyricData = new Array();
    $("ul li").removeAttr("style");

    //一段时间后显示标语
    slogan = setTimeout(function () {
        nolrc.text("炫听音乐，炫酷生活")
    }, 5000);
}

/**
 * 显示校准歌词按钮
 * @param {是否显示} num 
 */
function showdelrc(num) {
    if (num) {
        $('.delrc').css('display', 'block');
    } else {
        $('.delrc').css('display', 'none');
    }
}

/**
 * 校准歌词
 * @param {调节量(s)} denum 
 */
function delrc(denum) {
    if (songlrc) {
        setDelayTime += denum;
        $(".delrctime").text(-Math.round(setDelayTime * 10) / 10);
        playlrc(1);
    }
}
