/* Joint health risk assessment page. Scores on the device with the shared
   JHRA_01 engine (jhra-01.js, generated from app/src/engine). Questions and
   options are rendered from the engine's own definition, so the page can
   never ask something the engine does not score.

   Storage:
   - On this device (opt-in): date, score, tier, the seven area scores and
     flag codes only, never the answers. localStorage key mm-jhra-history-v1.
   - Account (signed in, opt-in): answers are written to
     assessment_responses for a JHRA_01 session; the complete-assessment
     edge function rescores the stored answers and writes the result once.
   Nothing is sent while answering. */
(function () {
  'use strict';
  const J = window.JHRA;
  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const STORE = 'mm-jhra-history-v1';
  const PENDING = 'mm-jhra-pending-v1';
  const Q = Object.fromEntries([...J.JHRA_SAFETY, ...J.JHRA_QUESTIONS].map(q => [q.field, q]));
  const STEPS = ['start', 'safety', 'about', 'A', 'B', 'C', 'D', 'E', 'F', 'G'];
  const TIER_CLASS = { Maintain: 'jh-tier-1', Build: 'jh-tier-2', Rebuild: 'jh-tier-3', Guided: 'jh-tier-4' };

  /* ── evidence: every claim carries a grade and a resolvable source ── */
  const SRC = {
    poulsen: ['Poulsen 2019, Br J Sports Med', 'https://pubmed.ncbi.nlm.nih.gov/31072840/', 'PMID 31072840'],
    snoeker: ['Snoeker 2020, Br J Sports Med', 'https://pubmed.ncbi.nlm.nih.gov/31826861/', 'PMID 31826861'],
    hart: ['Hart 2010, J Athl Train', 'https://pubmed.ncbi.nlm.nih.gov/20064053/', 'PMID 20064053'],
    jiang: ['Jiang 2012, Joint Bone Spine', 'https://pubmed.ncbi.nlm.nih.gov/21803633/', 'PMID 21803633'],
    louati: ['Louati 2015, RMD Open', 'https://pubmed.ncbi.nlm.nih.gov/26535137/', 'PMID 26535137'],
    mets: ['Andrea 2026, Osteoarthr Cartil Open', 'https://pubmed.ncbi.nlm.nih.gov/41630777/', 'PMID 41630777'],
    oiestad: ['Øiestad 2015, Osteoarthritis Cartilage', 'https://pubmed.ncbi.nlm.nih.gov/25450853/', 'PMID 25450853'],
    ewgsop2: ['Cruz-Jentoft 2019, Age Ageing (EWGSOP2)', 'https://pubmed.ncbi.nlm.nih.gov/30312372/', 'PMID 30312372'],
    cdc: ['CDC adult activity guidelines', 'https://www.cdc.gov/physical-activity-basics/guidelines/adults.html', 'guideline'],
    oarsi: ['OARSI performance-based tests manual', 'https://oarsi.org/sites/oarsi/files/docs/2013/manual.pdf', 'guideline'],
    araujo: ['Araújo 2022, Br J Sports Med', 'https://pubmed.ncbi.nlm.nih.gov/35728834/', 'PMID 35728834'],
    alentorn: ['Alentorn-Geli 2017, J Orthop Sports Phys Ther', 'https://pubmed.ncbi.nlm.nih.gov/28504066/', 'PMID 28504066'],
    messier: ['Messier 2005, Arthritis Rheum', 'https://pubmed.ncbi.nlm.nih.gov/15986358/', 'PMID 15986358'],
    wills: ['Wills 2012, Ann Rheum Dis', 'https://pubmed.ncbi.nlm.nih.gov/21979003/', 'PMID 21979003'],
    nice: ['NICE NG226 osteoarthritis guideline', 'https://www.ncbi.nlm.nih.gov/books/NBK588843/', 'guideline'],
    glp1lean: ['GLP-1 lean-mass meta-analysis 2026, Int J Obes', 'https://www.nature.com/articles/s41366-026-02118-y', 'DOI 10.1038/s41366-026-02118-y'],
    step9: ['Bliddal 2024, N Engl J Med (STEP 9)', 'https://pubmed.ncbi.nlm.nih.gov/39476339/', 'PMID 39476339'],
    mcalindon: ['McAlindon 2017, JAMA', 'https://pubmed.ncbi.nlm.nih.gov/28510679/', 'PMID 28510679'],
    kompel: ['Kompel 2019, Radiology', 'https://pubmed.ncbi.nlm.nih.gov/31617798/', 'PMID 31617798'],
    hayat: ['Hayat 2020, Cleve Clin J Med', 'https://pubmed.ncbi.nlm.nih.gov/32605977/', 'PMID 32605977'],
    alves: ['Alves 2019, Eur J Clin Pharmacol', 'https://pubmed.ncbi.nlm.nih.gov/31270563/', 'PMID 31270563'],
    lapidari: ['Lapidari 2026, J Natl Compr Canc Netw', 'https://pubmed.ncbi.nlm.nih.gov/41698329/', 'PMID 41698329'],
    dpp4: ['FDA prescribing information, sitagliptin (section 5.6)', 'https://www.accessdata.fda.gov/drugsatfda_docs/label/2022/021995s050lbl.pdf', 'FDA label'],
    ctt: ['Cholesterol Treatment Trialists 2022, Lancet', 'https://pubmed.ncbi.nlm.nih.gov/36049498/', 'PMID 36049498'],
    xu: ['Xu 2025, BMJ Glob Health', 'https://pubmed.ncbi.nlm.nih.gov/40037907/', 'PMID 40037907']
  };
  const GRADE = { E: ['established', 'Established'], P: ['promising', 'Promising'], U: ['bridge', 'Unproven-Bridge'] };

  const AREA = {
    A: { msg: 'Past injury raises long-term risk, but strong, well-controlled muscles can help protect the joint.',
      actions: ['Targeted thigh (quadriceps) and hip strengthening.', 'Balance and landing-control practice.', 'Ask a physical therapist to check for a muscle-activation deficit that can outlast pain.'],
      ev: [['After an ACL, meniscus or combined injury, the odds of knee osteoarthritis are about 4 to 6 times higher.', 'E', 'poulsen'],
           ['The extra risk after a knee injury persists for at least 19 years.', 'E', 'snoeker'],
           ['After knee injury the quadriceps often cannot fully switch on, and this can affect both legs.', 'E', 'hart']] },
    B: { msg: 'Joint health depends on whole-body metabolic health.',
      actions: ['Review your blood pressure, blood sugar and cholesterol results with your physician.', 'If your BMI is 30 or more, aim for gradual weight loss of 5 to 10% with strength training.', 'Short walks after meals.'],
      ev: [['Each 5-point rise in BMI is linked with about 35% higher risk of knee osteoarthritis.', 'E', 'jiang'],
           ['People with diabetes have higher odds of osteoarthritis.', 'P', 'louati'],
           ['Metabolic syndrome is linked with new osteoarthritis beyond body weight alone.', 'P', 'mets']] },
    C: { msg: 'Muscle is the joint\'s shock absorber.',
      actions: ['Strength training on 2 or more days a week for all major muscle groups.', 'Progressive leg loading: sit-to-stands, step-ups, then added weight.', 'If grip strength is low, ask about a sarcopenia check.'],
      ev: [['Weak knee-extensor muscles are linked with about 1.65 times the odds of symptomatic knee osteoarthritis.', 'E', 'oiestad'],
           ['Adults should do muscle-strengthening activity on at least 2 days a week.', 'E', 'cdc'],
           ['Grip below 27 kg (men) or 16 kg (women) signals probable sarcopenia.', 'E', 'ewgsop2']] },
    D: { msg: 'Function is the clearest everyday sign of joint capacity.',
      actions: ['Chair-stand and step-up practice, 2 to 3 sessions a week.', 'Single-leg balance practice next to a counter.', 'Build toward 150 minutes a week of moderate activity.'],
      ev: [['The 30-second chair stand and stair tests are recommended for adults with hip or knee osteoarthritis.', 'E', 'oarsi'],
           ['Being unable to stand on one leg for 10 seconds in midlife was linked with higher all-cause mortality; its link to joint outcomes is not yet tested.', 'U', 'araujo'],
           ['Recreational runners had less hip and knee osteoarthritis than sedentary people.', 'P', 'alentorn']] },
    E: { msg: 'The direction and the quality of weight change both matter.',
      actions: ['Pair any weight loss with strength training 2 or more days a week and enough protein.', 'If you lost weight without trying, ask your physician to review it.', 'Track your chair-stand count as you lose weight; a falling count suggests muscle loss.'],
      ev: [['Each pound lost removes about 4 pounds of load from the knee with each step.', 'E', 'messier'],
           ['Any weight loss helps joints, and 10% is likely better than 5%.', 'E', 'nice'],
           ['Higher BMI from early adulthood is linked with knee osteoarthritis by age 53.', 'P', 'wills'],
           ['About a quarter or more of weight lost on GLP-1 medications can be lean mass.', 'P', 'glp1lean']] },
    F: { msg: 'Some medications affect tendons, bone or joints. Never stop a medication without advice.',
      actions: ['Bring this summary to the clinician who prescribes your medications.', 'Ask whether bone-health screening fits your situation if you take long-term steroid tablets.', 'If you have repeated joint injections, ask about alternatives such as exercise therapy.'],
      ev: [['Steroid injections every 3 months for 2 years caused more cartilage loss than saline, with no extra pain relief.', 'E', 'mcalindon'],
           ['Fast joint damage has been reported after some hip and knee steroid injections.', 'P', 'kompel'],
           ['Long-term steroid tablets at 2.5 mg a day or more for 3 months raise fracture risk.', 'E', 'hayat'],
           ['Fluoroquinolone antibiotics raise the risk of Achilles tendon injury.', 'E', 'alves'],
           ['Most people taking aromatase inhibitors report joint pain.', 'E', 'lapidari'],
           ['DPP-4 inhibitors can cause severe joint pain that eases after stopping.', 'E', 'dpp4'],
           ['In people with obesity and knee osteoarthritis, semaglutide reduced knee pain more than placebo.', 'E', 'step9'],
           ['Most muscle aches in people taking statins are not caused by the statin.', 'E', 'ctt']] },
    G: { msg: 'Symptoms guide how fast to progress.',
      actions: ['Use a pain-monitoring rule: pain during exercise that stays at or below 5 out of 10 and settles by the next morning.', 'Check the joint the next morning before increasing load.', 'Morning stiffness of 30 minutes or more with swelling is worth a medical evaluation.'],
      ev: [['Using next-morning symptoms to pace loading is a clinical rule of thumb used in physical therapy, not a tested cut point.', 'U', 'nice']] }
  };
  const CONTEXT_EV = ['Osteoarthritis rises in women around and after menopause.', 'P', 'xu'];

  const evItem = ([claim, g, key]) => {
    const s = SRC[key];
    return `<li>${esc(claim)} <span class="jh-grade ${GRADE[g][0]}">${GRADE[g][1]}</span> <a href="${s[1]}" target="_blank" rel="noopener">${esc(s[0])}</a> (${esc(s[2])})</li>`;
  };

  /* ── rendering questions from the engine definition ── */
  function renderQuestion(q) {
    const multi = q.type === 'multi';
    const opts = q.options.map(o => `<label class="jh-opt"><input type="${multi ? 'checkbox' : 'radio'}" name="${q.field}" value="${esc(o.code)}"><span class="t">${esc(o.label)}</span></label>`).join('');
    const yn = q.role === 'safety';
    const hint = q.help && q.field !== 'jh_glp1' && q.field !== 'jh_postmenopausal' ? `<span class="hint">${esc(q.help)}</span>` : '';
    const opt = q.optional && q.field !== 'jh_postmenopausal' ? ' <span class="hint">Optional.</span>' : '';
    return `<fieldset class="jh-q${yn ? ' jh-yn' : ''}" data-field="${q.field}"><legend>${esc(q.prompt)}</legend>${hint}${opt}<div class="jh-opt-grid${q.options.length > 4 && !yn ? ' one' : ''}">${opts}</div></fieldset>`;
  }
  $$('[data-render]').forEach(el => {
    const keys = el.dataset.render === 'safety' ? J.JHRA_SAFETY.map(q => q.field) : el.dataset.render.split(',');
    el.innerHTML = keys.map(k => renderQuestion(Q[k])).join('');
  });
  // "None of these" is exclusive in the record-only medication list
  document.addEventListener('change', e => {
    const t = e.target;
    if (t.name === 'jh_other_meds' && t.checked) {
      $$('input[name=jh_other_meds]').forEach(i => { if (t.value === 'none' ? i !== t : i.value === 'none') i.checked = false; });
    }
  });

  /* ── injury log ── */
  const opt = (list, blank) => (blank ? `<option value="">${blank}</option>` : '') + list.map(o => `<option value="${o.code}">${esc(o.label)}</option>`).join('');
  let injuryN = 0;
  function addInjury() {
    const n = $$('.jh-inj').length;
    if (n >= J.JHRA_MAX_INJURIES) return;
    const id = 'inj' + (++injuryN);
    const el = document.createElement('div');
    el.className = 'jh-inj';
    el.dataset.id = id;
    el.innerHTML = `
      <div class="jh-inj-head"><h3>Injury <span class="num"></span></h3><button type="button" class="mmm-btn mmm-btn-ghost" data-remove>Remove</button></div>
      <div class="jh-row">
        <div><label class="jh-small-label" for="${id}-joint">Joint</label><select id="${id}-joint" data-k="joint">${opt(J.JHRA_INJURY_JOINTS, 'Choose')}</select></div>
        <div><label class="jh-small-label" for="${id}-side">Side</label><select id="${id}-side" data-k="side">${opt(J.JHRA_INJURY_SIDES, 'Choose')}</select></div>
      </div>
      <div class="full"><label class="jh-small-label" for="${id}-type">Injury type</label><select id="${id}-type" data-k="type">${opt(J.JHRA_INJURY_TYPES, 'Choose')}</select></div>
      <div class="jh-row">
        <div><label class="jh-small-label" for="${id}-years">Years ago (optional)</label><input type="number" id="${id}-years" data-k="years_ago" inputmode="numeric" min="0" max="100" step="1"></div>
        <div><label class="jh-small-label" for="${id}-tx">Treatment (optional)</label><select id="${id}-tx" data-k="treatment">${opt(J.JHRA_INJURY_TREATMENTS, 'Choose')}</select></div>
      </div>
      <label class="jh-check"><input type="checkbox" data-k="ongoing"> That joint still swells, gives way or catches</label>
      <label class="jh-check"><input type="checkbox" data-k="rehab_incomplete"> I did not have, or did not finish, rehabilitation</label>`;
    $('#injuries').appendChild(el);
    $('[data-remove]', el).addEventListener('click', () => { el.remove(); numberInjuries(); });
    numberInjuries();
    $('select', el).focus();
  }
  function numberInjuries() {
    const list = $$('.jh-inj');
    list.forEach((el, i) => { $('.num', el).textContent = String(i + 1); });
    $('#addInjury').hidden = list.length >= J.JHRA_MAX_INJURIES;
    $('#injuryCount').textContent = `${list.length} of ${J.JHRA_MAX_INJURIES} injuries listed.`;
  }
  $('#addInjury').addEventListener('click', addInjury);
  $$('input[name=ui_has_injury]').forEach(r => r.addEventListener('change', () => {
    const yes = r.value === 'yes' && r.checked;
    $('#injuryList').hidden = !yes;
    if (yes && !$$('.jh-inj').length) addInjury();
  }));
  function readInjuries() {
    return $$('.jh-inj').map(el => {
      const v = k => $(`[data-k=${k}]`, el);
      const years = v('years_ago').value.trim();
      const o = { type: v('type').value, joint: v('joint').value, side: v('side').value,
        ongoing: v('ongoing').checked, rehab_incomplete: v('rehab_incomplete').checked };
      if (years !== '') o.years_ago = Number(years);
      if (v('treatment').value) o.treatment = v('treatment').value;
      return o;
    });
  }

  /* ── units and BMI ── */
  $$('input[name=ui_units]').forEach(r => r.addEventListener('change', () => {
    const us = $('input[name=ui_units]:checked').value === 'us';
    $('#units-us').hidden = !us; $('#units-metric').hidden = us; showBmi();
  }));
  function heightWeight() {
    const us = $('input[name=ui_units]:checked').value === 'us';
    const num = id => { const s = $(id).value.trim(); return s === '' ? NaN : Number(s); };
    let cm, kg;
    if (us) {
      const ft = num('#h_ft'), inch = $('#h_in').value.trim() === '' ? 0 : num('#h_in'), lb = num('#w_lb');
      cm = Math.round((ft * 12 + inch) * 2.54 * 10) / 10; kg = Math.round(lb * 0.45359237 * 10) / 10;
    } else { cm = num('#h_cm'); kg = num('#w_kg'); }
    return { cm, kg };
  }
  function showBmi() {
    const { cm, kg } = heightWeight();
    const ok = cm >= 120 && cm <= 230 && kg >= 30 && kg <= 300;
    $('#bmiOut').textContent = ok ? `Your BMI: ${(Math.round(kg / ((cm / 100) ** 2) * 10) / 10).toFixed(1)}` : '';
  }
  ['#h_ft', '#h_in', '#w_lb', '#h_cm', '#w_kg'].forEach(id => $(id).addEventListener('input', showBmi));

  /* ── answers ── */
  const radio = f => { const el = $(`input[name="${f}"]:checked`); return el ? el.value : undefined; };
  function collect() {
    const a = {};
    J.JHRA_SAFETY.forEach(q => { a[q.field] = radio(q.field); });
    const age = $('#jh_age').value.trim();
    a.jh_age = age === '' ? undefined : Number(age);
    a.jh_sex = radio('jh_sex');
    if (needsMenopause()) a.jh_postmenopausal = radio('jh_postmenopausal');
    a.jh_injuries = radio('ui_has_injury') === 'yes' ? readInjuries() : (radio('ui_has_injury') === 'no' ? [] : undefined);
    const { cm, kg } = heightWeight();
    a.jh_height_cm = Number.isFinite(cm) ? cm : undefined;
    a.jh_weight_kg = Number.isFinite(kg) ? kg : undefined;
    J.JHRA_QUESTIONS.filter(q => q.type === 'single' && !['jh_sex', 'jh_postmenopausal'].includes(q.field)).forEach(q => { a[q.field] = radio(q.field); });
    const meds = $$('input[name=jh_other_meds]:checked').map(i => i.value);
    if (meds.length) a.jh_other_meds = meds;
    a.jh_chair_stand = $('#chairUnable').checked ? 'unable' : ($('#chairCount').value.trim() === '' ? undefined : Number($('#chairCount').value));
    Object.keys(a).forEach(k => { if (a[k] === undefined) delete a[k]; });
    return a;
  }
  function needsMenopause() {
    const age = Number($('#jh_age').value);
    return radio('jh_sex') === 'female' && Number.isFinite(age) && age < 50;
  }
  const updateMenopause = () => $('#sub-menopause').classList.toggle('show', needsMenopause());
  $('#jh_age').addEventListener('input', updateMenopause);
  document.addEventListener('change', e => { if (e.target.name === 'jh_sex') updateMenopause(); });
  $('#chairUnable').addEventListener('change', e => { $('#chairCount').disabled = e.target.checked; if (e.target.checked) $('#chairCount').value = ''; });

  /* ── step validation: the engine's own check, limited to this step's fields ── */
  const STEP_FIELDS = {
    safety: J.JHRA_SAFETY.map(q => q.field), about: ['jh_age', 'jh_sex'], A: ['jh_injuries'],
    B: ['jh_height_cm', 'jh_weight_kg', 'jh_waist', 'jh_glucose', 'jh_bp', 'jh_lipids', 'jh_gout'],
    C: ['jh_strength_days', 'jh_chair_arms', 'jh_grip', 'jh_thigh_deficit'],
    D: ['jh_chair_stand', 'jh_single_leg', 'jh_stairs', 'jh_activity_min', 'jh_walk10'],
    E: ['jh_gain_since25', 'jh_weight_12m'],
    F: ['jh_steroid_oral', 'jh_injections', 'jh_fluoroquinolone', 'jh_aromatase', 'jh_dpp4', 'jh_diuretic', 'jh_glp1', 'jh_other_meds'],
    G: ['jh_pain_days', 'jh_stiffness', 'jh_swelling', 'jh_giving_way']
  };
  function stepProblems(step, a) {
    if (step === 'safety') return J.JHRA_SAFETY.filter(q => !a[q.field]).map(q => q.field);
    const r = J.scoreJHRA({ answers: { ...Object.fromEntries(J.JHRA_SAFETY.map(q => [q.field, 'no'])), ...a } });
    if (r.status !== 'insufficient_information') return [];
    const bad = new Set([...r.missing, ...r.invalid]);
    const extra = step === 'about' && needsMenopause() && !a.jh_postmenopausal ? ['jh_postmenopausal'] : [];
    return STEP_FIELDS[step].filter(f => bad.has(f)).concat(extra);
  }

  /* ── navigation ── */
  let current = 'start';
  const history = [];
  function show(id, push = true) {
    if (push && current !== id) history.push(current);
    $$('.jh-step').forEach(s => s.classList.toggle('active', s.id === 'step-' + id));
    current = id;
    const sec = $('#step-' + id);
    const p = Number(sec.dataset.progress || 0);
    $('#progress').classList.toggle('show', p > 0);
    if (p) {
      $('#progressFill').style.width = (p / 9 * 100) + '%';
      $('#progressLabel').textContent = `Step ${p} of 9`;
      $('#progressName').textContent = sec.dataset.name;
    }
    window.scrollTo({ top: 0, behavior: 'auto' });
    const h = $('h2', sec); if (h) h.focus({ preventScroll: true });
  }
  $$('[data-go]').forEach(b => b.addEventListener('click', () => {
    if (b.dataset.go === 'results-history') { renderHistoryOnly(); return; }
    show(b.dataset.go);
  }));
  $$('[data-back]').forEach(b => b.addEventListener('click', () => show(history.pop() || 'start', false)));
  $$('[data-next]').forEach(b => b.addEventListener('click', () => {
    const step = b.dataset.next;
    const a = collect();
    const bad = stepProblems(step, a);
    $('#err-' + step).classList.toggle('show', bad.length > 0);
    $$('fieldset[data-field]', $('#step-' + step)).forEach(fs => fs.setAttribute('aria-invalid', String(bad.includes(fs.dataset.field))));
    if (bad.length) { $('#err-' + step).focus?.(); return; }
    if (step === 'safety') {
      const r = J.scoreJHRA({ answers: a });
      if (r.status === 'safety_stop') { showStop(r.triggered); return; }
    }
    const next = STEPS[STEPS.indexOf(step) + 1];
    if (next) show(next); else finish(a);
  }));

  function showStop(triggered) {
    $('#stopCopy').textContent = J.JHRA_SAFETY_COPY;
    $('#stopList').innerHTML = triggered.map(f => `<li>${esc(Q[f].prompt.replace(/^In the past 2 weeks, have you had /, '').replace(/\?$/, '').replace(/^./, c => c.toUpperCase()))}</li>`).join('');
    show('stop');
  }

  /* ── results ── */
  let last = null;   // { answers, result, date }
  function finish(a) {
    const r = J.scoreJHRA({ answers: a });
    if (r.status === 'safety_stop') { showStop(r.triggered); return; }
    if (r.status !== 'complete') { console.warn('[JHRA] incomplete', r); return; }
    last = { answers: a, result: r, date: new Date() };
    renderResult(r, last.date);
    show('results');
    refreshAccount();
  }

  function renderResult(r, date) {
    const tier = J.JHRA_TIERS.find(t => t.label === r.total.tier);
    $('#resultDate').textContent = `Completed ${date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}. Version ${J.JHRA_VERSION_LABEL}.`;
    const flags = r.flags.length ? `
      <div class="jh-flags" role="note">
        <h3>Talk with your clinician about ${r.flags.length === 1 ? 'this' : 'these'} first</h3>
        <p>These answers matter more than the total score. They always apply, whatever your tier.</p>
        <ul>${r.flags.map(f => `<li>${esc(f.message)}</li>`).join('')}</ul>
      </div>` : '';
    const bars = J.JHRA_DOMAIN_ORDER.map(k => {
      const d = r.domains[k];
      const pri = r.priorities.includes(k);
      return `<li class="jh-bar${pri ? ' pri' : ''}"><span class="lbl">${k}. ${esc(J.JHRA_DOMAINS[k].name)}</span><span class="val">${d.score}</span>
        <span class="track" role="img" aria-label="${esc(J.JHRA_DOMAINS[k].name)}: ${d.score} out of 100"><span class="fill" style="width:${d.score}%"></span></span></li>`;
    }).join('');
    const top = r.priorities.slice(0, 2);
    const rest = r.priorities.slice(2);
    const priBlock = k => `<div class="jh-pri"><h4>${k}. ${esc(J.JHRA_DOMAINS[k].name)} · ${r.domains[k].score}</h4><p>${esc(AREA[k].msg)}</p>
      <p class="jh-gap"><strong>First steps</strong></p><ul>${AREA[k].actions.map(x => `<li>${esc(x)}</li>`).join('')}</ul>
      <p class="jh-gap"><strong>What the research shows</strong></p><ul class="jh-ev">${AREA[k].ev.map(evItem).join('')}</ul></div>`;
    const priorities = r.priorities.length
      ? `<h3 class="jh-gap">Your priority areas</h3><p>Any area scoring 50 or more is a priority, even when the total is low. Start with the top two.</p>${top.map(priBlock).join('')}${rest.length ? `<details class="jh-gap"><summary class="jh-link-btn">Other priority areas (${rest.length})</summary>${rest.map(priBlock).join('')}</details>` : ''}`
      : `<h3 class="jh-gap">Your priority areas</h3><p>No area scored 50 or more. Keep building on your strengths and retest in 12 months.</p>`;
    const ctx = r.context.points ? `<p class="jh-meta">Includes an age and sex adjustment of +${r.context.points}. <span class="jh-grade promising">Promising</span> ${esc(CONTEXT_EV[0])} <a href="${SRC.xu[1]}" target="_blank" rel="noopener">${esc(SRC.xu[0])}</a> (${SRC.xu[2]})</p>` : '';
    $('#resultBody').innerHTML = `
      <div class="jh-score ${TIER_CLASS[r.total.tier]}">
        <div class="n">${r.total.score}<small> / 100</small></div>
        <div class="t"><div class="tier">${esc(r.total.tier)}</div><p>${esc(tier.next)}</p>${r.flags.length ? '<p><strong>Because you have a flag, check with your clinician before acting on the tier.</strong></p>' : ''}</div>
      </div>
      <p class="jh-meta">Higher means more risk factors are working against your joints. 0 to 19 Maintain, 20 to 39 Build, 40 to 59 Rebuild, 60 and over Guided.</p>
      ${ctx}
      ${flags}
      <div class="jh-panel"><h3>Your seven areas</h3><p>Each area is scored 0 to 100. Higher means more risk in that area.</p><ul class="jh-bars">${bars}</ul>
        <p class="jh-meta">BMI ${r.bmi.toFixed(1)}. Chair stand: ${r.chairStand.result === 'unable' ? 'unable without arms' : `${r.chairStand.result} your age range of ${r.chairStand.range[0]} to ${r.chairStand.range[1]}`}.</p></div>
      ${priorities}`;
    renderHistory();
  }

  /* ── on-device history ── */
  const readStore = () => { try { const v = JSON.parse(localStorage.getItem(STORE) || '[]'); return Array.isArray(v) ? v : []; } catch { return []; } };
  const writeStore = v => { try { localStorage.setItem(STORE, JSON.stringify(v)); return true; } catch { return false; } };
  const fmtDate = d => new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  const HEAD = `<tr><th scope="col">Date</th><th scope="col" class="num">Score</th><th scope="col">Tier</th>${J.JHRA_DOMAIN_ORDER.map(k => `<th scope="col" class="num" title="${esc(J.JHRA_DOMAINS[k].name)}">${k}</th>`).join('')}<th scope="col">Flags</th>`;

  function renderHistory() {
    const h = readStore();
    $('#historyPanel').hidden = !h.length;
    $('#historyHint').hidden = !h.length;
    if (!h.length) return;
    $('thead', $('#historyTable')).innerHTML = HEAD + '<th scope="col"><span class="jh-sr">Delete</span></th></tr>';
    $('tbody', $('#historyTable')).innerHTML = h.slice().reverse().map(e => `<tr><td>${fmtDate(e.date)}</td><td class="num"><strong>${e.total}</strong></td><td>${esc(e.tier)}</td>${J.JHRA_DOMAIN_ORDER.map(k => `<td class="num">${e.domains[k]}</td>`).join('')}<td>${e.flags.length ? esc(e.flags.join(', ')) : 'None'}</td><td><button type="button" class="del" data-del="${esc(e.id)}" aria-label="Delete the result from ${fmtDate(e.date)}">Delete</button></td></tr>`).join('');
    $$('[data-del]', $('#historyTable')).forEach(b => b.addEventListener('click', () => {
      writeStore(readStore().filter(e => e.id !== b.dataset.del)); renderHistory();
      $('#saveStatus').textContent = 'Deleted.';
    }));
    if (h.length > 1) {
      const a = h[h.length - 2], b = h[h.length - 1];
      const d = b.total - a.total;
      $('#trend').textContent = d === 0 ? `No change since ${fmtDate(a.date)}.` : `${d < 0 ? 'Down' : 'Up'} ${Math.abs(d)} points since ${fmtDate(a.date)}${d < 0 ? ', fewer risk factors than before.' : '.'}`;
    } else $('#trend').textContent = 'Retest in the same way to see your trend here.';
  }
  function renderHistoryOnly() {
    $('#resultDate').textContent = '';
    $('#resultBody').innerHTML = '<p>Your saved results on this device are below. Start a new assessment to add a retest.</p>';
    $('#save').hidden = true;
    renderHistory();
    show('results');
  }
  $('#saveLocal').addEventListener('click', () => {
    if (!last) return;
    const r = last.result;
    const entry = { id: String(last.date.getTime()), date: last.date.toISOString(), algorithm: r.algorithmVersion, total: r.total.score, tier: r.total.tier,
      domains: Object.fromEntries(J.JHRA_DOMAIN_ORDER.map(k => [k, r.domains[k].score])), flags: r.flags.map(f => f.code) };
    const h = readStore().filter(e => e.id !== entry.id);
    h.push(entry);
    $('#saveStatus').textContent = writeStore(h.slice(-50)) ? 'Saved on this device. Only the scores were kept, not your answers.' : 'This browser would not let us save. Try printing instead.';
    renderHistory();
  });
  // two-step confirm in the page itself (native dialogs can be blocked)
  let clearArmed = false;
  $('#clearHistory').addEventListener('click', () => {
    const btn = $('#clearHistory');
    if (!clearArmed) {
      clearArmed = true;
      btn.textContent = 'Select again to delete all. This cannot be undone.';
      setTimeout(() => { clearArmed = false; btn.textContent = 'Delete all saved results on this device'; }, 6000);
      return;
    }
    clearArmed = false;
    btn.textContent = 'Delete all saved results on this device';
    try { localStorage.removeItem(STORE); } catch { /* ignore */ }
    renderHistory();
    $('#saveStatus').textContent = 'All saved results on this device were deleted.';
  });

  /* ── account saving ── */
  const db = () => (window.MM && typeof MM.client === 'function' ? MM.client() : null);
  async function refreshAccount() {
    const client = db();
    $('#saveAccount').hidden = true; $('#signIn').hidden = true;
    if (!client) { $('#accountNote').textContent = 'Saving to an account is not switched on yet. You can save on this device or print.'; return; }
    const user = await MM.auth.user();
    if (!user) { $('#signIn').hidden = false; $('#accountNote').textContent = 'Sign in to keep your results with your other Muscle-Meta assessments.'; return; }
    $('#saveAccount').hidden = !last;
    $('#accountNote').textContent = '';
    listAccount(client);
  }
  $('#signIn').addEventListener('click', () => {
    if (last) { try { sessionStorage.setItem(PENDING, JSON.stringify(last.answers)); } catch { /* ignore */ } }
    MM.auth.signInWithGoogle(window.location.href.split('#')[0]);
  });
  $('#saveAccount').addEventListener('click', async () => {
    const client = db(); if (!client || !last) return;
    const btn = $('#saveAccount'); btn.disabled = true;
    $('#saveStatus').textContent = 'Saving to your account...';
    try {
      const { data: ver, error: vErr } = await client.from('assessment_versions')
        .select('id, assessments!inner(code)').eq('assessments.code', J.JHRA_CODE).eq('status', 'published')
        .order('published_at', { ascending: false }).limit(1).single();
      if (vErr || !ver) throw new Error('version');
      let sessionId;
      const { data: s, error: sErr } = await client.from('assessment_sessions').insert({ assessment_version_id: ver.id }).select('id').single();
      if (s) sessionId = s.id;
      else {
        // one open session per version: reuse it (its answers are overwritten below)
        const { data: open } = await client.from('assessment_sessions').select('id').eq('assessment_version_id', ver.id).eq('status', 'in_progress').limit(1).maybeSingle();
        if (!open) throw sErr || new Error('session');
        sessionId = open.id;
      }
      const rows = Object.entries(last.answers).map(([question_code, value]) => ({ session_id: sessionId, question_code, value }));
      const { error: rErr } = await client.from('assessment_responses').upsert(rows, { onConflict: 'session_id,question_code' });
      if (rErr) throw rErr;
      const { data: out, error: fErr } = await client.functions.invoke('complete-assessment', { body: { session_id: sessionId } });
      if (fErr || !out?.result) throw fErr || new Error('complete');
      $('#saveStatus').textContent = 'Saved to your account.';
      btn.hidden = true;
      listAccount(client);
    } catch (err) {
      console.warn('[JHRA] account save failed', err);
      $('#saveStatus').textContent = 'We could not save to your account just now. Your result is still on this page; you can save it on this device or print it.';
    } finally { btn.disabled = false; }
  });
  async function listAccount(client) {
    const { data, error } = await client.from('assessment_results')
      .select('id, derived_at, detail, result_scores(score, tier_label, scope), result_flags(code)')
      .eq('score_family', 'jhra_risk').order('derived_at', { ascending: false }).limit(20);
    if (error || !data || !data.length) { $('#accountPanel').hidden = true; return; }
    $('#accountPanel').hidden = false;
    $('thead', $('#accountTable')).innerHTML = HEAD + '</tr>';
    $('tbody', $('#accountTable')).innerHTML = data.map(r => {
      const t = (r.result_scores || []).find(s => s.scope === 'total') || {};
      const d = (r.detail && r.detail.domains) || {};
      return `<tr><td>${fmtDate(r.derived_at)}</td><td class="num"><strong>${t.score ?? ''}</strong></td><td>${esc(t.tier_label || '')}</td>${J.JHRA_DOMAIN_ORDER.map(k => `<td class="num">${d[k] ? d[k].score : ''}</td>`).join('')}<td>${(r.result_flags || []).map(f => esc(f.code)).join(', ') || 'None'}</td></tr>`;
    }).join('');
  }

  $('#restart').addEventListener('click', () => window.location.reload());

  /* ── start-up ── */
  renderHistory();
  try {
    const pending = JSON.parse(sessionStorage.getItem(PENDING) || 'null');
    if (pending) {
      sessionStorage.removeItem(PENDING);
      const r = J.scoreJHRA({ answers: pending });
      if (r.status === 'complete') { last = { answers: pending, result: r, date: new Date() }; renderResult(r, last.date); show('results', false); refreshAccount(); }
    }
  } catch { /* ignore */ }

  // test hook: lets QA fill answers without clicking every option
  window.__jhra = { collect, finish, show };
})();
