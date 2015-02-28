
var getAPattern = function() {
	var base = {
		'/href' : 'link',
		'/text' : 'title',
		'//href' : 'id'
	};	
	return base;
}

var getListPattern = function(mainSel) {
	var data={};
	data['list<' + mainSel] = getAPattern() 
	return data;
}



var FuncDef= {
	findFirst : function(elements) {
		if(elements.length>0) {
			return elements[0]['href'];
		}
		return null;
	},
	findLast : function(elements) {
		if(elements.length>0) {
			return elements[elements.length-1]['href'];
		}
		return null;
	},
	findSPotNext : function(elements) {
		if(elements.length>0) {
			return $('a', elements.next())[0]['href'];
		}
		return null;
	},
	findKDSNext : function(elements) {
		for(var i=0; i<elements.length-1;i++) {
			if($(elements[i]).text().indexOf('[')>-1) {
				return elements[i+1]['href'];
			}
		}
	},
	findLast2 : function(elements) {
		if(elements.length>0) {
			return elements[elements.length-2]['href'];
		}
		return null;
	},
	/**********************/
	followCnbetaNext : function(link) {
		parse('http://www.cnbeta.com/newread.php?page=1', false)
	},
	cnbetaNext : function(e, link) {
		var pageno = parseInt(FuncDef.fetchNum(link))
		console.log('current page:'+pageno);
		return 'http://www.cnbeta.com/newread.php?page='+(pageno+1)
	},
	/************************filter************************/
	fetchNum : function (str) {
		str = (str || '').match(/[\d]+/);
		if(str) {
			str=str[0]
		}
		return str;
	},
	showCnbetaComment : function(link) {
		/** 
		From http://www.cnbeta.com/articles/[0-9]+.htm
		To   http://m.cnbeta.com/comments_290957.htm
		**/
		var commentUrl = link.replace(/http:\/\/www.cnbeta.com\/articles\//,'http://m.cnbeta.com/comments_');
		//commentUrl = commentUrl.replace(/htm$/,'html');
		parse(commentUrl, false);

	},
}

var patterns_1 = [
	{
		links : [
			'data.html'
		],
		data : getListPattern('div a'),
		target : 'listing'
	},

	/******************************KDS*************************************/
	{
		links : [
			'http://club.pchome.net/map.html'
		],
		data : getListPattern('#main_frame div a'),
		target : 'listing'
	},
	{
		links : [
			'http://kds.pchome.net',
			'http://club.pchome.net/forum_[0-9]+_[0-9]+.html',
			'http://club.pchome.net/forum_[0-9]+_[0-9]+_[0-9]+______.html'
		],
		data : {
			'list<#main-list .i2' : {
				'.n3 a' : getAPattern(),
				'.n4' : {
					'/text' : 'reply'
				}
			},
			'$#main-list .i3 a' : {
				'@findLast' : 'next'
			}
		},
		target : 'listing'
	},
	{
		//post 
		links : [
			'http://club.pchome.net/thread_[_0-9]+(|TRUE).html'
		],
		data : {
			 '#topic_title h1' : {
				 '/text':'title'
			 },
			 '#topic-info .f-left span:first a' : {
				 '/href':'onlylz'
			 },
			 'list<div.item' : {
				'$div.mc div:first' : 'content',
				'div.o_info span': {
					'/text' : 'floor'
				},
				'div.author' : {
					'/text' : 'user'
				},
				'div.avatars img' : {
					'/src': 'author_pic' 
				},
				'div.p_time': {
					'/text' : 'time'
				},
				/**'$.postmessage .postattachlist dd img' : 'attach_pics'**/
			},
			'$div.inner_pager a.page' : {
				'@findKDSNext' : 'next'
			}
		},
		target : 'content'
	},
	/***********************************MZ********************************/
	{
		links : [
			'http://bbs.meizu.cn/'
		],
		data : getListPattern('#meizu_forumlist dd a'),
		encoding: 'utf-8',
		target : 'listing'
	},
	{
		links : [
			'http://bbs.meizu.cn/forumdisplay.php\\?fid=[0-9]+',
			'http://bbs.meizu.cn/forum-[0-9]+-[0-9]+.html'
		],
		encoding: 'utf-8',
		data : { 
			'list<#moderate tbody' : {
				'a.xst' : getAPattern(),
				'a.comnum_list' : {
					'/text' : 'reply'
				},
				'$' : {
					'/id' : 'id'
				} 
			},
			'$div.pg .nxt' : {
				'@findFirst' : 'next'
			}
		},
		target : 'listing'
	},
	{
		//post 
		links : [
			'http://bbs.meizu.cn/thread-[0-9]+-[0-9]+-[0-9]+.html'
		],
		encoding: 'utf-8',
		data : {
			 'div#nav' : {
				 '/text':'title'
			 },
			 'list<div.item_postlist' : {
				'$.pct' : 'content',
				'div.postinfo strong a': {
					'/text' : 'floor'
				},
				'div.mzcite a' : {
					'/text' : 'user'
				},
				'div.avatar img' : {
					'/src': 'author_pic' 
				},
				'span.info_head': {
					'/text' : 'time'
				},
				'$.postmessage .postattachlist dd img' : 'attach_pics'
			},
			'$div.pg .nxt' : {
				'@findFirst' : 'next'
			}
		},
		target : 'content'
	},
	/*****************************QS**************************/
	{
		links : [
			'http://www.qiushibaike.com/'
		],
		encoding: 'utf-8',
		data : getListPattern('div.menu ul a'),		
		target : 'listing'
	},
	{
		links : [
			'http://www.qiushibaike.com/[a-z0-9/\?=]+'
		],
		encoding: 'utf-8',
		data : {
			 'div#nav' : {
				 '/text':'title'
			 },
			 'list<div.col1 div.untagged' : {
				'/id':'id',
				'/id':'floor',
				'$div.content' : 'content',				
				'div.author a' : {
					'/text' : 'user'
				},
				'div.author img' : {
					'/src': 'author_pic' 
				},
				'div.content': {
					'/title' : 'time'
				},
				'$div.thumb img' : 'attach_pics'
			},
			'$div.pagebar a.next' : {
				'@findFirst' : 'next'
			}
		},		
		target : 'content'
	},
	/***********************************Engadget********************************/	
	{
		links : [
			'http://cn.engadget.com/',
			'http://cn.engadget.com/page/[0-9]+/'
		],
		encoding: 'utf-8',
		data : { 
			'list<.post' : {
				'h2 a' : getAPattern(),
				'.commentslink big' : {
					'/text' : 'reply'
				},
				/**'th span' : {
					'/id' : 'id'
				}**/
			},
			'$#paging .newer a' : {
				'@findFirst' : 'next'
			}
		},
		target : 'listing'
	},
	{
		//post 
		links : [
			'http://cn.engadget.com/[0-9]+/[0-9]+/[0-9]+/[0-9a-z\\-]+/'
		],
		encoding: 'utf-8',
		data : {
			 '.posttitle span' : {
				 '/text':'title'
			 },
			 'list<div.post' : {
				'$.postbody' : 'content'				
			 },
			 'list<div.commentlinks' : {
				'$.cmt_contents' : 'content'				
			 },
			'$#cmt_paging a' : {
				'@findLast' : 'next'				
			 },
		},
		target : 'content'
	},
	{
		//comment 
		links : [
			'http://cn.engadget.com/[0-9]+/[0-9]+/[0-9]+/[0-9a-z\\-]+/[0-9]+#comments'
		],
		encoding: 'utf-8',
		data : {			
			 'list<div.commentlinks' : {
				'$.cmt_contents' : 'content'				
			 },		
		},
		target : 'content'
	},

	/***********************************Cnbeta********************************/	
	{
		links : [
			'http://www.cnbeta.com/'
		],
		encoding: 'utf-8',
		data : {
			'list<dt' : {
				'a' : getAPattern()							
			},
			/*
			'list<#active .newslist' : {
				'.topic a' : getAPattern(),
				'dd.detail span' : {
					'/text' : {
						'@fetchNum' : 'reply'
					}
				}
			}*/
		},
		//follow : '@followCnbetaNext',
		target : 'listing'
	},
	{
		//post 
		links : [
			'http://www.cnbeta.com/articles/[0-9]+.htm'
		],
		encoding: 'utf-8',
		data : {
			 '#news_title' : {
				 '/text':'title'
			 },
			 'list<div.content' : {
				'$' : 'content'				
			 },			
			 'list<div#J_commt_list dl' : {
				'.comment_body .re_text' : 'content'
			 },
					
		},
		target : 'content',
		follow : '@showCnbetaComment'
	},
	{
		//comment 
		links : [
			'http://m.cnbeta.com/comments_[0-9]+.htm'
		],
		encoding: 'utf-8',
		data : {
			 // comment should fetch by ajax
			 'list<#J_commt_list li' : {
				'$.comContent' : 'content',
				'dt.re_author strong': {
					'/text' : {
						'@fetchNum' : 'floor'
					}
				 }
			 }
					
		},
		target : 'content'
	},

/***********************************weiphone********************************/
	{
		links : [
			'http://bbs.weiphone.com/'
		],
		data : getListPattern('.forumT a'),
		encoding: 'utf-8',
		target : 'listing'
	},
	{
		links : [
			'http://bbs.weiphone.com/thread-htm-fid-[0-9]+-page-[0-9]+.html',
			'http://bbs.weiphone.com/thread-htm-fid-[0-9]+.html'
		],
		encoding: 'utf-8',
		data : { 
			'list<#threadlist tr:has(.subject_t)' : {
				'td.subject a.subject_t' : getAPattern(),
				'td.num em' : {
					'/text' : 'reply'
				}				
			},
			'$div.pages b+a' : {
				'@findFirst' : 'next'
			}	
		},
		target : 'listing'
	},
	{
		//post 
		links : [
			'http://bbs.weiphone.com/read-htm-tid-[0-9]+.html',
			'http://bbs.weiphone.com/read-htm-tid-[0-9]+-page-[0-9]+.html'
		],
		encoding: 'utf-8',
		data : {
			 '#subject_tpc' : {
				 '/text':'title'
			 },
			 'list<div.read_t' : {
				'$.readContent' : 'content',
				'div.tipTop a.s2': {
					'/text' : 'floor'
				},
				'div.readName a' : {
					'/text' : 'user'
				},
				'div.avatar img' : {
					'/src': 'author_pic' 
				},
				'span.post-time': {
					'/text' : 'time'
				},
				'$.imgList img' : 'attach_pics'
			},
			'$div.pages b+a' : {
				'@findFirst' : 'next'
			}
		},
		target : 'content'
	},
	{
		links : [
			'http://www.budejie.com'
		],
		data : getListPattern('#budejie_nav ul a'),
		encoding: 'gbk',
		target : 'listing'
	},
	{
		//post 
		links : [
			'http://www.budejie.com/',
			'http://www.budejie.com/[0-9]+',
			'http://www.budejie.com/duanzi/',
		    'http://www.budejie.com/duanzi/[0-9]+'
		],
		encoding: 'utf-8',
		data : {
			 '#subject_tpc' : {
				 '/text':'title'
			 },
			 'list<.web_content_left div.web_left' : {
				'$.web_list_left' : 'content',
				'div.tipTop a.s2': {
					'/text' : 'floor'
				},
				'li.user_name' : {
					'/text' : 'user'
				},
				'div.avatar img' : {
					'/src': 'author_pic' 
				},
				'p.time': {
					'/text' : 'time'
				},
				'$.imgList img' : 'attach_pics'
			},
			'p.budejie_ye a' : {
				'@findLast2' : 'next'
			}
		},
		target : 'content'
	},
	{
		links : [
			'http://club.m.autohome.com.cn/bbs/forum-c-[0-9]+-[0-9]+.html'
		],
		//data : getListPattern('.bbs-list-post li a'),
		data : { 
			'list<.list-post li' : {
				'a' : {
					'/href' : 'link',
					'h2' : {
						'/text' : 'title'
					},
					'//href' : 'id'
				},
				'.reply' : {
					'/text' : 'reply'
				}				
			},
			'a.next' : {
				'@findFirst' : 'next'
			}	
		},
		encoding: 'utf-8',
		target : 'listing'
	},
	{
		//post 
		links : [
			'http://club.m.autohome.com.cn/bbs/thread-c-[0-9]+-[0-9]+-[0-9]+.html',
			'http://club.m.autohome.com.cn/bbs/thread-c-[0-9]+-[0-9]+-[0-9]+.html\\?.+'
		],
		encoding: 'utf-8',
		data : {
			 '.post-title' : {
				 '/text':'title'
			 },
			 'list<section.post-cont' : {
				'section' : 'content',
				'.floor': {
					'/text' : 'floor'
				},
				'.user' : {
					'/text' : 'user'
				},
				'div.avatar img' : {
					'/src': 'author_pic' 
				},
				'.time': {
					'/text' : 'time'
				},
				'$.imgList img' : 'attach_pics'
			},
			'a.next' : {
				'@findFirst' : 'next'
			}
		},
		target : 'content'
	},

	///


	{
		links : [
			'http://pic.gamespot.com.cn/list_.+'
		],
		data : getListPattern('.pic-wrapper .pic a'),
		encoding: 'gbk',
		target : 'listing'
	},
	{
		//post 
		links : [
			'http://pic.gamespot.com.cn/detail_[0-9]+_[0-9]+_[0-9]+.html'
		],
		encoding: 'gbk',
		data : {
			 'h2:first a' : {
				 '/text':'title'
			 },
			 'list<#detailBigPic' : {
				'$' : 'content'
			},
			'li.current' : {
				'@findSPotNext' : 'next'
			}
		},
		target : 'content'
	},

	/// SIS2014/8/31

	{
		links : [
			'http://162.252.9.3/forum/forum-[0-9]+-[0-9]+.html'
		],
		data : { 
			'list<tbody[id*=normalthread] span[id*=thread]' : {
				'a' : {
					'/href' : 'link',
					'/text' : 'title',
					'//href' : 'id'
				},
				'.repay' : {
					'/text' : 'reply'
				}				
			},
			'.next' : {
				'@findFirst' : 'next'
			}	
		},
		//data : getListPattern('.new span[id*=thread] a'),
		encoding: 'gbk',
		target : 'listing'
	},
	{
		//post 
		links : [
			'http://162.252.9.3/forum/thread-[0-9]+-[0-9]+-[0-9]+.html'
		],
		encoding: 'gbk',
		data : {
			 '.nav' : {
				 '/text':'title'
			 },
			 'list<.postmessage:first' : {
				'$' : 'content'
			}
		},
		target : 'content'
	},
	{
		//post 
		links : [
			'http://pic.kdslife.com/content_[0-9_]+.html'
		],
		encoding: 'gbk',
		data : {
			 '.photo-tit h3' : {
				 '/text':'title'
			 },
			 'list<#thumb-list img' : {
				'$' : 'content'
			}			
		},
		target : 'content'
	}
];