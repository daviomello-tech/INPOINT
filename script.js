/* Content transcribed from the supplied flowchart. */
const FLOW = {
  "start": {
    "kind": "INÍCIO",
    "text": "Início",
    "next": {
      "Continuar": "clock"
    }
  },
  "clock": {
    "kind": "PROCESSAMENTO",
    "text": "Obter o horário do sistema e calcular o intervalo de tempo.",
    "next": {
      "Continuar": "read"
    }
  },
  "read": {
    "kind": "ENTRADA/SAÍDA",
    "text": "Realizar leitura dos sensores de temperatura e umidade.",
    "next": {
      "Continuar": "dew"
    }
  },
  "dew": {
    "kind": "PROCESSAMENTO",
    "text": "Determinar o ponto de orvalho e calcular a diferença de temperatura.",
    "next": {
      "Continuar": "condensation"
    }
  },
  "condensation": {
    "kind": "DECISÃO",
    "text": "A diferença de temperatura é menor ou igual a 2 °C?",
    "next": {
      "Sim": "alert",
      "Não": "validity"
    }
  },
  "alert": {
    "kind": "EXIBIÇÃO/SAÍDA",
    "text": "Emitir alerta de possibilidade de condensação.",
    "next": {
      "Retornar ao ciclo": "clock"
    }
  },
  "validity": {
    "kind": "PROCESSAMENTO",
    "text": "Calcular a umidade e atualizar o índice de validade do produto.",
    "next": {
      "Continuar": "critical"
    }
  },
  "critical": {
    "kind": "DECISÃO",
    "text": "O produto encontra-se em estado crítico?",
    "next": {
      "Sim": "priority",
      "Não": "stock"
    }
  },
  "priority": {
    "kind": "PROCESSAMENTO",
    "text": "Definir prioridade de expedição / Manter produto em estoque.",
    "next": {
      "Continuar": "record"
    }
  },
  "stock": {
    "kind": "PROCESSAMENTO",
    "text": "Manter produto em estoque.",
    "next": {
      "Continuar": "record"
    }
  },
  "record": {
    "kind": "PROCESSAMENTO",
    "text": "Registrar os dados localmente.",
    "next": {
      "Continuar": "send"
    }
  },
  "send": {
    "kind": "PROCESSAMENTO",
    "text": "Tentar transmitir os dados ao sistema.",
    "next": {
      "Continuar": "failure"
    }
  },
  "failure": {
    "kind": "DECISÃO",
    "text": "Houve falha na transmissão ou solicitação de consulta?",
    "next": {
      "Sim": "code",
      "Não": "confirm"
    }
  },
  "code": {
    "kind": "ENTRADA/SAÍDA",
    "text": "Exibir código de consulta.",
    "next": {
      "Continuar": "queue"
    }
  },
  "confirm": {
    "kind": "ENTRADA/SAÍDA",
    "text": "Confirmar recebimento no painel de monitoramento.",
    "next": {
      "Continuar": "clear"
    }
  },
  "queue": {
    "kind": "PROCESSAMENTO",
    "text": "Manter os dados na fila.",
    "next": {
      "Continuar": "finish"
    }
  },
  "clear": {
    "kind": "PROCESSAMENTO",
    "text": "Limpar a fila de transmissão.",
    "next": {
      "Continuar": "finish"
    }
  },
  "finish": {
    "kind": "DECISÃO",
    "text": "Foi solicitada a finalização do sistema?",
    "next": {
      "Sim": "end",
      "Não": "sleep"
    }
  },
  "end": {
    "kind": "TERMINAL",
    "text": "FIM",
    "next": {}
  },
  "sleep": {
    "kind": "PROCESSAMENTO",
    "text": "Entrar em modo de baixo consumo e aguardar o próximo ciclo.",
    "next": {
      "Retornar ao ciclo": "clock"
    }
  }
};

'use strict';
const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];

const fmt = value => new Intl.NumberFormat('pt-BR',{maximumFractionDigits:2}).format(value);
const money = value => new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(value);
// The scene explains the existing graph; it never creates or skips process edges.
const SCENE_STEPS={
 start:['Iniciar acompanhamento',null,null,'Conheça o percurso da informação. Clique em Continuar para iniciar a leitura do processo.'],
 clock:['Preparar o ciclo','control',null],
 read:['Ler temperatura e umidade','sensors',null],
 dew:['Avaliar o ponto de orvalho','control','read'],
 condensation:['Verificar risco de condensação','control',null],
 alert:['Emitir alerta','panel','alert'],
 validity:['Atualizar o índice de validade','control',null],
 critical:['Verificar a condição do produto','control',null],
 priority:['Definir a prioridade','control',null],
 stock:['Manter o produto em estoque','control',null],
 record:['Registrar as leituras','record','save'],
 send:['Transmitir as informações','panel','send'],
 failure:['Verificar transmissão ou consulta','panel',null],
 code:['Disponibilizar código de consulta','panel',null],
 confirm:['Confirmar o recebimento','panel',null],
 queue:['Preservar os dados na fila','record',null],
 clear:['Limpar a fila de transmissão','record',null],
 finish:['Verificar a finalização','control',null],
 end:['Encerrar o ciclo',null,null,'A finalização foi solicitada. Use Reiniciar para percorrer novamente o fluxo.'],
 sleep:['Aguardar o próximo ciclo','control',null]
};
const SCENE_NAMES={sensors:'Ambiente com sensores',control:'Controlador',record:'Registro / histórico',panel:'Painel de consulta e alertas'};
let current='start', history=[], chosenAnswer=null;
function renderStep(focus=false){
 const node=FLOW[current], [title,part,wire,description]=SCENE_STEPS[current];
 chosenAnswer=null;
 $('#step-kind').textContent=node.kind;
 $('#step-text').textContent=title;
 $('#step-hint').textContent=description||node.text;
 $('#scene-focus').textContent=part?'Em foco: '+SCENE_NAMES[part]:current==='end'?'Percurso encerrado':'Visão geral do sistema';
 $$('[data-scene-part]').forEach(el=>{const active=el.dataset.scenePart===part;el.classList.toggle('is-active',active);if(active)el.setAttribute('aria-current','step');else el.removeAttribute('aria-current');});
 $$('[data-scene-wire]').forEach(el=>el.classList.toggle('is-active',el.dataset.sceneWire===wire));
 const decision=node.kind==='DECISÃO';
 $('#flow-decision').disabled=!decision;
 $('#flow-decision').classList.toggle('is-visible',decision);
 $('#flow-decision').setAttribute('aria-hidden',String(!decision));
 $$('[name="flow-answer"]').forEach(input=>input.checked=false);
 $('#flow-next').disabled=decision||Object.keys(node.next).length===0;
 $('#flow-next').textContent=current==='end'?'Concluído':'Continuar →';
 $('#flow-back').disabled=history.length===0;
 $('#step-count').textContent='PASSO '+String(history.length+1).padStart(2,'0')+' · PERCURSO GUIADO';
 $$('[data-diagram-node]').forEach(el=>el.classList.toggle('selected',el.dataset.diagramNode===current));
 const reader=$('.flow-reader');reader.classList.remove('changing');void reader.offsetWidth;reader.classList.add('changing');
 if(focus)$('#step-text').focus({preventScroll:true});
}
function resetFlow(){current='start';history=[];renderStep(true);}
$('#flow-reset').addEventListener('click',resetFlow);
$('#flow-back').addEventListener('click',()=>{if(history.length){current=history.pop();renderStep(true);}});
$$('[name="flow-answer"]').forEach(input=>input.addEventListener('change',()=>{chosenAnswer=input.value;$('#flow-next').disabled=!FLOW[current].next[chosenAnswer];}));
$('#flow-next').addEventListener('click',()=>{
 const node=FLOW[current],target=node.kind==='DECISÃO'?node.next[chosenAnswer]:Object.values(node.next)[0];
 if(!target)return;
 history.push(current);current=target;renderStep(true);
});
renderStep();
let opener=null;
function openDialog(id,trigger){
 opener=trigger;
 const dialog=$(id);
 dialog.showModal();
 dialog.setAttribute('aria-modal','true');
 document.body.classList.add('no-scroll');
 requestAnimationFrame(()=>dialog.querySelector('button, a, input, [tabindex]:not([tabindex="-1"])')?.focus());
}
$$('dialog').forEach(d=>{d.querySelector('[data-close]').addEventListener('click',()=>d.close());d.addEventListener('close',()=>{document.body.classList.remove('no-scroll');opener?.focus();});d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}});});
$$('[data-menu-open]').forEach(b=>b.addEventListener('click',()=>openDialog('#menu-dialog',b)));
$$('#menu-dialog a').forEach(a=>a.addEventListener('click',()=>{$('#menu-dialog').close();const target=$(a.hash);requestAnimationFrame(()=>{const h=target.querySelector('h1,h2');if(h){h.tabIndex=-1;h.focus({preventScroll:true});}});}));
let zoom=1;
function setZoom(value){zoom=Math.max(.25,Math.min(2,value));const surface=$('#diagram-surface');surface.style.minWidth='0';surface.style.width=Math.round(1000*zoom)+'px';$('#zoom-level').value=Math.round(zoom*100)+'%';$('#zoom-out').disabled=zoom<=.25;$('#zoom-in').disabled=zoom>=2;}
function fitDiagram(){setZoom(Math.min(1,Math.max(.25,$('.diagram-viewport').clientWidth/1000)));$('.diagram-viewport').scrollTo(0,0);}
$('#open-flow').addEventListener('click',e=>{openDialog('#flow-dialog',e.currentTarget);fitDiagram();});$('#zoom-in').addEventListener('click',()=>setZoom(zoom+.2));$('#zoom-out').addEventListener('click',()=>setZoom(zoom-.2));$('#zoom-fit').addEventListener('click',fitDiagram);
const method=$$('#method-list details');
function syncMethod(){const open=method.every(d=>d.open);$('#method-toggle').textContent=open?'Recolher respostas −':'Expandir respostas +';$('#method-toggle').setAttribute('aria-expanded',String(open));}
$('#method-toggle').addEventListener('click',()=>{const open=!method.every(d=>d.open);method.forEach(d=>d.open=open);syncMethod();});method.forEach(d=>d.addEventListener('toggle',syncMethod));
// Pure calculation; mathematical consistency does not validate the premises.
function calculateROI(investment,losses,opex,months,rate){const net=losses*rate/100-opex;return{net,roi:(net*months-investment)/investment*100,payback:net>0?investment/net:null,months};}
function validateValues(values){const [i,l,o,m,r]=values;if(values.some(v=>!Number.isFinite(v)))return'Informe números válidos em todos os campos.';if(i<=0||i>1e9)return'O investimento deve ser maior que zero e até R$ 1 bilhão.';if(l<0||o<0||l>1e9||o>1e9)return'Perdas e custos devem estar entre zero e R$ 1 bilhão.';if(!Number.isInteger(m)||m<1||m>120)return'Informe um horizonte inteiro de 1 a 120 meses.';if(r<0||r>100)return'A parcela evitada deve estar entre 0% e 100%.';return null;}
const fields=['investment','losses','opex','months','rate'];let study=false;
function lossBreakdown(rate,losses){return {effective:1.8*rate/100,gross:losses*rate/100};}
function updateLossExplanation(){
 const raw=$('#rate').value.trim(),rate=Number(raw),valid=raw!==''&&Number.isFinite(rate)&&rate>=0&&rate<=100;
 $('#selected-rate').textContent=valid?fmt(rate)+'%':'—';
 $('#effective-loss').textContent=valid?fmt(lossBreakdown(rate,0).effective)+'%':'—';
 $('#avoided-meter').style.width=(valid?rate:0)+'%';
 $('#rate-slider').value=valid?rate:0;
 $('#loss-meaning').textContent=valid?fmt(rate)+'% dos 1,8% anuais de perdas de referência = '+fmt(lossBreakdown(rate,0).effective)+'% do total de referência potencialmente evitado. É uma hipótese, não um resultado medido.':'Selecione de 0% a 100% das perdas de referência para visualizar a relação.';
}
function clearResult(){['roi-value','net-value','payback-value','gross-value','annual-value'].forEach(id=>$('#'+id).textContent='—');$('#roi-status').textContent='AGUARDANDO PREMISSAS';$('#roi-description').textContent='Revise os valores e calcule o cenário.';$('#roi-value').style.color='';}
// Document sections 9.3–9.4: annual assumptions converted to monthly inputs.
function documentScenario(key){const withCost=key==='25-cost';return [4680,19800/12,withCost?1200/12:0,12,withCost?25:Number(key)];}
$('#load-study').addEventListener('click',()=>{
 const key=$('#study-scenario').value,values=documentScenario(key);
 fields.forEach((id,i)=>$('#'+id).value=values[i]);$('#acknowledge').checked=false;study=true;clearResult();updateLossExplanation();$('#roi-error').textContent='';
 $('#premise-origin').textContent='Documento revisado, seção 9.4: investimento de R$ 4.680; perdas hipotéticas de R$ 19.800/ano (R$ 1.650/mês); horizonte de 12 meses; parcela evitável de '+values[4]+'%. '+(key==='25-cost'?'Custo adicional ilustrativo de R$ 1.200/ano (R$ 100/mês).':'Custo adicional zero para reproduzir a simplificação do documento; não significa ausência de despesas.')+' Nenhuma economia foi comprovada.';
});
$('#study-scenario').addEventListener('change',()=>{$('#load-study').click();});
$('#roi-reset').addEventListener('click',()=>{$('#roi-form').reset();fields.forEach(id=>$('#'+id).value='');study=false;clearResult();updateLossExplanation();$('#roi-error').textContent='';$('#premise-origin').textContent='Preencha os valores ou carregue as referências do projeto.';});
$('#rate-slider').addEventListener('input',()=>{$('#rate').value=$('#rate-slider').value;});
$('#roi-form').addEventListener('input',e=>{clearResult();updateLossExplanation();$('#roi-error').textContent='';if(study&&e.target.id!=='acknowledge'){study=false;$('#premise-origin').textContent='Cenário de estudo alterado pelo visitante. Valores sujeitos à confirmação.';}});
$('#roi-form').addEventListener('submit',e=>{e.preventDefault();const missing=fields.find(id=>$('#'+id).value.trim()==='');if(missing){$('#roi-error').textContent='Preencha todas as premissas.';$('#'+missing).focus();return;}const values=fields.map(id=>Number($('#'+id).value)),error=validateValues(values);if(error){$('#roi-error').textContent=error;return;}if(!$('#acknowledge').checked){$('#roi-error').textContent='Confirme que compreende o caráter hipotético das premissas.';$('#acknowledge').focus();return;}const r=calculateROI(...values);$('#roi-error').textContent='';$('#roi-status').textContent='CENÁRIO SIMULADO';$('#roi-value').textContent=fmt(r.roi)+'%';$('#roi-value').style.color=r.roi<0?'#9e2c30':'';$('#gross-value').textContent=money(lossBreakdown(values[4],values[1]).gross)+'/mês';$('#net-value').textContent=money(r.net);$('#annual-value').textContent=money(r.net*12);$('#payback-value').textContent=r.payback===null?'Sem retorno':fmt(r.payback)+' meses';$('#roi-description').textContent=r.net<=0?'O benefício líquido não permite recuperar o investimento.':r.payback>r.months?'O investimento não é recuperado dentro do horizonte informado.':'O retorno calculado depende da confirmação das premissas e da resposta operacional.';const output=$('.roi-output');output.classList.remove('result-updated');void output.offsetWidth;output.classList.add('result-updated');});
updateLossExplanation();
const motionQuery=matchMedia('(prefers-reduced-motion: reduce)');let reduced=motionQuery.matches;try{const saved=localStorage.getItem('inpoint-motion');if(saved!==null)reduced=saved==='reduced';}catch{}
function motion(){document.documentElement.classList.toggle('motion-off',reduced);$('#motion-toggle').textContent=reduced?'Ativar movimento':'Reduzir movimento';$('#motion-toggle').setAttribute('aria-pressed',String(reduced));}
$('#motion-toggle').addEventListener('click',()=>{reduced=!reduced;motion();try{localStorage.setItem('inpoint-motion',reduced?'reduced':'full');}catch{}});motionQuery.addEventListener('change',e=>{reduced=e.matches;motion();});motion();
let scheduled=false;function progress(){const total=document.documentElement.scrollHeight-innerHeight;$('#read-progress').style.width=(total>0?scrollY/total*100:0)+'%';scheduled=false;}window.addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(progress);}},{passive:true});progress();
if('IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){$$('.desktop-nav .nav-link').forEach(a=>{if(a.hash==='#'+e.target.id)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});}}),{rootMargin:'-15% 0px -60% 0px'});$$('main>section').forEach(s=>observer.observe(s));}
let printState=null;window.addEventListener('beforeprint',()=>{printState=$$('details').map(d=>[d,d.open]);printState.forEach(([d])=>d.open=true);});window.addEventListener('afterprint',()=>{printState?.forEach(([d,open])=>d.open=open);printState=null;syncMethod();});
// Explanatory indicators only: no generated readings or simulated results.
const indicatorCopy={
 temperature:['Temperatura','A leitura da temperatura do ambiente integra o registro das condições de armazenamento e a avaliação de desvios.'],
 humidity:['Umidade','A leitura da umidade relativa complementa o acompanhamento ambiental. O fluxo prevê registro e alertas conforme as condições avaliadas.']
};
$$('[data-indicator]').forEach(button=>button.addEventListener('click',()=>{
  const key=button.dataset.indicator,copy=indicatorCopy[key];
  $$('[data-indicator]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  $$('[data-signal-drawing]').forEach(g=>g.classList.toggle('selected',g.dataset.signalDrawing===key));
  const explanation=$('#indicator-explanation');
  explanation.classList.remove('content-updated');
  $('#indicator-title').textContent=copy[0];$('#indicator-text').textContent=copy[1];
  void explanation.offsetWidth;explanation.classList.add('content-updated');
}));

// Expanded Canvas reads the exact existing text; source content stays in one place.
const canvasBlocks=$$('.canvas-cell');let canvasIndex=0;
function renderCanvas(index){
 canvasIndex=Math.max(0,Math.min(canvasBlocks.length-1,index));
 const block=canvasBlocks[canvasIndex];
 $('#canvas-dialog-title').textContent=block.querySelector('h3').textContent;
 $('#canvas-dialog-copy').textContent=block.querySelector('p').textContent;
 $('#canvas-dialog-number').textContent=String(canvasIndex+1).padStart(2,'0');
 $('#canvas-position').textContent=(canvasIndex+1)+' / '+canvasBlocks.length;
 $('#canvas-prev').disabled=canvasIndex===0;
 $('#canvas-next').disabled=canvasIndex===canvasBlocks.length-1;
}
$$('[data-canvas-open]').forEach(button=>button.addEventListener('click',()=>{renderCanvas(Number(button.dataset.canvasOpen));openDialog('#canvas-dialog',button);}));
$('#canvas-prev').addEventListener('click',()=>renderCanvas(canvasIndex-1));
$('#canvas-next').addEventListener('click',()=>renderCanvas(canvasIndex+1));
// Melhorias de feedback sem alterar a lógica dos cálculos.
$('#roi-form').addEventListener('invalid', event => {
  event.target.setAttribute('aria-invalid', 'true');
}, true);
$('#roi-form').addEventListener('input', event => {
  if (event.target.matches('input, select')) event.target.removeAttribute('aria-invalid');
});
// Mantém o teclado dentro do diálogo aberto e permite fechar com Escape.
document.addEventListener('keydown', event => {
  const dialog = document.querySelector('dialog[open]');
  if (!dialog) return;
  if (event.key === 'Escape') {
    event.preventDefault();
    dialog.close();
    return;
  }
  if (event.key !== 'Tab') return;
  const focusable = [...dialog.querySelectorAll('button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])')].filter(el => !el.disabled && el.offsetParent !== null);
  if (!focusable.length) return;
  const first = focusable[0], last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
});

// Clarifies the conceptual status and gives visitors a quick overview before
// asking them to follow the complete guided flow.
function addAuditRefinements(){
  const svgIcon=(name)=>{
    const paths={
      right:'M2 8h12M9 3l5 5-5 5',
      left:'M14 8H2m5-5L2 8l5 5',
      up:'M8 14V2m-5 5 5-5 5 5',
      external:'M5 11 12 4M7 4h5v5',
      close:'M3 3l10 10M13 3 3 13',
      menu:'M2 4h12M2 8h12M2 12h12',
      reset:'M13 6a5.5 5.5 0 1 0 1 4',
      plus:'M8 2v12M2 8h12',
      minus:'M2 8h12'
    };
    const el=document.createElementNS('http://www.w3.org/2000/svg','svg');
    el.setAttribute('viewBox','0 0 16 16'); el.setAttribute('aria-hidden','true'); el.classList.add('inline-icon');
    const path=document.createElementNS('http://www.w3.org/2000/svg','path');
    path.setAttribute('d',paths[name]); path.setAttribute('fill','none'); path.setAttribute('stroke','currentColor'); path.setAttribute('stroke-width','1.5'); path.setAttribute('stroke-linecap','round'); path.setAttribute('stroke-linejoin','round');
    el.appendChild(path); return el;
  };
  const appendIcon=(selector,name)=>{const el=$(selector);if(el&&!el.querySelector('.inline-icon'))el.append(svgIcon(name));};
  const replaceButton=(selector,label,name)=>{const el=$(selector);if(el&&!el.querySelector('.inline-icon')){el.textContent=label+' ';el.append(svgIcon(name));}};
  replaceButton('.menu-trigger','', 'menu');
  replaceButton('#flow-back','Etapa anterior','left');
  replaceButton('#flow-next','Continuar','right');
  replaceButton('#flow-reset','Reiniciar','reset');
  replaceButton('#open-flow','Ver fluxograma completo','external');
  replaceButton('#canvas-prev','Anterior','left');
  replaceButton('#canvas-next','Próximo','right');
  replaceButton('#zoom-out','', 'minus');
  replaceButton('#zoom-in','', 'plus');
  $$('[data-close]').forEach(el=>{if(!el.querySelector('.inline-icon')){el.textContent='';el.append(svgIcon('close'));}});
  const heroArrow=$('.hero-cta span[aria-hidden]');
  if(heroArrow&&!heroArrow.querySelector('.inline-icon')){heroArrow.textContent='';heroArrow.append(svgIcon('right'));}
  const homeLink=$('a[href="#projeto"].text-button');
  if(homeLink&&!homeLink.querySelector('.inline-icon')){homeLink.textContent='Voltar ao início ';homeLink.append(svgIcon('up'));}
  $$('.canvas-expand > span').forEach(el=>{if(!el.querySelector('.inline-icon')){el.textContent='';el.append(svgIcon('external'));}});
  const refreshFlowIcon=()=>requestAnimationFrame(()=>{
    const next=$('#flow-next');
    if(!next||next.querySelector('.inline-icon'))return;
    if(next.disabled&&next.textContent.trim()==='Concluído')return;
    replaceButton('#flow-next','Continuar','right');
  });
  $('#flow-next')?.addEventListener('click',refreshFlowIcon);
  $('#flow-back')?.addEventListener('click',refreshFlowIcon);
  $('#flow-reset')?.addEventListener('click',refreshFlowIcon);

}
addAuditRefinements();

// Progressive enhancement for motion: content remains visible without JS.
function initializePremiumMotion(){
  const root=document.documentElement;
  const header=$('.site-header');
  const syncHeader=()=>header?.classList.toggle('is-scrolled',scrollY>24);
  syncHeader();
  window.addEventListener('scroll',syncHeader,{passive:true});

  const revealGroups=[
    ['.section-heading, .section-label, .method-heading, .flow-summary, .roi-layout, .team-grid > div:first-child',0],
    ['.canvas-cell',60],
    ['.method-row',45],
    ['.team-profile',65]
  ];
  const targets=[];
  revealGroups.forEach(([selector,step])=>{
    $$(selector).forEach((element,index)=>{
      element.classList.add('reveal-item');
      element.style.setProperty('--reveal-delay',Math.min(index*step,360)+'ms');
      targets.push(element);
    });
  });

  if(motionQuery.matches||!('IntersectionObserver'in window)){
    targets.forEach(element=>element.classList.add('is-revealed'));
    return;
  }
  root.classList.add('reveal-ready');
  const revealObserver=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(!entry.isIntersecting)return;
      entry.target.classList.add('is-revealed');
      revealObserver.unobserve(entry.target);
    });
  },{threshold:.12,rootMargin:'0px 0px -7%'});
  targets.forEach(element=>revealObserver.observe(element));
}
initializePremiumMotion();
