/**
 * state.js — مخزن حالة مركزي بسيط (in-memory) مع حفظ اختياري بالمتصفح المحلي (localStorage)
 * ملاحظة: هذا حفظ محلي مريح لهذا الجهاز فقط أثناء العرض التجريبي، وليس قاعدة بيانات مشتركة.
 * الطبقة الثانية من المشروع (بعد الهاكثون) تحتاج تخزينًا فعليًا مشتركًا بين المريضة والطبيب.
 */
(function (global) {
  "use strict";

  const STORAGE_KEY = "juthoor_demo_state_v1";

  function freshState() {
    return {
      stage: 0, // 0 = الصفحة الرئيسية، 1..3 لاحقًا
      lang: "ar", // 'ar' | 'en'
      persona: "patient", // 'patient' | 'physician'
      physicianUnlocked: false,
      consent: { agreed: false, anonymous: true },
      relatives: [],
      genomicFile: null, // {name, size, type} — تجريبي، يُرفق فقط ولا يُحلَّل آليًا
      referralSeq: 0,
      referrals: [], // {id, anonymous, score, createdAt, status, doctorId, pathwayPreferred, pathwayAssigned, relativesSnapshot, genomicFileSnapshot}
      activeReferralId: null,
    };
  }

  // دمج آمن مع الحالة الافتراضية — يحمي من كسر الواجهة لو كانت هناك نسخة محفوظة محليًا
  // بإصدار سابق من التطبيق لا تحتوي على الحقول الجديدة (مثل genomicFile أو مسارات الإحالة)
  function mergeWithDefaults(loaded) {
    const base = freshState();
    if (!loaded) return base;
    const merged = Object.assign({}, base, loaded);
    // اللغة دائمًا تبدأ عربي/RTL عند كل زيارة جديدة للصفحة — حتى لو كانت جلسة سابقة انتهت وهي على الإنجليزي.
    // خاصية التبديل تبقى تعمل أثناء الجلسة نفسها، لكنها لا تصير هي الافتراضي الدائم بالمتصفح.
    merged.lang = base.lang;
    merged.consent = Object.assign({}, base.consent, loaded.consent);
    merged.relatives = Array.isArray(loaded.relatives) ? loaded.relatives : base.relatives;
    merged.referrals = Array.isArray(loaded.referrals) ? loaded.referrals : base.referrals;
    return merged;
  }

  function loadFromStorage() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? mergeWithDefaults(parsed) : null;
    } catch (e) {
      return null;
    }
  }

  function persist() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      /* تجاهل بصمت — العرض يعمل بالذاكرة حتى لو التخزين المحلي غير متاح */
    }
  }

  let state = loadFromStorage() || freshState();
  const listeners = [];

  function subscribe(fn) {
    listeners.push(fn);
    return function unsubscribe() {
      const idx = listeners.indexOf(fn);
      if (idx > -1) listeners.splice(idx, 1);
    };
  }

  function notify() {
    persist();
    listeners.forEach(function (fn) { fn(state); });
  }

  function getState() {
    return state;
  }

  function resetAll() {
    state = freshState();
    notify();
  }

  function setStage(stage) {
    state.stage = stage;
    notify();
  }

  function setPersona(persona) {
    state.persona = persona;
    notify();
  }

  function setLang(lang) {
    state.lang = lang === "en" ? "en" : "ar";
    notify();
  }

  function setConsent(consent) {
    state.consent = Object.assign({}, state.consent, consent);
    notify();
  }

  function addRelative(relative) {
    state.relatives = state.relatives.concat([relative]);
    notify();
  }

  function updateRelative(id, patch) {
    state.relatives = state.relatives.map(function (r) {
      return r.id === id ? Object.assign({}, r, patch) : r;
    });
    notify();
  }

  function removeRelative(id) {
    state.relatives = state.relatives.filter(function (r) { return r.id !== id; });
    notify();
  }

  function unlockPhysician() {
    state.physicianUnlocked = true;
    notify();
  }

  function setGenomicFile(fileMeta) {
    state.genomicFile = fileMeta;
    notify();
  }

  function createReferral(scoreResult, preferredPathway) {
    state.referralSeq += 1;
    const referral = {
      id: global.JuthoorData.generateReferralId(state.referralSeq),
      anonymous: state.consent.anonymous,
      score: scoreResult,
      relativesSnapshot: state.relatives,
      genomicFileSnapshot: state.genomicFile,
      createdAt: new Date().toISOString(),
      status: global.JuthoorData.REFERRAL_STATUSES[0],
      doctorId: null,
      pathwayPreferred: preferredPathway || null,
      pathwayAssigned: null,
    };
    state.referrals = state.referrals.concat([referral]);
    state.activeReferralId = referral.id;
    notify();
    return referral;
  }

  function setReferralPathway(id, pathwayId) {
    state.referrals = state.referrals.map(function (ref) {
      return ref.id === id ? Object.assign({}, ref, { pathwayAssigned: pathwayId || null }) : ref;
    });
    notify();
  }

  function advanceReferralStatus(referralId, doctorId) {
    state.referrals = state.referrals.map(function (ref) {
      if (ref.id !== referralId) return ref;
      const statuses = global.JuthoorData.REFERRAL_STATUSES;
      const currentIdx = statuses.indexOf(ref.status);
      const nextStatus = statuses[Math.min(currentIdx + 1, statuses.length - 1)];
      return Object.assign({}, ref, { status: nextStatus, doctorId: doctorId || ref.doctorId });
    });
    notify();
  }

  function getActiveReferral() {
    return state.referrals.find(function (r) { return r.id === state.activeReferralId; }) || null;
  }

  function toggleOpenReferral(id) {
    state.activeReferralId = state.activeReferralId === id ? null : id;
    notify();
  }

  function setReferralDoctor(id, doctorId) {
    state.referrals = state.referrals.map(function (ref) {
      return ref.id === id ? Object.assign({}, ref, { doctorId: doctorId || null }) : ref;
    });
    notify();
  }

  global.JuthoorState = {
    subscribe: subscribe,
    getState: getState,
    resetAll: resetAll,
    setStage: setStage,
    setPersona: setPersona,
    setLang: setLang,
    setConsent: setConsent,
    addRelative: addRelative,
    updateRelative: updateRelative,
    removeRelative: removeRelative,
    unlockPhysician: unlockPhysician,
    setGenomicFile: setGenomicFile,
    createReferral: createReferral,
    advanceReferralStatus: advanceReferralStatus,
    getActiveReferral: getActiveReferral,
    toggleOpenReferral: toggleOpenReferral,
    setReferralDoctor: setReferralDoctor,
    setReferralPathway: setReferralPathway,
  };
})(window);
