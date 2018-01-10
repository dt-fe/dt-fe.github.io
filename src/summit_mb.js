
var banners = $('.page-banner .banner-pic');

var bannerWidth = $(window).width();
var bannerAmount = banners.length;

banners.width(bannerWidth);
$('.banner-wrapper').width(bannerWidth * bannerAmount);

if(bannerAmount > 1){

	function whichAnimationEvent(){
	  var t,
	      el = document.createElement("fakeelement");

	  var animations = {
	    "animation"      : "animationend",
	    "OAnimation"     : "oAnimationEnd",
	    "MozAnimation"   : "animationend",
	    "WebkitAnimation": "webkitAnimationEnd"
	  }

	  for (t in animations){
	    if (el.style[t] !== undefined){
	      return animations[t];
	    }
	  }
	}
	var animationEvent = whichAnimationEvent();

	var current = 0;

	setInterval(function(){

		current++;

		if(current > bannerAmount-1){
			current = 0;
		}
		if(current < 0){
			current = bannerAmount;
		}

		// 按钮圆圈
		var btns = $('.banner-btn').find('li');
		btns.removeClass('act');
		btns.eq(current).addClass('act');

		// 标题
		var titles = $('.banner-title').find('li');
		titles.removeClass('act');
		titles.eq(current).addClass('act');

		// 图片
		var firstBanner = $('.banner-wrapper .banner-box').first();
		firstBanner.addClass('move-left');

		firstBanner.one(animationEvent,
			function(event) {
				firstBanner.removeClass('move-left');
				firstBanner.appendTo('.banner-wrapper')
		  });

	}, 5000);
}
