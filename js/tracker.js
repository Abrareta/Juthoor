/**
 * tracker.js — مكوّن بصري مشترك (مسار زمني/Timeline) لعرض مراحل تتبع الإحالة
 * يُستخدم بمرحلة النتيجة ولوحة الطبيب. التوقيع render(currentStatus, lang).
 */
(function (global) {
  "use strict";

  function render(currentStatus, lang) {
    const Icon = global.JuthoorIcons.icon;
    const Data = global.JuthoorData;
    const I18n = global.JuthoorI18n;
    const statuses = Data.REFERRAL_STATUSES;
    const currentIdx = statuses.indexOf(currentStatus);

    return (
      '<div class="timeline">' +
      statuses
        .map(function (status, idx) {
          const done = idx < currentIdx;
          const isCurrent = idx === currentIdx;
          const cls = done ? "done" : isCurrent ? "current" : "";
          const isLast = idx === statuses.length - 1;
          const stateLabel = isCurrent ? I18n.t(lang, "tracker.current") : done ? I18n.t(lang, "tracker.done") : I18n.t(lang, "tracker.upcoming");
          return (
            '<div class="timeline-step ' + cls + '">' +
              '<div class="timeline-dot-col">' +
                '<div class="timeline-dot">' + (done ? Icon("check-circle") : "") + "</div>" +
                (isLast ? "" : '<div class="timeline-line"></div>') +
              "</div>" +
              '<div class="timeline-text"><strong>' + Data.statusLabel(status, lang) + "</strong><span>" + stateLabel + "</span></div>" +
            "</div>"
          );
        })
        .join("") +
      "</div>"
    );
  }

  global.JuthoorTracker = { render: render };
})(window);
