
window.startUrl = 'http://www.forum-nnov.ru/api/forum/';

window.deviceId = '';

window.connection = false;


// Initialize your app
var myApp = new Framework7({
    animateNavBackIcon:true,
        pushState: true,
	modalButtonOk: 'Подвердить',
	modalButtonCancel: 'Отменить',
	swipeBackPage: false,
	sortable: false,
	swipeout: false,
	swipePanel: 'left',
	router: true,
	cache: false,
	//dynamicPageUrl: 'content-{{name}}',
});

// Export selectors engine
var $$ = Dom7;

//собственные функции и шаблоны
var fn_pege = {};
var d_tmpl = {};

/*идентифицируем устройство(история посещений и прочее)*/
if(typeof device != 'undefined') {
	window.deviceId = device.uuid;
}else{
	function makeid(){
		var text = "";
		var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
		for( var i=0; i < 12; i++ )
			text += possible.charAt(Math.floor(Math.random() * possible.length));
		return text;
	}
	window.deviceId = localStorage.getItem('device_id');
	if(!window.deviceId) {
		window.deviceId = makeid();
		localStorage.setItem('device_id',window.deviceId);
	}
}





// Add main View
var mainView = myApp.addView('.view-main', {
    dynamicNavbar: true,
    domCache: true
});

/*загружаем первую начальную страницу (в последствии проверять соединений (онлайн или офлайн))*/
mainView.router.load({
  url: 'tmpl/main.html',
  animatePages: false
});




//myApp.onPageBeforeInit('*', function (page){
//    if(typeof initPageBeforeLoadCallback == 'function'){
//            initPageBeforeLoadCallback(page);
//    }
//})

myApp.onPageInit('*', function (page){
    if(typeof initPageLoadCallback == 'function'){
            initPageLoadCallback(page);
    }
})




/*ловим клик нижнего тулбара*/
$$(document).on('click','.toolbar a',function(e){
    e.preventDefault();

    if($$(this).attr("href").indexOf("#content-")===0){
        
        var page = $$(this).attr("href").replace("#content-","");
        
        if(typeof getDinamicPageLoad == 'function'){
            getDinamicPageLoad(page);
        }
        
    }else{
        
        var page = $$(this).attr("href");
        mainView.router.load({
            url: page,
            animatePages: true
        });
        
    }
});

/*ссылки на динамические странички*/
$$(document).on('click','.link_pege_d',function(e){
    e.preventDefault();
    var page = $$(this).attr("href").replace("#content-","");

    if(typeof getDinamicPageLoad == 'function'){
        getDinamicPageLoad(page);
    }
})




/*----------------пользовательские функции-------------------*/

/*функция обработки динамических страничек*/
function getDinamicPageLoad(page){
    
    if(page == "maps"){
        mainView.router.loadContent(d_tmpl.maps());
    }
    
    if(page == "actions"){
        mainView.router.loadContent(d_tmpl.actions());
    }
    
    

}


/*функция возникает сразу после загрузки страницы*/
function initPageLoadCallback(page){
    if(page.name == "maps"){
        fn_pege.contacts();
    }
    console.log(page);
    if(page.name == "actions"){
        console.log("9999");
 
         //флаг загрузки(обнуляем)
        var loading = false;

        //количество загруженных элементов
        var lastIndex = $$('.infinite-scroll .list-block li').length;


        //Максимальное число элементов
        var maxItems = 160;

        //Количество подгружаемых элементов
        var itemsPerLoad = 20;

        //Обработчик скрола
        $$('.infinite-scroll').on('infinite', function(){
console.log(lastIndex);
            //Выход, если загрузка не завершена
            if (loading)
                return;

            //Установить флаг загрузки
            loading = true;

            //Эмуляция загрузки ссекундной задержкой
            setTimeout(function(){
                //флаг загрузки(обнуляем)
                loading = false;

                if (lastIndex >= maxItems) {
                    //Если лимит достигнут, снимаем событие загрузки
                    myApp.detachInfiniteScroll($$('.infinite-scroll'));
                    //Удалить прелоадер
                    $$('.infinite-scroll-preloader').remove();
                    return;
                }

                // Генерируем новый хтмл HTML
                var html = '';
                for (var i = lastIndex + 1; i <= lastIndex + itemsPerLoad; i++){
                    html += '<li class="item-content"><div class="item-inner"><div class="item-title">Item ' + i + '</div></div></li>';
                }

                //Добавляем элементы в конец списка
                $$('.infinite-scroll .list-block ul').append(html);

                //обновляем количество загруженных элементов
                lastIndex = $$('.infinite-scroll .list-block li').length;
                
            }, 1000);
        });
 
 
    }
}









/*----------методы страниц (fn_pege)-----------*/
fn_pege.contacts = (function(){
   
    ymaps.ready(function(){
    
        var myMap = new ymaps.Map("map", {
                center: [56.305913, 43.855375],
                zoom: 13
            }, {
                searchControlProvider: 'yandex#search'
            });


        myMap.geoObjects

            .add(new ymaps.Placemark([56.305913, 43.855375], {
                balloonContent: 'Оптовая продажа автозапчастей<strong> ООО Форум</strong>',
                iconCaption: 'Компания <strong>Форум</strong>'
            }));
    });
    
});

fn_pege.actions = (function(){
        $$.ajax({
                url : window.startUrl+'actions/',
                //async : false,
                data : {device:window.deviceId, key: localStorage.getItem('authorize_key')},
                dataType: 'json',
                timeout: 5000,
                success : function(data){
                    //console.log(data);
                    window.actions = data.body;
                },
                error: function(){
                        window.connection = false;
                }
        });

});





d_tmpl.maps = (function(){

var str = 
    '<div class="navbar">'+
        '<div class="navbar-inner">'+
            '<div class="left"><a href="#" class="back link"><i class="icon icon-back"></i><span>Назад</span></a></div>'+
            '<div class="center sliding">на карте</div>'+
            '<div class="right"></div>'+
        '</div>'+
    '</div>'+
    '<div class="pages">'+
        '<div data-page="maps" class="page">'+
            '<div class="page-content">'+
                '<div id="map" style="width:100%;height:100%;"></div>'+
            '</div>'+
        '</div>'+
    '</div>';

    return str;
});

d_tmpl.actions = (function(){
    
    //console.log(window.actions);
    
var str = 
    '<div class="navbar">'+
        '<div class="navbar-inner">'+
            '<div class="left"><a href="#" class="link icon-only open-panel"><i class="icon icon-bars"></i></a></div>'+
            '<div class="center sliding">Акции</div>'+
            '<div class="right"></div>'+
        '</div>'+
    '</div>'+
    '<div class="pages">'+
        '<div data-page="actions" class="page">'+
            '<div class="page-content infinite-scroll" data-distance="100">'+
              '<div class="list-block media-list">'+
                '<ul>';
        
    for (var i = 1; i <= 20; i++){
                str +=  '<li  class="contact-item">'
                        '<a href="#" class="item-link item-content">'+
                        '<div class="item-content">'+
                            '<div class="item-media"></div>'+
                            '<div class="item-inner">'+
                                '<div class="item-title-row">'+
                                    '<div class="item-title">'+i+'</div>'+
                                '</div>'+
                            '</div>'+
                        '</div>'+
                        '</a>'+
                    '</li>';
                }

str +=          '</ul>'+
            '</div>'+
            '<div class="infinite-scroll-preloader">'+
                '<div class="preloader"></div>'+
            '</div>'+
        '</div>'+
    '</div>';

    return str;
});








 
 
