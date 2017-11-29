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


function get_location_search(url) {
    var uri =  url;
    uri = uri.replace("//", "");
    var index = uri.indexOf("/");
    if(index > 0) {
        return uri.substr(index);
    }else {
        return url;
    }
}

function ajax(params) {
    var final_params = $.extend({headers: {"X-Requested-With": "hec", "Cache-Control": "no-cache"}}, params);
    final_params.complete = function (response) {
        params.complete && params.complete(response);
        if (response.status === 401 || response.status === 410) {
            window.location.href = "login.html";
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
    var qs = url.split("?")[1];
    var result = {};
    qs.split("&").forEach(function (part) {
        var item = part.split("=");
        result[item[0]] = decodeURIComponent(item[1]);
    });
    return result;
}


function scroll_load_more(list_id, underscore_template, load_data_id, options) {
    $.get_data = function () {
        var $load_data = $(load_data_id);
        if ($load_data.length === 0) {
            $(window).unbind('scroll', load_more);
            return;
        }
        var $list = $(list_id);
        var url = $load_data[0].getAttribute("href");
        var data = Object.assign({}, getJsonFromUrl(url), options);
        data.drop = parseInt(data.drop);
        data.take = parseInt(data.take);
        ajax({
            url: url,
            success: function (json) {
                data.success = json.success;
                data.drop += 10;
                $load_data.remove();
                $list.append(underscore_template(data));
            }
        });
    };
    var bottom_offset = 400;
    $.get_data();
    var load_more = _.debounce(function () {
        if (($(document).height() - $(window).scrollTop()) > bottom_offset) {
            $.get_data();
        }
    }, 500);
    $(window).scroll(load_more);
}
