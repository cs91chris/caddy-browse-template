window.onload = () => {
    'use strict';

    if('serviceWorker' in navigator)
        navigator.serviceWorker.register('/sw.js');
}

function prettyFile(extensions, file) {
    var color_class = 'file-default-color';
    var chunks = file.split('.');
    var ext = chunks[chunks.length-1];

    for(var k in extensions) {
        if(extensions[k].indexOf(ext) >= 0) {
            color_class = 'file-'+k+'-color';
            break;
        }
    }
    return '<span class="item-searchable '+color_class+'">'+file+'</span>';
}

function breadcrumb(path) {
    var home_icon = '<svg class="i-home" xmlns="http://www.w3.org/2000/svg" width="24" height="24" '+
            'viewBox="0 0 32 32" fill="currentcolor" stroke="currentcolor" '+
            'stroke-linecap="round" stroke-linejoin="round" stroke-width="1">'+
            '<path d="M12 20 L12 30 4 30 4 12 16 2 28 12 28 30 20 30 20 20 Z" />'
        +'</svg>';

    var crumbs = path.split('/');
    var output = '<li class="breadcrumb-item"><a href="/">'+home_icon+'</a></li>';

    for(var i = 1; i < crumbs.length; i++) {
        var text = crumbs[i];
        var link = crumbs.slice(0, i + 1).join('/');
        var extra_class = (i == crumbs.length-1) ? ' active' : '';
        var extra_attr = (i == crumbs.length-1) ? ' aria-current="page"' : '';
        output += '<li class="breadcrumb-item'+extra_class+'"'+extra_attr+'><a href="'+link.trim()+'">'+text.trim()+'</a></li>';
    }
    return output;
}

function humanFileSize(bytes) {
    var idx = 0;
    var outb = 0;
    var thresh = 1024;
    var unit_text = null;
    var units = ['<span>KB</span>','<span class="text-info">MB</span>','<span class="text-warning">GB</span>'];
    var too_big = '<span class="text-danger">GB</span>';

    if(Math.abs(bytes) < thresh) {
        return bytes + ' Bytes';
    }

    for(idx = 0; idx < units.length; idx++) {
        bytes /= thresh;
        if(bytes < thresh)
            break;
    }

    unit_text = (idx == units.length-1 && bytes > 3) ? too_big : units[idx];
    return bytes.toFixed(2)+' '+unit_text;
}

function fixDate(d) {
    dstr = d.replace(/-/g,"/").replace(/[TZ]/g," ").replace(/\+.*$/g,"").replace(/\..*\ /, ' ');
    var date = new Date(dstr);
    var toLocal = new Date().getTimezoneOffset();
    return new Date(date.getTime() + toLocal * 3600000);
}

function prettyDate(time) {
    var date = fixDate(time);
    return date.toLocaleString();
}

function prettyRelTime(time) {
    var date = fixDate(time);
    var diff = Math.abs(((new Date()).getTime() - date.getTime()) / 1000);
    var day_diff = Math.floor(diff / 86400);

    if(isNaN(day_diff)) {
        return "";
    }

    return day_diff == 0 && (
            diff < 60 && "just now" ||
            diff < 120 && "1 minute ago" ||
            diff < 3600 && Math.floor(diff / 60) + " minutes ago" ||
            diff < 7200 && "1 hour ago" ||
            diff < 86400 && Math.floor(diff / 3600) + " hours ago"
        ) ||
        day_diff == 1 && "yesterday" ||
        day_diff < 7 && day_diff + " days ago" ||
        day_diff < 31 && Math.ceil(day_diff / 7) + " weeks ago" ||
        day_diff < 365 && Math.round(day_diff / 31) + " months ago" ||
        day_diff > 365 && Math.round(day_diff / 365) + " years ago";
}

function fileDateMod(mod) {
    return '<span data-toggle="tooltip" data-placement="top" title="'+prettyDate(mod)+'">'+
        prettyRelTime(mod)+'</span>';
}

function doSearch() {
    var text = document.getElementById('search').value;
    var target = document.getElementById('datatable');

    for(var i = 0; i < target.rows.length; i++) {
        var row = target.rows[i].cells[0];
        row = row.getElementsByClassName('item-searchable')[0].innerHTML.toLowerCase();
        target.rows[i].style.display = (row.startsWith(text.toLowerCase())) ? 'table-row' : 'none';
    }
}

document.addEventListener("DOMContentLoaded", function(event) {
    var name = document.getElementById("link-name");
    var size = document.getElementById("link-size");
    var time = document.getElementById("link-time");

    var dir = (document.URL.indexOf("asc") != -1) ? "desc" : "asc";
    name.href="?sort=name&amp;order="+dir;
    time.href="?sort=time&amp;order="+dir;
    size.href="?sort=size&amp;order="+dir;
});


$(document).ready(function () {
    $("#search-form").submit(function(e) {
        e.preventDefault();
        return false;
    });

    $("ol.breadcrumb").each(function(i) {
        $(this).html(breadcrumb($(this).text()));
    });

    $.getJSON('/api/file-type-extensions.json', function(extensions) {
        $("span.item-file").each(function(i) {
            $(this).html(prettyFile(extensions, $(this).text()));
	});
    });

    $("span.item-size").each(function(i) {
        $(this).html(humanFileSize($(this).text()));
    });

    $("span.item-date").each(function(i) {
        $(this).html(fileDateMod($(this).text()));
    });

    $('[data-toggle="tooltip"]').tooltip();

    $(window).scroll(function() {
        if($(this).scrollTop() > 50) {
            $('#back-to-top').fadeIn();
        }
        else {
            $('#back-to-top').fadeOut();
        }
    });

    $('#back-to-top').click(function() {
        $('body,html').animate({scrollTop: 0}, 400);
        return false;
    });
});

$(window).resize(function() {
    $('body').css('padding-top', $('main header').height() + 5);
});

$(document).ready(function() {
    $('body').css('padding-top', $('main header').height() + 5);
});

