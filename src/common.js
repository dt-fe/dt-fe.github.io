// fastclick
if ('addEventListener' in document) {
    document.addEventListener('DOMContentLoaded', function() {
        FastClick.attach(document.body);
    }, false);
}

// 回到顶部
(function(){
    var btn = document.getElementById('toTop');

    // 获取视界高度；
    var winH = document.documentElement.clientHeight;
    // 定义计时器；
    var timer = null;
    // 定义是否抵达顶部布尔值判断；
    var isTop = true;
    // 设置滚动事件；
    window.onscroll = function(){
    	if(!btn){return;}
        var toTop = document.body.scrollTop || document.documentElement.scrollTop;
        // 判断是否到了第二屏，若是，显示按钮；
        if (toTop >= winH) {
            btn.style.display = 'block';
        }else{
            btn.style.display = 'none';
        };
        // 判断是否抵达顶部，若否，停止计时器；
        if (!isTop) {
            clearInterval(timer);
        };
        // 重置布尔值判断；
        isTop = false;
    }
    if(btn){
	    // 设置按钮单击事件；
	    btn.onclick = function(){
	        // 设置计时器，50毫秒间隔；
	        timer = setInterval(function(){
	            var toTop = document.body.scrollTop || document.documentElement.scrollTop;
	            // 设置速度，用等式而不用具体数值是为了产生缓动效果；
	            var speed = Math.ceil(toTop/5);
	            // 作差，产生缓动效果；
	            document.documentElement.scrollTop = document.body.scrollTop = toTop - speed;
	            // 重置布尔值判断；
	            isTop = true;
	            // 判断是否抵达顶部，若是，停止计时器；
	            if (toTop == 0) {
	                clearInterval(timer);
	            };
	        },50);
	    }
    }
})();

// 主菜单面板
var $menu = $('.navigation .menu');
// 子菜单面板
var $subMenu = $('.navigation .sub-menu');



// 菜单
var isOpen = false;
$('.navigation .btn-menu').click(function(){
	isOpen = !isOpen;

	if(isOpen){
		$menu.slideDown();
	}else{
		$menu.slideUp();
	}
	
});

// 二级菜单
var isSubmenuOpen = true;
$('.navigation .btn-submenu').click(function(){
	isSubmenuOpen = !isSubmenuOpen;

	$subMenu.toggle();

	$('.navigation .btn-submenu .iconfont').html(isOpen? '&#xe63c;': '&#xe63d;');
});


// 点击空白处，隐藏菜单
$('body').click(function(ev){
	// ev.stopPropagation();
	
	var target = $(ev.target);
	if(
		target.hasClass('btn-menu') ||
		target.hasClass('act') ||
		target.hasClass('btn-submenu')
	){return;}

	isOpen = false;
	$menu.hide();
});
