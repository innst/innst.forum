// Initialize your app
//device.uuid
window.reloadPageInJs = false;

window.debug = false;
window.startUrl = 'http://www.forum-nnov.ru/api/mobil_app/';

window.deviceId = '';

window.initCustomJs = false;

window.onPageGenerate = false;
window.connection = false;

window.reload = false;
window.curentLoadBase = false;

//version
var version = localStorage.getItem('version');
if(!version) version = '1.0.0';

// Export selectors engine
var $$ = Dom7;
//templates
var tmpl = false;

//таймаут получения контента
var loadCnt = false;

var loadVersion = false;

//текущая страница
var curentPage = false;

var pullToRefresh = false;

var startPageContent = function(content){
	if(content) content = content.replace("link.html?page=","");
	if(!content) content = 'main';
	//setTimeout(function(){
	getPage(content);
	//},500);
};

//sql
document.addEventListener("deviceready",onRd,false);

document.addEventListener("backbutton", function(){
	if(typeof window.backButtonHandler == 'function'){
		return window.backButtonHandler();
	}
}, false);

var db = false;
function onRd(){

window.myApp = new Framework7({
	modalButtonOk: 'Подвердить',
	modalButtonCancel: 'Отменить',
	swipeBackPage: false,
	sortable: false,
	swipeout: false,
	swipePanel: 'left',
	router: false,
	cache: false,
	dynamicPageUrl: 'content-{{name}}',
	preroute: function (view, options) {
		
    }
});

// Add view
window.mainView = window.myApp.addView('.view-main',{
  dynamicNavbar: false,
  //reloadPages: true
});

window.myApp.onPageInit('*', function (page) {
console.log(page);
console.log('сработал - onPageInit');
if(typeof window.initPageLoadCallback == 'function'){
	window.initPageLoadCallback(page);
	//window.myApp.hidePreloader();
}
return;
});

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

setTimeout(function t(){
	if(!loadCnt) {
		setTimeout(t,100);
	}else{
		content = loadCnt;
		loadCnt = false;
		if(!pullToRefresh){
		content = '<div class="page" data-page="main"><div class="page-content">'+content+'</div></div>';
		}else{
		pullToRefresh = false;
		content = '<div class="page" data-page="main"><div class="page-content pull-to-refresh-content"><div class="pull-to-refresh-layer"><div class="preloader"></div><div class="pull-to-refresh-arrow"></div></div>'+content+'</div></div>';
		}
		
		window.mainView.router.load({
		  content: content,
		  animatePages: false,
		  reload: window.reload
		});
		window.myApp.hidePreloader();
		
		//window.reload = false;
		loadJs();
		loadMenu();
		loadCss();
		//refreshBook();
	}
},100);

if(typeof(window.openDatabase) !== 'undefined'){
	db = window.openDatabase('mliferasp.db','1.0','mliferasp',1*1024*1024);
}else{
	db = window.sqlitePlugin.openDatabase({name: 'mliferasp',location: 'default'},function(db){});
}
db.transaction(function(tx){
tx.executeSql("CREATE TABLE IF NOT EXISTS pages (ID VARCHAR PRIMARY KEY, type VARCHAR, text TEXT)",[]);
tx.executeSql("CREATE TABLE IF NOT EXISTS block (ID VARCHAR PRIMARY KEY, text TEXT)",[]);
tx.executeSql("CREATE TABLE IF NOT EXISTS tmpl (ID VARCHAR PRIMARY KEY, text TEXT)",[]);
tx.executeSql("CREATE TABLE IF NOT EXISTS book (ID VARCHAR PRIMARY KEY, text TEXT)",[]);
},function(){
},function(){
	checkConnection();
	setTmpl();
	startPageContent();
});



}

function checkConnection() {
	if(typeof navigator.connection != 'undefined'){
	
	var Connection = {
		UNKNOWN: "unknown",
        ETHERNET: "ethernet",
        WIFI: "wifi",
        CELL_2G: "2g",
        CELL_3G: "3g",
        CELL_4G: "4g",
        CELL:"cellular",
        NONE: "none"
	};
	var networkState = navigator.connection.type;
    var states = {};
    states[Connection.UNKNOWN]  = true;
    states[Connection.ETHERNET] = true;
    states[Connection.WIFI]     = true;
    states[Connection.CELL_2G]  = true;
    states[Connection.CELL_3G]  = true;
    states[Connection.CELL_4G]  = true;
    states[Connection.CELL]     = true;
    states[Connection.NONE]     = false;

    if(states[networkState]===true) {
		window.connection = states[networkState];
	}else if(states[networkState]===false){
		window.connection = states[networkState];
	}else{
		window.connection = true;
	}
	}else{
	window.connection = true;
	}
	
}

function setTmpl(){
	db.transaction(function(tx){
	tx.executeSql("SELECT * FROM tmpl WHERE ID!=0",[],function(t,res){
	tmpl = {};
	if(res.rows.length > 0){
		for(var i=0;i<res.rows.length;i++){
			tmpl[res.rows.item(i)['ID']] = res.rows.item(i)['text'];
		}
	}
	},
	function(tx,err){
	tmpl = {};
	}
	);
	});
}
function getTmpl(id){
	if(!tmpl[id]) return "";
	return tmpl[id];
}

//таймаут обновлений
var loader = false;

function getPage(page){
	checkConnection();
	
	if(typeof window.getPageHandler == 'function'){
		page = window.getPageHandler(page);
	}
	
	curentPage = page;
	var content='';
	
	//window.reload = false;
	
	if(page=='main'){
	//window.reload = true;
	loadVersion = false;
	checkVersion();
	
	setTimeout(function t(){
	if(!loadVersion) {
		setTimeout(t,300);
	}else{
		
		var last = getVersion();
		if(last != version) page = 'main_old';
		if(!window.connection) page = 'main_offline';
		lpage(page);
		
	}
	},300);
	
	
	}else{
		if(typeof window.beforeLoadPage == 'function'){
			if(!window.beforeLoadPage(page)) lpage(page);
		}else{
			lpage(page);
		}
		
	}
	
	function lpage(page){
	db.transaction(function(tx){
	tx.executeSql("SELECT * FROM pages WHERE ID=?",[page],function(t,res){
	if(res.rows.length > 0){
		var tmp = getTmpl(res.rows.item(0)['type']);
		if(!tmp){
			loadCnt = '<div class="content-block-inner"><p class="errorPage">ERROR load page '+page+'</p><p>Шаблон не найден, возможно произошла ошибка при загрузке данных. Проверьте соединение с Internet и повторите загрузку.</p><p><a href="#" id="loadBase" class="button active">Загрузить данные</a></p></div>';
		}else{
			if (window.debug) console.log('startpage - '+page);
			if(window.onPageGenerate !== false) {
				var loadCntTemp = window.onPageGenerate(page,JSON.parse(res.rows.item(0)['text']),tmp);
				if(loadCntTemp) loadCnt = loadCntTemp;
			}
			if(!loadCnt){
			var compiled = Template7(tmp).compile();
			loadCnt = compiled(JSON.parse(res.rows.item(0)['text']));
			}
		}
	}
	
	if((page == 'main' || page == 'main_old') && !loadCnt){
		content = '' +                  
		'<div class="content-block"> <div class="content-block inset"><div class="content-block-inner">'+
		'<p>Это первый запуск приложения. Дождитесь загрузки данных.</p>'+
		'<p><a href="#" id="loadBase" class="button active" style="display:none;">Загрузить данные</a></p>'+
		''+
		'</div>' +
								'</div>'
		'</div>' +
		'';
		loadCnt = content;
		loadBaseDefault();
		
	}else if(page == 'main_offline' && !loadCnt){
		content = '' +                  
		'<div class="content-block"> <div class="content-block inset"><div class="content-block-inner">'+
		'<p>Это первый запуск приложения. подключитесь к сети Internet и загрузите данные.</p>'+
		'<p><a href="#" id="loadBase" class="button active">Загрузить данные</a></p>'+
		''+
		'</div>' +
								'</div>'
		'</div>' +
		'';
		loadCnt = content;
		//loadBaseDefault();
	}else if(!loadCnt) {
		loadCnt = '<div class="content-block-inner"><p class="errorPage">ERROR load page '+page+'</p></div>';
		
	}
	},
	function(tx,err){
	loadCnt = '<div class="content-block-inner"><p class="errorPage">ERROR sql load page '+page+'</p></div>';
	}
	);
	});
	}

}

function loadPageForUrl(href){
	if(href.indexOf('link.html') === 0){
                window.myApp.showPreloader("Загрузка страницы");
		startPageContent(href);
		setTimeout(function t(){
			if(!loadCnt) {
				setTimeout(t,100);
			}else{
			content = loadCnt;
			loadCnt = false;
			
			if(!pullToRefresh){
			content = '<div class="page" data-page="'+curentPage+'"><div class="page-content">'+content+'</div></div>';
			}else{
			pullToRefresh = false;
			content = '<div class="page" data-page="'+curentPage+'"><div class="page-content pull-to-refresh-content"><div class="pull-to-refresh-layer"><div class="preloader"></div><div class="pull-to-refresh-arrow"></div></div>'+content+'</div></div>';
			}
			if(curentPage == 'main' || curentPage == 'main_old') {
				window.reload = true;
			}
			window.mainView.router.load({
			  content: content,
			  animatePages: false,
			  reload: window.reload,
			  ignoreCache: true
			});
			if(curentPage == 'main' || curentPage == 'main_old') {
				window.reload = false;
			}
			window.myApp.hidePreloader();
				
			}
		},150);
	
	}else{
		return;
	}
}

function getVersion(){
	var last = localStorage.getItem('last_version');
	if(!last) last = '1.0.0';
	return last;
}

function checkVersion(add){
var last = localStorage.getItem('last_version');
if(!last) last = '1.0.0';
if(last == version){
	//check update;
	if(window.connection){
		
		loadVersion = false;
		
		//setTimeout(function(){
		$$.ajax({
			url : window.startUrl+'version/',
			//async : false,
			data : {device:window.deviceId, key: localStorage.getItem('authorize_key')},
			dataType: 'html',
			timeout: 5000,
			success : function(data){
				if(data != version) {
					localStorage.setItem('last_version',data);
					//version = data;
					loadVersion = true;
				}else{
					loadVersion = true;
				}
			},
			error: function(){
				window.connection = false;
				loadVersion = true;
			},
			complete: function(){
				loadVersion = true;
			}
		});
		//},150);
		
	}else{
		loadVersion = true;
	}
}else{
	loadVersion = true;
}


return last;
}

function setLastVersion(add){
	version = checkVersion(add);
	localStorage.setItem('version',version);
}

function loadMenu(){
db.transaction(function(tx){
	tx.executeSql("SELECT * FROM block WHERE ID=?",['menu'],function(t,res){
	if(res.rows.length > 0){
	var menu = res.rows.item(0)['text'];
	$$('#menuBlock').remove();
	$$('.panel-left').append(menu);
	if (window.debug) console.log('menu Loaded');
	
	if(typeof window.initMenuLoadCallback == 'function'){
		window.initMenuLoadCallback();
	}
	
	}
	});
});
}

function loadCss(){
db.transaction(function(tx){
	tx.executeSql("SELECT * FROM block WHERE ID=?",['styles'],function(t,res){
	if(res.rows.length > 0){
	var d = res.rows.item(0)['text'];
	$$('#stylesBlock').html(d);
	}
	});
});
}

function loadJs(){
if (window.debug) console.log('loadJs');
db.transaction(function(tx){
	tx.executeSql("SELECT * FROM block WHERE ID=?",['js'],function(t,res){
	if(res.rows.length > 0){
	var d = res.rows.item(0)['text'];
	$$('#jsBlock').html(d);
	setTimeout(function(){
		if(typeof window.initCustomJs == 'function'){
			window.initCustomJs();
		}else{
		}
	},0);
	}
	});
});
}

$$(document).on('click','a',function(e){
	
	if($$(this).hasClass('closep')) {
		window.myApp.closePanel();
	}
	
	if(window.curentLoadBase) return false;
	
	if($$(this).attr('id')=='loadBase'){
		
		e.preventDefault();
		
		loadBaseDefault();
		
	}if($$(this).attr('id')=='exit'){
		
		e.preventDefault();
		
		if (navigator && navigator.app) {
			navigator.app.exitApp();
		}else{
			if (navigator && navigator.device) {
				navigator.device.exitApp();
			}
		}
		
	}
	
	if($$(this).attr('href').indexOf('#') === 0){
		e.preventDefault();
	}
	
	if($$(this).attr('href').indexOf('link.html') === 0){
		e.preventDefault();
	}
	
	loadPageForUrl($$(this).attr('href'));
	
});

var pages_arr = [];

function loadBaseDefault(step,step2){
	
	setTimeout(function(){
	if(!step){
	window.curentLoadBase = true;
	checkConnection();
	if(!window.connection) {
		window.myApp.alert('Нет соединения, загрузка невозможна.','Уведомление');
		window.curentLoadBase = false;
		return;
	}
	
	$$('body .ldTimer').remove();
	$$('body .page-on-center .page-content').prepend('<div class="content-block ldTimer" id="ldTimer" style="margin:5px;"><div class="content-block-inner"><div class="loadpersent" style="border-radius:3px;display:block;width:10%;background:green;height:20px;color:#ffffff;text-align:center;">0%</div></div></div></div>');
	
	//window.myApp.showPreloader('Идет загрузка данных...')
	$$("#loadBase").hide();
	
	/*
	var cntTimer = 0;
	var timer = setTimeout(function t(){
	if(!loader) {
		cntTimer++;
	if(cntTimer>800) loader = true;
		setTimeout(t,300);
	}else{
	$$("#pMain").click();
	//window.myApp.hidePreloader();
	if(loader > 800){
	window.myApp.alert('Произошла ошибка, плохое соединение с интернет. Попробуйте повторить загрузку.','Уведомление');
	}
	}
	},1000);
	*/
	db.transaction(function(tx){
		tx.executeSql("DELETE FROM block WHERE ID>0",[]);
		tx.executeSql("DELETE FROM pages WHERE ID>0",[]);
		tx.executeSql("DELETE FROM tmpl WHERE ID>0",[]);
	},function(){},function(){
		tmpl = {};
		loadBaseDefault(2);

	});
	}else if(step==2){
		
		$$.ajax({
			url : window.startUrl+'tmpl/',
			//async : false,
			data : {device:window.deviceId, key: localStorage.getItem('authorize_key')},
			dataType: 'json',
			success : function(data){
				
				$$('#ldTimer .loadpersent').html('5%');
				$$('#ldTimer .loadpersent').css({'width':'10%'});
				
				db.transaction(function(tx){
					$$.each(data, function (index, value) {
						tx.executeSql("INSERT INTO tmpl (ID, text) VALUES (?,?)",[index,value],function(){});
					});
				},function(r){
				},function(){
					
					loadBaseDefault(3);
				});
			},
			error : function(){
				
				db.transaction(function(tx){
					tx.executeSql("DELETE FROM tmpl WHERE ID>0",[]);
				},function(){},function(){
					
					$$('#ldTimer .loadpersent').html('Ошибка связи');
					$$('#ldTimer .loadpersent').css({'width': '100%', 'background':'red'});
					$$("#loadBase").show();
					window.curentLoadBase = false;
					tmpl = {};

				});
				
				
			}
		});
		
		
		
	}else if(step==3){
		
		$$.ajax({
			url : window.startUrl+'menu/',
			//async : false,
			data : {device:window.deviceId, key: localStorage.getItem('authorize_key')},
			success : function(data){
				if(data) {
					
					$$('#ldTimer .loadpersent').html('10%');
					$$('#ldTimer .loadpersent').css({'width':'10%'});
					
					db.transaction(function(tx){
					tx.executeSql("INSERT INTO block (ID, text) VALUES (?,?)",['menu',data],function(){
					//loadMenu();
					loadBaseDefault(4);
					});
					});
				}
			},
			error : function(){
				
				db.transaction(function(tx){
					tx.executeSql("DELETE FROM tmpl WHERE ID>0",[]);
				},function(){},function(){
					
					$$('#ldTimer .loadpersent').html('Ошибка связи');
					$$('#ldTimer .loadpersent').css({'width': '100%', 'background':'red'});
					$$("#loadBase").show();
					window.curentLoadBase = false;
					tmpl = {};

				});
			}
		});
		
	}else if (step==4){
		
		$$.ajax({
			url : window.startUrl+'js/',
			//async : false,
			data : {device:window.deviceId, key: localStorage.getItem('authorize_key')},
			success : function(data){
				if(data) {
					
					$$('#ldTimer .loadpersent').html('15%');
					$$('#ldTimer .loadpersent').css({'width':'15%'});
					
					db.transaction(function(tx){
					tx.executeSql("INSERT INTO block (ID, text) VALUES (?,?)",['js',data],function(){
					loadBaseDefault(5);
					});
					});
				}
			},
			error : function(){
				
				db.transaction(function(tx){
					tx.executeSql("DELETE FROM tmpl WHERE ID>0",[]);
				},function(){},function(){
					
					$$('#ldTimer .loadpersent').html('Ошибка связи');
					$$('#ldTimer .loadpersent').css({'width': '100%', 'background':'red'});
					$$("#loadBase").show();
					window.curentLoadBase = false;
					tmpl = {};

				});
			}
		});
		
	}else if (step==5){
		
		$$.ajax({
			url : window.startUrl+'css/',
			//async : false,
			data : {device:window.deviceId, key: localStorage.getItem('authorize_key')},
			success : function(data){
				if(data) {
					$$('#ldTimer .loadpersent').html('17%');
					$$('#ldTimer .loadpersent').css({'width':'17%'});
					
					db.transaction(function(tx){
					tx.executeSql("INSERT INTO block (ID, text) VALUES (?,?)",['styles',data],function(){
					loadCss();
					loadBaseDefault(6);
					});
					});
				}
			},
			error : function(){
				
				db.transaction(function(tx){
					tx.executeSql("DELETE FROM tmpl WHERE ID>0",[]);
				},function(){},function(){
					
					$$('#ldTimer .loadpersent').html('Ошибка связи');
					$$('#ldTimer .loadpersent').css({'width': '100%', 'background':'red'});
					$$("#loadBase").show();
					window.curentLoadBase = false;
					tmpl = {};

				});
			}
		});
		
	}else if (step==6){
		
		$$.ajax({
			url : window.startUrl+'page/',
			//async : false,
			data : {device:window.deviceId, key: localStorage.getItem('authorize_key')},
			dataType: 'json',
			success : function(data){
				//console.log(data);
				$$('#ldTimer .loadpersent').html('20%');
				$$('#ldTimer .loadpersent').css({'width':'20%'});
				loadPages(false,data);
			},
			error : function(){
				
				db.transaction(function(tx){
					tx.executeSql("DELETE FROM tmpl WHERE ID>0",[]);
				},function(){},function(){
					
					$$('#ldTimer .loadpersent').html('Ошибка связи');
					$$('#ldTimer .loadpersent').css({'width': '100%', 'background':'red'});
					$$("#loadBase").show();
					window.curentLoadBase = false;
					tmpl = {};

				});
			}
		});
		
	}
	},150);
	
}

function loadPages(step,data){
	setTimeout(function(){
	if(step === false){
		
		var cnt = 0;
		var pages = '';
		
		pages_arr = [];
		
		$$.each(data, function (index, page) {
			cnt = cnt + 1;
			if(cnt < 15){
				pages += page+",";
			}else{
				pages += page+",";
				pages_arr.push(pages);
				pages = '';
				cnt = 0;
			}
		});
		if(cnt>0) {
			pages_arr.push(pages);
		}
		loadPages(0,next_k);
	}else{
	
		for(k in pages_arr){
			if(step == parseInt(k)){
				var next_k = parseInt(k)+1;
				$$.ajax({
					url : window.startUrl+'getpages/'+pages_arr[k]+'/',
					data : {device:window.deviceId, key: localStorage.getItem('authorize_key')},
					dataType: 'json',
					success : function(dt){
						
						if(next_k != pages_arr.length) {
							var pers = 80/pages_arr.length;
							pers = 20+next_k*pers;
							pers = Math.ceil(pers);
							
							$$('#ldTimer .loadpersent').html(pers+'%');
							$$('#ldTimer .loadpersent').css({'width': pers+'%'});
							
							db.transaction(function(tx){
								$$.each(dt, function (ind, val) {
									tx.executeSql("INSERT INTO pages (ID, type, text) VALUES (?,?,?)",[val['page'],val['type'],JSON.stringify(val['text'])],function(){});
								});
							},function(){},function(){
								loadPages(next_k);
							});
							
							
						}else{
							
							db.transaction(function(tx){
								$$.each(dt, function (ind, val) {
									tx.executeSql("INSERT INTO pages (ID, type, text) VALUES (?,?,?)",[val['page'],val['type'],JSON.stringify(val['text'])],function(){});
								});
							},function(){},function(){
								
								
								//setLastVersion(true);
								
								$$('#ldTimer .loadpersent').html('Загрузка данных завершена');
								$$('#ldTimer .loadpersent').css({'width': '100%'});
								
								//tmpl = {};
								
								//setTimeout(function(){
									loadVersion = false;
									$$.ajax({
										url : window.startUrl+'version/',
										async : false,
										data : {device:window.deviceId, key: localStorage.getItem('authorize_key')},
										dataType: 'html',
										timeout: 5000,
										success : function(data){
                                                                                        localStorage.setItem('last_version',data);
											localStorage.setItem('version',data);
											version = data;
											loadVersion = true;
											window.curentLoadBase = false;
											loader = true;
											//setTmpl();
											location.href = 'index.html';
											
										},
										error: function(){
											//window.connection = false;
											window.curentLoadBase = false;
											loader = true;
											loadVersion = true;
											//setTmpl();
											location.href = 'index.html';
										}
									});
								//},150);
								
								
								
							});
							
						}
					},
					error : function(){
						
						db.transaction(function(tx){
							tx.executeSql("DELETE FROM tmpl WHERE ID>0",[]);
						},function(){},function(){
							
							$$('#ldTimer .loadpersent').html('Ошибка связи');
							$$('#ldTimer .loadpersent').css({'width': '100%', 'background':'red'});
							$$("#loadBase").show();
							window.curentLoadBase = false;
							tmpl = {};

						});
						
					}
				});
			}
		
		}
	
	}
	},150);
	
}