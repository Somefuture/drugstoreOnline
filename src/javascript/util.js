function get_query_string(name) {
    var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
    var values = window.location.search.substr(1).match(reg);
    if(values!==null)return  unescape(values[2]);
    return null;
}


function getJsonFromUrl(url) {
    var qs = url.split("?")[1];
    var result = {};
    qs.split("&").forEach(function(part) {
        var item = part.split("=");
        result[item[0]] = decodeURIComponent(item[1]);
    });
    return result;
}
