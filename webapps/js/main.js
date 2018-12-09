var keyword = "华晨宇";  //键入内容
var limit = 20;  //数据量
var offset = 1;  //偏移量
var type = "netease";  //api类型
var endOffset = false;  //标记是否为最后一页
var ended = false;  //标记歌曲是否播放结束
var nownum = 0;  //用于保存当前播放歌曲的编号，由audiolist.html传值
var time = 0;  //定时关闭的时间
var timing;  //定时关闭的定时器
var isShow = true;  //用于记录歌词界面的展开状态
var flashSpeed = 500;  //歌词界面展开的速度设置

/**
 * 网页加载完成时初始化监听事件
 */
$(function () {

	//点击搜索按钮
	$("#search_button").click(function () {
		search();
	});
	//点击定时按钮
	$("#time_off").click(function (event) {
		$("#selectmode").css("display", "none");
		var selecttime = $("#selecttime")[0];
		switch (selecttime.style.display) {
			case "none":
				selecttime.style.display = "block";
				break;
			case "block":
				selecttime.style.display = "none";
				break;
			default:
				selecttime.style.display = "block";
				break;
		}
		event.stopPropagation();
	});
	//点击关闭定时器
	$(".cleartime").click(function () {
		cleartime();
	});
	//点击展开歌词按钮
	$(".open").click(function () {
		showLrc();
	});
	//点击上一首
	$("#last").click(function () {
		play_last();
	});
	//点击播放/暂停
	$("#play").click(function () {
		play_pause();
	});
	//点击下一首
	$("#next").click(function () {
		play_next();
	});
	//点击进度条
	$("#pro_bar").click(function () {
		bar_val();
	});
	//点击播放模式
	$("#playmode").click(function (event) {
		setPlayMode(0);
		event.stopPropagation();
	});

	//当输入框聚焦时，去除输入框提示文本
	$("#search").focus(function () {
		$(this).attr("placeholder", "");
	});

	//当输入框失焦时，显示输入框提示文本
	$("#search").blur(function () {
		$(this).attr("placeholder", "歌名/歌手/专辑");
	});

	//按下回车键时，触发搜索按钮点击事件
	$('#search').bind('keypress', function (event) {
		if (event.keyCode == "13") {
			$('#search_button').click();
		}
	});

	//当搜索类型下拉框发生改变时，触发搜索按钮点击事件，并改变主题
	$("#select").change(function () {
		$('#search_button').click();
		changeTheme(type);
	});

	//定时器时间选择框和播放模式选择框的隐藏
	document.onclick = function () {
		$("#selecttime,#selectmode").css("display", "none");
	};

	//按下空格键时，触发暂停/播放操作
	document.onkeydown = function (event) {
		var e = event || window.event || arguments.callee.caller.arguments[0];
		//当输入框处于聚焦状态时，不触发播放/暂停功能
		if ($("#search")[0] == document.activeElement) return;
		//触发播放/暂停功能，并禁用浏览器默认操作
		if (e && e.keyCode == 32) {
			play_pause();
			e.preventDefault();
		}
	};

	//检测到窗口关闭时，提示用户
	$(window).bind('beforeunload', function () {
		return '确定关闭炫听音乐吗？';
	});

	//鼠标移到歌词展开按钮时
	$("#center_right").mouseover(function () {
		openlrc(true);
		if (!isShow) {
			window.frames["audiolrc"].showdelrc(true);
		} else {
			window.frames["audiolrc"].showdelrc(false);
		}
	});
	$("#center_right").mouseout(function () {
		openlrc(false);
		window.frames["audiolrc"].showdelrc(false);
	});

	//初始化主题
	changeTheme(type);
});

/**
 * 搜索歌曲
 * @param {是否为下一页操作} next 
 */
function search(isNextPage) {
	let audiolist = window.frames["audiolist"];
	let searchVal = $("#search").val();
	let selected = $("#select option:selected").val();

	//如果不是下一页操作
	if (!isNextPage) {
		//设置页数为1，清空数据
		offset = 1;
		audiolist.table.songs = null;
		//如果搜索内容或者搜索类型都发生了变化，将正在播放曲目重置为1，将正在播放样式重置
		if (keyword != searchVal || type != selected) {
			audiolist.num = 0;
			audiolist.lastli = -1;
			audiolist.$("td").removeAttr("style").removeAttr("value");
		}
	}

	//给全局变量赋值，方便其他地方调用
	type = selected;
	keyword = searchVal;
	if (keyword == "") {
		keyword = "华晨宇";
	}

	//标记为最后一页，直到返回数据，防止数据没返回进行重复操作
	endOffset = true;
	let url = urlEncode('getMusicList?keyword=' + keyword + '&limit=' + limit + '&offset=' + offset + '&type=' + type);
	//开始请求
	$.ajax({
		url: url,
		success: function (result) {
			//如果有数据返回
			if (result != "-1") {
				//将数据转为JSON，并合并到songs
				let table = audiolist.table;
				let songs = table.songs;
				let res = JSON.parse(result).songs;
				if (!songs) {
					table.songs = res;
				} else {
					table.songs = songs.concat(res);
				}
				//如果返回的数据量小于定义的数据量，说明是最后一页
				if (res.length >= limit) {
					endOffset = false;
				}
			}
		}
	});

	//如果检测到在歌词界面，返回播放列表
	if (!isShow) {
		showLrc();
	}
}

/**
 * 下一页
 */
function nextPage() {
	offset++;
	search(true);
}

/**
 * 播放按钮的点击事件，判断当前状态需要触发的操作
 */
function play_pause() {
	let audiolist = window.frames["audiolist"]; //audiolist iframe
	let playButton = $("#play"); //播放按钮节点
	let audio = audiolist.$("#audio")[0]; //audio标签节点
	let vinyl = $("#vinyl"); //专辑CD节点
	let vinylHeader = $("#vinylheader"); //CD触头节点

	//列表加载完成后点击播放按钮执行播放第一首歌曲的操作
	if (!audio.src) {
		audiolist.changeSrc(1, 0);
		return; //跳出后，子页面audiolist会再次调用play_pause()方法
	}

	//如果当前为暂停状态，则执行播放及相关操作
	if (audio.paused) {
		audio.play();
		//将播放小图标设置为动态，并让专辑CD处于旋转状态
		audiolist.playgif(true);
		vinyl.css("animation-play-state", "running");
		vinylHeader.css("animation", "vinyldown 300ms forwards");
		//将播放按钮改为可暂停状态
		playButton.html("&#xe82f;");
		playButton.css({ "padding-left": "0px", "width": "44px" });
		$("#pro_time").css("display", "block"); //显示进度条的小圆球
		//重设进度条和时间的刷新并且跳出
		clearInterval("play_time()");
		setInterval("play_time()", 500);
	} else {
		audio.pause();
		//将播放小图标设置为静态，并让专辑CD处于静止状态
		audiolist.playgif(false);
		vinyl.css("animation-play-state", "paused");
		vinylHeader.css("animation", "vinylup 300ms forwards");
		//将播放按钮改为可播放状态
		playButton.html("&#xe831;");
		playButton.css({ "padding-left": "2px", "width": "42px" });
		//清除进度条和时间的刷新
		clearInterval("play_time()");
	}
}

/**
 * 播放上一首的操作
 */
function play_last() {
	let audiolist = window.frames["audiolist"];
	//获取正在播放歌曲的编号，减1后调用audiolist.html的播放方法
	nownum = audiolist.lastli;
	audiolist.changeSrc(audiolist.mode, nownum - 1);
}

//播放下一首的操作
function play_next() {
	let audiolist = window.frames["audiolist"];
	//获取正在播放歌曲的编号，加1后调用audiolist.html的播放方法
	nownum = audiolist.lastli;
	audiolist.changeSrc(audiolist.mode, nownum + 1);
}

//刷新进度条和时间
function play_time() {
	let audiolist = window.frames["audiolist"];
	let audio = audiolist.$("#audio")[0]; //音频标签节点

	//获取歌曲当前的播放时间，并处理成00:00的格式
	let minc = Math.floor(Math.round(audio.currentTime) / 60);
	if (minc < 10) minc = "0" + minc;
	let secc = Math.round(audio.currentTime) % 60;
	if (secc < 10) secc = "0" + secc;
	let mind = Math.floor(Math.round(audio.duration) / 60);
	if (isNaN(mind)) mind = "00";
	else if (mind < 10) mind = "0" + mind;
	let secd = Math.round(audio.duration) % 60;
	if (isNaN(secd)) secd = "00";
	else if (secd < 10) secd = "0" + secd;

	//刷新时间
	$("#song_time").text(minc + ":" + secc + "/" + mind + ":" + secd);

	//刷新进度条
	let marginleft = 668 / audio.duration;
	$("#pro_time").css("margin-left", Math.round(marginleft * audio.currentTime * 100) / 100 + "px");
	$("#pro_bar").css("background-size", Math.round(marginleft * audio.currentTime * 100) / 100 + 5 + "px 4px");

	//当前歌曲播放结束后，如果为单曲循环模式，则重新播放当前歌曲
	if (audio.ended && !ended && audiolist.mode == 2) {
		ended = true;
		audiolist.changeSrc(2, audiolist.num);
		//否则播放下一首
	} else if (audio.ended && !ended) {
		ended = true;
		play_next();
	}
}

/**
 * 点击播放进度条触发的时间跳转操作
 */
function bar_val() {
	let audio = window.frames["audiolist"].$("#audio")[0]; //audio标签节点

	//如果时间存在，则跳转到对应的时间播放
	if (audio.duration) {
		$("#pro_time").css("margin-left", event.offsetX - 2 + "px");
		$("#pro_bar").css("background-size", event.offsetX - 2 + "px");
		audio.currentTime = (audio.duration / 668) * event.offsetX;
	}

	//执行刷新歌词的操作
	window.frames["audiolrc"].playlrc(1);
}

/**
 * 定时结束执行的操作
 */
function closeDown() {
	let audio = window.frames["audiolist"].$("#audio")[0]; //audio标签节点
	if (!audio.paused) {
		play_pause();
	}
}

/**
 * 选择定时关闭时间执行的操作
 * @param {要定时的时间(s)} timemin 
 */
function setTimeOff(timemin) {
	var st = $(".showtime");
	let ct = $(".cleartime");

	//将时间转为秒，方便后面的调用，并清除定时器
	time = timemin * 60;
	clearInterval(timing);

	st.text(convertTime(time--));
	st.css({ "color": "#FFF", "display": "inline" });
	ct.css("display", "inline");
	$("#selecttime").css("display", "none");
	timing = setInterval(function () {
		if (time < 0) {
			clearInterval(timing);
			closeDown();
		} else {
			st.text(convertTime(time));
			time--;
		}
	}, 1000);
}

/**
 * 清除定时器
 */
function cleartime() {
	clearInterval(timing);
	$(".showtime").css("display", "none");
	$(".cleartime").css("display", "none");
}

/**
 * 点击播放模式执行的操作
 * @param {播放模式} mode 
 */
function setPlayMode(mode) {
	let audiolist = window.frames["audiolist"];
	let playMode = $("#playmode");
	let selMode = $("#selectmode");
	let state = selMode.css("display");

	$("#selecttime").css("display", "none");

	switch (mode) {
		case 0:
			if (state == "none")
				selMode.css("display", "block");
			else if (state == "block")
				selMode.css("display", "none");
			else
				selMode.css("display", "block");
			break;
		case 1:
			selMode.css("display", "none");
			playMode.html("&#xe83f");
			audiolist.mode = 1;
			break;
		case 2:
			selMode.css("display", "none");
			playMode.html("&#xe840");
			audiolist.mode = 2;
			break;
		case 3:
			selMode.css("display", "none");
			playMode.html("&#xe83e");
			audiolist.mode = 3;
			break;
	}
}

/**
 * 点击歌词展开按钮执行的操作
 */
function showLrc() {
	let audiolrc = window.frames["audiolrc"];
	let centerLeft = $('#center_left');
	let centerRight = $('#center_right');
	let vinyl = $('#vinyl');
	let vinylImg = $('#vinylimg');
	let vinylHeader = $('#vinylheader');
	let openButton = $('.open');
	let lrcIframe = $('#center_right iframe');
	let lrcContents = $('#audiolrc').contents();


	//如果歌曲没有展开
	if (isShow) {
		//执行展开动画
		centerLeft.animate({ 'width': '0px' }, flashSpeed);
		centerRight.animate({ 'width': '999px' }, flashSpeed);
		vinylHeader.animate({ 'width': '120px', 'height': '180px', 'marginLeft': '-510px', 'marginTop': '-404px' }, flashSpeed);
		vinyl.animate({ 'marginLeft': '-690px', 'marginTop': '80px', 'width': '300px', 'height': '300px' }, flashSpeed);
		vinylImg.animate({ 'borderRadius': '102px', 'width': '204px', 'height': '204px', 'marginTop': '48px' }, flashSpeed);
		openButton.animate({ 'marginTop': '230px' }, flashSpeed);
		openButton.html('&#xf105;');
		lrcIframe.animate({ 'width': '500px', 'height': '410px', 'marginTop': '36px', 'marginRight': '-180px' }, flashSpeed);
		lrcContents.find('body').animate({ 'width': '500px', 'marginLeft': '-20px' }, flashSpeed);
		lrcContents.find('ul').animate({ 'margin': '260px 0px 260px 0px' }, flashSpeed);
		lrcContents.find('#nolrc').animate({ 'marginTop': '60px', 'fontSize': '32px' }, flashSpeed);

		audiolrc.maxsize = 20;
		isShow = false; //重置歌词展开状态

	} else {
		//否则执行收起动画
		centerLeft.animate({ 'width': '767px' }, flashSpeed);
		centerRight.animate({ 'width': '232px' }, flashSpeed);
		vinylHeader.animate({ 'width': '54px', 'height': '86px', 'marginLeft': '150px', 'marginTop': '-190px' }, flashSpeed);
		vinyl.animate({ 'width': '160px', 'height': '160px', 'marginLeft': '35px', 'marginTop': '20px' }, flashSpeed);
		vinylImg.animate({ 'borderRadius': '54px', 'width': '108px', 'height': '108px', 'marginTop': '26px' }, flashSpeed);
		openButton.animate({ 'marginTop': '-250px' }, flashSpeed);
		openButton.html('&#xf104;');
		lrcIframe.animate({ 'width': '230px', 'height': '260px', 'marginTop': '-30px', 'marginRight': '0px' }, flashSpeed);
		lrcContents.find('body').animate({ 'width': '189px', 'marginLeft': '0px' }, flashSpeed);
		lrcContents.find('ul').animate({ 'margin': '145px 0px' }, flashSpeed);
		lrcContents.find('#nolrc').animate({ 'marginTop': '0px', 'fontSize': '18px' }, flashSpeed);

		audiolrc.maxsize = 14;
		isShow = true;//重置歌词展开状态
		audiolrc.playlrc(1);
	}

	//如果有歌词，则重新计算歌词的坐标
	if (audiolrc.songlrc) {
		audiolrc.liarray[0] = parseInt(lrcContents.find("ul li:eq(0)").get(0).offsetHeight);
		for (var i = 1; i <= audiolrc.lrctime.length - 1; i++) {
			audiolrc.liarray[i] = audiolrc.liarray[i - 1] + parseInt(lrcContents.find("ul li:eq(" + i + ")").get(0).offsetHeight);
		}
	}

	//歌词界面的校准
	if (!isShow) audiolrc.playlrc(1);
}

/**
 * 当鼠标移到歌词界面时，显示歌词展开按钮
 * @param {是否打开} num 
 */
function openlrc(num) {
	let openButton = $(".open");
	if (num) {
		openButton.css("display", "block");
	} else {
		openButton.css("display", "none");
	}
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

/**
 * 时间格式化00:00:00，将秒数转换为时分秒格式
 * @param {秒} time 
 */
function convertTime(time) {
	let hou = Math.floor(time / 3600);
	if (hou == 0) hou = "";
	else if (hou < 10) hou = "0" + hou + ":";
	else if (hou >= 10) hou = hou + ":";
	let min = Math.floor(time / 60 - Math.floor(time / 3600) * 60);
	if (min < 10) min = "0" + min;
	let sec = Math.round(time) % 60;
	if (sec < 10) sec = "0" + sec;
	return hou + "" + min + ":" + sec;
}