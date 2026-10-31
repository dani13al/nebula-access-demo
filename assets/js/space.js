/* Nebula Access Pro — original 3D perspective particle field (zero dependencies).
   World-space x/y/z particles are projected onto a 2D canvas with perspective,
   with camera parallax, depth-dependent motion and a low-motion fallback. */
(() => {
  'use strict';
  const canvas = document.getElementById('starfield');
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const pointer = { x:0, y:0, tx:0, ty:0 };
  let stars=[], width=0, height=0, dpr=1, raf=0, last=0, visible=true, scrollOffset=0;
  const rand = (a,b) => a+Math.random()*(b-a);
  function makeStar(){ return { x:rand(-2.5,2.5), y:rand(-2.2,2.2), z:rand(.25,3.5), size:rand(.45,1.55), hue:Math.random()<.16?195:215, alpha:rand(.22,.9), twinkle:rand(0,6.28) }; }
  function resize(){
    width=Math.max(320,innerWidth);height=Math.max(320,innerHeight);
    dpr=Math.min(devicePixelRatio || 1,1.75);
    canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
    canvas.style.width=width+'px';canvas.style.height=height+'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);
    const count=Math.max(55,Math.min(190,Math.round(width*height/8500)));
    stars=Array.from({length:count},makeStar);draw(0,true);
  }
  function draw(now,staticFrame=false){
    if(!visible)return;
    const moving=!reduced.matches&&!document.body.classList.contains('motion-off');
    const delta=last?Math.min((now-last)/16.67,2):1;last=now;
    ctx.clearRect(0,0,width,height);
    // radial galaxy glow, subtly visible behind crisp foreground panels
    const g=ctx.createRadialGradient(width*.42,height*.36,0,width*.42,height*.36,Math.max(width,height)*.66);
    g.addColorStop(0,'rgba(10,55,100,.19)');g.addColorStop(.5,'rgba(2,22,48,.045)');g.addColorStop(1,'rgba(2,9,21,0)');
    ctx.fillStyle=g;ctx.fillRect(0,0,width,height);
    if(moving){ pointer.x+=(pointer.tx-pointer.x)*.025;pointer.y+=(pointer.ty-pointer.y)*.025; }
    const t=now*.0006;
    for(const star of stars){
      if(moving) {star.z-=delta*.00065;if(star.z<.24){Object.assign(star,makeStar());star.z=3.5;}}
      const p=1/(star.z+.25), factor=Math.min(width,height)*.75;
      const x=width*.5+(star.x-pointer.x*(.04+.025*p))*factor*p;
      const y=height*.47+(star.y-pointer.y*(.04+.025*p))*factor*p + Math.tanh(scrollOffset/700)*68*(p-.08);
      if(x<-5||x>width+5||y<-5||y>height+5)continue;
      const a=star.alpha*(moving?(.72+.28*Math.sin(t*2+star.twinkle)):1);
      const r=Math.min(2.3,Math.max(.4,star.size*p*.95));
      ctx.fillStyle=`hsla(${star.hue},100%,${star.hue===195?78:90}%,${a})`;
      ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
      if(r>1.1){ctx.fillStyle=`rgba(0,217,255,${a*.035})`;ctx.beginPath();ctx.arc(x,y,r*4.7,0,6.283);ctx.fill();}
    }
    if(moving && !staticFrame)raf=requestAnimationFrame(draw);
  }
  function start(){cancelAnimationFrame(raf);last=0;if(!reduced.matches&&!document.body.classList.contains('motion-off'))raf=requestAnimationFrame(draw);else draw(0,true);}
  addEventListener('resize',resize,{passive:true});
  addEventListener('pointermove',e=>{pointer.tx=e.clientX/Math.max(width,1)*2-1;pointer.ty=e.clientY/Math.max(height,1)*2-1;},{passive:true});
  addEventListener('scroll',()=>{scrollOffset=window.scrollY||0;if(reduced.matches)draw(0,true);},{passive:true});
  document.addEventListener('visibilitychange',()=>{visible=!document.hidden;if(visible)start();else cancelAnimationFrame(raf);});
  reduced.addEventListener?.('change',start);
  window.nebulaSpace={refresh:start};
  resize();start();
})();
