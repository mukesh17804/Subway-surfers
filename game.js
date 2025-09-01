
(() => {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  let DPR = window.devicePixelRatio || 1;

  function resize(){
    const w = Math.min(900, window.innerWidth*0.95);
    const h = Math.floor(w * 1.2);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    canvas.width = Math.floor(w * DPR);
    canvas.height = Math.floor(h * DPR);
  }
  resize();
  window.addEventListener('resize', resize);

  const lanes = 3;
  const laneX = (i) => (canvas.width*0.2 + i*(canvas.width*0.6/(lanes-1)));
  let state = { running:false, score:0, lives:3, speed:300, spawnTimer:0, time:0 };

  const player = { lane:1, x:0, y:0, w:48, h:64, vy:0, jumping:false, slide:false };
  function reset(){ state = { running:false, score:0, lives:3, speed:300, spawnTimer:0, time:0 }; player.lane=1; player.jumping=false; player.slide=false; entities=[]; }
  reset();

  let entities = []; // {type: 'obstacle'|'coffee'|'heart', x, y, lane, w, h}

  function spawnEntity(){
    const r = Math.random();
    let type='obstacle';
    if(r>0.85) type='coffee';
    else if(r>0.95) type='heart';
    const lane = Math.floor(Math.random()*lanes);
    const e = { type, lane, x: canvas.width + 80, y:0, w: (type==='obstacle'?60:36), h:(type==='obstacle'?60:36) };
    entities.push(e);
  }

  function update(dt){
    if(!state.running) return;
    state.time += dt;
    state.spawnTimer -= dt;
    if(state.spawnTimer <= 0){
      spawnEntity();
      state.spawnTimer = 0.8 - Math.min(0.4, state.time*0.002);
    }
    for(let i=entities.length-1;i>=0;i--){
      const e = entities[i];
      e.x -= state.speed * dt * DPR;
      const px = laneX(player.lane);
      const py = canvas.height - 180*DPR - (player.jumping?120*DPR:0) + (player.slide?20*DPR:0);
      const pw = player.w*DPR, ph = player.h*DPR;
      const ex = e.x, ey = canvas.height - 180*DPR - e.h*DPR;
      const ew = e.w*DPR, eh = e.h*DPR;
      if(Math.abs(ex - px) < 60*DPR && e.lane===player.lane){
        if(!(player.jumping && ey+eh < py+ph*0.3) && !(player.slide && eh>ph*0.6)){
          if(e.type==='obstacle'){ state.lives -= 1; entities.splice(i,1); if(state.lives<=0) state.running=false; }
          else if(e.type==='coffee'){ state.score += 50; entities.splice(i,1); }
          else if(e.type==='heart'){ state.lives = Math.min(5, state.lives+1); entities.splice(i,1); }
        }
      }
      if(e.x < -200) entities.splice(i,1);
    }
    state.score += Math.floor(10*dt*DPR);
    state.speed += 0.5*dt*DPR;
  }

  function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = '#f4f2ff';
    ctx.fillRect(0,0,canvas.width, canvas.height);
    for(let i=0;i<lanes;i++){
      ctx.fillStyle = i%2? '#ffffff':'#faf8ff';
      const lx = laneX(i) - 80*DPR;
      ctx.fillRect(lx, canvas.height - 200*DPR, 160*DPR, 200*DPR);
    }
    for(const e of entities){
      const ex = e.x, ey = canvas.height - 180*DPR - e.h*DPR;
      ctx.save();
      ctx.translate(ex,0);
      if(e.type==='obstacle'){
        ctx.fillStyle = '#8b5e3c';
        ctx.fillRect(0, ey, e.w*DPR, e.h*DPR);
      } else if(e.type==='coffee'){
        ctx.fillStyle = '#F5BC52';
        ctx.beginPath(); ctx.arc(e.w*DPR/2, ey + e.h*DPR/2, e.w*DPR/2, 0, Math.PI*2); ctx.fill();
      } else if(e.type==='heart'){
        ctx.fillStyle = '#E65578';
        ctx.beginPath(); ctx.arc(e.w*DPR*0.3, ey + e.h*DPR*0.4, e.w*DPR*0.25, 0, Math.PI*2); ctx.fill();
      }
      ctx.restore();
    }
    const px = laneX(player.lane);
    const py = canvas.height - 180*DPR - (player.jumping?120*DPR:0) + (player.slide?20*DPR:0);
    ctx.fillStyle = '#3A234B';
    ctx.beginPath(); ctx.arc(px, py - 24*DPR, player.w*DPR/2, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.fillRect(px - 18*DPR, py - 12*DPR, 36*DPR, 28*DPR);
    ctx.setTransform(1,0,0,1,0,0);
    ctx.fillStyle = '#222'; ctx.font = (18*DPR) + 'px system-ui'; ctx.fillText('Score: ' + state.score, 16*DPR, 28*DPR); ctx.fillText('Lives: ' + state.lives, 16*DPR, 56*DPR);
  }

  document.getElementById('startBtn').addEventListener('click', ()=>{ state.running = true; state.score=0; entities=[]; });
  document.getElementById('musicBtn').addEventListener('click', ()=>{ const a = document.getElementById('bgAudio'); if(a.paused){ a.play(); document.getElementById('musicBtn').textContent='Pause Music'; } else { a.pause(); document.getElementById('musicBtn').textContent='Play Music'; } });
  document.getElementById('leftBtn').addEventListener('click', ()=>{ player.lane = Math.max(0, player.lane-1); });
  document.getElementById('rightBtn').addEventListener('click', ()=>{ player.lane = Math.min(2, player.lane+1); });
  document.getElementById('jumpBtn').addEventListener('click', ()=>{ if(!player.jumping){ player.jumping = true; setTimeout(()=>player.jumping=false, 450); } });
  window.addEventListener('keydown', (e)=>{ if(e.key==='ArrowLeft') player.lane = Math.max(0, player.lane-1); if(e.key==='ArrowRight') player.lane = Math.min(2, player.lane+1); if(e.key==='ArrowUp' || e.key===' ') { if(!player.jumping){ player.jumping=true; setTimeout(()=>player.jumping=false, 450); } } if(e.key==='ArrowDown'){ player.slide = true; setTimeout(()=>player.slide=false, 450); } });
  let touchStartX=0, touchStartY=0;
  canvas.addEventListener('touchstart', e=>{ touchStartX = e.touches[0].clientX; touchStartY = e.touches[0].clientY; });
  canvas.addEventListener('touchend', e=>{ const dx = e.changedTouches[0].clientX - touchStartX; const dy = e.changedTouches[0].clientY - touchStartY; if(Math.abs(dx) > Math.abs(dy)){ if(dx > 40) player.lane = Math.min(2, player.lane+1); else if(dx < -40) player.lane = Math.max(0, player.lane-1); } else { if(dy < -40) { if(!player.jumping){ player.jumping=true; setTimeout(()=>player.jumping=false, 450); } } if(dy > 40) { player.slide = true; setTimeout(()=>player.slide=false, 450); } } });
  let last = 0;
  function loop(ts){ if(!last) last = ts; const dt = Math.min(0.05, (ts-last)/1000); last = ts; update(dt); draw(); requestAnimationFrame(loop); }
  requestAnimationFrame(loop);
})();
