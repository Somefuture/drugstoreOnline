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
    var final_params = $.extend({headers: {"X-Requested-With": "hec", "Cache-Control": "no-cache"}}, params);
    final_params.complete = function (response) {
        params.complete && params.complete(response);
        if (response.status === 401 || response.status === 410) {
            window.location.href = "/html/login.html";
        } else if (response.status >= 400) {
            swal("", "系统繁忙，请稍后再试。");
        }
    };
    final_params.success = function (json) {
        if (json.error) {
            swal("", json.error.message);
        }
        params.success(json);
    };
    $.ajax(final_params);
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
            if (($(document).height() - $(window).scrollTop()) > bottom_offset) {
                get_data();
            }
        }, 500);
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
