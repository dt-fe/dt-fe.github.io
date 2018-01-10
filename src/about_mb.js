(function(){

	var $dt = $('.contact .card-dt');
	var $sycm = $('.contact .card-sycm'); 
	var $kmd =  $('.contact .card-kmd');

	var $code = $('.contact .code');
	var $title = $('.contact .popwin .name');
	var $popwin = $('.contact .popwin');

	$dt.click(function(ev){
		togglePopwin(ev, 'dt');
	});
	$sycm.click(function(ev){
		togglePopwin(ev, 'sycm');
	});
	$kmd.click(function(ev){
		togglePopwin(ev, 'kmd');
	});

	$popwin.click(function(ev){
		var target = ev.target || ev.currentTarget;
		if($(target).hasClass('popwin')){
			$(target).hide();
		}			
		ev.preventDefault();
		
	})



	function togglePopwin(ev, type){
		var target = ev.target || ev.currentTarget;
		
		if($(target).hasClass('link')){
			// 若点中的是 a 标签，直接跳转	
		}else{
			var text;

			switch(type){
				case 'dt':
					text = "阿里数据";
				break;
				case 'sycm':
					text = "生意参谋";
				break;
				case 'kmd':
					text = "孔明灯";
				break;
			}
			$('.contact .popwin').show();
			$code.find('img').hide();
			$code.find('.code-'+type).show();
			$title.text(text);
		}

		ev.stopPropagation();
	}
})();