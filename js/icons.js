/**
 * icons.js — مجموعة أيقونات خطية موحّدة (بأسلوب Lucide: 24×24، خط 1.75، حواف دائرية)
 * مرسومة يدويًا بدل الاعتماد على مكتبة CDN خارجية، لضمان عملها 100% داخل بيئة الـ Artifact
 * بدون أي خطر تعطّل تحميل من رابط خارجي.
 */
(function (global) {
  "use strict";

  // width/height="1em" بمثابة قياس افتراضي آمن (يتبع حجم الخط المحيط) لأي مكان لم يُحدَّد له قياس CSS خاص؛
  // أي قاعدة CSS أكثر تحديدًا (مثل .btn svg) تبقى لها الأولوية فوق هذا القياس الافتراضي
  const WRAP_OPEN = '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">';
  const WRAP_CLOSE = "</svg>";

  const PATHS = {
    shield: '<path d="M12 3l7 3v5c0 4.7-3 8.4-7 10-4-1.6-7-5.3-7-10V6l7-3z"/><path d="m9 12 2 2 4-4"/>',
    "chevron-start": '<path d="M15 6l-6 6 6 6"/>',
    "chevron-end": '<path d="M9 6l6 6-6 6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    trash: '<path d="M4 7h16M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2m2 0-1 13a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L6 7"/>',
    upload: '<path d="M12 16V4M12 4 7 9M12 4l5 5"/><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/>',
    dna: '<path d="M7 3c0 4 10 4 10 8s-10 4-10 8"/><path d="M17 3c0 4-10 4-10 8s10 4 10 8"/><path d="M8.5 7h7M8.5 17h7M7.5 12h9"/>',
    file: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>',
    "file-check": '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="m9.5 14.5 2 2 3.5-3.5"/>',
    printer: '<path d="M6 9V3h12v6"/><rect x="6" y="13" width="12" height="8"/><path d="M4 9h16a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1h-2M6 16H4a1 1 0 0 1-1-1v-5a1 1 0 0 1 1-1h2"/>',
    users: '<path d="M17 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    link: '<path d="M9 17H7a5 5 0 0 1 0-10h2"/><path d="M15 7h2a5 5 0 1 1 0 10h-2"/><path d="M8 12h8"/>',
    copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    hospital: '<path d="M4 21V6a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v15"/><path d="M14 8h6a1 1 0 0 1 1 1v12"/><path d="M9 8v2M9 13v2M6 10.5h6M6 15.5h6"/><path d="M17 13v2m-1-1h2M2 21h20"/>',
    flask: '<path d="M9 3h6M10 3v6l-5.5 9.5A1.5 1.5 0 0 0 5.8 21h12.4a1.5 1.5 0 0 0 1.3-2.5L14 9V3"/><path d="M7.5 14.5h9"/>',
    "arrow-left": '<path d="M19 12H5M12 19l-7-7 7-7"/>',
    "arrow-right": '<path d="M5 12h14M12 5l7 7-7 7"/>',
    "check-circle": '<circle cx="12" cy="12" r="9"/><path d="m9 12 2 2 4-4"/>',
    "alert-circle": '<circle cx="12" cy="12" r="9"/><path d="M12 8v5m0 3h.01"/>',
    "info-circle": '<circle cx="12" cy="12" r="9"/><path d="M12 8v.01M11 12h1v5h1"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    sparkle: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8"/>',
    route: '<circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/><path d="M8 19h7a4 4 0 0 0 4-4V9a2 2 0 0 0-2-2H9"/><path d="m11 4-2 2 2 2"/>',
    person: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6"/>',
    "chevron-down": '<path d="m6 9 6 6 6-6"/>',
    branch: '<circle cx="12" cy="4" r="1.6"/><circle cx="6" cy="20" r="1.6"/><circle cx="18" cy="20" r="1.6"/><path d="M12 5.6v6.4"/><path d="M12 12c0 3-3.2 4.4-6 5.7"/><path d="M12 12c0 3 3.2 4.4 6 5.7"/>',
  };

  function icon(name, cls) {
    const body = PATHS[name] || "";
    const klass = cls ? ' class="' + cls + '"' : "";
    return WRAP_OPEN.replace("<svg ", "<svg" + klass + " ") + body + WRAP_CLOSE;
  }

  global.JuthoorIcons = { icon: icon };
})(window);
