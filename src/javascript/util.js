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
        if(xhr.status===200){
            callback && callback(JSON.parse(xhr.response));
        }else if(xhr.status===401||xhr.status===410){
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

function stringify(object, opts) {

    var utils = {
        encode: function encode(str) {
            // This code was originally written by Brian White (mscdex) for the io.js core querystring library.
            // It has been adapted here for stricter adherence to RFC 3986
            if (str.length === 0) {
                return str;
            }
            var string = typeof str === 'string' ? str : String(str);
            var out = '';
            for (var i = 0; i < string.length; ++i) {
                var c = string.charCodeAt(i);
                if (
                    c === 0x2D // -
                    || c === 0x2E // .
                    || c === 0x5F // _
                    || c === 0x7E // ~
                    || (c >= 0x30 && c <= 0x39) // 0-9
                    || (c >= 0x41 && c <= 0x5A) // a-z
                    || (c >= 0x61 && c <= 0x7A) // A-Z
                ) {
                    out += string.charAt(i);
                    continue;
                }
                if (c < 0x80) {
                    out = out + hexTable[c];
                    continue;
                }
                if (c < 0x800) {
                    out = out + (hexTable[0xC0 | (c >> 6)] + hexTable[0x80 | (c & 0x3F)]);
                    continue;
                }
                if (c < 0xD800 || c >= 0xE000) {
                    out = out + (hexTable[0xE0 | (c >> 12)] + hexTable[0x80 | ((c >> 6) & 0x3F)] + hexTable[0x80 | (c & 0x3F)]);
                    continue;
                }
                i += 1;
                c = 0x10000 + (((c & 0x3FF) << 10) | (string.charCodeAt(i) & 0x3FF));
                out += hexTable[0xF0 | (c >> 18)]
                    + hexTable[0x80 | ((c >> 12) & 0x3F)]
                    + hexTable[0x80 | ((c >> 6) & 0x3F)]
                    + hexTable[0x80 | (c & 0x3F)];
            }
            return out;
        },
        isBuffer: function isBuffer(obj) {
            if (obj === null || typeof obj === 'undefined') {
                return false;
            }

            return !!(obj.constructor && obj.constructor.isBuffer && obj.constructor.isBuffer(obj));
        },
        assign: function assignSingleSource(target, source) {
            return Object.keys(source).reduce(function (acc, key) {
                acc[key] = source[key];
                return acc;
            }, target);
        }
    };
    var replace = String.prototype.replace;
    var percentTwenties = /%20/g;
    var formats = {
        'default': 'RFC3986',
        formatters: {
            RFC1738: function (value) {
                return replace.call(value, percentTwenties, '+');
            },
            RFC3986: function (value) {
                return value;
            }
        },
        RFC1738: 'RFC1738',
        RFC3986: 'RFC3986'
    };

    function _stringify( // eslint-disable-line func-name-matching
        object,
        prefix,
        generateArrayPrefix,
        strictNullHandling,
        skipNulls,
        encoder,
        filter,
        sort,
        allowDots,
        serializeDate,
        formatter,
        encodeValuesOnly
    ) {
        var obj = object;
        if (typeof filter === 'function') {
            obj = filter(prefix, obj);
        } else if (obj instanceof Date) {
            obj = serializeDate(obj);
        } else if (obj === null) {
            if (strictNullHandling) {
                return encoder && !encodeValuesOnly ? encoder(prefix, defaults.encoder) : prefix;
            }

            obj = '';
        }

        if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean' || utils.isBuffer(obj)) {
            if (encoder) {
                var keyValue = encodeValuesOnly ? prefix : encoder(prefix, defaults.encoder);
                return [formatter(keyValue) + '=' + formatter(encoder(obj, defaults.encoder))];
            }
            return [formatter(prefix) + '=' + formatter(String(obj))];
        }

        var values = [];

        if (typeof obj === 'undefined') {
            return values;
        }

        var objKeys;
        if (Array.isArray(filter)) {
            objKeys = filter;
        } else {
            var keys = Object.keys(obj);
            objKeys = sort ? keys.sort(sort) : keys;
        }

        for (var i = 0; i < objKeys.length; ++i) {
            var key = objKeys[i];

            if (skipNulls && obj[key] === null) {
                continue;
            }

            if (Array.isArray(obj)) {
                values = values.concat(_stringify(
                    obj[key],
                    generateArrayPrefix(prefix, key),
                    generateArrayPrefix,
                    strictNullHandling,
                    skipNulls,
                    encoder,
                    filter,
                    sort,
                    allowDots,
                    serializeDate,
                    formatter,
                    encodeValuesOnly
                ));
            } else {
                values = values.concat(_stringify(
                    obj[key],
                    prefix + (allowDots ? '.' + key : '[' + key + ']'),
                    generateArrayPrefix,
                    strictNullHandling,
                    skipNulls,
                    encoder,
                    filter,
                    sort,
                    allowDots,
                    serializeDate,
                    formatter,
                    encodeValuesOnly
                ));
            }
        }

        return values;
    }

    var obj = object;
    var options = opts ? utils.assign({}, opts) : {};

    if (options.encoder !== null && options.encoder !== undefined && typeof options.encoder !== 'function') {
        throw new TypeError('Encoder has to be a function.');
    }

    var delimiter = typeof options.delimiter === 'undefined' ? defaults.delimiter : options.delimiter;
    var strictNullHandling = typeof options.strictNullHandling === 'boolean' ? options.strictNullHandling : defaults.strictNullHandling;
    var skipNulls = typeof options.skipNulls === 'boolean' ? options.skipNulls : defaults.skipNulls;
    var encode = typeof options.encode === 'boolean' ? options.encode : defaults.encode;
    var encoder = typeof options.encoder === 'function' ? options.encoder : defaults.encoder;
    var sort = typeof options.sort === 'function' ? options.sort : null;
    var allowDots = typeof options.allowDots === 'undefined' ? false : options.allowDots;
    var serializeDate = typeof options.serializeDate === 'function' ? options.serializeDate : defaults.serializeDate;
    var encodeValuesOnly = typeof options.encodeValuesOnly === 'boolean' ? options.encodeValuesOnly : defaults.encodeValuesOnly;
    if (typeof options.format === 'undefined') {
        options.format = formats['default'];
    } else if (!Object.prototype.hasOwnProperty.call(formats.formatters, options.format)) {
        throw new TypeError('Unknown format option provided.');
    }
    var formatter = formats.formatters[options.format];
    var objKeys;
    var filter;

    if (typeof options.filter === 'function') {
        filter = options.filter;
        obj = filter('', obj);
    } else if (Array.isArray(options.filter)) {
        filter = options.filter;
        objKeys = filter;
    }

    var keys = [];

    if (typeof obj !== 'object' || obj === null) {
        return '';
    }

    var arrayFormat;
    if (options.arrayFormat in arrayPrefixGenerators) {
        arrayFormat = options.arrayFormat;
    } else if ('indices' in options) {
        arrayFormat = options.indices ? 'indices' : 'repeat';
    } else {
        arrayFormat = 'indices';
    }

    var generateArrayPrefix = arrayPrefixGenerators[arrayFormat];

    if (!objKeys) {
        objKeys = Object.keys(obj);
    }

    if (sort) {
        objKeys.sort(sort);
    }

    for (var i = 0; i < objKeys.length; ++i) {
        var key = objKeys[i];

        if (skipNulls && obj[key] === null) {
            continue;
        }

        keys = keys.concat(_stringify(
            obj[key],
            key,
            generateArrayPrefix,
            strictNullHandling,
            skipNulls,
            encode ? encoder : null,
            filter,
            sort,
            allowDots,
            serializeDate,
            formatter,
            encodeValuesOnly
        ));
    }

    var joined = keys.join(delimiter);
    var prefix = options.addQueryPrefix === true ? '?' : '';

    return joined.length > 0 ? prefix + joined : '';
}
