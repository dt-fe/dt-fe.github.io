
(function(){ 
    // 仅展示前4个活动，且要过滤掉当前的活动
    var list = $('.pic-list li');
    var index = 0;

    for (var i = 0; i < list.length; i++) {
        var current = $(list[i]);
        var link = current.attr('data-link');

        // var pathname = link.match(/\/wow\/dt\/act\/\w*/);

        var pathname = link.match(/\/(\w*).htm/);
        
        if(pathname && pathname.length){
            pathname = pathname[0];
        }else{
            pathname = '';
        }

        if(index<4 && window.location.pathname != pathname){
            index++;
            current.show();
        }else{
            current.hide();
        }
    }
})()