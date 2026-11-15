const menu=document.querySelector('.menu-toggle'),nav=document.querySelector('#navigation');
function closeMenu(){menu?.setAttribute('aria-expanded','false');nav?.classList.remove('open')}
menu?.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));nav?.classList.toggle('open',open)});
nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()});
document.querySelectorAll('.collection-card img').forEach(img=>{img.srcset=img.src.replace('960.webp','480.webp')+' 480w, '+img.src+' 960w';img.sizes='(max-width:700px) 88vw, 29vw'});
const slides={1:'Decorative dark framed conservatory with arched glazing',2:'Curved green conservatory with classical glazing details',5:'Green conservatory with a pitched glazed roof',6:'Contemporary dark framed conservatory beside a garden terrace'};
document.querySelectorAll('[data-slide]').forEach(button=>button.addEventListener('click',()=>{
 const hero=document.querySelector('.hero-image');if(!hero)return;const id=button.dataset.slide;
 hero.src=`assets/conservatory-${id.padStart(2,'0')}-1600.webp`;hero.alt=slides[id]||'Glazed conservatory';
 document.querySelectorAll('[data-slide]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button))});
}));
document.querySelectorAll('[data-case-filter]').forEach(button=>button.addEventListener('click',()=>{
 document.querySelectorAll('[data-case-filter]').forEach(b=>{b.classList.toggle('selected',b===button);b.setAttribute('aria-pressed',String(b===button))});
 document.querySelectorAll('.case-card').forEach(card=>{card.hidden=button.dataset.caseFilter!=='all'&&card.dataset.category!==button.dataset.caseFilter});
}));
const gallery=document.querySelector('#gallery-dialog'),images=[...document.querySelectorAll('[data-viewer]')];let current=0;
function showImage(index){if(!images.length)return;current=(index+images.length)%images.length;const item=images[current],img=gallery.querySelector('#gallery-image');img.src=item.dataset.viewer;img.alt=item.dataset.caption;gallery.querySelector('#gallery-caption').textContent=item.dataset.caption}
images.forEach((button,i)=>button.addEventListener('click',()=>{showImage(i);gallery?.showModal();document.body.classList.add('modal-open')}));
gallery?.querySelector('.gallery-prev')?.addEventListener('click',()=>showImage(current-1));
gallery?.querySelector('.gallery-next')?.addEventListener('click',()=>showImage(current+1));
gallery?.addEventListener('keydown',e=>{if(e.key==='ArrowLeft')showImage(current-1);if(e.key==='ArrowRight')showImage(current+1)});
if(images.length<2)gallery?.querySelectorAll('.gallery-prev,.gallery-next').forEach(b=>b.hidden=true);
document.querySelectorAll('dialog').forEach(dialog=>{dialog.querySelector('[data-close]')?.addEventListener('click',()=>dialog.close());dialog.addEventListener('close',()=>document.body.classList.remove('modal-open'));dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}})});
function enquiryText(form){
 const d=new FormData(form);
 return `MARLA GARDEN — PROJECT ENQUIRY\n\nName: ${d.get('name')||''}\nEmail: ${d.get('email')||''}\nLondon postcode: ${d.get('postcode')||''}\nDesign reference: ${d.get('model')||'Still exploring'}\nDesign direction: ${d.get('style')}\nApproximate dimensions: ${d.get('dimensions')||'To be discussed'}\n\nProject ideas\n${d.get('brief')||''}\n`;
}
const enquiryForm=document.querySelector('#enquiry-form');
function revealBrief(){
 const panel=document.querySelector('#brief-copy'),text=document.querySelector('#brief-text');
 if(!panel||!text||!enquiryForm)return;
 text.value=enquiryText(enquiryForm);panel.hidden=false;text.focus();text.select();
}
document.querySelector('#view-brief')?.addEventListener('click',revealBrief);
enquiryForm?.addEventListener('input',()=>{const text=document.querySelector('#brief-text');if(text&&!document.querySelector('#brief-copy').hidden)text.value=enquiryText(enquiryForm)});
enquiryForm?.addEventListener('submit',async e=>{
 e.preventDefault();const form=e.currentTarget;
 if(form.dataset.sending==='true'||!form.reportValidity())return;
 const status=document.querySelector('#form-status'),button=form.querySelector('[type="submit"]');
 const files=[...form.elements.attachments.files];
 if(files.reduce((n,f)=>n+f.size,0)>25*1024*1024){status.textContent='Please keep attachments under 25 MB in total, or email them separately.';return;}
 const data=new FormData();data.append('fi-sender-fullName',form.elements.name.value.trim());data.append('fi-sender-email',form.elements.email.value.trim());
 data.append('fi-text-brand','Marla Garden');data.append('fi-text-message',enquiryText(form));
 files.forEach(file=>data.append('fi-file-attachments[]',file));
 form.dataset.sending='true';button.disabled=true;const label=button.innerHTML;button.textContent='Sending…';status.textContent='Sending your enquiry…';
 try{
  const response=await fetch(form.dataset.endpoint,{method:'POST',headers:{Accept:'application/json'},body:data,signal:AbortSignal.timeout(30000)});
  const result=await response.json();
  if(!response.ok||result.success!==true)throw new Error('submission failed');
  status.textContent='Thank you. Your Marla Garden enquiry has been received.';
  form.reset();document.querySelector('#brief-copy').hidden=true;
  updateWhatsAppBrief();
 }catch(error){
  status.textContent=error.name==='TimeoutError'?'We could not confirm delivery. Your details are still here. Please contact us by email or WhatsApp before sending again.':'Your enquiry could not be confirmed. Your details are still here. Please try again or contact us by email or WhatsApp.';
 }finally{form.dataset.sending='false';button.disabled=false;button.innerHTML=label;}
});
const sourceMenu=document.querySelector('[data-garden-menu]'),sourceNav=document.querySelector('#garden-mobile-nav');
function closeSourceMenu(){sourceMenu?.setAttribute('aria-expanded','false');if(sourceNav)sourceNav.hidden=true}
sourceMenu?.addEventListener('click',()=>{const open=sourceMenu.getAttribute('aria-expanded')!=='true';sourceMenu.setAttribute('aria-expanded',String(open));sourceNav.hidden=!open});
sourceNav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeSourceMenu));
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeSourceMenu()});
const modelData=document.querySelector('#model-data'),modelField=document.querySelector('#model-reference');
if(modelData&&modelField){try{
 const names=JSON.parse(modelData.textContent),selected=new URLSearchParams(location.search).get('model');
 if(selected&&Object.hasOwn(names,selected)){
  const model=names[selected];modelField.value=model.title;
  if(enquiryForm)enquiryForm.elements.style.value=model.direction;
  const whatsapp=document.querySelector('#project-whatsapp');
  if(whatsapp){whatsapp.href='https://wa.me/447423290778?text='+encodeURIComponent('Hello, I would like to discuss the '+model.title+' design direction for a Marla Garden project.');whatsapp.textContent='Discuss this design on WhatsApp ↗'}
 }
}catch{}}

// Keep the WhatsApp alternative in sync with the visitor's enquiry.
function updateWhatsAppBrief(){
 const whatsapp=document.querySelector('#project-whatsapp');
 if(!whatsapp||!enquiryForm)return;
 whatsapp.href='https://wa.me/447423290778?text='+encodeURIComponent(enquiryText(enquiryForm));
}
enquiryForm?.addEventListener('input',updateWhatsAppBrief);
enquiryForm?.addEventListener('change',updateWhatsAppBrief);
document.querySelectorAll('.nav-group-toggle').forEach(b=>b.addEventListener('click',()=>{const g=b.parentElement,o=!g.classList.contains('open');g.classList.toggle('open',o);b.setAttribute('aria-expanded',String(o))}));
document.addEventListener('click',e=>{document.querySelectorAll('.nav-group.open').forEach(g=>{if(!g.contains(e.target)){g.classList.remove('open');g.querySelector('.nav-group-toggle')?.setAttribute('aria-expanded','false')}})});
