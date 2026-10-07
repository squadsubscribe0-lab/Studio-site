// Scripted co-op play for trailer capture. Drives the game's own step() with synthetic inputs.
// A plan is a list of phases; each phase is fn(ctx) -> {inp:[...], done:bool}.
(function(){
  const blank=()=>({dir:0,jp:false,jh:false,dp:false});
  const P=i=>L.players[i];
  const cx=p=>p.x+p.w/2;
  const H={
    // move player toward x (center), optionally jumping; returns input and arrived flag
    go(i,x,o={}){const p=P(i),d=x-cx(p),inp=blank();
      if(Math.abs(d)>(o.tol||3))inp.dir=d>0?1:-1;
      return {inp,ok:Math.abs(d)<=(o.tol||3)&&!!p.ground};},
  };
  // phase builders
  const A={
    // everyone walks to xs[i] (null = idle); jumpAt: jump when within range of an obstacle
    walk(xs,o={}){return c=>{const inp=L.players.map(()=>blank());let ok=true;
      xs.forEach((x,i)=>{if(x==null||!P(i)||P(i).entered)return;const r=H.go(i,x,o);inp[i]=r.inp;ok=ok&&r.ok;
        if(o.hop&&o.hop.some(([a,b])=>cx(P(i))>a&&cx(P(i))<b)&&P(i).ground){inp[i].jp=true;inp[i].jh=true;}});
      return {inp,done:ok};};},
    // single jump for players js with held dir for n frames
    jump(js,dir=0,n=40,hold=true){return c=>{const inp=L.players.map(()=>blank());
      for(const i of js){inp[i].dir=dir;inp[i].jh=hold&&c.t<22;inp[i].jp=c.t===0;}
      return {inp,done:c.t>=n};};},
    hold(n,f){return c=>{const inp=L.players.map(()=>blank());if(f)f(inp,c);return {inp,done:c.t>=n};};},
    enter(){return c=>{const inp=L.players.map(p=>({dir:0,jp:false,jh:false,dp:c.t%6===0}));return {inp,done:L.done||c.t>90};};},
    leap(i,x,n=80){return c=>{const inp=L.players.map(()=>blank());const p=P(i);const d=x-cx(p);
      inp[i].dir=Math.abs(d)>3?(d>0?1:-1):0;inp[i].jp=c.t===0;inp[i].jh=c.t<24;return {inp,done:(c.t>8&&!!p.ground)||c.t>=n};};},
    leapAll(xs,n=80){return c=>{const inp=L.players.map(()=>blank());let ok=c.t>8;xs.forEach((x,i)=>{const p=P(i);const d=x-cx(p);inp[i].dir=Math.abs(d)>3?(d>0?1:-1):0;inp[i].jp=c.t===0;inp[i].jh=c.t<24;ok=ok&&!!p.ground;});return {inp,done:ok||c.t>=n};};},
    enterOne(i,x){return c=>{const inp=L.players.map(()=>blank());const p=P(i);if(p.entered)return{inp,done:true};const d=x-cx(p);if(Math.abs(d)>4)inp[i].dir=d>0?1:-1;else inp[i].dp=c.t%4===0;return{inp,done:p.entered||c.t>200};};},    until(cond,f,max=400){return c=>{const inp=L.players.map(()=>blank());if(f)f(inp,c);return {inp,done:cond()||c.t>=max};};},
  };
  // verified in sim: each clears its level with zero deaths
  const PLANS={
    // 1-2 Lend a Head (2P): head-stack to reach the key
    lendAHead:{idx:1,N:2,plan:()=>[A.walk([150,185],{tol:6}),A.jump([0,1],1,45),A.walk([330,425],{tol:5}),A.leap(0,425),A.hold(10),A.leap(0,470),A.walk([480,null],{tol:4}),A.leap(0,482),A.walk([856,828],{tol:6}),A.enter()]},
    // 1-5 Going Up (4P): lift needs all four riders
    goingUp:{idx:4,N:4,plan:()=>[A.walk([524,548,572,596],{tol:3,hop:[[480,506]]}),A.until(()=>L.movers[0].y<=292,null,400),A.jump([0,1,2,3],1,50),A.walk([700,730,760,790],{tol:6,hop:[[500,622]]}),A.enterOne(3,880),A.enterOne(2,880),A.enterOne(1,880),A.enterOne(0,880),A.hold(5)]},
    // 3-1 True Colors (2P): only Red passes red walls
    trueColors:{idx:20,N:2,plan:()=>[A.walk([180,240],{tol:6}),A.leap(0,330),A.walk([656,null],{tol:5}),A.walk([350,318],{tol:5}),A.enter()]},
  };  function runner(plan){let k=0,t=0;
    return function next(){if(k>=plan.length)return {inp:L.players.map(()=>blank()),end:true};
      const r=plan[k]({t});t++;if(r.done){k++;t=0;}return {inp:r.inp,end:false,phase:k};};}
  // headless check: returns summary
  function sim(idx,N,plan,max=3000){loadLevel(idx,N,false);const nx=runner(plan);let s=0,log=[];
    for(;s<max;s++){const r=nx();if(r.end)break;step(STEP,r.inp);if(L.deaths)break;if(s%30===0)log.push(L.players.map(p=>Math.round(cx(p))+','+Math.round(p.y)+(p.ground?'g':'a')).join(' ')+' k'+(L.key?L.key.carrier:'-')+' ph'+r.phase);}
    return {steps:s,done:L.done,deaths:L.deaths,key:L.key&&L.key.carrier,pos:L.players.map(p=>[Math.round(cx(p)),Math.round(p.y),!!p.entered]),log:log.slice(-12)};}
  window.AUTO={A,H,runner,sim,blank,PLANS};
})();
