window.requestAnimFrame = function()
{
	return (
		window.requestAnimationFrame       ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame    ||
		window.oRequestAnimationFrame      ||
		window.msRequestAnimationFrame     ||
		function(/* function */ callback){
			window.setTimeout(callback, 1000 / 60);
		}
	);
}();


new WOW().init();


// 缓动线圆图
var DATAS = [
	{x: 230, y: 4+28},
	{x: 309, y: 63+28},
	// {x: 432, y: 49+28},
	// {x: 328, y: 138+28},
	// {x: 422, y: 226+28},
	{x: 403, y: 148+28},
	{x: 455, y: 180+28},
	// {x: 644, y: 165+28},
	// {x: 612, y: 222+28},
	{x: 520, y: 326+28},
	{x: 359, y: 322+28},
	// {x: 305, y: 413+28},
	{x: 199, y: 333+28},
	{x: 229, y: 360+28},
	// {x: 83, y: 405+28},
	{x: 24, y: 376+28},
	// {x: 63, y: 333+28},
	// {x: 118, y: 296+28},
	{x: 76, y: 226+28},
	// {x: 4, y: 199+28},
	{x: 170, y: 258+28},
	// {x: 165, y: 41+28},

	{x: 265-28, y: 183, type: 'big'},
	{x: 335-28, y: 260, type: 'big'},
	{x: 376-28, y: 127, type: 'big'},
	{x: 295-28, y: 56, type: 'big'},
	{x: 157-28, y: 0, type: 'big'},
	{x: 88-28, y: 172, type: 'big'},
	{x: 211-28, y: 89, type: 'big'},
	{x: 143-28, y: 257, type: 'big'},
	{x: 457-28, y: 260, type: 'big'},
	{x: 239-28, y: 316, type: 'big'},
	{x: 40-28, y: 275, type: 'big'},
	{x: 89-28, y: 366, type: 'big'},
	{x: 467-28, y: 100, type: 'big'},
	{x: 116-28, y: 86, type: 'big'},
	{x: 555-28, y: 175, type: 'big'}
];
function ParticleLine(){

    var canvas = document.getElementById('particle-line');
    var context = canvas.getContext('2d');

	var W = 600 || window.innerWidth,
		H = 443 || window.innerHeight;
	canvas.width = W;
	canvas.height = H;

	var particle_count = DATAS.length,
		particles = [],
		couleurs   = ["#ECECEC", "#ECECEC", "#ECECEC","#ECECEC"];

    function Particle(spriteImg, index, data)
    {

        this.color = "#d6d6d6";
        this.radius = Math.round((Math.random()*3)+2);
        this.x = data.x;
        this.y =  data.y;

        if(index==null){

        	this.speedx = 0.3;
        	this.speedy = 0.3;

        }else{

        	this.speedx = 0;
        	this.speedy = 0;

        }
	        switch (Math.round(Math.random()*couleurs.length))
	        {
	            case 1:
	            this.speedx *= 1;
	            this.speedy *= 1;
	            break;
	            case 2:
	            this.speedx *= -1;
	            this.speedy *= 1;
	            break;
	            case 3:
	            this.speedx *= 1;
	            this.speedy *= -1;
	            break;
	            case 4:
	            this.speedx *= -1;
	            this.speedy *= -1;
	            break;
	        }


        this.move = function()
        {
            context.beginPath();
            context.globalCompositeOperation = 'source-over';
            context.fillStyle   = this.color;
            context.globalAlpha = 1;

            if(index!=null){
            	context.drawImage(spriteImg, 5+(87.6+10)*index, 5, 87.6,87.6, this.x, this.y, 70, 70);
            }else{
	            context.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);
	            context.fill();
            }
            context.closePath();

            this.x = this.x + this.speedx;
            this.y = this.y + this.speedy;

            var offset = 100;

            if(this.x <= 0+this.radius)
            {
                this.speedx *= -1;
            }
            if(this.x >= canvas.width-this.radius-offset)
            {
                this.speedx *= -1;
            }
            if(this.y <= 0+this.radius)
            {
                this.speedy *= -1;
            }
            if(this.y >= canvas.height-this.radius-offset)
            {
                this.speedy *= -1;
            }

            var offset = index ? 58/2 : 0;

            for (var j = 0; j < particle_count; j++)
            {
                var particleActuelle = particles[j],
                    yd = particleActuelle.y - this.y,
                    xd = particleActuelle.x - this.x,
                    d  = Math.sqrt(xd * xd + yd * yd);

                if ( d < 200 )
                {
                    context.beginPath();
                    context.globalAlpha = (200 - d) / (200 - 0);
                    context.globalCompositeOperation = 'destination-over';
                    context.lineWidth = 1;
                    context.moveTo(this.x+offset, this.y+offset);
                    context.lineTo(particleActuelle.x+offset, particleActuelle.y+offset);
                    context.strokeStyle = this.color;
                    context.lineCap = "round";
                    context.stroke();
                    context.closePath();
                }
            }
        };
    };


    function drawParticle(spriteImg){

    	var index = 0;

	    for (var i = 0; i < DATAS.length; i++)
	    {
	    	var particle;

	        if(DATAS[i].type){
	        	particle = new Particle(spriteImg, index, DATAS[i]);
	        	index++;
	        }else{
	        	particle = new Particle(spriteImg, null, DATAS[i]);
	        }
	        particles.push(particle);
	    }
    }


    function animate()
    {
        context.clearRect(0, 0, canvas.width, canvas.height);

        if(particles.length){
	        for (var i = 0; i < particle_count; i++)
	        {
	            particles[i].move();
	        }
        }

        requestAnimFrame(animate);
    }

    function load(){
		var spriteImg = new Image();
		
		// spriteImg.src = "https://img.alicdn.com/tps/TB1cCjtNXXXXXasXXXXXXXXXXXX-1020-68.png";
		spriteImg.src = "https://img.alicdn.com/tps/TB1QDFKOVXXXXbvXFXXXXXXXXXX-1464-98.png";

		if(spriteImg.complete){
			drawParticle(spriteImg);
		}else{
			spriteImg.onload = function(){
				drawParticle(spriteImg);
			};

			spriteImg.onerror = function(){
				window.alert('particle 图片加载失败，请重试');
			};
		}
	};

	load();

    animate();
}
var particleLine = new ParticleLine();


// 转动地球
// runPlanet('.e-7', '研究机构', 10+10, 130000, -30-20);
// runPlanet('.e-6', '媒体', 10+10, 230000, -15-10);
// runPlanet('.e-5', '资讯公司', 11+10, 230000, -30-20);
// runPlanet('.e-4', '内容创业者', 12+10, 80000, -55);
// runPlanet('.e-3', '中小创业企业', 11+10, 90000, -78);
// runPlanet('.e-2', '线下传统企业', 12+10, 100000, -70);
// runPlanet('.e-1', '线上商家', 10+10, 60000, -30-20);

function runPlanet(classname, title, radius, duration, dx){
	var svg = d3.select('svg.circle-lines .path-wrapper'),
		path = svg.select(classname),
		gMarker = svg.append('g');

	var marker = gMarker.append('circle');
	var mtext = gMarker.append('text');

	mtext.attr({
		'dy': 30+30,
		'dx': dx
	}).text(title);

	marker.attr({
		'r': radius,
		'fill':"url(#grad)"
	});

	running();

	function running () {
		gMarker.transition()
			.duration(duration)
			.ease("linear")
			.attrTween('transform', valueTween(path.node()))
			.each('end', running);
	}

	function valueTween(path){
		var l = path.getTotalLength();

		return function(d, i , value){

			return function(t){

				var p = path.getPointAtLength(t * l);

				return 'translate('+[p.x, p.y]+')';
			}
		}
	}
}

// 箭头
(function(){
	var items = $('.arrow-wrapper').find('.arrow');

	var index = 0;
	timer = setInterval(function(){
        if($('.arrow-wrapper').hasClass('animated')){

        	for (var i = 0; i < items.length; i++) {
        		if(index === i){
					$(items[i]).addClass('act');
        		}else{
        			$(items[i]).removeClass('act');
        		}
        	};

			index++;
			if(index >5){
				index = 0;
			}
        }

    },1000);


})();

// banner 轮播 -暂去掉轮播@20161226
(function(){

  //   setInterval(function(){	

  //   	var banners = $(".main-layer .banner");
    	
  //   	banners.eq(0).addClass('slideOut');
		
		// banners.on("webkitAnimationEnd", bannerEnd);
		// banners.on("animationend", bannerEnd);
  //   }, 7000);

  //   // 动画结束后，把前一个item放在队列最后
  //   function bannerEnd(ev){
  //   	$('.main-layer .banner').removeClass('slideOut');
  //   	$('.main-layer .banner-wrapper').append($(this));
  //   }
})();

// banner 文案
(function(){
	var bannerText = [
		{
			id: 1,
			title: "1秒",
			name: "亿级数据多维查询秒级响应"
		},
		{
			id: 2,
			title: "99.9999%",
			name: "数据服务调用成功率"
		},
		{
			id: 3,
			title: "2.5秒",
			name: "双11海量实时数据更新频率"
		},
		{
			id: 4,
			title: "82.7亿",
			name: "对内统一数据服务日调用峰值"
		},
		{
			id: 5,
			title: "2千万",
			name: "每天被扫描的数据量相当于2千万部高清电影"
		},
		{
			id: 6,
			title: "90%",
			name: "月成交额30万以上商家，90%使用阿里数据产品服务"
		}	
	];

	var $footbar = $('.foot-bar');
	var titles = $footbar.find('.data-value');
	var descs = $footbar.find('.data-text');

	for (var i = 0; i < 6; i++) {
		$(titles[i]).text(bannerText[i].title);
		$(descs[i]).text(bannerText[i].name);
	}

	$footbar.show();
})();

// 顶层设计 tab轮播
(function(){
	var amount = 3;
	var current = 0;
	var items = $('.layer1 .tabs .item');
	var imgs = $('.layer1 .banner img');

	var pre = $('.layer1 .pre');
	var next = $('.layer1 .next');

	pre.click(function(){
		current--;
		if(current < 0){
			current = amount-1;
		}
		toggleTab(current);
	});

	next.click(function(){
		current++;
		if(current > amount){
			current = 0;
		}
		toggleTab(current);
	});

	function toggleTab(current){
		items.hide();
		items.eq(current).show();

		imgs.hide();
		imgs.eq(current).show();
	}

})();







