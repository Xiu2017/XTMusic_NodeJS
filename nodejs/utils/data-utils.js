function song(id, url, title, artist, time, album, image, lyric, size, type){
    title = title.replace('\"', '“');
    artist = artist.replace('\"', '“');
    album = album.replace('\"', '“');
    return '{\"id\":\"'+id+'\",\"url\":\"'+url+'\",\"title\":\"'+title+'\",\"artist\":\"'+artist+'\",\"time\":'+time+',\"album\":\"'+album+'\",\"image\":\"'+image+'\",\"lyric\":\"'+lyric+'\",\"size\":'+size+',\"type\":\"'+type+'\"}';
}
function songs(songs){
    if(songs == undefined || songs == null || songs == '' || songs == ','){
        return '-1';
    }
    return '{\"songs\":['+songs+']}';
}

module.exports = {
    song,
    songs
}