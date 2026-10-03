/**
 * report.js — معاينة ملخص تقرير موحّد + طباعة/حفظ كـ PDF عبر خاصية الطباعة المدمجة بالمتصفح
 * (لا نعتمد مكتبة PDF خارجية لضمان الموثوقية — "حفظ كـ PDF" من نافذة الطباعة يعطي نفس النتيجة)
 */
(function (global) {
  "use strict";

  const Data = global.JuthoorData;
  const Icon = global.JuthoorIcons.icon;
  const I18n = global.JuthoorI18n;

  function brcaResultLabel(code, lang) {
    if (code === "positive") return I18n.t(lang, "tree.brca_result_positive");
    if (code === "negative") return I18n.t(lang, "tree.brca_result_negative");
    if (code === "vus") return I18n.t(lang, "tree.brca_result_vus");
    return I18n.t(lang, "tree.brca_result_unknown");
  }

  function relativesRows(snapshot, lang) {
    if (!snapshot.length) return '<div class="report-row"><span>' + I18n.t(lang, "report.family_history_label") + "</span><span>" + I18n.t(lang, "report.no_relatives_row") + "</span></div>";
    return snapshot
      .map(function (r) {
        const relation = Data.relationById(r.relationId);
        let detail = Data.cancerLabel(r.cancerType, lang) + " · " + Data.ageLabel(r.cancerType, r.ageBand, lang);
        if (r.brcaTested === "yes") detail += " · BRCA1/2: " + brcaResultLabel(r.brcaResult, lang);
        if (r.uncertain) detail += " · " + I18n.t(lang, "report.uncertain_flag");
        return '<div class="report-row"><span>' + Data.relationLabel(relation, lang) + "</span><span>" + detail + "</span></div>";
      })
      .join("");
  }

  function densityLabel(value, lang) {
    if (value === "low") return I18n.t(lang, "tree.personal_density_low");
    if (value === "medium") return I18n.t(lang, "tree.personal_density_medium");
    if (value === "high") return I18n.t(lang, "tree.personal_density_high");
    return I18n.t(lang, "tree.personal_density_unknown");
  }

  function personalFactorsRows(factors, lang) {
    const T = function (key) { return I18n.t(lang, key); };
    if (!factors) return '<div class="report-row"><span>' + T("report.personal_factors_title") + "</span><span>" + T("report.personal_none") + "</span></div>";
    const rows = [];
    if (factors.menarcheAge != null) rows.push(["tree.personal_menarche", factors.menarcheAge]);
    if (factors.pregnancies != null) rows.push(["tree.personal_pregnancies", factors.pregnancies]);
    if (factors.heightCm != null || factors.weightKg != null) {
      const h = factors.heightCm != null ? factors.heightCm + " " + I18n.t(lang, "report.cm_unit") : "—";
      const w = factors.weightKg != null ? factors.weightKg + " " + I18n.t(lang, "report.kg_unit") : "—";
      rows.push(["report.height_weight_label", h + " / " + w]);
    }
    if (factors.hormonalUse) rows.push(["tree.personal_hormonal_title", T("report.personal_yes")]);
    if (factors.priorBiopsy) rows.push(["tree.personal_biopsy_title", T("report.personal_yes")]);
    if (factors.breastDensity) rows.push(["tree.personal_density_label", densityLabel(factors.breastDensity, lang)]);

    if (!rows.length) {
      return '<div class="report-row"><span>' + T("report.personal_factors_title") + "</span><span>" + T("report.personal_none") + "</span></div>";
    }
    return rows
      .map(function (r) { return '<div class="report-row"><span>' + I18n.t(lang, r[0]) + "</span><span>" + r[1] + "</span></div>"; })
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
          (score.mutationOverride ? '<div class="report-row"><span></span><span style="color:var(--risk-high);">' + T("report.mutation_override_flag") + "</span></div>" : "") +
          '<div class="report-row"><span>' + T("report.used_side") + "</span><span>" + (score.usedSide === "maternal" ? I18n.t(lang, "common.side_maternal") : I18n.t(lang, "common.side_paternal")) + "</span></div>" +
          '<div class="report-row"><span>' + T("report.pathway") + "</span><span>" + (pathway ? Data.pathwayLabel(pathway, lang) : T("report.pathway_unset")) + "</span></div>" +
          '<div class="report-row"><span>' + T("report.genomic_file") + "</span><span>" + (referral.genomicFileSnapshot ? referral.genomicFileSnapshot.name : T("report.genomic_none")) + "</span></div>" +
        "</div>" +

        '<div style="height:1rem"></div>' +
        '<h3 style="font-size:0.92rem;margin-bottom:0.5rem;">' + T("report.family_history_title") + "</h3>" +
        '<div class="report-sheet">' + relativesRows(referral.relativesSnapshot, lang) + "</div>" +

        '<div style="height:1rem"></div>' +
        '<h3 style="font-size:0.92rem;margin-bottom:0.5rem;">' + T("report.personal_factors_title") + "</h3>" +
        '<div class="report-sheet">' + personalFactorsRows(referral.personalFactorsSnapshot, lang) + "</div>" +
        '<p class="faint" style="margin-top:0.4rem;">' + T("report.personal_factors_note") + "</p>" +

        (referral.regionSnapshot
          ? (function () {
              const lab = Data.nearestGenomeLab(referral.regionSnapshot, lang);
              const labName = lab ? lab.name : "";
              return (
                '<div style="height:1rem"></div>' +
                '<div class="report-sheet">' +
                  '<div class="report-row"><span>' + T("report.region_label") + "</span><span>" + Data.regionLabel(referral.regionSnapshot, lang) + "</span></div>" +
                  '<div class="report-row"><span>' + T("report.nearest_center_label") + "</span><span>" + labName + "</span></div>" +
                "</div>"
              );
            })()
          : "") +

        '<p class="faint" style="margin-top:1rem;">' + T("report.footer") + "</p>" +
        '<p class="faint" style="margin-top:0.4rem;">' + I18n.t(lang, "results.capability_note") + "</p>" +

        '<div class="btn-row end" style="margin-top:1rem;" data-no-print>' +
          '<button class="btn btn-ghost" data-action="close-modal">' + T("report.close") + "</button>" +
          '<button class="btn btn-primary" data-action="print-report">' + Icon("printer") + " " + T("report.print") + "</button>" +
        "</div>" +
      "</div>"
    );
  }

  global.JuthoorReport = { build: build };
})(window);
