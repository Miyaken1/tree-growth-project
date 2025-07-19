
const API_URL = 'https://script.google.com/macros/s/AKfycbwmeveXSc0ihOnOgQhtX5Mtaj1QWiATUlGXEIJwlBAgl_yGe7ULgjpVfYwC8IWiOS4/exec';

// modal handling
const modal = document.getElementById('pwModal');
const pwInput = document.getElementById('pwInput');
const pwError = document.getElementById('pwError');
document.getElementById('pwSubmit').addEventListener('click', async ()=>{
  const pw = pwInput.value;
  const hash = await digestSHA256(pw);
  const ok = await fetchConfig(hash);
  if(ok) {
    modal.classList.add('hidden');
    document.getElementById('adminContent').classList.remove('hidden');
  } else {
    pwError.classList.remove('hidden');
  }
});

async function digestSHA256(msg) {
  const enc = new TextEncoder().encode(msg);
  const hash = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(hash)).map(b=>b.toString(16).padStart(2,'0')).join('');
}

let pwHash='';
let configData;
async function fetchConfig(hash) {
  try {
    const res = await fetch(`${API_URL}?action=config&pw=${hash}`);
    if(res.status!==200) return false;
    pwHash = hash;
    configData = await res.json();
    populateTables();
    return true;
  } catch(e) {return false;}
}

function populateTables() {
  const thresholdsTbody = document.querySelector('#thresholdTable tbody');
  thresholdsTbody.innerHTML='';
  configData.thresholds.forEach((th,i)=>{
    const tr=document.createElement('tr');
    tr.innerHTML=`<td class="border px-2">${i+1}</td><td class="border px-2"><input type="number" value="${th}" class="border p-1 w-full"></td>`;
    thresholdsTbody.appendChild(tr);
  });

  const imageTbody = document.querySelector('#imageTable tbody');
  imageTbody.innerHTML='';
  configData.imageUrls.forEach((url,i)=>{
    const tr=document.createElement('tr');
    tr.innerHTML=\`<td class="border px-2">${i+1}</td><td class="border px-2"><input type="url" value="\${url}" class="border p-1 w-full"></td>\`;
    imageTbody.appendChild(tr);
  });

  document.getElementById('periodStart').value = configData.period.start;
  document.getElementById('periodEnd').value = configData.period.end;
}

// add threshold row
document.getElementById('addThreshold').addEventListener('click',()=>{
  const tbody=document.querySelector('#thresholdTable tbody');
  const idx=tbody.children.length+1;
  const tr=document.createElement('tr');
  tr.innerHTML=\`<td class="border px-2">\${idx}</td><td class="border px-2"><input type="number" class="border p-1 w-full"></td>\`;
  tbody.appendChild(tr);
});

// save
document.getElementById('saveBtn').addEventListener('click', async ()=>{
  const thresholds=[...document.querySelectorAll('#thresholdTable tbody input')].map(e=>parseInt(e.value||'0',10));
  const imageUrls=[...document.querySelectorAll('#imageTable tbody input')].map(e=>e.value);
  const period={start:document.getElementById('periodStart').value,end:document.getElementById('periodEnd').value};
  const body={thresholds,imageUrls,period};
  await fetch(`${API_URL}?action=config&pw=${pwHash}`,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify(body)
  });
  alert('保存しました');
});
