var audiolrc=document.getElementById("audiolrc");var nolrc=document.getElementById("nolrc");var lrctime=new Array();var liarray=new Array();var playing=null;var slogan=null;var songlrc="";var geci="#D13A31";document.onkeydown=function spacePlay(event){var e=event||window.event||arguments.callee.caller.arguments[0];if(e&&e.keyCode==32){window.parent.play_pause();e.preventDefault()}};window.onresize=function(){positionLrc()};function parseLyric(){if(!songlrc)return;lrctime=[];audiolrc.innerHTML="";nolrc.innerHTML="";lyric=songlrc.split('\r\n');for(var i=0;i<lyric.length;i++){var d=lyric[i].match(/\[\d{2}:\d{2}((\.|\:)\d{2})\]/g);var t=lyric[i].split(d);t=$.trim(t[1]);if(d!=null){var dt=String(d).split(':');var _t=parseInt(dt[0].split('[')[1])*60+parseFloat(dt[1].split(']')[0]);lrctime[i]=Math.round(_t*100)/100;audiolrc.innerHTML+='<li id="li'+i+'">'+t+'</li>'}}positionLrc();playlrc()}function positionLrc(){if(lrctime.length>0){setTimeout(function(){liarray=new Array();liarray[0]=parseInt($("ul li:eq(0)").get(0).offsetHeight);for(var i=1;i<=lrctime.length-1;i++){liarray[i]=liarray[i-1]+parseInt($("ul li:eq("+i+")").get(0).offsetHeight)}},500)}}var setDelayTime=0;var num=0;var minsize=14;var maxsize=14;function playlrc(jump){var audio=window.parent[0].document.getElementById("audio");$("html,body").stop(true);clearInterval(playing);clearTimeout(slogan);if(jump==1){$("ul li:eq("+num+")").stop(true);$("ul li:eq("+(num-1)+")").stop(true);for(var i=0;i<lrctime.length;i++){if($("#li"+i).attr("style"))document.getElementById("li"+i).removeAttribute("style")}num=0;while(audio.currentTime>=(lrctime[num+1]+setDelayTime-0.2)){num++}if(num==0){document.body.scrollTop=0;document.documentElement.scrollTop=0}else{$("ul li:eq("+num+")").css('fontSize',maxsize+"px");$("ul li:eq("+(num-1)+")").css('fontSize',minsize+"px")}}else{document.body.scrollTop=0;document.documentElement.scrollTop=0;num=0}playing=setInterval(function(){if(!songlrc){clearInterval(playing);if(nolrc.innerText=="找不到歌词文件"){clearplay()}return}if(audio.currentTime&&audio.currentTime>=(lrctime[num]+setDelayTime-0.2)){if(window.parent.isShow==1){$("html,body").animate({"scrollTop":liarray[num]+10+(num/3)},200)}else{$("html,body").animate({"scrollTop":liarray[num]+40+(num/6)},200)}$("ul li:eq("+num+")").animate({fontSize:maxsize+"px"},200);document.getElementById("li"+num).style.color=geci;if(num!=0){$("ul li:eq("+(num-1)+")").animate({fontSize:minsize+"px"},200);document.getElementById("li"+(num-1)).style.color="#666666"}num++}},10)}function clearplay(){$("html,body").stop(true);clearInterval(playing);clearTimeout(slogan);audiolrc.innerHTML="";document.body.scrollTop=0;document.documentElement.scrollTop=0;nolrc.innerText="找不到歌词";slogan=setTimeout(function(){nolrc.innerText="炫听音乐，炫酷生活"},5000)}function jumplink(obj){window.open("http://www.baidu.com.cn/s?wd="+obj.innerText+"&cl=3")}function showdelrc(num){if(num==1){$('.delrc').css('display','block')}else{$('.delrc').css('display','none')}}function delrc(denum){if(songlrc){setDelayTime+=denum;$(".delrctime").text(-Math.round(setDelayTime*10)/10);playlrc(1);var index=window.parent[0].num;var musicname=window.parent[0].musicname;var temp=JSON.parse(localStorage.getItem(musicname[index]));temp[3]=""+Math.round(setDelayTime*10)/10;localStorage.setItem(musicname[index],JSON.stringify(temp))}}