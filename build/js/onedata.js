(new WOW).init(),window.onload=function(){var a=document.getElementById("toTop"),b=document.documentElement.clientHeight,c=null,d=!0;window.onscroll=function(){var e=document.body.scrollTop||document.documentElement.scrollTop;e>=b?a.style.display="block":a.style.display="none",d||clearInterval(c),d=!1},a.onclick=function(){c=setInterval(function(){var a=document.body.scrollTop||document.documentElement.scrollTop,b=Math.ceil(a/5);document.documentElement.scrollTop=document.body.scrollTop=a-b,d=!0,0==a&&clearInterval(c)},50)}};