const config = {
    ghsecret: '',/*Github Personal access tokens*/
	key:''/*Your own password*/
}
addEventListener('fetch', event => {
    event.respondWith(handle(event.request))
})
async function handle(request) {
    const sp = new URL(request.url).searchParams,rt={code:0,data:{}};
    if (sp.get('a') !== null) { /*有请求*/
        if (sp.get('a') == 'gettoken') {
          const rq=sp.get('p'),rqjs=JSON.parse(atob(rq));
		  if(atob(rqjs.pass)==config.key){
			  rt.data.access_token=btoa(config.ghsecret);
			  rt.code=1;
		  }
		  /*resp = await fetch("https://github.com/login/oauth/access_token", {
          method: "POST",
          body: `client_id=${rqjs.cid}&client_secret=${config.client_secret}&code=${rqjs.c}&redirect_uri=${rqjs.rd}`,
          headers: {
              "Content-Type": "application/x-www-form-urlencoded",
			  "Accept": "application/json"
          }
          });
		  if (resp.ok) {
			  console.info("successfully get access_token.");
			  const data = await resp.json();
			  acstoken=data.access_token;
			  if(acstoken!==''&&acstoken!==null&&acstoken!==undefined){
			     rt.code=1;
			     rt.data={access_token:acstoken,msg:'success'};
			  }
		  }else{
			  rt.data={msg:'failed'};
		  }
        }else if (sp.get('a') == 'api') {
			
		}*/
    }
  }
  return new Response(JSON.stringify(rt), {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'content-type': 'application/json'
        }
  });
}