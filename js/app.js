/**
 * app.js — تهيئة التطبيق، التنقل بين المراحل، وربط الأحداث (Event Delegation)
 */
(function () {
  "use strict";

  const State = window.JuthoorState;
  const Data = window.JuthoorData;
  const Scoring = window.JuthoorScoring;
  const Icon = window.JuthoorIcons.icon;
  const I18n = window.JuthoorI18n;

  function T(key, vars) {
    return I18n.t(State.getState().lang, key, vars);
  }

  let lastScore = null;
  let physicianGateError = "";
  let toastTimer = null;
  let modalClearTimer = null;
  let preferredPathway = null; // اختيار المريضة المبدئي لمسار الإحالة، قبل إرسال الطلب
  let activeTreeNodeId = null; // مُعرّف القريبة المفتوحة حاليًا باللوحة الجانبية بشجرة العائلة

  // علامة جذور — بنية تفرّع مجرّدة (جذر واحد يتفرّع إلى عُقد) بدل أي رسم حرفي لورقة أو شجرة
  const BRAND_MARK =
    '<svg viewBox="0 0 40 40" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<circle cx="20" cy="34" r="2.6" fill="currentColor"/>' +
      '<path d="M20 31.5V22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' +
      '<path d="M20 22c0-4.5-4.5-6.5-8.5-6.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" opacity="0.8"/>' +
      '<path d="M20 22c0-4.5 4.5-6.5 8.5-6.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" opacity="0.8"/>' +
      '<path d="M20 17.5V9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" opacity="0.8"/>' +
      '<circle cx="11.5" cy="15.5" r="2.1" fill="currentColor" opacity="0.8"/>' +
      '<circle cx="28.5" cy="15.5" r="2.1" fill="currentColor" opacity="0.8"/>' +
      '<circle cx="20" cy="7.2" r="2.1" fill="currentColor" opacity="0.8"/>' +
    "</svg>";

  // خلفية عضوية هادئة جدًا — خطوط تفرّع رفيعة تتحرك ببطء شديد، بلا أي طابع تقني
  const ROOTS_BG =
    '<div class="roots-bg" aria-hidden="true">' +
      '<svg viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice">' +
        '<g class="grp-a">' +
          '<path d="M -50 180 C 150 140, 220 260, 420 220 S 700 120, 950 190"/>' +
          '<path d="M 420 220 C 460 320, 380 380, 430 480"/>' +
          '<path d="M 420 220 C 500 260, 560 260, 620 340"/>' +
          '<path d="M -80 620 C 120 580, 260 700, 480 640 S 820 560, 1020 660"/>' +
          '<path d="M 480 640 C 520 720, 460 780, 520 880"/>' +
          '<path d="M 480 640 C 420 700, 340 700, 300 780"/>' +
        "</g>" +
        '<g class="grp-b">' +
          '<path d="M 60 -40 C 40 120, 160 160, 140 320 S 40 520, 120 700"/>' +
          '<path d="M 140 320 C 220 340, 260 300, 340 320"/>' +
          '<path d="M 860 60 C 900 200, 800 260, 840 420 S 940 620, 860 820"/>' +
          '<path d="M 840 420 C 760 440, 720 400, 640 420"/>' +
          '<path d="M 500 900 C 560 780, 700 760, 720 640"/>' +
        "</g>" +
      "</svg>" +
    "</div>";

  function topbarHtml(state) {
    return (
      '<header class="topbar">' +
        '<button class="brand" type="button" data-action="go-landing">' +
          '<span class="brand-mark">' + BRAND_MARK + "</span>" +
          '<span class="brand-text"><strong>جذور</strong><span>' + T("topbar.subtitle") + "</span></span>" +
        "</button>" +
        '<div style="display:flex;align-items:center;gap:0.5rem;">' +
          '<div class="persona-switch">' +
            '<button class="' + (state.persona === "patient" ? "active" : "") + '" data-action="switch-persona" data-persona="patient">' + T("topbar.patient") + "</button>" +
            '<button class="' + (state.persona === "physician" ? "active" : "") + '" data-action="switch-persona" data-persona="physician">' + T("topbar.physician") + "</button>" +
          "</div>" +
          '<button class="btn btn-outline" data-action="toggle-lang" style="padding:0.4rem 0.85rem;font-size:0.78rem;" lang="' + (state.lang === "en" ? "ar" : "en") + '">' + T("topbar.lang_switch") + "</button>" +
        "</div>" +
      "</header>"
    );
  }

  function stepperHtml(state) {
    if (state.persona !== "patient" || state.stage === 0) return "";
    const steps = [
      { n: 1, label: T("stepper.consent") },
      { n: 2, label: T("stepper.tree") },
      { n: 3, label: T("stepper.results") },
    ];
    return (
      '<nav class="stepper">' +
      steps
        .map(function (s) {
          const cls = s.n < state.stage ? "done" : s.n === state.stage ? "current" : "";
          return '<div class="step ' + cls + '"><span class="num">' + s.n + "</span><span>" + s.label + "</span></div>";
        })
        .join("") +
      "</nav>"
    );
  }

  function fullRender() {
    const state = State.getState();
    const root = document.getElementById("juthoor-app");
    let stageContent = "";
    let wide = false;

    if (state.persona === "physician") {
      stageContent = window.JuthoorDashboard.render(state, physicianGateError);
      wide = state.physicianUnlocked;
    } else if (state.stage === 0) {
      stageContent = window.JuthoorLanding.render(state);
      wide = true;
    } else if (state.stage === 2) {
      stageContent = window.JuthoorTree.render(state);
    } else if (state.stage === 3) {
      const anyUncertain = state.relatives.some(function (r) { return !!r.uncertain; });
      lastScore = Scoring.computeScore(state.relatives);
      const bestCaseScore = anyUncertain ? Scoring.computeScore(state.relatives, { excludeUncertain: true }) : null;
      stageContent = window.JuthoorResults.render(state, lastScore, { preferredPathway: preferredPathway, bestCaseScore: bestCaseScore, patientRegion: state.patientRegion });
    } else {
      stageContent = window.JuthoorConsent.render(state);
    }

    root.innerHTML = topbarHtml(state) + stepperHtml(state) + '<main class="' + (wide ? "wide" : "") + '">' + stageContent + "</main>";

    document.documentElement.setAttribute("dir", I18n.dirFor(state.lang));
    document.documentElement.setAttribute("lang", state.lang);

    refreshTreePanel(state);
  }

  // يُبقي اللوحة الجانبية لتعديل قريبة متزامنة مع الحالة (مثلًا عند تغيير صلة القرابة تتحدّث خيارات نوع الإصابة فورًا)
  function refreshTreePanel(state) {
    const backdrop = document.getElementById("modal-root");
    if (!backdrop || !backdrop.classList.contains("show") || !activeTreeNodeId) return;
    const relative = state.relatives.find(function (r) { return r.id === activeTreeNodeId; });
    if (!relative || state.stage !== 2 || state.persona !== "patient") {
      resetTreePanel();
      return;
    }
    backdrop.innerHTML = window.JuthoorTree.buildPanel(relative, state.lang);
  }

  function resetTreePanel() {
    activeTreeNodeId = null;
    closeModal();
  }

  function showToast(msg) {
    const toastEl = document.getElementById("toast");
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.remove("show");
    void toastEl.offsetWidth;
    requestAnimationFrame(function () { toastEl.classList.add("show"); });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 3200);
  }

  function openModal(html) {
    const backdrop = document.getElementById("modal-root");
    if (!backdrop) return;
    clearTimeout(modalClearTimer);
    backdrop.innerHTML = html;
    backdrop.classList.add("show");
  }

  function closeModal() {
    const backdrop = document.getElementById("modal-root");
    if (!backdrop) return;
    backdrop.classList.remove("show");
    clearTimeout(modalClearTimer);
    modalClearTimer = setTimeout(function () { backdrop.innerHTML = ""; }, 200);
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch (e) { /* تجاهل */ }
    document.body.removeChild(ta);
    return Promise.resolve();
  }

  function handleClick(e) {
    if (e.target.id === "modal-root") {
      resetTreePanel();
      return;
    }
    const el = e.target.closest("[data-action]");
    if (!el) return;
    const action = el.dataset.action;

    switch (action) {
      case "go-landing":
        resetTreePanel();
        preferredPathway = null;
        physicianGateError = "";
        State.setPersona("patient");
        State.setStage(0);
        break;
      case "start-assessment":
        State.setStage(1);
        break;
      case "scroll-how": {
        const target = document.getElementById("landing-how");
        if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
        break;
      }
      case "toggle-lang":
        State.setLang(State.getState().lang === "en" ? "ar" : "en");
        break;
      case "verify-nafath":
        State.verifyNafath();
        showToast(T("consent.nafath_verified"));
        break;
      case "start-tree": {
        const consent = State.getState().consent;
        if (!consent.agreed) {
          showToast(T("app.toast_need_consent"));
          const row = document.getElementById("consent-agree-row");
          if (row) {
            row.classList.add("attention");
            row.scrollIntoView({ behavior: "smooth", block: "center" });
            setTimeout(function () { row.classList.remove("attention"); }, 1600);
          }
          break;
        }
        State.setStage(2);
        break;
      }
      case "go-stage":
        resetTreePanel();
        State.setStage(parseInt(el.dataset.stage, 10));
        break;
      case "open-relative":
        activeTreeNodeId = el.dataset.id;
        openModal(window.JuthoorTree.buildPanel(State.getState().relatives.find(function (r) { return r.id === el.dataset.id; }), State.getState().lang));
        break;
      case "add-relative": {
        const relative = window.JuthoorTree.newRelativeForSide(el.dataset.side || "maternal");
        State.addRelative(relative);
        activeTreeNodeId = relative.id;
        openModal(window.JuthoorTree.buildPanel(relative, State.getState().lang));
        break;
      }
      case "remove-relative":
        if (el.dataset.id === activeTreeNodeId) resetTreePanel();
        State.removeRelative(el.dataset.id);
        break;
      case "calculate-score":
        resetTreePanel();
        State.setStage(3);
        break;
      case "restart":
        if (!window.confirm(T("app.confirm_restart"))) break;
        preferredPathway = null;
        resetTreePanel();
        State.resetAll();
        break;
      case "select-pathway":
        preferredPathway = el.dataset.pathway;
        fullRender();
        break;
      case "request-referral": {
        const score = lastScore || Scoring.computeScore(State.getState().relatives);
        State.createReferral(score, preferredPathway);
        preferredPathway = null;
        showToast(T("app.toast_referral_sent"));
        break;
      }
      case "switch-persona":
        resetTreePanel();
        physicianGateError = "";
        State.setPersona(el.dataset.persona);
        break;
      case "submit-physician-code": {
        const input = document.getElementById("physician-code");
        const value = input ? input.value.trim() : "";
        if (value === Data.MOCK_PHYSICIAN_ACCESS_CODE) {
          physicianGateError = "";
          State.unlockPhysician();
        } else {
          physicianGateError = T("dashboard.gate_error");
          fullRender();
        }
        break;
      }
      case "toggle-referral":
        State.toggleOpenReferral(el.dataset.id);
        break;
      case "assign-pathway":
        State.setReferralPathway(el.dataset.id, el.dataset.pathway);
        break;
      case "advance-referral": {
        const state = State.getState();
        const referral = state.referrals.find(function (r) { return r.id === el.dataset.id; });
        State.advanceReferralStatus(el.dataset.id, referral ? referral.doctorId : null);
        showToast(T("app.toast_status_updated"));
        break;
      }
      case "remove-genomic-file":
        State.setGenomicFile(null);
        break;
      case "open-report": {
        const referral = State.getActiveReferral();
        if (referral) { activeTreeNodeId = null; openModal(window.JuthoorReport.build(State.getState(), referral)); }
        break;
      }
      case "open-invite": {
        const referral = State.getActiveReferral();
        if (referral) { activeTreeNodeId = null; openModal(window.JuthoorInvite.build(referral, State.getState().lang)); }
        break;
      }
      case "close-modal":
        resetTreePanel();
        break;
      case "print-report":
        window.print();
        break;
      case "copy-invite-link":
        copyText(el.dataset.link || "");
        showToast(T("app.toast_link_copied"));
        break;
      case "copy-invite-message":
        copyText(decodeURIComponent(el.dataset.message || ""));
        showToast(T("app.toast_message_copied"));
        break;
      default:
        break;
    }
  }

  function toPatch(key, value) {
    const patch = {};
    patch[key] = value;
    return patch;
  }

  function handleChange(e) {
    const t = e.target;

    if (t.id === "consent-anonymous") { State.setConsent({ anonymous: t.checked }); return; }
    if (t.id === "consent-agree") { State.setConsent({ agreed: t.checked }); return; }
    if (t.id === "physician-code") { return; }
    if (t.id === "patient-region-select") { State.setPatientRegion(t.value); return; }

    if (t.id === "genomic-file-input") {
      const file = t.files && t.files[0];
      if (file) {
        State.setGenomicFile({ name: file.name, size: file.size, type: file.type });
        showToast(T("app.toast_file_attached"));
      }
      return;
    }

    const personalField = t.dataset.personalField;
    if (personalField) {
      if (t.type === "checkbox") {
        State.setPersonalFactors(toPatch(personalField, t.checked));
      } else if (t.type === "number") {
        State.setPersonalFactors(toPatch(personalField, t.value === "" ? null : Number(t.value)));
      } else {
        State.setPersonalFactors(toPatch(personalField, t.value));
      }
      return;
    }

    const field = t.dataset.field;
    const id = t.dataset.id;
    if (!field || !id) return;

    if (field === "doctorId") {
      State.setReferralDoctor(id, t.value);
      return;
    }

    if (field === "relationId") {
      const relation = Data.relationById(t.value);
      const patch = { relationId: t.value, side: relation.side };
      const currentRelative = State.getState().relatives.find(function (r) { return r.id === id; });
      const validCancers = Data.cancerTypesForGender(relation.gender);
      const stillValid = currentRelative && validCancers.some(function (c) { return c.id === currentRelative.cancerType; });
      if (!stillValid) {
        const newCancer = validCancers[0].id;
        patch.cancerType = newCancer;
        patch.ageBand = Data.AGE_BANDS[newCancer][0].id;
      }
      State.updateRelative(id, patch);
    } else if (field === "cancerType") {
      const bands = Data.AGE_BANDS[t.value];
      State.updateRelative(id, { cancerType: t.value, ageBand: bands[0].id });
    } else if (field === "ageBand") {
      State.updateRelative(id, { ageBand: t.value });
    } else if (field === "consanguinity") {
      State.updateRelative(id, { consanguinity: t.checked });
    } else if (field === "uncertain") {
      State.updateRelative(id, { uncertain: t.checked });
    } else if (field === "brcaTested") {
      const patch = { brcaTested: t.value };
      if (t.value !== "yes") patch.brcaResult = "unknown"; // تصفير النتيجة لو ألغت "نعم" عشان ما تبقى نتيجة يتيمة بدون فحص مسجَّل
      State.updateRelative(id, patch);
    } else if (field === "brcaResult") {
      State.updateRelative(id, { brcaResult: t.value });
    }
  }

  function injectRootsBackground() {
    const holder = document.createElement("div");
    holder.innerHTML = ROOTS_BG;
    document.body.insertBefore(holder.firstChild, document.body.firstChild);
  }

  function init() {
    injectRootsBackground();
    document.addEventListener("click", handleClick);
    document.addEventListener("change", handleChange);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") resetTreePanel();
    });
    State.subscribe(fullRender);
    fullRender();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
