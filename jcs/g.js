/*Scripts for Github Actions - SomeBottle*/
window.auth, window.ua = '';
window.auth = 'Basic ' + Base64.encode(ua);
window.authstatu = false;
window.gstate = 0; /*任务完成状况*/
window.errnum = 0; /*出错次数*/

function timestamp() {
	var a = new Date().getTime();
	return a;
}

function gh(auth) {
	this.login = function(usr, pass, callback) {
		window.gstate += 1;
		ua = usr + ':' + pass;
		auth = 'Basic ' + Base64.encode(ua);
		window.auth = 'Basic ' + Base64.encode(ua);
		$.aj('https://api.github.com/users/' + usr + '?' + timestamp(), {}, {
			success: function(msg) {
				var t = JSON.parse(msg);
				if (t.private_gists !== undefined) {
					console.log('Login Success');
					callback.success(msg);
					window.authstatu = true;
				}
				window.gstate -= 1;
			},
			failed: function(m) {
				callback.failed(m);
				console.log('Login Failed');
				window.authstatu = 'failed';
				window.errnum += 1;
				window.gstate -= 1;
			}
		}, 'get', auth, true);
	}
	this.getfile = function(usr, repo, file, asyn, callback) { /*获得文件信息*/
		window.gstate += 1;
		$.aj('https://api.github.com/repos/' + usr + '/' + repo + '/contents/' + file + '?' + timestamp(), {}, {
			success: function(msg) {
				var t = JSON.parse(msg);
				if (t.message == 'Not Found') {
					t = 'empty';
				}
				callback.success(t);
				window.filestatu = true;
				window.gstate -= 1;
			},
			failed: function(m) {
				callback.failed(m);
				console.log('[GetSha]Failed');
				window.filestatu = 'failed';
				window.gstate -= 1;
				window.errnum += 1;
			}
		}, 'get', auth, asyn);
	}
	this.getrepo = function(usr, repo, asyn, callback) { /*获得repo信息*/
		window.gstate += 1;
		$.aj('https://api.github.com/repos/' + usr + '/' + repo + '?' + timestamp(), {}, {
			success: function(msg) {
				var t = JSON.parse(msg);
				if (t.message == 'Not Found') {
					t = 'empty';
				}
				callback.success(t);
				window.repostatu = true;
				window.gstate -= 1;
			},
			failed: function(m) {
				callback.failed(m);
				console.log('[GetRepo]Failed');
				window.repostatu = 'failed';
				window.gstate -= 1;
				window.errnum += 1;
			}
		}, 'get', auth, asyn);
	}
	this.cr = function(usr, repo, file, commit, content, callback) { /*创建/编辑文件*/
		window.gstate += 1;
		this.getfile(usr, repo, file, false, {
			success: function(fi) {
				var shacode;
				if (fi !== 'empty') {
					shacode = fi.sha;
				}
				$.aj('https://api.github.com/repos/' + usr + '/' + repo + '/contents/' + file + '?' + timestamp(), {
					message: commit,
					content: Base64.encode(content),
					sha: shacode
				}, {
					success: function(m) {
						callback.success(m);
						window.createstatu = true;
						console.log('[CreateFile]Success');
						window.gstate -= 1;
					},
					failed: function(m) {
						callback.success(m);
						window.createstatu = 'failed';
						console.log('[CreateFile]Newly or Failed');
						window.gstate -= 1;
					}
				}, 'put', auth, true);
			},
			failed: function(m) {
				callback.failed(m);
			}
		});
	}
	this.del = function(usr, repo, file, commit, callback) { /*删除文件*/
		window.gstate += 1;
		this.getfile(usr, repo, file, false, {
			success: function(fi) {
				var shacode;
				if (fi !== 'empty') {
					shacode = fi.sha;
					$.aj('https://api.github.com/repos/' + usr + '/' + repo + '/contents/' + file + '?' + timestamp(), {
						message: commit,
						sha: shacode
					}, {
						success: function(m) {
							callback.success(m);
							console.log('[DeleteFile]Success');
							window.gstate -= 1;
						},
						failed: function(m) {
							callback.failed(m);
							console.log('[DeleteFile]Failed');
							window.gstate -= 1;
							window.errnum += 1;
						}
					}, 'delete', auth, true);
				} else {
					console.log('[DeleteFile]Failed');
				}
			},
			failed: function(m) {
				callback.failed(m);
			}
		});
	}
}
var blog = new gh(window.auth);