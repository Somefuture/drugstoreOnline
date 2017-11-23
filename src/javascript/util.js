function get_query_string(name) {
    var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
    var values = window.location.search.substr(1).match(reg);
    if(values!==null)return  unescape(values[2]);
    return null;
}