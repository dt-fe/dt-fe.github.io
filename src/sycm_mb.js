$('.video').on('click', '.video-icon', function() {
    var $parent = $(this).parent();
    var $video  = $parent.siblings('video');
    var $loading = $(this).siblings('.video-loading');
    var video = $video.get(0);
        video.play();

    // show loading
    $loading.show();

    if (/iPhone/.test(window.navigator.userAgent)) {
        iosPlay()
    } else {
        androidPlay();
    }

    // ios function
    function iosPlay () {
        if (video.readyState !== 4) {
            video.addEventListener('canplaythrough', onCanPlay, false);
            //add load event as well to avoid errors, sometimes 'canplaythrough' won't dispatch.
            video.addEventListener('load', onCanPlay, false); 
            setTimeout(function(){
                //block play so it buffers before playing
                video.pause(); 
            }, 16); 
        }
    }

    // android function
    function androidPlay () {
        $parent.hide();
        $video.show();
        video.play();
        $loading.hide();
    }

    function onCanPlay(){
        $loading.hide();

        video.removeEventListener('canplaythrough', onCanPlay, false);
        video.removeEventListener('load', onCanPlay, false);

        video.play();
    }

    $video.on('ended', function () {
        $video.hide();
        $parent.show();
        $video.off('ended');
        $loading.hide();
    });
    $video.on('pause', function () {
        $video.hide();
        $parent.show();
        $video.off('pause');
        $loading.hide();
    });
    $video.on('error', function () {
        $video.hide();
        $parent.show();
        $video.off('error');
        $loading.hide();
    });
    $video.on('suspend', function () {
        $video.hide();
        $parent.show();
        $video.off('suspend');
        $loading.hide();
    });
})

$('.tab-nav').on('click', 'li', function () {
	var $parent = $(this).parent();
	$parent.find('.active').removeClass('active');
	$(this).addClass('active');
	var $content = $parent.parent().next();
	$('img', $content).attr('src', $(this).data('src'));
})

