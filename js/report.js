/**
 * report.js — معاينة ملخص تقرير موحّد + طباعة/حفظ كـ PDF عبر خاصية الطباعة المدمجة بالمتصفح
 * (لا نعتمد مكتبة PDF خارجية لضمان الموثوقية — "حفظ كـ PDF" من نافذة الطباعة يعطي نفس النتيجة)
 */
(function (global) {
  "use strict";

  const Data = global.JuthoorData;
  const Icon = global.JuthoorIcons.icon;
  const I18n = global.JuthoorI18n;

  function relativesRows(snapshot, lang) {
    if (!snapshot.length) return '<div class="report-row"><span>' + I18n.t(lang, "report.family_history_label") + "</span><span>" + I18n.t(lang, "report.no_relatives_row") + "</span></div>";
    return snapshot
      .map(function (r) {
        const relation = Data.relationById(r.relationId);
        return '<div class="report-row"><span>' + Data.relationLabel(relation, lang) + "</span><span>" + Data.cancerLabel(r.cancerType, lang) + " · " + Data.ageLabel(r.cancerType, r.ageBand, lang) + "</span></div>";
      })
      .join("");
  }

  function build(state, referral) {
    const lang = state.lang;
    const T = function (key) { return I18n.t(lang, key); };
    const score = referral.score;
    const pathway = referral.pathwayAssigned ? Data.pathwayById(referral.pathwayAssigned) : (referral.pathwayPreferred ? Data.pathwayById(referral.pathwayPreferred) : null);
    const idLabel = referral.anonymous ? T("report.id_anonymous") : T("report.id_case");
    const dateLabel = new Date(referral.createdAt).toLocaleDateString(lang === "en" ? "en-US" : "ar-SA", { year: "numeric", month: "long", day: "numeric" });

    return (
      '<div class="modal-sheet">' +
        '<div class="modal-head">' +
          "<div>" +
            '<span class="eyebrow">' + T("report.eyebrow") + "</span>" +
            "<h2>" + T("report.title") + "</h2>" +
          "</div>" +
          '<button class="modal-close" data-action="close-modal" data-no-print aria-label="Close">' + Icon("x") + "</button>" +
        "</div>" +

        '<div class="report-sheet">' +
          '<div class="report-row"><span>' + idLabel + "</span><span class=\"tabular\">" + referral.id + "</span></div>" +
          '<div class="report-row"><span>' + T("report.date") + "</span><span>" + dateLabel + "</span></div>" +
          '<div class="report-row"><span>' + T("report.combined_score") + '</span><span class="tabular">' + score.combined + " " + T("report.points_suffix") + "</span></div>" +
          '<div class="report-row"><span>' + T("report.single_gene") + '</span><span class="tabular">' + score.singleGeneMax + "</span></div>" +
          '<div class="report-row"><span>' + T("report.classification") + "</span><span>" + (score.band === "high" ? T("report.classification_high") : T("report.classification_low")) + "</span></div>" +
          '<div class="report-row"><span>' + T("report.used_side") + "</span><span>" + (score.usedSide === "maternal" ? I18n.t(lang, "common.side_maternal") : I18n.t(lang, "common.side_paternal")) + "</span></div>" +
          '<div class="report-row"><span>' + T("report.pathway") + "</span><span>" + (pathway ? Data.pathwayLabel(pathway, lang) : T("report.pathway_unset")) + "</span></div>" +
          '<div class="report-row"><span>' + T("report.genomic_file") + "</span><span>" + (referral.genomicFileSnapshot ? referral.genomicFileSnapshot.name : T("report.genomic_none")) + "</span></div>" +
        "</div>" +

        '<div style="height:1rem"></div>' +
        '<h3 style="font-size:0.92rem;margin-bottom:0.5rem;">' + T("report.family_history_title") + "</h3>" +
        '<div class="report-sheet">' + relativesRows(referral.relativesSnapshot, lang) + "</div>" +

        '<p class="faint" style="margin-top:1rem;">' + T("report.footer") + "</p>" +

        '<div class="btn-row end" style="margin-top:1rem;" data-no-print>' +
          '<button class="btn btn-ghost" data-action="close-modal">' + T("report.close") + "</button>" +
          '<button class="btn btn-primary" data-action="print-report">' + Icon("printer") + " " + T("report.print") + "</button>" +
        "</div>" +
      "</div>"
    );
  }

  global.JuthoorReport = { build: build };
})(window);
