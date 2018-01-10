(function($){

	$('.jq-xixi .title').click(function(){
		$(this)
			.find('.sprite')
			.toggleClass('sprite-up')
			.toggleClass('sprite-down');

		$('.jq-xixi .content').toggle();
		$('svg.xixi .big').toggle();
	});

	$('.jq-bj .title').click(function(){
		$(this)
			.find('.sprite')
			.toggleClass('sprite-up')
			.toggleClass('sprite-down');

		$('.jq-bj .content').toggle();

		$('svg.bj').toggle();

	});
})(jQuery);