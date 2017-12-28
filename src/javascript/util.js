function get_query_string(name, location) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var values = (location || window.location.search.substr(1)).match(reg);
    if (values !== null) return unescape(values[2]);
    return null;
}

function getCookie(name)
{
    var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
    if(arr=document.cookie.match(reg))
        return unescape(arr[2]);
    else
        return null;
}

function ajax(params) {
    var headers = $.extend(params.headers, {"X-Requested-With": "hec", "Cache-Control": "no-cache"});
    var final_params = $.extend({headers: headers}, params);
    final_params.complete = function (response) {
        params.complete && params.complete(response);
        if (response.status === 401 || response.status === 410) {
            window.location.href = "/html/login.html";
        } else if (response.status >= 500) {
            swal("", "系统繁忙，请稍后再试。");
        }
    };
    final_params.success = function (json) {
        if (json.error) {
            if (final_params.error) {
                final_params.error(json);
            }else {
                swal("", json.error.message);
            }
        }else {
            params.success(json);
        }
    };
    $.ajax(final_params);
}

function go_app_mall() {
    try {
        //尝试执行 IOS 回调
        goBackAppMall()
    }catch(error) {
        //执行失败, 尝试执行 Android 回调
        try {
            ejia.goBackAppMall()
        }catch(error) {
            //执行失败, 跳转到首页
            window.location.href = "/html/index.html";
        }
    }
}
function upload(callback) {
    var file = $("#file")[0].files[0];
    var fd = new FormData();
    fd.append("file", file);
    fd.append("name", file.name);
    fd.append("mime", file.type);
    fd.append("group", "public");
    var xhr = new XMLHttpRequest();
    xhr.open("post", "/file/upload", true);
    xhr.setRequestHeader("X-Requested-With", "hec");
    xhr.onload = function () {
        if(xhr.status==200){
            callback && callback(JSON.parse(xhr.response));
        }else if(xhr.status==401||xhr.status==410){
            window.location.href = "/html/login.html";
        }else if(xhr.status>=500){
            swal("","系统繁忙，请稍后再试");
        }
    };
    xhr.send(fd);
}

function getJsonFromUrl(url) {
    var obj = {};
    var parts = unescape(url).split("?")[1].split("&");
    for (var i = 0; i < parts.length; ++i) {
        var part = parts[i];
        var bracketEqualsPos = part.indexOf(']=');
        var pos = bracketEqualsPos === -1 ? part.indexOf('=') : bracketEqualsPos + 1;
        var key, val;
        if (pos === -1) {
            key = part;
            val = null;
        } else {
            key = part.slice(0, pos);
            val = part.slice(pos + 1);
            var index = key.indexOf('[');
            if(index === - 1) {
                obj[key] = val;
            }else {
                key = key.slice(0, index);
                if(!obj.hasOwnProperty(key)) {
                    obj[key] = []
                }
                obj[key].push(val);
            }
        }
    }
    return obj;
}

function scroll_load_more(load_data_id, callback, notInit) {
    var height = window.screen.height;
    function get_data() {
        var $load_data = $(load_data_id);
        if ($load_data.length > 0) {
            var url = $load_data.first().attr("href");
            var data = getJsonFromUrl(url);
            data.drop = parseInt(data.drop);
            data.take = parseInt(data.take);
            ajax({
                url: url,
                success: function (json) {
                    data.list = json.success.list;
                    data.count = json.success.count;
                    data.drop = data.drop + data.take;
                    $load_data.remove();
                    callback(data);
                }
            });
        }
    }
    if(notInit) {
        get_data();
    }else {
        var bottom_offset = 400;
        get_data();
        var load_more = _.debounce(function () {
            if (($(document).height() > height) && ($(document).height() - $(window).scrollTop() - height < bottom_offset)) {
                get_data();
            }
        }, 1000);
        $(window).scroll(load_more);
    }
}

function to_decimal(x) {
    var f = parseFloat(x);
    if (isNaN(f)) {
        return f;
    }
    f = Math.round(x*100)/100;
    var s = f.toString();
    var rs = s.indexOf('.');
    if (rs < 0) {
        rs = s.length;
        s += '.';
    }
    while (s.length <= rs + 2) {
        s += '0';
    }
    return s;
}
